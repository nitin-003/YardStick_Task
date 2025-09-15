import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';

// Initial state
const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

// Action types
const ActionTypes = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ERROR: 'LOGIN_ERROR',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.LOGIN_START:
      return { ...state, isLoading: true };
    case ActionTypes.LOGIN_SUCCESS:
      return { 
        ...state, 
        user: action.payload.user, 
        token: action.payload.token, 
        isLoading: false, 
        isAuthenticated: true 
      };
    case ActionTypes.LOGIN_ERROR:
      return { 
        ...state, 
        user: null, 
        token: null, 
        isLoading: false, 
        isAuthenticated: false 
      };
    case ActionTypes.LOGOUT:
      return { 
        ...state, 
        user: null, 
        token: null, 
        isLoading: false, 
        isAuthenticated: false 
      };
    case ActionTypes.SET_USER:
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: true, 
        isLoading: false 
      };
    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

// Context
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          const response = await authAPI.me();
          dispatch({ 
            type: ActionTypes.SET_USER, 
            payload: response.data?.user || JSON.parse(userData) 
          });
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: ActionTypes.LOGOUT });
        }
      } else {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    };
    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    dispatch({ type: ActionTypes.LOGIN_START });
    try {
      const response = await authAPI.login(credentials);
      
      // Handle both response structures
      const user = response.user || response.data?.user;
      const token = response.token || response.data?.token;
      
      if (!user || !token) {
        throw new Error('Invalid response format from server');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({ 
        type: ActionTypes.LOGIN_SUCCESS, 
        payload: { user, token } 
      });
      return { success: true };
    } catch (error) {
      dispatch({ type: ActionTypes.LOGIN_ERROR });
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Login failed' 
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: ActionTypes.LOGOUT });
  };

  // Update user info
  const updateUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    dispatch({ type: ActionTypes.SET_USER, payload: userData });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;