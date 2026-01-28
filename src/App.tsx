import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { AdminDashboard } from './pages/Dashboard';
import { AdminProfile } from './pages/AdminProfile';
import { UserManagement } from './pages/UserManagement';
import PendingRequests from './pages/PendingRequests';
import { Feedback } from './pages/Feedback';
import { Payments } from './pages/Payments';

function AppRoutes() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigateToProfile = () => {
    navigate('/profile');
  };

  const handleNavigateToDashboard = () => {
    navigate('/dashboard');
  };

  const handleNavigateToHome = () => {
    logout();
    navigate('/login');
  };

  const handleNavigateToUserManagement = () => {
    navigate('/manage-users');
  };

  const handleNavigateToPendingRequests = () => {
    navigate('/pending-requests');
  };

  const handleNavigateToFeedback = () => {
    navigate('/feedback');
  };

  const handleNavigateToPayments = () => {
    navigate('/payments');
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
    
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <AdminDashboard 
              onNavigateToProfile={handleNavigateToProfile} 
              onNavigateToUserManagement={handleNavigateToUserManagement}
              onNavigateToPendingRequests={handleNavigateToPendingRequests}
              onNavigateToFeedback={handleNavigateToFeedback}
              onNavigateToPayments={handleNavigateToPayments}
              onLogout={handleLogout} 
              onHome={handleNavigateToHome}
              userName={user?.name || user?.email}
              profileImage={user?.profileImage}
            />
          </PrivateRoute>
        }
      />
      
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <AdminProfile 
              onBack={handleNavigateToDashboard}
              onNavigateToUserManagement={handleNavigateToUserManagement}
              onNavigateToPendingRequests={handleNavigateToPendingRequests}
              onNavigateToFeedback={handleNavigateToFeedback}
              onNavigateToPayments={handleNavigateToPayments}
              onLogout={handleLogout}
              onHome={handleNavigateToHome}
              userName={user?.name || user?.email}
              profileImage={user?.profileImage}
            />
          </PrivateRoute>
        }
      />
      
      <Route
        path="/manage-users"
        element={
          <PrivateRoute>
            <UserManagement 
              onBack={handleNavigateToDashboard}
              onNavigateToProfile={handleNavigateToProfile}
              onNavigateToPendingRequests={handleNavigateToPendingRequests}
              onNavigateToFeedback={handleNavigateToFeedback}
              onNavigateToPayments={handleNavigateToPayments}
              onLogout={handleLogout}
              onHome={handleNavigateToHome}
              userName={user?.name || user?.email}
              profileImage={user?.profileImage}
            />
          </PrivateRoute>
        }
      />
      
      <Route
        path="/pending-requests"
        element={
          <PrivateRoute>
            <PendingRequests 
              onBack={handleNavigateToDashboard}
              onNavigateToProfile={handleNavigateToProfile}
              onNavigateToUserManagement={handleNavigateToUserManagement}
              onNavigateToFeedback={handleNavigateToFeedback}
              onNavigateToPayments={handleNavigateToPayments}
              onLogout={handleLogout}
              onHome={handleNavigateToHome}
              userName={user?.name || user?.email}
              profileImage={user?.profileImage}
            />
          </PrivateRoute>
        }
      />
      
      <Route
        path="/feedback"
        element={
          <PrivateRoute>
            <Feedback 
              onBack={handleNavigateToDashboard}
              onNavigateToProfile={handleNavigateToProfile}
              onNavigateToUserManagement={handleNavigateToUserManagement}
              onNavigateToPendingRequests={handleNavigateToPendingRequests}
              onNavigateToPayments={handleNavigateToPayments}
              onLogout={handleLogout}
              onHome={handleNavigateToHome}
              userName={user?.name || user?.email}
              profileImage={user?.profileImage}
            />
          </PrivateRoute>
        }
      />
      
      <Route
        path="/payments"
        element={
          <PrivateRoute>
            <Payments 
              onBack={handleNavigateToDashboard}
              onNavigateToProfile={handleNavigateToProfile}
              onNavigateToUserManagement={handleNavigateToUserManagement}
              onNavigateToPendingRequests={handleNavigateToPendingRequests}
              onNavigateToFeedback={handleNavigateToFeedback}
              onLogout={handleLogout}
              onHome={handleNavigateToHome}
              userName={user?.name || user?.email}
              profileImage={user?.profileImage}
            />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
