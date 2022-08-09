var map = L.map('map',
    {
    timeDimension: true,
    timeDimensionOptions: {
        timeInterval: "2021-09-30/2022-10-30",
        period: "PT1H"
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


//TIME LAYER
// var wmsUrl = "https://thredds.socib.es/thredds/wms/observational/hf_radar/hf_radar_ibiza-scb_codarssproc001_aggregation/dep0001_hf-radar-ibiza_scb-codarssproc001_L1_agg.nc"
// var wmsLayer = L.tileLayer.wms(wmsUrl, {
//     layers: 'sea_water_velocity',
//     format: 'image/png',
//     transparent: true,
//     attribution: 'SOCIB HF RADAR | sea_water_velocity'
// });

// // Create and add a TimeDimension Layer to the map
// var tdWmsLayer = L.timeDimension.layer.wms(wmsLayer);
// tdWmsLayer.addTo(map);
// console.log(tdWmsLayer);


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

function getColor(alerta) {
    var riesgo = alerta[map.timeDimension._currentTimeIndex];
    return riesgo > 4  ? '#000000' :
           riesgo > 3  ? '#ff0000' :
           riesgo > 2  ? '#ff6000' :
           riesgo > 1  ? '#ffb400' :
           riesgo > 0  ? '#fff555' :
                         '#ffffff';
}



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
//                COMARCAS              //
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
        getJSON('https://raw.githubusercontent.com/influenzaAviar/applicacionWeb/main/GeoJSON/alertas.geojson',  function(err, data) {

            if (err != null) {
                console.error(err);
            } else {
                alertasJSON = data;
                alertasLayer = L.geoJson(alertasJSON);

                // for(var i = 0; i < alertasJSON.features.length; i++){
                //     const alerta = alertasJSON.features[i].properties;
                //     for(var j = 0; j < comarcasJSON.features.length; j++){
                //         var comarca = comarcasJSON.features[j].properties;
                //         comarca.alertas = [];
                //         if(alerta.comarca === comarca.comarca){ 
                //             var riesgo = alerta.Riesgo;
                //             var reportDate = alerta.reportDate;
                //             console.log(riesgo + ' ' + reportDate);
                //             comarca.alertas.push([{'ReportDate': reportDate,'Riesgo' : riesgo}]);
                //         }
                //     }
                // }

                for(var j = 0; j < comarcasJSON.features.length; j++){
                    var comarca = comarcasJSON.features[j].properties;
                    comarca.alertas = {};
                    for(var i = 0; i < alertasJSON.features.length; i++){
                        const alerta = alertasJSON.features[i].properties;
                        if(alerta.comarca === comarca.comarca){ 
                            var riesgo = alerta.Riesgo;
                            var reportDate = alerta.reportDate;
                            comarca.alertas[reportDate] = riesgo;
                            var d = new Date(reportDate);
                            console.log(d);
                        }
                    }
                
                }

                
                comarcasLayer = L.geoJson(comarcasJSON,{style:styleAlertas,onEachFeature: onEachFeature}).addTo(map);
            }
        });
    }
    console.log("************************************************************");
  
});

var styleComarcas = {
    fillColor: '#ffffff',
    // fillOpacity: 0.9,
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
    'Fecha: ' + map.timeDimension._currentTimeIndex
    ) +
    '</p>';
       
    else
        this._div.innerHTML = '';
};

info.addTo(map);



//////////////////////////////////////////
//                ALERTAS               //
//////////////////////////////////////////

function styleAlertas(feature) {
    return{
        fillColor: getColor(feature.properties.alertas),
        fillOpacity: 0.4,
        weight: 0.4,
        opacity: 1,
        color: '#000000',
        dashArray: '1'    
    }
}

