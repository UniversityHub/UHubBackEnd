var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var port = 4200;
var cors = require('cors');
var url = 'mongodb://cconcep:Republica1!@ds141454.mlab.com:41454/node_tutorial'
var UserRouter = express.Router();
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;


///////////////////////////////////////
//BEGIN SECTION FOR OUTLOOK API STUFF//
///////////////////////////////////////

var credentials = {
  client: {
    id: '144ef094-6c6c-44ea-aad0-320c524ef96b',
    secret: 'yvQbOzk8iKFFfV0cMVPwEnj',
  },
  auth: {
    tokenHost: 'https://login.microsoftonline.com',
    authorizePath: 'common/oauth2/v2.0/authorize',
    tokenPath: 'common/oauth2/v2.0/token'
  }
};
var oauth2 = require('simple-oauth2').create(credentials);
var url = require('url');
var microsoftGraph = require("@microsoft/microsoft-graph-client");
var redirectUri = 'http://localhost:4200/userinfos/test/office';
var scopes = [ 'openid',
               'offline_access',
               'User.Read',
               'Calendars.Read',
               'Mail.Read' ];

//                // Create the XHR object.
// function createCORSRequest(method, url) {
//   var xhr = new XMLHttpRequest();
//   if ("withCredentials" in xhr) {
//     // XHR for Chrome/Firefox/Opera/Safari.
//     xhr.open(method, url, true);
//   } else if (typeof XDomainRequest != "undefined") {
//     // XDomainRequest for IE.
//     xhr = new XDomainRequest();
//     xhr.open(method, url);
//   } else {
//     // CORS not supported.
//     xhr = null;
//   }
//   return xhr;
// }
//
// // Helper method to parse the title tag from the response.
// function getTitle(text) {
//   return text.match('<title>(.*)?</title>')[1];
// }
//
// // Make the actual CORS request.
// function makeCorsRequest() {
//   // This is a sample server that supports CORS.
//
  // var xhr = createCORSRequest('GET', url);
  // if (!xhr) {
  //   console.log('CORS not supported');
  //   return;
  // }
  //
  // // Response handlers.
  // xhr.onload = function() {
  //   var text = xhr.responseText;
  //   var title = getTitle(text);
  //   console.log('Response from CORS request to ' + url + ': ' + title);
  // };
  //
  // xhr.onerror = function() {
  //   console.log('Woops, there was an error making the request.');
  // };
  // // xhr.setRequestHeader('200', {"Content-Type": "text/css"});
  // xhr.send();
// }

//this function is to start the authorization, will route to the authorizeURL
function startAuth(response, request) {
  console.log('startAuth was called.');
  response.writeHead(302, {Location: getAuthUrl()})
  //response.writeHead(200, {'Content-Type': 'text/html'});
  //response.write('<p>Please <a href="' + authHelper.getAuthUrl() + '">sign in</a> with your Office 365 or Outlook.com account.</p>');
  response.end();
  //window.location.href(authHelper.getAuthUrl());
}

//use this URL to start the process
//in the frontend, we should just make this a function
//that is called when you press the button to go to
//the mail page
UserRouter.route('/test/start').get(function (req, res) {
  console.log('startAuth was called.');
  res.writeHead(302, {Location: getAuthUrl()})
  //response.writeHead(200, {'Content-Type': 'text/html'});
  //response.write('<p>Please <a href="' + authHelper.getAuthUrl() + '">sign in</a> with your Office 365 or Outlook.com account.</p>');
  res.end();
});

//this is where the office login pages returns you to.
//you decide this URL in the outlook API page online.
//but you also gotta make sure it matches up with a
//couple other lines of code here
UserRouter.route('/test/office').get(function (req, res) {
  console.log("got this shit yo");

  console.log('Request handler \'authorize\' was called.');
  // The authorization code is passed as a query parameter
  var url_parts = url.parse(req.url, true);
  var code = url_parts.query.code;
  console.log('Code: ' + code);
  getTokenFromCode(code, tokenReceived, res);

});

