var fs = require('fs');
var AWS = require('aws-sdk');
var ct = require('./content_type');
var uuid = require('node-uuid');

/* Create AWS environement */
/* *********************** */
AWS.config.update({region: config.AWS.region});
s3 = new AWS.S3();

/* Create bucket if not existing */
exports.s3BucketInitialization = function(){
	s3 = new AWS.S3();
	var bucketNames = [];
	if(config.AWS.s3BucketName)
		bucketNames.push(config.AWS.s3BucketName);
	if(config.AWS.s3SecuredBucketName)
		bucketNames.push(config.AWS.s3SecuredBucketName);

    s3.client.listBuckets(function(err, data) {
	    if (err){
	    	console.log(err);
	    }
	    else {
			bucketNames.forEach(function(bucketName){
		    	if(!data.Buckets.contains(bucketName)){
					s3.client.createBucket({Bucket:bucketName}, function(err, data){
		            	if(err) console.log(err);
		            	else console.log("Successfully created S3 "+bucketName+ " bucket");
					});
				}
			});   
		}
	});
}

exports.writeFileToS3 = function (base64data, extension, secure, callback){
	var name = uuid.v4();
	var filename = extension?name+"."+extension:extension;
	s3 = new AWS.S3();
	s3.client.putObject({
		Bucket: secure?config.AWS.s3SecuredBucketName:config.AWS.s3BucketName,
		Key: filename,
		Body: base64data,
		ContentType:ct.getContentType(extension)},
		function(err) {
			callback(err, filename);							
		}
	);		
};

exports.removeFileFromS3 = function(filename, callback){
	s3 = new AWS.S3();
	s3.client.deleteObject({
		Bucket: config.AWS.s3BucketName,
		Key: filename}, 
		callback);
};


exports.getSecuredFilepath = function(filename) {
	console.log("secure")
	var knox = require('knox');
	var s3Client = knox.createClient({
		key: config.AWS.accessKeyId,
		secret: config.AWS.secretAccessKey,
		bucket: config.AWS.s3SecuredBucketName});

	var expires = new Date();
	expires.setMinutes(expires.getMinutes() + 30);
	return s3Client.signedUrl(filename, expires);
};