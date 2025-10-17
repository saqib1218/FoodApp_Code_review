import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { EXTRA_PERMISSIONS } from '../../contexts/PermissionRegistry';
import { useGetRequestByIdQuery, useApproveRequestMutation } from '../../store/api/modules/kitchens/kitchensApi';
import DialogueBox from '../../components/DialogueBox';

const KitchenRequestDetail = () => {
  const { requestId } = useParams();
  const { hasPermission } = useAuth();

  const canView = hasPermission(EXTRA_PERMISSIONS.REQUEST_DETAIL_VIEW);
  const { data: resp, isLoading, error, refetch } = useGetRequestByIdQuery(requestId, {
    skip: !canView || !requestId,
    refetchOnMountOrArgChange: true,
  });
  const [approveRequest, { isLoading: isApproving }] = useApproveRequestMutation();

  const [dialogueBox, setDialogueBox] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const showDialogue = (type, title, message) => setDialogueBox({ isOpen: true, type, title, message });
  const closeDialogue = () => setDialogueBox({ isOpen: false, type: 'success', title: '', message: '' });

  if (!canView) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Access Denied</h3>
          <p className="text-neutral-500">You don't have permission to view request details.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-neutral-900">Failed to load request</h3>
        <p className="mt-2 text-neutral-600">{error?.data?.message || 'Please try again.'}</p>
        <div className="mt-6">
          <button onClick={() => refetch()} className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm font-medium">Retry</button>
        </div>
      </div>
    );
  }

  const data = resp?.data || resp || {};
  const main = Array.isArray(data.mainRecord) ? data.mainRecord[0] : null;
  const staging = Array.isArray(data.stagingRecord) ? data.stagingRecord[0] : null;

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Link to={-1} className="mr-4 text-neutral-500 hover:text-neutral-700">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h2 className="text-xl font-medium text-neutral-900">Request Detail</h2>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        {/* Comparison section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-neutral-700 mb-3">Main Record</h3>
            <RecordCard rec={main} emptyLabel="No main record" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-neutral-700 mb-3">Staging Record</h3>
            <RecordCard rec={staging} emptyLabel="No staging record" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 text-sm font-medium"
            onClick={() => showDialogue('success', 'Rejected', 'Request has been rejected (demo).')}
          >
            Reject
          </button>
          {hasPermission(EXTRA_PERMISSIONS.REQUEST_APPROVE) && (
            <button
              disabled={isApproving}
              className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              onClick={async () => {
                try {
                  await approveRequest(requestId).unwrap();
                  showDialogue('success', 'Approved', 'Request approved successfully.');
                } catch (err) {
                  const msg = err?.data?.message || 'Failed to approve request.';
                  showDialogue('error', 'Error', msg);
                }
              }}
            >
              {isApproving ? 'Approving...' : 'Approve'}
            </button>
          )}
        </div>

        
      </div>

      <DialogueBox isOpen={dialogueBox.isOpen} onClose={closeDialogue} type={dialogueBox.type} title={dialogueBox.title} message={dialogueBox.message} />
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div>
    <div className="text-sm font-medium text-neutral-500">{label}</div>
    <div className="text-sm text-neutral-900 mt-1">{value ?? '-'}</div>
  </div>
);

export default KitchenRequestDetail;

const RecordCard = ({ rec, emptyLabel }) => {
  if (!rec) return <div className="text-sm text-neutral-500">{emptyLabel}</div>;
  return (
    <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
      {Object.entries(rec).map(([k, v]) => (
        <div key={k} className="flex justify-between py-1 text-sm">
          <span className="text-neutral-500">{k}</span>
          <span className="text-neutral-900 ml-4">{typeof v === 'string' ? v : JSON.stringify(v)}</span>
        </div>
      ))}
    </div>
  );
};
