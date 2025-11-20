// API configuration and utilities
const API_URL = import.meta.env.VITE_API_URL || 'https://smart-board-backend-2.onrender.com/api';

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Set token in localStorage
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Remove token from localStorage
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Get user from localStorage
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Set user in localStorage
export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Remove user from localStorage
export const removeUser = () => {
  localStorage.removeItem('user');
};

// Fetch wrapper with authentication
export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Add Authorization header if token exists
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // If unauthorized, clear token and user
      if (response.status === 401) {
        removeToken();
        removeUser();
        window.location.href = '/login';
      }
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Auth API calls
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const data = await fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (data.token) {
      setToken(data.token);
      setUser({ _id: data._id, name: data.name, email: data.email });
    }
    
    return data;
  },

  // Login user
  login: async (credentials) => {
    const data = await fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (data.token) {
      setToken(data.token);
      setUser({ _id: data._id, name: data.name, email: data.email });
    }
    
    return data;
  },

  // Get current user
  getMe: async () => {
    return await fetchWithAuth('/auth/me');
  },

  // Logout user
  logout: () => {
    removeToken();
    removeUser();
  },
};

export default fetchWithAuth;
