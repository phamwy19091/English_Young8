import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StudentSnapshot, SystemConfig } from '../types/storage';
import { UserSession } from '../types/user';
import {
  STORAGE_KEYS,
  getStudentSnapshot,
  saveStudentSnapshot,
  getSystemConfig,
  saveSystemConfig,
  getLocalUsers,
  saveLocalUsers,
  addLocalUser,
  updateLocalUser,
  deleteLocalUser
} from './storageService';

export const DEFAULT_SUPABASE_CONFIG = {
  PROJECT_REF: 'iiltwryccctzjbfddjcw',
  URL: 'https://iiltwryccctzjbfddjcw.supabase.co',
  ANON_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpbHR3cnljY2N0empiZmRkamN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyNzMxMTgsImV4cCI6MjEwODg0OTExOH0.6hJjVxbdeFrCyvd-VN_U_rJY-jqAFIY7WbqRZLv6axo',
};

class SupabaseService {
  private client: SupabaseClient | null = null;
  private url: string;
  private anonKey: string;

  constructor() {
    this.url = this.getStoredUrl() || DEFAULT_SUPABASE_CONFIG.URL;
    this.anonKey = this.getStoredAnonKey() || DEFAULT_SUPABASE_CONFIG.ANON_KEY;
    this.initClient();
  }

  private getStoredUrl(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(STORAGE_KEYS.SUPABASE_URL);
  }

  private getStoredAnonKey(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(STORAGE_KEYS.SUPABASE_ANON);
  }

  private initClient(): void {
    if (this.url && this.anonKey) {
      try {
        this.client = createClient(this.url, this.anonKey, {
          auth: {
            persistSession: false,
          },
        });
      } catch (err) {
        console.warn('Failed to initialize Supabase client:', err);
        this.client = null;
      }
    }
  }

  public getClient(): SupabaseClient | null {
    return this.client;
  }

