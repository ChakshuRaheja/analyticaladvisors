import { auth } from '../firebase/config';

// Constants
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://omkara-backend-725764883240.asia-south1.run.app';
const isDevelopment = import.meta.env.DEV;

if (isDevelopment) {
  console.log('Using Development API Base URL:', API_BASE_URL);
} else {
  console.log('Using Production API Base URL:', API_BASE_URL);
}

// Helper function to get auth token
const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  const token = await user.getIdToken();
  if (!token) throw new Error('Failed to get authentication token');
  return token;
};

// Helper function to create a timeout promise
const createTimeoutPromise = (timeout) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Request timed out after ${timeout}ms`)), timeout);
  });
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
  } else if (error.name === 'AbortError') {
    errorMessage = 'Request timed out. Please check your internet connection and try again.';
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
 * @param {Object} kycData 
 * @param {string} kycData.customer_identifier - User's unique identifier (email/ID)
 * @param {string} kycData.customer_name - User's full name
 * @param {string} kycData.reference_id 
 * @param {Object} [kycData.request_details]
 * @returns {Promise<{kycUrl: string, referenceId: string}>}
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
      customer_identifier: kycData.customer_identifier.toString().trim(),
      customer_name: kycData.customer_name.toString().trim(),
      reference_id: kycData.reference_id.toString().trim(),
      request_details: kycData.request_details || {},
      notify_customer: true,
      generate_access_token: true
    };
    
    // Validate required fields
    const requiredFields = ['customer_identifier', 'customer_name', 'reference_id'];
    const missingFields = requiredFields.filter(field => !payload[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required KYC fields: ${missingFields.join(', ')}`);
    }

    console.log('Initiating KYC with payload:', { 
      ...payload, 
      request_details: payload.request_details ? '***' : undefined 
    });

    const requestId = `kyc-init-${Date.now()}`;
    const controller = new AbortController();
    const timeout = 30000; // 30 seconds timeout
    
    try {
      const response = await Promise.race([
        fetch(`${API_BASE_URL}/api/kyc/init`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Request-ID': requestId,
            'Accept': 'application/json',
            'Origin': window.location.origin
          },
          credentials: 'include',
          mode: 'cors',
          body: JSON.stringify(payload),
        }),
        createTimeoutPromise(timeout)
      ]);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('KYC Init Error:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });
        throw new Error(errorData.message || `KYC initiation failed with status ${response.status}`);
      }

      const result = await response.json().catch(() => {
        throw new Error('Failed to parse server response');
      });

      if (result.status !== 'success' || !result.data?.kycUrl) {
        throw new Error(result.message || 'Invalid response format from KYC service');
      }

      return {
        kycUrl: result.data.kycUrl,
        referenceId: result.data.referenceId || kycData.reference_id
      };
    } catch (error) {
      console.error('Fetch Error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw error;
    }

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

    const requestId = `kyc-verify-${Date.now()}-${docId.substring(0, 8)}`;
    const controller = new AbortController();
    const timeout = 30000; // 30 seconds timeout
    
    try {
      const response = await Promise.race([
        fetch(`${API_BASE_URL}/api/kyc/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Request-ID': requestId,
            'Accept': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify({
            docId,
            referenceId,
            timestamp: new Date().toISOString()
          }),
        }),
        createTimeoutPromise(timeout)
      ]);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('KYC Verification Error:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });
        throw new Error(errorData.message || `Verification failed with status ${response.status}`);
      }

      const result = await response.json().catch(() => {
        throw new Error('Failed to parse verification response');
      });

      if (typeof result.status === 'undefined') {
        throw new Error('Invalid response format: missing status field');
      }

      console.log('KYC Verification Result:', { 
        status: result.status,
        referenceId: result.data?.referenceId ? '***' + result.data.referenceId.slice(-4) : 'none'
      });

      return {
        success: result.status === 'success',
        data: result.data || {},
        message: result.message || (result.status === 'success' ? 'Verification successful' : 'Verification failed')
      };
    } catch (error) {
      controller.abort();
      throw error;
    }
  } catch (error) {
    console.error('Error verifying KYC status:', error);
    throw error;
  }
};
