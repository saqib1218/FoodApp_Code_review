import React, { useMemo, useState } from 'react';
import ConfirmationModal from '../../../../components/ConfirmationModal';

const emptyForm = {
  usagePerLimit: '',
  usageLimitTotal: '',
  dailyLimitUser: '',
  maxOrderFlashSale: '',
};

export default function DiscountUsageTab() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [usages, setUsages] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const canSave = useMemo(() => {
    // All fields optional except at least one should be provided
    const vals = [form.usagePerLimit, form.usageLimitTotal, form.dailyLimitUser, form.maxOrderFlashSale];
    return vals.some((v) => v !== '' && !Number.isNaN(Number(v)) && Number(v) >= 0);
  }, [form]);

  const setNonNegative = (key, value) => {
    const num = value === '' ? '' : Math.max(0, Number(value));
    setForm((f) => ({ ...f, [key]: num }));
  };

  const reset = () => setForm(emptyForm);

  const handleSave = () => {
    if (!canSave) return;
    // Normalize to numbers where provided
    const payload = {
      id: Date.now(),
      usagePerLimit: form.usagePerLimit === '' ? null : Number(form.usagePerLimit),
      usageLimitTotal: form.usageLimitTotal === '' ? null : Number(form.usageLimitTotal),
      dailyLimitUser: form.dailyLimitUser === '' ? null : Number(form.dailyLimitUser),
      maxOrderFlashSale: form.maxOrderFlashSale === '' ? null : Number(form.maxOrderFlashSale),
      createdAt: new Date().toISOString(),
    };
    setUsages((prev) => [payload, ...prev]);
    reset();
    setShowModal(false);
  };

  const handleCancel = () => {
    reset();
    setShowModal(false);
  };

  const removeUsage = (id) => setUsages((prev) => prev.filter((u) => u.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-neutral-900">Discount Usage</h3>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm font-medium"
        >
          Add Discount Usage
        </button>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Usage Per Limit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Usage Limit Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Daily Limit User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Max Order Flash Sale</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {usages.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-sm text-neutral-500 text-center">No usage rules added yet.</td>
                </tr>
              )}
              {usages.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{u.usagePerLimit ?? '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{u.usageLimitTotal ?? '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{u.dailyLimitUser ?? '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{u.maxOrderFlashSale ?? '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => removeUsage(u.id)} className="text-red-600 hover:text-red-700">Remove</button>
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
              <h3 className="text-lg font-medium text-neutral-900">Add Discount Usage</h3>
              <button onClick={handleCancel} className="text-neutral-400 hover:text-neutral-600">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Usage Per Limit</label>
                <input
                  type="number"
                  min={0}
                  value={form.usagePerLimit}
                  onChange={(e) => setNonNegative('usagePerLimit', e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                  placeholder="e.g., 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Usage Limit Total</label>
                <input
                  type="number"
                  min={0}
                  value={form.usageLimitTotal}
                  onChange={(e) => setNonNegative('usageLimitTotal', e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                  placeholder="e.g., 100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Daily Limit User</label>
                <input
                  type="number"
                  min={0}
                  value={form.dailyLimitUser}
                  onChange={(e) => setNonNegative('dailyLimitUser', e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                  placeholder="e.g., 5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Max Order Flash Sale</label>
                <input
                  type="number"
                  min={0}
                  value={form.maxOrderFlashSale}
                  onChange={(e) => setNonNegative('maxOrderFlashSale', e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                  placeholder="e.g., 2"
                />
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
          title="Create Discount Usage"
          message="Are you sure you want to create these usage limits?"
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
