/**
* TwinDB.js is a tool that adds back-up capabilities to MongoDB.
* Depending on the MongoDB daemon's status, TwinDB will use a different command.
* The backbup stream flows through the Flash.js transport.
*/

var exec = require('child_process').exec;

function execute_command(cmdHost, cmdDB, cmdOut, callback) {
	var command;
	var dir = '/Users/kollektiv/Downloads/mongodb-osx-x86_64-2.4.3/bin/';
	var cmdBase = 'mongo ';
	if(cmdHost && cmdDB && cmdOut) {
		command = dir + cmdBase + ' --host ' + cmdHost + ' --db ' + cmdDB + ' --out ' + cmdOut;
		console.log(command);
	}
	else {
		throw 'Back-up command is corrupted !';
	}
	exec(command, function(error, stdout, stderr) {
		if(error) {
			console.log(error);
		}
		else {
			callback(stdout);
		}
	});
}

// default command for production database
execute_command('ec2-46-137-39-109.eu-west-1.compute.amazonaws.com:27017', 'i4_prod', '~/Dropbox/SAGACIFY/Backups/i4_prod_30072013.dump', function(error, stdout) {
	if(error) {
		console.log(error);
	}
	else {
		console.log(stdout)
	}
});


// If instance is running
//mongodump --host mongoUrl --port mongoPort

// If no instance is running
//mongodump --host mongodb1.example.net --port 3017 --username user --password pass --out /opt/backup/mongodump-2012-10-24