

exports.preprocessSlug = function(text){
	if(!text)
		return text;

	var newSlug; 
	if(typeof text === "string"){
		newSlug = text.toLowerCase();
	}

	return newSlug.replace(/\//gi,"|")
			.replace(/#/g, "-")
			.replace(/@/g, "-")
			.replace(/!/g, "-")
			.replace(/\?/g, "-")
			.replace(/$/g, "-")
			.replace(/€/g, "-")
			.replace(/%/g, "-")
			.replace(/!/g, "-")
			.replace(/\s/g,"_");
};

exports.generateSlug = function(doc, modelString, baseSlug, slug, counter, next){

	var counter = counter + 1;
	mongoose.model(modelString).find({slug:slug}).exec(function(err, items){
		if (!err) {
			if (items.length!=0){
				exports.generateSlug(doc, modelString, baseSlug, baseSlug+"_"+counter, counter, next);
			}
			else {
				doc.slug = slug;
				next();
			}
		}
	});
};

exports.handleSlug = function(doc, modelString, slug, additionalArgs, next){
	if(doc.slug)
		next();
	else{
		var preprocessedSlug = exports.preprocessSlug(slug);
		exports.generateSlug(doc, modelString, preprocessedSlug, preprocessedSlug, 1, next);
	}
};
