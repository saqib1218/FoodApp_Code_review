import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import DialogueBox from './DialogueBox';
import dishDropdownData from '../data/dishDropdown/dishDropdownData.json';

const EditDishModal = ({ isOpen, onClose, dish, onSave }) => {
  const [formData, setFormData] = useState({
    dishName: '',
    story: '',
    description: '',
    category: '',
    course: '',
    tags: [],
    cuisine: [],
    dietaryFlags: [],
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
  const { dishCategories, dishCourseTypes, dishTags, dishCuisines, dishDietaryFlags } = dishDropdownData;

  // Initialize form data when dish changes
  useEffect(() => {
    if (dish && isOpen) {
      setFormData({
        dishName: dish.dishName || '',
        story: dish.story || '',
        description: dish.description || '',
        category: dish.category || '',
        course: dish.course || '',
        tags: dish.tags || [],
        cuisine: dish.cuisine || [],
        dietaryFlags: dish.dietaryFlags || [],
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

  const handleMultiSelectChange = (fieldName, value) => {
    setFormData(prev => {
      const currentValues = prev[fieldName] || [];
      const isSelected = currentValues.includes(value);
      
      return {
        ...prev,
        [fieldName]: isSelected 
          ? currentValues.filter(item => item !== value)
          : [...currentValues, value]
      };
    });
  };

  const handleDropdownSelect = (fieldName, value) => {
    if (value && !formData[fieldName].includes(value)) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: [...prev[fieldName], value]
      }));
    }
  };

  const handleRemoveItem = (fieldName, valueToRemove) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter(item => item !== valueToRemove)
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

              {/* Category and Course - Side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Dish Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select category</option>
                    {dishCategories.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Dish Course
                  </label>
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select course</option>
                    {dishCourseTypes.map(course => (
                      <option key={course.id} value={course.name}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dish Tags */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Dish Tags
                </label>
                <select
                  value=""
                  onChange={(e) => {
                    handleDropdownSelect('tags', e.target.value);
                    e.target.value = ''; // Reset dropdown
                  }}
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select tags</option>
                  {dishTags.map(tag => (
                    <option key={tag.id} value={tag.name}>
                      {tag.name}
                    </option>
                  ))}
                </select>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem('tags', tag)}
                          className="ml-1 text-primary-600 hover:text-primary-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Dish Cuisine */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Dish Cuisine
                </label>
                <select
                  value=""
                  onChange={(e) => {
                    handleDropdownSelect('cuisine', e.target.value);
                    e.target.value = ''; // Reset dropdown
                  }}
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select cuisine</option>
                  {dishCuisines.map(cuisine => (
                    <option key={cuisine.id} value={cuisine.name}>
                      {cuisine.name}
                    </option>
                  ))}
                </select>
                {formData.cuisine.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.cuisine.map((cuisine, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {cuisine}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem('cuisine', cuisine)}
                          className="ml-1 text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Dish Dietary Flags */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Dietary Flags
                </label>
                <select
                  value=""
                  onChange={(e) => {
                    handleDropdownSelect('dietaryFlags', e.target.value);
                    e.target.value = ''; // Reset dropdown
                  }}
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select dietary flag</option>
                  {dishDietaryFlags.map(flag => (
                    <option key={flag.id} value={flag.name}>
                      {flag.name}
                    </option>
                  ))}
                </select>
                {formData.dietaryFlags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.dietaryFlags.map((flag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {flag}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem('dietaryFlags', flag)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
