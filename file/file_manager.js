var ct = require('../mimetypes/content_type');
var virusScan = require('./virusScan');

var AWS = require('aws-sdk');
var uuid = require('node-uuid');
var fs = require('fs');
var tmp = require('tmp');

/* Create AWS environement */
/* *********************** */
AWS.config.update({
	region: config.AWS.region,
	accessKeyId: config.AWS.accessKeyId,
	secretAccessKey: config.AWS.secretAccessKey
});
s3 = new AWS.S3();

/* Create bucket if not existing */
exports.s3BucketInitialization = function () {
	var bucketNames = [];
	if (config.AWS.s3BucketName) bucketNames.push(config.AWS.s3BucketName);
	if (config.AWS.s3SecuredBucketName) bucketNames.push(config.AWS.s3SecuredBucketName);

	s3.client.listBuckets(function (err, data) {
		if (err) {
			console.log(err);
		} else {
			bucketNames.forEach(function (bucketName) {
				if (data.Buckets.filter(function (bucket) {
					return bucket.Name == bucketName;
				}).length === 0) {
					s3.client.createBucket({
						Bucket: bucketName
					}, function (err, data) {
						if (err) console.log(err);
						else console.log("Successfully created S3 " + bucketName + " bucket");
					});
				} else {
					console.log("S3 bucket " + bucketName + " connected...");
				}
			});
		}
	});
};

exports.writeFileToS3 = function (base64data, extension, secure, callback) {
	var name = uuid.v4();
	var filename = extension ? name + "." + extension : name;
	s3.client.putObject({
		Bucket: secure ? config.AWS.s3SecuredBucketName : config.AWS.s3BucketName,
		Key: filename,
		Body: new Buffer(base64data, 'base64'),
		ContentType: ct.ext.getContentType(extension)
	}, function (err) {
		callback(err, filename);
	});
};

// http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
exports.readFileFromS3 = function (filename, secure, callback) {
	s3.client.getObject({
		Bucket: secure ? config.AWS.s3SecuredBucketName : config.AWS.s3BucketName,
		Key: filename
	}, callback);
};

exports.writeDataToFileSystem = function (filename, data, callback) {
	tmp.dir(function (err, directoryPath) {
		if (err) {
			console.log("err: ");
			console.log(err);
			return callback(err);
		}

		// var filepath = "./tmp/" + filename;
		var filepath = directoryPath + "/" + filename;
		fs.writeFile(filepath, data, function (err) {
			callback(err, filepath);
		});
	});
};

exports.removeFileFromS3 = function (filename, callback) {
	s3.client.deleteObject({
		Bucket: config.AWS.s3BucketName,
		Key: filename
	}, callback);
};

exports.getSecuredFilepath = function (filename) {
	var knox = require('knox');
	var s3Client = knox.createClient({
		key: config.AWS.accessKeyId,
		secret: config.AWS.secretAccessKey,
		bucket: config.AWS.s3SecuredBucketName
	});

	var expires = new Date();
	expires.setMinutes(expires.getMinutes() + 30);
	return s3Client.signedUrl(filename, expires);
};

exports.uploadThenDeleteLocalFile = function (filepath, extension, callback) {

	//Scan for viruses
	virusScan.launchFileScan(filepath, function (err, msg) {
		if (!err) {
			//No virus detected
			exports.readThenDeleteLocalFile(filepath, function (err, data) {
				if (err) {
					return callback(err);
				}

				exports.writeFileToS3(new Buffer(data, 'binary').toString('base64'), extension, 0, function (err, filename) {
					if (err) {
						return callback(err, null);
					}

					callback(err, config.AWS.s3StaticURL + "/" + filename);
				});

			});
		} else {
			//An error occured (might be a virus)
			console.log(msg);
			fs.unlink(filepath);
			console.log('callback');
			callback(err);
		}
	});
};

exports.readThenDeleteLocalFile = function (filepath, callback) {
	fs.readFile(filepath, function (err, data) {
		fs.unlink(filepath, function (err) {
			if (!err) {
				console.log("successfully deleted " + filepath);
			}
		});
		callback(err, data);
	});
};

exports.getSize = function (filepath, callback) {
    fs.stat(filepath, function (err, stats) {
        callback(err, stats ? stats.size : null);
    });
};