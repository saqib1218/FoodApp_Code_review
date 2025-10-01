import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import DialogueBox from './DialogueBox';
import dishDropdownData from '../data/dishDropdown/dishDropdownData.json';

const AddDishModal = ({ isOpen, onClose, onSave, kitchenId, onDishAdded }) => {
  const [formData, setFormData] = useState({
    dishName: '',
    category: '',
    story: '',
    description: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Get dropdown data from JSON file
  const { dishCategories } = dishDropdownData;
  
  // Dialogue box state for feedback
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      
      // Prepare dish data
      const dishData = {
        id: Date.now(), // Mock ID for now
        name: formData.dishName,
        category: formData.category,
        story: formData.story,
        description: formData.description,
        kitchenId,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      
      // TODO: Replace with actual API call using RTK Query
      console.log('Creating dish:', dishData);
      
      // Call the onDishAdded callback if provided, otherwise onSave
      if (onDishAdded) {
        onDishAdded(dishData);
      } else if (onSave) {
        await onSave(dishData);
      }
      
      // Show success message
      showDialogue('success', 'Dish Added', 'Dish has been added successfully!');
      
      // Reset form
      setFormData({
        dishName: '',
        category: '',
        story: '',
        description: ''
      });
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Failed to add dish:', error);
      showDialogue('error', 'Add Failed', `Failed to add dish: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      dishName: '',
      category: '',
      story: '',
      description: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center mb-4 p-6 pb-0">
            <h3 className="text-lg font-medium text-neutral-900">
              Add New Dish
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
                  disabled={isLoading}
                />
              </div>

              {/* Dish Category */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Dish Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  disabled={isLoading}
                >
                  <option value="">Select category</option>
                  {dishCategories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
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
                  placeholder="Enter dish story or tagline"
                  disabled={isLoading}
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
                  rows={4}
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter dish description"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end space-x-3 mt-6 pb-6">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Dish'}
              </button>
            </div>
          </form>
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

export default AddDishModal;
