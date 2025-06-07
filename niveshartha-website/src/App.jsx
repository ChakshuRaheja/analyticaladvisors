import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import ProfilePage from './pages/ProfilePage.jsx'; // Updated to use the new combined profile page
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import Analysis from './pages/Analysis';
import ControlPanel from './pages/ControlPanel';
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
import Dashboard from './pages/Dashboard';
import ChatBot from './components/ChatBot';
import ApiTest from './components/ApiTest';
import TestPage from './pages/TestPage';
import VersionChecker from './components/VersionChecker';
import UpdateNotification from './components/UpdateNotification';

function App() {
  return (
    <AuthProvider>
      <VersionChecker />
      <UpdateNotification />
      <Router>
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:serviceId" element={<ServiceDetail />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } />
          <Route path="/portfolio-review" element={<PortfolioReview />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/control-panel" element={<ControlPanel />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/investor-charter" element={<InvestorCharter />} />
          <Route path="/investor-grievance" element={<InvestorGrievance />} />
          <Route path="/analysis" element={
            <PrivateRoute>
              <Analysis />
            </PrivateRoute>
          } />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/api-test" element={<ApiTest />} />
          <Route path="/test-complaints" element={<TestPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
        <ChatBot />
      </Router>
    </AuthProvider>
  );
}

export default App;
