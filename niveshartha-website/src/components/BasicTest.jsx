import React from 'react';

const BasicTest = () => {
  return (
    <div className="bg-red-100 border-red-500 border-2 p-6 rounded-lg my-6">
      <h2 className="text-2xl text-red-700 font-bold">Basic Test Component</h2>
      <p className="text-red-600 mt-2">If you can see this text, component rendering is working properly.</p>
      <div className="flex items-center justify-center mt-4">
        <div className="bg-red-200 p-4 rounded">
          <p className="font-bold">Test Data:</p>
          <ul className="list-disc ml-5">
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BasicTest;
