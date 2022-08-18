var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
console.log(date);
var timeInterval = today.getFullYear()+'-'+(today.getMonth()-3)+'-'+today.getDate() + '/' + today;
var map = L.map('map', {
    // timeDimension: true,
    // timeDimensionOptions: {
    //     // timeInterval: timeInterval,
    //     timeInterval: '2020-08-11/2021-08-11',
    //     // period: "PT1H"
    //     period: "P1W",
    //     currentTime : date,
    // }
}).setView([44.87, 10],5);  

// L.control.timeDimension({
//     title: 'alertas',
//     // timeSliderDragUpdate: true,
//     limitSliders: true
// }).addTo(map);
L.control.scale().addTo(map);

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

L.easyButton( '<img src="img/home.png" style="width:16px" title="Zoom inicial">', function(){
    map.setView([44.87, 10],5);    
  }).addTo(map);

L.easyButton( '<img src="img/brote.svg" style="width:16px" title="Zoom a brotes">', function(){
    map.setView([55, 30],4);    
  }).addTo(map);

L.easyButton( '<img src="img/alerta.svg" style="width:16px" title="Zoom a alertas">', function(){
    map.setView([40, -2.72],5.5);
}).addTo(map);

L.easyButton( '<img src="img/ruta.svg" style="width:16px" title="Rutas activadas por riesgo">', function(){
    alert('Rutas activadas por riesgo');
  }).addTo(map);

L.easyButton( '<img src="img/migrations.svg" style="width:16px" title="Todas las rutas">', function(){
alert('Todas las rutas');

}).addTo(map);

var riskButton = L.easyButton( '<img src="img/filter.png" style="width:16px" title="Nivel de riesgo">', function(){
    var risk1 = L.easyButton('<a style="width:4rem;>Riesgo 1</a>',function(){alert('Riesgo 1');}).addTo(map);
    var risk2 = L.easyButton('<a style="width:4rem;>Riesgo 2</a>',function(){alert('Riesgo 2');}).addTo(map);
    var risk3 = L.easyButton('<a style="width:4rem;>Riesgo 3</a>',function(){alert('Riesgo 3');}).addTo(map);
    var risk4 = L.easyButton('<a style="width:4rem;>Riesgo 4</a>',function(){alert('Riesgo 4');}).addTo(map);
    var risk5 = L.easyButton('<a style="width:4rem;">Riesgo 5</a>',function(){alert('Riesgo 5');}).addTo(map);
}).addTo(map);


//////////////////////////////////////////
//                LEYENDA               //
//////////////////////////////////////////
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'), grades = [1, 2, 3, 4, 5];

    for (var i = 0; i < grades.length; i++) 
        div.innerHTML += '<i style="background:' + getColor(grades[i]) + '"></i> ' + "Nivel " + grades[i]+'<br>';
    
    return div;
};

legend.addTo(map);

function getColor(riesgo) {
    return riesgo > 4  ? '#000000' :
           riesgo > 3  ? '#ff0000' :
           riesgo > 2  ? '#ff6600' :
           riesgo > 1  ? '#ffb400' :
           riesgo > 0  ? '#fff555' :
                         '#ffffff';
}



//FUNCIÓN GET JSON
var getJSON = function(url, callback) {

    var xmlhttprequest = new XMLHttpRequest();
    xmlhttprequest.open('GET', url, true);
    xmlhttprequest.responseType = 'json';

    xmlhttprequest.onload = function() {

        var status = xmlhttprequest.status;

        if (status == 200) {
            callback(null, xmlhttprequest.response);
        } else {
            callback(status, xmlhttprequest.response);
        }
    };

    xmlhttprequest.send();
};


//////////////////////////////////////////
//               COMARCAS               //
//////////////////////////////////////////
var comarcasJSON;
var comarcasLayer;
var alertasJSON;
var alertasLayer;
getJSON('https://raw.githubusercontent.com/influenzaAviar/applicacionWeb/main/GeoJSON/comarcas.geojson',  function(err, data) {

    if (err != null) {
        console.error(err);
    } else {
        comarcasJSON = data;
        comarcasLayer = L.geoJson(comarcasJSON,{style:styleComarcas,onEachFeature: onEachFeature}).addTo(map);
    }
    console.log("************************************************************");
  
});

var styleComarcas = {
    fillColor: '#ffffff',
    fillOpacity: 0.3,
    weight: 0.5,
    opacity: 1,
    color: '#000000',
    dashArray: '1'    
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 1.5,
        color: '#000',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);
}
function resetHighlight(e) {
    comarcasLayer.resetStyle(e.target);
    info.update();
}
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'infoComarcas'); // create a div with a class "info"
    this.update();
    return this._div;
};

//INFORMACIÓN DE ALERTA POR COMARCA
info.update = function (props) {
    if(props)
    this._div.innerHTML = '<h4><b>'+ props.comarca +'</b></h4>'
    + 
    '<p>' +
    'Provincia: '+ props.provincia +
    '<br/>' +
    'C.A.: ' + props.comAutonoma +
    '</p>';
       
    else
        this._div.innerHTML = '';
};

info.addTo(map);



//////////////////////////////////////////
//                ALERTAS               //
//////////////////////////////////////////

