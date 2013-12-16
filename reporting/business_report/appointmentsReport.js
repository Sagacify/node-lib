/*!
*
* Report for the `Appointment` model.
*
* Gathered information :
*	[ ] - total number of appointments
*	[ ] - total number of "real" (with a user appointment)
*	[ ] - group appointments by month
*	[ ] - group appointments by day of the week
*
*/

var AppointmentModel = model('Appointment');

function AppointmentReport (callback) {
	var start_time = Date.now();
	AppointmentModel.aggregate([
		// limit field to IP addresses and userId
		{
			$project: {
				datetime: 1,
				user: 1
			}
		},
		// group by IP address
		{
			$group: {
				_id: {
					$month: "$datetime",
				},
				count_month: {
					$sum: 1
				}
			}
		},
		{
			$group: {
				_id: {
					$dayOfWeek: "$datetime",
				},
				count_month: {
					$sum: 1
				}
			}
		}
	], function (e, appointments) {
		if(e) {
			callback(e);
		}
		else {
			var end_time = Date.now();
			callback(null, {
				response_time: end_time - start_time,
				results: appointments
			});
		}
	});
}

module.exports = RequestReport;