import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, sendPasswordResetEmail } from 'firebase/auth';
import { motion } from 'framer-motion';

const ResetPassword = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sendingResetEmail, setSendingResetEmail] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    // Validate password match
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({
        text: 'New passwords do not match.',
        type: 'error'
      });
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData.newPassword.length < 6) {
      setMessage({
        text: 'Password should be at least 6 characters long.',
        type: 'error'
      });
      setLoading(false);
      return;
    }

    try {
      // Re-authenticate the user first
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        formData.currentPassword
      );
      
      await reauthenticateWithCredential(currentUser, credential);
      
      // Then update the password
      await updatePassword(currentUser, formData.newPassword);
      
      setMessage({
        text: 'Password updated successfully!',
        type: 'success'
      });
      
      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error) {
      let errorMessage;
      
      switch(error.code) {
        case 'auth/wrong-password':
          errorMessage = 'Current password is incorrect.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many unsuccessful attempts. Please try again later.';
          break;
        default:
          errorMessage = `Error: ${error.message}`;
      }
      
      setMessage({
        text: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    setSendingResetEmail(true);
    setMessage({ text: '', type: '' });
    
    try {
      await sendPasswordResetEmail(currentUser.auth, currentUser.email);
      setMessage({
        text: 'Password reset email sent! Check your inbox for further instructions.',
        type: 'success'
      });
    } catch (error) {
      setMessage({
        text: `Error sending reset email: ${error.message}`,
        type: 'error'
      });
    } finally {
      setSendingResetEmail(false);
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
          <div className="bg-indigo-600 text-white p-6">
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="mt-1 text-indigo-100">Change your account password</p>
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
                  htmlFor="currentPassword" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label 
                  htmlFor="newPassword" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Password must be at least 6 characters long
                </p>
              </div>
              
              <div>
                <label 
                  htmlFor="confirmPassword" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                >
                  Back to Profile
                </button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className={`
                    px-6 py-2 bg-indigo-600 text-white rounded-md 
                    hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                    transition-colors duration-200
                    ${loading ? 'opacity-70 cursor-not-allowed' : ''}
                  `}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </motion.button>
              </div>
            </form>
          </div>
          
          {/* Alternative reset option */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Forgot your current password?</h3>
            <p className="text-sm text-gray-600 mb-4">
              We can send you a password reset link to your email address ({currentUser.email})
            </p>
            <button
              onClick={handleSendResetEmail}
              disabled={sendingResetEmail}
              className={`
                w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-indigo-100
                hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                ${sendingResetEmail ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {sendingResetEmail ? 'Sending...' : 'Send '}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword; 