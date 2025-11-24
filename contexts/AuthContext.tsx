import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.ts';
import type { UserRole } from '../types.ts';
import type { Session } from '@supabase/supabase-js';

interface User {
  id: string;
  email?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void; // Kept for compatibility, but ideally should be managed via DB
  login: () => void; // Triggered via Supabase UI or custom form
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRoleState] = useState<UserRole>('user');

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          role: 'user', // Default role, will fetch from DB later
        });
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          role: 'user', // Default role
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = () => {
    // Placeholder: In real app, this might redirect to login page or open modal
    console.log('Login requested');
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRoleState('user');
  };

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    // In a real app, this would update the user's profile in the DB
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!session,
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
