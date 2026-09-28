# mkgeo
tools for mapping, including scraping and mapping oars data.

`bin/projection` writes a `.transform.json` sidecar when using its default
`geoMercator` projection. It records the numeric longitude/latitude-to-screen
coordinate transform used for the generated `.projection.geojson`.

Pass that sidecar to `mkgeo-render` when its input geometries use the matching
screen-coordinate projection. The generated `.viewer.json` then includes the
transform, allowing `viewer/index.html` to place the SVG on its OpenStreetMap
base layer:

```sh
mkgeo-render data/buffalo/2026_zoning_with_2026_taxes.ndjson \
  -M mappers/mkgeosearch.js \
  --transform data/buffalo/geo/Zoning_20260928.transform.json \
  -o output/buffalo-properties/mksearch-elmwood
```

# plan for census data
get state adjacencies
get zip adjacencies
add state to zip data
add county to zip data
color states with top-2 bits
color zips with next

## Buffalo Census block adjacency

`bin/generate-census-block-adjacency` reads a Census Blocks CSV, prints summary
statistics, and creates a sparse Matrix Market adjacency matrix, its index, and
a JSON statistics report in `data/buffalo/`.

```sh
bin/generate-census-block-adjacency data/buffalo/Census_Blocks_2020_20260808.csv
```

Two blocks are adjacent when they share a boundary segment; blocks meeting only
at a corner are not adjacent. Pass a CSV path and `--output-dir DIR` to use
another output location.

To include property street names for every block, provide an assessment roll.
The roll must contain `Street` and `GEOID20_block` columns:

```sh
bin/generate-census-block-adjacency \
  data/buffalo/Census_Blocks_2020_20260808.csv \
  --assessment-file data/buffalo/2025_Final_Assessment_Roll__Current__20250710.csv
```

The neighbor lookup then includes a `streets` column for each returned block.

## Four-color block map

Render a standalone SVG that gives adjacent blocks different colors:

```sh
bin/render-census-block-map \
  data/buffalo/Census_Blocks_2020_20260808.csv \
  data/buffalo/census_blocks_2020_adjacency.mtx
```

The map is written to `output/census_blocks_2020_four_color.svg`. It reads the
matching index CSV from beside the matrix and verifies the four-coloring before
writing any SVG.

Use graph distance from a particular GEOID20 instead of four-coloring:

```sh
bin/render-census-block-map \
  data/buffalo/Census_Blocks_2020_20260808.csv \
  data/buffalo/census_blocks_2020_adjacency.mtx \
  --coloring=distancefrom:360290067014000,upto:8
```

Without `upto:<max>`, the purple-to-yellow scale spans the source block (zero)
through the furthest graph distance. With it, blocks farther than the maximum
are gray.

## Interactive mkgeo-render viewer

Generate viewer data from an `mkgeo-render` output prefix. It contains the SVG
filename and only property ID plus generic `fill_trace` metadata for efficient
lookups. Mapper `fill_trace` objects provide the hover title and value.

```sh
bin/mkgeo-viewer output/buffalo-properties/single-family-assessment-new-test
python3 -m http.server
```

This creates `single-family-assessment-new-test.viewer.json`. Open the reusable
viewer, passing the output-relative render prefix:

```text
http://localhost:8000/viewer?data=buffalo-properties/single-family-assessment-new-test
```

Re-run `mkgeo-render` after this update so its mapper records the `fill_trace`
needed by the viewer. The page uses the standard `svg-pan-zoom` library for
mouse-wheel or trackpad zooming and drag panning. `mkgeo-viewer` maintains
`output/viewer-maps.json`, which populates the page's map dropdown with every
generated viewer-data map under `output/`. The viewer also saves its zoom and
pan coordinates in the URL, so refreshing or sharing the link restores the
same view.

After generating the matrix, print the adjacent blocks for a GEOID:

```sh
bin/census-block-neighbors 360290067014000
```
