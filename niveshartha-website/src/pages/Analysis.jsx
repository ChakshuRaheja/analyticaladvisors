import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import ScrollAnimation from '../components/ScrollAnimation';
import IntrinsicValueTool from '../components/IntrinsicValueTool';

import { 
  NFOMasterReport, 
  CSPAnalysisReport, 
  CoveredCallReport,
  stickyColumnStyles 
} from '../components/reports';

// Report types
const REPORT_TYPES = {
  NFO_MASTER: 'nfo-master',
  CSP_ANALYSIS: 'csp-analysis',
  COVERED_CALL: 'covered-call'
};

// Report item component
const ReportItem = ({ title, isActive, onClick, icon, reportType }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onClick(reportType)}
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
  const [activeTab, setActiveTab] = useState('reports');
  const [activeReport, setActiveReport] = useState(REPORT_TYPES.NFO_MASTER);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [marketCapFilter, setMarketCapFilter] = useState({ min: 0, max: Infinity });
  const [selectedRows, setSelectedRows] = useState([]);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const itemsPerPage = 10;
  
  // Column selector state
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    'STOCK_SYMBOL': true,
    'COMPANY_NAME': true,
    'INDUSTRY': true,
    'MARKET_CAP_CR': true,
    'PRICE': true,
    'CHANGE': true,
    'VOLUME': true,
    'PE_RATIO': true,
    'DIVIDEND_YIELD': true,
    'SECTOR': true,
    'LAST_UPDATED': true
  });

  // CSP Analysis state
  const [cspAnalysisData, setCspAnalysisData] = useState([]);
  const [cspSearchTerm, setCspSearchTerm] = useState('');
  const [cspCurrentPage, setCspCurrentPage] = useState(1);
  const [cspItemsPerPage] = useState(10);
  const [cspIndustryFilter, setCspIndustryFilter] = useState('');
  const [cspExpiryFilter, setCspExpiryFilter] = useState('');

  // Covered Call report state
  const [ccAnalysisData, setCcAnalysisData] = useState([]);
  const [ccSearchTerm, setCcSearchTerm] = useState('');
  const [ccCurrentPage, setCcCurrentPage] = useState(1);
  const ccItemsPerPage = 10;
  // Add these state variables
