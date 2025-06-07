import { motion } from 'framer-motion';
import ScrollAnimation from '../components/ScrollAnimation';

const Contact = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      {/* <section className="relative py-20 bg-black text-white">
        <div className="absolute inset-0 bg-[url('/images/contact-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <ScrollAnimation animation="from-bottom" delay={0.2}>
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Contact Us
              </h1>
              <p className="text-lg text-gray-300">
                Get in touch with us to learn more about our services and how we can help you achieve your financial goals.
              </p>
            </div>
          </ScrollAnimation>
        </div>
      </section> */}

      {/* Contact Form Section */}
      <section className="py-28">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <ScrollAnimation animation="from-left" delay={0.2}>
              <div>
                <h2 className="text-3xl font-bold mb-6">Send us a Message</h2>
                <form className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Your phone number"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Your message"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-8 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="from-right" delay={0.4}>
              <div>
                <h2 className="text-3xl font-bold mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Office Address</h3>
                    <p className="text-gray-600">
                    GBP No.32 Ground Floor New Market,Timarpur<br />
                    National Capital Territory of Delhi<br />
                    Delhi,110007


                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Phone Numbers</h3>
                    <p className="text-gray-600">
                    +91 95994 49376
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Email</h3>
                    <p className="text-gray-600">
                      
                      support @analyticaladvisors.com
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Business Hours</h3>
                    <p className="text-gray-600">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 9:00 AM - 1:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
                  <div className="flex space-x-4">
                    <a href="#" className="text-gray-600 hover:text-black">
                      <span className="sr-only">Facebook</span>
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                      </svg>
                    </a>
                    <a href="#" className="text-gray-600 hover:text-black">
                      <span className="sr-only">Twitter</span>
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                    <a href="#" className="text-gray-600 hover:text-black">
                      <span className="sr-only">LinkedIn</span>
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-.88-.06-1.601-1-1.601-1 0-1.16.781-1.16 1.601v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <ScrollAnimation animation="from-bottom" delay={0.2}>
            <div className="aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d7121.36602474021!2d77.22171684260763!3d28.697887160438054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1s%20Ground%20Floor%20New%20Market%2CTimarpur%20National%20Capital%20Territory%20of%20Delhi%20Delhi%2C110007!5e0!3m2!1sen!2sin!4v1746706739387!5m2!1sen!2sin" 
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  );
};

export default Contact; 