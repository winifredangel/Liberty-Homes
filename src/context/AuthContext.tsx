import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, TARGET_ADMIN_USER_ID, logAuditAction } from '../lib/supabase';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'unauthorized';
  isTargetAdmin: boolean;
}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  isAdmin: boolean;
  isTargetAdminUser: boolean;
  error: string | null;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  simulateTargetAdminLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'liberty_admin_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkCurrentSession() {
      setLoading(true);
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await evaluateUserRole(session.user.id, session.user.email || '');
          } else {
            setUser(null);
          }
        } else {
          // Check local stored session
          const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.id === TARGET_ADMIN_USER_ID) {
              setUser(parsed);
            }
          }
        }
      } catch (err: any) {
        console.error('Session verification error:', err);
      } finally {
        setLoading(false);
      }
    }

    checkCurrentSession();

    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await evaluateUserRole(session.user.id, session.user.email || '');
        } else {
          setUser(null);
        }
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  async function evaluateUserRole(userId: string, email: string) {
    const isTarget = userId === TARGET_ADMIN_USER_ID;

    // Check user_roles table in Supabase
    let hasAdminRole = false;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle();

        if (!roleError && data?.role === 'admin') {
          hasAdminRole = true;
        }
      } catch (e) {
        console.warn('Could not verify role from Supabase, checking target UUID', e);
      }
    }

    // Role check requirement: user must match Target UUID or have admin record
    if (isTarget || hasAdminRole) {
      const adminObj: AdminUser = {
        id: userId,
        email: email || 'winifredmaduabuchi368@gmail.com',
        role: 'admin',
        isTargetAdmin: isTarget,
      };
      setUser(adminObj);
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminObj));
      await logAuditAction('ADMIN_LOGIN_SUCCESS', 'auth', userId, { email });
    } else {
      setUser({
        id: userId,
        email,
        role: 'unauthorized',
        isTargetAdmin: false,
      });
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      setError('Access Denied: Your account does not have administrator privileges for Liberty Homes.');
      await logAuditAction('ADMIN_LOGIN_DENIED', 'auth', userId, { email, reason: 'unauthorized_role' });
    }
  }

  async function login(identifier: string, pass: string): Promise<{ success: boolean; error?: string }> {
    setError(null);
    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        // Authenticate via Supabase Auth
        // Supabase Auth email format check
        const isEmail = identifier.includes('@');
        const loginEmail = isEmail ? identifier.trim() : `${identifier.trim()}@libertyhomes.ng`;

        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: pass,
        });

        if (authError) {
          setError(authError.message);
          return { success: false, error: authError.message };
        }

        if (data.user) {
          // Verify that user ID is the authorized administrator
          if (data.user.id !== TARGET_ADMIN_USER_ID) {
            // Also check if admin role was granted in database
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', data.user.id)
              .eq('role', 'admin')
              .maybeSingle();

            if (roleData?.role !== 'admin') {
              setError(`Unauthorized: User ID ${data.user.id} does not match authorized administrator ID (${TARGET_ADMIN_USER_ID}).`);
              await supabase.auth.signOut();
              return {
                success: false,
                error: `Access Denied: This account (${data.user.email}) does not match authorized administrator ID ${TARGET_ADMIN_USER_ID}.`,
              };
            }
          }

          await evaluateUserRole(data.user.id, data.user.email || loginEmail);
          return { success: true };
        }
      } else {
        // Local simulation / developer verification mode
        // Ensures the existing admin account UUID is preserved and used
        const adminObj: AdminUser = {
          id: TARGET_ADMIN_USER_ID,
          email: identifier.includes('@') ? identifier : `${identifier}@libertyhomes.ng`,
          role: 'admin',
          isTargetAdmin: true,
        };
        setUser(adminObj);
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminObj));
        await logAuditAction('ADMIN_LOCAL_SESSION_INIT', 'auth', TARGET_ADMIN_USER_ID, { identifier });
        return { success: true };
      }

      return { success: false, error: 'Authentication could not be completed.' };
    } catch (err: any) {
      const msg = err.message || 'An unexpected error occurred during login.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }

  async function simulateTargetAdminLogin(): Promise<void> {
    const adminObj: AdminUser = {
      id: TARGET_ADMIN_USER_ID,
      email: 'admin@libertyhomes.ng',
      role: 'admin',
      isTargetAdmin: true,
    };
    setUser(adminObj);
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminObj));
    await logAuditAction('TARGET_ADMIN_SESSION_ATTACHED', 'auth', TARGET_ADMIN_USER_ID);
  }

  async function logout(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    await logAuditAction('ADMIN_LOGOUT', 'auth', user?.id || null);
  }

  const isAdmin = Boolean(user && user.role === 'admin');
  const isTargetAdminUser = Boolean(user && user.id === TARGET_ADMIN_USER_ID);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isTargetAdminUser,
        error,
        login,
        logout,
        simulateTargetAdminLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
