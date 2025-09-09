const sgMail = require('@sendgrid/mail');
const admin = require('firebase-admin');

// Initialize SendGrid with API key if email is enabled
let emailEnabled = process.env.EMAIL_ENABLED !== 'false';

try {
  const apiKey = process.env.SENDGRID_API_KEY;
  
  // Check if API key exists and has valid format
  if (!apiKey || !apiKey.startsWith('SG.')) {
    console.warn('Invalid or missing SendGrid API key. Email functionality will be disabled.');
    emailEnabled = false;
  } else {
    sgMail.setApiKey(apiKey);
    console.log('SendGrid initialized successfully');
  }
} catch (error) {
  console.error('Error initializing SendGrid:', error);
  emailEnabled = false;
}

// Email templates
const emailTemplates = {
  welcome: {
    subject: 'Welcome to Analytical Advisors!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0D9488;">Welcome to Analytical Advisors!</h2>
        <p>Dear {{name}},</p>
        <p>Thank you for joining Analytical Advisors! We're excited to have you on board.</p>
        <p>Here's what you can expect from our platform:</p>
        <ul>
          <li>Expert stock analysis and insights</li>
          <li>Portfolio review and recommendations</li>
          <li>Personalized investment advisory services</li>
          <li>24/7 access to our AI assistant, Manisha</li>
        </ul>
        <p>To get started, log in to your account and explore our features. If you have any questions, our support team is here to help.</p>
        <p>Best regards,<br>The Analytical Advisors Team</p>
      </div>
    `
  },
  thankYou: {
    subject: 'Thank You for Subscribing to Analytical Advisors!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0D9488;">Thank You for Your Subscription!</h2>
        <p>Dear {{name}},</p>
        <p>We're thrilled to have you as a valued member of Analytical Advisors!</p>
        <p>Your subscription details:</p>
        <ul>
          <li>Plan: {{plan}}</li>
          <li>Start Date: {{startDate}}</li>
          <li>Next Billing Date: {{nextBillingDate}}</li>
        </ul>
        <p>You now have access to all our premium features. Don't hesitate to reach out if you need any assistance.</p>
        <p>Best regards,<br>The Analytical Advisors Team</p>
      </div>
    `
  },
  gettingStarted: {
    subject: 'Getting Started with Analytical Advisors',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0D9488;">Let's Get Started!</h2>
        <p>Dear {{name}},</p>
        <p>We hope you're enjoying your experience with Analytical Advisors. Here are some tips to help you make the most of our platform:</p>
        <ol>
          <li>Complete your profile to get personalized recommendations</li>
          <li>Try our AI assistant, Manisha, for quick answers to your investment questions</li>
          <li>Explore our portfolio analysis tools</li>
          <li>Set up your investment preferences</li>
        </ol>
        <p>Need help? Our support team is just an email away at analyticaladvisors@gmail.com</p>
        <p>Best regards,<br>The Analytical Advisors Team</p>
      </div>
    `
  },
  expiryReminder: {
    subject: 'Your Analytical Advisors Subscription is Expiring Soon',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0D9488;">Subscription Expiry Reminder</h2>
        <p>Dear {{name}},</p>
        <p>Your Analytical Advisors subscription will expire in {{daysLeft}} days.</p>
        <p>To continue enjoying our premium features, please renew your subscription before {{expiryDate}}.</p>
        <p>Click here to renew: <a href="{{renewalLink}}" style="color: #0D9488;">Renew Now</a></p>
        <p>Best regards,<br>The Analytical Advisors Team</p>
      </div>
    `
  },
  feedbackRequest: {
    subject: 'We Value Your Feedback',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0D9488;">Share Your Experience</h2>
        <p>Dear {{name}},</p>
        <p>We hope you're enjoying your experience with Analytical Advisors. Your feedback is important to us!</p>
        <p>Please take a moment to share your thoughts about our platform:</p>
        <p><a href="{{feedbackLink}}" style="color: #0D9488;">Share Your Feedback</a></p>
        <p>Your input helps us improve our services and better serve your investment needs.</p>
        <p>Best regards,<br>The Analytical Advisors Team</p>
      </div>
    `
  }
};

/**
 * Send a welcome email to new users
 * @param {string} email - User's email address
 * @param {string} name - User's name
 */
exports.sendWelcomeEmail = async (email, name) => {
  // Skip if email functionality is disabled
  if (!emailEnabled) {
    console.log('Email functionality is disabled. Skipping welcome email to:', email);
    return { success: true, info: 'Email sending skipped (disabled)' };
  }
  
  try {
    const msg = {
      to: email,
      from: 'support@analyticaladvisors.com',
      subject: emailTemplates.welcome.subject,
      html: emailTemplates.welcome.html.replace('{{name}}', name)
    };
    await sgMail.send(msg);
    console.log('Welcome email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send a thank you email after subscription
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @param {Object} subscriptionDetails - Subscription information
 */
exports.sendThankYouEmail = async (email, name, subscriptionDetails) => {
  // Skip if email functionality is disabled
  if (!emailEnabled) {
    console.log('Email functionality is disabled. Skipping thank you email to:', email);
    return { success: true, info: 'Email sending skipped (disabled)' };
  }
  
  try {
    let html = emailTemplates.thankYou.html
      .replace('{{name}}', name)
      .replace('{{plan}}', subscriptionDetails.plan || 'Premium')
      .replace('{{startDate}}', subscriptionDetails.startDate || new Date().toLocaleDateString())
      .replace('{{nextBillingDate}}', subscriptionDetails.nextBillingDate || 'N/A');

    const msg = {
      to: email,
      from: 'support@analyticaladvisors.com',
      subject: emailTemplates.thankYou.subject,
      html
    };
    await sgMail.send(msg);
    console.log('Thank you email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('Error sending thank you email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send getting started tips
 * @param {string} email - User's email address
 * @param {string} name - User's name
 */
exports.sendGettingStartedEmail = async (email, name) => {
  try {
    const msg = {
      to: email,
      from: 'support@analyticaladvisors.com',
      subject: emailTemplates.gettingStarted.subject,
      html: emailTemplates.gettingStarted.html.replace('{{name}}', name)
    };
    await sgMail.send(msg);
    console.log('Getting started email sent to:', email);
  } catch (error) {
    console.error('Error sending getting started email:', error);
    throw error;
  }
};

/**
 * Send subscription expiry reminder
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @param {Object} expiryDetails - Expiry information
 */
exports.sendExpiryReminder = async (email, name, expiryDetails) => {
  try {
    let html = emailTemplates.expiryReminder.html
      .replace('{{name}}', name)
      .replace('{{daysLeft}}', expiryDetails.daysLeft)
      .replace('{{expiryDate}}', expiryDetails.expiryDate)
      .replace('{{renewalLink}}', expiryDetails.renewalLink);

    const msg = {
      to: email,
      from: 'support@analyticaladvisors.com',
      subject: emailTemplates.expiryReminder.subject,
      html
    };
    await sgMail.send(msg);
    console.log('Expiry reminder sent to:', email);
  } catch (error) {
    console.error('Error sending expiry reminder:', error);
    throw error;
  }
};

/**
 * Send feedback request
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @param {string} feedbackLink - Link to feedback form
 */
exports.sendFeedbackRequest = async (email, name, feedbackLink) => {
  try {
    const msg = {
      to: email,
      from: 'support@analyticaladvisors.com',
      subject: emailTemplates.feedbackRequest.subject,
      html: emailTemplates.feedbackRequest.html
        .replace('{{name}}', name)
        .replace('{{feedbackLink}}', feedbackLink)
    };
    await sgMail.send(msg);
    console.log('Feedback request sent to:', email);
  } catch (error) {
    console.error('Error sending feedback request:', error);
    throw error;
  }
}; 