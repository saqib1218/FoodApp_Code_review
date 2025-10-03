import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, EnvelopeIcon, PhoneIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useGetPartnerByIdQuery, useApprovePartnerMutation, useSuspendPartnerMutation } from '../../store/api/modules/partners/partnersApi';
import { useCreateKitchenMutation, useGetKitchenByPartnerIdQuery } from '../../store/api/modules/kitchens/kitchensApi';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../contexts/PermissionRegistry';
import ConfirmationModal from '../../components/ConfirmationModal';
import DialogueBox from '../../components/DialogueBox';

const PartenerDetail = () => {
  const { id } = useParams();
  const { hasPermission } = usePermissions();
  
  // Check permission first
  const canViewPartnerDetail = hasPermission(PERMISSIONS.PARTNER_DETAIL_VIEW);
  
  // RTK Query to fetch partner data - only if user has permission
  const { data: partnerResponse, isLoading, error } = useGetPartnerByIdQuery(id, {
    skip: !canViewPartnerDetail || !id
  });
  
  // Extract partner data from API response
  const partener = partnerResponse?.data;
  
  // Debug: Log the actual partner detail API response structure
  console.log('🔍 Partner Detail API Response Debug:');
  console.log('- Full response:', partnerResponse);
  console.log('- Partner data:', partener);
  if (partener) {
    console.log('- Partner role:', partener.role, typeof partener.role);
    console.log('- Partner phone fields:', {
      phone: partener.phone,
      mobilenumber: partener.mobilenumber,
      phoneNumber: partener.phoneNumber
    });
  }
  
  // RTK Query mutations for KYC actions
  const [approvePartner, { isLoading: isApproving }] = useApprovePartnerMutation();
  const [suspendPartner, { isLoading: isSuspending }] = useSuspendPartnerMutation();
  
  // RTK Query mutation for kitchen creation
  const [createKitchen, { isLoading: isCreatingKitchen }] = useCreateKitchenMutation();
  
  // RTK Query to fetch kitchen by partner ID
  const { data: kitchenResponse, isLoading: isLoadingKitchen, error: kitchenError } = useGetKitchenByPartnerIdQuery(id, {
    skip: !id
  });
  
  // Extract kitchen data from API response
  const kitchenData = kitchenResponse?.data;
  
  const [activeTab, setActiveTab] = useState('info');
  
  // Kitchen creation modal state
  const [showKitchenModal, setShowKitchenModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationComment, setConfirmationComment] = useState('');
  
  // Dialogue box state for API feedback
  const [dialogueBox, setDialogueBox] = useState({
    isOpen: false,
    type: 'success', // 'success' or 'error'
    title: '',
    message: ''
  });
  
  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectComment, setRejectComment] = useState('');
  const [kitchenForm, setKitchenForm] = useState({
    name: '',
    tagline: '',
    bio: '',
    approvalStatus: 'DRAFT'
  });
  const [kitchenNameError, setKitchenNameError] = useState('');
  const [kitchenInfo, setKitchenInfo] = useState(null);

  // Rejection reasons options
  const rejectionReasons = [
    'Incomplete Documentation',
    'Invalid CNIC Information',
    'Poor Image Quality',
    'Document Expired',
    'Information Mismatch',
    'Suspicious Activity',
    'Other'
  ];

  // ID Verification edit modal state
  const [showIdEditModal, setShowIdEditModal] = useState(false);
  const [idForm, setIdForm] = useState({
    documentNumber: '42101-1234567-8',
    expiryDate: '2028-05-15'
  });

  // Validate kitchen name - max 14 words, no symbols
  const validateKitchenName = (name) => {
    // Regex to allow only letters, numbers, and spaces
    const symbolRegex = /^[a-zA-Z0-9\s]+$/;
    // Check if name contains only allowed characters
    if (!symbolRegex.test(name) && name.trim() !== '') {
      return 'Kitchen name cannot contain symbols or special characters';
    }
    // Check word count (split by spaces and filter empty strings)
    const wordCount = name.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount > 14) {
      return 'Kitchen name cannot exceed 14 words';
    }
    return '';
  };

  // Initialize kitchen info from partner data when available
  useEffect(() => {
    if (partener && partener.kitchen) {
      setKitchenInfo({
        name: partener.kitchen.name || '',
        tagline: partener.kitchen.tagline || '',
        approvalStatus: partener.kitchen.approvalStatus || 'DRAFT',
        createdDate: partener.kitchen.createdAt ? new Date(partener.kitchen.createdAt).toISOString().split('T')[0] : '',
        comment: ''
      });
    }
  }, [partener]);

  // Handle kitchen creation
  const handleOpenKitchenModal = () => {
    setShowKitchenModal(true);
  };

  const handleCreateKitchen = async () => {
    const nameError = validateKitchenName(kitchenForm.name);
    setKitchenNameError(nameError);
    
    if (kitchenForm.name.trim() && !nameError) {
      try {
        const kitchenData = {
          name: kitchenForm.name,
          tagline: kitchenForm.tagline,
          bio: kitchenForm.bio,
          ownerId: id // Partner ID from URL params
        };
        
        const result = await createKitchen(kitchenData).unwrap();
        console.log('Kitchen created successfully:', result);
        
        // Close modal and reset form
        setShowKitchenModal(false);
        setKitchenForm({ name: '', tagline: '', bio: '', approvalStatus: 'Pending for approval' });
        setKitchenNameError('');
        
        // Show success message
        showDialogue('success', 'Success', 'Kitchen created successfully!');
      } catch (error) {
        console.error('Failed to create kitchen:', error);
        
        // Handle different error types
        let errorMessage = 'Failed to create kitchen. Please try again.';
        
        if (error?.data) {
          // Handle API error response structure
          if (error.data.code === 'KITCHEN.ALREADY_EXISTS') {
            errorMessage = error.data.message || 'A kitchen is already associated with this user.';
          } else if (error.data.message) {
            errorMessage = error.data.message;
          }
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        showDialogue('error', 'Error', errorMessage);
      }
    }
  };

  const handleConfirmCreateKitchen = () => {
    setKitchenInfo({
      name: kitchenForm.name,
      tagline: kitchenForm.tagline,
      approvalStatus: kitchenForm.approvalStatus,
      createdDate: new Date().toISOString().split('T')[0],
      comment: confirmationComment
    });
    setShowKitchenModal(false);
    setShowConfirmationModal(false);
    setKitchenForm({ name: '', tagline: '', approvalStatus: 'DRAFT' });
    setKitchenNameError('');
    setConfirmationComment('');
  };

  const handleCancelConfirmation = () => {
    setShowConfirmationModal(false);
    setConfirmationComment('');
  };

  const handleCancelKitchen = () => {
    setShowKitchenModal(false);
    setKitchenForm({ name: '', tagline: '', bio: '', approvalStatus: 'DRAFT' });
    setKitchenNameError('');
  };
  
  // Helper functions for dialogue box
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

  // Handle ID verification edit
  const handleOpenIdEditModal = () => {
    setShowIdEditModal(true);
  };

  const handleSaveIdChanges = () => {
    // In a real app, this would call an API to update the ID information
    console.log('Saving ID changes:', idForm);
    alert('ID information updated successfully!');
    setShowIdEditModal(false);
  };

  const handleCancelIdEdit = () => {
    setShowIdEditModal(false);
    // Reset form to original values
    setIdForm({
      documentNumber: '42101-1234567-8',
      expiryDate: '2028-05-15'
    });
  };

  // Handle KYC approval
  const handleApprovePartner = async () => {
    try {
      await approvePartner(partener.userId).unwrap();
      alert('Partner KYC approved successfully!');
      // The data will be automatically refetched due to cache invalidation
    } catch (error) {
      console.error('Failed to approve partner:', error);
      alert('Failed to approve partner. Please try again.');
    }
  };

  // Handle KYC rejection
  const handleRejectPartner = () => {
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    try {
      await suspendPartner(partener.userId).unwrap();
      console.log('Rejecting partner with reason:', rejectReason, 'and comment:', rejectComment);
      setShowRejectModal(false);
      setRejectReason('');
      setRejectComment('');
      alert('Partner KYC rejected successfully!');
      // The data will be automatically refetched due to cache invalidation
    } catch (error) {
      console.error('Failed to reject partner:', error);
      alert('Failed to reject partner. Please try again.');
    }
  };

  const handleCancelReject = () => {
    setShowRejectModal(false);
    setRejectReason('');
    setRejectComment('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Helper function to get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending Approval
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Inactive
          </span>
        );
      default:
        return null;
    }
  };

  // Show access denied if user doesn't have permission
  if (!canViewPartnerDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-sm text-gray-500 mb-4">
            You don't have permission to view partner details. Please contact your administrator for access.
          </p>
          <Link
            to="/partners"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Go Back to Partners
          </Link>
        </div>
      </div>
    );
  }

  // Show error state if API call failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Partner</h3>
          <p className="text-sm text-gray-500 mb-4">
            Failed to load partner details. Please try again later.
          </p>
          <div className="flex space-x-3 justify-center">
            <Link
              to="/partners"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Go Back
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Partner Details</h3>
          <p className="text-sm text-gray-500">
            Please wait while we fetch the partner information...
          </p>
        </div>
      </div>
    );
  }

  // Show not found state if no partner data
  if (!partener) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Partner Not Found</h3>
          <p className="text-sm text-gray-500 mb-4">
            The partner you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/partners"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Go Back to Partners
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with back button */}
      <div className="mb-6">
        <div className="flex items-center">
          <Link
            to="/parteners"
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{partener.name}</h1>
            <p className="text-sm text-gray-500">
              Partner ID: {partener.userId} • {getStatusBadge(partener.isActive ? 'active' : 'inactive')}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('info')}
            className={`${
              activeTab === 'info'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Partner Info
          </button>
          <button
            onClick={() => setActiveTab('kitchen')}
            className={`${
              activeTab === 'kitchen'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Kitchen Info
          </button>
          <button
            onClick={() => setActiveTab('idVerification')}
            className={`${
              activeTab === 'idVerification'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            ID Verification
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`${
              activeTab === 'activities'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Activities
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg">
        {activeTab === 'info' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-gray-900">{partener.email}</p>
                  </div>
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-gray-900">
                      {partener.mobilenumber || partener.phone || partener.phoneNumber || 'No phone number'}
                    </p>
                  </div>
                  {/* <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="mt-1 text-gray-900">{partener.address}</p>
                  </div> */}
                  {/* <div>
                    <p className="text-sm font-medium text-gray-500">City</p>
                    <p className="mt-1 text-gray-900">{partener.city}</p>
                  </div> */}
                  
                </div>
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Joined Date</p>
                    <p className="mt-1 text-gray-900">{partener.createdAt ? new Date(partener.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="mt-1">{getStatusBadge(partener.isActive ? 'active' : 'inactive')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Role</p>
                    <p className="mt-1 text-gray-900">
                      {typeof partener.role?.name === 'string' ? partener.role.name :
                       typeof partener.role === 'string' ? partener.role :
                       typeof partener.role === 'object' ? JSON.stringify(partener.role) : 'Partner'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">KYC Verified</p>
                    <p className="mt-1">{getStatusBadge(partener.isKycVerified ? 'active' : 'inactive')}</p>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'kitchen' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Kitchen Information</h2>
              {!kitchenData && hasPermission(PERMISSIONS.KITCHEN_CREATE) && (
                <button
                  onClick={handleOpenKitchenModal}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Create Kitchen
                </button>
              )}
            </div>
            
            {isLoadingKitchen ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading kitchen information...</p>
              </div>
            ) : kitchenError && kitchenError.status !== 404 ? (
              <div className="text-center py-12">
                <div className="text-red-500">
                  <p className="text-lg font-medium">Error Loading Kitchen</p>
                  <p className="mt-2">Failed to load kitchen information. Please try again later.</p>
                </div>
              </div>
            ) : kitchenData ? (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Kitchen Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Tagline
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {kitchenData.kitchenName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {kitchenData.tagline || 'No tagline'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          kitchenData.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800'
                            : kitchenData.status === 'DRAFT'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {kitchenData.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/kitchens/${kitchenData.kitchenId}`}
                          className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <p className="text-lg font-medium">No Kitchen Information</p>
                  <p className="mt-2">Create a kitchen profile for this partner to get started.</p>
                </div>
              </div>
            )}
          </div>
        )}

{activeTab === 'idVerification' && (
  <div className="p-6">
    <h2 className="text-lg font-medium text-gray-900 mb-4">Partner ID Verification</h2>
    <div className="p-6 ">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">ID Documentation Type</label>
          <select 
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
          >
            <option>CNIC</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">ID Documentation Number</label>
          <input
            type="text"
            disabled
            value={idForm.documentNumber}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">ID Documentation Expiry</label>
          <input
            type="text"
            disabled
            value={idForm.expiryDate}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
          />
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-500">Media Files</h3>
        <button
          onClick={handleOpenIdEditModal}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Edit
        </button>
      </div>
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-2">Front Side</p>
            <div className="border border-gray-200 rounded-md p-4 flex justify-center">
              <img 
                src="https://example.com/cnic-front.jpg" 
                alt="CNIC Front" 
                className="max-w-full h-48 object-contain rounded"
              />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Back Side</p>
            <div className="border border-gray-200 rounded-md p-4 flex justify-center">
              <img 
                src="https://example.com/cnic-back.jpg" 
                alt="CNIC Back" 
                className="max-w-full h-48 object-contain rounded"
              />
            </div>
          </div>
        </div>
      </div>

      {/* KYC Status and Actions */}
      <div className="mb-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-gray-900">KYC Verification Status</h4>
            <p className="text-sm text-gray-500 mt-1">
              {partener.isKycVerified ? 'This partner has been verified and approved.' : 'This partner is pending KYC verification.'}
            </p>
          </div>
          <div className="flex items-center">
            {partener.isKycVerified ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✓ KYC Approved
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                ⏳ Pending Verification
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons - Only show if KYC is not verified */}
      {!partener.isKycVerified && (
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleRejectPartner}
            disabled={isApproving || isSuspending}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSuspending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2"></div>
                Rejecting...
              </>
            ) : (
              'Reject KYC'
            )}
          </button>
          <button
            onClick={handleApprovePartner}
            disabled={isApproving || isSuspending}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApproving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Approving...
              </>
            ) : (
              'Approve KYC'
            )}
          </button>
        </div>
      )}
    </div>
  </div>
)}

        {activeTab === 'activities' && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Partner Activities</h2>
            
            {/* Activity Timeline */}
            <div className="flow-root">
              <ul className="-mb-8">
                {/* Mock activity data - in real app this would come from API */}
                {[
                  {
                    id: 1,
                    type: 'feedback',
                    title: 'User provided feedback',
                    description: 'Submitted feedback about order delivery experience',
                    timestamp: '2024-01-15 14:30',
                    icon: '💬',
                    bgColor: 'bg-blue-100',
                    iconColor: 'text-blue-600'
                  },
                  {
                    id: 2,
                    type: 'email_update',
                    title: 'User updated email address',
                    description: 'Changed email from old@example.com to ahmed@example.com',
                    timestamp: '2024-01-10 09:15',
                    icon: '✉️',
                    bgColor: 'bg-green-100',
                    iconColor: 'text-green-600'
                  },
                  {
                    id: 3,
                    type: 'address_change',
                    title: 'User changed address',
                    description: 'Updated delivery address to 123 Main Street, Block F, Gulberg III, Lahore',
                    timestamp: '2024-01-08 16:45',
                    icon: '📍',
                    bgColor: 'bg-yellow-100',
                    iconColor: 'text-yellow-600'
                  },
                  {
                    id: 4,
                    type: 'kitchen_name',
                    title: 'User changed kitchen name',
                    description: 'Updated kitchen name from "Ahmed\'s Kitchen" to "Khan\'s Delicious Food"',
                    timestamp: '2024-01-05 11:20',
                    icon: '🍳',
                    bgColor: 'bg-purple-100',
                    iconColor: 'text-purple-600'
                  },
                  {
                    id: 5,
                    type: 'profile_update',
                    title: 'User updated profile information',
                    description: 'Modified phone number and city information',
                    timestamp: '2024-01-02 13:10',
                    icon: '👤',
                    bgColor: 'bg-gray-100',
                    iconColor: 'text-gray-600'
                  }
                ].map((activity, activityIdx, activities) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== activities.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`${activity.bgColor} h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white`}>
                            <span className="text-sm">{activity.icon}</span>
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {activity.title}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {activity.description}
                            </p>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500">
                            <time dateTime={activity.timestamp}>
                              {activity.timestamp}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Empty state when no activities */}
            {/* Uncomment this section if you want to show empty state when no activities exist
            <div className="text-center py-12">
              <div className="text-gray-500">
                <p className="text-lg font-medium">No Activities Found</p>
                <p className="mt-2">This partner hasn't performed any activities yet.</p>
              </div>
            </div>
            */}
          </div>
        )}
      </div>

      {/* Create Kitchen Modal */}
      {showKitchenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-neutral-900">
                Create Kitchen
              </h3>
              <button
                onClick={handleCancelKitchen}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="kitchenName" className="block text-sm font-medium text-gray-700 mb-1">
                  Kitchen Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="kitchenName"
                  value={kitchenForm.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setKitchenForm({ ...kitchenForm, name: newName });
                    // Real-time validation
                    const error = validateKitchenName(newName);
                    setKitchenNameError(error);
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    kitchenNameError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter kitchen name (letters, numbers, spaces only)"
                />
                {kitchenNameError && (
                  <p className="mt-1 text-sm text-red-600">{kitchenNameError}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="kitchenTagline" className="block text-sm font-medium text-gray-700 mb-1">
                  Kitchen Tagline
                </label>
                <input
                  type="text"
                  id="kitchenTagline"
                  value={kitchenForm.tagline}
                  onChange={(e) => setKitchenForm({ ...kitchenForm, tagline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter kitchen tagline (optional)"
                />
              </div>
              
              <div>
                <label htmlFor="kitchenBio" className="block text-sm font-medium text-gray-700 mb-1">
                  Kitchen Bio
                </label>
                <textarea
                  id="kitchenBio"
                  value={kitchenForm.bio}
                  onChange={(e) => setKitchenForm({ ...kitchenForm, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter kitchen bio (optional)"
                />
              </div>
              
              <div>
                <label htmlFor="approvalStatus" className="block text-sm font-medium text-gray-700 mb-1">
                  Approval Status
                </label>
                <select
                  id="approvalStatus"
                  disabled
                  value={kitchenForm.approvalStatus}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                >
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCancelKitchen}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateKitchen}
                disabled={!kitchenForm.name.trim() || kitchenNameError || isCreatingKitchen}
                className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {isCreatingKitchen ? 'Creating...' : 'Create Kitchen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit ID Verification Modal */}
      {showIdEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-neutral-900">
                Edit ID Verification
              </h3>
              <button
                onClick={handleCancelIdEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="editDocumentNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  ID Documentation Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="editDocumentNumber"
                  value={idForm.documentNumber}
                  onChange={(e) => setIdForm({ ...idForm, documentNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter ID documentation number"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="editExpiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                  ID Documentation Expiry <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="editExpiryDate"
                  value={idForm.expiryDate}
                  onChange={(e) => setIdForm({ ...idForm, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCancelIdEdit}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveIdChanges}
                disabled={!idForm.documentNumber.trim() || !idForm.expiryDate}
                className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmationModal}
        title="Create Kitchen"
        message={`Are you sure you want to create kitchen "${kitchenForm.name}"?`}
        confirmText="Create"
        cancelText="Cancel"
        onConfirm={handleConfirmCreateKitchen}
        onCancel={handleCancelConfirmation}
        comment={confirmationComment}
        onCommentChange={setConfirmationComment}
      />
      
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

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-neutral-900">
                Reject Partner KYC
              </h3>
              <button
                onClick={handleCancelReject}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-neutral-700 mb-4">
                Are you sure you want to reject this partner's KYC verification?
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select a reason</option>
                  {rejectionReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Additional Comments <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Please provide additional details about the rejection..."
                  rows={3}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelReject}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim() || !rejectComment.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject Partner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartenerDetail;