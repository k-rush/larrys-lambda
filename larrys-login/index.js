'use strict';
var sha256 = require('node_modules/js-sha256');
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
    
    var params = {};
    
    params.TableName = "larrys-user";
    var parsedBody = JSON.parse(event.body);
    switch (event.httpMethod) {
        case 'DELETE':
            //dynamo.deleteItem(JSON.parse(event.body), done);
            break;
        case 'GET':
            dynamo.scan(params, done);
            //done(null,event.queryStringParameters);
            break;
        case 'POST':
            params.Item = {"username":parsedBody.username, "password":sha256(parsedBody.password)};
            dynamo.putItem(params, done);
            //done(null,event.body);
            break;
        case 'PUT':
            //dynamo.updateItem(JSON.parse(event.body), done);
            break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
};
