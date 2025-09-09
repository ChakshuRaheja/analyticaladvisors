import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaChartLine, FaCoins, FaStar, FaTools, FaCheck, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Subscription plans data
const plans = {
  traders: [
    {
      id: 'swing-equity',
      title: 'Swing Trading – Equity',
      icon: <FaChartLine className="text-3xl mb-4 text-blue-500" />,
      color: 'from-blue-500 to-blue-600',
      border: 'border-blue-500',
      features: [
        '7-10 high-probability recommendations per month',
        '2–6 week trade duration',
        'Real-time alerts via email + Telegram',
        'Monthly performance report',
        'Segments: Cash, Derivates, Index, ETF',
        'Stock of Month: Research report on one stock recommended by analysts'
      ],
      pricing: [
        { duration: 'Monthly', price: '₹3,000' },
        { duration: 'Quarterly', price: '₹8,000', save: 'Save 11%' },
        { duration: 'Half-Yearly', price: '₹14,000', save: 'Save 22%' }
      ]
    },
    {
      id: 'swing-commodity',
      title: 'Swing Trading – Commodity',
      icon: <FaCoins className="text-3xl mb-4 text-orange-500" />,
      color: 'from-orange-500 to-orange-600',
      border: 'border-orange-500',
      features: [
        '7-10 high-probability recommendations per month',
        '2–6 week trade duration',
        'Real-time alerts via email + Telegram',
        'Monthly performance report',
        'Commodity Specifics: Gold, Silver, Copper, Zinc, Aluminium, Lead, Crude Oil and Natural Gas',
        'Stock of Month: Research report on one stock recommended by analysts'
      ],
      pricing: [
        { duration: 'Monthly', price: '₹3,000' },
        { duration: 'Quarterly', price: '₹8,000', save: 'Save 11%' },
        { duration: 'Half-Yearly', price: '₹14,000', save: 'Save 22%' }
      ]
    }
  ],
  investors: [
    {
      id: 'equity-investing',
      title: 'Equity Investing',
      icon: <FaChartLine className="text-3xl mb-4 text-purple-500" />,
      color: 'from-purple-500 to-purple-600',
      border: 'border-purple-500',
      features: [
        'Fewer, but more in-depth, long-term investment recommendations',
        'Emphasize a longer holding period (years or more)',
        'Detailed fundamental analysis, valuation, and long-term growth prospects',
        'Clear entry zones',
        'Less frequent alerts, primarily for significant news, rebalancing, or exit signals',
        'Stock of Month: Research report on one stock recommended by analysts'
      ],
      pricing: [
        { duration: 'Monthly', price: '₹3,500' },
        { duration: 'Quarterly', price: '₹10,000', save: 'Save 5%' },
        { duration: 'Half-Yearly', price: '₹18,000', save: 'Save 14%' }
      ]
    },
    {
      id: 'stock-of-month',
      title: 'Stock of the Month',
      icon: <FaStar className="text-3xl mb-4 text-green-500" />,
      color: 'from-green-500 to-green-600',
      border: 'border-green-500',
      features: [
        'One premium research report per month',
        'Covers fundamentals, valuation, growth, and entry levels',
        'Ideal for beginners & DIY investors',
        'Actionable insights backed by analyst research'
      ],
      pricing: [
        { duration: 'Monthly', price: '₹299' }
      ]
    }
  ],
  tools: [
    {
      id: 'free-tools',
      title: 'Free Tools',
      icon: <FaTools className="text-3xl mb-4 text-gray-500" />,
      color: 'from-gray-500 to-gray-600',
      border: 'border-gray-400',
      features: [
        'Stock Screener with customizable filters (P/E, Market Cap, ROE, etc.)',
        'Fundamental Dashboard – key financial ratios & health metrics',
        'Real-Time Data Feed',
        'User-Friendly Interface for smooth research workflow'
      ],
      pricing: [
        { duration: 'Free Forever', price: '₹0' }
      ]
    }
  ]
};

