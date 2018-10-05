#!/usr/bin/python

import bs4
from bs4 import BeautifulSoup
import requests
import os.path

import sys
reload(sys)
sys.setdefaultencoding('utf8')

STREET_LIST_PAGE = 'http://www.buffalo.oarsystem.com/assessment/main.asp?swis=140200'
STREET_LIST_FILE = './STREET_LIST.html'

#http://www.buffalo.oarsystem.com/assessment/pcllist.asp?swis=140200&sbl=&address1=&address2=DELAVAN%20WEST&owner_name=&page=2
PROPERTY_LIST_PAGE_FORMAT = 'http://www.buffalo.oarsystem.com/assessment/pcllist.asp?swis=140200&address2={}&page={}'
PROPERTY_LIST_FILE = './PROPERTY_LIST/{}.{}.html'

#
PROPERTY_DATA_PAGE_FORMAT = 'http://www.buffalo.oarsystem.com/assessment/{}'
PROPERTY_DATA_STREET_DIR = './PROPERTY_DATA/{}'
PROPERTY_DATA_FILE = PROPERTY_DATA_STREET_DIR + '/{}.html'

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


def debug(str):
    print str


def output(obj):
    pass #print obj

class Breadcrumb:
    def __init__(self, street=None, page=None, property=None):
        self.street = street
        self.page = page
        self.property = property

    def is_before(self, other):
        return True

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

    def fetch(self):
        cf = cache_file_page(self)
        if not os.path.isfile(cf):
            url = PROPERTY_LIST_PAGE_FORMAT.format(self.street.name, self.number)
            debug('requesting page ' + url)
            html = requests.get(url).text
            out = open(cf, 'w')
            out.write(html)
            out.close()

        return open(cf).read()

    def properties(self):
        if not hasattr(self, 'props'):
            self.props = []
            html = self.fetch()
            soup = BeautifulSoup(html, "html.parser")
            for row in soup.find('table',{'class':'grid'}).findAll('tr')[1:]:
                prop = Property(self.street)
                tds = row.findAll('td')
                prop.address = tds[1].get_text().strip()
                if tds[0].find('img'):
                    prop.photo = tds[0].find('img').attrs['src']
                prop.sbl = tds[2].get_text().strip()
                prop.lot_size = tds[3].get_text().strip()
                prop.type = tds[4].get_text().strip()
                prop.style = tds[5].get_text().strip()
                prop.year_built = tds[6].get_text().strip()
                prop.sqft = tds[7].get_text().strip()
                prop.url = tds[1].find('span').attrs['onclick'][len('showLoading();window.location.href="'):0-len('"')]
                self.props.append(prop)
        return self.props

    def has_next(self):
        html = self.fetch()
        soup = BeautifulSoup(html, "html.parser")
        next_elt = len(soup.findAll('table')[0].findAll('td')[3].findAll('a')) > 0
        return next_elt

    def get_next(self):
        return Page(self.street, self.number + 1) if self.has_next() else None

class Property:
    def __init__(self, street=''):
        self.street = street

    def fetch(self):
        cf = cache_file(self)
        if not os.path.isfile(cf):
            url = PROPERTY_DATA_PAGE_FORMAT.format(self.url)
            debug('fetching property {}'.format(self.address))
            html = requests.get(url).text
            out = open(cf, 'w')
            out.write(html)
            out.close()

        return open(cf).read()

    def __repr__(self):
        return '{}'.format(self.__dict__)

    def extended(self):
        if not hasattr(self, 'is_extended'):
            self.is_extended = True
            html = self.fetch()
            soup = BeautifulSoup(html, "html.parser")
            if self.type == 'Residential':
                self.use = soup.findAll('table')[8].findAll('td')[4].get_text().strip()

        return self


def get_street_list(use_local=True):
    if use_local and os.path.isfile(STREET_LIST_FILE):
        debug('opening local street list file')
    else:
        debug('fetching street list')
        r  = requests.get(STREET_LIST_PAGE)
        file = open(STREET_LIST_FILE, 'w')
        file.write(r.text)
        file.close()

    data = open(STREET_LIST_FILE).read()

    debug('parsing street list')
    soup = BeautifulSoup(data, "html.parser")

    streets = []
    for option in soup.find('select').findAll('option'):
        if len(option.get_text().strip()) > 0:
            streets.append(Street(option.get('value').strip()))

    return streets#[326:328]

last = Breadcrumb()

property_count = 0
for i,street in enumerate(get_street_list()):
    debug('starting work on street #{}: {}'.format((i+1), street.name))
    if last.is_before(Breadcrumb(street)):
        street_property_count = 0
        page = street.page
        while page is not None:
            debug('    starting work on page {} of {} (cumulative count: {})' .format(page.number, street.name, (property_count + street_property_count)))
            street_property_count += len(page.properties())
            for property in page.properties():
                output(property.extended())
            if page.has_next():
                page = page.get_next()
            else:
                page = None
        property_count += street_property_count
        debug('  loaded {} properties on {} (cumulative {})'.format(street_property_count, street.name, property_count))

# for streets in http://www.buffalo.oarsystem.com/assessment/main.asp?swis=140200&dbg=&opt=&swis=&sbl=&parcel9=&debug=&amp;wmode=transparent
## for page in curl 'http://www.buffalo.oarsystem.com/assessment/pcllist.asp?swis=140200' --data 'debug=bdebug&streetlookup=yes&address2=GREENWOOD' --compressed
### for property in page http://www.buffalo.oarsystem.com/assessment/r1parc.asp?swis=140200&sbl=0888300005037000
#### scrape alllllll the data
