var RequestModel = model('Request');
var UserModel = model('User');
var async = require('async');

function get_Report (options, callback) {
	var topX = (options.top !== undefined) ? options.top : 10;
	async.parallel([
		function get_topX_UserAgents (cb) {
			RequestModel.aggregate([
				{
					$project: {
						user_agent: 1
					}
				}, {
					$group: {
						_id: '$user_agent',
						count: {
							$sum: 1
						}
					}
				}, {
					$sort: {
						count: -1
					}
				}, {
					$limit: topX
				}
			], function (e, user_agents) {
				if(e) {
					cb(e);
				}
				else {
					var totalNumRequests = user_agents.reduce(function (count, user_agent) {
						return count + user_agent.count;
					}, 0);
					var appliedPercentage = user_agents.map(function (user_agent) {
						user_agent.percentage = user_agent.count / (totalNumRequests / 100);
						return user_agent;
					});
					cb(null, appliedPercentage);
				}
			});
		},
		function get_user_Count (cb) {
			UserModel.aggregate([
				{
					$project: {
						state: 1
					}
				}, {
					$group: {
						_id: '$state',
						count: {
							$sum: 1
						}
					}
				}, {
					$sort: {
						count: -1
					}
				}
			], function (e, user_count) {
				if(e) {
					cb(e);
				}
				else {
					var totalUsers = user_count.reduce(function (count, user_type) {
						return count + user_type.count;
					}, 0);
					var appliedPercentage = user_count.map(function (user_type) {
						user_type.percentage = user_type.count / (totalUsers / 100);
						return user_type;
					});
				}
			});
		}
	], function () {

	});
}

exports.get_Report = get_Report;



