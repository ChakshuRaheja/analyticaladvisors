const crypto = require('crypto');
const digioClient = require('../config/digio.config');
const { sendSuccess, sendError } = require('../utils/response');
const Subscription = require('../models/subscription.model');

//     // Validate PAN number format
//     const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
//     if (!panRegex.test(panNumber)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid PAN number format'
//       });
//     }

//     // Development mode: Simulate successful verification
//     if (process.env.NODE_ENV === 'development') {
//       console.log('Development mode: Simulating successful KYC verification');
//       return res.status(200).json({
//         success: true,
//         message: 'KYC verification successful (Development Mode)',
//         data: {
//           verified: true,
//           documentId: `dev_doc_${Date.now()}`,
//           verifiedAt: new Date().toISOString(),
//           details: {
//             name: fullName,
//             panNumber: panNumber,
//             dateOfBirth: dateOfBirth
//           }
//         }
//       });
//     }

//     // Production mode: Use Digio API
//     if (!process.env.DIGIO_API_KEY) {
//       throw new Error('Digio API key not configured');
//     }

//     // Initialize Digio client
//     const digioClient = axios.create({
//       baseURL: process.env.DIGIO_API_URL || 'https://api.digio.in',
//       headers: {
//         'x-api-key': process.env.DIGIO_API_KEY,
//         'Content-Type': 'application/json'
//       }
//     });

//     // Create a document for PAN verification
//     const documentResponse = await digioClient.post('/v2/document', {
//       document_type: 'pan',
//       document_number: panNumber,
//       name: fullName,
//       date_of_birth: dateOfBirth
//     });

//     // Verify the document
//     const verificationResponse = await digioClient.post('/v2/verify', {
//       document_id: documentResponse.data.document_id
//     });

//     // Check verification status
//     if (verificationResponse.data.status === 'success') {
//       // Return success response
//       return res.status(200).json({
//         success: true,
//         message: 'KYC verification successful',
//         data: {
//           verified: true,
//           documentId: documentResponse.data.document_id,
//           verifiedAt: new Date().toISOString()
//         }
//       });
//     } else {
//       // Return failure response
//       return res.status(400).json({
//         success: false,
//         message: 'KYC verification failed',
//         data: {
//           verified: false,
//           reason: verificationResponse.data.reason || 'Verification failed'
//         }
//       });
//     }
//   } catch (error) {
//     console.error('KYC verification error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error during KYC verification',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// module.exports = {
//   verifyKYC
// }; 



const initKYC = async (req, res) => {
  try {
    console.log('KYC Init Request Body:', JSON.stringify(req.body, null, 2));
    console.log('Authenticated User:', req.user);
    console.log('Environment Variables:', {
      NODE_ENV: process.env.NODE_ENV,
      DIGIO_ENV: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
      FRONTEND_URL: process.env.FRONTEND_URL ? 'Set' : 'Not set',
      DIGIO_COMBINED_WORKFLOW_ID: process.env.DIGIO_COMBINED_WORKFLOW_ID ? 'Set' : 'Not set',
      DIGIO_CLIENT_ID: process.env.DIGIO_CLIENT_ID ? 'Set' : 'Not set',
      DIGIO_CLIENT_SECRET: process.env.DIGIO_CLIENT_SECRET ? 'Set' : 'Not set'
    });
    
    const { 
      customer_identifier: email, 
      customer_name: name, 
      reference_id: referenceId,
      notify_customer: notifyCustomer = true,
      generate_access_token: generateAccessToken = true,
      request_details: requestDetails = {}
    } = req.body;

    if (!email || !name || !referenceId) {
      console.error('Missing required fields:', { email, name, referenceId });
      return sendError(res, 'Missing required fields. Required: customer_identifier, customer_name, reference_id', null, 400);
    }
    
    const templateName = 'DIGILOKER INTEGRATION';

    const options = {
      customer: {
        id: email, // Using email as customer ID
        email,
        name,
      },
      workflow_id: process.env.DIGIO_COMBINED_WORKFLOW_ID,
      redirect_url: `${process.env.FRONTEND_URL}/kyc/callback`,
      reference_id: referenceId,
      template_name: 'DIGILOKER INTEGRATION',
      notify_customer: notifyCustomer,
      generate_access_token: generateAccessToken,
      request_details: requestDetails,
      ui: {
        theme: {
          primary_color: '#4F46E5',
        },
      },
      document: {
        doc_name: 'KYC Document',
        description: 'KYC verification document',
        custom_fields: {
          customer_name: name,
          customer_email: email,
          reference_id: referenceId,
          date: new Date().toLocaleDateString()
        }
      }
    };

    console.log('Initializing KYC with options:', JSON.stringify(options, null, 2));
    
    console.log('Calling Digio API with options:', JSON.stringify({
      ...options,
      customer: { ...options.customer, id: '***' } // Mask sensitive data
    }, null, 2));
    
    console.log('Calling Digio KYC initiate with options:', JSON.stringify({
      ...options,
      customer: { ...options.customer, id: '***' } // Mask sensitive data
    }, null, 2));
    
    const digioResponse = await digioClient.kyc.initiate(options);
    console.log('Digio API Response:', JSON.stringify({
      status: digioResponse?.status,
      statusText: digioResponse?.statusText,
      data: digioResponse?.data,
      headers: digioResponse?.headers
    }, null, 2));

    if (!digioResponse?.url) {
      throw new Error('Invalid response from Digio: Missing URL');
    }

    return sendSuccess(res, 'KYC initiated successfully', {
      kycUrl: digioResponse.url,
      referenceId: digioResponse.reference_id,
    });
  } catch (error) {
    // Log the full error object
    console.error('FULL KYC INIT ERROR:', JSON.stringify({
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data
      } : null,
      request: error.request ? {
        method: error.config?.method,
        url: error.config?.url,
        headers: error.config?.headers,
        data: error.config?.data
      } : null
    }, null, 2));
    
    // Handle specific error types
    let statusCode = 500;
    let errorMessage = 'Internal server error';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      statusCode = error.response.status || 500;
      errorMessage = error.response.data?.message || 'Error from KYC provider';
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response received from KYC provider';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Connection to KYC provider timed out';
      statusCode = 504; // Gateway Timeout
    }
    
    console.error(`KYC Initiation Error [${statusCode}]:`, errorMessage);
    return sendError(
      res, 
      'Failed to initiate KYC', 
      process.env.NODE_ENV === 'development' ? error.message : errorMessage, 
      statusCode
    );
  }
};

