var http = require('http');
var url = require('url');
var express = require('express');
var app = express();
var cors = require('cors');


app.use(express.static('public'));
app.use(cors());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

function start(route, handle) {
  function onRequest(request, response) {
    var pathName = url.parse(request.url).pathname;
    console.log('Request for ' + pathName + ' received.');
    route(handle, pathName, response, request);
  }

  var port = 8000;
  http.createServer(onRequest).listen(port);
  console.log('Server has started. Listening on port: ' + port + '...');
}

exports.start = start;
