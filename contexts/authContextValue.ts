import { createContext } from 'react';
import type { UserRole } from '../types.ts';
import type { Session } from '@supabase/supabase-js';

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
