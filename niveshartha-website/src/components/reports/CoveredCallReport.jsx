import { useState, useEffect, useMemo } from 'react';
import { stickyColumnStyles } from './ReportStyles';

const CoveredCallReport = ({ 
  reportData: initialReportData,
  searchTerm, 
  setSearchTerm,
  currentPage, 
  setCurrentPage,
  itemsPerPage = 10
}) => {
  const [reportData, setReportData] = useState(initialReportData || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [industryFilter, setIndustryFilter] = useState('');
  
  // Fetch data from API on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://analytics-advisor-backend-1-583205731005.us-central1.run.app/get_cc_analysis');
        if (!response.ok) throw new Error('Failed to fetch Covered Call analysis data');
        const data = await response.json();
        setReportData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching Covered Call analysis data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!initialReportData || initialReportData.length === 0) {
      fetchData();
    } else {
      setReportData(initialReportData);
      setLoading(false);
    }
  }, [initialReportData]);

  // Get unique symbols for the filter dropdown
  const symbols = useMemo(() => {
    if (!reportData || !Array.isArray(reportData)) return [];
    const uniqueSymbols = new Set();
    reportData.forEach(item => {
      if (item.Symbol) uniqueSymbols.add(item.Symbol);
    });
    return Array.from(uniqueSymbols).sort();
  }, [reportData]);

  // Handle industry filter change
  const handleSymbolChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Filter data based on search term and symbol
  const filteredData = useMemo(() => {
    console.log('Filtering data. reportData:', reportData, 'searchTerm:', searchTerm);
    
    if (!reportData || !Array.isArray(reportData)) {
      console.log('No report data or invalid format');
      return [];
    }
    
    if (reportData.length === 0) {
      console.log('Report data array is empty');
      return [];
    }
    
    const filtered = reportData.filter(item => {
      if (typeof item !== 'object' || item === null) {
        console.log('Skipping invalid item:', item);
        return false;
      }
      
      // Log first item structure for debugging
      if (reportData.indexOf(item) === 0) {
        console.log('First item structure:', Object.keys(item));
      }
      
      // Search term filter
      const searchMatch = !searchTerm || 
        Object.entries(item).some(([key, value]) => {
          if (['key', 'id'].includes(key)) return false;
          if (value === undefined || value === null) return false;
          const valueStr = String(value).toLowerCase();
          const match = valueStr.includes(searchTerm.toLowerCase());
          if (match) console.log(`Match found in ${key}:`, value);
          return match;
        });
      
      return searchMatch;
    });
    
    console.log(`Filtered ${reportData.length} items to ${filtered.length} items`);
    return filtered;
  }, [reportData, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
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
          <p className="text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Error Loading Data</h3>
        <p className="mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!reportData || reportData.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4 sm:mb-0">Covered Call Analysis</h2>
        
        {/* Filter Controls */}
        <div className="w-full sm:w-auto grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Symbol Filter */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Symbol</label>
            <select
              value={searchTerm}
              onChange={handleSymbolChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm appearance-none"
            >
              <option value="">All Symbols</option>
              {symbols.map((symbol) => (
                <option key={symbol} value={symbol}>
                  {symbol}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 pt-6">
              <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M7 7l3 3 3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
          </div>
          
          {/* Search Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              disabled={!searchTerm}
              className={`w-full px-3 py-2 text-sm rounded-md ${
                searchTerm
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Covered Call Analysis Table */}
      <div className="mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Symbol
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Strike</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Option LTP</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Stock LTP</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Premium</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Margin Amt</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">ROI (Margin)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">ROI (Total)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">% Below 52w H</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">% Above 52w L</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">52w High</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">52w Low</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Lot Size</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Trading Symbol</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((item, index) => (
                <tr key={`cc-${index}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.Symbol || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{item.StrikePrice || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {!isNaN(parseFloat(item.OPTION_LTP)) ? `₹${parseFloat(item.OPTION_LTP).toFixed(2)}` : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {!isNaN(parseFloat(item.STOCK_LTP)) ? `₹${parseFloat(item.STOCK_LTP).toFixed(2)}` : '-'}
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
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {!isNaN(parseFloat(item.pct_below52_high)) ? `${parseFloat(item.pct_below52_high).toFixed(2)}%` : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {!isNaN(parseFloat(item.pct_above52_low)) ? `${parseFloat(item.pct_above52_low).toFixed(2)}%` : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {!isNaN(parseFloat(item.wk52_h)) ? `₹${parseFloat(item.wk52_h).toFixed(2)}` : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {!isNaN(parseFloat(item.wk52_l)) ? `₹${parseFloat(item.wk52_l).toFixed(2)}` : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{item.LotSize || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{item.TradingSymbol || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
          <div>
            <span className="text-sm text-gray-700">
              Showing page {currentPage} of {totalPages}
              <span className="hidden sm:inline"> ({filteredData.length} total records)</span>
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
};

export default CoveredCallReport; 