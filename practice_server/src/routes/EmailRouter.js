var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var port = 4200;
var cors = require('cors');
var EmailRouter = express.Router();

var nodemailer = require('nodemailer');

EmailRouter.route('/send-email').post(function (req, res) {
      let transporter = nodeMailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
              user: 'uhubcontact@gmail.com',
              pass: 'Uhubpassword'
          }
      });
      let mailOptions = {
          from: '"UHUB SON" <uhubcontact@gmail.com>', // sender address
          to: req.body.to, // list of receivers
          subject: req.body.subject, // Subject line
          text: req.body.body, // plain text body
          html: '<b>NodeJS Email Tutorial</b>' // html body
      };

      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              return console.log(error);
          }
          console.log('Message %s sent: %s', info.messageId, info.response);
              res.render('index');
          });
});
