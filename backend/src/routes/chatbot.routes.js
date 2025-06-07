const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbot.controller');

/**
 * @route POST /api/chatbot/response
 * @desc Get a response from the chatbot
 * @access Public
 */
router.post('/response', chatbotController.getChatbotResponse);

/**
 * @route POST /api/chatbot/store-conversation
 * @desc Store a conversation for analysis
 * @access Public
 */
router.post('/store-conversation', chatbotController.storeConversation);

module.exports = router; 