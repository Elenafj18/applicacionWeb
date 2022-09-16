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
    if(rutasOn){
        map.removeLayer(rutasLayer);
        rutasOn = false;
    }
    else{
        map.addLayer(rutasLayer);
        rutasOn = true;
    }
  }).addTo(map);

var migrationsOn = false;
L.easyButton( '<img src="img/migrations.svg" style="width:16px" title="Todas las rutas">', function(){
    if(migrationsOn){
        map.removeLayer(migrationsLayer);
        migrationsOn = false;
    }
    else{
        map.addLayer(migrationsLayer);
        migrationsOn = true;
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

getJSON('../GeoJSON/comarcas.geojson',  function(err, data) {

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
    this._div = L.DomUtil.create('div', 'infoComarcas');
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
//            RUTAS DE RIESGO           //
//////////////////////////////////////////

var rutasJSON;
getJSON('../GeoJSON/rutas.geojson',  function(err, data) {
    if (err != null) {
        console.error(err);
    } else {
        rutasJSON = data;
        // rutasLayer = L.geoJSON(rutasJSON, {style:styleRutas, onEachFeature:onEachFeatureRutas });
    }
});

var styleRutas = {
    weight: 1,
    opacity: 0.3,
    color: '#f00'
}

var rutasLayer = L.geoJSON(rutasJSON,{style:styleRutas});



function clickOnAlert(e) {    
    
    var alerta = e.target;
    console.log(alerta.feature.properties.idAlerta);
    if(!alerta.feature.showrutasOn){
        alerta.feature.rutas = [];
        for(var i = 0; i < rutasJSON.features.length; i++){
            if(alerta.feature.properties.idAlerta === rutasJSON.features[i].properties.idAlerta){
                var ruta = rutasJSON.features[i];
                alerta.feature.rutas.push(L.geoJSON(ruta, {style:styleRutas}).addTo(map));
                alerta.feature.showrutasOn = true;
            }
        }
    }else{
        for(var i = 0; i < alerta.feature.rutas.length; i++)
            map.removeLayer(alerta.feature.rutas[i]);
        alerta.feature.showrutasOn = false;
    }
    
}





//////////////////////////////////////////
//                ALERTAS               //
//////////////////////////////////////////

var riesgo1layer, riesgo2layer, riesgo3layer, riesgo4layer, riesgo5layer;

getJSON('../GeoJSON/alertas.geojson',  function(err, data) {

    if (err != null) {
        console.error(err);
    } else {

        alertasJSON = data;
        for(var i = 0; i < alertasJSON.features.length; i++){
            var d = new Date(alertasJSON.features[i].properties.reportDate);
            alertasJSON.features[i].properties.time = d.getFullYear()+'/'+(d.getMonth()+1)+'/'+d.getDate();
        }      

        //Layer con alertas de nivel 1
        var riesgo1filter = L.geoJson(alertasJSON, {tags: ['Nivel 1'], filter: riesgo1fun,
            pointToLayer: function(feature,latlng){
                // return L.marker(latlng,{icon: logoMarker(feature)}).bindPopup('<p style="bottom:-75px">Nivel de alerta: '+ feature.properties.Riesgo +'</p><a class="infoAlerta info" href='+ feature.properties.informe+'> Más información </a>');
                return L.marker(latlng,{icon: logoMarker(feature)}).bindPopup('<p>Nivel de alerta: '+ feature.properties.Riesgo +'</p><a class="infoAlerta info" href='+ feature.properties.informe+'> Más información </a>').on('click', clickOnAlert);

        }});
        function riesgo1fun(feature) { if (feature.properties.Riesgo === 1) return true; }
        riesgo1 = L.timeDimension.layer.geoJson(riesgo1filter,{duration:"P1W"}).addTo(map);

        //Layer con alertas de nivel 2
        var riesgo2filter = L.geoJson(alertasJSON, {tags: ['Nivel 2'], filter: riesgo2fun,
            pointToLayer: function(feature,latlng){
                return L.marker(latlng,{icon: logoMarker(feature)}).bindPopup('<p>Nivel de alerta: '+ feature.properties.Riesgo +'</p><a class="infoAlerta info" href='+ feature.properties.informe+'> Más información </a>').on('click', clickOnAlert);
        }});
        function riesgo2fun(feature) { if (feature.properties.Riesgo === 2) return true; }
        riesgo2 = L.timeDimension.layer.geoJson(riesgo2filter,{duration:"P1W", tags: ['riesgo2'] }).addTo(map);

        //Layer con alertas de nivel 3
        var riesgo3filter = L.geoJson(alertasJSON, {tags: ['Nivel 3'], filter: riesgo3fun,
            pointToLayer: function(feature,latlng){
                return L.marker(latlng,{icon: logoMarker(feature)}).bindPopup('<p>Nivel de alerta: '+ feature.properties.Riesgo +'</p><a class="infoAlerta info" href='+ feature.properties.informe+'> Más información </a>').on('click', clickOnAlert);
        }});
        function riesgo3fun(feature) { if (feature.properties.Riesgo === 3) return true; }
        riesgo3 = L.timeDimension.layer.geoJson(riesgo3filter,{duration:"P1W", tags: ['riesgo3'] }).addTo(map);

        //Layer con alertas de nivel 4
        var riesgo4filter = L.geoJson(alertasJSON, {tags: ['Nivel 4'], filter: riesgo4fun,
            pointToLayer: function(feature,latlng){
                return L.marker(latlng,{icon: logoMarker(feature)}).bindPopup('<p>Nivel de alerta: '+ feature.properties.Riesgo +'</p><a class="infoAlerta info" href='+ feature.properties.informe+'> Más información </a>').on('click', clickOnAlert);
        }});
        function riesgo4fun(feature) { if (feature.properties.Riesgo === 4) return true; }
        riesgo4 = L.timeDimension.layer.geoJson(riesgo4filter,{duration:"P1W", tags: ['riesgo4'] }).addTo(map);

        //Layer con alertas de nivel 5
        var riesgo5filter = L.geoJson(alertasJSON, {tags: ['Nivel 5'], filter: riesgo5fun,
            pointToLayer: function(feature,latlng){
                return L.marker(latlng,{icon: logoMarker(feature)}).bindPopup('<p>Nivel de alerta: '+ feature.properties.Riesgo +'</p><a class="infoAlerta info" href='+ feature.properties.informe+'> Más información </a>').on('click', clickOnAlert);
        }});
        function riesgo5fun(feature) { if (feature.properties.Riesgo === 5) return true; }
        riesgo5 = L.timeDimension.layer.geoJson(riesgo5filter,{duration:"P1W", tags: ['riesgo5'] }).addTo(map);
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
getJSON('../GeoJSON/migrations.geojson',  function(err, data) {
    if (err != null) {
        console.error(err);
    } else {
        migrationsJSON = data;
        migrationsLayer = L.geoJSON(migrationsJSON, {style:styleMigrations, onEachFeature:onEachFeatureMigration });
    }
});

var styleMigrations = {
    weight: 1,
    opacity: 0.3,
    color: '#fff' 
}

function highlightFeatureMigration(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 1,
        opacity: 1,
        color: '#666' 
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    info.updateM(layer.feature.properties);
}
function resetHighlightMigration(e) {
    migrationsLayer.resetStyle(e.target);
    info.updateM();
}
function onEachFeatureMigration(feature, layer) {
    layer.on({
        mouseover: highlightFeatureMigration,
        mouseout: resetHighlightMigration
    });
}

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'infoComarcas');
    this.update();
    return this._div;
};

//INFORMACIÓN DE ESPECIE POR RUTA
info.updateM = function (props) {
    if(props)
    this._div.innerHTML = '<h4><b> Información migratoria: </b></h4> <p> Especie: '+ props.species + '</p>';       
    else
        this._div.innerHTML = '';
};



//////////////////////////////////////////
//                BROTES                //
//////////////////////////////////////////

var brotesJSON, brotesLayer;

function clickOnOutbreak(e) {    
    
    var brote = e.target;
    console.log(brote.feature.properties.id);
    if(!brote.feature.showrutasOn){
        brote.feature.rutas = [];
        for(var i = 0; i < rutasJSON.features.length; i++){
            if(brote.feature.properties.id === rutasJSON.features[i].properties.idBrote){
                var ruta = rutasJSON.features[i];
                brote.feature.rutas.push(L.geoJSON(ruta, {style:styleRutas}).addTo(map));
                brote.feature.showrutasOn = true;
            }
        }
    }else{
        for(var i = 0; i < brote.feature.rutas.length; i++)
            map.removeLayer(brote.feature.rutas[i]);
        brote.feature.showrutasOn = false;
    }
    
}

getJSON('../GeoJSON/brotes.geojson',  function(err, data) {

    if (err != null) {
        console.error(err);
    } else {
        brotesJSON = data;
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

                return L.marker(latlng,{icon: broteIcon}).bindPopup('<p> Especie: '+ especie + ' <br> Nº Casos: '+ nCasos + ' <br> Serotipo: '+ serotipo + ' <br> País: '+ pais + ' <br> Ciudad: '+ ciudad +' </p>').on('click', clickOnOutbreak);
            }});
        L.timeDimension.layer.geoJson(brotesLayer,{duration:"P3M"}).addTo(map);
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




