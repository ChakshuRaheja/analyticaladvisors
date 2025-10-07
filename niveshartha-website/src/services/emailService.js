// import { getFunctions, httpsCallable } from 'firebase/functions';
// import { getAuth } from 'firebase/auth';

// // Function to send a welcome email
// export const sendWelcomeEmail = async ({ to, name }) => {
//   try {
//     const functions = getFunctions();
//     const functionUrl = 'https://asia-south1-aerobic-acronym-466116-e1.cloudfunctions.net/sendWelcomeEmailHTTP';
    
//     console.log('Sending welcome email to:', to);
//     console.log('Using function URL:', functionUrl);
    
//     // Prepare the request body with name at the root level
//     const requestBody = {
//       to,
//       name,  // Name at root level for the backend function
//       subject: 'Welcome to Analytical Advisors!',
//       template: '1Signup',
//     };
    
//     console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
//     console.log('Sending request to:', functionUrl);
//     console.log('Request headers:', {
//       'Content-Type': 'application/json',
//       'Accept': 'application/json'
//     });
    
//     let response;
//     try {
//       response = await fetch(functionUrl, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         },
//         body: JSON.stringify(requestBody)
//       });
      
//       let result;
//       try {
//         result = await response.json();
//         console.log('Response from function:', result);
        
//         if (!response.ok) {
//           console.error('Error response from function:', {
//             status: response.status,
//             statusText: response.statusText,
//             data: result
//           });
//           throw new Error(result.error || `Failed to send welcome email: ${response.status} ${response.statusText}`);
//         }
        
//         return result;
//       } catch (jsonError) {
//         console.error('Error parsing JSON response:', jsonError);
//         const text = await response.text();
//         console.error('Raw response text:', text);
//         throw new Error(`Invalid JSON response: ${text}`);
//       }
//     } catch (error) {
//       console.error('Error in fetch request:', error);
//       throw error;
//     }
//   } catch (error) {
//     console.error('Error in sendWelcomeEmail:', error);
//     throw error;
//   }
// };

// // Function to send a generic email
// export const sendEmail = async ({ to, subject, template, data }) => {
//   try {
//     const functions = getFunctions();
//     const sendEmailFn = httpsCallable(functions, 'sendEmail');
    
//     await sendEmailFn({
//       to,
//       subject,
//       template,
//       data
//     });
    
//     return true;
//   } catch (error) {
//     console.error('Error sending email:', error);
//     throw error;
//   }
//  const sendSubscriptionEmail = async ({ to, name, plan, templateId, additionalParams = {} }) => {
//     try {
//       const functions = getFunctions();
//       const functionUrl = 'https://asia-south1-aerobic-acronym-466116-e1.cloudfunctions.net/sendEmailHTTP';
      
//       const templateMap = {
//         'free-trial': 2,   // Template ID for free trial
//         'basic': 3,        // Template ID for basic plan
//         'premium': 4,      // Template ID for premium plan
//         'enterprise': 5,   // Template ID for enterprise plan
//       };
      
//       const selectedTemplateId = templateId || templateMap[plan.toLowerCase()] || 2;
      
//       const response = await fetch(functionUrl, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         },
//         body: JSON.stringify({
//           to,
//           name,
//           subject: `Your ${plan} Subscription Confirmation`,
//           template: selectedTemplateId,
//           plan,
//           params: {
//             planName: plan,
//             startDate: new Date().toLocaleDateString(),
//             ...additionalParams
//           }
//         })
//       });
      
//       const result = await response.json();
      
//       if (!response.ok) {
//         throw new Error(result.error || 'Failed to send subscription email');
//       }
      
//       return result;
//     } catch (error) {
//       console.error('Error sending subscription email:', error);
//       throw error;
//     }
//  };

// };

import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';

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
