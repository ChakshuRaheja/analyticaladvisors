import { useState, useEffect, useRef } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

// Navbar links configuration
const navLinks = [
  { text: 'Home', path: '/' },
  { text: 'About Us', path: '/about' },
  { text: 'Services', path: '/services' },
  { text: 'Analysis', path: '/analysis' },
  { text: 'Contact', path: '/contact' },
];

// Hide navbar on scroll down, show on scroll up
function HideOnScroll({ children }) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

// NavLink component with animations
const NavLink = ({ path, text, isActive, isMobile, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <RouterLink
        to={path}
        onClick={onClick}
        className={`
          block py-2 px-4
          ${isMobile 
            ? 'text-white ' 
            : isActive 
              ? 'text-white font-bold' 
              : 'text-gray-300 hover:text-white'
          }
          relative font-medium transition-all duration-300 rounded-md
          ${isActive ? 'after:content-[""] after:absolute after:bottom-0 after:left-1/2 after:w-10 after:h-0.5 after:bg-white after:transform after:-translate-x-1/2' : ''}
          hover:after:content-[""] hover:after:absolute hover:after:bottom-0 hover:after:left-1/2 hover:after:w-5 hover:after:h-0.5 hover:after:bg-white hover:after:transform hover:after:-translate-x-1/2 hover:after:transition-all hover:after:duration-300
        `}
      >
        {text}
      </RouterLink>
    </motion.div>
  );
};

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [error, setError] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = async () => {
    setError("");
    try {
      await logout();
      navigate("/");
    } catch (error) {
      setError("Failed to log out");
      console.error(error);
    }
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };

  return (
    <HideOnScroll>
      <nav className={`
        fixed w-full z-50 transition-all duration-300
        ${scrolled || location.pathname !== '/' 
          ? 'bg-black shadow-sm' 
          : 'bg-black'
        }
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <RouterLink
              to="/"
              className="text-xl font-bold uppercase tracking-wider text-white hover:text-gray-200 transition-colors duration-300"
            >
               Analytical Advisors
            </RouterLink>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.text}
                  path={link.path}
                  text={link.text}
                  isActive={location.pathname === link.path}
                  isMobile={false}
                />
              ))}
              
              {currentUser ? (
                <div className="relative" ref={profileMenuRef}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleProfileMenu}
                    className="flex items-center space-x-2 text-white hover:text-gray-200 focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-black">
                      {currentUser.displayName 
                        ? currentUser.displayName.charAt(0).toUpperCase() 
                        : currentUser.email.charAt(0).toUpperCase()}
                    </div>
                    <span>{currentUser.displayName || currentUser.email.split('@')[0]}</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.button>
                  
                  {/* Profile Menu Dropdown */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-xl z-50">
                      <RouterLink 
                        to="/control-panel" 
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        Control Panel
                      </RouterLink>
                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={() => {
                          handleLogout();
                          setProfileMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RouterLink
                    to="/login"
                    className="text-black bg-white hover:bg-gray-200 px-6 py-2 rounded-md transition-colors duration-300"
                  >
                    Login / Sign Up
                  </RouterLink>
                </motion.div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={handleDrawerToggle}
                className="p-2 rounded-md transition-colors duration-300 text-white hover:bg-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="white" color='white'>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <motion.div
          initial={false}
          animate={{ x: drawerOpen ? 0 : '100%' }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed inset-y-0 right-0 w-64 bg-black shadow-xl md:hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <RouterLink
              to="/"
              onClick={handleDrawerToggle}
              className="text-xl font-bold text-white hover:text-gray-200 transition-colors duration-300"
            >
              Analytical Advisors
            </RouterLink>
            <button
              onClick={handleDrawerToggle}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.text}
                path={link.path}
                text={link.text}
                isActive={location.pathname === link.path}
                isMobile={true}
                onClick={handleDrawerToggle}
              />
            ))}
            
            {currentUser ? (
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2 text-white p-2">
                  <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-black">
                    {currentUser.displayName 
                      ? currentUser.displayName.charAt(0).toUpperCase() 
                      : currentUser.email.charAt(0).toUpperCase()}
                  </div>
                  <span>{currentUser.displayName || currentUser.email.split('@')[0]}</span>
                </div>
                
                <RouterLink
                  to="/control-panel"
                  onClick={handleDrawerToggle}
                  className="block w-full text-white hover:bg-gray-700 py-2 px-4 rounded-md"
                >
                  Control Panel
                </RouterLink>
                
                <button
                  onClick={() => {
                    handleLogout();
                    handleDrawerToggle();
                  }}
                  className="w-full text-white bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded-md"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="mt-4">
                <RouterLink
                  to="/login"
                  onClick={handleDrawerToggle}
                  className="block w-full text-center text-black bg-white hover:bg-gray-200 py-2 rounded-md"
                >
                  Login / Sign Up
                </RouterLink>
              </div>
            )}
          </div>
        </motion.div>
      </nav>
    </HideOnScroll>
  );
}

export default Navbar;