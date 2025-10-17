import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import DialogueBox from './DialogueBox';
import dishDropdownData from '../data/dishDropdown/dishDropdownData.json';

const EditDishModal = ({ isOpen, onClose, dish, onSave }) => {
  const [formData, setFormData] = useState({
    dishName: '',
    story: '',
    description: '',
    dishCategoryId: '',
    allowCustomization: false,
    allowNegotiation: false,
    isSoldOut: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Dialogue box state for feedback
  const [dialogueBox, setDialogueBox] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Get dropdown data from JSON file
  const { dishCategories } = dishDropdownData;

  // Initialize form data when dish changes
  useEffect(() => {
    if (dish && isOpen) {
      // Reset any previous dialogue state on fresh open
      setDialogueBox({ isOpen: false, type: 'success', title: '', message: '' });
      setIsLoading(false);
      setFormData({
        dishName: dish.dishName || '',
        story: dish.story || '',
        description: dish.description || '',
        dishCategoryId: dish.categoryId || '',
        allowCustomization: dish.allowCustomization || false,
        allowNegotiation: dish.allowNegotiation || false,
        isSoldOut: dish.isSoldOut || false
      });
    }
  }, [dish, isOpen]);

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.dishName.trim()) {
      showDialogue('error', 'Validation Error', 'Dish name is required.');
      return;
    }
    
    if (!formData.description.trim()) {
      showDialogue('error', 'Validation Error', 'Description is required.');
      return;
    }

    try {
      setIsLoading(true);
      
      // TODO: Replace with actual API call using RTK Query
      console.log('Updating dish:', formData);
      
      // Call the onSave callback
      await onSave(formData);
      
      // Show success message
      showDialogue('success', 'Dish Updated', 'Dish has been updated successfully!');
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Failed to update dish:', error);
      showDialogue('error', 'Update Failed', `Failed to update dish: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center mb-4 p-6 pb-0">
            <h3 className="text-lg font-medium text-neutral-900">
              Edit Dish
            </h3>
            <button
              onClick={handleClose}
              className="text-neutral-500 hover:text-neutral-700"
              disabled={isLoading}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6">
            <div className="space-y-4">
              {/* Dish Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Dish Name *
                </label>
                <input
                  type="text"
                  name="dishName"
                  value={formData.dishName}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter dish name"
                  required
                />
              </div>

              {/* Story */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Story
                </label>
                <input
                  type="text"
                  name="story"
                  value={formData.story}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Brief story about the dish"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Detailed description of the dish"
                  required
                />
              </div>

              {/* Dish Category */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Dish Category
                </label>
                <select
                  name="dishCategoryId"
                  value={formData.dishCategoryId}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select category</option>
                  {dishCategories.map(category => (
                    <option key={category.id} value={String(category.id)}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Toggle Switches */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-neutral-700">
                    Allow Customer Customization
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="allowCustomization"
                      checked={formData.allowCustomization}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors ${
                      formData.allowCustomization ? 'bg-primary-600' : 'bg-neutral-200'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        formData.allowCustomization ? 'translate-x-5' : 'translate-x-0.5'
                      } mt-0.5`}></div>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-neutral-700">
                    Allow Customer Negotiation
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="allowNegotiation"
                      checked={formData.allowNegotiation}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors ${
                      formData.allowNegotiation ? 'bg-primary-600' : 'bg-neutral-200'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        formData.allowNegotiation ? 'translate-x-5' : 'translate-x-0.5'
                      } mt-0.5`}></div>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-neutral-700">
                    Sold Out
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isSoldOut"
                      checked={formData.isSoldOut}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors ${
                      formData.isSoldOut ? 'bg-red-600' : 'bg-neutral-200'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        formData.isSoldOut ? 'translate-x-5' : 'translate-x-0.5'
                      } mt-0.5`}></div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </form>

          <div className="flex justify-end space-x-3 p-6 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Dish'}
            </button>
          </div>
        </div>
      </div>

      {/* DialogueBox for feedback */}
      <DialogueBox
        isOpen={dialogueBox.isOpen}
        onClose={closeDialogue}
        type={dialogueBox.type}
        title={dialogueBox.title}
        message={dialogueBox.message}
      />
    </>
  );
};

export default EditDishModal;
