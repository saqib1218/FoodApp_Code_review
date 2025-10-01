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
import EditDishModal from '../../../components/EditDishModal';

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
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
        category: 'main-course',
        course: 'dinner',
        tags: ['spicy', 'traditional', 'rice'],
        cuisine: ['Indian', 'Pakistani'],
        allowCustomization: true,
        allowNegotiation: false,
        isSoldOut: false,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-20T14:45:00Z'
      };
      
      setDish(mockDish);
      setIsLoading(false);
    };
    
    if (canViewDishDetail && dishId) {
      loadDish();
    } else if (!canViewDishDetail) {
      setIsLoading(false);
    }
  }, [dishId, canViewDishDetail]);

  // Handle save edit from modal
  const handleSaveEdit = async (editedData) => {
    try {
      // TODO: Replace with RTK Query mutation
      console.log('Saving dish edit:', editedData);
      
      // Update local state
      setDish(prev => ({
        ...prev,
        ...editedData,
        updatedAt: new Date().toISOString()
      }));
      
      showDialogue('success', 'Dish Updated', 'Dish information has been updated successfully.');
      
    } catch (error) {
      console.error('Failed to update dish:', error);
      showDialogue('error', 'Update Failed', `Failed to update dish: ${error.message || 'Unknown error occurred'}`);
      throw error; // Re-throw to let modal handle it
    }
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
                onClick={() => setIsEditModalOpen(true)}
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
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">{dish.dishName}</h2>
                {dish.story && (
                  <p className="text-sm text-neutral-600 mt-1">{dish.story}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {dish.isSoldOut && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Sold Out
                  </span>
                )}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {dish.status}
                </span>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium text-neutral-700 mb-2">Description</h3>
              <p className="text-neutral-600">{dish.description}</p>
            </div>
            
            {/* Additional dish details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {dish.category && (
                <div>
                  <span className="font-medium text-neutral-700">Category:</span>
                  <span className="ml-2 text-neutral-600 capitalize">{dish.category.replace('-', ' ')}</span>
                </div>
              )}
              {dish.course && (
                <div>
                  <span className="font-medium text-neutral-700">Course:</span>
                  <span className="ml-2 text-neutral-600 capitalize">{dish.course}</span>
                </div>
              )}
              <div>
                <span className="font-medium text-neutral-700">Customizable:</span>
                <span className="ml-2 text-neutral-600">{dish.allowCustomization ? 'Yes' : 'No'}</span>
              </div>
            </div>
            
            {/* Tags and Cuisine */}
            {(dish.tags?.length > 0 || dish.cuisine?.length > 0) && (
              <div className="mb-4 space-y-2">
                {dish.tags?.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-neutral-700 mr-2">Tags:</span>
                    <div className="inline-flex flex-wrap gap-1">
                      {dish.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {dish.cuisine?.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-neutral-700 mr-2">Cuisine:</span>
                    <div className="inline-flex flex-wrap gap-1">
                      {dish.cuisine.map((cuisine, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                        >
                          {cuisine}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
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

        {/* Edit Dish Modal */}
        <EditDishModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          dish={dish}
          onSave={handleSaveEdit}
        />

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
