/**
 * Example of how to integrate the Razorpay backend with your frontend React app
 * This is not an actual functional file, but a reference implementation
 */

// 1. Create an order from your frontend
const createOrder = async (amount) => {
  try {
    const response = await fetch('http://localhost:3001/api/payments/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount, // Amount in the currency's smallest unit (e.g., paise for INR)
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
        notes: {
          purpose: 'Subscription payment',
          userId: '123456' // Add user information as needed
        }
      }),
    });

    const result = await response.json();
    
    if (result.status === 'success') {
      return result.data.order;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// 2. Open Razorpay payment dialog
const openRazorpayCheckout = (order, keyId, userInfo) => {
  return new Promise((resolve, reject) => {
    const options = {
      key: keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'Omkara Capital',
      description: 'Subscription Payment',
      order_id: order.id,
      prefill: {
        name: userInfo.name,
        email: userInfo.email,
        contact: userInfo.phone
      },
      theme: {
        color: '#3399cc'
      },
      handler: function(response) {
        // Handle the successful payment
        resolve(response);
      },
      modal: {
        ondismiss: function() {
          reject(new Error('Payment canceled'));
        }
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  });
};

// 3. Verify the payment with the backend
const verifyPayment = async (paymentResponse) => {
  try {
    const response = await fetch('http://localhost:3001/api/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
      }),
    });
    
    const result = await response.json();
    
    if (result.status === 'success') {
      return result.data.payment;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

// Example of complete payment flow in a React component
/*
import React, { useState } from 'react';

function SubscriptionPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubscription = async (planPrice) => {
    try {
      setLoading(true);
      setError('');
      
      // 1. Create Razorpay order
      const order = await createOrder(planPrice);
      
      // 2. Open Razorpay checkout
      const paymentResponse = await openRazorpayCheckout(
        order, 
        'rzp_test_OoxElqgmaEVe1I',
        {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '9876543210'
        }
      );
      
      // 3. Verify payment
      const paymentDetails = await verifyPayment(paymentResponse);
      
      // 4. Handle success (e.g., save subscription)
      console.log('Payment verified successfully', paymentDetails);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h1>Subscribe to our Plan</h1>
      <button 
        onClick={() => handleSubscription(999)}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Pay ₹999'}
      </button>
      
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default SubscriptionPage;
*/ 