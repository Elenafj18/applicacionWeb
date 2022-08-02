var map = L.map('map').
     setView([41.66, -4.72],
     4);

     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
L.control.scale().addTo(map);

//L.marker([41.66, -4.71],{draggable: true}).addTo(map);

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

L.easyButton( '<img src="./img/brote.svg">', function(){
    alert('restart-view');
  }).addTo(map);

L.easyButton( 'glyphicon-star', function(){
  alert('zoom-brotes');
}).addTo(map);

L.easyButton( 'glyphicon-star', function(){
    alert('zoom-spain');
  }).addTo(map);

L.easyButton( 'glyphicon-star', function(){
alert('show-risk-routes');
}).addTo(map);

L.easyButton( 'glyphicon-star', function(){
alert('show-all-routes');
}).addTo(map);
/// DEFINICIÓN DEL LAS COMARCAS GANADERAS
let layerViewComarcas;

    const layerComarcas = $.ajax({
    type: 'GET',
    dataType:"json",
    url: "https://raw.githubusercontent.com/influenzaAviar/applicacionWeb/main/GeoJSON/comarcas.geojson",
    style:{},
    method: 'GET',
    copyright: "CERBU",
    outFields: ['*'],
    renderer: {
        type: "simple",
        symbol: {
            type: "simple-fill",
            color: [92, 92, 92, 0.01],
            outline: {
                color: [155, 155, 155, 0.3],
                width: 1.25
            }
        }
    },
    visible: true,
    supportsQuery: true,
    popupTemplate: {
        title: "Comarca: {comarca}," +
            "<br>Provincia: {provincia}" +
            "<br>Comunidad Autónoma: {comAutonoma}</br>",
        content: getInfoComarcas,
        visible: false,
        returnGeometry: true,
    },
    success: function(response) {
        visualizer.sendDataToMap(response, styleComarcas);
    },
    error:function(error) {
    }
          
    });
    
    var visualizer = {};


    var styleComarcas = {
        fillColor: '#FF0000',
        weight: 0.6,
        opacity: 1,
        color: '#737373',
        dashArray: '2',
        fillOpacity: 0.4
    }
    
//Annadir comarcas al mapa
visualizer.sendDataToMap = function(jsonData, style) {
    L.geoJson(jsonData, {style: style}).addTo(map);
};


function getInfoComarcas(feature) {

/* view.graphics.removeAll() */

    var features, attributes;
    features = feature.features;
    attributes = graphic.attributes;

    var urlRutas = 'https://raw.githubusercontent.com/influenzaAviar/applicacionWeb/main/GeoJSON/migrations.geojson';
// Se inicia la peticion ajax a la url ruta
    var request = new XMLHttpRequest();
    request.open("GET", urlRutas, false); // false for synchronous request
    request.send(null);
    let rutas = JSON.parse(request.responseText)
    console.log('obj ruta', rutas)

    for (let index = 0; index < rutas.features.length; index++) {
        const element = rutas.features[index];
        console.log('element', element)
        if (element.properties.idComarca == feature.comarca_sg) {
            
            var polyline = {
                type: "polyline", // new Polyline()
                paths: element.geometry.coordinates
            };
            var lineSymbol = {
                type: "simple-line", // new SimpleLineSymbol()
                color: [51, 200, 200/* , 0.9 */], // RGB color values as an array
                width: 1
            };
             var polylineGraphic = new Graphic({
                geometry: polyline, // Add the geometry created in step 4
                symbol: lineSymbol, // Add the symbol created in step 5
            });
            view.graphics.add(polylineGraphic);
            view.on("hold", function (e) {
                view.graphics.removeAll(polylineGraphic);
                console.log("Remove");
            });
        }
    }

    
}

function getColor(d) {
    return d > 1000 ? '#800026' :
           d > 500  ? '#BD0026' :
           d > 200  ? '#E31A1C' :
           d > 100  ? '#FC4E2A' :
           d > 50   ? '#FD8D3C' :
           d > 20   ? '#FEB24C' :
           d > 10   ? '#FED976' :
                      '#FFEDA0';
}

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 10, 20, 50, 100, 200, 500, 1000]

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);


//DEFINICIÓN RUTAS
$(document).ready(function () {
    $(function () {
        document.getElementById("migrations").addEventListener("click", activarRutas);

        //view.ui.add(ruta, "top-right");
    })
})
let layerRutas;
let visibleRutas = false;

function activarRutas(feature) {

    if(!visibleRutas){
        map.removeLayer(layerRutas);
        visibleRutas=true;
    }
    else{ 
        layerRutas = $.ajax({
            type: 'GET',
            dataType:"json",
            url: "https://raw.githubusercontent.com/influenzaAviar/applicacionWeb/main/GeoJSON/migrations.geojson",
            style:{},
            method: 'GET',
            copyright: "CERBU",
            outFields: ['*'],
            renderer: {
                type: "simple",
                symbol: {
                    type: "simple-fill",
                    color: [92, 92, 92, 0.01],
                    outline: {
                        color: [155, 155, 155, 0.3],
                        width: 1.25
                    }
                }
            },
            visible: visibleRutas,
            supportsQuery: false,
            popupTemplate: {
                title:"",
                content: getInfoComarcas,
                visible: false,
                returnGeometry: true,
            },
            success: function(response) {
                visualizer.sendDataToMap(response, styleRutas);
            },
            error:function(error) {
            }    
            });

            var styleRutas = {
                fillColor: '#95FF90',
                weight: 0.6,
                opacity: 0.05,
                color: '#FFFFFF',
                dashArray: '1',
                fillOpacity: 0.05
        }
        visibleRutas=false;
    }
    
}



