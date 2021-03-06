var apiRecorder = require('../routes_recorder/api_recorder');

module.exports = function (app) {

	app.SGget('/api/app_models', {
		auth: false
	}, function (req, res){
		var routes = apiRecorder.routes;
		var schemas = {};
		mongoose.models.keys().forEach(function (model) {
			if(model !== 'Bug') {
				schemas[model] = mongoose.models[model].schema.publicFormat(model);
				schemas[model].collection.name = mongoose.collectionNameFromModelName(model);
			}
		});
		res.SGsend({
			routes: routes,
			schemas: schemas
		});
	});

};