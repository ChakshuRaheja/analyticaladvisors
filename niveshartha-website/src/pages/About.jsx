import { motion } from 'framer-motion';
import ScrollAnimation from '../components/ScrollAnimation';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-15 bg-black text-white">
        <div className="absolute inset-0 bg-[url('/images/about-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <ScrollAnimation animation="from-bottom" delay={0.2}>
            <div className="flex flex-col md:flex-row items-center max-w-3xl mx-auto py-12 m-14">
              <img
                src="/images/about_us_image.jpg"
                alt="About Us"
                className="w-full md:w-1/3 rounded-2xl shadow-2xl object-cover mb-6 md:mb-0 md:mr-8"
              />
              <div className="md:w-2/3 text-gray-200 space-y-2 text-lg">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
                <p>Donec ullamcorper nulla non metus auctor fringilla.</p>
                <p>Maecenas sed diam eget risus varius blandit sit amet non magna.</p>
                <p>Vestibulum id ligula porta felis euismod semper.</p>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section> 

      {/* Content Section */}
      <section className="py-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="container mx-auto px-8 max-w-4xl">
            <div className="prose prose-lg max-w-none">

              <h2 className="text-3xl font-bold mb-6 text-center">About Us — Analytical Advisors</h2>

              <p className="text-gray-700 mb-8">
                At <strong>Analytical Advisors</strong>, we believe that informed decisions are the foundation of wealth creation. As a <strong>SEBI-registered Research Analyst firm</strong>, our mission is to empower investors—ranging from retail participants to high-net-worth individuals and institutions—with <strong>clear, transparent, and actionable insights</strong> on the Indian stock market and commodities.
              </p>

              <p className="text-gray-700 mb-8">
                We combine <strong>fundamental research, quantitative analytics, and trading expertise</strong> to deliver recommendations that are both reliable and practical. In a market flooded with noise, we stand out by focusing on clarity, discipline, and integrity. Our approach is grounded in <strong>data-driven analysis</strong> and guided by a commitment to help our clients align their investments with their financial goals, risk appetite, and time horizon.
              </p>

              <h3 className="text-2xl font-bold mb-4">Our Philosophy</h3>
              <p className="text-gray-700 mb-8">
                Markets are unpredictable, but discipline, research, and risk management can tilt the odds in the investor's favor. At Analytical Advisors, our philosophy is shaped by three guiding principles:
              </p>
              <ul className="text-gray-700 mb-8">
                <li>
                  <strong>Transparency</strong> — Every report and recommendation we deliver is backed by disclosed methodology and relevant disclaimers. We believe investors deserve to know the <em>why</em> behind the call.
                </li>
                <li>
                  <strong>Research Rigor</strong> — From dissecting company financials and balance sheets to analyzing macroeconomic trends, sectoral cycles, and derivatives data, we ensure that our insights are built on solid foundations.
                </li>
                <li>
                  <strong>Investor Empowerment</strong> — Instead of just issuing calls, we educate clients to understand the rationale, the risks, and the potential opportunities. This ensures that wealth creation is sustainable and confidence is built over time.
                </li>
              </ul>

              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-gray-700 mb-8">
                Our vision is to become India's most trusted and respected research advisory firm, known for integrity, accuracy, and investor empowerment. We aim to bridge the gap between sophisticated institutional research and the needs of retail investors, ensuring that every market participant has access to quality insights.
              </p>
              <p className="text-gray-700 mb-8">
                We also aspire to integrate <strong>advanced analytics, AI, and machine learning models</strong> into our research framework, enabling smarter decision-making in a rapidly evolving market.
              </p>

              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <ul className="text-gray-700 mb-8">
                <li>To provide <strong>reliable, transparent, and timely research</strong> on Indian equities and commodities.</li>
                <li>To design <strong>practical trading strategies</strong> for derivatives traders.</li>
                <li>To educate and empower investors for <strong>long-term wealth creation</strong>.</li>
                <li>To uphold the <strong>highest ethical standards</strong> in research and advisory services.</li>
              </ul>

              <h3 className="text-2xl font-bold mb-4">Our Edge</h3>
              <p className="text-gray-700 mb-8">
                What makes Analytical Advisors different is our <strong>blended approach</strong>:
              </p>
              <ul className="text-gray-700 mb-8">
                <li><strong>Quantitative Analytics</strong> — Use of time-series modeling, OI analysis, and statistical tools to spot market patterns.</li>
                <li><strong>Fundamental Depth</strong> — Classic Graham-Fisher-Buffett style evaluation of business fundamentals.</li>
                <li><strong>Risk Discipline</strong> — Every call is accompanied by target levels, stop losses, and scenario analysis.</li>
                <li><strong>Regulatory Compliance</strong> — As a SEBI-registered Research Analyst, we adhere strictly to transparency, disclosure, and ethical standards.</li>
              </ul>
              <p className="text-gray-700 mb-8">
                Our research process ensures that we do not merely chase short-term trends but aim to create <strong>long-term, sustainable wealth strategies</strong>.
              </p>

              <h3 className="text-2xl font-bold mb-4">Why Choose Us</h3>
              <ul className="text-gray-700 mb-8">
                <li><strong>SEBI-Registered</strong> — Credible, compliant, and trustworthy.</li>
                <li><strong>Balanced Approach</strong> — Covering long-term investments and short-term trading opportunities.</li>
                <li><strong>Client-Centric</strong> — Every recommendation is tailored to suit different investor profiles.</li>
                <li><strong>Data-Backed Calls</strong> — No guesswork, only systematic research.</li>
                <li><strong>Educational Empowerment</strong> — We want clients to <em>understand</em> the logic, not just follow blindly.</li>
              </ul>

              <h3 className="text-2xl font-bold mb-4">Closing Note</h3>
              <p className="text-gray-700 mb-8">
                The Indian markets present vast opportunities, but with them come risks. At Analytical Advisors, we act as your <strong>research partner and guide</strong>, helping you navigate volatility with confidence. Whether you are a long-term investor seeking compounding opportunities or a trader looking for structured strategies, we provide the insights and discipline to support your journey.
              </p>

            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default About;
