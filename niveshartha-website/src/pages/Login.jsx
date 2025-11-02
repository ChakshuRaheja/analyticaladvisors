import { useState, useEffect } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Link, useNavigate, useLocation, useNavigationType  } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import ScrollAnimation from '../components/ScrollAnimation';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  const claimFreeTrialPhone = location.state || {};
 
  useEffect(() => {
    if (auth.currentUser){
      navigate('/');
    }
  })

  useEffect(() => {
    const hasRefreshedLogin = sessionStorage.getItem('hasRefreshedLogin');
    const timeout = setTimeout(() => {
      console.log('hasRefreshedLogin')
      if (hasRefreshedLogin == 'false'){
        console.log('setting hasRefreshedLogin')
        sessionStorage.setItem('hasRefreshedLogin', 'true');
        console.log('reloading')
        window.location.reload();
        console.log('reload done')
      }
      
    }, 1000); // delay slightly to avoid React rendering issues

    return () => clearTimeout(timeout); // clean up
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      sessionStorage.removeItem('hasRefreshedLogin');
      if(Object.keys(claimFreeTrialPhone).length > 0){
        navigate('/subscription');
      }
      else{
        navigate('/');
      }
    } catch (error) {
      setError('Invalid login credentials');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white mt-12 py-20">
      <div className="container mx-auto mt-20 px-4">
        <ScrollAnimation animation="from-bottom" delay={0.2}>
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-xl">
            <h1 className="text-3xl font-bold text-center mb-6">Login</h1>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r shadow-md transform transition-all duration-300 ease-in-out hover:scale-[1.02]">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-gray-700 text-sm font-bold" htmlFor="password">
                    Password
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-teal-600 hover:text-teal-800 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10"
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  className={`w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </div>
            </form>
              
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account? <Link to="/signup" className="text-teal-600 font-semibold hover:underline hover:text-teal-700">Sign Up</Link>
              </p>
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </div>
  );
};

export default Login; 