//after it returns to /test/office, it eventually gets routed to
//here, which is what actually uses the api. In the frontend,
//it would probably be best if this is just a function that
//we could call instead of actually routing.
UserRouter.route('/test/mail').get(function (request, response) {
  getAccessToken(request, response, function(error, token) {
    console.log('Token found in cookie: ', token);
    var email = getValueFromCookie('node-tutorial-email', request.headers.cookie);
    console.log('Email found in cookie: ', email);
    if (token) {
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write('<div><h1>Your inbox</h1></div>');

      // Create a Graph client
      var client = microsoftGraph.Client.init({
        authProvider: (done) => {
          // Just return the token
          done(null, token);
        }
      });

      // Get the 10 newest messages
      client
        .api('/me/mailfolders/inbox/messages')
        .header('X-AnchorMailbox', email)
        .top(10)
        .select('subject,from,receivedDateTime,isRead')
        .orderby('receivedDateTime DESC')
        .get((err, res) => {
          if (err) {
            console.log('getMessages returned an error: ' + err);
            response.write('<p>ERROR: ' + err + '</p>');
            response.end();
          } else {
            console.log('getMessages returned ' + res.value.length + ' messages.');
            response.write('<table><tr><th>From</th><th>Subject</th><th>Received</th></tr>');
            res.value.forEach(function(message) {
              console.log('  Subject: ' + message.subject);
              var from = message.from ? message.from.emailAddress.name : 'NONE';
              response.write('<tr><td>' + from +
                '</td><td>' + (message.isRead ? '' : '<b>') + message.subject + (message.isRead ? '' : '</b>') +
                '</td><td>' + message.receivedDateTime.toString() + '</td></tr>');
            });

            response.write('</table>');
            response.end();
          }
        });
    } else {
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write('<p> No token found in cookie!</p>');
      response.end();
    }
  });
});

//this is a helper function
//it is here to safe the users email for
//making it easier to do some of the
//functionalities (not sure which)
function getUserEmail(token, callback) {
  // Create a Graph client
  var client = microsoftGraph.Client.init({
    authProvider: (done) => {
      // Just return the token
      done(null, token);
    }
  });

  // Get the Graph /Me endpoint to get user email address
  client
    .api('/me')
    .get((err, res) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res.mail);
      }
    });
}

//this is a helper function
//get the tokens that you receive so that they
//are saved in the browser so that it can stay
//logged in.
//This is the function that will end up calling
//the mail route/function.
function tokenReceived(response, error, token) {
  if (error) {
    console.log('Access token error: ', error.message);
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write('<p>ERROR: ' + error + '</p>');
    response.end();
  } else {
    getUserEmail(token.token.access_token, function(error, email){
      if (error) {
        console.log('getUserEmail returned an error: ' + error);
        response.write('<p>ERROR: ' + error + '</p>');
        response.end();
      } else if (email) {
        var cookies = ['node-tutorial-token=' + token.token.access_token + ';Max-Age=4000',
                       'node-tutorial-refresh-token=' + token.token.refresh_token + ';Max-Age=4000',
                       'node-tutorial-token-expires=' + token.token.expires_at.getTime() + ';Max-Age=4000',
                       'node-tutorial-email=' + email + ';Max-Age=4000'];
        response.setHeader('Set-Cookie', cookies);
        response.writeHead(302, {'Location': 'http://localhost:4200/userinfos/test/mail'});
        //response.writeHead(200);
        //mail(response);
        response.end();
      }
    });
  }
}

//this is a helper function
//retreive the information from you cookies,
//which is the saved tokens for staying logged in
function getValueFromCookie(valueName, cookie) {
  if (cookie.indexOf(valueName) !== -1) {
    var start = cookie.indexOf(valueName) + valueName.length + 1;
    var end = cookie.indexOf(';', start);
    end = end === -1 ? cookie.length : end;
    return cookie.substring(start, end);
  }
}

