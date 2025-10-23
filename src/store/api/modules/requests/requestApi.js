import { apiSlice } from '../../index';

export const requestsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRequests: builder.query({
      query: (params = {}) => ({
        url: '/admin/requests',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search,
          status: params.status,
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
        },
      }),
      providesTags: ['Requests'],
    }),

    getRequestById: builder.query({
      query: (requestId) => `/admin/requests/${requestId}`,
      providesTags: (result, error, arg) => [{ type: 'Requests', id: arg }],
    }),

    approveRequest: builder.mutation({
      query: (requestId) => ({
        url: `/admin/requests/${encodeURIComponent(String(requestId))}/approve`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, requestId) => [
        { type: 'Requests', id: requestId },
        'Requests',
      ],
    }),
  }),
});

export const { useGetRequestsQuery, useGetRequestByIdQuery, useLazyGetRequestByIdQuery, useApproveRequestMutation } = requestsApi;
