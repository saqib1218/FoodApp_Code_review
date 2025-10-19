import React, { useMemo, useState } from 'react';
import { PlusIcon, XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../../../../components/ConfirmationModal';

const initialFinancials = [];

const currencyLabel = (code) => code || 'PKR';
const formatMinorToDisplay = (minor) => `Rs. ${(minor || 0) / 100}`;

export default function DiscountFinancialTab() {
  // Single rule mode
  const [financial, setFinancial] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmComment, setConfirmComment] = useState('');

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
    if (!financial) return;
    setForm({
      idea: financial.idea,
      percentValue: financial.percentValue ?? '',
      maxDiscountPercent: financial.maxDiscountPercent ?? '',
      amountMinor: financial.amountMinor ?? '',
      currency: financial.currency ?? 'PKR',
      maxDiscountMinor: financial.maxDiscountMinor ?? '',
      buyQty: financial.buyQty ?? '',
      getQty: financial.getQty ?? '',
      freeLowestItem: !!financial.freeLowestItem,
      ownedBy: financial.ownedBy ?? 'kitchen',
      stackable: !!financial.stackable,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    // Basic validation by type
    if (form.idea === 'percentage') {
      if (form.percentValue === '' || Number.isNaN(Number(form.percentValue))) return;
    } else if (form.idea === 'price') {
      if (form.amountMinor === '' || Number.isNaN(Number(form.amountMinor))) return;
    } else if (form.idea === 'quantity') {
      if (form.buyQty === '' || form.getQty === '') return;
    }

    const payload = { id: Date.now(), ...form };
    // Normalize numbers
    if (payload.percentValue !== undefined) payload.percentValue = Number(payload.percentValue);
    if (payload.maxDiscountPercent !== undefined && payload.maxDiscountPercent !== '') payload.maxDiscountPercent = Number(payload.maxDiscountPercent);
    if (payload.amountMinor !== undefined && payload.amountMinor !== '') payload.amountMinor = Number(payload.amountMinor);
    if (payload.maxDiscountMinor !== undefined && payload.maxDiscountMinor !== '') payload.maxDiscountMinor = Number(payload.maxDiscountMinor);
    if (payload.buyQty !== undefined && payload.buyQty !== '') payload.buyQty = Number(payload.buyQty);
    if (payload.getQty !== undefined && payload.getQty !== '') payload.getQty = Number(payload.getQty);

    setFinancial(payload);
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
  };

  const closeModal = () => setShowModal(false);

  const columns = useMemo(() => ([
    { key: 'idea', label: 'Discount Idea' },
    { key: 'ownedBy', label: 'Owned By' },
    { key: 'stackable', label: 'Stackable' },
    { key: 'details', label: 'Details' },
    { key: 'createdAt', label: 'Created' },
  ]), []);

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-neutral-900">Discount Financial</h3>
        {!financial ? (
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

      {!financial && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6 text-sm text-neutral-500 text-center">
          No discount financial rule added yet.
        </div>
      )}

      {financial && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-neutral-500">Type</div>
              <div className="text-neutral-900 font-medium capitalize">{financial.idea}</div>
            </div>
            {financial.idea === 'percentage' && (
              <>
                <div>
                  <div className="text-sm text-neutral-500">Percentage Value</div>
                  <div className="text-neutral-900 font-medium">{financial.percentValue || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-500">Max Discount %</div>
                  <div className="text-neutral-900 font-medium">{financial.maxDiscountPercent || '-'}</div>
                </div>
              </>
            )}
            {financial.idea === 'price' && (
              <>
                <div>
                  <div className="text-sm text-neutral-500">Amount Minor</div>
                  <div className="text-neutral-900 font-medium">{financial.amountMinor || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-500">Currency</div>
                  <div className="text-neutral-900 font-medium">{financial.currency || 'PKR'}</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-500">Max Discount Minor</div>
                  <div className="text-neutral-900 font-medium">{financial.maxDiscountMinor || '-'}</div>
                </div>
              </>
            )}
            {financial.idea === 'quantity' && (
              <>
                <div>
                  <div className="text-sm text-neutral-500">Buy QTY</div>
                  <div className="text-neutral-900 font-medium">{financial.buyQty || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-500">Get QTY</div>
                  <div className="text-neutral-900 font-medium">{financial.getQty || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-500">Free Lowest Item</div>
                  <div className="text-neutral-900 font-medium">{financial.freeLowestItem ? 'Yes' : 'No'}</div>
                </div>
              </>
            )}
            <div>
              <div className="text-sm text-neutral-500">Owned By</div>
              <div className="text-neutral-900 font-medium capitalize">{financial.ownedBy}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-500">Stackable</div>
              <div className="text-neutral-900 font-medium">{financial.stackable ? 'Yes' : 'No'}</div>
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
              <button disabled={!canSave} onClick={() => canSave && setShowConfirm(true)} className={`px-4 py-2 rounded-full text-sm font-medium ${canSave ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-neutral-300 text-neutral-600 cursor-not-allowed'}`}>Save</button>
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
    </div>
  );
}
