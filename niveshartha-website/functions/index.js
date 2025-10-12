const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const axios = require('axios');
const cors = require('cors')({ 
  origin: [
    'https://analyticaladvisors.in',
    'https://www.analyticaladvisors.in',
    'http://localhost:3000',
    'http://localhost:5175'
  ],
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
});

admin.initializeApp();
const db = admin.firestore();

// Configure Brevo API
const brevoConfig = functions.config().brevo || {};
const BREVO_API_KEY = brevoConfig.api_key; // Will be set in Firebase config
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// Create axios instance for Brevo API
const brevoClient = axios.create({
  baseURL: 'https://api.brevo.com/v3',
  headers: {
    'accept': 'application/json',
    'api-key': BREVO_API_KEY,
    'content-type': 'application/json'
  }
});

// Check if email or phone already exists
exports.checkUserExists = functions.region('asia-south1').https.onRequest(async (req, res) => {
  // Enable CORS
  return cors(req, res, async () => {
    try {
      // Handle preflight request
      if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
      }

      // Only allow POST requests
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
      }

      const { email, phone } = req.body;

      // Input validation
      if (!email && !phone) {
        res.status(400).json({
          error: {
            code: 'invalid-argument',
            message: 'Email or phone number is required'
          }
        });
        return;
      }

      let query = db.collection('users');
      let emailExists = false;
      let phoneExists = false;

      // Check if email exists
      if (email) {
        const emailQuery = await query.where('email', '==', email).limit(1).get();
        emailExists = !emailQuery.empty;
      }

      // Check if phone exists
      if (phone) {
        const digits = phone.replace(/\D/g, '');
        let normalizedPhone;

        if (digits.length === 10) {
          normalizedPhone = `+91${digits}`;
        } else if (digits.length === 12 && digits.startsWith('91')) {
          normalizedPhone = `+${digits}`;
        } else if (/^\+91\d{10}$/.test(phone)) {
          normalizedPhone = phone;
        }
        const phoneQuery = await query.where('phone', '==', normalizedPhone).limit(1).get();
        phoneExists = !phoneQuery.empty;
      }

      res.status(200).json({
        emailExists,
        phoneExists
      });
    } catch (error) {
      console.error('Error checking user existence:', error);
      res.status(500).json({
        error: {
          code: 'internal',
          message: 'An error occurred while checking user existence',
          details: error.message
        }
      });
    }
  });
});

// New HTTP function for sending welcome emails
// exports.sendWelcomeEmailHTTP = functions.region('asia-south1').https.onRequest(async (req, res) => {
//   // Set CORS headers
//   const allowedOrigins = [
//     'https://analyticaladvisors.in',
//     'https://www.analyticaladvisors.in',
//     'http://localhost:3000',
//     'http://localhost:5175' // For local development
    
//   ];
  
//   const origin = req.headers.origin;
//   if (allowedOrigins.includes(origin)) {
//     res.set('Access-Control-Allow-Origin', origin);
//   }
  
//   res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
//   res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
//   res.set('Access-Control-Allow-Credentials', 'true');
  
//   // Handle preflight requests
//   if (req.method === 'OPTIONS') {
//     res.status(204).send('');
//     return;
//   }
  
//   // Only allow POST requests
//   if (req.method !== 'POST') {
//     res.status(405).json({ error: 'Method Not Allowed' });
//     return;
//   }
  
//   try {
//     const data = req.body;
//     console.log('sendWelcomeEmail function called with data:', JSON.stringify(data, null, 2));
    
//     // Log the complete request for debugging
//     console.log('Raw request body:', JSON.stringify(req.body, null, 2));
    
//     // Extract data from the request
//     const requestData = req.body;
//     const { to, subject = 'Welcome to Analytical Advisors!', template = 'welcome' } = requestData;
    
//     // Get name from different possible locations in the request
//     const name = requestData.name || 
//                 (requestData.data && requestData.data.name) || 
//                 (requestData.data && requestData.data.firstName && requestData.data.lastName && 
//                  `${requestData.data.firstName} ${requestData.data.lastName}`);
    
//     console.log('Sending welcome email to:', to, 'Name:', name);
//     console.log('Full request data:', JSON.stringify({
//       to,
//       name,
//       subject,
//       template,
//       data: requestData.data
//     }, null, 2));
    
