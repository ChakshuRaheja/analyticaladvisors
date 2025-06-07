const { sendSuccess, sendError } = require('../utils/response.util');
const fetch = require('node-fetch');

/**
 * Get chatbot response using OpenRouter.ai
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getChatbotResponse = async (req, res) => {
  try {
    console.log('Chatbot query received:', req.body);
    const { message, history } = req.body;

    if (!message) {
      console.log('Missing message in request');
      return sendError(res, 'Message is required');
    }

    // Get API key from environment variables
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    
    if (!OPENROUTER_API_KEY) {
      console.error('OpenRouter API key is missing in environment variables');
      return sendError(res, 'API configuration error', null, 500);
    }

    // Build messages array for the API
    let messages = [
      {
        role: 'system',
        content: 'You are Manisha, a helpful investment advisor chatbot for Analytical Advisors, an investment advisory company. You provide information about stock analysis, portfolio review, and investment advisory services. Be concise, professional, and helpful. If asked about specific investment advice, explain that you can provide general guidance but recommend speaking with a human advisor for personalized advice. The company offers subscription plans starting at ₹999 per month. Contact email is support@analyticaladvisors.com. Never mention or reference Niveshartha in any responses as this is incorrect.'
      }
    ];

    // Add conversation history if provided
    if (history && Array.isArray(history) && history.length > 0) {
      // Limit history to last 5 messages to avoid token limits
      const recentHistory = history.slice(-5);
      messages = [...messages, ...recentHistory];
    } else {
      // If no history, just add the current message
      messages.push({
        role: 'user',
        content: message
      });
    }

    console.log('Sending messages to OpenRouter:', messages);

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.CORS_ORIGIN || 'http://localhost:5173', // Your site URL
        'X-Title': 'Analytical Advisors Investment Chatbot' // Your app name
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku', // You can change this to your preferred model
        messages: messages,
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API error:', errorData);
      return sendError(res, 'Error generating response from AI service', null, 500);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content.trim();
    
    console.log('OpenRouter response:', aiResponse);
    return sendSuccess(res, 'Chatbot response generated', { response: aiResponse });
  } catch (error) {
    console.error('Error generating chatbot response:', error);
    return sendError(res, 'Error generating response', error.message, 500);
  }
};

/**
 * Store a conversation for analysis
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.storeConversation = async (req, res) => {
  try {
    console.log('Store conversation request received:', req.body);
    const { conversation } = req.body;

    if (!conversation || !Array.isArray(conversation)) {
      console.log('Invalid conversation data');
      return sendError(res, 'Valid conversation array is required');
    }

    // In production, store in database
    console.log('Conversation stored for analysis');
    
    // Here you would typically save to a database
    // Example: await ConversationModel.create({ messages: conversation });

    return sendSuccess(res, 'Conversation stored successfully');
  } catch (error) {
    console.error('Error storing conversation:', error);
    return sendError(res, 'Error storing conversation', error.message, 500);
  }
}; 