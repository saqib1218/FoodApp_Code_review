import React, { useState, useEffect, useContext } from 'react';
import { XMarkIcon, PencilIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../hooks/useAuth';
import { PERMISSIONS } from '../../../contexts/PermissionRegistry';
import { DishContext } from './index';
import DialogueBox from '../../../components/DialogueBox';

const DishAvailabilityTab = () => {
  const { id: dishId } = useContext(DishContext);
  const { hasPermission } = useAuth();
  
  // Check permissions - simplified to only use admin.dish.view
  const canViewAvailability = hasPermission(PERMISSIONS.DISH_VIEW);

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Availability grid state (day x meal slot)
  const [availabilityData, setAvailabilityData] = useState([]);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [editingMeal, setEditingMeal] = useState(null);
  const [formData, setFormData] = useState({
    isAvailable: false,
    startTime: '08:00',
    endTime: '10:00'
  });
  const [timeErrors, setTimeErrors] = useState({ startTime: '', endTime: '' });
  
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

  // Load availability (mock local state for now)
  const loadAvailability = () => {
    setIsLoading(true);
    // Initialize empty availability per day/slot
    const initial = [];
    setAvailabilityData(initial);
    setIsLoading(false);
  };

  // Initialize on mount/when dish/permission changes
  useEffect(() => {
    if (canViewAvailability && dishId) {
      loadAvailability();
    }
  }, [dishId, canViewAvailability]);

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

  // Meal periods
  const mealPeriods = [
    { id: 1, name: 'breakfast', label: 'Breakfast', minTime: '06:00', maxTime: '12:00', defaultStart: '08:00', defaultEnd: '10:00' },
    { id: 2, name: 'lunch', label: 'Lunch', minTime: '12:00', maxTime: '17:00', defaultStart: '12:00', defaultEnd: '14:00' },
    { id: 3, name: 'dinner', label: 'Dinner', minTime: '17:00', maxTime: '22:00', defaultStart: '18:00', defaultEnd: '20:00' },
    { id: 4, name: 'iftar', label: 'Iftar', minTime: '17:00', maxTime: '20:00', defaultStart: '17:30', defaultEnd: '19:00' },
    { id: 5, name: 'full_day', label: 'Full Day', minTime: '00:00', maxTime: '23:59', defaultStart: '06:00', defaultEnd: '22:00' }
  ];

  // Helpers
  const getAvailabilityForDaySlot = (dayId, slotId) => {
    return availabilityData.find(item => item.day?.id === dayId && item.slot?.id === slotId);
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const [h, m] = timeString.split(':');
      const t = new Date();
      t.setHours(parseInt(h, 10));
      t.setMinutes(parseInt(m, 10));
      return t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeString;
    }
  };

  const handleEditTimeSlot = (day, slot) => {
    setEditingDay(day);
    setEditingMeal(slot);
    const availability = getAvailabilityForDaySlot(day.id, slot.id);
    const constraints = mealPeriods.find(p => p.id === slot.id);
    setFormData({
      isAvailable: availability?.isAvailable || false,
      startTime: availability?.customStartTime || constraints?.defaultStart || '08:00',
      endTime: availability?.customEndTime || constraints?.defaultEnd || '10:00'
    });
    setTimeErrors({ startTime: '', endTime: '' });
    setShowEditModal(true);
  };

  const getCurrentMealConstraints = () => {
    if (!editingMeal) return null;
    return mealPeriods.find(p => p.id === editingMeal.id);
  };

  const isTimeValid = (time) => {
    const c = getCurrentMealConstraints();
    if (!c || !time) return true;
    const val = time.replace(':', '');
    return val >= c.minTime.replace(':', '') && val <= c.maxTime.replace(':', '');
  };

  const isStartBeforeEnd = (s, e) => {
    if (!s || !e) return true;
    return s < e;
  };

  const handleFormChange = (e) => {
    const { name, type, checked, value } = e.target;
    if (name === 'isAvailable') {
      setFormData({ ...formData, isAvailable: checked });
      setTimeErrors({ startTime: '', endTime: '' });
      return;
    }
    if (name === 'startTime' || name === 'endTime') {
      const newVal = value;
      const newForm = { ...formData, [name]: newVal };
      const errs = { ...timeErrors };
      errs[name] = '';
      if (!isTimeValid(newVal)) {
        const c = getCurrentMealConstraints();
        errs[name] = `${name === 'startTime' ? 'Start' : 'End'} time must be between ${c.minTime} and ${c.maxTime}`;
        setTimeErrors(errs);
        return;
      }
      if (name === 'startTime' && formData.endTime && !isStartBeforeEnd(newVal, formData.endTime)) {
        errs.startTime = 'Start time must be before end time';
        setTimeErrors(errs);
        return;
      }
      if (name === 'endTime' && formData.startTime && !isStartBeforeEnd(formData.startTime, newVal)) {
        errs.endTime = 'End time must be after start time';
        setTimeErrors(errs);
        return;
      }
      setTimeErrors(errs);
      setFormData(newForm);
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveChanges = () => {
    setAvailabilityData(prev => {
      const others = prev.filter(i => !(i.day?.id === editingDay.id && i.slot?.id === editingMeal.id));
      if (!formData.isAvailable) {
        return others;
      }
      return [
        ...others,
        {
          day: { id: editingDay.id, name: editingDay.name },
          slot: { id: editingMeal.id, name: editingMeal.name, label: editingMeal.label },
          isAvailable: formData.isAvailable,
          customStartTime: formData.startTime,
          customEndTime: formData.endTime
        }
      ];
    });
    setShowEditModal(false);
    showDialogue('success', 'Updated', 'Dish availability has been updated.');
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
        <h3 className="text-lg font-medium text-neutral-900">Dish Availability Schedule</h3>
        <p className="mt-1 text-sm text-neutral-500">Set when this dish is available for different meal periods.</p>
      </div>

      {!canViewAvailability ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Access Denied</h3>
            <p className="text-neutral-500">You don't have permission to access dish availability.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-1/6">Day</th>
                  {mealPeriods.map(slot => (
                    <th key={slot.id} scope="col" className="px-6 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">{slot.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {daysOfWeek.map(day => (
                  <tr key={day.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{day.name}</td>
                    {mealPeriods.map(slot => (
                      <td key={slot.id} className="px-6 py-4">
                        {(() => {
                          const availability = getAvailabilityForDaySlot(day.id, slot.id);
                          if (availability?.isAvailable) {
                            const start = availability.customStartTime || slot.defaultStart;
                            const end = availability.customEndTime || slot.defaultEnd;
                            return (
                              <div className="bg-green-50 text-center p-3 rounded-md border border-green-200 relative group">
                                <div className="flex items-center justify-center">
                                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                                  <span className="text-sm font-medium text-green-700">Available</span>
                                </div>
                                <div className="text-xs text-green-600 mt-1">{formatTime(start)} - {formatTime(end)}</div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleEditTimeSlot(day, slot); }}
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-white shadow-sm border border-green-200 hover:bg-green-50"
                                  title="Edit availability"
                                >
                                  <PencilIcon className="h-3 w-3 text-green-600" />
                                </button>
                              </div>
                            );
                          }
                          return (
                            <div className="text-center p-3 rounded-md border border-neutral-200 relative group">
                              <div className="text-sm font-medium text-neutral-500">Not Available</div>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleEditTimeSlot(day, slot); }}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-white shadow-sm border border-neutral-300 hover:bg-neutral-50"
                                title="Set availability"
                              >
                                <PencilIcon className="h-3 w-3 text-neutral-600" />
                              </button>
                            </div>
                          );
                        })()}
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
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4 p-6 pb-0">
              <h3 className="text-lg font-medium text-neutral-900">Edit Availability</h3>
              <button onClick={() => setShowEditModal(false)} className="text-neutral-500 hover:text-neutral-700">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 pb-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700">Available</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={formData.isAvailable}
                      onChange={handleFormChange}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors ${formData.isAvailable ? 'bg-primary-600' : 'bg-neutral-200'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${formData.isAvailable ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`}></div>
                    </div>
                  </label>
                </div>
                {formData.isAvailable && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Start Time</label>
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleFormChange}
                        className={`w-full p-3 border rounded-lg focus:ring-2 ${timeErrors.startTime ? 'border-red-300 focus:ring-red-500' : 'border-neutral-300 focus:ring-primary-500'}`}
                      />
                      {timeErrors.startTime && <p className="mt-1 text-xs text-red-600">{timeErrors.startTime}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">End Time</label>
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleFormChange}
                        className={`w-full p-3 border rounded-lg focus:ring-2 ${timeErrors.endTime ? 'border-red-300 focus:ring-red-500' : 'border-neutral-300 focus:ring-primary-500'}`}
                      />
                      {timeErrors.endTime && <p className="mt-1 text-xs text-red-600">{timeErrors.endTime}</p>}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 text-sm font-medium">Cancel</button>
                <button onClick={handleSaveChanges} className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm font-medium">Save</button>
              </div>
            </div>
          </div>
        </div>
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
