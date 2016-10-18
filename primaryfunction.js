'use strict';

console.log('Loading function');
const aws = require('aws-sdk');
const s3 = new aws.S3({ apiVersion: '2006-03-01' });
const dynamodb = new aws.DynamoDB('2012-08-10');


exports.handler = (event, context, callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    // Get the object from the event and show its content type
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const params = {
        Bucket: bucket,
        Key: key,
    };
    
    s3.headObject(params, (err, data) => {
        if (err) {
            console.log(err);
            const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
            console.log(message);
            callback(message);
        } else {
            var tableName = 'Versions';
            console.log(bucket);
            console.log(key);
            console.log(data.Metadata.versionid);
            dynamodb.putItem({
             "TableName": tableName,
                "Item" : {
                    "versionid": {"S": data.Metadata.versionid },
                    "bucket": {"S": bucket },
                    "key": {"S": key}
                 }
        }, function(err, data) {
            if (err) {
                context.done('error','putting item into dynamodb failed: '+err);
            }
            else {
                console.log('great success: '+JSON.stringify(data, null, '  '));
                context.done('K THX BY');
            }
        });
        }
    });
};
