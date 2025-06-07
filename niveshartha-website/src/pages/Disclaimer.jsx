import React from 'react';
import ScrollAnimation from '../components/ScrollAnimation';

const Disclaimer = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <ScrollAnimation animation="from-bottom" delay={0.2}>
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-2xl">
            <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Disclaimer & Disclosure</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Disclosures</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>The Research Analyst is registered with SEBI under registration no. ghfhfhy jyujy.</li>
                  <li>The Research Analyst/Company/Employees may hold financial interest in the recommended securities.</li>
                  <li>The research is not influenced by any business relationship or compensation from the subject company.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Disclaimer</h2>
                <p className="text-gray-700 mb-4">
                  All information presented is for educational and informational purposes only and does not constitute investment advice. Investors are advised to perform their own due diligence or consult a registered financial advisor before making investment decisions.
                </p>
                <p className="text-gray-700 mb-4">
                  Investments in securities are subject to market risks. Read all scheme related documents carefully.
                </p>
              </section>

              <hr className="my-8 border-gray-200" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Compliance</h2>
                <h3 className="text-xl font-medium mb-3">Regulatory Compliance</h3>
                <p className="text-gray-700 mb-4">
                  We strictly follow SEBI (Research Analysts) Regulations, 2014. Our internal controls ensure transparency, client confidentiality, and avoidance of conflict of interest.
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>No guaranteed returns are promised.</li>
                  <li>Research recommendations are documented and archived.</li>
                  <li>Client information is maintained with strict confidentiality.</li>
                </ul>
              </section>
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </div>
  );
};

export default Disclaimer; 