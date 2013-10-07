var apiRecorder = require('./api_recorder');

module.exports = function (app) {

	app.SGget('/api/app_models', function(req, res){
		var routes = apiRecorder.routes;
		var schemas = {};
		mongoose.models.keys().forEach(function(model){
			if(model != 'Bug'){
				schemas[model] = mongoose.models[model].schema.getClientFormat();
				schemas[model].collection.name = mongoose.collectionNameFromModelName(model);
			}
		});
		var structure = {routes: routes, schemas:schemas};
		res.SGsend(structure);
	});

};