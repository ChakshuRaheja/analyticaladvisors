const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

/**
 * @route POST /api/payments/verify
 * @desc Verify Razorpay payment
 * @access Public
 */
router.post('/verify', paymentController.verifyPayment);

/**
 * @route POST /api/payments/create-order
 * @desc Create a new Razorpay order
 * @access Public
 */
router.post('/create-order', paymentController.createOrder);

module.exports = router; 