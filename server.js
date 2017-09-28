var express = require('express');
var app = express();
var bodyParse = require('body-parser');

app.use(bodyParse.urlencoded({extended : true}));
app.use(bodyParse.json());

app.post('/sendLogin', function (req,res) {
  console.log("Received a POST req for /sendLogin");
  res.send("Just received req.");

  //console.log(req);
  var json = req.body;
  console.log("The JSON string is: " + req.body);

  if(!json.hasOwnProperty("username")) {
    console.log("Whoa, you aint got no name, dude");
  }

  var user = json['username'];
  var pass = json['password'];

  //pass to db 'user', get JSON string
  //parse JSON string, get the pass
  //if (pass ==  passFromDB)
  //  make new token
  //  save token to DB
  //  redirect client to next page
  //  give client toekn
  //else
  //  tell client that login failed
  //  refresh page
  //



})


var server = app.listen(8081, function() {    //when you first start the server?
  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port);
})
