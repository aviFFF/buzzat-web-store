// Replace the direct JWT token creation with an API call
// Remove this import
// import { createToken } from '@/lib/jwt';

// Add a function to get token from API
export const getToken = async (payload: Record<string, unknown>) => {
  const response = await fetch('/api/auth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to create token');
  }
  
  return data.token;
};

// Then in your handleSubmit function, replace:
// const token = createToken(loginResult.vendor);
// with:
// const token = await getToken(loginResult.vendor);
// const token = await getToken(loginResult?.vendor);