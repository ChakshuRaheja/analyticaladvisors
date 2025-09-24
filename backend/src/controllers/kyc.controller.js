const crypto = require('crypto');
const digioClient = require('../config/digio.config');
const { sendSuccess, sendError } = require('../utils/response');
const Subscription = require('../models/subscription.model');

const initKYC = async (req, res) => {
  console.log('=== KYC INIT REQUEST START ===');
  console.log('Request Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  console.log('Authenticated User:', req.user || 'No user data');
  
  // Log environment configuration
  const envVars = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    FRONTEND_URL: process.env.FRONTEND_URL || 'Not set',
    WORKFLOW_ID: process.env.WORKFLOW_ID ? 'Set' : 'Not set',
    DIGIO_CLIENT_ID: process.env.DIGIO_CLIENT_ID ? '***' + process.env.DIGIO_CLIENT_ID.slice(-4) : 'Not set',
    DIGIO_CLIENT_SECRET: process.env.DIGIO_CLIENT_SECRET ? '***' + process.env.DIGIO_CLIENT_SECRET.slice(-4) : 'Not set',
    DIGIO_API_URL: process.env.DIGIO_API_URL || 'Not set'
  };
  
  console.log('Environment Configuration:', JSON.stringify(envVars, null, 2));
  
  try {
    
    // Log the raw request body for debugging
    console.log('Raw request body:', JSON.stringify(req.body, null, 2));
    
    // Validate required fields
    const requiredFields = ['customer_identifier', 'customer_name', 'reference_id'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return sendError(res, `Missing required fields: ${missingFields.join(', ')}`, null, 400);
    }
    
    // Destructure and trim string values
    const { 
      customer_identifier: email, 
      customer_name: name, 
      reference_id: referenceId,
      notify_customer: notifyCustomer = true,
      generate_access_token: generateAccessToken = true,
      request_details: requestDetails = {}
    } = req.body;
    
    // Trim string values
    const trimmedEmail = email?.toString().trim();
    const trimmedName = name?.toString().trim();
    const trimmedReferenceId = referenceId?.toString().trim();
    
    // Validate non-empty values after trimming
    if (!trimmedEmail || !trimmedName || !trimmedReferenceId) {
      const emptyFields = [];
      if (!trimmedEmail) emptyFields.push('customer_identifier');
      if (!trimmedName) emptyFields.push('customer_name');
      if (!trimmedReferenceId) emptyFields.push('reference_id');
      
      console.error('Empty field values after trimming:', { 
        customer_identifier: !!trimmedEmail,
        customer_name: !!trimmedName,
        reference_id: !!trimmedReferenceId
      });
      
      return sendError(res, `Empty values not allowed for: ${emptyFields.join(', ')}`, null, 400);
    }
    
    const options = {
      customer_identifier: trimmedEmail,
      customer_name: trimmedName,
      reference_id: trimmedReferenceId,
      template_name: 'DIGILOKER INTEGRATION',
      notify_customer: notifyCustomer,
      generate_access_token: generateAccessToken,
      request_details: requestDetails,
      redirect_url: `${process.env.FRONTEND_URL}/kyc/callback`,
      ui: {
        theme: {
          primary_color: '#4F46E5',
        },
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
    
    console.log('Calling Digio KYC initiate with options:', JSON.stringify(options, null, 2));
    
    try {
      // Make direct API call to Digio with the new endpoint
      const response = await digioClient.request('POST', digioClient.endpoints.kyc.request, options);
      
      // Format the response to match the expected structure
      const digioResponse = {
        url: response.data?.url,
        reference_id: response.data?.reference_id || trimmedReferenceId,
        status: response.status,
        data: response.data
      };

      console.log('Digio API Response:', {
        status: digioResponse?.status,
        hasUrl: !!digioResponse?.url,
        referenceId: digioResponse?.reference_id
      });

      if (!digioResponse?.url || !digioResponse.reference_id) {
        console.error('Invalid response from Digio: Missing URL or reference_id in response:', digioResponse);
        throw new Error('Invalid response from KYC provider: Missing URL or reference_id');
      }

      // CRITICAL: Save the kycReferenceId to the subscription before redirecting.
      // We assume the reference_id passed in the request body is the subscription ID.
      const subscription = await Subscription.findByIdAndUpdate(
        trimmedReferenceId,
        { $set: { kycReferenceId: digioResponse.reference_id, kycStatus: 'initiated' } },
        { new: true }
      );

      if (!subscription) {
        console.error(`Failed to find and update subscription with ID: ${trimmedReferenceId}`);
        throw new Error(`Subscription not found for reference_id: ${trimmedReferenceId}`);
      }

      console.log(`Successfully saved kycReferenceId for subscription: ${subscription._id}`);

      return sendSuccess(res, 'KYC initiated successfully', {
        kycUrl: digioResponse.url,
        referenceId: digioResponse.reference_id,
      });
    } catch (digioError) {
      console.error('Digio KYC Initiation Error:', {
        message: digioError.message,
        code: digioError.code,
        stack: digioError.stack,
        response: digioError.response?.data || 'No response data'
      });
      throw new Error(`KYC provider error: ${digioError.message}`);
    }
  } catch (error) {
    // Log the full error object with all available details
    const errorDetails = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code,
      },
      request: {
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        body: req.body,
        params: req.params,
        query: req.query,
      },
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data
      } : null,
      config: error.config ? {
        method: error.config.method,
        url: error.config.url,
        headers: error.config.headers ? {
          ...error.config.headers,
          'x-api-key': error.config.headers['x-api-key'] ? '***' + String(error.config.headers['x-api-key']).slice(-4) : undefined,
          'x-api-secret': error.config.headers['x-api-secret'] ? '***' + String(error.config.headers['x-api-secret']).slice(-4) : undefined,
          'authorization': error.config.headers['authorization'] ? '***' : undefined
        } : undefined,
        data: error.config.data
      } : null
    };

    console.error('FULL KYC INIT ERROR:', JSON.stringify(errorDetails, null, 2));
    
    // Handle specific error types
    let statusCode = 500;
    let errorMessage = 'Internal server error';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      statusCode = error.response.status || 500;
      errorMessage = error.response.data?.message || 'Error from KYC provider';
      
      // Log the full response if available
      if (error.response.data) {
        console.error('KYC Provider Error Response:', JSON.stringify({
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        }, null, 2));
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response received from KYC provider';
      console.error('No response received from KYC provider. Request details:', {
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout
      });
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Connection to KYC provider timed out';
      statusCode = 504; // Gateway Timeout
      console.error('Request timeout:', error.message);
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = `Could not connect to KYC provider: ${error.hostname || 'Unknown host'}`;
      statusCode = 502; // Bad Gateway
      console.error('DNS/Connection error:', error.message);
    }
    
    console.error(`KYC Initiation Error [${statusCode}]:`, errorMessage);
    
    // Return a more detailed error response in development
    const errorResponse = {
      success: false,
      message: 'Failed to initiate KYC',
      error: process.env.NODE_ENV === 'development' ? error.message : errorMessage,
      ...(process.env.NODE_ENV === 'development' && {
        details: {
          code: error.code,
          stack: error.stack
        }
      })
    };
    
    return res.status(statusCode).json(errorResponse);
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