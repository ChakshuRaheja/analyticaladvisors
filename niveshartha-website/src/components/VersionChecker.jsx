import { useEffect, useRef } from 'react';

const VERSION = '1.0.1'; // Update this with each deployment

const VersionChecker = () => {
  const hasChecked = useRef(false);

  useEffect(() => {
    // Prevent multiple checks in development with React.StrictMode
    if (hasChecked.current) return;
    
    const savedVersion = localStorage.getItem('appVersion');
    
    if (savedVersion !== VERSION) {
      console.log(`New version detected. Updating from ${savedVersion || 'no version'} to ${VERSION}`);
      // Update the stored version
      localStorage.setItem('appVersion', VERSION);
      
      // Clear any cached data if needed
      // caches.keys().then(names => {
      //   return Promise.all(names.map(name => caches.delete(name)));
      // });
    } else {
      console.log('Running latest version:', VERSION);
    }
    
    hasChecked.current = true;
    
  }, []);

  return null;
};

export default VersionChecker;
