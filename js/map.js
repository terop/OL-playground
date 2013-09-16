
// Coordinate transform from EPSG 3067 to EPSG 3857 using proj4js
var coordTransform = function (coord) {
	var epsg3067 = '+proj=utm +zone=35 +ellps=GRS80 +units=m +no_defs';
	var epsg3857 = '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs';

	return proj4(epsg3067, epsg3857, coord);
};

var map, drawingLayer, controls;
var initMap = function () {
	map = new OpenLayers.Map('map', 
		{
			projection: 'EPSG:900913',
			controls: [
				new OpenLayers.Control.Navigation(),
				new OpenLayers.Control.ArgParser(),
				new OpenLayers.Control.Attribution(),
				new OpenLayers.Control.MousePosition(),
				new OpenLayers.Control.LayerSwitcher(),
				new OpenLayers.Control.PanZoomBar()
			]
		}
	);

	var layerOsm = new OpenLayers.Layer.OSM('OSM');
	var layerMmlBase = new OpenLayers.Layer.MML('Peruskartta', [
		'http://tile1.kartat.kapsi.fi/1.0.0/peruskartta/${z}/${x}/${y}.png',
		'http://tile2.kartat.kapsi.fi/1.0.0/peruskartta/${z}/${x}/${y}.png'
	], {
		numZoomLevels: 20,
		sphericalMecator: true,
		transitionEffect: 'resize'
	});
	var layerMmlOrto = new OpenLayers.Layer.MML('Ortokuva', [
		'http://tile1.kartat.kapsi.fi/1.0.0/ortokuva/${z}/${x}/${y}.png',
		'http://tile2.kartat.kapsi.fi/1.0.0/ortokuva/${z}/${x}/${y}.png'
	], {
		numZoomLevels: 20,
		sphericalMecator: true,
		transitionEffect: 'resize'
	});
	var layerMmlBackground = new OpenLayers.Layer.MML('Taustakartta', [
		'http://tile1.kartat.kapsi.fi/1.0.0/taustakartta/${z}/${x}/${y}.png',
		'http://tile2.kartat.kapsi.fi/1.0.0/taustakartta/${z}/${x}/${y}.png'
	], {
		numZoomLevels: 20,
		sphericalMecator: true,
		transitionEffect: 'resize'
	});	
	map.addLayers([layerOsm, layerMmlBase, layerMmlBackground, layerMmlOrto]);

	map.setCenter(
	    new OpenLayers.LonLat(2776269.5105216, 8437730.296525601).transform(
	        new OpenLayers.Projection('EPSG:3857'),
	        map.getProjectionObject()
	    ), 15
	);
};
initMap();

// Setup of drawing tools
var setupDrawing = function () {
	drawingLayer = new OpenLayers.Layer.Vector('Drawing layer');
	map.addLayer(drawingLayer);

	var addedHandler = function(type) {
		controls[type].deactivate();
	};

	controls = {
		standard: new OpenLayers.Control.DrawFeature(drawingLayer,
			OpenLayers.Handler.RegularPolygon,
				{
					handlerOptions: {
						sides: 4
					}
				}),
		rectangle: new OpenLayers.Control.DrawFeature(drawingLayer,
			OpenLayers.Handler.RegularPolygon,
				{
					handlerOptions: {
						sides: 4
					}
				}),
		polygon: new OpenLayers.Control.DrawFeature(drawingLayer,
            OpenLayers.Handler.Polygon),
		centerLine: new OpenLayers.Control.DrawFeature(drawingLayer,
			OpenLayers.Handler.Path,
			{
				handlerOptions: {
					maxVertices: 2
				}
			})
	};
	// Handlers
	controls['standard'].events.on({
		'featureadded': function (event) {
			addedHandler('standard');
		}
	});
	controls['rectangle'].events.on({
		'featureadded': function () {
			addedHandler('rectangle');
		}
	});
	controls['polygon'].events.on({
		'featureadded': function () {
			addedHandler('polygon');
		}
	});
	controls['centerLine'].events.on({
		'featureadded': function (event) {
			var wktReader = new jsts.io.WKTReader(),
				geom = wktReader.read(event.feature.geometry.toString()),
				bufferOp = new jsts.operation.buffer.BufferOp(geom);
			bufferOp.setEndCapStyle(jsts.operation.buffer.BufferParameters.CAP_FLAT);
			
			var bufferGeom = bufferOp.getResultGeometry(20),
				wktFormat = new OpenLayers.Format.WKT(),
				bufferVector = wktFormat.read(bufferGeom.toString());

			drawingLayer.addFeatures([bufferVector]);
			controls['centerLine'].deactivate();
		}
	});

	for(var key in controls) {
        map.addControl(controls[key]);
    }
};
setupDrawing();

// Activates drawing
var activateDrawing = function (type) {
	drawingLayer.removeAllFeatures();
	controls[type].activate();
};
