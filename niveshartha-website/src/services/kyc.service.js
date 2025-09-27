const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const initiateKYC = async (data) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/kyc/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    return await res.json();
  } catch (error) {
    console.error('KYC Init Error:', error);
    throw error;
  }
};


export const verifyKYCStatus = async (requestID) => {
  const res = await fetch(`${API_BASE_URL}/api/kyc/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({requestID}),
    credentials: 'include'
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'KYC verification failed');
  return result; // Return whole result, including data/status
};