//     if (!to) {
//       const errorMsg = 'Missing required field: to';
//       console.error(errorMsg);
//       return res.status(400).json({
//         success: false,
//         error: 'Missing required fields',
//         message: errorMsg,
//         receivedData: requestData
//       });
//     }
    
//     if (!name) {
//       const errorMsg = 'Could not determine recipient name from request data';
//       console.error(errorMsg);
//       return res.status(400).json({
//         success: false,
//         error: 'Missing required fields',
//         message: errorMsg,
//         receivedData: requestData,
//         help: 'Please include either name, data.name, or data.firstName and data.lastName in your request'
//       });
//     }

//     // Prepare email data for Brevo with template
//     const emailData = {
//       to: [{
//         email: to,
//         name: name
//       }],
//       subject: subject,
//       templateId: 1, // Replace with your actual Brevo template ID
//       params: {
//         name: name,
//         year: new Date().getFullYear(),
//         // Add any other parameters your Brevo template expects
//       },
//       tags: [template, 'welcome-email']
//     };

//     // Send email via Brevo
//     console.log('Sending email via Brevo API to:', to);
//     console.log('Using sender email: support@analyticaladvisors.in');
    
//     try {
//       const response = await brevoClient.post('/smtp/email', emailData);
//       console.log('Email sent successfully:', response.data);
      
//       // Send success response
//       return res.status(200).json({
//         success: true,
//         message: 'Welcome email sent successfully',
//         data: response.data
//       });
      
//     } catch (error) {
//       console.error('Brevo API Error:', {
//         message: error.message,
//         code: error.code,
//         response: error.response ? {
//           status: error.response.status,
//           statusText: error.response.statusText,
//           data: error.response.data,
//           headers: error.response.headers
//         } : 'No response',
//         stack: error.stack
//       });
      
//       // Send error response
//       return res.status(500).json({
//         success: false,
//         error: 'Failed to send welcome email',
//         message: error.message,
//         details: error.response?.data || null
//       });
//     }
//   } catch (error) {
//     console.error('Error in sendWelcomeEmail HTTP function:', error);
    
//     let errorDetails = {
//       message: error.message,
//       code: error.code
//     };
    
//     if (error.response) {
//       errorDetails = {
//         ...errorDetails,
//         status: error.response.status,
//         statusText: error.response.statusText,
//         data: error.response.data
//       };
//     } else if (error.request) {
//       errorDetails = {
//         ...errorDetails,
//         details: 'No response received from Brevo API'
//       };
//     }
    
//     res.status(500).json({
//       success: false,
//       error: 'Failed to send welcome email',
//       message: error.message,
//       ...(process.env.NODE_ENV === 'development' ? { debug: errorDetails } : {})
//     });
//   }
// });

exports.sendWelcomeEmailHTTP = functions.region('asia-south1').https.onRequest(async (req, res) => {
  const allowedOrigins = [
    'https://analyticaladvisors.in',
    'https://www.analyticaladvisors.in',
    'http://localhost:3000',
    'http://localhost:5175'
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  }

  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.set('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { to, subject = 'Welcome to Analytical Advisors!', template = 'welcome', name: reqName } = req.body;

    if (!to) return res.status(400).json({ success: false, error: 'Missing field: to' });
    const name = reqName || 'Valued Customer';

    const emailData = {
      sender: { name: 'Analytical Advisors', email: 'support@analyticaladvisors.in' }, // ✅ Verified sender
      to: [{ email: to, name }],
      subject,
      templateId: 1, // Brevo template ID
      params: {
        name,
        year: new Date().getFullYear(),
      },
      tags: [template, 'welcome-email']
    };

    const response = await brevoClient.post('/smtp/email', emailData);

    return res.status(200).json({
      success: true,
      message: 'Welcome email sent successfully',
      data: response.data
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send welcome email',
      message: error.message,
      details: error.response?.data || null
    });
  }
});


// exports.sendSubscriptionEmailHTTP = functions.region('asia-south1').https.onRequest(async (req, res) => {
//   // CORS headers
//   const allowedOrigins = [
//     'https://analyticaladvisors.in',
//     'https://www.analyticaladvisors.in',
//     'http://localhost:3000',
//     'http://localhost:5175'
//   ];

