// Shared styles for report components
export const stickyColumnStyles = {
  stickyHeader: {
    position: 'sticky',
    top: 0,
    backgroundColor: '#F9FAFB', // bg-gray-50
    zIndex: 40
  },
  stickyFirstCol: {
    position: 'sticky',
    left: 0,
    backgroundColor: 'white',
    zIndex: 30,
    boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)',
  },
  stickyFirstColHeader: {
    position: 'sticky',
    left: 0,
    top: 0,
    backgroundColor: '#F9FAFB', // bg-gray-50
    zIndex: 50,
    boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)',
  },
  stickySecondCol: {
    position: 'sticky',
    left: '52px', // Adjust based on checkbox width
    backgroundColor: 'white',
    zIndex: 30,
    boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)',
  },
  stickySecondColHeader: {
    position: 'sticky',
    left: '52px', // Adjust based on checkbox width
    top: 0,
    backgroundColor: '#F9FAFB', // bg-gray-50
    zIndex: 40,
    boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)',
  },
  compareMetricCol: {
    position: 'sticky',
    left: 0,
    backgroundColor: 'white',
    zIndex: 30,
    boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)',
  },
  compareMetricHeader: {
    position: 'sticky',
    left: 0,
    top: 0,
    backgroundColor: '#EEF2FF', // bg-indigo-100
    zIndex: 50,
    boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)',
  },
  compareHeader: {
    position: 'sticky',
    top: 0,
    backgroundColor: '#EEF2FF', // bg-indigo-100
    zIndex: 40,
    boxShadow: '0 2px 5px -2px rgba(0,0,0,0.1)',
  },
  selected: {
    backgroundColor: '#EEF2FF', // bg-indigo-50
  },
  tableContainer: {
    position: 'relative',
    maxHeight: 'calc(100vh - 300px)',
    overflowY: 'auto',
    overflowX: 'auto'
  },
  stickyFirstColSelected: {
    position: 'sticky',
    left: 0,
    backgroundColor: '#EEF2FF', // bg-indigo-50 for selected rows
    zIndex: 30,
    boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)',
  },
  stickySecondColSelected: {
    position: 'sticky',
    left: '52px', // Adjust based on checkbox width
    backgroundColor: '#EEF2FF', // bg-indigo-50 for selected rows
    zIndex: 30,
    boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)',
  }
};

// Helper function to format column names for better display
export const formatColumnName = (columnName) => {
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

// Function to sort columns in the desired order
export const getSortedColumns = (visibleColumns) => {
  if (!visibleColumns || Object.keys(visibleColumns).length === 0) {
    return [];
  }
  
  // Priority order for columns - this exact order will be followed
  const columnOrder = [
    // First priority - Stock identifiers
    'STOCK_SYMBOL', 'STOCK', 'Symbol',  
    'STOCK_NAME', 'COMPANY_NAME', 'Name',
    
    // Second priority - Sector/Industry
    'SECTOR', 'INDUSTRY', 'Industry',
    
    // Third priority - Price related
    'PRICE', 'CURRENT_PRICE', 'STOCK_LTP',
    
    // Fourth priority - Market data
    'MARKET_CAP_CR', 'MARKET_CAP', 
    'PE_RATIO', 'PE',
    'CHANGE', 'VOLUME', 
    
    // Fifth priority - Financial metrics
    'DIVIDEND_YIELD', 'REVENUE_GROWTH', 'PROFIT_MARGIN',
    'ROE', 'ROIC', 'DEBT_TO_EQUITY',
    
    // CSP Analysis specific columns
    'StrikePrice', 'Expiry', 'OptionType', 'OPTION_LTP',
    'PREMIUM_AMT', 'TOTAL_MARGIN_AMT', 'roi_pct_margin', 'roi_pct_total',
    'pct_below52_high', 'pct_above52_low', 'wk52_h', 'wk52_l', 'LotSize'
  ];
  
  // Get all columns that are visible
  const allVisibleColumns = Object.entries(visibleColumns)
    .filter(([_, isVisible]) => isVisible)
    .map(([column]) => column);
  
  // First add priority columns in the exact specified order (if they exist and are visible)
  const sortedColumns = columnOrder
    .filter(column => allVisibleColumns.includes(column));
  
  // Then add any remaining visible columns that weren't in the priority list
  allVisibleColumns.forEach(column => {
    if (!sortedColumns.includes(column)) {
      sortedColumns.push(column);
    }
  });
  
  return sortedColumns;
}; 