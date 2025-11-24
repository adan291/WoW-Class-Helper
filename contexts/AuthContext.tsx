import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.ts';
import type { UserRole } from '../types.ts';
import type { Session } from '@supabase/supabase-js';
import { profileService } from '../services/databaseService.ts';
import { auditService } from '../services/auditService.ts';

interface User {
  id: string;
  email?: string;
  role: UserRole;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  login: () => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRoleState] = useState<UserRole>('user');

  const loadUserProfile = React.useCallback(async (userId: string, email?: string) => {
    let profile = await profileService.getProfile(userId);

    // Create profile if it doesn't exist
    if (!profile && email) {
      profile = await profileService.createProfile(userId, email);
    }

    if (profile) {
      setUser({
        id: profile.id,
        email: profile.email,
        role: profile.role,
      });
      setUserRoleState(profile.role);
    } else {
      // Fallback if profile creation fails
      setUser({
        id: userId,
        email,
        role: 'user',
      });
      setUserRoleState('user');
    }
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id, session.user.email);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        await loadUserProfile(session.user.id, session.user.email);
        if (event === 'SIGNED_IN') {
          await auditService.log(session.user.id, 'login', 'auth');
        }
      } else {
        setUser(null);
        setUserRoleState('user');
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserProfile]);

  const login = () => {
    console.log('Login requested');
  };

  const logout = async () => {
    if (user) {
      await auditService.log(user.id, 'logout', 'auth');
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
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

// Hook moved to hooks/useAuth.ts to fix Fast Refresh warning
