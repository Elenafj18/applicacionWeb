require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/GeoJSONLayer",
    "esri/widgets/TimeSlider",
    "esri/widgets/Expand",
    "esri/widgets/Legend",
    "esri/widgets/BasemapGallery",
    "esri/widgets/Home",
    "esri/tasks/support/Query",
    "esri/core/Handles",
    "esri/widgets/Feature",
    "esri/Graphic",
    "esri/widgets/Search",
    "esri/widgets/ScaleBar",
    "esri/widgets/Popup",
    "esri/views/SceneView",
    "esri/renderers/UniqueValueRenderer",
    "esri/symbols/LineSymbol3DLayer",
    "esri/symbols/LineSymbol3D",
    "esri/renderers/SimpleRenderer",
    "dojo/domReady!"

], function (
    Map,
    MapView,
    GeoJSONLayer,
    TimeSlider,
    Expand,
    Legend,
    BasemapGallery,
    Home,
    Query,
    Handles,
    Feature,
    Graphic,
    Search,
    ScaleBar,
    Popup,
    SceneView,
    UniqueValueRenderer,
    LineSymbol3DLayer,
    LineSymbol3D,
    SimpleRenderer
) {

    let layerViewBrotes;

    /// DEFINICIÓN DEL LOS BROTES

    const layerBrotes = new GeoJSONLayer({
        url:
            "https://raw.githubusercontent.com/influenzaAviar/applicacionWeb/main/GeoJSON/brotes.geojson",

        copyright: "INIA-CSIC",
        title: "Brotes",
        outFields: ['*'],
        visible: true,
        timeInfo: {
            startField: "observationDate",
            interval: {
                unit: "days",
                value: 1
            }
        },
        renderer: {
            type: "simple",
            symbol: {
                type: "simple-marker",
                color: [255, 0, 0, 0.5],
                outline: null
            },
            visualVariables: [
                {
                    type: "size",
                    field: "cases",
                    stops: [
                        {
                            value: 60,
                            size: "15px"
                        },
                        {
                            value: 600,
                            size: "20px"
                        },
                        {
                            value: 6000,
                            size: "40px"
                        }
                    ]
                },
            ]
        },


        supportsQuery: true,
        popupTemplate: {
            title: "Pais: {country}",
            content: getInfoBrotes,
            visible: false,
            returnGeometry: true,
            fieldInfos: [
                {
                    fieldName: 'observationDate',
                    format: {
                        dateFormat: 'short-date'
                    }
                }
            ],
        },
    })

    /// ESTA FUNCIÓN PROGRAMA EL POPUPTEMPLATE
    function getInfoBrotes(feature) {
        /*  view.graphics.removeAll() */

        var graphic, attributes, content;

        graphic = feature.graphic;
        attributes = graphic.attributes;

        var urlRutas = 'https://raw.githubusercontent.com/influenzaAviar/applicacionWeb/main/GeoJSON/rutas.geojson';
        // Se inicia la peticion ajax a la url ruta
        var request = new XMLHttpRequest();
        request.open("GET", urlRutas, false); // false for synchronous request
        request.send(null);

        let rutas = JSON.parse(request.responseText)

        console.log('obj ruta', rutas)

        for (let index = 0; index < rutas.features.length; index++) {
            const element = rutas.features[index];
            console.log('element', element)
            if (element.properties.idBrote == attributes.id) {
                var polyline = {
                    type: "polyline", // new Polyline()
                    paths: element.geometry.coordinates
                };

                var lineSymbol = {
                    type: "simple-line", // new SimpleLineSymbol()
                    color: [255, 51, 51, 0.99], // RGB color values as an array
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

        });

        content = "<p>Número de casos: <b>{cases}</b> " +
            "<ul><li>Localización: {city}, {country}.</li>" +
            "<li>Fecha del informe: {observationDate}.</li>" +
            "<li>Especie: {species}.</li>" +
            "<li>Serotipo: {serotipo}.</li>" +
            "<li>Más información: <a href='http://empres-i.fao.org/eipws3g/2/obd?idOutbreak={id}'> Enlace</a></li>";

        return content;

    }


    /// DEFINICIÓN DEL LOS ALERTAS
    let layerViewAlertas;

    var layerAlertas = new GeoJSONLayer({
        url:
            "https://raw.githubusercontent.com/influenzaAviar/applicacionWeb/main/GeoJSON/alertas.geojson",

        copyright: "UCM",
        title: "Alertas",
        outFields: ['*'],
        visible: true,
        timeInfo: {
            startField: "reportDate",

        },

        renderer: {
            type: "simple",
            field: "Riesgo",

            symbol: {
                type: "simple-marker",
                label: "Nivel de riesgo",
                style: "triangle",
                size: "10px",
                outline: null,
            },

            label: "Nivel de riesgo",
            visualVariables: [

                {
                    type: "color",
                    field: "Riesgo",
                    stops: [
                        {
                            value: 1,
                            color: [255, 150, 150, 0.6],
                            label: "1"
                        }, {
                            value: 2,
                            color: [255, 120, 120, 0.6],
                            label: "2"
                        },
                        {
                            value: 3,
                            color: [255, 80, 80, 0.6],
                            label: "3"
                        },
                        {
                            value: 4,
                            color: [255, 40, 40, 0.6],
                            label: "4"
                        },
                        {
                            value: 5,
                            color: [255, 0, 0, 0.6],
                            label: "5"
                        }
                    ]
                },
                
            ],

        },



        supportsQuery: true,
        popupTemplate: {
            title: "Nivel de alerta: {Riesgo}" + " Fecha: {reportDate}" + "<a href='{informe}'></a>",
            content: getInfoAlertas,
            visible: false,
            returnGeometry: true,
            fieldInfos: [
                {
                    fieldName: 'reportDate',
                    format: {
                        dateFormat: 'short-date'
                    }
                }
            ],
        },

    })

    function getInfoAlertas(feature) {

        var graphic, attributes, content;

        graphic = feature.graphic;
        attributes = graphic.attributes;

        var urlRutas = 'https://raw.githubusercontent.com/influenzaAviar/applicacionWeb/main/GeoJSON/rutas.geojson';
        // Se inicia la peticion ajax a la url ruta
        var request = new XMLHttpRequest();
        request.open("GET", urlRutas, false); // false for synchronous request
        request.send(null);

        let rutas = JSON.parse(request.responseText)

        console.log('obj ruta', rutas)

        for (let index = 0; index < rutas.features.length; index++) {
            const element = rutas.features[index];
            console.log('element', element)
            if (element.properties.idAlerta == attributes.idAlerta) {
                var polyline = {
                    type: "polyline", // new Polyline()
                    paths: element.geometry.coordinates
                };

                var lineSymbol = {
                    type: "simple-line", // new SimpleLineSymbol()
                    color: [255, 51, 51, 0.8], // RGB color values as an array
                    width: 1
                };

                var polylineGraphic = new Graphic({
                    geometry: polyline, // Add the geometry created in step 4
                    symbol: lineSymbol, // Add the symbol created in step 5
                });

                view.graphics.add(polylineGraphic);

            }

        }

        view.on("hold", function (alert) {
            view.graphics.removeAll(polylineGraphic);
            console.log("Remove")

        });

        content = "Comarca: {comarca}" +
            "<li><a href={informe}> Informe </a></li>";

        return content;

    }

    var lineSymbolRutas = new LineSymbol3D({
        symbolLayers: [
            new LineSymbol3DLayer({
                material: { color: [255, 51, 51, 0.3] },
                size: 0.1
            })
        ]
    });


    var rendererRutas = new SimpleRenderer({

        symbol: lineSymbolRutas

    });

    /// DEFINICIÓN DEL LOS RUTA MIGRATORIA
    const layerRutaM = new GeoJSONLayer({
        url: "https://raw.githubusercontent.com/influenzaAviar/applicacionWeb/main/GeoJSON/rutas.geojson",
        copyright: "Influenza Aviar",
        title: "Rutas activadas por riesgo",
        outFields: ["*"],
        renderer: rendererRutas,

        popupTemplate: {
            title: "Id Alerta de la ruta: {idAlerta}",
        },
        visible: false,
        availableFields: true,
    });

    $(document).ready(function () {
        $(function () {
            document.getElementById("ruta").addEventListener("click", activarRutas);

            view.ui.add(ruta, "top-right");
        })
    })

    function activarRutas(feature) {
        if (layerRutaM.visible === false) {
            return layerRutaM.visible = true;
        } else {
            return layerRutaM.visible = false;
        }

    }

    var lineSymbolMigrations = new LineSymbol3D({
        symbolLayers: [
            new LineSymbol3DLayer({
                material: { color: [237, 237, 237, 0.3] },
                size: 0.1
            })
        ]
    });


    var rendererMigrations = new SimpleRenderer({

        symbol: lineSymbolMigrations

    });

    /// DEFINICIÓN DEL LOS RUTA MIGRATORIA
    const layermigrations = new GeoJSONLayer({
        url: "https://raw.githubusercontent.com/influenzaAviar/applicacionWeb/main/GeoJSON/migrations.geojson",
        copyright: "UCM",
        title: "Todas las rutas",
        outFields: ["*"],
        renderer: rendererMigrations,
        popupTemplate: {
            title: "Especie: {species}",
        },
        visible: false,
        availableFields: true,
    });

    window.onload = function () {
        document.getElementById("migrations").addEventListener("click", activarMigrations);

        view.ui.add(migrations, "top-right");

    }



    function activarMigrations(feature) {
        if (layermigrations.visible === false) {
            return layermigrations.visible = true;
        } else {
            return layermigrations.visible = false;
        }

    }





    /// DEFINICIÓN DEL LOS COMARCAS GANADERAS
    let layerViewComarcas;

    const layerComarcas = new GeoJSONLayer({
        url:
            "https://raw.githubusercontent.com/influenzaAviar/applicacionWeb/main/GeoJSON/comarcas.geojson",
        copyright: "CERBU",
        title: "Comarcas",
        outFields: ['*'],
        visible: true,
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
        supportsQuery: true,
        popupTemplate: {
            title: "Comarca: {comarca}," +
                "<br>Provincia: {provincia}" +
                "<br>Comunidad Autónoma: {comAutonoma}</br>",
            content: getInfoComarcas,
            visible: false,
            returnGeometry: true,
        },


    });

    /// ESTA FUNCIÓN PROGRAMA EL POPUPTEMPLATE
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
    /// INICIALIZACIÓN DEL MAPA

    const map = new Map({
        basemap: "dark-gray-vector",
        /* ground: "world-elevation", */
        layers: [layerComarcas, layerBrotes, layerAlertas, layerRutaM, layermigrations]
    });

    const view = new SceneView({
        map: map,
        container: "viewDiv",
        /* zoom: 3.5,
        center: [20.68, 41.68], */

        camera: {
            position: {
                latitude: 7.00000,
                longitude: 22.00000,
                z: 7034560
            },
            tilt: 16.5,
            heading: 1
        },


        highlightOptions: {
            color: "cyan"
        }

    });

    view.constraints = {

        minScale: 147000000
    };

    /// filtro de alertas por riesgo


    const RiesgosNodes = document.querySelectorAll(`.Riesgo-item`);
            const RiesgosElement = document.getElementById("Riesgos-filter");

            console.log(RiesgosNodes);
            console.log(RiesgosElement);

            // click event handler for Riesgos choices
            RiesgosElement.addEventListener("click", filterByRiesgo);

            // User clicked on Winter, Spring, Summer or Fall
            // set an attribute filter on flood warnings layer view
            // to display the warnings issued in that Riesgo
            function filterByRiesgo(event) {
                const selectedRiesgo = event.target.getAttribute("data-Riesgo");
                layerViewAlertas.filter = {
                    where: "Riesgo = " + selectedRiesgo + ""
                };

                console.log(selectedRiesgo);
                console.log(layerViewAlertas.filter);

            }

            view.whenLayerView(layerAlertas).then((layerView) => {
                // flash flood warnings layer loaded
                // get a reference to the flood warnings layerview
                layerViewAlertas = layerView;

                // set up UI items
                RiesgosElement.style.visibility = "visible";
                const RiesgosExpand = new Expand({
                    view: view,
                    expandTooltip: "Nivel de riesgo",
                    content: RiesgosElement,
                    expandIconClass: "esri-icon-filter",
                    group: "top-right"
                });
                //clear the filters when user closes the expand widget
                RiesgosExpand.watch("expanded", () => {
                    if (!RiesgosExpand.expanded) {
                        layerViewAlertas.filter = null;
                    }
                });
                view.ui.add(RiesgosExpand, "top-right");
            });



    // Agregar la leyenda
    const legendExpand = new Expand({
        collapsedIconClass: "esri-icon-legend",
        expandIconClass: "esri-icon-legend",
        expandTooltip: "Legend",
        view: view,
        content: new Legend({
            view: view
        }),
        expanded: false
    });
    view.ui.add(legendExpand, "top-left");


    //// SCALEBAR

    var scaleBar = new ScaleBar({
        view: view,
        unit: "metric",
        estilo: "line",
    });
    // Add widget to the bottom left corner of the view
    view.ui.add(scaleBar, {
        position: "bottom-right",

    });

    /// SEARCH WIDGET
    var searchWidget = new Search({
        view: view
    });
    // Add the search widget to the top right corner of the view
    view.ui.add(searchWidget, {
        position: "top-right"
    });

    /// WIDGET DE MAPAS BASES

    var basemapGallery = new BasemapGallery({
        view: view,
        container: document.createElement("div")
    });


   



    ///TIMESLIDER DE BROTES

    const timeSliderBrotes = new TimeSlider({
        container: "timeSliderBrotes",
        // la propiedad "playRate" del widgetb es el tiempo (en milisegundos) entre los pasos de la animación. Este valor predeterminado es 1000. 
        playRate: 100,
        view: layerBrotes,
        stops: {
            interval: {
                value: 1,
                unit: "days"
            }
        }
    });
    view.ui.add(timeSliderBrotes, "manual");

    // espera hasta que se cargue la vista de capa
    view.whenLayerView(layerBrotes).then(function (lv) {
        layerViewBrotes = lv;

        // hora de inicio del control deslizante de tiempo
        const startBrotes = new Date();
        startBrotes.setHours(0, 0, 0, 0);
        startBrotes.setDate(startBrotes.getDate() + (7 - startBrotes.getDay() - 6));
        startBrotes.setDate(startBrotes.getDate() - 455);

        const LastMonday = new Date();
        LastMonday.setHours(0, 0, 0, 0);
        LastMonday.setDate(LastMonday.getDate() + (7 - LastMonday.getDay() - 6));

        // set time slider's full extent to
        // until end date of layer's fullTimeExtent
        timeSliderBrotes.fullTimeExtent = {
            start: startBrotes,
            end: LastMonday
        };
        const endBrotes = new Date(LastMonday);
        endBrotes.setDate(endBrotes.getDate() - 91);

        timeSliderBrotes.values = [endBrotes, LastMonday];
    });


    timeSliderBrotes.watch("timeExtent", function () {
        layerBrotes.definitionExpression =
            "observationDate <= " + timeSliderBrotes.timeExtent.end.getTime();
        layerViewBrotes.effect = {
            filter: {
                timeExtent: timeSliderBrotes.timeExtent,
                geometry: view.extent
            },
            /* excludedEffect: "grayscale(20%) opacity(12%)" */
        };

        /// ESTADISTICAS DE LOS BROTES
        const statQuery = layerViewBrotes.effect.filter.createQuery();
        statQuery.outStatistics = [
            magMax,
            magAvg,
            magMin,
            tremorCount
            /* avgDepth */
        ];

        layerBrotes
            .queryFeatures(statQuery)
            .then(function (result) {
                let htmls = [];
                statsDiv.innerHTML = "";
                if (result.error) {
                    return result.error;
                } else {
                    if (result.features.length >= 1) {
                        const attributes = result.features[0].attributes;
                        for (name in statsFields) {
                            if (attributes[name] && attributes[name] != null) {
                                const html =
                                    "<br/>" +
                                    statsFields[name] +
                                    ": <b><span> " +
                                    attributes[name].toFixed(2) +
                                    "</span></b>";
                                htmls.push(html);
                            }
                        }
                        const yearHtml =
                            "<span>" +
                            result.features[0].attributes["tremor_count"] +
                            "</span> Brotes " +
                            timeSliderBrotes.timeExtent.start.toLocaleDateString() +
                            " - " +
                            timeSliderBrotes.timeExtent.end.toLocaleDateString() +
                            ".<br/>";

                        if (htmls[0] == undefined) {
                            statsDiv.innerHTML = yearHtml;
                        } else {
                            statsDiv.innerHTML =
                                yearHtml + htmls[0] + htmls[1] + htmls[2];
                        }
                    }
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    });

    /* const avgDepth = {
        onStatisticField: "deaths",
        outStatisticFieldName: "Average_depth",
        statisticType: "count"
    }; */

    const magMax = {
        onStatisticField: "cases",
        outStatisticFieldName: "Max_magnitude",
        statisticType: "max"
    };

    const magAvg = {
        onStatisticField: "cases",
        outStatisticFieldName: "Average_magnitude",
        statisticType: "avg"
    };

    const magMin = {
        onStatisticField: "cases",
        outStatisticFieldName: "Min_magnitude",
        statisticType: "min"
    };

    const tremorCount = {
        onStatisticField: "cases",
        outStatisticFieldName: "tremor_count",
        statisticType: "count"
    };

    const statsFields = {
        Max_magnitude: "Max cases",
        Average_magnitude: "Average cases",
        Min_magnitude: "Min cases"
        /* Average_depth: "Deaths" */
    };


    /// BOTON EXPANDIBLE DE INFO BROTES

    const statsDiv = document.getElementById("statsDiv");
    const infoDiv = document.getElementById("infoDiv");
    const infoDivExpand = new Expand({
        collapsedIconClass: "esri-icon-documentation",
        expandIconClass: "esri-icon-documentation",
        expandTooltip: "Info brotes",
        view: view,
        content: infoDiv,
        expanded: false
    });
    view.ui.add(infoDivExpand, "top-left");

    ///TIMESLIDER DE ALERTAS
    // crea un nuevo widget de control deslizante de tiempo
    //establecer otras propiedades cuando se carga la vista de capa
    // por defecto timeSlider.mode es "time-window" - muestra
    // los datos caen dentro del rango de tiempo
    view.when(function () {
        let timeSliderAlertas = new TimeSlider({
            container: "timeSliderAlertas",
            view: layerAlertas,
            playRate: 1000,
            stops: {
                interval: {
                    value: 1,
                    unit: "weeks"
                }
            }
        });



        view.ui.add(timeSliderAlertas, "manual");

        // espera hasta que se cargue la vista de capa
        view.whenLayerView(layerAlertas).then(function (lv) {
            layerViewAlertas = lv;

            /// hora de inicio del control deslizante de tiempo

            const startAlerta = new Date();
            startAlerta.setHours(0, 0, 0, 0);
            startAlerta.setDate(startAlerta.getDate() + (7 - startAlerta.getDay() - 1) % 7 + 1);
            startAlerta.setDate(startAlerta.getDate() - 364);

            const nextSunday = new Date();
            nextSunday.setHours(0, 0, 0, 0);
            nextSunday.setDate(nextSunday.getDate() + (7 - nextSunday.getDay() - 1) % 7 + 1);


            timeSliderAlertas.fullTimeExtent = {
                start: startAlerta,
                end: nextSunday
            };
            const endAlerta = nextSunday;
            startAlerta.setDate(startAlerta.getDate() + 358);

            timeSliderAlertas.values = [startAlerta, endAlerta];
        });
        timeSliderAlertas.watch("timeExtent", function () {

            layerAlertas.definitionExpression =
                "reportDate <= " + timeSliderAlertas.timeExtent.end.getTime();
            layerViewAlertas.effect = {
                filter: {
                    timeExtent: timeSliderAlertas.timeExtent,
                    geometry: view.extent
                },
                /* excludedEffect: "grayscale(20%) opacity(2%)" */
            };

        });

    });

     /// Info App Web

     const infoExpand = new Expand({
        collapsedIconClass: "esri-icon-description",
        expandIconClass: "esri-icon-description",
        expandTooltip: "Info App Web",
        view: view,
        content: info,
        expanded: false
    });
    view.ui.add(infoExpand, "top-left" /* "top-left" */);

    /// BASEMAP GALLERY

    // Create an Expand instance and set the content
    // property to the DOM node of the basemap gallery widget
    // Use an Esri icon font to represent the content inside
    // of the Expand widget
    var bgExpand = new Expand({
        collapsedIconClass: "esri-icon-basemap",
        expandIconClass: "esri-icon-basemap",
        expandTooltip: "Mapas",
        content: basemapGallery,
        view: view
    });

    // close the expand whenever a basemap is selected
    basemapGallery.watch("activeBasemap", function () {
        var mobileSize =
            view.heightBreakpoint === "xsmall" ||
            view.widthBreakpoint === "xsmall";

        if (mobileSize) {
            bgExpand.collapse();
        }
    });

    // Add the expand instance to the ui

    view.ui.add(bgExpand, "top-right");

    /// WIDGET DE HOME PARA LA VISTA INICIAL
    var homeBtn = new Home({
        view: view,

    });

    // Add the home button to the top left corner of the view
    view.ui.add(homeBtn, "top-right");




    //// ZOOM TO BROTES

    layerBrotes.when(function () {

        var queryBrotes = layerBrotes.createQuery();

        document.getElementById("btnBrotes").addEventListener("click", function () {

            layerBrotes.queryExtent(queryBrotes).then(function (results) {
                view.goTo(results.extent);
            });
        });
    });

    view.ui.add(btnBrotes, "top-right");

    //// ZOOM TO ALERTAS

    layerAlertas.when(function () {

        var queryAlertas = layerAlertas.createQuery();

        document.getElementById("btnAlertas").addEventListener("click", function () {

            layerAlertas.queryExtent(queryAlertas).then(function (results) {
                view.goTo(results.extent);
            });
        });
    });

    view.ui.add(btnAlertas, "top-right");

});

/// BOTÓN DE BROTES
$("#myButtonBrotes").remove();

function ShowHideTimeSliderBrotes() {
    let text = " ";

    if ($("#myButtonBrotes").text() === 'Brotes') {
        $("#timeSliderBrotes").show();
        text = '<i class="esri-icon-non-visible" ></i>';
    }
    else {
        $("#timeSliderBrotes").hide();
        text = 'Brotes';
    }
    $("#myButtonBrotes").html(text);
}

/// BOTÓN DE ALERTAS
$("#timeSliderAlertas").remove();

function ShowHideTimeSliderAlertas() {
    let text = " ";

    if ($("#myButtonAlerta").text() === "Alertas") {
        $("#timeSliderAlertas").show();
        text = '<i class="esri-icon-non-visible" ></i>';
    }
    else {
        $("#timeSliderAlertas").hide();
        text = "Alertas";
    }
    $("#myButtonAlerta").html(text);
}
