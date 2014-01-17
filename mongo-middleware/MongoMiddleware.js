function MongoMiddleware (schema, options) {

	var Promise = mongoose.prototype.Promise;

	var me = this;

	this.postSavePromise = new Promise;
	this.preSavePromise = new Promise;

	schema.post('save', function (document) {
		me.postSavePromise.complete.apply(me.postSavePromise, arguments);
	});

	schema.pre('save', function (document) {
		me.preSavePromise.complete.apply(me.preSavePromise, arguments);
	});

	this.postRemovePromise = new Promise;
	this.preRemovePromise = new Promise;

	schema.post('remove', function (document) {
		me.postRemovePromise.complete.apply(me.postRemovePromise, arguments);
	});

	schema.pre('remove', function (document) {
		me.preRemovePromise.complete.apply(me.preRemovePromise, arguments);
	});

	schema.statics.sgPostSave = function () {
		return this.postSavePromise;
	};

	schema.statics.sgPreSave = function () {
		return this.preSavePromise;
	};

	schema.statics.sgPostRemove = function () {
		return this.postRemovePromise;
	};

	schema.statics.sgPreRemove = function () {
		return this.preRemovePromise;
	};

}