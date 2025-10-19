import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PlusIcon, XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../../../../components/ConfirmationModal';
import DialogueBox from '../../../../components/DialogueBox';
import { useUpdatePromotionMutation, useGetPromotionByIdQuery } from '../../../../store/api/modules/discounts/discountsApi';

const initialFinancials = [];

const currencyLabel = (code) => code || 'PKR';
const formatMinorToDisplay = (minor) => `Rs. ${(minor || 0) / 100}`;

export default function DiscountFinancialTab() {
  const { id } = useParams();
  // Single rule mode
  const [financial, setFinancial] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmComment, setConfirmComment] = useState('');
  const [dialogueBox, setDialogueBox] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const showDialogue = (type, title, message) => setDialogueBox({ isOpen: true, type, title, message });
  const closeDialogue = () => setDialogueBox({ isOpen: false, type: 'success', title: '', message: '' });

  const [updatePromotion, { isLoading: updating }] = useUpdatePromotionMutation();
  const { data: detailsResp, isLoading: detailsLoading, isFetching: detailsFetching, isUninitialized } = useGetPromotionByIdQuery(id, { skip: !id });
  const details = detailsResp?.data || {};
  const hasBackendFinancial = (
    details?.discountIdea != null ||
    details?.percentValue != null ||
    details?.amountMinor != null ||
    details?.buyQty != null
  );

  const [form, setForm] = useState({
    idea: 'percentage',
    ownedBy: 'kitchen',
    stackable: false,
    // percentage
    percentValue: '',
    maxDiscountPercent: '',
    // price
    amountMinor: '',
    currency: 'PKR',
    maxDiscountMinor: '',
    // quantity
    buyQty: '',
    getQty: '',
    freeLowestItem: false,
    // common for price/quantity
    price: '',
    quantity: '',
  });

  const canSave = useMemo(() => {
    if (form.idea === 'percentage') {
      return form.percentValue !== '' && form.maxDiscountPercent !== '';
    }
    if (form.idea === 'price') {
      return form.amountMinor !== '' && form.maxDiscountMinor !== '';
    }
    if (form.idea === 'quantity') {
      return form.buyQty !== '' && form.getQty !== '';
    }
    return true;
  }, [form]);

  const openModal = () => setShowModal(true);

  const openEdit = () => {
    // Prefer local state; otherwise fallback to backend details
    const src = financial || {
      idea: details?.discountIdea || 'percentage',
      percentValue: details?.percentValue ?? '',
      maxDiscountPercent: details?.maxDiscountPercent ?? '',
      amountMinor: details?.amountMinor ?? '',
      currency: details?.currencyCode || 'PKR',
      maxDiscountMinor: details?.maxDiscountMinor ?? '',
      buyQty: details?.buyQty ?? '',
      getQty: details?.getQty ?? '',
      freeLowestItem: !!details?.freeLowestItem,
      ownedBy: details?.ownedBy || 'kitchen',
      stackable: !!details?.stackable,
    };
    setForm({
      idea: src.idea,
      percentValue: src.percentValue ?? '',
      maxDiscountPercent: src.maxDiscountPercent ?? '',
      amountMinor: src.amountMinor ?? '',
      currency: src.currency ?? 'PKR',
      maxDiscountMinor: src.maxDiscountMinor ?? '',
      buyQty: src.buyQty ?? '',
      getQty: src.getQty ?? '',
      freeLowestItem: !!src.freeLowestItem,
      ownedBy: src.ownedBy ?? 'kitchen',
      stackable: !!src.stackable,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    // Basic validation by type
    if (form.idea === 'percentage') {
      if (form.percentValue === '' || Number.isNaN(Number(form.percentValue))) return;
    } else if (form.idea === 'price') {
      if (form.amountMinor === '' || Number.isNaN(Number(form.amountMinor))) return;
    } else if (form.idea === 'quantity') {
      if (form.buyQty === '' || form.getQty === '') return;
    }
    // Build API body based on selected idea
    const base = {
      ownedBy: form.ownedBy,
      stackable: !!form.stackable,
      discountIdea: form.idea, // send current discount idea
    };
    let body = { ...base };
    if (form.idea === 'percentage') {
      body = {
        ...base,
        percentValue: Number(form.percentValue),
        maxDiscountPercent: form.maxDiscountPercent !== '' ? Number(form.maxDiscountPercent) : null,
      };
    } else if (form.idea === 'price') {
      body = {
        ...base,
        amountMinor: Number(form.amountMinor),
        currencyCode: form.currency || 'PKR',
        maxDiscountMinor: form.maxDiscountMinor !== '' ? Number(form.maxDiscountMinor) : null,
      };
    } else if (form.idea === 'quantity') {
      body = {
        ...base,
        buyQty: Number(form.buyQty),
        getQty: Number(form.getQty),
        freeLowestItem: !!form.freeLowestItem,
      };
    }

    try {
      const res = await updatePromotion({ id, ...body }).unwrap();
      // Update local preview
      setFinancial({ ...form, ...body });
      setShowModal(false);
      setForm({
        idea: 'percentage',
        percentValue: '',
        maxDiscountPercent: '',
        amountMinor: '',
        currency: 'PKR',
        maxDiscountMinor: '',
        buyQty: '',
        getQty: '',
        freeLowestItem: false,
        ownedBy: 'kitchen',
        stackable: false,
      });
      showDialogue('success', res?.i18n_key || 'Success', res?.message || 'Discount financial updated successfully.');
    } catch (e) {
      showDialogue('error', 'Error', e?.data?.message || 'Failed to update discount financial.');
    }
  };

  const closeModal = () => setShowModal(false);

  const columns = useMemo(() => ([
    { key: 'idea', label: 'Discount Idea' },
    { key: 'ownedBy', label: 'Owned By' },
    { key: 'stackable', label: 'Stackable' },
    { key: 'details', label: 'Details' },
    { key: 'createdAt', label: 'Created' },
  ]), []);

  // Map backend details to our local display shape if local state is absent
  const backendAsFinancial = useMemo(() => {
    if (!hasBackendFinancial) return null;
    return {
      idea: details?.discountIdea || 'percentage',
      ownedBy: details?.ownedBy || 'kitchen',
      stackable: !!details?.stackable,
      percentValue: details?.percentValue != null ? Number(details.percentValue) : undefined,
      maxDiscountPercent: details?.maxDiscountPercent != null ? Number(details.maxDiscountPercent) : undefined,
      amountMinor: details?.amountMinor != null ? Number(details.amountMinor) : undefined,
      currency: details?.currencyCode || 'PKR',
      maxDiscountMinor: details?.maxDiscountMinor != null ? Number(details.maxDiscountMinor) : undefined,
      buyQty: details?.buyQty != null ? Number(details.buyQty) : undefined,
      getQty: details?.getQty != null ? Number(details.getQty) : undefined,
      freeLowestItem: !!details?.freeLowestItem,
    };
  }, [hasBackendFinancial, details]);

  const displayFinancial = financial || backendAsFinancial;

  const renderDetails = (row) => {
    if (row.idea === 'percentage') {
      return (
        <div className="text-sm text-neutral-700">
          <div>Percent: {row.percentValue}%</div>
          {row.maxDiscountPercent ? <div>Max: {row.maxDiscountPercent}%</div> : null}
        </div>
      );
    }
    if (row.idea === 'price') {
      return (
        <div className="text-sm text-neutral-700">
          <div>Amount: {formatMinorToDisplay(row.amountMinor)} {currencyLabel(row.currency)}</div>
          {row.maxDiscountMinor ? <div>Max Discount: {formatMinorToDisplay(row.maxDiscountMinor)}</div> : null}
        </div>
      );
    }
    if (row.idea === 'quantity') {
      return (
        <div className="text-sm text-neutral-700">
          <div>Buy Qty: {row.buyQty}</div>
          <div>Get Qty: {row.getQty}</div>
          <div>Free Lowest Item: {row.freeLowestItem ? 'Yes' : 'No'}</div>
        </div>
      );
    }
    return '-';
  };

  const loading = isUninitialized || detailsLoading || detailsFetching;
  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-neutral-900">Discount Financial</h3>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-10">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-neutral-900">Discount Financial</h3>
        {(!financial && !hasBackendFinancial) ? (
          <button
            onClick={openModal}
            className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm font-medium"
          >
            Add Discount Financial
          </button>
        ) : (
          <button
            onClick={openEdit}
            className="p-2 border border-neutral-300 rounded-full text-neutral-700 hover:bg-neutral-50"
            title="Edit"
            aria-label="Edit financial"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {!displayFinancial && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6 text-sm text-neutral-500 text-center">
          No discount financial rule added yet.
        </div>
      )}

      {displayFinancial && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-neutral-500">Type</div>
              <div className="text-neutral-900 font-medium capitalize">{displayFinancial.idea}</div>
            </div>
            {displayFinancial.idea === 'percentage' && (
              <>
                <div>
                  <div className="text-sm text-neutral-500">Percentage Value</div>
                  <div className="text-neutral-900 font-medium">{displayFinancial.percentValue ?? '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-500">Max Discount %</div>
                  <div className="text-neutral-900 font-medium">{displayFinancial.maxDiscountPercent ?? '-'}</div>
                </div>
              </>
            )}
            {displayFinancial.idea === 'price' && (
              <>
                <div>
                  <div className="text-sm text-neutral-500">Amount Minor</div>
                  <div className="text-neutral-900 font-medium">{displayFinancial.amountMinor ?? '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-500">Currency</div>
                  <div className="text-neutral-900 font-medium">{displayFinancial.currency || 'PKR'}</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-500">Max Discount Minor</div>
                  <div className="text-neutral-900 font-medium">{displayFinancial.maxDiscountMinor ?? '-'}</div>
                </div>
              </>
            )}
            {displayFinancial.idea === 'quantity' && (
              <>
                <div>
                  <div className="text-sm text-neutral-500">Buy QTY</div>
                  <div className="text-neutral-900 font-medium">{displayFinancial.buyQty ?? '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-500">Get QTY</div>
                  <div className="text-neutral-900 font-medium">{displayFinancial.getQty ?? '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-500">Free Lowest Item</div>
                  <div className="text-neutral-900 font-medium">{displayFinancial.freeLowestItem ? 'Yes' : 'No'}</div>
                </div>
              </>
            )}
            <div>
              <div className="text-sm text-neutral-500">Owned By</div>
              <div className="text-neutral-900 font-medium capitalize">{displayFinancial.ownedBy}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-500">Stackable</div>
              <div className="text-neutral-900 font-medium">{displayFinancial.stackable ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-neutral-900">Add Discount Financial</h3>
              <button onClick={closeModal} className="text-neutral-400 hover:text-neutral-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Constant fields */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Discount Idea</label>
                <select
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                  value={form.idea}
                  onChange={(e) => setForm((f) => ({ ...f, idea: e.target.value }))}
                >
                  <option value="percentage">Percentage</option>
                  <option value="price">Price</option>
                  <option value="quantity">Quantity</option>
                </select>
              </div>

              

              {/* Dynamic fields */}
              {form.idea === 'percentage' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Percentage Value</label>
                    <input
                      type="number"
                      value={form.percentValue}
                      onChange={(e) => setForm((f) => ({ ...f, percentValue: e.target.value }))}
                      className="w-full p-2 border border-neutral-300 rounded-lg"
                      placeholder="e.g., 20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Max Discount Percentage</label>
                    <input
                      type="number"
                      value={form.maxDiscountPercent}
                      onChange={(e) => setForm((f) => ({ ...f, maxDiscountPercent: e.target.value }))}
                      className="w-full p-2 border border-neutral-300 rounded-lg"
                      placeholder="e.g., 50"
                    />
                  </div>
                </>
              )}

              {/* Owned By */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Owned By</label>
                <select
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                  value={form.ownedBy}
                  onChange={(e) => setForm((f) => ({ ...f, ownedBy: e.target.value }))}
                >
                  <option value="kitchen">Kitchen</option>
                  <option value="platform">Platform</option>
                </select>
              </div>

              {/* Stackable */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700">Stackable</span>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, stackable: !f.stackable }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.stackable ? 'bg-primary-600' : 'bg-neutral-300'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.stackable ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>

              {form.idea === 'price' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Amount Minor</label>
                    <input
                      type="number"
                      value={form.amountMinor}
                      onChange={(e) => setForm((f) => ({ ...f, amountMinor: e.target.value }))}
                      className="w-full p-2 border border-neutral-300 rounded-lg"
                      placeholder="e.g., 5000 (Rs. 50.00)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Currency</label>
                    <select disabled className="w-full p-2 border border-neutral-300 rounded-lg bg-neutral-100 text-neutral-600" value={form.currency}>
                      <option value="PKR">PKR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Max Discount Minor</label>
                    <input
                      type="number"
                      value={form.maxDiscountMinor}
                      onChange={(e) => setForm((f) => ({ ...f, maxDiscountMinor: e.target.value }))}
                      className="w-full p-2 border border-neutral-300 rounded-lg"
                      placeholder="e.g., 15000 (Rs. 150.00)"
                    />
                  </div>
                </>
              )}

              {form.idea === 'quantity' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Buy QTY</label>
                    <input
                      type="number"
                      value={form.buyQty}
                      onChange={(e) => setForm((f) => ({ ...f, buyQty: e.target.value }))}
                      className="w-full p-2 border border-neutral-300 rounded-lg"
                      placeholder="e.g., 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Get QTY</label>
                    <input
                      type="number"
                      value={form.getQty}
                      onChange={(e) => setForm((f) => ({ ...f, getQty: e.target.value }))}
                      className="w-full p-2 border border-neutral-300 rounded-lg"
                      placeholder="e.g., 1"
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center gap-3">
                    <input
                      id="freeLowestItem"
                      type="checkbox"
                      checked={form.freeLowestItem}
                      onChange={(e) => setForm((f) => ({ ...f, freeLowestItem: e.target.checked }))}
                      className="h-4 w-4 text-primary-600 border-neutral-300 rounded"
                    />
                    <label htmlFor="freeLowestItem" className="text-sm text-neutral-700">Free Lowest Item</label>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={closeModal} className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 text-sm font-medium">Cancel</button>
              <button disabled={!canSave || updating} onClick={() => canSave && setShowConfirm(true)} className={`px-4 py-2 rounded-full text-sm font-medium ${canSave && !updating ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-neutral-300 text-neutral-600 cursor-not-allowed'}`}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <ConfirmationModal
          isOpen={showConfirm}
          title={financial ? 'Update Discount Financial' : 'Create Discount Financial'}
          message={financial ? 'Are you sure you want to update this discount financial rule?' : 'Are you sure you want to add this discount financial rule?'}
          comment={confirmComment}
          onCommentChange={setConfirmComment}
          onConfirm={() => { setShowConfirm(false); handleSave(); setConfirmComment(''); }}
          onCancel={() => { setShowConfirm(false); setConfirmComment(''); }}
          confirmButtonText={financial ? 'Update' : 'Create'}
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
