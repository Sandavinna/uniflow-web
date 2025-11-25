let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch (error) {
  console.warn('Nodemailer not installed. Email functionality will be disabled.');
}

const sendEmail = async (options) => {
  // If nodemailer is not installed, just log the email
  if (!nodemailer) {
    console.log('='.repeat(50));
    console.log('EMAIL NOT SENT (Nodemailer not installed)');
    console.log('To:', options.email);
    console.log('Subject:', options.subject);
    console.log('Reset Link:', options.resetUrl);
    console.log('='.repeat(50));
    return { success: true, message: 'Email logged (nodemailer not installed)' };
  }

  // If no email credentials are set, log the email instead of sending
  const emailUser = process.env.SMTP_EMAIL || process.env.EMAIL_USER;
  const emailPass = process.env.SMTP_PASSWORD || process.env.EMAIL_PASS;
  
  if (!emailUser || !emailPass) {
    console.log('='.repeat(50));
    console.log('EMAIL NOT SENT (No SMTP configured)');
    console.log('To:', options.email);
    console.log('Subject:', options.subject);
    if (options.resetUrl) {
      console.log('Reset Link:', options.resetUrl);
    }
    console.log('='.repeat(50));
    // Return success so the flow continues - email is logged instead of sent
    return { success: true, message: 'Email logged (SMTP not configured)' };
  }

  // Create transporter
  // For development, we'll use a simple SMTP setup
  // In production, use proper email service like SendGrid, Mailgun, etc.
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const message = {
      from: `${process.env.FROM_NAME || 'UniFlow'} <${process.env.FROM_EMAIL || emailUser}>`,
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    const info = await transporter.sendMail(message);
    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error.message);
    // In development, still log the email even if sending fails
    console.log('='.repeat(50));
    console.log('EMAIL SEND FAILED - Logging instead:');
    console.log('To:', options.email);
    console.log('Subject:', options.subject);
    if (options.resetUrl) {
      console.log('Reset Link:', options.resetUrl);
    }
    console.log('='.repeat(50));
    // Return success anyway so password reset flow continues - email is logged
    return { success: true, message: 'Email logged (sending failed)' };
  }
};

module.exports = sendEmail;

