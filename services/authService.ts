/**
 * Authentication Service
 * Manages user authentication and sessions
 */

export interface User {
  id: string;
  email: string;
  username: string;
  password?: string; // Never stored in real implementation
  createdAt: number;
  lastLogin: number;
  isVerified: boolean;
  role: 'user' | 'moderator' | 'admin';
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  createdAt: number;
  expiresAt: number;
  isActive: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

class AuthService {
  private readonly USERS_KEY = 'wow_class_helper_users';
  private readonly SESSIONS_KEY = 'wow_class_helper_sessions';
  private readonly CURRENT_USER_KEY = 'wow_class_helper_current_user';
  private currentUser: User | null = null;
  private currentSession: Session | null = null;

  constructor() {
    this.loadCurrentSession();
  }

  /**
   * Register new user
   */
  register(email: string, username: string, password: string): AuthResponse {
    // Validate input
    if (!this.validateEmail(email)) {
      return { success: false, message: 'Invalid email format' };
    }

    if (!this.validatePassword(password)) {
      return { success: false, message: 'Password too weak' };
    }

    if (username.length < 3 || username.length > 20) {
      return { success: false, message: 'Username must be 3-20 characters' };
    }

    // Check if user exists
    if (this.getUserByEmail(email)) {
      return { success: false, message: 'Email already registered' };
    }

    if (this.getUserByUsername(username)) {
      return { success: false, message: 'Username already taken' };
    }

    // Create user
    const user: User = {
      id: this.generateId(),
      email,
      username,
      createdAt: Date.now(),
      lastLogin: 0,
      isVerified: false,
      role: 'user',
    };

    this.saveUser(user);

    return {
      success: true,
      message: 'Registration successful',
      user: { ...user },
    };
  }

  /**
   * Login user
   */
  login(email: string, password: string): AuthResponse {
    const user = this.getUserByEmail(email);

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // In real implementation, verify password hash
    // For now, just check if password is provided
    if (!password) {
      return { success: false, message: 'Invalid credentials' };
    }

    // Create session
    const session = this.createSession(user.id);

    // Update last login
    user.lastLogin = Date.now();
    this.updateUser(user);

    this.currentUser = user;
    this.currentSession = session;
    this.saveCurrentSession();

    return {
      success: true,
      message: 'Login successful',
      user: { ...user },
      token: session.token,
    };
  }

  /**
   * Logout user
   */
  logout(): AuthResponse {
    if (this.currentSession) {
      this.currentSession.isActive = false;
      this.updateSession(this.currentSession);
    }

    this.currentUser = null;
    this.currentSession = null;

    try {
      localStorage.removeItem(this.CURRENT_USER_KEY);
    } catch {
      console.error('Failed to clear session');
    }

    return { success: true, message: 'Logout successful' };
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser ? { ...this.currentUser } : null;
  }

  /**
   * Get current session
   */
  getCurrentSession(): Session | null {
    return this.currentSession ? { ...this.currentSession } : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (!this.currentSession || !this.currentUser) return false;

    // Check if session is expired
    if (this.currentSession.expiresAt < Date.now()) {
      this.logout();
      return false;
    }

    return this.currentSession.isActive;
  }

  /**
   * Verify token
   */
  verifyToken(token: string): boolean {
    if (!this.currentSession) return false;
    return this.currentSession.token === token && this.currentSession.isActive;
  }

  /**
   * Change password
   */
  changePassword(oldPassword: string, newPassword: string): AuthResponse {
    if (!this.currentUser) {
      return { success: false, message: 'Not authenticated' };
    }

    if (!this.validatePassword(newPassword)) {
      return { success: false, message: 'Password too weak' };
    }

    // In real implementation, verify old password hash
    if (!oldPassword) {
      return { success: false, message: 'Invalid old password' };
    }

    // Update password (in real implementation, hash it)
    this.currentUser.password = newPassword;
    this.updateUser(this.currentUser);

    return { success: true, message: 'Password changed successfully' };
  }

  /**
   * Reset password
   */
  resetPassword(email: string): AuthResponse {
    const user = this.getUserByEmail(email);

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // In real implementation, send reset email
    const resetToken = this.generateId();
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return { success: true, message: 'Password reset email sent' };
  }

  /**
   * Get user by email
   */
  private getUserByEmail(email: string): User | null {
    try {
      const data = localStorage.getItem(this.USERS_KEY);
      if (!data) return null;

      const users: User[] = JSON.parse(data);
      return users.find((u) => u.email === email) || null;
    } catch {
      return null;
    }
  }

  /**
   * Get user by username
   */
  private getUserByUsername(username: string): User | null {
    try {
      const data = localStorage.getItem(this.USERS_KEY);
      if (!data) return null;

      const users: User[] = JSON.parse(data);
      return users.find((u) => u.username === username) || null;
    } catch {
      return null;
    }
  }

  /**
   * Create session
   */
  private createSession(userId: string): Session {
    const session: Session = {
      id: this.generateId(),
      userId,
      token: this.generateToken(),
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      isActive: true,
    };

    this.saveSession(session);
    return session;
  }

  /**
   * Save user
   */
  private saveUser(user: User): void {
    try {
      const data = localStorage.getItem(this.USERS_KEY);
      const users: User[] = data ? JSON.parse(data) : [];
      users.push(user);
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    } catch {
      console.error('Failed to save user');
    }
  }

  /**
   * Update user
   */
  private updateUser(user: User): void {
    try {
      const data = localStorage.getItem(this.USERS_KEY);
      if (!data) return;

      const users: User[] = JSON.parse(data);
      const index = users.findIndex((u) => u.id === user.id);

      if (index >= 0) {
        users[index] = user;
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      }
    } catch {
      console.error('Failed to update user');
    }
  }

  /**
   * Save session
   */
  private saveSession(session: Session): void {
    try {
      const data = localStorage.getItem(this.SESSIONS_KEY);
      const sessions: Session[] = data ? JSON.parse(data) : [];
      sessions.push(session);
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
    } catch {
      console.error('Failed to save session');
    }
  }

  /**
   * Update session
   */
  private updateSession(session: Session): void {
    try {
      const data = localStorage.getItem(this.SESSIONS_KEY);
      if (!data) return;

      const sessions: Session[] = JSON.parse(data);
      const index = sessions.findIndex((s) => s.id === session.id);

      if (index >= 0) {
        sessions[index] = session;
        localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
      }
    } catch {
      console.error('Failed to update session');
    }
  }

  /**
   * Save current session
   */
  private saveCurrentSession(): void {
    try {
      if (this.currentUser && this.currentSession) {
        localStorage.setItem(
          this.CURRENT_USER_KEY,
          JSON.stringify({
            user: this.currentUser,
            session: this.currentSession,
          })
        );
      }
    } catch {
      console.error('Failed to save current session');
    }
  }

  /**
   * Load current session
   */
  private loadCurrentSession(): void {
    try {
      const data = localStorage.getItem(this.CURRENT_USER_KEY);
      if (data) {
        const { user, session } = JSON.parse(data);
        this.currentUser = user;
        this.currentSession = session;
      }
    } catch {
      this.currentUser = null;
      this.currentSession = null;
    }
  }

  /**
   * Validate email
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password
   */
  private validatePassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Generate ID
   */
  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate token
   */
  private generateToken(): string {
    return `token_${Date.now()}_${Math.random().toString(36).substr(2, 20)}`;
  }
}

export const authService = new AuthService();
