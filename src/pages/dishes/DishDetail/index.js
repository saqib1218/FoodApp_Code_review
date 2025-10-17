import { useGetDishByIdQuery, useUpdateDishByIdMutation } from '../../../store/api/modules/dishes/dishesApi';
import { skipToken } from '@reduxjs/toolkit/query';
import React, { useState, useEffect, createContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../hooks/useAuth';
import { PERMISSIONS } from '../../../contexts/PermissionRegistry';
import DishVariantsTab from './DishVariantsTab';
import DishAvailabilityTab from './DishAvailabilityTab';
import DishSegmentTab from './DishSegmentTab';
import DishMediaTab from './DishMediaTab';
import DishSpecialEventTab from './DishSpecialEventTab';
import DialogueBox from '../../../components/DialogueBox';
import EditDishModal from '../../../components/EditDishModal';

// Create context for dish data
export const DishContext = createContext();

const DishDetail = () => {
  const params = useParams();
  const dishId = params.dishId || params.id;
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  // Permission: admin.dish.detail.view
  const canViewDishDetail = hasPermission(PERMISSIONS.DISH_DETAIL_VIEW);
  const canEditDish = hasPermission(PERMISSIONS.DISH_EDIT);
  
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

  // Fetch dish detail from API
  const { data: dishResp, isLoading: isDishLoading, refetch } = useGetDishByIdQuery(
    canViewDishDetail && dishId ? dishId : skipToken
  );
  const [updateDishById, { isLoading: isUpdating }] = useUpdateDishByIdMutation();

  useEffect(() => {
    if (!canViewDishDetail) {
      setIsLoading(false);
      return;
    }
    setIsLoading(isDishLoading);
    if (dishResp) {
      // Expected API shape: { success, code, message, data: { ...dish } }
      const d = dishResp?.data || dishResp;
      // Normalize fields used in UI
      const normalized = {
        id: d.id,
        dishName: d.name || d.dishName,
        story: d.story,
        description: d.description,
        kitchenId: d.kitchen?.id || d.kitchenId,
        kitchenName: d.kitchen?.name || d.kitchenName,
        status: d.isActive ? 'active' : 'inactive',
        category: d.category?.name || d.category || '',
        categoryId: d.category?.id || d.categoryId || '',
        allowCustomization: d.isCustomizationAllowed,
        allowNegotiation: d.isNegotiable,
        isSoldOut: d.isSoldOut,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        // New: segment fields for preservation across edits
        course: d.coursetype?.name || '',
        courseTypeId: d.courseTypeId ?? d.coursetype?.id ?? null,
        tags: Array.isArray(d.tags) ? d.tags.map(t => t.name) : [],
        tagIds: Array.isArray(d.tagIds) ? d.tagIds : (Array.isArray(d.tags) ? d.tags.map(t => t.id).filter(Boolean) : []),
        cuisine: Array.isArray(d.cuisines) ? d.cuisines.map(c => c.name) : [],
        cuisineIds: Array.isArray(d.cuisineIds) ? d.cuisineIds : (Array.isArray(d.cuisines) ? d.cuisines.map(c => c.id).filter(Boolean) : []),
        dietaryFlags: Array.isArray(d.dietaryinfo) ? d.dietaryinfo.map(df => df.name) : [],
        dietaryFlagIds: Array.isArray(d.dietaryFlagIds) ? d.dietaryFlagIds : (Array.isArray(d.dietaryinfo) ? d.dietaryinfo.map(df => df.id).filter(Boolean) : []),
      };
      setDish(normalized);
    }
  }, [dishResp, isDishLoading, canViewDishDetail]);

  // Handle save edit from modal
  const handleSaveEdit = async (editedData) => {
    try {
      // Map modal fields to API payload
      const payload = {
        name: editedData.dishName,
        story: editedData.story,
        description: editedData.description,
        isCustomizationAllowed: editedData.allowCustomization,
        isNegotiable: editedData.allowNegotiation,
        isSoldOut: editedData.isSoldOut,
      };
      if (editedData.dishCategoryId) {
        payload.dishCategoryId = Number.isNaN(Number(editedData.dishCategoryId))
          ? editedData.dishCategoryId
          : Number(editedData.dishCategoryId);
      }

      // Preserve segmentation-related fields which are not edited in this modal
      // If these are omitted, backend may clear them. Use currently loaded dish values.
      if (Array.isArray(dish?.tagIds) && dish.tagIds.length >= 0) {
        payload.tagIds = dish.tagIds;
      }
      if (Array.isArray(dish?.cuisineIds) && dish.cuisineIds.length >= 0) {
        payload.cuisineIds = dish.cuisineIds;
      }
      if (Array.isArray(dish?.dietaryFlagIds) && dish.dietaryFlagIds.length >= 0) {
        payload.dietaryFlagIds = dish.dietaryFlagIds;
      }
      if (dish?.courseTypeId != null) {
        payload.courseTypeId = dish.courseTypeId;
      }

      await updateDishById({ dishId, body: payload }).unwrap();
      // Refetch latest detail
      await refetch();
      showDialogue('success', 'Dish Updated', 'Dish information has been updated successfully.');
      
    } catch (error) {
      console.error('Failed to update dish:', error);
      showDialogue('error', 'Update Failed', `Failed to update dish: ${error.message || 'Unknown error occurred'}`);
      throw error; // Re-throw to let modal handle it
    }
  };

  // Determine if dish is Special Event category
  const isSpecialEvent = (
    String(dish?.categoryId) === '2' ||
    String(dish?.category)?.toLowerCase() === 'special event' ||
    String(dish?.category)?.toLowerCase() === 'special-event'
  );

  // Build tabs dynamically based on category
  const tabs = [
    { id: 'variants', name: 'Dish Variants', component: DishVariantsTab },
    ...(isSpecialEvent
      ? [{ id: 'specialEvent', name: 'Dish Special Event', component: DishSpecialEventTab }]
      : [{ id: 'availability', name: 'Dish Availability', component: DishAvailabilityTab }]
    ),
    { id: 'segment', name: 'Dish Segment', component: DishSegmentTab },
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

  // If availability tab is hidden due to Special Event, ensure activeTab is valid
  const tabIds = tabs.map(t => t.id);
  const safeActiveTab = tabIds.includes(activeTab) ? activeTab : tabs[0].id;
  const ActiveTabComponent = tabs.find(tab => tab.id === safeActiveTab)?.component;

  return (
    <DishContext.Provider value={{ id: dishId, dish, setDish }}>
      <div className="bg-white shadow rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-200 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dishes')}
              className="mr-4 text-neutral-500 hover:text-neutral-700"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-xl font-medium text-neutral-900">{dish.dishName}</h2>
              <p className="text-sm text-neutral-500">Kitchen: {dish.kitchenName}</p>
            </div>
          </div>
          {canEditDish && (
            <button
              onClick={async () => {
                try {
                  await refetch();
                } catch {}
                closeDialogue();
                setIsEditModalOpen(true);
              }}
              className="px-4 py-2 border border-neutral-300 rounded-full shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 flex items-center"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Dish
            </button>
          )}
        </div>

        {/* Basic Info */}
        <div className="px-6 py-5 border-b border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {dish.story && (
              <div className="mb-2">
                <h3 className="text-sm font-medium text-neutral-500">Story</h3>
                <p className="mt-1 text-neutral-900">{dish.story}</p>
              </div>
            )}
            {dish.description && (
              <div className="mb-2">
                <h3 className="text-sm font-medium text-neutral-500">Description</h3>
                <p className="mt-1 text-neutral-900">{dish.description}</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2">
            {dish.category && (
              <div>
                <span className="text-sm font-medium text-neutral-500">Category</span>
                <p className="mt-1 text-neutral-900 capitalize">{dish.category.replace('-', ' ')}</p>
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-neutral-500">Allow Customization</span>
              <p className="mt-1 text-neutral-900">{dish.allowCustomization ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-neutral-500">Allow Negotiation</span>
              <p className="mt-1 text-neutral-900">{dish.allowNegotiation ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-neutral-500">Sold Out</span>
              <p className="mt-1 text-neutral-900">{dish.isSoldOut ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-neutral-200 mb-8">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  safeActiveTab === tab.id
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
