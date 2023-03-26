const transporter = require("../config/emailConfig");
const emailHtml = require("../helpers/emailHtml");

class EmailServices {
  async sendEmailService(toEmail, name, otp, expiresTime) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: toEmail,
      subject: "Email Varification",
      html: emailHtml(toEmail, name, otp, expiresTime),
    };

    return transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("Email Send Error ", error);
        return false;
      } else {
        // console.log("Email Send Info ", info);
        return true;
      }
    });
  }
}

module.exports = new EmailServices();
