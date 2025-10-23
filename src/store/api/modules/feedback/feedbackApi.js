/**
 * Feedback API Endpoints
 * Customer feedback and review management
 */

import { apiSlice } from '../../index';

export const feedbackApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Feedback Management
    getFeedback: builder.query({
      query: (params = {}) => ({
        url: '/admin/feedbacks',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search,
          status: params.status,
          rating: params.rating,
          kitchenId: params.kitchenId,
          customerId: params.customerId,
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
        }
      }),
      providesTags: ['Feedback'],
    }),
    
    getFeedbackById: builder.query({
      query: (feedbackId) => `/admin/feedbacks/${feedbackId}`,
      providesTags: (result, error, arg) => [{ type: 'Feedback', id: arg }],
    }),
    
    updateFeedbackStatus: builder.mutation({
      query: ({ feedbackId, status }) => ({
        url: `/admin/feedback/${feedbackId}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Feedback', id: arg.feedbackId }],
    }),
    
    respondToFeedback: builder.mutation({
      query: ({ feedbackId, response }) => ({
        url: `/admin/feedback/${feedbackId}/respond`,
        method: 'POST',
        body: { response },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Feedback', id: arg.feedbackId }],
    }),
    
    deleteFeedback: builder.mutation({
      query: (feedbackId) => ({
        url: `/admin/feedback/${feedbackId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Feedback'],
    }),
    
    // Feedback Analytics
    getFeedbackAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/admin/feedback/analytics',
        params: {
          period: params.period || 'month',
          kitchenId: params.kitchenId,
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
        }
      }),
      providesTags: ['Feedback'],
    }),
    
    getKitchenFeedback: builder.query({
      query: ({ kitchenId, ...params }) => ({
        url: `/admin/kitchens/${kitchenId}/feedback`,
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          rating: params.rating,
          status: params.status,
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
        }
      }),
      providesTags: (result, error, arg) => [
        { type: 'Feedback', id: `kitchen-${arg.kitchenId}` },
        'Feedback'
      ],
    }),

    // Update feedback details (customerFinalComments, adminComments)
    updateFeedbackDetails: builder.mutation({
      query: ({ id, customerFinalComments, adminComments }) => ({
        url: `/admin/feedbacks/${id}`,
        method: 'PATCH',
        body: { customerFinalComments, adminComments },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Feedback', id: arg.id },
        'Feedback',
      ],
    }),

    // Send feedback to kitchen
    sendFeedbackToKitchen: builder.mutation({
      query: ({ id, adminComments }) => ({
        url: `/admin/feedbacks/${id}/send`,
        method: 'PATCH',
        body: { adminComments },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Feedback', id: arg.id },
        'Feedback',
      ],
    }),

    // Reject feedback
    rejectFeedback: builder.mutation({
      query: ({ id, rejectedReason, adminComments }) => ({
        url: `/admin/feedbacks/${id}/reject`,
        method: 'PATCH',
        body: { rejectedReason, adminComments },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Feedback', id: arg.id },
        'Feedback',
      ],
    }),

    // Delete a media item from feedback
    deleteFeedbackMedia: builder.mutation({
      query: ({ id, mediaId }) => ({
        url: `/admin/feedbacks/${id}/media/${mediaId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Feedback', id: arg.id },
        'Feedback',
      ],
    }),
  }),
});

// Export hooks
export const {
  useGetFeedbackQuery,
  useGetFeedbackByIdQuery,
  useLazyGetFeedbackByIdQuery,
  useUpdateFeedbackDetailsMutation,
  useSendFeedbackToKitchenMutation,
  useRejectFeedbackMutation,
  useDeleteFeedbackMediaMutation,
  useUpdateFeedbackStatusMutation,
  useRespondToFeedbackMutation,
  useDeleteFeedbackMutation,
  useGetFeedbackAnalyticsQuery,
  useGetKitchenFeedbackQuery,
} = feedbackApi;
