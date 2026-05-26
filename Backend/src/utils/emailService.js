const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other services like 'smtp' for SendGrid
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOTPEmail = async (toEmail, otp) => {
    try {
        const mailOptions = {
            from: `"QuickServe" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: 'Your Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #4F46E5; text-align: center;">QuickServe Verification</h2>
                    <p style="font-size: 16px; color: #333;">Hello,</p>
                    <p style="font-size: 16px; color: #333;">Please use the verification code below to complete your sign in:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111; padding: 10px 20px; background-color: #f3f4f6; border-radius: 8px;">
                            ${otp}
                        </span>
                    </div>
                    <p style="font-size: 14px; color: #666; text-align: center;">This code will expire in 10 minutes.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #999; text-align: center;">If you didn't request this code, you can safely ignore this email.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${toEmail}. Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`Failed to send email to ${toEmail}:`, error.message);
        console.log(`[DEV MODE] You can use this OTP: ${otp}`);
        return true;
    }
};

const sendNewProviderEmailToAdmin = async (adminEmail, providerName, aiStatus, aiMessage) => {
    try {
        const mailOptions = {
            from: `"QuickServe Admin" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: 'New Provider Application Pending Review',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #f97316; text-align: center;">New Provider Application</h2>
                    <p style="font-size: 16px; color: #333;">Hello Admin,</p>
                    <p style="font-size: 16px; color: #333;">A new provider, <strong>${providerName}</strong>, has just registered and is awaiting manual review of their documents.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="margin-top: 0; color: #111;">AI Verification Summary:</h4>
                        <p style="margin: 5px 0;"><strong>Status:</strong> ${aiStatus}</p>
                        <p style="margin: 5px 0;"><strong>Details:</strong> ${aiMessage}</p>
                    </div>

                    <p style="font-size: 16px; color: #333;">Please log in to the admin dashboard to review their educational documents and approve or reject their application.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/pending" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                            Go to Verification Queue
                        </a>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Admin notification email sent successfully to ${adminEmail}. Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`Failed to send admin notification email to ${adminEmail}:`, error.message);
        return false;
    }
};

const sendDisputeEmail = async (providerEmail, subject, text) => {
    try {
        const mailOptions = {
            from: `"QuickServe Admin" <${process.env.EMAIL_USER}>`,
            to: providerEmail,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #ef4444; text-align: center;">New Dispute Filed</h2>
                    <p style="font-size: 16px; color: #333;">Hello Provider,</p>
                    <p style="font-size: 16px; color: #333;">${text}</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/provider/complaints" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                            View Dispute Details
                        </a>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Dispute email sent successfully to ${providerEmail}. Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`Failed to send dispute email to ${providerEmail}:`, error.message);
        throw error; // Rethrow to let the controller catch it
    }
};

const sendStatusUpdateEmail = async (providerEmail, status) => {
    try {
        let titleColor = status === 'suspended' ? '#ef4444' : '#10b981';
        let statusMessage = status === 'suspended' 
            ? 'Your account has been suspended by the administrator.' 
            : `Your account status has been updated to: ${status}.`;

        const mailOptions = {
            from: `"QuickServe Admin" <${process.env.EMAIL_USER}>`,
            to: providerEmail,
            subject: 'Account Status Update',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: ${titleColor}; text-align: center;">Account Status Update</h2>
                    <p style="font-size: 16px; color: #333;">Hello Provider,</p>
                    <p style="font-size: 16px; color: #333;">${statusMessage}</p>
                    <p style="font-size: 14px; color: #666;">If you have any questions or believe this was a mistake, please contact support.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Status update email sent successfully to ${providerEmail}. Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`Failed to send status update email to ${providerEmail}:`, error.message);
        // Do not throw so it doesn't break the controller flow
        return false;
    }
};

module.exports = {
    sendOTPEmail,
    sendNewProviderEmailToAdmin,
    sendDisputeEmail,
    sendStatusUpdateEmail
};
