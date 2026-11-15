import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// 12 Required Application Pages
import LoginPage from './pages/LoginPage';
import HealthDashboardPage from './pages/HealthDashboardPage';
import AssetRegistryPage from './pages/AssetRegistryPage';
import AssetDetailsPage from './pages/AssetDetailsPage';
import MaintenanceCalendarPage from './pages/MaintenanceCalendarPage';
import MaintenancePlanningBoardPage from './pages/MaintenancePlanningBoardPage';
import FailureRiskPredictionPage from './pages/FailureRiskPredictionPage';
import MaintenanceRecommendationsPage from './pages/MaintenanceRecommendationsPage';
import ReliabilityAnalyticsPage from './pages/ReliabilityAnalyticsPage';
import ReportsAnalyticsPage from './pages/ReportsAnalyticsPage';
import NotificationsPage from './pages/NotificationsPage';
import UserManagementPage from './pages/UserManagementPage';
import AuditLogsSettingsPage from './pages/AuditLogsSettingsPage';

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <Routes>
            {/* Page 1: Secure Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Authenticated Application Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />

              {/* Health Dashboard & Asset Registry (Distinct Pages) */}
              <Route path="dashboard" element={<HealthDashboardPage />} />
              <Route path="assets" element={<AssetRegistryPage />} />

              {/* Page 3: Asset Details and Maintenance History */}
              <Route path="assets/:id" element={<AssetDetailsPage />} />

              {/* Page 4: Maintenance Calendar and Technician Queue */}
              <Route path="calendar" element={<MaintenanceCalendarPage />} />

              {/* Page 5: Maintenance Planning & Closure Verification (Kanban) */}
              <Route path="planning" element={<MaintenancePlanningBoardPage />} />

              {/* Page 6: Failure Risk and Remaining Useful Life (RUL) */}
              <Route path="predictions" element={<FailureRiskPredictionPage />} />

              {/* Page 7: AI Maintenance Recommendations */}
              <Route path="recommendations" element={<MaintenanceRecommendationsPage />} />

              {/* Page 8: Reliability & Model Performance */}
              <Route path="reliability" element={<ReliabilityAnalyticsPage />} />

              {/* Page 9: Reports and Analytics */}
              <Route path="reports" element={<ReportsAnalyticsPage />} />

              {/* Page 10: Notifications */}
              <Route path="notifications" element={<NotificationsPage />} />

              {/* Page 11: User and Role Management (Admin only) */}
              <Route
                path="users"
                element={
                  <ProtectedRoute allowedRoles={['Maintenance Admin']}>
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />

              {/* Page 12: Audit Logs and System Settings (Admin only) */}
              <Route
                path="settings"
                element={
                  <ProtectedRoute allowedRoles={['Maintenance Admin']}>
                    <AuditLogsSettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
