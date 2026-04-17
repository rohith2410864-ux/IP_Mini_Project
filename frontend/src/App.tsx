import { Route, Routes } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';

import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';

import AdminDashboard from './pages/AdminDashboard';
import ManageEvents from './pages/ManageEvents';
import ViewParticipants from './pages/ViewParticipants';

import BrowseEvents from './pages/BrowseEvents';
import EventDetails from './pages/EventDetails';
import MyRegistrations from './pages/MyRegistrations';
import UserDashboard from './pages/UserDashboard';

import AdminLoginPage from './pages/AdminLoginPage';
import AdminRegisterPage from './pages/AdminRegisterPage';
import UserLoginPage from './pages/UserLoginPage';
import UserRegisterPage from './pages/UserRegisterPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import type { Role } from './types/models';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<RoleSelectionPage />} />

      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/register" element={<AdminRegisterPage />} />
      <Route path="/login" element={<UserLoginPage />} />
      <Route path="/register" element={<UserRegisterPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin', 'faculty'] as Role[]} loginPath="/admin/login">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="manage-events" element={<ManageEvents />} />
        <Route path="participants" element={<ViewParticipants />} />
      </Route>

      <Route
        path="/user"
        element={
          <ProtectedRoute allowedRoles={['user', 'student'] as Role[]} loginPath="/login">
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserDashboard />} />
        <Route path="events" element={<BrowseEvents />} />
        <Route path="events/:id" element={<EventDetails />} />
        <Route path="registrations" element={<MyRegistrations />} />
      </Route>

      <Route
        path="*"
        element={
          <div style={{ padding: '100px', textAlign: 'center', fontFamily: 'sans-serif' }}>
            <h1 style={{ fontSize: '3rem', color: '#0b4f9f' }}>404</h1>
            <p>Oops! The page you are looking for doesn't exist.</p>
            <a href="/" style={{ color: '#0b4f9f', fontWeight: 'bold' }}>
              Return Home
            </a>
          </div>
        }
      />
    </Routes>
  );
};

export default App;

