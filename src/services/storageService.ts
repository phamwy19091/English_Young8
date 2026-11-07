import { StudentSnapshot, ExamAttempt, MistakeItem, SystemConfig } from '../types/storage';
import { UserSession } from '../types/user';

// Exact localStorage keys preserved from legacy codebase
export const STORAGE_KEYS = {
  AUTH_SESSION: 'ey8_auth_session_v3',
  SNAPSHOT_PREFIX: 'ey8_snapshot_',
  SYSTEM_CONFIG: 'ey8_system_config_v1',
  SUPABASE_URL: 'ey8_supabase_url',
  SUPABASE_ANON: 'ey8_supabase_anon_key',
  LOCAL_USERS: 'ey8_local_users_v1',
  LEGACY_LEARNED_VOCAB: 'ey8_learned_vocab_v1',
  LEGACY_UNIT_SCORES: 'ey8_unit_scores_v1',
  LEGACY_EXAM_HISTORY: 'ey8_exam_history_v1',
  LEGACY_MISTAKES: 'ey8_mistakes_v1',
} as const;

function isLocalStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function safeGetItem(key: string): string | null {
  if (!isLocalStorageAvailable()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch (err) {
    console.warn(`Error reading localStorage key "${key}":`, err);
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`Error setting localStorage key "${key}":`, err);
  }
}

function safeRemoveItem(key: string): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.removeItem(key);
  } catch (err) {
    console.warn(`Error removing localStorage key "${key}":`, err);
  }
}

// ---------------------------------------------------------------------------
// Auth Session Management
// ---------------------------------------------------------------------------

export function getAuthSession(): UserSession | null {
  const raw = safeGetItem(STORAGE_KEYS.AUTH_SESSION);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserSession;
  } catch (err) {
    console.error('Failed to parse auth session:', err);
    return null;
  }
}

export function saveAuthSession(session: UserSession): void {
  safeSetItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
}

export function clearAuthSession(): void {
  safeRemoveItem(STORAGE_KEYS.AUTH_SESSION);
}

// ---------------------------------------------------------------------------
// Local Users Management (Compatible with legacy ey8_local_users_v1)
// ---------------------------------------------------------------------------

export const INITIAL_ACCOUNTS: UserSession[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    username: 'em_lop8',
    fullName: 'Em Lớp 8',
    role: 'student',
    pinCode: '1234',
    streakDays: 1,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    username: 'admin',
    fullName: 'Quản Trị Viên (Anh/Chị)',
    role: 'admin',
    pinCode: 'admin123',
    streakDays: 0,
  },
];

export function getLocalUsers(): UserSession[] {
  const raw = safeGetItem(STORAGE_KEYS.LOCAL_USERS);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse local users:', e);
    }
  }
  // Initialize with default accounts if empty
  saveLocalUsers(INITIAL_ACCOUNTS);
  return [...INITIAL_ACCOUNTS];
}

export function saveLocalUsers(users: UserSession[]): void {
  safeSetItem(STORAGE_KEYS.LOCAL_USERS, JSON.stringify(users));
}

export function addLocalUser(user: UserSession): void {
  const users = getLocalUsers();
  const existingIdx = users.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());
  if (existingIdx >= 0) {
    users[existingIdx] = { ...users[existingIdx], ...user };
  } else {
    users.push(user);
  }
  saveLocalUsers(users);
}

export function updateLocalUser(username: string, updates: Partial<UserSession>): boolean {
  const users = getLocalUsers();
  const idx = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...updates };
    saveLocalUsers(users);
    return true;
  }
  return false;
}

export function deleteLocalUser(username: string): boolean {
  if (username === 'admin' || username === 'em_lop8') {
    return false; // Cannot delete system default users
  }
  const users = getLocalUsers().filter(u => u.username.toLowerCase() !== username.toLowerCase());
  saveLocalUsers(users);
  return true;
}

// ---------------------------------------------------------------------------
// Student Snapshot Persistence
// ---------------------------------------------------------------------------

