/**
 * Discounts API Endpoints
 * Discount and promotion management
 */

import { apiSlice } from '../../index';

export const discountsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Discount Management
    getDiscounts: builder.query({
      query: (params = {}) => ({
        url: '/admin/discounts',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search,
          status: params.status,
          type: params.type,
          kitchenId: params.kitchenId,
          dateFrom: params.dateFrom,
          dateTo: params.dateTo
        }
      }),
      providesTags: ['Discount'],
    }),
    
    getDiscountById: builder.query({
      query: (discountId) => `/admin/discounts/${discountId}`,
      providesTags: (result, error, arg) => [{ type: 'Discount', id: arg }],
    }),
    
    createDiscount: builder.mutation({
      query: (discountData) => ({
        url: '/admin/discounts',
        method: 'POST',
        body: discountData,
      }),
      invalidatesTags: ['Discount'],
    }),
    
    updateDiscount: builder.mutation({
      query: ({ id, ...discountData }) => ({
        url: `/admin/discounts/${id}`,
        method: 'PUT',
        body: discountData,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Discount', id: arg.id }],
    }),
    
    deleteDiscount: builder.mutation({
      query: (discountId) => ({
        url: `/admin/discounts/${discountId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Discount'],
    }),
    
    activateDiscount: builder.mutation({
      query: (discountId) => ({
        url: `/admin/discounts/${discountId}/activate`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Discount', id: arg }],
    }),
    
    deactivateDiscount: builder.mutation({
      query: (discountId) => ({
        url: `/admin/discounts/${discountId}/deactivate`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Discount', id: arg }],
    }),
    
    // Discount Analytics
    getDiscountStats: builder.query({
      query: (params = {}) => ({
        url: '/admin/discounts/stats',
        params: {
          period: params.period || 'month',
          discountId: params.discountId,
          dateFrom: params.dateFrom,
          dateTo: params.dateTo
        }
      }),
      providesTags: ['Discount'],
    }),
    
    getDiscountUsage: builder.query({
      query: ({ discountId, ...params }) => ({
        url: `/admin/discounts/${discountId}/usage`,
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          dateFrom: params.dateFrom,
          dateTo: params.dateTo
        }
      }),
      providesTags: (result, error, arg) => [{ type: 'Discount', id: arg.discountId }],
    }),

    // Promotions
    getPromotions: builder.query({
      query: (params = {}) => ({
        url: '/admin/promotions/list',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          search: params.search,
        },
      }),
      providesTags: ['Promotion'],
    }),

    createPromotion: builder.mutation({
      query: (promotionData) => ({
        url: '/admin/promotions/create',
        method: 'POST',
        body: promotionData,
      }),
      invalidatesTags: ['Promotion'],
    }),

    getPromotionById: builder.query({
      query: (id) => `/admin/promotions/${id}`,
      providesTags: (result, error, arg) => [{ type: 'Promotion', id: arg }],
    }),

    updatePromotion: builder.mutation({
      query: ({ id, ...promotionData }) => ({
        url: `/admin/promotions/${id}`,
        method: 'PATCH',
        body: promotionData,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Promotion', id: arg.id },
        'Promotion',
      ],
    }),

    // Promotion Eligibility
    getPromotionEligibility: builder.query({
      query: (id) => `/admin/promotions/${id}/eligibility`,
      providesTags: (result, error, arg) => [{ type: 'PromotionEligibility', id: arg }],
    }),

    createPromotionEligibility: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/promotions/${id}/eligibility/create`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'PromotionEligibility', id: arg.id },
      ],
    }),

    getPromotionEligibilityById: builder.query({
      query: ({ id, eligibilityId }) => `/admin/promotions/${id}/eligibility/${eligibilityId}`,
      providesTags: (result, error, arg) => [{ type: 'PromotionEligibility', id: `${arg.id}-${arg.eligibilityId}` }],
    }),

    updatePromotionEligibility: builder.mutation({
      query: ({ id, eligibilityId, body }) => ({
        url: `/admin/promotions/${id}/eligibility/${eligibilityId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'PromotionEligibility', id: arg.id },
        { type: 'PromotionEligibility', id: `${arg.id}-${arg.eligibilityId}` },
      ],
    }),

    // Audience Rules
    getPromotionAudienceList: builder.query({
      query: (id) => `/admin/promotions/${id}/audience/list`,
      providesTags: (result, error, arg) => [{ type: 'PromotionAudience', id: arg }],
    }),

    createPromotionAudience: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/promotions/${id}/audience/create`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'PromotionAudience', id: arg.id },
      ],
    }),

    getPromotionAudienceById: builder.query({
      query: ({ id, audienceRuleId }) => `/admin/promotions/${id}/audience/${audienceRuleId}`,
      providesTags: (result, error, arg) => [{ type: 'PromotionAudience', id: `${arg.id}-${arg.audienceRuleId}` }],
    }),

    updatePromotionAudience: builder.mutation({
      query: ({ id, audienceRuleId, body }) => ({
        url: `/admin/promotions/${id}/audience/${audienceRuleId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'PromotionAudience', id: arg.id },
        { type: 'PromotionAudience', id: `${arg.id}-${arg.audienceRuleId}` },
      ],
    }),

    // Promo Codes
    getPromotionCodesList: builder.query({
      query: (id) => `/admin/promotions/${id}/codes`,
      providesTags: (result, error, arg) => [{ type: 'PromotionCodes', id: arg }],
    }),

    createPromotionCode: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/promotions/${id}/codes/create`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'PromotionCodes', id: arg.id },
      ],
    }),

    getPromotionCodeById: builder.query({
      query: ({ id, codeId }) => `/admin/promotions/${id}/codes/${codeId}`,
      providesTags: (result, error, arg) => [{ type: 'PromotionCodes', id: `${arg.id}-${arg.codeId}` }],
    }),

    updatePromotionCode: builder.mutation({
      query: ({ id, codeId, body }) => ({
        url: `/admin/promotions/${id}/codes/${codeId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'PromotionCodes', id: arg.id },
        { type: 'PromotionCodes', id: `${arg.id}-${arg.codeId}` },
      ],
    }),

    // Promotion Targets
    updatePromotionTargets: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/promotions/${id}/targets`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'PromotionTargets', id: arg.id },
      ],
    }),
  }),
});

// Export hooks
export const {
  useGetDiscountsQuery,
  useGetDiscountByIdQuery,
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
  useActivateDiscountMutation,
  useDeactivateDiscountMutation,
  useGetDiscountStatsQuery,
  useGetDiscountUsageQuery,
  useGetPromotionsQuery,
  useCreatePromotionMutation,
  useGetPromotionByIdQuery,
  useLazyGetPromotionByIdQuery,
  useUpdatePromotionMutation,
  useGetPromotionEligibilityQuery,
  useCreatePromotionEligibilityMutation,
  useGetPromotionEligibilityByIdQuery,
  useLazyGetPromotionEligibilityByIdQuery,
  useUpdatePromotionEligibilityMutation,
  useGetPromotionAudienceListQuery,
  useCreatePromotionAudienceMutation,
  useGetPromotionAudienceByIdQuery,
  useLazyGetPromotionAudienceByIdQuery,
  useUpdatePromotionAudienceMutation,
  useGetPromotionCodesListQuery,
  useCreatePromotionCodeMutation,
  useGetPromotionCodeByIdQuery,
  useLazyGetPromotionCodeByIdQuery,
  useUpdatePromotionCodeMutation,
  useUpdatePromotionTargetsMutation,
} = discountsApi;
