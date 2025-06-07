import React from 'react';
import ScrollAnimation from './ScrollAnimation';

const ClientComplaints = () => {
  // Sample complaint data for the table - replace with actual data when available
  const complaintData = [
    {
      source: 'Directly from investor',
      pendingLastMonth: 0,
      received: 0,
      resolved: 0,
      totalPending: 0,
      pendingOver3Months: 0,
      avgResolutionTime: 0
    },
    {
      source: 'SEBI (SCORES)',
      pendingLastMonth: 1,
      received: 0,
      resolved: 1,
      totalPending: 0,
      pendingOver3Months: 0,
      avgResolutionTime: 15
    },
    {
      source: 'Other Sources (if any)',
      pendingLastMonth: 0,
      received: 0,
      resolved: 0,
      totalPending: 0,
      pendingOver3Months: 0,
      avgResolutionTime: 0
    }
  ];
  
  // Calculate grand total row
  const grandTotal = {
    source: 'Grand Total',
    pendingLastMonth: complaintData.reduce((sum, row) => sum + row.pendingLastMonth, 0),
    received: complaintData.reduce((sum, row) => sum + row.received, 0),
    resolved: complaintData.reduce((sum, row) => sum + row.resolved, 0),
    totalPending: complaintData.reduce((sum, row) => sum + row.totalPending, 0),
    pendingOver3Months: complaintData.reduce((sum, row) => sum + row.pendingOver3Months, 0),
    avgResolutionTime: 15 // This is calculated differently in real data
  };
  
  // Current month and year for the heading
  const currentDate = new Date();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = monthNames[currentDate.getMonth()]; // Use current month from monthNames array
  const year = currentDate.getFullYear(); // Use current year

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <ScrollAnimation animation="from-bottom" delay={0.2}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              Number Of Client's Complaints
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We are committed to providing excellent service and resolving any client concerns promptly and effectively.
            </p>
          </div>
        </ScrollAnimation>

        <ScrollAnimation animation="from-bottom" delay={0.3}>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Data of the month ending {month}, {year} (Data is updated on 7th of every month)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Received from</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Pending at the end of last month</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Received</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Resolved</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Total Pending</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Pending complaints &gt; 3 months</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Resolution time (in days)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {complaintData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">{row.source}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">{row.pendingLastMonth}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">{row.received}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">{row.resolved}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">{row.totalPending}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">{row.pendingOver3Months}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.avgResolutionTime}</td>
                    </tr>
                  ))}
                  {/* Grand Total Row */}
                  <tr className="bg-gray-50 font-medium">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">{grandTotal.source}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">{grandTotal.pendingLastMonth}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">{grandTotal.received}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">{grandTotal.resolved}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">{grandTotal.totalPending}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">{grandTotal.pendingOver3Months}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{grandTotal.avgResolutionTime}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-3 text-xs text-gray-500 italic">
              *Average Resolution time is the sum total of time taken to resolve each complaint in days, in the current month divided by total number of complaints resolved in the current month. For more details <a href="/investor-grievance" className="text-[#008080] hover:underline"> click here</a>
            </div>
          </div>
        </ScrollAnimation>

        <ScrollAnimation animation="from-bottom" delay={0.7}>
          <div className="text-center mt-10">

          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
};

export default ClientComplaints;