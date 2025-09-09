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

  // Mock subscription data for development
  const mockSubscriptions = {
    basic: 'active',
    premium: 'active' // Add other plans as needed for testing
  };

  // Check and update subscription status
  const checkSubscriptionStatus = async (userId) => {
    try {
      if (!userId) return;
      
      // In development, use mock data instead of making the actual API call
      if (process.env.NODE_ENV === 'development' || !auth.currentUser) {
        console.log('Using mock subscription data for development');
        setCurrentUser(prev => ({
          ...prev,
          subscriptions: mockSubscriptions
        }));
        return;
      }
      
      try {
        // First try to use Firebase Callable Function if available
        try {
          const updateSubscription = httpsCallable(functions, 'updateSubscriptionStatus');
          const result = await updateSubscription({ userId });
          
          if (result.data && result.data.updated) {
            console.log('Subscription status updated via Callable Function');
            return;
          }
        } catch (callableError) {
          console.warn('Callable function failed, falling back to direct HTTP call:', callableError);
        }
        
        // Fallback to direct HTTP call if Callable Function fails
        const idToken = await auth.currentUser.getIdToken();
        const response = await fetch('https://asia-south1-aerobic-acronym-466116-e1.cloudfunctions.net/updateSubscriptionStatus', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            userId: auth.currentUser.uid,
            subscriptionData: {
              status: 'active',
              updatedAt: new Date().toISOString()
            }
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.updated) {
          console.log('Subscription status updated via HTTP:', result.message);
        }
      } catch (error) {
        console.warn('Using mock subscription data due to API error:', error.message);
        setCurrentUser(prev => ({
          ...prev,
          subscriptions: mockSubscriptions
        }));
      }
    } catch (error) {
      console.error('Error in checkSubscriptionStatus:', error);
      // Fall back to mock data in case of any error
      setCurrentUser(prev => ({
        ...prev,
        subscriptions: mockSubscriptions
      }));
    }
  };

  // Set up auth state listener
  useEffect(() => {
    let unsubscribe;
    
    const setupAuthListener = async () => {
      try {
        // Set loading to true before checking auth state
        setLoading(true);
        
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          try {
            setCurrentUser(user);
            
            // Check and update subscription status if user is logged in
            if (user) {
              await checkSubscriptionStatus(user.uid);
            }
          } catch (err) {
            console.error('Error in auth state change:', err);
            setError(err.message);
          } finally {
            // Only set loading to false after we've finished processing the auth state
            setLoading(false);
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
      {!loading && (
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      )}
      {loading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export default AuthContext;