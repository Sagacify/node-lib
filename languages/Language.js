exports.getPreferedLanguage = function(navigatorLanguage){

	var absoluteDefaultLng = "en";

	if (!navigatorLanguage) {
		return;
	};

	if (!config.supported_langs || !config.supported_langs.length) {
		config.supported_langs = [absoluteDefaultLng];
	};

	var supported_langs = config.supported_langs;

	//Simple case
	if (supported_langs.contains(navigatorLanguage)) {
		return navigatorLanguage;
	};

	var lgns = navigatorLanguage.split('-');

	if (!lgns.length) {
		return absoluteDefaultLng;
	};

	var lng = lgns[0];

	if (supported_langs.contains(lng)) {
		return lng;
	};

	return absoluteDefaultLng;
}