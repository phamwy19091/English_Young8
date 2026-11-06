export interface UserSession {
  id: string;
  username: string;
  fullName: string;
  role: 'student' | 'admin';
  pinCode?: string;
  streakDays?: number;
  lastLoginAt?: string;
}

export interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
