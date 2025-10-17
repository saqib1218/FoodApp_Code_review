/**
 * Permission Registry - Centralized permission management
 * Simple registry for all permission keys and route mappings
 */

// All Permission Keys - Add new permissions here
export const PERMISSIONS = {
  // User Management
  USER_CREATE: 'admin.user.create',
  USER_LIST_VIEW: 'admin.user.list.view',
  USER_EDIT: 'admin.user.edit',
  USER_DELETE: 'admin.user.delete',
  USER_ACTIVATE: 'admin.user.activate',
  USER_DEACTIVATE: 'admin.user.deactivate',

  // Role Management
  ROLE_CREATE: 'admin.role.create',
  ROLE_LIST_VIEW: 'admin.role.list.view',
  ROLE_EDIT: 'admin.role.edit',
  ROLE_DELETE: 'admin.role.delete',

  // Permission Management
  PERMISSION_CREATE: 'admin.permission.create',
  PERMISSION_LIST_VIEW: 'admin.permission.list.view',
  PERMISSION_EDIT: 'admin.permission.edit',
  PERMISSION_DELETE: 'admin.permission.delete',

  // Dashboard
  DASHBOARD_VIEW: 'admin.dashboard.view',

  // Kitchen Management
  KITCHEN_VIEW: 'admin.kitchen.view', // Kitchen permissions
  KITCHEN_LIST_VIEW: 'admin.kitchen.list.view',
  KITCHEN_DETAIL_VIEW: 'admin.kitchen.detail.view',
  KITCHEN_DISH_LIST_VIEW: 'admin.kitchen.dish.list.view',
  KITCHEN_PARTNER_LIST_VIEW: 'admin.kitchen.partner.list.view',
  KITCHEN_ADDRESS_LIST_VIEW: 'admin.kitchen.address.list.view',
  KITCHEN_AVAILABILITY_VIEW: 'admin.kitchen.availability.view',
  KITCHEN_MEDIA_LIST_VIEW: 'admin.kitchen.media.list.view',
  KITCHEN_MEDIA_UPLOAD: 'admin.kitchen.media.upload',
  KITCHEN_EDIT: 'admin.kitchen.edit',
  KITCHEN_CREATE: 'admin.kitchen.create',
  KITCHEN_ADDRESS_ADD: 'admin.kitchen.address.add',
  KITCHEN_ADDRESS_EDIT: 'admin.kitchen.address.edit',
  KITCHEN_AVAILABILITY_ADD: 'admin.kitchen.availability.add',
  KITCHEN_SUBMIT: 'admin.kitchen.submit',
  KITCHEN_REQUEST_LIST_VIEW: 'admin.kitchen.request.list.view',

  // Partner Management
  PARTNER_VIEW: 'admin.partner.view',
  PARTNER_LIST_VIEW: 'admin.partner.list.view',
  PARTNER_DETAIL_VIEW: 'admin.partner.detail.view',

  // Customer Management
  CUSTOMER_VIEW: 'admin.customer.view',

  // Order Management
  ORDER_VIEW: 'admin.order.view',

  // Feedback Management
  FEEDBACK_VIEW: 'admin.feedback.view',

  // Discount Management
  DISCOUNT_VIEW: 'admin.discount.view',

  // Reports
  REPORTS_VIEW: 'admin.reports.view',

  // Settings
  SETTINGS_VIEW: 'admin.setting.view',

  // Engagement
  ENGAGEMENT_VIEW: 'admin.engagement.view',

  // Dish Management
  DISH_VIEW: 'admin.dish.view',
  DISH_LIST_VIEW: 'admin.dish.list.view',
  DISH_DETAIL_VIEW: 'admin.dish.detail.view',
  DISH_CREATE: 'admin.dish.create',
  DISH_EDIT: 'admin.dish.edit',
  DISH_DELETE: 'admin.dish.delete',
  
  // Dish Variants
  DISH_VARIANT_LIST_VIEW: 'admin.dish.variant.list.view',
  DISH_VARIANT_CREATE: 'admin.dish.variant.create',
  DISH_VARIANT_EDIT: 'admin.dish.variant.edit',
  DISH_VARIANT_DETAIL_VIEW: 'admin.dish.variant.detail.view',
  DISH_VARIANT_DELETE: 'admin.dish.variant.delete',
  DISH_VARIANT_ITEM_CREATE: 'admin.dish.variant.item.create',
  DISH_VARIANT_ITEM_DETAIL_VIEW: 'admin.dish.variant.item.detail.view',
  DISH_VARIANT_ITEM_EDIT: 'admin.dish.variant.item.edit',
  DISH_VARIANT_ITEM_DELETE: 'admin.dish.variant.item.delete',
  
  // Dish Availability
  DISH_AVAILABILITY_VIEW: 'admin.dish.availability.view',
  DISH_AVAILABILITY_ADD: 'admin.dish.availability.add',
  DISH_AVAILABILITY_LIST_VIEW: 'admin.dish.availability.list.view',
  DISH_AVAILABILITY_CREATE: 'admin.dish.availability.create',
  DISH_AVAILABILITY_EDIT: 'admin.dish.availability.edit',
  DISH_AVAILABILITY_DELETE: 'admin.dish.availability.delete',
  
  // Dish Categories
  DISH_CATEGORY_LIST_VIEW: 'admin.dish.category.list.view',
  DISH_CATEGORY_CREATE: 'admin.dish.category.create',
  DISH_CATEGORY_EDIT: 'admin.dish.category.edit',
  DISH_CATEGORY_DELETE: 'admin.dish.category.delete',
  
  // Dish Media
  DISH_MEDIA_LIST_VIEW: 'admin.dish.media.list.view',
  DISH_MEDIA_UPLOAD: 'admin.dish.media.upload',
  DISH_MEDIA_DELETE: 'admin.dish.media.delete',
  // Dish Special Event
  DISH_SPECIAL_EVENT_CREATE: 'admin.dish.specialEvent.create',
  DISH_SPECIAL_EVENT_LIST_VIEW: 'admin.dish.specialEvent.list.view',
  DISH_SPECIAL_EVENT_DETAIL_VIEW: 'admin.dish.specialEvent.detail.view',
  DISH_SPECIAL_EVENT_EDIT: 'admin.dish.specialEvent.edit',
};

