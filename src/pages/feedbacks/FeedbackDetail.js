import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  XMarkIcon
} from '@heroicons/react/24/outline';
import ConfirmationModal from '../../components/ConfirmationModal';
import DialogueBox from '../../components/DialogueBox';
import { usePermissions } from '../../hooks/usePermissions';
import { useGetFeedbackByIdQuery, useUpdateFeedbackDetailsMutation, useSendFeedbackToKitchenMutation, useRejectFeedbackMutation, useDeleteFeedbackMediaMutation } from '../../store/api/modules/feedback/feedbackApi';

const FeedbackDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [editComment, setEditComment] = useState('');
  const [rejectComment, setRejectComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [updateComment, setUpdateComment] = useState('');
  const [sendToKitchenComment, setSendToKitchenComment] = useState('');
  const [editMediaFiles, setEditMediaFiles] = useState([]);
  const [dialogueBox, setDialogueBox] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const showDialogue = (type, title, message) => setDialogueBox({ isOpen: true, type, title, message });
  const closeDialogue = () => setDialogueBox({ isOpen: false, type: 'success', title: '', message: '' });

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
    setShowRejectConfirmModal(true);
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
    setShowSendToKitchenModal(true);
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
    setShowOrderSummaryModal(true);
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
      await refetch();
    } catch (e) {}
    const latest = detailResp?.data || feedback;
    setEditComment(latest?.customerFinalComments || '');
    setEditMediaFiles(Array.isArray(latest?.media) ? [...latest.media] : []);
    setShowEditModal(true);
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

  const handleSaveEdit = () => {
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
    const s = String(statusRaw || '').toLowerCase();
    if (s === 'pending_at_kitchen') return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">PENDING_AT_KITCHEN</span>;
    if (['pending','initiated'].includes(s)) return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">Pending</span>;
    if (['approved','resolved','completed','done'].includes(s)) return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Resolved</span>;
    if (['rejected','closed'].includes(s)) return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">Rejected</span>;
    if (['in_progress','in progress','processing'].includes(s)) return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">In Progress</span>;
    return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">{statusRaw || 'Unknown'}</span>;
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
        {/* Header Section */}
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Feedback Details</h1>
              <div className="flex justify-start">
            {getStatusBadge(feedback.status)}
          </div>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Submitted on {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            {canEditFeedback && (
              <div>
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>


        {/* Customer Information */}
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Customer Information
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="text-sm text-gray-900">{feedback.customerName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900">{feedback.customerEmail}</dd>
                </div>
                <div>
                    <dt className="text-sm font-medium text-gray-500 inline">Mobile Number</dt>
                    <dd className="text-sm text-gray-900 ">{feedback.customerPhone}</dd>
                  </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Customer ID</dt>
                  <dd className="text-sm text-gray-900">
                    <Link 
                      to={`/customers/${feedback.customerId}`}
                      className="text-primary-600 hover:text-primary-800 hover:underline"
                    >
                      {feedback.customerId}
                    </Link>
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
                  Show Summary
                </button>
              </div>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Kitchen</dt>
                  <dd className="text-sm text-gray-900">{feedback.kitchenName}</dd>
                  <dd className="text-xs text-gray-400">ID: {feedback.kitchenId}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Dish</dt>
                  <dd className="text-sm text-gray-900">{feedback.dishName}</dd>
                  <dd className="text-xs text-gray-400">ID: {feedback.dishId}</dd>
                </div>
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
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-8 w-8 ${
                    i < feedback.rating 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-2xl font-bold text-gray-900">{feedback.rating}/5</span>
            <span className="text-sm text-gray-500">
              ({feedback.rating === 5 ? 'Excellent' : 
                feedback.rating === 4 ? 'Good' : 
                feedback.rating === 3 ? 'Average' : 
                feedback.rating === 2 ? 'Poor' : 'Very Poor'})
            </span>
          </div>
        </div>

        {/* Feedback Content */}
        <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Feedback</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{feedback.customerFinalComments || '—'}</p>
          </div>
          
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
            {canRejectFeedback && (
              <button
                onClick={handleReject}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {isRejecting ? 'Rejecting...' : 'Reject'}
              </button>
            )}
            {canSendToKitchen && (
              <button
                onClick={handleSendToKitchen}
                disabled={String(feedback.status || '').toUpperCase() === 'PENDING_AT_KITCHEN'}
                aria-disabled={String(feedback.status || '').toUpperCase() === 'PENDING_AT_KITCHEN'}
                className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${String(feedback.status || '').toUpperCase() === 'PENDING_AT_KITCHEN' ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'}`}
              >
                {isSending ? 'Sending...' : 'Send to Kitchen'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Edit Feedback Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Feedback</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Form Fields */}
                <div className="space-y-4">
                  {/* Customer Name - Disabled */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={feedback.customerName}
                      disabled
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  {/* Rating - Disabled */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rating
                    </label>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-6 w-6 ${
                            i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-500">({feedback.rating}/5)</span>
                    </div>
                  </div>

                  {/* Kitchen Name - Disabled */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kitchen
                    </label>
                    <input
                      type="text"
                      value={feedback.kitchenName}
                      disabled
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  {/* Dish Name - Disabled */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dish
                    </label>
                    <input
                      type="text"
                      value={feedback.dishName}
                      disabled
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  {/* Comments - Editable */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Comments
                    </label>
                    <textarea
                      rows={4}
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter customer feedback comments..."
                    />
                  </div>
                </div>

                {/* Right Column - Media Files */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Media Files
                  </label>
                  {editMediaFiles && editMediaFiles.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {editMediaFiles.map((m) => (
                        <div key={m.id} className="relative group">
                          <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                            <img
                              src={m.processedUrl}
                              alt={m.caption || 'media'}
                              className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                            />
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <p className="text-xs text-gray-600 truncate">{m.caption || '—'}</p>
                            {canDeleteMedia && (
                              <button
                                type="button"
                                onClick={() => handleDeleteMediaApi(m.id)}
                                className="text-red-600 hover:text-red-700"
                                title="Delete media"
                                disabled={deletingMediaId === m.id}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No media uploaded.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditComment('');
                    setEditMediaFiles([]);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
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
