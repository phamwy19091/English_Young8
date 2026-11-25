import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSession } from '../types/user';
import { getAuthSession, saveAuthSession, clearAuthSession } from '../services/storageService';
import { supabaseService } from '../services/supabaseService';

interface AuthContextType {
  user: UserSession | null;
  role: 'student' | 'admin';
  isAuthenticated: boolean;
  login: (username: string, pin: string) => Promise<{ success: boolean; message?: string }>;
  register: (payload: {
    username: string;
    password: string;
    fullName: string;
    role?: 'student' | 'admin';
    createdByAdmin?: boolean;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchUser: (username: string, role?: 'student' | 'admin', fullName?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    return getAuthSession();
  });

  // When Supabase Cloud is configured, verify the real server-side JWT session on mount
  // so tampered localStorage sessions (e.g. forged role='admin') cannot bypass auth.
  useEffect(() => {
    if (!supabaseService.isConfigured()) return;

    let isMounted = true;
    supabaseService.getVerifiedSession().then(verifiedUser => {
      if (!isMounted) return;
      if (verifiedUser) {
        setUser(verifiedUser);
        saveAuthSession(verifiedUser);
      } else {
        clearAuthSession();
        setUser(null);
      }
    });

    const client = supabaseService.getClient();
    const subscription = client?.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        clearAuthSession();
        setUser(null);
      }
    });

    return () => {
      isMounted = false;
      subscription?.data?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      saveAuthSession(user);
    } else {
      clearAuthSession();
    }
  }, [user]);

  const switchUser = (username: string, role: 'student' | 'admin' = 'student', fullName?: string) => {
    // Disallow arbitrary client-side role switching when connected to Supabase Cloud
    if (supabaseService.isConfigured()) {
      console.warn('switchUser is disabled when Supabase Auth is active.');
      return;
    }
    const newUser: UserSession = {
      id: `usr_${username}`,
      username,
      fullName: fullName || (role === 'admin' ? 'Quản Trị Viên' : `Học Sinh (${username})`),
      role,
    };
    setUser(newUser);
  };

  const login = async (username: string, pin: string): Promise<{ success: boolean; message?: string }> => {
    const res = await supabaseService.login(username, pin);
    if (res.success && res.user) {
      setUser(res.user);
      saveAuthSession(res.user);
      if (res.user.role === 'admin') {
        window.location.hash = '#/admin';
      } else {
        window.location.hash = '#/dashboard';
      }
      return { success: true };
    }
    return { success: false, message: res.message || 'Sai tên đăng nhập hoặc mật khẩu!' };
  };

  const register = async (payload: {
    username: string;
    password: string;
    fullName: string;
    role?: 'student' | 'admin';
    createdByAdmin?: boolean;
  }): Promise<{ success: boolean; message?: string }> => {
    const res = await supabaseService.register(payload);
    if (res.success && res.user) {
      if (!payload.createdByAdmin) {
        setUser(res.user);
        saveAuthSession(res.user);
        window.location.hash = '#/dashboard';
      }
      return { success: true };
    }
    return { success: false, message: res.message || 'Đăng ký không thành công!' };
  };

  const logout = () => {
    void supabaseService.logout();
    clearAuthSession();
    setUser(null);
    window.location.hash = '#/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : 'student',
        isAuthenticated: !!user,
        login,
        register,
        logout,
        switchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
