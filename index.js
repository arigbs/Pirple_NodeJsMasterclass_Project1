/*
*Primary file for the API
*
*
*/

// Dependencies
var http =  require('http');
var https =  require('https');
var url =  require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');

// Instantiate the HTTP server
var httpServer = http.createServer(function(req,res){
   unifiedServer(req,res);    
});

// Start the HTTP server 
httpServer.listen(config.httpPort,function(){
    console.log("Listening on port "+config.httpPort);
});


// Instantiate the HTTPS server
var httpsServerOptions = {
   'key' : fs.readFileSync('./https/key.pem'),
   'cert' :  fs.readFileSync('./https/cert.pem') 
};
var httpsServer = https.createServer(httpsServerOptions,function(req,res){
   unifiedServer(req,res);    
});

// Start the HTTPS server 
httpsServer.listen(config.httpsPort,function(){
    console.log("Listening on port "+config.httpsPort);
});


// All the server logic for both the http and https server
var unifiedServer = function(req,res){
    
    // Get the URL and parse it
    var parsedUrl = url.parse(req.url, true);

    // Get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');
    
    // Get the query string as an object
    var queryStringObject = parsedUrl.query;
    
    // Get the HTTP method
    var method = req.method.toLowerCase();
    
    // Get the headers as an object
    var headers = req.headers;
    
    //Get the payload if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function(data){
        buffer += decoder.write(data);
    });
    req.on('end',function(){
        buffer += decoder.end();
        
    // Choose handler this request shoulg go to, if not found, use not found handler
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
    
    // Construct the data object to send to the handler
    var data = {
        'trimmedPath' : trimmedPath,
        'queryStringObject': queryStringObject,
        'method' : method,
        'headers' : headers,
        'payload' : buffer,
    };
    
    // Route the request to the handler specified in the router
    chosenHandler(data, function(statusCode, payload){
        // Use the status code called back by the handler, or default to 200
        statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
        
        // Use the payload called back by the handler, or default to an empty object
        payload = typeof(payload) == 'object' ? payload : {};
        
        // Convert the payload to a string
        var payloadString = JSON.stringify(payload);
        
        // Return the response
        res.setHeader('Content-Type','application/json');
        res.writeHead(statusCode);
        res.end(payloadString);
        
        // Log the request path
        console.log('Returning this response: ',statusCode, payloadString); 
    }); 
 
    });
    
};

// Define the handlers
var handlers = {};

// Hello World handler
handlers.hello = function(data,callback){
    //Callback a http status code, and a payload object
    var response = {
        "You said": "Hello",
        "Computer says": "Hello Human"
    };    
    callback(200, response);
};

// Ping handler
handlers.ping = function(data,callback){
    var response = {
        "You said": "Ping",
        "Computer says": "Yeah, whatever."
    };
    callback(200, response);
};

// Paper handler
handlers.paper = function(data,callback){
    var response = {
        "You said": "Paper",
        "Computer says": "Scissors."
    };
    callback(200, response);
};

// I Know Node Js handler
handlers.iknownodejs = function(data,callback){
    var response = {
        "You said": "I know nodejs",
        "Computer says": "Congratulations, we will now move you up to Jedi level 8."
    };
    callback(200, response);
};

// Not found handler
handlers.notFound = function(data,callback){
    callback(404);
   
};

// Define a request router
// chaining a bunch of handlers in one router
var router = {
    'hello': handlers.hello,
    'ping': handlers.ping,
    'paper': handlers.paper,
    'iknownodejs': handlers.iknownodejs
};


