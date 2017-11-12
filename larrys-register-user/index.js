'use strict';
var crypto = require('crypto');
console.log('Loading function');

const doc = require('dynamodb-doc');

const dynamo = new doc.DynamoDB();


/**
 * Registers new user.
 */
exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    console.log('username',JSON.parse(event.body).username);
    //console.log(JSON.stringify({"username":event.queryStringParameters.username,"password":event.queryStringParameters.password}));
    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    });
    const hash = crypto.createHash('sha256');
    var params = {};
    
    params.TableName = "larrys-user";
    const parsedBody = JSON.parse(event.body);
    switch (event.httpMethod) {
        case 'POST':
            //Salt and hash PW.
            const salt = crypto.randomBytes(16);
            hash.update(parsedBody.password + salt);
            const hashedPass = hash.digest('hex');

            console.log("USERNAME: " + parsedBody.username + "HASHED PASSWORD:" + hashedPass + " SALT: " + salt)
            params.Item = {"username":parsedBody.username, "password":hashedPass, "salt":salt};
            dynamo.putItem(params, done);
            //done(null,event.body);
            break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
};
