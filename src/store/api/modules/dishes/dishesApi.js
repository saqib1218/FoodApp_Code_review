/**
 * Dishes API Endpoints
 * Create and list dishes by kitchen
 */

import { apiSlice } from '../../index';

export const dishesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all dishes (admin)
    getAllDishes: builder.query({
      query: (params = {}) => ({
        url: '/admin/dishes',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search,
          status: params.status,
          category: params.category,
          kitchenId: params.kitchenId,
        },
      }),
      providesTags: ['Dish'],
    }),

    // Get dish availability across kitchens (admin)
    getDishAvailability: builder.query({
      query: (dishId) => `/admin/dishes/${dishId}/availability`,
      providesTags: (result, error, arg) => [
        { type: 'Dish', id: arg },
        'Dish',
      ],
    }),

    // Create/Update dish availability (admin)
    updateDishAvailability: builder.mutation({
      query: ({ dishId, body }) => ({
        url: `/admin/dishes/${dishId}/availability`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Dish', id: arg.dishId },
        'Dish',
      ],
    }),
    // Get dish by ID (admin)
    getDishById: builder.query({
      query: (dishId) => `/admin/dishes/${dishId}`,
      providesTags: (result, error, arg) => [{ type: 'Dish', id: arg }],
    }),
    // Update dish by ID (admin)
    updateDishById: builder.mutation({
      query: ({ dishId, body }) => ({
        url: `/admin/dishes/${dishId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Dish', id: arg.dishId },
        'Dish',
      ],
    }),
    // Create dish special event
    createDishEvent: builder.mutation({
      query: ({ dishId, body }) => ({
        url: `/admin/dishes/${dishId}/event/create`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Dish', id: arg.dishId },
        'Dish',
      ],
    }),
    // Get all special events for a dish
    getDishEvents: builder.query({
      query: (dishId) => `/admin/dishes/${dishId}/events`,
      providesTags: (result, error, arg) => [
        { type: 'Dish', id: arg },
        'Dish',
      ],
      refetchOnMountOrArgChange: true,
    }),
    // Get single special event detail for a dish
    getDishEventById: builder.query({
      query: ({ dishId, eventId }) => `/admin/dishes/${dishId}/events/${eventId}`,
      providesTags: (result, error, arg) => [
        { type: 'Dish', id: arg?.dishId },
        'Dish',
      ],
    }),
    // Update a special event dates by event id
    updateDishEvent: builder.mutation({
      query: ({ eventId, body }) => ({
        url: `/admin/dishes/event/${eventId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        'Dish',
      ],
    }),
    // Get variants for a dish (admin)
    getDishVariants: builder.query({
      query: (dishId) => `/admin/dishes/${dishId}/variants`,
      providesTags: (result, error, arg) => [
        { type: 'DishVariant', id: arg },
        'DishVariant',
      ],
    }),
    // Get single variant detail
    getDishVariantById: builder.query({
      query: (variantId) => `/admin/dishes/variants/${variantId}`,
      providesTags: (result, error, arg) => [
        { type: 'DishVariant', id: arg },
      ],
    }),
    // Create a variant for a dish (admin)
    createDishVariant: builder.mutation({
      query: ({ dishId, body }) => ({
        url: `/admin/dishes/${dishId}/variants/create`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'DishVariant', id: arg.dishId },
        'DishVariant',
      ],
    }),
    // Update a variant
    updateDishVariant: builder.mutation({
      query: ({ dishId, variantId, body }) => ({
        url: `/admin/dishes/${dishId}/variants/${variantId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'DishVariant', id: arg.variantId },
        { type: 'DishVariant', id: arg.dishId },
        'DishVariant',
      ],
    }),
    // List items for a variant
    getDishVariantItems: builder.query({
      query: (variantId) => `/admin/dishes/variants/${variantId}/items`,
      providesTags: (result, error, arg) => [
        { type: 'DishVariant', id: arg },
      ],
    }),
    // Create item for a variant
    createDishVariantItem: builder.mutation({
      query: ({ variantId, body }) => ({
        url: `/admin/dishes/variants/${variantId}/item/create`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'DishVariant', id: arg.variantId },
      ],
    }),
    // Get single variant item by id
    getDishVariantItemById: builder.query({
      query: ({ variantId, itemId }) => `/admin/dishes/variants/${variantId}/items/${itemId}`,
      providesTags: (result, error, arg) => [
        { type: 'DishVariant', id: arg.variantId },
      ],
    }),
    // Update variant item
    updateDishVariantItem: builder.mutation({
      query: ({ variantId, itemId, body }) => ({
        url: `/admin/dishes/variants/${variantId}/item/${itemId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'DishVariant', id: arg.variantId },
      ],
    }),
    // Delete variant item
    deleteDishVariantItem: builder.mutation({
      query: ({ variantId, itemId }) => ({
        url: `/admin/dishes/variants/${variantId}/items/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'DishVariant', id: arg.variantId },
      ],
    }),
    // Create a dish (admin)
    createDishStandalone: builder.mutation({
      query: (dishData) => ({
        url: '/admin/dishes/create',
        method: 'POST',
        body: dishData,
      }),
      invalidatesTags: ['Dish'],
    }),

    // Get dishes for a kitchen
    getKitchenDishes: builder.query({
      query: ({ kitchenId, ...params }) => ({
        url: `/admin/kitchens/${kitchenId}/dishes`,
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search,
          category: params.category,
          status: params.status,
        },
      }),
      providesTags: (result, error, arg) => [
        { type: 'Dish', id: arg.kitchenId },
        'Dish',
      ],
    }),
  }),
});

export const {
  useCreateDishStandaloneMutation,
  useGetKitchenDishesQuery,
  useGetAllDishesQuery,
  useGetDishByIdQuery,
  useUpdateDishByIdMutation,
  useCreateDishEventMutation,
  useGetDishEventsQuery,
  useGetDishEventByIdQuery,
  useLazyGetDishEventByIdQuery,
  useUpdateDishEventMutation,
  useGetDishVariantsQuery,
  useCreateDishVariantMutation,
  useGetDishVariantByIdQuery,
  useLazyGetDishVariantByIdQuery,
  useUpdateDishVariantMutation,
  useGetDishVariantItemsQuery,
  useLazyGetDishVariantItemsQuery,
  useCreateDishVariantItemMutation,
  useGetDishVariantItemByIdQuery,
  useLazyGetDishVariantItemByIdQuery,
  useUpdateDishVariantItemMutation,
  useDeleteDishVariantItemMutation,
  useGetDishAvailabilityQuery,
  useUpdateDishAvailabilityMutation,
} = dishesApi;
