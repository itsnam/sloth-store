const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "plantial.auth@gmail.com",
        pass: "rtiv wzzz bijq suqs"
    }
  });

  const mailOptions = {
    from: 'plantial.auth@gmail.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;