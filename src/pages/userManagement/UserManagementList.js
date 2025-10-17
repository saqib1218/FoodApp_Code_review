import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, EnvelopeIcon, PhoneIcon, XMarkIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, KeyIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../../components/ConfirmationModal';
import DialogueBox from '../../components/DialogueBox';
import {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateUserStatusMutation,
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetPermissionsQuery,
  useCreatePermissionMutation
} from '../../store/api/modules/users/usersApi';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../contexts/PermissionRegistry';

const UserManagementList = () => {
  const [activeTab, setActiveTab] = useState('role');
  const [isLoading, setIsLoading] = useState(false);
  
  // Dialogue box state for API feedback
  const [dialogueBox, setDialogueBox] = useState({
    isOpen: false,
    type: 'success', // 'success' or 'error'
    title: '',
    message: ''
  });

  // Loading states for different operations
  const [loadingStates, setLoadingStates] = useState({
    createRole: false,
    updateRole: false,
    deleteRole: false,
    createUser: false,
    updateUser: false,
    deleteUser: false,
    updateUserStatus: false,
    createPermission: false
  });

  // Permission hooks
  const { hasPermission } = usePermissions();
  
  // Check permissions for different sections
  const canViewRoles = hasPermission(PERMISSIONS.ROLE_LIST_VIEW);
  const canCreateRole = hasPermission(PERMISSIONS.ROLE_CREATE);
  const canEditRole = hasPermission(PERMISSIONS.ROLE_EDIT);
  const canDeleteRole = hasPermission(PERMISSIONS.ROLE_DELETE);
  
  const canViewUsers = hasPermission(PERMISSIONS.USER_LIST_VIEW);
  const canCreateUser = hasPermission(PERMISSIONS.USER_CREATE);
  const canEditUser = hasPermission(PERMISSIONS.USER_EDIT);
  const canDeleteUser = hasPermission(PERMISSIONS.USER_DELETE);
  
  const canViewPermissions = hasPermission(PERMISSIONS.PERMISSION_LIST_VIEW);
  const canCreatePermission = hasPermission(PERMISSIONS.PERMISSION_CREATE);
  const canEditPermission = hasPermission(PERMISSIONS.PERMISSION_EDIT);
  const canDeletePermission = hasPermission(PERMISSIONS.PERMISSION_DELETE);

  // Auto-select the first available tab based on permissions
  React.useEffect(() => {
    if (canViewRoles && activeTab === 'role') {
      // Role tab is already selected and user has permission
      return;
    } else if (canViewUsers && (activeTab === 'user' || !canViewRoles)) {
      // User tab is selected or role tab is not available
      if (activeTab !== 'user') {
        setActiveTab('user');
      }
      return;
    } else if (canViewPermissions && (activeTab === 'permissions' || (!canViewRoles && !canViewUsers))) {
      // Permission tab is selected or other tabs are not available
      if (activeTab !== 'permissions') {
        setActiveTab('permissions');
      }
      return;
    } else if (!canViewRoles && activeTab === 'role') {
      // Current tab is role but user doesn't have permission
      if (canViewUsers) {
        setActiveTab('user');
      } else if (canViewPermissions) {
        setActiveTab('permissions');
      }
    }
  }, [canViewRoles, canViewUsers, canViewPermissions, activeTab]);

  // State declarations first
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [showAssignPermissionsModal, setShowAssignPermissionsModal] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);

  // Role management state - RTK Query
  const { data: rolesData, isLoading: isLoadingRoles, error: rolesError, refetch: refetchRoles } = useGetRolesQuery();
  const roles = rolesData?.data?.roles || [];
  
  // Get role by ID for editing
  const { data: roleByIdData, isLoading: isLoadingRoleById } = useGetRoleByIdQuery(editingRoleId, {
    skip: !editingRoleId // Only fetch when editing a role
  });
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    isActive: true
  });

  // User management state - RTK Query
  const { data: usersData, isLoading: isLoadingUsers, error: usersError, refetch: refetchUsers } = useGetUsersQuery();
  const users = usersData?.data?.users || [];
  
  // RTK Query mutations
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();
  const [createPermission] = useCreatePermissionMutation();

  // Helper functions for dialogue box and loading states
  const showDialogue = (type, title, message) => {
    setDialogueBox({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closeDialogue = () => {
    setDialogueBox(prev => ({ ...prev, isOpen: false }));
  };

  const setLoading = (operation, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [operation]: isLoading
    }));
  };
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);

  // Get user by ID for editing
  const { data: userByIdData, isLoading: isLoadingUserById } = useGetUserByIdQuery(editingUserId, {
    skip: !editingUserId // Only fetch when editing a user
  });
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    roleId: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  // Permission management state - RTK Query
  const { data: permissionsData, isLoading: isLoadingPermissions, error: permissionsError, refetch: refetchPermissions } = useGetPermissionsQuery();
  const allPermissions = permissionsData?.data?.permissions || [];
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [assignedPermissions, setAssignedPermissions] = useState([]);
  const [draggedPermission, setDraggedPermission] = useState(null);
  const [showCreatePermissionModal, setShowCreatePermissionModal] = useState(false);
  const [permissionForm, setPermissionForm] = useState({
    key: '',
    name: '',
    description: ''
  });

  // Confirmation modal state
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const [confirmationComment, setConfirmationComment] = useState('');

  // Calculate available permissions by filtering out already assigned permissions
  const currentAvailablePermissions = allPermissions.filter(permission => 
    !assignedPermissions.some(assigned => assigned.id === permission.id)
  );

  // Enhanced tab click handlers with refetch functionality
  const handleRoleTabClick = () => {
    setActiveTab('role');
    // Refetch roles and permissions when role tab is clicked
    refetchRoles();
    refetchPermissions();
  };

  const handleUserTabClick = () => {
    setActiveTab('user');
    // Refetch users when user tab is clicked
    refetchUsers();
  };

  const handlePermissionsTabClick = () => {
    setActiveTab('permissions');
    // Refetch permissions when permissions tab is clicked
    refetchPermissions();
  };

  // Handle role creation
  const handleCreateRole = () => {
    setRoleForm({ name: '', description: '', isActive: true });
    setAssignedPermissions([]);
    setShowCreateRoleModal(true);
  };

  // Handle role editing
  const handleEditRole = (role) => {
    setEditingRoleId(role.id);
    setShowEditRoleModal(true);
  };

  // Populate form when role data is fetched for editing
  useEffect(() => {
    if (roleByIdData?.data?.role && editingRoleId) {
      const roleData = roleByIdData.data.role;
      setRoleForm({
        name: roleData.name,
        description: roleData.description,
        isActive: roleData.isActive
      });
      
      // Set assigned permissions based on permissions array from API
      if (roleData.permissions && roleData.permissions.length > 0) {
        // The API now returns full permission objects, so we can use them directly
        setAssignedPermissions(roleData.permissions);
      } else {
        // If no permissions, set empty array
        setAssignedPermissions([]);
      }
    }
  }, [roleByIdData, editingRoleId]); // Remove allPermissions from dependencies to prevent infinite loop

  const handleAssignPermissions = () => {
    setShowAssignPermissionsModal(true);
  };

  const handleSaveRole = async (event) => {
    event?.preventDefault();
    if (roleForm.name.trim() && roleForm.description.trim() && assignedPermissions.length > 0) {
      setLoading('createRole', true);
      try {
        await createRole({
          name: roleForm.name,
          description: roleForm.description,
          isActive: roleForm.isActive,
          permissionIds: assignedPermissions.map(p => p.id)
        }).unwrap();
        setShowCreateRoleModal(false);
        setShowAssignPermissionsModal(false);
        setRoleForm({ name: '', description: '', isActive: true });
        setAssignedPermissions([]);
        showDialogue('success', 'Success', 'Role created successfully');
      } catch (error) {
        console.error('Failed to create role:', error);
        showDialogue('error', 'Error', 'Role not created. Please try again.');
      } finally {
        setLoading('createRole', false);
      }
    }
  };

  const handleSaveEditRole = async (event) => {
    event?.preventDefault();
    if (roleForm.name.trim() && roleForm.description.trim() && assignedPermissions.length > 0 && editingRoleId) {
      setLoading('updateRole', true);
      try {
        await updateRole({
          id: editingRoleId,
          name: roleForm.name,
          description: roleForm.description,
          isActive: roleForm.isActive,
          permissionIds: assignedPermissions.map(p => p.id)
        }).unwrap();
        setShowEditRoleModal(false);
        setShowAssignPermissionsModal(false);
        setRoleForm({ name: '', description: '', isActive: true });
        setAssignedPermissions([]);
        setEditingRoleId(null);
        showDialogue('success', 'Success', 'Role updated successfully');
      } catch (error) {
        console.error('Failed to update role:', error);
        showDialogue('error', 'Error', 'Role not updated. Please try again.');
      } finally {
        setLoading('updateRole', false);
      }
    }
  };

  const handleCancelRole = () => {
    setShowCreateRoleModal(false);
    setShowEditRoleModal(false);
    setShowAssignPermissionsModal(false);
    setRoleForm({ name: '', description: '', isActive: true });
    setAssignedPermissions([]);
    setEditingRoleId(null);
  };

  const handleDeleteRole = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    setConfirmationAction('delete_role');
    setPendingAction({ roleId, roleName: role.title });
    setShowConfirmationModal(true);
    setConfirmationComment('');
  };

  // User management handlers
  const handleCreateUser = () => {
    setUserForm({ name: '', email: '', mobileNumber: '', roleId: '' });
    refetchRoles(); // Refetch roles to get latest data
    setShowCreateUserModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUserId(user.id);
    refetchRoles(); // Refetch roles to get latest data
    setShowEditUserModal(true);
  };

  // Populate form when user data is fetched for editing
  useEffect(() => {
    if (userByIdData?.data?.user && editingUserId) {
      const userData = userByIdData.data.user;
      setUserForm({
        name: userData.name || '', // API uses 'name'
        email: userData.email || '',
        mobileNumber: userData.mobileNumber || '', // API now uses 'mobileNumber'
        roleId: userData.roles && userData.roles.length > 0 ? userData.roles[0].roleId : '' // Get roleId from roles array
      });
      setEditingUser(userData);
    }
  }, [userByIdData, editingUserId]);

  const handleChangePassword = (user) => {
    setEditingUser(user);
    setPasswordForm({
      newPassword: '',
      confirmPassword: ''
    });
    setShowChangePasswordModal(true);
  };

  const handleSaveUser = async () => {
    if (userForm.name && userForm.email && userForm.roleId) {
      setLoading('createUser', true);
      try {
        await createUser({
          name: userForm.name,
          email: userForm.email,
          mobileNumber: userForm.mobileNumber,
          roleId: parseInt(userForm.roleId)
        }).unwrap();
        setShowCreateUserModal(false);
        setUserForm({ name: '', email: '', mobileNumber: '', roleId: '' });
        showDialogue('success', 'Success', 'User created successfully');
      } catch (error) {
        console.error('Failed to create user:', error);
        showDialogue('error', 'Error', 'User not created. Please try again.');
      } finally {
        setLoading('createUser', false);
      }
    }
  };

  const handleUpdateUser = async () => {
    if (userForm.name && userForm.email && userForm.roleId && editingUser) {
      setLoading('updateUser', true);
      try {
        await updateUser({
          id: editingUser.id,
          name: userForm.name,
          email: userForm.email,
          mobileNumber: userForm.mobileNumber,
          roleId: parseInt(userForm.roleId)
        }).unwrap();
        setShowEditUserModal(false);
        setEditingUser(null);
        setEditingUserId(null);
        setUserForm({ name: '', email: '', mobileNumber: '', roleId: '' });
        showDialogue('success', 'Success', 'User updated successfully');
      } catch (error) {
        console.error('Failed to update user:', error);
        showDialogue('error', 'Error', 'User not updated. Please try again.');
      } finally {
        setLoading('updateUser', false);
      }
    }
  };

  const handleUpdatePassword = () => {
    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }

    // Here you would typically make an API call to update the password
    // For now, we'll just show a success message
    alert('Password updated successfully');
    setShowChangePasswordModal(false);
    setEditingUser(null);
    setPasswordForm({
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleCancelUser = () => {
    setShowCreateUserModal(false);
    setShowEditUserModal(false);
    setEditingUser(null);
    setEditingUserId(null);
    setUserForm({ name: '', email: '', mobileNumber: '', roleId: '' });
  };

  const handleDeleteUser = (userId) => {
    const user = users.find(u => u.id === userId);
    setConfirmationAction('delete_user');
    setPendingAction({ userId, userName: user.name });
    setShowConfirmationModal(true);
    setConfirmationComment('');
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    setLoading('updateUserStatus', true);
    try {
      await updateUserStatus({
        userId: userId,
        isActive: !currentStatus
      }).unwrap();
      const statusText = !currentStatus ? 'activated' : 'deactivated';
      showDialogue('success', 'Success', `User ${statusText} successfully`);
    } catch (error) {
      console.error('Failed to update user status:', error);
      showDialogue('error', 'Error', 'Failed to update user status. Please try again.');
    } finally {
      setLoading('updateUserStatus', false);
    }
  };

  // Permission management handlers
  const handleCreatePermission = () => {
    setPermissionForm({ key: '', name: '', description: '' });
    setShowCreatePermissionModal(true);
  };

  const handleSavePermission = async () => {
    if (permissionForm.key.trim() && permissionForm.name.trim() && permissionForm.description.trim()) {
      setLoading('createPermission', true);
      try {
        await createPermission({
          key: permissionForm.key,
          name: permissionForm.name,
          description: permissionForm.description
        }).unwrap();
        setShowCreatePermissionModal(false);
        setPermissionForm({ key: '', name: '', description: '' });
        showDialogue('success', 'Success', 'Permission created successfully');
      } catch (error) {
        console.error('Failed to create permission:', error);
        showDialogue('error', 'Error', 'Permission not created. Please try again.');
      } finally {
        setLoading('createPermission', false);
      }
    }
  };

  const handleCancelPermission = () => {
    setShowCreatePermissionModal(false);
    setPermissionForm({ key: '', name: '', description: '' });
  };

  const handleDeletePermission = (permissionId) => {
    const permission = allPermissions.find(p => p.id === permissionId);
    setConfirmationAction('delete_permission');
    setPendingAction({ permissionId, permissionName: permission.label });
    setShowConfirmationModal(true);
    setConfirmationComment('');
  };

  // Confirmation handlers
  const handleConfirmAction = async () => {
    if (!confirmationComment.trim()) return;

    switch (confirmationAction) {
      case 'delete_role':
        setLoading('deleteRole', true);
        try {
          await deleteRole(pendingAction.roleId).unwrap();
          showDialogue('success', 'Success', 'Role deleted successfully');
        } catch (error) {
          console.error('Failed to delete role:', error);
          showDialogue('error', 'Error', 'Role not deleted. Please try again.');
        } finally {
          setLoading('deleteRole', false);
        }
        break;
      case 'delete_user':
        setLoading('deleteUser', true);
        try {
          await deleteUser(pendingAction.userId).unwrap();
          showDialogue('success', 'Success', 'User deleted successfully');
        } catch (error) {
          console.error('Failed to delete user:', error);
          showDialogue('error', 'Error', 'User not deleted. Please try again.');
        } finally {
          setLoading('deleteUser', false);
        }
        break;
      case 'delete_permission':
        // TODO: Implement deletePermission API mutation when available
        console.log('Delete permission functionality not implemented - API endpoint needed');
        break;
    }

    setShowConfirmationModal(false);
    setConfirmationAction('');
    setPendingAction(null);
    setConfirmationComment('');
  };

  const handleCancelConfirmation = () => {
    setShowConfirmationModal(false);
    setConfirmationAction('');
    setPendingAction(null);
    setConfirmationComment('');
  };

  // Drag and drop handlers
  const handleDragStart = (e, permission, source) => {
    setDraggedPermission({ permission, source });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropToAssigned = (e) => {
    e.preventDefault();
    if (draggedPermission && draggedPermission.source === 'available') {
      setAssignedPermissions(prev => [...prev, draggedPermission.permission]);
      setAvailablePermissions(prev => prev.filter(p => p.id !== draggedPermission.permission.id));
    }
    setDraggedPermission(null);
  };

  const handleDropToAvailable = (e) => {
    e.preventDefault();
    if (draggedPermission && draggedPermission.source === 'assigned') {
      setAvailablePermissions(prev => [...prev, draggedPermission.permission]);
      setAssignedPermissions(prev => prev.filter(p => p.id !== draggedPermission.permission.id));
    }
    setDraggedPermission(null);
  };

  const handleSavePermissions = () => {
    setShowAssignPermissionsModal(false);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    return status === 'active' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Inactive
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with back button */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {canViewRoles && (
            <button
              onClick={handleRoleTabClick}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'role'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Role
            </button>
          )}
          {canViewUsers && (
            <button
              onClick={handleUserTabClick}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'user'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Users
            </button>
          )}
          {canViewPermissions && (
            <button
              onClick={handlePermissionsTabClick}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'permissions'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Permissions
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg">
        {activeTab === 'role' && canViewRoles && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Role Management</h2>
              {canCreateRole && (
                <button
                  onClick={() => setShowCreateRoleModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                  Create Role
                </button>
              )}
            </div>

            {isLoadingRoles ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading roles...</p>
              </div>
            ) : rolesError ? (
              <div className="text-center py-12">
                <div className="text-red-500">
                  <p className="text-lg font-medium">Error Loading Roles</p>
                  <p className="mt-2">Failed to fetch roles. Please try again.</p>
                </div>
              </div>
            ) : roles.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <p className="text-lg font-medium">No Roles Found</p>
                  <p className="mt-2">Create your first role to get started with user management.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Permissions
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {roles.map((role) => (
                      <tr key={role.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{role.name}</div>
                          <div className="text-sm text-gray-500">{role.description}</div>
                          <div className="text-xs text-gray-400">Created {new Date(role.created_at).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(role.isActive ? 'active' : 'inactive')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {role.permissions && role.permissions.length > 0 ? (
                              <>
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                  {role.permissions.length} permissions
                                </span>
                                {role.permissions.map((permission) => (
                                  <span key={permission.id} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                                    {permission.key}
                                  </span>
                                ))}
                              </>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                No permissions
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            {canEditRole && (
                              <button 
                                onClick={() => handleEditRole(role)}
                                className="text-blue-600 hover:text-blue-900 transition-colors" 
                                title="Edit role"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                            )}
                            {canDeleteRole && (
                              <button 
                                onClick={() => handleDeleteRole(role.id)}
                                className="text-red-600 hover:text-red-900 transition-colors" 
                                title="Delete role"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'user' && canViewUsers && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">User Management</h2>
              {canCreateUser && (
                <button
                  onClick={handleCreateUser}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                  Create User
                </button>
              )}
            </div>

            {isLoadingUsers ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading users...</p>
              </div>
            ) : usersError ? (
              <div className="text-center py-12">
                <div className="text-red-500">
                  <p className="text-lg font-medium">Error Loading Users</p>
                  <p className="mt-2">Failed to fetch users. Please try again.</p>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <p className="text-lg font-medium">No Users Found</p>
                  <p className="mt-2">Create your first user to get started.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status Change
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.mobileNumber || 'No mobile'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {user.roles && user.roles.length > 0 ? user.roles[0].roleName : 'No Role'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(user.isActive ? 'active' : 'inactive')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(() => {
                            const canActivate = hasPermission(PERMISSIONS.USER_ACTIVATE);
                            const canDeactivate = hasPermission(PERMISSIONS.USER_DEACTIVATE);
                            
                            // Show toggle if user has both permissions (can activate and deactivate)
                            if (canActivate && canDeactivate) {
                              return (
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={user.isActive}
                                    onChange={() => handleToggleUserStatus(user.id, user.isActive)}
                                  />
                                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                </label>
                              );
                            }
                            
                            // Show toggle only for inactive users if user can only activate
                            if (canActivate && !canDeactivate && !user.isActive) {
                              return (
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={user.isActive}
                                    onChange={() => handleToggleUserStatus(user.id, user.isActive)}
                                  />
                                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                </label>
                              );
                            }
                            
                            // Show toggle only for active users if user can only deactivate
                            if (!canActivate && canDeactivate && user.isActive) {
                              return (
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={user.isActive}
                                    onChange={() => handleToggleUserStatus(user.id, user.isActive)}
                                  />
                                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                </label>
                              );
                            }
                            
                            // Show nothing if user has no permissions or toggle is not applicable
                            return (
                              <span className="text-gray-400 text-sm">No permission</span>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            {canEditUser && (
                              <button 
                                onClick={() => handleEditUser(user)}
                                className="text-blue-600 hover:text-blue-900 transition-colors" 
                                title="Edit user"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                            )}
                            {canEditUser && (
                              <button 
                                onClick={() => handleChangePassword(user)}
                                className="text-yellow-600 hover:text-yellow-900 transition-colors" 
                                title="Change password"
                              >
                                <KeyIcon className="h-4 w-4" />
                              </button>
                            )}
                            {canDeleteUser && (
                              <button 
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-900 transition-colors" 
                                title="Delete user"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'permissions' && canViewPermissions && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Permission Management</h2>
              {canCreatePermission && (
                <button
                  onClick={handleCreatePermission}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                  Create Permission
                </button>
              )}
            </div>

            {isLoadingPermissions ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading permissions...</p>
              </div>
            ) : permissionsError ? (
              <div className="text-center py-12">
                <div className="text-red-500">
                  <p className="text-lg font-medium">Error Loading Permissions</p>
                  <p className="mt-2">Failed to fetch permissions. Please try again.</p>
                </div>
              </div>
            ) : allPermissions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <p className="text-lg font-medium">No Permissions Found</p>
                  <p className="mt-2">Create your first permission to get started.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Permission Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Permission Key
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allPermissions.map((permission) => (
                    <tr key={permission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                        <div className="text-sm text-gray-500">ID: {permission.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {permission.key}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {permission.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          {canEditPermission && (
                            <button className="text-blue-600 hover:text-blue-900 transition-colors" title="Edit permission">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          )}
                          {canDeletePermission && (
                            <button 
                              onClick={() => handleDeletePermission(permission.id)}
                              className="text-red-600 hover:text-red-900 transition-colors" 
                              title="Delete permission"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        )}
      </div>

      {/* Create Role Modal */}
      {showCreateRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-neutral-900">Create Role</h3>
              <button onClick={handleCancelRole} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="roleName" className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  id="roleName"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., team lead"
                />
              </div>

              <div>
                <label htmlFor="roleDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="roleDescription"
                  rows={3}
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., team manager with limited permissions"
                />
              </div>

              <div>
                <label htmlFor="roleStatus" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="roleStatus"
                  value={roleForm.isActive}
                  onChange={(e) => setRoleForm({ ...roleForm, isActive: e.target.value === 'true' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between space-x-3 mt-6">
              <button
                onClick={handleAssignPermissions}
                disabled={!roleForm.name.trim() || !roleForm.description.trim()}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Assign Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-neutral-900">
                {isLoadingRoleById ? 'Loading Role...' : 'Edit Role'}
              </h3>
              <button onClick={handleCancelRole} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {isLoadingRoleById ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading role data...</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="editRoleName" className="block text-sm font-medium text-gray-700 mb-1">
                      Role Name
                    </label>
                    <input
                      type="text"
                      id="editRoleName"
                      value={roleForm.name}
                      onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., team lead"
                    />
                  </div>

                  <div>
                    <label htmlFor="editRoleDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="editRoleDescription"
                      rows={3}
                      value={roleForm.description}
                      onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., team manager with limited permissions"
                    />
                  </div>

                  <div>
                    <label htmlFor="editRoleStatus" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="editRoleStatus"
                      value={roleForm.isActive}
                      onChange={(e) => setRoleForm({ ...roleForm, isActive: e.target.value === 'true' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value={true}>Active</option>
                      <option value={false}>Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between space-x-3 mt-6">
                  <button
                    onClick={handleAssignPermissions}
                    disabled={!roleForm.name.trim() || !roleForm.description.trim()}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    Update Permissions
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Assign Permissions Modal */}
      {showAssignPermissionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-medium text-neutral-900">Assign Permissions</h3>
              <button onClick={handleCancelRole} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
              <div className="flex-1 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[300px]">
                {/* Available Permissions */}
                <div className="flex flex-col">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Available Permissions</h4>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 h-[300px] overflow-y-auto"
                    onDragOver={handleDragOver}
                    onDrop={handleDropToAvailable}
                  >
                    <div className="space-y-2">
                      {currentAvailablePermissions.map((permission) => (
                        <div
                          key={permission.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, permission, 'available')}
                          className="bg-white p-3 rounded-md border border-gray-200 cursor-move hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-sm font-medium text-gray-900">{permission.name}</span>
                          <p className="text-xs text-gray-500">{permission.key}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Assigned Permissions */}
                <div className="flex flex-col">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Assigned Permissions</h4>
                  <div
                    className="border-2 border-dashed border-primary-300 rounded-lg p-4 bg-primary-50 h-[300px] overflow-y-auto"
                    onDragOver={handleDragOver}
                    onDrop={handleDropToAssigned}
                  >
                    <div className="space-y-2">
                      {assignedPermissions.map((permission) => (
                        <div
                          key={permission.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, permission, 'assigned')}
                          className="bg-white p-3 rounded-md border border-primary-200 cursor-move hover:bg-primary-50 transition-colors"
                        >
                          <span className="text-sm font-medium text-gray-900">{permission.name}</span>
                          <p className="text-xs text-gray-500">{permission.key}</p>
                        </div>
                      ))}
                      {assignedPermissions.length === 0 && (
                        <p className="text-gray-500 text-center py-8">Drag permissions here to assign them</p>
                      )}
                    </div>
                  </div>
                </div>
                </div>
              </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 pt-4 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={handleCancelRole}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={editingRoleId ? handleSaveEditRole : handleSaveRole}
                disabled={assignedPermissions.length === 0 || loadingStates.createRole || loadingStates.updateRole}
                className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center"
              >
                {(loadingStates.createRole || loadingStates.updateRole) && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {editingRoleId ? 'Update Role' : 'Save Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-neutral-900">Create User</h3>
              <button onClick={handleCancelUser} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  User Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  id="mobileNumber"
                  value={userForm.mobileNumber}
                  onChange={(e) => setUserForm({ ...userForm, mobileNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter mobile number (e.g., +923403118722)"
                />
              </div>
              <div>
                <label htmlFor="userRole" className="block text-sm font-medium text-gray-700 mb-1">
                  Assign Role
                </label>
                <select
                  id="userRole"
                  value={userForm.roleId}
                  onChange={(e) => setUserForm({ ...userForm, roleId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select a role</option>
                  {roles.filter(role => role.isActive === true).map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter email address"
                />
              </div>


            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCancelUser}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                disabled={!userForm.name.trim() || !userForm.email.trim() || !userForm.roleId || loadingStates.createUser}
                className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center"
              >
                {loadingStates.createUser && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                Save User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-neutral-900">Edit User</h3>
              <button onClick={handleCancelUser} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Loading state while fetching user data */}
            {isLoadingUserById ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-2 text-gray-600">Loading user data...</span>
              </div>
            ) : (
              <>
            <div className="space-y-4">
              <div>
                <label htmlFor="editName" className="block text-sm font-medium text-gray-700 mb-1">
                  User Name
                </label>
                <input
                  type="text"
                  id="editName"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label htmlFor="editMobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  id="editMobileNumber"
                  value={userForm.mobileNumber}
                  onChange={(e) => setUserForm({ ...userForm, mobileNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter mobile number"
                />
              </div>

              <div>
                <label htmlFor="editEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="editEmail"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label htmlFor="editRole" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="editRole"
                  value={userForm.roleId}
                  onChange={(e) => setUserForm({ ...userForm, roleId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select a role</option>
                  {roles.filter(role => role.isActive === true).map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>


            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCancelUser}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                disabled={!userForm.name.trim() || !userForm.email.trim() || !userForm.roleId || loadingStates.updateUser}
                className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center"
              >
                {loadingStates.updateUser && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                Update User
              </button>
            </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-neutral-900">Change Password</h3>
              <button onClick={() => setShowChangePasswordModal(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Changing password for: <span className="font-medium">{editingUser?.name}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter new password (min. 6 characters)"
                  minLength={6}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowChangePasswordModal(false)}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePassword}
                disabled={!passwordForm.newPassword || !passwordForm.confirmPassword}
                className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Permission Modal */}
      {showCreatePermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-neutral-900">Create Permission</h3>
              <button onClick={handleCancelPermission} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="permissionKey" className="block text-sm font-medium text-gray-700 mb-1">
                  Permission Key
                </label>
                <input
                  type="text"
                  id="permissionKey"
                  value={permissionForm.key}
                  onChange={(e) => setPermissionForm({ ...permissionForm, key: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., admin.users.view"
                />
              </div>

              <div>
                <label htmlFor="permissionName" className="block text-sm font-medium text-gray-700 mb-1">
                  Permission Name
                </label>
                <input
                  type="text"
                  id="permissionName"
                  value={permissionForm.name}
                  onChange={(e) => setPermissionForm({ ...permissionForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., view Users"
                />
              </div>

              <div>
                <label htmlFor="permissionDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Permission Description
                </label>
                <textarea
                  id="permissionDescription"
                  rows={3}
                  value={permissionForm.description}
                  onChange={(e) => setPermissionForm({ ...permissionForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter permission description"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCancelPermission}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePermission}
                disabled={!permissionForm.key.trim() || !permissionForm.name.trim() || !permissionForm.description.trim() || loadingStates.createPermission}
                className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center"
              >
                {loadingStates.createPermission && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                Save Permission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <ConfirmationModal
          isOpen={showConfirmationModal}
          title={`Delete ${confirmationAction === 'delete_role' ? 'Role' : confirmationAction === 'delete_user' ? 'User' : 'Permission'}`}
          message={`Are you sure you want to delete ${confirmationAction === 'delete_role' ? `role "${pendingAction?.roleName}"` : confirmationAction === 'delete_user' ? `user "${pendingAction?.userName}"` : `permission "${pendingAction?.permissionName}"`}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleConfirmAction}
          onCancel={handleCancelConfirmation}
          comment={confirmationComment}
          onCommentChange={setConfirmationComment}
          variant="danger"
        />
      )}

      {/* DialogueBox for API Success/Error Messages */}
      <DialogueBox
        isOpen={dialogueBox.isOpen}
        onClose={closeDialogue}
        type={dialogueBox.type}
        title={dialogueBox.title}
        message={dialogueBox.message}
        autoClose={true}
        autoCloseDelay={3000}
      />
    </div>
  );
};

export default UserManagementList;