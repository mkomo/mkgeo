function(d, f, debug) {
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
  let val;
  try {
    val = "" + f(d);
  } catch(error) {
    throw "issue with: " + JSON.stringify(d, null, "  ") + "; " + error;
  }
  let color = '#' + val.padStart(6, '0');
  if (debug) {
    d.val = val;
    d.color = color;
    Object.keys(d).forEach(function(key) { if (['i', 't', 'val', 'color'].indexOf(key) < 0) delete d[key]; });
  } else {
    d.properties.fill = color;
  }

}
