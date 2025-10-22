import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, DocumentDuplicateIcon, ClockIcon, UserIcon, AdjustmentsHorizontalIcon, CheckCircleIcon, PhoneIcon, ClipboardDocumentListIcon, FlagIcon, ArrowPathIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../../../components/ConfirmationModal';
import myCases from '../../../data/cases/myCases.json';
import allCases from '../../../data/cases/allCases.json';
import activitiesData from '../../../data/cases/activities.json';

const findCaseById = (id) => {
  const all = [...(myCases || []), ...(allCases || [])];
  return all.find(c => (c.caseId || '').toLowerCase() === String(id).toLowerCase());
};

const CaseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const passed = location.state?.caseData;
  const source = location.state?.source || '';
  const data = passed || findCaseById(id) || {};

  const {
    caseId = id,
    subject = '',
    category = '',
    type = '',
    subType = '',
    status = 'Initiated',
    priority = 'MEDIUM',
    initiator = 'Unknown',
    currentActor = 'Unassigned',
    initiated = '',
  } = data;

  // Derive values for header display
  const titleLine = `${caseId || ''}`;
  const metaLine = [category || '', type || '', subType || ''].filter(Boolean);

  // Split subject into possible order ref (first line) + description
  const subjectLines = (subject || '').split('\n').filter(Boolean);
  const orderRef = subjectLines[0] || '';
  const orderId = orderRef ? orderRef.replace(/^ORDER:\s*/i, '').trim() : '';
  const description = subjectLines.slice(1).join('\n') || '';

  // Confirmation modal state for Take Ownership
  const [showOwnershipConfirm, setShowOwnershipConfirm] = useState(false);
  const [ownershipComment, setOwnershipComment] = useState('');

  // Add Activity modal (custom, to include an Activity Type dropdown)
  const [showActivityConfirm, setShowActivityConfirm] = useState(false);
  const [activityType, setActivityType] = useState('');
  const [activityComment, setActivityComment] = useState('');

  // Change Priority modal (custom: dropdown + comment)
  const [showPriorityConfirm, setShowPriorityConfirm] = useState(false);
  const [priorityValue, setPriorityValue] = useState('');
  const [priorityComment, setPriorityComment] = useState('');

  // Mark as Resolved confirmation (uses shared ConfirmationModal)
  const [showResolvedConfirm, setShowResolvedConfirm] = useState(false);
  const [resolvedComment, setResolvedComment] = useState('');

  return (
    <div className="space-y-6">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="inline-flex items-center text-primary-600 hover:text-primary-800">
        <ArrowLeftIcon className="h-5 w-5 mr-1" /> Back to Cases
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Case header card */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-1 text-sm font-medium tracking-wide text-neutral-500 flex items-center gap-2">
                  <span>{titleLine}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 text-neutral-700">{status || 'Initiated'}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-700">
                  {metaLine.map((m, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <span className="text-neutral-400">•</span>}
                      <span>{m}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div className="ml-4">
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {String(priority || '').toUpperCase()} PRIORITY
                </div>
              </div>
            </div>
            <div className="mt-4 whitespace-pre-wrap text-sm text-neutral-900">
              {orderRef && <div className="font-medium">{orderRef}</div>}
              {description && <div className="mt-1 text-neutral-700">{description}</div>}
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-medium text-neutral-500">Initiated By</div>
                <div className="mt-1 text-sm text-neutral-900">{initiator || '—'}</div>
                <div className="text-xs text-neutral-500">{(data.action || '').toLowerCase() || 'customer'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-neutral-500">Created At</div>
                <div className="mt-1 text-sm text-neutral-900">{initiated || '—'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-neutral-500">Current Actor</div>
                <div className="mt-1 text-sm text-neutral-900">{currentActor || 'Unassigned'}</div>
              </div>
            </div>
          </div>

          {/* Case Entity Details */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <div className="text-sm font-medium text-neutral-500 mb-4">Case Entity Details</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-medium text-neutral-500">Customer</div>
                <div className="mt-1 text-sm text-neutral-900">{initiator || '—'}</div>
                <div className="text-xs text-neutral-500 flex items-center gap-2 mt-1">
                  <span>ID: cust-005</span>
                  <button
                    className="p-1 hover:bg-neutral-100 rounded"
                    title="Copy Customer ID"
                    onClick={() => navigator.clipboard?.writeText('cust-005')}
                  >
                    <DocumentDuplicateIcon className="h-4 w-4 text-neutral-500" />
                  </button>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-neutral-500">Order</div>
                <div className="mt-1 text-sm text-neutral-900">{orderId || '—'}</div>
                <div className="text-xs text-neutral-500 flex items-center gap-2 mt-1">
                  <span>ID: {orderId || '—'}</span>
                  {orderId && (
                    <button
                      className="p-1 hover:bg-neutral-100 rounded"
                      title="Copy Order ID"
                      onClick={() => navigator.clipboard?.writeText(orderId)}
                    >
                      <DocumentDuplicateIcon className="h-4 w-4 text-neutral-500" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <div className="text-sm font-medium text-neutral-500 mb-4">Activity Log</div>
            {(() => {
              const items = (activitiesData || []).filter(a => (a.caseId || '').toLowerCase() === String(caseId).toLowerCase());
              items.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
              if (items.length === 0) {
                return <div className="text-sm text-neutral-600 flex items-center justify-center min-h-24">No activities yet</div>;
              }
              const getIcon = (type) => {
                const t = String(type || '').toLowerCase();
                if (t.includes('assignment')) return UserPlusIcon;
                if (t.includes('contact')) return PhoneIcon;
                if (t.includes('manual')) return ClipboardDocumentListIcon;
                if (t.includes('priority')) return FlagIcon;
                if (t.includes('status')) return ArrowPathIcon;
                return ClipboardDocumentListIcon;
              };
              return (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-neutral-200" aria-hidden="true"></div>
                  <ul className="space-y-6">
                    {items.map((act, idx) => {
                      const Icon = getIcon(act.type);
                      return (
                        <li key={idx} className="relative pl-12">
                          <span className="absolute left-0 inline-flex items-center justify-center h-8 w-8 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-600">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-neutral-900">{act.type}</div>
                            <div className="text-xs text-neutral-500">• {act.actor}</div>
                          </div>
                          <div className="text-xs text-neutral-500 mt-0.5">{new Date(act.timestamp).toLocaleString()}</div>
                          <div className="mt-2 text-sm text-neutral-800 whitespace-pre-wrap">{act.details}</div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Right: Side panels */}
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <div className="text-sm font-medium text-neutral-500 mb-3">Actions</div>
            <div className="flex flex-col gap-2">
              <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm inline-flex items-center justify-center" onClick={() => setShowActivityConfirm(true)}>
                <ClockIcon className="h-4 w-4 mr-2" />
                Add Activity
              </button>
              {source === 'my' ? (
                <>
                  <button className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 text-sm inline-flex items-center justify-center" onClick={() => setShowPriorityConfirm(true)}>
                    <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
                    Change Priority
                  </button>
                  <button className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 text-sm inline-flex items-center justify-center" onClick={() => setShowResolvedConfirm(true)}>
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Mark as Resolved
                  </button>
                </>
              ) : (
                <button className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 text-sm inline-flex items-center justify-center" onClick={() => setShowOwnershipConfirm(true)}>
                  <UserIcon className="h-4 w-4 mr-2" />
                  Take Ownership
                </button>
              )}
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <div className="text-sm font-medium text-neutral-500 mb-3">Case Statistics</div>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div>
                <div className="text-neutral-500">Total Activities</div>
                <div className="text-neutral-900">0</div>
              </div>
              <div>
                <div className="text-neutral-500">Time Since Creation</div>
                <div className="text-xl font-semibold text-neutral-900">15490h</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showOwnershipConfirm && (
        <ConfirmationModal
          isOpen={showOwnershipConfirm}
          title="Take Ownership"
          message="Are you sure you want to take ownership of this case?"
          comment={ownershipComment}
          onCommentChange={setOwnershipComment}
          onConfirm={() => { setShowOwnershipConfirm(false); setOwnershipComment(''); }}
          onCancel={() => { setShowOwnershipConfirm(false); setOwnershipComment(''); }}
          confirmButtonText="Confirm"
          confirmButtonColor="primary"
          isCommentRequired={true}
        />
      )}

      {/* Add Activity Confirmation with Activity Type dropdown */}
      {showActivityConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-neutral-900">Add Activity</h3>
              <button
                onClick={() => { setShowActivityConfirm(false); setActivityType(''); setActivityComment(''); }}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M6.225 4.811a.75.75 0 011.06 0L12 9.525l4.715-4.714a.75.75 0 111.06 1.06L13.06 10.586l4.715 4.714a.75.75 0 11-1.06 1.06L12 11.646l-4.715 4.714a.75.75 0 11-1.06-1.06l4.714-4.715-4.714-4.714a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-neutral-700 mb-3">Select the activity type and add a comment for the activity.</p>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Activity Type <span className="text-red-500">*</span></label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-lg mb-3"
              >
                <option value="">Select type</option>
                <option value="Contacted customer">Contacted customer</option>
                <option value="contacted kitchen">contacted kitchen</option>
                <option value="manual note">manual note</option>
                <option value="contacted finance">contacted finance</option>
                <option value="contacted technical team">contacted technical team</option>
              </select>

              <label className="block text-sm font-medium text-neutral-700 mb-1">Comment <span className="text-red-500">*</span></label>
              <textarea
                value={activityComment}
                onChange={(e) => setActivityComment(e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-lg"
                placeholder="Please provide details for this activity..."
                rows={3}
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => { setShowActivityConfirm(false); setActivityType(''); setActivityComment(''); }}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => { if (!activityType || !activityComment.trim()) return; setShowActivityConfirm(false); setActivityType(''); setActivityComment(''); }}
                disabled={!activityType || !activityComment.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Priority Confirmation with New Priority dropdown */}
      {showPriorityConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-neutral-900">Change Priority</h3>
              <button
                onClick={() => { setShowPriorityConfirm(false); setPriorityValue(''); setPriorityComment(''); }}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M6.225 4.811a.75.75 0 011.06 0L12 9.525l4.715-4.714a.75.75 0 111.06 1.06L13.06 10.586l4.715 4.714a.75.75 0 11-1.06 1.06L12 11.646l-4.715 4.714a.75.75 0 11-1.06-1.06l4.714-4.715-4.714-4.714a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-neutral-700 mb-3">Select a new priority and add a comment.</p>
              <label className="block text-sm font-medium text-neutral-700 mb-1">New Priority <span className="text-red-500">*</span></label>
              <select
                value={priorityValue}
                onChange={(e) => setPriorityValue(e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-lg mb-3"
              >
                <option value="">Select priority</option>
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </select>

              <label className="block text-sm font-medium text-neutral-700 mb-1">Comment <span className="text-red-500">*</span></label>
              <textarea
                value={priorityComment}
                onChange={(e) => setPriorityComment(e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-lg"
                placeholder="Please provide details for this change..."
                rows={3}
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => { setShowPriorityConfirm(false); setPriorityValue(''); setPriorityComment(''); }}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => { if (!priorityValue || !priorityComment.trim()) return; setShowPriorityConfirm(false); setPriorityValue(''); setPriorityComment(''); }}
                disabled={!priorityValue || !priorityComment.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Resolved Confirmation (shared component with comment only) */}
      {showResolvedConfirm && (
        <ConfirmationModal
          isOpen={showResolvedConfirm}
          title="Mark as Resolved"
          message="Are you sure you want to mark this case as resolved?"
          comment={resolvedComment}
          onCommentChange={setResolvedComment}
          onConfirm={() => { setShowResolvedConfirm(false); setResolvedComment(''); }}
          onCancel={() => { setShowResolvedConfirm(false); setResolvedComment(''); }}
          confirmButtonText="Confirm"
          confirmButtonColor="primary"
          isCommentRequired={true}
        />
      )}
    </div>
  );
};

export default CaseDetailPage;
