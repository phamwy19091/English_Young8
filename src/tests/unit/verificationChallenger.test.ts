import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  STORAGE_KEYS,
  getStudentSnapshot,
  saveStudentSnapshot,
  getSystemConfig,
} from '../../services/storageService';
import {
  cleanSpeechText,
  speakEnglish,
  isSpeechSupported,
} from '../../services/speechService';
import { MistakeItem } from '../../types/storage';

// In-memory localStorage mock for stress testing
class LocalStorageVerifyMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string): string | null {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
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

describe('Empirical Verification Challenger — Milestone 1 Remediation', () => {
  let mockStorage: LocalStorageVerifyMock;

  beforeEach(() => {
    mockStorage = new LocalStorageVerifyMock();
    (global as unknown as { window: { localStorage: LocalStorageVerifyMock; speechSynthesis?: unknown } }).window = {
      localStorage: mockStorage,
    };
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1. ISSUE 1: LEGACY V1 LOCALSTORAGE MIGRATION
  // =========================================================================
  describe('Issue 1: Legacy v1 LocalStorage Migration Robustness', () => {
    it('1.1 migrates complete legacy student dataset into snapshot and saves to modern key', () => {
      const username = 'migrated_student_1';
      mockStorage.setItem(`ey8_learned_vocab_v1_${username}`, JSON.stringify(['u1-v1', 'u1-v2', 'u2-v3']));
      mockStorage.setItem(`ey8_unit_scores_v1_${username}`, JSON.stringify({ 1: 10, 2: 8.5 }));
      mockStorage.setItem(
        `ey8_exam_history_v1_${username}`,
        JSON.stringify([
          { id: 'att-1', examId: 'midterm-1', score: 9.0, totalQuestions: 30, completedAt: '2026-11-01T00:00:00Z' },
        ])
      );
      mockStorage.setItem(
        `ey8_mistakes_v1_${username}`,
        JSON.stringify([
          {
            id: 'm1',
            questionId: 'u1-q5',
            sourceType: 'unit',
            sourceId: 1,
            wrongAnswer: 2,
            resolved: false,
          },
        ])
      );

      // Snapshot does not exist initially
      expect(mockStorage.getItem(`ey8_snapshot_${username}`)).toBeNull();

      const snap = getStudentSnapshot(username);

      // Verify migration
      expect(snap.username).toBe(username);
      expect(snap.learnedVocab).toEqual(['u1-v1', 'u1-v2', 'u2-v3']);
      expect(snap.unitScores).toEqual({ 1: 10, 2: 8.5 });
      expect(snap.examHistory).toHaveLength(1);
      expect(snap.examHistory[0].examId).toBe('midterm-1');
      expect(snap.mistakes).toHaveLength(1);
      expect(snap.mistakes[0].questionId).toBe('u1-q5');

      // Verify persistence in modern snapshot key
      const persisted = mockStorage.getItem(`ey8_snapshot_${username}`);
      expect(persisted).toBeTruthy();
      const parsedPersisted = JSON.parse(persisted!);
      expect(parsedPersisted.learnedVocab).toEqual(['u1-v1', 'u1-v2', 'u2-v3']);
    });

    it('1.2 NEVER overwrites an existing modern snapshot with legacy data', () => {
      const username = 'student_with_existing_snapshot';

      // 1. Seed modern snapshot
      saveStudentSnapshot({
        username,
        learnedVocab: ['modern-vocab-1'],
        unitScores: { 1: 10 },
        examHistory: [],
        mistakes: [],
        streak: { currentStreak: 5, lastStudyDate: '2026-11-06' },
        updatedAt: '2026-11-06T10:00:00Z',
      });

      // 2. Also seed legacy keys with different data
      mockStorage.setItem(`ey8_learned_vocab_v1_${username}`, JSON.stringify(['legacy-vocab-OLD']));
      mockStorage.setItem(`ey8_unit_scores_v1_${username}`, JSON.stringify({ 1: 5.0 }));

      // 3. Load snapshot
      const snap = getStudentSnapshot(username);

      // Verify modern snapshot was NOT overwritten
      expect(snap.learnedVocab).toEqual(['modern-vocab-1']);
      expect(snap.unitScores).toEqual({ 1: 10 });
      expect(snap.streak.currentStreak).toBe(5);
    });

    it('1.3 falls back to unprefixed legacy keys when user-specific keys are absent', () => {
      const username = 'em_lop8';
      mockStorage.setItem(STORAGE_KEYS.LEGACY_LEARNED_VOCAB, JSON.stringify(['u1-v10']));
      mockStorage.setItem(STORAGE_KEYS.LEGACY_UNIT_SCORES, JSON.stringify({ 6: 9.8 }));

      const snap = getStudentSnapshot(username);
      expect(snap.learnedVocab).toEqual(['u1-v10']);
      expect(snap.unitScores).toEqual({ 6: 9.8 });
    });

    it('1.4 normalizes object-dictionary formats and sanitizes invalid legacy values', () => {
      const username = 'messy_legacy_user';
      mockStorage.setItem(
        `ey8_learned_vocab_v1_${username}`,
        JSON.stringify({ 'u1-v1': true, 'u1-v2': false, 'u1-v3': true, 'u2-v1': 1 })
      );
      mockStorage.setItem(
        `ey8_unit_scores_v1_${username}`,
        JSON.stringify({ 1: 9.5, '2': '8.0', invalid: 'nan', 4: null })
      );
      mockStorage.setItem(
        `ey8_mistakes_v1_${username}`,
        JSON.stringify({
          item1: { id: 'm1', questionId: 'q1', wrongAnswer: 1 } as MistakeItem,
        })
      );

      const snap = getStudentSnapshot(username);
      expect(snap.learnedVocab).toEqual(['u1-v1', 'u1-v3', 'u2-v1']);
      expect(snap.unitScores).toEqual({ 1: 9.5, 2: 8 });
      expect(snap.mistakes).toHaveLength(1);
      expect(snap.mistakes[0].questionId).toBe('q1');
    });

    it('1.5 survives corrupted JSON in legacy keys without throwing', () => {
      const username = 'corrupted_legacy_user';
      mockStorage.setItem(`ey8_learned_vocab_v1_${username}`, '{"unclosed string');
      mockStorage.setItem(`ey8_unit_scores_v1_${username}`, '{bad json');

      expect(() => getStudentSnapshot(username)).not.toThrow();
      const snap = getStudentSnapshot(username);
      expect(snap.username).toBe(username);
      expect(snap.learnedVocab).toEqual([]);
      expect(snap.unitScores).toEqual({});
    });
  });

  // =========================================================================
  // 2. ISSUE 2: SYSTEM CONFIG "NULL" AND PRIMITIVE HANDLING
  // =========================================================================
  describe('Issue 2: System Config Primitive "null" and Corrupted Values Handling', () => {
    it('2.1 returns valid default SystemConfig when localStorage holds primitive "null"', () => {
      mockStorage.setItem(STORAGE_KEYS.SYSTEM_CONFIG, 'null');
      const cfg = getSystemConfig();

      expect(cfg).not.toBeNull();
      expect(typeof cfg).toBe('object');
      expect(Array.isArray(cfg.assignments)).toBe(true);
      expect(cfg.assignments).toHaveLength(0);
      expect(Array.isArray(cfg.customQuestions)).toBe(true);
      expect(cfg.customQuestions).toHaveLength(0);
      expect(typeof cfg.updatedAt).toBe('string');
    });

    it('2.2 returns valid default SystemConfig for various primitive values and array', () => {
      const primitives = ['42', 'true', 'false', '"a string"', '[]'];
      for (const prim of primitives) {
        mockStorage.setItem(STORAGE_KEYS.SYSTEM_CONFIG, prim);
        const cfg = getSystemConfig();
        expect(cfg).not.toBeNull();
        expect(Array.isArray(cfg.assignments)).toBe(true);
        expect(Array.isArray(cfg.customQuestions)).toBe(true);
        expect(typeof cfg.updatedAt).toBe('string');
      }
    });

    it('2.3 repairs partially corrupted SystemConfig objects', () => {
      mockStorage.setItem(
        STORAGE_KEYS.SYSTEM_CONFIG,
        JSON.stringify({
          assignments: 'not an array',
          customQuestions: null,
          updatedAt: 12345, // invalid type
        })
      );

      const cfg = getSystemConfig();
      expect(Array.isArray(cfg.assignments)).toBe(true);
      expect(cfg.assignments).toHaveLength(0);
      expect(Array.isArray(cfg.customQuestions)).toBe(true);
      expect(cfg.customQuestions).toHaveLength(0);
      expect(typeof cfg.updatedAt).toBe('string');
    });
  });

  // =========================================================================
  // 3. ISSUE 3: SPEECH TEXT CLEANING FOR ISOLATED PHONETIC SOUNDS
  // =========================================================================
  describe('Issue 3: Speech Text Cleaning for Isolated Phonetic Sounds & Edge Cases', () => {
    it('3.1 cleanly extracts phonetic sound from all 12 curriculum phonetic headings', () => {
      const curriculumPhonetics: Record<string, string> = {
        // Unit 1
        '/ʊ/ (u ngắn)': 'ʊ',
        '/uː/ (u dài)': 'uː',
        // Unit 2
        '/ə/ (ơ ngắn - schwa)': 'ə',
        '/ɪ/ (i ngắn)': 'ɪ',
        // Unit 3
        '/ʊə/ (ua)': 'ʊə',
        '/ɔɪ/ (oi)': 'ɔɪ',
        // Unit 4
        '/k/ (âm vô thanh)': 'k',
        '/ɡ/ (âm hữu thanh)': 'ɡ',
        // Unit 5
        '/n/ (n đầu lưỡi)': 'n',
        '/ŋ/ (ng cuống lưỡi)': 'ŋ',
        // Unit 6
        '/br/ (bờ-r)': 'br',
        '/pr/ (pờ-r)': 'pr',
      };

      for (const [raw, expected] of Object.entries(curriculumPhonetics)) {
        expect(cleanSpeechText(raw)).toBe(expected);
      }
    });

    it('3.2 strips pronunciation slash annotations and parenthesized tags from standard vocab', () => {
      expect(cleanSpeechText('book /bʊk/ (n)')).toBe('book');
      expect(cleanSpeechText('origami /ˌɒrɪˈɡɑːmi/ (n)')).toBe('origami');
      expect(cleanSpeechText('do DIY /duː ˌdiː aɪ ˈwaɪ/ (v.phr)')).toBe('do DIY');
      expect(cleanSpeechText('hang out (with) /hæŋ aʊt/ (v.phr)')).toBe('hang out');
      expect(cleanSpeechText('detest (v)')).toBe('detest');
    });

    it('3.3 handles nested parentheses iteratively without leaving orphaned brackets', () => {
      expect(cleanSpeechText('((nested))')).toBe('');
      expect(cleanSpeechText('(((deeply nested)))')).toBe('');
      expect(cleanSpeechText('word ((nested note))')).toBe('word');
      expect(cleanSpeechText('(v.phr) /aɪ piː eɪ/')).toBe('aɪ piː eɪ');
    });

    it('3.4 speech synthesis speakUtterance receives cleaned phonetic sound for headers', () => {
      const spoken: string[] = [];
      class MockSpeechSynthesisUtterance {
        text: string;
        lang = 'en-US';
        rate = 0.9;
        constructor(text: string) {
          this.text = text;
        }
      }

      const mockSynth = {
        cancel: vi.fn(),
        speak: vi.fn((utt: MockSpeechSynthesisUtterance) => {
          spoken.push(utt.text);
        }),
      };

      (global as unknown as Record<string, unknown>).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
      (window as unknown as { speechSynthesis: typeof mockSynth; SpeechSynthesisUtterance: unknown }).speechSynthesis =
        mockSynth;
      (window as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance =
        MockSpeechSynthesisUtterance;

      expect(isSpeechSupported()).toBe(true);

      speakEnglish('/ʊ/ (u ngắn)');
      expect(spoken).toEqual(['ʊ']);

      speakEnglish('/pr/ (pờ-r)');
      expect(spoken).toEqual(['ʊ', 'pr']);
    });
  });
});
