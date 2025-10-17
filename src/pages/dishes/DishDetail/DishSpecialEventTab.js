import React, { useState, useContext, useEffect } from 'react';
import { PlusIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import DialogueBox from '../../../components/DialogueBox';
import { useAuth } from '../../../hooks/useAuth';
import { PERMISSIONS } from '../../../contexts/PermissionRegistry';
import { DishContext } from './index';
import { useCreateDishEventMutation, useGetDishEventsQuery, useLazyGetDishEventByIdQuery, useUpdateDishEventMutation } from '../../../store/api/modules/dishes/dishesApi';

const DishSpecialEventTab = () => {
  const { hasPermission } = useAuth();
  const { id: dishId } = useContext(DishContext);
  const [createDishEvent, { isLoading: isCreating }] = useCreateDishEventMutation();
  const [triggerGetEvent, { isFetching: isFetchingEvent }] = useLazyGetDishEventByIdQuery();
  const [updateDishEvent, { isLoading: isUpdating }] = useUpdateDishEventMutation();
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  // currentEventId -> the "id" from list/detail (used for GET detail API)
  const [currentEventId, setCurrentEventId] = useState(null);
  // currentEventPatchId -> the "dishSpecialEventId" (used for PATCH update API)
  const [currentEventPatchId, setCurrentEventPatchId] = useState(null);
  const [dialogueBox, setDialogueBox] = useState({ isOpen: false, type: 'success', title: '', message: '' });

  const [form, setForm] = useState({
    eventStartDate: '',
    eventStartTime: '',
    eventEndDate: '',
    eventEndTime: '',
    preorderStartDate: '',
    preorderStartTime: '',
    preorderEndDate: '',
    preorderEndTime: '',
  });

  const showDialogue = (type, title, message) => setDialogueBox({ isOpen: true, type, title, message });
  const closeDialogue = () => setDialogueBox({ isOpen: false, type: 'success', title: '', message: '' });

  // Permissions and Events list fetching
  const canViewList = hasPermission(PERMISSIONS.DISH_SPECIAL_EVENT_LIST_VIEW);
  const canViewDetail = hasPermission(PERMISSIONS.DISH_SPECIAL_EVENT_DETAIL_VIEW);
  const canEditEvent = hasPermission(PERMISSIONS.DISH_SPECIAL_EVENT_EDIT);
  const { data: eventsResp, isLoading: isEventsLoading, refetch } = useGetDishEventsQuery(dishId, {
    skip: !dishId || !canViewList,
    refetchOnMountOrArgChange: true,
  });
  useEffect(() => {
    const list = eventsResp?.data || eventsResp || [];
    if (Array.isArray(list)) setEvents(list);
  }, [eventsResp]);

  const openAdd = () => {
    setEditingIndex(null);
    setCurrentEventId(null);
    setCurrentEventPatchId(null);
    setForm({
      eventStartDate: '', eventStartTime: '',
      eventEndDate: '', eventEndTime: '',
      preorderStartDate: '', preorderStartTime: '',
      preorderEndDate: '', preorderEndTime: ''
    });
    setShowModal(true);
  };

  const parseISOToForm = (isoStr) => {
    if (!isoStr || typeof isoStr !== 'string') return { date: '', time: '' };
    const [datePart, timePart] = isoStr.split('T');
    const time = (timePart || '').slice(0,5); // HH:MM from raw string, ignore timezone to avoid shifts
    return { date: datePart || '', time };
  };

  const openEdit = async (index) => {
    if (!canViewDetail) return;
    const e = events[index];
    const eventId = e?.id; // use the id from the list response for GET detail
    const patchId = e?.dishSpecialEventId; // use dishSpecialEventId for PATCH update per backend contract
    setEditingIndex(index);
    setCurrentEventId(eventId || null);
    setCurrentEventPatchId(patchId || null);

    // Fetch full event detail to populate the form
    try {
      const resp = await triggerGetEvent({ dishId, eventId }).unwrap();
      const data = resp?.data || resp;
      const { date: esd, time: est } = parseISOToForm(data?.eventStart);
      const { date: eed, time: eet } = parseISOToForm(data?.eventEnd);
      const { date: psd, time: pst } = parseISOToForm(data?.preorderStart);
      const { date: ped, time: pet } = parseISOToForm(data?.preorderEnd);
      setForm({
        eventStartDate: esd || '', eventStartTime: est || '',
        eventEndDate: eed || '', eventEndTime: eet || '',
        preorderStartDate: psd || '', preorderStartTime: pst || '',
        preorderEndDate: ped || '', preorderEndTime: pet || '',
      });
      setShowModal(true);
    } catch (err) {
      showDialogue('error', 'Failed', err?.data?.message || 'Failed to load event details');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Construct UTC ISO string to match backend 'Z' format and avoid timezone shifts
  const toISO = (d, t) => (d && t ? `${d}T${t}:00Z` : null);
  const handleSubmit = async () => {
    const payload = {
      eventStart: toISO(form.eventStartDate, form.eventStartTime),
      eventEnd: toISO(form.eventEndDate, form.eventEndTime),
      preorderStart: toISO(form.preorderStartDate, form.preorderStartTime),
      preorderEnd: toISO(form.preorderEndDate, form.preorderEndTime),
    };
    try {
      if (editingIndex != null && currentEventPatchId && canEditEvent) {
        // Use dishSpecialEventId for PATCH update
        await updateDishEvent({ eventId: currentEventPatchId, body: payload }).unwrap();
        setShowModal(false);
        showDialogue('success', 'Updated', 'Event updated successfully.');
        refetch();
      } else {
        await createDishEvent({ dishId, body: payload }).unwrap();
        setEvents(prev => (editingIndex != null ? prev : [...prev, { ...form }]));
        setShowModal(false);
        showDialogue('success', 'Saved', 'Event created successfully.');
        refetch();
      }
    } catch (err) {
      showDialogue('error', 'Failed', err?.data?.message || 'Action failed');
    }
  };

  const formatDT = (d, t) => {
    if (!d && !t) return '-';
    if (!d) return t || '-';
    if (!t) return new Date(d).toLocaleDateString();
    try {
      const dt = new Date(`${d}T${t}`);
      return dt.toLocaleString();
    } catch {
      return `${d} ${t}`;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-neutral-900">Dish Special Event</h3>
        {hasPermission(PERMISSIONS.DISH_SPECIAL_EVENT_CREATE) && (
          <button
            onClick={openAdd}
            className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors text-sm font-medium flex items-center"
            disabled={isCreating}
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            {isCreating ? 'Saving...' : 'Add Event Date'}
          </button>
        )}
      </div>

      {!canViewList ? (
        <div className="bg-white rounded-lg border border-neutral-200 p-6 text-center text-sm text-neutral-600">
          You have no access to view the list of the events date.
        </div>
      ) : (
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Preorder Start</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Preorder End</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {isEventsLoading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-neutral-500">Loading events...</td></tr>
              ) : events.length > 0 ? events.map((e, idx) => (
                <tr key={idx} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{formatDT(e.eventStartDate || e.eventStart?.split('T')?.[0], e.eventStartTime || e.eventStart?.split('T')?.[1]?.slice(0,5))}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{formatDT(e.eventEndDate || e.eventEnd?.split('T')?.[0], e.eventEndTime || e.eventEnd?.split('T')?.[1]?.slice(0,5))}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{formatDT(e.preorderStartDate || e.preorderStart?.split('T')?.[0], e.preorderStartTime || e.preorderStart?.split('T')?.[1]?.slice(0,5))}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{formatDT(e.preorderEndDate || e.preorderEnd?.split('T')?.[0], e.preorderEndTime || e.preorderEnd?.split('T')?.[1]?.slice(0,5))}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {canViewDetail && (
                      <button onClick={() => openEdit(idx)} className="text-primary-600 hover:text-primary-800" title="Edit" disabled={isFetchingEvent}>
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-neutral-500">No events added yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-neutral-900">{editingIndex != null ? 'Edit Event' : 'Add Event'}</h3>
              <button onClick={() => setShowModal(false)} className="text-neutral-500 hover:text-neutral-700">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Event Start Date</label>
                <input type="date" name="eventStartDate" value={form.eventStartDate} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Event Start Time</label>
                <input type="time" name="eventStartTime" value={form.eventStartTime} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Event End Date</label>
                <input type="date" name="eventEndDate" value={form.eventEndDate} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Event End Time</label>
                <input type="time" name="eventEndTime" value={form.eventEndTime} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Preorder Start Date</label>
                <input type="date" name="preorderStartDate" value={form.preorderStartDate} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Preorder Start Time</label>
                <input type="time" name="preorderStartTime" value={form.preorderStartTime} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Preorder End Date</label>
                <input type="date" name="preorderEndDate" value={form.preorderEndDate} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Preorder End Time</label>
                <input type="time" name="preorderEndTime" value={form.preorderEndTime} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded-lg" />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 text-sm font-medium">Cancel</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm font-medium" disabled={editingIndex != null ? (!canEditEvent || isUpdating) : isCreating}>
                {editingIndex != null ? (isUpdating ? 'Updating...' : (canEditEvent ? 'Update' : 'No Permission')) : (isCreating ? 'Saving...' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      <DialogueBox isOpen={dialogueBox.isOpen} onClose={closeDialogue} type={dialogueBox.type} title={dialogueBox.title} message={dialogueBox.message} />
    </div>
  );
};

export default DishSpecialEventTab;
