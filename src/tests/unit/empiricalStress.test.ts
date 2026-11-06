import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  STORAGE_KEYS,
  getAuthSession,
  getStudentSnapshot,
  saveStudentSnapshot,
  setVocabLearned,
  addMistake,
  resolveMistake,
  updateStudyStreak,
  getSystemConfig,
} from '../../services/storageService';
import {
  cleanSpeechText,
  speakEnglish,
  speakWord,
  isSpeechSupported,
} from '../../services/speechService';
import { MistakeItem } from '../../types/storage';

// In-memory localStorage mock for stress testing
class LocalStorageStressMock {
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

describe('Challenger 2 Empirical Stress Tests', () => {
  let mockStorage: LocalStorageStressMock;

  beforeEach(() => {
    mockStorage = new LocalStorageStressMock();
    (global as unknown as { window: { localStorage: LocalStorageStressMock; speechSynthesis?: unknown } }).window = {
      localStorage: mockStorage,
    };
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1. STORAGE SERVICE EMPIRICAL STRESS TESTS
  // =========================================================================

  describe('1. Storage Service: Corrupted JSON Robustness', () => {
    it('1.1 should gracefully handle truncated / malformed JSON in auth session', () => {
      mockStorage.setItem(STORAGE_KEYS.AUTH_SESSION, '{"username": "truncated');
      expect(() => getAuthSession()).not.toThrow();
      expect(getAuthSession()).toBeNull();
    });

    it('1.2 should gracefully handle non-object primitives stored in auth session', () => {
      mockStorage.setItem(STORAGE_KEYS.AUTH_SESSION, 'null');
      expect(getAuthSession()).toBeNull();

      mockStorage.setItem(STORAGE_KEYS.AUTH_SESSION, '12345');
      const result = getAuthSession();
      // Returns 12345 because JSON.parse('12345') is number 12345
      expect(result).toBe(12345);
    });

    it('1.3 should gracefully handle truncated / malformed JSON in student snapshot', () => {
      const username = 'corrupted_user';
      mockStorage.setItem(`ey8_snapshot_${username}`, '{"username": "corrupted_user", "learnedVocab": [');

      expect(() => getStudentSnapshot(username)).not.toThrow();
      const snap = getStudentSnapshot(username);
      expect(snap.username).toBe(username);
      expect(Array.isArray(snap.learnedVocab)).toBe(true);
      expect(snap.learnedVocab).toHaveLength(0);
    });

    it('1.4 should gracefully handle primitive JSON values ("null", "true", "42") in student snapshot', () => {
      const username = 'null_user';
      mockStorage.setItem(`ey8_snapshot_${username}`, 'null');

      expect(() => getStudentSnapshot(username)).not.toThrow();
      const snap = getStudentSnapshot(username);
      expect(snap.username).toBe(username);
      expect(Array.isArray(snap.learnedVocab)).toBe(true);
    });

    it('1.5 should handle corrupted JSON in system config without crashing', () => {
      mockStorage.setItem(STORAGE_KEYS.SYSTEM_CONFIG, '{ broken json ...');
      expect(() => getSystemConfig()).not.toThrow();
      const cfg = getSystemConfig();
      expect(cfg).toBeDefined();
      expect(Array.isArray(cfg.assignments)).toBe(true);
    });

    it('1.6 should gracefully return default object when string "null" or primitive is stored in system config', () => {
      mockStorage.setItem(STORAGE_KEYS.SYSTEM_CONFIG, 'null');
      const cfg = getSystemConfig();
      expect(cfg).not.toBeNull();
      expect(Array.isArray(cfg.assignments)).toBe(true);
      expect(Array.isArray(cfg.customQuestions)).toBe(true);
      expect(typeof cfg.updatedAt).toBe('string');

      mockStorage.setItem(STORAGE_KEYS.SYSTEM_CONFIG, '42');
      const numCfg = getSystemConfig();
      expect(numCfg).not.toBeNull();
      expect(Array.isArray(numCfg.assignments)).toBe(true);
    });
  });

  describe('2. Storage Service: Partial Snapshot Fields Stress', () => {
    it('2.1 should handle snapshot with only username (all other fields omitted)', () => {
      const username = 'minimalist';
      mockStorage.setItem(`ey8_snapshot_${username}`, JSON.stringify({ username }));

      const snap = getStudentSnapshot(username);
      expect(snap.username).toBe(username);
      expect(snap.learnedVocab).toEqual([]);
      expect(snap.unitScores).toEqual({});
      expect(snap.examHistory).toEqual([]);
      expect(snap.mistakes).toEqual([]);
      expect(snap.streak.currentStreak).toBe(1);
      expect(snap.streak.lastStudyDate).toBeDefined();
    });

    it('2.2 should survive actions on snapshot with missing streak object', () => {
      const username = 'no_streak_user';
      mockStorage.setItem(
        `ey8_snapshot_${username}`,
        JSON.stringify({ username, learnedVocab: [], unitScores: {}, examHistory: [], mistakes: [] })
      );

      expect(() => updateStudyStreak(username)).not.toThrow();
      const updated = getStudentSnapshot(username);
      expect(updated.streak.currentStreak).toBeGreaterThanOrEqual(1);
    });

    it('2.3 should handle corrupted subfield types in snapshot (unitScores null, streak null, etc.)', () => {
      const username = 'corrupt_subfields';
      mockStorage.setItem(
        `ey8_snapshot_${username}`,
        JSON.stringify({
          username,
          unitScores: null,
          streak: null,
          learnedVocab: 'not_an_array',
          mistakes: 12345,
        })
      );

      const snap = getStudentSnapshot(username);
      expect(snap.learnedVocab).toEqual([]);
      expect(snap.mistakes).toEqual([]);
      expect(snap.unitScores).toEqual({});
      expect(snap.streak.currentStreak).toBe(1);
    });
  });

  describe('3. Storage Service: Legacy v1 Migration Stress', () => {
    it('3.1 should successfully migrate isolated legacy v1 keys into new snapshot', () => {
      const username = 'legacy_student';
      // Seed isolated legacy v1 keys as used by legacy app.js and E2E tests
      mockStorage.setItem(`ey8_learned_vocab_v1_${username}`, JSON.stringify(['u1-v1', 'u1-v2']));
      mockStorage.setItem(`ey8_unit_scores_v1_${username}`, JSON.stringify({ 1: 9.5, 2: 8.0 }));
      mockStorage.setItem(
        `ey8_mistakes_v1_${username}`,
        JSON.stringify({
          'u1-q3': { id: 'u1-q3', questionId: 'u1-q3', answer: 1, wrongAnswer: 0 },
        })
      );

      // Call getStudentSnapshot without an existing ey8_snapshot_legacy_student
      const snap = getStudentSnapshot(username);

      // Verified: Legacy v1 progress is seamlessly migrated into student snapshot and persisted
      expect(snap.learnedVocab).toEqual(['u1-v1', 'u1-v2']);
      expect(snap.unitScores).toEqual({ 1: 9.5, 2: 8.0 });
      expect(snap.mistakes).toHaveLength(1);
      expect(snap.mistakes[0].questionId).toBe('u1-q3');

      // Verify it was saved to ey8_snapshot_legacy_student
      const savedRaw = mockStorage.getItem(`ey8_snapshot_${username}`);
      expect(savedRaw).toBeTruthy();
    });

    it('3.2 normalizes legacy snapshot containing object-based learnedVocab and mistakes', () => {
      const username = 'obj_legacy_user';
      mockStorage.setItem(
        `ey8_snapshot_${username}`,
        JSON.stringify({
          username,
          learnedVocab: { 'u1-v1': true, 'u1-v2': false, 'u1-v3': true },
          mistakes: {
            'm-1': { id: 'm-1', questionId: 'q1', wrongAnswer: 0, resolved: false },
            'm-2': { id: 'm-2', questionId: 'q2', wrongAnswer: 1, resolved: true },
          },
        })
      );

      const snap = getStudentSnapshot(username);
      expect(snap.learnedVocab).toEqual(['u1-v1', 'u1-v3']);
      expect(snap.mistakes).toHaveLength(2);
      expect(snap.mistakes.map((m) => m.questionId)).toEqual(['q1', 'q2']);
    });

    it('3.3 should fallback to un-prefixed legacy v1 keys if user-specific keys are absent', () => {
      const username = 'legacy_fallback_user';
      mockStorage.setItem(STORAGE_KEYS.LEGACY_LEARNED_VOCAB, JSON.stringify(['u1-v9']));
      mockStorage.setItem(STORAGE_KEYS.LEGACY_UNIT_SCORES, JSON.stringify({ 3: 10 }));

      const snap = getStudentSnapshot(username);
      expect(snap.learnedVocab).toEqual(['u1-v9']);
      expect(snap.unitScores).toEqual({ 3: 10 });
    });
  });

  describe('4. Storage Service: Large Mistake Lists Scale Stress', () => {
    it('4.1 should scale to 1,000 mistakes without timing out or corrupting data', () => {
      const username = 'scale_tester';
      const snap = getStudentSnapshot(username);

      const startTime = Date.now();
      const largeMistakes: MistakeItem[] = [];
      for (let i = 0; i < 1000; i++) {
        largeMistakes.push({
          id: `m_${i}`,
          sourceType: 'unit',
          sourceId: (i % 6) + 1,
          questionId: `q_scale_${i}`,
          question: {
            id: `q_scale_${i}`,
            section: 'Vocabulary',
            question: `Scale test question ${i} with long descriptive text explaining English grammar concepts`,
            options: ['Option A text', 'Option B text', 'Option C text', 'Option D text'],
            answer: i % 4,
            explanation: `Detailed explanation for question ${i}`,
          },
          wrongAnswer: (i + 1) % 4,
          addedAt: new Date().toISOString(),
          resolved: i % 2 === 0,
        });
      }
      snap.mistakes = largeMistakes;
      saveStudentSnapshot(snap);

      const saveTime = Date.now() - startTime;
      expect(saveTime).toBeLessThan(1000);

      // Verify retrieval and parsing speed
      const retrieveStart = Date.now();
      const retrieved = getStudentSnapshot(username);
      const retrieveTime = Date.now() - retrieveStart;
      expect(retrieveTime).toBeLessThan(500);
      expect(retrieved.mistakes).toHaveLength(1000);

      // Verify addMistake on 1,000-item array
      const addStart = Date.now();
      addMistake(username, {
        sourceType: 'unit',
        sourceId: 1,
        questionId: 'q_scale_new',
        question: {
          id: 'q_scale_new',
          section: 'Grammar',
          question: 'New question',
          options: ['A', 'B', 'C', 'D'],
          answer: 0,
          explanation: 'Exp',
        },
        wrongAnswer: 2,
      });
      const addTime = Date.now() - addStart;
      expect(addTime).toBeLessThan(200);

      const updated = getStudentSnapshot(username);
      expect(updated.mistakes).toHaveLength(1001);
      expect(updated.mistakes[0].questionId).toBe('q_scale_new');

      // Verify resolveMistake on 1,001-item array
      const resolveStart = Date.now();
      resolveMistake(username, 'q_scale_500');
      const resolveTime = Date.now() - resolveStart;
      expect(resolveTime).toBeLessThan(200);

      const resolvedSnap = getStudentSnapshot(username);
      const target = resolvedSnap.mistakes.find((m) => m.questionId === 'q_scale_500');
      expect(target?.resolved).toBe(true);
    });
  });

  describe('5. Storage Service: Duplicate IDs and Idempotency', () => {
    const username = 'dup_tester';

    it('5.1 addMistake should update existing mistake with same questionId rather than duplicate', () => {
      addMistake(username, {
        sourceType: 'unit',
        sourceId: 1,
        questionId: 'dup_q1',
        question: {
          id: 'dup_q1',
          section: 'Vocab',
          question: 'Dup Q',
          options: ['A', 'B'],
          answer: 0,
          explanation: '',
        },
        wrongAnswer: 1,
        userNote: 'Initial note',
      });

      let snap = getStudentSnapshot(username);
      expect(snap.mistakes).toHaveLength(1);
      expect(snap.mistakes[0].wrongAnswer).toBe(1);

      addMistake(username, {
        sourceType: 'unit',
        sourceId: 1,
        questionId: 'dup_q1',
        question: {
          id: 'dup_q1',
          section: 'Vocab',
          question: 'Dup Q',
          options: ['A', 'B'],
          answer: 0,
          explanation: '',
        },
        wrongAnswer: 2,
        userNote: 'Updated note',
      });

      snap = getStudentSnapshot(username);
      expect(snap.mistakes).toHaveLength(1);
      expect(snap.mistakes[0].wrongAnswer).toBe(2);
      expect(snap.mistakes[0].userNote).toBe('Updated note');
    });

    it('5.2 setVocabLearned should be strictly idempotent with duplicate additions', () => {
      setVocabLearned(username, 'u1-v1', true);
      setVocabLearned(username, 'u1-v1', true);
      setVocabLearned(username, 'u1-v1', true);

      const snap = getStudentSnapshot(username);
      expect(snap.learnedVocab).toEqual(['u1-v1']);
    });

    it('5.3 FINDING: pre-existing duplicate questionId entries cause resolveMistake to leave secondary items unresolved', () => {
      mockStorage.setItem(
        `ey8_snapshot_${username}`,
        JSON.stringify({
          username,
          learnedVocab: [],
          unitScores: {},
          examHistory: [],
          mistakes: [
            {
              id: 'm1',
              questionId: 'dup_existing',
              wrongAnswer: 0,
              resolved: false,
            },
            {
              id: 'm2',
              questionId: 'dup_existing',
              wrongAnswer: 1,
              resolved: false,
            },
          ],
        })
      );

      resolveMistake(username, 'dup_existing');
      const snap = getStudentSnapshot(username);
      // resolveMistake uses Array.prototype.find which returns only first element
      expect(snap.mistakes[0].resolved).toBe(true);
      expect(snap.mistakes[1].resolved).toBe(false); // Second duplicate remains unresolved
    });
  });

  // =========================================================================
  // 2. SPEECH SERVICE EMPIRICAL STRESS TESTS
  // =========================================================================

  describe('6. Speech Service: Extreme Input & Cleaner Robustness', () => {
    describe('cleanSpeechText edge cases', () => {
      it('6.1 handles empty, whitespace, and falsy inputs cleanly', () => {
        expect(cleanSpeechText('')).toBe('');
        expect(cleanSpeechText('   ')).toBe('');
        expect(cleanSpeechText('\t\n\r')).toBe('');
        expect(cleanSpeechText(null as unknown as string)).toBe('');
        expect(cleanSpeechText(undefined as unknown as string)).toBe('');
      });

      it('6.2 handles slashes only, brackets only, isolated IPA, and nested parentheses', () => {
        expect(cleanSpeechText('/')).toBe('');
        expect(cleanSpeechText('///')).toBe('');
        expect(cleanSpeechText('/leɪʒər/')).toBe('leɪʒər');
        expect(cleanSpeechText('/ʊ/ (u ngắn)')).toBe('ʊ');
        expect(cleanSpeechText('/i:/')).toBe('i:');
        expect(cleanSpeechText('()')).toBe('');
        expect(cleanSpeechText('(v)')).toBe('');
        expect(cleanSpeechText('((nested))')).toBe('');
        expect(cleanSpeechText('(v.phr) /aɪ piː eɪ/')).toBe('aɪ piː eɪ');
      });

      it('6.3 FINDING: square brackets and curly braces are NOT stripped', () => {
        // cleanSpeechText only strips parentheses ( ), not [ ] or { }
        expect(cleanSpeechText('book [n]')).toBe('book [n]');
        expect(cleanSpeechText('[adj] quick')).toBe('[adj] quick');
        expect(cleanSpeechText('{noun} apple')).toBe('{noun} apple');
      });

      it('6.4 FINDING: unclosed / unbalanced brackets are NOT stripped', () => {
        expect(cleanSpeechText('word (v')).toBe('word (v');
        expect(cleanSpeechText('word )v(')).toBe('word )v(');
      });

      it('6.5 handles extreme punctuation, symbols, and formatting', () => {
        expect(cleanSpeechText('Hello...???!!!')).toBe('Hello...???!!!');
        expect(cleanSpeechText('— -- ;; :: "" \'\'')).toBe('— -- ;; :: "" \'\'');
        expect(cleanSpeechText('!@#$%^&*()_+')).toBe('!@#$%^&*_+');
        expect(cleanSpeechText('well-known')).toBe('well-known');
        expect(cleanSpeechText('mother-in-law')).toBe('mother-in-law');
      });

      it('6.6 handles numbers, dates, and mathematical expressions', () => {
        expect(cleanSpeechText('12345')).toBe('12345');
        expect(cleanSpeechText('Unit 1: Lesson 2, Page 15')).toBe('Unit 1: Lesson 2, Page 15');
        expect(cleanSpeechText('1st, 2nd, 3rd, 4th')).toBe('1st, 2nd, 3rd, 4th');
        expect(cleanSpeechText('-0.009')).toBe('-0.009');
        expect(cleanSpeechText('9007199254740991')).toBe('9007199254740991');
      });

      it('6.7 handles Vietnamese diacritics and bilingual labels', () => {
        expect(cleanSpeechText('Chào buổi sáng, chúc bạn học tốt')).toBe('Chào buổi sáng, chúc bạn học tốt');
        expect(cleanSpeechText('tiếng Anh /tiəŋ aŋ/ (danh từ)')).toBe('tiếng Anh');
        expect(cleanSpeechText('Đặng Ngọc Ánh (học sinh giỏi)')).toBe('Đặng Ngọc Ánh');
        expect(cleanSpeechText('thầy cô giáo /θaɪ koʊ/ (n)')).toBe('thầy cô giáo');
      });
    });

    describe('speakEnglish & speakWord invocation in mocked Web Speech API environment', () => {
      let spokenUtterances: { text: string; lang: string; rate: number }[] = [];
      let cancelCalledCount = 0;

      beforeEach(() => {
        spokenUtterances = [];
        cancelCalledCount = 0;

        class MockSpeechSynthesisUtterance {
          text: string;
          lang = 'en-US';
          rate = 0.9;
          onend?: () => void;
          onerror?: (e: unknown) => void;
          constructor(text: string) {
            this.text = text;
          }
        }

        const mockSpeechSynthesis = {
          cancel: vi.fn(() => {
            cancelCalledCount++;
          }),
          speak: vi.fn((utterance: MockSpeechSynthesisUtterance) => {
            spokenUtterances.push({
              text: utterance.text,
              lang: utterance.lang,
              rate: utterance.rate,
            });
          }),
        };

        // Attach to global scope for Node.js Vitest environment
        (global as unknown as Record<string, unknown>).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
        (global as unknown as {
          window: {
            speechSynthesis: typeof mockSpeechSynthesis;
            SpeechSynthesisUtterance: typeof MockSpeechSynthesisUtterance;
            localStorage: LocalStorageStressMock;
          };
        }).window = {
          speechSynthesis: mockSpeechSynthesis,
          SpeechSynthesisUtterance: MockSpeechSynthesisUtterance,
          localStorage: mockStorage,
        };
      });

      it('6.8 should cancel previous speech before speaking new text', () => {
        expect(isSpeechSupported()).toBe(true);
        speakEnglish('Hello world');
        expect(cancelCalledCount).toBe(1);
        expect(spokenUtterances).toHaveLength(1);
        expect(spokenUtterances[0].text).toBe('Hello world');
        expect(spokenUtterances[0].lang).toBe('en-US');
        expect(spokenUtterances[0].rate).toBe(0.9);
      });

      it('6.9 should do nothing and NOT call speak when cleaned text is empty', () => {
        speakEnglish('');
        speakEnglish('   ');
        speakEnglish('/');
        speakEnglish('///');
        speakEnglish('()');
        speakEnglish('(parenthesized_only)');
        expect(spokenUtterances).toHaveLength(0);
      });

      it('6.9b should pronounce isolated phonetic sound headings', () => {
        speakEnglish('/ʊ/ (u ngắn)');
        expect(spokenUtterances).toHaveLength(1);
        expect(spokenUtterances[0].text).toBe('ʊ');
      });

      it('6.10 should properly clean input before sending to SpeechSynthesisUtterance', () => {
        speakWord('origami /ˌɒrɪˈɡɑːmi/ (n)');
        expect(spokenUtterances).toHaveLength(1);
        expect(spokenUtterances[0].text).toBe('origami');
      });

      it('6.11 should handle Vietnamese diacritics without crashing', () => {
        expect(() => speakEnglish('Xin chào')).not.toThrow();
        expect(spokenUtterances).toHaveLength(1);
        expect(spokenUtterances[0].text).toBe('Xin chào');
      });

      it('6.12 should invoke onError callback when speechSynthesis.speak throws', () => {
        const errorSpy = vi.fn();
        (window.speechSynthesis.speak as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
          throw new Error('Audio engine hardware error');
        });

        expect(() => speakEnglish('fail test', { onError: errorSpy })).not.toThrow();
        expect(errorSpy).toHaveBeenCalledTimes(1);
      });
    });
  });
});
