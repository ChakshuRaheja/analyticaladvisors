import React, { useState, useEffect } from 'react';

const ApiTest = () => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const testBackendConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Test the health check endpoint
      const result = await fetch('https://omkara-backend-725764883240.asia-south1.run.app/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await result.json();
      setResponse(data);
      console.log('Backend response:', data);
    } catch (err) {
      setError(err.message);
      console.error('Error connecting to backend:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">API Connectivity Test</h2>
      
      <button 
        onClick={testBackendConnection}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
        disabled={loading}
      >
        {loading ? 'Testing...' : 'Test Backend Connection'}
      </button>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold">Error:</h3>
          <p>{error}</p>
          <div className="mt-2 text-sm">
            <h4 className="font-semibold">Possible causes:</h4>
            <ul className="list-disc ml-5">
              <li>Backend server not running</li>
              <li>CORS configuration issue</li>
              <li>Network connectivity problem</li>
              <li>Backend port mismatch (expected: 3001)</li>
            </ul>
          </div>
        </div>
      )}
      
      {response && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <h3 className="font-bold">Success! Backend Connected:</h3>
          <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p>This component tests if your frontend can communicate with your backend API.</p>
        <p>Backend URL: <code>https://omkara-backend-725764883240.asia-south1.run.app/</code></p>
        <p>If you see CORS errors in the console, you need to update your backend CORS configuration.</p>
      </div>
    </div>
  );
};

export default ApiTest;
