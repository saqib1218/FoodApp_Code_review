import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  BuildingStorefrontIcon,
  CakeIcon,
  QueueListIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  TagIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [casesOpen, setCasesOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const { hasPermission, isPermissionsLoaded } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Determine if current page is a moderation-heavy screen
  useEffect(() => {
    const moderationScreens = [
      '/onboarding',
      '/kitchens',
      '/orders'
    ];
    
    // Check if current path starts with any moderation screen path
    const isModeration = moderationScreens.some(screen => 
      location.pathname.startsWith(screen));
    
    setShowActionButtons(isModeration);
    // Auto-open Case Management submenu when on /cases routes
    setCasesOpen(location.pathname.startsWith('/cases'));
  }, [location]);

  // Define navigation items with required permissions (using database permission keys)
  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon,  },
    { name: 'Partners', href: '/parteners', icon: BuildingOfficeIcon, permission: 'admin.partner.view' },
    { name: 'Kitchens', href: '/kitchens', icon: BuildingStorefrontIcon, permission: 'admin.kitchen.view' },
    { name: 'Dishes', href: '/dishes', icon: CakeIcon, permission: 'admin.dish.view' },
    // { name: 'Onboarding Queue', href: '/onboarding', icon: QueueListIcon, permission: 'admin.kitchen.view' },
    { name: 'Orders', href: '/orders', icon: ShoppingBagIcon, permission: 'admin.order.view' },
    { name: 'Customers', href: '/customers', icon: UsersIcon, permission: 'admin.customer.view' },
    { name: 'Engagement', href: '/engagement', icon: ChatBubbleLeftRightIcon, permission: 'admin.engagement.view' },
    { name: 'Feedback', href: '/feedback', icon: ChatBubbleBottomCenterTextIcon, permission: 'admin.feedback.view' },
    { name: 'Requests', href: '/requests', icon: QueueListIcon, permission: 'admin.request.view' },
    { name: 'Permissions Demo', href: '/permissions-demo', icon: ShieldCheckIcon, permission: null }, // Demo page for RBAC
    { name: 'Discounts', href: '/discounts', icon: TagIcon, permission: 'admin.discount.view' },
    { name: 'Case Management', href: '/cases', icon: QueueListIcon, permission: null },
    { name: 'Users', href: '/users', icon: UserGroupIcon, permission: 'admin.users.view' },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon, permission: 'admin.reports.view' },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, permission: 'admin.setting.view' },
  ];

  // While permissions are loading, block rendering the entire layout to avoid flicker/missing tabs
  if (!isPermissionsLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-offWhite">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-neutral-600">Loading permissions...</p>
        </div>
      </div>
    );
  }

  // Filter navigation items based on permissions (runs only after permissions loaded)
  const filteredNavigation = navigation.filter(item => !item.permission || hasPermission(item.permission));

  return (
    <div className="h-screen flex overflow-hidden bg-background-offWhite">
      {/* Mobile sidebar */}
      <div
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } fixed inset-0 flex z-40 lg:hidden`}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="fixed inset-0 bg-neutral-600 bg-opacity-75"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        ></div>

        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-primary-600">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-2xl font-bold text-white">Riwayat Admin</h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {filteredNavigation.map((item) => (
                item.href === '/cases' ? (
                  <div key={item.name} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setCasesOpen((v) => !v)}
                      className={`$${' '}group flex w-full items-center px-2 py-2 text-base font-medium rounded-md ${casesOpen || location.pathname.startsWith('/cases') ? 'bg-primary-700 text-white' : 'text-white hover:bg-primary-500'}`}
                    >
                      <item.icon className="mr-4 flex-shrink-0 h-6 w-6 text-primary-200" aria-hidden="true" />
                      Case Management
                    </button>
                    {casesOpen && (
                      <div className="ml-10 space-y-1">
                        <NavLink
                          to="/cases/my"
                          className={({ isActive }) =>
                            isActive
                              ? 'bg-primary-700 text-white group flex items-center px-2 py-2 text-base font-medium rounded-md'
                              : 'text-white/90 hover:bg-primary-500 group flex items-center px-2 py-2 text-base font-medium rounded-md'
                          }
                        >
                          My Cases
                        </NavLink>
                        <NavLink
                          to="/cases/all"
                          className={({ isActive }) =>
                            isActive
                              ? 'bg-primary-700 text-white group flex items-center px-2 py-2 text-base font-medium rounded-md'
                              : 'text-white/90 hover:bg-primary-500 group flex items-center px-2 py-2 text-base font-medium rounded-md'
                          }
                        >
                          All Cases
                        </NavLink>
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      isActive
                        ? 'bg-primary-700 text-white group flex items-center px-2 py-2 text-base font-medium rounded-md'
                        : 'text-white hover:bg-primary-500 group flex items-center px-2 py-2 text-base font-medium rounded-md'
                    }
                  >
                    <item.icon
                      className="mr-4 flex-shrink-0 h-6 w-6 text-primary-200"
                      aria-hidden="true"
                    />
                    {item.name}
                  </NavLink>
                )
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex-1 flex flex-col min-h-0 bg-primary-600">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-2xl font-bold text-white">Riwayat Admin</h1>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {filteredNavigation.map((item) => (
                  item.href === '/cases' ? (
                    <div key={item.name} className="space-y-1">
                      <button
                        type="button"
                        onClick={() => setCasesOpen((v) => !v)}
                        className={`${(casesOpen || location.pathname.startsWith('/cases')) ? 'bg-primary-700 text-white' : 'text-white hover:bg-primary-500'} group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md`}
                      >
                        <item.icon className="mr-3 flex-shrink-0 h-6 w-6 text-neutral-200" aria-hidden="true" />
                        Case Management
                      </button>
                      {casesOpen && (
                        <div className="ml-10 space-y-1">
                          <NavLink
                            to="/cases/my"
                            className={({ isActive }) =>
                              isActive
                                ? 'bg-primary-700 text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                                : 'text-white/90 hover:bg-primary-500 group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                            }
                          >
                            My Cases
                          </NavLink>
                          <NavLink
                            to="/cases/all"
                            className={({ isActive }) =>
                              isActive
                                ? 'bg-primary-700 text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                                : 'text-white/90 hover:bg-primary-500 group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                            }
                          >
                            All Cases
                          </NavLink>
                        </div>
                      )}
                    </div>
                  ) : (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        isActive
                          ? 'bg-primary-700 text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                          : 'text-white hover:bg-primary-500 group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                      }
                    >
                      <item.icon
                        className="mr-3 flex-shrink-0 h-6 w-6 text-neutral-200"
                        aria-hidden="true"
                      />
                      {item.name}
                    </NavLink>
                  )
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden ">
        {/* Top navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-neutral-200 text-neutral-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-600 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex"></div>
            <div className="ml-4 flex items-center md:ml-6">
              {/* Notification dropdown */}
              <button className="p-1 rounded-full text-neutral-400 hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600">
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
              </button>

              {/* Profile dropdown */}
              <div className="ml-3 relative flex items-center">
                <div className="flex items-center">
                  <div className="ml-3">
                    <div className="text-base font-medium text-neutral-800">
                      {currentUser?.name || 'Admin User'}
                    </div>
                    <div className="text-sm font-medium text-neutral-500">
                      {currentUser?.email || 'admin@riwayat.com'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-4 p-1 rounded-full text-neutral-400 hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600"
                >
                  <span className="sr-only">Logout</span>
                  <ArrowRightOnRectangleIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed action buttons for moderation screens - with permission checks */}
        {showActionButtons && (
          <div className="fixed bottom-8 right-8 flex flex-col space-y-4 z-50">
            {isPermissionsLoaded && hasPermission('admin.kitchen.edit') && (
              <button 
                className="p-4 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                aria-label="Approve"
              >
                <CheckCircleIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            )}
            {isPermissionsLoaded && hasPermission('admin.kitchen.edit') && (
              <button 
                className="p-4 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600"
                aria-label="Reject"
              >
                <XCircleIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
