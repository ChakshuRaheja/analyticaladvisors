const axios = require('axios');
const https = require('https');

const digioConfig = {
  // API Credentials from environment variables
  clientId: process.env.DIGIO_CLIENT_ID,
  clientSecret: process.env.DIGIO_CLIENT_SECRET,
  
  
  apiVersion: 'v2',
  environment: process.env.NODE_ENV || 'development',
  isSandbox: process.env.NODE_ENV !== 'production',
  
  
  baseUrl: 'https://ext.digio.in:444', // Sandbox URL for testing
    
  
  endpoints: {
    auth: '/client/auth/v2/token',  // Authentication endpoint
    kyc: {
      request: '/client/kyc/v2/request/with_template',  // KYC template request endpoint
      status: '/client/kyc/v2/status',  // KYC status check endpoint
      download: '/client/kyc/v2/file'   // KYC file download endpoint
    }
  },
  
  // HTTP Client Configuration
  httpConfig: {
    timeout: 30000, // 30 seconds
    httpsAgent: new (require('https').Agent)({  
      rejectUnauthorized: process.env.NODE_ENV !== 'production',
      requestCert: false
    }),
    // Add debug logging for requests
    transformRequest: [(data, headers) => {
      console.log('Request Headers:', JSON.stringify(headers, null, 2));
      return data ? JSON.stringify(data) : data;
    }],
    transformResponse: [(data) => {
      console.log('Response Data:', data);
      return data;
    }]
  },
  
  // Initialize KYC request
  async initKYC(customerEmail, customerName, referenceId) {
    try {
      const kycUrl = `${this.baseUrl}${this.endpoints.kyc.request}`;
      
      // Verify credentials are set
      if (!this.clientId || !this.clientSecret) {
        throw new Error('Digio client ID or secret not configured');
      }
      
      console.log('Environment Variables:', {
        NODE_ENV: process.env.NODE_ENV,
        DIGIO_CLIENT_ID: this.clientId ? 'Set' : 'Not Set',
        DIGIO_CLIENT_SECRET: this.clientSecret ? 'Set' : 'Not Set',
        baseUrl: this.baseUrl,
        kycUrl: kycUrl
      });
      
      const requestData = {
        customer_identifier: customerEmail,
        customer_name: customerName,
        reference_id: referenceId,
        template_name: 'DIGILOKER INTEGRATION',
        notify_customer: true,
        generate_access_token: true,
        request_details: {}
      };
      
      console.log('Sending KYC request to:', kycUrl);
      console.log('Request headers:', {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-KEY': '***',
        'X-API-SECRET': '***',
        'Authorization': 'Basic ***'
      });
      
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
        }),
        timeout: 30000 // 30 seconds timeout
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
  
  // Get access token for authenticated requests
  async getAccessToken() {
    try {
      const authUrl = `${this.baseUrl}${this.endpoints.auth}`;
      console.log('Requesting access token from:', authUrl);
      
      const response = await axios({
        method: 'POST',
        url: authUrl,
        data: {
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
        },
        httpsAgent: new (require('https').Agent)({  
          rejectUnauthorized: false
        })
      });
      
      if (!response.data || !response.data.access_token) {
        throw new Error('Invalid token response format');
      }
      
      return response.data.access_token;
    } catch (error) {
      console.error('Failed to get access token:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
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
      if (endpoint === this.endpoints.auth) {
        const authUrl = `${this.baseUrl}${this.endpoints.auth}`;
        console.log('Requesting access token from:', authUrl);
        
        try {
          const response = await axios({
            method: 'POST',
            url: authUrl,
            data: {
              grant_type: 'client_credentials',
              client_id: this.clientId,
              client_secret: this.clientSecret
            },
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
            },
            httpsAgent: new (require('https').Agent)({  
              rejectUnauthorized: false
            })
          });
          
          if (!response.data || !response.data.access_token) {
            throw new Error('Invalid token response format');
          }
          
          return response.data;
        } catch (authError) {
          console.error('Failed to get access token:', {
            message: authError.message,
            status: authError.response?.status,
            data: authError.response?.data
          });
          throw authError;
        }
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
    // Methods will be bound in the module exports
    _getAccessToken: async function() {
      try {
        const authUrl = `${this.baseUrl}${this.endpoints.auth}`;
        console.log('Requesting access token from:', authUrl);
        
        const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

        const authResponse = await axios({
          method: 'POST',
          url: authUrl,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${credentials}`
          },
          data: {
            'grant_type': 'client_credentials'
          },
          ...this.httpConfig
        });

        if (!authResponse.data || !authResponse.data.access_token) {
          throw new Error('Invalid auth response format');
        }

        console.log('Successfully obtained access token');
        return authResponse.data.access_token;
      } catch (error) {
        console.error('Failed to get access token:', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        throw new Error(`Authentication failed: ${error.message}`);
      }
    },

    /**
     * Initialize KYC process
     * @param {Object} options - KYC initialization options
     * @returns {Promise<Object>} KYC initialization response
     */
    async initiate(options) {
      try {
        console.log('Initiating KYC with options:', {
          ...options,
          customer: options.customer ? { ...options.customer, id: '***' } : null
        });

        // Get access token first
        // 'this' is bound to digioConfig, so we access the method via this.kyc
        const accessToken = await this.kyc._getAccessToken();
        
        // Prepare KYC request data
        const requestData = {
          customer_identifier: options.customer?.id || options.customer_identifier,
          customer_name: options.customer?.name || options.customer_name,
          reference_id: options.reference_id,
          template_name: options.template_name || 'DIGILOKER INTEGRATION',
          notify_customer: options.notify_customer !== false,
          generate_access_token: options.generate_access_token !== false,
          request_details: options.request_details || {}
        };

        console.log('Sending KYC request with data:', {
          ...requestData,
          customer_identifier: '***',
          customer_name: requestData.customer_name ? '***' : undefined
        });

        // Make KYC request
        const response = await axios({
          method: 'POST',
          url: `${this.baseUrl}${this.endpoints.kyc.init}`,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          data: requestData,
          ...this.httpConfig
        });

        console.log('KYC initiation successful. Status:', response.status);
        return response.data;
      } catch (error) {
        console.error('Error initializing KYC:', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          statusText: error.response?.statusText,
          responseData: error.response?.data
        });
        throw new Error(`Failed to initialize KYC process: ${error.message}`);
      }
    }
  }
};

// Bind the methods inside the 'kyc' object to the main 'digioConfig' object.
// This ensures that when methods like `initiate` are called, `this` refers to `digioConfig`,
// allowing access to top-level properties like `baseUrl`, `clientId`, etc.
digioConfig.kyc.initiate = digioConfig.kyc.initiate.bind(digioConfig);
digioConfig.kyc._getAccessToken = digioConfig.kyc._getAccessToken.bind(digioConfig);

// Expose the getAccessToken method at the top level for convenience.
digioConfig.getAccessToken = digioConfig.kyc._getAccessToken;

module.exports = digioConfig;

