import React, { useState, useEffect, useContext } from 'react';
import { PlusIcon, EyeIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../hooks/useAuth';
import { PERMISSIONS } from '../../../contexts/PermissionRegistry';
import { DishContext } from './index';
import ConfirmationModal from '../../../components/ConfirmationModal';
import DialogueBox from '../../../components/DialogueBox';

const DishAvailabilityTab = () => {
  const { id: dishId } = useContext(DishContext);
  const { hasPermission } = useAuth();
  
  // Check permissions - simplified to only use admin.dish.view
  const canViewAvailability = hasPermission(PERMISSIONS.DISH_VIEW);
  const canAddAvailability = hasPermission(PERMISSIONS.DISH_VIEW);
  
  // State variables
  const [availability, setAvailability] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState(null);
  const [deleteComment, setDeleteComment] = useState('');
  
  // Form state
  const [availabilityForm, setAvailabilityForm] = useState({
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    isAvailable: true,
    maxOrders: '',
    notes: ''
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

  // Load availability
  useEffect(() => {
    const loadAvailability = () => {
      setIsLoading(true);
      
      // Mock availability data
      const mockAvailability = [
        {
          id: 1,
          dayOfWeek: 'Monday',
          startTime: '09:00',
          endTime: '22:00',
          isAvailable: true,
          maxOrders: '50',
          notes: 'Regular hours',
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          dayOfWeek: 'Sunday',
          startTime: '11:00',
          endTime: '20:00',
          isAvailable: true,
          maxOrders: '30',
          notes: 'Weekend hours',
          createdAt: '2024-01-16T11:45:00Z'
        }
      ];
      
      setAvailability(mockAvailability);
      setIsLoading(false);
    };
    
    if (canViewAvailability && dishId) {
      loadAvailability();
    }
  }, [dishId, canViewAvailability]);

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAvailabilityForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle add availability
  const handleAddAvailability = () => {
    setAvailabilityForm({
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      isAvailable: true,
      maxOrders: '',
      notes: ''
    });
    setShowAddModal(true);
  };

  // Handle save availability
  const handleSaveAvailability = async () => {
    try {
      // Validation
      if (!availabilityForm.dayOfWeek) {
        showDialogue('error', 'Validation Error', 'Day of week is required.');
        return;
      }
      
      if (!availabilityForm.startTime || !availabilityForm.endTime) {
        showDialogue('error', 'Validation Error', 'Start time and end time are required.');
        return;
      }

      // TODO: Replace with RTK Query mutation
      console.log('Saving availability:', availabilityForm);
      
      // Mock save - add to local state
      const newAvailability = {
        ...availabilityForm,
        id: availability.length + 1,
        createdAt: new Date().toISOString()
      };
      
      setAvailability(prev => [...prev, newAvailability]);
      setShowAddModal(false);
      showDialogue('success', 'Availability Added', 'Dish availability has been added successfully!');
      
    } catch (error) {
      console.error('Failed to save availability:', error);
      showDialogue('error', 'Save Failed', `Failed to save availability: ${error.message || 'Unknown error occurred'}`);
    }
  };

  // Handle view availability
  const handleViewAvailability = (availabilityItem) => {
    setSelectedAvailability(availabilityItem);
    setShowViewModal(true);
  };

  // Handle delete availability
  const handleDeleteAvailability = (availabilityItem) => {
    setSelectedAvailability(availabilityItem);
    setDeleteComment('');
    setShowDeleteModal(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    try {
      // TODO: Replace with RTK Query mutation
      console.log('Deleting availability:', selectedAvailability.id);
      
      // Remove from local state
      setAvailability(prev => prev.filter(a => a.id !== selectedAvailability.id));
      setShowDeleteModal(false);
      setSelectedAvailability(null);
      setDeleteComment('');
      showDialogue('success', 'Availability Deleted', 'Dish availability has been deleted successfully!');
      
    } catch (error) {
      console.error('Failed to delete availability:', error);
      showDialogue('error', 'Delete Failed', `Failed to delete availability: ${error.message || 'Unknown error occurred'}`);
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
            <h3 className="text-lg font-medium text-neutral-900">Dish Availability</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Manage when this dish is available for ordering.
            </p>
          </div>
          {canAddAvailability && (
            <button
              onClick={handleAddAvailability}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Availability
            </button>
          )}
        </div>
      </div>

      {/* Availability Table */}
      {!canViewAvailability ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Access Denied</h3>
            <p className="text-neutral-500">You don't have permission to access dish availability.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            {availability.length === 0 ? (
              <div className="text-center py-12 bg-neutral-50">
                <p className="text-neutral-500">No availability schedules found for this dish.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Day
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Max Orders
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Notes
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {availability.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900">
                          {item.dayOfWeek}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">
                          {item.startTime} - {item.endTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">
                          {item.maxOrders || 'No limit'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-neutral-900 max-w-xs truncate">
                          {item.notes || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewAvailability(item)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="View availability"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAvailability(item)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete availability"
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

      {/* Add Availability Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 p-6 pb-0">
              <h3 className="text-lg font-medium text-neutral-900">Add Availability</h3>
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
                    Day of Week *
                  </label>
                  <select
                    name="dayOfWeek"
                    value={availabilityForm.dayOfWeek}
                    onChange={handleFormChange}
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select day</option>
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={availabilityForm.startTime}
                      onChange={handleFormChange}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      End Time *
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={availabilityForm.endTime}
                      onChange={handleFormChange}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Max Orders per Day
                  </label>
                  <input
                    type="number"
                    name="maxOrders"
                    value={availabilityForm.maxOrders}
                    onChange={handleFormChange}
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Leave empty for no limit"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={availabilityForm.notes}
                    onChange={handleFormChange}
                    rows={2}
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Any special notes"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={availabilityForm.isAvailable}
                    onChange={handleFormChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-neutral-700">
                    Available for ordering
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
                  onClick={handleSaveAvailability}
                  className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Save Availability
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Availability Modal */}
      {showViewModal && selectedAvailability && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-neutral-900">Availability Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-neutral-700">Day:</span>
                <span className="ml-2 text-sm text-neutral-900">{selectedAvailability.dayOfWeek}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Time:</span>
                <span className="ml-2 text-sm text-neutral-900">{selectedAvailability.startTime} - {selectedAvailability.endTime}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Status:</span>
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedAvailability.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {selectedAvailability.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Max Orders:</span>
                <span className="ml-2 text-sm text-neutral-900">{selectedAvailability.maxOrders || 'No limit'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Notes:</span>
                <span className="ml-2 text-sm text-neutral-900">{selectedAvailability.notes || '-'}</span>
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
      {showDeleteModal && selectedAvailability && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          title="Delete Availability"
          message={`Are you sure you want to delete the availability schedule for ${selectedAvailability.dayOfWeek}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedAvailability(null);
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

export default DishAvailabilityTab;
