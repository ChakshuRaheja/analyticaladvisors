import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import ScrollAnimation from '../components/ScrollAnimation';

// Report item component
const ReportItem = ({ title, isActive, onClick, icon }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`
        flex items-center space-x-3 px-4 py-3 cursor-pointer rounded-lg
        ${isActive 
          ? 'bg-indigo-600 text-white' 
          : 'text-gray-700 hover:bg-gray-100'
        }
        transition-colors duration-200
      `}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{title}</span>
    </motion.div>
  );
};

// Login prompt popup component
const LoginPrompt = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Unlock Premium Analysis</h2>
          <p className="text-gray-600 mb-6">
            Sign in or create an account to access our detailed financial analysis reports and personalized insights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/login"
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/signup"
              className="px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg border border-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              Create Account
            </Link>
          </div>
          
          <p className="mt-6 text-sm text-gray-500">
            Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const Analysis = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeReport, setActiveReport] = useState('market-overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  // Available reports configuration
  const availableReports = [
    { id: 'market-overview', title: 'Market Overview', icon: '📊' },
    { id: 'stock-insights', title: 'Stock Insights', icon: '📈' },
    { id: 'sector-analysis', title: 'Sector Analysis', icon: '🔍' },
    { id: 'economic-indicators', title: 'Economic Indicators', icon: '🌐' },
  ];

  // Fetch report data when active report changes
  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        // In real implementation, replace with actual API call:
        // const response = await fetch(`/api/reports/${activeReport}`);
        // const data = await response.json();
        // setReportData(data);
        
        // Demo data
        setTimeout(() => {
          setReportData({
            'market-overview': [
              { metric: 'Market Cap', value: '$2.5T', change: '+2.3%', status: 'Strong Buy' },
              { metric: 'Revenue', value: '$394.3B', change: '-1.2%', status: 'Hold' },
            ],
            'stock-insights': [
              { metric: 'P/E Ratio', value: '25.4', change: '+0.8%', status: 'Buy' },
              { metric: 'EPS', value: '$3.42', change: '+4.2%', status: 'Strong Buy' },
            ],
            'sector-analysis': [
              { metric: 'Tech Sector', value: '$892B', change: '+3.1%', status: 'Buy' },
              { metric: 'Healthcare', value: '$654B', change: '-0.5%', status: 'Hold' },
            ],
            'economic-indicators': [
              { metric: 'GDP Growth', value: '2.4%', change: '+0.3%', status: 'Positive' },
              { metric: 'Inflation', value: '3.1%', change: '-0.2%', status: 'Neutral' },
            ]
          }[activeReport]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching report data:', error);
        setLoading(false);
      }
    };

    fetchReportData();
  }, [activeReport]);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Render report content
  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading report data...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reportData && reportData.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">{item.metric}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.value}</td>
                <td className={`px-6 py-4 whitespace-nowrap ${
                  item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>{item.change}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Authentication check - Show login prompt if not authenticated */}
      {!currentUser && <LoginPrompt />}
      
      {/* Content with blur effect when not authenticated */}
      <div className={`${!currentUser ? 'filter blur-sm pointer-events-none' : ''}`}>
        {/* Mobile menu button */}
        <div className="lg:hidden fixed top-20 left-4 z-20">
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md bg-white shadow-md text-gray-700 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Sidebar - Desktop and Mobile */}
        <aside 
          className={`
            fixed top-16 bottom-0 left-0 z-10
            w-64 bg-white shadow-md overflow-y-auto
            transition-transform duration-300
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-6 p-2 border-b pb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                {currentUser ? 
                  (currentUser.displayName 
                    ? currentUser.displayName.charAt(0).toUpperCase() 
                    : currentUser.email.charAt(0).toUpperCase())
                  : "G"}
              </div>
              <div>
                <p className="font-medium">{currentUser ? (currentUser.displayName || currentUser.email.split('@')[0]) : "Guest User"}</p>
                <p className="text-xs text-gray-500">{currentUser ? "Premium Member" : "Limited Access"}</p>
              </div>
            </div>
            
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Reports</h3>
            <nav className="space-y-1">
              {availableReports.map((report) => (
                <ReportItem
                  key={report.id}
                  title={report.title}
                  icon={report.icon}
                  isActive={activeReport === report.id}
                  onClick={() => {
                    setActiveReport(report.id);
                    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
                  }}
                />
              ))}
            </nav>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Quick Links</h3>
              <nav className="space-y-1">
                <ReportItem
                  title="My Account"
                  icon="👤"
                  isActive={false}
                  onClick={() => navigate('/profile')}
                />
                <ReportItem
                  title="Control Panel"
                  icon="⚙️"
                  isActive={false}
                  onClick={() => navigate('/control-panel')}
                />
              </nav>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="lg:ml-64 pt-20 pb-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Financial Analysis Reports</h1>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
            
            {renderReportContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analysis;