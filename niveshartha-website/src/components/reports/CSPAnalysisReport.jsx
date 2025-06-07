import { useState } from 'react';
import { stickyColumnStyles, formatColumnName, getSortedColumns } from './ReportStyles';

const CSPAnalysisReport = ({ 
  reportData,
  searchTerm, 
  setSearchTerm, 
  currentPage, 
  setCurrentPage,
  marketCapFilter,
  setMarketCapFilter,
  selectedRows,
  setSelectedRows,
  isSelectMode,
  setIsSelectMode,
  isCompareMode,
  setIsCompareMode,
  visibleColumns,
  setVisibleColumns,
  showColumnSelector,
  setShowColumnSelector,
  itemsPerPage = 10
}) => {
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };
  
  // Filter data based on search term
  const filteredData = reportData
    ? reportData.filter(item => 
        Object.values(item).some(
          value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : [];
  
  // Calculate pagination
  const totalPages = filteredData && filteredData.length 
    ? Math.ceil(filteredData.length / itemsPerPage) 
    : 0;
    
  const paginatedData = filteredData && filteredData.length
    ? filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : [];
  
  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Get sorted columns in the desired display order
  const orderedColumns = visibleColumns ? getSortedColumns(visibleColumns) : [];
  
  if (!reportData || reportData.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">CSP Analysis</h2>
      
      {/* Filter Controls with proper heading */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Filter Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Symbol:</label>
            <select
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'all') {
                  setSearchTerm('');
                } else {
                  setSearchTerm(value);
                }
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm appearance-none"
            >
              <option value="all">All Symbols</option>
              {Array.from(new Set(reportData.map(item => item.Symbol || ''))).filter(Boolean).sort().map(symbol => (
                <option key={symbol} value={symbol}>{symbol}</option>
              ))}
            </select>
            {/* Custom dropdown arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 pt-6">
              <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M7 7l3 3 3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
          </div>
          
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date:</label>
            <select
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'all') {
                  setSearchTerm('');
                } else {
                  setSearchTerm(value);
                }
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm appearance-none"
            >
              <option value="all">All Expiry Dates</option>
              {Array.from(new Set(reportData.map(item => item.Expiry || ''))).filter(Boolean).sort().map(expiry => (
                <option key={expiry} value={expiry}>{expiry}</option>
              ))}
            </select>
            {/* Custom dropdown arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 pt-6">
              <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M7 7l3 3 3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* CSP Analysis Table with heading */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Options Data</h3>
        <div className="overflow-x-auto" style={stickyColumnStyles.tableContainer}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  style={{
                    position: 'sticky',
                    left: 0,
                    top: 0,
                    backgroundColor: '#F9FAFB',
                    zIndex: 50,
                    boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)'
                  }}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Symbol
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">StrikePrice</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OPTION_LTP</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STOCK_LTP</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PREMIUM_AMT</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL_MARGIN_AMT</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">roi_pct_margin</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">roi_pct_total</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">pct_below52_high</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">pct_above52_low</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">wk52_h</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">wk52_l</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LotSize</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((item, index) => (
                <tr key={`csp-${index}`} className="hover:bg-gray-50">
                  <td 
                    style={{
                      position: 'sticky',
                      left: 0,
                      backgroundColor: 'white',
                      zIndex: 30,
                      boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)'
                    }}
                    className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900"
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
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

export default CSPAnalysisReport; 