//   const origin = req.headers.origin;
//   if (allowedOrigins.includes(origin)) {
//     res.set('Access-Control-Allow-Origin', origin);
//   }
  
//   // Handle preflight requests
//   if (req.method === 'OPTIONS') {
//     res.set('Access-Control-Allow-Methods', 'GET, POST');
//     res.set('Access-Control-Allow-Headers', 'Content-Type');
//     res.set('Access-Control-Max-Age', '3600');
//     return res.status(204).send('');
//   }

//   if (req.method !== 'POST') {
//     return res.status(405).send('Method Not Allowed');
//   }

//   try {
//     const { to, name, templateId, params = {} } = req.body;
    
//     if (!to) {
//       return res.status(400).json({
//         success: false,
//         error: 'Missing required field: to'
//       });
//     }

//     // Map template IDs based on your email service
//     const templateMap = {
//       '2FreeTrial': 2,
//       '3SwingTradingEquity': 3,
//       '4SwingTradingCommodity': 4,
//       '5EquityInvesting': 5,
//       '6StockoftheMonth': 6,
//       '7DIYStockScreener': 7,
//     };

//     const selectedTemplateId = templateId || 2; // Default to Free Trial if no template ID provided

//     const emailData = {
//       to: [{
//         email: to,
//         name: name || ''
//       }],
//       templateId: selectedTemplateId,
//       params: {
//         name: name || 'Valued Customer',
//         year: new Date().getFullYear(),
//         startDate: new Date().toLocaleDateString(),
//         ...params
//       },
//       tags: [
//         'subscription',
//         'automated-email'
//       ]
//     };

//     // Send email using Brevo API
//     const response = await brevoClient.post('/smtp/email', emailData);
    
//     return res.status(200).json({
//       success: true,
//       message: 'Subscription email sent successfully',
//       messageId: response.data.messageId
//     });
    
//   } catch (error) {
//     console.error('Error sending subscription email:', {
//       error: error.message,
//       stack: error.stack,
//       requestBody: req.body
//     });
    
//     return res.status(500).json({
//       success: false,
//       error: 'Failed to send subscription email',
//       message: error.message
//     });
//   }
// });

exports.sendSubscriptionEmailHTTP = functions.region('asia-south1').https.onRequest(async (req, res) => {
  const allowedOrigins = [
    'https://analyticaladvisors.in',
    'https://www.analyticaladvisors.in',
    'http://localhost:3000',
    'http://localhost:5175'
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) res.set('Access-Control-Allow-Origin', origin);

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    return res.status(204).send('');
  }

  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { to, name, templateId = 2, params = {} } = req.body;
    if (!to) return res.status(400).json({ success: false, error: 'Missing field: to' });

    const emailData = {
      sender: { name: 'Analytical Advisors', email: 'support@analyticaladvisors.in' }, // ✅ Verified sender
      to: [{ email: to, name: name || 'Valued Customer' }],
      templateId, // Brevo template ID
      params: {
        name: name || 'Valued Customer',
        year: new Date().getFullYear(),
        startDate: new Date().toLocaleDateString(),
        ...params
      },
      tags: ['subscription', 'automated-email']
    };

    const response = await brevoClient.post('/smtp/email', emailData);

    return res.status(200).json({
      success: true,
      message: 'Subscription email sent successfully',
      messageId: response.data.messageId
    });

  } catch (error) {
    console.error('Error sending subscription email:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send subscription email',
      message: error.message
    });
  }
});



// Keep the original callable function for backward compatibility
// Update subscription status function
exports.updateSubscriptionStatus = functions.region('asia-south1').https.onRequest(async (req, res) => {
  // Handle CORS
  return cors(req, res, async () => {
    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    try {
      const { userId, subscriptionData } = req.body;
      
      if (!userId || !subscriptionData) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Update user document in Firestore
      await admin.firestore().collection('users').doc(userId).update({
        subscription: subscriptionData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      res.status(200).json({ 
        success: true, 
        message: 'Subscription updated successfully' 
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      res.status(500).json({ 
        error: 'Failed to update subscription',
        details: error.message 
      });
    }
  });
});