//this is a helper function
//inteded to refresh your tokens when they get too
//old, so that you can stay logged in forever.
function getAccessToken(request, response, callback) {
  var expiration = new Date(parseFloat(getValueFromCookie('node-tutorial-token-expires', request.headers.cookie)));

  if (expiration <= new Date()) {
    // refresh token
    console.log('TOKEN EXPIRED, REFRESHING');
    var refresh_token = getValueFromCookie('node-tutorial-refresh-token', request.headers.cookie);
    authHelper.refreshAccessToken(refresh_token, function(error, newToken){
      if (error) {
        callback(error, null);
      } else if (newToken) {
        var cookies = ['node-tutorial-token=' + newToken.token.access_token + ';Max-Age=4000',
                       'node-tutorial-refresh-token=' + newToken.token.refresh_token + ';Max-Age=4000',
                       'node-tutorial-token-expires=' + newToken.token.expires_at.getTime() + ';Max-Age=4000'];
        response.setHeader('Set-Cookie', cookies);
        callback(null, newToken.token.access_token);
      }
    });
  } else {
    // Return cached token
    var access_token = getValueFromCookie('node-tutorial-token', request.headers.cookie);
    callback(null, access_token);
  }
}

//this is the function form of the mail printing.
//gotta figure out how to do this, hopefully the
//syntax n shit is the same.
function mail(response, request) {
  getAccessToken(request, response, function(error, token) {
    console.log('Token found in cookie: ', token);
    var email = getValueFromCookie('node-tutorial-email', request.headers.cookie);
    console.log('Email found in cookie: ', email);
    if (token) {
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write('<div><h1>Your inbox</h1></div>');

      // Create a Graph client
      var client = microsoftGraph.Client.init({
        authProvider: (done) => {
          // Just return the token
          done(null, token);
        }
      });

      // Get the 10 newest messages
      client
        .api('/me/mailfolders/inbox/messages')
        .header('X-AnchorMailbox', email)
        .top(10)
        .select('subject,from,receivedDateTime,isRead')
        .orderby('receivedDateTime DESC')
        .get((err, res) => {
          if (err) {
            console.log('getMessages returned an error: ' + err);
            response.write('<p>ERROR: ' + err + '</p>');
            response.end();
          } else {
            console.log('getMessages returned ' + res.value.length + ' messages.');
            response.write('<table><tr><th>From</th><th>Subject</th><th>Received</th></tr>');
            res.value.forEach(function(message) {
              console.log('  Subject: ' + message.subject);
              var from = message.from ? message.from.emailAddress.name : 'NONE';
              response.wr
              ite('<tr><td>' + from +
                '</td><td>' + (message.isRead ? '' : '<b>') + message.subject + (message.isRead ? '' : '</b>') +
                '</td><td>' + message.receivedDateTime.toString() + '</td></tr>');
            });

            response.write('</table>');
            response.end();
          }
        });
    } else {
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write('<p> No token found in cookie!</p>');
      response.end();
    }
  });
}

//this is a helper function
//just gets a specific URL
//that is necessary for
//oAuth2, which changes
function getAuthUrl() {
  var returnVal = oauth2.authorizationCode.authorizeURL({
    redirect_uri: redirectUri,
    scope: scopes.join(' ')
  });
  console.log('Generated auth url: ' + returnVal);
  return returnVal;
}

//this is a helper function
//parse up the code so that it's ready to be used by
//the refreshtoken shit and stuff like that, i think.
function getTokenFromCode(auth_code, callback, response) {
  var token;
  oauth2.authorizationCode.getToken({
    code: auth_code,
    redirect_uri: redirectUri,
    scope: scopes.join(' ')
  }, function (error, result) {
    if (error) {
      console.log('Access token error: ', error.message);
      callback(response, error, null);
    } else {
      token = oauth2.accessToken.create(result);
      console.log('Token created: ', token.token);
      callback(response, null, token);
    }
  });
}

//this is a helper function
//just gets a new token, I believe.
function refreshAccessToken(refreshToken, callback) {
  var tokenObj = oauth2.accessToken.create({refresh_token: refreshToken});
  tokenObj.refresh(callback);
}

/////////////////////////////////////
//END SECTION FOR OUTLOOK API STUFF//
/////////////////////////////////////



// Require UserInfo model in our routes module
var UserInfo = require('../models/UserInfo');

// Defined store route
UserRouter.route('/add/post').post(function (req, res) {
  var info = new UserInfo(req.body);
  console.log(info);
      info.save()
    .then(info => {
      //var obj = {bool: true}
      res.json('UserInfo added successfully');
      //res.json(info);
    })
    .catch(err => {
    res.status(400).send("unable to save to database");
    });
});

