const nodemailer = require('nodemailer');

const mailUser = process.env.SMTP_USER || process.env.EMAIL_USER || 'your-email@gmail.com';
const mailPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || 'your-app-password';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: mailUser,
        pass: mailPass
    },
    tls: {
        rejectUnauthorized: false
    }
});

const sendEmail = async (options) => {
    const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'Organic Store'}" <${process.env.SMTP_FROM_EMAIL || mailUser}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { transporter, sendEmail };