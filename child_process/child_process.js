var is = require('../strict_typing/validateType');
var exec = require('child_process').exec;

exports.execute = function (command, callback) {
	var child = exec(command, function (error, stdout, stderr) {
		if (error) {
			console.log('exec error: ' + error);
		}
		if (is.Function(callback)) {
			callback.call(this, stderr, stdout);
		} else {
			if (stdout && stdout.length) {
				console.log('stdout: ' + stdout);
			}
			if (stderr && stderr.length) {
				console.log('stderr: ' + stderr);
			}
		}
	});

	child.stdout.on('data', function (data) {
		console.log("data: " + data);
	});
};

exports.executor = function (commands, callback) {

	commands.forEach(function (command) {
		this.execute(command, callback);
	});
};