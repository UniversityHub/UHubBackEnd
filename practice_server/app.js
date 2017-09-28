var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var port = 4200;
var cors = require('cors');

mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://cconcep:Republica1!@ds141454.mlab.com:41454/node_tutorial')
  .then(() => {
    console.log('Start');
  })
  .catch(err => {
    console.log('App starting error:', err.stack);
    process.exit(1);
  })

var UserRouter = require('./src/routes/UserRouter');

// Use middlewares to set view engine and post json data to the server
app.use(express.static('public'));
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/userInfos', UserRouter);

app.listen(port, function(){
  console.log('Server is running on port: ' + port);
})
