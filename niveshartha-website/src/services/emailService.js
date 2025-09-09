import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';

// Function to send a welcome email
export const sendWelcomeEmail = async ({ to, name }) => {
  try {
    const functions = getFunctions();
    const functionUrl = 'https://asia-south1-aerobic-acronym-466116-e1.cloudfunctions.net/sendWelcomeEmailHTTP';
    
    console.log('Sending welcome email to:', to);
    console.log('Using function URL:', functionUrl);
    
    // Prepare the request body with name at the root level
    const requestBody = {
      to,
      name,  // Name at root level for the backend function
      subject: 'Welcome to Analytical Advisors!',
      template: 'welcome',
      data: {
        welcomeMessage: 'Thank you for signing up! We\'re excited to have you on board.'
      }
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    console.log('Sending request to:', functionUrl);
    console.log('Request headers:', {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    let response;
    try {
      response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      let result;
      try {
        result = await response.json();
        console.log('Response from function:', result);
        
        if (!response.ok) {
          console.error('Error response from function:', {
            status: response.status,
            statusText: response.statusText,
            data: result
          });
          throw new Error(result.error || `Failed to send welcome email: ${response.status} ${response.statusText}`);
        }
        
        return result;
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        const text = await response.text();
        console.error('Raw response text:', text);
        throw new Error(`Invalid JSON response: ${text}`);
      }
    } catch (error) {
      console.error('Error in fetch request:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in sendWelcomeEmail:', error);
    throw error;
  }
};

// Function to send a generic email
export const sendEmail = async ({ to, subject, template, data }) => {
  try {
    const functions = getFunctions();
    const sendEmailFn = httpsCallable(functions, 'sendEmail');
    
    await sendEmailFn({
      to,
      subject,
      template,
      data
    });
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
