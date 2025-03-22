import { motion } from 'framer-motion';
import ScrollAnimation from '../components/ScrollAnimation';

const Services = () => {
  const services = [
    {
      title: "Portfolio Management",
      description: "Professional portfolio management services tailored to your investment goals and risk tolerance.",
      icon: "📈",
      features: [
        "Customized investment strategies",
        "Regular portfolio rebalancing",
        "Risk management",
        "Performance tracking"
      ]
    },
    {
      title: "Investment Advisory",
      description: "Expert guidance to help you make informed investment decisions and achieve your financial goals.",
      icon: "💡",
      features: [
        "Market analysis",
        "Investment recommendations",
        "Financial planning",
        "Regular consultations"
      ]
    },
    {
      title: "Research & Analytics",
      description: "Comprehensive market research and analytics to support your investment decisions.",
      icon: "🔍",
      features: [
        "Market research reports",
        "Technical analysis",
        "Fundamental analysis",
        "Economic insights"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-black text-white">
        <div className="absolute inset-0 bg-[url('/images/services-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <ScrollAnimation animation="from-bottom" delay={0.2}>
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Our Services
              </h1>
              <p className="text-lg text-gray-300">
                Discover how our comprehensive suite of investment services can help you achieve your financial goals.
              </p>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ScrollAnimation key={index} animation="from-bottom" delay={0.2 + index * 0.2}>
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-4xl mb-6">{service.icon}</div>
                  <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                  <p className="text-gray-600 mb-6">{service.description}</p>
                  <ul className="space-y-3">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-600">
                        <span className="mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <ScrollAnimation animation="from-bottom" delay={0.2}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Our Process
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We follow a systematic approach to ensure the best results for our clients.
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Consultation",
                description: "Initial meeting to understand your goals and requirements"
              },
              {
                step: "02",
                title: "Analysis",
                description: "Comprehensive analysis of your current financial situation"
              },
              {
                step: "03",
                title: "Strategy",
                description: "Development of personalized investment strategy"
              },
              {
                step: "04",
                title: "Implementation",
                description: "Execution and ongoing management of your portfolio"
              }
            ].map((step, index) => (
              <ScrollAnimation key={index} animation="from-bottom" delay={0.2 + index * 0.2}>
                <div className="relative">
                  <div className="text-4xl font-bold text-gray-200 mb-4">{step.step}</div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
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
                Ready to Get Started?
              </h2>
              <p className="text-gray-300 mb-8">
                Contact us today to learn more about our services and how we can help you achieve your financial goals.
              </p>
              <a
                href="/contact"
                className="inline-block px-8 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  );
};

export default Services; 