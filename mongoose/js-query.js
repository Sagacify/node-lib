function JsQuery (query, doc) {
	var ops = Object.keys(query).map(function (key) {
		var op = {};
		op[key] = query[key];
		return op;
	});
	return ops.reduce(function (isValid, op) {
		return isValid && JsExecute(op, doc);
	}, true);
}

function JsExecute (query, doc) {
	var attrKey = Object.keys(query)[0];
	var attrValue = query[attrKey];

	/*
	 * Logical
	 */

	// $or - Or
	if('$or' === attrKey) {
		return attrValue.reduce(function (isOr, op) {
			return isOr || JsQuery(op, doc);
		}, false);
	}

	// $and - And
	if('$and' === attrKey) {
		return attrValue.reduce(function (isOr, op) {
			return isOr && JsQuery(op, doc);
		}, true);
	}

	// $not - Not
	if('$not' === attrKey) {
		return JsExecute({
			$exists: false
		}, doc) || !JsExecute(attrValue, doc);
	}

	// $nor - Nor
	if('$nor' === attrKey) {
		return !attrValue.reduce(function (isOr, op) {
			return isOr || JsQuery(op, doc);
		}, false);
	}

	var docValue = doc[attrKey];
	var queryKey;
	var queryValue;

	if(Object.prototype.toString.call(attrValue) === '[object Object]') {
		queryKey = Object.keys(attrValue)[0];
		queryValue = attrValue[queryKey];

		// $elemMatch - Element match of sub-documents
		if('$elemMatch' === queryKey) {
			return docValue.reduce(function (isElemMatch, subDoc) {
				return isElemMatch || JsQuery(queryValue, subDoc);
			}, false);
		}
	}
	else {
		if(Array.isArray(docValue)) {
			return !!~docValue.indexOf(attrValue);
		}

		return docValue === attrValue;
	}

	if(Object.prototype.toString.call(queryValue) === '[object Object]') {
		return JsQuery(docValue, queryValue);
	}

	/*
	 * Comparison
	 */

	// $ne - Not Equal To
	if('$ne' === queryKey) {
		return docValue !== queryValue;
	}

	// $gt - Greater Than
	if('$gt' === queryKey) {
		return docValue > queryValue;
	}
	// $gte - Greater Than or Equal
	if('$gte' === queryKey) {
		return docValue >= queryValue;
	}

	// $lt - Lower Than or Equal
	if('$lt' === queryKey) {
		return docValue < queryValue;
	}

	// $lte - Lower Than or Equal
	if('$lte' === queryKey) {
		return docValue <= queryValue;
	}

	// $in - In
	if('$in' === queryKey) {
		return !!~queryValue.indexOf(docValue);
	}

	// $nin	- Not In
	if('$nin' === queryKey) {
		return !~queryValue.indexOf(docValue);
	}

	/*
	 * Element
	 */

	// $exists - Exists
	if('$exists' === queryKey) {
		return ((docValue !== undefined) && (attrKey in doc)) === !!queryValue;
	}

	// $type - TODO

	// $text - TODO

	/*
	 * Evaluation
	 */

	// $mod - Or
	if('$mod' === queryKey) {
		return (docValue % queryValue[0]) === queryValue[1];
	}

	// $where - TODO

	// $regex - Regular Expression match
	if('$regex' === queryKey) {
		var regexp = queryValue;
		if(typeof regexp === 'string') { // REGEXIFY !!!
			regexp = new RegExp(queryValue);
		}

		return regexp.test(docValue);
	}

	/*
	 * Array
	 */

	// $all - All array elements match
	if('$all' === queryKey) {
		return queryValue.reduce(function (isAll, value) {
			var tmpQuery = {};
			tmpQuery[attrKey] = value;
			var tmpDoc = {};
			tmpDoc[attrKey] = docValue;
			return isAll && JsExecute(tmpQuery, tmpDoc);
		}, true);
	}

	// $size - Length of array is equal to
	if('$size' === queryKey) {
		return docValue.length === queryValue;
	}

	/*
	 * Geospatial
	 */

	// $geoWithin - TODO

	// $geoIntersect - TODO

	// $near - TODO

	// $nearSphere - TODO

	return false;
}

module.exports = JsQuery;
