mongoose.Schema.prototype.getClientFormat = function(){
	var clientFormat = {doc:{tree:{}, views:{}, actions:{}}, collection:{views:{}, actions:{}}};
	var me = this;
	if(this.clientView){
		this.clientView.forEach(function(key){
			var value = me.formattedSchema._get(key);
			if(value)
				clientFormat.doc.tree._set(key, value);
		});
	}

	var scan = function(methodsStatics, docColl){
		me[methodsStatics].keys().forEach(function(key){
			var isView = me[methodsStatics][key].name && me[methodsStatics][key].name.startsWith('view');
			var isAction = me[methodsStatics][key].name && me[methodsStatics][key].name.startsWith('action');
			if(isView || isAction){
				var viewAction = isView?'views':'actions';
				var modCollName = me[methodsStatics][key].name.split('_')[1];
				if(!modCollName){
					clientFormat[docColl][viewAction][key] = {type:"unknown"};
				}
				else if(modCollName == "primitive"){
					clientFormat[docColl][viewAction][key] = {type:"primitive"};
				}
				else if(modCollName && modCollName in mongoose.getModelsByCollection()){
					clientFormat[docColl][viewAction][key] = [{type:mongoose.modelNameFromCollectionName(modCollName)}];
				}
				else if(modCollName && modCollName.capitalize() in mongoose.models){
					clientFormat[docColl][viewAction][key] = {type:modCollName.capitalize()};
				}

				if(isAction && clientFormat[docColl][viewAction][key]){
					var args = me[methodsStatics][key].getParamNames();
					args.remove("callback");
					clientFormat[docColl][viewAction][key].args = args;
				}
			};
		});
	}

	scan('methods', 'doc');
	scan('statics', 'collection');

	return clientFormat;
};