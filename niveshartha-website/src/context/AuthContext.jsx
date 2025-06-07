import { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signOut
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';
import ErrorBoundary from '../components/ErrorBoundary';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sign out function
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (err) {
      setError(err.message);
      console.error('Logout error:', err);
    }
  };

  // Check and update subscription status
  const checkSubscriptionStatus = async (userId) => {
    try {
      if (!userId) return;
      
      const updateSubscriptionStatus = httpsCallable(functions, 'updateSubscriptionStatus');
      const result = await updateSubscriptionStatus({});
      
      if (result.data.updated) {
        console.log('Subscription status updated:', result.data.message);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  // Set up auth state listener
  useEffect(() => {
    let unsubscribe;
    
    const setupAuthListener = async () => {
      try {
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          try {
            setCurrentUser(user);
            
            // Check and update subscription status if user is logged in
            if (user) {
              await checkSubscriptionStatus(user.uid);
            }
            
            setLoading(false);
            setError(null);
          } catch (err) {
            setError('Failed to update user state');
            console.error('Auth state change error:', err);
          }
        });
      } catch (err) {
        setError('Failed to initialize auth listener');
        console.error('Auth listener error:', err);
      }
    };

    setupAuthListener();

    // Clean up the listener when component unmounts
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </AuthContext.Provider>
  );
}

export default AuthContext;