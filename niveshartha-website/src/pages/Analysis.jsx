import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import ScrollAnimation from '../components/ScrollAnimation';
import IntrinsicValueTool from '../components/IntrinsicValueTool';
import Footer from '../components/Footer';
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

  // Available reports configuration
  const availableReports = [
    { id: REPORT_TYPES.NFO_MASTER, title: 'NFO Master Data', icon: '📊' },
    { id: REPORT_TYPES.CSP_ANALYSIS, title: 'CSP Analysis', icon: '📈' },
    { id: REPORT_TYPES.COVERED_CALL, title: 'Covered Call', icon: '📞' },
  ];

  // Fetch report data when active report changes
  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (activeReport === 'nfo-master') {
          // Fetch data from the provided API with additional options
          const response = await fetch(' https://analytics-advisor-backend-1-583205731005.us-central1.run.app/get_stocks_master', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            mode: 'cors', // Explicitly set CORS mode
          });
          
          if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
          }
          
          const data = await response.json();
          console.log('API Response:', data); // Debug the response
          
          // Check if data is an array, if not, handle accordingly
          if (Array.isArray(data)) {
            setReportData(data);
          } else if (data && typeof data === 'object') {
            // If data is an object but not an array, convert it to array format
            const formattedData = Object.keys(data).map(key => ({
              key: key,
              ...data[key]
            }));
            setReportData(formattedData);
          } else {
            // Handle empty or invalid data
            setReportData([]);
            console.warn('API returned unexpected data format:', data);
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

  // Calculate pagination
  const totalPages = filteredData && filteredData.length 
    ? Math.ceil(filteredData.length / itemsPerPage) 
    : 0;
    
  const paginatedData = filteredData && filteredData.length
    ? filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : [];

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

  // Handle row selection for comparison
  const toggleRowSelection = (index) => {
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter(rowIndex => rowIndex !== index));
    } else {
      setSelectedRows([...selectedRows, index]);
    }
  };

  // Clear all selected rows
  const clearSelectedRows = () => {
    setSelectedRows([]);
    setIsCompareMode(false);
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
    setSelectedRows(prevSelected => {
      if (prevSelected.includes(rowId)) {
        return prevSelected.filter(id => id !== rowId);
      } else {
        return [...prevSelected, rowId];
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
          handleSearchChange={handleSearchChange}
          marketCapFilter={marketCapFilter}
          setMarketCapFilter={setMarketCapFilter}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          isSelectMode={isSelectMode}
          isCompareMode={isCompareMode}
          selectedRows={selectedRows}
          toggleRowSelection={toggleRowSelection}
          toggleSelectMode={toggleSelectMode}
          toggleCompareMode={toggleCompareMode}
          formatColumnName={formatColumnName}
        />
        
        {/* Comparison Controls */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-2 flex-1 min-w-[200px] mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-800">Compare Stocks</h3>
            <div className="flex space-x-2">
              {!isSelectMode && !isCompareMode && (
                <button 
                  onClick={toggleSelectMode}
                  className="px-2 py-1 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Select Stocks
                </button>
              )}
              
              {isSelectMode && !isCompareMode && (
                <>
                  <button 
                    onClick={toggleCompareMode}
                    disabled={selectedRows.length === 0}
                    className={`px-2 py-1 text-xs rounded ${
                      selectedRows.length > 0 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Compare
                  </button>
                  <button 
                    onClick={toggleSelectMode}
                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </>
              )}
              
              {isCompareMode && (
                <button 
                  onClick={toggleCompareMode}
                  className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Exit Compare
                </button>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {isSelectMode 
                ? `${selectedRows.length} stocks selected` 
                : isCompareMode 
                  ? `Comparing ${selectedRows.length} stocks` 
                  : "Select stocks to compare"}
            </p>
          </div>
        </div>
          
          {/* Comparison View */}
          {isCompareMode && selectedRows.length > 0 && (
            <div className="mb-6 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <h3 className="font-medium text-indigo-800 mb-3">Stock Comparison</h3>
              <div className="overflow-x-auto" style={stickyColumnStyles.tableContainer}>
                <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                  <thead>
                    <tr>
                      <th 
                        style={stickyColumnStyles.compareMetricHeader}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                      >
                        Metric
                      </th>
                      {selectedRows.map(rowIndex => {
                        const item = filteredData[rowIndex];
                        const symbol = item.STOCK_SYMBOL || item.STOCK || item.Symbol || '';
                        return (
                          <th 
                            key={`compare-${rowIndex}`} 
                            style={stickyColumnStyles.compareHeader}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                          >
                            {symbol}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.keys(filteredData[0])
                      .filter(key => !['key'].includes(key))
                      .map(key => (
                        <tr key={`metric-${key}`} className="hover:bg-indigo-50">
                          <td 
                            style={stickyColumnStyles.compareMetricCol}
                            className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700"
                          >
                            {formatColumnName(key)}
                          </td>
                          {selectedRows.map(rowIndex => {
                            const item = filteredData[rowIndex];
                            return (
                              <td key={`value-${rowIndex}-${key}`} className="px-4 py-3 whitespace-nowrap text-sm">
                                {item[key]?.toString() || ''}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Data Table - Only show when not in compare mode */}
          {!isCompareMode && (
            <div className="overflow-x-auto" style={stickyColumnStyles.tableContainer}>
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead>
                  <tr>
                    {/* Selection column - Only show when in select mode */}
                    {isSelectMode && (
                      <th 
                        style={stickyColumnStyles.stickyFirstColHeader}
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Select
                      </th>
                    )}
                    {/* Stock Symbol with sticky positioning */}
                    <th 
                      style={isSelectMode ? stickyColumnStyles.stickySecondColHeader : stickyColumnStyles.stickyFirstColHeader}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Stock Symbol
                    </th>
                    <th 
                      style={stickyColumnStyles.stickyHeader}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    >
                      Company Name
                    </th>
                    <th 
                      style={stickyColumnStyles.stickyHeader}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    >
                      Industry
                    </th>
                    {/* Add any other important headers */}
                    {reportData[0] && Object.keys(reportData[0])
                      .filter(key => !['STOCK_SYMBOL', 'STOCK', 'STOCK_NAME', 'COMPANY_NAME', 'Symbol', 'Name', 'SECTOR', 'Industry', 'PRICE', 'CurrentPrice', 'IntrinsicValue'].includes(key))
                      .map(key => (
                        <th 
                          key={key} 
                          style={stickyColumnStyles.stickyHeader}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {formatColumnName(key)}
                        </th>
                      ))
                    }
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                  {paginatedData.map((item, rowIndex) => {
                    // Calculate the absolute index in filteredData
                    const absoluteRowIndex = (currentPage - 1) * itemsPerPage + rowIndex;
                    // Extract data fields
                    const symbol = item.STOCK_SYMBOL || item.STOCK || item.Symbol || '';
                    const name = item.STOCK_NAME || item.COMPANY_NAME || item.Name || '';
                    const industry = item.SECTOR || item.Industry || '';
                    const isSelected = selectedRows.includes(absoluteRowIndex);
                    
                    // Create cell styles with conditional background color for selected rows
                    const checkboxCellStyle = {
                      ...stickyColumnStyles.stickyFirstCol,
                      ...(isSelected && { backgroundColor: '#EEF2FF' }) // Apply selected background if selected
                    };
                    
                    const symbolCellStyle = {
                      ...(isSelectMode ? stickyColumnStyles.stickySecondCol : stickyColumnStyles.stickyFirstCol),
                      ...(isSelected && { backgroundColor: '#EEF2FF' }) // Apply selected background if selected
                    };
                    
                    return (
                      <tr key={rowIndex} className={`hover:bg-gray-50 ${isSelected ? 'bg-indigo-50' : ''}`}>
                        {/* Checkbox for row selection - Only show when in select mode */}
                        {isSelectMode && (
                          <td 
                            style={checkboxCellStyle}
                            className="px-3 py-3 whitespace-nowrap text-sm sticky left-0"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleRowSelection(absoluteRowIndex)}
                              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                          </td>
                        )}
                        {/* Stock Symbol - sticky on horizontal scroll */}
                        <td 
                          style={symbolCellStyle}
                          className="px-4 py-3 whitespace-nowrap text-sm font-medium text-indigo-600 sticky"
                        >
                          {symbol}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{industry}</td>
                        {/* Display other fields */}
                        {Object.entries(item)
                          .filter(([key]) => !['STOCK_SYMBOL', 'STOCK', 'STOCK_NAME', 'COMPANY_NAME', 'Symbol', 'Name', 'SECTOR', 'Industry', 'PRICE', 'CurrentPrice', 'IntrinsicValue'].includes(key))
                          .map(([key, value], cellIndex) => (
                            <td key={cellIndex} className="px-4 py-3 whitespace-nowrap text-sm">
                        {value?.toString() || ''}
                      </td>
                          ))
                        }
                  </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          )}

          {/* Pagination - only show when not in compare mode */}
          {!isCompareMode && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div>
                <span className="text-sm text-gray-700">
                  Showing page {currentPage} of {totalPages}
                </span>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                  }`}
                >
                  Previous
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  // Calculate which page numbers to show
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={i}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === pageNum
                          ? 'bg-indigo-600 text-white'
                          : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      );
    } else {
      // For other reports
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
    }
  };

  // Render the main component
  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Authentication check - Show login prompt if not authenticated */}
      {!currentUser && <LoginPrompt />}
      
      {/* Content with blur effect when not authenticated */}
      <div className={`${!currentUser ? 'filter blur-[3px] pointer-events-none' : ''}`}>
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
                  title="My Account"
                  icon="👤"
                  isActive={false}
                  onClick={() => {
                    navigate('/profile');
                    if (window.innerWidth < 1024) toggleSidebar();
                  }}
                />
                <ReportItem
                  title="Control Panel"
                  icon="⚙️"
                  isActive={false}
                  onClick={() => {
                    navigate('/control-panel');
                    if (window.innerWidth < 1024) toggleSidebar();
                  }}
                />
              </nav>
            </div>
          </div>
        </aside>

        {/* Main content - adjusts width based on sidebar state */}
        <main className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} pt-20 pb-10 px-4 sm:px-6 lg:px-8`}>
          <div className={`mx-auto ${isSidebarOpen ? 'max-w-6xl' : 'max-w-(90rem)'}`}>
            <div className="flex items-center justify-between mb-7">
              <h1 className="text-3xl px-12 font-bold">Financial Analysis Reports</h1>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
            
          
            
            {renderReportContent()}
          </div>
        </main>
        
        {/* Replace custom footer with Footer component */}
        {/* <Footer /> */}
      </div>
    </div>
  );
};

export default Analysis;