/**
 * API service for fetching stock data
 */

// Base URL for the stock API
const STOCK_API_URL = 'https://api.twelvedata.com';

// You should replace this with your actual API key
// Consider storing this in an environment variable
const API_KEY = import.meta.env.VITE_TWELVE_DATA_API_KEY || 'demo';

/**
 * Fetches a list of stocks from the API
 * @returns {Promise<Array>} A promise that resolves to an array of stock objects
 */
export const fetchStocks = async () => {
  try {
    console.log('Fetching stocks from API...');
    // Use the correct endpoint URL
    const response = await fetch('https://analytics-advisor-backend-1-583205731005.us-central1.run.app/get_stocks_list', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors',
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Raw API data:', data);
    
    if (Array.isArray(data)) {
      // Process the array data format
      const processedStocks = data.map(item => {
        if (Array.isArray(item) && item.length >= 2) {
          return {
            symbol: item[0].toString().trim(),
            name: item[1].toString().trim()
          };
        } else if (item && typeof item === 'object' && (item.symbol || item.SYMBOL) && (item.name || item.NAME)) {
          return {
            symbol: (item.symbol || item.SYMBOL).toString().trim(),
            name: (item.name || item.NAME).toString().trim()
          };
        }
        return null;
      }).filter(stock => stock !== null);
      
      console.log('Processed stocks:', processedStocks);
      
      if (processedStocks.length === 0) {
        throw new Error('No valid stocks found in response');
      }
      
      return processedStocks;
    }
    
    throw new Error('Invalid response format: expected an array of stocks');
  } catch (error) {
    console.error('Error fetching stocks:', error);
    throw error;
  }
};

/**
 * Fallback function to return hardcoded stocks in case the API fails
 * @returns {Array} An array of hardcoded stock objects
 */
export const getHardcodedStocks = () => [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'JNJ', name: 'Johnson & Johnson' },
  { symbol: 'WMT', name: 'Walmart Inc.' },
  { symbol: 'MA', name: 'Mastercard Incorporated' },
  { symbol: 'PG', name: 'Procter & Gamble Co.' },
  { symbol: 'UNH', name: 'UnitedHealth Group Incorporated' },
  { symbol: 'HD', name: 'Home Depot Inc.' },
  { symbol: 'BAC', name: 'Bank of America Corporation' },
  { symbol: 'DIS', name: 'Walt Disney Co.' },
  { symbol: 'ADBE', name: 'Adobe Inc.' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'CRM', name: 'Salesforce Inc.' },
];