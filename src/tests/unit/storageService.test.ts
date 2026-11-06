import { describe, it, expect, beforeEach } from 'vitest';
import {
  STORAGE_KEYS,
  getAuthSession,
  saveAuthSession,
  clearAuthSession,
  getStudentSnapshot,
  saveStudentSnapshot,
  resetStudentSnapshot,
  setVocabLearned,
  saveUnitScore,
  saveExamAttempt,
  addMistake,
  resolveMistake,
  updateStudyStreak,
  getSystemConfig,
  saveSystemConfig,
} from '../../services/storageService';
import { UserSession } from '../../types/user';
import { ExamAttempt } from '../../types/storage';

// In-memory localStorage mock for Node vitest environment
class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  get length(): number {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] || null;
  }
}

describe('Storage Service Persistence & Key Integrity', () => {
  let mockStorage: LocalStorageMock;

  beforeEach(() => {
    mockStorage = new LocalStorageMock();
    (global as unknown as { window: { localStorage: LocalStorageMock } }).window = {
      localStorage: mockStorage,
    };
  });

  describe('Storage Keys Preservation', () => {
    it('should use exact legacy key names', () => {
      expect(STORAGE_KEYS.AUTH_SESSION).toBe('ey8_auth_session_v3');
      expect(STORAGE_KEYS.SNAPSHOT_PREFIX).toBe('ey8_snapshot_');
      expect(STORAGE_KEYS.SYSTEM_CONFIG).toBe('ey8_system_config_v1');
    });
  });

  describe('Auth Session', () => {
    it('should return null when no session is stored', () => {
      expect(getAuthSession()).toBeNull();
    });

    it('should save and retrieve auth session with exact key', () => {
      const user: UserSession = {
        id: 'user-001',
        username: 'em_lop8',
        fullName: 'Em Lớp 8',
        role: 'student',
      };

      saveAuthSession(user);
      expect(mockStorage.getItem('ey8_auth_session_v3')).toBeTruthy();

      const retrieved = getAuthSession();
      expect(retrieved).toEqual(user);
    });

    it('should clear auth session properly', () => {
      const user: UserSession = {
        id: 'user-001',
        username: 'admin',
        fullName: 'Admin',
        role: 'admin',
      };
      saveAuthSession(user);
      clearAuthSession();
      expect(getAuthSession()).toBeNull();
    });
  });

  describe('Student Snapshot', () => {
    const username = 'test_student';

    it('should return a default snapshot if none exists', () => {
      const snapshot = getStudentSnapshot(username);
      expect(snapshot.username).toBe(username);
      expect(snapshot.learnedVocab).toEqual([]);
      expect(snapshot.unitScores).toEqual({});
      expect(snapshot.examHistory).toEqual([]);
      expect(snapshot.mistakes).toEqual([]);
      expect(snapshot.streak.currentStreak).toBe(1);
    });

    it('should save snapshot under ey8_snapshot_${username}', () => {
      const snap = getStudentSnapshot(username);
      snap.learnedVocab.push('u1-v1');
      saveStudentSnapshot(snap);

      const raw = mockStorage.getItem(`ey8_snapshot_${username}`);
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw!);
      expect(parsed.learnedVocab).toContain('u1-v1');
    });

    it('should normalize legacy dictionary/object data to arrays', () => {
      // Legacy format stored learnedVocab as { "u1-v1": true, "u1-v2": true }
      const legacyRaw = JSON.stringify({
        username: 'legacy_user',
        learnedVocab: { 'u1-v1': true, 'u1-v2': true, 'u1-v3': false },
        mistakes: {
          m1: {
            id: 'm1',
            questionId: 'q1',
            wrongAnswer: 1,
            resolved: false,
          },
        },
      });

      mockStorage.setItem('ey8_snapshot_legacy_user', legacyRaw);

      const normalized = getStudentSnapshot('legacy_user');
      expect(normalized.learnedVocab).toEqual(['u1-v1', 'u1-v2']);
      expect(normalized.mistakes).toHaveLength(1);
      expect(normalized.mistakes[0].questionId).toBe('q1');
    });

    it('should reset student snapshot cleanly', () => {
      setVocabLearned(username, 'u1-v1', true);
      saveUnitScore(username, 1, 9.5);

      const reset = resetStudentSnapshot(username);
      expect(reset.learnedVocab).toEqual([]);
      expect(reset.unitScores).toEqual({});
    });
  });

  describe('Student Actions & Progress', () => {
    const username = 'learner1';

    it('should track learned vocabulary add and remove', () => {
      setVocabLearned(username, 'u1-v1', true);
      setVocabLearned(username, 'u1-v2', true);
      let snap = getStudentSnapshot(username);
      expect(snap.learnedVocab).toEqual(['u1-v1', 'u1-v2']);

      setVocabLearned(username, 'u1-v1', false);
      snap = getStudentSnapshot(username);
      expect(snap.learnedVocab).toEqual(['u1-v2']);
    });

    it('should update unit score only if higher than previous score', () => {
      saveUnitScore(username, 1, 7.5);
      expect(getStudentSnapshot(username).unitScores[1]).toBe(7.5);

      // Lower score should not overwrite
      saveUnitScore(username, 1, 6.0);
      expect(getStudentSnapshot(username).unitScores[1]).toBe(7.5);

      // Higher score should overwrite
      saveUnitScore(username, 1, 9.0);
      expect(getStudentSnapshot(username).unitScores[1]).toBe(9.0);
    });

    it('should record exam attempt to examHistory', () => {
      const attempt: ExamAttempt = {
        id: 'attempt-1',
        examId: 'exam-15m-1',
        examTitle: 'Đề 15 phút số 1',
        score: 8.5,
        totalQuestions: 12,
        timeSpentSeconds: 650,
        answers: { q1: 0, q2: 1 },
        submittedAt: new Date().toISOString(),
      };

      saveExamAttempt(username, attempt);
      const snap = getStudentSnapshot(username);
      expect(snap.examHistory).toHaveLength(1);
      expect(snap.examHistory[0].examId).toBe('exam-15m-1');
    });

    it('should add mistake and resolve it', () => {
      addMistake(username, {
        sourceType: 'unit',
        sourceId: 1,
        questionId: 'u1-q3',
        question: {
          id: 'u1-q3',
          section: 'Grammar',
          question: 'Test question',
          options: ['A', 'B', 'C', 'D'],
          answer: 2,
          explanation: 'Test explanation',
        },
        wrongAnswer: 0,
      });

      let snap = getStudentSnapshot(username);
      expect(snap.mistakes).toHaveLength(1);
      expect(snap.mistakes[0].resolved).toBe(false);

      resolveMistake(username, 'u1-q3');
      snap = getStudentSnapshot(username);
      expect(snap.mistakes[0].resolved).toBe(true);
      expect(snap.mistakes[0].resolvedAt).toBeTruthy();
    });

    it('should update streak calculation properly', () => {
      const snap = updateStudyStreak(username);
      expect(snap.streak.currentStreak).toBeGreaterThanOrEqual(1);
      expect(snap.streak.lastStudyDate).toBe(new Date().toISOString().split('T')[0]);
    });
  });

  describe('System Config', () => {
    it('should save and load system config under ey8_system_config_v1', () => {
      const config = getSystemConfig();
      expect(config.assignments).toEqual([]);

      config.assignments.push({
        id: 'asg-1',
        title: 'BTVN Unit 1',
        type: 'unit',
        targetId: 1,
        dueDate: '2026-12-01',
        minScore: 8.0,
        assignedTo: ['all'],
        createdAt: new Date().toISOString(),
      });

      saveSystemConfig(config);

      const raw = mockStorage.getItem('ey8_system_config_v1');
      expect(raw).toBeTruthy();

      const loaded = getSystemConfig();
      expect(loaded.assignments).toHaveLength(1);
      expect(loaded.assignments[0].id).toBe('asg-1');
    });

    it('should return valid default structure when system config contains string "null" or primitives', () => {
      mockStorage.setItem(STORAGE_KEYS.SYSTEM_CONFIG, 'null');
      const cfgNull = getSystemConfig();
      expect(cfgNull).toBeDefined();
      expect(cfgNull.assignments).toEqual([]);
      expect(cfgNull.customQuestions).toEqual([]);
      expect(typeof cfgNull.updatedAt).toBe('string');

      mockStorage.setItem(STORAGE_KEYS.SYSTEM_CONFIG, '"primitive_string"');
      const cfgStr = getSystemConfig();
      expect(cfgStr).toBeDefined();
      expect(cfgStr.assignments).toEqual([]);
    });
  });

  describe('Legacy v1 LocalStorage Migration', () => {
    it('should migrate user-prefixed legacy v1 keys into new snapshot', () => {
      const studentUser = 'migrated_student';
      mockStorage.setItem(`ey8_learned_vocab_v1_${studentUser}`, JSON.stringify(['u1-v1', 'u1-v2']));
      mockStorage.setItem(`ey8_unit_scores_v1_${studentUser}`, JSON.stringify({ 1: 9.0, 2: 8.5 }));
      mockStorage.setItem(`ey8_mistakes_v1_${studentUser}`, JSON.stringify([
        {
          id: 'm1',
          sourceType: 'unit',
          sourceId: 1,
          questionId: 'u1-q1',
          wrongAnswer: 0,
          addedAt: '2026-11-01T00:00:00.000Z',
          resolved: false,
          question: {
            id: 'u1-q1',
            section: 'Vocabulary',
            question: 'Sample question',
            options: ['A', 'B', 'C', 'D'],
            answer: 1,
            explanation: 'Explanation',
          },
        },
      ]));

      const snapshot = getStudentSnapshot(studentUser);
      expect(snapshot.learnedVocab).toEqual(['u1-v1', 'u1-v2']);
      expect(snapshot.unitScores).toEqual({ 1: 9.0, 2: 8.5 });
      expect(snapshot.mistakes).toHaveLength(1);
      expect(snapshot.mistakes[0].questionId).toBe('u1-q1');

      // Verify that the snapshot is persisted under ey8_snapshot_${username}
      const rawSnapshot = mockStorage.getItem(`ey8_snapshot_${studentUser}`);
      expect(rawSnapshot).toBeTruthy();
    });

    it('should fallback to un-prefixed legacy keys when user-prefixed keys do not exist', () => {
      const fallbackUser = 'fallback_student';
      mockStorage.setItem(STORAGE_KEYS.LEGACY_LEARNED_VOCAB, JSON.stringify(['u2-v1']));
      mockStorage.setItem(STORAGE_KEYS.LEGACY_UNIT_SCORES, JSON.stringify({ 2: 10 }));

      const snapshot = getStudentSnapshot(fallbackUser);
      expect(snapshot.learnedVocab).toEqual(['u2-v1']);
      expect(snapshot.unitScores).toEqual({ 2: 10 });
    });
  });
});
