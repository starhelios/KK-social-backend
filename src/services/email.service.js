const sgMail = require('@sendgrid/mail');
const moment = require('moment');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, text) => {
  const msg = { from: process.env.EMAIL_FROM, to, subject, text };
  await sgMail.send(msg).then(
    (response) => {
      console.log(response);
    },
    (error) => {
      console.error(error);

      if (error.response) {
        console.error('error...', error.response.body);
      }
    }
  );
};

const sendResetPasswordEmail = async (to, token) => {
  const subject = 'Reset password';
  // replace this url with the link to the reset password page of your front-end app
  const resetPasswordUrl = `${process.env.FRONTENT_ENDPOINT}?token=${token}`;
  const text = `Dear user,
  To reset your password, click on this link, then click login \n\n${resetPasswordUrl}\n\n

  If you did not request any password resets, then ignore this email.`;
  await sendEmail(to, subject, text);
};

const sendPurchaseConfirmationEmail = async (to, experience_name, host_name) => {
  const subject = `KloutKast booking confirmation #${moment().format('DD-MM-YYYY HH:mm')}`;
  // replace this url with the link to the reset password page of your front-end app
  // const resetPasswordUrl = `${process.env.FRONTENT_ENDPOINT}?token=${token}`;
  const text = `Dear user,
  This is your confirmation email for booking experience: ${experience_name} with ${host_name}.
  Your host has been notified.
  
  Regards,

  KloutKast Team`;
  await sendEmail(to, subject, text);
};

module.exports = {
  sendEmail,
  sendResetPasswordEmail,
  sendPurchaseConfirmationEmail,
};
