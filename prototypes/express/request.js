var express = require('express')

express.request.getFindParams = function(model){
	var fullSearchParams = function(value) {
		var or = [];
		for(var sKey in model.schema.tree){
			var type = model.schema.tree[sKey].type?model.schema.tree[sKey].type.name:model.schema.tree[sKey].name;
			var orItem = {};
			switch(type){
				case "String":
					orItem[sKey] = {$regex:value, $options: 'i'};
					or.push(orItem);
					break;
				case "Boolean":
					var bool = (typeof !!value === 'boolean') ? !!value : null;
					if(bool != null){
						orItem[sKey] = bool;
						or.push(orItem);
					}
					break;
				case "Number":
					var parsedNumber = parseFloat(value);
					if(parsedNumber){
						orItem[sKey] = parsedNumber;
						or.push(orItem);
					}
					break;
			}
		}
		return or;
	};

	var findParams = {};
	for(var key in this.query){
		if(key != "sort_by" && key != "offset" && key != "limit" && key != "dojo.preventCache" && key != "in"){
			if(key == "*"){
				findParams["$or"] = fullSearchParams(this.query["*"]);
			}
			else{
				var type = model.schema.tree[key].type?model.schema.tree[key].type.name:model.schema.tree[key].name;
				switch(type) {
					case "String":
						if(key == "slug") {
							findParams[key] = this.query[key]
						}
						else {
							findParams[key] = {$regex:this.query[key], $options: 'i'};
						}
						break;
					case "Boolean":
						findParams[key] = this.query[key] == "true";
						break;
					default:
						findParams[key] = this.query[key];
						break;
				}
			}	
		}
	}

	if(this.body.fullSearch) {
		findParams["$or"] = fullSearchParams(this.body.fullSearch);
	}

	if(this.query.in) {
		findParams._id = {"$in":JSON.parse(this.query.in)};
	}
	else if(this.body.inArray) {
		findParams._id = {"$in":this.body.inArray};	
	}

	return findParams;
};

express.request.getFindQuery = function(model, fieldsToPopulate, additionalParams){
	var findParams = this.getQueryParamsFromRequest(model);

	if(additionalParams) {
		for(var key in additionalParams){
			findParams[key] = additionalParams[key];
		}
	}

	var query = model.find(findParams);

	fieldsToPopulate.forEach(function(fieldToPopulate){
		query.populate(fieldToPopulate);
	});

	query.attachRequestParams(this);
	return query;
}

