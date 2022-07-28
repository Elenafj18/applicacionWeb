var map = L.map('map').
     setView([41.66, -4.72],
     4);

     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
L.control.scale().addTo(map);

/// DEFINICIÓN DEL LAS COMARCAS GANADERAS


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
// popupTemplate: {
// 	title: "Comarca: {comarca}," +
// 		"<br>Provincia: {provincia}" +
// 		"<br>Comunidad Autónoma: {comAutonoma}</br>",
// 	content: getInfoComarcas,
// 	visible: false,
// 	returnGeometry: true,
// },
// success: function(response) {
// 	visualizer.sendDataToMap(response, styleComarcas);
// },
// error:function(error) {
// }
		
});

console.log(layerComarcas.responseJSON.features[0].properties.comarca);
    
   