export function createDefaultSnapshot(username: string): StudentSnapshot {
  return {
    username,
    learnedVocab: [],
    unitScores: {},
    examHistory: [],
    mistakes: [],
    streak: {
      currentStreak: 1,
      lastStudyDate: new Date().toISOString().split('T')[0],
    },
    updatedAt: new Date().toISOString(),
  };
}

export function getSnapshotKey(username: string): string {
  return `${STORAGE_KEYS.SNAPSHOT_PREFIX}${username}`;
}

function migrateLegacyData(username: string): StudentSnapshot | null {
  const getLegacyRaw = (baseKey: string): string | null => {
    return safeGetItem(`${baseKey}_${username}`) ?? safeGetItem(baseKey);
  };

  const rawVocab = getLegacyRaw(STORAGE_KEYS.LEGACY_LEARNED_VOCAB);
  const rawScores = getLegacyRaw(STORAGE_KEYS.LEGACY_UNIT_SCORES);
  const rawExams = getLegacyRaw(STORAGE_KEYS.LEGACY_EXAM_HISTORY);
  const rawMistakes = getLegacyRaw(STORAGE_KEYS.LEGACY_MISTAKES);

  if (rawVocab === null && rawScores === null && rawExams === null && rawMistakes === null) {
    return null;
  }

  const snapshot = createDefaultSnapshot(username);

  // 1. Learned Vocab
  if (rawVocab) {
    try {
      const parsedVocab = JSON.parse(rawVocab);
      if (Array.isArray(parsedVocab)) {
        snapshot.learnedVocab = parsedVocab.filter((v): v is string => typeof v === 'string' || typeof v === 'number').map(String);
      } else if (parsedVocab && typeof parsedVocab === 'object') {
        snapshot.learnedVocab = Object.keys(parsedVocab).filter((k) => !!parsedVocab[k]);
      }
    } catch (e) {
      console.warn(`Failed to parse legacy learned vocab for user ${username}:`, e);
    }
  }

  // 2. Unit Scores
  if (rawScores) {
    try {
      const parsedScores = JSON.parse(rawScores);
      if (parsedScores && typeof parsedScores === 'object' && !Array.isArray(parsedScores)) {
        const scores: Record<number, number> = {};
        for (const [k, v] of Object.entries(parsedScores)) {
          const cleanKey = k.replace(/^unit-?/i, '');
          const numKey = Number(cleanKey);
          const numVal = Number(v);
          if (!isNaN(numKey) && v !== null && v !== '' && !isNaN(numVal)) {
            scores[numKey] = numVal;
          }
        }
        snapshot.unitScores = scores;
      }
    } catch (e) {
      console.warn(`Failed to parse legacy unit scores for user ${username}:`, e);
    }
  }

  // 3. Exam History
  if (rawExams) {
    try {
      const parsedExams = JSON.parse(rawExams);
      if (Array.isArray(parsedExams)) {
        snapshot.examHistory = parsedExams;
      }
    } catch (e) {
      console.warn(`Failed to parse legacy exam history for user ${username}:`, e);
    }
  }

  // 4. Mistakes
  if (rawMistakes) {
    try {
      const parsedMistakes = JSON.parse(rawMistakes);
      if (Array.isArray(parsedMistakes)) {
        snapshot.mistakes = parsedMistakes;
      } else if (parsedMistakes && typeof parsedMistakes === 'object') {
        snapshot.mistakes = Object.values(parsedMistakes) as MistakeItem[];
      }
    } catch (e) {
      console.warn(`Failed to parse legacy mistakes for user ${username}:`, e);
    }
  }

  saveStudentSnapshot(snapshot);
  return snapshot;
}

