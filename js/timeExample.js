var timeSeriesGeoJSON =
   {"features": [
       { "type": "Feature", "id": -1549271008, "properties": { "id": 827793, "time": "2006-03-11T08:00:00", "insol": 61.73542 }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 39.151222675648221, 34.199670805202523 ], [ 39.151222675712766, 34.199675276071595 ], [ 39.151228272367668, 34.199675276015682 ], [ 39.151228272302838, 34.199670805146624 ], [ 39.151222675648221, 34.199670805202523 ] ] ] } },
       { "type": "Feature", "id": -1549271008, "properties": { "id": 827794, "time": "2006-03-11T09:00:00", "insol": 161.73542 }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 39.151222675648221, 34.199670805202523 ], [ 39.151222675712766, 34.199675276071595 ], [ 39.151228272367668, 34.199675276015682 ], [ 39.151228272302838, 34.199670805146624 ], [ 39.151222675648221, 34.199670805202523 ] ] ] } }
     ],
    "type":"FeatureCollection"
   };

var map = L.map('map').fitBounds([[34.1995508059065,39.151200914031406],[34.199696966261726,39.15145937135462]]);

var timeDimension = new L.TimeDimension({
        period: "PT1H",
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

function getColor(d) {
    return d > 420 ? 'rgba(215,25,28,1.0)' :
        d > 360  ? 'rgba(237,110,67,1.0)' :
        d > 300  ? 'rgba(254,186,110,1.0)' :
        d > 240  ? 'rgba(255,232,164,1.0)' :
        d > 180   ? 'rgba(231,245,203,1.0)' :
        d > 120   ? 'rgba(183,223,227,1.0)' :
        d > 60   ? 'rgba(117,177,211,1.0)' :
              'rgba(44,123,182,1.0)';
  }

function style(feature) {
    return {
      weight: 2,
      opacity: 1,
      color: 'rgba(35,35,35,1.0)',
      dashArray: '',
      fillOpacity: 1,
      fillColor: getColor(feature.properties.insol)
    };
  }

var timeSeriesLayer = L.geoJSON(timeSeriesGeoJSON, {style: style});

var geojson = L.timeDimension.layer.geoJson(timeSeriesLayer);

geojson.addTo(map);

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

  var div = L.DomUtil.create('div', 'info legend'),
    grades = [0, 60, 120, 180, 240, 300, 360, 420],
    labels = ['Values in Wh/m<sup>2</sup>'],
    from, to;

  for (var i = 0; i < grades.length; i++) {
    from = grades[i];
    to = grades[i + 1];

    labels.push(
      '<i style="background:' + getColor(from + 1) + '"></i> ' +
      from + (to ? '&ndash;' + to : '+'));
  }

  div.innerHTML = labels.join('<br>');
  return div;
};

legend.addTo(map);