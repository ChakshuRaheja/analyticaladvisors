const API_BASE_URL = 'https://omkara-backend-725764883240.asia-south1.run.app';

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
  try {
    const res = await fetch(`${API_BASE_URL}/api/kyc/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestID }), // Send { requestID: "value" }
      credentials: 'include'
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'KYC verification failed');
    return result;
  } catch (error) {
    console.error('KYC Verify Error:', error);
    throw error;
  }
};
