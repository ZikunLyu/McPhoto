const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
const fs = require('fs');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstname = user.name.split(' ')[0];
    this.url = url;
    this.from = `McGallery NOREPLY <${process.env.MCGALLERY_NOREPLY_EMAIL}>`;
  }

  Transport() {
    if (process.env.NODE_ENV === 'production') {
      return 1;
    }
    return nodemailer.createTransport({
      //service: 'Gamil',
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async send(template, subject) {
    // 1) pass in the template
    const html = fs.readFileSync(
      `${__dirname}/../email-Templates/${template}.html`
    );
    // 2) Define email option
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    };

    // 3) Create the transport and send email
    await this.Transport().sendMail(mailOptions);
  }

  async sendVerification() {
    await this.send('verificationEmail', 'Last step to join McGallery!');
  }
};
