var crypto = require("crypto"),
    AWS = require('aws-sdk');

// AWS.config.update({
//     region: config.AWS.region,
//     accessKeyId: config.AWS.accessKeyId,
//     secretAccessKey: config.AWS.secretAccessKey
// });
// var s3 = new AWS.S3();

// Signs any requests.  Delegate to a more specific signer based on type of request.
exports.signRequest = function (req, res) {
    if (req.body.headers) {
        signRestRequest(req, res);
    } else {
        signPolicy(req, res);
    }
};

// Signs multipart (chunked) requests.  Omit if you don't want to support chunking.
function signRestRequest(req, res) {
    var stringToSign = req.body.headers,
        signature = crypto.createHmac("sha1", config.AWS.secretAccessKey)
            .update(stringToSign)
            .digest("base64");

    var jsonResponse = {
        signature: signature
    };

    res.setHeader("Content-Type", "application/json");

    // if (isValidRestRequest(stringToSign)) {
    res.end(JSON.stringify(jsonResponse));
    // }
    // else {
    //     res.status(400);
    //     res.end(JSON.stringify({invalid: true}));
    // }
}

// Signs "simple" (non-chunked) upload requests.
function signPolicy(req, res) {
    var base64Policy = new Buffer(JSON.stringify(req.body)).toString("base64"),
        signature = crypto.createHmac("sha1", config.AWS.secretAccessKey)
            .update(base64Policy)
            .digest("base64");

    var jsonResponse = {
        policy: base64Policy,
        signature: signature
    };

    res.setHeader("Content-Type", "application/json");

    // if (isPolicyValid(req.body)) {
    res.end(JSON.stringify(jsonResponse));
    // }
    // else {
    //     res.status(400);
    //     res.end(JSON.stringify({invalid: true}));
    // }
}

// Ensures the REST request is targeting the correct bucket.
// Omit if you don't want to support chunking.
function isValidRestRequest(headerStr) {
    return new RegExp("\/" + expectedBucket + "\/.+$").exec(headerStr) != null;
}

// Ensures the policy document associated with a "simple" (non-chunked) request is
// targeting the correct bucket and the min/max-size is as expected.
// Comment out the expectedMaxSize and expectedMinSize variables near
// the top of this file to disable size validation on the policy document.
function isPolicyValid(policy) {
    var bucket, parsedMaxSize, parsedMinSize, isValid;

    policy.conditions.forEach(function (condition) {
        if (condition.bucket) {
            bucket = condition.bucket;
        } else if (condition instanceof Array && condition[0] === "content-length-range") {
            parsedMinSize = condition[1];
            parsedMaxSize = condition[2];
        }
    });

    isValid = bucket === expectedBucket;

    // If expectedMinSize and expectedMax size are not null (see above), then
    // ensure that the client and server have agreed upon the exact same
    // values.
    if (expectedMinSize != null && expectedMaxSize != null) {
        isValid = isValid && (parsedMinSize === expectedMinSize.toString()) && (parsedMaxSize === expectedMaxSize.toString());
    }

    return isValid;
}

// After the file is in S3, make sure it isn't too big.
// Omit if you don't have a max file size, or add more logic as required.
// function verifyFileInS3(req, res) {
//     function headReceived(err, data) {
//         if (err) {
//             res.status(500);
//             console.log(err);
//             res.end(JSON.stringify({error: "Problem querying S3!"}));
//         }
//         else if (data.ContentLength > expectedMaxSize) {
//             res.status(400);
//             res.write(JSON.stringify({error: "Too big!"}));
//             deleteFile(req.body.bucket, req.body.key, function(err) {
//                 if (err) {
//                     console.log("Couldn't delete invalid file!");
//                 }

//                 res.end();
//             });
//         }
//         else {
//             res.end();
//         }
//     }

//     callS3("head", {
//         bucket: req.body.bucket,
//         key: req.body.key
//     }, headReceived);
// }

// function deleteFile(bucket, key, callback) {
//     callS3("delete", {
//         bucket: bucket,
//         key: key
//     }, callback);
// }

// function callS3(type, spec, callback) {
//     s3[type + "Object"]({
//         Bucket: spec.bucket,
//         Key: spec.key
//     }, callback)
// }