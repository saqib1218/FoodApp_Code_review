/**
 * Kitchens API Endpoints
 * Comprehensive kitchen management with all sub-modules
 */

import { apiSlice } from '../../index';

export const kitchensApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Kitchen Management
    getKitchens: builder.query({
      query: (params = {}) => ({
        url: '/admin/kitchens',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search,
          city: params.city,
          cuisine: params.cuisine,
          status: params.status,
          phoneNumber: params.phoneNumber,
          kitchenId: params.kitchenId,
          orderId: params.orderId,
        }
      }),
      providesTags: ['Kitchen'],
    }),
    
    getKitchenById: builder.query({
      query: (kitchenId) => `/admin/kitchens/${kitchenId}`,
      providesTags: (result, error, arg) => [{ type: 'Kitchen', id: arg }],
    }),
    
    getKitchenByPartnerId: builder.query({
      query: (partnerId) => `/admin/partners/${partnerId}/kitchen`,
      providesTags: (result, error, arg) => [{ type: 'Kitchen', id: `partner-${arg}` }],
    }),
    
    createKitchen: builder.mutation({
      query: (kitchenData) => ({
        url: '/admin/kitchens/create',
        method: 'POST',
        body: kitchenData,
      }),
      invalidatesTags: ['Kitchen'],
    }),
    
    updateKitchen: builder.mutation({
      query: ({ id, ...kitchenData }) => ({
        url: `/admin/kitchens/${id}`,
        method: 'PATCH',
        body: kitchenData,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Kitchen', id: arg.id }],
    }),
    
    deleteKitchen: builder.mutation({
      query: (kitchenId) => ({
        url: `/admin/kitchens/${kitchenId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Kitchen'],
    }),
    
    approveKitchen: builder.mutation({
      query: (kitchenId) => ({
        url: `/admin/kitchens/${kitchenId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Kitchen', id: arg }],
    }),
    
    suspendKitchen: builder.mutation({
      query: (kitchenId) => ({
        url: `/admin/kitchens/${kitchenId}/suspend`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Kitchen', id: arg }],
    }),
    
    // Kitchen Filter Options
    getKitchenFilterOptions: builder.query({
      query: () => '/admin/kitchens/filter-options',
      providesTags: ['Kitchen'],
    }),

    // Kitchen Partners
    getKitchenPartners: builder.query({
      query: (kitchenId) => `/admin/kitchens/${kitchenId}/partners`,
      providesTags: (result, error, arg) => [{ type: 'KitchenPartner', id: arg }],
    }),
    
    // Kitchen Users Management
    getKitchenUsers: builder.query({
      query: ({ kitchenId, ...params }) => ({
        url: `/admin/kitchens/${kitchenId}/users`,
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search,
          role: params.role,
        }
      }),
      providesTags: (result, error, arg) => [
        { type: 'KitchenUser', id: arg.kitchenId },
        'KitchenUser'
      ],
    }),
    
    addKitchenUser: builder.mutation({
      query: ({ kitchenId, userData }) => ({
        url: `/admin/kitchens/${kitchenId}/users`,
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'KitchenUser', id: arg.kitchenId },
        'KitchenUser'
      ],
    }),
    
    updateKitchenUser: builder.mutation({
      query: ({ kitchenId, userId, userData }) => ({
        url: `/admin/kitchens/${kitchenId}/users/${userId}`,
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'KitchenUser', id: arg.kitchenId },
        'KitchenUser'
      ],
    }),
    
    removeKitchenUser: builder.mutation({
      query: ({ kitchenId, userId }) => ({
        url: `/admin/kitchens/${kitchenId}/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'KitchenUser', id: arg.kitchenId },
        'KitchenUser'
      ],
    }),
    
    // Kitchen Dishes Management
    getKitchenDishes: builder.query({
      query: ({ kitchenId, ...params }) => ({
        url: `/admin/kitchens/${kitchenId}/dishes`,
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search,
          category: params.category,
          status: params.status,
        }
      }),
      providesTags: (result, error, arg) => [
        { type: 'Dish', id: arg.kitchenId },
        'Dish'
      ],
    }),
    
    getDishById: builder.query({
      query: ({ kitchenId, dishId }) => `/admin/kitchens/${kitchenId}/dishes/${dishId}`,
      providesTags: (result, error, arg) => [{ type: 'Dish', id: arg.dishId }],
    }),
    
    createDish: builder.mutation({
      query: ({ kitchenId, dishData }) => ({
        url: `/admin/kitchens/${kitchenId}/dishes`,
        method: 'POST',
        body: dishData,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Dish', id: arg.kitchenId },
        'Dish'
      ],
    }),
    
    updateDish: builder.mutation({
      query: ({ kitchenId, dishId, dishData }) => ({
        url: `/admin/kitchens/${kitchenId}/dishes/${dishId}`,
        method: 'PUT',
        body: dishData,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Dish', id: arg.dishId },
        'Dish'
      ],
    }),
    
    deleteDish: builder.mutation({
      query: ({ kitchenId, dishId }) => ({
        url: `/admin/kitchens/${kitchenId}/dishes/${dishId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Dish', id: arg.kitchenId },
        'Dish'
      ],
    }),
    
    // Kitchen Media Management
    getKitchenMedia: builder.query({
      query: ({ kitchenId, ...params }) => ({
        url: `/admin/kitchens/${kitchenId}/media`,
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          type: params.type,
        }
      }),
      providesTags: (result, error, arg) => [
        { type: 'KitchenMedia', id: arg.kitchenId },
        'KitchenMedia'
      ],
    }),
    
    // Step 1: Get pre-signed S3 upload URL
    getKitchenMediaUploadUrl: builder.mutation({
      query: ({ kitchenId, mediaType, categoryType }) => ({
        url: `/admin/kitchens/${kitchenId}/media`,
        method: 'POST',
        body: { mediaType, categoryType },
      }),
    }),
    
    // Step 2: Upload file to S3 (external call)
    uploadToS3: builder.mutation({
      queryFn: async ({ uploadUrl, file, onProgress }) => {
        try {
          const response = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type,
            },
          });
          
          if (!response.ok) {
            throw new Error(`S3 upload failed: ${response.statusText}`);
          }
          
          return { data: { success: true, url: uploadUrl.split('?')[0] } };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
    }),
    

    
    deleteKitchenMedia: builder.mutation({
      query: ({ kitchenId, mediaId }) => ({
        url: `/admin/kitchens/${kitchenId}/media/${mediaId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'KitchenMedia', id: arg.kitchenId },
        'KitchenMedia'
      ],
    }),
    
    // Kitchen Addresses Management
    getKitchenAddresses: builder.query({
      query: (kitchenId) => `/admin/kitchens/${kitchenId}/address`,
      providesTags: (result, error, arg) => [
        { type: 'KitchenAddress', id: arg },
        'KitchenAddress'
      ],
    }),
    
    addKitchenAddress: builder.mutation({
      query: ({ kitchenId, addressData }) => ({
        url: `/admin/kitchens/${kitchenId}/address`,
        method: 'POST',
        body: addressData,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'KitchenAddress', id: arg.kitchenId },
        'KitchenAddress'
      ],
    }),
    
    updateKitchenAddress: builder.mutation({
      query: ({ kitchenId, addressId, addressData }) => ({
        url: `/admin/kitchens/${kitchenId}/address/${addressId}`,
        method: 'PATCH',
        body: addressData,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'KitchenAddress', id: arg.kitchenId },
        'KitchenAddress'
      ],
    }),
    
    deleteKitchenAddress: builder.mutation({
      query: ({ kitchenId, addressId }) => ({
        url: `/admin/kitchens/${kitchenId}/addresses/${addressId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'KitchenAddress', id: arg.kitchenId },
        'KitchenAddress'
      ],
    }),
    
    // Kitchen Availability Management
    getKitchenAvailability: builder.query({
      query: (kitchenId) => `/admin/kitchens/${kitchenId}/availability`,
      providesTags: (result, error, arg) => [
        { type: 'KitchenAvailability', id: arg },
        'KitchenAvailability'
      ],
    }),
    
    updateKitchenAvailability: builder.mutation({
      query: ({ kitchenId, availabilityData }) => ({
        url: `/admin/kitchens/${kitchenId}/availability`,
        method: 'PUT',
        body: availabilityData,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'KitchenAvailability', id: arg.kitchenId },
        'KitchenAvailability'
      ],
    }),
    
    // Kitchen Analytics
    getKitchenAnalytics: builder.query({
      query: ({ kitchenId, ...params }) => ({
        url: `/admin/kitchens/${kitchenId}/analytics`,
        params: {
          period: params.period || 'month',
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
        }
      }),
      providesTags: (result, error, arg) => [
        { type: 'KitchenAnalytics', id: arg.kitchenId },
        'KitchenAnalytics'
      ],
    }),
    
    getKitchenStats: builder.query({
      query: (kitchenId) => `/admin/kitchens/${kitchenId}/stats`,
      providesTags: (result, error, arg) => [
        { type: 'KitchenAnalytics', id: arg },
        'KitchenAnalytics'
      ],
    }),
  }),
});

// Export hooks
export const {
  // Kitchen Management
  useGetKitchensQuery,
  useGetKitchenByIdQuery,
  useGetKitchenByPartnerIdQuery,
  useCreateKitchenMutation,
  useUpdateKitchenMutation,
  useDeleteKitchenMutation,
  useApproveKitchenMutation,
  useSuspendKitchenMutation,
  useGetKitchenFilterOptionsQuery,
  useGetKitchenPartnersQuery,
  
  // Kitchen Users
  useGetKitchenUsersQuery,
  useAddKitchenUserMutation,
  useUpdateKitchenUserMutation,
  useRemoveKitchenUserMutation,
  
  // Kitchen Dishes
  useGetKitchenDishesQuery,
  useGetDishByIdQuery,
  useCreateDishMutation,
  useUpdateDishMutation,
  useDeleteDishMutation,
  
  // Kitchen Media
  useGetKitchenMediaQuery,
  useGetKitchenMediaUploadUrlMutation,
  useUploadToS3Mutation,
  useConfirmKitchenMediaUploadMutation,
  useDeleteKitchenMediaMutation,
  
  // Kitchen Addresses
  useGetKitchenAddressesQuery,
  useAddKitchenAddressMutation,
  useUpdateKitchenAddressMutation,
  useDeleteKitchenAddressMutation,
  
  // Kitchen Availability
  useGetKitchenAvailabilityQuery,
  useUpdateKitchenAvailabilityMutation,
  
  // Kitchen Analytics
  useGetKitchenAnalyticsQuery,
  useGetKitchenStatsQuery,
} = kitchensApi;
