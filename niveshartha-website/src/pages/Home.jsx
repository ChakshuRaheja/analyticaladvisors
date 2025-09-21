import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ScrollAnimation from '../components/ScrollAnimation';
import PhoneAnimation from '../components/PhoneAnimation';
import ImageCarousel from '../components/ImageCarousel';
import SimpleClientComplaints from '../components/SimpleClientComplaints';
import ClientComplaints from '../components/ClientComplaints';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
// Image paths from public directory
const p1 = '/images/p1.jpg';
const p1Mobile = '/images/p1 (2).jpg';
const p2 = '/images/p 2.png';
const p2Mobile = '/images/p 2 (2).png';
const p3 = '/images/p3.png';
const p3Mobile = '/images/p3(2).jpg'; // Fixed extension to match actual filename

// Debug: Log the base URL
console.log('Base URL:', window.location.origin);

const Home = ({ faqOnly = false }) => {
  // If faqOnly is true, scroll to FAQ section on mount
  useEffect(() => {
    if (faqOnly) {
      // Small timeout to ensure the DOM is ready
      const timer = setTimeout(() => {
        const faqSection = document.getElementById('faq');
        if (faqSection) {
          faqSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [faqOnly]);
  const { currentUser } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [showWhatsAppMessage, setShowWhatsAppMessage] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // WhatsApp number - update this with your actual business number
  const whatsappNumber = "919599449376"; // Format: country code + number (no + or spaces)
  const whatsappMessage = "Hello! I'm interested in learning more about your investment services.";

  // Function to toggle WhatsApp message
  const toggleWhatsAppMessage = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowWhatsAppMessage(!showWhatsAppMessage);
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Define carousel images with responsive handling
  const carouselImages = [
    {
      src: isMobile ? p1Mobile : p1,
      alt: "Market Analysis"
    },
    {
      src: isMobile ? p2Mobile : p2,
      alt: "Financial Planning" 
    },
    {
      src: isMobile ? p3Mobile : p3,
      alt: "Investment Strategy" 
    }
  ];
  
  // Debug: Log the carousel images and their paths
  useEffect(() => {
    console.log('Carousel Images:', carouselImages);
    console.log('Is Mobile:', isMobile);
    console.log('p3 path:', p3);
    console.log('p3Mobile path:', p3Mobile);
    console.log('All image paths:', { p1, p1Mobile, p2, p2Mobile, p3, p3Mobile });
  }, [isMobile]);

  // Preload images
  useEffect(() => {
    console.log('Starting image preloading...');
    const preloadImages = async () => {
      // Create array of all images to preload (both mobile and desktop versions)
      const allImages = [p1, p1Mobile, p2, p2Mobile, p3, p3Mobile];
      
      console.log('All images to preload:', allImages);
      
      const promises = allImages.map((imageSrc, index) => {
        return new Promise((resolve, reject) => {
          console.log(`Loading image ${index + 1}:`, imageSrc);
          const img = new Image();
          img.onload = () => {
            console.log(`Successfully loaded image ${index + 1}:`, imageSrc);
            resolve();
          };
          img.onerror = (e) => {
            console.error(`Failed to load image ${index + 1}:`, imageSrc, e);
            reject(e);
          };
          // Use absolute URL for the image source
          img.src = window.location.origin + imageSrc;
        });
      });

      try {
        await Promise.all(promises);
        console.log('All images loaded successfully');
        setImagesLoaded(true);
      } catch (error) {
        console.error('Failed to load some images:', error);
        setImagesLoaded(true); // Continue even if some images fail to load
      }
    };

    preloadImages();
  }, []);

  const faqItems = [
    {
      question: "Are you registered with SEBI?",
      answer: "Yes. We are a SEBI-registered Research Analyst under registration number INH000020183 , in accordance with the SEBI (Research Analyst) Regulations, 2014. This ensures that our research services adhere to the highest standards of ethics, transparency, and investor protection."
    },
    {
      question: "What is a SEBI-registered Research Analyst?",
      answer: "A SEBI-registered Research Analyst is an individual or entity authorized to provide independent research on securities or investment strategies. They are regulated by SEBI to ensure quality, transparency, and non-biased research. They are not permitted to execute trades or manage client portfolios."
    },
    {
      question: "What services do you provide?",
      answer: "We offer research-focused services, including:\n• Equity Research Reports\n• Investment Ideas (Buy/Sell/Hold)\n• Model Portfolios\n• Technical and Fundamental Analysis\n• Sector & Thematic Reports\n• Market Updates & Commentary\n• On-demand custom research (subject to regulatory limits)\n\nNote: We do not provide portfolio management or investment tips."
    },
    {
      question: "Do you provide stock tips or intraday calls?",
      answer: "No. As a Research Analyst, we do not offer stock tips or intraday trading calls. Our insights are based on structured analysis and are meant for informed decision-making, not speculation."
    },
    {
      question: "How can I subscribe to your research services?",
      answer: "You can subscribe by:\n• Filling out the contact form on our website\n• Emailing us at [Your Email]\n• Calling or WhatsApp on [Your Number]\n\nOnce we receive your request, we will guide you through the onboarding process and provide access to our reports or platform."
    },
    {
      question: "Who can benefit from your services?",
      answer: "Our services are suitable for:\n• Retail investors\n• High Net-Worth Individuals (HNIs)\n• Financial advisors\n• Long-term investors\n• Active traders (technical analysis reports)\n\nWhether you're new to the stock market or a seasoned investor, our research adds value to your decision-making process."
    },
    {
      question: "Do you manage or handle client portfolios?",
      answer: "No. We do not offer Portfolio Management Services (PMS), trading, or execution services. We only offer independent, research-based recommendations. Clients are responsible for their own investment decisions and execution."
    },
    {
      question: "How often do you share research reports?",
      answer: "Our frequency varies depending on the type of service:\n• Equity Research Reports: Weekly / Monthly\n• Investment Ideas: As and when high-conviction opportunities arise\n• Model Portfolio Updates: Monthly or on rebalance\n• Market Commentary: Daily/Weekly\n• Sector Reports: Quarterly or as needed\n\nWe maintain transparency in timelines and notify clients of any major market changes."
    },
    {
      question: "What is the risk involved in acting on your recommendations?",
      answer: "All investments in securities are subject to market risks. While we strive to offer high-quality and well-researched insights, there are no guarantees of returns. Past performance is not indicative of future results. Investors are encouraged to assess their own risk appetite and consult their financial advisor if needed."
    },
    {
      question: "How do you handle conflicts of interest?",
      answer: "We have strong internal policies to mitigate and disclose any conflicts of interest:\n• Any personal holdings in recommended securities are disclosed.\n• We do not receive compensation from any listed companies for our research.\n• Our research is unbiased and independently created."
    },
    {
      question: "Will my personal data be kept confidential?",
      answer: "Yes. Client information is treated with strict confidentiality. We do not share or sell client data with third parties. Our data practices comply with SEBI and data protection norms."
    },
    {
      question: "Can I contact you for personalized advice?",
      answer: "We can offer customized research within the permissible scope defined by SEBI. However, we are not authorized to provide personalized investment advice or create customized portfolios. For financial planning, please consult a registered Investment Adviser."
    },
    {
      question: "What should I do before acting on your recommendations?",
      answer: "• Carefully read the full research report.\n• Assess whether the idea fits your investment objective and risk profile.\n• Understand that markets involve volatility.\n• If in doubt, consult your financial advisor or do further research."
    },
    {
      question: "How are your services priced?",
      answer: "We offer different pricing plans based on:\n• Type of subscription (monthly, quarterly, annual)\n• Access to premium content or model portfolios\n• On-demand research requirements\n\nPlease contact us directly for a pricing brochure or custom quote."
    },
    {
      question: "How can I unsubscribe or opt out of your services?",
      answer: "You can cancel your subscription anytime by writing to us at  support@analyticaladvisors.in . If you've paid for a term-based subscription, we'll guide you through the cancellation and refund policy (if applicable)."
    }
  ];

  // If faqOnly is true, only render the FAQ section
  if (faqOnly) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow">
          {/* FAQ Section */}
          <section id="faq" className="py-20 bg-white-50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
                  Have a Question ?
                </h2>
              </div>

              <div className="max-w-4xl mx-auto">
                {faqItems.map((faq, index) => (
                  <div key={index} className="mb-6 bg-white rounded-lg shadow-md overflow-hidden">
                    <button
                      className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                      onClick={() => toggleFaq(index)}
                    >
                      <span className="text-xl font-medium text-gray-800">
                        {`0${index + 1}. ${faq.question}`}
                      </span>
                      <span className="text-2xl">
                        {openFaq === index ? '−' : '+'}
                      </span>
                    </button>
                    {openFaq === index && (
                      <div className="px-6 pb-5">
                        <p className="text-gray-600 whitespace-pre-line">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Original return for normal home page
  return (
    <div className="min-h-screen flex flex-col">
      {/* WhatsApp Click to Chat Button */}
      <div className="fixed left-4 bottom-6 z-50">
        {/* WhatsApp Message - Only appears when state is true */}
        <div 
          className={`absolute bottom-16 left-0 mb-3 transition-all duration-300 ${
            showWhatsAppMessage ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          <div className="bg-white py-4 px-4 rounded-lg shadow-md flex items-center justify-between w-72 md:w-96">
            <div>
              <p className="font-semibold  text-gray-800 mb-1">Hello,<br/> Welcome to Analytical Advisors!</p>
              <a 
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-[#008080] hover:text-[#006666] font-medium transition-colors"
              >
                <div className="flex items-center justify-center w-6 h-6 bg-[#008080] rounded-full mr-2">
                  <svg 
                    className="w-4 h-4 text-white" 
                    fill="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                Chat with us
              </a>
            </div>
            <button 
              onClick={toggleWhatsAppMessage} 
              className="ml-4 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close message"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Triangle pointer */}
          <div className="w-4 h-4 bg-white transform rotate-45 absolute -bottom-1 left-6"></div>
        </div>
        
        {/* WhatsApp Button - Always visible */}
        <button
          onClick={toggleWhatsAppMessage}
          className="flex items-center justify-center w-12 h-12 bg-[#008080] rounded-full shadow-lg hover:bg-[#006666] transition-all duration-300 transform hover:scale-110 animate-pulse hover:animate-none"
          aria-label="Open WhatsApp chat"
        >
          <svg 
            className="w-7 h-7 text-white" 
            fill="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </button>
      </div>
      
      {/* Hero Section with Carousel */}
      <div className="relative w-full" style={{
        height: 'calc(100vh - 5rem)',
        minHeight: '500px',
        marginTop: '5rem',
        backgroundColor: '#f8f9fa',
        overflow: 'hidden'
      }}>
        {console.log('Rendering carousel with images:', carouselImages)}
        {imagesLoaded ? (
          <div className="w-full h-full">
            <ImageCarousel 
              images={carouselImages} 
              interval={5000} 
              key={JSON.stringify(carouselImages.map(img => img.src))}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#008080]"></div>
          </div>
        )}
      </div>

      {/* What We Offer Teaser */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              What We Offer
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              Comprehensive investment research and analysis to help you make informed decisions in the financial markets. 
              Our expert insights and data-driven approach give you the edge you need.
            </p>
            <Link 
              to="/subscription" 
              className="inline-flex items-center text-[#008080] font-semibold hover:text-[#006666] transition-colors group"
            >
              View Subscription Plans
              <svg 
                className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M14 5l7 7m0 0l-7 7m7-7H3" 
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We stand out in the financial research industry with our commitment to excellence and client success.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 p-8 rounded-lg text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-[#008080] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#008080]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Expert Analysis</h3>
              <p className="text-gray-600">Our team of seasoned analysts provides in-depth market research and insights.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 p-8 rounded-lg text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-[#008080] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#008080]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Fast & Reliable</h3>
              <p className="text-gray-600">Get timely updates and recommendations to stay ahead in the market.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 p-8 rounded-lg text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-[#008080] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#008080]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Secure & Private</h3>
              <p className="text-gray-600">Your data security and privacy are our top priorities.</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-50 p-8 rounded-lg text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-[#008080] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#008080]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">24/7 Support</h3>
              <p className="text-gray-600">Our dedicated support team is always here to assist you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              At the heart of everything we do are the principles of trust and transparency.
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
            {/* Trust Card */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#008080] bg-opacity-10 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-[#008080]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Trust</h3>
              </div>
              <p className="text-gray-600 mb-6">
                We build lasting relationships based on integrity and reliability. Your trust is our most valuable asset, and we work tirelessly to maintain it through consistent, honest communication and dependable service.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#008080] mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Proven track record of reliability</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#008080] mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Ethical business practices</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#008080] mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Client-first approach</span>
                </li>
              </ul>
            </div>

            {/* Transparency Card */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#008080] bg-opacity-10 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-[#008080]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Transparency</h3>
              </div>
              <p className="text-gray-600 mb-6">
                We believe in complete openness about our processes, fees, and decision-making. No hidden agendas, no fine print—just clear, straightforward information to help you make informed decisions.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#008080] mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Clear and open communication</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#008080] mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>No hidden fees or charges</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#008080] mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Full disclosure of methodologies</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Client Complaints Section */}
      <ClientComplaints />

      {/* Blog section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Stay Ahead in the Market
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              Track key movements in the Indian stock market. Insights, updates, and trends 
              — all in one place.
            </p>
            <Link 
              to="/blog" 
              className="inline-flex items-center text-[#008080] font-semibold hover:text-[#006666] transition-colors group"
            >
              Market News
              <svg 
                className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M14 5l7 7m0 0l-7 7m7-7H3" 
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white-50">
        <div className="container mx-auto px-4">
          <ScrollAnimation animation="from-bottom" delay={0.2}>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
                Have a Question ?
              </h2>
            </div>
          </ScrollAnimation>

          <div className="max-w-4xl mx-auto">
            {faqItems.map((faq, index) => (
              <ScrollAnimation key={index} animation="from-bottom" delay={0.1 * (index + 1)}>
                <div className="mb-6 bg-white rounded-lg shadow-md overflow-hidden">
                  <button
                    className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                    onClick={() => toggleFaq(index)}
                  >
                    <span className="text-xl font-medium text-gray-800">
                      {`0${index + 1}. ${faq.question}`}
                    </span>
                    <span className="text-2xl">
                      {openFaq === index ? '−' : '+'}
                    </span>
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-5">
                      <p className="text-gray-600 whitespace-pre-line">{faq.answer}</p>
                    </div>
                  )}
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      
      {/* Get Started Section */}
      <section className="py-20 bg-[#008080] text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Start Your Investment Journey?
            </h2>
            <p className="text-xl md:text-2xl mb-10 opacity-90">
              Join our growing community and start your journey toward smarter financial decisions — all with guidance you can trust.
            </p>
            <div className="flex justify-center">
              <Link
                to={currentUser ? "/dashboard" : "/signup"}
                className="px-10 py-4 bg-white text-[#008080] font-bold rounded-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {currentUser ? 'Go to Dashboard' : 'Get Started Now'}
              </Link>
            </div>  
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;