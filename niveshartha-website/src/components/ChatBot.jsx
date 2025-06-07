import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getChatbotResponse, storeConversation, resetConversation } from '../services/chatbot.service';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      text: "Hey there, I'm Manisha — your personal assistant into the world of Analytical Advisors.Just ask, I’m all yours.", 
      sender: 'bot' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isError, setIsError] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Store conversation when chat is closed
  useEffect(() => {
    return () => {
      if (messages.length > 1) {
        storeConversation(messages);
      }
    };
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    
    // Add user message
    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsError(false);
    
    // Simulate typing
    setIsTyping(true);
    
    try {
      // Get response from service
      const response = await getChatbotResponse(input);
      setMessages(prev => [...prev, { text: response, sender: 'bot' }]);
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      setMessages(prev => [...prev, { 
        text: "Sorry, I'm having trouble connecting. Please try again later.", 
        sender: 'bot' 
      }]);
      setIsError(true);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Common questions for quick access
  const quickQuestions = [
    { text: 'Services', value: 'What services do you offer?' },
    { text: 'Pricing', value: 'What are your subscription prices?' },
    { text: 'Contact', value: 'How can I contact you?' },
    { text: 'Portfolio', value: 'Tell me about portfolio review' }
  ];

  const handleQuickQuestion = async (question) => {
    // Add user message
    setMessages(prev => [...prev, { text: question.value, sender: 'user' }]);
    setIsError(false);
    
    // Simulate typing
    setIsTyping(true);
    
    try {
      // Get response from service
      const response = await getChatbotResponse(question.value);
      
      setTimeout(() => {
        setMessages(prev => [...prev, { text: response, sender: 'bot' }]);
        setIsTyping(false);
      }, 700);
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: "Sorry, I'm having trouble connecting. Please try again later.", 
          sender: 'bot' 
        }]);
        setIsError(true);
        setIsTyping(false);
      }, 700);
    }
  };

  const handleResetChat = () => {
    resetConversation();
    setMessages([{ 
      text: "Hey there, I'm Manisha — your personal assistant into the world of Analytical Advisors.Just ask, I’m all yours.", 
      sender: 'bot' 
    }]);
    setIsError(false);
  };
 
  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-teal-600 hover:bg-teal-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-all duration-300"
        aria-label={isOpen ? "Close chat" : "Open chat"}
        style={{ 
          boxShadow: '0 10px 25px -5px rgba(13, 148, 136, 0.5)', 
          width: '64px', 
          height: '64px' 
        }}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        ) : (
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
              <path d="M16 8c0 3.866-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7zM5 8a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
            </svg>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-400"></span>
            </span>
          </div>
        )}
      </button>

      {/* Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-20 right-0 w-80 md:w-96 bg-white rounded-lg shadow-xl overflow-hidden flex flex-col"
            style={{ 
              height: '500px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(13, 148, 136, 0.1)'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Chat with Manisha</h3>
                <p className="text-sm opacity-80">Your Analytical Advisors assistant</p>
              </div>
              <button 
                onClick={handleResetChat}
                className="text-white bg-teal-500 hover:bg-teal-400 p-1.5 rounded-full transition-colors"
                aria-label="Reset chat"
                title="Reset chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
                  <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-teal-600 text-white'
                        : 'bg-white text-gray-800 border-l-4 border-teal-500'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start mb-3">
                  <div className="bg-white text-gray-800 rounded-lg px-4 py-2 shadow-sm border-l-4 border-teal-500">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-teal-500 rounded-full mr-1 animate-bounce"></div>
                      <div className="w-2 h-2 bg-teal-500 rounded-full mr-1 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              {isError && (
                <div className="text-center text-xs text-red-500 mt-2 mb-2">
                  There was an error connecting to the AI service. You may continue chatting with limited responses.
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            <div className="px-4 py-2 border-t border-gray-200 flex gap-2 overflow-x-auto bg-white">
              {quickQuestions.map((question) => (
                <button
                  key={question.text}
                  onClick={() => handleQuickQuestion(question)}
                  className="text-xs bg-gray-100 hover:bg-teal-50 text-gray-800 hover:text-teal-700 border border-gray-200 hover:border-teal-200 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors"
                >
                  {question.text}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <div className="p-3 border-t border-gray-200 bg-white">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full px-4 py-2 border border-gray-300 focus:border-teal-500 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                  aria-label="Message input"
                />
                <button
                  onClick={handleSendMessage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-teal-600 hover:bg-teal-700 text-white p-1.5 rounded-full transition-colors"
                  aria-label="Send message"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/>
                  </svg>
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1 text-center">
                Powered by AI
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatBot; 