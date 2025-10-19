import React, { useMemo, useState } from 'react';
import { PencilIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../../../../components/ConfirmationModal';

const emptyForm = {
  rule_type: 'customer',
  min_orders: '',
  max_orders: '',
  ordinal: '',
};

const AudienceRuleTab = () => {
  const [showModal, setShowModal] = useState(false);
  const [rule, setRule] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmComment, setConfirmComment] = useState('');

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
    setRule({ id: Date.now(), ...form });
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
    if (!rule) return;
    setForm({
      rule_type: rule.rule_type || 'customer',
      min_orders: rule.min_orders ?? '',
      max_orders: rule.max_orders ?? '',
      ordinal: rule.ordinal ?? '',
    });
    setShowModal(true);
  };

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
        <h3 className="text-lg font-medium text-neutral-900">Audience Rule</h3>
        {!rule ? (
          <button
            onClick={openAdd}
            className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm font-medium"
          >
            Add Audience Rule
          </button>
        ) : (
          <button
            onClick={openEdit}
            className="p-2 border border-neutral-300 rounded-full text-neutral-700 hover:bg-neutral-50"
            title="Edit"
            aria-label="Edit audience rule"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {!rule && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6 text-sm text-neutral-500 text-center">
          No audience rule added yet.
        </div>
      )}

      {rule && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-neutral-500">Rule Type</div>
              <div className="text-neutral-900 font-medium">{ruleTypeLabel(rule.rule_type)}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-500">Min Orders</div>
              <div className="text-neutral-900 font-medium">{rule.min_orders || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-500">Max Orders</div>
              <div className="text-neutral-900 font-medium">{rule.max_orders || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-500">Ordinal</div>
              <div className="text-neutral-900 font-medium">{rule.ordinal || '-'}</div>
            </div>
          </div>
        </div>
      )}

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
          title={rule ? 'Update Audience Rule' : 'Create Audience Rule'}
          message={rule ? 'Are you sure you want to update this audience rule?' : 'Are you sure you want to create this audience rule?'}
          comment={confirmComment}
          onCommentChange={setConfirmComment}
          onConfirm={() => { setShowConfirm(false); handleSave(); setConfirmComment(''); }}
          onCancel={() => { setShowConfirm(false); setConfirmComment(''); }}
          confirmButtonText={rule ? 'Update' : 'Create'}
          confirmButtonColor="primary"
          isCommentRequired={true}
        />
      )}
    </div>
  );
};

export default AudienceRuleTab;
