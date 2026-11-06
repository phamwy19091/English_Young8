import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StudentSnapshot, SystemConfig } from '../types/storage';
import { STORAGE_KEYS, getStudentSnapshot, saveStudentSnapshot, getSystemConfig, saveSystemConfig } from './storageService';

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
}

export const supabaseService = new SupabaseService();
