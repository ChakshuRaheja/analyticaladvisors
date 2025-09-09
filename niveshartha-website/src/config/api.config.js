// Backend URL - use proxy in development, direct URL in production
const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = isDevelopment 
  ? '' // Use relative path in development to leverage Vite proxy
  : 'https://omkara-backend-725764883240.asia-south1.run.app';

// Remove any trailing slashes from the base URL
const cleanBaseUrl = API_BASE_URL.replace(/\/+$/, '');

// In development, we use the proxy path /contact which will be rewritten to the actual backend
// In production, we use the full URL
const getEndpoint = (path) => {
  if (isDevelopment) {
    return path; // Will be relative to the current origin
  }
  return `${cleanBaseUrl}${path}`;
};

export const API_ENDPOINTS = {
  CONTACT: getEndpoint('/contact'),
  // Add other API endpoints here as needed
};

// For debugging
console.log('Environment:', import.meta.env.MODE);
console.log('API Base URL:', cleanBaseUrl || 'Using proxy');
console.log('Contact Endpoint:', API_ENDPOINTS.CONTACT);

export default API_ENDPOINTS;