/**
 * Handle KYC webhook callback from Digio
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleKYCCallback = async (req, res) => {
  console.log('Received KYC webhook:', {
    headers: req.headers,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  try {
    const signature = req.headers['x-digio-signature-256'];
    const rawBody = req.rawBody || JSON.stringify(req.body);
    
    // Verify webhook signature
    if (!verifyWebhookSignature(signature, rawBody)) {
      console.error('Invalid webhook signature:', signature);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid signature' 
      });
    }

    const { reference_id, status, kyc_details } = req.body;
    
    if (!reference_id) {
      console.error('Missing reference_id in webhook payload');
      return res.status(400).json({ 
        success: false, 
        error: 'Missing reference_id' 
      });
    }

    console.log(`Processing KYC webhook for reference: ${reference_id}`, {
      status,
      kyc_details: kyc_details ? '*** Details available ***' : 'No details',
      timestamp: new Date().toISOString()
    });

    // Update subscription/kyc status in database
    const updateData = {
      kycStatus: status,
      kycDetails: kyc_details || {},
      kycCompletedAt: status === 'completed' ? new Date() : null,
      updatedAt: new Date()
    };

    // Update the subscription or user record in your database
    // This is an example using a Subscription model - adjust according to your schema
    const updatedSubscription = await Subscription.findOneAndUpdate(
      { kycReferenceId: reference_id },
      { $set: updateData },
      { new: true, upsert: false }
    );

    if (!updatedSubscription) {
      console.error(`No subscription found with reference ID: ${reference_id}`);
      return res.status(404).json({ 
        success: false, 
        error: 'Subscription not found' 
      });
    }

    console.log(`Successfully updated KYC status for reference: ${reference_id}`, {
      status,
      subscriptionId: updatedSubscription._id,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    });
  } catch (error) {
    console.error('Error processing KYC webhook:', {
      error: error.message,
      stack: error.stack,
      body: req.body,
      timestamp: new Date().toISOString()
    });
    
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Verify the webhook signature from Digio
 * @param {string} signature - The signature from the 'x-digio-signature-256' header
 * @param {string|Buffer} payload - The raw request body
 * @returns {boolean} - True if signature is valid, false otherwise
 */
function verifyWebhookSignature(signature, payload) {
  try {
    if (!signature || !payload) {
      console.error('Missing signature or payload for verification');
      return false;
    }

    if (!process.env.DIGIO_CLIENT_SECRET) {
      console.error('DIGIO_CLIENT_SECRET is not configured');
      return false;
    }

    const hmac = crypto.createHmac('sha256', process.env.DIGIO_CLIENT_SECRET);
    hmac.update(payload);
    const generatedSignature = hmac.digest('hex');
    
    // Ensure both signatures are of the same length to prevent timing attacks
    const signatureBuffer = Buffer.from(signature, 'hex');
    const generatedSignatureBuffer = Buffer.from(generatedSignature, 'hex');
    
    if (signatureBuffer.length !== generatedSignatureBuffer.length) {
      console.error('Signature length mismatch');
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, generatedSignatureBuffer);
  } catch (error) {
    console.error('Error verifying webhook signature:', error.message);
    return false;
  }
}

module.exports = {
  initKYC,
  handleKYCCallback
};