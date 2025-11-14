import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon, EyeIcon, PencilIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon, KeyIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useGetPartnersQuery } from '../../store/api/modules/partners/partnersApi';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../contexts/PermissionRegistry';
import ConfirmationModal from '../../components/ConfirmationModal';

const PartenerList = () => {
  const { hasPermission } = usePermissions();
  
  // Check permission first
  const canViewPartnerList = hasPermission(PERMISSIONS.PARTNER_LIST_VIEW);
  
  // Permission check is working correctly now
  
  // RTK Query to fetch partners data - only if user has permission
  const { data: partnersResponse, isLoading, error } = useGetPartnersQuery({
    page: 1,
    limit: 50
  }, {
    skip: !canViewPartnerList
  });
  
  // Extract partners data from API response
  const partners = partnersResponse?.data || [];
  
  // Debug: Log the actual API response structure
  console.log('🔍 Partners API Response Debug:');
  console.log('- Full response:', partnersResponse);
  console.log('- Partners data:', partners);
  if (partners.length > 0) {
    console.log('- First partner structure:', partners[0]);
    console.log('- Partner name type:', typeof partners[0]?.name);
    console.log('- Partner name value:', partners[0]?.name);
  }
  
  const [filteredParteners, setFilteredParteners] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [confirmationAction, setConfirmationAction] = useState(null);
    const [confirmationComment, setConfirmationComment] = useState('');
    const [pendingAction, setPendingAction] = useState(null);
  const [filters, setFilters] = useState({
    name: '',
    mobileNumber: '',
    email: '',
    kitchenName: '',
    status: '',
    role: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showResetPinModal, setShowResetPinModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    kitchenName: '',
    email: '',
    phone: '',
    role: ''
  });
  const [pinForm, setPinForm] = useState({
    newPin: '',
    confirmPin: ''
  });
  const handleTogglePartenerStatus = (partnerId) => {
    const partner = partners.find(p => p.userId === partnerId);
    const newStatus = !partner.isActive;
    
    setConfirmationAction('status');
    setPendingAction({ partnerId, partnerName: partner.name, newStatus });
    setShowConfirmationModal(true);
    setConfirmationComment('');
  };

  // Update filtered partners when API data changes
  useEffect(() => {
    if (partners && partners.length > 0) {
      setFilteredParteners(partners);
    }
  }, [partners]);

  // Filter partners based on search term and filters
  useEffect(() => {
    let result = partners;

    // Apply search term filter
    if (searchTerm) {
      result = result.filter(partner =>
        partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.kitchenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.phone.includes(searchTerm)
      );
    }

    // Apply name filter
    if (filters.name) {
      result = result.filter(partner => 
        partner.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    // Apply mobile number filter
    if (filters.mobileNumber) {
      result = result.filter(partner => 
        partner.phone.includes(filters.mobileNumber)
      );
    }

    // Apply email filter
    if (filters.email) {
      result = result.filter(partner => 
        partner.email.toLowerCase().includes(filters.email.toLowerCase())
      );
    }

    // Apply kitchen name filter
    if (filters.kitchenName) {
      result = result.filter(partner => 
        partner.kitchenName.toLowerCase().includes(filters.kitchenName.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status) {
      const statusBoolean = filters.status === 'active';
      result = result.filter(partner => partner.status === statusBoolean);
    }

    // Apply role filter
    if (filters.role) {
      result = result.filter(partner => 
        partner.role.toLowerCase().includes(filters.role.toLowerCase())
      );
    }

    setFilteredParteners(result);
  }, [partners, searchTerm, filters]);

  // Sorting function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting to filtered partners
  const sortedParteners = React.useMemo(() => {
    let sortableParteners = [...filteredParteners];
    if (sortConfig.key) {
      sortableParteners.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle empty values
        if (!aValue) aValue = '';
        if (!bValue) bValue = '';
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableParteners;
  }, [filteredParteners, sortConfig]);

  // Get unique cities and statuses for filter dropdowns
  const cities = [...new Set(partners.map(partner => partner.role))];
  const statuses = ['active', 'inactive'];

  // Handle status toggle
  const handleStatusToggle = (partnerId) => {
    // TODO: Implement API call to toggle partner status
    console.log('Toggle status for partner:', partnerId);
    alert('Status toggle functionality will be implemented with API integration.');
  };

  // Handle edit action
  const handleEdit = (partnerId) => {
    const partner = partners.find(p => p.userId === partnerId);
    setSelectedPartner(partner);
    setEditForm({
      name: partner.name,
      kitchenName: partner.kitchenName,
      email: partner.email,
      phone: partner.phone,
      role: partner.role
    });
    setShowEditModal(true);
  };

  // Handle edit form submission
  const handleEditSubmit = () => {
    setConfirmationAction('edit');
    setPendingAction({ 
      partnerId: selectedPartner.id, 
      partnerName: selectedPartner.name,
      editData: editForm
    });
    setShowConfirmationModal(true);
    setConfirmationComment('');
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setShowEditModal(false);
    setSelectedPartner(null);
    setEditForm({
      name: '',
      kitchenName: '',
      email: '',
      phone: '',
      role: ''
    });
  };

  // Handle reset PIN
  const handleResetPin = (partner) => {
    setSelectedPartner(partner);
    setPinForm({ newPin: '', confirmPin: '' });
    setShowResetPinModal(true);
  };

  // Handle PIN form submission
  const handlePinSubmit = () => {
    // Validate PIN
    if (pinForm.newPin !== pinForm.confirmPin) {
      alert('PINs do not match');
      return;
    }
    
    if (pinForm.newPin.length !== 4) {
      alert('PIN must be 4 digits');
      return;
    }
    
    if (!/^\d{4}$/.test(pinForm.newPin)) {
      alert('PIN must contain only numbers');
      return;
    }

    // Here you would typically make an API call to update the PIN
    console.log('Resetting PIN for partner:', selectedPartner.name, 'New PIN:', pinForm.newPin);
    alert('PIN reset successfully');
    
    // Close modal and reset form
    setShowResetPinModal(false);
    setSelectedPartner(null);
    setPinForm({ newPin: '', confirmPin: '' });
  };

  // Handle confirm status change
  const handleConfirmStatusChange = () => {
    if (pendingAction && confirmationComment.trim()) {
      // TODO: Implement API call to update partner status
      console.log('Update partner status:', pendingAction);
      alert('Status update functionality will be implemented with API integration.');
      setShowConfirmationModal(false);
      setConfirmationComment('');
      setPendingAction(null);
    }
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (pendingAction && confirmationComment.trim()) {
      // TODO: Implement API call to delete partner
      console.log('Delete partner:', pendingAction);
      alert('Delete functionality will be implemented with API integration.');
      setShowConfirmationModal(false);
      setConfirmationComment('');
      setPendingAction(null);
    }
  };

  // Handle confirm edit
  const handleConfirmEdit = () => {
    if (pendingAction && confirmationComment.trim()) {
      // TODO: Implement API call to update partner
      console.log('Update partner:', pendingAction);
      alert('Edit functionality will be implemented with API integration.');
      setShowEditModal(false);
      setShowConfirmationModal(false);
      setConfirmationComment('');
      setPendingAction(null);
      setSelectedPartner(null);
      setEditForm({
        name: '',
        kitchenName: '',
        email: '',
        phone: '',
        role: ''
      });
    }
  };

  // Handle cancel confirmation
  const handleCancelConfirmation = () => {
    setShowConfirmationModal(false);
    setConfirmationComment('');
    setPendingAction(null);
  };

  // Handle delete action
  const handleRemovePartener = (partnerId) => {
    const partner = partners.find(partner => partner.userId === partnerId);
    
    setConfirmationAction('delete');
    setPendingAction({ partnerId, partnerName: partner.name });
    setShowConfirmationModal(true);
    setConfirmationComment('');
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      city: '',
      status: ''
    });
  };

  // Show access denied if user doesn't have permission
  if (!canViewPartnerList) {
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
            You don't have permission to view the partner list. Please contact your administrator for access.
          </p>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Go Back
          </button>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Partners</h3>
          <p className="text-sm text-gray-500 mb-4">
            Failed to load partner data. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 text-center text-neutral-600">Working on it...</div>
  );
};

export default PartenerList;
