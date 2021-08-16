duration_geoJSON = "../../top_fires_duration.json" 
acres_geoJSON = "../../top_fires_acres.json" 
deadliest_geoJSON = "../../deadliest_fires.json" 
all_geoJSON = "../../all_fires.json" 
//input_geoJSON = "http://127.0.0.1:5000/longest_fires"


d3.json(duration_geoJSON).then(function(data){
    console.log("all data", data)
    // d3.json("../../fires4plotting.json").then(function(data){ 
    var uniqueYears = [];
 
    // Function to add year selections as HTML element
    function addSelection(individualYear) {
        var selection = d3.select("#selYear");//document.getElementById("selYear");
        var option = selection.append("option").text(individualYear).property("value",individualYear)//document.createElement("option");
        // option.appendChild(document.createTextNode(individualYear));
        // selection.appendChild(option);
    } ;

    function createDropDownMenu(input) {
        // Read in sample ids and create drop-down selector
        for (i=0; i<input.length; i++) {
            // console.log(`year: ${input[i]}`)
            let individualYear = input[i];
            addSelection(individualYear);
        };
    };

    // Call when change takes place to the DOM
    d3.select("#selYear").on("change", updateBarChart);
 
    var myChart;

    uniqueYears = listYears(data);
    createDropDownMenu(uniqueYears);
    createBarChart();

    function listYears(data) {
        for (i=0; i < data.features.length; i++) {
            var year   = data.features[i].properties.archiveyear;
            var flag = uniqueYears.includes(parseInt(year));

            if (flag ===  false) {
                uniqueYears.push(parseInt(year));
            }
        };
        console.log(`Array of unique years: ${uniqueYears.sort()}`);
        return uniqueYears.sort();
    };

    function createBarChart() {

        var labels = [];
        var values = [];
        var selectedYear = 2013

        for (i=0; i < data.features.length; i++) {

            // extracting data for magnitude and depth of the recordered earthquake
            var label  = data.features[i].properties.firename;    
            var value  = data.features[i].properties.duration;
            var year   = data.features[i].properties.archiveyear;

            if (parseInt(year) === parseInt(selectedYear)) {
                labels.push(`${label}`) // labels.push(`${year} | ${label}`)
                values.push(parseFloat(value).toFixed(2))
            };
        
        };

        var ctx = document.getElementById('myChart');
        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: `Fire duration in ${selectedYear}, days`,
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
                },
                responsive: true,
                // maintainAspectRatio: true
            }
        });
    };

    function updateBarChart() {

        var dropdownMenu = d3.select("#selYear");
  
        // Assign the value of the dropdown menu option to a variable
        var selectedYear = dropdownMenu.node().value//property("value");
        console.log(`Year selected is >>>> ${selectedYear}`)
        
        var labels = [];
        var values = [];
        // var selectedYear = 2013

        for (i=0; i < data.features.length; i++) {

            // extracting data for magnitude and depth of the recordered earthquake
            var label  = data.features[i].properties.firename;    
            var value  = data.features[i].properties.duration;
            var year   = data.features[i].properties.archiveyear;
   
            if (parseInt(year) === parseInt(selectedYear)) {
                labels.push(`${label}`) // labels.push(`${year} | ${label}`)
                values.push(parseFloat(value).toFixed(2))
            };
        
        };

        myChart.data.labels = labels;
        myChart.data.datasets[0].data = values;
        myChart.data.datasets[0].label = `Fire duration in ${selectedYear}, days`;
        myChart.update()
    };
})