// import node mailer
const nodeMailer = require('nodemailer');
const config = require('../utils/config.js');

const  sendEmail = (to,subject,htmlContent) => {

  // create Transport - smtp,imap etc .. 
const transporter = nodeMailer.createTransport({
  service: 'gmail',
  host: "smtp.gmail.com",
  port: 587,
  secure: false,// if port 465 then secure is true ,else 587 then secure is false 
  auth: {
    user: config.UserName,
    pass: config.Password,
  },
});

const info = transporter.sendMail({
  from: config.UserName, // sender address
  to: to, // list of receivers
  subject: subject, // Subject line
  //  text: text, // plain text body
  html: htmlContent, // html body
});

return info;

}

module.exports = sendEmail;