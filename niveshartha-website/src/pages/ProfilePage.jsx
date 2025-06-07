import React from 'react';
import RiskProfiling from '../components/RiskProfiling';
import KYCVerification from '../components/KYCVerification';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to view your profile.</p>
          {/* Optionally, add a login button/link here */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Your Profile</h1>
        
        <div className="space-y-8">
          <section id="risk-profiling">
            <RiskProfiling />
          </section>
          
          <section id="kyc-verification">
            <KYCVerification />
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
