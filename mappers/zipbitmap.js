zipbitmap = function(d, lib, debug) {

/*
case studies:
wa/id border:
99128: [53,16],
actual multiInd: 80   (1010000)
apparent multiInd: 48 ( 110000)

wa/or border:
99362: [53,41]
actual multiInd: 6   (110)
apparent multiInd: 5 (101)

id/mt border:
59847: [30,16],
actual multiInd: 90   (1011010)
apparent multiInd: 74 (1001010)

ms/tn border:
38326: [47,28],
actual multiInd: 82   (1010010)
apparent multiInd: 79 (1001111)

la/ar border:
71749: [22,05],
actual multiInd: 102   (1100110)
apparent multiInd:  85 (1001111)
apparent multiInd:  86 (1001111)

pseudocode for breaking apart multistate zips:

load states into memory
foreach zip in zips:
  if zip is multistate:



*/
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

const MULTI_STATE_ZCTAS_OBJECT = {
  "0": 57717,
  "1": 65733,
  "2": 79837,
  "3": 84536,
  "4": 56744,
  "5": 59275,
  "6": 99362,
  "7": 81324,
  "8": 20135,
  "9": 89421,
  "10": 88220,
  "11": 21912,
  "12": 56144,
  "13": 57724,
  "14": 57660,
  "15": 42223,
  "16": 69212,
  "17": 86044,
  "18": 59270,
  "19": 66541,
  "20": 57026,
  "21": 51360,
  "22": 2861,
  "23": 57641,
  "24": 82701,
  "25": 57645,
  "26": 82063,
  "27": 89439,
  "28": 65729,
  "29": 84034,
  "30": 38769,
  "31": 31905,
  "32": 58439,
  "33": 86514,
  "34": 58649,
  "35": 56027,
  "36": 82801,
  "37": 69216,
  "38": 89019,
  "39": 84531,
  "40": 51001,
  "41": 42602,
  "42": 72644,
  "43": 88063,
  "44": 54540,
  "45": 87328,
  "46": 83342,
  "47": 86515,
  "48": 52573,
  "49": 97910,
  "50": 51557,
  "51": 58623,
  "52": 82082,
  "53": 86504,
  "54": 57648,
  "55": 68325,
  "56": 52542,
  "57": 81137,
  "58": 51640,
  "59": 88430,
  "60": 45053,
  "61": 67950,
  "62": 75556,
  "63": 89832,
  "64": 97635,
  "65": 56219,
  "66": 89061,
  "67": 24604,
  "68": 82930,
  "69": 51023,
  "70": 59221,
  "71": 68719,
  "72": 83120,
  "73": 57638,
  "74": 80758,
  "75": 58653,
  "76": 57642,
  "77": 57078,
  "78": 30165,
  "79": 68978,
  "80": 99128,
  "81": 3579,
  "82": 38326,
  "83": 57068,
  "84": 38079,
  "85": 89060,
  "86": 52626,
  "87": 83312,
  "88": 65761,
  "89": 72338,
  "90": 59847,
  "91": 58225,
  "92": 54554,
  "93": 73949,
  "94": 63673,
  "95": 38852,
  "96": 83111,
  "97": 56164,
  "98": 69201,
  "99": 89010,
  "100": 97913,
  "101": 57030,
  "102": 71749
}

  //zip codes that occur in multiple states mapped to the two STATEFP codes
  const MULTI_STATE_ZCTA_MAP = {
    02861: [44,25],
    03579: [33,23],
    20135: [54,51],
    21912: [24,10],
    24604: [54,51],
    30165: [13,01],
    31905: [13,01],
    38079: [47,21],
    38326: [47,28],
    38769: [28,05],
    38852: [28,01],
    42223: [47,21],
    42602: [47,21],
    45053: [39,18],
    51001: [46,19],
    51023: [46,19],
    51360: [27,19],
    51557: [31,19],
    51640: [29,19],
    52542: [29,19],
    52573: [29,19],
    52626: [29,19],
    54540: [55,26],
    54554: [55,26],
    56027: [27,19],
    56144: [46,27],
    56164: [46,27],
    56219: [46,27],
    56744: [38,27],
    57026: [46,27],
    57030: [46,27],
    57068: [46,27],
    57078: [46,31],
    57638: [46,38],
    57641: [46,38],
    57642: [46,38],
    57645: [46,38],
    57648: [46,38],
    57660: [46,38],
    57717: [56,46],
    57724: [46,30],
    58225: [38,27],
    58439: [46,38],
    58623: [46,38],
    58649: [46,38],
    58653: [46,38],
    59221: [38,30],
    59270: [38,30],
    59275: [38,30],
    59847: [30,16],
    63673: [29,17],
    65729: [29,05],
    65733: [29,05],
    65761: [29,05],
    66541: [31,20],
    67950: [40,20],
    68325: [31,20],
    68719: [46,31],
    68978: [31,20],
    69201: [46,31],
    69212: [46,31],
    69216: [46,31],
    71749: [22,05],
    72338: [47,05],
    72644: [29,05],
    73949: [48,40],
    75556: [48,05],
    79837: [48,35],
    80758: [31,08],
    81137: [35,08],
    81324: [49,08],
    82063: [56,08],
    82082: [56,31],
    82701: [56,46],
    82801: [56,30],
    82930: [56,49],
    83111: [56,16],
    83120: [56,16],
    83312: [49,16],
    83342: [49,16],
    84034: [49,32],
    84531: [49,04],
    84536: [49,04],
    86044: [49,04],
    86504: [35,04],
    86514: [49,04],
    86515: [35,04],
    87328: [35,04],
    88063: [48,35],
    88220: [48,35],
    88430: [48,35],
    89010: [32,06],
    89019: [32,06],
    89060: [32,06],
    89061: [32,06],
    89421: [41,32],
    89439: [32,06],
    89832: [32,16],
    97635: [41,06],
    97910: [41,16],
    97913: [41,16],
    99128: [53,16],
    99362: [53,41]
  };

  //manual coloring of states in four-color pattern
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
    let b = (((numeric & (((1<<(numBits)) - 1)               ))                ) * (1 << (8 - numBits))) >> startBit;
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
    var r = c[0];
    return (r & 2) == 2;
  }

  function getStateFromColor(c){
    return getStateDetailFromColor(c).split(' ')[0];
  }

  function getStateDetailFromColor(c) {
    var r = c[0], g = c[1], b = c[2];
    let state;

    if (isMultiState(c)) {
      state = (((r & 240)/3)  ) | (((g & 240)/3) >> 2) | (((b & 240)/3) >> 4);
    } else {
      state = ((r & 192) >> 2) | ((g & 192) >> 4) | ((b & 192) >> 6);
    }

    let stateName = getStateName(state);
    return stateName + ` (${state}) (${fmt(r)}, ${fmt(g)}, ${fmt(b)}) ${isMultiState(c)}`;
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
    //assume multiInd is 8 bits, so, between 0 and 255 inclusive
    let top4 = (multiInd & 240) >> 4;
    let bottom4 = multiInd & 15;
    return [
      8, //trigger bit
      top4 << 2, // shift 2 bits left so that it's not cut off by translucency
      bottom4 << 2  // shift 2 bits left so that it's not cut off by translucency
    ];
  }

  function zipColor(zip, statefp) {
    let sc = stateColor(statefp);
    let zc = colorTuple(6,2,zip);
    let zr = (zc[0]<<1);
    zr = ((zr & 2) == 2) ? zr - 2 + 1 : zr;
    return [(sc[0]|zr),(sc[1]|zc[1]),(sc[2]|zc[2])];
  }

  function zipColorHighBit(zip, statefp) {
    return colorTuple(6,0,zip)
  }

  function getZipFromColor(c){
    let r = c[0] & 63, g = c[1], b = c[2];
    if (isMultiState(c)) {
      let zipg = g & 15;
      let zipb = b & 15;
      let multiInd = (zipg << 4) + zipb;
      let zip = MULTI_STATE_ZCTAS[multiInd];
      let zipString = ("" + zip).padStart(5,"0");
      let states = MULTI_STATE_ZCTA_MAP[zip].map(state=>getStateName(state)).join(', ')
      return `${zipString} (MULTI_STATE_ZCTA: ${states})`;
    }

    //63 = 00 11 11 11 (bottom 6 bits)
    r = (r >>> 1) + (((r & 1) == 1) ? 1 : 0);
    let zip = ((r & 63) << 12) | ((g & 63) << 6) | (b & 63);
    if (zip == 0) {
      return '(no zip)';
    } else {
      return '00000'.substring((zip + '').length) + zip;
    }
  }

  function explainGeoColor(c) {
    let r = c[0], g = c[1], b = c[2];
    let zipr = (r & 63), zipg= (g & 63), zipb = (b & 63);
    let stater = (r & 192) >> 6, stateg=((g & 192) >> 6), stateb=((b & 192) >> 6);
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
      getStateDetailFromColor,
      explainGeoColor
    }
  }

  if (d.properties.ZCTA5CE10) {
    let zip = parseInt(d.properties.ZCTA5CE10);
    let multiInd = MULTI_STATE_ZCTAS.indexOf(zip);
    if (multiInd >= 0) {
      if (MULTI_STATE_ZCTA_MAP[zip][0] == d.properties.STATEFP) {
        d.properties.MULTI_STATE_INDEX = multiInd;
        d.properties.fillOpacity = 1-3/4;
        d.properties.fill = colorString(zipColorMultiState(zip, multiInd, d.properties.STATEFP));
      } else {
        Object.keys(d).forEach(key=>delete d[key]);
      }
    } else {
      d.properties.fill = colorString(zipColor(zip, d.properties.STATEFP));
    }
  } else if (d.properties.COUNTYNS) {
    d.properties.fill = colorString(zipColor(d.properties.GEOID,d.properties.STATEFP));
  } else if (d.properties.CD115FP) {
    d.properties.fill = colorString(zipColor(d.properties.GEOID,d.properties.STATEFP));
  } else if (d.properties.STATEFP) {
    d.properties.fill = colorString(stateColor(d.properties.STATEFP));
  }

  if (debug) {
    Object.keys(d.properties).forEach(function(key) {
      if (['ZCTA5CE10', 'STATEFP', 'fill', 'fillOpacity', 'MULTI_STATE_INDEX'].indexOf(key) < 0) {
        delete d.properties[key];
      }
    });
    delete d.type;
    delete d.geometry;
  }

}
