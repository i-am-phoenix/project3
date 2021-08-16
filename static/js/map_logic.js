// for proj3 cal fire data display
// read from json and manipulate.
// var fire_data = "http://127.0.0.1:5000/all_fires"
var fire_data = "../../all_fires.json" 

d3.json("../../all_fires.json").then(function(data_all) {
  d3.json("../../top_fires_duration.json").then(function(data_longest) {
    console.log("all_fires",data_all)
    console.log("longest_fires", data_longest)

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
    d3.select("#selYear").on("change", function(){
      updateBarChart(data_longest);
      updateMap(data_longest)
    });
 
    var myChart;

    uniqueYears = listYears(data_all);

    createDropDownMenu(uniqueYears);

    createBarChart(data_longest);
    createMap(data_all);

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
    // -------------------------------------- BAR CHART DURATION ------------------------------------------

    function createBarChart(data) {

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

    function updateBarChart(data) {

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

    // -------------------------------------- MAP ----------------------------------------------------------
    function createMap(data) {
          
      // Create the tile layer that will be the background of our map and add to myMap
      var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      })
    
      // Add stelite data layer (dark)
      var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      });
  
      // Set up basemap variable
      var baseMaps = {
        "Street map" : street,
        "Satellite map": Esri_WorldImagery
      }
  
      // L.control.layers(baseMap).addTo(myMap);

      console.log(data) 
      var colors = {
        2013: 'red',
        2014: 'orange',
        2015: 'yellow',
        2016: 'green',
        2017: 'lightblue',
        2018: 'blue',
        2019: 'purple'
      };

      fires = [];
      //cycling through features
      for (i=1; i < data.features.length; i++) {
          // extract data for teh name of the fire
          var firename = data.features[i].properties.firename
  
          // extracting data for the size of fire (acres burned)
          var size = data.features[i].properties.acresburned
          // extract data for the year of fire
          var year   = parseInt(data.features[i].properties.archiveyear)
          
          // extract data for fire duration in days 
          var duration = data.features[i].properties.duration
  
          // extract data for fatalities
          var fatalities = data.features[i].properties.fatalities
  
          // create a marker/circle for the processed data point
          var lat = data.features[i].geometry.coordinates[1] // y
          var lon = data.features[i].geometry.coordinates[0] // x
          fire = new L.circle([lat, lon],{
              radius: (size)/5,
              color: "grey",//parseInt(year),"grey",
              weight: 0.5,
              fillColor: "red",
              fillOpacity: 0.7
          }).bindPopup(`<h5>${firename}</h5><hr>
          <strong>Year:&emsp;${year}<br>
          <strong>Area burnt, acres:&emsp;${size}<br>
          <strong>Duration, days:&emsp;</strong>${parseFloat(duration).toFixed(2)}<br>
          <strong>Fatalities:&emsp;</strong>${parseInt(fatalities)}`);//.addTo(myMap);

          fires.push(fire)
      };
      // all_fires = addLayers(fires);

      var mark = L.layerGroup(fires);

      var overlayMaps = {
        "All fires": mark
      };
      
      var myMap = L.map("map", {
        center: [37.420258, -120.622549],
        zoom: 6,
        layers: [street, mark]
      });

      // controls open
      L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(myMap);
    };

    function updateMap(data) {
        
      // Create the tile layer that will be the background of our map and add to myMap
      street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      })
    
      // Add stelite data layer (dark)
      Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      });
  
      // Set up basemap variable
      baseMaps = {
        "Street map" : street,
        "Satellite map": Esri_WorldImagery
      }

      var dropdownMenu = d3.select("#selYear");
    
      // Assign the value of the dropdown menu option to a variable
      var selectedYear = parseInt(dropdownMenu.node().value)//property("value");
      console.log(`Year selected in Map is >>>> ${selectedYear}`)
      
      myMap.removeLayer(mark);
      var top_10_fires = [];
      for (i=1; i < data.features.length; i++) {
        // extract data for teh name of the fire
        var firename = data.features[i].properties.firename;

        // extracting data for the size of fire (acres burned)
        var size = data.features[i].properties.acresburned;
        // extract data for the year of fire
        var year = data.features[i].properties.archiveyear;
        
        // extract data for fire duration in days 
        var duration = data.features[i].properties.duration;

        // extract data for fatalities
        var fatalities = data.features[i].properties.fatalities;

        // create a marker/circle for the processed data point
        var lat = data.features[i].geometry.coordinates[1] // y
        var lon = data.features[i].geometry.coordinates[0] // x
        if (parseInt(year) === parseInt(selectedYear)) {
          fire = new L.circle([lat, lon],{
            radius: (size)/5,
            color: "grey",//parseInt(year),"grey",
            weight: 0.5,
            fillColor: "red",
            fillOpacity: 0.7 
          }).bindPopup(`<h5>${firename}</h5><hr>
          <strong>Year:&emsp;${year}<br>
          <strong>Area burnt, acres:&emsp;${size}<br>
          <strong>Duration, days:&emsp;</strong>${parseFloat(duration).toFixed(2)}<br>
          <strong>Fatalities:&emsp;</strong>${parseInt(fatalities)}`);//.addTo(myMap);

          fires.push(fire)
        };
      };
      var mark_filtered = L.layerGroup(top_10_fires);

      var overlayMaps = {
        "All fires": mark,
        "Filtered fires" : mark_filtered
      };
      
      myMap = L.map("map", {
        center: [37.420258, -120.622549],
        zoom: 6,
        layers: [street, mark_filtered]
      });

      // controls open
      L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(myMap);
    };
  });
});

