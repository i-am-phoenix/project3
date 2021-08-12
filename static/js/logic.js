d3.json("../../deadliest_fires.json").then(function(data){
// d3.json("../../fires4plotting.json").then(function(data){ 
var labels = [];
var values = [];

  for (i=0; i < data.features.length; i++) {

    // extracting data for magnitude and depth of the recordered earthquake
    var label  = data.features[i].properties.firename;    
    var value  = data.features[i].properties.fatalities;
    var year   = data.features[i].properties.archiveyear;
    var county = data.features[i].properties.county;
    console.log(`${i}   ${year} >>> ${label} >>> ${value}`)

    labels.push(`${year} | ${label}`)
    values.push(value)
  };

var ctx = document.getElementById('myChart');
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: labels,
        datasets: [{
            label: 'Number of fatalities',
            data: values,
            backgroundColor: "#d62728",
            borderWidth: 1
        }]
    },
    options: {
        indexAxis: 'y',
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
})