// Additional granular permissions
export const EXTRA_PERMISSIONS = {
  REQUEST_DETAIL_VIEW: 'admin.request.detail.view',
  REQUEST_APPROVE: 'admin.request.approve',
};

// Route-based permission mapping - Maps route names to required permissions
export const ROUTE_PERMISSIONS = {
  'dashboard': [PERMISSIONS.DASHBOARD_VIEW],
  'kitchens': [PERMISSIONS.KITCHEN_VIEW],
  'dishes': [PERMISSIONS.DISH_VIEW],
  // 'dish-detail': No permission required - accessible to all authenticated users
  'orders': [PERMISSIONS.ORDER_VIEW],
  'customers': [PERMISSIONS.CUSTOMER_VIEW],
  'partners': [PERMISSIONS.PARTNER_LIST_VIEW],
  'partner-detail': [PERMISSIONS.PARTNER_DETAIL_VIEW],
  'users': [PERMISSIONS.USER_LIST_VIEW],
  'user-management': [PERMISSIONS.USER_LIST_VIEW],
  'feedback': [PERMISSIONS.FEEDBACK_VIEW],
  'discounts': [PERMISSIONS.DISCOUNT_VIEW],
  'reports': [PERMISSIONS.REPORTS_VIEW],
  'settings': [PERMISSIONS.SETTINGS_VIEW],
  'engagement': [PERMISSIONS.ENGAGEMENT_VIEW]
};

// Navigation Items with Permission Requirements
export const NAVIGATION_ITEMS = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: 'HomeIcon',
    requiredPermissions: [PERMISSIONS.DASHBOARD_VIEW]
  },
  {
    name: 'User Management',
    path: '/users',
    icon: 'UsersIcon',
    requiredPermissions: [PERMISSIONS.USER_LIST_VIEW]
  },
  {
    name: 'Kitchen',
    path: '/kitchens',
    icon: 'BuildingStorefrontIcon',
    requiredPermissions: [PERMISSIONS.KITCHEN_VIEW]
  },
  {
    name: 'Dishes',
    path: '/dishes',
    icon: 'CakeIcon',
    requiredPermissions: [PERMISSIONS.DISH_VIEW]
  },
  {
    name: 'Partners',
    path: '/partners',
    icon: 'UserGroupIcon',
    requiredPermissions: [PERMISSIONS.PARTNER_VIEW]
  },
  {
    name: 'Customers',
    path: '/customers',
    icon: 'UserIcon',
    requiredPermissions: [PERMISSIONS.CUSTOMER_VIEW]
  },
  {
    name: 'Orders',
    path: '/orders',
    icon: 'ShoppingBagIcon',
    requiredPermissions: [PERMISSIONS.ORDER_VIEW]
  },
  {
    name: 'Feedback',
    path: '/feedback',
    icon: 'ChatBubbleLeftRightIcon',
    requiredPermissions: [PERMISSIONS.FEEDBACK_VIEW]
  },
  {
    name: 'Discounts',
    path: '/discounts',
    icon: 'TagIcon',
    requiredPermissions: [PERMISSIONS.DISCOUNT_VIEW]
  },
  {
    name: 'Reports',
    path: '/reports',
    icon: 'ChartBarIcon',
    requiredPermissions: [PERMISSIONS.REPORTS_VIEW]
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: 'CogIcon',
    requiredPermissions: [PERMISSIONS.SETTINGS_VIEW]
  },
  {
    name: 'Engagement',
    path: '/engagement',
    icon: 'MegaphoneIcon',
    requiredPermissions: [PERMISSIONS.ENGAGEMENT_VIEW]
  }
]

// Simple utility functions for permission checking
export const PermissionUtils = {
  // Get permissions required for a route
  getRoutePermissions: (route) => {
    return ROUTE_PERMISSIONS[route] || [];
  },

  // Get navigation items that user has access to
  getAccessibleNavigation: (userPermissions) => {
    return NAVIGATION_ITEMS.filter(item => {
      return item.requiredPermissions.some(permission => 
        userPermissions.includes(permission)
      );
    });
  }
};

export default PERMISSIONS;
