import { createClient, SupabaseClient, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { StudentSnapshot, MistakeItem, SystemConfig } from '../types/storage';
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
  deleteLocalUser,
  normalizeMistakeItem,
  normalizeExamAttempt,
} from './storageService';

export const DEFAULT_SUPABASE_CONFIG = {
  URL: (import.meta.env.VITE_SUPABASE_URL || '').trim(),
  ANON_KEY: (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim(),
};

const SYNTHETIC_EMAIL_DOMAIN = 'students.englishyoung8.app';

/**
 * Maps a username to a valid email address for Supabase Auth,
 * or returns the trimmed lowercase email directly if the user entered an email.
 */
export function toSupabaseAuthEmail(identifier: string): string {
  const clean = (identifier || '').trim().toLowerCase();
  if (clean.includes('@')) {
    return clean;
  }
  return `${clean}@${SYNTHETIC_EMAIL_DOMAIN}`;
}

/**
 * Extracts a clean display username from a Supabase Auth user object.
 */
function extractUsername(authUser: SupabaseAuthUser, fallback?: string): string {
  const metaUsername =
    typeof authUser.user_metadata?.username === 'string'
      ? authUser.user_metadata.username.trim().toLowerCase()
      : '';
  if (metaUsername) return metaUsername;
  if (fallback) return fallback.trim().toLowerCase();
  if (authUser.email) {
    return authUser.email.split('@')[0].toLowerCase();
  }
  return `user_${authUser.id.slice(0, 8)}`;
}

/**
 * Resolves the user's role strictly from server-controlled app_metadata (NEVER user_metadata).
 */
function extractTrustedRole(authUser: SupabaseAuthUser): 'student' | 'admin' {
  return authUser.app_metadata?.role === 'admin' ? 'admin' : 'student';
}

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
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        });
      } catch (err) {
        console.warn('Failed to initialize Supabase client:', err);
        this.client = null;
      }
    } else {
      this.client = null;
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
   * Verifies the active Supabase Auth session with the server and builds a trusted UserSession.
   * Returns null if not signed in or if Supabase is not configured.
   */
  public async getVerifiedSession(): Promise<UserSession | null> {
    if (!this.client) return null;

    try {
      const { data, error } = await this.client.auth.getUser();
      if (error || !data?.user) {
        return null;
      }
      return await this.buildSessionFromAuthUser(data.user);
    } catch (err) {
      console.warn('Failed to verify Supabase auth session:', err);
      return null;
    }
  }

  private async buildSessionFromAuthUser(
    authUser: SupabaseAuthUser,
    fallbackUsername?: string
  ): Promise<UserSession> {
    const trustedRole = extractTrustedRole(authUser);
    let username = extractUsername(authUser, fallbackUsername);
    let fullName =
      typeof authUser.user_metadata?.full_name === 'string' && authUser.user_metadata.full_name.trim()
        ? authUser.user_metadata.full_name.trim()
        : username;
    let streakDays = 1;

    if (this.client) {
      try {
        const { data: profile } = await this.client
          .from('users')
          .select('username, full_name, streak_days')
          .eq('id', authUser.id)
          .maybeSingle();

        if (profile) {
          if (profile.username) username = profile.username;
          if (profile.full_name) fullName = profile.full_name;
          if (typeof profile.streak_days === 'number') streakDays = profile.streak_days;
        }
      } catch (err) {
        console.warn('Profile lookup after auth failed, using token metadata:', err);
      }
    }

    return {
      id: authUser.id,
      username,
      fullName,
      role: trustedRole,
      streakDays,
      lastLoginAt: new Date().toISOString(),
    };
  }

  /**
   * Signs out from Supabase Auth if configured.
   */
  public async logout(): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.auth.signOut();
    } catch (err) {
      console.warn('Supabase signOut warning:', err);
    }
  }

  /**
   * Pushes the student snapshot to public.student_snapshots with automatic local storage fallback.
   */
  public async syncSnapshot(username: string, snapshot?: StudentSnapshot): Promise<boolean> {
    const dataToSync = snapshot || getStudentSnapshot(username);

    // Always ensure local snapshot is up-to-date
    saveStudentSnapshot(dataToSync);

    if (!this.client) {
      return false; // Stored locally only
    }

    try {
      const { data: authData } = await this.client.auth.getUser();
      const userId = authData?.user?.id;
      if (!userId) {
        return false;
      }

      const { error } = await this.client.from('student_snapshots').upsert(
        {
          user_id: userId,
          username,
          snapshot_data: dataToSync,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

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
   * Fetches student snapshot from public.student_snapshots, falling back to local snapshot if offline.
   */
  public async fetchSnapshot(username: string): Promise<StudentSnapshot> {
    const local = getStudentSnapshot(username);

    if (!this.client) {
      return local;
    }

    try {
      const { data, error } = await this.client
        .from('student_snapshots')
        .select('snapshot_data, updated_at')
        .eq('username', username)
        .maybeSingle();

      if (error || !data || !data.snapshot_data) {
        return local;
      }

      const cloudSnapshot = data.snapshot_data as StudentSnapshot;
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
   * Syncs system config (homework assignments & custom questions) to public.system_config.
   * RLS ensures only authenticated admins can write to this table.
   */
  public async syncSystemConfig(config?: SystemConfig): Promise<boolean> {
    const data = config || getSystemConfig();
    saveSystemConfig(data);

    if (!this.client) return false;

    try {
      const { error } = await this.client.from('system_config').upsert(
        {
          key: 'default',
          config_data: data,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

      if (error) {
        console.warn('Sync system config warning:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Sync system config exception:', err);
      return false;
    }
  }

  /**
   * Fetches system config from public.system_config with local fallback.
   */
  public async fetchSystemConfig(): Promise<SystemConfig> {
    const local = getSystemConfig();
    if (!this.client) return local;

    try {
      const { data, error } = await this.client
        .from('system_config')
        .select('config_data')
        .eq('key', 'default')
        .maybeSingle();

      if (error || !data?.config_data) {
        return local;
      }

      const cloudConfig = data.config_data as SystemConfig;
      saveSystemConfig(cloudConfig);
      return cloudConfig;
    } catch (err) {
      console.warn('Fetch system config exception:', err);
      return local;
    }
  }

  /**
   * Tests connection to Supabase endpoint using a public catalog table (RLS-safe).
   */
  public async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.client) {
      return { success: false, message: 'Supabase client chưa được cấu hình.' };
    }

    try {
      const { error } = await this.client.from('grades').select('id').limit(1);
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
   * Login user with username/email and password via Supabase Auth (with offline local fallback).
   */
  public async login(
    username: string,
    password: string
  ): Promise<{ success: boolean; user?: UserSession; message?: string }> {
    const uName = (username || '').trim().toLowerCase();
    const pwd = (password || '').trim();

    if (!uName || !pwd) {
      return { success: false, message: 'Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu!' };
    }

    // 1. Real Supabase Auth when configured
    if (this.client) {
      try {
        const email = toSupabaseAuthEmail(uName);
        const { data, error } = await this.client.auth.signInWithPassword({
          email,
          password: pwd,
        });

        if (error) {
          if (error.message.toLowerCase().includes('email not confirmed')) {
            return {
              success: false,
              message: 'Tài khoản chưa xác nhận email. Vui lòng kiểm tra hộp thư hoặc liên hệ quản trị viên!',
            };
          }
          return {
            success: false,
            message: 'Tên đăng nhập hoặc mật khẩu không chính xác!',
          };
        }

        if (data?.user) {
          const userObj = await this.buildSessionFromAuthUser(data.user, uName);
          return { success: true, user: userObj };
        }
      } catch (err) {
        console.warn('Supabase login network exception:', err);
        return {
          success: false,
          message: 'Không thể kết nối máy chủ xác thực. Vui lòng kiểm tra mạng và thử lại!',
        };
      }
    }

    // 2. Offline / Local-only fallback (only when Supabase is NOT configured)
    const localUsers = getLocalUsers();
    const matched = localUsers.find(u => u.username.toLowerCase() === uName);
    if (matched) {
      if (!matched.pinCode || matched.pinCode !== pwd) {
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
   * Register a new student account via Supabase Auth (with offline local fallback).
   * Note: Public self-registration ALWAYS creates role='student' (enforced in DB trigger + RLS).
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

    const isEmail = uName.includes('@');
    if (!isEmail && !/^[a-z0-9_]+$/.test(uName)) {
      return {
        success: false,
        message: 'Tên đăng nhập chỉ được chứa chữ cái thường không dấu, số hoặc gạch dưới (_)!',
      };
    }

    const minPwdLen = this.client ? 6 : 4;
    if (pwd.length < minPwdLen) {
      return { success: false, message: `Mật khẩu phải có ít nhất ${minPwdLen} ký tự!` };
    }

    // 1. Real Supabase Auth when configured
    if (this.client) {
      try {
        const email = toSupabaseAuthEmail(uName);
        const cleanUsername = isEmail ? uName.split('@')[0] : uName;

        const { data, error } = await this.client.auth.signUp({
          email,
          password: pwd,
          options: {
            data: {
              username: cleanUsername,
              full_name: name,
            },
          },
        });

        if (error) {
          if (error.message.toLowerCase().includes('already registered')) {
            return { success: false, message: 'Tên đăng nhập hoặc email này đã được sử dụng!' };
          }
          return { success: false, message: error.message || 'Đăng ký tài khoản thất bại!' };
        }

        if (!data.user) {
          return { success: false, message: 'Không thể khởi tạo tài khoản. Vui lòng thử lại!' };
        }

        if (!data.session) {
          return {
            success: false,
            message:
              'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản trước khi đăng nhập.',
          };
        }

        const userSession = await this.buildSessionFromAuthUser(data.user, cleanUsername);
        return { success: true, user: userSession };
      } catch (err) {
        console.warn('Supabase register error:', err);
        return {
          success: false,
          message: 'Không thể kết nối máy chủ đăng ký. Vui lòng kiểm tra mạng và thử lại!',
        };
      }
    }

    // 2. Offline / Local-only mode
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

    addLocalUser(userSession);
    return { success: true, user: userSession };
  }

  /**
   * Get all registered users (for Admin Portal; enforced by RLS on Supabase).
   */
  public async getAllUsers(): Promise<UserSession[]> {
    const localList = getLocalUsers();

    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('users')
          .select('id, username, full_name, role, streak_days, last_active_at, created_at')
          .neq('role', 'system')
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          const merged: UserSession[] = data.map(row => ({
            id: row.id,
            username: row.username,
            fullName: row.full_name || row.username,
            role: row.role === 'admin' ? 'admin' : 'student',
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
   * Update user profile info (non-password fields in cloud; password reset requires Supabase Auth flow).
   */
  public async updateUserPasswordOrInfo(
    username: string,
    updates: Partial<UserSession>
  ): Promise<{ success: boolean; message?: string }> {
    updateLocalUser(username, updates);

    if (this.client) {
      try {
        const dbUpdates: Record<string, unknown> = {};
        if (updates.fullName) dbUpdates.full_name = updates.fullName;
        if (updates.role) dbUpdates.role = updates.role;

        if (Object.keys(dbUpdates).length > 0) {
          const { error } = await this.client.from('users').update(dbUpdates).eq('username', username);
          if (error) {
            return { success: false, message: error.message };
          }
        }
      } catch (err) {
        console.warn('Supabase updateUser error:', err);
      }
    }

    return { success: true };
  }

  /**
   * Delete user profile record (enforced as Admin-only by RLS on Supabase).
   */
  public async deleteUserAccount(username: string): Promise<{ success: boolean; message?: string }> {
    if (username === 'admin' || username === 'em_lop8') {
      return { success: false, message: 'Không thể xóa 2 tài khoản hệ thống mặc định (admin & em_lop8)!' };
    }

    deleteLocalUser(username);

    if (this.client) {
      try {
        const { error } = await this.client.from('users').delete().eq('username', username);
        if (error) {
          return { success: false, message: error.message };
        }
      } catch (err) {
        console.warn('Supabase deleteUser error:', err);
      }
    }

    return { success: true };
  }

  /**
   * Fetch full student record from Supabase Cloud (student_snapshots + quiz_attempts)
   * Falls back to local snapshot if offline or user not found.
   */
  public async fetchStudentFullRecord(username: string, userId?: string): Promise<StudentSnapshot> {
    const localSnapshot = getStudentSnapshot(username);

    if (!this.client) {
      return localSnapshot;
    }

    try {
      const userQuery = username
        ? this.client.from('users').select('id, username, streak_days').eq('username', username).maybeSingle()
        : this.client.from('users').select('id, username, streak_days').eq('id', userId).maybeSingle();

      const { data: userRow, error } = await userQuery;
      if (error || !userRow) {
        return localSnapshot;
      }

      const resolvedId = userRow.id || userId;
      let cloudSnapshotRaw: any = null;

      if (resolvedId) {
        const { data: snapRow } = await this.client
          .from('student_snapshots')
          .select('snapshot_data')
          .eq('user_id', resolvedId)
          .maybeSingle();

        if (snapRow?.snapshot_data && typeof snapRow.snapshot_data === 'object') {
          cloudSnapshotRaw = snapRow.snapshot_data;
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
      const rawExams = source.examHistory || localSnapshot.examHistory || [];
      const rawExList = Array.isArray(rawExams) ? rawExams : Object.values(rawExams);
      examHistory = rawExList.map(normalizeExamAttempt);

      if (relationalAttempts.length > 0) {
        const existingExamIds = new Set(examHistory.map(h => h.id || `${h.examId}_${h.date}`));
        for (const att of relationalAttempts) {
          if (!existingExamIds.has(att.id)) {
            examHistory.push(
              normalizeExamAttempt({
                id: att.id,
                examId: att.exercise_id,
                examTitle: `Bài kiểm tra ${att.exercise_id}`,
                score: att.score,
                score10: att.score,
                raw_score: att.raw_score,
                correct: att.raw_score,
                total_questions: att.total_questions,
                time_spent_seconds: att.time_spent_seconds || 0,
                date: new Date(att.completed_at).toLocaleString('vi-VN'),
                submittedAt: att.completed_at,
                answers: {},
              })
            );
          }
        }
      }

      // 4. mistakes
      let mistakes: any[] = [];
      const rawMistakes = source.mistakes || localSnapshot.mistakes || [];
      const rawMList = Array.isArray(rawMistakes) ? rawMistakes : Object.values(rawMistakes);
      mistakes = (rawMList as any[])
        .map(normalizeMistakeItem)
        .filter((m: any): m is MistakeItem => m !== null);

      const mergedSnapshot: StudentSnapshot = {
        username: userRow.username || username,
        learnedVocab,
        unitScores,
        examHistory,
        mistakes,
        streak: {
          currentStreak:
            userRow.streak_days ||
            source.streak?.currentStreak ||
            localSnapshot.streak?.currentStreak ||
            1,
          lastStudyDate:
            source.streak?.lastStudyDate ||
            localSnapshot.streak?.lastStudyDate ||
            new Date().toISOString().split('T')[0],
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
   * Sync student state snapshot to public.student_snapshots and update last_active_at.
   */
  public async syncStudentSnapshotToCloud(
    user: UserSession,
    snapshot: StudentSnapshot
  ): Promise<boolean> {
    if (!user || user.role === 'admin' || !this.client) return false;

    try {
      const snapshotPayload: StudentSnapshot = {
        username: user.username,
        learnedVocab: snapshot.learnedVocab || [],
        unitScores: snapshot.unitScores || {},
        examHistory: (snapshot.examHistory || []).slice(0, 50),
        mistakes: snapshot.mistakes || [],
        streak: snapshot.streak || {
          currentStreak: 1,
          lastStudyDate: new Date().toISOString().split('T')[0],
        },
        updatedAt: new Date().toISOString(),
      };

      const { error } = await this.client.from('student_snapshots').upsert(
        {
          user_id: user.id,
          username: user.username,
          snapshot_data: snapshotPayload,
          updated_at: snapshotPayload.updatedAt,
        },
        { onConflict: 'user_id' }
      );

      if (error) {
        console.warn('syncStudentSnapshotToCloud error:', error.message);
        return false;
      }

      await this.client
        .from('users')
        .update({
          last_active_at: snapshotPayload.updatedAt,
          streak_days: snapshotPayload.streak.currentStreak,
        })
        .eq('id', user.id);

      return true;
    } catch (e) {
      console.warn('syncStudentSnapshotToCloud error:', e);
      return false;
    }
  }
}

export const supabaseService = new SupabaseService();
