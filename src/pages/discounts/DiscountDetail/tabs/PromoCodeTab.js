import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PencilIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../../../../components/ConfirmationModal';
import DialogueBox from '../../../../components/DialogueBox';
import { useGetPromotionCodesListQuery, useCreatePromotionCodeMutation, useLazyGetPromotionCodeByIdQuery, useUpdatePromotionCodeMutation } from '../../../../store/api/modules/discounts/discountsApi';

const emptyForm = { code: '', referenceCode: '', description: '', caseSensitive: false };

const PromoCodeTab = () => {
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [codes, setCodes] = useState([]); // local additions fallback
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmComment, setConfirmComment] = useState('');
  const [dialogueBox, setDialogueBox] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const showDialogue = (type, title, message) => setDialogueBox({ isOpen: true, type, title, message });
  const closeDialogue = () => setDialogueBox({ isOpen: false, type: 'success', title: '', message: '' });

  const { data: codesResp, isLoading, isFetching, isUninitialized, refetch } = useGetPromotionCodesListQuery(id, {
    skip: !id,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const [createCode, { isLoading: creating }] = useCreatePromotionCodeMutation();
  const [triggerGetCodeById] = useLazyGetPromotionCodeByIdQuery();
  const [updateCode, { isLoading: updatingCode }] = useUpdatePromotionCodeMutation();
  const [currentCodeId, setCurrentCodeId] = useState(null);

  const canSave = useMemo(() => form.code.trim().length > 0, [form.code]);

  const reset = () => setForm(emptyForm);

  const handleSave = async () => {
    if (!canSave || !id) return;
    try {
      const body = {
        code: form.code.trim(),
        caseSensitive: !!form.caseSensitive,
        referenceCode: form.referenceCode?.trim() || undefined,
        description: form.description?.trim() || undefined,
      };
      const doUpdate = !!currentCodeId;
      const res = doUpdate
        ? await updateCode({ id, codeId: currentCodeId, body }).unwrap()
        : await createCode({ id, body }).unwrap();
      // update local preview and refetch
      setCodes((prev) => [
        ...prev,
        { id: Date.now(), ...body },
      ]);
      await refetch();
      reset();
      setShowModal(false);
      setConfirmComment('');
      showDialogue('success', res?.i18n_key || (doUpdate ? 'Updated' : 'Success'), res?.message || (doUpdate ? 'Promo code updated successfully.' : 'Promo code created successfully.'));
      setCurrentCodeId(null);
    } catch (e) {
      showDialogue('error', 'Error', e?.data?.message || 'Failed to save promo code.');
    }
  };

  const handleCancel = () => {
    reset();
    setShowModal(false);
  };

  const removeCode = (id) => setCodes((prev) => prev.filter((c) => c.id !== id));

  const loading = isUninitialized || isLoading || isFetching;
  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-neutral-900">Promo Codes</h3>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-10">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    );
  }

  const items = codesResp?.data?.items || [];
  const hasBackendCodes = items.length > 0;
  const hasAnyCodes = hasBackendCodes || codes.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-neutral-900">Promo Codes</h3>
        {!hasAnyCodes ? (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm font-medium"
          >
            Add Promo Code
          </button>
        ) : (
          <button
            onClick={async () => {
              try {
                const src = hasBackendCodes ? items[0] : codes[0];
                const codeId = src?.promotionCodeId || src?.id; // prefer promotionCodeId from backend
                if (hasBackendCodes && id && codeId) {
                  const detail = await triggerGetCodeById({ id, codeId }).unwrap();
                  const d = detail?.data || detail?.data?.data || {};
                  setCurrentCodeId(d.promotionCodeId || codeId);
                  setForm({
                    code: d.code || '',
                    referenceCode: d.referenceCode || '',
                    description: d.description || '',
                    caseSensitive: !!d.caseSensitive,
                  });
                } else {
                  setCurrentCodeId(codeId || null);
                  setForm({
                    code: src?.code || '',
                    referenceCode: src?.referenceCode || '',
                    description: src?.description || '',
                    caseSensitive: !!src?.caseSensitive,
                  });
                }
                setShowModal(true);
              } catch (e) {
                showDialogue('error', 'Error', e?.data?.message || 'Failed to fetch promo code details.');
              }
            }}
            className="p-2 border border-neutral-300 rounded-full text-neutral-700 hover:bg-neutral-50"
            title="Edit"
            aria-label="Edit promo code"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Reference Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Case Sensitive</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {!hasAnyCodes && (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-sm text-neutral-500 text-center">No promo codes added yet.</td>
                </tr>
              )}
              {(hasBackendCodes ? items : codes).map((c) => (
                <tr key={c.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{c.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{c.referenceCode || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{c.description || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{c.caseSensitive ? 'Yes' : 'No'}</td>
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
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Reference Code</label>
                <input
                  type="text"
                  value={form.referenceCode}
                  onChange={(e) => setForm({ ...form, referenceCode: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                  placeholder="Optional internal reference"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                  placeholder="Short description for this promo code"
                  rows={3}
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
              <button onClick={() => setShowConfirm(true)} disabled={!canSave || creating || updatingCode} className={`px-4 py-2 rounded-full text-sm font-medium ${canSave && !creating && !updatingCode ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-neutral-300 text-neutral-600 cursor-not-allowed'}`}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <ConfirmationModal
          isOpen={showConfirm}
          title="Create Promo Code"
          message="Are you sure you want to create this promo code?"
          comment={confirmComment}
          onCommentChange={setConfirmComment}
          isCommentRequired={true}
          confirmButtonText="Create"
          confirmButtonColor="primary"
          onConfirm={() => { setShowConfirm(false); handleSave(); }}
          onCancel={() => setShowConfirm(false)}
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
};

export default PromoCodeTab;
