const crypto = require('crypto');
const razorpay = require('../config/razorpay.config');
const { sendSuccess, sendError } = require('../utils/response.util');

/**
 * Create a new Razorpay order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createOrder = async (req, res) => {
  try {
    console.log('Create order request received:', req.body);
    const { amount, currency = 'INR', receipt, notes } = req.body;

    // Validate required fields
    if (!amount) {
      console.log('Amount missing in request');
      return sendError(res, 'Amount is required');
    }

    // Make sure amount is a number
    const orderAmount = Number(amount);
    if (isNaN(orderAmount)) {
      console.log('Invalid amount format:', amount);
      return sendError(res, 'Amount must be a valid number');
    }

    // Convert to paise (smallest currency unit) if needed
    // Razorpay expects amount in paise
    const amountInPaise = Math.round(orderAmount * 100);

    // Create order
    const options = {
      amount: amountInPaise,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {},
    };

    console.log('Creating order with options:', options);
    const order = await razorpay.orders.create(options);
    console.log('Order created successfully:', order);

    return sendSuccess(res, 'Order created successfully', { order });
  } catch (error) {
    console.error('Error creating order:', error);
    return sendError(res, 'Error creating order', error.message, 500);
  }
};

/**
 * Verify Razorpay payment signature
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.verifyPayment = async (req, res) => {
  try {
    console.log('Verify payment request received:', req.body);
    // Extract payment details from request body
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.log('Missing required parameters for verification');
      return sendError(res, 'Missing payment verification parameters');
    }

    // Create the signature verification string
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    console.log('Generated signature:', generatedSignature);
    console.log('Received signature:', razorpay_signature);

    // Verify signature
    const isSignatureValid = generatedSignature === razorpay_signature;

    if (isSignatureValid) {
      // If signature is valid, fetch the payment details from Razorpay for additional validation
      console.log('Signature is valid, fetching payment details');
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      console.log('Payment details fetched successfully:', payment);
      
      // You can implement additional checks here if needed
      // For example, verifying order amount or other details

      return sendSuccess(res, 'Payment verified successfully', { payment });
    } else {
      console.log('Invalid signature');
      return sendError(res, 'Invalid payment signature');
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return sendError(res, 'Error verifying payment', error.message, 500);
  }
}; 