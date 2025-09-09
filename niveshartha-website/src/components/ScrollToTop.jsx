import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that scrolls the window to the top
 * when navigating between routes but not on hash changes
 */
function ScrollToTop() {
  const { pathname, search, key } = useLocation();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    // Only scroll to top if pathname has changed (not just hash or search params)
    if (previousPathname.current !== pathname) {
      // Scroll to top of the page
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto'
      });
      
      // Update the previous pathname
      previousPathname.current = pathname;
    }
  }, [pathname, search, key]);

  return null;
}

export default ScrollToTop;