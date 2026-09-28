function(d) {
  const properties = d.properties || {};
  const tax = properties.taxes_2026 || {};
  const description = (tax["Prop Class Description"] || "").trim();
  const normalized = description.toUpperCase();

  // The focal class is deliberately fully opaque and substantially darker than
  // the supporting land-use themes below.
  let theme = {
    name: "other property",
    color: "#64748b",
    opacity: 0.22
  };

  if (normalized === "ONE FAMILY DWELLING") {
    theme = { name: "one-family dwelling", color: "#073b7a", opacity: 1 };
  } else if (/VACANT|LAND/.test(normalized)) {
    theme = { name: "vacant or undeveloped land", color: "#c8a951", opacity: 0.30 };
  } else if (/DWELLING|RESIDENCE|APARTMENT|HOME FOR AGED|SINGLE FAMILY/.test(normalized)) {
    theme = { name: "other residential property", color: "#6baed6", opacity: 0.38 };
  } else if (/\bPARKS?\b|GOLF|CEMET|RECREAT|ATHLETIC|PLAYGROUND|SKATING|SWIMMING|BOWLING|STADIUM|MARINA|Y.M.C.A|Y.W.C.A/.test(normalized)) {
    theme = { name: "open space or recreation", color: "#5b9a6b", opacity: 0.36 };
  } else if (/SCHOOL|COLLEGE|UNIVERS|LIBRARY|RELIGIOUS|HOSPITAL|HEALTH|GOVERNMENT|POLICE|FIRE|WELFARE|CULTURAL|EDUCAT|CORRECTIONAL/.test(normalized)) {
    theme = { name: "civic or institutional property", color: "#d8874d", opacity: 0.34 };
  } else if (/MANUFACTUR|INDUSTR|WAREHOUSE|STORAGE|RAILROAD|TRUCK|UTILITY|ELEC|GAS |WATER |SEWAGE|PIPE|COMMUNICATION|TRANSPORT/.test(normalized)) {
    theme = { name: "industrial or utility property", color: "#7c8797", opacity: 0.32 };
  } else if (/COMMERCIAL|RETAIL|OFFICE|RESTAURANT|DINER|BAR|BANK|AUTO|MOTOR|SERVICE|SHOP|DEALER|PARKING|HOTEL|MOTEL|FUNERAL|THEATER/.test(normalized)) {
    theme = { name: "commercial property", color: "#9b7bbd", opacity: 0.34 };
  }

  properties.fill = theme.color;
  properties.fillOpacity = theme.opacity;
  properties.fill_trace = {
    title: tax.Address || d.id || "Unknown property",
    value_used: description || "Unknown property class",
    value_explanation: theme.name + " color from taxes_2026.Prop Class Description",
    display_properties: {
      "Front": tax["Front"],
      "Depth": tax["Depth"],
      "Year Built": tax["Year Built"],
      "Total Living Area": tax["Total Living Area"],
      "# of Beds": tax["# of Beds"],
      "# of Baths": tax["# of Baths"],
      "Construction Grade": tax["Construction Grade"],
      "Overall Condition Description": tax["Overall Condition Description"],
    }
  };
  d.properties = properties;
}