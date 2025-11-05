import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { PermissionProvider } from './contexts/PermissionContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';

// Admin Pages
import Dashboard from './pages/Dashboard';
import KitchensList from './pages/kitchens/KitchensList';
import KitchenDetail from './pages/kitchens/KitchenDetail';
import OnboardingQueue from './pages/kitchens/OnboardingQueue';
import OrdersList from './pages/orders/OrdersList';
import OrderDetail from './pages/orders/OrderDetail';
import MyEngagements from './pages/engagement/MyEngagements';
import TeamEngagements from './pages/engagement/TeamEngagements';
import CustomersList from './pages/customers/CustomersList';
import CustomerDetail from './pages/customers/CustomerDetail';
import PartenerList from './pages/partener/PartenerList';
import PartenerDetail from './pages/partener/PartenerDetail';
import UserManagementList from './pages/userManagement/UserManagementList';
import UserDetail from './pages/users/UserDetail';
import Reports from './pages/reports/Reports';
import Settings from './pages/settings/Settings';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import PermissionsDemo from './pages/PermissionsDemo';
import Discounts from './pages/discounts/Discounts';
import DiscountDetail from './pages/discounts/DiscountDetail';
import Feedback from './pages/feedbacks/Feedback';
import FeedbackDetail from './pages/feedbacks/FeedbackDetail';
import RequestList from './pages/requests/RequestList';
import RequestDetail from './pages/requests/requestDetail/RequestDetail';
// Dish Management
import DishesList from './pages/dishes/DishesList';
import DishDetail from './pages/dishes/DishDetail';
// Case Management
import MyCasesList from './pages/cases/MyCasesList';
import AllCasesList from './pages/cases/AllCasesList';
import CaseDetailPage from './pages/cases/CaseDetail/CaseDetailPage';

// Protected Route Components
import ProtectedRoute from './components/ProtectedRoute';
import KitchenDishDetailPage from './pages/kitchens/KitchenDishDetailPage';

// Basic Authentication Route Component
const AuthRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const { userPermissions } = useAuth();
  
  return (
    <PermissionProvider>
        {/* PermissionsContext removed - using PermissionProvider instead */}
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>
          
          {/* Unauthorized Route */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Protected Admin Routes */}
          <Route element={
            <AuthRoute>
              <MainLayout />
            </AuthRoute>
          }>
            <Route path="/" element={
             
                <Dashboard />
             
            } />
            
            <Route path="/kitchens" element={
              <ProtectedRoute routeName="kitchens">
                <KitchensList />
              </ProtectedRoute>
            } />
            
            <Route path="/kitchens/:id" element={
              <ProtectedRoute routeName="kitchens">
                <KitchenDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/kitchens/:kitchenId/dishes/:dishId" element={
              <ProtectedRoute routeName="kitchens">
                <KitchenDishDetailPage />
              </ProtectedRoute>
            } />
            
            <Route path="/onboarding" element={
              <ProtectedRoute routeName="kitchens">
                <OnboardingQueue />
              </ProtectedRoute>
            } />
            
            <Route path="/dishes" element={
              <ProtectedRoute routeName="dishes">
                <DishesList />
              </ProtectedRoute>
            } />
            
            <Route path="/dishes/:id" element={
              <ProtectedRoute routeName="dish-detail">
                <DishDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/orders" element={
              <ProtectedRoute routeName="orders">
                <OrdersList />
              </ProtectedRoute>
            } />
            
            <Route path="/orders/:id" element={
              <ProtectedRoute routeName="orders">
                <OrderDetail />
              </ProtectedRoute>
            } />
            
            {/* Engagement: mirror Cases structure with two tabs */}
            <Route path="/engagement" element={<Navigate to="/engagement/my" replace />} />
            <Route path="/engagement/my" element={
              <ProtectedRoute routeName="engagement">
                <MyEngagements />
              </ProtectedRoute>
            } />
            <Route path="/engagement/team" element={
              <ProtectedRoute routeName="engagement">
                <TeamEngagements />
              </ProtectedRoute>
            } />
            
            <Route path="/customers" element={
              <ProtectedRoute routeName="customers">
                <CustomersList />
              </ProtectedRoute>
            } />
            
            <Route path="/customers/:id" element={
              <ProtectedRoute routeName="customers">
                <CustomerDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/parteners" element={
              <ProtectedRoute routeName="partners">
                <PartenerList />
              </ProtectedRoute>
            } />
            
            <Route path="/parteners/:id" element={
              <ProtectedRoute routeName="partners">
                <PartenerDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/users" element={
              <ProtectedRoute routeName="users">
                <UserManagementList />
              </ProtectedRoute>
            } />
            
            <Route path="/users/:id" element={
              <ProtectedRoute routeName="users">
                <UserDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/discounts" element={
              <ProtectedRoute routeName="discounts">
                <Discounts />
              </ProtectedRoute>
            } />
            <Route path="/discounts/:id" element={
              <ProtectedRoute routeName="discounts">
                <DiscountDetail />
              </ProtectedRoute>
            } />

            {/* Case Management */}
            <Route path="/cases" element={<Navigate to="/cases/my" replace />} />
            <Route path="/cases/my" element={
              <ProtectedRoute routeName="cases">
                <MyCasesList />
              </ProtectedRoute>
            } />
            <Route path="/cases/all" element={
              <ProtectedRoute routeName="cases">
                <AllCasesList />
              </ProtectedRoute>
            } />
            <Route path="/cases/:id" element={
              <ProtectedRoute routeName="cases">
                <CaseDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/feedback/:id" element={
              <ProtectedRoute routeName="feedback">
                <FeedbackDetail />
              </ProtectedRoute>
            } />

            <Route path="/requests" element={
              <ProtectedRoute routeName="requests">
                <RequestList />
              </ProtectedRoute>
            } />
            <Route path="/requests/:id" element={
              <ProtectedRoute routeName="requests">
                <RequestDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/feedback" element={
              <ProtectedRoute routeName="feedback">
                <Feedback />
              </ProtectedRoute>
            } />
            
            <Route path="/feedback/:id" element={
              <ProtectedRoute routeName="feedback">
                <FeedbackDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute routeName="reports">
                <Reports />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute routeName="settings">
                <Settings />
              </ProtectedRoute>
            } />
            
            {/* Permissions Demo Page */}
            <Route path="/permissions-demo" element={<PermissionsDemo />} />
          </Route>
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
    </PermissionProvider>
  );
}

export default App;
