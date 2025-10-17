import React, { useState, useEffect, useContext } from 'react';
import { XMarkIcon, PencilIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../hooks/useAuth';
import { PERMISSIONS } from '../../../contexts/PermissionRegistry';
import { DishContext } from './index';
import DialogueBox from '../../../components/DialogueBox';
import { useGetKitchenAvailabilityQuery } from '../../../store/api/modules/kitchens/kitchensApi';
import { useGetDishAvailabilityQuery, useUpdateDishAvailabilityMutation } from '../../../store/api/modules/dishes/dishesApi';

const DishAvailabilityTab = () => {
  const { id: dishId, dish } = useContext(DishContext);
  const { hasPermission } = useAuth();
  
  // Permission gate
  const canViewAvailability = hasPermission(PERMISSIONS.DISH_AVAILABILITY_VIEW);
  const canEditDishAvailability = hasPermission(PERMISSIONS.DISH_AVAILABILITY_ADD);

  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  // Kitchen availability fetch using kitchen id from dish detail
  const kitchenId = dish?.kitchen?.id || dish?.kitchenId;
  const { data: kitchenAvailabilityResp, isLoading: isKitchenAvailabilityLoading, isFetching: isKitchenAvailabilityFetching, refetch: refetchKitchenAvailability } = useGetKitchenAvailabilityQuery(kitchenId, {
    skip: !kitchenId,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pollingInterval: 0,
  });

  // Dish availability fetch using dish id (separate API)
  const { data: dishAvailabilityResp, isLoading: isDishAvailabilityLoading, isFetching: isDishAvailabilityFetching, refetch: refetchDishAvailability } = useGetDishAvailabilityQuery(dishId, {
    skip: !dishId,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pollingInterval: 0,
  });

  // Availability grid state (day x meal slot)
  const [availabilityData, setAvailabilityData] = useState([]);
  const [updateDishAvailability, { isLoading: isUpdatingDishAvailability }] = useUpdateDishAvailabilityMutation();

  // When kitchen availability loads, normalize it into our grid state
  useEffect(() => {
    const raw = kitchenAvailabilityResp?.data || kitchenAvailabilityResp;
    if (!Array.isArray(raw)) {
      // Unknown shape (e.g., data: [{ days: [...] }]). Avoid crashing; leave empty until proper mapping is implemented.
      setAvailabilityData([]);
      return;
    }
    const toHM = (t) => (typeof t === 'string' && t.length >= 5 ? t.slice(0, 5) : (t || ''));
    const toLabel = (name) => {
      const base = typeof name === 'string' ? name : (name?.name ?? '');
      const s = String(base || '');
      return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
    };
    const normalized = raw
      .filter((item) => item && (item.day || item.slot)) // only map items that match expected structure
      .map((item) => {
        const dayId = item?.day?.id ?? item?.day ?? null;
        const dayName = item?.day?.name ?? item?.day ?? '';
        const slotId = item?.slot?.id ?? item?.slot ?? null;
        const slotName = item?.slot?.name ?? item?.slot ?? '';
        return {
          day: { id: dayId, name: typeof dayName === 'string' ? dayName : String(dayName || '') },
          slot: { id: slotId, name: typeof slotName === 'string' ? slotName : String(slotName || ''), label: toLabel(slotName) },
          isAvailable: Boolean(item?.isAvailable),
          customStartTime: toHM(item?.customStartTime || item?.slot?.defaultStartTime),
          customEndTime: toHM(item?.customEndTime || item?.slot?.defaultEndTime),
        };
      });
    setAvailabilityData(normalized);
  }, [kitchenAvailabilityResp]);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [editingMeal, setEditingMeal] = useState(null);
  const [formData, setFormData] = useState({
    isAvailable: false,
    startTime: '08:00',
    endTime: '10:00'
  });
  // Note: removed unused timeErrors to satisfy ESLint
  
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

  // Force refetch kitchen availability every time tab mounts or kitchenId changes
  useEffect(() => {
    if (kitchenId) {
      refetchKitchenAvailability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kitchenId]);

  // Force refetch dish availability every time tab mounts or dishId changes
  useEffect(() => {
    if (dishId) {
      refetchDishAvailability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dishId]);

  // Helper to determine if kitchen is open for given day/slot
  const isKitchenOpen = (dayId, slotId) => {
    const data = kitchenAvailabilityResp?.data || kitchenAvailabilityResp;
    const availList = Array.isArray(data) ? data : (data?.availability || data?.slots || []);
    const dId = String(dayId);
    const sId = Number(slotId);
    if (Array.isArray(availList)) {
      const match = availList.find((a) => {
        const aDay = String(a?.day?.id ?? a?.dayId ?? a?.day);
        const aSlot = Number(a?.slot?.id ?? a?.slotId ?? a?.slot);
        return aDay === dId && aSlot === sId;
      });
      return Boolean(match?.isAvailable ?? match?.open ?? false);
    }
    return false;
  };

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
    if (!isKitchenOpen(day.id, slot.id)) {
      showDialogue('error', 'Kitchen Closed', 'This slot cannot be edited because the kitchen is closed for this time.');
      return;
    }
    setEditingDay(day);
    setEditingMeal(slot);
    // Initialize from dish availability for this slot
    const dishEnabled = isDishAvailableForSlot(day.id, slot.id);
    setFormData({
      isAvailable: dishEnabled,
      startTime: '',
      endTime: ''
    });
    setShowEditModal(true);
  };


  const handleFormChange = (e) => {
    const { name, type, checked, value } = e.target;
    if (name === 'isAvailable') {
      setFormData({ ...formData, isAvailable: checked });
      return;
    }
    // No custom time editing in dish availability per requirements
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveChanges = async () => {
    try {
      // Resolve ids for API
      const findByDaySlot = (rawList, dayId, slotId) => {
        if (!Array.isArray(rawList)) return undefined;
        const dId = String(dayId);
        const sId = Number(slotId);
        return rawList.find((a) => {
          const aDay = String(a?.day?.id ?? a?.dayId ?? a?.day);
          const aSlot = Number(a?.slot?.id ?? a?.slotId ?? a?.slot);
          return aDay === dId && aSlot === sId;
        });
      };

      const rawKitchen = kitchenAvailabilityResp?.data || kitchenAvailabilityResp || [];
      const kitchenMatch = findByDaySlot(Array.isArray(rawKitchen) ? rawKitchen : (rawKitchen?.data || []), editingDay.id, editingMeal.id);
      const kitchenAvailabilityId = kitchenMatch?.kitchenAvailabilityId || kitchenMatch?.id || null;

      const rawDish = dishAvailabilityResp?.data || dishAvailabilityResp || [];
      const dishMatch = findByDaySlot(Array.isArray(rawDish) ? rawDish : (rawDish?.data || []), editingDay.id, editingMeal.id);
      const dishAvailabilityId = dishMatch?.id || dishMatch?.dishAvailabilityId || null;

      await updateDishAvailability({
        dishId,
        body: {
          isAvailable: Boolean(formData.isAvailable),
          kitchenAvailabilityId,
          dishAvailabilityId,
        },
      }).unwrap();

      setShowEditModal(false);
      showDialogue('success', 'Updated', 'Dish availability has been updated.');
      // Refresh the dish availability to reflect latest state
      refetchDishAvailability();
    } catch (err) {
      showDialogue('error', 'Update Failed', err?.data?.message || 'Failed to update dish availability.');
    }
  };

  const hasKitchenAvailabilityData = Array.isArray(kitchenAvailabilityResp?.data || kitchenAvailabilityResp);
  const hasDishAvailabilityData = Array.isArray(dishAvailabilityResp?.data || dishAvailabilityResp);

  if (!canViewAvailability) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Access Denied</h3>
          <p className="text-neutral-500">You don't have permission to access dish availability.</p>
        </div>
      </div>
    );
  }

  if (
    isKitchenAvailabilityLoading ||
    isKitchenAvailabilityFetching ||
    isDishAvailabilityLoading ||
    isDishAvailabilityFetching ||
    !hasKitchenAvailabilityData ||
    !hasDishAvailabilityData
  ) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-neutral-600">Loading availability settings...</span>
      </div>
    );
  }

  // Helper: determine whether dish is available for a given day/slot based on dishAvailabilityResp
  const isDishAvailableForSlot = (dayId, slotId) => {
    const raw = dishAvailabilityResp?.data || dishAvailabilityResp;
    const dId = String(dayId);
    const sId = Number(slotId);

    // Shape A: nested array with days[].slots[] (as per latest response)
    if (Array.isArray(raw)) {
      for (const entry of raw) {
        const days = Array.isArray(entry?.days) ? entry.days : [];
        for (const day of days) {
          const dayKey = String(day?.dayOfWeekId || day?.dayId || day?.id || day?.day || '');
          if (dayKey !== dId) continue;
          const slots = Array.isArray(day?.slots) ? day.slots : [];
          const slotMatch = slots.find(s => Number(s?.slotId || s?.id || s?.slot) === sId);
          if (slotMatch) return Boolean(entry?.isAvailable);
        }
      }
    }

    // Shape B: flat list of availability objects with day/slot fields
    const list = Array.isArray(raw) ? raw : (raw?.availability || raw?.slots || []);
    if (Array.isArray(list)) {
      const match = list.find((a) => {
        const aDay = String(a?.day?.id ?? a?.dayId ?? a?.day);
        const aSlot = Number(a?.slot?.id ?? a?.slotId ?? a?.slot);
        return aDay === dId && aSlot === sId;
      });
      if (match) return Boolean(match?.isAvailable ?? match?.available ?? false);
    }
    return false;
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-neutral-900">Dish Availability Schedule</h3>
        <p className="mt-1 text-sm text-neutral-500">Set when this dish is available for different meal periods.</p>
      </div>

      {
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
                          const kitchenOpen = isKitchenOpen(day.id, slot.id);

                          return (
                            <div>
                              {kitchenOpen && canEditDishAvailability && (
                                <div className="flex items-center mb-2">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                                    checked={isDishAvailableForSlot(day.id, slot.id)}
                                    onChange={(e) => { e.stopPropagation(); handleEditTimeSlot(day, slot); }}
                                    aria-label={`Toggle availability for ${day.name} - ${slot.label}`}
                                  />
                                  <span className="ml-2 text-xs text-neutral-600">Enable</span>
                                </div>
                              )}

                              {availability?.isAvailable ? (
                                (() => {
                                  const start = availability.customStartTime || slot.defaultStart;
                                  const end = availability.customEndTime || slot.defaultEnd;
                                  return (
                                    <div className="bg-green-50 text-center p-3 rounded-md border border-green-200 relative group">
                                      <div className="flex items-center justify-center">
                                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                                        <span className="text-sm font-medium text-green-700">Available</span>
                                      </div>
                                      <div className="text-xs text-green-600 mt-1">{formatTime(start)} - {formatTime(end)}</div>
                                      {kitchenOpen && canEditDishAvailability && (
                                        <button
                                          onClick={(e) => { e.stopPropagation(); handleEditTimeSlot(day, slot); }}
                                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-white shadow-sm border border-green-200 hover:bg-green-50"
                                          title="Edit availability"
                                        >
                                          <PencilIcon className="h-3 w-3 text-green-600" />
                                        </button>
                                      )}
                                    </div>
                                  );
                                })()
                              ) : (
                                <div className={`text-center p-3 rounded-md border relative group ${kitchenOpen ? 'border-neutral-200' : 'border-neutral-200 bg-neutral-50'}`}>
                                  <div className="text-sm font-medium text-neutral-500">{kitchenOpen ? 'Not Available' : 'Kitchen Closed'}</div>
                                  {kitchenOpen && canEditDishAvailability && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleEditTimeSlot(day, slot); }}
                                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-white shadow-sm border border-neutral-300 hover:bg-neutral-50"
                                      title="Set availability"
                                    >
                                      <PencilIcon className="h-3 w-3 text-neutral-600" />
                                    </button>
                                  )}
                                </div>
                              )}
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
      }

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
                {/* Custom time selection is disabled for Dish Availability; it follows kitchen availability */}
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
