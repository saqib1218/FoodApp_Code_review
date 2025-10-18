import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import DialogueBox from '../../../components/DialogueBox';
import ConfirmationModal from '../../../components/ConfirmationModal';
import EligibilityRuleTab from './tabs/EligibilityRuleTab';
import PromotionTargetTab from './tabs/PromotionTargetTab';
import AudienceRuleTab from './tabs/AudienceRuleTab';
import PromoCodeTab from './tabs/PromoCodeTab';
import DiscountFinancialTab from './tabs/DiscountFinancialTab';
import DiscountScheduleTab from './tabs/DiscountScheduleTab';
import DiscountUsageTab from './tabs/DiscountUsageTab';

const DiscountDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Placeholder discount data; replace with RTK Query later
  const [discount, setDiscount] = useState({
    id,
    name: 'Sample Promotion',
    idea: '20% off for weekend orders',
    type: 'percentage',
    status: 'draft',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
  });

  const [dialogueBox, setDialogueBox] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const showDialogue = (type, title, message) => setDialogueBox({ isOpen: true, type, title, message });
  const closeDialogue = () => setDialogueBox({ isOpen: false, type: 'success', title: '', message: '' });

  const [activeTab, setActiveTab] = useState('eligibility');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ nameDisplay: '', nameInternal: '', campaignLabel: '', promotionType: 'standard' });
  const [showEditConfirm, setShowEditConfirm] = useState(false);

  const TABS = {
    eligibility: <EligibilityRuleTab />,
    targets: <PromotionTargetTab />,
    audience: <AudienceRuleTab />,
    promocodes: <PromoCodeTab />,
    financial: <DiscountFinancialTab />,
    schedule: <DiscountScheduleTab />,
    usage: <DiscountUsageTab />,
  };

  const formatDate = (iso) => new Date(iso).toLocaleDateString();

  return (
    <div className="bg-white shadow rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-neutral-200 flex justify-between items-center">
        <div className="flex items-center">
          <button onClick={() => navigate('/discounts')} className="mr-4 text-neutral-500 hover:text-neutral-700">
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-medium text-neutral-900">{discount.name}</h2>
            <p className="text-sm text-neutral-500">Type: {discount.type} • Status: {discount.status}</p>
          </div>
        </div>
        <div>
          <button
            onClick={() => {
              setEditForm({
                nameDisplay: discount.name || '',
                nameInternal: discount.internalName || '',
                campaignLabel: discount.campaignLabel || '',
                promotionType: discount.type || 'standard',
              });
              setShowEditModal(true);
            }}
            className="px-4 py-2 border border-neutral-300 rounded-full shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 flex items-center"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit Discount
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="px-6 py-5 border-b border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-2">
            <h3 className="text-sm font-medium text-neutral-500">Promotion Idea</h3>
            <p className="mt-1 text-neutral-900">{discount.idea || '-'}</p>
          </div>
          <div className="mb-2">
            <h3 className="text-sm font-medium text-neutral-500">Duration</h3>
            <p className="mt-1 text-neutral-900">{formatDate(discount.startDate)} to {formatDate(discount.endDate)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button onClick={() => setActiveTab('eligibility')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab==='eligibility'?'border-primary-500 text-primary-600':'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'}`}>Eligibility Rule</button>
          <button onClick={() => setActiveTab('targets')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab==='targets'?'border-primary-500 text-primary-600':'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'}`}>Promotion Target</button>
          <button onClick={() => setActiveTab('audience')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab==='audience'?'border-primary-500 text-primary-600':'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'}`}>Audience Rule</button>
          <button onClick={() => setActiveTab('promocodes')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab==='promocodes'?'border-primary-500 text-primary-600':'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'}`}>Promo Codes</button>
          <button onClick={() => setActiveTab('financial')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab==='financial'?'border-primary-500 text-primary-600':'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'}`}>Discount Financial</button>
          <button onClick={() => setActiveTab('schedule')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab==='schedule'?'border-primary-500 text-primary-600':'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'}`}>Discount Schedule</button>
          <button onClick={() => setActiveTab('usage')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab==='usage'?'border-primary-500 text-primary-600':'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'}`}>Discount Usage</button>
        </nav>
      </div>

      <div className="p-6">
        {TABS[activeTab]}
      </div>

      <DialogueBox isOpen={dialogueBox.isOpen} onClose={closeDialogue} type={dialogueBox.type} title={dialogueBox.title} message={dialogueBox.message} />

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-neutral-900">Edit Promotion</h3>
              <button onClick={() => setShowEditModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Name Display *</label>
                <input
                  type="text"
                  value={editForm.nameDisplay}
                  onChange={(e) => setEditForm({ ...editForm, nameDisplay: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                  placeholder="Enter display name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Name Internal</label>
                <input
                  type="text"
                  value={editForm.nameInternal}
                  onChange={(e) => setEditForm({ ...editForm, nameInternal: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                  placeholder="Internal reference name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Campaign Label</label>
                <input
                  type="text"
                  value={editForm.campaignLabel}
                  onChange={(e) => setEditForm({ ...editForm, campaignLabel: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                  placeholder="Label shown in campaign UI"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Promotion Type</label>
                <select
                  value={editForm.promotionType}
                  onChange={(e) => setEditForm({ ...editForm, promotionType: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                >
                  <option value="standard">Standard</option>
                  <option value="pre_order">Pre-Order</option>
                  <option value="target_base">Target Base</option>
                  <option value="voucher">Voucher</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 text-sm font-medium">Cancel</button>
              <button
                onClick={() => setShowEditConfirm(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditConfirm && (
        <ConfirmationModal
          isOpen={showEditConfirm}
          title="Update Promotion"
          message="Are you sure you want to update this promotion?"
          confirmText="Update"
          cancelText="Cancel"
          onConfirm={() => {
            setShowEditConfirm(false);
            // locally update the detail header fields; wire to API later
            setDiscount((prev) => ({
              ...prev,
              name: editForm.nameDisplay || prev.name,
              internalName: editForm.nameInternal,
              campaignLabel: editForm.campaignLabel,
              type: editForm.promotionType || prev.type,
            }));
            setShowEditModal(false);
          }}
          onCancel={() => setShowEditConfirm(false)}
          isCommentRequired={false}
        />
      )}
    </div>
  );
};

export default DiscountDetail;
