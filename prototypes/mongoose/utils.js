exports.generateMeth = function(meth, Class){
	var Meth = meth.capitalize();
	var willMeth = 'will' + Meth;
	var doMeth = 'do' + Meth;
	var didMeth = 'did' + Meth;

	if((meth === 'update') || (meth === 'remove')){
		meth = 'sg' + meth.capitalize();
	}
	if(!Class)
		Class = meth=="sgRemove"?mongoose.Model:mongoose.Document;
	Class.prototype[meth] = function (path, args, callback) {
		if(typeof args == "function"){
			callback = args;
			args = {};
		}

		if(!(typeof callback === 'function')) {
			var willRes = this[willMeth](path, args);
			if(willRes instanceof Error || willRes instanceof SGError){
				return willRes;
			}
			var val = this[doMeth](path, args);
			this[didMeth](path, args);
			return val;
		}
		else {
			if(meth == 'sgUpdate') {
				args = null;
			}
			if(meth == 'sgRemove') {
				path = null;
				args = null;
			}
			var me = this;
			var doCallback = function (err, res) {
				if(!err) {
					me[didMeth](path, args);
				}
				callback(err, res);
			};
			var willCallback = function(err) {
				if(!err) {
					me[doMeth](
						(path != null) ? path : doCallback,
						(args !== null) ? args : doCallback,
						doCallback
					);
				}
				else {
					callback(err);
				}
			};
			this[willMeth](
				(path != null) ? path : willCallback,
				(args !== null) ? args : willCallback,
				willCallback
			);
		}
	};
};