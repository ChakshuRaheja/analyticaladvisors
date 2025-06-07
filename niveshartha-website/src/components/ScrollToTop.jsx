import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that scrolls the window to the top
 * when navigating between routes
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top of the page with smooth behavior
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto' // Use 'auto' instead of 'smooth' for instant scrolling
    });
  }, [pathname]); // This effect runs when the pathname changes

  return null; // This component doesn't render anything
}

export default ScrollToTop; 