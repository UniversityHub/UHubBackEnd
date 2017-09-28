var express = require('express');
var app = express();
var bodyParse = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

app.use(bodyParse.urlencoded({extended : true}));
app.use(bodyParse.json());
var url = 'mongodb://cconcep:Republica1!@ds141454.mlab.com:41454/node_tutorial';

MongoClient.connect(url,function(err,db) {
  assert.equal(null,err);
  console.log("Connected correctly to server.");
  db.close();
})

var server = app.listen(8081, function() {    //when you first start the server?
  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port);
})

app.post('/sendLogin', function (req,res) {
  console.log("Received a POST req for /sendLogin");
  res.send("Just received req.");

  //console.log(req);
  var json = req.body;
  console.log("The JSON string is: " + req.body);

  //check formatting?
  if(!json.hasOwnProperty("username")) {
    console.log("Whoa, you aint got no name, dude");
  }

  var user = json['username'];
  var pass = json['password'];

  MongoClient.connect(url,function(err,db) {
    assert.equal(null,err);
    console.log("Connected correctly to server.");

    //db.collection('users').insertOne(json);

    db.close();
  })
})
