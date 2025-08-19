const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

// Debug API configuration
console.log('API Configuration:', {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  API_BASE_URL,
  NODE_ENV: process.env.NODE_ENV
});

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function handleResponse(response) {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // If response is not JSON, create a basic error object
      errorData = { message: `HTTP error! status: ${response.status}` };
    }
    
    console.error('API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      errorData
    });
    
    throw new ApiError(
      errorData.message || errorData.error || `HTTP error! status: ${response.status}`,
      response.status
    );
  }
  
  try {
    const data = await response.json();
    return data;
  } catch (e) {
    console.error('Failed to parse JSON response:', e);
    throw new ApiError('Invalid JSON response from server', response.status);
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle authentication errors specifically
    if (response.status === 401) {
      // Clear invalid token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      throw new ApiError('Authentication failed. Please login again.', 401);
    }
    
    if (response.status === 403) {
      throw new ApiError('Access denied. You do not have permission for this action.', 403);
    }
    
    const result = await handleResponse(response);
    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error', 0);
  }
}

// Authentication API calls
export const authApi = {
  register: async (userData) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Validate response format
    if (!response || typeof response !== 'object') {
      throw new ApiError('Invalid response format from registration API', 0);
    }
    
    // Handle the actual backend response format
    if (response.success && response.data) {
      return response.data;
    } else if (response.user && response.token) {
      return response;
    } else {
      console.warn('Unexpected registration API response format:', response);
      throw new ApiError('Invalid response format from registration API', 0);
    }
  },
  
  login: async (credentials) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Validate response format
    if (!response || typeof response !== 'object') {
      throw new ApiError('Invalid response format from login API', 0);
    }
    
    // Handle the actual backend response format
    if (response.success && response.data) {
      return response.data;
    } else if (response.user && response.token) {
      return response;
    } else {
      console.warn('Unexpected login API response format:', response);
      throw new ApiError('Invalid response format from login API', 0);
    }
  },
  
  getProfile: async () => {
    const response = await apiRequest('/auth/me');
    
    if (!response || typeof response !== 'object') {
      throw new ApiError('Invalid response format from profile API', 0);
    }
    
    // Handle the actual backend response format
    if (response.success && response.data) {
      return response.data;
    }
    
    return response;
  },
  
  updateProfile: async (profileData) => {
    const response = await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    
    if (!response || typeof response !== 'object') {
      throw new ApiError('Invalid response format from profile update API', 0);
    }
    
    // Handle the actual backend response format
    if (response.success && response.data) {
      return response.data;
    }
    
    return response;
  },
  
  getUserProfile: async (userId) => {
    const response = await apiRequest(`/auth/profile/${userId}`);
    
    if (!response || typeof response !== 'object') {
      throw new ApiError('Invalid response format from user profile API', 0);
    }
    
    // Handle the actual backend response format
    if (response.success && response.data) {
      return response.data;
    }
    
    return response;
  },
};

// Quotes API calls
export const quotesApi = {
  getAll: async (params = {}) => {
    const searchParams = new URLSearchParams(params);
    const response = await apiRequest(`/quotes?${searchParams.toString()}`);
    
    // Validate response format
    if (!response || typeof response !== 'object') {
      throw new ApiError('Invalid response format from quotes API', 0);
    }
    
    // Handle the actual backend response format
    if (response.success && response.data && Array.isArray(response.data)) {
      return {
        quotes: response.data,
        total: response.data.length
      };
    } else if (response.success && response.data && response.data.quotes) {
      return {
        quotes: response.data.quotes,
        total: response.data.total || response.data.quotes.length
      };
    } else if (response.quotes) {
      return {
        quotes: response.quotes,
        total: response.total || response.quotes.length
      };
    } else if (Array.isArray(response)) {
      return { quotes: response, total: response.length };
    } else {
      console.warn('Unexpected quotes API response format:', response);
      return { quotes: [], total: 0 };
    }
  },
  
  getById: async (id) => {
    const response = await apiRequest(`/quotes/${id}`);
    
    if (!response || typeof response !== 'object') {
      throw new ApiError('Invalid response format from quote API', 0);
    }
    
    // Handle the actual backend response format
    if (response.success && response.data) {
      return response.data;
    }
    
    return response;
  },
  
  create: async (quoteData) => {
    const response = await apiRequest('/quotes', {
      method: 'POST',
      body: JSON.stringify(quoteData),
    });
    
    if (!response || typeof response !== 'object') {
      throw new ApiError('Invalid response format from quote creation API', 0);
    }
    
    // Handle the actual backend response format
    if (response.success && response.data) {
      return response.data;
    }
    
    return response;
  },
  
  update: async (id, quoteData) => {
    const response = await apiRequest(`/quotes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(quoteData),
    });
    
    if (!response || typeof response !== 'object') {
      throw new ApiError('Invalid response format from quote update API', 0);
    }
    
    // Handle the actual backend response format
    if (response.success && response.data) {
      return response.data;
    }
    
    return response;
  },
  
  delete: async (id) => {
    const response = await apiRequest(`/quotes/${id}`, {
      method: 'DELETE',
    });
    
    return response;
  },
  
  getByUser: async (userId, params = {}) => {
    const searchParams = new URLSearchParams(params);
    const response = await apiRequest(`/quotes/user/${userId}?${searchParams.toString()}`);
    
    if (!response || typeof response !== 'object') {
      throw new ApiError('Invalid response format from user quotes API', 0);
    }
    
    // Handle the actual backend response format
    if (response.success && response.data && Array.isArray(response.data)) {
      return {
        quotes: response.data,
        total: response.data.length
      };
    } else if (response.success && response.data && response.data.quotes) {
      return {
        quotes: response.data.quotes,
        total: response.data.total || response.data.quotes.length
      };
    } else if (response.quotes) {
      return {
        quotes: response.quotes,
        total: response.total || response.quotes.length
      };
    } else if (Array.isArray(response)) {
      return { quotes: response, total: response.length };
    } else {
      console.warn('Unexpected user quotes API response format:', response);
      return { quotes: [], total: 0 };
    }
  },
};

// Reactions API calls
export const reactionsApi = {
  like: (quoteId) => apiRequest(`/quotes/${quoteId}/like`, {
    method: 'POST',
  }),
  
  dislike: (quoteId) => apiRequest(`/quotes/${quoteId}/dislike`, {
    method: 'POST',
  }),
};
