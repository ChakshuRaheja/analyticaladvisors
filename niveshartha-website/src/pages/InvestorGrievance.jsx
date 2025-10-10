import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ScrollAnimation from '../components/ScrollAnimation';

const InvestorGrievance = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto pt-16 pb-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-400">
            Analytical Advisors<br />
            INVESTOR GRIEVANCE
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-md rounded-lg p-6 mb-6 md:p-8">
          <ScrollAnimation>
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Number Of Client's Complaints</h2>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Data of every month ending, 2025 (Data is updated on 7th of every month)</h3>
                <div className="overflow-x-auto mb-6">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received from</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending at the end of last month</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pending</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending complaints &gt; 3 months</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Resolution time (in days)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Directly from investor</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">SEBI (SCORES)</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Other Sources (if any)</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                      </tr>
                      <tr className="bg-gray-50 font-medium">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Grand Total</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 italic">
                  *Average Resolution time is the sum total of time taken to resolve each complaint in days, in the current month divided by total number of complaints resolved in the current month.
                </p>
              </div>
            </div>
          </ScrollAnimation>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6 mb-6 md:p-8">
          <ScrollAnimation>
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Trend of Monthly disposal of complaints</h2>
              
              <div className="mb-8">
                <div className="overflow-x-auto mb-6">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr No.</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received from</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carried Forward From Previous Month</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-sm">
                      {[
                        ['1', 'Sep, 2024', 0, 0, 0, 0],
                        ['2', 'Oct, 2024', 0, 0, 0, 0],
                        ['3', 'Nov, 2024', 0, 0, 0, 0],
                        ['4', 'Dec, 2024', 0, 0, 0, 0],
                        ['5', 'Jan, 2025', 0, 0, 0, 0],
                        ['6', 'Feb, 2025', 0, 0, 0, 0],
                        ['7', 'Mar, 2025', 0, 0, 0, 0],
                        ['8', 'Apr, 2025', 0, 0, 0, 0],
                        ['9', 'May, 2025', 0, 0, 0, 0],
                        ['10', 'Jun, 2025', 0, 0, 0, 0],
                        ['11', 'Jul, 2025', 0, 0, 0, 0],
                        ['12', 'Aug, 2025', 0, 0, 0, 0],
                      ].map(([sr, month, carried, received, resolved, pending]) => (
                        <tr key={sr}>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{sr}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">{month}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">{carried}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">{received}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">{resolved}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">{pending}</td>
                        </tr>
                      ))}

                      <tr className="bg-gray-50 font-medium text-gray-900">
                        <td className="px-6 py-4 whitespace-nowrap" colSpan={2}>Grand Total of last 12 months</td>
                        <td className="px-6 py-4 whitespace-nowrap">15</td>
                        <td className="px-6 py-4 whitespace-nowrap">19</td>
                        <td className="px-6 py-4 whitespace-nowrap">17</td>
                        <td className="px-6 py-4 whitespace-nowrap">12</td>
                      </tr>
                    </tbody>

                  </table>
                </div>
                <p className="text-xs text-gray-500 italic">
                  *Inclusive of complaints of previous months resolved in the current month.
                </p>
                <p className="text-xs text-gray-500 italic">
                  *Inclusive of complaints pending as on the last day of the month.                  
                </p>
              </div>
            </div>
          </ScrollAnimation>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6 mb-6 md:p-8">
          <ScrollAnimation>
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Trend of Monthly disposal of complaints</h2>
              
              <div className="mb-8">
                <div className="overflow-x-auto mb-6">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr No.</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received from</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carried Forward From Previous Month</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-sm">
                      {[
                        ['1', '2022-2023'],
                        ['2', '2023-2024'],
                        ['3', '2024-2025'],
                        ['4', '2025-2026'],
                      ].map(([sr, year]) => (
                        <tr key={sr}>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{sr}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">{year}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">0</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">0</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">0</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">0</td>
                        </tr>
                      ))}

                      <tr className="bg-gray-50 font-medium text-gray-900">
                        <td className="px-6 py-4 whitespace-nowrap" colSpan={2}>Grand Total</td>
                        <td className="px-6 py-4 whitespace-nowrap">0</td>
                        <td className="px-6 py-4 whitespace-nowrap">0</td>
                        <td className="px-6 py-4 whitespace-nowrap">0</td>
                        <td className="px-6 py-4 whitespace-nowrap">0</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>

        <div className="mb-6 md:p-8">
          <ScrollAnimation>
            <div className="space-y-6 text-sm text-gray-700 leading-7">
                      <p>
                        <strong>Note:</strong>
                        <br />
                        1. Clients can seek clarification to their query and are further entitled to make a complaint in writing, orally or telephonically.
                        An email may be sent to the Client Servicing Team at <a href="mailto:support@analyticaladvisors.in" className="text-blue-600 underline">support@analyticaladvisors.in</a>. 
                        Alternatively, the Investor may call on <a href="tel:+919752918378" className="text-blue-600 underline">+91 9752918378</a>.
                      </p>

                      <p>
                        2. A letter may also be written with the query/complaint and posted at the below-mentioned address: <br />
                        <span className="block mt-1 font-medium">Analytical Advisors, GBP No.32 Ground Floor New Market, Timarpur, National Capital Territory of Delhi, Delhi, 110007, India.</span>
                      </p>

                      <p>
                        3. Clients can write to the research analyst at <a href="mailto:support@analyticaladvisors.in" className="text-blue-600 underline">support@analyticaladvisors.in</a> 
                        if the Investor does not receive a response within 10 business days of writing to the Client Servicing Team.
                        The client can expect a reply within 10 business days of approaching the research analyst.
                      </p>

                      <p>
                        4. In case you are not satisfied with our response, you can lodge your grievance with SEBI at 
                        <a href="https://scores.sebi.gov.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline"> https://scores.sebi.gov.in/</a> or you may also write to any of the offices of SEBI. 
                        SCORES may be accessed through the SCORES mobile application as well, which can be downloaded from:
                        <a href="https://play.google.com/store/search?q=scores%20sebi&c=apps&hl=en" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline"> Google Play Store</a>.
                      </p>

                      <p>
                        5. In case you are not satisfied with the response from SEBI, you can lodge your grievance with SMARTODR at: 
                        <a href="https://smartodr.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline"> https://smartodr.in/</a>
                      </p>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </div>
  );
};

export default InvestorGrievance;