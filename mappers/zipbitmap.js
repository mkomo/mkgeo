zipbitmap = function(d, lib, debug) {
  //expect a
  //find zips with more than one state
  //cat data/census/zcta_county_rel_10.txt | cut -d ',' -f 1,2 | sort -u | cut -d ',' -f 1 | dtk uc | grep -v '^1' | cut -f 2 | tr '\n' ','
  const MULTI_STATE_ZCTAS = [57717,65733,79837,84536,56744,59275,99362,81324,20135,89421,88220,21912,56144,
    57724,57660,42223,69212,86044,59270,66541,57026,51360,02861,57641,82701,57645,82063,89439,65729,
    84034,38769,31905,58439,86514,58649,56027,82801,69216,89019,84531,51001,42602,72644,88063,54540,
    87328,83342,86515,52573,97910,51557,58623,82082,86504,57648,68325,52542,81137,51640,88430,45053,
    67950,75556,89832,97635,56219,89061,24604,82930,51023,59221,68719,83120,57638,80758,58653,57642,
    57078,30165,68978,99128,03579,38326,57068,38079,89060,52626,83312,65761,72338,59847,58225,54554,
    73949,63673,38852,83111,56164,69201,89010,97913,57030,71749];

  const MAX_ZIP = 99999;

  const STATE_FOUR_COLOR = {
      HI:"#dddd00", AK:"#44ee33", FL:"#dddd00", SC:"#ee5464", GA:"#44ee33", AL:"#ee5464", NC:"#dddd00",
      TN:"#9930dc", RI:"#ee5464", CT:"#44ee33", MA:"#dddd00", ME:"#ee5464", NH:"#44ee33", VT:"#9930dc",
      NY:"#ee5464", NJ:"#dddd00", PA:"#44ee33", DE:"#ee5464", MD:"#dddd00", WV:"#9930dc", VA:"#ee5464",
      KY:"#44ee33", OH:"#ee5464", MI:"#44ee33", WY:"#ee5464", MT:"#44ee33", ID:"#9930dc", WA:"#ee5464",
      TX:"#44ee33", CA:"#44ee33", AZ:"#9930dc", NV:"#ee5464", UT:"#44ee33", CO:"#dddd00", NM:"#ee5464",
      OR:"#dddd00", ND:"#9930dc", SD:"#dddd00", NE:"#44ee33", IA:"#9930dc", MS:"#44ee33", IN:"#dddd00",
      IL:"#ee5464", MN:"#ee5464", WI:"#dddd00", MO:"#dddd00", AR:"#ee5464", OK:"#9930dc", KS:"#ee5464",
      LA:"#dddd00"
  }

  //states that have colors too similar to a neighbor
  let STATES_TO_MOVE = {
    13 : 63,
    09 : 57
  }
  // 30 = 11110, 26 = 11010

  //TODO get this from STUSPS in the
  const STATE_NAMES = {
    "01":"AL",
    "02":"AK",
    "04":"AZ",
    "05":"AR",
    "06":"CA",
    "08":"CO",
    "09":"CT",
    "10":"DE",
    "11":"DC",
    "12":"FL",
    "13":"GA",
    "15":"HI",
    "16":"ID",
    "17":"IL",
    "18":"IN",
    "19":"IA",
    "20":"KS",
    "21":"KY",
    "22":"LA",
    "23":"ME",
    "24":"MD",
    "25":"MA",
    "26":"MI",
    "27":"MN",
    "28":"MS",
    "29":"MO",
    "30":"MT",
    "31":"NE",
    "32":"NV",
    "33":"NH",
    "34":"NJ",
    "35":"NM",
    "36":"NY",
    "37":"NC",
    "38":"ND",
    "39":"OH",
    "40":"OK",
    "41":"OR",
    "42":"PA",
    "44":"RI",
    "45":"SC",
    "46":"SD",
    "47":"TN",
    "48":"TX",
    "49":"UT",
    "50":"VT",
    "51":"VA",
    "53":"WA",
    "54":"WV",
    "55":"WI",
    "56":"WY",
    "60":"AS",
    "66":"GU",
    "69":"MP",
    "72":"PR",
    "78":"VI",
  };

  if (typeof lib === 'object') {
    debug = lib.debug;
    lib = lib.lib;
  }

  /**
  numBits a number between 1 and 8 inclusive representing how many bits of each color to use
  startBit a number between 0 and (8 - numBits) inclusive representing where to start
  numeric the value between 0 inclusive and 2^(3*numBits) exclusive
   */
  function colorTuple(numBits, startBit, numeric) {
    let r = (((numeric & (((1<<(numBits)) - 1) << (2*numBits))) >>> (2*numBits)) * (1 << (8 - numBits))) >> startBit;
    let g = (((numeric & (((1<<(numBits)) - 1) << (1*numBits))) >>> (1*numBits)) * (1 << (8 - numBits))) >> startBit;
    let b = (((numeric & (((1<<(numBits)) - 1) << (0*numBits)))) * (1 << (8 - numBits))) >> startBit;
    return [r,g,b];
  }

  function colorString(triple) {
    let r=triple[0], g=triple[1], b=triple[2];
    return `rgb(${r}, ${g}, ${b})`;
  }

  function stateColor(statefp) {
    let stateKey = "" + statefp;
    if (stateKey in STATES_TO_MOVE) {
      statefp = STATES_TO_MOVE[stateKey];
    }
    return colorTuple(2,0,statefp);
  }

  function stateFourColor(statefp) {
    let stateName = getStateName(statefp);
    return STATE_FOUR_COLOR[stateName];
  }

  function isMultiState(c){
    var r = c[0], g = c[1], b = c[2];
    //192 = 11 00 00 00 (top 2 bits);
    return (r & 2) == 2;
  }

  function getStateFromColor(c){
    var r = c[0], g = c[1], b = c[2];
    //192 = 11 00 00 00 (top 2 bits);
    let state;

    if (isMultiState(c)) {
      state = (((r & 240)/3)  ) | (((g & 240)/3) >> 2) | (((b & 240)/3) >> 4);
    } else {
      state = ((r & 192) >> 2) | ((g & 192) >> 4) | ((b & 192) >> 6);
    }

    let stateName = getStateName(state);
    return stateName + ` (${state})`;
  }

  function getStateName(state) {
    let ind = Object.values(STATES_TO_MOVE).indexOf(state)
    if (ind >= 0) {
      state = Object.keys(STATES_TO_MOVE)[ind];
    }
    state = ("00".substring(("" + state).length)) + state;
    return STATE_NAMES[state];
  }

  function zipColorMultiState(zip, multiInd, statefp) {
    // let sc = stateColor(statefp);
    let zc = colorTuple(3,2,0)//multiInd);

    return [(zc[0]|8),(zc[1]),(zc[2])];
    //zip is 17 bits
    // let top6 = Math.floor(zip/(1<<12))

    // let b0=top6%3
    // let b1=((top6-b0)/3)%3
    // let b2=Math.floor(top6/9)

    // return zc; //[(sc[0]|zc[0]),(sc[1]|zc[1]),(sc[2]|zc[2])];
  }

  function zipColor(zip, statefp) {
    let sc = stateColor(statefp);
    let zc = c(6,2,zip);
    return [(sc[0]|zc[0]),(sc[1]|zc[1]),(sc[2]|zc[2])];
  }



  function zipColorHighBit(zip, statefp) {
    return colorTuple(6,0,zip)
  }

  function getZipFromColor(c){
    var r = c[0], g = c[1], b = c[2];
    //63 = 00 11 11 11 (bottom 6 bits)
    var zip = ((r & 63) << 12) | ((g & 63) << 6) | (b & 63);

    if (zip == 0) {
      return null;
    } else if (isMultiState(c)) {
      return 'MULTI_STATE_ZCTA';
    } else {
      return '00000'.substring((zip + '').length) + zip;
    }
  }

  function explainGeoColor(c) {
    var r = c[0], g = c[1], b = c[2];
    var zipr = (r & 63), zipg= (g & 63), zipb = (b & 63);
    var stater = (r & 192) >> 6, stateg=((g & 192) >> 6), stateb=((b & 192) >> 6);
    return `state: r=${fmt(stater,2)};g=${fmt(stateg,2)};b=${fmt(stateb,2)}\n`
        +  `  zip: r=  ${fmt(zipr,6,6)};g=  ${fmt(zipg,6,6)};b=  ${fmt(zipb,6,6)}`;
  }

  function fmt(int, padStart = 8, padEnd) {
    return int.toString(2).replace(/0/g,'.').padStart(padStart,'.') + ''.padStart((padEnd || 8)-padStart);
  }

  if (lib) {
    return {
      getZipFromColor,
      getStateFromColor,
      explainGeoColor
    }
  }

  if (d.properties.ZCTA5CE10) {
    let zip = parseInt(d.properties.ZCTA5CE10);
    let multiInd = MULTI_STATE_ZCTAS.indexOf(zip);
    if (multiInd >= 0) {
      d.properties.MULTI_STATE_INDEX = multiInd;
      d.properties.fillOpacity = 1-Math.sqrt(3/4);
      d.properties.fill = colorString(zipColorMultiState(zip, multiInd, d.properties.STATEFP));
      // d.properties.fill = colorString(stateColor(d.properties.STATEFP));
    } else {
      // d.properties.fill = colorString(zipColor(zip, d.properties.STATEFP));
    }
  } else if (d.properties.STATEFP) {
    d.properties.fill = colorString(stateColor(d.properties.STATEFP));
  }

  if (debug) {
    Object.keys(d.properties).forEach(function(key) { if (['ZCTA5CE10', 'STATEFP', 'fill', 'fillOpacity', 'MULTI_STATE_INDEX'].indexOf(key) < 0) delete d.properties[key]; });
    delete d.type;
    delete d.geometry;
  }

}
