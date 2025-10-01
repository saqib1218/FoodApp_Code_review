import React, { useState, useEffect, createContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../hooks/useAuth';
import { PERMISSIONS } from '../../../contexts/PermissionRegistry';
import DishVariantsTab from './DishVariantsTab';
import DishAvailabilityTab from './DishAvailabilityTab';
import DishCategoryTab from './DishCategoryTab';
import DishMediaTab from './DishMediaTab';
import DialogueBox from '../../../components/DialogueBox';

// Create context for dish data
export const DishContext = createContext();

const DishDetail = () => {
  const { id: dishId } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  // Check permissions - simplified to only use admin.dish.view
  const canViewDishDetail = hasPermission(PERMISSIONS.DISH_VIEW);
  const canEditDish = hasPermission(PERMISSIONS.DISH_VIEW);
  
  // State variables
  const [dish, setDish] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('variants');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    dishName: '',
    story: '',
    description: ''
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

  // Load dish data
  useEffect(() => {
    const loadDish = () => {
      setIsLoading(true);
      
      // Mock dish data - replace with RTK Query later
      const mockDish = {
        id: parseInt(dishId),
        dishName: 'Chicken Biryani',
        story: 'Traditional aromatic rice dish',
        description: 'Fragrant basmati rice cooked with tender chicken and aromatic spices, served with raita and pickle',
        kitchenId: 1,
        kitchenName: 'Spice Garden Kitchen',
        status: 'active',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-20T14:45:00Z'
      };
      
      setDish(mockDish);
      setEditForm({
        dishName: mockDish.dishName,
        story: mockDish.story,
        description: mockDish.description
      });
      setIsLoading(false);
    };
    
    if (canViewDishDetail && dishId) {
      loadDish();
    } else if (!canViewDishDetail) {
      setIsLoading(false);
    }
  }, [dishId, canViewDishDetail]);

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    try {
      // TODO: Replace with RTK Query mutation
      console.log('Saving dish edit:', editForm);
      
      // Update local state
      setDish(prev => ({
        ...prev,
        ...editForm,
        updatedAt: new Date().toISOString()
      }));
      
      setIsEditing(false);
      showDialogue('success', 'Dish Updated', 'Dish information has been updated successfully.');
      
    } catch (error) {
      console.error('Failed to update dish:', error);
      showDialogue('error', 'Update Failed', `Failed to update dish: ${error.message || 'Unknown error occurred'}`);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditForm({
      dishName: dish.dishName,
      story: dish.story,
      description: dish.description
    });
    setIsEditing(false);
  };

  // Tab configuration
  const tabs = [
    { id: 'variants', name: 'Dish Variants', component: DishVariantsTab },
    { id: 'availability', name: 'Dish Availability', component: DishAvailabilityTab },
    { id: 'category', name: 'Dish Category', component: DishCategoryTab },
    { id: 'media', name: 'Dish Media', component: DishMediaTab }
  ];

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!canViewDishDetail) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Access Denied</h3>
          <p className="text-neutral-500">You don't have permission to access dish details.</p>
        </div>
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Dish Not Found</h3>
          <p className="text-neutral-500">The requested dish could not be found.</p>
        </div>
      </div>
    );
  }

  const ActiveTabComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <DishContext.Provider value={{ id: dishId, dish, setDish }}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate('/dishes')}
              className="mr-4 p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-neutral-900">Dish Details</h1>
              <p className="text-sm text-neutral-500">
                Kitchen: {dish.kitchenName}
              </p>
            </div>
            {canEditDish && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Dish
              </button>
            )}
          </div>
        </div>

        {/* Dish Information Card */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Dish Name
                </label>
                <input
                  type="text"
                  name="dishName"
                  value={editForm.dishName}
                  onChange={handleEditChange}
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Story
                </label>
                <input
                  type="text"
                  name="story"
                  value={editForm.story}
                  onChange={handleEditChange}
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  rows={3}
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">{dish.dishName}</h2>
                  {dish.story && (
                    <p className="text-sm text-neutral-600 mt-1">{dish.story}</p>
                  )}
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {dish.status}
                </span>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-neutral-700 mb-2">Description</h3>
                <p className="text-neutral-600">{dish.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-neutral-700">Created:</span>
                  <span className="ml-2 text-neutral-600">{formatDate(dish.createdAt)}</span>
                </div>
                <div>
                  <span className="font-medium text-neutral-700">Last Updated:</span>
                  <span className="ml-2 text-neutral-600">{formatDate(dish.updatedAt)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="border-b border-neutral-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-6">
            {ActiveTabComponent && <ActiveTabComponent />}
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
      </div>
    </DishContext.Provider>
  );
};

export default DishDetail;
