import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSession } from '../types/user';
import { getAuthSession, saveAuthSession, clearAuthSession } from '../services/storageService';

interface AuthContextType {
  user: UserSession;
  role: 'student' | 'admin';
  isAuthenticated: boolean;
  toggleRole: () => void;
  switchUser: (username: string, role?: 'student' | 'admin', fullName?: string) => void;
  login: (username: string, pin?: string) => Promise<boolean>;
  logout: () => void;
}

const DEFAULT_STUDENT_SESSION: UserSession = {
  id: 'usr_em_lop8',
  username: 'em_lop8',
  fullName: 'Em Lớp 8',
  role: 'student',
  streakDays: 1
};

const DEFAULT_ADMIN_SESSION: UserSession = {
  id: 'usr_admin',
  username: 'admin',
  fullName: 'Quản Trị Viên',
  role: 'admin'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession>(() => {
    const saved = getAuthSession();
    return saved || DEFAULT_STUDENT_SESSION;
  });

  useEffect(() => {
    saveAuthSession(user);
  }, [user]);

  const toggleRole = () => {
    setUser(prev => {
      if (prev.role === 'admin') {
        return DEFAULT_STUDENT_SESSION;
      } else {
        return DEFAULT_ADMIN_SESSION;
      }
    });
  };

  const switchUser = (username: string, role: 'student' | 'admin' = 'student', fullName?: string) => {
    const newUser: UserSession = {
      id: `usr_${username}`,
      username,
      fullName: fullName || (role === 'admin' ? 'Quản Trị Viên' : `Học Sinh (${username})`),
      role
    };
    setUser(newUser);
  };

  const login = async (username: string, _pin?: string): Promise<boolean> => {
    const role: 'student' | 'admin' = username.toLowerCase() === 'admin' ? 'admin' : 'student';
    switchUser(username, role);
    return true;
  };

  const logout = () => {
    clearAuthSession();
    setUser(DEFAULT_STUDENT_SESSION);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user.role,
        isAuthenticated: true,
        toggleRole,
        switchUser,
        login,
        logout
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
