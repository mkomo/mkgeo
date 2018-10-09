#!/usr/bin/python

from __future__ import print_function

import bs4
from bs4 import BeautifulSoup
import requests
import os.path
import time
import json
import urllib

import sys
reload(sys)
sys.setdefaultencoding('utf8')

STREET_LIST_PAGE = 'http://www.buffalo.oarsystem.com/assessment/main.asp?swis=140200'
STREET_LIST_FILE = './STREET_LIST.html'

PROPERTY_LIST_PAGE_FORMAT = 'http://www.buffalo.oarsystem.com/assessment/pcllist.asp?swis=140200&address2={}&page={}'
PROPERTY_LIST_FILE = './PROPERTY_LIST/{}.{}.html'

PROPERTY_DATA_PAGE_FORMAT = 'http://www.buffalo.oarsystem.com/assessment/{}'
PROPERTY_DATA_STREET_DIR = './PROPERTY_DATA/{}'
PROPERTY_DATA_FILE = PROPERTY_DATA_STREET_DIR + '/{}.html'

ONLINE = False
DEBUG = True
SKIP_ERRORS = False

def debug(*args, **kwargs):
    if DEBUG:
        error(*args, **kwargs)

def error(*args, **kwargs):
    print(time.strftime('%Y-%m-%d %X'), *args, file=sys.stderr, **kwargs)

def fetch(url, local_path, name=None):
    if not os.path.isfile(local_path):
        debug('fetching url {}'.format(name if name else url), end=";\t")

        millis = int(round(time.time() * 1000))
        if ONLINE:
            html = requests.get(url).text
            out = open(local_path, 'w')
            out.write(html)
            out.close()
            debug(int(round(time.time() * 1000)) - millis)
        else:
            raise Exception('do not make requests')

    return open(local_path).read()


def street_dir(street):
    return street.name.replace(' ', '_')
def property_file(sbl):
    return sbl.replace('/','_')

def cache_file(property):
    sd = PROPERTY_DATA_STREET_DIR.format(street_dir(property.street))
    if not os.path.isdir(sd):
        os.mkdir(sd)
    return PROPERTY_DATA_FILE.format(street_dir(property.street), property_file(property.sbl))

def cache_file_page(page):
    return PROPERTY_LIST_FILE.format(street_dir(page.street), page.number)

def adhoc_out(property):
    property.extended()
    use = 'no use' if not hasattr(property, 'use') else property.use
    print('{}\t{}'.format(use,''))#property.address))

def extend(property):
    if not property.check():
        property.extended()

def check(property):
    property.check()

def ndjson(property):
    property.extended()

    print(json.dumps({k:v for (k,v) in property.__dict__.items() if k != 'street'}))


class Breadcrumb:
    def __init__(self, street=None, page=None, property=None):
        self.street = street
        self.page = page
        self.property = property

class Street:
    def __init__(self, name=None):
        self.name = name
        self.page = Page(self, 1)

    def __repr__(self):
        return self.name

class Page:
    def __init__(self, street=None, number=None):
        self.street = street
        self.number = number

    def properties(self):
        if not hasattr(self, 'props'):
            prop_page = PROPERTY_LIST_PAGE_FORMAT.format(urllib.quote_plus(self.street.name), self.number)
            self.props = []
            html = fetch(prop_page, cache_file_page(self), '{}.{}'.format(self.street.name, self.number))

            soup = BeautifulSoup(html, "html.parser")
            for row in soup.find('table',{'class':'grid'}).findAll('tr')[1:]:
                prop = Property(self.street)
                tds = row.findAll('td')
                url = tds[1].find('span').attrs['onclick'][len('showLoading();window.location.href="'):0-len('"')]

                prop.address = tds[1].get_text().strip()
                prop.sbl = tds[2].get_text().strip()
                prop.id = url[(url.rfind('=')+1):]
                prop.lot_size = tds[3].get_text().strip()
                prop.type = tds[4].get_text().strip()
                prop.style = tds[5].get_text().strip()
                prop.year_built = tds[6].get_text().strip()
                prop.sqft = tds[7].get_text().strip()
                prop.url = url
                if tds[0].find('img'):
                    prop.photo = tds[0].find('img').attrs['src']

                self.props.append(prop)
        return self.props

    def has_next(self):
        html = fetch(PROPERTY_LIST_PAGE_FORMAT.format(self.street.name, self.number), cache_file_page(self))
        soup = BeautifulSoup(html, "html.parser")
        next_elt = len(soup.findAll('table')[0].findAll('td')[3].findAll('a')) > 0
        return next_elt

    def get_next(self):
        return Page(self.street, self.number + 1) if self.has_next() else None

class Property:
    def __init__(self, street=''):
        self.street = street

    def __repr__(self):
        return '{}'.format(self.__dict__)

    def extended(self):
        if not hasattr(self, 'is_extended'):
            self.is_extended = True
            html = fetch(PROPERTY_DATA_PAGE_FORMAT.format(self.url), cache_file(self), self.address)
            soup = BeautifulSoup(html, "html.parser")
            self.use = soup.find(text='Property Description').parent.parent.parent.findAll('tr')[2].findAll('td')[1].get_text().strip()
        return self

    def check(self):
        return os.path.isfile(cache_file(self))

def get_street_list():
    data  = fetch(STREET_LIST_PAGE, STREET_LIST_FILE)

    debug('parsing street list')
    soup = BeautifulSoup(data, "html.parser")

    streets = []
    for option in soup.find('select').findAll('option'):
        if len(option.get_text().strip()) > 0:
            streets.append(Street(option.get('value').strip()))

    return streets#[326:328]

def crawl(func, iterator=1, offset=0):
    property_count = 0
    for i,street in enumerate(get_street_list()[offset::iterator]):
        if func == STREET_CRAWL:
            print(i+offset,street)
        else:
            debug('starting work on street #{}: {}'.format((i+offset), street.name))
            street_property_count = 0
            page = street.page
            while page is not None:
                debug('    starting work on page {} of {} (cumulative {})' .format(page.number, street.name, (property_count + street_property_count)))
                street_property_count += len(page.properties())
                for property in page.properties():
                    try:
                        func.__call__(property)
                    except Exception as e:
                        error('exception processing property {} on page {} of {} ({})'.format(property.address, page.number, street.name, i+offset))
                        import traceback
                        traceback.print_exc()
                        if SKIP_ERRORS:
                            error('continuing')
                            pass
                        else:
                            raise e
                if page.has_next():
                    page = page.get_next()
                else:
                    page = None
            property_count += street_property_count
            debug('    loaded {} properties on {} (cumulative {})'.format(street_property_count, street.name, property_count))

STREET_CRAWL = 'STREET_CRAWL'

if __name__ == "__main__":
    if len(sys.argv) <= 1:
        raise Exception("USAGE: {} <fetch|ndjson|ls-streets>")
    action = sys.argv[1]
    offset = 0 if len(sys.argv) <= 2 else int(sys.argv[2])
    if action == 'fetch':
        ONLINE = True
        crawl(extend, 1, offset)
    elif action == 'ndjson':
        DEBUG = False
        SKIP_ERRORS = True
        crawl(ndjson, 1, offset)
    elif action == 'ls-streets':
        DEBUG = False
        crawl(STREET_CRAWL, 1, offset)
    else:
        crawl(adhoc_out, 1, offset)
