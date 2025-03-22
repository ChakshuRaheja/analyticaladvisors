import { motion } from 'framer-motion';
import ScrollAnimation from '../components/ScrollAnimation';

const About = () => {
  const team = [
    {
      name: "Rahul Sharma",
      role: "Founder & CEO",
      image: "/images/team-1.jpg",
      bio: "20+ years of experience in investment management and financial advisory."
    },
    {
      name: "Priya Patel",
      role: "Head of Research",
      image: "/images/team-2.jpg",
      bio: "Expert in market analysis and portfolio optimization strategies."
    },
    {
      name: "Amit Kumar",
      role: "Technical Director",
      image: "/images/team-3.jpg",
      bio: "Leading our technological innovation and platform development."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-black text-white">
        <div className="absolute inset-0 bg-[url('/images/about-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <ScrollAnimation animation="from-bottom" delay={0.2}>
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                About Niveshartha
              </h1>
              <p className="text-lg text-gray-300">
                Learn about our journey, mission, and the team behind our success.
              </p>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <ScrollAnimation animation="from-left" delay={0.2}>
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                <p className="text-gray-600 mb-6">
                  Founded in 2020, Niveshartha emerged from a vision to democratize investment management and make sophisticated financial tools accessible to everyone.
                </p>
                <p className="text-gray-600 mb-6">
                  Our journey began with a simple idea: to combine cutting-edge technology with expert financial knowledge to create a platform that empowers investors to make informed decisions.
                </p>
                <p className="text-gray-600">
                  Today, we're proud to serve thousands of clients across India, helping them achieve their financial goals through our innovative solutions and personalized approach.
                </p>
              </div>
            </ScrollAnimation>
            <ScrollAnimation animation="from-right" delay={0.4}>
              <div className="relative">
                <div className="absolute inset-0 bg-black opacity-10 rounded-2xl transform rotate-3" />
                <img
                  src="/images/about-story.jpg"
                  alt="Our Story"
                  className="relative rounded-2xl shadow-xl"
                />
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <ScrollAnimation animation="from-bottom" delay={0.2}>
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Our Mission
              </h2>
              <p className="text-gray-600 mb-8">
                To empower every investor with the tools, knowledge, and confidence needed to make informed investment decisions and achieve their financial goals.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-6 bg-white rounded-2xl shadow-lg">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="text-xl font-bold mb-2">Innovation</h3>
                  <p className="text-gray-600">Continuously developing cutting-edge solutions</p>
                </div>
                <div className="p-6 bg-white rounded-2xl shadow-lg">
                  <div className="text-4xl mb-4">🤝</div>
                  <h3 className="text-xl font-bold mb-2">Trust</h3>
                  <p className="text-gray-600">Building lasting relationships with our clients</p>
                </div>
                <div className="p-6 bg-white rounded-2xl shadow-lg">
                  <div className="text-4xl mb-4">📈</div>
                  <h3 className="text-xl font-bold mb-2">Excellence</h3>
                  <p className="text-gray-600">Delivering superior results consistently</p>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <ScrollAnimation animation="from-bottom" delay={0.2}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Our Team
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Meet the talented individuals who are driving our success and innovation.
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <ScrollAnimation key={index} animation="from-bottom" delay={0.2 + index * 0.2}>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="relative h-64">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                    <p className="text-gray-600 mb-4">{member.role}</p>
                    <p className="text-gray-600">{member.bio}</p>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4">
          <ScrollAnimation animation="from-bottom" delay={0.2}>
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Our Values
              </h2>
              <p className="text-gray-300 mb-12">
                The principles that guide everything we do at Niveshartha.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <div className="text-4xl mb-4">💡</div>
                  <h3 className="text-xl font-bold mb-2">Innovation</h3>
                  <p className="text-gray-300">Pushing boundaries in technology and finance</p>
                </div>
                <div>
                  <div className="text-4xl mb-4">🤝</div>
                  <h3 className="text-xl font-bold mb-2">Integrity</h3>
                  <p className="text-gray-300">Operating with honesty and transparency</p>
                </div>
                <div>
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="text-xl font-bold mb-2">Excellence</h3>
                  <p className="text-gray-300">Striving for the highest standards</p>
                </div>
                <div>
                  <div className="text-4xl mb-4">👥</div>
                  <h3 className="text-xl font-bold mb-2">Client Focus</h3>
                  <p className="text-gray-300">Putting our clients' interests first</p>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  );
};

export default About; 