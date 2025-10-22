import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, FunnelIcon, MagnifyingGlassIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../../components/ConfirmationModal';
import allCases from '../../data/cases/allCases.json';

const columns = [
  { key: 'caseId', title: 'Case ID' },
  { key: 'category', title: 'Category' },
  { key: 'type', title: 'Type' },
  { key: 'status', title: 'Status' },
  { key: 'priority', title: 'Priority' },
  { key: 'initiator', title: 'Initiator' },
  { key: 'action', title: 'Action' },
];

const AllCasesList = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  // pending filters to apply on Search (to mirror Kitchens/MyCases UX)
  const [pendingStatus, setPendingStatus] = useState('');
  const [pendingPriority, setPendingPriority] = useState('');
  // new pending filters
  const [pendingCaseId, setPendingCaseId] = useState('');
  const [pendingCaseType, setPendingCaseType] = useState('');
  const [pendingCaseSubType, setPendingCaseSubType] = useState('');
  const [pendingFeedbackId, setPendingFeedbackId] = useState('');
  const [pendingOrderId, setPendingOrderId] = useState('');
  const [pendingCustomerId, setPendingCustomerId] = useState('');
  // applied filters
  const [caseIdFilter, setCaseIdFilter] = useState('');
  const [caseTypeFilter, setCaseTypeFilter] = useState('');
  const [caseSubTypeFilter, setCaseSubTypeFilter] = useState('');
  const [feedbackIdFilter, setFeedbackIdFilter] = useState('');
  const [orderIdFilter, setOrderIdFilter] = useState('');
  const [customerIdFilter, setCustomerIdFilter] = useState('');

  // Create Case modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    type: '',
    priority: '',
    initiatorType: '',
    description: '',
  });
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [createConfirmComment, setCreateConfirmComment] = useState('');

  const navigate = useNavigate();
  const filtered = useMemo(() => {
    return allCases.filter(c => {
      const q = query.trim().toLowerCase();
      const matchesQ = !q ||
        c.caseId.toLowerCase().includes(q) ||
        (c.subject || '').toLowerCase().includes(q) ||
        (c.category || '').toLowerCase().includes(q) ||
        (c.type || '').toLowerCase().includes(q) ||
        (c.subType || '').toLowerCase().includes(q) ||
        (c.currentActor || '').toLowerCase().includes(q) ||
        (c.initiator || '').toLowerCase().includes(q);
      const matchesStatus = !status || String(c.status).toLowerCase() === status.toLowerCase();
      const matchesPriority = !priority || String(c.priority).toLowerCase() === priority.toLowerCase();
      const matchesCaseId = !caseIdFilter || String(c.caseId || '').toLowerCase().includes(caseIdFilter.toLowerCase());
      const matchesCaseType = !caseTypeFilter || String(c.type || '').toLowerCase().includes(caseTypeFilter.toLowerCase());
      const matchesCaseSubType = !caseSubTypeFilter || String(c.subType || '').toLowerCase().includes(caseSubTypeFilter.toLowerCase());
      const matchesFeedbackId = !feedbackIdFilter || String(c.feedbackId || '').toLowerCase().includes(feedbackIdFilter.toLowerCase());
      const matchesOrderId = !orderIdFilter || String(c.orderId || '').toLowerCase().includes(orderIdFilter.toLowerCase());
      const matchesCustomerId = !customerIdFilter || String(c.customerId || '').toLowerCase().includes(customerIdFilter.toLowerCase());
      return matchesQ && matchesStatus && matchesPriority && matchesCaseId && matchesCaseType && matchesCaseSubType && matchesFeedbackId && matchesOrderId && matchesCustomerId;
    });
  }, [query, status, priority]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900">All Cases</h1>
        <p className="text-sm text-neutral-500 mt-1">Browse all cases across the system.</p>
      </div>

      {/* Create Case Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-neutral-900">Create Case</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Case Title *</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                  placeholder="Enter case title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Case Type *</label>
                <select
                  value={createForm.type}
                  onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                >
                  <option value="">Select type</option>
                  <option value="kitchen complaint">kitchen complaint</option>
                  <option value="customer complaint">customer complaint</option>
                  <option value="system issue">system issue</option>
                  <option value="feedback">feedback</option>
                  <option value="inquiry">inquiry</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Priority *</label>
                <select
                  value={createForm.priority}
                  onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                >
                  <option value="">Select priority</option>
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Initiator Type *</label>
                <select
                  value={createForm.initiatorType}
                  onChange={(e) => setCreateForm({ ...createForm, initiatorType: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                >
                  <option value="">Select initiator</option>
                  <option value="customer">customer</option>
                  <option value="kitchen">kitchen</option>
                  <option value="admin">admin</option>
                  <option value="system">system</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                  placeholder="Add details for this case"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => { setShowCreateModal(false); setCreateForm({ title: '', type: '', priority: '', initiatorType: '', description: '' }); }}
                  className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setShowCreateConfirm(true); }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Case Confirmation */}
      {showCreateConfirm && (
        <ConfirmationModal
          isOpen={showCreateConfirm}
          title={'Create Case'}
          message={'Are you sure you want to create this case?'}
          comment={createConfirmComment}
          onCommentChange={setCreateConfirmComment}
          onConfirm={() => {
            setShowCreateConfirm(false);
            setCreateConfirmComment('');
            setShowCreateModal(false);
            setCreateForm({ title: '', type: '', priority: '', initiatorType: '', description: '' });
          }}
          onCancel={() => { setShowCreateConfirm(false); setCreateConfirmComment(''); }}
          confirmButtonText={'Create'}
          confirmButtonColor="primary"
          isCommentRequired={true}
        />
      )}

      {/* Toolbar: Create above, then Search + Filters (match Discounts.js pattern) */}
      <div className="mb-6 flex items-center justify-end">
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
          Create Case
        </button>
      </div>

      {/* Search and Filters (match MyCasesList) */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Search by case id, subject, category..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="sm:w-48">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <FunnelIcon className="h-5 w-5 mr-2 text-gray-400" aria-hidden="true" />
            Filters
          </button>
        </div>
      </div>
      {showFilters && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Case Id</label>
              <input className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm" value={pendingCaseId} onChange={(e) => setPendingCaseId(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Case Type</label>
              <input className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm" value={pendingCaseType} onChange={(e) => setPendingCaseType(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Case Sub Type</label>
              <input className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm" value={pendingCaseSubType} onChange={(e) => setPendingCaseSubType(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">FeedbackId</label>
              <input className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm" value={pendingFeedbackId} onChange={(e) => setPendingFeedbackId(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OrderId</label>
              <input className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm" value={pendingOrderId} onChange={(e) => setPendingOrderId(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CustomerId</label>
              <input className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm" value={pendingCustomerId} onChange={(e) => setPendingCustomerId(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" value={pendingStatus} onChange={(e) => setPendingStatus(e.target.value)}>
                <option value="">All Status</option>
                <option value="Initiated">Initiated</option>
                <option value="Open">Open</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" value={pendingPriority} onChange={(e) => setPendingPriority(e.target.value)}>
                <option value="">All Priority</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => { setStatus(pendingStatus); setPriority(pendingPriority); }}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm"
            >
              Search
            </button>
            <button
              onClick={() => { setQuery(''); setStatus(''); setPriority(''); setPendingStatus(''); setPendingPriority(''); }}
              className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors text-sm"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className={`bg-white border border-neutral-200 rounded-lg overflow-hidden ${showFilters ? 'mt-4' : 'mt-2'}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                {columns.map(col => (
                  <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">{col.title}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filtered.map((row) => (
                <tr key={row.caseId}>
                  <td className="px-6 py-4 text-sm text-neutral-900">{row.caseId}</td>
                  <td className="px-6 py-4 text-sm text-neutral-900">{row.category || '-'}</td>
                  <td className="px-6 py-4 text-sm text-neutral-900">{row.type || '-'}</td>
                  <td className="px-6 py-4 text-sm text-neutral-900">{row.status || '-'}</td>
                  <td className="px-6 py-4 text-sm text-neutral-900">{row.priority || '-'}</td>
                  <td className="px-6 py-4 text-sm text-neutral-900">{row.initiator || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                   <button className="text-neutral-600 hover:text-neutral-800 font-medium inline-flex items-center" title="View" onClick={() => navigate(`/cases/${row.caseId}`, { state: { caseData: row } })}>
                     <EyeIcon className="h-5 w-5" />
                   </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="px-6 py-6 text-sm text-neutral-500 text-center" colSpan={columns.length}>No cases found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllCasesList;
