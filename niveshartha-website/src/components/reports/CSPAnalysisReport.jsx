import { useState, useEffect, useMemo } from 'react';
import { stickyColumnStyles } from './ReportStyles';

const CSPAnalysisReport = ({ 
  reportData: initialReportData = [],
  searchTerm = '', 
  setSearchTerm = () => {},
  currentPage = 1, 
  setCurrentPage = () => {},
  itemsPerPage = 10,
  industryFilter = '',
  setIndustryFilter = () => {},
  expiryFilter = '',
  setExpiryFilter = () => {},
  onClearFilters = () => {}
}) => {
  const [reportData, setReportData] = useState(initialReportData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'roi_pct_margin', // Default sort by ROI % (Margin)
    direction: 'desc' // Default to descending (highest first)
  });
  
  // Get unique symbols and expiry dates for the filter dropdowns
  const { symbols, expiryDates } = useMemo(() => {
    if (!reportData || !Array.isArray(reportData)) return { symbols: [], expiryDates: [] };
    
    const uniqueSymbols = new Set();
    const uniqueExpiryDates = new Set();
    
    reportData.forEach(item => {
      if (item.Symbol) uniqueSymbols.add(item.Symbol);
      if (item.Expiry) {
        // Clean up expiry date by trimming whitespace
        const cleanExpiry = item.Expiry.toString().trim();
        if (cleanExpiry) {
          uniqueExpiryDates.add(cleanExpiry);
        }
      }
    });
    
    // Sort expiry dates chronologically
    const sortedExpiryDates = Array.from(uniqueExpiryDates).sort((a, b) => {
      return new Date(a) - new Date(b);
    });
    
    console.log('Available expiry dates:', sortedExpiryDates);
    
    return {
      symbols: Array.from(uniqueSymbols).sort(),
      expiryDates: sortedExpiryDates
    };
  }, [reportData]);
  
  // State for searchable dropdown
  const [isSymbolDropdownOpen, setIsSymbolDropdownOpen] = useState(false);
  const [symbolSearch, setSymbolSearch] = useState('');
  
  // Handle symbol filter change
  const handleSymbolSelect = (symbol) => {
    setSearchTerm(symbol);
    setSymbolSearch('');
    setIsSymbolDropdownOpen(false);
    setCurrentPage(1);
  };
  
  // Filter symbols based on search input
  const filteredSymbols = useMemo(() => {
    if (!symbolSearch) return symbols;
    return symbols.filter(symbol => 
      symbol.toLowerCase().includes(symbolSearch.toLowerCase())
    );
  }, [symbols, symbolSearch]);
  
  // Reset to first page when expiry filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [expiryFilter, setCurrentPage]);
  
  // Fetch data from API on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://analytics-advisor-backend-1-583205731005.us-central1.run.app/get_csp_analysis');
        if (!response.ok) throw new Error('Failed to fetch CSP analysis data');
        const data = await response.json();
        const reportData = Array.isArray(data) ? data : [];
        setReportData(reportData);
        
        // Find the first expiry date from the data
        if (reportData.length > 0) {
          // Get unique expiry dates and sort them
          const uniqueExpiryDates = [...new Set(
            reportData
              .map(item => item.Expiry?.toString().trim())
              .filter(Boolean)
          )].sort((a, b) => new Date(a) - new Date(b));
          
          // Set the first expiry date as default if not already set
          if (uniqueExpiryDates.length > 0 && !expiryFilter) {
            setExpiryFilter(uniqueExpiryDates[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching CSP analysis data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!initialReportData || initialReportData.length === 0) {
      fetchData();
    } else {
      setReportData(initialReportData);
      // Find the first expiry date from initial data
      if (initialReportData.length > 0 && !expiryFilter) {
        const uniqueExpiryDates = [...new Set(
          initialReportData
            .map(item => item.Expiry?.toString().trim())
            .filter(Boolean)
        )].sort((a, b) => new Date(a) - new Date(b));
        
        if (uniqueExpiryDates.length > 0) {
          setExpiryFilter(uniqueExpiryDates[0]);
        }
      }
      setLoading(false);
    }
  }, [initialReportData]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setExpiryFilter('');
    setIndustryFilter('');
    setCurrentPage(1);
    onClearFilters();
    console.log('Cleared all filters');
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // First filter the data based on search term and expiry
  const filteredData = useMemo(() => {
    console.log('=== START FILTERING ===');
    console.log('Total items:', reportData?.length, '| Search term:', searchTerm, '| Expiry filter:', expiryFilter);
    
    if (!reportData || !Array.isArray(reportData)) {
      console.log('No report data or invalid format');
      return [];
    }
    
    if (reportData.length === 0) {
      console.log('Report data array is empty');
      return [];
    }
    
    // Count items by expiry for debugging
    const expiryCounts = {};
    reportData.forEach(item => {
      if (item.Expiry) {
        const expiry = item.Expiry.toString().trim();
        expiryCounts[expiry] = (expiryCounts[expiry] || 0) + 1;
      }
    });
    console.log('=== ITEMS PER EXPIRY DATE ===', expiryCounts);
    
    // If no filters are applied, return all data
    if (!searchTerm && !expiryFilter) {
      console.log('No filters applied, returning all data');
      return [...reportData];
    }
    
    const filtered = reportData.filter((item) => {
      if (typeof item !== 'object' || item === null) {
        return false;
      }
      
      // Expiry date filter (exact match, case-insensitive, trimmed)
      const itemExpiry = item.Expiry ? item.Expiry.toString().trim().toLowerCase() : '';
      const filterExpiry = expiryFilter ? expiryFilter.toString().trim().toLowerCase() : '';
      const expiryMatch = !filterExpiry || itemExpiry === filterExpiry;
      
      // Symbol filter (exact match, case-insensitive)
      const symbolMatch = !searchTerm || 
        (item.Symbol && item.Symbol.toString().toLowerCase() === searchTerm.toLowerCase());
      
      // Search term filter (partial match in any field)
      const searchMatch = searchTerm && symbolMatch ? true : 
        !searchTerm || 
        Object.entries(item).some(([key, value]) => {
          if (['key', 'id', 'Expiry'].includes(key)) return false;
          if (value === undefined || value === null) return false;
          return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
      
      return (symbolMatch || searchMatch) && expiryMatch;
    });
    
    console.log('=== FILTERING RESULTS ===');
    console.log(`Filtered ${reportData.length} items to ${filtered.length} items`);
    
    // Log expiry distribution of filtered items
    const filteredExpiryCounts = {};
    filtered.forEach(item => {
      if (item.Expiry) {
        const expiry = item.Expiry.toString().trim();
        filteredExpiryCounts[expiry] = (filteredExpiryCounts[expiry] || 0) + 1;
      }
    });
    console.log('Filtered items by expiry:', filteredExpiryCounts);
    
    return filtered;
  }, [reportData, searchTerm, expiryFilter]);

  // Then sort the filtered data
  const sortedData = useMemo(() => {
    if (!filteredData || !Array.isArray(filteredData)) return [];
    
    // Create a new array to avoid mutating the original
    const itemsToSort = [...filteredData];
    
    // Only sort if we have a valid sort key
    if (sortConfig.key) {
      itemsToSort.sort((a, b) => {
        // Get the values to compare, default to 0 if invalid
        const aValue = parseFloat(a[sortConfig.key]) || 0;
        const bValue = parseFloat(b[sortConfig.key]) || 0;
        
        // Compare the values based on sort direction
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return itemsToSort;
  }, [filteredData, sortConfig]);

  // Calculate pagination on the sorted data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CSP analysis data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Error Loading Data</h3>
        <p className="mb-4">{error}</p>
      </div>
    );
  }

  if (!reportData || reportData.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <p className="text-gray-600">No CSP analysis data available</p>
      </div>
    );
  }
  
  // Debug logging for filtered data
  if (filteredData.length > 0 && process.env.NODE_ENV === 'development') {
    console.log('=== TABLE DATA SAMPLE ===');
    console.log('First 3 items being displayed:');
    paginatedData.slice(0, 3).forEach((item, idx) => {
      console.log(`  Item ${idx + 1}:`, {
        Symbol: item.Symbol,
        Expiry: item.Expiry,
        StrikePrice: item.StrikePrice,
        'Expiry (trimmed)': item.Expiry ? item.Expiry.toString().trim().toLowerCase() : null,
        'Current Filter': expiryFilter ? expiryFilter.toString().trim().toLowerCase() : 'None'
      });
    });
    console.log('Total items in filteredData:', filteredData.length);
    console.log('Current page:', currentPage, 'of', totalPages);
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-1 text-left">Cash Secured Put Analysis</h2>
      <h3 className="text-l font-normal mb-2 text-left">The report shows the %ROI of each NFO stock with the different expiry dates and their strike prices</h3>
      
      {/* Disclaimer Marquee */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4 flex items-center">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700 ">
              <span className="font-medium">Disclaimer:</span> This is not a recommendation. The data in the table is updated once a day. Please verify the data accuracy and prices before making the trades.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        
        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Symbol Filter with Search */}
            <div className="w-full relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Symbol</label>
              <div className="relative">
                <input
                  type="text"
                  value={isSymbolDropdownOpen ? symbolSearch : (searchTerm || 'All Symbols')}
                  onChange={(e) => {
                    setSymbolSearch(e.target.value);
                    if (!isSymbolDropdownOpen) setIsSymbolDropdownOpen(true);
                  }}
                  onFocus={() => setIsSymbolDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setIsSymbolDropdownOpen(false), 200)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left pr-10 cursor-pointer"
                  placeholder="Search symbol..."
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                
                {/* Dropdown menu */}
                {isSymbolDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    <div 
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSymbolSelect('');
                      }}
                    >
                      All Symbols
                    </div>
                    {filteredSymbols.map((symbol) => (
                      <div
                        key={symbol}
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSymbolSelect(symbol);
                        }}
                      >
                        {symbol}
                      </div>
                    ))}
                    {filteredSymbols.length === 0 && (
                      <div className="px-4 py-2 text-sm text-gray-500">No symbols found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Expiry Date Filter */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Expiry</label>
              <div className="relative">
                <select
                  value={expiryFilter}
                  onChange={(e) => setExpiryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm appearance-none"
                >
                  <option value="">All Expiry Dates</option>
                  {expiryDates.map((date) => (
                    <option key={date} value={date}>
                      {date}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 pt-6">
                  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                    <path d="M7 7l3 3 3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
              </div>
            </div>


            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                disabled={!searchTerm && !expiryFilter}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  (searchTerm || expiryFilter)
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* CSP Analysis Table */}
      <div className="mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Symbol</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">LotSize</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">52W Low</th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('pct_above52_low')}
                >
                  <div className="flex items-center">
                    <div className="flex items-center gap-1">
                      % Above 52W Low
                      <span className="font-bold text-gray-700">
                        {sortConfig.key === 'pct_above52_low' 
                          ? (sortConfig.direction === 'asc' ? '↑' : '↓')
                          : '↕'}
                      </span>
                    </div>
                  </div>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Stock LTP</th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('pct_below52_high')}
                >
                  <div className="flex items-center">
                    <div className="flex items-center gap-1">
                      % Below 52W High
                      <span className="font-bold text-gray-700">
                        {sortConfig.key === 'pct_below52_high' 
                          ? (sortConfig.direction === 'asc' ? '↑' : '↓')
                          : '↕'}
                      </span>
                    </div>
                  </div>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">52W High</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Strike Price</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Option LTP</th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('PREMIUM_AMT')}
                >
                  <div className="flex items-center">
                    <div className="flex items-center gap-1">
                      Premium Amt
                      <span className="font-bold text-gray-700">
                        {sortConfig.key === 'PREMIUM_AMT' 
                          ? (sortConfig.direction === 'asc' ? '↑' : '↓')
                          : '↕'}
                      </span>
                    </div>
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('TOTAL_MARGIN_AMT')}
                >
                  <div className="flex items-center">
                    <div className="flex items-center gap-1">
                      Total Margin
                      <span className="font-bold text-gray-700">
                        {sortConfig.key === 'TOTAL_MARGIN_AMT' 
                          ? (sortConfig.direction === 'asc' ? '↑' : '↓')
                          : '↕'}
                      </span>
                    </div>
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('roi_pct_margin')}
                >
                  <div className="flex items-center">
                    <div className="flex items-center gap-1">
                      ROI % (Margin)
                      <span className="font-bold text-gray-700">
                        {sortConfig.key === 'roi_pct_margin' 
                          ? (sortConfig.direction === 'asc' ? '↑' : '↓')
                          : '↕'}
                      </span>
                    </div>
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('roi_pct_total')}
                >
                  <div className="flex items-center">
                    <div className="flex items-center">
                      ROI % (Total)
                      <span className="font-bold text-gray-700">
                        {sortConfig.key === 'roi_pct_total'
                          ? (sortConfig.direction === 'asc' ? '↑' : '↓')
                          : '↕'}
                      </span>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((item, index) => (
                <tr key={`csp-${index}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.Symbol || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{item.LotSize || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {!isNaN(parseFloat(item.wk52_l)) ? `₹${parseFloat(item.wk52_l).toFixed(2)}` : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {!isNaN(parseFloat(item.pct_above52_low)) ? `${parseFloat(item.pct_above52_low).toFixed(2)}%` : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {!isNaN(parseFloat(item.STOCK_LTP)) ? `₹${parseFloat(item.STOCK_LTP).toFixed(2)}` : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {!isNaN(parseFloat(item.pct_below52_high)) ? `${parseFloat(item.pct_below52_high).toFixed(2)}%` : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {!isNaN(parseFloat(item.wk52_h)) ? `₹${parseFloat(item.wk52_h).toFixed(2)}` : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.StrikePrice || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {!isNaN(parseFloat(item.OPTION_LTP)) ? `₹${parseFloat(item.OPTION_LTP).toFixed(2)}` : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {!isNaN(parseFloat(item.PREMIUM_AMT)) ? `₹${parseFloat(item.PREMIUM_AMT).toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {!isNaN(parseFloat(item.TOTAL_MARGIN_AMT)) ? `₹${parseFloat(item.TOTAL_MARGIN_AMT).toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                    {!isNaN(parseFloat(item.roi_pct_margin)) ? `${parseFloat(item.roi_pct_margin).toFixed(2)}%` : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                    {!isNaN(parseFloat(item.roi_pct_total)) ? `${parseFloat(item.roi_pct_total).toFixed(2)}%` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
          <div></div>
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
};

export default CSPAnalysisReport; 