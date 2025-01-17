export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  // Only handle auth errors specifically
  if (error.response?.status === 401 || error.response?.status === 403) {
    localStorage.removeItem('bearerToken');
    window.location.href = '/login';
    return;
  }

  // For other errors, just return the error message
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  return error.message || 'An error occurred';
}; 