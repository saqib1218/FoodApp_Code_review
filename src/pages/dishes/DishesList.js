import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, PlusIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { PERMISSIONS } from '../../contexts/PermissionRegistry';
import AddDishModal from '../../components/AddDishModal';
import DialogueBox from '../../components/DialogueBox';
import { useGetAllDishesQuery } from '../../store/api/modules/dishes/dishesApi';
import { skipToken } from '@reduxjs/toolkit/query';

const DishesList = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  // Check permissions - simplified to only use admin.dish.view
  const canViewDishes = hasPermission(PERMISSIONS.DISH_LIST_VIEW);
  const canAddDish = hasPermission(PERMISSIONS.DISH_CREATE);
  const canViewDishDetail = hasPermission(PERMISSIONS.DISH_DETAIL_VIEW);
  
  // State variables
  const [dishes, setDishes] = useState([]);
  const [kitchens, setKitchens] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  // Filters UI (align with KitchensList)
  const defaultFilters = { category: '', status: '', kitchenName: '', dishId: '' };
  const [filters, setFilters] = useState(defaultFilters);
  const [pendingFilters, setPendingFilters] = useState(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState({ categories: [], statuses: [] });
  
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

  // Fetch all dishes when permitted
  const { data: allDishesResp, isLoading: isAllDishesLoading } = useGetAllDishesQuery(
    canViewDishes ? { page: 1, limit: 50 } : skipToken
  );

  useEffect(() => {
    if (isAllDishesLoading) {
      setIsLoading(true);
      return;
    }
    setIsLoading(false);
    if (allDishesResp) {
      // New API shape: { success, code, message, data: [ { id, kitchen: { id, name }, name, story, ... } ] }
      const list = Array.isArray(allDishesResp?.data)
        ? allDishesResp.data
        : Array.isArray(allDishesResp)
          ? allDishesResp
          : [];
      setDishes(list);
      // Derive kitchens list (may be used elsewhere)
      const uniqKitchens = Array.from(new Map(list
        .filter(d => d.kitchen && d.kitchen.id)
        .map(d => [d.kitchen.id, { id: d.kitchen.id, name: d.kitchen.name || d.kitchen.id }])
      ).values());
      setKitchens(uniqKitchens);
      // Build filter options similar to KitchensList
      const categories = Array.from(new Set(list.map(d => (d.category?.name || d.category || '').toString()).filter(Boolean)));
      const statuses = Array.from(new Set(list.map(d => (d.status || (d.isActive ? 'active' : 'inactive'))).filter(Boolean)));
      setFilterOptions({ categories, statuses });
    }
  }, [allDishesResp, isAllDishesLoading]);

  // Filter dishes based on search term and selected kitchen
  const filteredDishes = dishes.filter(dish => {
    const name = (dish.name || dish.dishName || '').toString();
    const kid = dish.kitchen && dish.kitchen.id ? String(dish.kitchen.id) : '';
    const kname = dish.kitchen && dish.kitchen.name ? dish.kitchen.name.toString() : '';
    const cat = (dish.category?.name || dish.category || '').toString();
    const status = (dish.status || (dish.isActive ? 'active' : 'inactive')).toString();

    // Search across name, kitchen id/name, story
    const matchesSearch = searchTerm.trim() === '' || (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dish.story || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchCategory = !filters.category || cat.toLowerCase() === filters.category.toLowerCase();
    const matchStatus = !filters.status || status.toLowerCase() === filters.status.toLowerCase();
    const matchKitchenName = !filters.kitchenName || kname.toLowerCase().includes(filters.kitchenName.toLowerCase());
    const matchDishId = !filters.dishId || String(dish.id).toLowerCase().includes(filters.dishId.toLowerCase());
    return matchesSearch && matchCategory && matchStatus && matchKitchenName && matchDishId;
  });

  // Handle add dish
  const handleAddDish = () => {
    setShowAddDishModal(true);
  };

  // Handle save dish
  const handleSaveDish = async (dishData) => {
    try {
      // TODO: Replace with RTK Query mutation
      console.log('Saving dish:', dishData);
      
      // Mock save - add to local state
      const newDish = {
        ...dishData,
        id: dishes.length + 1,
        kitchenName: kitchens.find(k => k.id.toString() === dishData.kitchenId)?.name || 'Unknown Kitchen'
      };
      
      setDishes(prev => [...prev, newDish]);
      showDialogue('success', 'Dish Added', 'Dish has been added successfully!');
      
    } catch (error) {
      console.error('Failed to save dish:', error);
      throw error;
    }
  };

  // Handle view dish details
  const handleViewDish = (dish) => {
    if (!canViewDishDetail) {
      showDialogue('error', 'Access Denied', "You don't have permission to view dish details.");
      return;
    }
    navigate(`/dishes/${dish.id}`);
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 text-center text-neutral-600">Working on it...</div>
  );
};

export default DishesList;
