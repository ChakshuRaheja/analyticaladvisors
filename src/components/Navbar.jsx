import { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

// Navbar links configuration
const navLinks = [
  { text: 'Home', path: '/' },
  { text: 'About Us', path: '/about' },
  { text: 'Services', path: '/services' },
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
            ? 'text-white hover:bg-gray-700' 
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  return (
    <HideOnScroll>
      <nav className={`
        fixed w-full z-50 transition-all duration-300
        ${scrolled || location.pathname !== '/' 
          ? 'bg-black/95 backdrop-blur-md shadow-sm' 
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
                <div className="flex items-center space-x-4">
                  <span className="text-gray-300">
                    {currentUser.displayName || currentUser.email}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="text-black bg-white hover:bg-gray-200 px-4 py-2 rounded-md transition-colors duration-300"
                  >
                    Logout
                  </motion.button>
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
              <div className="mt-4">
                <div className="text-gray-300 mb-2">
                  {currentUser.displayName || currentUser.email}
                </div>
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