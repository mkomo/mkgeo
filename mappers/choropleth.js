function(d, f, colorScale, minmax, scaleType="linear", debug) {
  /**
  f: function that maps input d to float value
  colorScale: d3 scale to use (e.g. interpolateRdYlGn)
  minmax: [min,...,max] values to anchor at 0 and 1, and equally spaced points between (everything below min or above max will also map to 0 or 1, resp)
  scaleType: x will map to range in between the two closest values in minmax either linearly, log, or exp)
  */
  if (typeof f === 'object') {
    colorScale = f.colorScale;
    minmax = f.minmax;
    scaleType = f.scaleType;
    debug = f.debug;
    f = f.f;
  }

  let val = f(d);
  let i = 0;
  let n = minmax.length
  while (i < n && minmax[i] < val) {
    i++;
  }

  let t;
  if (i == 0) {
    t = 0;
  } else if (i == n) {
    t = 1;
  } else {
    t = (i*1.0)/n + (1.0/n) * (val - minmax[i - 1])/(minmax[i] - minmax[i - 1]);
  }

  if (debug) {
    d.t = t;
    d.i = i
    d.color = colorScale(t);
    d.val = val;
    Object.keys(d).forEach(function(key) { if (['i', 't', 'val', 'color'].indexOf(key) < 0) delete d[key]; });
  }

  d.properties.fill = colorScale(t);
}
