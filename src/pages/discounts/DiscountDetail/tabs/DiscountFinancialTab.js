import React, { useMemo, useState } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../../../../components/ConfirmationModal';

const initialFinancials = [
  // Mock seed data
  {
    id: 1,
    idea: 'percentage',
    ownedBy: 'kitchen',
    stackable: true,
    percentValue: 20,
    maxDiscountPercent: 50,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    idea: 'price',
    ownedBy: 'platform',
    stackable: false,
    amountMinor: 5000, // Rs. 50.00
    currency: 'PKR',
    maxDiscountMinor: 15000, // Rs. 150.00
    createdAt: new Date().toISOString(),
  },
];

const currencyLabel = (code) => code || 'PKR';
const formatMinorToDisplay = (minor) => `Rs. ${(minor || 0) / 100}`;

export default function DiscountFinancialTab() {
  const [financials, setFinancials] = useState(initialFinancials);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

  const openModal = () => {
    setForm({
      idea: 'percentage',
      ownedBy: 'kitchen',
      stackable: false,
      percentValue: '',
      maxDiscountPercent: '',
      amountMinor: '',
      currency: 'PKR',
      maxDiscountMinor: '',
      buyQty: '',
      getQty: '',
      freeLowestItem: false,
      price: '',
      quantity: '',
    });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleSave = () => {
    // Basic validation by type
    if (form.idea === 'percentage') {
      if (form.percentValue === '' || Number.isNaN(Number(form.percentValue))) return;
    } else if (form.idea === 'price') {
      if (form.amountMinor === '' || Number.isNaN(Number(form.amountMinor))) return;
    } else if (form.idea === 'quantity') {
      if (form.buyQty === '' || form.getQty === '') return;
    }

    const payload = { id: Date.now(), createdAt: new Date().toISOString(), ...form };
    // Normalize numbers
    if (payload.percentValue !== undefined) payload.percentValue = Number(payload.percentValue);
    if (payload.maxDiscountPercent !== undefined && payload.maxDiscountPercent !== '') payload.maxDiscountPercent = Number(payload.maxDiscountPercent);
    if (payload.amountMinor !== undefined && payload.amountMinor !== '') payload.amountMinor = Number(payload.amountMinor);
    if (payload.maxDiscountMinor !== undefined && payload.maxDiscountMinor !== '') payload.maxDiscountMinor = Number(payload.maxDiscountMinor);
    if (payload.buyQty !== undefined && payload.buyQty !== '') payload.buyQty = Number(payload.buyQty);
    if (payload.getQty !== undefined && payload.getQty !== '') payload.getQty = Number(payload.getQty);

    setFinancials((prev) => [payload, ...prev]);
    setShowModal(false);
  };

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
        <button
          onClick={openModal}
          className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm font-medium"
        >
          Add Discount Financial
        </button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-100">
              {financials.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-6 text-center text-neutral-500">No financial rules added yet.</td>
                </tr>
              ) : financials.map((row) => (
                <tr key={row.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-3 text-sm text-neutral-900 capitalize">{row.idea}</td>
                  <td className="px-6 py-3 text-sm text-neutral-900 capitalize">{row.ownedBy}</td>
                  <td className="px-6 py-3 text-sm text-neutral-900">{row.stackable ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-3">{renderDetails(row)}</td>
                  <td className="px-6 py-3 text-sm text-neutral-700">{new Date(row.createdAt).toLocaleDateString()}</td>
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
              <button onClick={() => setShowConfirm(true)} className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm font-medium">Save</button>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <ConfirmationModal
          isOpen={showConfirm}
          title="Create Discount Financial"
          message="Are you sure you want to add this discount financial rule?"
          isCommentRequired={false}
          confirmText="Create"
          cancelText="Cancel"
          onConfirm={() => { setShowConfirm(false); handleSave(); }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
