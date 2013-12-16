/*!
*
* Report for the `Request` model.
*
* Gathered information :
*	[ ] - total number of requests
*	[X] - total number of unique IP addresses
*	[ ] - user conversion rate (with / without user)
*
*/

var RequestModel = model('Request');

function RequestReport (callback) {
	var start_time = Date.now();
	RequestModel.aggregate([
		// limit field to IP addresses and userId
		{
			$project: {
				ip_addr: 1,
				user: 1
			}
		},
		// group by IP address
		{
			$group: {
				_id: "$ip_addr",
				count: {
					$sum: 1
				}
			}
		}
	], function (e, requests) {
		if(e) {
			callback(e);
		}
		else {
			var end_time = Date.now();
			callback(null, {
				response_time: end_time - start_time,
				results: requests
			});
		}
	});
}

module.exports = RequestReport;