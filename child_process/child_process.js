var is = require('../strict_typing/validateType');
var exec = require('child_process').exec;

exports.execute = function (command, callback) {
	var child = exec(command, {
		timeout: 300000
	}, function (error, stdout, stderr) {
		if (is.Function(callback)) {
			callback(error ? error + "\n" + command : error, stderr, stdout);
		} else {
			if (error) {
				console.log('exec error: ' + error + command);
			}
			if (stdout && stdout.length) {
				console.log('stdout: ' + stdout);
			}
			if (stderr && stderr.length) {
				console.log('stderr: ' + stderr);
			}
		}
	});

	// child.stdout.on('data', function (data) {
	// 	console.log("data: " + data);
	// });
};

exports.executor = function (commands, callback) {

	commands.forEach(function (command) {
		this.execute(command, callback);
	});
};