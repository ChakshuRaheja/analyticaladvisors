import { motion } from 'framer-motion';
import ScrollAnimation from '../components/ScrollAnimation';

const Portfolio = () => {
  const portfolios = [
    {
      title: "Growth Portfolio",
      description: "A balanced portfolio focused on long-term capital appreciation.",
      image: "/images/portfolio-1.jpg",
      stats: {
        returns: "+15.2%",
        risk: "Medium",
        horizon: "5+ years"
      }
    },
    {
      title: "Income Portfolio",
      description: "A conservative portfolio designed for steady income generation.",
      image: "/images/portfolio-2.jpg",
      stats: {
        returns: "+8.5%",
        risk: "Low",
        horizon: "3+ years"
      }
    },
    {
      title: "Aggressive Portfolio",
      description: "A high-growth portfolio for investors with higher risk tolerance.",
      image: "/images/portfolio-3.jpg",
      stats: {
        returns: "+22.7%",
        risk: "High",
        horizon: "7+ years"
      }
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-black text-white">
        <div className="absolute inset-0 bg-[url('/images/portfolio-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <ScrollAnimation animation="from-bottom" delay={0.2}>
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Our Portfolios
              </h1>
              <p className="text-lg text-gray-300">
                Explore our carefully curated investment portfolios designed to meet different investment objectives.
              </p>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {portfolios.map((portfolio, index) => (
              <ScrollAnimation key={index} animation="from-bottom" delay={0.2 + index * 0.2}>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-48">
                    <img
                      src={portfolio.image}
                      alt={portfolio.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black opacity-40" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-2">{portfolio.title}</h3>
                    <p className="text-gray-600 mb-6">{portfolio.description}</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Returns</div>
                        <div className="text-lg font-bold text-green-600">{portfolio.stats.returns}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Risk</div>
                        <div className="text-lg font-bold">{portfolio.stats.risk}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Horizon</div>
                        <div className="text-lg font-bold">{portfolio.stats.horizon}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <ScrollAnimation animation="from-bottom" delay={0.2}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Performance Track Record
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our consistent track record of delivering superior returns across market cycles.
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                year: "2023",
                returns: "+18.5%",
                benchmark: "+12.3%"
              },
              {
                year: "2022",
                returns: "+15.2%",
                benchmark: "+8.7%"
              },
              {
                year: "2021",
                returns: "+22.7%",
                benchmark: "+16.4%"
              },
              {
                year: "2020",
                returns: "+19.8%",
                benchmark: "+14.2%"
              }
            ].map((year, index) => (
              <ScrollAnimation key={index} animation="from-bottom" delay={0.2 + index * 0.2}>
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <div className="text-2xl font-bold mb-4">{year.year}</div>
                  <div className="mb-2">
                    <div className="text-sm text-gray-500">Our Returns</div>
                    <div className="text-xl font-bold text-green-600">{year.returns}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Benchmark</div>
                    <div className="text-xl font-bold">{year.benchmark}</div>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4">
          <ScrollAnimation animation="from-bottom" delay={0.2}>
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Start Your Investment Journey
              </h2>
              <p className="text-gray-300 mb-8">
                Let us help you choose the right portfolio that aligns with your financial goals.
              </p>
              <a
                href="/contact"
                className="inline-block px-8 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Started
              </a>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  );
};

export default Portfolio; 