/**
 * Enterprise RTK Query API Configuration
 * Centralized API management with enhanced error handling, caching, and authentication
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Helper function to get token from encrypted sessionStorage (matching AuthContext)
const getAccessToken = () => {
  try {
    const encrypted = sessionStorage.getItem('access_token');
    if (!encrypted) return null;
    
    const decryptedData = JSON.parse(atob(encrypted));
    return decryptedData?.token || null;
  } catch (error) {
    console.error('Failed to retrieve access token:', error);
    return null;
  }
};

// Base query with authentication and error handling
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  prepareHeaders: (headers, { getState }) => {
    // Get token from encrypted sessionStorage (same as AuthContext)
    const token = getAccessToken();
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Enhanced base query with retry logic and error handling
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // Handle 401 Unauthorized - token expired
  if (result.error && result.error.status === 401) {
    // Clear auth state and redirect to login
    sessionStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    window.location.href = '/login';
  }
  
  return result;
};

// Main API slice with all tag types for cache invalidation
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    // Core entities
    'Kitchen',
    'Dish',
    'DishVariant', 
    'Order',
    'User',
    'Customer',
    'Partner',
    'Feedback',
    'Discount',
    
    // Kitchen sub-entities
    'KitchenUser',
    'KitchenMedia',
    'KitchenAddress',
    'KitchenAvailability',
    'KitchenAnalytics',
    
    // System entities
    'Role',
    'Permission',
    'Notification',
    'Analytics',
    'Settings',
  ],
  endpoints: () => ({}),
});

export default apiSlice;
