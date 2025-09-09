// const express = require('express');
// const router = express.Router();
// const { verifyKYC } = require('../controllers/kyc.controller');
// const { authenticateUser } = require('../middleware/auth');

// // Handle OPTIONS preflight request
// router.options('/verify', (req, res) => {
//   res.header('Access-Control-Allow-Origin', req.headers.origin);
//   res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   res.header('Access-Control-Allow-Credentials', 'true');
//   res.status(200).end();
// });

// // KYC verification endpoint
// router.post('/verify', authenticateUser, verifyKYC);

// module.exports = router;

// backend/src/routes/kyc.routes.js
const express = require('express');
const router = express.Router();
const { initKYC, handleKYCCallback } = require('../controllers/kyc.controller');
const { authenticateUser } = require('../middleware/auth');

// KYC Routes
router.post('/init', authenticateUser, initKYC);
router.post('/webhook', express.raw({ type: 'application/json' }), handleKYCCallback);
// CORS preflight for all routes
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

module.exports = router;