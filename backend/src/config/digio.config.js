const axios = require('axios');

const digioConfig = {
  clientId: process.env.DIGIO_CLIENT_ID,
  clientSecret: process.env.DIGIO_CLIENT_SECRET,
  // API endpoints configuration - trying with minimal path
  // Base URLs
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://api.digio.in' 
    : 'https://ext.digio.in:444',  // Sandbox base URL
  kycEndpoint: '/client/kyc/v2/request/with_template',
  apiVersion: 'v2',
  environment: process.env.NODE_ENV || 'development',
  isSandbox: process.env.NODE_ENV !== 'production',
  
  // Initialize KYC request
  async initKYC(customerEmail, customerName, referenceId) {
    try {
      const kycUrl = `${this.baseUrl}${this.kycEndpoint}`;
      console.log('Initializing KYC with URL:', kycUrl);
      
      const requestData = {
        customer_identifier: customerEmail,
        customer_name: customerName,
        reference_id: referenceId,
        template_name: 'DIGILOKER INTEGRATION',
        notify_customer: true,
        generate_access_token: true,
        request_details: {}
      };
      
      console.log('Sending KYC request:', JSON.stringify(requestData, null, 2));
      
      const response = await axios({
        method: 'POST',
        url: kycUrl,
        data: requestData,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
          'X-API-KEY': this.clientId,
          'X-API-SECRET': this.clientSecret
        },
        httpsAgent: new (require('https').Agent)({  
          rejectUnauthorized: false,  // Only for sandbox with self-signed certs
          requestCert: false
        })
      });
      
      if (!response.data) {
        console.error('Unexpected response format:', response.data);
        throw new Error('Invalid response format from Digio KYC endpoint');
      }
      
      console.log('Successfully initiated KYC request');
      return response.data;
    } catch (error) {
      console.error('Error getting Digio access token:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: {
            ...error.config?.headers,
            'client_id': error.config?.headers?.client_id ? '***' : 'Not set',
            'client_secret': error.config?.headers?.client_secret ? '***' : 'Not set'
          }
        }
      });
      throw error;
    }
  },
  
  // Make authenticated API requests
  async request(method, endpoint, data = {}) {
    try {
      console.log(`\n=== Digio ${method} ${endpoint} ===`);
      console.log('Environment:', this.environment);
      
      // For auth endpoint, don't include the token
      if (endpoint === this.authEndpoint) {
        const response = await axios({
          method,
          url: `${this.baseUrl}${endpoint}`,
          data: {
            grant_type: 'client_credentials',
            client_id: this.clientId,
            client_secret: this.clientSecret
          },
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          httpsAgent: new (require('https').Agent)({  
            rejectUnauthorized: false
          })
        });
        return response.data;
      }
      
      // For other endpoints, include the access token
      const token = await this.getAccessToken();
      if (!token) {
        throw new Error('Failed to obtain access token');
      }
      
      // Ensure endpoint starts with a slash and doesn't duplicate /v2/client
      // Construct the full API endpoint URL
      const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
      const url = `${this.baseUrl}/client/${this.apiVersion}/${normalizedEndpoint}`;
      const requestData = {
        method,
        url,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data,
        timeout: 30000, // 30 seconds timeout
        validateStatus: () => true // Always resolve the promise, so we can handle all status codes
      };
      
      console.log('Request config:', JSON.stringify({
        url,
        method,
        headers: {
          ...requestData.headers,
          'Authorization': 'Bearer [REDACTED]'
        },
        data: endpoint.includes('auth') ? { client_id: '***', client_secret: '***' } : data
      }, null, 2));
      
      const response = await axios(requestData);
      
      console.log(`Response (${response.status}):`, JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      }, null, 2));
      
      // Handle error responses
      if (response.status >= 400) {
        const error = new Error(`Digio API Error: ${response.status} - ${response.statusText}`);
        error.response = response;
        error.isDigioError = true;
        throw error;
      }
      
      return response.data;
      
    } catch (error) {
      if (error.isDigioError) {
        console.error('Digio API Error Details:', {
          url: error.config?.url,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers
        });
      } else {
        console.error('Request Error:', {
          message: error.message,
          code: error.code,
          stack: error.stack,
          config: error.config ? {
            url: error.config.url,
            method: error.config.method,
            headers: error.config.headers ? {
              ...error.config.headers,
              'Authorization': error.config.headers?.Authorization ? 'Bearer [REDACTED]' : undefined
            } : undefined,
            data: error.config.data
          } : undefined
        });
      }
      throw error;
    }
  },

  // KYC Methods
  kyc: {
    /**
     * Initialize KYC process
     * @param {Object} options - KYC initialization options
     * @returns {Promise<Object>} KYC initialization response
     */
    async initiate(options) {
      try {
        const response = await this.request(
          'POST',
          '/v2/client/kyc/init',
          options
        );
        return response;
      } catch (error) {
        console.error('Error initializing KYC:', error);
        throw new Error('Failed to initialize KYC process');
      }
    }
  }
};

module.exports = digioConfig;
