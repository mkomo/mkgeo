function(d, f, colorScale, minmax, scaleType="linear", debug) {
  /**
  f: function that maps input d to float value
  colorScale: d3 scale to use (e.g. interpolateRdYlGn)
  minmax: [min,...,max] values to anchor at 0 and 1, and equally spaced points between
    (everything below min or above max will also map to 0 or 1, resp)
  scaleType: TODO x will map to range in between the two closest values in minmax either linearly, log, or exp)
  */
  if (typeof f === 'object') {
    // valid color scales can be found here: https://github.com/d3/d3-scale-chromatic
    colorScale = f.colorScale;
    minmax = f.minmax;
    scaleType = f.scaleType;
    debug = f.debug;
    f = f.f;
  }

  const EPSILON = 1e-10;

  /**
   * return the largest index such that:
   *
   * 1. val >= a[index]
   * 2. index >= min
   * 3. index <= max
   *
   *
   * @param {*} val
   * @param {*} a
   * @param {*} min
   * @param {*} max
   */
  let getMaxBelow = (val, a, min = 0, max = a.length - 1) => {
    if (val + EPSILON < a[min]) {
      return 0;
    } else if (max == min || a[max] - a[min] < EPSILON) {
      return max;
    } else if (max == min + 1) {
      return Math.max(getMaxBelow(val, a, min, min), getMaxBelow(val, a, max, max));
    } else {
      let midpoint = Math.floor((min+max)/2);
      return Math.max(getMaxBelow(val, a, min, midpoint), getMaxBelow(val, a, midpoint, max));
    }
  }

  let val = f(d);
  let i = getMaxBelow(val, minmax);
  let n = minmax.length;

  let t;
  if (i == 0) {
    t = 0;
  } else if (i == n) {
    t = 1;
  } else {
    t = (i - 1)/(n - 1) + (1/(n - 1)) * (val - minmax[i])/(minmax[i + 1] - minmax[i]);
  }

  if (debug) {
    let debugObj = {state: d.properties.FULL_NAME, i, t, n, val, color: colorScale(t), minmax: [minmax[i],minmax[i+1]]};
    Object.keys(d).forEach(key => (delete d[key]));
    Object.assign(d, debugObj);
  } else {
    d.properties.fill = colorScale(t);
  }

}
