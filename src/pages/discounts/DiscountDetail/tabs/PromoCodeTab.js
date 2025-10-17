import React, { useMemo, useState } from 'react';

const emptyForm = { code: '', caseSensitive: false };

const PromoCodeTab = () => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [codes, setCodes] = useState([]);

  const canSave = useMemo(() => form.code.trim().length > 0, [form.code]);

  const reset = () => setForm(emptyForm);

  const handleSave = () => {
    if (!canSave) return;
    setCodes((prev) => [
      ...prev,
      { id: Date.now(), code: form.code.trim(), caseSensitive: form.caseSensitive },
    ]);
    reset();
    setShowModal(false);
  };

  const handleCancel = () => {
    reset();
    setShowModal(false);
  };

  const removeCode = (id) => setCodes((prev) => prev.filter((c) => c.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-neutral-900">Promo Codes</h3>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm font-medium"
        >
          Add Promo Code
        </button>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Case Sensitive</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {codes.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-6 text-sm text-neutral-500 text-center">No promo codes added yet.</td>
                </tr>
              )}
              {codes.map((c) => (
                <tr key={c.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{c.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{c.caseSensitive ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => removeCode(c.id)} className="text-red-600 hover:text-red-700">Remove</button>
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
              <h3 className="text-lg font-medium text-neutral-900">Add Promo Code</h3>
              <button onClick={handleCancel} className="text-neutral-400 hover:text-neutral-600">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Code</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                  placeholder="e.g. SAVE20"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-neutral-700">Case Sensitive</label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form.caseSensitive}
                    onChange={(e) => setForm({ ...form, caseSensitive: e.target.checked })}
                  />
                  <span className={`w-10 h-6 flex items-center bg-${form.caseSensitive ? 'primary-600' : 'neutral-300'} rounded-full p-1 transition-colors`}>
                    <span className={`bg-white w-4 h-4 rounded-full transform transition-transform ${form.caseSensitive ? 'translate-x-4' : ''}`}></span>
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={handleCancel} className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 text-sm font-medium">Cancel</button>
              <button onClick={handleSave} disabled={!canSave} className={`px-4 py-2 rounded-full text-sm font-medium ${canSave ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-neutral-300 text-neutral-600 cursor-not-allowed'}`}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoCodeTab;
