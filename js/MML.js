OpenLayers.Layer.MML= OpenLayers.Class(OpenLayers.Layer.XYZ, {
	name: "Maanmittauslaitos", 
	attribution: "<a class='attribution' href='http://maanmittauslaitos.fi/'>MML</a>",
	sphericalMercator: true,
	url: 'http://tiles.kartat.kapsi.fi/peruskartta/${z}/${x}/${y}.png',
	clone:function(obj) {
		if(obj === null) {
			obj = new OpenLayers.Layer.MML(this.name,this.url,this.getOptions());
		}
		obj = OpenLayers.Layer.XYZ.prototype.clone.apply(this,[obj]);return obj;
	},
	wrapDateLine: true,
	CLASS_NAME: "OpenLayers.Layer.MML"
});