// Authenticate user with ID and Password
UserRouter.route('/authenticate-password').post(function (req, res) {
  var info = req.body;
  var user = info['userID'];
  var pass = info['userPassword'];

  if(user === '') user = '123';
  UserInfo.find({ userID: user, userPassword: pass}, function (err, itms){
    if(err){
      console.log(err);
    }

    else {
      res.json(itms);
    }
  });
})

// Retrieve list of APIs
UserRouter.route('/get-apis').post(function (req, res) {
  var info = req.body;
  var user = info['userID'];
  var pass = info['userPassword'];
  console.log(info);

  UserInfo.find({ userID: user, userPassword: pass}, function (err, itms){
    if(err){
      console.log(err);
    }
    else {
      res.json(itms);
    }
  });
})

// Authenticate user with ID and Email
UserRouter.route('/authenticate-email').post(function (req, res) {
  var info = req.body;
  var user = info['userID'];
  var email = info['userEmail'];

  if(user === '') user = '123';
  UserInfo.find({ userID: user, userEmail: email}, function (err, itms){
    if(err){
      console.log(err);
    }
    else {
      res.json(itms);
    }
  });
})

//Check if email exists in database
UserRouter.route('/check-email').post(function (req, res) {
  var info = req.body;
  var email = info['userEmail'];

  UserInfo.find({userEmail: email}, function (err, itms){
    if(err){
      console.log(err);
    }
    else {
      res.json(itms);
    }
  });
})

//Check if username exists in database
UserRouter.route('/check-user').post(function (req, res) {
  var info = req.body;
  var user = info['userID'];

  if(user === '') user = '123';
  UserInfo.find({userID: user}, function (err, itms){
    if(err){
      console.log(err);
    }
    else {
      res.json(itms);
    }
  });
})

// Revise password of specific UserID
UserRouter.route('/revise-password').post(function (req, res) {
  var info = req.body;
  var user = info['userID'];
  var pass = info['userPassword'];

  if(user === '') user = '123';
  var query = {userID: user};

  UserInfo.findOneAndUpdate(query, { userPassword: pass }, function (err, itms){
    if(err){
      console.log(err);
    }
    else {
      res.json(itms);
    }
  });
})

// Retrieve password of specific UserID
UserRouter.route('/getPassword').post(function (req, res) {
  var info = req.body;
  var user = info['userID'];
  var query = {userID: user};

  UserInfo.find(query, function (err, itms){
    if(err){
      console.log(err);
    }
    else {
      res.json(itms);
    }
  });
})

// Update API list of specific USER
UserRouter.route('/save-api').post(function (req, res) {
  var info = req.body;
  var user = info['userID'];
  var pass = info['userPassword'];
  var api = info['apiLogin'];

  if(user === '') user = '123';
  var query = {userID: user, userPassword: pass};


  UserInfo.findOneAndUpdate(query, { apiLogin: api }, function (err, itms){
    if(err){
      console.log(err);
    }
    else {
      res.json(itms);
    }
  });
})

// Defined get data(index or listing) route
UserRouter.route('/').get(function (req, res) {
  UserInfo.find(function (err, itms){
    if(err){
      console.log(err);
    }
    else {
      res.json(itms);
    }
  });
});


var nodemailer = require('nodemailer');

//Sends email to user
UserRouter.route('/send-email').post(function (req, res) {
      var sender = 'smtps://uhubcontact%40gmail.com';
      var password = 'Uhubpassword';
      var transporter = nodemailer.createTransport(sender + ':' + password + '@smtp.gmail.com');
      let mailOptions = {
          from: '"UniversityHub" <uhubcontact@gmail.com>', // sender address
          to: req.body.to, // list of receivers
          subject: req.body.subject, // Subject line
          text: req.body.body, // plain text body
          html: req.body.body, // html body
      };

      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              return console.log(error);
          }
          console.log('Message %s sent: %s', info.messageId, info.response);
              res.render('index');
          });
});



module.exports = UserRouter;
