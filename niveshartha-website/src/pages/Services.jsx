import { motion } from 'framer-motion';
import ScrollAnimation from '../components/ScrollAnimation';
import { useNavigate } from 'react-router-dom';

const Services = () => {
  const navigate = useNavigate();
  
  const services = [
    {
      title: "Equity Research Reports",
      description: "In-depth fundamental analysis of listed companies.",
      icon: "📊",
      detailedContent: `Our flagship offering is comprehensive fundamental research reports on listed Indian companies.
• What's Included:
  o Company overview and business model
  o Management analysis
  o Financial statement analysis (Balance Sheet, P&L, Cash Flow)
  o Ratio analysis & valuations (PE, EV/EBITDA, DCF etc.)
  o Investment thesis and risk factors
  o Price target with time horizon
• Who It's For: Long-term investors who seek a deep understanding before investing.
• Frequency: Weekly/Monthly or based on market developments.`,
      link: "/services/equity-research"
    },
    {
      title: "Commodity Research Reports",
      description: "Insightful coverage of key commodities including metals, energy, and agri-markets with fundamental and technical perspectives.",
      icon: "🏭",
      detailedContent: `Research-driven insights on key commodities — for hedgers, traders, and market watchers.
• Coverage: Gold, Silver, Crude Oil, Natural Gas, Base Metals, and Agri Commodities.
• What's Included:
  o Global price trends and supply-demand dynamics
  o Technical levels and seasonal analysis
  o Impact of macroeconomic indicators and geopolitical events
• Use Case: Traders in the commodity futures market, long-term commodity investors, and businesses with exposure to commodity price risk.
• Frequency: Daily/Weekly based on market activity.`,
      link: "/services/commodity-research"
    },
    {
      title: "Derivatives Research (F&O)",
      description: "Strategic futures and options insights including setups, open interest analysis, and volatility-based strategies.",
      icon: "📈",
      detailedContent: `Analysis of Futures & Options strategies across equity and commodity markets.
• What's Included:
  o Options chain analysis
  o Open interest trends
  o Strategy setups (bull call spreads, iron condors, etc.)
  o Volatility-based trading ideas
  o Risk management tools
• Use Case: Traders and hedgers using derivatives to manage risk, generate income, or express directional views.
• Frequency: Daily/Weekly based on market activity.`,
      link: "/services/derivatives-research"
    },
    {
      title: "Investment Ideas",
      description: "Curated stock ideas with entry/exit points and risk analysis.",
      icon: "💡",
      detailedContent: `Actionable investment ideas backed by research and risk-reward analysis.
• What's Included:
  o Entry & exit price levels
  o Target price with justification
  o Stop-loss level
  o Timeframe (short/medium/long-term)
  o Supporting charts and data
• Who It's For: Active investors looking for curated stock opportunities.
• Frequency: As and when high-conviction ideas emerge (usually weekly or bi-weekly).`,
      link: "/services/investment-ideas"
    },
    {
      title: "Sector & Thematic Reports",
      description: "Special reports covering sectoral trends and thematic investment opportunities.",
      icon: "🔍",
      detailedContent: `Deep dives into specific sectors and macroeconomic trends.
• What's Included:
  o Industry outlook
  o Key players & comparative analysis
  o Government policy impact
  o Valuation trends
  o Opportunities & challenges
• Examples:
  o BFSI Sector Outlook
  o Renewable Energy Boom
  o Budget Impact on FMCG
• Who It's For: Investors seeking exposure to specific sectors/themes.`,
      link: "/services/sector-reports"
    },
    {
      title: "Model Portfolios",
      description: "Actively monitored model portfolios aligned with specific risk profiles.",
      icon: "📂",
      detailedContent: `Pre-built equity portfolios tailored to different investor profiles and objectives.
• Types of Portfolios:
  o Conservative Long-Term Portfolio
  o Growth-Oriented Portfolio
  o Small Cap/High Risk-High Reward Portfolio
  o Thematic/ESG Portfolio
  o SIP-based Portfolio
• What's Included:
  o Portfolio allocation strategy
  o Rebalancing updates
  o Monthly performance tracking
  o Sector weightings and rationale
• Who It's For: Investors who prefer structured, goal-based investing.`,
      link: "/services/model-portfolios"
    },
    {
      title: "Market Commentary",
      description: "Timely market updates, news impact, and technical snapshots.",
      icon: "📰",
      detailedContent: `Timely insights on market-moving events, earnings seasons, and news.
• What's Included:
  o Nifty, Sensex, and sectoral index updates
  o Key domestic & global economic indicators
  o Corporate results highlights
  o FII/DII activity trends
• Who It's For: Daily/weekly investors who want to stay informed.
• Frequency: Daily briefs, Weekly wrap-ups, Monthly outlooks.`,
      link: "/services/market-commentary"
    }
  ];

  // Simple function to navigate
  const navigateTo = (url) => {
    navigate(url);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      {/* <section className="relative py-20 bg-black text-white">
        <div className="absolute inset-0 bg-[url('/images/services-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <ScrollAnimation animation="from-bottom" delay={0.2}>
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Our Services
              </h1>

            </div>
          </ScrollAnimation>
        </div>
      </section> */}

      {/* Our Offerings Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <ScrollAnimation animation="from-bottom" delay={0.2}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Our Offerings
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We provide a range of research services tailored for retail and institutional investors.
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <ScrollAnimation key={index} animation="from-bottom" delay={0.2 + index * 0.1}>
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <div className="text-4xl mr-4">{service.icon}</div>
                    <h3 className="text-2xl font-bold">{service.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-6">{service.description}</p>
                  <div className="prose max-w-none">
                    {service.detailedContent.split('\n').map((line, idx) => (
                      <p key={idx} className="text-gray-600 mb-2 whitespace-pre-wrap">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Advisory Disclaimers Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <ScrollAnimation animation="from-bottom" delay={0.2}>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Advisory Disclaimers</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="mr-2 text-red-500">•</span>
                  <span className="text-gray-600">We do not offer portfolio management, execution, or investment tips.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-red-500">•</span>
                  <span className="text-gray-600">Our role is limited to providing non-binding, research-based insights.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-red-500">•</span>
                  <span className="text-gray-600">All recommendations are made in accordance with SEBI (Research Analysts) Regulations, 2014.</span>
                </li>
              </ul>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  );
};

export default Services; 