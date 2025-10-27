import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  UserIcon,
  PhoneIcon,
  BuildingStorefrontIcon,
  ClockIcon,
  StarIcon,
  PencilIcon,
  PhotoIcon,
  PlayIcon,
  TrashIcon,
  XMarkIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import ConfirmationModal from '../../components/ConfirmationModal';
import DialogueBox from '../../components/DialogueBox';
import { usePermissions } from '../../hooks/usePermissions';
import { useGetFeedbackByIdQuery, useUpdateFeedbackDetailsMutation, useSendFeedbackToKitchenMutation, useRejectFeedbackMutation, useDeleteFeedbackMediaMutation } from '../../store/api/modules/feedback/feedbackApi';

const FeedbackDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = usePermissions();
  const canEditFeedback = hasPermission('admin.feedback.edit');
  const canSendToKitchen = hasPermission('admin.feedback.send.to.kitchen');
  const canRejectFeedback = hasPermission('admin.feedback.reject');
  const canDeleteMedia = hasPermission('admin.feedback.media.delete');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUpdateConfirmModal, setShowUpdateConfirmModal] = useState(false);
  const [showRejectConfirmModal, setShowRejectConfirmModal] = useState(false);
  const [showSendToKitchenModal, setShowSendToKitchenModal] = useState(false);
  const [showOrderSummaryModal, setShowOrderSummaryModal] = useState(false);
  const [showDeleteMediaModal, setShowDeleteMediaModal] = useState(false);
  // Opening (pre-modal) loading states
  const [isOpeningEdit, setIsOpeningEdit] = useState(false);
  const [isOpeningReject, setIsOpeningReject] = useState(false);
  const [isOpeningSendToKitchen, setIsOpeningSendToKitchen] = useState(false);
  const [isOpeningOrderSummary, setIsOpeningOrderSummary] = useState(false);
  const [editComment, setEditComment] = useState('');
  const [rejectComment, setRejectComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [updateComment, setUpdateComment] = useState('');
  const [sendToKitchenComment, setSendToKitchenComment] = useState('');
  const [editMediaFiles, setEditMediaFiles] = useState([]);
  const [deleteMediaComment, setDeleteMediaComment] = useState('');
  const [selectedMediaId, setSelectedMediaId] = useState(null);
  const [dialogueBox, setDialogueBox] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const showDialogue = (type, title, message) => setDialogueBox({ isOpen: true, type, title, message });
  const closeDialogue = () => setDialogueBox({ isOpen: false, type: 'success', title: '', message: '' });

  // Copy helper
  const handleCopy = async (text, label = 'Value') => {
    try {
      await navigator.clipboard.writeText(String(text ?? ''));
      showDialogue('success', 'Copied', `${label} copied to clipboard`);
    } catch (e) {
      showDialogue('error', 'Copy Failed', `Could not copy ${label}.`);
    }
  };

  

  // Rejection reasons options
  const rejectionReasons = [
    'Inappropriate Content',
    'Spam or Fake Review',
    'Offensive Language',
    'Irrelevant Feedback',
    'Duplicate Submission',
    'Violation of Guidelines',
    'Other'
  ];

  // Fetch feedback detail from API
  const { data: detailResp, isLoading, isError, refetch } = useGetFeedbackByIdQuery(id);
  const [updateFeedbackDetails, { isLoading: isUpdating }] = useUpdateFeedbackDetailsMutation();
  const [sendFeedbackToKitchen, { isLoading: isSending }] = useSendFeedbackToKitchenMutation();
  const [rejectFeedback, { isLoading: isRejecting }] = useRejectFeedbackMutation();
  const [deleteFeedbackMedia, { isLoading: isDeletingMedia }] = useDeleteFeedbackMediaMutation();
  const [deletingMediaId, setDeletingMediaId] = useState(null);
  useEffect(() => {
    if (detailResp && detailResp.data) {
      setFeedback(detailResp.data);
      setLoading(false);
    }
  }, [detailResp]);

  const handleReject = () => {
    setIsOpeningReject(true);
    setShowRejectConfirmModal(true);
    // simulate open complete in next tick
    setTimeout(() => setIsOpeningReject(false), 0);
  };

  const confirmReject = async () => {
    try {
      await rejectFeedback({ id, rejectedReason: rejectReason, adminComments: rejectComment }).unwrap();
      setFeedback({ ...feedback, status: 'REJECTED', rejectedReason: rejectReason, adminComments: rejectComment });
      setShowRejectConfirmModal(false);
      setRejectReason('');
      setRejectComment('');
      showDialogue('success', 'Feedback Rejected', 'The feedback has been rejected successfully.');
    } catch (e) {
      const msg = e?.data?.message || 'Failed to reject feedback. Please try again.';
      showDialogue('error', 'Reject Failed', msg);
    }
  };

  const handleCancelReject = () => {
    setShowRejectConfirmModal(false);
    setRejectReason('');
    setRejectComment('');
  };

  const handleSendToKitchen = () => {
    // Prefill send-to-kitchen comment with existing admin comment if available
    setSendToKitchenComment(feedback?.adminComments || '');
    setIsOpeningSendToKitchen(true);
    setShowSendToKitchenModal(true);
    setTimeout(() => setIsOpeningSendToKitchen(false), 0);
  };

  const confirmSendToKitchen = async () => {
    try {
      await sendFeedbackToKitchen({ id, adminComments: sendToKitchenComment }).unwrap();
      // Optimistically update status to PENDING_AT_KITCHEN
      setFeedback({ ...feedback, status: 'PENDING_AT_KITCHEN', adminComments: sendToKitchenComment });
      setShowSendToKitchenModal(false);
      setSendToKitchenComment('');
      showDialogue('success', 'Sent to Kitchen', 'Feedback has been sent to the kitchen successfully.');
    } catch (e) {
      const msg = e?.data?.message || 'Failed to send to kitchen. Please try again.';
      showDialogue('error', 'Send Failed', msg);
    }
  };

  const handleCancelSendToKitchen = () => {
    setShowSendToKitchenModal(false);
    setSendToKitchenComment('');
  };

  const handleShowOrderSummary = () => {
    setIsOpeningOrderSummary(true);
    setShowOrderSummaryModal(true);
    setTimeout(() => setIsOpeningOrderSummary(false), 0);
  };

  const handleCloseOrderSummary = () => {
    setShowOrderSummaryModal(false);
  };

  const handleCancel = () => {
    navigate('/feedback');
  };

  const handleEdit = async () => {
    // Refetch latest detail before opening edit
    try {
      setIsOpeningEdit(true);
      await refetch();
    } catch (e) {}
    const latest = detailResp?.data || feedback;
    setEditComment(latest?.customerFinalComments || '');
    setEditMediaFiles(Array.isArray(latest?.media) ? [...latest.media] : []);
    setShowEditModal(true);
    setIsOpeningEdit(false);
  };

  const handleDeleteMedia = (mediaId) => {
    // Deprecated local only delete; handled by API below
    setEditMediaFiles(editMediaFiles.filter(media => media.id !== mediaId));
  };

  const handleDeleteMediaApi = async (mediaId) => {
    try {
      setDeletingMediaId(mediaId);
      await deleteFeedbackMedia({ id, mediaId }).unwrap();
      // Remove from local edit state and main feedback media
      setEditMediaFiles((prev) => prev.filter((m) => m.id !== mediaId));
      setFeedback((prev) => ({ ...prev, media: Array.isArray(prev?.media) ? prev.media.filter((m) => m.id !== mediaId) : prev?.media }));
      showDialogue('success', 'Media Deleted', 'The media item has been deleted successfully.');
    } catch (e) {
      const msg = e?.data?.message || 'Failed to delete media. Please try again.';
      showDialogue('error', 'Delete Failed', msg);
    } finally {
      setDeletingMediaId(null);
    }
  };

  const openDeleteMediaModal = (mediaId) => {
    setSelectedMediaId(mediaId);
    setDeleteMediaComment(feedback?.adminComments || '');
    setShowDeleteMediaModal(true);
  };

  const handleCancelDeleteMedia = () => {
    setShowDeleteMediaModal(false);
    setDeleteMediaComment('');
    setSelectedMediaId(null);
  };

  const confirmDeleteMediaWithComment = async () => {
    if (!selectedMediaId) return;
    try {
      setDeletingMediaId(selectedMediaId);
      // 1) Delete media
      await deleteFeedbackMedia({ id, mediaId: selectedMediaId }).unwrap();
      // 2) Update admin comment with the entered comment
      if (deleteMediaComment !== (feedback?.adminComments || '')) {
        try {
          await updateFeedbackDetails({ id, adminComments: deleteMediaComment }).unwrap();
          setFeedback((prev) => ({ ...prev, adminComments: deleteMediaComment }));
        } catch (e) {
          // If comment update fails, still continue, but notify
          const msg = e?.data?.message || 'Media deleted but failed to update admin comment.';
          showDialogue('error', 'Partial Success', msg);
        }
      }
      // Remove media from local state
      setEditMediaFiles((prev) => prev.filter((m) => m.id !== selectedMediaId));
      setFeedback((prev) => ({ ...prev, media: Array.isArray(prev?.media) ? prev.media.filter((m) => m.id !== selectedMediaId) : prev?.media }));
      showDialogue('success', 'Media Deleted', 'The media item has been deleted successfully.');
      setShowDeleteMediaModal(false);
      setDeleteMediaComment('');
      setSelectedMediaId(null);
    } catch (e) {
      const msg = e?.data?.message || 'Failed to delete media. Please try again.';
      showDialogue('error', 'Delete Failed', msg);
    } finally {
      setDeletingMediaId(null);
    }
  };

  const handleSaveEdit = () => {
    // Prefill update confirmation comment with existing admin comment if available
    setUpdateComment(feedback?.adminComments || '');
    setShowUpdateConfirmModal(true);
  };

  const confirmUpdate = async () => {
    try {
      await updateFeedbackDetails({ id, customerFinalComments: editComment, adminComments: updateComment }).unwrap();
      // Optimistically update local state
      setFeedback({ ...feedback, customerFinalComments: editComment, adminComments: updateComment });
      setShowEditModal(false);
      setShowUpdateConfirmModal(false);
      setEditComment('');
      setUpdateComment('');
      setEditMediaFiles([]);
      showDialogue('success', 'Feedback Updated', 'Customer comments have been updated successfully.');
    } catch (e) {
      const msg = e?.data?.message || 'Failed to update feedback. Please try again.';
      showDialogue('error', 'Update Failed', msg);
    }
  };

  const getStatusBadge = (statusRaw) => {
    const sUpper = String(statusRaw || '').toUpperCase();
    // Keep colors but show the EXACT API status text
    if (sUpper === 'PENDING_AT_KITCHEN') return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">{statusRaw}</span>;
    if (sUpper === 'INITIATED' || sUpper === 'PENDING') return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">{statusRaw}</span>;
    if (['APPROVED','RESOLVED','COMPLETED','DONE'].includes(sUpper)) return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">{statusRaw}</span>;
    if (['REJECTED','CLOSED'].includes(sUpper)) return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">{statusRaw}</span>;
    if (['IN_PROGRESS','IN PROGRESS','PROCESSING'].includes(sUpper)) return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">{statusRaw}</span>;
    return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">{statusRaw || 'UNKNOWN'}</span>;
  };

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isError || !feedback) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-medium text-gray-900">Feedback not found</h3>
        <p className="mt-1 text-sm text-gray-500">Failed to load feedback or it doesn't exist.</p>
        <div className="mt-6">
          <Link
            to="/feedback"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Back to Feedbacks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {(() => {
        // Compute status flags for UI behavior
        const statusUpper = String(feedback?.status || '').toUpperCase();
        // Externally-controlled read-only statuses
        // PENDING_AT_KITCHEN, REJECTED, APPROVED -> disable edit and hide delete icons
        // We attach to window object for use in JSX below via closures if needed
        // but primarily keep scoped in this IIFE. We'll also re-compute where necessary.
        return null;
      })()}
      {/* Header */}
      <div className="mb-8">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <div>
                <Link to="/feedback" className="text-gray-400 hover:text-gray-500">
                  <ArrowLeftIcon className="flex-shrink-0 h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">Back</span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="text-gray-400">/</span>
                <Link to="/feedback" className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                  Feedbacks
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="text-gray-400">/</span>
                <span className="ml-4 text-sm font-medium text-gray-900">Feedback #{feedback.id}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Main Content */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {/* Header Section removed per request */}
        <div className="px-4 sm:px-6 border-b border-gray-200 hidden" />

        {/* Feedback Details Card */}
        <div className="px-4 py-5 sm:p-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Feedback Details</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Feedback ID</dt>
                <dd className="text-sm text-gray-900 flex items-center space-x-2">
                  <span>{feedback.id || '—'}</span>
                  {feedback.id && (
                    <button
                      type="button"
                      onClick={() => handleCopy(feedback.id, 'Feedback ID')}
                      className="text-gray-500 hover:text-gray-700"
                      title="Copy Feedback ID"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    </button>
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Feedback Reference Number</dt>
                <dd className="text-sm text-gray-900">{feedback.feedbackBusinessRef || '—'}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="text-sm text-gray-900">{getStatusBadge(feedback.status)}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Feedback Type</dt>
                <dd className="text-sm text-gray-900">{feedback.feedbackType || '—'}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Media Uploaded</dt>
                <dd className="text-sm text-gray-900">{feedback.isMediaUploaded ? 'yes' : 'No'}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Planned Publish Date</dt>
                <dd className="text-sm text-gray-900">{feedback.toBePublishedDate ? new Date(feedback.toBePublishedDate).toLocaleString() : '—'}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Published Date</dt>
                <dd className="text-sm text-gray-900">{feedback.publishedDate ? new Date(feedback.publishedDate).toLocaleString() : '—'}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Edited by team</dt>
                <dd className="text-sm text-gray-900">{feedback.isEditedByAdmin ? 'yes' : 'No'}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Feedback Badge</dt>
                <dd className="text-sm text-gray-900">{feedback.feedbackBadge || '—'}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Feedback Initiated Date</dt>
                <dd className="text-sm text-gray-900">{feedback.createdAt ? new Date(feedback.createdAt).toLocaleString() : '—'}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Feedback Last Activity Date</dt>
                <dd className="text-sm text-gray-900">{feedback.updatedAt ? new Date(feedback.updatedAt).toLocaleString() : '—'}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Sent to Kitchen Date</dt>
                <dd className="text-sm text-gray-900">{feedback.sentToKitchenDate ? new Date(feedback.sentToKitchenDate).toLocaleString() : '—'}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Kitchen Responded Date</dt>
                <dd className="text-sm text-gray-900">{feedback.kitchenRespondedDate ? new Date(feedback.kitchenRespondedDate).toLocaleString() : '—'}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Kitchen Extension Requested Date</dt>
                <dd className="text-sm text-gray-900">{feedback.extensionRequestDate ? new Date(feedback.extensionRequestDate).toLocaleString() : '—'}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Kitchen Extension Requested Count</dt>
                <dd className="text-sm text-gray-900">{typeof feedback.extensionRequestCount === 'number' ? feedback.extensionRequestCount : '—'}</dd>
              </div>
            </dl>
          </div>
        </div>


        {/* Customer Information */}
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Customer Information
                </h3>
                <button
                  onClick={() => navigate(`/customers/${feedback.customerId}`, { state: { from: location } })}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Show Details
                </button>
              </div>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="text-sm text-gray-900 flex items-center space-x-2">
                    <span>{feedback.customerName}</span>
                    {feedback.customerName && (
                      <button
                        type="button"
                        onClick={() => handleCopy(feedback.customerName, 'Customer Name')}
                        className="text-gray-500 hover:text-gray-700"
                        title="Copy Customer Name"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Customer ID</dt>
                  <dd className="text-sm text-gray-900 flex items-center space-x-2">
                    <Link 
                      to={`/customers/${feedback.customerId}`}
                      state={{ from: location }}
                      className="text-primary-600 hover:text-primary-800 hover:underline"
                    >
                      {feedback.customerId}
                    </Link>
                    {feedback.customerId && (
                      <button
                        type="button"
                        onClick={() => handleCopy(feedback.customerId, 'Customer ID')}
                        className="text-gray-500 hover:text-gray-700"
                        title="Copy Customer ID"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Kitchen Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
                  Kitchen Information
                </h3>
                {feedback.kitchenId && (
                  <button
                    onClick={() => navigate(`/kitchens/${feedback.kitchenId}`, { state: { from: location } })}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Show Details
                  </button>
                )}
              </div>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Kitchen Name</dt>
                  <dd className="text-sm text-gray-900 flex items-center space-x-2">
                    <span>{feedback.kitchenName || '—'}</span>
                    {feedback.kitchenName && (
                      <button
                        type="button"
                        onClick={() => handleCopy(feedback.kitchenName, 'Kitchen Name')}
                        className="text-gray-500 hover:text-gray-700"
                        title="Copy Kitchen Name"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Kitchen ID</dt>
                  <dd className="text-sm text-gray-900 flex items-center space-x-2">
                    <span>{feedback.kitchenId || '—'}</span>
                    {feedback.kitchenId && (
                      <button
                        type="button"
                        onClick={() => handleCopy(feedback.kitchenId, 'Kitchen ID')}
                        className="text-gray-500 hover:text-gray-700"
                        title="Copy Kitchen ID"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Order Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
                  Order Information
                </h3>
                <button
                  onClick={handleShowOrderSummary}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Show Details
                </button>
              </div>
              <dl className="space-y-3">
                {/* Kitchen and Dish moved/removed per request */}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Order Number</dt>
                  <dd className="text-sm text-gray-900">{feedback.orderNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Order Total</dt>
                  <dd className="text-sm text-gray-900">{feedback.orderTotal}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Rating Section */}
        <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Rating</h3>
          {(() => {
            const numericRating = Number.parseFloat(feedback?.feedbackRating) || 0;
            const rounded = Math.round(numericRating);
            const label = rounded >= 5
              ? 'Excellent'
              : rounded === 4
              ? 'Good'
              : rounded === 3
              ? 'Average'
              : rounded === 2
              ? 'Poor'
              : 'Very Poor';
            return (
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-8 w-8 ${i < Math.round(numericRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-2xl font-bold text-gray-900">{numericRating}/5</span>
                <span className="text-sm text-gray-500">({label})</span>
              </div>
            );
          })()}
        </div>

        {/* Feedback Content */}
        <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              Customer Feedback
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">public</span>
            </h3>
            {canEditFeedback && (() => {
              const statusUpper = String(feedback?.status || '').toUpperCase();
              const isReadOnlyStatus = ['PENDING_AT_KITCHEN','REJECTED','APPROVED'].includes(statusUpper);
              return (
                <button
                  onClick={handleEdit}
                  disabled={isOpeningEdit || isReadOnlyStatus}
                  aria-disabled={isOpeningEdit || isReadOnlyStatus}
                  className={`inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md ${
                    (isOpeningEdit || isReadOnlyStatus)
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      : 'text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                  }`}
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  {isOpeningEdit ? 'Opening...' : 'Edit'}
                </button>
              );
            })()}
          </div>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{feedback.customerFinalComments || '—'}</p>
          </div>
          {/* Admin Feedback (if any) */}
          {feedback?.adminComments ? (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                Admin Feedback
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">internal</span>
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{feedback.adminComments}</p>
              </div>
              {feedback?.rejectedReason ? (
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                    Rejected Reason
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">internal</span>
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{feedback.rejectedReason}</p>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
          {/* Kitchen Feedback (if any) */}
          {feedback?.kitchenComments ? (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Kitchen Feedback</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{feedback.kitchenComments}</p>
              </div>
            </div>
          ) : null}
          
        </div>

        {/* Media (at the end) */}
        {Array.isArray(feedback.media) && feedback.media.length > 0 && (
          <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <PhotoIcon className="h-5 w-5 mr-2" />
              Media
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {feedback.media.map((m) => (
                <div key={m.id} className="relative group">
                  <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={m.processedUrl}
                      alt={m.caption || 'media'}
                      className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                    />
                  </div>
                  {(() => {
                    const statusUpper = String(feedback?.status || '').toUpperCase();
                    const isReadOnlyStatus = ['PENDING_AT_KITCHEN','REJECTED','APPROVED'].includes(statusUpper);
                    return canDeleteMedia && !isReadOnlyStatus ? (
                    <button
                      type="button"
                      onClick={() => openDeleteMediaModal(m.id)}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-600 hover:text-red-700 rounded-full p-1 shadow"
                      title="Delete media"
                      disabled={deletingMediaId === m.id}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                    ) : null;
                  })()}
                  {m.caption && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600">{m.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            {canRejectFeedback && (() => {
              const statusUpper = String(feedback.status || '').toUpperCase();
              const buttonsEnabled = statusUpper === 'INITIATED';
              return (
              <button
                onClick={handleReject}
                disabled={!buttonsEnabled || isOpeningReject}
                aria-disabled={!buttonsEnabled || isOpeningReject}
                className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  !buttonsEnabled || isOpeningReject ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                }`}
              >
                {isOpeningReject ? 'Opening...' : (isRejecting ? 'Rejecting...' : 'Reject')}
              </button>
              );
            })()}
            {canSendToKitchen && (() => {
              const statusUpper = String(feedback.status || '').toUpperCase();
              const buttonsEnabled = statusUpper === 'INITIATED';
              return (
              <button
                onClick={handleSendToKitchen}
                disabled={!buttonsEnabled || isOpeningSendToKitchen}
                aria-disabled={!buttonsEnabled || isOpeningSendToKitchen}
                className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  !buttonsEnabled || isOpeningSendToKitchen ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                }`}
              >
                {isOpeningSendToKitchen ? 'Opening...' : (isSending ? 'Sending...' : 'Send to Kitchen')}
              </button>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Edit Feedback Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Feedback</h3>
              {/* Only Customer Comments editable, but show Customer/Kitchen names as disabled */}
              <div className="space-y-4">
                {/* Customer Name - Disabled */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={feedback.customerName || ''}
                    disabled
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
                {/* Kitchen Name - Disabled */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kitchen Name</label>
                  <input
                    type="text"
                    value={feedback.kitchenName || ''}
                    disabled
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
                {/* Customer Comments - Editable */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Comments</label>
                  <textarea
                    rows={6}
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter customer feedback comments..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditComment('');
                    setEditMediaFiles([]);
                  }}
                  className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Update Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Confirmation Modal */}
      <ConfirmationModal
        isOpen={showUpdateConfirmModal}
        title="Update Feedback Comments"
        message={`Are you sure you want to update the feedback comments for ${feedback?.customerName}?`}
        comment={updateComment}
        onCommentChange={setUpdateComment}
        onConfirm={confirmUpdate}
        onCancel={() => {
          setShowUpdateConfirmModal(false);
          setUpdateComment('');
        }}
        confirmButtonText="Update"
        confirmButtonColor="primary"
        isCommentRequired={true}
      />

      {/* Send to Kitchen Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSendToKitchenModal}
        title="Send Feedback to Kitchen"
        message={`Are you sure you want to send this feedback from ${feedback?.customerName} to the kitchen? The kitchen will be notified about this feedback.`}
        comment={sendToKitchenComment}
        onCommentChange={setSendToKitchenComment}
        onConfirm={confirmSendToKitchen}
        onCancel={handleCancelSendToKitchen}
        confirmButtonText="Send to Kitchen"
        confirmButtonColor="primary"
        isCommentRequired={true}
      />

      {/* Delete Media Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteMediaModal}
        title="Delete Media"
        message="Are you sure you want to delete this media item? This action cannot be undone."
        comment={deleteMediaComment}
        onCommentChange={setDeleteMediaComment}
        onConfirm={confirmDeleteMediaWithComment}
        onCancel={handleCancelDeleteMedia}
        confirmButtonText="Delete"
        confirmButtonColor="primary"
        isCommentRequired={true}
      />

      {/* Custom Rejection Modal with Dropdown */}
      {showRejectConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-neutral-900">
                Reject Feedback
              </h3>
              <button
                onClick={handleCancelReject}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-neutral-700 mb-4">
                Are you sure you want to reject this feedback from {feedback?.customerName}? This action cannot be undone.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select a reason</option>
                  {rejectionReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Additional Comments <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Please provide additional details about the rejection..."
                  rows={3}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelReject}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim() || !rejectComment.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Summary Modal */}
      {showOrderSummaryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-neutral-900">
                Order Summary
              </h3>
              <button
                onClick={handleCloseOrderSummary}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Order Number */}
              <div>
                <dt className="text-sm font-medium text-gray-500">Order Number</dt>
                <dd className="text-sm text-gray-900 font-semibold">{feedback?.orderNumber}</dd>
              </div>

              {/* Kitchen Name */}
              <div>
                <dt className="text-sm font-medium text-gray-500">Kitchen</dt>
                <dd className="text-sm text-gray-900">{feedback?.kitchenName}</dd>
              </div>

              {/* Order Date */}
              <div>
                <dt className="text-sm font-medium text-gray-500">Order Date</dt>
                <dd className="text-sm text-gray-900">
                  {feedback?.orderDate ? new Date(feedback.orderDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'}
                </dd>
              </div>

              {/* Order Items */}
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-2">Dishes Ordered</dt>
                <div className="bg-gray-50 rounded-lg p-3">
                  {feedback?.orderItems && feedback.orderItems.length > 0 ? (
                    <div className="space-y-2">
                      {feedback.orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center">
                          <div>
                            <span className="text-sm text-gray-900">{item.name}</span>
                            <span className="text-xs text-gray-500 ml-2">x{item.quantity}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{item.price}</span>
                        </div>
                      ))}
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-900">Total</span>
                          <span className="text-sm font-bold text-gray-900">{feedback?.orderTotal}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No order items available</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={handleCloseOrderSummary}
                className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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

export default FeedbackDetail;