var alertasJSON2 = {"type": "FeatureCollection", 
    "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [-5.77235268948, 43.5350333797]},
                    "properties": {"idAlerta": "SP33024_1623020400000.0", "Riesgo": 2, "time": "2021/03/11", "comarca": "GIJON", "informe": "https://drive.google.com/file/d/1Jz5kXOwiRxsr6Gww1lEcpZPdjdB3HUdD/view?usp=drivesdk"}},
                {"type": "Feature","geometry": {"type": "Point", "coordinates": [-5.7870971929, 37.1010126053]},
                    "properties": {"idAlerta": "SP41095_1623020400000.0", "Riesgo": 4, "time": "2021/04/20", "comarca": "UTRERA (BAJO GUADALQUIVIR)", "informe": "https://drive.google.com/file/d/1Jz5kXOwiRxsr6Gww1lEcpZPdjdB3HUdD/view?usp=drivesdk"}},
                {"type": "Feature", "geometry": {"type": "Point", "coordinates": [-5.79556384981, 38.9607991582]},
                    "properties": {"idAlerta": "SP06044_1623020400000.0", "Riesgo": 2, "time": "2021/05/21", "comarca": "DON BENITO", "informe": "https://drive.google.com/file/d/1Jz5kXOwiRxsr6Gww1lEcpZPdjdB3HUdD/view?usp=drivesdk"}},
                {"type": "Feature", "geometry": {"type": "Point", "coordinates": [-6.57022157408, 37.1574501172]},
                    "properties": {"idAlerta": "SP21005_1623020400000.0", "Riesgo": 4, "time": "2021/06/01", "comarca": "ALMONTE (ENTORNO DE DOÑANA)", "informe": "https://drive.google.com/file/d/1Jz5kXOwiRxsr6Gww1lEcpZPdjdB3HUdD/view?usp=drivesdk"}}
    ]};


var timeDimension = new L.TimeDimension({
        timeInterval: '2020-08-11/2022-08-11',
        period: "P1W"
    });

map.timeDimension = timeDimension; 

var player = new L.TimeDimension.Player({
    transitionTime: 100, 
    loop: false,
    startOver:true
}, timeDimension);

var timeDimensionControlOptions = {
    player:        player,
    timeDimension: timeDimension,
    position:      'bottomleft',
    autoPlay:      true,
    minSpeed:      1,
    speedStep:     1,
    maxSpeed:      15,
    timeSliderDragUpdate: true
};

var timeDimensionControl = new L.Control.TimeDimension(timeDimensionControlOptions);

map.addControl(timeDimensionControl);

var timeSeriesLayer = L.geoJSON(alertasJSON2);

var geojson = L.timeDimension.layer.geoJson(timeSeriesLayer);

geojson.addTo(map);


// getJSON('https://raw.githubusercontent.com/influenzaAviar/applicacionWeb/main/GeoJSON/alertas.geojson',  function(err, data) {

//     if (err != null) {
//         console.error(err);
//     } else {
//         alertasJSON = data;
//         // for(var i = 0; i < alertasJSON2.length; i++)
//             // alertasJSON2.features[i].properties.reportDate = new Date(alertasJSON2.features[i].properties.reportDate);
//         alertasLayer = L.geoJson(alertasJSON2);
//         L.map.timeDimension.layer.geoJson(alertasLayer, {
//             duration:'P1W',
//             waitForReady: true,
//             // updateTimeDimension: true
//         }).addTo(map);

        
//     }
  
// });



function addGeoJSONLayer(map, data) {
    var icon = L.icon({
        iconUrl: 'img/riesgo1.png',
        iconSize: [22, 22],
        iconAnchor: [11, 11]
    });

    var geoJSONLayer = L.geoJSON(data, {
        pointToLayer: function (feature, latLng) {
            if (feature.properties.hasOwnProperty('last')) {
                return new L.Marker(latLng, {
                    icon: icon
                });
            }
            return L.circleMarker(latLng);
        }
    });

    var geoJSONTDLayer = L.timeDimension.layer.geoJson(geoJSONLayer, {
        updateTimeDimension: true,
        duration: 'P3W',
        updateTimeDimensionMode: 'replace',
        addlastPoint: true
    }).addTo(map);
}
addGeoJSONLayer(L.geoJSON(alertasJSON2));

// alertasLayer = L.geoJson(alertasJSON2,{
//     onEachFeature: function (feature) {

//         // create a marker style
//             var logoMarkerStyle = L.Icon.extend({
//                                             options: {
//                                             iconSize: [50, 55],
//                                             shadowSize:   [50, 64],
//                                             iconAnchor: [25, 50],
//                                             popupAnchor: [0, -80]
//                                         }
//                                     });

//             var logoMarker = new logoMarkerStyle({iconUrl: 'img/riesgo' + feature.properties.Riesgo + '.png'});

//             // read the coordinates from your marker
//             var lat = feature.geometry.coordinates[1];
//             var lon = feature.geometry.coordinates[0];

//             // L.marker([lat,lon],{icon: logoMarker}).bindPopup('<p>'+feature.properties.Name+'</p>').addTo(map);
//             L.marker([lat,lon],{icon: logoMarker}).addTo(map);
//             console.log(feature);
//     }
// }
// );

// L.timeDimension.layer.geoJson(alertasLayer, {duration:'P1W'}).addTo(map);


// var rutasJSON, rutasLayer;

// getJSON('https://raw.githubusercontent.com/influenzaAviar/applicacionWeb/main/GeoJSON/migrations.geojson',  function(err, data) {

//     if (err != null) {
//         console.error(err);
//     } else {
//         rutasJSON = data;
//         rutasLayer = L.geoJson(rutasJSON);
//         L.timeDimension.layer.geoJson(rutasLayer, {duration:'P1W'}).addTo(map);
//     }
  
// });



