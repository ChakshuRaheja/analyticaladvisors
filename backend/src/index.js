// Load environment variables first, before anything else
require('dotenv').config();
console.log('Environment loaded. NODE_ENV:', process.env.NODE_ENV);

// Validate required environment variables
const requiredEnvVars = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'PORT', 'CORS_ORIGIN'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('ERROR: Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file');
  process.exit(1); // Exit with an error code
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes
const paymentRoutes = require('./routes/payment.routes');
const kycRoutes = require('./routes/kyc.routes');
const chatbotRoutes = require('./routes/chatbot.routes');
const emailRoutes = require('./routes/email.routes');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5175;

// Apply middlewares
app.use(helmet({
  // Modify CSP to allow connections from frontend
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", process.env.CORS_ORIGIN, 'http://localhost:*'],
      // Add other necessary directives as needed
    },
  },
})); // Secure HTTP headers

// More permissive CORS configuration for development
if (process.env.NODE_ENV === 'development') {
  // In development, log all origins but allow all
  const allowedOrigins = [
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175'
  ];
  
  if (process.env.CORS_ORIGIN) {
    // Add the configured CORS_ORIGIN to the whitelist if it exists
    allowedOrigins.push(process.env.CORS_ORIGIN);
  }
  
  app.use(cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) === -1) {
        console.log(`Request from origin ${origin} allowed due to development mode`);
      }
      
      // Allow all origins in development for easier testing
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  console.log('Using development CORS configuration (allows all origins with detailed logging)');
} else {
  // In production, only allow the configured origin
  app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
  }));
  console.log(`Using production CORS configuration (allows only ${process.env.CORS_ORIGIN})`);
}

app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Apply routes
app.use('/api/payments', paymentRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/email', emailRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Omkara Capital Backend API',
    environment: process.env.NODE_ENV,
    corsOrigin: process.env.CORS_ORIGIN
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Access the API at http://localhost:${PORT}`);
  console.log(`📝 API endpoints:`);
  console.log(`   - GET    /                           - Health check`);
  console.log(`   - POST   /api/payments/create-order  - Create order`);
  console.log(`   - POST   /api/payment/create-order   - Create order (alt)`);
  console.log(`   - POST   /api/payments/verify        - Verify payment`);
  console.log(`   - POST   /api/payment/verify         - Verify payment (alt)`);
  console.log(`   - POST   /api/kyc/verify             - Verify KYC`);
  console.log(`   - POST   /api/chatbot/response       - Get chatbot response`);
  console.log(`   - POST   /api/chatbot/store-conversation - Store chat`);
  console.log(`   - POST   /api/email/welcome          - Send welcome email`);
  console.log(`   - POST   /api/email/thank-you        - Send thank you email`);
  console.log(`   - POST   /api/email/getting-started  - Send getting started email`);
  console.log(`   - POST   /api/email/expiry-reminder  - Send expiry reminder email`);
  console.log(`⚙️ Environment: ${process.env.NODE_ENV}`);
  console.log(`🔒 CORS origin allowed: ${process.env.CORS_ORIGIN}`);
  console.log(`=================================================`);
}); 