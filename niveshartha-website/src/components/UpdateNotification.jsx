import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const UpdateNotification = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const hasInitialized = useRef(false);
  const currentVersion = '1.0.1'; // Should match the version in VersionChecker.jsx

  useEffect(() => {
    // Prevent multiple initializations in development with React.StrictMode
    if (hasInitialized.current) return;
    
    const lastNotifiedVersion = localStorage.getItem('lastNotifiedVersion');
    const lastDismissed = localStorage.getItem('updateDismissed');
    
    // Only show notification if:
    // 1. User hasn't been notified about this version AND
    // 2. User hasn't already dismissed the notification for this version
    if (lastNotifiedVersion !== currentVersion && lastDismissed !== currentVersion) {
      setShowUpdate(true);
      localStorage.setItem('lastNotifiedVersion', currentVersion);
    }
    
    hasInitialized.current = true;
  }, [currentVersion]);

  const handleUpdate = () => {
    // Clear the dismiss flag so notification shows again if they don't refresh
    localStorage.removeItem('updateDismissed');
    // Force reload to get the latest version
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowUpdate(false);
    setIsDismissed(true);
    // Store that user dismissed for this version
    localStorage.setItem('updateDismissed', currentVersion);
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {showUpdate && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-xl border-l-4 border-blue-500 z-50 max-w-md"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">New Update Available!</h3>
              <p className="mt-1 text-sm text-gray-500">A new version of the application is available. Update now for the best experience.</p>
              <div className="mt-4 flex">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={handleUpdate}
                >
                  Update Now
                </button>
                <button
                  type="button"
                  className="ml-2 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={handleDismiss}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdateNotification;
