import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Create context
export const AuthContext = createContext();

// Enhanced encryption utilities for secure storage
const encryptData = (data) => {
  try {
    // Simple encryption - in production, use crypto-js for stronger encryption
    return btoa(JSON.stringify(data));
  } catch (error) {
    console.error('Encryption failed:', error);
    return null;
  }
};

const decryptData = (encryptedData) => {
  try {
    return JSON.parse(atob(encryptedData));
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

// Enhanced Token storage utilities with persistent access token
const TokenStorage = {
  // Access token in encrypted sessionStorage (survives page refresh)
  setAccessToken: (token) => {
    if (token) {
      // Store encrypted in sessionStorage for persistence
      const encrypted = encryptData({ token, timestamp: Date.now() });
      if (encrypted) {
        sessionStorage.setItem('access_token', encrypted);
      }
      // Set axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      sessionStorage.removeItem('access_token');
      delete axios.defaults.headers.common['Authorization'];
    }
  },
  
  getAccessToken: () => {
    try {
      const encrypted = sessionStorage.getItem('access_token');
      if (!encrypted) return null;
      
      const decrypted = decryptData(encrypted);
      return decrypted?.token || null;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  },
  
  // User info in encrypted sessionStorage
  setUserInfo: (userInfo) => {
    if (userInfo) {
      const encrypted = encryptData(userInfo);
      if (encrypted) {
        sessionStorage.setItem('user_info', encrypted);
      }
    } else {
      sessionStorage.removeItem('user_info');
    }
  },
  
  getUserInfo: () => {
    const encrypted = sessionStorage.getItem('user_info');
    return encrypted ? decryptData(encrypted) : null;
  },
  
  // Note: Refresh token not used in this implementation
  // Backend only provides access token
  
  // Store token expiry info
  setTokenExpiry: (expiresIn) => {
    const expiryTime = Date.now() + (expiresIn * 1000);
    const encrypted = encryptData({ expiryTime });
    if (encrypted) {
      sessionStorage.setItem('token_expiry', encrypted);
    }
  },
  
  getTokenExpiry: () => {
    const encrypted = sessionStorage.getItem('token_expiry');
    return encrypted ? decryptData(encrypted) : null;
  },
  
  isTokenExpired: () => {
    const tokenExpiry = TokenStorage.getTokenExpiry();
    if (!tokenExpiry) return true;
    
    // Add 5-minute buffer for safety
    return Date.now() >= (tokenExpiry.expiryTime - 300000);
  },
  
  // Clear all stored data
  clearAll: () => {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user_info');
    sessionStorage.removeItem('token_expiry');
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  
  // Refs for token refresh management
  const refreshTimeoutRef = useRef(null);
  const isRefreshingRef = useRef(false);

  // Schedule automatic token refresh
  const scheduleTokenRefresh = useCallback((expiresIn) => {
    // Clear existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    // Schedule refresh 5 minutes before expiry
    const refreshTime = (expiresIn - 300) * 1000; // Convert to milliseconds, subtract 5 minutes
    
    if (refreshTime > 0) {
      refreshTimeoutRef.current = setTimeout(() => {
        refreshToken();
      }, refreshTime);
    }
  }, []);

  // Note: Refresh token functionality not implemented
  // Backend only provides access token without refresh capability
  const refreshToken = useCallback(async () => {
    console.log('Token refresh not available - redirecting to login');
    logout();
  }, []);

  // Login function with real API integration and coordinated permission loading
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      
      // Get API base URL from environment variables
      const apiBaseUrl = process.env.REACT_APP_API_URL;
      
      // Call your login API
      const response = await axios.post(`${apiBaseUrl}/admin/auth/login`, {
        email,
        password
      });
      
      console.log('Login API Response:', response.data);
      
      // Extract access token from the API response
      const { accessToken } = response.data.data;
      
      // Decode the JWT access token to get user information
      const decodedToken = jwtDecode(accessToken);
      console.log('Decoded JWT Token:', decodedToken);
      
      // Calculate token expiry time (exp is in seconds, convert to milliseconds)
      const expiresIn = decodedToken.exp - Math.floor(Date.now() / 1000);
      
      // Store access token securely with persistence
      TokenStorage.setAccessToken(accessToken);
      TokenStorage.setTokenExpiry(expiresIn);
      
      // Extract user info from decoded JWT payload
      const userInfo = {
        id: decodedToken.userId,
        name: decodedToken.name,
        email: decodedToken.email,
        mobileNumber: decodedToken.mobileNumber,
        role: decodedToken.role,
        isActive: decodedToken.isActive,
        permissions: decodedToken.permissions || [] // Add permissions if they exist in JWT
      };
      TokenStorage.setUserInfo(userInfo);
      
      // CRITICAL FIX: Fetch user permissions and WAIT for completion before setting auth state
      console.log('Login successful, fetching user permissions...');
      try {
        const permissionsResponse = await axios.get(`${apiBaseUrl}/admin/users/${decodedToken.userId}/permissions`);
        console.log('Permissions API Response:', permissionsResponse.data);
        
        if (permissionsResponse.data?.data?.permissions) {
          const permissions = permissionsResponse.data.data.permissions;
          const permissionKeys = permissions.map(permission => permission.key);
          
          // Update userInfo with fetched permissions
          userInfo.fetchedPermissions = permissions;
          userInfo.permissionKeys = permissionKeys;
          TokenStorage.setUserInfo(userInfo);
          
          console.log('Permissions loaded successfully:', permissionKeys);
          
          // ONLY set authentication state AFTER permissions are successfully loaded
          setCurrentUser(userInfo);
          setIsAuthenticated(true);
          setUserRole(decodedToken.role);
          setUserPermissions(permissionKeys); // Use fetched permission keys
          
          // Set up automatic token refresh (if you implement refresh later)
          if (expiresIn > 0) {
            scheduleTokenRefresh(expiresIn);
          }
          
          return { success: true, userInfo };
        } else {
          // If permissions API returns empty or invalid data, throw error
          throw new Error('Permissions API returned invalid data');
        }
      } catch (permissionError) {
        console.error('Failed to fetch permissions during login:', permissionError);
        
        // CRITICAL: Don't allow login to complete if permissions fail
        // Clear stored tokens since login is incomplete
        TokenStorage.clearAll();
        
        return { 
          success: false, 
          message: 'Failed to load user permissions. Please try again.' 
        };
      }
      
    } catch (error) {
      console.error('Login failed:', error);
      
      // Clear any stored tokens on login failure
      TokenStorage.clearAll();
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = useCallback(() => {
    // Clear refresh timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    // Clear all tokens and user info
    TokenStorage.clearAll();
    
    // Reset state
    setCurrentUser(null);
    setUserRole(null);
    setUserPermissions([]);
    setIsAuthenticated(false);
  }, []);

  // Check if user has specific role
  const hasRole = useCallback((requiredRole) => {
    if (!userRole) return false;
    
    // For simple role check
    if (typeof requiredRole === 'string') {
      return userRole === requiredRole;
    }
    
    // For array of roles
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }
    
    return false;
  }, [userRole]);

  // Check if user has specific permission
  const hasPermission = useCallback((requiredPermission) => {
    if (!userPermissions || userPermissions.length === 0) return false;
    
    // For simple permission check
    if (typeof requiredPermission === 'string') {
      return userPermissions.includes(requiredPermission);
    }
    
    // For array of permissions (check if user has ANY of the permissions)
    if (Array.isArray(requiredPermission)) {
      return requiredPermission.some(perm => userPermissions.includes(perm));
    }
    
    return false;
  }, [userPermissions]);

  // Session restoration on app load
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const accessToken = TokenStorage.getAccessToken();
        
        if (!accessToken) {
          setIsLoading(false);
          return;
        }
        
        // Decode the JWT to get user info and check expiry
        try {
          const decodedToken = jwtDecode(accessToken);
          const currentTime = Math.floor(Date.now() / 1000);
          
          // Check if token is expired
          if (decodedToken.exp < currentTime) {
            console.log('Token expired, logging out');
            logout();
            setIsLoading(false);
            return;
          }
          
          // Try to get stored user info first (which may have fetched permissions)
          let userInfo = TokenStorage.getUserInfo();
          
          if (!userInfo) {
            // Fallback to decoded token if no stored user info
            userInfo = {
              id: decodedToken.userId,
              name: decodedToken.name,
              email: decodedToken.email,
              mobileNumber: decodedToken.mobileNumber,
              role: decodedToken.role,
              isActive: decodedToken.isActive,
              permissions: decodedToken.permissions || []
            };
            TokenStorage.setUserInfo(userInfo);
          }
          
          // Restore session state - use fetched permissions if available
          setCurrentUser(userInfo);
          setIsAuthenticated(true);
          setUserRole(decodedToken.role);
          setUserPermissions(userInfo.permissionKeys || decodedToken.permissions || []);
          
          // Set axios header
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
          console.log('Session restored successfully');
          
        } catch (decodeError) {
          console.error('Failed to decode token:', decodeError);
          logout();
        }
      } catch (error) {
        console.error('Session restoration failed:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };
    
    restoreSession();
  }, [logout]);

  // Set up axios interceptor for handling 401 responses
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        // If we get a 401, the token is likely expired - logout user
        if (error.response?.status === 401) {
          console.log('Received 401 response - token expired, logging out');
          logout();
        }
        
        return Promise.reject(error);
      }
    );
    
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  const value = {
    currentUser,
    isAuthenticated,
    isLoading,
    userRole,
    userPermissions,
    login,
    logout,
    hasRole,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
