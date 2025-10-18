import React, { useMemo, useState } from 'react';
import ConfirmationModal from '../../../../components/ConfirmationModal';

const emptyForm = {
  rule_type: 'customer',
  min_orders: '',
  max_orders: '',
  ordinal: '',
};

const AudienceRuleTab = () => {
  const [showModal, setShowModal] = useState(false);
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showConfirm, setShowConfirm] = useState(false);

  const canSave = useMemo(() => {
    // ordinal can be optional; validate numeric fields if filled
    const minOk = form.min_orders === '' || !Number.isNaN(Number(form.min_orders));
    const maxOk = form.max_orders === '' || !Number.isNaN(Number(form.max_orders));
    const ordOk = form.ordinal === '' || !Number.isNaN(Number(form.ordinal));
    return minOk && maxOk && ordOk;
  }, [form]);

  const reset = () => setForm(emptyForm);

  const handleSave = () => {
    if (!canSave) return;
    setRules((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...form,
      },
    ]);
    reset();
    setShowModal(false);
  };

  const handleCancel = () => {
    reset();
    setShowModal(false);
  };

  const removeRule = (id) => setRules((prev) => prev.filter((r) => r.id !== id));

  const ruleTypeLabel = (v) => {
    switch (v) {
      case 'customer':
        return 'customer';
      case 'all_customer':
        return 'all customer';
      case 'new_customer':
        return 'new customer';
      default:
        return v;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-neutral-900">Audience Rules</h3>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm font-medium"
        >
          Add Audience Rule
        </button>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Rule Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Min Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Max Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Ordinal</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {rules.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-sm text-neutral-500 text-center">No audience rules added yet.</td>
                </tr>
              )}
              {rules.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{ruleTypeLabel(r.rule_type)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{r.min_orders || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{r.max_orders || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{r.ordinal || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => removeRule(r.id)} className="text-red-600 hover:text-red-700">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-neutral-900">Add Audience Rule</h3>
              <button onClick={handleCancel} className="text-neutral-400 hover:text-neutral-600">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Rule Type</label>
                <select
                  value={form.rule_type}
                  onChange={(e) => setForm({ ...form, rule_type: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                >
                  <option value="customer">customer</option>
                  <option value="all_customer">all customer</option>
                  <option value="new_customer">new customer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Min Orders</label>
                <input type="number" value={form.min_orders} onChange={(e) => setForm({ ...form, min_orders: e.target.value })} className="w-full p-2 border border-neutral-300 rounded-lg" placeholder="e.g. 1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Max Orders</label>
                <input type="number" value={form.max_orders} onChange={(e) => setForm({ ...form, max_orders: e.target.value })} className="w-full p-2 border border-neutral-300 rounded-lg" placeholder="e.g. 10" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Ordinal</label>
                <input type="number" value={form.ordinal} onChange={(e) => setForm({ ...form, ordinal: e.target.value })} className="w-full p-2 border border-neutral-300 rounded-lg" placeholder="e.g. 1" />
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
          title="Create Audience Rule"
          message="Are you sure you want to create this audience rule?"
          isCommentRequired={false}
          confirmText="Create"
          cancelText="Cancel"
          onConfirm={() => { setShowConfirm(false); handleSave(); }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};

export default AudienceRuleTab;
