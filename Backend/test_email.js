const nodemailer = require('nodemailer');

const start = async () => {
    console.log('Using EMAIL_USER:', process.env.EMAIL_USER);
    console.log('Using EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `"QuickServe Test" <${process.env.EMAIL_USER}>`,
        to: 'hmamulat_customer@gmail.com',
        subject: 'QuickServe OTP Test',
        text: 'This is a test email from QuickServe'
    };

    try {
        console.log('Sending test email...');
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!', info.messageId);
    } catch (error) {
        console.error('Email sending failed with error:', error.message);
    }
};

start();
