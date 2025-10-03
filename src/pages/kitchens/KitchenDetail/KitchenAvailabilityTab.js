import React, { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { XMarkIcon, PencilIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useGetKitchenAvailabilityQuery, useUpdateKitchenAvailabilityMutation } from '../../../store/api/modules/kitchens/kitchensApi';
import { useAuth } from '../../../hooks/useAuth';
import { PERMISSIONS } from '../../../contexts/PermissionRegistry';
import { KitchenContext } from './index';
import PermissionGate, { PermissionButton } from '../../../components/PermissionGate';
import DialogueBox from '../../../components/DialogueBox';

const KitchenAvailabilityTab = () => {
  const { kitchen } = useContext(KitchenContext);
  const { id: routeKitchenId } = useParams();
  const kitchenId = routeKitchenId || kitchen?.id;
  const { hasPermission } = useAuth();
  
  // Check permission for viewing kitchen availability
  const canViewKitchenAvailability = hasPermission(PERMISSIONS.KITCHEN_AVAILABILITY_VIEW);
  
  // Check permission for editing kitchen availability
  const canEditKitchenAvailability = hasPermission(PERMISSIONS.KITCHEN_AVAILABILITY_ADD);
  
  // RTK Query to fetch kitchen availability data - only if user has permission
  const { data: availabilityResponse, isLoading, error } = useGetKitchenAvailabilityQuery(kitchenId, {
    skip: !canViewKitchenAvailability || !kitchenId
  });
  
  // RTK Query mutation for updating kitchen availability
  const [updateKitchenAvailability, { isLoading: isUpdatingAvailability }] = useUpdateKitchenAvailabilityMutation();
  
  // Extract availability data from API response
  const availabilityData = availabilityResponse?.data || [];

  // State variables
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [editingMeal, setEditingMeal] = useState(null);
  const [formData, setFormData] = useState({
    isAvailable: false,
    startTime: '08:00',
    endTime: '10:00'
  });
  const [timeErrors, setTimeErrors] = useState({
    startTime: '',
    endTime: ''
  });

  // Dialogue box state for API feedback
  const [dialogueBox, setDialogueBox] = useState({
    isOpen: false,
    type: 'success', // 'success' or 'error'
    title: '',
    message: ''
  });

  // Days of the week
  const daysOfWeek = [
    { id: 'Mon', name: 'Monday' },
    { id: 'Tue', name: 'Tuesday' },
    { id: 'Wed', name: 'Wednesday' },
    { id: 'Thu', name: 'Thursday' },
    { id: 'Fri', name: 'Friday' },
    { id: 'Sat', name: 'Saturday' },
    { id: 'Sun', name: 'Sunday' }
  ];

  // Meal periods (slots) with time constraints
  const mealPeriods = [
    { 
      id: 1, 
      name: 'breakfast', 
      label: 'Breakfast',
      minTime: '06:00',
      maxTime: '12:00',
      defaultStart: '08:00',
      defaultEnd: '10:00'
    },
    { 
      id: 2, 
      name: 'lunch', 
      label: 'Lunch',
      minTime: '12:00',
      maxTime: '17:00',
      defaultStart: '12:00',
      defaultEnd: '14:00'
    },
    { 
      id: 3, 
      name: 'dinner', 
      label: 'Dinner',
      minTime: '17:00',
      maxTime: '22:00',
      defaultStart: '18:00',
      defaultEnd: '20:00'
    },
    { 
      id: 4, 
      name: 'iftar', 
      label: 'Iftar',
      minTime: '17:00',
      maxTime: '20:00',
      defaultStart: '17:30',
      defaultEnd: '19:00'
    },
    { 
      id: 5, 
      name: 'full_day', 
      label: 'Full Day',
      minTime: '00:00',
      maxTime: '23:59',
      defaultStart: '06:00',
      defaultEnd: '22:00'
    }
  ];

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

  // Helper function to get availability data for a specific day and slot
  const getAvailabilityForDaySlot = (dayId, slotId) => {
    return availabilityData.find(item => 
      item.day.id === dayId && item.slot.id === slotId
    );
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const [hours, minutes] = timeString.split(':');
      const time = new Date();
      time.setHours(parseInt(hours, 10));
      time.setMinutes(parseInt(minutes, 10));
      return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (err) {
      return timeString;
    }
  };

  // Handle edit time slot
  const handleEditTimeSlot = (day, slot) => {
    console.log('Edit button clicked:', day, slot); // Debug log
    setEditingDay(day);
    setEditingMeal(slot);
    
    const availability = getAvailabilityForDaySlot(day.id, slot.id);
    
    // Get default times from meal period constraints
    const mealConstraints = mealPeriods.find(period => period.id === slot.id);
    
    setFormData({
      isAvailable: availability?.isAvailable || false,
      startTime: availability?.customStartTime || availability?.slot?.defaultStartTime || mealConstraints?.defaultStart || '08:00',
      endTime: availability?.customEndTime || availability?.slot?.defaultEndTime || mealConstraints?.defaultEnd || '10:00'
    });
    
    // Clear any previous errors
    setTimeErrors({ startTime: '', endTime: '' });
    
    console.log('Setting showEditModal to true'); // Debug log
    setShowEditModal(true);
  };

  // Get time constraints for current meal period
  const getCurrentMealConstraints = () => {
    if (!editingMeal) return null;
    return mealPeriods.find(period => period.id === editingMeal.id);
  };

  // Validate time is within meal period constraints
  const isTimeValid = (time, type) => {
    const constraints = getCurrentMealConstraints();
    if (!constraints || !time) return true;
    
    const timeValue = time.replace(':', '');
    const minTime = constraints.minTime.replace(':', '');
    const maxTime = constraints.maxTime.replace(':', '');
    
    return timeValue >= minTime && timeValue <= maxTime;
  };

  // Validate start time is before end time
  const isStartBeforeEnd = (startTime, endTime) => {
    if (!startTime || !endTime) return true;
    return startTime < endTime;
  };

  // Handle form change with validation
  const handleFormChange = (e) => {
    const { name, checked, value } = e.target;
    
    if (name === 'isAvailable') {
      setFormData({ ...formData, isAvailable: checked });
      // Clear errors when toggling availability
      setTimeErrors({ startTime: '', endTime: '' });
    } else if (name === 'startTime' || name === 'endTime') {
      const newFormData = { ...formData, [name]: value };
      let newErrors = { ...timeErrors };
      
      // Clear current field error
      newErrors[name] = '';
      
      // Validate time constraints
      if (!isTimeValid(value, name)) {
        const constraints = getCurrentMealConstraints();
        newErrors[name] = `${name === 'startTime' ? 'Start' : 'End'} time must be between ${constraints.minTime} and ${constraints.maxTime} for ${editingMeal.label}`;
        setTimeErrors(newErrors);
        return;
      }
      
      // Validate start time is before end time
      if (name === 'startTime' && formData.endTime && !isStartBeforeEnd(value, formData.endTime)) {
        newErrors.startTime = 'Start time must be before end time';
        setTimeErrors(newErrors);
        return;
      }
      
      if (name === 'endTime' && formData.startTime && !isStartBeforeEnd(formData.startTime, value)) {
        newErrors.endTime = 'End time must be after start time';
        setTimeErrors(newErrors);
        return;
      }
      
      // Clear any cross-field errors if times are now valid
      if (name === 'startTime' && formData.endTime && isStartBeforeEnd(value, formData.endTime)) {
        newErrors.endTime = newErrors.endTime.includes('after start time') ? '' : newErrors.endTime;
      }
      
      if (name === 'endTime' && formData.startTime && isStartBeforeEnd(formData.startTime, value)) {
        newErrors.startTime = newErrors.startTime.includes('before end time') ? '' : newErrors.startTime;
      }
      
      setTimeErrors(newErrors);
      setFormData(newFormData);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    try {
      // Map day names to API format
      const dayMapping = {
        'Monday': 'Mon',
        'Tuesday': 'Tue', 
        'Wednesday': 'Wed',
        'Thursday': 'Thu',
        'Friday': 'Fri',
        'Saturday': 'Sat',
        'Sunday': 'Sun'
      };

      // Map meal names to slot IDs
      const slotMapping = {
        'breakfast': 1,
        'lunch': 2,
        'dinner': 3,
        'iftar': 4,
        'full_day': 5
      };

      // Prepare API payload
      const apiPayload = {
        availabilities: [
          {
            dayOfWeek: dayMapping[editingDay.name],
            slotId: slotMapping[editingMeal.name],
            isAvailable: formData.isAvailable,
            ...(formData.isAvailable && {
              customStartTime: formData.startTime,
              customEndTime: formData.endTime
            })
          }
        ]
      };

      // Call API to update availability
      const result = await updateKitchenAvailability({
        kitchenId,
        availabilityData: apiPayload
      }).unwrap();

      console.log('Kitchen availability updated successfully:', result);

      // Show success dialogue
      showDialogue('success', 'Availability Updated', 'Kitchen availability has been updated successfully.');

      // Close modal
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update kitchen availability:', err);
      
      // Show error dialogue
      const errorMessage = err?.data?.message || 'Failed to update kitchen availability. Please try again.';
      showDialogue('error', 'Error', errorMessage);
    }
  };

  // Get availability cell content
  const getAvailabilityCell = (day, slot) => {
    const availability = getAvailabilityForDaySlot(day.id, slot.id);
    
    if (availability?.isAvailable) {
      const startTime = availability.customStartTime || availability.slot.defaultStartTime;
      const endTime = availability.customEndTime || availability.slot.defaultEndTime;
      
      return (
        <div className="bg-green-50 text-center p-3 rounded-md border border-green-200 relative group">
          <div className="flex items-center justify-center">
            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-700">Available</span>
          </div>
          <div className="text-xs text-green-600 mt-1">
            {formatTime(startTime)} - {formatTime(endTime)}
          </div>
          {canEditKitchenAvailability && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditTimeSlot(day, slot);
              }}
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-white shadow-sm border border-green-200 hover:bg-green-50"
              title="Edit availability"
            >
              <PencilIcon className="h-3 w-3 text-green-600" />
            </button>
          )}
        </div>
      );
    } else {
      return (
        <div className="text-center p-3 rounded-md border border-neutral-200 relative group">
          <div className="text-sm font-medium text-neutral-500">Not Available</div>
          {canEditKitchenAvailability && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditTimeSlot(day, slot);
              }}
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-white shadow-sm border border-neutral-300 hover:bg-neutral-50"
              title="Set availability"
            >
              <PencilIcon className="h-3 w-3 text-neutral-600" />
            </button>
          )}
        </div>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-neutral-600">Loading availability settings...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-neutral-900">Kitchen Availability Schedule</h3>
        <p className="mt-1 text-sm text-neutral-500">
          Set when this kitchen is available to accept orders for different meal periods.
        </p>
      </div>

      {!canViewKitchenAvailability ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Access Denied</h3>
            <p className="text-neutral-500">You don't have permission to access the kitchen availability.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-1/6">
                    Day
                  </th>
                  {mealPeriods.map(slot => (
                    <th key={slot.id} scope="col" className="px-6 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      {slot.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {daysOfWeek.map((day) => (
                  <tr key={day.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-900">{day.name}</div>
                    </td>
                    {mealPeriods.map(slot => (
                      <td key={`${day.id}-${slot.id}`} className="px-6 py-4">
                        {getAvailabilityCell(day, slot)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Time Slot Modal */}
      {showEditModal && editingDay && editingMeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-neutral-900">
                {editingDay.name} {editingMeal.label} Availability
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAvailable"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleFormChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <label htmlFor="isAvailable" className="ml-2 block text-sm text-neutral-900">
                  Available for {editingMeal.label} on {editingDay.name}
                </label>
              </div>
            </div>
            
            {formData.isAvailable && (
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleFormChange}
                      min={getCurrentMealConstraints()?.minTime}
                      max={getCurrentMealConstraints()?.maxTime}
                      className="w-full p-2 border border-neutral-300 rounded-lg"
                     />
                    <div className="text-xs text-gray-500 mt-1">
                      Range: {getCurrentMealConstraints()?.minTime} - {getCurrentMealConstraints()?.maxTime}
                    </div>
                    {timeErrors.startTime && (
                      <div className="text-xs text-red-600 mt-1 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {timeErrors.startTime}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleFormChange}
                      min={getCurrentMealConstraints()?.minTime}
                      max={getCurrentMealConstraints()?.maxTime}
                      className="w-full p-2 border border-neutral-300 rounded-lg"
                     />
                    <div className="text-xs text-gray-500 mt-1">
                      Range: {getCurrentMealConstraints()?.minTime} - {getCurrentMealConstraints()?.maxTime}
                    </div>
                    {timeErrors.endTime && (
                      <div className="text-xs text-red-600 mt-1 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {timeErrors.endTime}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={timeErrors.startTime || timeErrors.endTime}
                className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialogue Box for API feedback */}
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

export default KitchenAvailabilityTab;
