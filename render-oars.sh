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
ndjson-split 'd.features' < $INFILE > $NDFILE
ndjson-map 'd.id = d.properties.sbl, d' < $NDFILE > $IDFILE

ndjson-join --right 'd.id' $OARS_FILE $IDFILE > $JOINFILE

ndjson-map 'd[1].properties.oars_props = d[0], d[1]' < $JOINFILE > $JOINFILE_WITH_SUBPROPS

#JS_COLOR_ARRAY="d3.schemeCategory10"
JS_COLOR_ARRAY='["#3182bd",
"#6baed6",
"#9ecae1",
"#c6dbef",
"#e6550d",
"#fd8d3c",
"#fdae6b",
"#fdd0a2",
"#31a354",
"#74c476",
"#a1d99b",
"#c7e9c0",
"#756bb1",
"#9e9ac8",
"#bcbddc",
"#dadaeb",
"#636363",
"#969696",
"#bdbdbd",
"#f5f5f5"]' #https://vega.github.io/vega/docs/schemes/#tableau20, lightly edited

JS_OPTION_ARRAY='[
"210 - 1 Family Res",
"",
"#9ecae1",
"220 - 2 Family Res",
"#e6550d",
"#fd8d3c",
"#fdae6b",
"#fdd0a2",
"590 - Park",
"#74c476",
"#a1d99b",
"311 - Res vac land",
"#756bb1",
"#9e9ac8",
"USE is present, but not color specified",
"#dadaeb",
"#636363",
"#969696",
"#bdbdbd",
null
]' #

REFERENCE='
"620 - Religious"
"433 - Auto body"
"710 - Manufacture"
"340 - Vacant indus"
"449 - Other Storage"
"312 - Vac w/imprv"
"331 - Com vac w/imp"
"230 - 3 Family Res"
"411 - Apartment"
"330 - Vacant comm"
"482 - Det row bldg"
"311 - Res vac land"
'

JS_COLOR_CHOICE="(d.properties.oars_props && d.properties.oars_props.use)
    ? ($JS_OPTION_ARRAY.indexOf(d.properties.oars_props.use) >= 0
        ? $JS_OPTION_ARRAY.indexOf(d.properties.oars_props.use)
        : 14)
    : 19"

JS_COLOR_SNIPPET="(d.properties.fill =
    $JS_COLOR_ARRAY[$JS_COLOR_CHOICE],
    d)
"
JS_DEBUG_SNIPPET="(d.properties.fill =
    $JS_COLOR_CHOICE,
    d.properties.fill)
"
#ndjson-map -r d3 "$JS_DEBUG_SNIPPET" < $JOINFILE_WITH_SUBPROPS
ndjson-map -r d3 "$JS_COLOR_SNIPPET" < $JOINFILE_WITH_SUBPROPS > $JOINFILE_WITH_COLORS

geo2svg -n --stroke none -p 1 -w $SIZE -h $SIZE < $JOINFILE_WITH_COLORS > ./colors.svg
convert -monitor colors.svg colors.png
