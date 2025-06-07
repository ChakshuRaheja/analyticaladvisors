import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const KYCVerification = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    panNumber: ''
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
      errors.panNumber = 'Invalid PAN number format';
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
      // Send KYC data to backend for Digio verification
      const response = await fetch('http://localhost:3001/api/kyc/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.uid,
          ...formData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'KYC verification failed');
      }

      // Update user's KYC status in Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        kycStatus: 'verified',
        kycData: {
          ...formData,
          verifiedAt: new Date().toISOString()
        }
      });

      setKycStatus('verified');
      setSuccess(true);
    } catch (error) {
      console.error('KYC verification error:', error);
      setError(error.message || 'Failed to verify KYC details');
    } finally {
      setLoading(false);
    }
  };

  if (kycStatus === 'verified') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">KYC Verification</h2>
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-700">Your KYC verification is complete and verified.</p>
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
            />
            {formErrors.panNumber && (
              <p className="mt-1 text-sm text-red-600">{formErrors.panNumber}</p>
            )}
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Verifying...' : 'Submit KYC Details'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default KYCVerification; 