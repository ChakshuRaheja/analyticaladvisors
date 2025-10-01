import { useState, useEffect, useRef } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigationBlock } from '../context/NavigationBlockContext';


// Navbar links configuration
const navLinks = [
  // { path: '/', text: 'Home' },
  { path: '/portfolio-review', text: 'Portfolio Review' },
  { path: '/analysis', text: 'Analysis' },
  { path: '/subscription', text: 'Subscription' },
  { path: '/stock-recommendations', text: 'Recommendations' },
  { path: '/contact', text: 'Contact' },
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
  const navigate = useNavigate();
  const handleClick = (e) => {
    e.preventDefault();

    if (hasDropdown) {
      e.stopPropagation();
      toggleDropdown();
    } else if (onClick) {
      const blocked = onClick(e);
      if (!blocked) {
        navigate(path);
      
      }
    }else {
      navigate(path);
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
  const { handleInterceptNavigation } = useNavigationBlock();
  const [aboutMenuOpen, setAboutMenuOpen] = useState(false);
  const aboutMenuRef = useRef(null);

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
      if (aboutMenuRef.current && !aboutMenuRef.current.contains(event.target)) {
        setAboutMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdowns and mobile menu when route changes
  useEffect(() => {
    setServicesMenuOpen(false);
    setProfileMenuOpen(false);
    setDrawerOpen(false);
    
    // Always ensure body scrolling is enabled when route changes
    document.body.style.overflow = 'auto';
    
    // Reset scroll position when navigating
    if (window.innerWidth < 768) { // Only on mobile
      window.scrollTo(0, 0);
    }
    
    // Cleanup function to ensure body scrolling is re-enabled when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [location.pathname]);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
    // Prevent body scroll when mobile menu is open
    if (!drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };

  const handleAboutClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAboutMenuOpen(!aboutMenuOpen);
  };

  const handleAboutDropdownItemClick = (path) => {
    const blocked = handleInterceptNavigation(path);
    setAboutMenuOpen(false);
    if (!blocked) {
      navigate(path);
    }
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
    const blocked = handleInterceptNavigation(path);
    setServicesMenuOpen(false);
    if (!blocked) {
      navigate(path); 
    }
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
            {/* Logo and Brand Name */}
            <div className="flex-shrink-0">
              <RouterLink
                to="/"
                onClick={(e) => {
                  e.preventDefault();
                  const blocked = handleInterceptNavigation('/');
                  if (!blocked) {
                    navigate('/');
                  }
                }}
                className="flex items-center space-x-2"
              >
                <img 
                  src="/logo1.png" 
                  alt="Analytical Advisors Logo" 
                  className="h-12 w-auto"
                  style={{ minWidth: '48px' }}
                />
                <div className="flex flex-col">
                  <span className="text-2xl font-bold uppercase tracking-wider text-black">Analytical</span>
                  <span className="text-2xl font-bold uppercase tracking-wider text-[#008080] -mt-1">Advisors</span>
                </div>
              </RouterLink>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {/* about dropdown */}
              <div className="relative" ref={aboutMenuRef}>
                <motion.button
                  onClick={() => setAboutMenuOpen((prev) => !prev)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  // className="flex items-center space-x-2 text-gray-700 hover:text-[#008080] focus:outline-none"
                  className={`
                    relative block py-2 px-4
                    ${['/about', '/blog'].includes(location.pathname)
                      ? 'text-[#008080] font-extrabold after:opacity-100'
                      : 'text-gray-700 hover:text-[#008080] font-bold hover:after:opacity-100'
                    }
                    after:content-['']
                    after:absolute
                    after:ml-4
                    after:-bottom-1
                    after:w-[2ch]
                    after:h-[2px]
                    after:bg-[#008080]
                    after:opacity-0
                    after:transition-opacity
                    after:duration-200
                    flex items-center
                    transition-colors duration-200 rounded-md
                  `}
                  >
                    About
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 ml-1 transition-transform duration-200 ${aboutMenuOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </motion.button>
                {aboutMenuOpen && (
                  <div className="absolute left-0 mt-2 w-44 py-2 bg-white rounded-md shadow-xl z-50 border border-gray-100">
                    <button 
                      onClick={() => handleAboutDropdownItemClick('/about')}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:text-[#008080] hover:bg-gray-50 font-bold transition-colors duration-200"
                    >
                      About Us
                    </button>
                    <button 
                      onClick={() => handleAboutDropdownItemClick('/blog')}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:text-[#008080] hover:bg-gray-50 font-bold transition-colors duration-200"
                    >
                      Blog
                    </button>
                  </div>
                )}
              </div>

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
                    onClick={() => {
                      const blocked = handleInterceptNavigation(link.path);
                      return blocked;
                    }}
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
                        to="/settings" 
                        className="block px-4 py-2 text-gray-700 hover:text-[#008080] hover:bg-gray-50 font-bold"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        Settings
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
                      className="text-white bg-[#008080] hover:bg-[#006666] hover:text-white px-4 py-2 rounded-md font-bold transition-all duration-300 shadow-md whitespace-nowrap"

                    >
                      Start Free
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
          className="fixed inset-y-0 right-0 w-64 bg-white shadow-xl md:hidden z-50 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <RouterLink
              to="/"
              onClick={(e) => {
                e.preventDefault();
                const blocked = handleInterceptNavigation('/');
                handleDrawerToggle();
                if (!blocked) {
                  navigate('/');
                }
              }}
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
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3" onClick={(e) => e.stopPropagation()}>
            <NavLink
              key="/about"
              path="/about"
              text="About Us"
              isActive={location.pathname === '/about'}
              isMobile={true}
              onClick={() => {
                const blocked = handleInterceptNavigation('/about');
                setDrawerOpen(false);
                return blocked;
              }}
            />

            <NavLink
              key="/blog"
              path="/blog"
              text="Blog"
              isActive={location.pathname === '/blog'}
              isMobile={true}
              onClick={() => {
                const blocked = handleInterceptNavigation('/blog');
                setDrawerOpen(false);
                return blocked;
              }}
            />

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
                    onClick={() =>{
                      const blocked = handleInterceptNavigation('/services');
                      setDrawerOpen(false);
                      return blocked;
                    }}
                  />,
                  <NavLink
                    key="/portfolio-review" // Path for 'Portfolio Review'
                    path="/portfolio-review"
                    text="Portfolio Review" // Display text for mobile
                    isActive={location.pathname === '/portfolio-review'}
                    isMobile={true}
                    onClick={() => {
                      const blocked =handleInterceptNavigation('/portfolio-review');
                      setDrawerOpen(false);
                      return blocked;
                    }}
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
                  onClick={() => {
                      const blocked = handleInterceptNavigation(link.path);
                      setDrawerOpen(false);
                      return blocked;
                    }}
                />
              );
            })}
            {currentUser && (
              <NavLink
                path="/settings"
                text="Settings"
                isActive={location.pathname === '/settings'}
                isMobile={true}
                onClick={() => {
                      const blocked = handleInterceptNavigation('/settings');
                      setDrawerOpen(false);
                      return blocked;
                    }}
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