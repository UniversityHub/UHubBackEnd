//THIS IS ALL HELPER FUNCTIONS FOR ALL OF THE 
//AUTHENTIFICATION SHIT THAT HAS TO HAPPEN.


//BEGIN SECTION ON DOING INITIAL LOGIN//
var credentials = {
  client: {
    id: '144ef094-6c6c-44ea-aad0-320c524ef96b',       //APPID
    secret: 'yvQbOzk8iKFFfV0cMVPwEnj',                //APP PASSWORD
  },
  auth: {
    tokenHost: 'https://login.microsoftonline.com',
    authorizePath: 'common/oauth2/v2.0/authorize',
    tokenPath: 'common/oauth2/v2.0/token'
  }
};
var oauth2 = require('simple-oauth2').create(credentials);

var redirectUri = 'http://localhost:8000/authorize';

// The scopes the app requires
var scopes = [ 'openid',            //THESE ARE THE PERMISSIONS THE 
               'offline_access',    //IS REQUESTING FROM OFFICE
               'User.Read',
               'Mail.Read' ];

function getAuthUrl() {
  var returnVal = oauth2.authorizationCode.authorizeURL({
    redirect_uri: redirectUri,
    scope: scopes.join(' ')
  });
  console.log('Generated auth url: ' + returnVal);
  return returnVal;
}

exports.getAuthUrl = getAuthUrl;
//^^END SECTION ON DOING INITIAL LOGIN^^//


//BEGIN SECTION ON GETTING THE TOKEN RETURNED FROM LOGIN//
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

exports.getTokenFromCode = getTokenFromCode;
//^^END SECTION ON GETTING TOKEN RETURNED FROM LOGIN^^//

//BEGIN SECTION ON GETTING A TOKEN SO THAT YOU CAN REFRESH//
function refreshAccessToken(refreshToken, callback) {
  var tokenObj = oauth2.accessToken.create({refresh_token: refreshToken});
  tokenObj.refresh(callback);
}

exports.refreshAccessToken = refreshAccessToken;
//^^END SECTION ON GETTING A TOKEN SO THAT YOU CAN REFRESH^^//

