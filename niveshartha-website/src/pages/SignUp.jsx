import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, RecaptchaVerifier, signInWithPhoneNumber, signInWithCredential, PhoneAuthProvider } from 'firebase/auth';
import { auth } from '../firebase/config';
import ScrollAnimation from '../components/ScrollAnimation';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

const SignUp = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false
  });
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
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPasswordCreated, setIsPasswordCreated] = useState(false);
  const [isAccountCreated, setIsAccountCreated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any existing reCAPTCHA verifier
    window.recaptchaVerifier = null;
  }, []);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError({ message: '', isError: true });
    setLoading(true);

    try {
      // Format phone number
      const formattedPhoneNumber = formData.phone.startsWith('+') ? formData.phone : `+91${formData.phone}`;
      
      // Clear any existing reCAPTCHA verifier
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
      
      // Setup new reCAPTCHA verifier
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved, will be called when the reCAPTCHA is verified
        },
        'expired-callback': () => {
          // Reset reCAPTCHA?
        }
      });

      // Get the reCAPTCHA verifier
      const appVerifier = window.recaptchaVerifier;
      
      // Send OTP
      const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
      setVerificationId(confirmation.verificationId);
      setOtpSent(true);
      setError({ message: 'OTP sent successfully!', isError: false });
    } catch (error) {
      console.error('Error sending OTP:', error);
      let errorMessage = 'Unable to send verification code.';
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Please enter a valid phone number.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      }
      
      setError(errorMessage);
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
      await auth.signOut();
      
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
      
      setError(errorMessage);
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

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Update user profile
      await updateProfile(userCredential.user, {
        displayName: `${formData.firstName} ${formData.lastName}`,
        phoneNumber: formData.phone
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        createdAt: serverTimestamp(),
        isActive: true
      });

      // Sign out the user after account creation
      await auth.signOut();
      
      // Show success message
      setError('Account created successfully! Please login to continue.');
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
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

  const handlePersonalDetailsSubmit = (e) => {
    e.preventDefault();
    setError({ message: '', isError: true });

    // Validate required fields
    if (!formData.firstName.trim()) {
      setError({ message: 'Please enter your first name', isError: true });
      return;
    }
    if (!formData.lastName.trim()) {
      setError({ message: 'Please enter your last name', isError: true });
      return;
    }
    if (!formData.email.trim()) {
      setError({ message: 'Please enter your email address', isError: true });
      return;
    }
    if (!formData.phone.trim()) {
      setError({ message: 'Please enter your phone number', isError: true });
      return;
    }

    // Move to next step
    setCurrentStep(2);
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
                <div className={`flex-1 text-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center border-2 ${currentStep >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
                    1
                  </div>
                  <span className="text-sm mt-1">Personal Details</span>
                </div>
                <div className={`flex-1 text-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center border-2 ${currentStep >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
                    2
                  </div>
                  <span className="text-sm mt-1">Phone Verification</span>
                </div>
                <div className={`flex-1 text-center ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center border-2 ${currentStep >= 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
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
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
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
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
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
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
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
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
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
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                    <button
                      id="send-otp-button"
                      onClick={handleSendOTP}
                      disabled={loading || otpSent}
                      className={`px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all duration-200 ${
                        (loading || otpSent) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {loading ? 'Sending...' : otpSent ? 'Sent' : 'Send OTP'}
                    </button>
                  </div>
                </div>

                {otpSent && (
                  <button
                    onClick={handleVerifyOTP}
                    disabled={loading || !otp}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                )}
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
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
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
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
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
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
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
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="terms" className="font-medium text-gray-700">
                      I accept the{' '}
                      <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                        Terms & Conditions
                      </Link>
                      ,{' '}
                      <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                        Privacy Policy
                      </Link>
                      , and{' '}
                      <Link to="/disclaimer" className="text-blue-600 hover:text-blue-500">
                        Disclaimer & Disclosure
                      </Link>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !formData.acceptedTerms}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        </ScrollAnimation>
      </div>

      {/* Hidden reCAPTCHA container */}
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default SignUp;