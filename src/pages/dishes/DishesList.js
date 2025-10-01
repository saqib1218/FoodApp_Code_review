import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { PERMISSIONS } from '../../contexts/PermissionRegistry';
import AddDishModal from '../../components/AddDishModal';
import DialogueBox from '../../components/DialogueBox';

const DishesList = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  // Check permissions - simplified to only use admin.dish.view
  const canViewDishes = hasPermission(PERMISSIONS.DISH_VIEW);
  const canAddDish = hasPermission(PERMISSIONS.DISH_VIEW); // Using same permission for now
  
  // State variables
  const [dishes, setDishes] = useState([]);
  const [kitchens, setKitchens] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [selectedKitchen, setSelectedKitchen] = useState('');
  
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

  // Mock data - replace with RTK Query later
  useEffect(() => {
    const loadDishes = () => {
      setIsLoading(true);
      
      // Mock kitchens data
      const mockKitchens = [
        { id: 1, name: 'Spice Garden Kitchen' },
        { id: 2, name: 'Urban Bites' },
        { id: 3, name: 'Healthy Harvest' }
      ];
      
      // Mock dishes data
      const mockDishes = [
        {
          id: 1,
          dishName: 'Chicken Biryani',
          story: 'Traditional aromatic rice dish',
          description: 'Fragrant basmati rice cooked with tender chicken and aromatic spices',
          kitchenId: 1,
          kitchenName: 'Spice Garden Kitchen',
          status: 'active',
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          dishName: 'Margherita Pizza',
          story: 'Classic Italian favorite',
          description: 'Fresh mozzarella, tomato sauce, and basil on crispy crust',
          kitchenId: 2,
          kitchenName: 'Urban Bites',
          status: 'active',
          createdAt: '2024-01-16T14:20:00Z'
        },
        {
          id: 3,
          dishName: 'Quinoa Salad Bowl',
          story: 'Nutritious and delicious',
          description: 'Fresh quinoa with mixed vegetables, nuts, and tahini dressing',
          kitchenId: 3,
          kitchenName: 'Healthy Harvest',
          status: 'active',
          createdAt: '2024-01-17T09:15:00Z'
        }
      ];
      
      setKitchens(mockKitchens);
      setDishes(mockDishes);
      setIsLoading(false);
    };
    
    if (canViewDishes) {
      loadDishes();
    }
  }, [canViewDishes]);

  // Filter dishes based on search term and selected kitchen
  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.dishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dish.kitchenName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKitchen = !selectedKitchen || dish.kitchenId.toString() === selectedKitchen;
    return matchesSearch && matchesKitchen;
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
      <div className="mb-6 bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
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
          
          {/* Kitchen Filter */}
          <div className="sm:w-64">
            <select
              value={selectedKitchen}
              onChange={(e) => setSelectedKitchen(e.target.value)}
              className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Kitchens</option>
              {kitchens.map(kitchen => (
                <option key={kitchen.id} value={kitchen.id.toString()}>
                  {kitchen.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Dishes Table */}
      {!canViewDishes ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Access Denied</h3>
            <p className="text-neutral-500">You don't have permission to access the dishes list.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h4 className="text-base font-medium text-neutral-900">
              All Dishes ({filteredDishes.length})
            </h4>
          </div>
          <div className="overflow-x-auto">
            {filteredDishes.length === 0 ? (
              <div className="text-center py-12 bg-neutral-50">
                <p className="text-neutral-500">
                  {searchTerm || selectedKitchen ? 'No dishes found matching your criteria.' : 'No dishes found.'}
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Kitchen Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Dish Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Story
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
                  {filteredDishes.map((dish) => (
                    <tr key={dish.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900">
                          {dish.kitchenName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900">
                          {dish.dishName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-neutral-900 max-w-xs truncate">
                          {dish.story || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {dish.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-500">
                          {formatDate(dish.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDish(dish)}
                          className="text-primary-600 hover:text-primary-900 transition-colors"
                          title="View dish details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
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
        onSave={handleSaveDish}
        kitchenId={selectedKitchen}
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
