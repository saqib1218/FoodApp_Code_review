import React, { useMemo, useState } from 'react';

const ITEMS = [
  { value: 'karahi', label: 'karahi' },
  { value: 'chicken_roast', label: 'chicken roast' },
  { value: 'baryani', label: 'baryani' },
];

const emptyTarget = {
  target_type: 'kitchen',
  apply_all_dishes: true,
  items: [],
  side_on: false,
};

const PromotionTargetTab = () => {
  const [showModal, setShowModal] = useState(false);
  const [targets, setTargets] = useState([]);
  const [form, setForm] = useState(emptyTarget);
  const [itemSelect, setItemSelect] = useState('');

  const canSave = useMemo(() => {
    if (form.target_type === 'kitchen') {
      if (form.apply_all_dishes) return true;
      return form.items && form.items.length > 0;
    }
    // dish target requires items selected
    return form.items && form.items.length > 0;
  }, [form]);

  const resetAndClose = () => {
    setForm(emptyTarget);
    setShowModal(false);
  };

  const handleSave = () => {
    if (!canSave) return;
    setTargets((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...form,
      },
    ]);
    resetAndClose();
  };

  const removeTarget = (id) => setTargets((prev) => prev.filter((t) => t.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-neutral-900">Promotion Targets</h3>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm font-medium"
        >
          Add Promotion Target
        </button>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Apply All Dishes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Side On</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {targets.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-sm text-neutral-500 text-center">No targets added yet.</td>
                </tr>
              )}
              {targets.map((t) => (
                <tr key={t.id}>
                  <td className="px-6 py-4 text-sm text-neutral-900 capitalize">{t.target_type}</td>
                  <td className="px-6 py-4 text-sm text-neutral-900">{t.target_type === 'kitchen' ? (t.apply_all_dishes ? 'Yes' : 'No') : '—'}</td>
                  <td className="px-6 py-4 text-sm text-neutral-900">{t.items?.length ? t.items.map(v => ITEMS.find(i => i.value === v)?.label || v).join(', ') : (t.target_type==='kitchen' && t.apply_all_dishes ? 'All dishes' : '—')}</td>
                  <td className="px-6 py-4 text-sm text-neutral-900">{t.side_on ? 'On' : 'Off'}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button onClick={() => removeTarget(t.id)} className="text-red-600 hover:text-red-700">Remove</button>
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
              <h3 className="text-lg font-medium text-neutral-900">Add Promotion Target</h3>
              <button onClick={resetAndClose} className="text-neutral-400 hover:text-neutral-600">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Target Type</label>
                <select
                  value={form.target_type}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      target_type: v,
                      // reset fields depending on type
                      apply_all_dishes: v === 'kitchen' ? true : false,
                      items: [],
                    }));
                  }}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                >
                  <option value="kitchen">kitchen</option>
                  <option value="dish">dish</option>
                </select>
              </div>

              {form.target_type === 'kitchen' && (
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-neutral-700">Apply to all dishes</label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={form.apply_all_dishes}
                      onChange={(e) => setForm({ ...form, apply_all_dishes: e.target.checked, items: e.target.checked ? [] : form.items })}
                    />
                    <span className={`w-10 h-6 flex items-center bg-${form.apply_all_dishes ? 'primary-600' : 'neutral-300'} rounded-full p-1 transition-colors`}>
                      <span className={`bg-white w-4 h-4 rounded-full transform transition-transform ${form.apply_all_dishes ? 'translate-x-4' : ''}`}></span>
                    </span>
                  </label>
                </div>
              )}

              {/* Items selection */}
              {((form.target_type === 'kitchen' && !form.apply_all_dishes) || form.target_type === 'dish') && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Select items</label>
                  <select
                    value={itemSelect}
                    onChange={(e) => {
                      const v = e.target.value;
                      setItemSelect(v);
                      if (!v) return;
                      if (!form.items.includes(v)) {
                        setForm({ ...form, items: [...form.items, v] });
                      }
                      // reset back to placeholder
                      setItemSelect('');
                    }}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  >
                    <option value="">Select item...</option>
                    {ITEMS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {form.items?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.items.map((v) => {
                        const label = ITEMS.find(i => i.value === v)?.label || v;
                        return (
                          <span key={v} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-sm">
                            {label}
                            <button
                              type="button"
                              onClick={() => setForm({ ...form, items: form.items.filter((x) => x !== v) })}
                              className="text-neutral-500 hover:text-neutral-700"
                              aria-label={`Remove ${label}`}
                            >
                              ✕
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* side_on switch */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-neutral-700">side_on</label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form.side_on}
                    onChange={(e) => setForm({ ...form, side_on: e.target.checked })}
                  />
                  <span className={`w-10 h-6 flex items-center bg-${form.side_on ? 'primary-600' : 'neutral-300'} rounded-full p-1 transition-colors`}>
                    <span className={`bg-white w-4 h-4 rounded-full transform transition-transform ${form.side_on ? 'translate-x-4' : ''}`}></span>
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={resetAndClose} className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 text-sm font-medium">Cancel</button>
              <button onClick={handleSave} disabled={!canSave} className={`px-4 py-2 rounded-full text-sm font-medium ${canSave ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-neutral-300 text-neutral-600 cursor-not-allowed'}`}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionTargetTab;
