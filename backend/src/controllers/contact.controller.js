const nodemailer = require('nodemailer');

// Create a transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL, // Your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD // Your Gmail App Password (not your regular password)
  }
});

/**
 * Send a thank you email to the user
 */
const sendThankYouEmail = async (toEmail, userName, userMessage) => {
  const mailOptions = {
    from: `"Analytical Advisors" <${process.env.GMAIL_EMAIL}>`,
    to: toEmail,
    subject: 'Thank you for contacting us!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank You for Contacting Us, ${userName}!</h2>
        <p>We've received your message and will get back to you as soon as possible.</p>
        <p>Here's a copy of the information you sent us:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          ${userMessage.replace(/\n/g, '<br>')}
        </div>
        <p>If you have any urgent inquiries, feel free to reply to this email.</p>
        <p>Best regards,<br/>The Analytical Advisors Team</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Handle contact form submission
 */
const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and message are required fields' 
      });
    }

    // Email to admin
    const adminMailOptions = {
      from: `"${name}" <${email}>`,
      to: process.env.GMAIL_EMAIL,
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p style="margin-top: 20px; color: #666; font-size: 0.9em;">
            This message was sent from the contact form on your website.
          </p>
        </div>
      `
    };

    // Send both emails in parallel
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      sendThankYouEmail(email, name, message)
    ]);

    res.status(200).json({ 
      success: true, 
      message: 'Message sent successfully' 
    });

  } catch (error) {
    console.error('Error in contact form submission:', error);
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  submitContactForm
};
