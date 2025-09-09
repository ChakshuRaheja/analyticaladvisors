import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/config';
import { FaEnvelope, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSendResetEmail = async (e) => {
    e?.preventDefault();
    
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

  const renderForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Reset Your Password
        </h2>
        <p className="text-sm text-gray-600">
          Enter your email address and we'll send you a secure link to reset your password.
        </p>
      </div>
      
      {message.text && (
        <div 
          className={`p-4 rounded-md flex items-start ${
            message.type === 'error' 
              ? 'bg-red-50 text-red-800' 
              : message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-blue-50 text-blue-800'
          }`}
        >
          {message.type === 'success' ? (
            <FaCheckCircle className="flex-shrink-0 h-5 w-5 mr-3 mt-0.5" />
          ) : null}
          <span>{message.text}</span>
        </div>
      )}
      
      <form onSubmit={handleSendResetEmail} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md h-10"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed h-10 items-center"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </motion.button>
        </div>
      </form>
      
      <div className="mt-6 text-center">
        <button
          onClick={() => navigate('/login')}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 inline-flex items-center"
        >
          <FaArrowLeft className="mr-1 h-3 w-3" /> Back to Login
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"
        >
          {renderForm()}
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword; 