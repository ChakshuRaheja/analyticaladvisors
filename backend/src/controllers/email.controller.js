const { sendSuccess, sendError } = require('../utils/response.util');
const emailService = require('../services/email.service');
const admin = require('firebase-admin');

/**
 * Trigger welcome email for new users
 */
exports.triggerWelcomeEmail = async (req, res) => {
  try {
    const { email, name } = req.body;
    
    // Validate input
    if (!email || !name) {
      return sendError(res, 'Email and name are required', null, 400);
    }

    // Validate email format
    if (!email.includes('@')) {
      return sendError(res, 'Invalid email format', null, 400);
    }

    await emailService.sendWelcomeEmail(email, name);
    return sendSuccess(res, 'Welcome email sent successfully');
  } catch (error) {
    console.error('Error in triggerWelcomeEmail:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      request: {
        method: req.method,
        url: req.url,
        body: req.body
      }
    });
    
    return sendError(res, 'Failed to send welcome email', error.message, 500);
  }
};

/**
 * Trigger thank you email after subscription
 */
exports.triggerThankYouEmail = async (req, res) => {
  try {
    const { email, name, subscriptionDetails } = req.body;
    
    if (!email || !name || !subscriptionDetails) {
      return sendError(res, 'Email, name, and subscription details are required');
    }

    await emailService.sendThankYouEmail(email, name, subscriptionDetails);
    return sendSuccess(res, 'Thank you email sent successfully');
  } catch (error) {
    console.error('Error in triggerThankYouEmail:', error);
    return sendError(res, 'Failed to send thank you email', error.message);
  }
};

/**
 * Schedule getting started email (1 day after signup)
 */
exports.scheduleGettingStartedEmail = async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return sendError(res, 'Email and name are required');
    }

    // Schedule email for 1 day later
    setTimeout(async () => {
      try {
        await emailService.sendGettingStartedEmail(email, name);
      } catch (error) {
        console.error('Error sending scheduled getting started email:', error);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours

    return sendSuccess(res, 'Getting started email scheduled successfully');
  } catch (error) {
    console.error('Error in scheduleGettingStartedEmail:', error);
    return sendError(res, 'Failed to schedule getting started email', error.message);
  }
};

/**
 * Schedule subscription expiry reminder
 */
exports.scheduleExpiryReminder = async (req, res) => {
  try {
    const { email, name, expiryDetails } = req.body;
    
    if (!email || !name || !expiryDetails) {
      return sendError(res, 'Email, name, and expiry details are required');
    }

    // Calculate days until expiry
    const daysUntilExpiry = Math.ceil((new Date(expiryDetails.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 0) {
      return sendError(res, 'Subscription has already expired');
    }

    // Schedule reminder 3 days before expiry
    const reminderDelay = (daysUntilExpiry - 3) * 24 * 60 * 60 * 1000;
    
    if (reminderDelay > 0) {
      setTimeout(async () => {
        try {
          await emailService.sendExpiryReminder(email, name, expiryDetails);
        } catch (error) {
          console.error('Error sending scheduled expiry reminder:', error);
        }
      }, reminderDelay);
    }

    return sendSuccess(res, 'Expiry reminder scheduled successfully');
  } catch (error) {
    console.error('Error in scheduleExpiryReminder:', error);
    return sendError(res, 'Failed to schedule expiry reminder', error.message);
  }
}; 