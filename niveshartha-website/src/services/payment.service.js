/**
 * Payment Service for Razorpay integration
 * Handles communication with the backend payment API
 */

// Hardcoded URL for local testing to avoid any environment variable issues
const API_BASE_URL = 'http://localhost:5175';

// Potential API endpoint variations to try
const API_ENDPOINTS = [
  '/api/payment/create-order',
  '/api/payments/create-order',
  '/api/payment/create-order/', 
  '/api/payments/create-order/'
];

/**
 * Create a new order with Razorpay
 * @param {number} amount - Amount in INR (will be converted to paise by backend)
 * @param {string} currency - Currency code (default: INR)
 * @param {string} receipt - Receipt ID
 * @param {Object} notes - Additional notes
 * @returns {Promise<Object>} - Order details
 */
export const createOrder = async (amount, currency = 'INR', receipt = null, notes = {}) => {
  try {
    console.log('Creating order with params:', { amount, currency, receipt, notes });
    
    // Ensure amount is a number
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
      throw new Error('Amount must be a valid number');
    }

    // Prepare request payload
    const requestPayload = {
      amount: numericAmount,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes,
    };
    
    // Try different API endpoints
    let lastError = null;
    
    for (const endpoint of API_ENDPOINTS) {
      try {
        console.log(`Trying endpoint: ${API_BASE_URL}${endpoint}`);
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`Request to ${endpoint} failed:`, {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
          continue; // Try the next endpoint
        }

        const result = await response.json();
        console.log(`Order creation successful using ${endpoint}:`, result);
        
        if (result.status !== 'success') {
          console.warn(`API returned non-success status for ${endpoint}:`, result);
          continue; // Try the next endpoint
        }

        return result.data.order;
      } catch (error) {
        console.warn(`Error with endpoint ${endpoint}:`, error);
        lastError = error;
        // Continue with next endpoint
      }
    }

    // If we get here, all endpoints failed
    throw new Error(lastError?.message || 'Failed to create order after trying all endpoints');
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    
    // If the error is a network error, provide a more specific message
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error(`Cannot connect to payment server. Please check if the backend server is running at ${API_BASE_URL} and there are no CORS issues.`);
    }
    
    throw error;
  }
};

/**
 * Verify payment through the backend
 * @param {Object} paymentData - Payment data from Razorpay
 * @returns {Promise<Object>} - Verification result
 */
export const verifyPayment = async (paymentData) => {
  try {
    console.log('Verifying payment with data:', paymentData);
    
    // Validate payment data
    if (!paymentData.razorpay_order_id || !paymentData.razorpay_payment_id || !paymentData.razorpay_signature) {
      throw new Error('Missing required payment verification parameters');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/payment/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
      }),
    });

    if (!response.ok) {
      let errorMessage = `API error: ${response.status} ${response.statusText}`;
      try {
        const errorText = await response.text();
        if (errorText) {
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.message) {
              errorMessage = errorJson.message;
            }
          } catch (e) {
            if (errorText.length < 100) {
              errorMessage = errorText;
            }
          }
        }
      } catch (e) {
        // If we can't read the response, just use the status
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Payment verification response:', result);
    
    if (result.status !== 'success') {
      throw new Error(result.message || 'Payment verification failed');
    }

    return result.data.payment;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

/**
 * Load Razorpay script
 * @returns {Promise<boolean>} - Whether script loaded successfully
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      console.log('Razorpay already loaded');
      resolve(true);
      return;
    }
    
    console.log('Loading Razorpay script');
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
      resolve(true);
    };
    script.onerror = (error) => {
      console.error('Error loading Razorpay script:', error);
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Initialize Razorpay checkout
 * @param {Object} options - Razorpay options
 * @returns {Promise<Object>} - Payment response
 */
export const initializeRazorpayCheckout = (options) => {
  return new Promise((resolve, reject) => {
    try {
      const paymentObject = new window.Razorpay(options);
      
      // Handle payment failure
      paymentObject.on('payment.failed', function(response) {
        reject(new Error(response.error.description));
      });
      
      // Open Razorpay
      paymentObject.open();
      
      // The actual resolution happens in the handler callback defined in options
    } catch (error) {
      reject(error);
    }
  });
}; 