const axios = require('axios');

const DIGIO_API_KEY = process.env.DIGIO_CLIENT_ID;
const DIGIO_API_SECRET = process.env.DIGIO_CLIENT_SECRET;
const DIGIO_API_URL = 'https://ext.digio.in:444';

if (!DIGIO_API_KEY || !DIGIO_API_SECRET) {
  throw new Error('Digio API credentials are not set in environment variables');
}

// Helper: Basic Auth header
const getAuthHeader = () => {
  const token = Buffer.from(`${DIGIO_API_KEY}:${DIGIO_API_SECRET}`).toString('base64');
  return `Basic ${token}`;
};

// ==================== INIT KYC ====================
exports.initKYC = async (req, res) => {
  try {
    const { customer_identifier, customer_name, reference_id, request_details = {} } = req.body;

    if (!customer_identifier || !customer_name || !reference_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: customer_identifier, customer_name, reference_id'
      });
    }

    const payload = {
      customer_identifier,
      customer_name,
      reference_id,
      template_name: 'DIGILOKER INTEGRATION', 
      notify_customer: false, //as using SDK
      generate_access_token: true,
      request_details
    };

    const response = await axios.post(
      `${DIGIO_API_URL}/client/kyc/v2/request/with_template`,
      payload,
      {
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Digio API Response:', JSON.stringify(response.data, null, 2));

    const digioRequestId = response.data?.request_id || 
                      response.data?.id || 
                      response.data?.data?.request_id ||
                      response.data?.data?.id;

if (!digioRequestId) {
  console.error('No request ID found in Digio response');
}

    return res.json({
      success: true,
      message: 'KYC initiated successfully',
      status: 'pending',
      referenceId: reference_id,
      requestId: response.data?.request_id || response.data?.id,
    });

  } catch (error) {
    console.error('KYC INIT ERROR:', error.message);
    console.error('KYC INIT FULL ERROR:', error.response?.data || error);

    return res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message,
      details: error.response?.data || null
    });
  }
};

// ==================== VERIFY KYC ====================
exports.verifyKYC = async (req, res) => {
  try {
    const { requestID } = req.body;
    console.log('Received requestID:', requestID); // ← Add this
    
    if (!requestID) {
      return res.status(400).json({ success: false, message: 'requestID is required' });
    }

    const response = await axios.post(
      `${DIGIO_API_URL}/client/kyc/v2/${requestID}/response`,
      {}, 
      { 
        headers: { 
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        } 
      }
    );

    console.log('Digio response:', response.data); 
    // Send success/failure based on Digio status
     // Check if any action is successful (KYC completed)
const hasSuccessfulAction = response.data?.actions?.some(action => action.status === 'success');

// Determine final status
let kycStatus;
if (response.data?.status === 'success') {
  kycStatus = 'verified';
} else if (response.data?.status === 'approval_pending' && hasSuccessfulAction) {
  kycStatus = 'verified';  // KYC completed successfully
} else {
  kycStatus = response.data?.status;
}

    return res.json({
      success: response.data?.success || false,
      status: kycStatus,
      message: response.data?.message || '',
      requestId: requestID,
      referenceId: requestID
    });

  } catch (error) {
    console.error('KYC VERIFY ERROR:', error.message);
    console.error('KYC VERIFY FULL ERROR:', error.response?.data || error);

    return res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message,
      details: error.response?.data || null
    });
  }
};

