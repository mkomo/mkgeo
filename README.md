# mkgeo
tools for mapping, including scraping and mapping oars data.

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

Generate a hoverable web page from an `mkgeo-render` output prefix. It uses the
SVG for rendering and embeds only property ID, address, and generic `fill_trace`
metadata for efficient lookups:

```sh
bin/mkgeo-viewer output/buffalo-properties/single-family-assessment-new-test
python3 -m http.server --directory output/buffalo-properties
```

Open `http://localhost:8000/single-family-assessment-new-test.html`. Re-run
`mkgeo-render` after this update so its mapper records the `fill_trace` needed
by the viewer. Use the mouse wheel or a trackpad to smoothly zoom
at the cursor; double-click returns to the full map.

After generating the matrix, print the adjacent blocks for a GEOID:

```sh
bin/census-block-neighbors 360290067014000
```
