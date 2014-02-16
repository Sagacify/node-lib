exports.getPreferedLanguage = function(navigatorLanguage){

	var absoluteDefaultLng = "en";

	if (!navigatorLanguage) {
		// console.log("config.supported_langs")
		// console.log(config.supported_langs)
		return absoluteDefaultLng;
	};

	if (!config.supported_langs || !config.supported_langs.length) {
		config.supported_langs = [absoluteDefaultLng];
		
		console.log("absoluteDefaultLng")
		console.log(absoluteDefaultLng)
		return absoluteDefaultLng;
	};

	var supported_langs = config.supported_langs;

	//Simple case
	if (supported_langs.contains(navigatorLanguage)) {

		console.log("navigatorLanguage")
		console.log(navigatorLanguage)
		return navigatorLanguage;
	};

	var lgns = navigatorLanguage.split('-');

	if (!lgns.length) {

		console.log("absoluteDefaultLng")
		console.log(absoluteDefaultLng)
		return absoluteDefaultLng;
	};

	var lng = lgns[0];

	if (supported_langs.contains(lng)) {
		console.log("lng")
		console.log(lng)
		return lng;
	};

	return absoluteDefaultLng;
}