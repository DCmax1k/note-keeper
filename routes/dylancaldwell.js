const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'notekeeperapi@gmail.com',
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

router.post('/emailsubmission', async (req, res) => {
  try {
    const mailOptions = {
      from: 'Note Keeper',
      to: 'dylan.caldwell35@gmail.com',
      subject: 'Contact Form Submission',
      html: `
                <h1>Name:</h1>
                <br />
                <h3>${req.body.name}</h3>
                <br />
                <hr />
                <br />
                <h1>Email:</h1>
                <br />
                <h3>${req.body.email}</h3>
                <br />
                <hr />
                <br />
                <h1>Message:</h1>
                <br />
                <h3>${req.body.message}</h3>
            `,
    };
    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        return console.error(err);
      }
    });
    res.redirect('https://www.dylancaldwell.tk/thanks');
  } catch (err) {
    console.error(err);
    res.redirect('https://www.dylancaldwell.tk');
  }
});

module.exports = router;
