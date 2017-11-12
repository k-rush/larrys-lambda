#!/bin/bash

echo "zipping delpoyment package"
zip /home/kyle/Documents/code/larrys/lambda/larrys-login.zip /home/kyle/Documents/code/larrys/lambda/larrys-login/*

echo "deploying to aws lambda"
aws lambda update-function-code --function-name larrys-login --zip-file fileb:///home/kyle/Documents/code/larrys/lambda/larrys-login.zip
