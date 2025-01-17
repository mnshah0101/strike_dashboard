import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const authService = {
  login: async ({ email, password }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password
      });
      
      if (!response.data?.token) {
        throw new Error('No token received');
      }
      
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Login failed');
    }
  },

  validateToken: async (token) => {
    if (!token) return false;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/players`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.status === 200;
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        return false;
      }
      return true;
    }
  },

  logout: () => {
    localStorage.removeItem('bearerToken');
    window.location.href = '/login';
  }
}; 