import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useGetPermissionsByUserIdQuery } from '../store/api/modules/users/usersApi';

// Decryption utility (same as AuthContext)
const decryptData = (encryptedData) => {
  try {
    return JSON.parse(atob(encryptedData));
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

export const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [userPermissions, setUserPermissions] = useState([]);
  const [permissionKeys, setPermissionKeys] = useState([]);
  const [isPermissionsLoaded, setIsPermissionsLoaded] = useState(false);
  const [userId, setUserId] = useState(null);
  const { currentUser, isAuthenticated } = useAuth();

  // Clear permissions on logout
  const clearPermissions = React.useCallback(() => {
    setUserPermissions([]);
    setPermissionKeys([]);
    setIsPermissionsLoaded(false);
    setUserId(null);
    // console.log('PermissionContext: Permissions cleared on logout');
  }, []);

  // Get user ID and check for pre-loaded permissions from encrypted session storage
  useEffect(() => {
    const getUserDataAndPermissions = () => {
      try {
        // Use the correct session storage key from AuthContext
        const encryptedUserData = sessionStorage.getItem('user_info');
        // console.log('PermissionContext: Encrypted user data:', encryptedUserData);
        
        if (encryptedUserData) {
          const userData = decryptData(encryptedUserData);
          // console.log('PermissionContext: Decrypted user data:', userData);
          
          if (userData) {
            const extractedId = userData.id || userData.userId || userData.user?.id || userData.profile?.id;
            if (extractedId) {
              // console.log('PermissionContext: Setting userId:', extractedId);
              setUserId(extractedId);
            }
            
            // Check if permissions were already loaded during login
            if (userData.fetchedPermissions && userData.permissionKeys) {
              // console.log('PermissionContext: Using pre-loaded permissions from login');
              setUserPermissions(userData.fetchedPermissions);
              setPermissionKeys(userData.permissionKeys);
              setIsPermissionsLoaded(true);
            }
          } else {
            // Fall back to AuthContext currentUser if available
            const fallbackId = currentUser?.id || currentUser?.userId || currentUser?.user?.id;
            if (fallbackId) {
              setUserId(fallbackId);
            } else {
              console.log('PermissionContext: No user ID found in userData');
            }
          }
        } else {
          console.log('PermissionContext: No encrypted user data found in sessionStorage');
          // If authenticated but session storage not yet populated, try AuthContext
          if (isAuthenticated && currentUser?.id) {
            setUserId(currentUser.id);
          } else {
            // If no user data in session storage, clear permissions (user logged out)
            if (userId || userPermissions.length > 0 || isPermissionsLoaded) {
              clearPermissions();
            }
          }
        }
      } catch (error) {
        console.error('PermissionContext: Error getting user ID from token:', error);
      }
    };

    getUserDataAndPermissions();
    
    // Set up interval to check for logout (session storage cleared)
    const checkInterval = setInterval(() => {
      const encryptedUserData = sessionStorage.getItem('user_info');
      if (!encryptedUserData && (userId || userPermissions.length > 0 || isPermissionsLoaded)) {
        console.log('PermissionContext: Detected logout, clearing permissions');
        clearPermissions();
      }
    }, 1000); // Check every second

    return () => clearInterval(checkInterval);
  }, [isAuthenticated, currentUser]); // react to auth changes

  // Fetch user permissions when userId is available
  const { 
    data: permissionsData, 
    isLoading: isLoadingPermissions, 
    error: permissionsError,
    refetch: refetchPermissions 
  } = useGetPermissionsByUserIdQuery(userId, {
    skip: !userId // Only fetch when userId is available
  });

  // Debug RTK Query state (commented out to reduce console noise)
  // useEffect(() => {
  //   console.log('PermissionContext: userId changed:', userId);
  //   console.log('PermissionContext: isLoadingPermissions:', isLoadingPermissions);
  //   console.log('PermissionContext: permissionsError:', permissionsError);
  //   console.log('PermissionContext: permissionsData:', permissionsData);
  // }, [userId, isLoadingPermissions, permissionsError, permissionsData]);

  // Update permissions when data is fetched
  useEffect(() => {
    // On successful fetch
    if (permissionsData?.data?.permissions) {
      const permissions = permissionsData.data.permissions || [];
      const keys = permissions.map(permission => permission.key);
      setUserPermissions(permissions);
      setPermissionKeys(keys);
      setIsPermissionsLoaded(true);
      return;
    }

    // If finished loading without data, consider it loaded with empty permissions
    if (!isLoadingPermissions && userId && !permissionsData && !permissionsError) {
      setUserPermissions([]);
      setPermissionKeys([]);
      setIsPermissionsLoaded(true);
      return;
    }

    // If error occurred, mark as loaded with empty permissions to avoid blocking UI
    if (permissionsError) {
      console.error('PermissionContext: permissions fetch error:', permissionsError);
      setUserPermissions([]);
      setPermissionKeys([]);
      setIsPermissionsLoaded(true);
    }
  }, [permissionsData, isLoadingPermissions, permissionsError, userId]);

  // Permission checking functions
  const hasPermission = (permissionKey) => {
    return permissionKeys.includes(permissionKey);
  };

  const hasAnyPermission = (permissionKeyArray) => {
    return permissionKeyArray.some(key => permissionKeys.includes(key));
  };

  const hasAllPermissions = (permissionKeyArray) => {
    return permissionKeyArray.every(key => permissionKeys.includes(key));
  };

  // Get allowed navigation items using PermissionRegistry
  const getAllowedNavigationItems = () => {
    try {
      const { PermissionUtils } = require('./PermissionRegistry');
      return PermissionUtils.getAccessibleNavigation(permissionKeys);
    } catch (error) {
      console.error('Error getting navigation items:', error);
      return [];
    }
  };

  // Check if user can access a specific route
  const canAccessRoute = (routeName) => {
    try {
      const { PermissionUtils } = require('./PermissionRegistry');
      const requiredPermissions = PermissionUtils.getRoutePermissions(routeName);
      return requiredPermissions.length === 0 || hasAnyPermission(requiredPermissions);
    } catch (error) {
      console.error('Error checking route access:', error);
      return false;
    }
  };

  const value = {
    userPermissions,
    permissionKeys,
    isPermissionsLoaded,
    isLoadingPermissions,
    permissionsError,
    userId,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    getAllowedNavigationItems,
    canAccessRoute,
    refetchPermissions,
    clearPermissions
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export default PermissionContext;
