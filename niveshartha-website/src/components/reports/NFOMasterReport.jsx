import { useState, useEffect } from 'react';
import { stickyColumnStyles, formatColumnName, getSortedColumns } from './ReportStyles';

const NFOMasterReport = ({ 
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
  showColumnSelector,
  setShowColumnSelector,
  visibleColumns,
  setVisibleColumns,
  itemsPerPage = 10
}) => {
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Filter data based on search term and market cap
  const filteredData = reportData
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
    : [];

  // Calculate pagination
  const totalPages = filteredData && filteredData.length 
    ? Math.ceil(filteredData.length / itemsPerPage) 
    : 0;
    
  const paginatedData = filteredData && filteredData.length
    ? filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : [];

  // Get sorted columns in the desired display order
  const orderedColumns = getSortedColumns(visibleColumns);

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

  // Toggle compare mode
  const toggleCompareMode = () => {
    if (selectedRows.length > 0) {
      setIsCompareMode(!isCompareMode);
    } else {
      alert("Please select at least one stock to compare");
    }
  };

  if (!reportData || reportData.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">NFO Master Data Analysis</h2>
      
      {/* Integrated Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {/* Industry Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Industry:</label>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Industries</option>
            {Array.from(new Set(reportData.map(item => item.SECTOR || item.Industry || ''))).filter(Boolean).sort().map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>
        
        {/* General Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Stocks:</label>
          <input
            type="text"
            placeholder="Search by any field..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        {/* Market Cap Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Market Cap Range:</label>
          <select
            onChange={(e) => {
              const selectedRange = parseInt(e.target.value);
              const ranges = [
                { min: 0, max: Infinity },  // All
                { min: 0, max: 5000 },     // Small Cap < 5,000 Cr
                { min: 5000, max: 20000 }, // Mid Cap 5,000 - 20,000 Cr
                { min: 20000, max: Infinity } // Large Cap > 20,000 Cr
              ];
              
              // Set the market cap filter
              setMarketCapFilter(ranges[selectedRange]);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="0">All Market Caps</option>
            <option value="1">Small Cap (&lt; ₹5,000 Cr)</option>
            <option value="2">Mid Cap (₹5,000 - ₹20,000 Cr)</option>
            <option value="3">Large Cap (&gt; ₹20,000 Cr)</option>
          </select>
        </div>
        
        {/* Results Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Selected Capital Range:</label>
          <div className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50">
            {marketCapFilter.min === 0 && marketCapFilter.max === Infinity ? 
              'All Market Caps' : 
              `₹${marketCapFilter.min.toLocaleString()} Cr - ${marketCapFilter.max === Infinity ? '∞' : `₹${marketCapFilter.max.toLocaleString()} Cr`}`
            }
          </div>
        </div>
      </div>

      {/* Enhanced Analysis Metrics */}
      <div className="mb-4 flex flex-wrap gap-3">
        {/* Stock Count */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-2 flex-1 min-w-[200px]">
          <h3 className="text-sm font-medium text-gray-800">Total Stocks</h3>
          <p className="text-xs text-gray-600 mt-1">
            {filteredData.length} stocks match your filters
          </p>
        </div>
        
        {/* Comparison Controls */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-2 flex-1 min-w-[200px]">
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
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {isSelectMode 
              ? `${selectedRows.length} stocks selected` 
              : isCompareMode 
                ? `Comparing ${selectedRows.length} stocks` 
                : "Select stocks to compare"}
          </p>
        </div>

        {/* Column Customization */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-2 flex-1 min-w-[200px]">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-800">Customize View</h3>
            <button
              onClick={() => setShowColumnSelector(true)}
              className="px-2 py-1 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-700 flex items-center space-x-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit Columns</span>
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Choose which columns to display in the table
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
                {orderedColumns.map(key => {
                  if (!visibleColumns[key]) return null;
                  
                  return (
                    <tr key={`metric-${key}`} className="hover:bg-indigo-50">
                      <td 
                        style={stickyColumnStyles.compareMetricCol}
                        className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700"
                      >
                        {formatColumnName(key)}
                      </td>
                      {selectedRows.map(rowIndex => {
                        const item = filteredData[rowIndex];
                        let value = item[key];
                        
                        // Format the value based on column type
                        if (key === 'PRICE' || key === 'CURRENT_PRICE') {
                          value = value ? `₹${parseFloat(value).toFixed(2)}` : '-';
                        } else if (key === 'MARKET_CAP_CR') {
                          value = value ? `₹${parseFloat(value).toLocaleString()} Cr` : '-';
                        } else if (key === 'CHANGE') {
                          value = value ? `${parseFloat(value).toFixed(2)}%` : '-';
                        } else if (key === 'VOLUME') {
                          value = value ? parseFloat(value).toLocaleString() : '-';
                        } else if (key === 'PE_RATIO' || key === 'DIVIDEND_YIELD') {
                          value = value ? parseFloat(value).toFixed(2) : '-';
                        }
                        
                        return (
                          <td key={`value-${rowIndex}-${key}`} className="px-4 py-3 whitespace-nowrap text-sm">
                            {value || '-'}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Stock Table - Only show when not in compare mode */}
      {!isCompareMode && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Stock Data</h3>
          <div className="overflow-x-auto" style={stickyColumnStyles.tableContainer}>
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead>
                <tr>
                  {isSelectMode && (
                    <th 
                      style={{
                        position: 'sticky',
                        left: 0,
                        top: 0,
                        backgroundColor: '#F9FAFB',
                        zIndex: 50,
                        boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)'
                      }}
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Select
                    </th>
                  )}
                  {orderedColumns.map(column => {
                    const isSticky = column === 'STOCK_SYMBOL' || column === 'STOCK' || column === 'Symbol';
                    
                    const thStyle = {
                      position: isSticky ? 'sticky' : 'static',
                      left: isSticky ? (isSelectMode ? '52px' : 0) : 'auto',
                      top: 0,
                      backgroundColor: '#F9FAFB',
                      zIndex: isSticky ? 50 : 40,
                      boxShadow: isSticky ? '2px 0 5px -2px rgba(0,0,0,0.1)' : 'none'
                    };

                    return (
                      <th 
                        key={column}
                        style={thStyle}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {formatColumnName(column)}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedData.map((item, rowIndex) => {
                  const absoluteRowIndex = (currentPage - 1) * itemsPerPage + rowIndex;
                  const isSelected = selectedRows.includes(absoluteRowIndex);
                  
                  return (
                    <tr key={rowIndex} className={`hover:bg-gray-50 ${isSelected ? 'bg-indigo-50' : ''}`}>
                      {isSelectMode && (
                        <td 
                          style={{
                            position: 'sticky',
                            left: 0,
                            backgroundColor: isSelected ? '#EEF2FF' : 'white',
                            zIndex: 30,
                            boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)'
                          }}
                          className="px-3 py-3 whitespace-nowrap text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRowSelection(absoluteRowIndex)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                        </td>
                      )}
                      {orderedColumns.map(column => {
                        const isSticky = column === 'STOCK_SYMBOL' || column === 'STOCK' || column === 'Symbol';
                        
                        const tdStyle = {
                          position: isSticky ? 'sticky' : 'static',
                          left: isSticky ? (isSelectMode ? '52px' : 0) : 'auto',
                          backgroundColor: isSelected ? '#EEF2FF' : (isSticky ? 'white' : 'transparent'),
                          zIndex: isSticky ? 30 : 1,
                          boxShadow: isSticky ? '2px 0 5px -2px rgba(0,0,0,0.1)' : 'none'
                        };

                        let value = item[column];
                        // Format the value based on column type
                        if (column === 'PRICE' || column === 'CURRENT_PRICE') {
                          value = value ? `₹${parseFloat(value).toFixed(2)}` : '-';
                        } else if (column === 'MARKET_CAP_CR') {
                          value = value ? `₹${parseFloat(value).toLocaleString()} Cr` : '-';
                        } else if (column === 'CHANGE') {
                          value = value ? `${parseFloat(value).toFixed(2)}%` : '-';
                        } else if (column === 'VOLUME') {
                          value = value ? parseFloat(value).toLocaleString() : '-';
                        } else if (column === 'PE_RATIO' || column === 'DIVIDEND_YIELD') {
                          value = value ? parseFloat(value).toFixed(2) : '-';
                        }

                        return (
                          <td 
                            key={column}
                            style={tdStyle}
                            className="px-4 py-3 whitespace-nowrap text-sm"
                            onMouseOver={(e) => {
                              if (isSticky) {
                                e.currentTarget.style.backgroundColor = isSelected ? '#EEF2FF' : '#F9FAFB';
                              }
                            }}
                            onMouseOut={(e) => {
                              if (isSticky) {
                                e.currentTarget.style.backgroundColor = isSelected ? '#EEF2FF' : 'white';
                              }
                            }}
                          >
                            {value || '-'}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination - only show when not in compare mode */}
      {!isCompareMode && totalPages > 1 && (
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

export default NFOMasterReport; 