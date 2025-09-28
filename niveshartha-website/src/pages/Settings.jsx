import { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import ErrorBoundary from '../components/ErrorBoundary';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, Timestamp, serverTimestamp } from 'firebase/firestore';
import { RecaptchaVerifier, PhoneAuthProvider, updatePhoneNumber, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import SubscriptionInfo from '../components/SubscriptionInfo';
import RiskProfiling from '../components/RiskProfiling';

// cheUserExists Api Call function
const checkExistingUser = async (phone) => {
  try {
    const response = await fetch('https://asia-south1-aerobic-acronym-466116-e1.cloudfunctions.net/checkUserExists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to check user existence');
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking user existence:', error);
    throw new Error('Could not verify phone number: ' + error.message);
  }
};

// Sidebar item component
const SidebarItem = ({ icon, text, isActive, onClick, hasAccess = true }) => {
  if (!hasAccess) return null;
  
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`
        flex items-center space-x-3 px-4 py-3 cursor-pointer rounded-lg
        ${isActive 
          ? 'bg-teal-600 text-white' 
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

// Main Settings component
const Settings = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('account');
  const [activeModal, setActiveModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ success: null, message: '' });
  const [loading, setLoading] = useState(false);
  const [sendingResetEmail, setSendingResetEmail] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ text: '', type: '' });
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [originalPhoneNumber, setOriginalPhoneNumber] = useState('');
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);
  const modalRef = useRef(null);
  
  // Phone verification state
  const [isPhoneVerificationModalOpen, setIsPhoneVerificationModalOpen] = useState(false);
  const [phoneVerificationStep, setPhoneVerificationStep] = useState('send'); // 'send' or 'verify'
  const [newPhone, setNewPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  
  // User data state
  const [userData, setUserData] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone ? currentUser.phone.replace(/^\+91/, '') : '',
    address: ''
  });

  // 1. Initialize reCAPTCHA (add this in useEffect when component mounts)
  useEffect(() => {
    if (!isPhoneVerificationModalOpen) return; 
    if (!window.recaptchaVerifier && auth) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          'recaptcha-container',
          { 
            size: 'invisible',
            'callback': () => {
              // reCAPTCHA solved, will be called when the reCAPTCHA is verified
            },
            'expired-callback': () => {
              // Reset reCAPTCHA?
            }
          }
        );
        window.recaptchaVerifier.render().then(widgetId => {
          console.log('reCAPTCHA widget ready, ID:', widgetId);
        });
      } catch (err) {
        console.error('Error initializing reCAPTCHA:', err);
      }
    }

    return () => {
      // Clean up when modal closes
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.warn('Error clearing reCAPTCHA:', e);
        }
        window.recaptchaVerifier = undefined;
      }
    };
  }, [auth, isPhoneVerificationModalOpen]);

  // 2. Send verification code function
  const sendPhoneVerificationCode = async (phoneNumber) => {
    try {
      setIsVerifyingPhone(true);
      
      // Format phone number with country code
      const formattedPhone = phoneNumber.startsWith('+91') 
        ? phoneNumber 
        : `+91${phoneNumber}`;
      

        const appVerifier = window.recaptchaVerifier;
      // Send verification code
      const provider = new PhoneAuthProvider(auth);
      const verificationId = await provider.verifyPhoneNumber(formattedPhone, appVerifier);
      
      // Store confirmation result for later verification
      window.verificationId = verificationId;
      
      setPhoneVerificationStep('verify');
      setSaveMessage({
        text: 'Verification code sent successfully!',
        type: 'success'
      });
      
    } catch (error) {
      console.error('Error sending verification code:', error);
      
      let errorMessage = 'Failed to send verification code.';
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/app-not-authorized') {
        errorMessage = 'This app is not authorized to use Firebase Authentication.';
      }
      
      setSaveMessage({
        text: errorMessage,
        type: 'error'
      });
      
      throw error;
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  // 3. Verify code and update phone number
  const verifyPhoneNumber = async (verificationCode) => {
    try {
      setIsVerifyingPhone(true);
      
      // Get the phone credential
      const phoneCredential = PhoneAuthProvider.credential(
       window.verificationId,
        verificationCode
      );
      
      // Update the user's phone number
      await updatePhoneNumber(auth.currentUser, phoneCredential);
      
      // Update Firestore with the new phone number
      const formattedPhone = newPhone.startsWith('+91') 
        ? newPhone 
        : `+91${newPhone}`;
        
      await updateDoc(doc(db, 'users', currentUser.uid), {
        phone: formattedPhone,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setUserData(prev => ({
        ...prev,
        phone: newPhone
      }));
      
      setSaveMessage({
        text: 'Phone number updated successfully!',
        type: 'success'
      });
      
      return true;
      
    } catch (error) {
      console.error('Error verifying phone number:', error);
      
      let errorMessage = 'Invalid verification code.';
      
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'The verification code is incorrect. Please try again.';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'The verification code has expired. Please request a new one.';
      } else if (error.code === 'auth/credential-already-in-use') {
        errorMessage = 'This phone number is already associated with another account.';
      }
      
      setSaveMessage({
        text: errorMessage,
        type: 'error'
      });
      
      throw error;
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  // Close phone verification modal
  const closePhoneVerificationModal = () => {
    setIsPhoneVerificationModalOpen(false);
    setPhoneVerificationStep('send');
    setNewPhoneNumber('');
    setVerificationCode('');
    setSaveMessage({ text: '', type: '' });
  };

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.uid) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserData(prev => ({
            ...prev,
            phone: userData.phone ? userData.phone.replace(/^\+91/, '') : prev.phone,
            address: userData.address || prev.address
          }));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [currentUser]);
  
  // Support form data
  const [supportFormData, setSupportFormData] = useState({
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: '',
    subject: '',
    message: '',
    preferredTime: ''
  });
  
  // Check if user has an active subscription
  useEffect(() => {
    const checkSubscription = async () => {
      if (!currentUser) return;
      
      try {
        // Add your subscription check logic here
        // For example, check Firestore for active subscription
        // const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        // setHasSubscription(userDoc.data()?.hasActiveSubscription || false);
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };
    
    checkSubscription();
  }, [currentUser]);
  
  // Handle password reset via email
  const handlePasswordReset = async () => {
    if (!currentUser?.email) {
      setMessage({ 
        text: 'No email address found for your account.', 
        type: 'error' 
      });
      return;
    }
    
    try {
      setLoading(true);
      setMessage({ 
        text: 'Sending password reset email...', 
        type: 'info' 
      });
      
      await sendPasswordResetEmail(auth, currentUser.email, {
        url: 'https://analyticaladvisors.in/login'
      });
      
      setMessage({ 
        text: `Password reset email sent to ${currentUser.email}. Please check your inbox.`,
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

  // Handle password reset email
  const handleSendResetEmail = async () => {
    if (!currentUser?.email) {
      setMessage({ 
        text: 'No email address found for your account.', 
        type: 'error' 
      });
      return;
    }
    
    try {
      setSendingResetEmail(true);
      await sendPasswordResetEmail(auth, currentUser.email, {
        url: 'https://analyticaladvisors.in/login'
      });
      
      setMessage({ 
        text: `Password reset email sent to ${currentUser.email}. Please check your inbox.`,
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
      setSendingResetEmail(false);
    }
  };

  // Close modal when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setActiveModal(null);
      }
    }
    
    function handleEscapeKey(event) {
      if (event.key === 'Escape') {
        setActiveModal(null);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);
  
  const handleSupportInputChange = (e) => {
    const { name, value } = e.target;
    setSupportFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Basic form validation
    if (activeModal === 'callback' && !supportFormData.preferredTime) {
      setSubmitStatus({ success: false, message: 'Please select a preferred callback time' });
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('_subject', `[${activeModal === 'query' ? 'Query' : activeModal === 'callback' ? 'Callback' : 'Feedback'}] ${supportFormData.subject || 'No Subject'}`);
      formData.append('_template', 'table');
      formData.append('_autoresponse', `Thank you for your ${activeModal === 'query' ? 'query' : activeModal === 'callback' ? 'callback request' : 'feedback'}. We'll get back to you soon!`);
      formData.append('name', supportFormData.name);
      formData.append('email', supportFormData.email);
      formData.append('phone', supportFormData.phone ? `+91${supportFormData.phone}` : 'N/A');
      formData.append('subject', supportFormData.subject || 'N/A');
      formData.append('message', supportFormData.message);
      if (activeModal === 'callback') {
        formData.append('preferredTime', supportFormData.preferredTime);
      }

      const response = await fetch('https://formsubmit.co/ajax/f747b7ea84fc616da624d24df459669d', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (response.ok) {
        setSubmitStatus({ success: true, message: 'Your message has been sent successfully!' });
        // Reset form
        setSupportFormData({
          name: currentUser?.displayName || '',
          email: currentUser?.email || '',
          phone: '',
          subject: '',
          message: '',
          preferredTime: ''
        });
        
        // Close modal after 2 seconds
        setTimeout(() => {
          setActiveModal(null);
          setSubmitStatus({ success: null, message: '' });
        }, 2000);
      } else {
        throw new Error(result.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus({ 
        success: false, 
        message: error.message || 'Failed to send message. Please try again later.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderModal = () => {
    if (!activeModal) return null;

    const modalTitle = {
      query: 'Submit a Query',
      callback: 'Request a Call Back',
      feedback: 'Share Your Feedback'
    }[activeModal];

    const modalDescription = {
      query: 'Please provide details about your query and we\'ll get back to you as soon as possible.',
      callback: 'Let us know your preferred time for a callback and we\'ll get in touch with you.',
      feedback: 'We appreciate your feedback to help us improve our services.'
    }[activeModal];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start md:items-center justify-center z-50 p-4 pt-20 md:pt-4 overflow-y-auto">
        <div 
          ref={modalRef}
          className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[calc(100vh-6rem)] md:max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">{modalTitle}</h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">{modalDescription}</p>
            
            {submitStatus.message && (
              <div 
                className={`mb-6 p-4 rounded-lg ${
                  submitStatus.success 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}
              >
                <div className="flex items-center">
                  {submitStatus.success ? (
                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  <span>{submitStatus.message}</span>
                </div>
              </div>
            )}
            
            {!submitStatus.success && (
              <form onSubmit={handleSupportSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={supportFormData.name}
                    onChange={handleSupportInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={supportFormData.email}
                    onChange={handleSupportInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number {activeModal === 'callback' ? '*' : ''}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">+91</span>
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={supportFormData.phone}
                      onChange={(e) => {
                        // Allow only numbers and remove any non-digit characters
                        const numericValue = e.target.value.replace(/\D/g, '');
                        setSupportFormData(prev => ({
                          ...prev,
                          phone: numericValue
                        }));
                      }}
                      className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="1234567890"
                      pattern="[0-9]{10}"
                      title="Please enter a valid 10-digit phone number"
                      required={activeModal === 'callback'}
                    />
                  </div>
                </div>
                
                {activeModal !== 'feedback' && (
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      {activeModal === 'query' ? 'Query Subject *' : 'Subject'}
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={supportFormData.subject}
                      onChange={handleSupportInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required={activeModal === 'query'}
                    />
                  </div>
                )}
                
                {activeModal === 'callback' && (
                  <div>
                    <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Callback Time *
                    </label>
                    <input
                      type="datetime-local"
                      id="preferredTime"
                      name="preferredTime"
                      value={supportFormData.preferredTime}
                      onChange={handleSupportInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    />
                  </div>
                )}
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    {activeModal === 'callback' ? 'Additional Notes' : 'Message *'}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={supportFormData.message}
                    onChange={handleSupportInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required={activeModal !== 'callback'}
                    placeholder={activeModal === 'callback' ? 'Any additional information about your request...' : 'Please provide details about your ' + (activeModal === 'query' ? 'query...' : 'feedback...')}
                  ></textarea>
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-6 rounded-lg font-medium text-white ${
                      isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : activeModal === 'query' 
                          ? 'bg-indigo-600 hover:bg-indigo-700' 
                          : activeModal === 'callback'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-purple-600 hover:bg-purple-700'
                    } transition-colors`}
                  >
                    {isSubmitting ? (
                      'Sending...'
                    ) : (
                      `Submit ${activeModal === 'query' ? 'Query' : activeModal === 'callback' ? 'Request' : 'Feedback'}`
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Phone verification modal
  const renderPhoneVerificationModal = () => {
    if (!isPhoneVerificationModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Verify Phone Number</h3>
              <button 
                onClick={closePhoneVerificationModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {phoneVerificationStep === 'send' ? (
              <div className="space-y-4">
                <p className="text-gray-600">
                  We'll send a verification code to your new phone number:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-lg">+91 {newPhone}</p>
                </div>

                <div id="recaptcha-container" className="mt-4"></div>

                <button
                  onClick={async () => {
                    try {
                      await sendPhoneVerificationCode(newPhone);
                    } catch (error) {
                      setSaveMessage({
                        text: 'Failed to send verification code. Please try again.',
                        type: 'error'
                      });
                    }
                  }}
                  disabled={isVerifyingPhone}
                  className="w-full py-3 px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifyingPhone ? 'Sending...' : 'Send Verification Code'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Enter the 6-digit verification code sent to:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-lg">+91 {newPhone}</p>
                </div>
                
                <div>
                  <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="123456"
                    maxLength="6"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setPhoneVerificationStep('send')}
                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await verifyPhoneNumber(verificationCode);                        
                        console.log('Phone verification successful');
                        
                        setSaveMessage({
                          text: 'Phone number updated successfully!',
                          type: 'success'
                        });
                        
                        closePhoneVerificationModal();
                        setIsEditing(false);
                        
                        // Reset message after 3 seconds
                        setTimeout(() => setSaveMessage({ text: '', type: '' }), 3000);
                        
                      } catch (error) {
                        console.error('Error verifying phone number:', error);
                        setSaveMessage({
                          text: 'Invalid verification code. Please try again.',
                          type: 'error'
                        });
                      }
                    }}
                    disabled={isVerifyingPhone || verificationCode.length !== 6}
                    className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifyingPhone ? 'Verifying...' : 'Verify & Update'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  // Add profile form state
  const [profileData, setProfileData] = useState({
    displayName: currentUser?.displayName || '',
    dateOfBirth: '',
    profileImage: null
  });
  const [profileImageUrl, setProfileImageUrl] = useState(currentUser?.photoURL || null);
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);

  // Check URL parameters for section
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sectionParam = params.get('section');
    
    if (sectionParam && ['profile', 'settings', 'password', 'help', 'my-plans', 'stock-recommendations'].includes(sectionParam)) {
      setActiveSection(sectionParam);
    }
  }, [location]);

  // Fetch user data including subscription and KYC status
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchUserData = async () => {
      try {
        // Fetch user document
        console.log('Fetching user data for UID:', currentUser.uid);
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log('Fetched user data from Firestore:', data);
          console.log('Current user auth data:', {
            displayName: currentUser.displayName,
            phone: currentUser.phone,
            email: currentUser.email
          });
          
          const newUserData = {
            displayName: data.displayName || currentUser.displayName || '',
            email: currentUser.email || '',
            phone: (data.phone || currentUser.phone || '').replace(/^\+91/, ''),
            address: data.address || ''
          };
          
          console.log('Setting user data:', newUserData);
          setUserData(newUserData);
          setOriginalPhoneNumber((data.phone || currentUser.phone || '').replace(/^\+91/, ''));
          setKycStatus(data.kycStatus || 'pending');
        }

        // Query subscriptions collection for the current user (Firebase v9+ modular syntax)
        const subscriptionsRef = collection(db, 'subscriptions');
        const q = query(subscriptionsRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        console.log('Subscription query results:', querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
        
        const activeSubs = [];
        
        // If no subscriptions found, log and return early
        if (querySnapshot.empty) {
          console.log('No subscriptions found for user');
          setActiveSubscriptions([]);
          return;
        }
        
        // Check each subscription
        for (const doc of querySnapshot.docs) {
          const subscriptionData = doc.data();
          console.log('Processing subscription:', subscriptionData);
          
          // Log the status for debugging
          console.log('Subscription status:', subscriptionData.status);
          
          // Check if status is active (case insensitive)
          if (subscriptionData.status && typeof subscriptionData.status === 'string' && 
              subscriptionData.status.toLowerCase() !== 'active') {
            console.log('Skipping subscription - status not active:', subscriptionData.status);
            continue;
          }
          
          // Handle different date formats
          let endDate;
          if (subscriptionData.endDate) {
            if (subscriptionData.endDate.seconds) {
              // Handle Firestore Timestamp
              endDate = new Date(subscriptionData.endDate.seconds * 1000);
            } else if (subscriptionData.endDate.toDate) {
              // Handle Firestore Timestamp (alternative)
              endDate = subscriptionData.endDate.toDate();
            } else if (typeof subscriptionData.endDate === 'string') {
              // Handle string date
              endDate = new Date(subscriptionData.endDate);
            } else if (subscriptionData.endDate instanceof Date) {
              // Already a Date object
              endDate = subscriptionData.endDate;
            }
          }
          
          if (!endDate || isNaN(endDate.getTime())) {
            console.log('No valid end date found for subscription:', subscriptionData);
            continue;
          }
          
          const now = new Date();
          console.log('Subscription end date:', endDate, 'Current date:', now);
          
          if (endDate > now) {
            console.log('Active subscription found:', subscriptionData);
            // Map planId to internal plan key
            const planId = subscriptionData.planId;
            if (planId) {
              // Normalize planId by replacing hyphens with underscores
              const normalizedPlanId = planId.replace(/-/g, '_');
              if (!activeSubs.includes(normalizedPlanId)) {
                activeSubs.push(normalizedPlanId);
              }
            }
          } else {
            console.log('Subscription expired on:', endDate);
          }
        }
        
        console.log('Active subscriptions:', activeSubs);
        setActiveSubscriptions(activeSubs);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setHasSubscription(false);
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

  // Handle form input changes for password form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Check if user has an active subscription
  const hasActiveSubscription = activeSubscriptions.length > 0;

  // Handle input changes for account details
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save account details to Firestore
  const handleSaveAccountDetails = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    
    console.log('Saving account details with data:', { userData,
    originalPhoneNumber,
    currentUser: currentUser.phone});
    setIsSaving(true);
    setSaveMessage({ text: '', type: '' });
    
    try {
      // Check if phone number has changed
      const currentPhone = (userData.phone || '').replace(/^\+91/, '');
      const originalPhone = (originalPhoneNumber || '').replace(/^\+91/, '');
      const fullPhone = `+91${currentPhone}`;

      if(currentUser.phone !== fullPhone){
        // If phone number changed, require verification
        if (originalPhone !== currentPhone && currentPhone) {
          try {
            const checkResult = await checkExistingUser(fullPhone);
            console.log('Phone check result:', checkResult);
  
            // If phone exists and it's not the current user's phone, block update
            if (checkResult.phoneExists && originalPhone !== currentPhone) {
              setSaveMessage({
                text: 'This phone number is already registered with another account.',
                type: 'error'
              });
              setIsSaving(false);
              return;
            }
          } catch (err) {
            setSaveMessage({
              text: err.message || 'Error verifying phone number.',
              type: 'error'
            });
            setIsSaving(false);
            return;
          }
  
          console.log('Phone number changed - opening verification modal');
          setNewPhoneNumber(currentPhone);
          setIsPhoneVerificationModalOpen(true);
          setIsSaving(false);
          return; // Stop here and let verification modal handle the rest
        }
      }
      
      const updateData = {
        displayName: userData.displayName,
        phone: userData.phone ? `+91${userData.phone}` : userData.phone,
        address: userData.address,
        updatedAt: serverTimestamp()
      };
      
      console.log('Updating Firestore with:', updateData);
      
      // Update Firestore document
      await updateDoc(doc(db, 'users', currentUser.uid), updateData);
      
      console.log('Firestore update successful');
      
      // Update auth profile if display name changed
      if (currentUser.displayName !== userData.displayName) {
        console.log('Updating auth display name to:', userData.displayName);
        await updateProfile(auth.currentUser, {
          displayName: userData.displayName
        });
        console.log('Auth profile update successful');
      }
      
      setSaveMessage({
        text: 'Account details updated successfully!',
        type: 'success'
      });
      
      // Exit edit mode after a short delay
      setTimeout(() => {
        setIsEditing(false);
        // Reset the message after 3 seconds
        setTimeout(() => setSaveMessage({ text: '', type: '' }), 3000);
      }, 1000);
      
    } catch (error) {
      console.error('Error updating account details:', error);
      setSaveMessage({
        text: 'Failed to update account details. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Toggle edit mode for account details
  const toggleEditMode = async () => {
    if (isEditing) {
      // If canceling edit, reset to original values
      console.log('Canceling edit, resetting form data...');
      try {
        console.log('Fetching latest user data from Firestore...');
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const resetData = {
            displayName: data.displayName || currentUser.displayName || '',
            email: currentUser.email || '',
            phone: (data.phone || currentUser.phone || '').replace(/^\+91/, ''),
            address: data.address || ''
          };
          console.log('Resetting form data to:', resetData);
          setUserData(prev => ({
            ...prev,
            ...resetData
          }));
          setOriginalPhoneNumber((data.phone || currentUser.phone || '').replace(/^\+91/, ''));
        } else {
          console.log('No user document found in Firestore');
        }
      } catch (error) {
        console.error('Error resetting form data:', error);
      }
    } else {
      console.log('Entering edit mode with current userData:', userData);
      setOriginalPhoneNumber(userData.phone || '');
    }
    setIsEditing(!isEditing);
  };

  // Handle edit profile
  const handleEditProfile = () => {
    setActiveSection('profile');
  };

  // Handle change password navigation
  const handleChangePassword = () => {
    setActiveSection('password');
  };

  const renderContent = () => {
    switch (activeSection) {
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2 text-center md:text-left">Complete Your Profile</h2>
                <p className="text-gray-600 mb-6">
                  Complete your profile to get the most out of your subscription.
                  This helps us provide you with personalized investment recommendations.
                </p>
                {/* KYC verification temporarily disabled
                <RiskProfiling />
                */}
              </div>
            </ErrorBoundary>
          </div>
        );

      case 'my-plans':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">My Plans & Subscriptions</h2>
              {/* <button
                onClick={() => navigate('/subscription')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Upgrade Plan
              </button> */}
            </div>
            
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
                      An error occurred while loading your subscriptions. Please refresh the page or contact support if the issue persists.
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
                    >
                      Try again <span aria-hidden="true">&rarr;</span>
                    </button>
                  </div>
                </div>
              </div>
            }>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <SubscriptionInfo />
              </div>
            </ErrorBoundary>
          </div>
        );

      case 'stock-recommendations':
        return <StockRecommendations currentUser={currentUser} activeSubscriptions={activeSubscriptions} />;



      case 'account':
        return (
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Account Details</h2>
              <p className="mt-2 text-gray-600">View and manage your account information</p>
            </div>

            {saveMessage.text && (
              <div className={`mb-6 p-4 rounded-lg ${
                saveMessage.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {saveMessage.text}
              </div>
            )}

            <form onSubmit={handleSaveAccountDetails} className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={toggleEditMode}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="space-x-2">
                      <button
                        type="button"
                        onClick={toggleEditMode}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        disabled={isSaving}
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between pb-2 border-b">
                    <label className="text-gray-600 mb-1 sm:mb-0">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="displayName"
                        value={userData.displayName || ''}
                        onChange={handleInputChange}
                        className="px-2 py-1 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    ) : (
                      <span className="font-medium">{userData.displayName || 'Not set'}</span>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between pb-2 border-b">
                    <span className="text-gray-600 mb-1 sm:mb-0">Email</span>
                    <span className="font-medium">{userData.email || 'Not set'}</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between pb-2 border-b">
                    <label className="text-gray-600 mb-1 sm:mb-0">Mobile</label>
                    {isEditing ? (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">+91</span>
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={userData.phone ? userData.phone.replace(/^\+91/, '') : ''}
                          onChange={(e) => {
                            // Allow only numbers and remove any non-digit characters
                            const numericValue = e.target.value.replace(/\D/g, '');
                            setUserData(prev => ({
                              ...prev,
                              phone: numericValue
                            }));
                          }}
                          className="pl-12 pr-2 py-1 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="1234567890"
                          pattern="[0-9]{10}"
                          title="Please enter a valid 10-digit phone number"
                        />
                      </div>
                    ) : (
                      <span className="font-medium">
                        {userData.phone ? userData.phone.replace(/^\+91/, '') : 'Not set'}
                      </span>
                    )}
                  </div>
                  
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    {isEditing ? (
                      <textarea
                        name="address"
                        value={userData.address || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows="3"
                        placeholder="Enter your full address"
                      />
                    ) : (
                      <p className="text-gray-800 whitespace-pre-line">
                        {userData.address || 'No address provided'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Password</h3>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 mb-3">
                    To change your password, we'll send you a secure link to your email address.
                  </p>
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : 'Send Password Reset Email'}
                  </button>
                  {message.text && (
                    <p className={`mt-2 text-sm ${
                      message.type === 'success' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {message.text}
                    </p>
                  )}
                </div>
              </div>
            </form>
          </div>
        );

      case 'password':
        return (
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Reset Your Password</h2>
              <p className="mt-2 text-gray-600">We'll send you a secure link to reset your password</p>
            </div>

            {message.text && (
              <div 
                className={`mb-6 p-4 rounded-lg border ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-800 border-green-300' 
                    : message.type === 'error'
                    ? 'bg-red-50 text-red-800 border-red-300'
                    : 'bg-blue-50 text-blue-800 border-blue-300'
                }`}
              >
                <div className="flex items-center">
                  {message.type === 'success' ? (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  ) : message.type === 'error' ? (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {message.text}
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={currentUser?.email || ''}
                  disabled
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-gray-50 cursor-not-allowed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending Reset Link...' : 'Send Password Reset Email'}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setActiveSection('account')}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Back to Account
                </button>
              </div>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Support / Feedback</h2>
                <p className="mt-2 text-gray-600">We're here to help. Choose an option below to get assistance.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Raise a Query Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-2">Raise a Query</h3>
                  <p className="text-gray-600 text-center mb-11">Have a specific question? Our support team is ready to help.</p>
                  <button 
                    onClick={() => setActiveModal('query')}
                    className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Submit Query
                  </button>
                </div>

                {/* Request a Call Back Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-2">Request a Call Back</h3>
                  <p className="text-gray-600 text-center mb-4">Prefer to speak with someone? We'll call you back at your convenience.</p>
                  <button 
                    onClick={() => setActiveModal('callback')}
                    className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Request Call Back
                  </button>
                </div>

                {/* General Feedback Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-2">General Feedback</h3>
                  <p className="text-gray-600 text-center mb-4">We'd love to hear your thoughts and suggestions to improve our service.</p>
                  <button 
                    onClick={() => setActiveModal('feedback')}
                    className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Share Feedback
                  </button>
                </div>

                {/* Do-it-yourself Card */}
                <Link to="/faq" className="block">
                  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 h-full">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-center mb-2">Do-it-yourself</h3>
                    <p className="text-gray-600 text-center mb-4">Find answers to common questions in our comprehensive FAQ section.</p>
                    <div className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center">
                      View FAQs
                    </div>
                  </div>
                </Link>
              </div>
            </div>
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

  // Navigation items
  const navItems = [
    { id: 'account', text: 'Account', icon: '👤' },
    { id: 'my-plans', text: 'My Plans & Subscriptions', icon: '💎' },
    // { id: 'stock-recommendations', text: 'Stock Recommendations', icon: '📈' },
    { id: 'password', text: 'Change Password', icon: '🔒', hideFromNav: true }, // Hidden from main nav, accessible from Account
    { id: 'help', text: 'Help & Support', icon: '❓' },
  ];
  
  // Filter out hidden navigation items
  const visibleNavItems = navItems.filter(item => !item.hideFromNav);

  return (
    <div className="min-h-screen bg-gray-50">
      {activeModal && renderModal()}
      {renderPhoneVerificationModal()}
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
            </div>
          </div>
          
          <nav className="space-y-1 mt-6">
            {visibleNavItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                text={item.text}
                isActive={activeSection === item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  if (isMobileMenuOpen) setIsMobileMenuOpen(false);
                }}
                hasAccess={item.hasAccess !== false}
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

export default Settings;