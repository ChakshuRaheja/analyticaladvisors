import { auth } from '../firebase/config';

// Constants
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
console.log('Using API Base URL:', API_BASE_URL);

// Helper function to get auth token
const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  const token = await user.getIdToken();
  if (!token) throw new Error('Failed to get authentication token');
  return token;
};

// Helper function to handle API errors
const handleApiError = (error, context = '') => {
  console.error(`KYC Service Error [${context}]:`, error);
  
  // Format error message
  let errorMessage = 'An unexpected error occurred';
  if (error.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error.message) {
    errorMessage = error.message;
  }
  
  throw new Error(`KYC ${context} failed: ${errorMessage}`);
};

/**
 * Validates KYC initiation data
 * @param {Object} data - KYC data to validate
 * @throws {Error} If validation fails
 */
const validateKycData = (data) => {
  const requiredFields = ['customer_identifier', 'customer_name', 'reference_id'];
  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
};

/**
 * Initiates the KYC process
 * @param {Object} kycData - User and subscription data for KYC
 * @param {string} kycData.customer_identifier - User's unique identifier (email/ID)
 * @param {string} kycData.customer_name - User's full name
 * @param {string} kycData.reference_id - Unique reference ID for this KYC request
 * @param {Object} [kycData.request_details] - Additional request details (e.g., subscription_plan, payment_id)
 * @returns {Promise<{kycUrl: string, referenceId: string}>} - KYC URL and reference ID
 */
export const initiateKYC = async (kycData) => {
  try {
    // Input validation
    if (!kycData.customer_identifier || !kycData.customer_name || !kycData.reference_id) {
      throw new Error('Missing required KYC fields: customer_identifier, customer_name, reference_id');
    }

    const token = await getAuthToken();
    
    // Prepare request payload matching backend expectations
    const payload = {
      customer_identifier: kycData.customer_identifier,
      customer_name: kycData.customer_name,
      reference_id: kycData.reference_id,
      request_details: kycData.request_details || {},
      // These will be used by the backend
      notify_customer: true,
      generate_access_token: true
    };

    console.log('Initiating KYC with payload:', { 
      ...payload, 
      request_details: payload.request_details ? '***' : undefined 
    });

    const response = await fetch(`${API_BASE_URL}/api/kyc/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Request-ID': `kyc-init-${Date.now()}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({
      success: false,
      message: 'Invalid JSON response from server'
    }));
    
    if (!response.ok) {
      console.error('KYC Init Error:', {
        status: response.status,
        statusText: response.statusText,
        data: result
      });
      throw new Error(result.message || `KYC initiation failed with status ${response.status}`);
    }

    if (result.status !== 'success' || !result.data?.kycUrl) {
      throw new Error(result.message || 'Invalid response format from KYC service');
    }

    console.log('KYC Initiated:', { 
      referenceId: result.data.referenceId,
      kycUrl: result.data.kycUrl ? '***[REDACTED]***' : undefined 
    });

    return {
      kycUrl: result.data.kycUrl,
      referenceId: result.data.referenceId || kycData.reference_id
    };
  } catch (error) {
    handleApiError(error, 'initiation');
  }
};

/**
 * Verifies the KYC status after user completes the Digio flow
 * @param {Object} params - Verification parameters
 * @param {string} params.docId - Digio document ID (required)
 * @param {string} [params.referenceId] - Reference ID from KYC initiation
 * @returns {Promise<{status: string, data?: Object, message?: string}>} - Verification result
 */
export const verifyKYCStatus = async ({ docId, referenceId }) => {
  try {
    if (!docId) throw new Error('Document ID is required');
    
    const token = await getAuthToken();
    
    console.log('Verifying KYC status with backend:', { 
      docId: docId.substring(0, 8) + '...',
      referenceId: referenceId?.substring(0, 8) + '...'
    });

    const response = await fetch(`${API_BASE_URL}/api/kyc/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Request-ID': `kyc-verify-${Date.now()}-${docId.substring(0, 8)}`,
      },
      body: JSON.stringify({
        docId,
        referenceId,
        timestamp: new Date().toISOString()
      }),
    });

    const result = await response.json().catch(() => ({
      success: false,
      message: 'Failed to parse server response'
    }));
    
    if (!response.ok) {
      console.error('KYC Verification Error:', {
        status: response.status,
        statusText: response.statusText,
        data: result
      });
      throw new Error(result.message || `Verification failed with status ${response.status}`);
    }

    console.log('KYC Verification Result:', { 
      status: result.status,
      referenceId: result.data?.referenceId
    });

    return {
      success: result.status === 'success',
      data: result.data,
      message: result.message
    };
  } catch (error) {
    console.error('Error verifying KYC status:', error);
    throw error;
  }
};
