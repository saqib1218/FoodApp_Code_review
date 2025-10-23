import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetRequestByIdQuery, useApproveRequestMutation } from '../../../store/api/modules/requests/requestApi';
import { usePermissions } from '../../../hooks/usePermissions';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../../../components/ConfirmationModal';
import DialogueBox from '../../../components/DialogueBox';

const Field = ({ label, children }) => (
  <div>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 break-words">{children ?? '—'}</dd>
  </div>
);

const RequestDetail = () => {
  const { id } = useParams();
  const { hasPermission } = usePermissions();
  const canViewRequestDetail = hasPermission('admin.request.detail.view');
  const canApproveRequest = hasPermission('admin.request.approve');
  const { data, isLoading, isError, refetch } = useGetRequestByIdQuery(id, { skip: !canViewRequestDetail });
  const [activeTab, setActiveTab] = useState('main'); // 'main' | 'staging'
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approveComment, setApproveComment] = useState('');
  const [rejectComment, setRejectComment] = useState('');
  const [approveRequest, { isLoading: isApproving }] = useApproveRequestMutation();
  const [dialogueBox, setDialogueBox] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const showDialogue = (type, title, message) => setDialogueBox({ isOpen: true, type, title, message });
  const closeDialogue = () => setDialogueBox({ isOpen: false, type: 'success', title: '', message: '' });

  if (!canViewRequestDetail) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Access Denied</h3>
          <p className="text-neutral-500">You don't have permission to view this request detail.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-neutral-600">Loading request detail...</p>
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Error Loading Request</h3>
          <p className="text-neutral-500 mb-4">Failed to load request detail. Please try again.</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">Retry</button>
        </div>
      </div>
    );
  }

  const req = data.data;
  const isApproved = String(req?.status || '').toLowerCase() === 'approved';
  const main = Array.isArray(req.mainRecord) ? req.mainRecord[0] : null;
  const staging = Array.isArray(req.stagingRecord) ? req.stagingRecord[0] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Request Detail</h1>
          <p className="mt-1 text-sm text-neutral-600">Review the change request and take action.</p>
        </div>
        <Link to="/requests" className="inline-flex items-center text-primary-600 hover:text-primary-700">
          <ArrowLeftIcon className="h-5 w-5 mr-1" /> Back to Requests
        </Link>
      </div>

      <div className="bg-white shadow sm:rounded-lg border border-neutral-200">
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Field label="Requested By">{req.requestedBy}</Field>
            <Field label="Role">{req.requestedByRole}</Field>
            <Field label="Workflow">{req.workflowId}</Field>
            <Field label="Entity">{req.entityName}</Field>
            <Field label="Entity ID">{req.entityId}</Field>
            <Field label="Sub-Entity">{req.subEntityName}</Field>
            <Field label="Sub-Entity ID">{req.subEntityId}</Field>
            <Field label="Action">{req.action}</Field>
            <Field label="Status">{req.status}</Field>
            <Field label="Reviewed By">{req.reviewedBy}</Field>
            <Field label="Reviewed At">{req.reviewedAt}</Field>
            <Field label="Created At">{req.createdAt}</Field>
            <Field label="Updated At">{req.updatedAt}</Field>
          </dl>
        </div>
        {/* Records side-by-side */}
        <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-md font-medium text-gray-900">Main Record</h3>
              </div>
              <div className="p-4">
                {main ? (
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(main).map(([k, v]) => (
                      <Field key={k} label={k}>{String(v)}</Field>
                    ))}
                  </dl>
                ) : (
                  <p className="text-sm text-gray-500">No main record available.</p>
                )}
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-md font-medium text-gray-900">Staging Record</h3>
              </div>
              <div className="p-4">
                {staging ? (
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(staging).map(([k, v]) => (
                      <Field key={k} label={k}>{String(v)}</Field>
                    ))}
                  </dl>
                ) : (
                  <p className="text-sm text-gray-500">No staging record available.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          {canApproveRequest && !isApproved && (
            <button
              onClick={() => setShowApproveModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={isApproving}
            >
              {isApproving ? 'Approving...' : 'Approve'}
            </button>
          )}
          <button
            onClick={() => setShowRejectModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            Reject
          </button>
        </div>
      </div>

      {/* Approve Confirmation Modal */}
      <ConfirmationModal
        isOpen={showApproveModal}
        title="Approve Request"
        message={`Are you sure you want to approve this request (${req.id})?`}
        comment={approveComment}
        onCommentChange={setApproveComment}
        onConfirm={async () => {
          try {
            const approveId = String(id || '');
            await approveRequest(approveId).unwrap();
            showDialogue('success', 'Request Approved', 'The request has been approved successfully.');
            setShowApproveModal(false);
            setApproveComment('');
            refetch();
          } catch (e) {
            const msg = e?.data?.message || 'Failed to approve request. Please try again.';
            showDialogue('error', 'Approve Failed', msg);
          }
        }}
        onCancel={() => { setShowApproveModal(false); }}
        confirmButtonText="Approve"
        confirmButtonColor="primary"
        isCommentRequired={true}
      />

      {/* Reject Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRejectModal}
        title="Reject Request"
        message={`Please provide a reason to reject this request (${req.id}).`}
        comment={rejectComment}
        onCommentChange={setRejectComment}
        onConfirm={() => { setShowRejectModal(false); setRejectComment(''); }}
        onCancel={() => { setShowRejectModal(false); }}
        confirmButtonText="Reject"
        confirmButtonColor="danger"
        isCommentRequired={true}
      />

      {/* DialogueBox for API feedback */}
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

export default RequestDetail;