const Subscription = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('traders');
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState({});

  const handleSubscribe = (planId, priceId) => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/subscription' } });
      return;
    }
    // TODO: Implement subscription logic
    setLoadingPlans(prev => ({ ...prev, [planId]: true }));
    console.log('Subscribing to:', planId, priceId);
    // Simulate API call
    setTimeout(() => {
      setLoadingPlans(prev => ({ ...prev, [planId]: false }));
    }, 1500);
  };

  const renderPricingButton = (plan, price, index) => (
    <div key={index} className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="font-medium">{price.duration}:</span>
        <span className="font-bold text-lg">{price.price}</span>
      </div>
      {price.save && (
        <div className="text-xs text-green-600 mb-2 text-right">
          {price.save}
        </div>
      )}
      <button
        onClick={() => handleSubscribe(plan.id, `${plan.id}-${price.duration.toLowerCase()}`)}
        disabled={loadingPlans[plan.id]}
        className={`w-full py-2 px-4 rounded-md text-white font-medium bg-gradient-to-r ${plan.color} hover:opacity-90 transition-all duration-200 flex items-center justify-center ${loadingPlans[plan.id] ? 'opacity-75 cursor-not-allowed' : ''}`}
      >
        {loadingPlans[plan.id] ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            {price.duration === 'Free Forever' ? 'Get Started' : 'Subscribe Now'} <FaArrowRight className="ml-2" />
          </>
        )}
      </button>
    </div>
  );

  const renderPlanCard = (plan) => (
    <motion.div
      key={plan.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-xl shadow-lg overflow-hidden border-t-4 ${plan.border} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col`}
    >
      <div className="p-6 flex-1 flex flex-col">
        <div className="text-center">
          {plan.icon}
          <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.title}</h3>
          <div className={`h-1 w-16 bg-gradient-to-r mx-auto mb-6 rounded-full ${plan.color.replace('from-', 'bg-').split(' ')[0]}`}></div>
        </div>
        
        <ul className="space-y-3 mb-6 flex-1">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start">
              <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
              <span className="text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto">
          {plan.pricing.map((price, idx) => renderPricingButton(plan, price, idx))}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl"
          >
            Choose Your Plan
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-5 max-w-xl mx-auto text-xl text-gray-500"
          >
            Select the perfect plan that fits your trading and investment needs
          </motion.p>
        </div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            {[
              { id: 'traders', label: 'For Traders' },
              { id: 'investors', label: 'For Investors' },
              { id: 'tools', label: 'Free Tools' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-md font-medium text-sm ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeTab === 'traders' && plans.traders.map(renderPlanCard)}
          {activeTab === 'investors' && plans.investors.map(renderPlanCard)}
          {activeTab === 'tools' && plans.tools.map(renderPlanCard)}
        </div>

        {/* Free Tools Section */}
        {activeTab !== 'tools' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 mb-6 md:mb-0">
                  <h2 className="text-3xl font-bold mb-4">Free Tools for Everyone</h2>
                  <p className="text-gray-300 mb-6">
                    Access our suite of powerful investment tools at no cost. Perfect for both beginners and experienced traders.
                  </p>
                  <ul className="space-y-3">
                    {plans.tools[0].features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <FaCheck className="text-green-400 mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setActiveTab('tools')}
                    className="mt-6 bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center"
                  >
                    Explore Free Tools <FaArrowRight className="ml-2" />
                  </button>
                </div>
                <div className="md:w-1/2 flex justify-center">
                  <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                    <FaTools className="text-6xl mx-auto mb-4 text-white/80" />
                    <h3 className="text-2xl font-bold text-center">Free Forever</h3>
                    <p className="text-4xl font-extrabold text-center my-4">₹0</p>
                    <p className="text-center text-gray-300">No credit card required</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Subscription;
