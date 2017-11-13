'use strict';
var crypto = require('crypto');
console.log('Loading function');



/**
 * Validates authentication token from client.
 */
exports.handler = (event, context, callback) => {
    const key = 'hANtBs3yjrwkgK9g';
    const parsedBody = JSON.parse(event.body);
    //console.log('Received event:', JSON.stringify(event, null, 2));
    //console.log('username',parsedBody.username);
    //console.log(JSON.stringify({"username":event.queryStringParameters.username,"password":event.queryStringParameters.password}));
    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    });
    

    switch (event.httpMethod) {
        case 'POST':
            const token = JSON.parse(event.body).token;
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
