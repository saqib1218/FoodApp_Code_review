import React, { useMemo, useState } from 'react';

const ALL_DAYS = [
  { key: 'Mon', label: 'Mon' },
  { key: 'Tue', label: 'Tue' },
  { key: 'Wed', label: 'Wed' },
  { key: 'Thu', label: 'Thu' },
  { key: 'Fri', label: 'Fri' },
  { key: 'Sat', label: 'Sat' },
  { key: 'Sun', label: 'Sun' },
];

const emptyForm = {
  minOrderMinor: '',
  minItems: '',
  daysOfWeek: [],
  windowStartLocal: '',
  windowEndLocal: '',
  preorderLeadHours: '',
  blackoutDates: [],
  note: '',
  maxDiscountPercent: '',
};

const EligibilityRuleTab = () => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [blackoutCandidate, setBlackoutCandidate] = useState('');
  const [rules, setRules] = useState([]);

  const canSave = useMemo(() => {
    // Minimal validation: require at least one of the numeric fields and proper time window if any time is provided
    const hasMinVals = form.minOrderMinor !== '' || form.minItems !== '';
    const timeOk =
      (form.windowStartLocal === '' && form.windowEndLocal === '') ||
      (form.windowStartLocal !== '' && form.windowEndLocal !== '');
    return hasMinVals && timeOk;
  }, [form]);

  const toggleDay = (key) => {
    setForm((prev) => {
      const exists = prev.daysOfWeek.includes(key);
      return {
        ...prev,
        daysOfWeek: exists
          ? prev.daysOfWeek.filter((d) => d !== key)
          : [...prev.daysOfWeek, key],
      };
    });
  };

  const addBlackoutDate = () => {
    if (!blackoutCandidate) return;
    if (form.blackoutDates.includes(blackoutCandidate)) return;
    setForm((prev) => ({ ...prev, blackoutDates: [...prev.blackoutDates, blackoutCandidate] }));
    setBlackoutCandidate('');
  };

  const removeBlackoutDate = (d) => {
    setForm((prev) => ({ ...prev, blackoutDates: prev.blackoutDates.filter((x) => x !== d) }));
  };

  const handleSave = () => {
    if (!canSave) return;
    // Store a copy; in the future wire to backend
    setRules((prev) => [
      ...prev,
      {
        ...form,
        id: Date.now(),
      },
    ]);
    setForm(emptyForm);
    setBlackoutCandidate('');
    setShowModal(false);
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setBlackoutCandidate('');
    setShowModal(false);
  };

  const removeRule = (id) => setRules((prev) => prev.filter((r) => r.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-neutral-900">Eligibility Rules</h3>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm font-medium"
        >
          Add Eligibility Rule
        </button>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Summary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Days</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Time Window</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Preorder Lead (h)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Blackout Dates</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {rules.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-sm text-neutral-500 text-center">No eligibility rules added yet.</td>
                </tr>
              )}
              {rules.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    <div className="space-y-1">
                      <div>Min Order (minor): <span className="font-medium">{r.minOrderMinor || '-'}</span></div>
                      <div>Min Items: <span className="font-medium">{r.minItems || '-'}</span></div>
                      <div>Max Discount %: <span className="font-medium">{r.maxDiscountPercent || '-'}</span></div>
                      <div>Note: <span className="font-medium">{r.note || '-'}</span></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{r.daysOfWeek?.join(', ') || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{r.windowStartLocal && r.windowEndLocal ? `${r.windowStartLocal} - ${r.windowEndLocal}` : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{r.preorderLeadHours || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{r.blackoutDates?.length ? r.blackoutDates.join(', ') : '-'}</td>
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
          <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-neutral-900">Add Eligibility Rule</h3>
              <button onClick={handleCancel} className="text-neutral-400 hover:text-neutral-600">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Min Order (minor)</label>
                <input type="number" value={form.minOrderMinor} onChange={(e) => setForm({ ...form, minOrderMinor: e.target.value })} className="w-full p-2 border border-neutral-300 rounded-lg" placeholder="e.g. 500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Min Items</label>
                <input type="number" value={form.minItems} onChange={(e) => setForm({ ...form, minItems: e.target.value })} className="w-full p-2 border border-neutral-300 rounded-lg" placeholder="e.g. 2" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-2">Days of Week</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_DAYS.map((d) => {
                    const active = form.daysOfWeek.includes(d.key);
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => toggleDay(d.key)}
                        className={`px-3 py-1.5 rounded-full border text-sm ${active ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'}`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Window Start (local)</label>
                <input type="time" value={form.windowStartLocal} onChange={(e) => setForm({ ...form, windowStartLocal: e.target.value })} className="w-full p-2 border border-neutral-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Window End (local)</label>
                <input type="time" value={form.windowEndLocal} onChange={(e) => setForm({ ...form, windowEndLocal: e.target.value })} className="w-full p-2 border border-neutral-300 rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Preorder Lead Hours</label>
                <input type="number" value={form.preorderLeadHours} onChange={(e) => setForm({ ...form, preorderLeadHours: e.target.value })} className="w-full p-2 border border-neutral-300 rounded-lg" placeholder="e.g. 24" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Max Discount Percent</label>
                <input type="number" value={form.maxDiscountPercent} onChange={(e) => setForm({ ...form, maxDiscountPercent: e.target.value })} className="w-full p-2 border border-neutral-300 rounded-lg" placeholder="e.g. 20" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Blackout Dates</label>
                <div className="flex items-center gap-2">
                  <input type="date" value={blackoutCandidate} onChange={(e) => setBlackoutCandidate(e.target.value)} className="p-2 border border-neutral-300 rounded-lg" />
                  <button type="button" onClick={addBlackoutDate} className="px-3 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-900 text-sm">Add</button>
                </div>
                {form.blackoutDates.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.blackoutDates.map((d) => (
                      <span key={d} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-sm">
                        {d}
                        <button type="button" onClick={() => removeBlackoutDate(d)} className="text-neutral-500 hover:text-neutral-700">✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Note</label>
                <textarea rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="w-full p-2 border border-neutral-300 rounded-lg" placeholder="Optional note" />
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

export default EligibilityRuleTab;
