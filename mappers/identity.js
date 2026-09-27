function(d){
  if (d.properties) {
    d.properties.fill_trace = {
      value_used: d.properties.fill || null,
      value_explanation: "identity mapper preserved the existing fill"
    };
  }
}
