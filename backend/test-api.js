const fetch = require('node-fetch');

// Test creating an order
async function testCreateOrder() {
  try {
    console.log('Testing create order API...');
    const response = await fetch('http://localhost:3001/api/payments/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 999, // 999 INR
        currency: 'INR',
        receipt: `rcpt_test_${Date.now()}`,
        notes: {
          planId: 'basic',
          userId: 'test-user-123',
        },
      }),
    });

    const result = await response.json();
    console.log('Create order response:', JSON.stringify(result, null, 2));
    return result.data?.order;
  } catch (error) {
    console.error('Error testing create order:', error);
  }
}

// Run the test
async function runTests() {
  const order = await testCreateOrder();
  
  if (order) {
    console.log('✅ Create order API working correctly!');
  } else {
    console.log('❌ Create order API not working correctly!');
  }
}

runTests(); 