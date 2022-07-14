var map = L.map('map').
     setView([41.66, -4.72],
     4);

     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
L.control.scale().addTo(map);

L.marker([41.66, -4.71],{draggable: true}).addTo(map);



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
        visualizer.sendDataToMap(response);
    },
    error:function(error) {
    }
          
    });
    
    var visualizer = {};

//make geojson object and add to map  
visualizer.sendDataToMap = function(jsonData) {
    L.geoJson(jsonData, {style: style}).addTo(map);;
        };


function getInfoComarcas(feature) {

/* view.graphics.removeAll() */

    var graphic, attributes;

    graphic = feature.graphic;
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
        if (element.properties.idComarca == attributes.comarca_sg) {
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
        }
    }

    view.on("hold", function (e) {
        view.graphics.removeAll(polylineGraphic);
        console.log("Remove")
    })
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

function style(feature) {
    return {
        fillColor: '#95FF90',
        weight: 0.6,
        opacity: 1,
        color: '#737373',
        dashArray: '2',
        fillOpacity: 0.4
    };
}