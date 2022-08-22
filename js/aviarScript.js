var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
var timeInterval = today.getFullYear()+'-'+(today.getMonth()-3)+'-'+today.getDate() + '/' + today;

var map = L.map('map').setView([44.87, 10],5);  

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

var rutasOn = false;
L.easyButton( '<img src="img/migrations.svg" style="width:16px" title="Todas las rutas">', function(){
    if(!rutasOn){
        map.removeLayer(rutasLayer);
        rutasOn = true;
    }
    else{
        map.addLayer(rutasLayer);
        rutasOn = false;
    }
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
           riesgo > 3  ? '#700000' :
           riesgo > 2  ? '#ff0000' :
           riesgo > 1  ? '#ff9400' :
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
    speedSlider:   true,
    minSpeed:      1,
    speedStep:     200,
    maxSpeed:      20,
    timeSliderDragUpdate: true,
    limitSliders: true
};

var timeDimensionControl = new L.Control.TimeDimension(timeDimensionControlOptions);

map.addControl(timeDimensionControl);

getJSON('https://raw.githubusercontent.com/influenzaAviar/applicacionWeb/main/GeoJSON/alertas.geojson',  function(err, data) {

    if (err != null) {
        console.error(err);
    } else {
        alertasJSON = data;
        for(var i = 0; i < alertasJSON.features.length; i++){
            var d = new Date(alertasJSON.features[i].properties.reportDate);
            alertasJSON.features[i].properties.time = d.getFullYear()+'/'+(d.getMonth()+1)+'/'+d.getDate();
        }      

        var alertasLayer = L.geoJSON(alertasJSON, {
            pointToLayer: function(feature,latlng){
                return L.marker(latlng,{icon: logoMarker(feature)});
        }});

        var geojson = L.timeDimension.layer.geoJson(alertasLayer,{duration:"P1W"});

        geojson.addTo(map);
    }
});


var logoMarkerStyle = L.Icon.extend({ options: { iconSize: [50, 55], shadowSize:   [50, 64], iconAnchor: [25, 50], popupAnchor: [0, -80]}});

function logoMarker(feature){ 
    console.log(feature);
    return new logoMarkerStyle({iconUrl: 'img/riesgo' + feature.properties.Riesgo + '.png'})};

// var alertaIcon = L.icon({
//     iconUrl: 'img/brote.png',
//     iconSize:     [15,15], // size of the icon
//     shadowSize:   [15,15], // size of the shadow
//     iconAnchor:   [15,15], // point of the icon which will correspond to marker's location
//     shadowAnchor: [15,15],  // the same for the shadow
//     popupAnchor:  [15,15] // point from which the popup should open relative to the iconAnchor
// });

// alertasLayer = L.geoJson(alertasJSON2,{
//     onEachFeature: function (feature) {

//         create a marker style
//         var logoMarkerStyle = L.Icon.extend({ options: { iconSize: [50, 55], shadowSize:   [50, 64], iconAnchor: [25, 50], popupAnchor: [0, -80]}});

//         var logoMarker = new logoMarkerStyle({iconUrl: 'img/riesgo' + feature.properties.Riesgo + '.png'});

//         // read the coordinates from your marker
//         var lat = feature.geometry.coordinates[1];
//         var lon = feature.geometry.coordinates[0];

//         // L.marker([lat,lon],{icon: logoMarker}).bindPopup('<p>'+feature.properties.Name+'</p>').addTo(map);
//         L.marker([lat,lon],{icon: logoMarker}).addTo(map);
//         console.log(feature);
//     }
// }
// );


var rutasJSON, rutasLayer;
getJSON('https://raw.githubusercontent.com/influenzaAviar/applicacionWeb/main/GeoJSON/migrations.geojson',  function(err, data) {
    if (err != null) {
        console.error(err);
    } else {

        rutasJSON = data;

        rutasLayer = L.geoJSON(rutasJSON, {style:styleMigrations});

    }
});

var styleMigrations = {
    weight: 0.2,
    opacity: 0.2,
    color: '#fff' 
}




var brotesJSON, brotesLayer;

getJSON('https://raw.githubusercontent.com/influenzaAviar/applicacionWeb/main/GeoJSON/brotes.geojson',  function(err, data) {

    if (err != null) {
        console.error(err);
    } else {
        // getJSON('https://raw.githubusercontent.com/influenzaAviar/applicacionWeb/main/GeoJSON/rutas.geojson',  function(err, data2) {
            
            // if(err !=  null) console.error(err);
            // else{
                brotesJSON = data;
                // migrationsJSON = data2;
                for(var i = 0; i < brotesJSON.features.length; i++){
                    // console.log(brotesJSON.features[i].properties.observationDate);
                    var d = new Date(brotesJSON.features[i].properties.observationDate);
                    brotesJSON.features[i].properties.time = d.getFullYear()+'/'+(d.getMonth()+1)+'/'+d.getDate();
                    
                }      

                var brotesLayer = L.geoJSON(brotesJSON, {
                    pointToLayer: function(feature,latlng){
                        return L.marker(latlng,{icon: broteIcon}).bindPopup('<p> Especie: '+feature.properties.species+' <br> País: '+feature.properties.country + ' <br> Ciudad: '+feature.properties.city + ' </p>');
                    }});
                L.timeDimension.layer.geoJson(brotesLayer,{duration:"P1W"}).addTo(map);
            // }
        // }
    }
  
});

var broteIcon = L.icon({
    iconUrl: 'img/brote.png',
    iconSize:     [15,15], // size of the icon
    shadowSize:   [15,15], // size of the shadow
    iconAnchor:   [0,0], // point of the icon which will correspond to marker's location
    shadowAnchor: [15,15],  // the same for the shadow
    popupAnchor:  [8,0] // point from which the popup should open relative to the iconAnchor
});

