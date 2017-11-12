'use strict';
var crypto = require('crypto');
console.log('Loading function');

const doc = require('dynamodb-doc');

const dynamo = new doc.DynamoDB();


/**
 * Demonstrates a simple HTTP endpoint using API Gateway. You have full
 * access to the request and response payload, including headers and
 * status code.
 *
 * To scan a DynamoDB table, make a GET request with the TableName as a
 * query string parameter. To put, update, or delete an item, make a POST,
 * PUT, or DELETE request respectively, passing in the payload to the
 * DynamoDB API as a JSON body.
 */
exports.handler = (event, context, callback) => {
    const hash = crypto.createHash('sha256');
    const parsedBody = JSON.parse(event.body);
    console.log('Received event:', JSON.stringify(event, null, 2));
    console.log('username',parsedBody.username);
    //console.log(JSON.stringify({"username":event.queryStringParameters.username,"password":event.queryStringParameters.password}));
    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    });
    
    var params = {};
    params.TableName = "larrys-user";
    params.KeyConditionExpression = {"username":{"S":parsedBody.username}};
    


    switch (event.httpMethod) {
        case 'POST':
            //Salt and hash PW.
            dynamo.scan(params, function(err,res) {
                if(err) done(err,res);
                else {
                    console.log("QUERY RESULT:" + res);
                    hash.update(parsedBody.password + salt);
                }

            });
            
            /* Code from register-user */
            //const hashedPass = hash.digest('hex');
            //console.log("USERNAME: " + parsedBody.username + "HASHED PASSWORD:" + hashedPass + " SALT: " + salt)
            //params.Item = {"username":parsedBody.username, "password":hashedPass, "salt":salt};
            //dynamo.putItem(params, done);
            //done(null,event.body);
            break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
};
