import React, { useState, useMemo } from 'react';
import { formatColumnName } from './ReportStyles';
import { Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Column descriptions mapping
const COLUMN_DESCRIPTIONS = {
  'STOCK_SYMBOL': 'Unique ticker symbol for the stock',
  'STOCK_NAME': 'Full name of the company',
  'SECTOR': 'Industry sector the company belongs to',
  'MARKET_CAP_CR': 'Total market value of the company in Crores (₹)',
  'VALUATION_RATING': 'Rating based on company valuation metrics (1-5 stars)',
  'FINANCIAL_RATING': 'Rating based on financial health (1-5 stars)',
  'PROMOTER_HOLDING': 'Percentage of shares held by promoters',
  'PRICE_BOOK': 'Price to Book ratio - compares market price to book value',
  'DIV_YIELD': 'Dividend yield - annual dividend as percentage of stock price',
  'DEBT': 'Total debt of the company',
  'ICR': 'Interest Coverage Ratio - ability to pay interest on debt',
  '52_W_HIGH': '52-week highest price',
  '52_W_LOW': '52-week lowest price',
  'LTP': 'Last Traded Price',
  'SG_1_YR': 'Sales growth over 1 year',
  'SG_3_YR': 'Sales growth over 3 years',
  'SG_5_YR': 'Sales growth over 5 years',
  'PG_1_YR': 'Profit growth over 1 year',
  'PG_3_YR': 'Profit growth over 3 years',
  'PG_5_YR': 'Profit growth over 5 years',
  'ROE_1_YR': 'Return on Equity over 1 year',
  'ROE_3_YR': 'Return on Equity over 3 years',
  'ROE_5_YR': 'Return on Equity over 5 years',
  'ROCE_1_YR': 'Return on Capital Employed over 1 year',
  'ROCE_3_YR': 'Return on Capital Employed over 3 years',
  'ROCE_5_YR': 'Return on Capital Employed over 5 years',
  'PEG_RATIO': 'Price/Earnings to Growth ratio - measures stock value relative to earnings growth',
  'PE_RATIO': 'Price to Earnings ratio - measures current share price relative to per-share earnings',
  'DIVIDEND_YIELD': 'Annual dividend payment divided by stock price',
  'CURRENT_PRICE': 'Current trading price of the stock',
  'CHANGE': 'Price change from previous close',
  'CHANGE_PERCENT': 'Percentage price change from previous close',
  'VOLUME': 'Number of shares traded'
};

// Columns that should not show the info icon
const COLUMNS_WITHOUT_ICON = [
  'STOCK_SYMBOL',
  'STOCK_NAME',
  'SECTOR',
  'MARKET_CAP_CR',
  'VALUATION_RATING',
  'FINANCIAL_RATING'
];

// Tooltip component for column headers
const ColumnHeaderTooltip = ({ title, columnName }) => {
  const [open, setOpen] = useState(false);
  const description = COLUMN_DESCRIPTIONS[columnName] || 'No description available';
  const showIcon = !COLUMNS_WITHOUT_ICON.includes(columnName);
  
  // Handle click for mobile devices
  const handleClick = (event) => {
    event.stopPropagation();
    setOpen(true);
    
    // Auto-close after 2 seconds on mobile
    if (window.innerWidth <= 768) { // Mobile breakpoint
      setTimeout(() => setOpen(false), 2000);
    }
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  // For columns that shouldn't have the icon, just return the title
  if (!showIcon) {
    return <span>{title}</span>;
  }
  
  return (
    <div className="flex items-center">
      <span>{title}</span>
      <Tooltip 
        title={description} 
        arrow
        placement="top"
        open={open}
        onClose={handleClose}
        disableFocusListener
        disableHoverListener
        disableTouchListener
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: '#1f2937',
              '& .MuiTooltip-arrow': {
                color: '#1f2937',
              },
              fontSize: '0.875rem',
              padding: '0.5rem',
              maxWidth: '250px',
              lineHeight: '1.4',
            },
          },
        }}
      >
        <span onClick={handleClick} onMouseEnter={() => window.innerWidth > 768 && setOpen(true)} onMouseLeave={() => window.innerWidth > 768 && setOpen(false)}>
          <InfoOutlinedIcon 
            sx={{ 
              fontSize: '1rem', 
              marginLeft: '4px', 
              color: '#6b7280',
              cursor: 'pointer',
              '&:hover': {
                color: '#4b5563'
              }
            }} 
          />
        </span>
      </Tooltip>
    </div>
  );
};

