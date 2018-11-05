function(d, f, debug) {

  //https://gis.stackexchange.com/questions/53918/determining-which-us-zipcodes-map-to-more-than-one-state-or-more-than-one-city

let exceptions = `02861  Massachusetts
02861   Rhode Island
42223       Kentucky
42223      Tennessee
59221        Montana
59221   North Dakota
63673       Illinois
63673       Missouri
71749       Arkansas
71749      Louisiana
73949       Oklahoma
73949          Texas
81137       Colorado
81137     New Mexico
84536        Arizona
84536           Utah
86044        Arizona
86044           Utah
86515        Arizona
86515     New Mexico
88063     New Mexico
88063          Texas
89439     California
89439         Nevada
97635     California
97635         Oregon`.split('\n').map(line=>line.split(' ')[0]).filter((v, i, a) => a.indexOf(v) === i);

  /**
  f: function that maps input d to float value
  colorScale: d3 scale to use (e.g. interpolateRdYlGn)
  minmax: [min,...,max] values to anchor at 0 and 1, and equally spaced points between (everything below min or above max will also map to 0 or 1, resp)
  scaleType: x will map to range in between the two closest values in minmax either linearly, log, or exp)
  */
  if (typeof f === 'object') {
    debug = f.debug;
    f = f.f;
  }

  /**
  numBits a number between 1 and 8 inclusive representing how many bits of each color to use
  startBit a number between 0 and (8 - numBits) inclusive representing where to start
  numeric the value between 0 inclusive and 2^(3*numBits) exclusive
  xor numeric for xor with result
   */
  function c(numBits, startBit, numeric, xor) {
    let r = (((numeric & (((1<<(numBits)) - 1) << (2*numBits))) >>> (2*numBits)) * (1 << (8 - numBits))) >> startBit;
    let g = (((numeric & (((1<<(numBits)) - 1) << (1*numBits))) >>> (1*numBits)) * (1 << (8 - numBits))) >> startBit;
    let b = (((numeric & (((1<<(numBits)) - 1) << (0*numBits)))) * (1 << (8 - numBits))) >> startBit;
    return [r,g,b];
  }

  let movers = {
    13 : 63
  }

  function stateColor(statefp) {
    let s = "" + statefp;
    if (s in movers) {
      statefp = movers[s];
    }
    return c(2,0,statefp);
  }

  function zipColor(zip, statefp) {
    let sc = stateColor(statefp);
    let zc = c(6,2,zip);
    return [(sc[0]|zc[0]),(sc[1]|zc[1]),(sc[2]|zc[2])];
  }

  function colorString(triple) {
    let r=triple[0], g=triple[1], b=triple[2];
    return `rgb(${r}, ${g}, ${b})`;
  }
  //let d.properties.fill = "#aaa";
  if (d.properties.AFFGEOID10) {
    d.properties.fill = colorString(zipColor(d.properties.ZCTA5CE10, d.properties.STATEFP));
  } else if (d.properties.STATEFP) {
    d.properties.fill = colorString(stateColor(d.properties.STATEFP));
  }

  if (debug) {
    Object.keys(d.properties).forEach(function(key) { if (['ZCTA5CE10', 'STATEFP', 'fill'].indexOf(key) < 0) delete d.properties[key]; });
    delete d.type;
    delete d.geometry;
  }

}
