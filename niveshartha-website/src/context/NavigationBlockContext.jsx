import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';  // Adjust the path

const NavigationBlockContext = createContext();

export const NavigationBlockProvider = ({ children }) => {
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [nextPath, setNextPath] = useState(null);
  const [isBlocking, setIsBlocking] = useState(false);

  const handleInterceptNavigation = (path) => {
    if (isBlocking) {
      setShowConfirmModal(true);
      setNextPath(path);
    } else {
      navigate(path);
    }
  };

  const confirmNavigation = async () => {
    try {
      if (auth.currentUser) {
        await auth.currentUser.delete();
      }
      setShowConfirmModal(false);
      navigate(nextPath);
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const cancelNavigation = () => {
    setShowConfirmModal(false);
    setNextPath(null);
  };

  return (
    <NavigationBlockContext.Provider value={{
      handleInterceptNavigation,
      showConfirmModal,
      confirmNavigation,
      cancelNavigation,
      setIsBlocking,
    }}>
      {children}
    </NavigationBlockContext.Provider>
  );
};

export const useNavigationBlock = () => useContext(NavigationBlockContext);
