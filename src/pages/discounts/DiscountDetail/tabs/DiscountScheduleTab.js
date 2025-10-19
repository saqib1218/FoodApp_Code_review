import React, { useMemo, useState } from 'react';
import { PencilIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../../../../components/ConfirmationModal';

const emptyForm = { startDate: '', endDate: '', timeZone: 'Karachi' };

export default function DiscountScheduleTab() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [schedule, setSchedule] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmComment, setConfirmComment] = useState('');

  const canSave = useMemo(() => !!form.startDate && !!form.endDate, [form.startDate, form.endDate]);

  const reset = () => setForm(emptyForm);

  const handleSave = () => {
    if (!canSave) return;
    setSchedule({
      id: Date.now(),
      startDate: form.startDate,
      endDate: form.endDate,
      timeZone: form.timeZone,
    });
    reset();
    setShowModal(false);
  };

  const handleCancel = () => {
    reset();
    setShowModal(false);
  };

  const openAdd = () => {
    reset();
    setShowModal(true);
  };

  const openEdit = () => {
    if (!schedule) return;
    setForm({
      startDate: schedule.startDate || '',
      endDate: schedule.endDate || '',
      timeZone: schedule.timeZone || 'Karachi',
    });
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-neutral-900">Discount Schedule</h3>
        {!schedule ? (
          <button
            onClick={openAdd}
            className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm font-medium"
          >
            Add Schedule
          </button>
        ) : (
          <button
            onClick={openEdit}
            className="p-2 border border-neutral-300 rounded-full text-neutral-700 hover:bg-neutral-50"
            title="Edit"
            aria-label="Edit schedule"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {!schedule && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6 text-sm text-neutral-500 text-center">No schedules added yet.</div>
      )}

      {schedule && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-neutral-500">Start Date</div>
              <div className="text-neutral-900 font-medium">{new Date(schedule.startDate).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-500">End Date</div>
              <div className="text-neutral-900 font-medium">{new Date(schedule.endDate).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-500">Time Zone</div>
              <div className="text-neutral-900 font-medium">{schedule.timeZone}</div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-neutral-900">Add Schedule</h3>
              <button onClick={handleCancel} className="text-neutral-400 hover:text-neutral-600">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Start Date</label>
                <input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">End Date</label>
                <input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Time Zone</label>
                <select disabled className="w-full p-2 border border-neutral-300 rounded-lg bg-neutral-100 text-neutral-600" value={form.timeZone}>
                  <option value="Karachi">Karachi</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={handleCancel} className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 text-sm font-medium">Cancel</button>
              <button onClick={() => setShowConfirm(true)} disabled={!canSave} className={`px-4 py-2 rounded-full text-sm font-medium ${canSave ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-neutral-300 text-neutral-600 cursor-not-allowed'}`}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <ConfirmationModal
          isOpen={showConfirm}
          title={schedule ? 'Update Discount Schedule' : 'Create Discount Schedule'}
          message={schedule ? 'Are you sure you want to update this schedule?' : 'Are you sure you want to create this schedule?'}
          comment={confirmComment}
          onCommentChange={setConfirmComment}
          onConfirm={() => { setShowConfirm(false); handleSave(); setConfirmComment(''); }}
          onCancel={() => { setShowConfirm(false); setConfirmComment(''); }}
          confirmButtonText={schedule ? 'Update' : 'Create'}
          confirmButtonColor="primary"
          isCommentRequired={true}
        />
      )}
    </div>
  );
}
