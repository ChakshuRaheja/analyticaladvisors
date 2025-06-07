import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const IntrinsicValueTool = ({ stockData, isCompact = false }) => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'DiscountToIntrinsic', direction: 'desc' });
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [marketCapRange, setMarketCapRange] = useState({ min: 0, max: Infinity });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Process stock data to calculate intrinsic values 
  const processStockData = (data) => {
    return data.map(stock => {
      // Extract data from the API response
      const symbol = stock.STOCK || stock.Symbol || stock.symbol || '';
      const name = stock.COMPANY_NAME || stock.Name || stock.name || '';
      const industry = stock.SECTOR || stock.Industry || stock.industry || stock.Sector || stock.sector || 'Uncategorized';
      
      // Extract numeric values with fallbacks
      const eps = parseFloat(stock.EPS || stock.EARNINGS_PER_SHARE || 0);
      const growthRate = parseFloat(stock.GROWTH_RATE || stock.Growth || stock.GrowthRate || 10);
      const pe = parseFloat(stock.PE || stock.P_E || stock.PE_RATIO || 0);
      const currentPrice = parseFloat(stock.PRICE || stock.CurrentPrice || stock.Price || 0);
      const marketCap = parseFloat(stock.MARKET_CAP || stock.MarketCap || stock.Market_Cap || 0);
      
      // Risk-free rate (use 7% for India)
      const riskFreeRate = 7.0;
      
      // Calculate intrinsic value using Graham's formula: EPS * (8.5 + 2G) * 4.4 / Y
      const intrinsicValue = eps * (8.5 + 2 * growthRate) * 4.4 / riskFreeRate;
      
      // Calculate discount to intrinsic value
      const discountToIntrinsic = intrinsicValue > 0 
        ? ((intrinsicValue - currentPrice) / intrinsicValue) * 100 
        : 0;
      
      return {
        Symbol: symbol,
        Name: name,
        Industry: industry,
        EPS: eps.toFixed(2),
        GrowthRate: growthRate.toFixed(1) + '%',
        PE: pe.toFixed(2),
        CurrentPrice: currentPrice.toFixed(2),
        IntrinsicValue: intrinsicValue.toFixed(2),
        DiscountToIntrinsic: discountToIntrinsic.toFixed(2) + '%',
        MarketCap: marketCap,
        MarketCapFormatted: formatMarketCap(marketCap),
        MarginOfSafety: getMarginOfSafetyText(discountToIntrinsic),
        Recommendation: getRecommendationText(discountToIntrinsic)
      };
    });
  };

  // If stockData is provided, use it
  useEffect(() => {
    const processData = async () => {
      setLoading(true);
      try {
        if (stockData && stockData.length > 0) {
          setStocks(processStockData(stockData));
        } else {
          setStocks([]);
          setError("No stock data available");
        }
      } catch (err) {
        console.error("Error processing stock data:", err);
        setError("Failed to process stock data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    processData();
  }, [stockData]);

  // Format market cap for display
  const formatMarketCap = (marketCap) => {
    if (!marketCap) return 'N/A';
    if (marketCap >= 1000000) return `₹${(marketCap / 1000000).toFixed(2)}M`;
    if (marketCap >= 1000) return `₹${(marketCap / 1000).toFixed(2)}K`;
    return `₹${marketCap.toFixed(2)}`;
  };

  // Get margin of safety text based on discount
  const getMarginOfSafetyText = (discount) => {
    if (discount >= 50) return 'Very High';
    if (discount >= 30) return 'High';
    if (discount >= 15) return 'Moderate';
    if (discount >= 0) return 'Low';
    return 'None';
  };

  // Get recommendation based on discount
  const getRecommendationText = (discount) => {
    if (discount >= 50) return 'Strong Buy';
    if (discount >= 30) return 'Buy';
    if (discount >= 15) return 'Accumulate';
    if (discount >= 0) return 'Hold';
    if (discount >= -15) return 'Reduce';
    return 'Sell';
  };

  // Get color based on recommendation
  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'Strong Buy': return 'bg-green-600 text-white';
      case 'Buy': return 'bg-green-500 text-white';
      case 'Accumulate': return 'bg-green-400 text-white';
      case 'Hold': return 'bg-yellow-500 text-white';
      case 'Reduce': return 'bg-red-400 text-white';
      case 'Sell': return 'bg-red-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Handle sort when a column header is clicked
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle stock selection
  const toggleStockSelection = (symbol) => {
    if (selectedStocks.includes(symbol)) {
      setSelectedStocks(selectedStocks.filter(s => s !== symbol));
    } else {
      setSelectedStocks([...selectedStocks, symbol]);
    }
  };

  // Handle market cap range change
  const handleMarketCapRangeChange = (min, max) => {
    setMarketCapRange({ min, max });
    setCurrentPage(1); // Reset to first page
  };

  // Get sorted and filtered stocks
  const getSortedStocks = () => {
    let sortableStocks = [...stocks];
    
    // Filter by search term
    if (searchTerm) {
      sortableStocks = sortableStocks.filter(stock => 
        stock.Symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.Industry.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by selected industry
    if (selectedIndustry !== 'all') {
      sortableStocks = sortableStocks.filter(stock => 
        stock.Industry === selectedIndustry
      );
    }

    // Filter by selected stocks
    if (selectedStocks.length > 0) {
      sortableStocks = sortableStocks.filter(stock => 
        selectedStocks.includes(stock.Symbol)
      );
    }

    // Filter by market cap range
    sortableStocks = sortableStocks.filter(stock => 
      stock.MarketCap >= marketCapRange.min && stock.MarketCap <= marketCapRange.max
    );

    // Sort the stocks
    if (sortConfig.key) {
      sortableStocks.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle percentage string values
        if (typeof aValue === 'string' && aValue.includes('%')) {
          aValue = parseFloat(aValue.replace('%', ''));
          bValue = parseFloat(bValue.replace('%', ''));
        } 
        // Handle numeric string values
        else if (!isNaN(parseFloat(aValue))) {
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableStocks;
  };

  // Get unique industries for filter dropdown
  const getIndustries = () => {
    const industries = [...new Set(stocks.map(stock => stock.Industry))];
    return industries.sort();
  };

  // Market cap ranges
  const marketCapRanges = [
    { label: 'All', min: 0, max: Infinity },
    { label: 'Small Cap (< ₹5,000 Cr)', min: 0, max: 50000000000 },
    { label: 'Mid Cap (₹5,000 - ₹20,000 Cr)', min: 50000000000, max: 200000000000 },
    { label: 'Large Cap (> ₹20,000 Cr)', min: 200000000000, max: Infinity }
  ];

  // Pagination logic
  const sortedStocks = getSortedStocks();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStocks = sortedStocks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedStocks.length / itemsPerPage);

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxPagesToShow = 5;
    
    // Previous button
    buttons.push(
      <button 
        key="prev" 
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-50'}`}
      >
        &laquo;
      </button>
    );
    
    // Page number buttons
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded ${currentPage === i ? 'bg-indigo-600 text-white' : 'text-indigo-600 hover:bg-indigo-50'}`}
        >
          {i}
        </button>
      );
    }
    
    // Next button
    buttons.push(
      <button 
        key="next" 
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages || totalPages === 0}
        className={`px-3 py-1 rounded ${currentPage === totalPages || totalPages === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-50'}`}
      >
        &raquo;
      </button>
    );
    
    return buttons;
  };

  // Render sort indicator
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <span className="text-gray-300">⇅</span>;
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
      <h2 className={`${isCompact ? 'text-xl' : 'text-2xl'} font-bold mb-4 text-gray-800`}>Intrinsic Value Analysis</h2>
      
      {!isCompact && (
        <div className="mb-4 text-gray-600 text-sm">
          <p>This tool evaluates stocks based on Benjamin Graham's intrinsic value formula.</p>
        </div>
      )}
      
      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {/* Industry Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Industry:</label>
          <select
            value={selectedIndustry}
            onChange={(e) => {
              setSelectedIndustry(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Industries</option>
            {getIndustries().map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>
        
        {/* Stock Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Stocks:</label>
          <input
            type="text"
            placeholder="Search by symbol or name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        
        {/* Market Cap Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Market Capitalization:</label>
          <select
            onChange={(e) => {
              const range = marketCapRanges[parseInt(e.target.value)];
              handleMarketCapRangeChange(range.min, range.max);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {marketCapRanges.map((range, index) => (
              <option key={index} value={index}>{range.label}</option>
            ))}
          </select>
        </div>
        
        {/* Selected Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Selected Capital Range:</label>
          <div className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50">
            {marketCapRange.min === 0 && marketCapRange.max === Infinity ? 
              'All Market Caps' : 
              `${formatMarketCap(marketCapRange.min)} - ${marketCapRange.max === Infinity ? '∞' : formatMarketCap(marketCapRange.max)}`
            }
          </div>
        </div>
      </div>
      
      {/* Selected Stocks Display */}
      {selectedStocks.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Selected Stocks ({selectedStocks.length}):</label>
          <div className="flex flex-wrap gap-2">
            {selectedStocks.map(symbol => (
              <span 
                key={symbol}
                onClick={() => toggleStockSelection(symbol)}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800 cursor-pointer"
              >
                {symbol} <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            ))}
            <button 
              onClick={() => setSelectedStocks([])}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 cursor-pointer"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
      
      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Select</th>
              <th 
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                onClick={() => handleSort('Symbol')}
              >
                Symbol {renderSortIcon('Symbol')}
              </th>
              <th 
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                onClick={() => handleSort('Industry')}
              >
                Industry {renderSortIcon('Industry')}
              </th>
              <th 
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                onClick={() => handleSort('CurrentPrice')}
              >
                Price {renderSortIcon('CurrentPrice')}
              </th>
              <th 
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                onClick={() => handleSort('IntrinsicValue')}
              >
                Intrinsic {renderSortIcon('IntrinsicValue')}
              </th>
              <th 
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                onClick={() => handleSort('DiscountToIntrinsic')}
              >
                Discount {renderSortIcon('DiscountToIntrinsic')}
              </th>
              <th 
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                onClick={() => handleSort('MarketCap')}
              >
                Market Cap {renderSortIcon('MarketCap')}
              </th>
              <th 
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                onClick={() => handleSort('Recommendation')}
              >
                Rating {renderSortIcon('Recommendation')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {currentStocks.length > 0 ? (
              currentStocks.map((stock) => (
                <tr key={stock.Symbol} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <input 
                      type="checkbox"
                      checked={selectedStocks.includes(stock.Symbol)}
                      onChange={() => toggleStockSelection(stock.Symbol)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-indigo-600">{stock.Symbol}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{stock.Industry}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">₹{stock.CurrentPrice}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">₹{stock.IntrinsicValue}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <span className={parseFloat(stock.DiscountToIntrinsic) >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {stock.DiscountToIntrinsic}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{stock.MarketCapFormatted}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRecommendationColor(stock.Recommendation)}`}>
                      {stock.Recommendation}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-3 py-6 text-center text-sm text-gray-500">
                  No stocks match your filtering criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-1 mt-4">
          {renderPaginationButtons()}
        </div>
      )}
      
      {/* Recommendation Legend */}
      <div className="mt-4 text-xs text-gray-500 flex flex-wrap gap-2">
        <span className="px-2 py-1 rounded bg-green-600 text-white">Strong Buy</span>
        <span className="px-2 py-1 rounded bg-green-500 text-white">Buy</span>
        <span className="px-2 py-1 rounded bg-green-400 text-white">Accumulate</span>
        <span className="px-2 py-1 rounded bg-yellow-500 text-white">Hold</span>
        <span className="px-2 py-1 rounded bg-red-400 text-white">Reduce</span>
        <span className="px-2 py-1 rounded bg-red-600 text-white">Sell</span>
      </div>
    </div>
  );
};

export default IntrinsicValueTool; 