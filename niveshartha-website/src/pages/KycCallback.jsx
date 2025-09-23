import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { verifyKYCStatus } from '../services/kyc.service';
import { auth } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const KycCallback = () => {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing KYC verification...');
  const [details, setDetails] = useState('Please wait while we verify your details.');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Update user's KYC status in Firestore
  const updateUserKYCStatus = async (status, kycData = {}) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        kycStatus: status,
        kycVerified: status === 'verified',
        kycData: {
          ...kycData,
          updatedAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      });
      
      console.log(`User KYC status updated to: ${status}`);
    } catch (error) {
      console.error('Error updating KYC status in Firestore:', error);
      // Don't fail the whole flow if Firestore update fails
    }
  };

  useEffect(() => {
    const verifyKYC = async () => {
      try {
        setStatus('processing');
        setMessage('Verifying your KYC details...');
        setDetails('This may take a moment.');

        // Extract parameters from URL
        const docId = searchParams.get('digio_doc_id') || searchParams.get('document_id');
        const referenceId = searchParams.get('reference_id');
        const status = searchParams.get('status');
        
        console.log('KYC Callback Params:', { docId, referenceId, status });

        // Basic validation
        if (!docId) {
          throw new Error('Missing KYC document ID in callback URL');
        }

        // If status is explicitly failed in URL
        if (status === 'failed') {
          throw new Error('KYC verification was marked as failed by the provider');
        }

        // Verify KYC status with our backend
        setMessage('Validating your information...');
        const result = await verifyKYCStatus({ docId, referenceId });
        
        if (result.success) {
          // Update Firestore with KYC status
          await updateUserKYCStatus('verified', {
            docId,
            referenceId,
            verifiedAt: new Date().toISOString(),
            ...result.data
          });

          setStatus('success');
          setMessage('KYC Verification Successful!');
          setDetails('Your identity has been successfully verified.');
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate('/settings?kyc=success', { replace: true });
          }, 3000);
        } else {
          // If verification failed but we got a response
          await updateUserKYCStatus('failed', { error: result.message });
          throw new Error(result.message || 'KYC verification failed');
        }
      } catch (error) {
        console.error('KYC verification error:', error);
        setStatus('error');
        setMessage('KYC Verification Failed');
        setDetails(error.message || 'An unexpected error occurred. Please try again.');
        
        // Update Firestore with failed status
        await updateUserKYCStatus('failed', { 
          error: error.message,
          lastAttempt: new Date().toISOString()
        });
        
        // Don't auto-navigate on error, let user see the message and click to retry
      }
    };

    verifyKYC();
    
    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
  }, [navigate, searchParams, location]);

  // Status colors and icons mapping
  const statusConfig = {
    processing: {
      icon: (
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      ),
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      button: null
    },
    success: {
      icon: (
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
          <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ),
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      button: null
    },
    error: {
      icon: (
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
          <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      ),
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      button: (
        <div className="mt-6 space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/subscription')}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Back to Subscription
          </button>
        </div>
      )
    }
  };

  const currentStatus = statusConfig[status] || statusConfig.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className={`max-w-md w-full space-y-6 ${currentStatus.bgColor} p-8 rounded-lg shadow-md transition-all duration-300`}>
        <div className="text-center">
          <h2 className={`text-3xl font-extrabold ${currentStatus.textColor} mb-2`}>
            {message}
          </h2>
          <p className="text-gray-600 mt-2">{details}</p>
        </div>
        
        <div className="py-4">
          {currentStatus.icon}
        </div>
        
        {status === 'processing' && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
        )}
        
        {status === 'error' && (
          <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p className="text-sm">
              If the problem persists, please contact our support team at{' '}
              <a href="mailto:support@analyticaladvisors.in" className="font-medium underline">
                support@analyticaladvisors.in
              </a>
            </p>
          </div>
        )}
        
        {currentStatus.button}
        
        {status === 'success' && (
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Redirecting you to your dashboard...</p>
            <div className="mt-2 text-xs text-gray-400">
              If you are not redirected,{' '}
              <button 
                onClick={() => navigate('/settings')}
                className="text-blue-600 hover:underline focus:outline-none"
              >
                click here
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KycCallback;
