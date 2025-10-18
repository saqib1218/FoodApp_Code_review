import React, { useMemo, useState } from 'react';
import ConfirmationModal from '../../../../components/ConfirmationModal';

const emptyForm = { startDate: '', endDate: '', timeZone: 'Karachi' };

export default function DiscountScheduleTab() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [schedules, setSchedules] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const canSave = useMemo(() => !!form.startDate && !!form.endDate, [form.startDate, form.endDate]);

  const reset = () => setForm(emptyForm);

  const handleSave = () => {
    if (!canSave) return;
    setSchedules((prev) => [
      {
        id: Date.now(),
        startDate: form.startDate,
        endDate: form.endDate,
        timeZone: form.timeZone,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    reset();
    setShowModal(false);
  };

  const handleCancel = () => {
    reset();
    setShowModal(false);
  };

  const removeSchedule = (id) => setSchedules((prev) => prev.filter((s) => s.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-neutral-900">Discount Schedule</h3>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm font-medium"
        >
          Add Schedule
        </button>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Time Zone</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {schedules.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-sm text-neutral-500 text-center">No schedules added yet.</td>
                </tr>
              )}
              {schedules.map((s) => (
                <tr key={s.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{new Date(s.startDate).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{new Date(s.endDate).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{s.timeZone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => removeSchedule(s.id)} className="text-red-600 hover:text-red-700">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
          title="Create Discount Schedule"
          message="Are you sure you want to create this schedule?"
          isCommentRequired={false}
          confirmText="Create"
          cancelText="Cancel"
          onConfirm={() => { setShowConfirm(false); handleSave(); }}
          onCancel={() => setShowConfirm(false)}
          variant="primary"
        />
      )}
    </div>
  );
}
