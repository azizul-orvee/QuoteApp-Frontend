'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';
import { authApi } from '@/lib/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

function authReducer(state, action) {
  console.log('AuthContext: State change:', { action: action.type, payload: action.payload, currentState: state });
  
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      
      if (token) {
        dispatch({ type: 'AUTH_START' });
        
        authApi.getProfile()
          .then((user) => {
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user, token },
            });
          })
          .catch((error) => {
            console.error('AuthContext: Token validation failed:', error);
            localStorage.removeItem('token');
            dispatch({ type: 'AUTH_FAILURE', payload: 'Token expired or invalid' });
          });
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: null });
      }
    } else {
      dispatch({ type: 'AUTH_FAILURE', payload: null });
    }
  }, []);

  const login = async (credentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const { user, token } = await authApi.login(credentials);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token },
      });
      
      return { success: true };
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.message || 'Login failed',
      });
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const { user, token } = await authApi.register(userData);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token },
      });
      
      return { success: true };
    } catch (error) {
      console.error('AuthContext: Registration failed:', error);
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.message || 'Registration failed',
      });
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authApi.updateProfile(profileData);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const refreshToken = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      
      const user = await authApi.getProfile();
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token },
      });
      return { success: true };
    } catch (error) {
      localStorage.removeItem('token');
      dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired. Please login again.' });
      return { success: false, error: error.message };
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
