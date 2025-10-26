import React, { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { PencilIcon, XMarkIcon, PlusIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useGetKitchenAddressesQuery, useAddKitchenAddressMutation, useUpdateKitchenAddressMutation } from '../../../store/api/modules/kitchens/kitchensApi';
import { useAuth } from '../../../hooks/useAuth';
import { PERMISSIONS } from '../../../contexts/PermissionRegistry';
import { KitchenContext } from './index';
import ConfirmationModal from '../../../components/ConfirmationModal';
import DialogueBox from '../../../components/DialogueBox';
import addressData from '../../../data/AddressData/addressData.json';

const KitchenAddressesTab = () => {
  const { hasPermission } = useAuth();
  const { kitchen } = useContext(KitchenContext);
  const { id: routeKitchenId } = useParams();
  const kitchenId = routeKitchenId || kitchen?.id;
  
  // Check permission for viewing kitchen addresses
  const canViewKitchenAddresses = hasPermission(PERMISSIONS.KITCHEN_ADDRESS_LIST_VIEW);
  
  // RTK Query to fetch kitchen addresses data - only if user has permission
  const { data: addressesResponse, isLoading: isLoadingAddresses, error } = useGetKitchenAddressesQuery(kitchenId, {
    skip: !canViewKitchenAddresses || !kitchenId
  });
  
  // RTK Query mutation for adding kitchen address
  const [addKitchenAddress, { isLoading: isAddingAddress }] = useAddKitchenAddressMutation();
  
  // RTK Query mutation for updating kitchen address
  const [updateKitchenAddress, { isLoading: isUpdatingAddress }] = useUpdateKitchenAddressMutation();
  
  // Extract addresses data from API response
  const addresses = addressesResponse?.data || [];

  // State variables
  const [showModal, setShowModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [modalAction, setModalAction] = useState(''); // 'add' or 'edit'
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmComment, setConfirmComment] = useState('');
  
  // New modal states
  const [showViewAddressModal, setShowViewAddressModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateConfirmModal, setShowUpdateConfirmModal] = useState(false);
  const [deleteComment, setDeleteComment] = useState('');
  const [updateComment, setUpdateComment] = useState('');
  const isEditMode = Boolean(selectedAddress);
  // Activate Address modal state
  const [showActivateConfirmModal, setShowActivateConfirmModal] = useState(false);
  const [activateComment, setActivateComment] = useState('');
  
  // Dialogue box state for API feedback
  const [dialogueBox, setDialogueBox] = useState({
    isOpen: false,
    type: 'success', // 'success' or 'error'
    title: '',
    message: ''
  });
  
  const [addressForm, setAddressForm] = useState({
    addressName: '',
    fullAddress: '',
    addressLine2: '',
    city: '',
    cityZone: '',
    nearestLocation: '',
    locationLink: '',
    longitude: '',
    latitude: '',
    country: '',
    deliveryInstructions: ''
  });

  // Dialogue box helper functions
  const showDialogue = (type, title, message) => {
    setDialogueBox({
      isOpen: true,
      type,
      title,
      message
    });
  };

  // Confirm activate address (set status to active)
  const handleConfirmActivateAddress = async () => {
    if (!selectedAddress) return;
    try {
      const result = await updateKitchenAddress({
        kitchenId,
        addressId: selectedAddress.kitchenAddressId || selectedAddress.id,
        addressData: { status: 'active' }
      }).unwrap();
      console.log('Address activated successfully:', result);
      showDialogue('success', 'Address Activated', 'The address has been activated successfully.');
      setShowActivateConfirmModal(false);
      setActivateComment('');
      setSelectedAddress(null);
    } catch (err) {
      console.error('Failed to activate address:', err);
      const errorMessage = err?.data?.message || 'Failed to activate address. Please try again.';
      showDialogue('error', 'Error', errorMessage);
    }
  };

  // Open the entered location link in a new tab for verification
  const handleVerifyLocation = () => {
    if (addressForm.locationLink) {
      window.open(addressForm.locationLink, '_blank', 'noopener,noreferrer');
    }
  };

  const closeDialogue = () => {
    setDialogueBox({
      isOpen: false,
      type: 'success',
      title: '',
      message: ''
    });
  };

  // Handle add address
  const handleAddAddress = () => {
    setSelectedAddress(null);
    setShowModal(true);
    setAddressForm({
      addressName: '',
      fullAddress: '',
      addressLine2: '',
      city: 'Karachi',
      cityZone: '',
      nearestLocation: '',
      locationLink: '',
      longitude: '',
      latitude: '',
      country: 'Pakistan',
      deliveryInstructions: ''
    });
    setShowAddressModal(true);
  };

  // Handle edit address
  const handleEditAddress = (address) => {
    setSelectedAddress(address);
    setAddressForm({
      addressName: address.addressName || '',
      fullAddress: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      city: address.city || 'Karachi',
      cityZone: address.zone || '',
      nearestLocation: address.nearestLocation || '',
      locationLink: address.mapLink || '',
      longitude: address.longitude || '',
      latitude: address.latitude || '',
      country: address.country || 'Pakistan',
      deliveryInstructions: address.deliveryInstructions || address.instructions || ''
    });
    setShowAddressModal(true);
  };

  // Handle view address - open view modal
  const handleViewAddress = (address) => {
    setSelectedAddress(address);
    setShowViewAddressModal(true);
  };

  // Handle delete address - open delete confirmation modal
  const handleDeleteAddress = (address) => {
    setSelectedAddress(address);
    setDeleteComment('');
    setShowDeleteModal(true);
  };

  // Confirm delete address
  const handleConfirmDeleteAddress = () => {
    if (!selectedAddress) return;

    // TODO: Implement API call to delete address
    console.log('Delete address:', { addressId: selectedAddress.id, comment: deleteComment });
    
    setShowDeleteModal(false);
    setSelectedAddress(null);
    setDeleteComment('');
  };

  // Handle update confirmation for address updates
  const handleConfirmUpdateAddress = async () => {
    if (!selectedAddress) return;

    try {
      // Prepare API payload with only required fields for update
      const apiPayload = {
        addressLine1: addressForm.fullAddress,
        city: addressForm.city,
        country: addressForm.country,
        zone: addressForm.cityZone || '',
        mapLink: addressForm.locationLink || '',
        nearestLocation: addressForm.nearestLocation || '',
        latitude: addressForm.latitude || '',
        longitude: addressForm.longitude || ''
      };
      
      // Call API to update address
      const result = await updateKitchenAddress({
        kitchenId,
        addressId: selectedAddress.kitchenAddressId || selectedAddress.id,
        addressData: apiPayload
      }).unwrap();
      
      console.log('Address updated successfully:', result);
      
      // Show success dialogue
      showDialogue('success', 'Address Updated', 'Kitchen address has been updated successfully.');
      
      // Reset form and close modals
      setShowUpdateConfirmModal(false);
      setShowAddressModal(false);
      setSelectedAddress(null);
      setUpdateComment('');
      setAddressForm({
        fullAddress: '',
        city: '',
        cityZone: '',
        nearestLocation: '',
        locationLink: '',
        longitude: '',
        latitude: '',
        country: '',
        status: 'active'
      });
    } catch (err) {
      console.error('Failed to update address:', err);
      
      // Show error dialogue
      const errorMessage = err?.data?.message || 'Failed to update address. Please try again.';
      showDialogue('error', 'Error', errorMessage);
    }
  };

  // Handle get location
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setAddressForm({
            ...addressForm,
            longitude: position.coords.longitude.toString(),
            latitude: position.coords.latitude.toString()
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get location. Please check your browser permissions.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Handle submit (add or edit)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!addressForm.addressName || !addressForm.addressName.trim()) {
      alert('Address Name is required');
      return;
    }
    if (selectedAddress) {
      // For edit, show update confirmation modal
      setUpdateComment('');
      setShowUpdateConfirmModal(true);
    } else {
      // For add, proceed directly
      setModalAction('add');
      setShowAddressModal(false);
      setConfirmComment('');
      setShowConfirmModal(true);
    }
  };

  // Confirm address action
  const confirmAddressAction = async () => {
    try {
      if (modalAction === 'add') {
        // Prepare API payload with only required fields
        const apiPayload = {
          addressName: addressForm.addressName,
          addressLine1: addressForm.fullAddress,
          addressLine2: addressForm.addressLine2 || null,
          city: addressForm.city,
          country: addressForm.country,
          zone: addressForm.cityZone || '',
          mapLink: addressForm.locationLink || '',
          nearestLocation: addressForm.nearestLocation || '',
          latitude: addressForm.latitude || '',
          longitude: addressForm.longitude || '',
          deliveryInstructions: addressForm.deliveryInstructions || ''
        };
        
        // Call API to add address
        const result = await addKitchenAddress({
          kitchenId,
          addressData: apiPayload
        }).unwrap();
        
        console.log('Address added successfully:', result);
        
        // Show success dialogue
        showDialogue('success', 'Address Added', 'Kitchen address has been added successfully.');
        
        // Reset form after successful addition
        setAddressForm({
          addressName: '',
          fullAddress: '',
          addressLine2: '',
          city: '',
          cityZone: '',
          nearestLocation: '',
          locationLink: '',
          longitude: '',
          latitude: '',
          country: '',
          deliveryInstructions: ''
        });
      } else {
        // Prepare API payload with only required fields for update
        const apiPayload = {
          addressName: addressForm.addressName,
          addressLine1: addressForm.fullAddress,
          addressLine2: addressForm.addressLine2 || null,
          city: addressForm.city,
          country: addressForm.country,
          zone: addressForm.cityZone || '',
          mapLink: addressForm.locationLink || '',
          nearestLocation: addressForm.nearestLocation || '',
          latitude: addressForm.latitude || '',
          longitude: addressForm.longitude || '',
          deliveryInstructions: addressForm.deliveryInstructions || ''
        };
        
        // Call API to update address
        const result = await updateKitchenAddress({
          kitchenId,
          addressId: selectedAddress.kitchenAddressId || selectedAddress.id,
          addressData: apiPayload
        }).unwrap();
        
        console.log('Address updated successfully:', result);
        
        // Show success dialogue
        showDialogue('success', 'Address Updated', 'Kitchen address has been updated successfully.');
        
        // Reset selected address
        setSelectedAddress(null);
      }
      
      setShowConfirmModal(false);
      setConfirmComment('');
      setShowAddressModal(false);
    } catch (err) {
      console.error('Failed to save address:', err);
      
      // Show error dialogue
      const errorMessage = err?.data?.message || 'Failed to save address. Please try again.';
      showDialogue('error', 'Error', errorMessage);
    }
  };

  // Handle cancel confirmation
  const handleCancelConfirmation = () => {
    setShowConfirmModal(false);
    setConfirmComment('');
    setShowAddressModal(true);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const label = String(status || 'N/A');
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        {label}
      </span>
    );
  };

  if (isLoadingAddresses) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-neutral-900">Kitchen Addresses</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Manage the addresses associated with this kitchen.
          </p>
        </div>
        {hasPermission(PERMISSIONS.KITCHEN_ADDRESS_ADD) && (
          <button
            onClick={handleAddAddress}
            className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors text-sm font-medium flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Address
          </button>
        )}
      </div>

      {!canViewKitchenAddresses ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Access Denied</h3>
            <p className="text-neutral-500">You don't have permission to access the list of the addresses.</p>
          </div>
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 rounded-lg">
          <p className="text-neutral-500">No addresses found for this kitchen.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Address Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Country
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {addresses.map((address) => (
                <tr key={address.id}>
                  <td className="px-6 py-4 whitespace-normal">
                    <div className="text-sm text-neutral-900">{address.addressName || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900">{address.country || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(address.status || 'active')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {(() => {
                        const statusUpper = String(address.status || '').toUpperCase();
                        if (statusUpper === 'INACTIVE') {
                          return (
                            <button
                              onClick={() => { setSelectedAddress(address); setActivateComment(''); setShowActivateConfirmModal(true); }}
                              className="px-3 py-1 rounded-full bg-primary-600 text-white hover:bg-primary-700 text-xs font-medium"
                              title="Activate Address"
                            >
                              Activate Address
                            </button>
                          );
                        }
                        return null;
                      })()}
                      {(() => {
                        const statusUpper = String(address.status || '').toUpperCase();
                        const canEdit = ['ACTIVE','INACTIVE','DRAFT'].includes(statusUpper);
                        return (
                          <button
                            onClick={() => { if (canEdit) handleEditAddress(address); }}
                            disabled={!canEdit}
                            className={`transition-colors ${canEdit ? 'text-blue-600 hover:text-blue-900' : 'text-neutral-400 cursor-not-allowed'}`}
                            title={canEdit ? 'Edit address' : 'Editing disabled for this status'}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        );
                      })()}
                      <button
                        onClick={() => handleViewAddress(address)}
                        className="text-green-600 hover:text-green-900 transition-colors"
                        title="View address"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-neutral-900">
                {selectedAddress ? 'Edit Kitchen Address' : 'Add Kitchen Address'}
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="addressName" className="block text-sm font-medium text-neutral-700 mb-1">
                  Address Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="addressName"
                  name="addressName"
                  value={addressForm.addressName}
                  onChange={(e) => setAddressForm({ ...addressForm, addressName: e.target.value })}
                  className={`w-full p-3 border border-neutral-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 ${isEditMode ? '' : ''}`}
                  placeholder="e.g. Main Branch, Warehouse, Office"
                  required
                />
              </div>

              <div>
                <label htmlFor="fullAddress" className="block text-sm font-medium text-neutral-700 mb-1">
                  Address Line 1
                </label>
                <input
                  type="text"
                  id="fullAddress"
                  name="fullAddress"
                  value={addressForm.fullAddress}
                  onChange={(e) => setAddressForm({...addressForm, fullAddress: e.target.value})}
                  className={`w-full p-3 border border-neutral-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 ${isEditMode ? 'bg-neutral-100 cursor-not-allowed' : ''}`}
                  placeholder="Enter address line 1"
                  required
                  disabled={isEditMode}
                />
              </div>

              <div>
                <label htmlFor="addressLine2" className="block text-sm font-medium text-neutral-700 mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  id="addressLine2"
                  name="addressLine2"
                  value={addressForm.addressLine2}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                  className={`w-full p-3 border border-neutral-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 ${isEditMode ? 'bg-neutral-100 cursor-not-allowed' : ''}`}
                  placeholder="Apartment, suite, unit, building, floor, etc."
                  disabled={isEditMode}
                />
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-neutral-700 mb-1">
                  City
                </label>
                <select
                  id="city"
                  name="city"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value, cityZone: '' })}
                  className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 bg-neutral-100 text-neutral-700"
                  disabled
                  required
                >
                  {addressData.cities.filter(c => c.countryId === 'PK').map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-neutral-700 mb-1">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  value={addressForm.country}
                  onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                  className={`w-full p-3 border border-neutral-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 ${isEditMode ? 'bg-neutral-100 text-neutral-700' : ''}`}
                  disabled={isEditMode}
                  required
                >
                  {addressData.countries.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="cityZone" className="block text-sm font-medium text-neutral-700 mb-1">
                  City Zone
                </label>
                <select
                  id="cityZone"
                  name="cityZone"
                  value={addressForm.cityZone}
                  onChange={(e) => setAddressForm({ ...addressForm, cityZone: e.target.value })}
                  className={`w-full p-3 border border-neutral-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 ${isEditMode ? 'bg-neutral-100 text-neutral-700' : ''}`}
                  disabled={isEditMode}
                >
                  <option value="">Select zone</option>
                  {(addressData.cityZones['KHI'] || []).map(z => (
                    <option key={z.id} value={z.name}>{z.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="nearestLocation" className="block text-sm font-medium text-neutral-700 mb-1">
                  Nearest Location
                </label>
                <input
                  type="text"
                  id="nearestLocation"
                  name="nearestLocation"
                  value={addressForm.nearestLocation}
                  onChange={(e) => setAddressForm({...addressForm, nearestLocation: e.target.value})}
                  className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter nearest landmark or location"
                />
              </div>
              
              <div>
                <label htmlFor="locationLink" className="block text-sm font-medium text-neutral-700 mb-1">
                  Location Link
                </label>
                <input
                  type="url"
                  id="locationLink"
                  name="locationLink"
                  value={addressForm.locationLink}
                  onChange={(e) => setAddressForm({...addressForm, locationLink: e.target.value})}
                  className={`w-full p-3 border border-neutral-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 ${isEditMode ? 'bg-neutral-100 cursor-not-allowed' : ''}`}
                  placeholder="Enter location link (Google Maps, etc.)"
                  disabled={isEditMode}
                />
              </div>
              
              <div className="flex justify-center mb-4">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${isEditMode ? 'bg-neutral-300 text-neutral-600 cursor-not-allowed' : 'bg-primary-600 text-white hover:bg-primary-700 transition-colors'}`}
                  disabled={isEditMode}
                >
                  Get Location
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="longitude" className="block text-sm font-medium text-neutral-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    id="longitude"
                    name="longitude"
                    value={addressForm.longitude}
                    className="w-full p-3 border border-neutral-300 rounded-xl bg-neutral-50 cursor-not-allowed"
                    placeholder="Longitude will be filled automatically"
                    disabled
                  />
                </div>
                
                <div>
                  <label htmlFor="latitude" className="block text-sm font-medium text-neutral-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    id="latitude"
                    name="latitude"
                    value={addressForm.latitude}
                    className="w-full p-3 border border-neutral-300 rounded-xl bg-neutral-50 cursor-not-allowed"
                    placeholder="Latitude will be filled automatically"
                    disabled
                  />
                </div>
              </div>
              {(addressForm.longitude && addressForm.latitude && addressForm.locationLink) && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={handleVerifyLocation}
                    className="px-3 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors text-xs font-medium"
                  >
                    Verify Location
                  </button>
                </div>
              )}
              
              <div>
                <label htmlFor="deliveryInstructions" className="block text-sm font-medium text-neutral-700 mb-1">
                  Instruction for Delivery Rider
                </label>
                <textarea
                  id="deliveryInstructions"
                  name="deliveryInstructions"
                  rows={3}
                  value={addressForm.deliveryInstructions}
                  onChange={(e) => setAddressForm({ ...addressForm, deliveryInstructions: e.target.value })}
                  className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Add any instructions for the delivery rider (optional)"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  {selectedAddress ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        title={modalAction === 'add' ? 'Add Address' : 'Update Address'}
        message={modalAction === 'add' 
          ? 'Are you sure you want to add this address to the kitchen?' 
          : 'Are you sure you want to update this kitchen address?'
        }
        comment={confirmComment}
        onCommentChange={setConfirmComment}
        onConfirm={confirmAddressAction}
        onCancel={handleCancelConfirmation}
        confirmButtonText={modalAction === 'add' ? 'Add Address' : 'Update Address'}
        confirmButtonColor="primary"
        isCommentRequired={true}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAddress && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          title="Delete Address"
          message={`Are you sure you want to permanently delete this address? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleConfirmDeleteAddress}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedAddress(null);
            setDeleteComment('');
          }}
          comment={deleteComment}
          onCommentChange={setDeleteComment}
          variant="danger"
        />
      )}

      {/* Update Confirmation Modal */}
      {showUpdateConfirmModal && selectedAddress && (
        <ConfirmationModal
          isOpen={showUpdateConfirmModal}
          title="Update Address"
          message={`Are you sure you want to update this address? Please provide a comment for this change.`}
          confirmText="Update"
          cancelText="Cancel"
          onConfirm={handleConfirmUpdateAddress}
          onCancel={() => {
            setShowUpdateConfirmModal(false);
            setUpdateComment('');
          }}
          comment={updateComment}
          onCommentChange={setUpdateComment}
          variant="primary"
        />
      )}

      {/* Activate Address Confirmation Modal */}
      {showActivateConfirmModal && selectedAddress && (
        <ConfirmationModal
          isOpen={showActivateConfirmModal}
          title="Activate Address"
          message={`Are you sure you want to activate this address?`}
          confirmText="Activate"
          cancelText="Cancel"
          onConfirm={handleConfirmActivateAddress}
          onCancel={() => { setShowActivateConfirmModal(false); setActivateComment(''); setSelectedAddress(null); }}
          comment={activateComment}
          onCommentChange={setActivateComment}
          variant="primary"
        />
      )}

      {/* View Address Modal */}
      {showViewAddressModal && selectedAddress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-neutral-900">
                Address Details
              </h3>
              <button
                onClick={() => setShowViewAddressModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500">Full Address</label>
                <div className="text-sm text-gray-900">{selectedAddress.fullAddress || 'Not provided'}</div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-500">City</label>
                <div className="text-sm text-gray-900">{selectedAddress.city || 'Not provided'}</div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-500">City Zone</label>
                <div className="text-sm text-gray-900">{selectedAddress.cityZone || 'Not provided'}</div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-500">Nearest Location</label>
                <div className="text-sm text-gray-900">{selectedAddress.nearestLocation || 'Not provided'}</div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-500">Type</label>
                <div className="text-sm text-gray-900 capitalize">{selectedAddress.type || 'primary'}</div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  {getStatusBadge(selectedAddress.status || 'active')}
                </div>
              </div>
              
              {selectedAddress.locationLink && (
                <div>
                  <label className="text-xs font-medium text-gray-500">Location Link</label>
                  <div className="text-sm">
                    <a 
                      href={selectedAddress.locationLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-900"
                    >
                      View on Map
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowViewAddressModal(false)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DialogueBox for API Success/Error Messages */}
      <DialogueBox
        isOpen={dialogueBox.isOpen}
        onClose={closeDialogue}
        type={dialogueBox.type}
        title={dialogueBox.title}
        message={dialogueBox.message}
      />
    </div>
  );
};

export default KitchenAddressesTab;
