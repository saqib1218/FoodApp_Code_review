import React, { useState, useEffect, useContext } from 'react';
import { PlusIcon, EyeIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../hooks/useAuth';
import { PERMISSIONS } from '../../../contexts/PermissionRegistry';
import { DishContext } from './index';
import ConfirmationModal from '../../../components/ConfirmationModal';
import DialogueBox from '../../../components/DialogueBox';

const DishCategoryTab = () => {
  const { id: dishId } = useContext(DishContext);
  const { hasPermission } = useAuth();
  
  // Check permissions - simplified to only use admin.dish.view
  const canViewCategories = hasPermission(PERMISSIONS.DISH_VIEW);
  const canAddCategory = hasPermission(PERMISSIONS.DISH_VIEW);
  
  // State variables
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteComment, setDeleteComment] = useState('');
  
  // Form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    isActive: true
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

  // Load categories
  useEffect(() => {
    const loadCategories = () => {
      setIsLoading(true);
      
      // Mock categories data
      const mockCategories = [
        {
          id: 1,
          name: 'Spicy',
          description: 'Hot and spicy dishes',
          color: '#EF4444',
          isActive: true,
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          name: 'Vegetarian',
          description: 'Vegetarian friendly',
          color: '#10B981',
          isActive: true,
          createdAt: '2024-01-16T11:45:00Z'
        },
        {
          id: 3,
          name: 'Popular',
          description: 'Customer favorite',
          color: '#F59E0B',
          isActive: true,
          createdAt: '2024-01-17T09:15:00Z'
        }
      ];
      
      setCategories(mockCategories);
      setIsLoading(false);
    };
    
    if (canViewCategories && dishId) {
      loadCategories();
    }
  }, [dishId, canViewCategories]);

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCategoryForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle add category
  const handleAddCategory = () => {
    setCategoryForm({
      name: '',
      description: '',
      color: '#3B82F6',
      isActive: true
    });
    setShowAddModal(true);
  };

  // Handle save category
  const handleSaveCategory = async () => {
    try {
      // Validation
      if (!categoryForm.name.trim()) {
        showDialogue('error', 'Validation Error', 'Category name is required.');
        return;
      }

      // TODO: Replace with RTK Query mutation
      console.log('Saving category:', categoryForm);
      
      // Mock save - add to local state
      const newCategory = {
        ...categoryForm,
        id: categories.length + 1,
        createdAt: new Date().toISOString()
      };
      
      setCategories(prev => [...prev, newCategory]);
      setShowAddModal(false);
      showDialogue('success', 'Category Added', 'Dish category has been added successfully!');
      
    } catch (error) {
      console.error('Failed to save category:', error);
      showDialogue('error', 'Save Failed', `Failed to save category: ${error.message || 'Unknown error occurred'}`);
    }
  };

  // Handle view category
  const handleViewCategory = (category) => {
    setSelectedCategory(category);
    setShowViewModal(true);
  };

  // Handle delete category
  const handleDeleteCategory = (category) => {
    setSelectedCategory(category);
    setDeleteComment('');
    setShowDeleteModal(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    try {
      // TODO: Replace with RTK Query mutation
      console.log('Deleting category:', selectedCategory.id);
      
      // Remove from local state
      setCategories(prev => prev.filter(c => c.id !== selectedCategory.id));
      setShowDeleteModal(false);
      setSelectedCategory(null);
      setDeleteComment('');
      showDialogue('success', 'Category Deleted', 'Dish category has been deleted successfully!');
      
    } catch (error) {
      console.error('Failed to delete category:', error);
      showDialogue('error', 'Delete Failed', `Failed to delete category: ${error.message || 'Unknown error occurred'}`);
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
            <h3 className="text-lg font-medium text-neutral-900">Dish Categories</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Manage categories and tags for this dish.
            </p>
          </div>
          {canAddCategory && (
            <button
              onClick={handleAddCategory}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Category
            </button>
          )}
        </div>
      </div>

      {/* Categories Table */}
      {!canViewCategories ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Access Denied</h3>
            <p className="text-neutral-500">You don't have permission to access dish categories.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            {categories.length === 0 ? (
              <div className="text-center py-12 bg-neutral-50">
                <p className="text-neutral-500">No categories found for this dish.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Color
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-3"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <div className="text-sm font-medium text-neutral-900">
                            {category.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-neutral-900 max-w-xs truncate">
                          {category.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900 font-mono">
                          {category.color}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-500">
                          {formatDate(category.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewCategory(category)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="View category"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete category"
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

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 p-6 pb-0">
              <h3 className="text-lg font-medium text-neutral-900">Add Category</h3>
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
                    Category Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={categoryForm.name}
                    onChange={handleFormChange}
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Spicy, Vegetarian, Popular"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={categoryForm.description}
                    onChange={handleFormChange}
                    rows={2}
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Describe this category"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      name="color"
                      value={categoryForm.color}
                      onChange={handleFormChange}
                      className="w-12 h-12 border border-neutral-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      name="color"
                      value={categoryForm.color}
                      onChange={handleFormChange}
                      className="flex-1 p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={categoryForm.isActive}
                    onChange={handleFormChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-neutral-700">
                    Active category
                  </label>
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
                  onClick={handleSaveCategory}
                  className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Save Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Category Modal */}
      {showViewModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-neutral-900">Category Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-sm font-medium text-neutral-700">Name:</span>
                <div className="ml-2 flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: selectedCategory.color }}
                  ></div>
                  <span className="text-sm text-neutral-900">{selectedCategory.name}</span>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Description:</span>
                <span className="ml-2 text-sm text-neutral-900">{selectedCategory.description || '-'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Color:</span>
                <span className="ml-2 text-sm text-neutral-900 font-mono">{selectedCategory.color}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Status:</span>
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedCategory.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {selectedCategory.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Created:</span>
                <span className="ml-2 text-sm text-neutral-900">{formatDate(selectedCategory.createdAt)}</span>
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
      {showDeleteModal && selectedCategory && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          title="Delete Category"
          message={`Are you sure you want to permanently delete the category "${selectedCategory.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedCategory(null);
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

export default DishCategoryTab;
