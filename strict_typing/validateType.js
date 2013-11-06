exports.MongooseDocument = function() {
	return exports.isObject(obj) && ('_id' in obj);
};

exports.Object = function (obj) {
	return Object.prototype.toString.call(obj) === '[object Object]';
};

exports.Array = function (obj) {
	return Object.prototype.toString.call(obj) === '[object Array]';
};

exports.String = function (obj) {
	return Object.prototype.toString.call(obj) === '[object String]';
};

exports.Function = function (obj) {
	return Object.prototype.toString.call(obj) === '[object Function]';
};

exports.Number = function (obj) {
	return Object.prototype.toString.call(obj) === '[object Number]';
};

exports.NotNull = function (obj) {
	return obj != null;
};

exports.Null = function (obj) {
	return obj == null;
};

exports.VirtualType = function (obj) {
	return this.constructor.name === 'VirtualType';
};