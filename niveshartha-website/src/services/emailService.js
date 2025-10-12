import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';

const VERIFIED_SENDER = {
  name: "Analytical Advisors",
  email: "support@analyticaladvisors.in"
};

// Function to send a welcome email
export const sendWelcomeEmail = async ({ to, name }) => {
  try {
    const functions = getFunctions();
    const functionUrl = 'https://asia-south1-aerobic-acronym-466116-e1.cloudfunctions.net/sendWelcomeEmailHTTP';
    
    console.log('Sending welcome email to:', to);
    console.log('Using function URL:', functionUrl);
    
    const requestBody = {
      to,
      name,
      subject: 'Welcome to Analytical Advisors!',
      template: '1Signup',
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    let result;
    try {
      result = await response.json();
      console.log('Response from function:', result);
    } catch (jsonError) {
      console.error('Error parsing JSON response:', jsonError);
      const text = await response.text();
      console.error('Raw response text:', text);
      throw new Error(`Invalid JSON response: ${text}`);
    }

    if (!response.ok) {
      console.error('Error response from function:', {
        status: response.status,
        statusText: response.statusText,
        data: result,
      });
      throw new Error(result.error || `Failed to send welcome email: ${response.status} ${response.statusText}`);
    }

    return result;
  } catch (error) {
    console.error('Error in sendWelcomeEmail:', error);
    throw error;
  }
};

// Function to send a generic email (using callable function)
export const sendEmail = async ({ to, subject, template, data }) => {
  try {
    const functions = getFunctions();
    const sendEmailFn = httpsCallable(functions, 'sendEmail');
    
    await sendEmailFn({
      to,
      subject,
      template,
      data,
    });
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Function to send subscription confirmation email
export const sendSubscriptionEmail = async ({ to, name, templateId, additionalParams = {} }) => {
  try {
    const functions = getFunctions();
    const functionUrl = 'https://asia-south1-aerobic-acronym-466116-e1.cloudfunctions.net/sendSubscriptionEmailHTTP';
    
    const templateMap = {
      '2FreeTrial': 2,
      '3SwingTradingEquity': 3,
      '4SwingTradingCommodity': 4,
      '5EquityInvesting': 5,
      '6StockoftheMonth':6,
      '7DIYStockScreener':7,
    };
    
    const selectedTemplateId = templateId || templateMap[plan?.toLowerCase()] || 2;
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        to,
        name,
        template: selectedTemplateId,
        params: {
          startDate: new Date().toLocaleDateString(),
          ...additionalParams,
        },
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to send subscription email');
    }
    
    return result;
  } catch (error) {
    console.error('Error sending subscription email:', error);
    throw error;
  }
};
