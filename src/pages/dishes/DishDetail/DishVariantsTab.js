import React, { useState, useEffect, useContext } from 'react';
import { PlusIcon, PencilIcon, EyeIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../hooks/useAuth';
import { PERMISSIONS } from '../../../contexts/PermissionRegistry';
import { DishContext } from './index';
import ConfirmationModal from '../../../components/ConfirmationModal';
import DialogueBox from '../../../components/DialogueBox';

const DishVariantsTab = () => {
  const { id: dishId } = useContext(DishContext);
  const { hasPermission } = useAuth();
  
  // Check permissions - simplified to only use admin.dish.view
  const canViewVariants = hasPermission(PERMISSIONS.DISH_VIEW);
  const canAddVariant = hasPermission(PERMISSIONS.DISH_VIEW);
  
  // State variables
  const [variants, setVariants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [deleteComment, setDeleteComment] = useState('');
  
  // Form state
  const [variantForm, setVariantForm] = useState({
    name: '',
    description: '',
    unit: '',
    quantity: '',
    price: '',
    perLimit: '',
    dailyLimit: '',
    status: 'active'
  });
  
  // Dialogue box state
  const [dialogueBox, setDialogueBox] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
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

  const closeDialogue = () => {
    setDialogueBox({
      isOpen: false,
      type: 'success',
      title: '',
      message: ''
    });
  };

  // Load variants
  useEffect(() => {
    const loadVariants = () => {
      setIsLoading(true);
      
      // Mock variants data
      const mockVariants = [
        {
          id: 1,
          name: 'Regular',
          description: 'Standard portion size',
          unit: 'plate',
          quantity: '1',
          price: '299',
          perLimit: '2',
          dailyLimit: '50',
          status: 'active',
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          name: 'Family Pack',
          description: 'Large portion for 4-6 people',
          unit: 'pack',
          quantity: '1',
          price: '899',
          perLimit: '1',
          dailyLimit: '20',
          status: 'active',
          createdAt: '2024-01-16T11:45:00Z'
        }
      ];
      
      setVariants(mockVariants);
      setIsLoading(false);
    };
    
    if (canViewVariants && dishId) {
      loadVariants();
    }
  }, [dishId, canViewVariants]);

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setVariantForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle add variant
  const handleAddVariant = () => {
    setVariantForm({
      name: '',
      description: '',
      unit: '',
      quantity: '',
      price: '',
      perLimit: '',
      dailyLimit: '',
      status: 'active'
    });
    setShowAddModal(true);
  };

  // Handle save variant
  const handleSaveVariant = async () => {
    try {
      // Validation
      if (!variantForm.name.trim()) {
        showDialogue('error', 'Validation Error', 'Variant name is required.');
        return;
      }
      
      if (!variantForm.price.trim()) {
        showDialogue('error', 'Validation Error', 'Price is required.');
        return;
      }

      // TODO: Replace with RTK Query mutation
      console.log('Saving variant:', variantForm);
      
      // Mock save - add to local state
      const newVariant = {
        ...variantForm,
        id: variants.length + 1,
        createdAt: new Date().toISOString()
      };
      
      setVariants(prev => [...prev, newVariant]);
      setShowAddModal(false);
      showDialogue('success', 'Variant Added', 'Dish variant has been added successfully!');
      
    } catch (error) {
      console.error('Failed to save variant:', error);
      showDialogue('error', 'Save Failed', `Failed to save variant: ${error.message || 'Unknown error occurred'}`);
    }
  };

  // Handle view variant
  const handleViewVariant = (variant) => {
    setSelectedVariant(variant);
    setShowViewModal(true);
  };

  // Handle delete variant
  const handleDeleteVariant = (variant) => {
    setSelectedVariant(variant);
    setDeleteComment('');
    setShowDeleteModal(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    try {
      // TODO: Replace with RTK Query mutation
      console.log('Deleting variant:', selectedVariant.id);
      
      // Remove from local state
      setVariants(prev => prev.filter(v => v.id !== selectedVariant.id));
      setShowDeleteModal(false);
      setSelectedVariant(null);
      setDeleteComment('');
      showDialogue('success', 'Variant Deleted', 'Dish variant has been deleted successfully!');
      
    } catch (error) {
      console.error('Failed to delete variant:', error);
      showDialogue('error', 'Delete Failed', `Failed to delete variant: ${error.message || 'Unknown error occurred'}`);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-neutral-900">Dish Variants</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Manage different variants and pricing options for this dish.
            </p>
          </div>
          {canAddVariant && (
            <button
              onClick={handleAddVariant}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Variant
            </button>
          )}
        </div>
      </div>

      {/* Variants Table */}
      {!canViewVariants ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Access Denied</h3>
            <p className="text-neutral-500">You don't have permission to access dish variants.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            {variants.length === 0 ? (
              <div className="text-center py-12 bg-neutral-50">
                <p className="text-neutral-500">No variants found for this dish.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Unit/Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Limits
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
                  {variants.map((variant) => (
                    <tr key={variant.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900">
                          {variant.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-neutral-900 max-w-xs truncate">
                          {variant.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">
                          {variant.quantity} {variant.unit}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900">
                          ₹{variant.price}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">
                          Per: {variant.perLimit || '-'} | Daily: {variant.dailyLimit || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          variant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {variant.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewVariant(variant)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="View variant"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteVariant(variant)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete variant"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Add Variant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 p-6 pb-0">
              <h3 className="text-lg font-medium text-neutral-900">Add Variant</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 pb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Variant Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={variantForm.name}
                    onChange={handleFormChange}
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Regular, Large, Family Pack"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={variantForm.description}
                    onChange={handleFormChange}
                    rows={2}
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Describe this variant"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      name="unit"
                      value={variantForm.unit}
                      onChange={handleFormChange}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., plate, pack"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="text"
                      name="quantity"
                      value={variantForm.quantity}
                      onChange={handleFormChange}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., 1, 2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={variantForm.price}
                    onChange={handleFormChange}
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter price"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Per Order Limit
                    </label>
                    <input
                      type="number"
                      name="perLimit"
                      value={variantForm.perLimit}
                      onChange={handleFormChange}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Max per order"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Daily Limit
                    </label>
                    <input
                      type="number"
                      name="dailyLimit"
                      value={variantForm.dailyLimit}
                      onChange={handleFormChange}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Max per day"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveVariant}
                  className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Save Variant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Variant Modal */}
      {showViewModal && selectedVariant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-neutral-900">Variant Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-neutral-700">Name:</span>
                <span className="ml-2 text-sm text-neutral-900">{selectedVariant.name}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Description:</span>
                <span className="ml-2 text-sm text-neutral-900">{selectedVariant.description || '-'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Unit/Quantity:</span>
                <span className="ml-2 text-sm text-neutral-900">{selectedVariant.quantity} {selectedVariant.unit}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Price:</span>
                <span className="ml-2 text-sm font-medium text-neutral-900">₹{selectedVariant.price}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Per Order Limit:</span>
                <span className="ml-2 text-sm text-neutral-900">{selectedVariant.perLimit || 'No limit'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Daily Limit:</span>
                <span className="ml-2 text-sm text-neutral-900">{selectedVariant.dailyLimit || 'No limit'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Status:</span>
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedVariant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {selectedVariant.status}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Created:</span>
                <span className="ml-2 text-sm text-neutral-900">{formatDate(selectedVariant.createdAt)}</span>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedVariant && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          title="Delete Variant"
          message={`Are you sure you want to permanently delete the variant "${selectedVariant.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedVariant(null);
            setDeleteComment('');
          }}
          comment={deleteComment}
          onCommentChange={setDeleteComment}
          variant="danger"
        />
      )}

      {/* DialogueBox for feedback */}
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

export default DishVariantsTab;
