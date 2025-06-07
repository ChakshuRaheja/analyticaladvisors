const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller');

// Welcome email route
router.post('/welcome', emailController.triggerWelcomeEmail);

// Thank you email route
router.post('/thank-you', emailController.triggerThankYouEmail);

// Getting started email route
router.post('/getting-started', emailController.scheduleGettingStartedEmail);

// Expiry reminder route
router.post('/expiry-reminder', emailController.scheduleExpiryReminder);

module.exports = router; 