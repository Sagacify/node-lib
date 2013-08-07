/**
* RevProxy.js is a route on which secondary servers can connect to.
* This gives the possibility to bypass the need for a static IP address.
* Here is a lsit of options that can be passed to the route :
* 		-all 							: 	Dumps every collection
* 		-col NAME_OF_THE_COLLECTION 	: 	Dumps only the specified collection
* 		-cols [COL_A, COL_B, COL_C] 	: 	Dumps the specified collections listed in an array
* 		-log 							: 	Dumps the server loggs
* 		-bug 							: 	Dumps the server's error reports
*/

// TODO : Tunnel mongodumo throught the TLS channel

exports.proxy = function(app) {

	app.post('/me/reverse_proxy', function(req, res) {
		res.send(200);
	});

};