import React from 'react';
import BasicTest from '../components/BasicTest';

const TestPage = () => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Test Page for Client Complaints</h1>
      <div className="bg-white p-4 rounded shadow-md">
        <BasicTest />
      </div>
    </div>
  );
};

export default TestPage;
