const express = require('express');
const router = express.Router();
const { verifyKYC } = require('../controllers/kyc.controller');
const { authenticateUser } = require('../middleware/auth');

// KYC verification endpoint
router.post('/verify', authenticateUser, verifyKYC);

module.exports = router; 