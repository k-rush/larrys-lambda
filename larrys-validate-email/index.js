'use strict';
var crypto = require('crypto');
console.log('Loading function');
const doc = require('dynamodb-doc');
const dynamo = new doc.DynamoDB();

/**
 * Validates authentication token from client.
 */
exports.handler = (event, context, callback) => {
    const key = 'hANtBs3yjrwkgK9g';
    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    });
    

    switch (event.httpMethod) {
        case 'GET':
            const token = event.queryStringParameters.token;
            console.log("Token: " + token);
            const decipher = crypto.createDecipher('aes192',key);
            var decipheredToken = decipher.update(token, 'hex', 'utf8');
            decipheredToken += decipher.final('utf8');
            console.log('DECIPHERED TOKEN:' + decipheredToken);
            done(null,JSON.parse(decipheredToken));

            break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
};
