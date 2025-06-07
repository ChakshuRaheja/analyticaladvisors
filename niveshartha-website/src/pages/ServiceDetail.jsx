import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ScrollAnimation from '../components/ScrollAnimation';

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This would typically be an API call
    // For now, we'll just simulate with static data
    const serviceData = getServiceData(serviceId);
    setService(serviceData);
    setLoading(false);
  }, [serviceId]);

  const getServiceData = (id) => {
    const services = {
      'equity-research': {
        title: "Equity Research Reports",
        description: "In-depth fundamental analysis of listed companies to help you make informed investment decisions.",
        icon: "📊",
        content: `
          <h3>What We Provide</h3>
          <p>Our equity research reports provide comprehensive analysis of listed companies, including:</p>
          <ul>
            <li>Company background and business model analysis</li>
            <li>Financial statement analysis and performance metrics</li>
            <li>Industry positioning and competitive landscape</li>
            <li>Growth projections and outlook</li>
            <li>Valuation analysis with target price</li>
            <li>Investment risks and opportunities</li>
          </ul>
          
          <h3>Our Approach</h3>
          <p>We combine fundamental analysis with qualitative assessment to provide a holistic view of investment opportunities. Our research team focuses on both short-term catalysts and long-term growth drivers.</p>
          
          <h3>Delivery Format</h3>
          <p>Reports are available in PDF format and through our online dashboard. Each report includes executive summary, detailed analysis, and investment conclusion.</p>
        `,
        features: [
          "Detailed company analysis",
          "Financial performance review",
          "Growth projections",
          "Valuation metrics"
        ]
      },
      'commodity-research': {
        title: "Commodity Research Reports",
        description: "Insightful coverage of key commodities including metals, energy, and agri-markets with fundamental and technical perspectives.",
        icon: "🏭",
        content: `
          <h3>Comprehensive Commodity Insights</h3>
          <p>Our commodity research provides in-depth analysis across various commodity classes:</p>
          <ul>
            <li>Metals (precious and industrial)</li>
            <li>Energy products (crude oil, natural gas, etc.)</li>
            <li>Agricultural commodities</li>
            <li>Other raw materials</li>
          </ul>
          
          <h3>Analysis Framework</h3>
          <p>We analyze commodities through multiple lenses including supply-demand dynamics, geopolitical factors, seasonal patterns, and technical indicators.</p>
          
          <h3>Report Types</h3>
          <p>Our commodity research includes daily/weekly updates, monthly outlook reports, and special thematic analysis on market-moving events.</p>
        `,
        features: [
          "Supply-demand analysis",
          "Price trend forecasts",
          "Technical chart patterns",
          "Market sentiment indicators"
        ]
      },
      'derivatives-research': {
        title: "Derivatives Research (F&O)",
        description: "Strategic futures and options insights including setups, open interest analysis, and volatility-based strategies.",
        icon: "📈",
        content: `
          <h3>Derivatives Strategy Insights</h3>
          <p>Our derivatives research helps traders and investors navigate the complex world of futures and options with:</p>
          <ul>
            <li>Options strategy recommendations</li>
            <li>Open interest analysis and interpretation</li>
            <li>Volatility analysis and implications</li>
            <li>Roll-over data assessment</li>
            <li>Put-Call ratio analysis</li>
          </ul>
          
          <h3>Strategy Focus</h3>
          <p>We cover various derivatives strategies suitable for different market conditions and risk appetites, from simple directional trades to complex spreads.</p>
          
          <h3>Educational Content</h3>
          <p>Our reports include educational elements to help clients better understand derivatives concepts and improve their trading approach.</p>
        `,
        features: [
          "Options strategy analysis",
          "Open interest interpretation",
          "Volatility studies",
          "Risk-reward assessments"
        ]
      },
      'investment-ideas': {
        title: "Investment Ideas",
        description: "Curated stock ideas with entry/exit points and risk analysis.",
        icon: "💡",
        content: `
          <h3>High-Conviction Investment Opportunities</h3>
          <p>Our investment ideas represent our highest conviction recommendations, featuring:</p>
          <ul>
            <li>Specific entry and exit price levels</li>
            <li>Clear stop-loss recommendations</li>
            <li>Expected time horizon</li>
            <li>Catalyst identification</li>
            <li>Detailed risk assessment</li>
          </ul>
          
          <h3>Selection Process</h3>
          <p>Each investment idea undergoes rigorous screening and multi-level review before being recommended to clients.</p>
          
          <h3>Performance Tracking</h3>
          <p>We transparently track and report the performance of all our investment ideas, providing regular updates on active recommendations.</p>
        `,
        features: [
          "Entry/exit price points",
          "Stop-loss recommendations",
          "Target projections",
          "Risk assessment"
        ]
      },
      'sector-reports': {
        title: "Sector & Thematic Reports",
        description: "Special reports covering sectoral trends and thematic investment opportunities.",
        icon: "🔍",
        content: `
          <h3>Industry and Theme-Based Analysis</h3>
          <p>Our sector and thematic reports provide a broader perspective on investment opportunities through:</p>
          <ul>
            <li>Comprehensive sector analysis</li>
            <li>Emerging thematic trends</li>
            <li>Regulatory impact assessment</li>
            <li>Cross-sector comparisons</li>
            <li>Identification of sector leaders and laggards</li>
          </ul>
          
          <h3>Coverage Areas</h3>
          <p>We cover all major economic sectors as well as emerging investment themes like clean energy, digital transformation, and healthcare innovation.</p>
          
          <h3>Actionable Insights</h3>
          <p>Each report concludes with specific actionable recommendations for investors to capitalize on identified opportunities.</p>
        `,
        features: [
          "Industry trend analysis",
          "Thematic opportunity spotting",
          "Comparative sector performance",
          "Emerging sector insights"
        ]
      },
      'model-portfolios': {
        title: "Model Portfolios",
        description: "Actively monitored model portfolios aligned with specific risk profiles.",
        icon: "📂",
        content: `
          <h3>Strategic Portfolio Solutions</h3>
          <p>Our model portfolios offer ready-made investment solutions for different investor profiles:</p>
          <ul>
            <li>Conservative Income Portfolio</li>
            <li>Balanced Growth Portfolio</li>
            <li>Aggressive Growth Portfolio</li>
            <li>Thematic Portfolios (e.g., Dividend, Value, Growth)</li>
          </ul>
          
          <h3>Portfolio Management</h3>
          <p>Each model portfolio is actively monitored with regular rebalancing recommendations and performance updates.</p>
          
          <h3>Implementation Guidance</h3>
          <p>We provide detailed guidance on how to implement and maintain the model portfolios, including allocation percentages and rebalancing strategies.</p>
        `,
        features: [
          "Diversified portfolio construction",
          "Risk-profile alignment",
          "Regular rebalancing recommendations",
          "Performance tracking"
        ]
      },
      'market-commentary': {
        title: "Market Commentary",
        description: "Timely market updates, news impact, and technical snapshots.",
        icon: "📰",
        content: `
          <h3>Stay Informed with Market Insights</h3>
          <p>Our market commentary keeps you updated on market developments through:</p>
          <ul>
            <li>Daily/weekly market summaries</li>
            <li>Analysis of economic data releases</li>
            <li>Impact assessment of major news events</li>
            <li>Technical market outlook</li>
            <li>Global market correlations</li>
          </ul>
          
          <h3>Frequency Options</h3>
          <p>Choose from daily pre-market notes, end-of-day summaries, or comprehensive weekly outlooks based on your information needs.</p>
          
          <h3>Delivery Channels</h3>
          <p>Access our market commentary through email, our mobile app, or the online dashboard for timely updates wherever you are.</p>
        `,
        features: [
          "Daily/weekly market insights",
          "News impact analysis",
          "Technical market outlook",
          "Global market correlations"
        ]
      }
    };

    return services[id] || {
      title: "Service Not Found",
      description: "The requested service information is not available.",
      icon: "❓",
      content: "<p>Please return to the services page and select a valid service.</p>"
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-black text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-black opacity-90" />
        <div className="container mx-auto px-4 relative z-10">
          <ScrollAnimation animation="from-bottom" delay={0.2}>
            <div className="text-center max-w-3xl mx-auto">
              <div className="text-6xl mb-6">{service.icon}</div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {service.title}
              </h1>
              <p className="text-lg text-gray-300">
                {service.description}
              </p>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Service Details */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation animation="from-bottom" delay={0.2}>
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div dangerouslySetInnerHTML={{ __html: service.content }} className="prose max-w-none prose-headings:font-bold prose-headings:text-gray-800 prose-p:text-gray-600 prose-li:text-gray-600 prose-h3:text-xl" />
              </div>
            </ScrollAnimation>
            
            <ScrollAnimation animation="from-bottom" delay={0.3}>
              <div className="mt-12 text-center">
                <h3 className="text-2xl font-bold mb-6">Ready to get started?</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    to="/contact"
                    className="inline-block px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Contact Us
                  </Link>
                  <Link
                    to="/services"
                    className="inline-block px-8 py-3 bg-gray-200 text-gray-800 rounded-full font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Back to Services
                  </Link>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceDetail; 