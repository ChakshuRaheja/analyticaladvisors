// routes/kyc.routes.js
const express = require('express');
const { initKYC, verifyKYC } = require('../controllers/kyc.controller');
const router = express.Router();

router.post('/init', initKYC);
router.post('/verify', verifyKYC);

module.exports = router;

