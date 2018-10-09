#!/bin/bash

if [ -z "$1" ]; then
  echo "USAGE: $0 <infile.geojson>"
  exit 1
fi

a=ro #prefix for RenderOars

INFILE=$1
OARS_FILE='./oars_data.ndjson'
NDFILE=_$a.$(echo $INFILE | sed "s/.geojson$/.ndjson/")
IDFILE=_$a.$(echo $INFILE | sed "s/.geojson$/.id.ndjson/")
JOINFILE=_$a.$(echo $INFILE | sed "s/.geojson$/.join.oars.ndjson/")
JOINFILE_WITH_SUBPROPS=_$a.$(echo $INFILE | sed "s/.geojson$/.subprops.ndjson/")
JOINFILE_WITH_COLORS=_$a.$(echo $INFILE | sed "s/.geojson$/.colors.ndjson/")
SIZE=8000

set -exv

# TODO do this conditional on optargs
#./scrape/oars.py ndjson 2>/dev/null > $OARS_FILE

# TODO do this conditional on optargs
# TODO check `npm install -g ndjson-cli`
#ndjson-split 'd.features' < $INFILE > $NDFILE
#ndjson-map 'd.id = d.properties.sbl, d' < $NDFILE > $IDFILE

#ndjson-join --right 'd.id' $OARS_FILE $IDFILE > $JOINFILE

#ndjson-map 'd[1].properties.oars_props = d[0], d[1]' < $JOINFILE > $JOINFILE_WITH_SUBPROPS


JS_COLOR_FUNCT="$(cat ./color.js)"

# DEBUG line
# ndjson-map -r d3 "$JS_COLOR_FUNCT(d), d.properties.fill" < $JOINFILE_WITH_SUBPROPS
# ACTUAL line
#| ndjson-filter "!d.properties.oars_props || !d.properties.oars_props.use || ['210 - 1 Family Res', '220 - 2 Family Res', '311 - Res vac land'].indexOf(d.properties.oars_props.use) < 0" \
cat $JOINFILE_WITH_SUBPROPS | ndjson-map -r d3 "$JS_COLOR_FUNCT(d), d" > $JOINFILE_WITH_COLORS

geo2svg -n --stroke none -p 1 -w $SIZE -h $SIZE < $JOINFILE_WITH_COLORS > ./colors.svg
convert -monitor colors.svg colors.png