  public updateCredentials(url: string, anonKey: string): void {
    this.url = url.trim();
    this.anonKey = anonKey.trim();
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, this.url);
      window.localStorage.setItem(STORAGE_KEYS.SUPABASE_ANON, this.anonKey);
    }
    this.initClient();
  }

  public isConfigured(): boolean {
    return !!this.client;
  }

  /**
   * Pushes the student snapshot to Supabase with automatic local storage fallback.
   */
  public async syncSnapshot(username: string, snapshot?: StudentSnapshot): Promise<boolean> {
    const dataToSync = snapshot || getStudentSnapshot(username);

    // Always ensure local snapshot is up-to-date
    saveStudentSnapshot(dataToSync);

    if (!this.client) {
      return false; // Stored locally only
    }

    try {
      const payloadString = JSON.stringify(dataToSync);
      const { error } = await this.client
        .from('users')
        .update({ avatar_url: payloadString })
        .eq('username', username);

      if (error) {
        console.warn(`Cloud sync warning for user ${username}:`, error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn(`Cloud sync exception for user ${username}:`, err);
      return false;
    }
  }

  /**
   * Fetches student snapshot from cloud, falling back to local snapshot if offline.
   */
  public async fetchSnapshot(username: string): Promise<StudentSnapshot> {
    const local = getStudentSnapshot(username);

    if (!this.client) {
      return local;
    }

    try {
      const { data, error } = await this.client
        .from('users')
        .select('avatar_url')
        .eq('username', username)
        .maybeSingle();

      if (error || !data || !data.avatar_url) {
        return local;
      }

      const cloudSnapshot: StudentSnapshot = JSON.parse(data.avatar_url);
      // If cloud is newer or valid, update local cache
      if (cloudSnapshot && cloudSnapshot.updatedAt) {
        const cloudTime = new Date(cloudSnapshot.updatedAt).getTime();
        const localTime = new Date(local.updatedAt).getTime();
        if (cloudTime >= localTime) {
          saveStudentSnapshot(cloudSnapshot);
          return cloudSnapshot;
        }
      }
      return local;
    } catch (err) {
      console.warn(`Fetch cloud snapshot exception for ${username}:`, err);
      return local;
    }
  }

  /**
   * Syncs system config (homework assignments & custom questions).
   */
  public async syncSystemConfig(config?: SystemConfig): Promise<boolean> {
    const data = config || getSystemConfig();
    saveSystemConfig(data);

    if (!this.client) return false;

    try {
      const SYSTEM_USERNAME = '__ey8_system_store__';
      const { error } = await this.client
        .from('users')
        .update({ avatar_url: JSON.stringify(data) })
        .eq('username', SYSTEM_USERNAME);

      return !error;
    } catch (err) {
      console.warn('Sync system config exception:', err);
      return false;
    }
  }

  /**
   * Tests connection to Supabase endpoint.
   */
  public async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.client) {
      return { success: false, message: 'Supabase client is not initialized.' };
    }

    try {
      const { error } = await this.client.from('users').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Kết nối Supabase Cloud thành công.' };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Lỗi kết nối không xác định.',
      };
    }
  }

  /**
   * Login user with username and password/PIN
   */
  public async login(username: string, password: string): Promise<{ success: boolean; user?: UserSession; message?: string }> {
    const uName = (username || '').trim().toLowerCase();
    const pwd = (password || '').trim();

    if (!uName || !pwd) {
      return { success: false, message: 'Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu!' };
    }

    // 1. Try Supabase Cloud first
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('users')
          .select('id, username, full_name, role, pin_code, avatar_url, streak_days')
          .eq('username', uName)
          .neq('role', 'system')
          .maybeSingle();

        if (!error && data) {
          if (data.pin_code && data.pin_code !== pwd) {
            return { success: false, message: 'Mật khẩu hoặc mã PIN không chính xác!' };
          }

          const userObj: UserSession = {
            id: data.id,
            username: data.username,
            fullName: data.full_name || data.username,
            role: (data.role as any) === 'admin' ? 'admin' : 'student',
            pinCode: data.pin_code,
            streakDays: data.streak_days || 1,
            lastLoginAt: new Date().toISOString(),
          };

          // Cache to local users list
          addLocalUser(userObj);
          return { success: true, user: userObj };
        }
      } catch (err) {
        console.warn('Supabase login exception, falling back to local:', err);
      }
    }

    // 2. Fallback to local users
    const localUsers = getLocalUsers();
    const matched = localUsers.find(u => u.username.toLowerCase() === uName);
    if (matched) {
      if (matched.pinCode && matched.pinCode !== pwd) {
        return { success: false, message: 'Mật khẩu hoặc mã PIN không chính xác!' };
      }
      return { success: true, user: matched };
    }

    return {
      success: false,
      message: 'Tài khoản không tồn tại. Vui lòng kiểm tra lại hoặc chuyển sang tab Đăng Ký!',
    };
  }

  /**
   * Register a new user
   */
  public async register(payload: {
    username: string;
    password: string;
    fullName: string;
    role?: 'student' | 'admin';
    createdByAdmin?: boolean;
  }): Promise<{ success: boolean; user?: UserSession; message?: string }> {
    const uName = (payload.username || '').trim().toLowerCase();
    const pwd = (payload.password || '').trim();
    const name = (payload.fullName || '').trim();

    if (!name || !uName || !pwd) {
      return { success: false, message: 'Vui lòng điền đầy đủ Họ tên, Tên đăng nhập và Mật khẩu!' };
    }

    if (!/^[a-z0-9_]+$/.test(uName)) {
      return {
        success: false,
        message: 'Tên đăng nhập chỉ được chứa chữ cái thường không dấu, số hoặc gạch dưới (_)!',
      };
    }

    if (pwd.length < 4) {
      return { success: false, message: 'Mật khẩu phải có ít nhất 4 ký tự!' };
    }

    const finalRole: 'student' | 'admin' = payload.createdByAdmin && payload.role ? payload.role : 'student';
    const localUsers = getLocalUsers();

    if (localUsers.some(u => u.username.toLowerCase() === uName)) {
      return { success: false, message: 'Tên đăng nhập này đã tồn tại trên máy. Vui lòng chọn tên khác!' };
    }

    const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const userSession: UserSession = {
      id: newId,
      username: uName,
      fullName: name,
      role: finalRole,
      pinCode: pwd,
      streakDays: 1,
      lastLoginAt: new Date().toISOString(),
    };

    // 1. Try Supabase Cloud
    if (this.client) {
      try {
        const { data: existing } = await this.client
          .from('users')
          .select('id')
          .eq('username', uName)
          .maybeSingle();

        if (existing) {
          return { success: false, message: 'Tên đăng nhập này đã được sử dụng trên máy chủ Cloud!' };
        }

        await this.client.from('users').insert({
          id: newId,
          username: uName,
          full_name: name,
          role: finalRole,
          pin_code: pwd,
          streak_days: 1,
          last_active_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Supabase register error:', err);
      }
    }

    // 2. Save locally
    addLocalUser(userSession);
    return { success: true, user: userSession };
  }

  /**
   * Get all registered users (for Admin Portal)
   */
  public async getAllUsers(): Promise<UserSession[]> {
    const localList = getLocalUsers();

    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('users')
          .select('id, username, full_name, role, pin_code, avatar_url, streak_days, last_active_at, created_at')
          .neq('username', '__ey8_system_store__')
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          const merged: UserSession[] = data.map(row => ({
            id: row.id,
            username: row.username,
            fullName: row.full_name || row.username,
            role: (row.role as any) === 'admin' ? 'admin' : 'student',
            pinCode: row.pin_code || '****',
            streakDays: row.streak_days || 1,
            lastLoginAt: row.last_active_at,
          }));

          saveLocalUsers(merged);
          return merged;
        }
      } catch (err) {
        console.warn('Supabase getAllUsers exception:', err);
      }
    }

    return localList;
  }

  /**
   * Update user info or password
   */
  public async updateUserPasswordOrInfo(
    username: string,
    updates: Partial<UserSession>
  ): Promise<{ success: boolean; message?: string }> {
    updateLocalUser(username, updates);

    if (this.client) {
      try {
        const dbUpdates: any = {};
        if (updates.fullName) dbUpdates.full_name = updates.fullName;
        if (updates.pinCode) dbUpdates.pin_code = updates.pinCode;
        if (updates.role) dbUpdates.role = updates.role;
        await this.client.from('users').update(dbUpdates).eq('username', username);
      } catch (err) {
        console.warn('Supabase updateUser error:', err);
      }
    }

    return { success: true };
  }

  /**
   * Delete user account
   */
  public async deleteUserAccount(username: string): Promise<{ success: boolean; message?: string }> {
    if (username === 'admin' || username === 'em_lop8') {
      return { success: false, message: 'Không thể xóa 2 tài khoản hệ thống mặc định (admin & em_lop8)!' };
    }

    deleteLocalUser(username);

    if (this.client) {
      try {
        await this.client.from('users').delete().eq('username', username);
      } catch (err) {
        console.warn('Supabase deleteUser error:', err);
      }
    }

    return { success: true };
  }
}

export const supabaseService = new SupabaseService();