const [ccExpiryFilter, setCcExpiryFilter] = useState('');
const [ccIndustryFilter, setCcIndustryFilter] = useState(''); // Optional: if you want industry filter as well
  

  // Initialize visible columns when report data is loaded
  useEffect(() => {
    if (reportData && reportData.length > 0) {
      // Get all unique column names from the data
      const allColumns = {};
      reportData.forEach(item => {
        Object.keys(item).forEach(key => {
          if (!allColumns[key] && key !== 'key') {
            allColumns[key] = visibleColumns[key] !== undefined ? visibleColumns[key] : true;
          }
        });
      });
      
      // Only update if we have new columns
      if (Object.keys(allColumns).length > 0) {
        setVisibleColumns(prev => ({
          ...allColumns,
          ...prev // Preserve any existing column states
        }));
      }
    }
  }, [reportData]);

  // Available reports configuration
  const availableReports = [
    { id: REPORT_TYPES.NFO_MASTER, title: 'Fundamental Analysis' },
    { id: REPORT_TYPES.CSP_ANALYSIS, title: 'CSP Analysis' },
    { id: REPORT_TYPES.COVERED_CALL, title: 'Covered Call' },
  ];

  // Fetch report data when active report changes
  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (activeReport === REPORT_TYPES.NFO_MASTER) {
          // Fetch data from the provided API with additional options
          const response = await fetch('https://analytics-advisor-backend-1-583205731005.us-central1.run.app/get_stocks_master', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            mode: 'cors', // Explicitly set CORS mode
            timeout: 30000 // 30 second timeout
          });
          
          try {
            const data = await response.json();
            console.log('API Response:', data); // Debug the response
            
            // Validate data structure
            if (!data || (typeof data !== 'object' && !Array.isArray(data))) {
              throw new Error('Invalid data format received from API');
            }
            
            // Handle array data
            if (Array.isArray(data)) {
              setReportData(data);
            } 
            // Handle object data
            else if (typeof data === 'object') {
              // If data contains an error message
              if (data.error) {
                throw new Error(data.error);
              }
              
              // If data contains a data property
              if (data.data) {
                if (Array.isArray(data.data)) {
                  setReportData(data.data);
                } else if (typeof data.data === 'object') {
                  const formattedData = Object.keys(data.data).map(key => ({
                    key: key,
                    ...data.data[key]
                  }));
                  setReportData(formattedData);
                }
              } 
              // If data is a direct object
              else {
                const formattedData = Object.keys(data).map(key => ({
                  key: key,
                  ...data[key]
                }));
                setReportData(formattedData);
              }
            }
          } catch (err) {
            console.error('Error processing API response:', err);
            throw new Error('Failed to process API response');
          }
        } else if (activeReport === REPORT_TYPES.CSP_ANALYSIS) {
          // Fetch CSP Analysis data
          const response = await fetch('https://analytics-advisor-backend-1-583205731005.us-central1.run.app/get_csp_analysis', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            mode: 'cors',
            timeout: 30000
          });
          
          try {
            const data = await response.json();
            console.log('CSP Analysis API Response:', data);
            
            // Validate data structure
            if (!data || (typeof data !== 'object' && !Array.isArray(data))) {
              throw new Error('Invalid data format received from CSP Analysis API');
            }
            
            // Handle array data
            if (Array.isArray(data)) {
              setCspAnalysisData(data);
            } 
            // Handle object data
            else if (typeof data === 'object') {
              // If data contains an error message
              if (data.error) {
                throw new Error(data.error);
              }
              
              // If data contains a data property
              if (data.data) {
                if (Array.isArray(data.data)) {
                  setCspAnalysisData(data.data);
                } else if (typeof data.data === 'object') {
                  const formattedData = Object.keys(data.data).map(key => ({
                    key: key,
                    ...data.data[key]
                  }));
                  setCspAnalysisData(formattedData);
                }
              } 
              // If data is a direct object
              else {
                const formattedData = Object.keys(data).map(key => ({
                  key: key,
                  ...data[key]
                }));
                setCspAnalysisData(formattedData);
              }
            }
          } catch (err) {
            console.error('Error processing CSP Analysis API response:', err);
            throw new Error('Failed to process CSP Analysis API response');
          }
        } else {
          // Demo data for other reports remains unchanged
          setTimeout(() => {
            setReportData({
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
          }, 1000);
        }
      } catch (error) {
        console.error('Error fetching report data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [activeReport]);

  // Filter data based on search term and market cap for NFO Master
  const filteredData = activeReport === 'nfo-master' && reportData
    ? reportData.filter(item => {
        // Search term filter
        const matchesSearch = Object.values(item).some(
          value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        // Market cap filter
        const marketCap = parseFloat(item.MARKET_CAP_CR || 0);
        const matchesMarketCap = marketCap >= marketCapFilter.min && marketCap <= marketCapFilter.max;
        
        // Item passes filter if it matches both conditions
        return matchesSearch && matchesMarketCap;
      })
    : reportData;

  // Filter CSP Analysis data
  const filteredCspData = useMemo(() => {
    if (!cspAnalysisData || !Array.isArray(cspAnalysisData) || cspAnalysisData.length === 0) return [];
    
    return cspAnalysisData.filter(item => {
      if (typeof item !== 'object' || item === null) return false;

      const industryMatch = !cspIndustryFilter || 
        (item.INDUSTRY && item.INDUSTRY.toLowerCase() === cspIndustryFilter.toLowerCase()) ||
        (item.SECTOR && item.SECTOR.toLowerCase() === cspIndustryFilter.toLowerCase());
      
      const searchMatch = !cspSearchTerm || 
        Object.entries(item).some(([key, value]) => {
          if (['key', 'id'].includes(key)) return false;
          if (value === undefined || value === null) return false;
          
          const strValue = String(value).trim().toLowerCase();
          const searchLower = cspSearchTerm.toLowerCase();
          return strValue.includes(searchLower);
        });
      
      return industryMatch && searchMatch;
    });
  }, [cspAnalysisData, cspSearchTerm, cspIndustryFilter]);

  // Calculate pagination
  const totalPages = filteredData && filteredData.length 
    ? Math.ceil(filteredData.length / itemsPerPage) 
    : 0;
    
  const paginatedData = filteredData && filteredData.length
    ? filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : [];

  // Calculate pagination for CSP Analysis
  const cspTotalPages = useMemo(() => {
    return filteredCspData ? Math.ceil(filteredCspData.length / cspItemsPerPage) : 1;
  }, [filteredCspData, cspItemsPerPage]);

  // Toggle sidebar (for both mobile and desktop)
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    // On mobile, also handle mobile menu state
    if (window.innerWidth < 1024) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle page change for CSP Analysis
  const handleCspPageChange = (page) => {
    setCspCurrentPage(page);
  };

  // Toggle row selection for comparison
  const toggleRowSelection = (index) => {
    // Convert index to string for consistent comparison
    const indexStr = index.toString();
    setSelectedRows(prev => {
      if (prev.includes(indexStr)) {
        return prev.filter(rowIndex => rowIndex !== indexStr);
      } else {
        return [...prev, indexStr];
      }
    });
  };

  // Clear all selected rows
  const clearSelectedRows = () => {
    setSelectedRows([]);
  };

  // Toggle select mode
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    // If exiting select mode, clear selections
    if (isSelectMode) {
      setSelectedRows([]);
      setIsCompareMode(false);
    }
  };

  // Handle row selection
  const handleRowSelect = (rowId) => {
    // Convert rowId to string for consistent comparison
    const rowIdStr = rowId.toString();
    setSelectedRows(prevSelected => {
      if (prevSelected.includes(rowIdStr)) {
        return prevSelected.filter(id => id !== rowIdStr);
      } else {
        return [...prevSelected, rowIdStr];
      }
    });
  };

  // Toggle compare mode
  const toggleCompareMode = () => {
    if (selectedRows.length > 0) {
      setIsCompareMode(!isCompareMode);
    } else {
      alert("Please select at least one stock to compare");
    }
  };

  // Clear all filters for CSP Analysis
  const clearCspFilters = () => {
    setCspSearchTerm('');
    setCspIndustryFilter('');
    setCspExpiryFilter('');
    setCspCurrentPage(1);
  };
  
  // Clear all filters for Covered Call
  const clearCcFilters = () => {
    setCcSearchTerm('');
    setCcCurrentPage(1);
    setCcExpiryFilter(''); 
  };

  // Helper function to format column names for better display
  const formatColumnName = (columnName) => {
    if (!columnName) return '';

    // Replace underscores with spaces
    let formatted = columnName.replace(/_/g, ' ');

    // Convert to title case (capitalize first letter of each word)
    formatted = formatted
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    return formatted;
  };

  // Render report content
  const renderReportContent = () => {
    // Check if user is logged in
    if (!currentUser) {
      return <LoginPrompt />;
    }

    // Show loading state
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

    // Show error state
    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Error Loading Data</h3>
          <p className="mb-4">{error.message || 'Failed to load report data'}</p>
          <button 
            onClick={() => {
              setError(null);
              setLoading(true);
              // Refetch data or reset the report
              setActiveReport(activeReport);
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    // Handle different report types
    if (activeReport === REPORT_TYPES.NFO_MASTER) {
      return (
        <div>
          <NFOMasterReport 
            reportData={reportData}
            filteredData={filteredData}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            marketCapFilter={marketCapFilter}
            setMarketCapFilter={setMarketCapFilter}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            isSelectMode={isSelectMode}
            setIsSelectMode={setIsSelectMode}
            isCompareMode={isCompareMode}
            setIsCompareMode={setIsCompareMode}
            showColumnSelector={showColumnSelector}
            setShowColumnSelector={setShowColumnSelector}
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
            itemsPerPage={itemsPerPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            toggleRowSelection={toggleRowSelection}
            toggleSelectMode={toggleSelectMode}
            toggleCompareMode={toggleCompareMode}
            formatColumnName={formatColumnName}
          />
        </div>
      );
    }
    
    if (activeReport === REPORT_TYPES.CSP_ANALYSIS) {
      return (
        <CSPAnalysisReport 
          reportData={cspAnalysisData}
          searchTerm={cspSearchTerm}
          setSearchTerm={setCspSearchTerm}
          currentPage={cspCurrentPage}
          setCurrentPage={setCspCurrentPage}
          itemsPerPage={cspItemsPerPage}
          industryFilter={cspIndustryFilter}
          setIndustryFilter={setCspIndustryFilter}
          expiryFilter={cspExpiryFilter}
          setExpiryFilter={setCspExpiryFilter}
          onClearFilters={clearCspFilters}
        />
      );
    }
    
    if (activeReport === REPORT_TYPES.COVERED_CALL) {
      return (
        <CoveredCallReport 
  reportData={ccAnalysisData}
  searchTerm={ccSearchTerm}
  setSearchTerm={setCcSearchTerm}
  currentPage={ccCurrentPage}
  setCurrentPage={setCcCurrentPage}
  itemsPerPage={ccItemsPerPage}
  industryFilter={ccIndustryFilter}
  setIndustryFilter={setCcIndustryFilter}
  expiryFilter={ccExpiryFilter}
  setExpiryFilter={setCcExpiryFilter}
  onClearFilters={() => {
    setCcSearchTerm('');
    setCcExpiryFilter('');
    setCcIndustryFilter('');
    setCcCurrentPage(1);
  }}
/>
      );
    }
    
    // Default return for other report types
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
                  item.change && item.change.toString().startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.change || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Fix body scrolling when component mounts/unmounts
  useEffect(() => {
    // Enable body scrolling when component mounts
    document.body.style.overflow = 'auto';

    // Cleanup function to ensure scrolling is re-enabled when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Render the main component
  return (
    <div className="min-h-screen bg-gray-50 relative flex flex-col">
      {/* Authentication check - Show login prompt if not authenticated */}
      {!currentUser && <LoginPrompt />}
      
      {/* Content with blur effect when not authenticated */}
      <div className={`flex-1 flex flex-col ${!currentUser ? 'filter blur-[3px] pointer-events-none' : ''}`}>
        {/* Sidebar toggle button - visible on all screen sizes */}
        <div className={`fixed top-20 ${isSidebarOpen ? 'left-64' : 'left-4'} z-20 transition-all duration-300`}>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md bg-white shadow-md text-gray-700 hover:bg-gray-100"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? (
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
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            overscroll-contain
          `}
          style={{
            WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
            scrollbarWidth: 'thin', // For Firefox
          }}
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
                    if (window.innerWidth < 1024) toggleSidebar();
                  }}
                />
              ))}
            </nav>
            
            {/* Quick Links */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Quick Links</h3>
              <nav className="space-y-1">
                <ReportItem
                  title="Settings"
                  icon="⚙️"
                  isActive={false}
                  onClick={() => {
                    navigate('/settings');
                    if (window.innerWidth < 1024) toggleSidebar();
                  }}
                />
              </nav>
            </div>
          </div>
        </aside>

        {/* Main content - adjusts width based on sidebar state */}
        <main 
          className={`
            transition-all duration-300 
            ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} 
            pt-20 px-4 sm:px-6 lg:px-8 
            flex-1 overflow-y-auto
          `}
          style={{
            WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
            scrollBehavior: 'smooth', // Smooth scrolling for modern browsers
          }}
        >
          <div className={`mx-auto ${isSidebarOpen ? 'max-w-6xl' : 'max-w-full'}`}>
            <div className="flex items-center justify-between mb-7">
              {/* <h1 className="text-3xl px-12 font-bold">Cash Secure Put Analysis</h1> */}
              <div className="text-sm text-gray-500 ml-auto">
                Last updated: {(() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  return yesterday.toLocaleDateString('en-GB');
                })()}
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