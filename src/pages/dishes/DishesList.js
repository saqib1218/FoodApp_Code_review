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
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Dishes Management</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Manage all dishes across your kitchens.
            </p>
          </div>

        </div>
      </div>

      {/* Filters and Search */}
      <div className="mt-6 py-4">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search dishes or kitchens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          {/* Filters toggle button */}
          <div className="sm:w-48">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center w-full px-4 py-2 border border-neutral-300 rounded-md bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <FunnelIcon className="h-5 w-5 mr-2 text-neutral-400" />
              Filters
            </button>
          </div>
        </div>
        {/* Advanced Filters like KitchensList */}
        {showFilters && (
          <div className="mt-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
                <select
                  className="block w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  value={pendingFilters.category}
                  onChange={(e) => setPendingFilters({ ...pendingFilters, category: e.target.value })}
                >
                  <option value="">All Categories</option>
                  {filterOptions.categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                <select
                  className="block w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  value={pendingFilters.status}
                  onChange={(e) => setPendingFilters({ ...pendingFilters, status: e.target.value })}
                >
                  <option value="">All Status</option>
                  {filterOptions.statuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Kitchen Name</label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Search kitchen name..."
                  value={pendingFilters.kitchenName}
                  onChange={(e) => setPendingFilters({ ...pendingFilters, kitchenName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Dish ID</label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Search dish ID..."
                  value={pendingFilters.dishId}
                  onChange={(e) => setPendingFilters({ ...pendingFilters, dishId: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => setFilters(pendingFilters)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm"
              >
                Search
              </button>
              <button
                onClick={() => { setSearchTerm(''); setFilters(defaultFilters); setPendingFilters(defaultFilters); }}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors text-sm"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dishes Table (permission: admin.dish.list.view) */}
      {!canViewDishes ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Access Denied</h3>
            <p className="text-neutral-500">You don't have permission to access the dishes list.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          {/* Removed list header count per request */}
          <div className="overflow-x-auto">
            {filteredDishes.length === 0 ? (
              <div className="text-center py-12 bg-neutral-50">
                <p className="text-neutral-500">
                  {searchTerm || filters.category || filters.status || filters.kitchenName || filters.dishId ? 'No dishes found matching your criteria.' : 'No dishes found.'}
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Kitchen</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Story</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {filteredDishes.map((dish) => (
                    <tr key={dish.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900">{dish.name || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">{(dish.kitchen && dish.kitchen.name) || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-neutral-700 max-w-md truncate">{dish.story || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {canViewDishDetail ? (
                          <button
                            onClick={() => handleViewDish(dish)}
                            className="text-primary-600 hover:text-primary-900 transition-colors"
                            title="View dish details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleViewDish(dish)}
                            className="text-neutral-300 cursor-not-allowed"
                            title="You don't have permission to view details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Add Dish Modal */}
      <AddDishModal
        isOpen={showAddDishModal}
        onClose={() => setShowAddDishModal(false)}
        onDishAdded={() => {
          showDialogue('success', 'Dish Added', 'Dish has been added successfully!');
        }}
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
  );
};

export default DishesList;
