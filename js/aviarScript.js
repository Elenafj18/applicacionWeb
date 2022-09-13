var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
var timeInterval = (today.getFullYear()-1)+'-'+(today.getMonth()+1)+'-'+today.getDate() + '/' + date;
console.log(timeInterval);

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

var rutasOn = false;
L.easyButton( '<img src="img/ruta.svg" style="width:16px" title="Rutas activadas por riesgo">', function(){
    if(!rutasOn){
        rutasOn = true;
    }
    else{
        rutasOn = false;
    }
  }).addTo(map);

var migrationsOn = false;
L.easyButton( '<img src="img/migrations.svg" style="width:16px" title="Todas las rutas">', function(){
    if(!migrationsOn){
        map.removeLayer(migrationsLayer);
        migrationsOn = true;
    }
    else{
        map.addLayer(migrationsLayer);
        migrationsOn = false;
    }
}).addTo(map);

var filterButton = L.control.tagFilterButton({
	data: ['Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4', 'Nivel 5'],
    filterOnEveryClick: true
}).addTo( map );


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
//            TIME DIMENSION            //
//////////////////////////////////////////

var timeDimension = new L.TimeDimension({
        timeInterval: timeInterval,
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
    speedSlider:   true,
    minSpeed:      1,
    speedStep:     10,
    maxSpeed:      20,
    timeSliderDragUpdate: true
};

var timeDimensionControl = new L.Control.TimeDimension(timeDimensionControlOptions);

map.addControl(timeDimensionControl);



//////////////////////////////////////////
//                ALERTAS               //
//////////////////////////////////////////

var riesgo1layer, riesgo2layer, riesgo3layer, riesgo4layer, riesgo5layer;

getJSON('https://raw.githubusercontent.com/influenzaAviar/applicacionWeb/main/GeoJSON/alertas.geojson',  function(err, data) {

    if (err != null) {
        console.error(err);
    } else {
        alertasJSON = data;
        for(var i = 0; i < alertasJSON.features.length; i++){
            var d = new Date(alertasJSON.features[i].properties.reportDate);
            alertasJSON.features[i].properties.time = d.getFullYear()+'/'+(d.getMonth()+1)+'/'+d.getDate();
        }      

        // Layer con todas las alertas
        // var alertasLayer = L.geoJSON(alertasJSON, {
        //     tags: function(feature){
        //         switch(feature.properties.Riesgo){
        //             case 1:
        //                 return ["Nivel 1"];
        //             case 2:
        //                 return ["Nivel 2"];
        //             case 3:
        //                 return ["Nivel 3"];
        //             case 4:
        //                 return ["Nivel 4"];
        //             case 5:
        //                 return ["Nivel 5"];
        //             default:
        //                 break;
        //         }
        //         return feature.properties.Riesgo;},
        //     pointToLayer: function(feature,latlng){
        //         return L.marker(latlng,{icon: logoMarker(feature)}).bindPopup('<p> Especie: '+feature.properties.species+' <br> País: '+feature.properties.country + ' <br> Ciudad: '+feature.properties.city + ' </p>');
        // }});
        // var geojson = L.timeDimension.layer.geoJson(alertasLayer,{duration:"P1W"});
        // geojson.addTo(map);

        //Layer con alertas de nivel 1
        var riesgo1filter = L.geoJson(alertasJSON, {tags: ['Nivel 1'], filter: riesgo1fun,
            pointToLayer: function(feature,latlng){
                return L.marker(latlng,{icon: logoMarker(feature)}).bindPopup('<p>Nivel de alerta: '+ feature.properties.Riesgo +'</p><a class="infoAlerta info" href='+ feature.properties.informe+'> Más información </a>');
        }});
        function riesgo1fun(feature) { if (feature.properties.Riesgo === 1) return true; }
        riesgo1 = L.timeDimension.layer.geoJson(riesgo1filter,{duration:"P1W"}).addTo(map);
        // riesgo1.addTo(map);

        //Layer con alertas de nivel 2
        var riesgo2filter = L.geoJson(alertasJSON, {tags: ['Nivel 2'], filter: riesgo2fun,
            pointToLayer: function(feature,latlng){
                return L.marker(latlng,{icon: logoMarker(feature)}).bindPopup('<p>Nivel de alerta: '+ feature.properties.Riesgo +'</p><a class="infoAlerta info" href='+ feature.properties.informe+'> Más información </a>');
        }});
        function riesgo2fun(feature) { if (feature.properties.Riesgo === 2) return true; }
        riesgo2 = L.timeDimension.layer.geoJson(riesgo2filter,{duration:"P1W", tags: ['riesgo2'] }).addTo(map);
        // riesgo2.addTo(map);

        //Layer con alertas de nivel 3
        var riesgo3filter = L.geoJson(alertasJSON, {tags: ['Nivel 3'], filter: riesgo3fun,
            pointToLayer: function(feature,latlng){
                return L.marker(latlng,{icon: logoMarker(feature)}).bindPopup('<p>Nivel de alerta: '+ feature.properties.Riesgo +'</p><a class="infoAlerta info" href='+ feature.properties.informe+'> Más información </a>');
        }});
        function riesgo3fun(feature) { if (feature.properties.Riesgo === 3) return true; }
        riesgo3 = L.timeDimension.layer.geoJson(riesgo3filter,{duration:"P1W", tags: ['riesgo3'] }).addTo(map);
        // riesgo3.addTo(map);

        //Layer con alertas de nivel 4
        var riesgo4filter = L.geoJson(alertasJSON, {tags: ['Nivel 4'], filter: riesgo4fun,
            pointToLayer: function(feature,latlng){
                return L.marker(latlng,{icon: logoMarker(feature)}).bindPopup('<p>Nivel de alerta: '+ feature.properties.Riesgo +'</p><a class="infoAlerta info" href='+ feature.properties.informe+'> Más información </a>');
        }});
        function riesgo4fun(feature) { if (feature.properties.Riesgo === 4) return true; }
        riesgo4 = L.timeDimension.layer.geoJson(riesgo4filter,{duration:"P1W", tags: ['riesgo4'] }).addTo(map);
        // riesgo4.addTo(map);

        //Layer con alertas de nivel 5
        var riesgo5filter = L.geoJson(alertasJSON, {tags: ['Nivel 5'], filter: riesgo5fun,
            pointToLayer: function(feature,latlng){
                return L.marker(latlng,{icon: logoMarker(feature)}).bindPopup('<p>Nivel de alerta: '+ feature.properties.Riesgo +'</p><a class="infoAlerta info" href='+ feature.properties.informe+'> Más información </a>');
        }});
        function riesgo5fun(feature) { if (feature.properties.Riesgo === 5) return true; }
        riesgo5 = L.timeDimension.layer.geoJson(riesgo5filter,{duration:"P1W", tags: ['riesgo5'] }).addTo(map);
        // riesgo5.addTo(map);
    }
});

var logoMarkerStyle = L.Icon.extend({
    options: {
        iconSize:    [20, 20],
        shadowSize:  [20, 20],
        popupAnchor: [0, -80]
    }
});

function logoMarker(feature){
    return new logoMarkerStyle({iconUrl: 'img/riesgo' + feature.properties.Riesgo + '.png'})
};


    
//////////////////////////////////////////
//              MIGRACIONES             //
//////////////////////////////////////////

var migrationsJSON, migrationsLayer;
getJSON('https://raw.githubusercontent.com/influenzaAviar/applicacionWeb/main/GeoJSON/migrations.geojson',  function(err, data) {
    if (err != null) {
        console.error(err);
    } else {
        migrationsJSON = data;
        migrationsLayer = L.geoJSON(migrationsJSON, {style:styleMigrations});
    }
});

var styleMigrations = {
    weight: 0.2,
    opacity: 0.2,
    color: '#fff' 
}



//////////////////////////////////////////
//                BROTES                //
//////////////////////////////////////////

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
                    var d = new Date(brotesJSON.features[i].properties.observationDate);
                    brotesJSON.features[i].properties.time = d.getFullYear()+'/'+(d.getMonth()+1)+'/'+d.getDate();
                }

                var brotesLayer = L.geoJSON(brotesJSON, {
                    pointToLayer: function(feature,latlng){
                        
                        var especie = feature.properties.species.charAt(0).toUpperCase() + feature.properties.species.substring(1).toLowerCase();
                        var pais = feature.properties.country.charAt(0).toUpperCase()  + feature.properties.country.substring(1).toLowerCase();
                        var ciudad = feature.properties.city.charAt(0).toUpperCase()  + feature.properties.city.substring(1).toLowerCase();
                        var nCasos = feature.properties.cases;
                        var serotipo = feature.properties.serotipo.charAt(0).toUpperCase()  + feature.properties.serotipo.substring(1).toLowerCase();

                        return L.marker(latlng,{icon: broteIcon}).bindPopup('<p> Especie: '+ especie + ' <br> Nº Casos: '+ nCasos + ' <br> Serotipo: '+ serotipo + ' <br> País: '+ pais + ' <br> Ciudad: '+ ciudad +' </p>');
                    }});
                L.timeDimension.layer.geoJson(brotesLayer,{duration:"P3M"}).addTo(map);
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