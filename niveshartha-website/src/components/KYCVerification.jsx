import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';

const KYCVerification = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    panNumber: '',
    panImage: null,
    panImagePreview: null
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchKYCStatus = async () => {
      if (!currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setKycStatus(data.kycStatus || 'pending');
          if (data.kycData) {
            setFormData({
              fullName: data.kycData.fullName || '',
              dateOfBirth: data.kycData.dateOfBirth || '',
              panNumber: data.kycData.panNumber || ''
            });
          }
        }
      } catch (error) {
        console.error('Error fetching KYC status:', error);
        setError('Failed to fetch KYC status');
      }
    };

    fetchKYCStatus();
  }, [currentUser]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, JPG)');
      return;
    }
    
    // Increase file size limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        panImage: file,
        panImagePreview: reader.result
      }));
      setError(''); // Clear any previous errors
    };
    reader.onerror = () => {
      setError('Failed to read the image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    }
    if (!formData.panNumber.trim()) {
      errors.panNumber = 'PAN number is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
      errors.panNumber = 'Invalid PAN number format (e.g., ABCDE1234F)';
    }
    if (!formData.panImage) {
      errors.panImage = 'PAN card image is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      console.log('Current User UID:', currentUser?.uid);
      console.log('Is user authenticated?', currentUser !== null);
      
      // Create storage reference
      const fileName = `pan_${Date.now()}`;
      const filePath = `kyc/${currentUser.uid}/${fileName}`;
      console.log('Uploading file to path:', filePath);
      
      const storageRef = ref(storage, filePath);
      console.log('Storage reference created');
      
      // Upload the file
      console.log('Starting file upload...');
      await uploadBytes(storageRef, formData.panImage);
      console.log('File upload completed');
      
      // Get download URL
      console.log('Getting download URL...');
      const panImageUrl = await getDownloadURL(storageRef);
      console.log('Download URL retrieved:', panImageUrl);

      // Update user's KYC status in Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        kycStatus: 'pending_approval',
        kycData: {
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth,
          panNumber: formData.panNumber,
          panImageUrl: panImageUrl,
          submittedAt: serverTimestamp()
        },
        kycLastUpdated: serverTimestamp()
      });

      setKycStatus('pending_approval');
      setSuccess(true);
      setFormData(prev => ({
        ...prev,
        panImage: null,
        panImagePreview: null
      }));
    } catch (error) {
      console.error('KYC verification error:', error);
      console.error('Error code:', error.code);
      console.error('Error details:', error.details);
      
      let errorMessage = 'Failed to verify KYC details';
      
      // Provide more specific error messages based on the error code
      if (error.code === 'storage/unauthorized') {
        errorMessage = 'You do not have permission to upload files. Please make sure you are logged in and try again.';
      } else if (error.code === 'storage/retry-limit-exceeded') {
        errorMessage = 'The operation took too long. Please check your internet connection and try again.';
      } else if (error.code) {
        errorMessage = `Error (${error.code}): ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (kycStatus === 'verified' || kycStatus === 'pending_approval') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">KYC Verification</h2>
        <div className={`${kycStatus === 'verified' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'} border rounded-md p-4`}>
          {kycStatus === 'verified' ? (
            <p className="text-green-700">Your KYC verification is complete and verified.</p>
          ) : (
            <div>
              <p className="text-blue-700">Your KYC documents have been submitted successfully and are pending approval.</p>
              <p className="text-sm text-blue-600 mt-2">You will receive access to the platform once your documents are verified by our team.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">KYC Verification</h2>
      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-700">KYC verification successful! Your account is now fully verified.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name (as per PAN card)</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${formErrors.fullName ? 'border-red-500' : ''}`}
            />
            {formErrors.fullName && (
              <p className="mt-1 text-sm text-red-600">{formErrors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${formErrors.dateOfBirth ? 'border-red-500' : ''}`}
            />
            {formErrors.dateOfBirth && (
              <p className="mt-1 text-sm text-red-600">{formErrors.dateOfBirth}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">PAN Number</label>
            <input
              type="text"
              value={formData.panNumber}
              onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${formErrors.panNumber ? 'border-red-500' : ''}`}
              placeholder="ABCDE1234F"
              maxLength="10"
            />
            {formErrors.panNumber && (
              <p className="mt-1 text-sm text-red-600">{formErrors.panNumber}</p>
            )}
          </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Upload PAN Card (Front Side)</label>
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="w-full sm:w-auto">
                <div className="cursor-pointer w-full px-4 py-2 bg-teal-50 text-teal-700 rounded-md hover:bg-teal-100 text-center text-sm font-semibold">
                  Take Photo
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </label>
              <span className="self-center text-gray-500 text-sm hidden sm:inline">or</span>
              <label className="w-full sm:w-auto">
                <div className="cursor-pointer w-full px-4 py-2 bg-white border border-teal-200 text-teal-700 rounded-md hover:bg-teal-50 text-center text-sm font-semibold">
                  Choose from Gallery
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </label>
            </div>
            <p className="text-xs text-gray-500">Upload a clear image of your PAN card (max 5MB, JPG, PNG)</p>
            {formErrors.panImage && (
              <p className="mt-1 text-sm text-red-600">{formErrors.panImage}</p>
            )}
            {formData.panImagePreview && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Preview:</p>
                <img
                  src={formData.panImagePreview}
                  alt="PAN Card Preview"
                  className="h-32 w-auto border rounded"
                />
              </div>
            )}
          </div>
        </div>

          <div className="mt-6">
            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Submitting...' : 'Submit KYC Documents'}
              </button>
              <p className="text-xs text-gray-500">
                By submitting, you agree to our terms and conditions. Your documents will be reviewed manually by our team.
                You will receive access to the platform once your KYC is approved.
              </p>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default KYCVerification; 