/**
 * ChatBot Service
 * Handles communication with backend for chatbot functionality
 */

// Fallback responses if the API call fails
const fallbackResponses = {
  // General queries
  'hello': "Hello! I am Manisha, your personal assistant at Analytical Advisors. How can I help you today?",
  'hi': "Hi there! I'm Manisha from Analytical Advisors. How can I assist you with your investment needs?",
  'help': "I can help you with information about our services, subscription plans, portfolio analysis, and more. What would you like to know?",
  
  // Service related
  'services': "At Analytical Advisors, we offer various services including Stock Analysis, Portfolio Review, and Investment Advisory. Would you like to know more about any of these?",
  
  // Default
  'default': "I'm experiencing some technical difficulties right now. Please try again later or contact us directly at support@analyticaladvisors.in."
};

// API URL - using deployed Cloud Run service
const API_URL = 'https://omkara-backend-725764883240.asia-south1.run.app/api/chatbot';

// To store conversation history
let conversationHistory = [];

/**
 * Get response from chatbot
 * @param {string} message - User message
 * @returns {Promise<string>} Bot response
 */
export const getChatbotResponse = async (message) => {
  try {
    // Add user message to history
    conversationHistory.push({ role: 'user', content: message });
    
    // Try to get response from the backend API
    const response = await fetch(`${API_URL}/response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message,
        // Send conversation history for better context
        history: conversationHistory 
      }),
    });
    
    if (!response.ok) {
      // If API call fails, use fallback
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    const botResponse = data.data.response;
    
    // Add bot response to history
    conversationHistory.push({ role: 'assistant', content: botResponse });
    
    // Keep conversation history within a reasonable size (last 10 messages)
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(conversationHistory.length - 10);
    }
    
    return botResponse;
  } catch (error) {
    console.warn('Error fetching chatbot response, using fallback:', error);
    
    // Use local fallback if API call fails
    const lowerMessage = message.toLowerCase();
    for (const [key, response] of Object.entries(fallbackResponses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }
    return fallbackResponses.default;
  }
};

/**
 * Store a conversation for analysis
 * @param {Array} messages - Array of message objects
 * @returns {Promise<boolean>} Success status
 */
export const storeConversation = async (messages) => {
  try {
    // Only store if there are actual user messages
    if (messages.length <= 1) {
      return true;
    }
    
    // Convert UI messages format to API format
    const conversation = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));
    
    const response = await fetch(`${API_URL}/store-conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversation }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.warn('Failed to store conversation:', error);
    return false;
  }
};

/**
 * Reset the conversation history
 */
export const resetConversation = () => {
  conversationHistory = [];
};

export default {
  getChatbotResponse,
  storeConversation,
  resetConversation
}; 