// Function to format cell values
const formatCellValue = (value) => {
  // If value is a string that's just a hyphen, return '0'
  if (value === '-' || value === ' - ' || value === '—' || value === '— ') {
    return '0';
  }
  // If value is a string that contains a number with a hyphen (like negative numbers), leave it as is
  if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value.trim())) {
    return value.trim();
  }
  // For all other cases, return the value as is or '0' if it's falsy
  return value || '0';
};

// Function to fetch column names from the API
const fetchColumnNames = async () => {
  // Default columns to return if the API call fails
  const defaultColumns = [
    'SYMBOL', 'COMPANY_NAME', 'INDUSTRY', 'MARKET_CAP', 'CURRENT_PRICE',
    'CHANGE', 'CHANGE_PERCENT', 'PE_RATIO', 'DIVIDEND_YIELD', 'SECTOR'
  ];

  try {
    console.log('Fetching stock data to extract columns...');
    
    // Use the working endpoint from Analysis.jsx
    const response = await fetch('https://analytics-advisor-backend-1-583205731005.us-central1.run.app/get_stocks_master', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors'
    });

    if (!response.ok) {
      console.warn('Failed to fetch stock data for columns, using default columns');
      return defaultColumns;
    }

    const data = await response.json();
    
    // If we have an array of stocks, get columns from the first item
    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      const columns = Object.keys(firstItem);
      console.log('Extracted columns from stock data:', columns);
      return columns;
    } 
    // If data is an object with array property
    else if (data && Array.isArray(data.stocks) && data.stocks.length > 0) {
      const firstItem = data.stocks[0];
      const columns = Object.keys(firstItem);
      console.log('Extracted columns from stock data:', columns);
      return columns;
    } 
    // If data is an object with keys as columns
    else if (data && typeof data === 'object') {
      const columns = Object.keys(data);
      console.log('Using object keys as columns:', columns);
      return columns;
    }
    
    console.warn('Unexpected API response format, using default columns');
    return defaultColumns;
    
  } catch (error) {
    console.error('Error in fetchColumnNames:', error);
    return defaultColumns;
  }
};

