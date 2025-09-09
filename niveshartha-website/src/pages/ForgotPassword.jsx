import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/config';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage({ text: 'Please enter your email address', type: 'error' });
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ text: 'Please enter a valid email address', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ text: 'Sending password reset email...', type: 'info' });
      
      await sendPasswordResetEmail(auth, email, {
        url: 'https://analyticaladvisors.in/login'
      });
      
      setMessage({ 
        text: `Password reset email sent to ${email}. Please check your inbox and follow the instructions.`,
        type: 'success' 
      });
      
    } catch (error) {
      console.error('Error sending reset email:', error);
      setMessage({ 
        text: error.code === 'auth/user-not-found' 
          ? 'No account found with this email address.' 
          : 'Failed to send reset email. Please try again later.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4 sm:px-6">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-md rounded-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-teal-600 text-white p-6">
            <h1 className="text-2xl font-bold">Forgot Password</h1>
            <p className="mt-1 text-teal-100">Reset your password via email</p>
          </div>

          {/* Form */}
          <div className="p-6">
            {message.text && (
              <div 
                className={`p-4 mb-4 rounded-md ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message.text}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  We'll send a password reset link to this email
                </p>
              </div>
              
              <div className="pt-4 flex items-center justify-between">
                <Link
                  to="/login"
                  className="text-teal-600 hover:text-teal-800 transition-colors duration-200 text-sm"
                >
                  Back to Login
                </Link>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className={`
                    px-6 py-2 bg-teal-600 text-white rounded-md 
                    hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
                    transition-colors duration-200
                    ${loading ? 'opacity-70 cursor-not-allowed' : ''}
                  `}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </motion.button>
              </div>
            </form>
          </div>
          
          {/* Additional help */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <p>Still having trouble? <Link to="/contact" className="text-teal-600 hover:text-teal-800">Contact Support</Link></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword; 