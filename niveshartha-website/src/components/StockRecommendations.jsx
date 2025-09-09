import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in StockRecommendations:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded m-4">
          <h3 className="font-bold">Something went wrong</h3>
          <p className="text-sm">{this.state.error?.message || 'Unknown error occurred'}</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Retry utility for API calls
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const fetchWithRetry = async (url, options = {}, retries = MAX_RETRIES) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`[Retry ${i + 1}/${retries}] Retrying in ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  throw new Error('Max retries reached');
};

// Track column order for each plan based on first data row
const useColumnOrder = () => {
  const [columnOrder, setColumnOrder] = React.useState({});

  const updateColumnOrder = (plan, data) => {
    if (data && data.length > 0) {
      const firstRow = data[0];
      if (firstRow) {
        // Get column order from the first row of data
        const columns = Object.keys(firstRow);
        console.log(`[${plan}] Detected columns:`, columns);
        
        setColumnOrder(prev => {
          // Only update if columns have changed
          if (JSON.stringify(prev[plan]) !== JSON.stringify(columns)) {
            console.log(`[${plan}] Updating column order to:`, columns);
            return {
              ...prev,
              [plan]: columns
            };
          }
          return prev;
        });
      }
    }
  };

  return { columnOrder, updateColumnOrder };
};

// API Configuration
const API_CONFIG = {
  baseUrl: 'https://analytics-advisor-backend-1-583205731005.us-central1.run.app',
  endpoints: {
    swing_equity: '/get_swingtrading_equity',
    swing_commodity: '/get_swingtrading_commodity',
    equity_investing: '/get_equityinvesting',
    stock_of_month: '/get_stockofthemonth'
  }
};

// Subscription configuration
const SUBSCRIPTION_CONFIG = {
  swing_equity: {
    name: 'Swing Trading - Equity',
    endpoint: API_CONFIG.endpoints.swing_equity,
    color: 'blue',
    columns: [
      { id: 'srNo', label: 'Sr. No', sortable: true },
      { id: 'stock', label: 'Stock', sortable: true },
      { id: 'action', label: 'Action', sortable: true },
      { id: 'entryDate', label: 'Entry Date', sortable: true },
      { id: 'price', label: 'Price', sortable: true },
      { id: 'exitDate', label: 'Exit Date', sortable: true },
      { id: 'target', label: 'Target', sortable: true },
      { id: 'exitPrice', label: 'Exit Price', sortable: true },
      { id: 'stopLoss', label: 'Stop Loss', sortable: true },
      { id: 'pl', label: 'P/L', sortable: true },
      { id: 'update', label: 'Update', sortable: true },
      { id: 'status', label: 'Status', sortable: true }
    ]
  },
  swing_commodity: {
    name: 'Swing Trading - Commodity',
    endpoint: API_CONFIG.endpoints.swing_commodity,
    color: 'green',
    columns: [
      { id: 'srNo', label: 'Sr. No', sortable: true },
      { id: 'commodity', label: 'Commodity', sortable: true },
      { id: 'action', label: 'Action', sortable: true },
      { id: 'entryDate', label: 'Entry Date', sortable: true },
      { id: 'price', label: 'Price', sortable: true },
      { id: 'exitDate', label: 'Exit Date', sortable: true },
      { id: 'target', label: 'Target', sortable: true },
      { id: 'exitPrice', label: 'Exit Price', sortable: true },
      { id: 'stopLoss', label: 'Stop Loss', sortable: true },
      { id: 'pl', label: 'P/L', sortable: true },
      { id: 'margin', label: 'Margin', sortable: true },
      { id: 'update', label: 'Update', sortable: true },
      { id: 'status', label: 'Status', sortable: true }
    ]
  },
  equity_investing: {
    name: 'Equity Investing',
    endpoint: API_CONFIG.endpoints.equity_investing,
    color: 'purple',
    columns: [
      { id: 'srNo', label: 'Sr. No', sortable: true },
      { id: 'stock', label: 'Stock', sortable: true },
      { id: 'entryDate', label: 'Entry Date', sortable: true },
      { id: 'price', label: 'Price', sortable: true },
      { id: 'exitDate', label: 'Exit Date', sortable: true },
      { id: 'target', label: 'Target', sortable: true },
      { id: 'exitPrice', label: 'Exit Price', sortable: true },
      { id: 'stopLoss', label: 'Stop Loss', sortable: true },
      { id: 'pl', label: 'P/L', sortable: true },
      { id: 'update', label: 'Update', sortable: true },
      { id: 'status', label: 'Status', sortable: true }
    ]
  },
  stock_of_month: {
    name: 'Stock of the Month',
    endpoint: API_CONFIG.endpoints.stock_of_month,
    color: 'red',
    columns: [
      { id: 'srNo', label: 'Sr. No', sortable: true },
      { id: 'stock', label: 'Stock', sortable: true },
      { id: 'entryDate', label: 'Entry Date', sortable: true },
      { id: 'price', label: 'Price', sortable: true },
      { id: 'exitDate', label: 'Exit Date', sortable: true },
      { id: 'target', label: 'Target', sortable: true },
      { id: 'exitPrice', label: 'Exit Price', sortable: true },
      { id: 'stopLoss', label: 'Stop Loss', sortable: true },
      { id: 'pl', label: 'P/L', sortable: true },
      { id: 'update', label: 'Update', sortable: true },
      { id: 'status', label: 'Status', sortable: true }
    ]
  }
};

const colorConfig = {
  blue: {
    active: 'bg-white text-blue-700 border-t-2 border-l-2 border-r-2 border-blue-200',
    inactive: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
  },
  green: {
    active: 'bg-white text-green-700 border-t-2 border-l-2 border-r-2 border-green-200',
    inactive: 'bg-green-100 text-green-600 hover:bg-green-200',
  },
  purple: {
    active: 'bg-white text-purple-700 border-t-2 border-l-2 border-r-2 border-purple-200',
    inactive: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
  },
  red: {
    active: 'bg-white text-red-700 border-t-2 border-l-2 border-r-2 border-red-200',
    inactive: 'bg-red-100 text-red-600 hover:bg-red-200',
  },
};

const planSelectorColorConfig = {
  blue: {
    active: 'bg-blue-100 text-blue-700 border-blue-500',
    inactive: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
  },
  green: {
    active: 'bg-green-100 text-green-700 border-green-500',
    inactive: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
  },
  purple: {
    active: 'bg-purple-100 text-purple-700 border-purple-500',
    inactive: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
  },
  red: {
    active: 'bg-red-100 text-red-700 border-red-500',
    inactive: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
  },
};

const planBadgeColorConfig = {
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  purple: 'bg-purple-100 text-purple-800',
  red: 'bg-red-100 text-red-800',
};

const StockRecommendations = ({ currentUser, activeSubscriptions = [] }) => {
  const { columnOrder, updateColumnOrder } = useColumnOrder();
  const navigate = useNavigate();
  const [stocks, setStocks] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('');
  const [kycStatus, setKycStatus] = useState(null);
  const [isCheckingKyc, setIsCheckingKyc] = useState(true);

  // Use the activeSubscriptions prop passed from the parent component
  const activeSubs = React.useMemo(() => {
    // First, check if we have activeSubscriptions from props
    if (activeSubscriptions && activeSubscriptions.length > 0) {
      console.log('Using activeSubscriptions from props:', activeSubscriptions);
      return activeSubscriptions;
    }
    
    // Fallback to checking currentUser.subscriptionData if no activeSubscriptions prop
    if (!currentUser || !currentUser.subscriptionData) {
      console.log('No subscription data available');
      return [];
    }

    const plans = new Set();
    const subsData = currentUser.subscriptionData;
    const subscriptions = Array.isArray(subsData) ? subsData : Object.values(subsData);

    subscriptions.forEach(sub => {
      if (sub && sub.status === 'active' && sub.planId) {
        const normalizedPlanId = sub.planId.replace(/-/g, '_');
        if (SUBSCRIPTION_CONFIG[normalizedPlanId]) {
          plans.add(normalizedPlanId);
        }
      }
    });

    const finalPlans = Array.from(plans);
    console.log('Final active plans from subscription data:', finalPlans);
    return finalPlans;
  }, [currentUser, activeSubscriptions]);

  // Effect to set the initial active tab based on subscriptions
  useEffect(() => {
    if (activeSubs.length > 0) {
      // If activeTab is not set or not in activeSubs, set it to the first available subscription
      if (!activeTab || !activeSubs.includes(activeTab)) {
        console.log('Setting active tab to first available subscription:', activeSubs[0]);
        setActiveTab(activeSubs[0]);
      }
    } else {
      console.log('No active subscriptions found');
      setActiveTab('');
    }
  }, [activeSubs, activeTab]);


  // Check KYC status when component mounts or user changes
  useEffect(() => {
    const checkKycStatus = async () => {
      if (!currentUser) {
        setIsCheckingKyc(false);
        return;
      }
      // For now, we'll assume KYC is always verified to simplify logic.
      // The actual KYC check logic can be re-inserted here later.
      setKycStatus('verified');
      setIsCheckingKyc(false);
    };

    checkKycStatus();
  }, [currentUser]);

  // Test function to fetch and log raw API response
  const testApiEndpoint = async () => {
    try {
      const endpoint = API_CONFIG.baseUrl + API_CONFIG.endpoints.swing_equity;
      console.log('Testing API endpoint:', endpoint);
      
      const response = await fetchWithRetry(endpoint, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit'
      });
      
      const data = await response.json();
      console.log('Raw API Response (test):', JSON.stringify(data, null, 2));
      
      // Log response structure
      if (Array.isArray(data)) {
        console.log('Response is an array with length:', data.length);
        if (data.length > 0) {
          console.log('First item keys:', Object.keys(data[0]));
          console.log('First item values:', data[0]);
        }
      } else if (data && typeof data === 'object') {
        console.log('Response is an object with keys:', Object.keys(data));
        // Check for common data containers
        const possibleKeys = ['data', 'results', 'items', 'stocks', 'recommendations'];
        for (const key of possibleKeys) {
          if (Array.isArray(data[key])) {
            console.log(`Found array in key '${key}' with ${data[key].length} items`);
            if (data[key].length > 0) {
              console.log(`First ${key} item:`, data[key][0]);
            }
          }
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error testing API endpoint:', error);
      return null;
    }
  };

  // Call the test function when component mounts
  useEffect(() => {
    testApiEndpoint();
  }, []);

  // Consolidated effect to fetch data when activeTab or kycStatus changes
  useEffect(() => {
    if (activeTab && kycStatus === 'verified') {
      const alreadyLoaded = stocks[activeTab] && stocks[activeTab].length > 0;
      const isLoading = loading[activeTab];

      console.log(`[Effect] Checking fetch for ${activeTab}: alreadyLoaded=${alreadyLoaded}, isLoading=${isLoading}`);

      if (!alreadyLoaded && !isLoading) {
        console.log(`[Effect] Fetching data for ${activeTab}`);
        fetchSubscriptionData(activeTab);
      }
    }
  }, [activeTab, kycStatus]);

  // Add debug logging
  useEffect(() => {
    console.log('Current User:', currentUser);
    console.log('Active Subscriptions:', activeSubscriptions);
    console.log('Active Tab:', activeTab);
    console.log('Stocks Data:', stocks);
    console.log('Loading States:', loading);
  }, [currentUser, activeSubscriptions, activeTab, stocks, loading]);

  // Handle tab change
  const handleTabChange = (plan) => {
    if (kycStatus !== 'verified') return;
    
    console.log('Tab changed to:', plan); // Debug log
    setActiveTab(plan);
    
    // Fetch data for the selected tab if not already loaded
    if (!stocks[plan] && !loading[plan]) {
      console.log('Fetching data for plan:', plan); // Debug log
      fetchSubscriptionData(plan);
    }
  };

  const fetchSubscriptionData = async (plan) => {
    console.log(`[${plan}] Starting optimized data fetch`);
    setLoading((prev) => ({ ...prev, [plan]: true }));
    setErrors((prev) => ({ ...prev, [plan]: '' }));

    try {
      const endpoint = SUBSCRIPTION_CONFIG[plan]?.endpoint || API_CONFIG.endpoints[plan] || plan;
      const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_CONFIG.baseUrl}${endpoint}`;
      
      console.log(`[${plan}] Fetching data from: ${fullUrl}`);

      // Make the API request with retry logic
      const response = await fetchWithRetry(fullUrl, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit'
      });

      // Parse the response
      const responseText = await response.text();
      console.log(`[${plan}] Raw API Response:`, responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.group(`[${plan}] Response Analysis`);
        console.log('Response Type:', Array.isArray(data) ? 'Array' : 'Object');
        
        if (Array.isArray(data)) {
          console.log(`Array length:`, data.length);
          if (data.length > 0) {
            console.log('First item:', data[0]);
            console.log('First item keys:', Object.keys(data[0]));
          }
        } else if (data && typeof data === 'object') {
          console.log('Top-level keys:', Object.keys(data));
          
          // Check common response structures
          const possibleDataKeys = ['data', 'results', 'items', 'stocks', 'recommendations'];
          for (const key of possibleDataKeys) {
            if (data[key] !== undefined) {
              console.log(`Found data in key: ${key}`, Array.isArray(data[key]) ? 
                `(Array of ${data[key].length} items)` : 
                `(Type: ${typeof data[key]})`);
              
              if (Array.isArray(data[key]) && data[key].length > 0) {
                console.log(`First ${key} item:`, data[key][0]);
                console.log(`${key} item keys:`, Object.keys(data[key][0]));
              }
            }
          }
        }
        console.groupEnd();
        
      } catch (e) {
        console.error(`[${plan}] Error parsing JSON:`, e);
        console.error('Raw response that failed to parse:', responseText);
        throw new Error(`Invalid JSON response: ${e.message}`);
      }

      // Extract the data array from the response
      let stockData = [];
      
      // First, try to find the data array in common response structures
      const possibleDataKeys = ['data', 'results', 'items', 'stocks', 'recommendations'];
      
      if (Array.isArray(data)) {
        stockData = data; // Response is already an array
      } else if (data && typeof data === 'object') {
        // Look for common data container keys
        for (const key of possibleDataKeys) {
          if (data[key] && Array.isArray(data[key])) {
            stockData = data[key];
            console.log(`[${plan}] Found data in key: ${key} (${stockData.length} items)`);
            break;
          }
        }
        
        // If no array found but the object has properties that look like stock data
        if (stockData.length === 0 && Object.keys(data).length > 0) {
          console.log(`[${plan}] No array found in response, treating top-level object as single item`);
          stockData = [data];
        }
      }
      
      console.log(`[${plan}] Extracted ${stockData.length} items for processing`);

      // Log the first item to see its structure
      if (stockData.length > 0) {
        console.log(`[${plan}] First item structure:`, stockData[0]);
        console.log(`[${plan}] First item keys:`, Object.keys(stockData[0]));
      }

      // Log the raw data before processing
      console.log(`[${plan}] Raw stock data before processing:`, stockData);

      // Log the raw data structure for debugging
      console.log(`[${plan}] Raw data structure:`, JSON.stringify(stockData, null, 2));

      // Map the API response to match our column structure
      stockData = stockData.map((item, index) => {
        if (!item || typeof item !== 'object') {
          console.warn(`[${plan}] Invalid item at index ${index}:`, item);
          return null;
        }

        console.log(`[${plan}] Processing item ${index}:`, item);
        
        // Get all available keys from the item
        const itemKeys = Object.keys(item);
        console.log(`[${plan}] Available keys in item:`, itemKeys);

        // Define field mappings for each subscription type
        const fieldMappings = {
          // Stock of the Month mapping
          stock_of_month: {
            'Stock': 'stock',
            'Entry Date': 'entryDate',
            'Exit Date': 'exitDate',
            'Exit Price': 'exitPrice',
            'P/L': 'pl',
            'Recommended BuyPrice': 'price',
            'Sr. No.': 'srNo',
            'Status': 'status',
            'Stop Loss': 'stopLoss',
            'Target Price': 'target',
            'Upate on Recommenation': 'update'
          },
          // Swing Equity mapping
          swing_equity: {
            'Stock': 'stock',
            'Action (Buy / Sell)': 'action',
            'Entry Date': 'entryDate',
            'Exit Date': 'exitDate',
            'Exit Price': 'exitPrice',
            'P/L': 'pl',
            'Recommended Price': 'price',
            'Sr. No.': 'srNo',
            'Status': 'status',
            'Stop Loss': 'stopLoss',
            'Target Price': 'target',
            'Upate on Recommenation': 'update'
          },
          // Swing Commodity mapping
          swing_commodity: {
            'Commodity': 'stock',
            'Action (Buy / Sell)': 'action',
            'Entry Date': 'entryDate',
            'Exit Date': 'exitDate',
            'Exit Price': 'exitPrice',
            'Margin': 'margin',
            'P/L': 'pl',
            'Recommended Price': 'price',
            'Sr. No.': 'srNo',
            'Status': 'status',
            'Stop Loss': 'stopLoss',
            'Target Price': 'target',
            'Upate on Recommenation': 'update'
          },
          // Equity Investing mapping
          equityinvesting: {
            'Stock': 'stock',
            'Entry Date': 'entryDate',
            'Exit Date': 'exitDate',
            'Exit Price': 'exitPrice',
            'P/L': 'pl',
            'Recommended BuyPrice': 'price',
            'Sr. No.': 'srNo',
            'Status': 'status',
            'Stop Loss': 'stopLoss',
            'Target Price': 'target',
            'Upate on Recommenation': 'update'
          },
          // Default mapping (fallback)
          default: {
            'Stock': 'stock',
            'Entry Date': 'entryDate',
            'Exit Date': 'exitDate',
            'Exit Price': 'exitPrice',
            'P/L': 'pl',
            'Price': 'price',
            'Sr. No.': 'srNo',
            'Status': 'status',
            'Stop Loss': 'stopLoss',
            'Target': 'target'
          }
        };

        // Get the appropriate mapping for the current plan
        const fieldMapping = fieldMappings[plan] || fieldMappings.default;

        // Create mapped item with proper field names
        const mappedItem = {};
        for (const [apiField, ourField] of Object.entries(fieldMapping)) {
          mappedItem[ourField] = item[apiField] !== undefined ? item[apiField] : 'N/A';
        }

        // Handle plan-specific fields and data formatting
        if (plan === 'swing_equity' || plan === 'swing_commodity') {
          // Ensure action is properly formatted
          if (mappedItem.action === 'N/A' && item['Action (Buy / Sell)']) {
            mappedItem.action = item['Action (Buy / Sell)'];
          }
          
          // Format numbers to 2 decimal places
          if (mappedItem.price && mappedItem.price !== 'N/A') {
            mappedItem.price = parseFloat(mappedItem.price).toFixed(2);
          }
          if (mappedItem.target && mappedItem.target !== 'N/A') {
            mappedItem.target = parseFloat(mappedItem.target).toFixed(2);
          }
          if (mappedItem.stopLoss && mappedItem.stopLoss !== 'N/A') {
            mappedItem.stopLoss = parseFloat(mappedItem.stopLoss).toFixed(2);
          }
          if (mappedItem.exitPrice && mappedItem.exitPrice !== 'N/A') {
            mappedItem.exitPrice = parseFloat(mappedItem.exitPrice).toFixed(2);
          }
          if (mappedItem.pl && mappedItem.pl !== 'N/A') {
            mappedItem.pl = parseFloat(mappedItem.pl).toFixed(2);
          }
        }
        
        // Special handling for commodity tab
        if (plan === 'swing_commodity') {
          // Use stock name as commodity if commodity is not available
          if ((!mappedItem.commodity || mappedItem.commodity === 'N/A') && mappedItem.stock) {
            mappedItem.commodity = mappedItem.stock;
          }
          
          // Set default margin if not provided
          if (!mappedItem.margin || mappedItem.margin === 'N/A') {
            // Calculate margin as 10% of the price if price is available
            if (mappedItem.price && mappedItem.price !== 'N/A') {
              const price = parseFloat(mappedItem.price);
              mappedItem.margin = (price * 0.10).toFixed(2); // 10% margin
            } else {
              mappedItem.margin = 'N/A';
            }
          }
        }

        console.log(`[${plan}] Mapped item ${index}:`, mappedItem);
        return mappedItem;
      }).filter(Boolean); // Remove any null items

      console.log(`[${plan}] Processed Stock Data:`, stockData);

      if (stockData.length > 0) {
        console.log(`[${plan}] Updating UI with ${stockData.length} items`);
        updateColumnOrder(plan, stockData);
        setStocks((prev) => ({
          ...prev,
          [plan]: stockData,
        }));
      } else {
        console.warn(`[${plan}] No data in the response`);
        setStocks((prev) => ({
          ...prev,
          [plan]: [],
        }));
      }
    } catch (error) {
      console.error(`Error fetching ${plan} stocks:`, error);
      let errorMessage;
      if (error.message.includes('Failed to fetch')) {
        errorMessage =
          'Unable to connect to the server. Please check your internet connection or try again later.';
      } else if (error.message.includes('API Error')) {
        errorMessage = error.message;
      } else {
        errorMessage = `Failed to load ${plan} recommendations: ${error.message}`;
      }

      setErrors((prev) => ({
        ...prev,
        [plan]: errorMessage,
      }));

      setStocks((prev) => ({
        ...prev,
        [plan]: [],
      }));
    } finally {
      setLoading((prev) => ({
        ...prev,
        [plan]: false,
      }));
    }
  };

  const renderTab = (plan) => {
    const config = SUBSCRIPTION_CONFIG[plan] || {};
    const color = config.color || 'blue';
    const isActive = activeTab === plan;
    const colorClasses = colorConfig[color] || colorConfig.blue;
    const classes = `px-4 py-2 text-sm font-medium rounded-t-lg focus:outline-none transition-colors duration-200 ${isActive ? colorClasses.active : colorClasses.inactive}`;

    return (
      <button
        key={plan}
        onClick={() => handleTabChange(plan)}
        className={classes}
      >
        {config.name || plan.replace(/_/g, ' ')}
      </button>
    );
  };

  const renderContent = () => {
    if (!activeTab) {
      console.log('No active tab selected');
      return (
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Loading recommendations...</p>
        </div>
      );
    }
    
    console.log(`[${activeTab}] Current column order:`, columnOrder[activeTab]);
    
    const config = SUBSCRIPTION_CONFIG[activeTab];
    const tabStocks = stocks[activeTab] || [];
    const isLoading = loading[activeTab];
    const error = errors[activeTab];

    // If we don't have a valid config for the active tab, show an error
    if (!config || !config.columns) {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Unable to load recommendations for the selected plan. Please try again or contact support if the issue persists.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-b-lg sm:rounded-tr-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {config.columns.map((column) => (
                  <th 
                    key={column.id} 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tabStocks && tabStocks.length > 0 ? (
                tabStocks.map((stock, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {config.columns.map((column) => {
                      const value = stock[column.id];
                      console.log(`Rendering ${column.id}:`, value, 'from stock:', stock);
                      return (
                        <td 
                          key={column.id} 
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {value !== undefined && value !== null ? value.toString() : 'N/A'}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td 
                    colSpan={config.columns.length} 
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No stock recommendations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };


  // If no active tab is selected but we have subscriptions, set the first one as active
  useEffect(() => {
    if (!activeTab && activeSubs.length > 0) {
      setActiveTab(activeSubs[0]);
    }
  }, [activeTab, activeSubs]);

  // Show loading state while checking KYC status
  if (isCheckingKyc) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const subsToDisplay = activeSubs.length > 0 ? activeSubs : (activeTab ? [activeTab] : []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Stock Recommendations</h1>
        <p className="text-gray-600 mt-2">
          View and analyze stock recommendations across your subscription plans.
        </p>
      </div>

      {subsToDisplay.length > 0 ? (
        <div>
          <div className="flex border-b border-gray-200">
            {subsToDisplay.map(plan => renderTab(plan))}
          </div>
          <div className="mt-0">
            {renderContent()}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No Active Recommendations</h3>
          <p className="mt-1 text-sm text-gray-500">You do not have any active subscription plans with recommendations.</p>
          <button
            onClick={() => navigate('/subscription')}
            className="mt-6 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            View Subscription Plans
          </button>
        </div>
      )}

      {activeTab === 'basic' && (
        <div className="mt-8 rounded-md bg-indigo-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-indigo-800">Upgrade Your Plan</h3>
              <div className="mt-2 text-sm text-indigo-700">
                <p>You're currently viewing basic stock recommendations. Upgrade to access premium features and more detailed analysis.</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => navigate('/subscription')}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  View Plans
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockRecommendations;
