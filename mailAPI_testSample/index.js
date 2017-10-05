var server = require('./server');
var router = require('./router');
var authHelper = require('./authHelper');
var url = require('url');
var microsoftGraph = require("@microsoft/microsoft-graph-client")

//VARIABLES FOR THE DIFFERENT PAGES
var handle = {};
handle['/'] = home;
handle['/authorize'] = authorize;   //WE NEVER REALLY CALL THIS
handle['/mail'] = mail;             //WE NEVER REALLY CALL THIS
handle['/calendar'] = calendar;     //FOR CALENDAR: YOU GOTTA
                                    //ACTUALLY GOTO '/CALENDAR'

//FOR npm start
server.start(router.route, handle);

//THIS IS THE HOME/SPLASH SCREEN
function home(response, request) {
  console.log('Request handler \'home\' was called.');
  response.writeHead(200, {'Content-Type': 'text/html'});
   response.write('<p>Please <a href="' + authHelper.getAuthUrl() + '">sign in</a> with your Office 365 or Outlook.com account.</p>');
  //THE ABOVE LINE IS WHAT USES OUR APPID AND CODE, TO GET THE LINK TO THE LOGIN SCREEN ^^^^^
   response.end();
}

//THIS IS CALLED WHEN RETURNING FROM THE LOGIN SCREEN
function authorize(response, request) {
  console.log('Request handler \'authorize\' was called.');

  // The authorization code is passed as a query parameter
  var url_parts = url.parse(request.url, true);
  var code = url_parts.query.code;
  console.log('Code: ' + code);
  authHelper.getTokenFromCode(code, tokenReceived, response);   //THIS JUST FORMATS THE STRING FOR THE TOKEN STUFF AND RESPONDS
}

//GET THE USERS EMAIL USING THE TOKEN RECEIVED FROM LOGIN
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

//THIS IS A CALLBACK FUNCTION BECAUSE GETTING THE EMAIL IS ASYNCH
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
        response.writeHead(302, {'Location': 'http://localhost:8000/mail'});
        response.end();
      }
    });
  }
}

//HELPER FUNCTION TO GET THE COOKIE VALUE STUFF
function getValueFromCookie(valueName, cookie) {
  if (cookie.indexOf(valueName) !== -1) {                         //THIS MUST MEAN THAT -1 IS BAD/NO COOKIE
    var start = cookie.indexOf(valueName) + valueName.length + 1;
    var end = cookie.indexOf(';', start);
    end = end === -1 ? cookie.length : end;
    return cookie.substring(start, end);
  }
}

//CHECK THE TOKEN RECEIVED FROM EMAIL, WILL REFRESH IF NECESSARY
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

//THIS IS THE ACTUAL MAIL API USE
function mail(response, request) {
  getAccessToken(request, response, function(error, token) {    
    console.log('Token found in cookie: ', token);
    var email = getValueFromCookie('node-tutorial-email', request.headers.cookie);  //NOT EXACTLY SURE, BUT WE CAN CHANGE?
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
        .api('/me/mailfolders/inbox/messages')      //THIS IS THE FOLDER IT GET EMAILS FROM
        .header('X-AnchorMailbox', email)           //THIS IS WHY WE GOT EMAIL, FOR EFFICIENCY
        .top(10)                                    //TOP = LIMITS TO FIRST 10 RESULTS
        .select('subject,from,receivedDateTime,isRead')   //WHAT TO REQUEST FROM EACH EMAIL: SUBJECT, FROM, DATE, READ STATS
        .orderby('receivedDateTime DESC')           //IN WHAT ORDER TO SHOW, RECEIVEDDATETIME DESC = NEWEST FIRST
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
}

//THIS CALLS THE CALENDAR API
function calendar(response, request) {
  getAccessToken(request, response, function(error, token) {
    console.log('Token found in cookie: ', token);
    var email = getValueFromCookie('node-tutorial-email', request.headers.cookie);
    console.log('Email found in cookie: ', email);
    if (token) {
      response.writeHead(200, {'Content-Type': 'text/html'});
response.write('<div><h1>Your calendar</h1></div>');

// Create a Graph client
var client = microsoftGraph.Client.init({
  authProvider: (done) => {
    // Just return the token
    done(null, token);
  }
});

// Get the 10 events with the greatest start date
client
  .api('/me/events')
  .header('X-AnchorMailbox', email)
  .top(10)
  .select('subject,start,end')
  .orderby('start/dateTime DESC')
  .get((err, res) => {
    if (err) {
      console.log('getEvents returned an error: ' + err);
      response.write('<p>ERROR: ' + err + '</p>');
      response.end();
    } else {
      console.log('getEvents returned ' + res.value.length + ' events.');
      response.write('<table><tr><th>Subject</th><th>Start</th><th>End</th><th>Attendees</th></tr>');
      res.value.forEach(function(event) {
        console.log('  Subject: ' + event.subject);
        response.write('<tr><td>' + event.subject +
          '</td><td>' + event.start.dateTime.toString() +
          '</td><td>' + event.end.dateTime.toString() + '</td></tr>');
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

