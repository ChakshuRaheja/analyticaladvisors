console.log('=== Starting Enhanced Digio Test ===');

// Load environment variables
require('dotenv').config({ path: '.env' });

// Verify required environment variables
const requiredEnvVars = [
  'DIGIO_CLIENT_ID',
  'DIGIO_CLIENT_SECRET'
];

// Network test function
async function testNetworkConnectivity(hostname) {
  const dns = require('dns');
  const { promisify } = require('util');
  const lookup = promisify(dns.lookup);
  
  try {
    console.log(`\n=== Testing Network Connectivity to ${hostname} ===`);
    
    // Test DNS resolution
    console.log('Testing DNS resolution...');
    const { address, family } = await lookup(hostname);
    console.log(`✅ DNS resolved: ${hostname} -> ${address} (IPv${family})`);
    
    // Test TCP connection (basic port check)
    console.log('Testing TCP connection...');
    const net = require('net');
    const port = 443; // HTTPS port
    const socket = net.createConnection(port, hostname);
    
    await new Promise((resolve, reject) => {
      socket.on('connect', () => {
        console.log(`✅ Successfully connected to ${hostname}:${port}`);
        socket.destroy();
        resolve();
      });
      
      socket.on('error', (error) => {
        console.error(`❌ Connection failed: ${error.message}`);
        reject(error);
      });
      
      // Set timeout
      setTimeout(() => {
        socket.destroy();
        reject(new Error('Connection timeout'));
      }, 5000);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Network test failed:', error.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Check your internet connection');
    console.log('2. Try pinging the hostname from your terminal:');
    console.log(`   ping ${hostname}`);
    console.log('3. Check if you need to configure a proxy');
    console.log('4. Verify if the hostname is correct');
    console.log('5. Check your firewall settings');
    return false;
  }
}

console.log('\n=== Environment Variables ===');
const missingVars = [];
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  // Show first 4 and last 4 characters of each value for debugging
  console.log(`${envVar}: ${value ? value.substring(0, 4) + '...' + value.slice(-4) : 'NOT SET'}`);
  if (!value) missingVars.push(envVar);
});

// Log the exact values being used for debugging
console.log('\n=== Digio Config Values ===');
console.log('Base URL:', process.env.NODE_ENV === 'production' ? 'https://api.digio.in' : 'https://ext.digio.in:444');
console.log('KYC Endpoint:', '/client/kyc/v2/request/with_template');
console.log('Template Name:', process.env.DIGIO_KYC_TEMPLATE_NAME || 'DIGILOKER INTEGRATION');

if (missingVars.length > 0) {
  console.error('\n❌ Missing required environment variables:', missingVars.join(', '));
  console.error('Please create a .env file with the required variables.');
  process.exit(1);
}

console.log('\n=== Testing Digio Client Initialization ===');
let digio;
try {
  digio = require('./src/config/digio.config');
  console.log('✅ Digio config loaded successfully');
} catch (error) {
  console.error('❌ Failed to load Digio config:', error);
  process.exit(1);
}

// Test KYC initialization
async function testKYCInitialization() {
  console.log('\n=== Testing KYC Initialization ===');
  try {
    console.log('Environment:', digio.environment);
    console.log('API Base URL:', digio.baseUrl);
    
    // Test DNS resolution
    try {
      const dns = require('dns');
      const { hostname } = new URL(digio.baseUrl);
      console.log('Testing DNS resolution for:', hostname);
      const addresses = await dns.promises.lookup(hostname);
      console.log(`✅ DNS resolved: ${hostname} -> ${addresses.address}`);
    } catch (dnsError) {
      console.error('❌ DNS resolution failed:', dnsError.message);
      console.log('\nTroubleshooting steps:');
      console.log('1. Check your internet connection');
      console.log('2. Try pinging the Digio API endpoint');
      console.log('3. Check if you need to configure a proxy');
      console.log('4. Verify the API endpoint URL is correct');
      throw dnsError;
    }
    
    // Test KYC initialization
    const testEmail = 'chakshuraheja8@gmail.com';
    const testName = 'Chakshu Raheja';
    const referenceId = `TEST_${Date.now()}`;
    
    console.log('Initializing KYC with:');
    console.log('- Email:', testEmail);
    console.log('- Name:', testName);
    console.log('- Reference ID:', referenceId);
    
    const kycResponse = await digio.initKYC(testEmail, testName, referenceId);
    console.log('✅ Successfully initialized KYC request');
    console.log('KYC Response:', JSON.stringify(kycResponse, null, 2));
    
    return kycResponse;
  } catch (error) {
    console.error('❌ KYC initialization failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Request config:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: Object.keys(error.config?.headers || {}).filter(k => k.toLowerCase() !== 'authorization')
      });
    }
    throw error;
  }
}

// Run tests
async function runTests() {
  try {
    // First test network connectivity
    const isNetworkOk = await testNetworkConnectivity('ext.digio.in');
    if (!isNetworkOk) {
      console.error('❌ Network connectivity tests failed. Please fix network issues and try again.');
      process.exit(1);
    }
    
    console.log('\n=== Network tests passed. Proceeding with API tests ===');
    
    // Test KYC initialization
    await testKYCInitialization();
    
    console.log('\n✅ All tests passed successfully!');
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    
    // Print additional error details if available
    if (error.response) {
      console.error('\nAPI Error Details:');
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 404) {
        console.error('\nTroubleshooting:');
        console.error('1. Verify the KYC template name is correct and exists in your Digio account');
        console.error('2. Check if your account has the necessary permissions for KYC operations');
        console.error('3. Ensure your IP is whitelisted in the Digio dashboard');
      } else if (error.response.status === 401) {
        console.error('\nTroubleshooting:');
        console.error('1. Verify your DIGIO_CLIENT_ID and DIGIO_CLIENT_SECRET are correct');
        console.error('2. Check if your API keys have the required permissions');
        console.error('3. Ensure your account is properly configured in the Digio dashboard');
      }
    }
    
    process.exit(1);
  }
}

runTests();
