const axios = require('axios');

const verifyKYC = async (req, res) => {
  try {
    const { userId, fullName, dateOfBirth, panNumber } = req.body;

    // Validate required fields
    if (!userId || !fullName || !dateOfBirth || !panNumber) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate PAN number format
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PAN number format'
      });
    }

    // Development mode: Simulate successful verification
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Simulating successful KYC verification');
      return res.status(200).json({
        success: true,
        message: 'KYC verification successful (Development Mode)',
        data: {
          verified: true,
          documentId: `dev_doc_${Date.now()}`,
          verifiedAt: new Date().toISOString(),
          details: {
            name: fullName,
            panNumber: panNumber,
            dateOfBirth: dateOfBirth
          }
        }
      });
    }

    // Production mode: Use Digio API
    if (!process.env.DIGIO_API_KEY) {
      throw new Error('Digio API key not configured');
    }

    // Initialize Digio client
    const digioClient = axios.create({
      baseURL: process.env.DIGIO_API_URL || 'https://api.digio.in',
      headers: {
        'x-api-key': process.env.DIGIO_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    // Create a document for PAN verification
    const documentResponse = await digioClient.post('/v2/document', {
      document_type: 'pan',
      document_number: panNumber,
      name: fullName,
      date_of_birth: dateOfBirth
    });

    // Verify the document
    const verificationResponse = await digioClient.post('/v2/verify', {
      document_id: documentResponse.data.document_id
    });

    // Check verification status
    if (verificationResponse.data.status === 'success') {
      // Return success response
      return res.status(200).json({
        success: true,
        message: 'KYC verification successful',
        data: {
          verified: true,
          documentId: documentResponse.data.document_id,
          verifiedAt: new Date().toISOString()
        }
      });
    } else {
      // Return failure response
      return res.status(400).json({
        success: false,
        message: 'KYC verification failed',
        data: {
          verified: false,
          reason: verificationResponse.data.reason || 'Verification failed'
        }
      });
    }
  } catch (error) {
    console.error('KYC verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during KYC verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  verifyKYC
}; 