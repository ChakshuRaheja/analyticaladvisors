import { motion } from 'framer-motion';
import ScrollAnimation from '../components/ScrollAnimation';
import { useNavigate } from 'react-router-dom';

const Services = () => {
  const navigate = useNavigate();
  
  const services = [
    {
      title: "TarangLakṣya – Targeting Market Waves",
      description: "Precision Swing Trade Signals for Part-Time Traders",
      icon: "🌊",
      detailedContent: `🚀 Ride the Momentum — With Smart Entries & Timely Exits
Unlock the potential of short-term trends with TarangLakṣya, your companion for high-probability swing trading in the Indian market. Designed for part-time traders who want clarity, consistency, and control, our signals blend technical precision with market psychology.

📌 Key Features:
✅ 3–10 Day Trade Duration
Stay in the trade just long enough to catch the wave — not the storm.
✅ Smart Signal Generation
Based on a powerful combination of technical analysis + open interest data to ensure you only enter when the odds are in your favor.
✅ Clear Stop-Loss & Target Levels
Each recommendation comes with well-defined SL/TP for risk management.
✅ 3–5 Curated Trades per Week
No noise, just quality setups — because precision matters more than quantity.
✅ Real-Time Alerts via Email & Telegram
Never miss a trade opportunity. Stay informed and in control.

🎯 Perfect for:
• Working professionals trading part-time
• Traders seeking structured entry/exit plans
• Anyone aiming for steady swing returns with minimal screen time`,
      link: "/services/tarang-lakshya"
    },
    {
      title: "YuktaNivesha – Strategic Investment",
      description: "Smart Positional Picks for Long-Term Gains from Medium-Term Moves",
      icon: "📊",
      detailedContent: `📈 Unlock Mid-Term Market Moves with Confidence
YuktaNivesha is your gateway to well-researched, positional portfolio strategies designed for medium-term cycles and long-term returns. With a blend of macro analysis, technical signals, and sector rotation, this service empowers strategic investors to ride the right wave at the right time — with minimal noise.

🔍 Core Highlights:
✅ 2–8+ Week Holding Horizon
Capture sustained moves with patience, not panic.
✅ Macro Trends + Technical Breakouts
Each pick is grounded in strong fundamentals and confirmed by technical patterns.
✅ Sector Rotation & Multi-Asset Themes
From equities to ETFs — invest where the smart money is moving.
✅ Weekly Sunday Updates
Start your week with clarity — new opportunities and portfolio insights, delivered like clockwork.
✅ Clean, Actionable Formats
No clutter. Just clear entries, exits, rationale, and risk levels for easy execution.

🎯 Best Suited For:
• Strategic investors with a medium-to-long-term horizon
• Professionals looking for guided investment ideas
• Traders wanting to convert short-term signals into positional plays`,
      link: "/services/yukta-nivesha"
    },
    {
      title: "YuktiVargha – Collection of Tactics",
      description: "Options Edge: Strategy Pack for Asymmetric Rewards",
      icon: "♟️",
      detailedContent: `🧠 Smarter Strategies for Smarter Profits
Welcome to YuktiVargha, a tactical edge for option traders who think beyond calls and puts. This isn't about blind bets — it's about structured, risk-defined strategies that work with volatility, not against it. If you're looking to elevate your options game with asymmetric reward setups, you're in the right place.

⚙️ What's Inside the Strategy Pack:
✅ Advanced Options Strategies
Straddles, strangles, vertical spreads, iron condors, delta-neutral and directional setups — curated for different market conditions.
✅ Data-Driven Entries & Exits
Backed by real-time IV, OI, and skew analysis — no guesswork.
✅ Risk-Defined Approach
Know your max risk and reward before you enter — every time.
✅ Volatility-Based Logic
All strategies are derived from implied volatility patterns, open interest shifts, and market bias metrics.
✅ Strategy Journal + Tracker Included
Log your trades, track outcomes, and refine your edge with every move.

📌 Designed For:
• Options traders seeking low-risk/high-reward setups
• Professionals looking to automate discipline in trading
• Learners wanting to practice with structure, not stress`,
      link: "/services/yukti-vargha"
    },
    {
      title: "DravyaDṛṣṭi – Insight into Commodities",
      description: "Navigate the Raw Material Pulse of the Global Market",
      icon: "🛢️",
      detailedContent: `🌐 See Beyond Equities — Into the World of Real Assets
DravyaDṛṣṭi offers a clear lens into the forces moving commodities and metals markets, from energy to agri to precious resources. Whether you're a trader seeking diversification or a manufacturer managing input costs, this service delivers strategic, data-rich insights that help you stay ahead of global supply-demand cycles.

📊 What You Get:
✅ Coverage of Key Commodities
Detailed outlooks on gold, silver, crude oil, copper, natural gas, and more.
✅ Agri-Commodities & Energy Trends
Insights into crops, sugar, coffee, and broader energy markets — perfect for multi-asset alignment.
✅ Data-Driven Analysis
Leverages Commitment of Traders (COT) reports, seasonality patterns, and global economic cues.
✅ Weekly Outlook Reports
Delivered every weekend — includes key price levels, fundamental triggers, and trend signals.
✅ Focus on Industrial + Precious Metals
From aluminum to zinc to gold — track the pulse of real-world demand and speculative behavior.

📌 Built For:
• Multi-asset traders looking to diversify beyond equities
• Manufacturers and exporters tracking input cost trends
• Investors interested in macro-driven cycles and inflation hedges`,
      link: "/services/dravya-drishti"
    },
    {
      title: "📘 ArthaBodha – Financial Understanding",
      description: "Investment Grade Reports for Serious Wealth Builders",
      icon: "📘",
      detailedContent: `🧠 Build Wealth with Research, Not Rumors
ArthaBodha delivers in-depth, fundamentals-first research on high-quality businesses — empowering long-term investors to make decisions based on clarity, not chatter. If you're focused on building serious capital over time, this is your edge.

📈 What You'll Get:
✅ Fundamental Analysis of Quality Stocks
Carefully selected companies with strong balance sheets, sustainable growth, and industry leadership.
✅ Deep Valuation Models
Includes Discounted Cash Flow (DCF) analysis, ratio benchmarking, and qualitative insights into the business model and management.
✅ 6–24 Month Holding Horizon
Perfect for investors with a medium-to-long-term outlook who want to buy and hold with confidence.
✅ Focus on Moat, Growth, and Value
Each report highlights the company's competitive advantage, scalability, and intrinsic value.
✅ Monthly Actionable Reports
Get one high-conviction investment idea every month — complete with valuation, risks, and portfolio context.

🎯 Ideal For:
• Long-term investors looking for research-backed stock ideas
• Professionals building wealth portfolios slowly and steadily
• Equity investors seeking conviction, not confusion`,
      link: "/services/artha-bodha"
    },
    {
      title: "AnkaManthana – Churning of Numbers",
      description: "Custom Quant Dashboard for Power Users",
      icon: "📊",
      detailedContent: `🚀 Your Personal Research Engine, Supercharged
Step into the future of market analysis with AnkaManthana, a high-performance, data-driven dashboard built for serious traders, quant researchers, and financial engineers. Whether you're running models, filtering setups, or testing strategies — this is your edge in numbers.

🧮 What You'll Get (Beta Access Soon):
✅ Custom Scans & Filters
Build your own scans using a mix of price, volume, open interest, technical indicators, and logic trees.
✅ Proprietary Screeners
Access ready-made smart filters, built on tested rules for momentum, mean-reversion, volatility crush, and more.
✅ AI/ML-Enhanced Signals (Beta Phase)
Experimental machine learning models trained on price structure, volume shifts, and volatility behavior.
✅ Raw Data for Backtesting
Download Excel/CSV files of scans and filtered setups — ready for your own models or Excel dashboards.
✅ Power Tools for Professionals
Crafted for HNIs, institutional funds, quant desks, and algo strategy builders.
  o Monthly performance tracking
  o Sector weightings and rationale
• Who It's For: Investors who prefer structured, goal-based investing.`,
      link: "/services/model-portfolios"
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