export function getStudentSnapshot(username: string): StudentSnapshot {
  if (!username) return createDefaultSnapshot('anonymous');

  const key = getSnapshotKey(username);
  const raw = safeGetItem(key);

  if (!raw) {
    const legacySnapshot = migrateLegacyData(username);
    if (legacySnapshot) {
      return legacySnapshot;
    }
    const defaultSnap = createDefaultSnapshot(username);
    saveStudentSnapshot(defaultSnap);
    return defaultSnap;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      const legacySnapshot = migrateLegacyData(username);
      if (legacySnapshot) {
        return legacySnapshot;
      }
      const defaultSnap = createDefaultSnapshot(username);
      saveStudentSnapshot(defaultSnap);
      return defaultSnap;
    }

    // Normalize learnedVocab (convert legacy object/dictionary to array if needed)
    let learnedVocab: string[] = [];
    if (Array.isArray(parsed.learnedVocab)) {
      learnedVocab = parsed.learnedVocab;
    } else if (parsed.learnedVocab && typeof parsed.learnedVocab === 'object') {
      learnedVocab = Object.keys(parsed.learnedVocab).filter((k) => !!parsed.learnedVocab[k]);
    }

    // Normalize mistakes (convert legacy object/dictionary to array if needed)
    let mistakes: MistakeItem[] = [];
    if (Array.isArray(parsed.mistakes)) {
      mistakes = parsed.mistakes;
    } else if (parsed.mistakes && typeof parsed.mistakes === 'object') {
      mistakes = Object.values(parsed.mistakes) as MistakeItem[];
    }

    // Normalize unitScores (handle keys like 'unit-1', 'unit-2' or 1, 2)
    const unitScores: Record<number, number> = {};
    if (parsed.unitScores && typeof parsed.unitScores === 'object' && !Array.isArray(parsed.unitScores)) {
      for (const [k, v] of Object.entries(parsed.unitScores)) {
        const cleanKey = k.replace(/^unit-?/i, '');
        const numKey = Number(cleanKey);
        const numVal = Number(v);
        if (!isNaN(numKey) && v !== null && v !== '' && !isNaN(numVal)) {
          unitScores[numKey] = numVal;
        }
      }
    }

    const snapshot: StudentSnapshot = {
      username,
      learnedVocab,
      unitScores,
      examHistory: Array.isArray(parsed.examHistory) ? parsed.examHistory : [],
      mistakes,
      streak: {
        currentStreak: Number(parsed.streak?.currentStreak) || 1,
        lastStudyDate: parsed.streak?.lastStudyDate || new Date().toISOString().split('T')[0],
      },
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };

    return snapshot;
  } catch (err) {
    console.warn(`Failed to parse snapshot for user ${username}:`, err);
    return createDefaultSnapshot(username);
  }
}

export function saveStudentSnapshot(snapshot: StudentSnapshot): void {
  if (!snapshot || !snapshot.username) return;
  snapshot.updatedAt = new Date().toISOString();
  safeSetItem(getSnapshotKey(snapshot.username), JSON.stringify(snapshot));
}

export function resetStudentSnapshot(username: string): StudentSnapshot {
  const fresh = createDefaultSnapshot(username);
  saveStudentSnapshot(fresh);
  return fresh;
}

// ---------------------------------------------------------------------------
// Student Action Helpers
// ---------------------------------------------------------------------------

export function setVocabLearned(username: string, vocabId: string, learned: boolean): StudentSnapshot {
  const snapshot = getStudentSnapshot(username);
  const set = new Set(snapshot.learnedVocab);
  if (learned) {
    set.add(vocabId);
  } else {
    set.delete(vocabId);
  }
  snapshot.learnedVocab = Array.from(set);
  saveStudentSnapshot(snapshot);
  return snapshot;
}

export function saveUnitScore(username: string, unitId: number, score: number): StudentSnapshot {
  const snapshot = getStudentSnapshot(username);
  const currentBest = snapshot.unitScores[unitId] ?? 0;
  if (score > currentBest) {
    snapshot.unitScores[unitId] = score;
  }
  saveStudentSnapshot(snapshot);
  return snapshot;
}

export function saveExamAttempt(username: string, attempt: ExamAttempt): StudentSnapshot {
  const snapshot = getStudentSnapshot(username);
  snapshot.examHistory.unshift(attempt);
  saveStudentSnapshot(snapshot);
  return snapshot;
}

