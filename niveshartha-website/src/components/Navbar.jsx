import { useState, useEffect, useRef } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

// Navbar links configuration
// Update the navLinks array to include the subscription page
const navLinks = [
  // { path: '/', text: 'Home' },
  { path: '/about', text: 'About' },
  { path: '/services', text: 'Services' }, // Reverted: Text is 'Services'
  { path: '/analysis', text: 'Analysis' },
  { path: '/subscription', text: 'Subscription' },
  { path: '/contact', text: 'Contact' },
  // 'Portfolio Review' is NOT a top-level link in this shared array
];

// Direct navigation helper function
const navigateTo = (path) => {
  // This function will be exported but individual components should
  // use navigate directly within their components
  console.log("navigateTo is deprecated, use navigate directly:", path);
};

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
const NavLink = ({ path, text, isActive, isMobile, onClick, hasDropdown, toggleDropdown, isDropdownOpen }) => {
  const handleClick = (e) => {
    if (hasDropdown) {
      e.preventDefault();
      e.stopPropagation();
      toggleDropdown();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {hasDropdown ? (
        <button
          onClick={handleClick}
          className={`
            block py-2 px-4
            ${isMobile 
              ? 'text-gray-800 font-bold' 
              : isActive 
                ? 'text-[#008080] font-extrabold' 
                : 'text-gray-700 hover:text-[#008080] font-bold'
            }
            relative transition-all duration-300 rounded-md
            ${isActive ? 'after:content-[""] after:absolute after:bottom-0 after:left-1/2 after:w-10 after:h-0.5 after:bg-[#008080] after:transform after:-translate-x-1/2' : ''}
            hover:after:content-[""] hover:after:absolute hover:after:bottom-0 hover:after:left-1/2 hover:after:w-5 hover:after:h-0.5 hover:after:bg-[#008080] hover:after:transform hover:after:-translate-x-1/2 hover:after:transition-all hover:after:duration-300
            flex items-center
          `}
        >
          {text}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 ml-1 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      ) : (
        <RouterLink
          to={path}
          onClick={onClick}
          className={`
            block py-2 px-4
            ${isMobile 
              ? 'text-gray-800 font-bold' 
              : isActive 
                ? 'text-[#008080] font-extrabold' 
                : 'text-gray-700 hover:text-[#008080] font-bold'
            }
            relative transition-all duration-300 rounded-md
            ${isActive ? 'after:content-[""] after:absolute after:bottom-0 after:left-1/2 after:w-10 after:h-0.5 after:bg-[#008080] after:transform after:-translate-x-1/2' : ''}
            hover:after:content-[""] hover:after:absolute hover:after:bottom-0 hover:after:left-1/2 hover:after:w-5 hover:after:h-0.5 hover:after:bg-[#008080] hover:after:transform hover:after:-translate-x-1/2 hover:after:transition-all hover:after:duration-300
          `}
        >
          {text}
        </RouterLink>
      )}
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
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const servicesMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (servicesMenuRef.current && !servicesMenuRef.current.contains(event.target)) {
        setServicesMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdowns when route changes
  useEffect(() => {
    setServicesMenuOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

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

  const handleServicesClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setServicesMenuOpen(!servicesMenuOpen);
  };

  const handleDropdownItemClick = (path) => {
    setServicesMenuOpen(false);
    navigate(path);
  };

  return (
    <HideOnScroll>
      <nav className={`
        fixed w-full z-50 transition-all duration-300
        ${scrolled || location.pathname !== '/' 
          ? 'bg-white shadow-md' 
          : 'bg-white'
        }
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <RouterLink
              to="/"
              className="text-2xl font-bold uppercase tracking-wider text-black hover:text-[#008080] transition-colors duration-300 flex items-center"
            >
              <span className="text-black">Analytical</span>
              <span className="ml-1 text-[#008080]">Advisors</span>
            </RouterLink>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                link.text === 'Services' ? (
                  <div key={link.path} className="relative" ref={servicesMenuRef}>
                    <button
                      onClick={handleServicesClick}
                      className={`
                        block py-2 px-4
                        ${location.pathname === '/services' || location.pathname === '/portfolio-review'
                          ? 'text-[#008080] font-extrabold'
                          : 'text-gray-700 hover:text-[#008080] font-bold'
                        }
                        relative transition-all duration-300 rounded-md
                        flex items-center
                      `}
                    >
                      Services
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-4 w-4 ml-1 transition-transform duration-200 ${servicesMenuOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Services Menu Dropdown */}
                    {servicesMenuOpen && (
                      <div className="absolute left-0 mt-2 w-64 py-2 bg-white rounded-lg shadow-xl z-50 border border-gray-100">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Our Services</h3>
                        </div>
                        
                        <div className="py-1">
                          <button 
                            onClick={() => handleDropdownItemClick('/portfolio-review')}
                            className="w-full flex items-center px-4 py-3 text-gray-700 hover:text-[#008080] hover:bg-gray-50 transition-colors duration-200"
                          >
                            <span className="mr-3 text-xl">📊</span>
                            <div>
                              <p className="font-bold">Portfolio Review</p>
                              <p className="text-sm text-gray-500">Get your portfolio analyzed by experts</p>
                            </div>
                          </button>
                          
                          <button 
                            onClick={() => handleDropdownItemClick('/services')}
                            className="w-full flex items-center px-4 py-3 text-gray-700 hover:text-[#008080] hover:bg-gray-50 transition-colors duration-200"
                          >
                            <span className="mr-3 text-xl">🔍</span>
                            <div>
                              <p className="font-bold">All Services</p>
                              <p className="text-sm text-gray-500">Explore our complete service offerings</p>
                            </div>
                          </button>
                        </div>
                        
                        <div className="px-4 py-2 border-t border-gray-100">
                          <button
                            onClick={() => handleDropdownItemClick('/contact')}
                            className="w-full text-center px-4 py-2 bg-[#008080] text-white rounded-md hover:bg-[#006666] transition-colors duration-200 font-bold"
                          >
                            Contact Us
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    key={link.path}
                    path={link.path}
                    text={link.text}
                    isActive={location.pathname === link.path}
                    isMobile={false}
                  />
                )
              ))}
              
              {currentUser ? (
                <div className="relative" ref={profileMenuRef}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-[#008080] focus:outline-none"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#008080] flex items-center justify-center text-white font-bold shadow-md">
                      {currentUser.displayName 
                        ? currentUser.displayName.charAt(0).toUpperCase() 
                        : currentUser.email 
                          ? currentUser.email.charAt(0).toUpperCase()
                          : '?'}
                    </div>
                    <span className="font-bold">
                      {currentUser.displayName 
                        ? currentUser.displayName 
                        : currentUser.email 
                          ? currentUser.email.split('@')[0]
                          : 'User'}
                    </span>
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
                    <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-xl z-50 border border-gray-100">
                      <RouterLink 
                        to="/control-panel" 
                        className="block px-4 py-2 text-gray-700 hover:text-[#008080] hover:bg-gray-50 font-bold"
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
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#008080] hover:bg-gray-50 font-bold"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RouterLink
                      to="/login"
                      className="text-gray-700 border border-gray-300 hover:text-[#008080] hover:border-[#008080] px-4 py-2 rounded-md transition-all duration-300 font-bold"
                    >
                      Login 
                    </RouterLink>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RouterLink
                      to="/signup"
                      className="text-white bg-[#008080] hover:bg-[#006666] px-4 py-2 rounded-md font-bold transition-all duration-300 shadow-md whitespace-nowrap"
                    >
                      Sign up Free
                    </RouterLink>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={handleDrawerToggle}
                className="p-2 rounded-md transition-colors duration-300 text-gray-700 hover:text-[#008080] hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          className="fixed inset-y-0 right-0 w-64 bg-white shadow-xl md:hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <RouterLink
              to="/"
              onClick={handleDrawerToggle}
              className="text-xl font-bold text-black hover:text-[#008080] transition-colors duration-300"
            >
              <span className="text-black">Analytical</span>
              <span className="ml-1 text-[#008080]">Advisors</span>
            </RouterLink>
            <button
              onClick={handleDrawerToggle}
              className="p-2 text-gray-500 hover:text-[#008080] hover:bg-gray-100 rounded-md transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.flatMap((link) => {
              if (link.path === '/services') {
                // Special handling for 'Services' link in mobile view
                return [
                  <NavLink
                    key="/services" // Path for 'All Services'
                    path="/services"
                    text="All Services" // Display text for mobile
                    isActive={location.pathname === '/services'}
                    isMobile={true}
                    onClick={() => setDrawerOpen(false)}
                  />,
                  <NavLink
                    key="/portfolio-review" // Path for 'Portfolio Review'
                    path="/portfolio-review"
                    text="Portfolio Review" // Display text for mobile
                    isActive={location.pathname === '/portfolio-review'}
                    isMobile={true}
                    onClick={() => setDrawerOpen(false)}
                  />,
                ];
              }
              // Render other links as usual
              return (
                <NavLink
                  key={link.path}
                  path={link.path}
                  text={link.text}
                  isActive={location.pathname === link.path}
                  isMobile={true}
                  onClick={() => setDrawerOpen(false)}
                />
              );
            })}
            {currentUser && (
              <NavLink
                path="/control-panel"
                text="Control Panel"
                isActive={location.pathname === '/control-panel'}
                isMobile={true}
                onClick={() => setDrawerOpen(false)}
              />
            )}
          </div>
          <div className="mt-4 px-4 space-y-2">
            {currentUser ? (
              <button
                onClick={() => {
                  handleLogout();
                  handleDrawerToggle();
                }}
                className="w-full text-white bg-[#008080] hover:bg-[#006666] py-2 px-4 rounded-md transition-colors duration-300 font-bold"
              >
                Logout
              </button>
            ) : (
              <>
                <RouterLink
                  to="/login"
                  onClick={handleDrawerToggle}
                  className="block w-full text-center text-gray-700 border border-gray-300 hover:text-[#008080] hover:border-[#008080] py-2 rounded-md transition-colors duration-300 font-bold"
                >
                  Login
                </RouterLink>
                <RouterLink
                  to="/signup"
                  onClick={handleDrawerToggle}
                  className="block w-full text-center text-white bg-[#008080] hover:bg-[#006666] py-2 rounded-md font-bold transition-colors duration-300"
                >
                  Sign up for Free
                </RouterLink>
              </>
            )}
          </div>
        </motion.div>
      </nav>
    </HideOnScroll>
  );
}

export default Navbar;