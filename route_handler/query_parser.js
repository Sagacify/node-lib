exports.parseQuery = function(query){
	var specialQueryFields = ['offset', 'sort_by', 'sort_how', 'limit'];
	var filter = {};
	query.keys().forEach(function (queryKey) {
		if(specialQueryFields.indexOf(queryKey) === -1) {
			filter[queryKey] = query[queryKey];
		}
	});

	var sort = {};
	if('sort_by' in query) {
		sort[query.sort_by] = query.sort_how || 'asc';
	}

	var paginate = {};
	if(('offset' in query) && ('limit' in query)) {
		paginate = {
			offset: query.offset,
			limit: query.limit
		};
	}

	return {filter:filter, sort:sort, paginate:paginate};
};