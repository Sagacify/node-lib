module.exports = {
	child_process: require('./child_process/child_process'),

	file_manager: require('./file/file_manager'),
	virusScan: require('./file/virusScan'),

	content_type: require('./mimetypes/content_type'),

	SGStrictTyping: require('./strict_typing/SGStrictTyping'),
	validateFormat: require('./strict_typing/validateFormat'),
	validateType: require('./strict_typing/validateType')
};