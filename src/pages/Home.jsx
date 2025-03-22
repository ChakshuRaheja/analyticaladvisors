import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ScrollAnimation from '../components/ScrollAnimation';
import PhoneAnimation from '../components/PhoneAnimation';
import { useState } from 'react';

const Home = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqItems = [
    {
      question: "What kind of services do you provide ?",
      answer: "We provide comprehensive financial advisory services including investment planning, retirement planning, tax planning, and wealth management solutions tailored to your specific needs."
    },
    {
      question: "How to subscribe for the services?",
      answer: "You can subscribe to our services by filling out the contact form, calling our customer service number, or visiting our office for a personal consultation. Our team will guide you through the process."
    },
    {
      question: "What kind of due diligence is required?",
      answer: "We require basic KYC documents, financial information, and investment objectives to create a personalized financial plan. All information is kept confidential and secure."
    },
    {
      question: "How will I get the service?",
      answer: "Once you subscribe, you'll receive access to our online platform, regular consultation sessions with our financial advisors, and detailed reports on your investments and financial progress."
    },
    {
      question: "Do you provide execution services?",
      answer: "Yes, we offer complete execution services for implementing your financial plan. Our team handles the paperwork, account setup, and transactions to ensure a seamless experience."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-white text-black overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <ScrollAnimation animation="from-left" delay={0.2}>
              <div className="text-left bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-4xl md:text-6xl font-bold text-black mb-10">
                  Transform Your Investment Journey
                </h1>
                <p className="text-lg md:text-xl text-gray-700 mb-8">
                  Experience the future of investing with our cutting-edge platform. 
                  Make informed decisions with real-time insights and expert guidance.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/contact"
                    className="px-8 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/services"
                    className="px-8 py-3 border-2 border-black text-black rounded-full font-semibold hover:bg-black hover:text-white transition-colors"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </ScrollAnimation>
            <ScrollAnimation animation="from-right" delay={0.4}>
              <div className="flex justify-center md:justify-end">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSm2zxEKJjzH0fRl2-oDGFlorKlDV-wTXYnwA&s"
                  alt="In God We Trust All Others Must Bring Data"
                  className="max-w-full h-auto rounded-lg shadow-xl"
                  style={{ maxHeight: '500px', objectFit: 'contain' }}
                />
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>
      {/* card section */}
      <section className="py-16 bg-white-50">
        <div className="container mx-auto px-4">
          <ScrollAnimation animation="from-bottom" delay={0.2}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Your Investment Journey</h2>
              <h6 className="text-sm text-gray-600">Define Your Financial Requirements</h6>
            </div>
          </ScrollAnimation>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <ScrollAnimation animation="from-left" delay={0.3}>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
                <img src="https://img.freepik.com/free-photo/children-playing-grass_1098-504.jpg" alt="Save For Children" className="w-full h-48 object-cover"/>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-3">Save For Children</h3>
                  <p className="text-gray-600 mb-4 flex-grow">we helps you build a financial plan to save for your children's needs such as higher education, marriage, etc. through multiple investment options.</p>
                  <div className="text-center mt-auto">
                    <Link to="/save-for-children" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">Learn More</Link>
                  </div>
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="from-left" delay={0.4}>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
                <img src="https://m.economictimes.com/thumb/msid-83058275,width-1200,height-900,resizemode-4,imgsize-657040/old-age3-getty.jpg" alt="Retirement Planning" className="w-full h-48 object-cover"/>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-3">Retirement Planning</h3>
                  <p className="text-gray-600 mb-4 flex-grow">Secure your golden years with our comprehensive retirement planning solutions. We help you build a robust portfolio for a comfortable retirement.</p>
                  <div className="text-center mt-auto">
                    <Link to="/retirement-planning" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">Learn More</Link>
                  </div>
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="from-left" delay={0.5}>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTDqoPkDxn5AeiQYO1ZPxEe5hbPOnZ_m1QOw&s" alt="Wealth Creation" className="w-full h-48 object-cover"/>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-3">Wealth Creation</h3>
                  <p className="text-gray-600 mb-4 flex-grow">Grow your wealth systematically with our expert-guided investment strategies. We help you achieve your financial goals through diversified investments.</p>
                  <div className="text-center mt-auto">
                    <Link to="/wealth-creation" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">Learn More</Link>
                  </div>
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="from-left" delay={0.6}>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
                <img src="https://emsme-resource.s3.ap-south-1.amazonaws.com/prod/blog/YmyLNXAmE8IEog4zcWKWt.png" alt="Save Tax" className="w-full h-48 object-cover"/>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-3">Save Tax</h3>
                  <p className="text-gray-600 mb-4 flex-grow">Track and optimize your savings with our intelligent saving solutions. We help you monitor your expenses and maximize your savings potential.</p>
                  <div className="text-center mt-auto">
                    <Link to="/save-trax" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">Learn More</Link>
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <ScrollAnimation animation="from-bottom" delay={0.2}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose Analytical Advisors?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We combine cutting-edge technology with expert insights to provide you with the best investment experience.
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Smart Analytics",
                description: "Get real-time insights and predictive analytics to make informed investment decisions.",
                icon: "📊"
              },
              {
                title: "Expert Guidance",
                description: "Access personalized advice from experienced financial advisors and market experts.",
                icon: "👨‍💼"
              },
              {
                title: "Secure Platform",
                description: "Your investments are protected with state-of-the-art security measures and encryption.",
                icon: "🔒"
              }
            ].map((feature, index) => (
              <ScrollAnimation key={index} animation="from-bottom" delay={0.2 + index * 0.2}>
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white-50">
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
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      {/* <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <ScrollAnimation animation="from-left" delay={0.2}>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Experience Our Platform
                </h2>
                <p className="text-gray-600 mb-8">
                  Take a tour of our intuitive platform and see how it can transform your investment journey.
                </p>
                <Link
                  to="/contact"
                  className="inline-block px-8 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-colors"
                >
                  Start Your Journey
                </Link>
              </div>
            </ScrollAnimation>
            <ScrollAnimation animation="from-right" delay={0.4}>
              <PhoneAnimation />
            </ScrollAnimation>
          </div>
        </div>
      </section> */}

      {/* About Section */}
      {/* <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <ScrollAnimation animation="from-left" delay={0.2}>
              <div className="relative">
                <div className="absolute inset-0 bg-black opacity-10 rounded-2xl transform rotate-3" />
                <img
                  src="/images/about-image.jpg"
                  alt="About Niveshartha"
                  className="relative rounded-2xl shadow-xl"
                />
              </div>
            </ScrollAnimation>
            <ScrollAnimation animation="from-right" delay={0.4}>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  About Niveshartha
                </h2>
                <p className="text-gray-600 mb-6">
                  We are a team of passionate financial experts and technologists dedicated to revolutionizing the investment landscape.
                </p>
                <p className="text-gray-600 mb-8">
                  Our mission is to make sophisticated investment tools accessible to everyone, helping you achieve your financial goals with confidence.
                </p>
                <Link
                  to="/about"
                  className="inline-block px-8 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-colors"
                >
                  Learn More About Us
                </Link>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default Home; 