import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ScrollAnimation from '../components/ScrollAnimation';

const InvestorGrievance = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Analytical Advisors<br />
            INVESTOR GRIEVANCE
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-md rounded-lg p-6 md:p-8">
          <ScrollAnimation>
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Number Of Client's Complaints</h2>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Data of the month ending April, 2025 (Data is updated on 7th of every month)</h3>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">15</td>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">15</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 italic">
                  *Average Resolution time is the sum total of time taken to resolve each complaint in days, in the current month divided by total number of complaints resolved in the current month.
                </p>
              </div>

              {/* Monthly Disposal Table */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Trend of Monthly disposal of complaints</h3>
                <div className="overflow-x-auto mb-6">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr No.</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carried Forward From Previous Month</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">May, 2024</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Jun, 2024</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">3</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Jul, 2024</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">4</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Aug, 2024</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">5</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Sep, 2024</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">6</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Oct, 2024</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">7</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Nov, 2024</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">8</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Dec, 2024</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">9</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Jan, 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">10</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Feb, 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">4</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">11</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Mar, 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">12</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Apr, 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                      </tr>
                      <tr className="bg-gray-50 font-medium">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Grand Total of last 12 months</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">13</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">15</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">12</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">4</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 italic">
                  *Inclusive of complaints of previous months resolved in the current month.<br />
                  *Inclusive of complaints pending as on the last day of the month.
                </p>
              </div>

              {/* Annual Disposal Table */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Trend of Annual disposal of complaints</h3>
                <div className="overflow-x-auto mb-6">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr No.</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received From</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carried Forward From Previous Year</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2022-2023</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2023-2024</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">4</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">4</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">3</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2024-2025</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">15</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">15</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </div>
  );
};

export default InvestorGrievance;