import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import axios from 'axios';

// Remove duplicate imports and initialization
const PortfolioReview = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [selectedSector, setSelectedSector] = useState('all');
  const [sectors, setSectors] = useState([]);
  const [stockPrices, setStockPrices] = useState({});
  const [currentStock, setCurrentStock] = useState(null);
  const [currentPrice, setCurrentPrice] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [lastSubmissionDate, setLastSubmissionDate] = useState(null);
  const [daysUntilNextSubmission, setDaysUntilNextSubmission] = useState(0);
  const [renderError, setRenderError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmittedBefore, setHasSubmittedBefore] = useState(false);
  const [previousSubmission, setPreviousSubmission] = useState(null);
  const [portfolioResults, setPortfolioResults] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const debugMode = true; // Set to true to enable additional logging

  // Debug Firestore
  console.log("Firestore db initialized:", !!db);

  // Fetch portfolio results by review ID
  const fetchPortfolioResultsByReviewId = async (reviewId) => {
    if (!reviewId) {
      console.warn("No review ID provided for fetching results");
      return null;
    }

    setLoadingResults(true);
    try {
      console.log("Fetching portfolio results for review ID:", reviewId);
      
      const response = await fetch(
        `https://analytics-advisor-backend-1-583205731005.us-central1.run.app/get_portfolio_review_results?review_id="${reviewId}"`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        console.warn(`API returned ${response.status} for portfolio results`);
        return null;
      }

      const data = await response.json();
      console.log("Portfolio results received:", data);

      // Handle both possible responses: [] or array with results
      if (Array.isArray(data)) {
        // Filter results - using RESULT field instead of RECOMMENDATION
        const processedResults = data.filter(result => 
          result.RESULT && 
          result.RESULT.trim() !== '' &&
          result.RESULT.toLowerCase() !== 'pending'
        );

        if (processedResults.length > 0) {
          setPortfolioResults(processedResults);
          return processedResults;
        } else {
          console.log("No results available yet for this review");
          setPortfolioResults(null);
          return null;
        }
      }

      return null;
    } catch (error) {
      console.error("Error fetching portfolio results:", error);
      return null;
    } finally {
      setLoadingResults(false);
    }
  };

  // Function to check if user has already submitted a portfolio review
  const checkPreviousSubmission = async (userId) => {
    console.log("Checking previous submissions for user:", userId);
    
    if (!firestoreAvailable || !db) {
      console.warn("Firestore not available for checking previous submissions");
      return;
    }
    
    try {
      console.log("Attempting to fetch document from Firestore");
      
      // Try both collections
      let docSnap = null;
      let data = null;
      let docRef = null;
      let collectionName = "";
      
      try {
        // First try the newer collection
        docRef = doc(db, "userPortfolios", userId);
        docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          console.log("Found submission in userPortfolios collection");
          data = docSnap.data();
          collectionName = "userPortfolios";
        }
      } catch (err) {
        console.warn("Error checking userPortfolios collection:", err);
      }
      
      // If not found in first collection, try the original
      if (!docSnap || !docSnap.exists()) {
        try {
          docRef = doc(db, "portfolioReviews", userId);
          docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            console.log("Found submission in portfolioReviews collection");
            data = docSnap.data();
            collectionName = "portfolioReviews";
          } else {
            console.log("No submission found in any collection");
          }
        } catch (err) {
          console.warn("Error checking portfolioReviews collection:", err);
          // If both collections fail, we'll just proceed without previous submission info
        }
      }
      
      if (data) {
        console.log("Previous submission found:", data);
        
        // Handle different date formats (Firestore Timestamp or regular Date)
        let submissionDate;
        if (data.submissionDate) {
          submissionDate = data.submissionDate instanceof Timestamp 
            ? data.submissionDate.toDate() 
            : new Date(data.submissionDate);
        } else if (data.lastSubmitted) {
          submissionDate = data.lastSubmitted instanceof Timestamp 
            ? data.lastSubmitted.toDate() 
            : new Date(data.lastSubmitted);
        } else {
          submissionDate = new Date(); // Fallback
          console.warn("No submission date found in document, using current date");
        }
        
        console.log("Submission date:", submissionDate);
        
        // Calculate if submission is within last 90 days
        const daysSinceSubmission = Math.floor((new Date() - submissionDate) / (1000 * 60 * 60 * 24));
        const daysUntilNextAllowed = Math.max(0, 90 - daysSinceSubmission);
        
        console.log("Days since last submission:", daysSinceSubmission);
        console.log("Days until next submission allowed:", daysUntilNextAllowed);
        
        // Check if portfolio review is enabled or has stocks
        const portfolioReviewEnabled = data.portfolioReviewEnabled === true;
        const hasStocks = (data.stocks && data.stocks.length > 0);
        
        // If 90 days have passed, update the portfolioReviewEnabled flag to false
        if ((portfolioReviewEnabled || hasStocks) && daysUntilNextAllowed <= 0) {
          console.log("90 days have passed since last submission, updating portfolioReviewEnabled to false");
          try {
            // Update the document to set portfolioReviewEnabled to false
            await setDoc(docRef, { 
              portfolioReviewEnabled: false 
            }, { merge: true });
            console.log(`Successfully updated portfolioReviewEnabled to false in ${collectionName}`);
            
            // Since we updated the flag, set it to false in the local state too
            setHasSubmittedBefore(false);
            setPreviousSubmission(null);
            setDaysUntilNextSubmission(0);
            return; // Return early since we've already set the state
          } catch (updateError) {
            console.error("Error updating portfolioReviewEnabled flag:", updateError);
            // Continue with the function even if update fails
          }
        }

        if (data.reviewId) {
          await fetchPortfolioResultsByReviewId(data.reviewId);
          console.log(`data fetched with reviewId ${data.reviewId}`)
        }
        
        //If within 90 days, show "already submitted" screen
        if (portfolioReviewEnabled || hasStocks) {
          setHasSubmittedBefore(true);
          setPreviousSubmission({
            date: submissionDate,
            // For backward compatibility, use stocks if they exist, otherwise empty array
            stocks: data.stocks || []
          });
          setDaysUntilNextSubmission(daysUntilNextAllowed);
          // if (data.reviewId) {
          //   // fetch results for portfolio review
          //   await fetchPortfolioResultsByReviewId(data.reviewId);
          //   console.log(`data fetched with reviewId ${data.reviewId}`)
          // }
        } else {
          setHasSubmittedBefore(false);
          setPreviousSubmission(null);
          setDaysUntilNextSubmission(0);
        }
      } else {
        console.log("No previous submission found for user");
        
        setHasSubmittedBefore(false);
        setPreviousSubmission(null);
        setDaysUntilNextSubmission(0);
      }
    } catch (error) {
      console.error("Error checking previous submission:", error);
      
      if (error.code === 'permission-denied') {
        console.error("This is a Firebase permissions issue. Please check your Firebase security rules.");
      }
      
      setHasSubmittedBefore(false);
      setPreviousSubmission(null);
      setDaysUntilNextSubmission(0);
    }
  };

  // Hardcoded stocks data as fallback
  const hardcodedStocks = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Energy', marketCap: '₹2.45T', price: '₹2,450', change: '2.3%' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'Technology', marketCap: '₹1.98T', price: '₹3,250', change: '1.5%' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Banking', marketCap: '₹1.76T', price: '₹1,650', change: '-0.8%' },
    { symbol: 'INFY', name: 'Infosys', sector: 'Technology', marketCap: '₹1.45T', price: '₹1,780', change: '0.7%' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank', sector: 'Banking', marketCap: '₹1.23T', price: '₹890', change: '1.2%' },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', sector: 'Consumer Goods', marketCap: '₹1.10T', price: '₹2,560', change: '-0.5%' },
    { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking', marketCap: '₹0.95T', price: '₹420', change: '0.9%' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel', sector: 'Telecommunications', marketCap: '₹0.87T', price: '₹750', change: '1.1%' },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'Banking', marketCap: '₹0.85T', price: '₹1,920', change: '-0.3%' },
    { symbol: 'ITC', name: 'ITC Limited', sector: 'Consumer Goods', marketCap: '₹0.82T', price: '₹240', change: '0.4%' },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance', sector: 'Financial Services', marketCap: '₹0.78T', price: '₹6,750', change: '2.1%' },
    { symbol: 'WIPRO', name: 'Wipro Limited', sector: 'Technology', marketCap: '₹0.75T', price: '₹450', change: '0.2%' },
    { symbol: 'AXISBANK', name: 'Axis Bank', sector: 'Banking', marketCap: '₹0.72T', price: '₹780', change: '1.6%' },
    { symbol: 'ADANIPORTS', name: 'Adani Ports', sector: 'Infrastructure', marketCap: '₹0.70T', price: '₹840', change: '-1.2%' },
    { symbol: 'LT', name: 'Larsen & Toubro', sector: 'Engineering', marketCap: '₹0.68T', price: '₹1,650', change: '0.6%' }
  ];

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Check for previous submission
    const checkSubmission = async () => {
      try {
        await checkPreviousSubmission(currentUser.uid);
      } catch (err) {
        console.error("Error checking previous submissions:", err);
        // Don't let the error block rendering
      }
    };
    
    // Wrap in try-catch to catch any errors
    try {
      checkSubmission();
    } catch (err) {
      console.error("Failed to check submission status:", err);
    }

    const fetchStocks = async () => {
      // Skip if component is unmounting or no user
      if (!currentUser) {
        console.log('Skipping stocks fetch - no user');
        return;
      }
      
      // Set loading state and clear any previous errors
      setLoading(true);
      setError(null);
      
      // Create abort controller for request cancellation
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(new Error('Request timed out after 10 seconds')), 
        10000
      );
      
      try {
        console.log('Fetching stocks from API...');
        
        // Make the API request with minimal headers to avoid CORS preflight
        const apiUrl = 'https://analytics-advisor-backend-1-583205731005.us-central1.run.app/get_stocks_list';
        console.log('Making request to:', apiUrl);
        
        // Try with minimal headers first
        const response = await fetch(apiUrl, {
          method: 'GET',
          // Don't set Content-Type for GET requests to avoid preflight
          headers: {
            'Accept': 'application/json'
          },
          // Don't set mode: 'cors' as it's the default
          signal: controller.signal
        }).catch(err => {
          console.error('Fetch error:', err);
          throw new Error(`Failed to fetch stocks: ${err.message}`);
        });
        
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);
        
        // Handle non-2xx responses
        if (!response.ok) {
          let errorMessage = `API error: ${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // If we can't parse the error response, use the status text
            console.warn('Could not parse error response:', e);
          }
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        // console.log('API Response:', data);
        // console.log('API Response:', data);
        
        // Handle different response formats
        let stocksArray;
        if (Array.isArray(data)) {
          stocksArray = data;
        } else if (data.stocks && Array.isArray(data.stocks)) {
          stocksArray = data.stocks;
        } else if (typeof data === 'object') {
          stocksArray = Object.values(data);
        } else {
          throw new Error('Unexpected API response format');
        }
        
        if (!stocksArray.length) {
          throw new Error('No stocks data received from API');
        }
        
        // Process the stocks data to ensure consistent format
        const processedStocks = stocksArray.map(stock => {
          // Handle different property formats (lowercase/uppercase)
          const symbol = stock.symbol || stock.Symbol || '';
          const name = stock.name || stock.Name || symbol;
          const sector = stock.sector || stock.Sector || 'Unknown';
          const marketCap = stock.marketCap || stock.MarketCap || 'N/A';
          const price = stock.price || stock.Price || 'N/A';
          const change = stock.change || stock.Change || '0%';
          
          return { symbol, name, sector, marketCap, price, change };
        }).filter(stock => !!stock.symbol); // Filter out any entries without a symbol
        
        setStocks(processedStocks);
        setFilteredStocks(processedStocks);
        
        // Extract unique sectors
        const uniqueSectors = [...new Set(processedStocks.map(stock => stock.sector))];
        setSectors(uniqueSectors);
      } catch (error) {
        console.error('Error fetching stocks from API:', error);
        setError(`API Error: ${error.message}. Using built-in stocks data instead.`);
        
        // Use hardcoded data as fallback
        setStocks(hardcodedStocks);
        setFilteredStocks(hardcodedStocks);
        const uniqueSectors = [...new Set(hardcodedStocks.map(stock => stock.sector))];
        setSectors(uniqueSectors);
        
        // Auto-dismiss error after 5 seconds
        setTimeout(() => setError(null), 5000);
      } finally {
        setLoading(false);
      }
    };

    // Wrap in try-catch to catch any errors
    try {
      fetchStocks();
    } catch (err) {
      console.error("Fatal error in fetchStocks:", err);
      setLoading(false);
      setError("Failed to load stocks data. Please try refreshing the page.");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    let filtered = [...stocks];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(stock => 
        stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sector filter
    if (selectedSector !== 'all') {
      filtered = filtered.filter(stock => stock.sector === selectedSector);
    }

    setFilteredStocks(filtered);
  }, [stocks, searchTerm, selectedSector]);

  const handleAddStock = () => {
    if (!currentStock) return;
    
    const stockToAdd = stocks.find(s => s.symbol === currentStock);
    if (!stockToAdd) return;
    
    const userPrice = currentPrice ? parseFloat(currentPrice) : null;
    
    // Require purchase price
    if (!userPrice) {
      setError("Please enter a purchase price before adding a stock");
      return;
    }
    
    setSelectedStocks(prev => {
      // If stock already exists, don't add it again
      if (prev.find(s => s.symbol === stockToAdd.symbol)) {
        return prev;
      }
      return [...prev, stockToAdd];
    });
    
    // Store price as string to match API expectations
    setStockPrices(prev => ({
      ...prev,
      [stockToAdd.symbol]: userPrice.toString()
    }));
    
    // Reset form
    setCurrentStock(null);
    setCurrentPrice('');
    setSearchTerm('');
    setShowDropdown(false);
    setError(null); // Clear any error messages
  };

  const handleUpdatePrice = (symbol, price) => {
    if (price === '' || isNaN(parseFloat(price))) {
      // Remove price if empty or invalid
      setStockPrices(prev => {
        const newPrices = {...prev};
        delete newPrices[symbol];
        return newPrices;
      });
    } else {
      // Store price as string to match API expectations
      setStockPrices(prev => ({
        ...prev,
        [symbol]: parseFloat(price).toString()
      }));
    }
  };

  // Handle removing a stock from the review list
  const handleRemoveStock = (symbol) => {
    setSelectedStocks(prev => prev.filter(stock => stock.symbol !== symbol));
    
    // Also remove the price if it exists
    setStockPrices(prev => {
      const newPrices = {...prev};
      delete newPrices[symbol];
      return newPrices;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!selectedStocks.length) {
        setSubmitting(false);
        setError('Please select at least one stock');
        return;
      }

      if (!currentUser) {
        setSubmitting(false);
        setError('You must be logged in to submit');
        return;
      }
      
      // Validate all stocks have prices
      const missingPrices = selectedStocks.filter(stock => 
        !stockPrices[stock.symbol] || stockPrices[stock.symbol] === '' || stockPrices[stock.symbol] === '0'
      );
      
      if (missingPrices.length > 0) {
        setSubmitting(false);
        setError(`Please enter purchase prices for: ${missingPrices.map(s => s.symbol).join(', ')}`);
        return;
      }
      
      // Prepare email notification
      const emailSubject = `New Portfolio Review Submission - ${currentUser.email || 'User'}`;
      const emailBody = `
        User: ${currentUser.email || 'Not provided'}
        Submission Date: ${new Date().toLocaleString()}
        
        Selected Stocks:
        ${selectedStocks.map(stock => 
          `- ${stock.symbol} (${stock.name}): ${stockPrices[stock.symbol] || '0'} INR`
        ).join('\n')}
      `;
      
      // Log important data at the start of submission
      console.log("Starting submission for user:", currentUser.uid);
      console.log("Selected stocks:", selectedStocks);

      // Add this inside handleSubmit, before making the API call
      if (debugMode) {
        console.log('DEBUG MODE: Check actual network requests in Network tab');
        console.log('Current user:', currentUser);
        console.log('Selected stocks with prices:', selectedStocks.map(stock => ({
          ...stock,
          price: stockPrices[stock.symbol] || 'Not set'
        })));
      }

      // API submission remains unchanged
      try {
        // Prepare payload in the correct format for the backend
        const today = new Date().toISOString().split('T')[0];
        const reviewId = Date.now().toString() + currentUser.email;
        const formattedRecords = selectedStocks.map(stock => ({
          REVIEW_ID: reviewId,
          STOCK_NAME: stock.symbol,
          CUSTOMER_EMAIL: currentUser.email,
          BUYING_PRICE: (stockPrices[stock.symbol] || 0).toString(),
          SUBMITTED_DATE: today
        }));
        
        const payload = {
          records: formattedRecords
        };
        
        console.log('Submitting portfolio with payload:', JSON.stringify(payload, null, 2));
        
        // Make the actual API call to the backend
        const response = await fetch('https://analytics-advisor-backend-1-583205731005.us-central1.run.app/post_portfolio_review', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Origin': window.location.origin,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type, Accept',
          },
          mode: 'cors', // Try with explicit CORS mode
          body: JSON.stringify(payload),
        });
        
        console.log('Response status:', response.status);
        
        // Try to log the response for debugging
        let responseText = '';
        try {
          responseText = await response.text();
          console.log('Response text:', responseText);
          
          // If it's JSON, parse it
          if (responseText && responseText.trim().startsWith('{')) {
            const data = JSON.parse(responseText);
            console.log('Response data:', data);
          }
        } catch (textError) {
          console.error('Error reading response:', textError);
        }
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} - ${responseText || 'No response details'}`);
        }
        
        // Firestore submission is wrapped in a separate try/catch so API errors don't mix with Firestore errors
        try {
          if (firestoreAvailable && db) {
            console.log("Attempting to save to Firestore with db:", db);
            console.log("User auth state:", currentUser ? "Logged in" : "Not logged in");
            console.log("User ID being used:", currentUser.uid);
            
            // Make sure user is properly authenticated before trying to write
            if (!currentUser || !currentUser.uid) {
              console.warn("Cannot save to Firestore: User not properly authenticated");
              throw new Error("User not properly authenticated");
            }
            
            // Create simplified data for Firestore - just email and flag
            const portfolioData = {
              userId: currentUser.uid,
              email: currentUser.email || '',
              reviewId: reviewId,
              portfolioReviewEnabled: true, // Boolean flag indicating portfolio review is enabled
              submissionDate: new Date(), // Keep track of when they submitted
            };
            
            console.log("Saving simplified portfolio data to Firestore:", portfolioData);
            
            try {
              // Try saving to a different collection that might have better permissions
              const userDoc = doc(db, "userPortfolios", currentUser.uid);
              await setDoc(userDoc, portfolioData, { merge: true });
              console.log("Successfully saved to userPortfolios collection");
            } catch (collectionError) {
              console.error("Error saving to userPortfolios:", collectionError);
              
              // Fallback to original collection
              const userDoc = doc(db, "portfolioReviews", currentUser.uid);
              await setDoc(userDoc, portfolioData, { merge: true });
              console.log("Successfully saved to portfolioReviews collection");
            }
            
            // Set submission status
            setHasSubmittedBefore(true);
            setPreviousSubmission({
              date: new Date(),
              stocks: selectedStocks
            });
          } else {
            console.warn("Firestore not available, skipping Firestore save");
          }
        } catch (firestoreErr) {
          // Log Firestore errors but don't fail the submission process
          console.error("Firestore save failed:", firestoreErr);
          
          if (firestoreErr.code === 'permission-denied') {
            console.error("This is a Firebase permissions issue. Please check your Firebase security rules.");
          }
          
          console.warn("Continuing with submission despite Firestore error");
          
          // Set submission status even if Firestore fails - the API submission was successful
          setHasSubmittedBefore(true);
          setPreviousSubmission({
            date: new Date(),
            stocks: selectedStocks
          });
        }
        
        // Send email notification
        try {
          const formData = new FormData();
          formData.append('_subject', emailSubject);
          formData.append('_template', 'table');
          formData.append('_autoresponse', 'Thank you for submitting your portfolio review. We will analyze it and get back to you soon.');
          formData.append('email', 'analyticaladvisors@gmail.com');
          formData.append('message', emailBody);
          
          await fetch('https://formsubmit.co/ajax/analyticaladvisors@gmail.com', {
            method: 'POST',
            body: formData,
            headers: {
              'Accept': 'application/json'
            }
          });
          
          console.log('Email notification sent successfully');
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
          // Don't fail the submission if email fails
        }
        
        // Show success state
        setSubmitting(false);
        setSuccess(true);
        
      } catch (apiErr) {
        console.error('API submission error:', apiErr);
        
        // Try with a simpler payload format as fallback
        try {
          console.log('Trying alternative API format...');
          
          const today = new Date().toISOString().split('T')[0];
          const reviewId = Date.now().toString();

          const simplePayload = {
            records: selectedStocks.map(stock => ({
              REVIEW_ID: reviewId,
              STOCK_NAME: stock.symbol,
              CUSTOMER_EMAIL: currentUser.email,
              BUYING_PRICE: (stockPrices[stock.symbol] || 0).toString(),
              SUBMITTED_DATE: today
          }))};
          
          console.log('Alternative payload:', JSON.stringify(simplePayload, null, 2));
          
          const fallbackResponse = await fetch('https://analytics-advisor-backend-1-583205731005.us-central1.run.app/post_portfolio_review', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Origin': window.location.origin,
              'Access-Control-Request-Method': 'POST',
              'Access-Control-Request-Headers': 'Content-Type, Accept',
            },
            mode: 'cors',
            body: JSON.stringify(simplePayload),
          });
          
          console.log('Fallback response status:', fallbackResponse.status);
          
          if (fallbackResponse.ok) {
            console.log('Fallback request successful');
            setSubmitting(false);
            setSuccess(true);
            return;
          } else {
            // Log the fallback response
            try {
              const fallbackText = await fallbackResponse.text();
              console.log('Fallback response text:', fallbackText);
            } catch (e) {
              console.error('Error reading fallback response:', e);
            }
            throw new Error('Both API formats failed');
          }
        } catch (fallbackErr) {
          console.error('Fallback API attempt also failed:', fallbackErr);
          setSubmitting(false);
          setError('Failed to submit portfolio. Please try again later or contact support.');
        }
      }
    } catch (outerErr) {
      // Catches any other unexpected errors
      console.error("Fatal error in handleSubmit:", outerErr);
      setSubmitting(false);
      setError('An unexpected error occurred. Please try again later.');
    }
  };

  // Updated - use a constant true since we're directly importing db
  const firestoreAvailable = true;
  
  // Wrap the entire render process in a try-catch
  try {
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-100 pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-lg p-6 mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Portfolio Review</h1>
            
            {success ? (
              <div className="text-center py-10">
                <h2 className="text-2xl font-semibold text-green-600 mb-4">Portfolio Submitted Successfully!</h2>
                <p className="mb-6">Thank you for your submission. Expect a response within 48 hours.</p>
                <Link to="/" className="px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Return to Home
                </Link>
              </div>
            ) : hasSubmittedBefore && daysUntilNextSubmission > 0 ? (
              <div className="text-center py-10">
                <h2 className="text-2xl font-semibold text-amber-600 mb-4">Portfolio Already Submitted</h2>
                <p className="mb-2">You have already submitted a portfolio for review on {previousSubmission?.date.toLocaleDateString('en-GB')}.</p>
                <p className="mb-6">You can submit another portfolio after {daysUntilNextSubmission} days.</p>

                {loadingResults ? (
                  <div className="my-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                      <p className="text-blue-800 font-medium">Loading your portfolio results...</p>
                    </div>
                  </div>
                ) : portfolioResults && portfolioResults.length > 0 ? (
                  <div className="my-8 p-6 bg-blue-50 shadow-md rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                      📊 Your Portfolio Review Results
                    </h3>
                    
                    {/* ✅ Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                              Stock Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                              Your Buying Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                              Recommendation
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Submitted Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {portfolioResults.map((result, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 border-r">
                                {result.STOCK_NAME}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-700 border-r">
                                ₹{parseFloat(result.BUYING_PRICE).toLocaleString('en-IN')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap border-r">
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                                  result.RESULT?.toUpperCase() === 'BUY' || result.RESULT?.toUpperCase() === 'STRONG BUY'
                                    ? 'bg-green-100 text-green-800 border-green-300'
                                    : result.RESULT?.toUpperCase() === 'HOLD'
                                    ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                    : result.RESULT?.toUpperCase() === 'SELL' || result.RESULT?.toUpperCase() === 'STRONG SELL'
                                    ? 'bg-red-100 text-red-800 border-red-300'
                                    : 'bg-gray-100 text-gray-800 border-gray-300'
                                }`}>
                                  {result.RESULT}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                {new Date(result.SUBMITTED_DATE).toLocaleDateString('en-GB')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* ✅ Mobile Card View */}
                    <div className="md:hidden space-y-4">
                      {portfolioResults.map((result, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-gray-900 text-lg">{result.STOCK_NAME}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                              result.RESULT?.toUpperCase() === 'BUY' || result.RESULT?.toUpperCase() === 'STRONG BUY'
                                ? 'bg-green-100 text-green-800 border-green-300'
                                : result.RESULT?.toUpperCase() === 'HOLD'
                                ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                : result.RESULT?.toUpperCase() === 'SELL' || result.RESULT?.toUpperCase() === 'STRONG SELL'
                                ? 'bg-red-100 text-red-800 border-red-300'
                                : 'bg-gray-100 text-gray-800 border-gray-300'
                            }`}>
                              {result.RESULT}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><span className="font-medium">Buying Price:</span> ₹{parseFloat(result.BUYING_PRICE).toLocaleString('en-IN')}</p>
                            <p><span className="font-medium">Submitted:</span> {new Date(result.SUBMITTED_DATE).toLocaleDateString('en-GB')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="my-8 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-center font-medium">
                      ⏳ Your portfolio is under review. Results will appear here once the analysis is complete.
                    </p>
                  </div>
                )}

                <Link to="/" className="px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Return to Home
                </Link>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-6">
                  Add the stocks and the Buying Price of the stocks that you will like for us to review. Based on our intensive research we will either have a Buy, Hold, or Sell recommendation.
                </p>              
                {/* Information note about review frequency */}
                <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                  <p className="text-teal-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    We offer 1 portfolio review every 3 months. Please reach out to support if you have any questions.
                  </p>
                </div>

                {/* Filters and Stock Selector */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Stock
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        placeholder="Search by name or symbol..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      />
                      {showDropdown && filteredStocks.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {filteredStocks.map((stock) => (
                            <div
                              key={stock.symbol}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                              onClick={() => {
                                setCurrentStock(stock.symbol);
                                setSearchTerm(`${stock.symbol} - ${stock.name}`);
                                setShowDropdown(false);
                              }}
                            >
                              <div className="font-medium">{stock.symbol}</div>
                              <div className="text-sm text-gray-500 truncate">{stock.name}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Avg Buying Price <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      value={currentPrice}
                      onChange={(e) => setCurrentPrice(e.target.value)}
                      placeholder="Enter your purchase price..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      &nbsp;
                    </label>
                    <button
                      onClick={handleAddStock}
                      disabled={!currentStock}
                      className={`px-4 py-2 rounded-md text-white font-medium w-full ${
                        !currentStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
                      }`}
                    >
                      Add to Review List
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                  </div>
                )}

                {/* Selected Stocks Table */}
                {selectedStocks.length > 0 && (
                  <div className="mb-6 overflow-hidden border border-gray-200 rounded-lg">
                    {/* Desktop Table */}
                    <div className="hidden md:block">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Price</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedStocks.map(stock => (
                            <tr key={stock.symbol}>
                              <td className="px-6 py-4 whitespace-nowrap font-medium">{stock.symbol}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{stock.name}</td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <input
                                  type="number"
                                  value={stockPrices[stock.symbol] || ''}
                                  onChange={(e) => handleUpdatePrice(stock.symbol, e.target.value)}
                                  placeholder="Enter price..."
                                  className="w-40 px-2 py-1 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <button
                                  onClick={() => handleRemoveStock(stock.symbol)}
                                  className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-md text-sm font-medium transition-colors"
                                  title="Remove from list"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile List */}
                    <div className="md:hidden">
                      <div className="divide-y divide-gray-200">
                        {selectedStocks.map(stock => (
                          <div key={stock.symbol} className="px-4 py-3 relative">
                            <div className="flex justify-between items-start">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center">
                                  <span className="font-medium text-gray-900 mr-2">{stock.symbol}</span>
                                  <span className="text-sm text-gray-500 truncate">{stock.name}</span>
                                </div>
                                <div className="mt-2">
                                  <input
                                    type="number"
                                    value={stockPrices[stock.symbol] || ''}
                                    onChange={(e) => handleUpdatePrice(stock.symbol, e.target.value)}
                                    placeholder="Enter price..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm"
                                  />
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveStock(stock.symbol)}
                                className="ml-3 flex-shrink-0 flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 hover:bg-red-200 rounded-full text-lg font-bold transition-colors"
                                title="Remove from list"
                                aria-label="Remove from list"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Show message if no stocks are selected */}
                {selectedStocks.length === 0 && !success && (
                  <div className="mb-6 p-4 text-center bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-gray-500">Select stocks to add to your portfolio for review.</p>
                  </div>
                )}

                {/* Submit Button */}
                {!success && (
                  <div className="mt-6 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit}
                      disabled={selectedStocks.length === 0 || submitting}
                      className={`px-6 py-3 rounded-md text-white font-medium ${
                        selectedStocks.length === 0 || submitting
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-teal-600 hover:bg-teal-700'
                      }`}
                    >
                      {submitting ? 'Submitting...' : 'Submit Portfolio'}
                    </motion.button>
                  </div>
                )}
                {!hasSubmittedBefore && !success && portfolioResults && portfolioResults.length > 0 && (
                  <div className="my-8 p-6 bg-blue-50 shadow-md rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                      📊 Your Previous Portfolio Review Results
                    </h3>
                    <p className="text-sm text-gray-600 text-center mb-4">
                      Below are the results from your previous submission. You can now submit a new portfolio for review.
                    </p>
                    
                    {/* ✅ Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                              Stock Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                              Your Buying Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                              Recommendation
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Submitted Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {portfolioResults.map((result, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 border-r">
                                {result.STOCK_NAME}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-700 border-r">
                                ₹{parseFloat(result.BUYING_PRICE).toLocaleString('en-IN')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap border-r">
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                                  result.RESULT?.toUpperCase() === 'BUY' || result.RESULT?.toUpperCase() === 'STRONG BUY'
                                    ? 'bg-green-100 text-green-800 border-green-300'
                                    : result.RESULT?.toUpperCase() === 'HOLD'
                                    ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                    : result.RESULT?.toUpperCase() === 'SELL' || result.RESULT?.toUpperCase() === 'STRONG SELL'
                                    ? 'bg-red-100 text-red-800 border-red-300'
                                    : 'bg-gray-100 text-gray-800 border-gray-300'
                                }`}>
                                  {result.RESULT}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                {new Date(result.SUBMITTED_DATE).toLocaleDateString('en-GB')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* ✅ Mobile Card View */}
                    <div className="md:hidden space-y-4">
                      {portfolioResults.map((result, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-gray-900 text-lg">{result.STOCK_NAME}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                              result.RESULT?.toUpperCase() === 'BUY' || result.RESULT?.toUpperCase() === 'STRONG BUY'
                                ? 'bg-green-100 text-green-800 border-green-300'
                                : result.RESULT?.toUpperCase() === 'HOLD'
                                ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                : result.RESULT?.toUpperCase() === 'SELL' || result.RESULT?.toUpperCase() === 'STRONG SELL'
                                ? 'bg-red-100 text-red-800 border-red-300'
                                : 'bg-gray-100 text-gray-800 border-gray-300'
                            }`}>
                              {result.RESULT}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><span className="font-medium">Buying Price:</span> ₹{parseFloat(result.BUYING_PRICE).toLocaleString('en-IN')}</p>
                            <p><span className="font-medium">Submitted:</span> {new Date(result.SUBMITTED_DATE).toLocaleDateString('en-GB')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Fatal render error in PortfolioReview:", error);
    setRenderError(error);
    
    // Return a fallback UI
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <p className="text-lg mb-6">We're experiencing technical difficulties. Please try again later.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Reload page
        </button>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Return to home
        </button>
      </div>
    );
  }
};

export default PortfolioReview;