const Razorpay = require('razorpay');
const { sendError } = require('../utils/response.util');

/**
 * Initialize Razorpay instance with enhanced error handling
 */

// Validate Razorpay configuration
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  const error = new Error('Razorpay API keys are missing in environment variables');
  console.error(error.message);
  throw error;
}

// Validate key format
const validateKey = (key) => {
  if (!key || typeof key !== 'string' || key.length < 10) {
    const error = new Error('Invalid Razorpay API key format');
    console.error(error.message);
    throw error;
  }
};

validateKey(process.env.RAZORPAY_KEY_ID);
validateKey(process.env.RAZORPAY_KEY_SECRET);

console.log('Initializing Razorpay with Key ID:', process.env.RAZORPAY_KEY_ID);

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Add error handling middleware
razorpayInstance.onError = (error) => {
  console.error('Razorpay Error:', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  throw error;
};

module.exports = razorpayInstance;