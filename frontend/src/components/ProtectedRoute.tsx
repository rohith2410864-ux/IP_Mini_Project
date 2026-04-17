import { Navigate, useLocation, type Location } from 'react-router-dom';

import { useAuth } from '../state/AuthContext';
import type { Role } from '../types/models';

export type ProtectedRouteProps = {
  allowedRoles?: Role[];
  loginPath: string;
  children: React.ReactNode;
};

const roleToLoginPath: Record<Role, string> = {
  admin: '/admin/login',
  user: '/login',
  faculty: '/admin/login',
  student: '/login',
};

const ProtectedRoute = ({
  allowedRoles,
  loginPath,
  children,
}: ProtectedRouteProps) => {
  const { user, logout, loading } = useAuth();
  const location: Location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const targetLogin = roleToLoginPath[user.role] || '/login';
    logout();
    return <Navigate to={targetLogin} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

