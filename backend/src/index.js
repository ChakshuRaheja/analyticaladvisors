require('dotenv').config();
// Environment Variables Configuration
console.log('\nEnvironment Configuration:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

// Required environment variables
const requiredEnvVars = [
  'PORT',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'CORS_ORIGIN',
  'DIGIO_CLIENT_SECRET',
  'DIGIO_CLIENT_ID'
];

// Validate required environment variables
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ ERROR: Missing required environment variables:', missingEnvVars.join(', '));
  if (process.env.NODE_ENV === 'production') {
    console.error('Please set these environment variables in your Cloud Run service configuration');
  } else {
    console.error('Please create a .env file with these variables');
  }
  process.exit(1);
}

// Log environment variables (mask sensitive values)
console.log('✅ Environment variables loaded successfully');
console.log('PORT:', process.env.PORT);
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '*** Set ***' : 'Not Set');
console.log('DIGIO_CLIENT_ID:', process.env.DIGIO_CLIENT_ID ? '*** Set ***' : 'Not Set');
console.log('DIGIO_CLIENT_SECRET:', process.env.DIGIO_CLIENT_SECRET ? '*** Set ***' : 'Not Set');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '*** Set ***' : 'Not Set');


const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes
const paymentRoutes = require('./routes/payment.routes');
const kycRoutes = require('./routes/kyc.routes');
const emailRoutes = require('./routes/email.routes');
const contactRoutes = require('./routes/contact.routes');
const excelRoutes = require('./routes/excel.routes');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Apply middlewares
app.use(helmet({
  // Modify CSP to allow connections from frontend
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: [
        "'self'", 
        process.env.CORS_ORIGIN, 
        'http://localhost:5175', 
        'http://localhost:*',
        'https://omkara-backend-725764883240.asia-south1.run.app',
        'https://analyticaladvisors.in'
      ],
      // Add other necessary directives as needed
    },
  },
})); // Secure HTTP headers

// CORS Configuration
const getCorsOptions = () => {
  // In development, allow all origins with detailed logging
  if (process.env.NODE_ENV === 'development') {
    return {
      origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        
        // Log the origin for debugging
        console.log(`[CORS] Allowing request from origin: ${origin}`);
        
        // List of allowed origins for development
        const allowedOrigins = [
          'http://localhost:5173', // Vite default
          'http://localhost:5174',
          'http://localhost:5175', // Your current port
          'http://localhost:3000', // Create React App default
          'http://localhost:3001',
          'https://analyticaladvisors.web.app' // Production
        ];
        
        // Allow if origin is in the allowed list or if it's a localhost origin
        if (allowedOrigins.includes(origin) || origin.includes('localhost')) {
          return callback(null, true);
        }
        
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
      exposedHeaders: ['Content-Range', 'X-Content-Range'],
      maxAge: 600, // Cache preflight requests for 10 minutes
      optionsSuccessStatus: 204 // Return 204 for preflight requests
    };
  }

  // In production, use the configured origins from environment variables
  const allowedOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : [];

  console.log('[CORS] Allowed origins:', allowedOrigins);

  return {
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if the origin is in the allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Log unauthorized access attempts
      console.warn(`[CORS] Blocked request from unauthorized origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // Cache preflight requests for 24 hours in production
    optionsSuccessStatus: 204 // Return 204 for preflight requests
  };
};

// Create CORS options
const corsOptions = getCorsOptions();

// Apply CORS middleware with the appropriate configuration
app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Add a middleware to handle preflight requests
app.use((req, res, next) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    // Set CORS headers for preflight requests
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    return res.status(204).end();
  }
  next();
});

app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Apply routes
app.use('/api/payments', paymentRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/excel', excelRoutes);

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

// Start the server
const HOST = '0.0.0.0'; // Always listen on all interfaces for Cloud Run

console.log('Starting server...');
console.log('Environment Variables:');
console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`- PORT: ${process.env.PORT}`);
console.log(`- CORS_ORIGIN: ${process.env.CORS_ORIGIN}`);

// Error handling for server startup
try {
  // In Cloud Run, we need to listen on the port provided by the environment
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  console.log('=================================================');
  console.log(`🚀 Server successfully started on http://${HOST}:${PORT}`);
  console.log(`📝 Available API endpoints:`);
  console.log(`   - GET    /                           - Health check`);
  console.log(`   - POST   /api/payments/create-order  - Create order`);
  console.log(`   - POST   /api/payment/create-order   - Create order (alt)`);
  console.log(`   - POST   /api/payments/verify        - Verify payment`);
  console.log(`   - POST   /api/payment/verify         - Verify payment (alt)`);
  console.log(`   - POST   /api/payment/response       - Get payment response`);
  console.log(`   - POST   /api/kyc/verify             - Verify KYC details`);
  console.log(`   - POST   /api/email/welcome          - Send welcome email`);
  console.log(`   - POST   /api/email/thank-you        - Send thank you email`);
  console.log(`   - POST   /api/email/getting-started  - Send getting started email`);
  console.log(`   - POST   /api/email/expiry-reminder  - Send expiry reminder email`);
  console.log(`   - POST   /api/excel/upload           - Upload Excel file`);
  console.log(`   - GET    /api/excel/template         - Download Excel template`);
  console.log(`⚙️ Environment: ${process.env.NODE_ENV}`);
  console.log(`🔒 CORS origin allowed: ${process.env.CORS_ORIGIN}`);
  console.log(`🌐 Listening on: http://${HOST}:${PORT}`);
  console.log(`=================================================`);
});

  // Add a simple readiness check for Cloud Run
  server.on('listening', () => {
    console.log('✅ Server is ready to accept connections');
    console.log(`✅ Health check available at http://${HOST}:${PORT}/health`);
  });

  server.on('error', (error) => {
    console.error('❌ Server error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
    } else if (error.code === 'EACCES') {
      console.error(`❌ Permission denied on port ${PORT}. Try a port number higher than 1024`);
    }
    process.exit(1);
  });
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});