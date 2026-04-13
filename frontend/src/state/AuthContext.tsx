import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { FacultyService } from '../services/FacultyService';
import { StudentService } from '../services/StudentService';
import type {
  AdminCredentials,
  AuthUser,
  UserCredentials,
} from '../types/models';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  loginAdmin: (credentials: AdminCredentials) => Promise<AuthUser>;
  loginUser: (credentials: UserCredentials) => Promise<AuthUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/* eslint-disable react-refresh/only-export-components */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const rawUser = localStorage.getItem('user');
    if (token && rawUser) {
      try {
        setUser(JSON.parse(rawUser) as AuthUser);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const loginAdmin = async (credentials: AdminCredentials): Promise<AuthUser> => {
    const res = await FacultyService.login(credentials);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  };

  const loginUser = async (credentials: UserCredentials): Promise<AuthUser> => {
    const res = await StudentService.login(credentials);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value: AuthContextValue = { user, loginAdmin, loginUser, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

