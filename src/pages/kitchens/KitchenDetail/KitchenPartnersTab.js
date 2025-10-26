import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetKitchenPartnersQuery } from '../../../store/api/modules/kitchens/kitchensApi';
import { useAuth } from '../../../hooks/useAuth';
import { PermissionButton } from '../../../components/PermissionGate';
import { KitchenContext } from './index';
import { PERMISSIONS } from '../../../contexts/PermissionRegistry';
import { XMarkIcon, UserPlusIcon, ClipboardDocumentIcon, PencilIcon, TrashIcon, EyeIcon, ChatBubbleLeftRightIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../../../components/ConfirmationModal';

const KitchenPartnersTab = () => {
  const { id: kitchenId } = useContext(KitchenContext);
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  
  // Check permission first
  const canViewKitchenPartners = hasPermission(PERMISSIONS.KITCHEN_PARTNER_LIST_VIEW);
  
  // RTK Query to fetch kitchen partners data - only if user has permission
  const { data: partnersResponse, isLoading: isLoadingUsers, error } = useGetKitchenPartnersQuery(kitchenId, {
    skip: !canViewKitchenPartners || !kitchenId
  });
  
  // Extract partners data from API response
  const kitchenUsers = partnersResponse?.data || [];
  
  // State variables
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [showUnblockPinModal, setShowUnblockPinModal] = useState(false);
  const [showDeleteTokenModal, setShowDeleteTokenModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [showUserDocumentsModal, setShowUserDocumentsModal] = useState(false);
  const [userDocuments, setUserDocuments] = useState([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  
  // Invite user states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  
  // Edit and Delete modal states
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showUpdateConfirmModal, setShowUpdateConfirmModal] = useState(false);
  const [showViewUserModal, setShowViewUserModal] = useState(false);
  const [deleteComment, setDeleteComment] = useState('');
  const [updateComment, setUpdateComment] = useState('');
  // Row actions menu state (3-dots)
  const [openMenuFor, setOpenMenuFor] = useState(null); // user id/index
  const [openMenuPos, setOpenMenuPos] = useState({ top: 0, left: 0 });
  const handleOpenMenu = (e, rowKey) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 176; // 44 * 4
    const menuHeight = 144; // approx
    const gap = 8;
    const top = rect.top + window.scrollY - menuHeight - gap; // open upward
    const left = rect.right + window.scrollX - menuWidth; // right align
    setOpenMenuPos({ top, left });
    setOpenMenuFor(openMenuFor === rowKey ? null : rowKey);
  };
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    role: '',
    status: ''
  });

  // Remove the early return - we'll handle permission check in the table section only

  // Generate random 5-digit code
  const generateInviteCode = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  // Handle invite user
  const handleInviteUser = () => {
    setInviteName('');
    setInvitePhone('');
    setShowInviteModal(true);
  };

  // Submit invite
  const handleSubmitInvite = () => {
    if (!inviteName.trim() || !invitePhone.trim()) {
      alert('Please fill in all fields');
      return;
    }

    // Generate code and show code modal
    const code = generateInviteCode();
    setGeneratedCode(code);
    setShowInviteModal(false);
    setShowCodeModal(true);

    // TODO: Implement API call to invite user
    console.log('Invite user:', { name: inviteName, phone: invitePhone });
  };

  // Copy code to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setIsCopied(true);
      // Reset after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
      alert('Failed to copy code');
    }
  };

  // Close code modal
  const handleCloseCodeModal = () => {
    setShowCodeModal(false);
    setGeneratedCode('');
    setInviteName('');
    setInvitePhone('');
    setIsCopied(false);
  };

  // Handle view user
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewUserModal(true);
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditUserForm({
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileNumber || user.phone || '',
      role: user.role,
      status: user.status
    });
    setShowEditUserModal(true);
  };

  // Handle delete user
  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteConfirmModal(true);
  };

  // Handle save edit user
  const handleSaveEditUser = () => {
    if (!editUserForm.name.trim() || !editUserForm.email.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    // TODO: Implement API call to update user
    console.log('Update user:', { userId: selectedUser.id, ...editUserForm });
    
    setShowEditUserModal(false);
    setSelectedUser(null);
    setEditUserForm({ name: '', email: '', mobileNumber: '', role: '', status: '' });
  };

  // Handle confirm delete user
  const handleConfirmDeleteUser = () => {
    // TODO: Implement API call to delete user
    console.log('Delete user:', { userId: selectedUser.id, comment: deleteComment });
    setShowDeleteConfirmModal(false);
    setSelectedUser(null);
    setDeleteComment('');
  };

  // Handle confirm update user
  const handleConfirmUpdateUser = () => {
    if (!editUserForm.name.trim() || !editUserForm.email.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    // TODO: Implement API call to update user
    console.log('Update user:', { userId: selectedUser.id, ...editUserForm, comment: updateComment });
    
    // Close all modals and reset state
    setShowUpdateConfirmModal(false);
    setShowEditUserModal(false);
    setSelectedUser(null);
    setEditUserForm({ name: '', email: '', mobileNumber: '', role: '', status: '' });
    setUpdateComment('');
  };

  // Handle chat with user
  const handleChatWithUser = (user) => {
    console.log('KitchenPartnersTab - Chat clicked for user:', user);
    
    // Try different possible ID properties and use index as fallback
    const userId = user.id || user.userId || user.ID || user.user_id || user.partnerId || Date.now();
    
    const navigationData = {
      partnerId: userId,
      partnerName: user.name,
      partnerEmail: user.email,
      partnerPhone: user.mobilenumber || user.phone,
      openChat: true
    };
    
    console.log('KitchenPartnersTab - Navigating with data:', navigationData);
    
    // Navigate to engagement page with user information
    navigate('/engagement', {
      state: navigationData
    });
  };

  // Handle status update
  const handleStatusUpdate = (user, status) => {
    setSelectedUser(user);
    setNewStatus(status);
    setStatusComment('');
    setShowStatusModal(true);
  };

  const confirmStatusUpdate = async () => {
    if (!statusComment.trim()) {
      alert('Please provide a comment for status update');
      return;
    }

    try {
      // TODO: Implement API call to update user status
      console.log('Update user status:', { 
        userId: selectedUser.id, 
        status: newStatus, 
        comment: statusComment 
      });
      
      setShowStatusModal(false);
    } catch (err) {
      console.error('Failed to update user status:', err);
    }
  };

  // Handle PIN unblock
  const handleUnblockPin = (user) => {
    setSelectedUser(user);
    setStatusComment('');
    setShowUnblockPinModal(true);
  };

  const confirmUnblockPin = async () => {
    if (!statusComment.trim()) {
      alert('Please provide a comment for unblocking PIN');
      return;
    }

    try {
      // TODO: Implement API call to unblock PIN
      console.log('Unblock PIN:', { 
        userId: selectedUser.id, 
        comment: statusComment 
      });
      
      setShowUnblockPinModal(false);
    } catch (err) {
      console.error('Failed to unblock PIN:', err);
    }
  };

  // Handle token deletion
  const handleDeleteToken = (token, user) => {
    setSelectedUser(user);
    setSelectedToken(token);
    setStatusComment('');
    setShowDeleteTokenModal(true);
  };

  const confirmDeleteToken = async () => {
    if (!statusComment.trim()) {
      alert('Please provide a comment for deleting this token');
      return;
    }

    try {
      // TODO: Implement API call to delete token
      console.log('Delete token:', { 
        userId: selectedUser.id, 
        tokenId: selectedToken.id,
        comment: statusComment 
      });
      
      setShowDeleteTokenModal(false);
    } catch (err) {
      console.error('Failed to delete user token:', err);
    }
  };

  // Handle view documents
  const handleViewDocuments = async (user) => {
    setSelectedUser(user);
    setShowUserDocumentsModal(true);
    
    try {
      // TODO: Implement API call to load user documents
      console.log('Load user documents:', { userId: user.id });
      setUserDocuments([]);
    } catch (err) {
      console.error('Failed to load user documents:', err);
    }
  };

  // Get relative time
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const now = new Date();
    const lastActive = new Date(timestamp);
    const diffInMinutes = Math.floor((now - lastActive) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hr ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return lastActive.toLocaleDateString();
  };

  // Get status badge
  const getUserStatusBadge = (status) => {
    const label = (status || 'N/A');
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        {label}
      </span>
    );
  };

  if (isLoadingUsers) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-neutral-900">Kitchen Partners</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Manage partners associated with this kitchen.
            </p>
          </div>
          <button
            onClick={handleInviteUser}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <UserPlusIcon className="h-4 w-4 mr-2" />
            Invite User
          </button>
        </div>
      </div>

      {!canViewKitchenPartners ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Access Denied</h3>
            <p className="text-neutral-500">You don't have permission to access the list of the partners.</p>
          </div>
        </div>
      ) : kitchenUsers.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 rounded-lg">
          <p className="text-neutral-500">No partners found for this kitchen.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Partner
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  PIN Status
                </th>
                
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {kitchenUsers.map((user, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-neutral-900">{user.name || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900">
                      {(() => {
                        const roles = (user.roles && user.roles.length > 0) ? user.roles : ['N/A'];
                        const transformed = roles.map(r => {
                          const t = String(r || '').toUpperCase();
                          return t === 'USER' ? 'PARTNER' : t;
                        });
                        return transformed.join(', ');
                      })()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getUserStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      N/A
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative inline-block text-left">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center p-2 rounded-full hover:bg-neutral-100 text-neutral-700"
                        onClick={(e) => handleOpenMenu(e, `user-${index}`)}
                        aria-haspopup="menu"
                        aria-expanded={openMenuFor === `user-${index}`}
                      >
                        <EllipsisVerticalIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Floating row actions menu */}
      {openMenuFor && (
        <div className="fixed inset-0 z-[70]" onClick={() => setOpenMenuFor(null)}>
          <div
            className="absolute w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
            style={{ top: openMenuPos.top, left: openMenuPos.left }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              {(() => {
                const idx = Number(String(openMenuFor).replace('user-',''));
                const row = kitchenUsers[idx];
                if (!row) return null;
                return (
                  <>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      onClick={() => { handleChatWithUser(row); setOpenMenuFor(null); }}
                    >
                      Chat
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      onClick={() => { handleEditUser(row); setOpenMenuFor(null); }}
                    >
                      Edit Partner
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      onClick={() => { handleViewUser(row); setOpenMenuFor(null); }}
                    >
                      View Partner
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-neutral-900">
                {newStatus === 'active' 
                  ? `Activate ${selectedUser.name}` 
                  : newStatus === 'suspended'
                  ? `Suspend ${selectedUser.name}`
                  : `Update ${selectedUser.name}'s Status`
                }
              </h3>
              <p className="text-sm text-neutral-500 mt-1">
                {newStatus === 'active' 
                  ? 'This will allow the user to access the kitchen account.' 
                  : newStatus === 'suspended'
                  ? 'This will prevent the user from accessing the kitchen account.'
                  : 'Please confirm the status change.'
                }
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Comment (Required)
              </label>
              <textarea
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                rows="3"
                placeholder="Enter your comments here..."
              />
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusUpdate}
                className={`px-4 py-2 rounded-full text-white text-sm font-medium ${
                  newStatus === 'active' 
                    ? 'bg-primary-600 hover:bg-primary-700' 
                    : newStatus === 'suspended'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unblock PIN Modal */}
      {showUnblockPinModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-neutral-900">
                Unblock PIN for {selectedUser.name}
              </h3>
              <p className="text-sm text-neutral-500 mt-1">
                This will reset the PIN attempt counter and allow the user to use their PIN again.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Comment (Required)
              </label>
              <textarea
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                rows="3"
                placeholder="Enter your comments here..."
              />
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowUnblockPinModal(false)}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmUnblockPin}
                className="px-4 py-2 bg-yellow-600 text-white rounded-full hover:bg-yellow-700 transition-colors text-sm font-medium"
              >
                Unblock PIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Token Modal */}
      {showDeleteTokenModal && selectedUser && selectedToken && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-neutral-900">
                Delete Trusted Device
              </h3>
              <p className="text-sm text-neutral-500 mt-1">
                This will remove the trusted device from {selectedUser.name}'s account. The user will need to verify their identity again when logging in from this device.
              </p>
            </div>
            <div className="mb-4">
              <h4 className="text-sm font-medium text-neutral-700">Device Details:</h4>
              <div className="mt-2 bg-neutral-50 p-3 rounded-lg">
                <p className="text-sm"><span className="font-medium">Device:</span> {selectedToken.device}</p>
                <p className="text-sm"><span className="font-medium">Last Used:</span> {new Date(selectedToken.lastUsed).toLocaleString()}</p>
                <p className="text-sm"><span className="font-medium">Location:</span> {selectedToken.location}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Comment (Required)
              </label>
              <textarea
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                rows="3"
                placeholder="Enter your comments here..."
              />
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowDeleteTokenModal(false)}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteToken}
                className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Delete Device
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Documents Modal */}
      {showUserDocumentsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-neutral-900">
                {selectedUser.name}'s Documents
              </h3>
              <button
                onClick={() => setShowUserDocumentsModal(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            {isLoadingDocuments ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : userDocuments.length === 0 ? (
              <div className="text-center py-12 bg-neutral-50 rounded-lg">
                <p className="text-neutral-500">No documents found for this user.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userDocuments.map((doc) => (
                  <div key={doc.id} className="border border-neutral-200 rounded-lg overflow-hidden">
                    <div className="aspect-w-16 aspect-h-9 bg-neutral-100">
                      <img 
                        src={doc.url} 
                        alt={doc.type} 
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x200?text=Document+Preview+Not+Available';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-neutral-900">{doc.type}</h4>
                      <p className="text-sm text-neutral-500">Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}</p>
                      <p className="text-sm text-neutral-500">Status: {doc.status}</p>
                      <div className="mt-2">
                        <a 
                          href={doc.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                        >
                          View Full Size
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-neutral-900">
                Invite User
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter user name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter mobile number"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitInvite}
                className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code Generation Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                Invitation Code Generated
              </h3>
              
              <p className="text-sm text-neutral-500 mb-6">
                Share this 5-digit code with the user to complete their registration.
              </p>
              
              <div className="bg-neutral-50 rounded-lg p-4 mb-6">
                <div className="text-3xl font-bold text-primary-600 tracking-wider">
                  {generatedCode}
                </div>
              </div>
              
              <div className="flex justify-center space-x-3">
                <button
                  onClick={handleCopyCode}
                  className={`inline-flex items-center px-4 py-2 rounded-full transition-colors text-sm font-medium ${
                    isCopied 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
                  {isCopied ? 'Copied' : 'Copy Code'}
                </button>
                <button
                  onClick={handleCloseCodeModal}
                  className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-neutral-900">
                Edit User
              </h3>
              <button
                onClick={() => setShowEditUserModal(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={editUserForm.name}
                  onChange={(e) => setEditUserForm({...editUserForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter user name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={editUserForm.email}
                  onChange={(e) => setEditUserForm({...editUserForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={editUserForm.mobileNumber}
                  onChange={(e) => setEditUserForm({...editUserForm, mobileNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter mobile number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Role
                </label>
                <select
                  value={editUserForm.role}
                  onChange={(e) => setEditUserForm({...editUserForm, role: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Staff">Staff</option>
                  <option value="Manager">Manager</option>
                  <option value="Owner">Owner</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Status
                </label>
                <select
                  value={editUserForm.status}
                  onChange={(e) => setEditUserForm({...editUserForm, status: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditUserModal(false)}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowUpdateConfirmModal(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Update User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && selectedUser && (
        <ConfirmationModal
          isOpen={showDeleteConfirmModal}
          title="Delete User"
          message={`Are you sure you want to permanently delete "${selectedUser.name}" from this kitchen? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleConfirmDeleteUser}
          onCancel={() => {
            setShowDeleteConfirmModal(false);
            setSelectedUser(null);
            setDeleteComment('');
          }}
          comment={deleteComment}
          onCommentChange={setDeleteComment}
          variant="danger"
        />
      )}

      {/* Update Confirmation Modal */}
      {showUpdateConfirmModal && selectedUser && (
        <ConfirmationModal
          isOpen={showUpdateConfirmModal}
          title="Update User"
          message={`Are you sure you want to update "${selectedUser.name}"'s information? Please provide a comment for this change.`}
          confirmText="Update"
          cancelText="Cancel"
          onConfirm={handleConfirmUpdateUser}
          onCancel={() => {
            setShowUpdateConfirmModal(false);
            setUpdateComment('');
          }}
          comment={updateComment}
          onCommentChange={setUpdateComment}
          variant="primary"
        />
      )}

      {/* View User Modal */}
      {showViewUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-neutral-900">
                User Information - {selectedUser.name}
              </h3>
              <button
                onClick={() => setShowViewUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-neutral-200 flex items-center justify-center text-xl font-semibold">
                  {selectedUser.name.charAt(0)}
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-neutral-900">{selectedUser.name}</h4>
                  <p className="text-sm text-neutral-500">{selectedUser.role}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500">Email</label>
                  <div className="text-sm text-gray-900">{selectedUser.email || 'Not provided'}</div>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500">Mobile Number</label>
                  <div className="text-sm text-gray-900">{selectedUser.mobileNumber || selectedUser.phone || 'Not provided'}</div>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    {getUserStatusBadge(selectedUser.status)}
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500">PIN Status</label>
                  <div className="mt-1">
                    {selectedUser.pinBlocked ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Blocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500">Last Active</label>
                  <div className="text-sm text-gray-900">
                    {getRelativeTime(selectedUser.lastActive || new Date(Date.now() - Math.random() * 7200000))}
                  </div>
                </div>
                
                {selectedUser.bio && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Bio</label>
                    <div className="text-sm text-gray-900">{selectedUser.bio}</div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowViewUserModal(false)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenPartnersTab;
