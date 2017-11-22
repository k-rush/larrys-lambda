'use strict';
var crypto = require('crypto');
var AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});

const doc = require('dynamodb-doc');

const dynamo = new doc.DynamoDB();


/**
 * Registers new user.
 */
exports.handler = (event, context, callback) => {

    const parsedBody = JSON.parse(event.body);

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

    var queryParams = {
        TableName : "larrys-user",
        KeyConditionExpression: "#username = :user",
        ExpressionAttributeNames:{
            "#username": "username"
        },
        ExpressionAttributeValues: {
            ":user":parsedBody.username
        }
    };

    var params = {};
    
    params.TableName = "larrys-user";
    
    switch (event.httpMethod) {
        case 'POST':
            //Query DB to see if username exists.
            console.log("QUERY PARAMS:" + JSON.stringify(queryParams));
            dynamo.query(queryParams, function(err,data) {
                if(err) {
                    console.log(err);
                    done(err,data);
                }

                else {
                    console.log("\n\nQUERY RESULT:" + JSON.stringify(data.Items) + "\n\n + data.Items > 0 =" + (data.Items.length > 0));
                    if(data.Items.length > 0) {
                        done({message:"Username already exists."},data);
                    }
                    else {
                        //Salt and hash PW.

                        //TODO validate password, username, email, names are not null
                        const salt = crypto.randomBytes(16).toString('hex');
                        hash.update(parsedBody.password + salt);
                        const hashedPass = hash.digest('hex');

                        console.log("USERNAME: " + parsedBody.username + "HASHED PASSWORD:" + hashedPass + " SALT: " + salt);
                        
                        console.log("Typeof params.username:" + typeof parsedBody.username);

                        params.Item = {"username":parsedBody.username, "password":hashedPass, "salt":salt, "email":parsedBody.email, "firstname":parsedBody.firstname, "lastname":parsedBody.lastname, "verified":false};

                        dynamo.putItem(params, done);
                        //NOTE: Email needs to be verified!

                        sendVerificationEmail([parsedBody.email]);
                    }
                }
            });

            
            break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
};


function sendVerificationEmail(to) {
    var SES = new AWS.SES({apiVersion: '2010-12-01'});
    SES.sendEmail( { 
       Source: "kdr213@gmail.com", 
       Destination: { ToAddresses: to },
       Message: {
           Subject: {
              Data: 'Verification email'
           },
           Body: {
               Text: {
                   Data: 'Please verify',
               }
            }
       }
    }
    , function(err, data) {
        if(err) throw err
            console.log('Email sent:');
            console.log(data);
     });
};