const NFOMasterReport = ({ reportData, searchTerm, setSearchTerm, currentPage, setCurrentPage, itemsPerPage = 10 }) => {
  const [industryFilter, setIndustryFilter] = useState('');
  const [valuationRatingFilter, setValuationRatingFilter] = useState(null);
  const [financialRatingFilter, setFinancialRatingFilter] = useState(null);
  const [marketCapFilter, setMarketCapFilter] = useState('all'); // 'all', 'lt100', 'lt200', 'lt500', 'gt500'

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Get unique industries for the filter dropdown
  const industries = useMemo(() => {
    if (!reportData || !Array.isArray(reportData)) return [];
    const uniqueIndustries = new Set();
    reportData.forEach(item => {
      if (item.INDUSTRY) uniqueIndustries.add(item.INDUSTRY);
      if (item.SECTOR) uniqueIndustries.add(item.SECTOR);
    });
    return Array.from(uniqueIndustries).sort();
  }, [reportData]);

  // Format rating value with stars (1-5) or 'Not Enough Data to Rate' for 0
  const formatRating = (value) => {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue === 0) {
      return 'Not Enough Data to Rate';
    }
    return '⭐'.repeat(Math.min(5, Math.max(1, Math.round(numValue))));
  };

  // Get formatted column name for display
  const getFormattedColumnName = (column) => {
    return formatColumnName(column).replace(/\s+/g, ' ').trim();
  };

  // Get all columns from the first data item if available
  const allColumns = useMemo(() => {
    if (!reportData || reportData.length === 0) return [];
    return Object.keys(reportData[0]).filter(key => key !== 'key');
  }, [reportData]);

  // Define the exact column order
  const columnOrder = [
    'STOCK_SYMBOL',
    'STOCK_NAME',
    'SECTOR',
    'MARKET_CAP_CR',
    'VALUATION_RATING',
    'FINANCIAL_RATING',
    'PROMOTER_HOLDING',
    'PRICE_BOOK',
    'DIV_YIELD',
    'DEBT',
    'ICR',
    '_52_W_HIGH',
    '_52_W_LOW',
    'LTP',
    'SG_1_YR',
    'SG_3_YR',
    'SG_5_YR',
    'PG_1_YR',
    'PG_3_YR',
    'PG_5_YR',
    'ROE_1_YR',
    'ROE_3_YR',
    'ROE_5_YR',
    'ROCE_1_YR',
    'ROCE_3_YR',
    'ROCE_5_YR',
    'PEG_RATIO'
  ];

  // Get columns in the specified order, filtering out any that don't exist in the data
  const orderedColumns = useMemo(() => {
    // First include all columns in the specified order that exist in the data
    const filteredColumns = columnOrder.filter(column => allColumns.includes(column));
    
    // Then include any remaining columns that weren't in the specified order
    const remainingColumns = allColumns.filter(column => !columnOrder.includes(column));
    
    return [...filteredColumns, ...remainingColumns];
  }, [allColumns]);

  // Format data to replace hyphens with zeros
  const formattedReportData = useMemo(() => {
    if (!reportData || !Array.isArray(reportData) || reportData.length === 0) return [];
    
    return reportData.map(item => {
      const formattedItem = {};
      Object.entries(item).forEach(([key, value]) => {
        formattedItem[key] = formatCellValue(value);
      });
      return formattedItem;
    });
  }, [reportData]);

  // Filter data based on search term, industry, market cap, and rating filters
  const filteredData = useMemo(() => {
    if (!formattedReportData || formattedReportData.length === 0) return [];
    
    return formattedReportData.filter(item => {
      // Skip items that are not objects
      if (typeof item !== 'object' || item === null) return false;

      // Industry filter
      const industryMatch = !industryFilter || 
        (item.INDUSTRY && item.INDUSTRY.toLowerCase() === industryFilter.toLowerCase()) ||
        (item.SECTOR && item.SECTOR.toLowerCase() === industryFilter.toLowerCase());
      
      // Search term filter
      const searchMatch = !searchTerm || 
        Object.entries(item).some(([key, value]) => {
          // Skip certain fields from search if needed
          if (['key', 'id'].includes(key)) return false;
          if (value === undefined || value === null) return false;
          
          const strValue = String(value).trim().toLowerCase();
          const searchLower = searchTerm.toLowerCase();
          return strValue.includes(searchLower);
        });
      
      // Market cap filter
      const marketCap = parseFloat(item.MARKET_CAP_CR || 0);
      let matchesMarketCap = true;
      
      switch(marketCapFilter) {
        case 'lt100':
          matchesMarketCap = marketCap < 100;
          break;
        case 'lt200':
          matchesMarketCap = marketCap < 200;
          break;
        case 'lt500':
          matchesMarketCap = marketCap < 500;
          break;
        case 'gt500':
          matchesMarketCap = marketCap >= 500;
          break;
        case 'all':
        default:
          matchesMarketCap = true;
      }
      
      // Valuation rating filter
      const valuationRating = parseFloat(item.VALUATION_RATING || 0);
      const matchesValuationRating = !valuationRatingFilter || 
        (valuationRating > 0 && Math.round(valuationRating) === valuationRatingFilter);
      
      // Financial rating filter
      const financialRating = parseFloat(item.FINANCIAL_RATING || 0);
      const matchesFinancialRating = !financialRatingFilter || 
        (financialRating > 0 && Math.round(financialRating) === financialRatingFilter);
      
      return industryMatch && searchMatch && matchesMarketCap && 
             matchesValuationRating && matchesFinancialRating;
    });
  }, [formattedReportData, searchTerm, marketCapFilter, industryFilter, valuationRatingFilter, financialRatingFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle industry filter change
  const handleIndustryChange = (e) => {
    const industry = e.target.value;
    setIndustryFilter(industry);
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setIndustryFilter('');
    setValuationRatingFilter(null);
    setFinancialRatingFilter(null);
    setMarketCapFilter('all');
    setCurrentPage(1);
  };

  // Handle rating filter change
  const handleRatingFilterChange = (value, setter) => {
    setter(value === null ? null : value);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
      {/* Add custom styles for table */}
      <style jsx global>{`
        .table-container {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        
        .sticky-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        /* Table header styles */
        .sticky-table th {
          background-color: #f9fafb;
          position: sticky;
          top: 0;
          z-index: 10;
          box-shadow: 0 1px 0 #e5e7eb;
        }
        
        /* Table cell styles */
        .sticky-table th,
        .sticky-table td {
          padding: 0.75rem 1rem;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        
        /* Hover effect for rows */
        .sticky-table tbody tr:hover {
          background-color: #f8fafc;
        }
      `}</style>
      
      {/* Industry and Search Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        {/* Industry Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Industry:</label>
          <select
            value={industryFilter}
            onChange={handleIndustryChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Industries</option>
            {industries.map(industry => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>

        {/* Search Stocks */}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Market Cap:</label>
          <select
            value={marketCapFilter}
            onChange={(e) => {
              setMarketCapFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Market Caps</option>
            <option value="lt100">&lt; 100 Cr</option>
            <option value="lt200">&lt; 200 Cr</option>
            <option value="lt500">&lt; 500 Cr</option>
            <option value="gt500">&gt; 500 Cr</option>
          </select>
        </div>

        {/* Valuation Rating Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valuations:</label>
          <select
            value={valuationRatingFilter || ''}
            onChange={(e) => handleRatingFilterChange(e.target.value ? parseInt(e.target.value) : null, setValuationRatingFilter)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Ratings</option>
            {[1, 2, 3, 4, 5].map(rating => (
              <option key={`val-${rating}`} value={rating}>
                {'⭐'.repeat(rating)} ({rating} star{rating > 1 ? 's' : ''})
              </option>
            ))}
          </select>
        </div>

        {/* Financial Rating Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Financials:</label>
          <select
            value={financialRatingFilter || ''}
            onChange={(e) => handleRatingFilterChange(e.target.value ? parseInt(e.target.value) : null, setFinancialRatingFilter)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Ratings</option>
            {[1, 2, 3, 4, 5].map(rating => (
              <option key={`fin-${rating}`} value={rating}>
                {'⭐'.repeat(rating)} ({rating} star{rating > 1 ? 's' : ''})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stock Table */}
      <div className="mb-6">
        <div className="table-container">
          <table className="sticky-table bg-white shadow-md rounded-lg">
            <thead>
              <tr>
                {orderedColumns.map((column, index) => (
                  <th 
                    key={column}
                    className={`px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider ${
                      index === 0 ? 'sticky-col sticky-header' : 'sticky-header'
                    }`}
                    style={{
                      borderBottom: '1px solid #e5e7eb',
                      minWidth: index === 0 ? '140px' : 'auto',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <ColumnHeaderTooltip 
                      title={getFormattedColumnName(column)} 
                      columnName={column} 
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.map((item, index) => (
                <tr key={item.key || index} className="hover:bg-gray-50">
                  {orderedColumns.map((column, colIndex) => {
                    let value = item[column];
                    let cellClass = 'px-4 py-3 whitespace-nowrap text-sm';
                    
                    // Add sticky class to first column cells
                    if (colIndex === 0) {
                      cellClass += ' sticky-col';
                    }
                    
                    // Format the value based on column type
                    if (column === 'PRICE' || column === 'CURRENT_PRICE' || column === 'LTP') {
                      value = value ? `₹${parseFloat(value).toFixed(2)}` : '-';
                      cellClass += ' text-right';
                    } else if (column === 'MARKET_CAP_CR') {
                      value = value ? `₹${parseFloat(value).toLocaleString()} Cr` : '-';
                      cellClass += ' text-right';
                    } else if (column === 'VALUATION_RATING' || column === 'FINANCIAL_RATING') {
                      value = formatRating(value);
                      cellClass += ' text-center';
                    } else if (column === 'CHANGE' || column === 'CHANGE_PERCENT') {
                      const numValue = parseFloat(value);
                      value = value ? `${numValue.toFixed(2)}%` : '-';
                      cellClass += ` text-right ${numValue >= 0 ? 'text-green-600' : 'text-red-600'}`;
                    } else if (column === 'VOLUME') {
                      value = value ? parseFloat(value).toLocaleString() : '-';
                      cellClass += ' text-right';
                    } else if (column === 'PE_RATIO' || column === 'DIVIDEND_YIELD' || column === 'DIV_YIELD' || column === 'PRICE_BOOK' || column === 'PEG_RATIO') {
                      value = value ? parseFloat(value).toFixed(2) : '-';
                      cellClass += ' text-right';
                    } else if (column === 'PROMOTER_HOLDING' || column.endsWith('_YR') || column.endsWith('_1YR') || column.endsWith('_3YR') || column.endsWith('_5YR')) {
                      value = value ? `${parseFloat(value).toFixed(2)}%` : '-';
                      cellClass += ' text-right';
                    } else {
                      // Default alignment for other columns
                      if (typeof value === 'number' || (typeof value === 'string' && !isNaN(value) && value.trim() !== '')) {
                        cellClass += ' text-right';
                      } else {
                        cellClass += ' text-left';
                      }
                    }

                    return (
                      <td key={`${item.key || index}-${column}`} className={cellClass}>
                        {value || '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end mt-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 border rounded-md text-sm font-medium ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <span className="px-3 py-1">...</span>
              )}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
