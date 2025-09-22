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
  KITCHEN_PARTNER_LIST_VIEW: 'admin.kitchen.partner.list.view',
  KITCHEN_ADDRESS_LIST_VIEW: 'admin.kitchen.address.list.view',
  KITCHEN_AVAILABILITY_VIEW: 'admin.kitchen.availability.view',
  KITCHEN_EDIT: 'admin.kitchen.edit',
  KITCHEN_CREATE: 'admin.kitchen.create',
  KITCHEN_ADDRESS_ADD: 'admin.kitchen.address.add',
  KITCHEN_ADDRESS_EDIT: 'admin.kitchen.address.edit',
  KITCHEN_AVAILABILITY_ADD: 'admin.kitchen.availability.add',

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
  ENGAGEMENT_VIEW: 'admin.engagement.view'
};

// Route-based permission mapping - Maps route names to required permissions
export const ROUTE_PERMISSIONS = {
  'dashboard': [PERMISSIONS.DASHBOARD_VIEW],
  'kitchens': [PERMISSIONS.KITCHEN_VIEW],
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
