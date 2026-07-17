const nodemailer = require('nodemailer');

// @desc    Submit contact / issue / suggestion form
// @route   POST /api/contact
// @access  Public
const submitContactForm = async (req, res) => {
  try {
    const { name, email, type, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message.'
      });
    }

    const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
    const emailPass = process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;
    const emailReceiver = process.env.EMAIL_RECEIVER || emailUser || 'devtinder93@gmail.com';

    if (!emailUser || !emailPass) {
      console.warn('⚠️ Nodemailer credentials missing in environment variables (EMAIL_USER/EMAIL_PASS).');
      return res.status(503).json({
        success: false,
        message: 'Email service is not configured on the server yet.'
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    const category = type || subject || 'General Inquiry';

    // 1. Send notification mail to Admin / Receiver
    const adminMailOptions = {
      from: `"${name}" <${emailUser}>`,
      replyTo: email,
      to: emailReceiver,
      subject: `[DevConnect ${category}] Submission from ${name}`,
      html: `
        <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-w-xl mx-auto border border-[#e5e5e5] rounded-xl p-6 bg-white text-[#171717]">
          <div style="border-bottom: 1px solid #e5e5e5; padding-bottom: 12px; margin-bottom: 20px;">
            <span style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600;">DevConnect Submission</span>
            <h2 style="font-size: 20px; font-weight: 600; margin: 12px 0 4px 0; color: #0a0a0a;">New ${category} Received</h2>
          </div>
          
          <div style="margin-bottom: 20px; font-size: 14px; line-height: 1.6;">
            <p style="margin: 4px 0;"><strong style="color: #404040;">Name:</strong> ${name}</p>
            <p style="margin: 4px 0;"><strong style="color: #404040;">Email:</strong> <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></p>
            <p style="margin: 4px 0;"><strong style="color: #404040;">Category:</strong> ${category}</p>
          </div>

          <div style="background-color: #f5f5f5; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="font-size: 12px; font-weight: 600; color: #737373; text-transform: uppercase; margin: 0 0 8px 0; letter-spacing: 0.05em;">Message Content</p>
            <p style="font-size: 14px; color: #171717; margin: 0; white-space: pre-wrap; line-height: 1.5;">${message}</p>
          </div>

          <div style="font-size: 12px; color: #737373; border-top: 1px solid #e5e5e5; padding-top: 12px;">
            Submitted via DevConnect Contact Form on ${new Date().toUTCString()}
          </div>
        </div>
      `
    };

    // 2. Send receipt/confirmation mail to Submitter
    const userMailOptions = {
      from: `"DevConnect Team" <${emailUser}>`,
      to: email,
      subject: `We received your ${category.toLowerCase()} — DevConnect`,
      html: `
        <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-w-xl mx-auto border border-[#e5e5e5] rounded-xl p-6 bg-white text-[#171717]">
          <div style="border-bottom: 1px solid #e5e5e5; padding-bottom: 12px; margin-bottom: 20px;">
            <h2 style="font-size: 20px; font-weight: 600; margin: 0; color: #0a0a0a;">Thank you for reaching out, ${name}!</h2>
          </div>
          
          <p style="font-size: 14px; line-height: 1.6; color: #404040;">
            We have successfully received your <strong>${category.toLowerCase()}</strong> and our team has been notified. We carefully review every message, suggestion, and bug report to make DevConnect better for developers.
          </p>

          <div style="background-color: #f5f5f5; border: 1px solid #e5e5e5; border-radius: 8px; p-4 padding: 16px; margin: 20px 0;">
            <p style="font-size: 12px; font-weight: 600; color: #737373; margin: 0 0 6px 0;">Your Summary:</p>
            <p style="font-size: 13px; color: #171717; margin: 0; white-space: pre-wrap;">"${message}"</p>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #404040;">
            If your inquiry requires follow-up, someone from our engineering team will get back to you shortly at <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a>.
          </p>

          <div style="margin-top: 28px; font-size: 12px; color: #737373; border-top: 1px solid #e5e5e5; padding-top: 12px;">
            Happy building,<br>
            <strong>The DevConnect Team</strong>
          </div>
        </div>
      `
    };

    // Send both emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    return res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully! Check your inbox for confirmation.'
    });
  } catch (error) {
    console.error('Nodemailer Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send email due to a server error.'
    });
  }
};

module.exports = {
  submitContactForm
};
