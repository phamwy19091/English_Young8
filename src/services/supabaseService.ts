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

  /**
   * Fetch full student record from Supabase Cloud (avatar_url snapshot + quiz_attempts)
   * Falls back to local snapshot if offline or user not found.
   */
  public async fetchStudentFullRecord(username: string, userId?: string): Promise<StudentSnapshot> {
    const localSnapshot = getStudentSnapshot(username);

    if (!this.client) {
      return localSnapshot;
    }

    try {
      const userQuery = username
        ? this.client.from('users').select('*').eq('username', username).maybeSingle()
        : this.client.from('users').select('*').eq('id', userId).maybeSingle();

      const { data: userRow, error } = await userQuery;
      if (error || !userRow) {
        return localSnapshot;
      }

      const resolvedId = userRow.id || userId;
      let cloudSnapshotRaw: any = null;

      if (userRow.avatar_url && typeof userRow.avatar_url === 'string' && userRow.avatar_url.startsWith('{')) {
        try {
          cloudSnapshotRaw = JSON.parse(userRow.avatar_url);
        } catch (e) {
          console.warn('Failed to parse avatar_url snapshot for', username, e);
        }
      }

      // Fetch relational quiz attempts if available
      let relationalAttempts: any[] = [];
      if (resolvedId) {
        try {
          const { data: attempts } = await this.client
            .from('quiz_attempts')
            .select('*')
            .eq('user_id', resolvedId)
            .order('completed_at', { ascending: false });
          relationalAttempts = attempts || [];
        } catch (e) {
          console.warn('Failed to fetch quiz_attempts for', username, e);
        }
      }

      // Merge and normalize
      const source = cloudSnapshotRaw || {};

      // 1. learnedVocab
      let learnedVocab: string[] = [];
      if (Array.isArray(source.learnedVocab)) {
        learnedVocab = source.learnedVocab;
      } else if (source.learnedVocab && typeof source.learnedVocab === 'object') {
        learnedVocab = Object.keys(source.learnedVocab).filter(k => !!source.learnedVocab[k]);
      } else if (localSnapshot.learnedVocab?.length > 0) {
        learnedVocab = localSnapshot.learnedVocab;
      }

      // 2. unitScores (handle 'unit-1': 8 or 1: 8)
      const unitScores: Record<number, number> = { ...(localSnapshot.unitScores || {}) };
      if (source.unitScores && typeof source.unitScores === 'object') {
        for (const [k, v] of Object.entries(source.unitScores)) {
          const cleanKey = k.replace(/^unit-?/i, '');
          const numKey = Number(cleanKey);
          const numVal = Number(v);
          if (!isNaN(numKey) && !isNaN(numVal)) {
            unitScores[numKey] = Math.max(unitScores[numKey] || 0, numVal);
          }
        }
      }

      // 3. examHistory
      let examHistory: any[] = [];
      if (Array.isArray(source.examHistory) && source.examHistory.length > 0) {
        examHistory = source.examHistory;
      } else if (localSnapshot.examHistory?.length > 0) {
        examHistory = localSnapshot.examHistory;
      }

      // If relational quiz attempts exist, make sure they are in examHistory
      if (relationalAttempts.length > 0) {
        const existingExamIds = new Set(examHistory.map(h => h.id || `${h.examId}_${h.date}`));
        for (const att of relationalAttempts) {
          if (!existingExamIds.has(att.id)) {
            examHistory.push({
              id: att.id,
              examId: att.exercise_id,
              examTitle: `Bài kiểm tra ${att.exercise_id}`,
              score: att.score,
              score10: att.score,
              correct: att.raw_score,
              total: att.total_questions,
              timeSpentSeconds: att.time_spent_seconds || 0,
              date: new Date(att.completed_at).toLocaleString('vi-VN'),
              submittedAt: att.completed_at,
              answers: {}
            });
          }
        }
      }

      // 4. mistakes
      let mistakes: any[] = [];
      if (Array.isArray(source.mistakes)) {
        mistakes = source.mistakes;
      } else if (source.mistakes && typeof source.mistakes === 'object') {
        mistakes = Object.values(source.mistakes);
      } else if (localSnapshot.mistakes?.length > 0) {
        mistakes = localSnapshot.mistakes;
      }

      const mergedSnapshot: StudentSnapshot = {
        username: userRow.username || username,
        learnedVocab,
        unitScores,
        examHistory,
        mistakes,
        streak: {
          currentStreak: userRow.streak_days || source.streak?.currentStreak || localSnapshot.streak?.currentStreak || 1,
          lastStudyDate: source.streak?.lastStudyDate || localSnapshot.streak?.lastStudyDate || new Date().toISOString().split('T')[0],
        },
        updatedAt: source.updatedAt || new Date().toISOString(),
      };

      saveStudentSnapshot(mergedSnapshot);
      return mergedSnapshot;
    } catch (err) {
      console.warn('fetchStudentFullRecord exception:', err);
      return localSnapshot;
    }
  }

  /**
   * Sync student state snapshot to Supabase Cloud users.avatar_url
   */
  public async syncStudentSnapshotToCloud(user: UserSession, snapshot: StudentSnapshot): Promise<boolean> {
    if (!user || user.role === 'admin' || !this.client) return false;

    try {
      const snapshotPayload = {
        learnedVocab: snapshot.learnedVocab || [],
        unitScores: snapshot.unitScores || {},
        examHistory: (snapshot.examHistory || []).slice(0, 50),
        mistakes: snapshot.mistakes || [],
        updatedAt: new Date().toISOString(),
      };

      await this.client
        .from('users')
        .update({
          avatar_url: JSON.stringify(snapshotPayload),
          last_active_at: new Date().toISOString(),
        })
        .eq('username', user.username);

      return true;
    } catch (e) {
      console.warn('syncStudentSnapshotToCloud error:', e);
      return false;
    }
  }
}

export const supabaseService = new SupabaseService();
