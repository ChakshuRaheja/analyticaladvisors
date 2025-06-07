import React from 'react';
import { Link } from 'react-router-dom';
import ScrollAnimation from '../components/ScrollAnimation';

const InvestorCharter = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Analytical Advisors<br />
            INVESTOR CHARTER
          </h1>
          <p className="text-sm text-gray-400">In respect of Research Analyst (RA)</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-md rounded-lg p-6 md:p-8 w-full">
          <ScrollAnimation>
            <section className="mb-8">
              <p className="text-gray-700 mb-6">
                Analytical Advisors is a SEBI registered Research analyst having <strong><u>SEBI Registration number </u></strong><strong><u>INH000009047</u></strong>. This charter (hereinafter to be referred as the "Investor charter" or the "Charter") is prepared in terms of SEBI circular SEBI/HO/IMD/IMDII CIS/P/CIR/2021/0685 dated December 13, 2021.
              </p>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">1. Vision and Mission statement for investors</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                <li><strong>Vision:</strong> Invest with knowledge & safety.</li>
                <li><strong>Mission:</strong> Every investor should be able to invest in right investment products based on their needs, manage and monitor them to meet their goals, access reports and enjoy financial wellness.</li>
              </ul>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">2. Details of business transacted by the Research Analyst with respect to the investors</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                <li>To publish research report based on the research activities of the RA.</li>
                <li>To provide an independent unbiased view on securities.</li>
                <li>To offer unbiased recommendation, disclosing the financial interests in recommended securities.</li>
                <li>To provide research recommendation, based on analysis of publicly available information and known observations.</li>
                <li>To conduct audit annually.</li>
              </ul>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">3. Details of services provided to investors (No indicative Timelines)</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                <li>Onboarding of Clients.</li>
                <li>Disclosure to Clients
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-2">
                    <li>To distribute research reports and recommendations to the clients without discrimination.</li>
                    <li>To maintain confidentiality w.r.t publication of the research report until made available in the public domain.</li>
                  </ul>
                </li>
              </ul>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">4. Details of grievance redressal mechanism and how to access it</h3>
              <p className="text-gray-700 mb-3">
                In case of any grievance / complaint, an investor should approach the concerned research analyst and shall ensure that the grievance is resolved within 30 days.
              </p>
              <p className="text-gray-700 mb-3">
                If the investor's complaint is not redressed satisfactorily, one may lodge a complaint with SEBI on SEBI's SCORES portal which is a centralized web-based complaints redressal system. SEBI takes up the complaints registered via SCORES with the concerned intermediary for timely redressal. SCORES facilitates tracking the status of the complaint.
              </p>
              <p className="text-gray-700 mb-6">
                With regard to physical complaints, investors may send their complaints to: Office of Investor Assistance and Education, Securities and Exchange Board of India, SEBI Bhavan. Plot No. C4-A, 'G' Block, Bandra-Kurla Complex, Bandra (E), Mumbai – 400 051.
              </p>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">5. Expectations from the investors (Responsibilities of investors)</h3>
              
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Do's</h4>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Always deal with SEBI registered Research Analyst.</li>
                <li>Ensure that the Research Analyst has a valid registration certificate.</li>
                <li>Check for SEBI registration number.</li>
                <li>Please refer to the list of all SEBI registered Research Analysts which is available on SEBI website in the following link: (<a href="https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=14" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=14</a>)</li>
                <li>Always pay attention towards disclosures made in the research reports before investing.</li>
                <li>Pay your Research Analyst through banking channels only and maintain duly signed receipts mentioning the details of your payments.</li>
                <li>Before buying securities or applying in public offer, check for the research recommendation provided by your research Analyst.</li>
                <li>Ask all relevant questions and clear your doubts with your Research Analyst before acting on the recommendation.</li>
                <li>Inform SEBI about Research Analyst offering assured or guaranteed returns.</li>
              </ul>
              
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Don'ts</h4>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                <li>Do not provide funds for investment to the Research Analyst.</li>
                <li>Don't fall prey to luring advertisements or market rumours.</li>
                <li>Do not get attracted to limited period discount or other incentive, gifts, etc. offered by Research Analyst.</li>
                <li>Do not share login credentials and password of your trading and demat accounts with the Research Analyst</li>
              </ul>
              
              <p className="text-gray-700 mb-4">
                <strong>Note:</strong> For registering any grievance, please visit "Investor Grievances page". SEBI SCORES can be accessed via <a href="http://www.scores.gov.in" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">www.scores.gov.in</a>
              </p>
            </section>
          </ScrollAnimation>
        </div>
        
        <div className="text-center mt-8">
          <Link to="/" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InvestorCharter; 