var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
console.log(date);
var timeInterval = today.getFullYear()+'-'+(today.getMonth()-3)+'-'+today.getDate() + '/' + today;
var map = L.map('map',
    {
    timeDimension: true,
    timeDimensionOptions: {
        timeInterval: timeInterval,
        // period: "PT1H"
        period: "P1W",
        currentTime : date
    },
    timeDimensionControl: true,}
    ).setView([44.87, 10],5);  
    
L.control.scale().addTo(map);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

//L.marker([41.66, -4.71],{draggable: true}).addTo(map);

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
    var risk3 =L.easyButton('<a style="width:4rem;>Riesgo 3</a>',function(){alert('Riesgo 3');}).addTo(map);
    var risk4 =L.easyButton('<a style="width:4rem;>Riesgo 4</a>',function(){alert('Riesgo 4');}).addTo(map);
    var risk5 =L.easyButton('<a style="width:4rem;">Riesgo 5</a>',function(){alert('Riesgo 5');}).addTo(map);
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
    '<br/>' +
    (props.Riesgo ? 'Riesgo: ' + props.alertas[map.timeDimension._currentTimeIndex] : 'Sin riesgo' +
    '<br/>' +
    'Fecha: ' + new Date(map.timeDimensionControl._currentTimeIndex)
    ) +
    '</p>';
       
    else
        this._div.innerHTML = '';
};

info.addTo(map);



//////////////////////////////////////////
//                ALERTAS               //
//////////////////////////////////////////

var alertasJSON2 = {"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [-5.77235268948, 43.5350333797]}, "properties": {"idAlerta": "SP33024_1623020400000.0", "Riesgo": 2, "reportDate": 1623020400000.0, "comarca": "GIJON", "informe": "https://drive.google.com/file/d/1Jz5kXOwiRxsr6Gww1lEcpZPdjdB3HUdD/view?usp=drivesdk"}}, {"type": "Feature", "geometry": {"type": "Point", "coordinates": [-5.7870971929, 37.1010126053]}, "properties": {"idAlerta": "SP41095_1623020400000.0", "Riesgo": 4, "reportDate": 1623020400000.0, "comarca": "UTRERA (BAJO GUADALQUIVIR)", "informe": "https://drive.google.com/file/d/1Jz5kXOwiRxsr6Gww1lEcpZPdjdB3HUdD/view?usp=drivesdk"}}, {"type": "Feature", "geometry": {"type": "Point", "coordinates": [-5.79556384981, 38.9607991582]}, "properties": {"idAlerta": "SP06044_1623020400000.0", "Riesgo": 2, "reportDate": 1623020400000.0, "comarca": "DON BENITO", "informe": "https://drive.google.com/file/d/1Jz5kXOwiRxsr6Gww1lEcpZPdjdB3HUdD/view?usp=drivesdk"}}, {"type": "Feature", "geometry": {"type": "Point", "coordinates": [-6.57022157408, 37.1574501172]}, "properties": {"idAlerta": "SP21005_1623020400000.0", "Riesgo": 4, "reportDate": 1623020400000.0, "comarca": "ALMONTE (ENTORNO DE DOÑANA)", "informe": "https://drive.google.com/file/d/1Jz5kXOwiRxsr6Gww1lEcpZPdjdB3HUdD/view?usp=drivesdk"}}]};
alertasLayer = L.geoJson(alertasJSON2);
L.timeDimension.layer.geoJson(alertasLayer, {style:styleAlertas}).addTo(map);

// getJSON('https://raw.githubusercontent.com/influenzaAviar/applicacionWeb/main/GeoJSON/alertas.geojson',  function(err, data) {

//     if (err != null) {
//         console.error(err);
//     } else {
//         alertasJSON = data;
//         alertasLayer = L.geoJson(alertasJSON);

//         L.timeDimension.layer.geoJson(alertasLayer).addTo(map);
//     }
// });


function styleAlertas(feature) {
    return{
        fillColor: getColor(feature.properties.Riesgo),
        fillOpacity: 0.4,
        weight: 0.4,
        opacity: 1,
        color: '#666' 
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);
}
function resetHighlightMigration(e) {
    migrationsLayer.resetStyle(e.target);
    info.update();
}
function onEachFeatureMigration(feature, layer) {
    layer.on({
        mouseover: highlightFeatureMigration,
        mouseout: resetHighlightMigration
    });
}

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'infoComarcas'); // create a div with a class "info"
    this.update();
    return this._div;
};

//INFORMACIÓN DE ESPECIE POR RUTA
info.update = function (props) {
    if(props)
    this._div.innerHTML = '<h4><b> Información migratoria: </b></h4> <p> Especie: '+ props.species + '</p>';       
    else
        this._div.innerHTML = '';
};



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