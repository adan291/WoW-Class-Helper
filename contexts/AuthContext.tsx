import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserRole } from '../types.ts';

interface User {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('wow_class_helper_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    const stored = localStorage.getItem('wow_class_helper_role');
    if (stored === 'user' || stored === 'master' || stored === 'admin') {
      return stored;
    }
    return 'user';
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('wow_class_helper_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('wow_class_helper_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('wow_class_helper_role', userRole);
  }, [userRole]);

  const login = (newUser: User) => {
    setUser(newUser);
    setUserRoleState(newUser.role);
  };

  const logout = () => {
    setUser(null);
    setUserRoleState('user');
  };

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    if (user) {
      setUser({ ...user, role });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        userRole,
        setUserRole,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
