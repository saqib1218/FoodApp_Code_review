import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PermissionGate, { PermissionButton } from '../components/PermissionGate';
import { usePermissions } from '../hooks/usePermissions';
import { useAuth } from '../hooks/useAuth';

const PermissionsDemo = () => {
  const { hasPermission, utils } = usePermissions();
  const { userPermissions, hasRole } = useAuth();
  const [selectedPermission, setSelectedPermission] = useState('');

  // Example items that would be filtered by permission
  const demoItems = [
    { id: 1, name: 'View Kitchens', permission: 'view_kitchens' },
    { id: 2, name: 'Edit Kitchen', permission: 'edit_kitchen' },
    { id: 3, name: 'Approve Dish', permission: 'approve_dish' },
    { id: 4, name: 'View Orders', permission: 'view_orders' },
    { id: 5, name: 'Manage Users', permission: 'manage_users' },
    { id: 6, name: 'View Analytics', permission: 'view_analytics' }
  ];

  // Filter items based on current permissions
  const filteredItems = demoItems.filter(item => {
    return item.permission ? hasPermission(item.permission) : true;
  });

  return (
    <div className="p-6 text-center text-neutral-600">Working on it...</div>
  );
};

export default PermissionsDemo;
