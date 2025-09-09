console.log('Testing Digio initialization...');

const digio = require('./config/digio.config');

async function testDigio() {
  try {
    console.log('Testing Digio access token retrieval...');
    const token = await digio.getAccessToken();
    console.log('Successfully retrieved Digio access token');
    
    // Test an API request
    console.log('Testing Digio API request...');
    const response = await digio.request('GET', '/v2/client/account');
    console.log('Digio API test successful');
    console.log('Account info:', response.data);
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing Digio:', error.response?.data || error.message);
    process.exit(1);
  }
}

testDigio();