export function addMistake(
  username: string,
  mistake: Omit<MistakeItem, 'id' | 'addedAt' | 'resolved'>
): StudentSnapshot {
  const snapshot = getStudentSnapshot(username);
  // Find if already exists
  const existingIdx = snapshot.mistakes.findIndex((m) => m.questionId === mistake.questionId);
  if (existingIdx >= 0) {
    snapshot.mistakes[existingIdx].wrongAnswer = mistake.wrongAnswer;
    snapshot.mistakes[existingIdx].resolved = false;
    snapshot.mistakes[existingIdx].userNote = mistake.userNote || snapshot.mistakes[existingIdx].userNote;
  } else {
    const newItem: MistakeItem = {
      ...mistake,
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      addedAt: new Date().toISOString(),
      resolved: false,
    };
    snapshot.mistakes.unshift(newItem);
  }
  saveStudentSnapshot(snapshot);
  return snapshot;
}

export function resolveMistake(username: string, questionId: string): StudentSnapshot {
  const snapshot = getStudentSnapshot(username);
  const target = snapshot.mistakes.find((m) => m.questionId === questionId);
  if (target) {
    target.resolved = true;
    target.resolvedAt = new Date().toISOString();
    saveStudentSnapshot(snapshot);
  }
  return snapshot;
}

export function updateStudyStreak(username: string): StudentSnapshot {
  const snapshot = getStudentSnapshot(username);
  const today = new Date().toISOString().split('T')[0];
  const lastDate = snapshot.streak.lastStudyDate;

  if (lastDate === today) {
    // Already studied today
    return snapshot;
  }

  if (!lastDate) {
    snapshot.streak = { currentStreak: 1, lastStudyDate: today };
    saveStudentSnapshot(snapshot);
    return snapshot;
  }

  const prev = new Date(lastDate);
  const curr = new Date(today);
  const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));

  if (diffDays === 1) {
    snapshot.streak.currentStreak += 1;
  } else if (diffDays > 1) {
    snapshot.streak.currentStreak = 1;
  }
  snapshot.streak.lastStudyDate = today;
  saveStudentSnapshot(snapshot);
  return snapshot;
}

// ---------------------------------------------------------------------------
// System Config (Admin Store)
// ---------------------------------------------------------------------------

export function getSystemConfig(): SystemConfig {
  const raw = safeGetItem(STORAGE_KEYS.SYSTEM_CONFIG);
  if (!raw) {
    return {
      assignments: [],
      customQuestions: [],
      updatedAt: new Date().toISOString(),
    };
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return {
        assignments: [],
        customQuestions: [],
        updatedAt: new Date().toISOString(),
      };
    }
    const rawAssignments = Array.isArray(parsed.assignments) ? parsed.assignments : [];
    const normalizedAssignments = rawAssignments.map((a: any) => ({
      id: a?.id || `asg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: a?.title || 'Nhiệm vụ bài tập',
      type: a?.type || (a?.targetType === 'exam' ? 'exam' : 'unit'),
      targetId: a?.targetId ?? a?.targetValue ?? 1,
      dueDate: a?.dueDate || new Date().toISOString().split('T')[0],
      minScore: Number(a?.minScore) || 8.0,
      assignedTo: Array.isArray(a?.assignedTo)
        ? a.assignedTo
        : a?.studentUsername
        ? [a.studentUsername]
        : ['all'],
      createdAt: a?.createdAt || new Date().toISOString(),
    }));

    return {
      ...parsed,
      assignments: normalizedAssignments,
      customQuestions: Array.isArray(parsed.customQuestions) ? parsed.customQuestions : [],
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch (err) {
    console.error('Failed to parse system config:', err);
    return {
      assignments: [],
      customQuestions: [],
      updatedAt: new Date().toISOString(),
    };
  }
}

export function saveSystemConfig(config: SystemConfig): void {
  config.updatedAt = new Date().toISOString();
  safeSetItem(STORAGE_KEYS.SYSTEM_CONFIG, JSON.stringify(config));
}

export function getSupabaseConfig(): { url: string; anonKey: string } {
  return {
    url: safeGetItem(STORAGE_KEYS.SUPABASE_URL) || '',
    anonKey: safeGetItem(STORAGE_KEYS.SUPABASE_ANON) || '',
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  safeSetItem(STORAGE_KEYS.SUPABASE_URL, url);
  safeSetItem(STORAGE_KEYS.SUPABASE_ANON, anonKey);
}

