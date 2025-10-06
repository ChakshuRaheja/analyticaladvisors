const API_BASE_URL = 'https://omkara-backend-725764883240.asia-south1.run.app';

export const initiateEsign = async (data) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/esign/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    console.log(' [DEBUG] eSign API response status:', res.status);
    console.log(' [DEBUG] eSign API response ok:', res.ok);
        const result = await res.json();
        console.log(' [DEBUG] eSign API response body:', result);
        return result;
  } catch (error) {
    console.error('ESign Init Error:', error);
    throw error;
  }
};

export const verifyEsignStatus = async (requestId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/esign/verify?requestId=${requestId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'ESign verification failed');
    return result;
  } catch (error) {
    console.error('ESign Verify Error:', error);
    throw error;
  }
};
