function(d) {
  /*
   * Stable categorical colors for every tax_2025.Neighborhood presently found
   * in data/buffalo/oars-2019/final1_with_2025_taxes.ndjson.
   */
  const NEIGHBORHOOD_COLORS = {
    "Allentown": "hsl(0.000, 65%, 48%)",
    "Black Rock": "hsl(10.000, 65%, 48%)",
    "Broadway Fillmore": "hsl(20.000, 65%, 48%)",
    "Central": "hsl(30.000, 65%, 48%)",
    "Central Park": "hsl(40.000, 65%, 48%)",
    "Delavan Grider": "hsl(50.000, 65%, 48%)",
    "Ellicott": "hsl(60.000, 65%, 48%)",
    "Elmwood Bidwell": "hsl(70.000, 65%, 48%)",
    "Elmwood Bryant": "hsl(80.000, 65%, 48%)",
    "Fillmore-Leroy": "hsl(90.000, 65%, 48%)",
    "First Ward": "hsl(100.000, 65%, 48%)",
    "Fruit Belt": "hsl(110.000, 65%, 48%)",
    "Genesee-Moselle": "hsl(120.000, 65%, 48%)",
    "Grant-Amherst": "hsl(130.000, 65%, 48%)",
    "Hamlin Park": "hsl(140.000, 65%, 48%)",
    "Hopkins-Tifft": "hsl(150.000, 65%, 48%)",
    "Kaisertown": "hsl(160.000, 65%, 48%)",
    "Kenfield": "hsl(170.000, 65%, 48%)",
    "Kensington-Bailey": "hsl(180.000, 65%, 48%)",
    "Lovejoy": "hsl(190.000, 65%, 48%)",
    "Lower West Side": "hsl(200.000, 65%, 48%)",
    "Masten Park": "hsl(210.000, 65%, 48%)",
    "MLK Park": "hsl(220.000, 65%, 48%)",
    "North Park": "hsl(230.000, 65%, 48%)",
    "Parkside": "hsl(240.000, 65%, 48%)",
    "Pratt-Willert": "hsl(250.000, 65%, 48%)",
    "Riverside": "hsl(260.000, 65%, 48%)",
    "Schiller Park": "hsl(270.000, 65%, 48%)",
    "Seneca Babcock": "hsl(280.000, 65%, 48%)",
    "Seneca-Cazenovia": "hsl(290.000, 65%, 48%)",
    "South Park": "hsl(300.000, 65%, 48%)",
    "UNKNOWN": "hsl(310.000, 65%, 48%)",
    "University Heights": "hsl(320.000, 65%, 48%)",
    "Upper West Side": "hsl(330.000, 65%, 48%)",
    "West Hertel": "hsl(340.000, 65%, 48%)",
    "West Side": "hsl(350.000, 65%, 48%)"
  };

  const properties = d.properties || {};
  const tax = properties.taxes_2026 || {};
  const neighborhood = tax.Neighborhood;
  properties.fill = NEIGHBORHOOD_COLORS[String(neighborhood)] || "#9ca3af";
  properties.fill_trace = {
    title: tax.Address,
    value_used: neighborhood == null ? null : String(neighborhood),
    value_explanation: "color generated from tax Neighborhood"
  };
  d.properties = properties;
}
