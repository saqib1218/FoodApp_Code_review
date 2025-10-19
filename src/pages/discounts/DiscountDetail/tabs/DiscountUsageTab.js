import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PencilIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../../../../components/ConfirmationModal';
import DialogueBox from '../../../../components/DialogueBox';
import { useUpdatePromotionMutation, useGetPromotionByIdQuery } from '../../../../store/api/modules/discounts/discountsApi';

const emptyForm = {
  usagePerLimit: '',
  usageLimitTotal: '',
  dailyLimitUser: '',
  maxOrderFlashSale: '',
};

export default function DiscountUsageTab() {
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [usage, setUsage] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmComment, setConfirmComment] = useState('');
  const [dialogueBox, setDialogueBox] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const showDialogue = (type, title, message) => setDialogueBox({ isOpen: true, type, title, message });
  const closeDialogue = () => setDialogueBox({ isOpen: false, type: 'success', title: '', message: '' });

  const [updatePromotion, { isLoading: updating }] = useUpdatePromotionMutation();
  const { data: detailsResp, isLoading: detailsLoading, isFetching: detailsFetching, isUninitialized } = useGetPromotionByIdQuery(id, { skip: !id });
  const details = detailsResp?.data || {};
  const hasBackendUsage = (
    details?.usageLimitPerUser != null ||
    details?.usageLimitTotal != null ||
    details?.dailyUsageLimit != null ||
    details?.maxOrdersFlashsale != null
  );

  const canSave = useMemo(() => {
    // All fields mandatory and must be non-negative numbers
    const vals = [form.usagePerLimit, form.usageLimitTotal, form.dailyLimitUser, form.maxOrderFlashSale];
    return vals.every((v) => v !== '' && !Number.isNaN(Number(v)) && Number(v) >= 0);
  }, [form]);

  const setNonNegative = (key, value) => {
    const num = value === '' ? '' : Math.max(0, Number(value));
    setForm((f) => ({ ...f, [key]: num }));
  };

  const loading = isUninitialized || detailsLoading || detailsFetching;
  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-neutral-900">Discount Usage</h3>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-10">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    );
  }

  const reset = () => setForm(emptyForm);

  const handleSave = async () => {
    if (!canSave || !id) return;
    // Map UI fields to backend names
    const body = {
      usageLimitPerUser: form.usagePerLimit === '' ? null : Number(form.usagePerLimit),
      usageLimitTotal: form.usageLimitTotal === '' ? null : Number(form.usageLimitTotal),
      dailyUsageLimit: form.dailyLimitUser === '' ? null : Number(form.dailyLimitUser),
      maxOrdersFlashsale: form.maxOrderFlashSale === '' ? null : Number(form.maxOrderFlashSale),
    };
    try {
      const res = await updatePromotion({ id, ...body }).unwrap();
      setUsage({
        usagePerLimit: body.usageLimitPerUser,
        usageLimitTotal: body.usageLimitTotal,
        dailyLimitUser: body.dailyUsageLimit,
        maxOrderFlashSale: body.maxOrdersFlashsale,
      });
      reset();
      setShowModal(false);
      showDialogue('success', res?.i18n_key || 'Success', res?.message || 'Usage limits updated successfully.');
    } catch (e) {
      showDialogue('error', 'Error', e?.data?.message || 'Failed to update usage limits.');
    }
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
    const src = usage || (hasBackendUsage ? {
      usagePerLimit: details.usageLimitPerUser,
      usageLimitTotal: details.usageLimitTotal,
      dailyLimitUser: details.dailyUsageLimit,
      maxOrderFlashSale: details.maxOrdersFlashsale,
    } : null);
    if (!src) return;
    setForm({
      usagePerLimit: src.usagePerLimit ?? '',
      usageLimitTotal: src.usageLimitTotal ?? '',
      dailyLimitUser: src.dailyLimitUser ?? '',
      maxOrderFlashSale: src.maxOrderFlashSale ?? '',
    });
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-neutral-900">Discount Usage</h3>
        {(!usage && !hasBackendUsage) ? (
          <button
            onClick={openAdd}
            className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm font-medium"
          >
            Add Discount Usage
          </button>
        ) : (
          <button
            onClick={openEdit}
            className="p-2 border border-neutral-300 rounded-full text-neutral-700 hover:bg-neutral-50"
            title="Edit"
            aria-label="Edit usage"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {(!usage && !hasBackendUsage) && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6 text-sm text-neutral-500 text-center">No usage rule added yet.</div>
      )}

      {(usage || hasBackendUsage) && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-neutral-500">Usage Per Limit</div>
              <div className="text-neutral-900 font-medium">{(usage?.usagePerLimit ?? details?.usageLimitPerUser) ?? '-'}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-500">Usage Limit Total</div>
              <div className="text-neutral-900 font-medium">{(usage?.usageLimitTotal ?? details?.usageLimitTotal) ?? '-'}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-500">Daily Limit User</div>
              <div className="text-neutral-900 font-medium">{(usage?.dailyLimitUser ?? details?.dailyUsageLimit) ?? '-'}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-500">Max Order Flash Sale</div>
              <div className="text-neutral-900 font-medium">{(usage?.maxOrderFlashSale ?? details?.maxOrdersFlashsale) ?? '-'}</div>
            </div>
          </div>
        </div>
      )}

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
              <button onClick={() => setShowConfirm(true)} disabled={!canSave || updating} className={`px-4 py-2 rounded-full text-sm font-medium ${canSave && !updating ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-neutral-300 text-neutral-600 cursor-not-allowed'}`}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <ConfirmationModal
          isOpen={showConfirm}
          title={usage ? 'Update Discount Usage' : 'Create Discount Usage'}
          message={usage ? 'Are you sure you want to update these usage limits?' : 'Are you sure you want to create these usage limits?'}
          comment={confirmComment}
          onCommentChange={setConfirmComment}
          onConfirm={() => { setShowConfirm(false); handleSave(); setConfirmComment(''); }}
          onCancel={() => { setShowConfirm(false); setConfirmComment(''); }}
          confirmButtonText={usage ? 'Update' : 'Create'}
          confirmButtonColor="primary"
          isCommentRequired={true}
        />
      )}

      <DialogueBox
        isOpen={dialogueBox.isOpen}
        onClose={closeDialogue}
        type={dialogueBox.type}
        title={dialogueBox.title}
        message={dialogueBox.message}
      />
    </div>
  );
}
