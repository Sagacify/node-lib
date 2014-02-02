var is = require('../strict_typing/validateType');
var exec = require('child_process').exec;

exports.execute = function (command, callback) {
	var child = exec(command, {timeout:120000} function (error, stdout, stderr) {
		if (error) {
			console.log('exec error: ' + error);
		}
		console.log(command);
		console.log(stdout);
		if (is.Function(callback)) {
			callback(this, stderr, stdout);
		} else {
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