import { useState } from 'react';
import AuthModal from './AuthModal';
import SignupModal from './SignupModal';

const AuthManager = ({ isOpen, onClose }) => {
  const [showSignup, setShowSignup] = useState(false);

  if (!isOpen) return null;

  return showSignup ? (
    <SignupModal
      onClose={onClose}
      onSwitchToLogin={() => setShowSignup(false)}
    />
  ) : (
    <AuthModal
      onClose={onClose}
      onSwitchToSignup={() => setShowSignup(true)}
    />
  );
};

export default AuthManager;
