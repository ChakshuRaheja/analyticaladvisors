import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Portfolio from './pages/Portfolio';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ProfilePage from './pages/ProfilePage';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import Analysis from './pages/Analysis';
import Settings from './pages/Settings';
import PortfolioReview from './pages/PortfolioReview';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import Subscription from './pages/Subscription';
import NotFound from './pages/NotFound';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Disclaimer from './pages/Disclaimer';
import InvestorCharter from './pages/InvestorCharter';
import InvestorGrievance from './pages/InvestorGrievance';
import ScrollToTop from './components/ScrollToTop';
// import Dashboard from './pages/Dashboard';
import ApiTest from './components/ApiTest';
import TestPage from './pages/TestPage';
import KycCallback from './pages/KycCallback';
import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import StockRecommendations from './components/StockRecommendations';
import OptionTradingForBeginners from './pages/OptionTradingForBeginners';
import {NavigationBlockProvider} from './context/NavigationBlockContext';

// Component to conditionally render the footer based on the current route
const ConditionalFooter = () => {
  const location = useLocation();
  const noFooterPaths = ['/settings', '/analysis', '/dashboard'];
  const showFooter = !noFooterPaths.some(path => location.pathname.startsWith(path));
  
  return showFooter ? <Footer /> : null;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <NavigationBlockProvider>

          <div className="flex flex-col min-h-screen">
            <Navbar />
            <ScrollToTop />
            <ToastContainer 
              position="top-center"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/faq" element={<Home faqOnly={true} />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/:serviceId" element={<ServiceDetail />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                <Route path="/portfolio-review" element={<PortfolioReview />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
                <Route path="/terms" element={<TermsAndConditions />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/disclaimer" element={<Disclaimer />} />
                <Route path="/investor-charter" element={<InvestorCharter />} />
                <Route path="/investor-grievance" element={<InvestorGrievance />} />
                <Route path="/analysis" element={<PrivateRoute><Analysis /></PrivateRoute>} />
                {/* <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} /> */}
                <Route path="/api-test" element={<ApiTest />} />
                <Route path="/test-complaints" element={<TestPage />} />
                <Route path="/kyc/callback" element={<KycCallback />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/stock-recommendations" element={<PrivateRoute><StockRecommendations /></PrivateRoute>} />
                <Route path="/blog/:id" element={<BlogDetailPage />} />
                <Route path="/option-trading-for-beginners" element={<OptionTradingForBeginners />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <ConditionalFooter />
          </div>
        </NavigationBlockProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
