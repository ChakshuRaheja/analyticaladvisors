import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { motion } from 'framer-motion';

const Profile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formData, setFormData] = useState({
    displayName: '',
    photoURL: ''
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        displayName: currentUser.displayName || '',
        photoURL: currentUser.photoURL || ''
      });
    }
  }, [currentUser]);

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

    try {
      await updateProfile(currentUser, {
        displayName: formData.displayName,
        photoURL: formData.photoURL
      });
      
      setMessage({
        text: 'Profile updated successfully!',
        type: 'success'
      });
    } catch (error) {
      setMessage({
        text: `Error updating profile: ${error.message}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to format the creation date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-md rounded-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-indigo-600 text-white p-6">
            <h1 className="text-2xl font-bold">Your Profile</h1>
            <p className="mt-1 text-indigo-100">Manage your account settings and preferences</p>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="flex-shrink-0">
                {currentUser.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover border-2 border-indigo-600"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-4xl font-bold">
                    {currentUser.displayName 
                      ? currentUser.displayName.charAt(0).toUpperCase() 
                      : currentUser.email.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-grow text-center md:text-left">
                <h2 className="text-xl font-bold">
                  {currentUser.displayName || 'User'}
                </h2>
                <p className="text-gray-600 mt-1">{currentUser.email}</p>
                <div className="mt-3 text-sm text-gray-500">
                  <p>Member since: {formatDate(currentUser.metadata?.creationTime)}</p>
                  <p>Last sign in: {formatDate(currentUser.metadata?.lastSignInTime)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
            
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
                  htmlFor="displayName" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Display Name
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label 
                  htmlFor="photoURL" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Profile Photo URL
                </label>
                <input
                  type="text"
                  id="photoURL"
                  name="photoURL"
                  value={formData.photoURL}
                  onChange={handleChange}
                  placeholder="https://example.com/profile-image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter a URL to an image (PNG, JPG) for your profile picture
                </p>
              </div>
              
              <div className="pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className={`
                    w-full md:w-auto px-6 py-2 bg-indigo-600 text-white rounded-md 
                    hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                    transition-colors duration-200
                    ${loading ? 'opacity-70 cursor-not-allowed' : ''}
                  `}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </div>
            </form>
          </div>
          
          {/* Account Security */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Account Security</h3>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/reset-password')}
                className="w-full md:w-auto px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Change Password
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile; 