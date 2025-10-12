import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import {  
  updateProfile, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  signInWithCredential, 
  PhoneAuthProvider,
  EmailAuthProvider,
  linkWithCredential
} from 'firebase/auth';
import { sendWelcomeEmail } from '../services/emailService';
import { auth } from '../firebase/config';
import ScrollAnimation from '../components/ScrollAnimation';
import { doc, setDoc, serverTimestamp, getDocs, query, where, collection } from 'firebase/firestore';
import { db, functions } from '../firebase/config';
import { toast } from 'react-toastify';
import { httpsCallable } from 'firebase/functions';
import { useNavigationBlock } from '../context/NavigationBlockContext';


const SignUp = () => {
  const [currentStep, setCurrentStep] = useState(1);
  // Load saved form data from session storage on component mount
  const loadFormData = () => {
    const savedData = sessionStorage.getItem('signupFormData');
    return savedData ? JSON.parse(savedData) : {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptedTerms: false
    };
  };

  const hasFatalErrorRef = useRef(false);

  const errorShownRef = useRef({
    'auth/invalid-phone-number': false,
    'auth/too-many-requests': false,
  });
  
  const [formData, setFormData] = useState(loadFormData());
  const [error, setError] = useState({ message: '', isError: true });
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordStrengthText, setPasswordStrengthText] = useState('');
  const [passwordStrengthColor, setPasswordStrengthColor] = useState('text-red-500');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isAccountCreated, setIsAccountCreated] = useState(false);
  const [otpResentOnce, setOtpResentOnce] = useState(false);
  const [otpAutoSentOnce, setOtpAutoSentOnce] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const navigate = useNavigate();
  const location = useLocation();
  const [nextPath, setNextPath] = useState(null);


  const { setIsBlocking, showConfirmModal, confirmNavigation, cancelNavigation } = useNavigationBlock();
  
    useEffect(() => {
      setIsBlocking(currentStep === 3);
    }, [currentStep]);
  // Save form data to session storage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('signupFormData', JSON.stringify(formData));
  }, [formData]);

  // Redirect to login after account creation
  useEffect(() => {
    if (isAccountCreated) {
      // Show success toast
      toast.success('🎉 Account created successfully! Redirecting to login...', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      sessionStorage.setItem('hasRefreshedLogin', 'false');

      // Redirect to login after delay
      const timer = setTimeout(() => {
        navigate('/login');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isAccountCreated, navigate]);

  // Clear saved form data when component unmounts or when signup is complete
  useEffect(() => {
    return () => {
      // Only clear if we're not navigating to terms/privacy pages
      const isNavigatingAwayFromSignup = !location.pathname.includes('signup');
      const isNavigatingToAuthPages = 
        location.pathname === '/terms' || 
        location.pathname === '/privacy' || 
        location.pathname === '/disclaimer';
      
      if (isNavigatingAwayFromSignup && !isNavigatingToAuthPages) {
        sessionStorage.removeItem('signupFormData');
      }
    };
  }, [location.pathname]);

  const setupRecaptcha = async () => {
    const recaptchaWrapper = document.getElementById("recaptcha-wrapper");
    
    if (!recaptchaWrapper) {
      throw new Error("Recaptcha wrapper not found");
    }

    // Clear old recaptcha if any
    recaptchaWrapper.innerHTML = "";

    // Create a unique container id
    const containerId = `recaptcha-container${Math.floor(Math.random() * 1000000)}`;
    const newContainer = document.createElement("div");
    newContainer.id = containerId;
    recaptchaWrapper.appendChild(newContainer);

    // Create new verifier
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: () => console.log("reCAPTCHA solved"),
      "expired-callback": () => {
        toast.warning("Session expired. Please send the OTP again.", {
          position: "top-center",
          autoClose: 5000,
          pauseOnHover: true,
          draggable: true,
        });
      },
    });

    try {
      await window.recaptchaVerifier.render();
      console.log("setupRecaptcha: verifier rendered successfully", window.recaptchaVerifier);
    } catch (renderErr) {
      console.error("Error rendering reCAPTCHA:", renderErr);
      if (!renderErr.message?.includes("already been rendered")) {
        throw renderErr;
      }
    }

    return window.recaptchaVerifier;
  };


  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier && typeof window.recaptchaVerifier.clear === 'function') {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.warn('Error clearing recaptcha on cleanup:', e);
        }
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  useEffect(() => {
    if (currentStep === 1 && window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.warn('Error clearing recaptcha when going back:', e);
      }
      window.recaptchaVerifier = null;
      
      const recaptchaContainer = document.getElementById('recaptcha-container');
      if (recaptchaContainer) {
        recaptchaContainer.innerHTML = '';
      }
    }
  }, [currentStep]);

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (currentStep === 3) {
      const handleBeforeUnload = async (e) => {
        e.preventDefault();
        e.returnValue = ""; // Chrome requires returnValue to be set
        if (auth.currentUser) {
          try {
            await auth.currentUser.delete();
            console.log('Abandoned user deleted');
          } catch (deleteError) {
            console.warn('Failed to delete abandoned user:', deleteError);
          }
        }
      };

      const blockBack = () => {
        window.history.pushState(null, "", window.location.href);
      };

      // Push fake state to disable back
      window.history.pushState(null, "", window.location.href);
      window.addEventListener("popstate", blockBack);
      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("popstate", blockBack);
      };
    }
  }, [currentStep]);

  useEffect(()=> {
    let timeoutId;

    const autoSendOTP = async (e) => {
      if (currentStep === 2 && !otpSent && !loading && !otpAutoSentOnce){

        try {
          setError({ message: '', isError: false });
          setLoading(true);
          // Format phone number
          const formattedPhoneNumber = formData.phone.startsWith('+') ? formData.phone : `+91${formData.phone}`;
          const recaptchaContainer = document.getElementById('recaptcha-container');

          if (!window.recaptchaVerifier) {
            await setupRecaptcha();
          }
    
          // Get the reCAPTCHA verifier
          const appVerifier = window.recaptchaVerifier;
          console.log("autoSendOTP: using verifier:", appVerifier);
          console.log("autoSendOTP: formatted phone:", formattedPhoneNumber);
          // Send OTP
          const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
          setVerificationId(confirmation.verificationId);
          setOtpSent(true);
          setOtpAutoSentOnce(true);
          setResendTimer(30);
          setError({ message: 'OTP sent successfully!', isError: false });
        } catch (error) {
          console.error('Error sending OTP:', error);
          let errorMessage = 'Unable to send verification code.';
          
          if (error.code === 'auth/invalid-phone-number') {
            errorMessage = 'Please enter a valid phone number.';
          } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many attempts. Please try again later.';
          }
          if (!errorShownRef.current[error.code]) {
            toast.error(`Verification Error: ${errorMessage}`, {
              position: "top-center",
              autoClose: 7000,
              pauseOnHover: true,
              draggable: true,
            });
            errorShownRef.current[error.code] = true;
          }
          setError({ message: errorMessage, isError: true });

          if (window.recaptchaVerifier && typeof window.recaptchaVerifier.clear === 'function') {
            try {
              window.recaptchaVerifier.clear();
            } catch (e) {
              console.warn('Error clearing recaptcha after error:', e);
            }
            window.recaptchaVerifier = null;
          }
          const recaptchaContainer = document.getElementById('recaptcha-container');
          if (recaptchaContainer) {
            recaptchaContainer.innerHTML = '';
          }
          
          // Go back to step 1 to re-enter phone number
          setCurrentStep(1);
        } finally {
          setLoading(false);
        }
      }
    };
    
    if (!otpAutoSentOnce && currentStep === 2) {
      timeoutId = setTimeout(autoSendOTP, 1000);
    }
    return () => {
      clearTimeout(timeoutId);
    }
  }, [currentStep, otpSent, loading, formData.phone, otpAutoSentOnce])

  const handleResendOTP = async () => {
    if (otpResentOnce) return;

    try {
      setLoading(true);
      setError({ message: '', isError: false });

      // Format phone
      const formattedPhoneNumber = formData.phone.startsWith('+') ? formData.phone : `+91${formData.phone}`;

      await setupRecaptcha();

      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);

      setVerificationId(confirmation.verificationId);
      setOtpSent(true);
      setOtpResentOnce(true);
      setResendTimer(30);
      setError({ message: 'OTP resent successfully', isError: false });
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast.error('Failed to resend OTP. Please try again later.', {
        position: "top-center",
        autoClose: 5000,
        pauseOnHover: true,
        draggable: true,
      });
      setError({ message: 'Failed to resend OTP.', isError: true });
    } finally {
      setLoading(false);
    }
  };


  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setError({ message: 'Please enter the verification code', isError: true });
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Create credential
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      
      // Sign in with credential
      const userCredential = await signInWithCredential(auth, credential);
      
      // Sign out immediately after verification
      // await auth.signOut();
      
      setIsVerified(true);
      setIsPhoneVerified(true);
      setCurrentStep(3); // Move to password creation step
      setOtpSent(false);
      setError('Phone number verified successfully!');
    } catch (error) {
      console.error('OTP verification error:', error);
      let errorMessage = 'Invalid verification code. Please try again.';
      
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid OTP. Please check and try again.';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'OTP has expired. Please request a new one.';
      }
      
      setError({ message: errorMessage, isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.acceptedTerms) {
      setError('Please accept the Terms & Conditions, Privacy Policy, and Disclaimer & Disclosure');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // Link email/password to the already signed-in phone-auth user
      const emailCredential = EmailAuthProvider.credential(formData.email, formData.password);
      const userCredential = await linkWithCredential(auth.currentUser, emailCredential);

      // Update user profile with display name
      await updateProfile(userCredential.user, {
        displayName: `${formData.firstName} ${formData.lastName}`,
        phoneNumber: `+91${formData.phone}`
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: `+91${formData.phone}`,
        emailVerified: false,
        profileSetupComplete: true,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        isActive: true,
        role: 'user'
      });

      // Send welcome email
     // Send welcome email
try {
  console.log('Attempting to send welcome email to:', formData.email);
  await sendWelcomeEmail({
    to: formData.email,
    name: `${formData.firstName} ${formData.lastName}`
  });
  console.log('Welcome email sent successfully to:', formData.email);
} catch (emailError) {
  console.error('Error sending welcome email:', emailError);
  // Silently continue even if email fails
}
      // Sign out the user after account creation
      await auth.signOut();
      setIsAccountCreated(true);
      
    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage = 'An error occurred during signup. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please use a different email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Please choose a stronger password.';
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkExistingUser = async (email, phone) => {
    try {
      const response = await fetch('https://asia-south1-aerobic-acronym-466116-e1.cloudfunctions.net/checkUserExists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, phone }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to check user existence');
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking user existence:', error);
      throw new Error('Error checking if user already exists: ' + error.message);
    }
  };

  const handlePersonalDetailsSubmit = async (e) => {
    e.preventDefault();
    setError({ message: '', isError: true });
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.firstName.trim()) {
        throw new Error('Please enter your first name');
      }
      if (!formData.lastName.trim()) {
        throw new Error('Please enter your last name');
      }
      if (!formData.email.trim()) {
        throw new Error('Please enter your email');
      }
      if (!formData.phone.trim()) {
        throw new Error('Please enter your phone number');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate phone number (minimum 10 digits, only numbers)
      const phoneRegex = /^\d{10,15}$/;
      const rawNumber = formData.phone.replace(/\D/g, '');
      if (!phoneRegex.test(rawNumber)) {
        throw new Error('Please enter a valid phone number (10 digits)');
      }

      const phoneNumber = `+91${rawNumber}`;

      // Check if email or phone already exists
      const { emailExists, phoneExists } = await checkExistingUser(formData.email, phoneNumber);
      
      if (emailExists && phoneExists) {
        throw new Error('Email and phone number are already registered');
      } else if (emailExists) {
        throw new Error('This email is already registered');
      } else if (phoneExists) {
        throw new Error('This phone number is already registered');
      }

      setOtpAutoSentOnce(false);
      setOtpResentOnce(false);
      setOtpSent(false);
      setOtp('');
      setVerificationId('');
      
      // If no duplicates, proceed to OTP verification
      setCurrentStep(2);
      
    } catch (error) {
      console.error('Error during signup validation:', error);
      setError({ 
        message: error.message, 
        isError: true 
      });
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <ScrollAnimation animation="from-bottom" delay={0.2}>
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-2xl">
            <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Create Account</h1>
            
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex justify-between items-center">
                <div className={`flex-1 text-center ${currentStep >= 1 ? 'text-teal-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center border-2 ${currentStep >= 1 ? 'border-teal-600 bg-teal-600 text-white' : 'border-gray-300'}`}>
                    1
                  </div>
                  <span className="text-sm mt-1">Personal Details</span>
                </div>
                <div className={`flex-1 text-center ${currentStep >= 2 ? 'text-teal-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center border-2 ${currentStep >= 2 ? 'border-teal-600 bg-teal-600 text-white' : 'border-gray-300'}`}>
                    2
                  </div>
                  <span className="text-sm mt-1">Phone Verification</span>
                </div>
                <div className={`flex-1 text-center ${currentStep >= 3 ? 'text-teal-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center border-2 ${currentStep >= 3 ? 'border-teal-600 bg-teal-600 text-white' : 'border-gray-300'}`}>
                    3
                  </div>
                  <span className="text-sm mt-1">Create Password</span>
                </div>
              </div>
            </div>

            {/* Step 1: Personal Details */}
            {currentStep === 1 && (
              <form onSubmit={handlePersonalDetailsSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200"
                    id="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200"
                    id="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200"
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="phone">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">+91</span>
                    </div>
                    <input
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200"
                      id="phone"
                      type="tel"
                      placeholder="1234567890"
                      value={formData.phone}
                      onChange={(e) => {
                        // Allow only numbers
                        const numericValue = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, phone: numericValue });
                      }}
                      pattern="[0-9]{10}"
                      title="Please enter a valid 10-digit phone number"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200"
                >
                  Continue to Phone Verification
                </button>
              </form>
            )}

            {/* Step 2: Phone Verification */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="otp">
                    Enter Verification Code
                  </label>
                  <div className="flex gap-4">
                    <input
                      className={`flex-1 px-4 py-3 rounded-lg border ${!otpSent ? 'bg-gray-100' : 'bg-white'} border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200`}
                      id="otp"
                      type="text"
                      placeholder={"Enter 6-digit code" }
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Allow only digits and limit to 6 characters
                        if (/^\d{0,6}$/.test(val)) {
                          setOtp(val);
                        }
                      }}
                      disabled={!otpSent}
                      required
                    />
                  </div>
                </div>

                {/* Resend OTP Button */}
                {otpAutoSentOnce && (
                    <button
                      onClick={handleResendOTP}
                      disabled={resendTimer > 0 || loading || otpResentOnce}
                      className={`w-full py-3 rounded-lg transition-colors duration-200 ${
                        resendTimer > 0 || loading || otpResentOnce
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {resendTimer > 0
                        ? `Resend OTP (${resendTimer}s)`
                        : loading
                          ? 'Resending...'
                          : otpResentOnce
                            ? 'OTP Resent'
                            : 'Resend OTP'
                      }
                    </button>
                  )}

                <button
                  onClick={handleVerifyOTP}
                  disabled={!otpSent || loading || !otp}
                  className={`w-full py-3 rounded-lg transition-colors duration-200 ${
                    !otpSent || loading || !otp
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            )}

            {/* Step 3: Password Creation */}
            {currentStep === 3 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
                    Create Password
                  </label>
                  <div className="relative">
                    <input
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200"
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        // Add password strength calculation here if needed
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200"
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={formData.acceptedTerms}
                      onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                      className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="terms" className="font-medium text-gray-700">
                      I accept the{' '}
                      <Link 
                      to="/terms" 
                      className="text-teal-600 hover:text-blue-500 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        sessionStorage.setItem('formData', JSON.stringify(formData));
                        sessionStorage.setItem('currentStep', currentStep);
                      }}
                    >
                      Terms & Conditions
                    </Link>
                    {', '}
                    <Link 
                      to="/privacy-policy" 
                      className="text-teal-600 hover:text-blue-500 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        sessionStorage.setItem('formData', JSON.stringify(formData));
                        sessionStorage.setItem('currentStep', currentStep);
                      }}
                    >
                      Privacy Policy
                    </Link>
                    {' and '}
                    <Link 
                      to="/disclaimer" 
                      className="text-teal-600 hover:text-blue-500 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        sessionStorage.setItem('formData', JSON.stringify(formData));
                        sessionStorage.setItem('currentStep', currentStep);
                      }}
                    >
                      Disclaimer & Disclosure
                    </Link>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !formData.acceptedTerms}
                  className="w-full py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            )}

            {error.message && (
              <div className={`mt-4 p-4 rounded-lg ${error.isError ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                <p className={`${error.isError ? 'text-red-600' : 'text-green-600'} font-medium`}>
                  {error.message}
                </p>
              </div>
            )}

            {loading && (
              <div className="mt-4 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Processing...</p>
              </div>
            )}

            {showConfirmModal && (
              <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md mx-auto shadow-lg">
                  <h2 className="text-xl font-bold mb-4">Confirm Navigation</h2>
                  <p className="mb-6">
                    Password creation is required to complete account setup. Leaving now will delete your account.
                    Do you want to leave?
                  </p>
                  <div className="flex justify-end gap-4">
                    <button
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                      onClick={cancelNavigation}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      onClick={confirmNavigation}
                    >
                      Yes, Leave
                    </button>
                  </div>
                </div>
              </div>
            )}


          </div>
        </ScrollAnimation>
      </div>
      <div id="recaptcha-wrapper">
        <div id="recaptcha-container" />
      </div>
    </div>
  );
};

export default SignUp;