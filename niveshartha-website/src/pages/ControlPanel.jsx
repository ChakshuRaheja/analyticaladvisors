import { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import SubscriptionInfo from '../components/SubscriptionInfo';
import RiskProfiling from '../components/RiskProfiling';
import ErrorBoundary from '../components/ErrorBoundary';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Sidebar item component
const SidebarItem = ({ icon, text, isActive, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`
        flex items-center space-x-3 px-4 py-3 cursor-pointer rounded-lg
        ${isActive 
          ? 'bg-indigo-600 text-white' 
          : 'text-gray-700 hover:bg-gray-100'
        }
        transition-colors duration-200
      `}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{text}</span>
    </motion.div>
  );
};

// Main Control Panel component
const ControlPanel = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingResetEmail, setSendingResetEmail] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  // Add profile form state
  const [profileData, setProfileData] = useState({
    displayName: currentUser?.displayName || '',
    dateOfBirth: '',
    profileImage: null
  });
  const [profileImageUrl, setProfileImageUrl] = useState(currentUser?.photoURL || null);
  const fileInputRef = useRef(null);
  const [userData, setUserData] = useState(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);

  // Check URL parameters for section
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sectionParam = params.get('section');
    
    if (sectionParam && ['dashboard', 'profile', 'settings', 'password', 'help'].includes(sectionParam)) {
      setActiveSection(sectionParam);
    }
  }, [location]);

  // Fetch user data including subscription and KYC status
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      try {
        // Fetch user document
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setKycStatus(data.kycStatus || 'pending');
        }

        // Fetch subscription document
        const subscriptionDoc = await getDoc(doc(db, 'subscriptions', currentUser.uid));
        setHasSubscription(subscriptionDoc.exists() && subscriptionDoc.data().status === 'active');
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Handle profile form input changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle profile image selection
  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileData(prev => ({
        ...prev,
        profileImage: file
      }));
      
      // Create a preview URL
      const imageUrl = URL.createObjectURL(file);
      setProfileImageUrl(imageUrl);
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Handle profile form submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Add your profile update logic here
      // For example, update display name and upload profile image to storage
      
      setMessage({
        text: 'Profile successfully updated!',
        type: 'success'
      });
    } catch (error) {
      setMessage({
        text: error.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not logged in
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle password reset form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error("New passwords don't match");
      }

      if (formData.newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      // Add your password reset logic here
      
      setMessage({
        text: 'Password successfully updated!',
        type: 'success'
      });
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage({
        text: error.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle sending password reset email
  const handleSendResetEmail = async () => {
    setSendingResetEmail(true);
    try {
      // Add your send reset email logic here
      
      setMessage({
        text: 'Password reset link sent to your email!',
        type: 'success'
      });
    } catch (error) {
      setMessage({
        text: error.message,
        type: 'error'
      });
    } finally {
      setSendingResetEmail(false);
    }
  };

  // Sidebar items configuration
  const sidebarItems = [
    { id: 'dashboard', text: 'Dashboard', icon: '📊' },
    { id: 'profile', text: 'Profile', icon: '👤' },
    { id: 'settings', text: 'Settings', icon: '⚙️' },
    { id: 'password', text: 'Reset Password', icon: '🔒'},
    { id: 'help', text: 'Help & Support', icon: '❓' },
  ];

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Subscription Info Card */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Your Subscription</h3>
              <SubscriptionInfo />
            </div>

            {/* Profile Completion Card - Show if user has subscription but profile is incomplete */}
            {hasSubscription && (
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4 border-b pb-2">
                  <h3 className="text-xl font-bold text-gray-900">Complete Your Profile</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Complete your risk profile and KYC verification to unlock all features and get personalized investment recommendations.
                </p>
                <button
                  onClick={() => setActiveSection('profile')}
                  className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Complete My Profile
                </button>
              </div>
            )}

            {/* What's New Card */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">What's New</h3>
              <div className="space-y-4 mt-4">
                <div className="space-y-6">
                  {/* Update 1 */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-indigo-100 p-2 rounded-full">
                      <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">New Investment Opportunities</h4>
                      <p className="text-sm text-gray-500 mt-1">Check out our latest investment recommendations and market insights.</p>
                    </div>
                  </div>
                  
                  {/* Update 2 */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-green-100 p-2 rounded-full">
                      <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Profile Completion</h4>
                      <p className="text-sm text-gray-500 mt-1">Complete your profile to unlock personalized investment strategies.</p>
                    </div>
                  </div>
                  
                  {/* Update 3 */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full">
                      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Market Updates</h4>
                      <p className="text-sm text-gray-500 mt-1">Stay informed with real-time market updates and analysis.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <ErrorBoundary fallback={
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      An error occurred while loading the profile form. Please refresh the page or contact support if the issue persists.
                    </p>
                  </div>
                </div>
              </div>
            }>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Complete Your Profile</h2>
                <p className="text-gray-600 mb-6">
                  Please complete your risk profiling and KYC verification to unlock all features of your subscription.
                  This helps us provide you with personalized investment recommendations and comply with financial regulations.
                </p>
                <RiskProfiling />
              </div>
            </ErrorBoundary>
          </div>
        );

      case 'settings':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Settings</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive email updates about your account</p>
                      </div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Marketing Emails</p>
                        <p className="text-sm text-gray-500">Receive emails about new features and offers</p>
                      </div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Activity Tracking</p>
                        <p className="text-sm text-gray-500">Allow us to track your activity for better recommendations</p>
                      </div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Data Sharing</p>
                        <p className="text-sm text-gray-500">Share your non-personal data for service improvement</p>
                      </div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'password':
        return (
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
              <p className="mt-2 text-gray-600">Create a new password for your account</p>
            </div>

            {message.text && (
              <div 
                className={`mb-6 p-4 rounded-lg border ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-800 border-green-300' 
                    : 'bg-red-50 text-red-800 border-red-300'
                }`}
              >
                <div className="flex items-center">
                  {message.type === 'success' ? (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                  )}
                  {message.text}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-200"
                  placeholder="Enter your current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-200"
                  placeholder="Enter your new password"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-200"
                  placeholder="Confirm your new password"
                />
              </div>

              <div className="flex flex-col space-y-4 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className={`
                    w-full py-4 text-white bg-indigo-600 rounded-lg
                    hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50
                    transform transition-all duration-200 ease-in-out
                    ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
                    text-lg font-semibold shadow-lg hover:shadow-xl
                  `}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resetting Password...
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSendResetEmail}
                  disabled={sendingResetEmail}
                  className={`
                    w-full py-4 text-indigo-600 bg-indigo-50 rounded-lg border-2 border-indigo-200
                    hover:bg-indigo-100 hover:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:ring-opacity-50
                    transform transition-all duration-200 ease-in-out
                    ${sendingResetEmail ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
                    text-lg font-semibold
                  `}
                >
                  {sendingResetEmail ? 'Sending Reset Link...' : 'Send Password Reset Email'}
                </button>
              </div>
            </form>
          </div>
        );

      default:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h2>
            <p className="text-gray-600">
              This section is under development. Please check back soon for updates.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-20 left-4 z-20">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md bg-white shadow-md text-gray-700 hover:bg-gray-100"
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Sidebar - Desktop and Mobile */}
      <aside 
        className={`
          fixed top-16 bottom-0 left-0 z-10
          w-64 bg-white shadow-md overflow-y-auto
          transition-transform duration-300
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-6 p-2 border-b pb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              {currentUser.displayName 
                ? currentUser.displayName.charAt(0).toUpperCase() 
                : currentUser.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{currentUser.displayName || currentUser.email.split('@')[0]}</p>
              <p className="text-xs text-gray-500">Member</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                text={item.text}
                isActive={activeSection === item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  if (isMobileMenuOpen) setIsMobileMenuOpen(false);
                }}
              />
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 pt-20 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default ControlPanel;