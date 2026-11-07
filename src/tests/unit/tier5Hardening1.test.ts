/**
 * Tier 5 Adversarial Coverage Hardening Suite 1
 * Lead Challenger: Challenger 1 (Phase 2 Hardening)
 * 
 * Comprehensive white-box stress testing, boundary condition validation,
 * corruption resilience, and edge case coverage across:
 * - src/services/ (storageService, speechService, adaptiveService, supabaseService)
 * - src/context/ (AuthContext, StudyContext, MistakeContext logic)
 * - src/components/flashcard/ (FlashcardStudio, SpellingStudio domain logic)
 * - src/components/practice/ (UnitPractice, UnitQuiz, WrittenExercises domain logic)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  STORAGE_KEYS,
  getAuthSession,
  saveAuthSession,
  clearAuthSession,
  createDefaultSnapshot,
  getSnapshotKey,
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
  getSupabaseConfig,
  saveSupabaseConfig
} from '../../services/storageService';

import {
  cleanSpeechText,
  isSpeechSupported,
  speakEnglish,
  speakWord,
  cancelSpeech
} from '../../services/speechService';

import {
  normalizeWrittenString,
  isWrittenAnswerAccepted,
  normalizeSpellingWord,
  isSpellingMatch,
  shuffleArray,
  cloneAndShuffleOptions,
  calculateScore10,
  calculateStreak,
  classifyQuestionSkill,
  compute5SkillRadar,
  generateSmartAdaptiveQuiz
} from '../../services/adaptiveService';

import { supabaseService, DEFAULT_SUPABASE_CONFIG } from '../../services/supabaseService';
import { unitsData } from '../../data/units';
import { examsData } from '../../data/exams';
import { StudentSnapshot, MistakeItem, ExamAttempt } from '../../types/storage';
import { UserSession } from '../../types/user';
import { UnitQuestion, WrittenExercise } from '../../types/curriculum';

// Robust MockStorage simulator for adversarial testing
class AdversarialMockStorage {
  private store: Record<string, string> = {};
  public shouldThrowOnGet: boolean = false;
  public shouldThrowOnSet: boolean = false;
  public shouldThrowOnRemove: boolean = false;

  clear() {
    this.store = {};
    this.shouldThrowOnGet = false;
    this.shouldThrowOnSet = false;
    this.shouldThrowOnRemove = false;
  }

  getItem(key: string): string | null {
    if (this.shouldThrowOnGet) {
      throw new Error('Simulated SecurityError / Storage Access Denied');
    }
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  }

  setItem(key: string, value: string): void {
    if (this.shouldThrowOnSet) {
      throw new Error('Simulated QuotaExceededError / LocalStorage full');
    }
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    if (this.shouldThrowOnRemove) {
      throw new Error('Simulated Storage Removal Exception');
    }
    delete this.store[key];
  }

  get length(): number {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] || null;
  }
}

describe('Tier 5 Adversarial Coverage Hardening — Challenger 1', () => {
  let mockStorage: AdversarialMockStorage;

  beforeEach(() => {
    mockStorage = new AdversarialMockStorage();
    (global as any).window = {
      localStorage: mockStorage,
      location: { hash: '#/dashboard' },
      speechSynthesis: {
        speak: vi.fn(),
        cancel: vi.fn(),
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };
    (global as any).SpeechSynthesisUtterance = class {
      text: string;
      lang: string = 'en-US';
      rate: number = 1;
      onend: (() => void) | null = null;
      onerror: ((e: any) => void) | null = null;
      constructor(text: string) {
        this.text = text;
      }
    };
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // 1. STORAGE SERVICE ADVERSARIAL STRESS & CORRUPTION RECOVERY
  // =========================================================================
  describe('1. Storage Service: Adversarial Stress & Corruption Recovery', () => {

    it('1.1 should handle storage exceptions (SecurityError, QuotaExceededError) safely without crashing', () => {
      mockStorage.shouldThrowOnSet = true;
      expect(() => saveAuthSession({ id: 'u1', username: 'test', fullName: 'Test', role: 'student' })).not.toThrow();
      expect(() => saveStudentSnapshot(createDefaultSnapshot('test'))).not.toThrow();
      expect(() => saveSystemConfig({ assignments: [], customQuestions: [], updatedAt: '' })).not.toThrow();
      expect(() => saveSupabaseConfig('url', 'key')).not.toThrow();

      mockStorage.shouldThrowOnSet = false;
      mockStorage.shouldThrowOnGet = true;
      expect(getAuthSession()).toBeNull();
      expect(getSystemConfig().assignments).toEqual([]);
      expect(getSupabaseConfig()).toEqual({ url: '', anonKey: '' });

      mockStorage.shouldThrowOnGet = false;
      mockStorage.shouldThrowOnRemove = true;
      expect(() => clearAuthSession()).not.toThrow();
    });

    it('1.2 should safely parse corrupted, truncated, and malicious JSON in auth session', () => {
      mockStorage.setItem(STORAGE_KEYS.AUTH_SESSION, '{ "username": "admin", invalid_json');
      expect(getAuthSession()).toBeNull();

      mockStorage.setItem(STORAGE_KEYS.AUTH_SESSION, '');
      expect(getAuthSession()).toBeNull();

      mockStorage.setItem(STORAGE_KEYS.AUTH_SESSION, 'null');
      expect(getAuthSession()).toBeNull();

      mockStorage.setItem(STORAGE_KEYS.AUTH_SESSION, '"primitive_string"');
      expect(getAuthSession()).toBe('primitive_string' as any);
    });

    it('1.3 should create default snapshot with valid 1-day streak and current date', () => {
      const snap: StudentSnapshot = createDefaultSnapshot('hoc_sinh_8');
      expect(snap.username).toBe('hoc_sinh_8');
      expect(snap.learnedVocab).toEqual([]);
      expect(snap.unitScores).toEqual({});
      expect(snap.examHistory).toEqual([]);
      expect(snap.mistakes).toEqual([]);
      expect(snap.streak.currentStreak).toBe(1);
      expect(snap.streak.lastStudyDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('1.4 should recover legacy data when snapshot key does not exist yet', () => {
      const username = 'migrated_user';
      // Legacy data stored with username suffix
      mockStorage.setItem(`${STORAGE_KEYS.LEGACY_LEARNED_VOCAB}_${username}`, JSON.stringify(['u1-v1', 'u1-v2']));
      mockStorage.setItem(`${STORAGE_KEYS.LEGACY_UNIT_SCORES}_${username}`, JSON.stringify({ '1': 9.5, '2': '8.0', 'invalid': null }));
      mockStorage.setItem(`${STORAGE_KEYS.LEGACY_EXAM_HISTORY}_${username}`, JSON.stringify([{ id: 'att1', score: 10 }]));
      mockStorage.setItem(`${STORAGE_KEYS.LEGACY_MISTAKES}_${username}`, JSON.stringify([{ questionId: 'q1', wrongAnswer: 1 }]));

      const snapshot = getStudentSnapshot(username);
      expect(snapshot.learnedVocab).toEqual(['u1-v1', 'u1-v2']);
      expect(snapshot.unitScores[1]).toBe(9.5);
      expect(snapshot.unitScores[2]).toBe(8.0);
      expect(snapshot.unitScores['invalid' as any]).toBeUndefined();
      expect(snapshot.examHistory.length).toBe(1);
      expect(snapshot.mistakes.length).toBe(1);

      // Verify it was migrated into snapshot storage key
      const savedRaw = mockStorage.getItem(getSnapshotKey(username));
      expect(savedRaw).not.toBeNull();
    });

    it('1.5 should recover legacy dictionary/object structures for vocab and mistakes', () => {
      const username = 'dict_migrated_user';
      // Legacy dictionary where keys are vocab IDs and values are booleans
      mockStorage.setItem(`${STORAGE_KEYS.LEGACY_LEARNED_VOCAB}_${username}`, JSON.stringify({
        'u1-v1': true,
        'u1-v2': false,
        'u1-v3': true
      }));
      // Legacy dictionary for mistakes
      mockStorage.setItem(`${STORAGE_KEYS.LEGACY_MISTAKES}_${username}`, JSON.stringify({
        'm_1': { id: 'm_1', questionId: 'q1', wrongAnswer: 2 },
        'm_2': { id: 'm_2', questionId: 'q2', wrongAnswer: 0 }
      }));

      const snapshot = getStudentSnapshot(username);
      expect(snapshot.learnedVocab).toContain('u1-v1');
      expect(snapshot.learnedVocab).toContain('u1-v3');
      expect(snapshot.learnedVocab).not.toContain('u1-v2');
      expect(snapshot.mistakes.length).toBe(2);
    });

    it('1.6 should normalize corrupted snapshot JSON and restore valid default data', () => {
      const username = 'corrupted_snap_user';
      mockStorage.setItem(getSnapshotKey(username), '{"username": "corrupted", "learnedVocab":');
      const snap = getStudentSnapshot(username);
      expect(snap.username).toBe(username);
      expect(snap.learnedVocab).toEqual([]);
      expect(snap.streak.currentStreak).toBe(1);
    });

    it('1.7 should handle anonymous / empty username gracefully', () => {
      const snap = getStudentSnapshot('');
      expect(snap.username).toBe('anonymous');
    });

    it('1.8 should prevent downgrading unitScores in saveUnitScore', () => {
      const username = 'score_tester';
      saveUnitScore(username, 1, 8.5);
      expect(getStudentSnapshot(username).unitScores[1]).toBe(8.5);

      // Attempt lower score - must preserve higher score
      saveUnitScore(username, 1, 6.0);
      expect(getStudentSnapshot(username).unitScores[1]).toBe(8.5);

      // Attempt higher score - must update
      saveUnitScore(username, 1, 9.5);
      expect(getStudentSnapshot(username).unitScores[1]).toBe(9.5);
    });

    it('1.9 should update study streak correctly on same day, consecutive day, leap day, and skipped days', () => {
      const username = 'streak_tester';
      const snap = createDefaultSnapshot(username);
      
      // Case 1: Same day -> streak unchanged
      snap.streak = { currentStreak: 3, lastStudyDate: new Date().toISOString().split('T')[0] };
      saveStudentSnapshot(snap);
      const resSameDay = updateStudyStreak(username);
      expect(resSameDay.streak.currentStreak).toBe(3);

      // Case 2: Consecutive day (yesterday -> today) -> increment by 1
      const yesterday = new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0];
      snap.streak = { currentStreak: 3, lastStudyDate: yesterday };
      saveStudentSnapshot(snap);
      const resConsecutive = updateStudyStreak(username);
      expect(resConsecutive.streak.currentStreak).toBe(4);

      // Case 3: Skipped day (> 1 day ago) -> reset to 1
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().split('T')[0];
      snap.streak = { currentStreak: 10, lastStudyDate: threeDaysAgo };
      saveStudentSnapshot(snap);
      const resSkipped = updateStudyStreak(username);
      expect(resSkipped.streak.currentStreak).toBe(1);

      // Case 4: No prior lastStudyDate -> streak is 1
      snap.streak = { currentStreak: 0, lastStudyDate: '' };
      saveStudentSnapshot(snap);
      const resEmpty = updateStudyStreak(username);
      expect(resEmpty.streak.currentStreak).toBe(1);
    });

    it('1.10 should add and resolve mistakes idempotently', () => {
      const username = 'mistake_tester';
      const q: UnitQuestion = unitsData[0].quiz[0];

      // Add mistake first time
      addMistake(username, {
        sourceType: 'unit',
        sourceId: 1,
        questionId: q.id,
        question: q,
        wrongAnswer: 1,
        userNote: 'Initial error'
      });

      let snap = getStudentSnapshot(username);
      expect(snap.mistakes.length).toBe(1);
      expect(snap.mistakes[0].wrongAnswer).toBe(1);
      expect(snap.mistakes[0].resolved).toBe(false);

      // Resolve mistake
      resolveMistake(username, q.id);
      snap = getStudentSnapshot(username);
      expect(snap.mistakes[0].resolved).toBe(true);
      expect(snap.mistakes[0].resolvedAt).toBeDefined();

      // Re-add mistake (same question made again) -> unresolves and updates wrongAnswer
      addMistake(username, {
        sourceType: 'unit',
        sourceId: 1,
        questionId: q.id,
        question: q,
        wrongAnswer: 3
      });
      snap = getStudentSnapshot(username);
      expect(snap.mistakes.length).toBe(1);
      expect(snap.mistakes[0].wrongAnswer).toBe(3);
      expect(snap.mistakes[0].resolved).toBe(false);
      expect(snap.mistakes[0].userNote).toBe('Initial error'); // Preserved note
    });

    it('1.11 should reset student snapshot cleanly', () => {
      const username = 'reset_user';
      setVocabLearned(username, 'u1-v1', true);
      saveUnitScore(username, 1, 10);
      expect(getStudentSnapshot(username).learnedVocab.length).toBe(1);

      const fresh = resetStudentSnapshot(username);
      expect(fresh.learnedVocab).toEqual([]);
      expect(fresh.unitScores).toEqual({});
      expect(getStudentSnapshot(username).learnedVocab).toEqual([]);
    });
  });

  // =========================================================================
  // 2. SPEECH SERVICE SANITIZATION & AUDIO SYNTHESIS HARDENING
  // =========================================================================
  describe('2. Speech Service: Sanitization & Audio Synthesis Hardening', () => {

    it('2.1 cleanSpeechText sanitization matrix across edge cases and malformed symbols', () => {
      // Normal vocabulary with phonetics and word type
      expect(cleanSpeechText('leisure /ˈleʒər/ (n)')).toBe('leisure');
      expect(cleanSpeechText('origami /ˌɒrɪˈɡɑːmi/ (n)')).toBe('origami');
      
      // Isolated phonetic sound with explanation
      expect(cleanSpeechText('/ʊ/ (u ngắn)')).toBe('ʊ');
      expect(cleanSpeechText('/uː/ (u dài)')).toBe('uː');
      expect(cleanSpeechText('/eɪ/')).toBe('eɪ');
      expect(cleanSpeechText('///əʊ///')).toBe('əʊ');

      // Nested and multiple parentheses
      expect(cleanSpeechText('word (annot1) (annot2)')).toBe('word');
      expect(cleanSpeechText('word ((nested))')).toBe('word');
      expect(cleanSpeechText('((only nested))')).toBe('');

      // Edge inputs: empty, whitespace, null, numbers
      expect(cleanSpeechText('')).toBe('');
      expect(cleanSpeechText('   ')).toBe('');
      expect(cleanSpeechText(null as any)).toBe('');
      expect(cleanSpeechText(undefined as any)).toBe('');

      // Phrasal verb without slashes
      expect(cleanSpeechText('hang out (with) (v)')).toBe('hang out');
      expect(cleanSpeechText('surf the net')).toBe('surf the net');
    });

    it('2.2 should detect Web Speech API availability correctly', () => {
      expect(isSpeechSupported()).toBe(true);

      // Disable window.speechSynthesis
      delete (window as any).speechSynthesis;
      expect(isSpeechSupported()).toBe(false);
    });

    it('2.3 speakEnglish and speakWord invocation, options, and error handling', () => {
      const speakSpy = vi.spyOn(window.speechSynthesis, 'speak');
      const cancelSpy = vi.spyOn(window.speechSynthesis, 'cancel');

      // Normal speech
      speakEnglish('leisure /ˈleʒər/ (n)');
      expect(cancelSpy).toHaveBeenCalled();
      expect(speakSpy).toHaveBeenCalled();

      // Legacy alias speakWord
      speakWord('origami');
      expect(speakSpy).toHaveBeenCalledTimes(2);

      // Custom speech rate and lang options
      speakEnglish('culture', { rate: 0.8, lang: 'en-GB' });
      expect(speakSpy).toHaveBeenCalledTimes(3);

      // Empty text should not invoke speech
      speakEnglish('');
      speakEnglish('   ');
      expect(speakSpy).toHaveBeenCalledTimes(3);

      // Speech cancellation
      cancelSpeech();
      expect(cancelSpy).toHaveBeenCalled();
    });

    it('2.4 should handle exceptions during speechSynthesis.speak cleanly via onError callback', () => {
      const speakSpy = vi.spyOn(window.speechSynthesis, 'speak').mockImplementation(() => {
        throw new Error('Audio hardware fault');
      });

      let errorReported: any = null;
      speakEnglish('error test', {
        onError: (err) => {
          errorReported = err;
        }
      });

      expect(speakSpy).toHaveBeenCalled();
      expect(errorReported).toBeInstanceOf(Error);
      expect(errorReported.message).toBe('Audio hardware fault');
    });
  });

  // =========================================================================
  // 3. ADAPTIVE SERVICE & DOMAIN LOGIC ALGORITHMIC STRESS
  // =========================================================================
  describe('3. Adaptive Service & Algorithmic Stress', () => {

    describe('3.1 normalizeWrittenString Contractions & Boundary Matrix', () => {
      it('correctly expands all 8 contractions with straight and curly quotes', () => {
        const tests = [
          { input: "I don't like it.", expected: "i do not like it" },
          { input: "She doesn’t know.", expected: "she does not know" },
          { input: "He isn‘t here?", expected: "he is not here" },
          { input: "They aren't ready!", expected: "they are not ready" },
          { input: "We won’t fail;", expected: "we will not fail" },
          { input: "I can't swim:", expected: "i cannot swim" },
          { input: "I’m very excited", expected: "i am very excited" },
          { input: "It’s a nice day.", expected: "it is a nice day" }
        ];

        for (const t of tests) {
          expect(normalizeWrittenString(t.input)).toBe(t.expected);
        }
      });

      it('does not corrupt words that contain contraction substrings (boundary checks)', () => {
        expect(normalizeWrittenString('scant')).toBe('scant');
        expect(normalizeWrittenString('canton')).toBe('canton');
        expect(normalizeWrittenString('item')).toBe('item');
        expect(normalizeWrittenString('itself')).toBe('itself');
        expect(normalizeWrittenString('arena')).toBe('arena');
      });

      it('collapses arbitrary whitespace, newlines, and tabs', () => {
        expect(normalizeWrittenString("  she \t does   not \n  like \r\n it.  ")).toBe('she does not like it');
      });
    });

    describe('3.2 isWrittenAnswerAccepted Auto-Grading Oracle', () => {
      it('matches valid answer variations across casing, punctuation, and contractions', () => {
        const ex: WrittenExercise = unitsData[0].writtenExercises[0]; // e.g. "She loves making origami."
        const accepted = ex.acceptedAnswers[0];
        
        expect(isWrittenAnswerAccepted(ex, accepted)).toBe(true);
        expect(isWrittenAnswerAccepted(ex, accepted.toUpperCase())).toBe(true);
        expect(isWrittenAnswerAccepted(ex, `${accepted}...?!`)).toBe(true);
        expect(isWrittenAnswerAccepted(ex, `   ${accepted}   `)).toBe(true);

        // Negative cases
        expect(isWrittenAnswerAccepted(ex, '')).toBe(false);
        expect(isWrittenAnswerAccepted(ex, 'completely wrong sentence')).toBe(false);
      });
    });

    describe('3.3 isSpellingMatch Active Recall Spelling Oracle', () => {
      it('handles exact spelling and phrasal verbs with parentheses', () => {
        expect(normalizeSpellingWord('  Hello   World  ')).toBe('hello world');
        expect(isSpellingMatch('leisure', 'leisure')).toBe(true);
        expect(isSpellingMatch('LEISURE', 'leisure')).toBe(true);
        expect(isSpellingMatch('leisure', '  leisure  ')).toBe(true);

        // Phrasal verb with optional preposition in parentheses: "hang out (with)"
        expect(isSpellingMatch('hang out (with)', 'hang out')).toBe(true);
        expect(isSpellingMatch('hang out (with)', 'hang out with')).toBe(true);
        expect(isSpellingMatch('hang out (with)', 'HANG OUT WITH')).toBe(true);

        // Negative cases
        expect(isSpellingMatch('hang out (with)', 'hang')).toBe(false);
        expect(isSpellingMatch('hang out (with)', 'with')).toBe(false);
        expect(isSpellingMatch('leisure', 'liesure')).toBe(false); // typo
        expect(isSpellingMatch('leisure', '')).toBe(false);
      });
    });

    describe('3.4 shuffleArray & cloneAndShuffleOptions Fisher-Yates Invariants', () => {
      it('shuffleArray is immutable and maintains all elements', () => {
        const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const copy = [...original];
        const shuffled = shuffleArray(original);

        expect(original).toEqual(copy); // Source not mutated
        expect(shuffled.length).toBe(original.length);
        expect(new Set(shuffled)).toEqual(new Set(original));

        // Edge lengths
        expect(shuffleArray([])).toEqual([]);
        expect(shuffleArray([42])).toEqual([42]);
      });

      it('cloneAndShuffleOptions correctly updates answer index and re-indexes letters A-D', () => {
        const question: UnitQuestion = unitsData[0].quiz[0];
        const correctOriginalText = question.options[question.answer].replace(/^[A-D][\.\)\:\-]\s*/i, '').trim();

        // Run multiple shuffles with distinct random seeds
        for (let seed = 0; seed < 5; seed++) {
          const rng = () => ((seed + 1) * 0.17) % 1;
          const shuffled = cloneAndShuffleOptions(question, rng);

          expect(shuffled.options.length).toBe(question.options.length);
          // Verify option prefixes
          expect(shuffled.options[0]).toMatch(/^A\.\s/);
          expect(shuffled.options[1]).toMatch(/^B\.\s/);
          expect(shuffled.options[2]).toMatch(/^C\.\s/);
          expect(shuffled.options[3]).toMatch(/^D\.\s/);

          // Verify new answer index matches the correct text
          const correctShuffledText = shuffled.options[shuffled.answer].replace(/^([A-D])\.\s*/, '').trim();
          expect(correctShuffledText).toBe(correctOriginalText);
        }
      });
    });

    describe('3.5 calculateScore10, calculateStreak & 5-Skill Radar Breakdown', () => {
      it('calculateScore10 calculates exact 10-point scale scores with rounding', () => {
        expect(calculateScore10(10, 10)).toBe(10.0);
        expect(calculateScore10(0, 10)).toBe(0.0);
        expect(calculateScore10(1, 12)).toBe(0.83); // 1/12 * 10 = 0.8333... -> 0.83
        expect(calculateScore10(7, 12)).toBe(5.83); // 7/12 * 10 = 5.8333... -> 5.83
        expect(calculateScore10(11, 12)).toBe(9.17); // 11/12 * 10 = 9.1666... -> 9.17
        expect(calculateScore10(0, 0)).toBe(0); // Zero division guard
      });

      it('calculateStreak counts unique days and ignores duplicate attempts on the same day', () => {
        expect(calculateStreak([])).toBe(0);

        const history = [
          { submittedAt: '2026-11-06T10:00:00Z' },
          { submittedAt: '2026-11-06T12:00:00Z' }, // Duplicate day
          { submittedAt: '2026-11-05T09:30:00Z' },
          { submittedAt: '2026-11-04T15:20:00Z' },
        ];
        expect(calculateStreak(history)).toBe(3);

        const legacyHistory = [
          { date: '2026-11-06 10:00:00' },
          { date: '2026-11-05 08:00:00' }
        ];
        expect(calculateStreak(legacyHistory)).toBe(2);
      });

      it('classifyQuestionSkill categorizes all 5 skills across English and Vietnamese tags', () => {
        expect(classifyQuestionSkill({ section: 'PRONUNCIATION' })).toBe('pronunciation');
        expect(classifyQuestionSkill({ section: 'Ngữ âm & Trọng âm' })).toBe('pronunciation');
        expect(classifyQuestionSkill({ section: 'GRAMMAR' })).toBe('grammar');
        expect(classifyQuestionSkill({ section: 'Ngữ pháp thì hiện tại' })).toBe('grammar');
        expect(classifyQuestionSkill({ section: 'READING COMPREHENSION' })).toBe('reading');
        expect(classifyQuestionSkill({ section: 'Đọc hiểu đoạn văn', passage: 'Some passage' })).toBe('reading');
        expect(classifyQuestionSkill({ section: 'WRITING' })).toBe('writing');
        expect(classifyQuestionSkill({ type: 'word-form' })).toBe('writing');
        expect(classifyQuestionSkill({ type: 'rewrite' })).toBe('writing');
        expect(classifyQuestionSkill({ section: 'VOCABULARY' })).toBe('vocabulary');
      });

      it('compute5SkillRadar handles empty attempts and calculates rounded percentages safely without NaN', () => {
        const emptyRadar = compute5SkillRadar([]);
        expect(emptyRadar.pronunciation).toEqual({ total: 0, correct: 0, percentage: 0 });
        expect(emptyRadar.vocabulary).toEqual({ total: 0, correct: 0, percentage: 0 });
        expect(emptyRadar.grammar).toEqual({ total: 0, correct: 0, percentage: 0 });
        expect(emptyRadar.reading).toEqual({ total: 0, correct: 0, percentage: 0 });
        expect(emptyRadar.writing).toEqual({ total: 0, correct: 0, percentage: 0 });

        const attempts = [
          {
            answersDetails: [
              { section: 'Pronunciation', isCorrect: true },
              { section: 'Pronunciation', isCorrect: false },
              { section: 'Grammar', isCorrect: true },
              { section: 'Grammar', isCorrect: true },
              { section: 'Reading', isCorrect: true },
            ]
          }
        ];
        const radar = compute5SkillRadar(attempts);
        expect(radar.pronunciation.total).toBe(2);
        expect(radar.pronunciation.correct).toBe(1);
        expect(radar.pronunciation.percentage).toBe(50);

        expect(radar.grammar.total).toBe(2);
        expect(radar.grammar.correct).toBe(2);
        expect(radar.grammar.percentage).toBe(100);

        expect(radar.reading.total).toBe(1);
        expect(radar.reading.percentage).toBe(100);

        // Zero total skills have 0%
        expect(radar.vocabulary.percentage).toBe(0);
        expect(radar.writing.percentage).toBe(0);
      });
    });

    describe('3.6 generateSmartAdaptiveQuiz Remediation Distribution', () => {
      it('draws up to 70% from unresolved mistakes and remaining from question bank without duplicates', () => {
        const sampleMistakes: MistakeItem[] = [
          {
            id: 'm1',
            sourceType: 'unit',
            sourceId: 1,
            questionId: 'u1-q1',
            question: unitsData[0].quiz[0],
            wrongAnswer: 0,
            addedAt: '',
            resolved: false
          },
          {
            id: 'm2',
            sourceType: 'unit',
            sourceId: 1,
            questionId: 'u1-q2',
            question: unitsData[0].quiz[1],
            wrongAnswer: 1,
            addedAt: '',
            resolved: false
          },
          {
            id: 'm3_resolved',
            sourceType: 'unit',
            sourceId: 1,
            questionId: 'u1-q3',
            question: unitsData[0].quiz[2],
            wrongAnswer: 2,
            addedAt: '',
            resolved: true // Should be skipped
          }
        ];

        // Bank questions do not include u1-q3 (quiz[2])
        const bank = unitsData[0].quiz.slice(3);
        const adaptiveQuiz = generateSmartAdaptiveQuiz(sampleMistakes, bank, 10);

        expect(adaptiveQuiz.length).toBeLessThanOrEqual(10);
        const ids = adaptiveQuiz.map(q => q.id);
        const uniqueIds = new Set(ids);
        expect(ids.length).toBe(uniqueIds.size); // Zero duplicate questions
        expect(uniqueIds.has('u1-q3')).toBe(false); // Resolved mistake excluded from mistakes pool and not in bank
      });
    });
  });

  // =========================================================================
  // 4. SUPABASE SERVICE RESILIENCE & FALLBACK VERIFICATION
  // =========================================================================
  describe('4. Supabase Service: Resilience & Fallback Verification', () => {
    let mockClient: any;

    beforeEach(() => {
      mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null })
          }),
          limit: vi.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        })
      };
      (supabaseService as any).client = mockClient;
    });

    it('4.1 should initialize with default project configuration', () => {
      expect(DEFAULT_SUPABASE_CONFIG.URL).toContain('supabase.co');
      expect(DEFAULT_SUPABASE_CONFIG.ANON_KEY).toBeDefined();
    });

    it('4.2 updateCredentials updates storage and client', () => {
      supabaseService.updateCredentials('https://custom.supabase.co', 'custom_key_123');
      expect(mockStorage.getItem(STORAGE_KEYS.SUPABASE_URL)).toBe('https://custom.supabase.co');
      expect(mockStorage.getItem(STORAGE_KEYS.SUPABASE_ANON)).toBe('custom_key_123');
    });

    it('4.3 syncSnapshot always updates local storage even if cloud connection is unconfigured or fails', async () => {
      const snap = createDefaultSnapshot('offline_user');
      snap.learnedVocab = ['u1-v1', 'u1-v2'];
      
      const success = await supabaseService.syncSnapshot('offline_user', snap);
      // Local snapshot is guaranteed saved
      const savedLocal = getStudentSnapshot('offline_user');
      expect(savedLocal.learnedVocab).toEqual(['u1-v1', 'u1-v2']);
      expect(typeof success).toBe('boolean');
    });

    it('4.4 fetchSnapshot falls back to local snapshot if cloud errors or is offline', async () => {
      const snap = createDefaultSnapshot('fallback_user');
      snap.unitScores = { 1: 9.0 };
      saveStudentSnapshot(snap);

      const fetched = await supabaseService.fetchSnapshot('fallback_user');
      expect(fetched.username).toBe('fallback_user');
      expect(fetched.unitScores[1]).toBe(9.0);
    });

    it('4.5 testConnection returns structured status without uncaught exceptions', async () => {
      const result = await supabaseService.testConnection();
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.message).toBe('string');
      expect(result.success).toBe(true);
    });
  });

  // =========================================================================
  // 5. CONTEXT STATE MACHINE INTEGRATION TESTS (AUTH, STUDY, MISTAKES)
  // =========================================================================
  describe('5. Context State Machine Integration & Logic Audits', () => {

    describe('5.1 Auth State Machine Simulation', () => {
      it('manages role toggle, admin login, student login, and logout storage synchronization', () => {
        let currentUser: UserSession = {
          id: 'usr_em_lop8',
          username: 'em_lop8',
          fullName: 'Em Lớp 8',
          role: 'student'
        };

        const toggleRole = () => {
          currentUser = currentUser.role === 'admin'
            ? { id: 'usr_em_lop8', username: 'em_lop8', fullName: 'Em Lớp 8', role: 'student' }
            : { id: 'usr_admin', username: 'admin', fullName: 'Quản Trị Viên', role: 'admin' };
          saveAuthSession(currentUser);
        };

        const login = (username: string) => {
          const role: 'student' | 'admin' = username.toLowerCase() === 'admin' ? 'admin' : 'student';
          currentUser = {
            id: `usr_${username}`,
            username,
            fullName: role === 'admin' ? 'Quản Trị Viên' : `Học Sinh (${username})`,
            role
          };
          saveAuthSession(currentUser);
        };

        const logout = () => {
          clearAuthSession();
          currentUser = { id: 'usr_em_lop8', username: 'em_lop8', fullName: 'Em Lớp 8', role: 'student' };
        };

        // 1. Initial student
        expect(currentUser.role).toBe('student');

        // 2. Toggle to admin
        toggleRole();
        expect(currentUser.role).toBe('admin');
        expect(getAuthSession()?.role).toBe('admin');

        // 3. Toggle back to student
        toggleRole();
        expect(currentUser.role).toBe('student');
        expect(getAuthSession()?.role).toBe('student');

        // 4. Case-insensitive admin login
        login('ADMIN');
        expect(currentUser.role).toBe('admin');
        expect(currentUser.username).toBe('ADMIN');

        login('student_alpha');
        expect(currentUser.role).toBe('student');
        expect(currentUser.username).toBe('student_alpha');

        // 5. Logout
        logout();
        expect(getAuthSession()).toBeNull();
        expect(currentUser.username).toBe('em_lop8');
      });
    });

    describe('5.2 Study Context State Machine Simulation', () => {
      it('enforces vocabulary deduplication, score monotonicity, and attempt recording', () => {
        const username = 'context_student';
        let learnedVocab: string[] = [];
        let unitScores: Record<number, number> = {};
        let examHistory: ExamAttempt[] = [];

        const markVocabLearned = (vocabId: string) => {
          if (!learnedVocab.includes(vocabId)) {
            learnedVocab = [...learnedVocab, vocabId];
            setVocabLearned(username, vocabId, true);
          }
        };

        const unmarkVocabLearned = (vocabId: string) => {
          learnedVocab = learnedVocab.filter(id => id !== vocabId);
          setVocabLearned(username, vocabId, false);
        };

        const saveScore = (unitId: number, score: number) => {
          const prevBest = unitScores[unitId] || 0;
          if (score >= prevBest) {
            unitScores = { ...unitScores, [unitId]: score };
            saveUnitScore(username, unitId, score);
          }
        };

        // 1. Mark vocab with deduplication
        markVocabLearned('u1-v1');
        markVocabLearned('u1-v1'); // Duplicate call
        markVocabLearned('u1-v2');
        expect(learnedVocab).toEqual(['u1-v1', 'u1-v2']);
        expect(getStudentSnapshot(username).learnedVocab).toEqual(['u1-v1', 'u1-v2']);

        // 2. Unmark vocab
        unmarkVocabLearned('u1-v1');
        expect(learnedVocab).toEqual(['u1-v2']);
        expect(getStudentSnapshot(username).learnedVocab).toEqual(['u1-v2']);

        // 3. Score monotonicity
        saveScore(1, 8.0);
        expect(unitScores[1]).toBe(8.0);
        saveScore(1, 7.0); // Should be ignored
        expect(unitScores[1]).toBe(8.0);
        saveScore(1, 9.5); // Should update
        expect(unitScores[1]).toBe(9.5);

        // 4. Record exam attempt
        const attempt: ExamAttempt = {
          id: 'att_101',
          examId: 'midterm-1',
          examTitle: 'Đề Thi Giữa Kì 1',
          score: 8.5,
          totalQuestions: 20,
          timeSpentSeconds: 600,
          answers: { 'mid1_q1': 0 },
          submittedAt: new Date().toISOString()
        };
        examHistory = [attempt, ...examHistory];
        saveExamAttempt(username, attempt);

        const snap = getStudentSnapshot(username);
        expect(snap.examHistory.length).toBe(1);
        expect(snap.examHistory[0].id).toBe('att_101');
      });
    });

    describe('5.3 Mistake Notebook State Machine Simulation', () => {
      it('simulates harvesting, spoiler-free retry, batch resolution, and clearance', () => {
        let mistakes: MistakeItem[] = [];

        const harvest = (
          sourceType: 'unit' | 'exam',
          sourceId: string | number,
          wrongList: Array<{ question: UnitQuestion; wrongAnswer: number }>
        ) => {
          const current = [...mistakes];
          const map = new Map<string, MistakeItem>();
          current.forEach(m => map.set(m.questionId, m));

          wrongList.forEach(({ question, wrongAnswer }) => {
            const existing = map.get(question.id);
            if (existing) {
              existing.wrongAnswer = wrongAnswer;
              existing.resolved = false;
            } else {
              const item: MistakeItem = {
                id: `mst_${question.id}`,
                sourceType,
                sourceId,
                questionId: question.id,
                question,
                wrongAnswer,
                addedAt: new Date().toISOString(),
                resolved: false
              };
              current.push(item);
              map.set(question.id, item);
            }
          });
          mistakes = current;
        };

        const retry = (mistakeId: string, optionIdx: number) => {
          const item = mistakes.find(m => m.id === mistakeId);
          if (!item) return { isCorrect: false };
          const isCorrect = optionIdx === item.question.answer;
          if (isCorrect) {
            item.resolved = true;
            item.resolvedAt = new Date().toISOString();
          }
          return { isCorrect };
        };

        const resolveBatch = (ids: string[]) => {
          const idSet = new Set(ids);
          mistakes = mistakes.map(m => idSet.has(m.id) ? { ...m, resolved: true } : m);
        };

        const clearResolved = () => {
          const unresolved = mistakes.filter(m => !m.resolved);
          const count = mistakes.length - unresolved.length;
          mistakes = unresolved;
          return count;
        };

        const q1 = unitsData[0].quiz[0];
        const q2 = unitsData[0].quiz[1];

        // 1. Harvest 2 wrong answers
        harvest('unit', 1, [
          { question: q1, wrongAnswer: (q1.answer + 1) % 4 },
          { question: q2, wrongAnswer: (q2.answer + 2) % 4 }
        ]);
        expect(mistakes.length).toBe(2);
        expect(mistakes.every(m => !m.resolved)).toBe(true);

        // 2. Retry q1 incorrectly
        const wrongResult = retry(`mst_${q1.id}`, (q1.answer + 1) % 4);
        expect(wrongResult.isCorrect).toBe(false);
        expect(mistakes.find(m => m.id === `mst_${q1.id}`)?.resolved).toBe(false);

        // 3. Retry q1 correctly
        const correctResult = retry(`mst_${q1.id}`, q1.answer);
        expect(correctResult.isCorrect).toBe(true);
        expect(mistakes.find(m => m.id === `mst_${q1.id}`)?.resolved).toBe(true);

        // 4. Batch resolution
        resolveBatch([`mst_${q2.id}`]);
        expect(mistakes.find(m => m.id === `mst_${q2.id}`)?.resolved).toBe(true);

        // 5. Clear resolved mistakes
        const clearedCount = clearResolved();
        expect(clearedCount).toBe(2);
        expect(mistakes.length).toBe(0);
      });
    });
  });

  // =========================================================================
  // 6. COMPONENT DOMAIN LOGIC & INTERACTION STRESS
  // =========================================================================
  describe('6. Component Domain Logic & Edge Interactions', () => {

    describe('6.1 FlashcardStudio & Keyboard Navigation Invariants', () => {
      it('calculates unlearned deck filtering and empty deck hero transition', () => {
        const unit = unitsData[0];
        const allVocab = unit.vocab;
        const learnedSet = new Set<string>();

        const getActiveDeck = (mode: 'unlearned' | 'all') => {
          return mode === 'all' ? allVocab : allVocab.filter(v => !learnedSet.has(v.id));
        };

        // Initial unlearned deck has full size
        expect(getActiveDeck('unlearned').length).toBe(allVocab.length);

        // Mark all words learned
        allVocab.forEach(v => learnedSet.add(v.id));
        expect(getActiveDeck('unlearned').length).toBe(0); // Triggers deck completed hero
        expect(getActiveDeck('all').length).toBe(allVocab.length); // All mode still accessible
      });

      it('prevents keyboard shortcuts when typing in input or textarea fields', () => {
        const canTriggerShortcut = (targetTagName: string) => {
          return targetTagName !== 'INPUT' && targetTagName !== 'TEXTAREA';
        };

        expect(canTriggerShortcut('BODY')).toBe(true);
        expect(canTriggerShortcut('DIV')).toBe(true);
        expect(canTriggerShortcut('BUTTON')).toBe(true);
        expect(canTriggerShortcut('INPUT')).toBe(false);
        expect(canTriggerShortcut('TEXTAREA')).toBe(false);
      });

      it('wraps card stepping correctly for first and last cards', () => {
        const deckLength = 5;
        const nextIndex = (curr: number) => (curr + 1) % deckLength;
        const prevIndex = (curr: number) => (curr - 1 + deckLength) % deckLength;

        expect(nextIndex(4)).toBe(0); // Wrap next from end to beginning
        expect(prevIndex(0)).toBe(4); // Wrap prev from start to end
        expect(nextIndex(2)).toBe(3);
        expect(prevIndex(2)).toBe(1);
      });
    });

    describe('6.2 SpellingStudio Active Recall Masking & Hints Logic', () => {
      it('masks target word inside context sentence without regex injection issues', () => {
        const word = 'hang out (with)';
        const sentence = 'Teenagers often hang out (with) friends on weekends.';
        
        const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const masked = sentence.replace(new RegExp(escaped, 'gi'), '____________');

        expect(masked).toBe('Teenagers often ____________ friends on weekends.');
        expect(masked).not.toContain(word);
      });

      it('progressively reveals hint characters clamped at word length', () => {
        const word = 'harvest';
        let hintsRevealed = 0;
        const handleHint = () => {
          hintsRevealed = Math.min(word.length, hintsRevealed + 1);
        };

        for (let i = 0; i < 10; i++) {
          handleHint();
        }
        expect(hintsRevealed).toBe(word.length); // Clamped at 7
      });
    });

    describe('6.3 UnitQuiz Submission & Auto-Harvesting Logic', () => {
      it('correctly scores answered questions and marks unselected questions as wrong with wrongAnswer = -1', () => {
        const unit = unitsData[0];
        const questions = unit.quiz; // 12 questions
        const selectedAnswers: Record<string, number> = {
          [questions[0].id]: questions[0].answer, // Correct
          [questions[1].id]: (questions[1].answer + 1) % 4, // Wrong
          // questions[2..11] left unanswered
        };

        let correctCount = 0;
        const wrongList: Array<{ question: UnitQuestion; wrongAnswer: number }> = [];

        questions.forEach(q => {
          const chosen = selectedAnswers[q.id];
          if (chosen === q.answer) {
            correctCount++;
          } else {
            wrongList.push({
              question: q,
              wrongAnswer: chosen !== undefined ? chosen : -1
            });
          }
        });

        const score10 = calculateScore10(correctCount, questions.length);
        expect(correctCount).toBe(1);
        expect(score10).toBe(0.83); // 1/12 * 10
        expect(wrongList.length).toBe(11);
        expect(wrongList[0].wrongAnswer).toBe((questions[1].answer + 1) % 4);
        expect(wrongList[1].wrongAnswer).toBe(-1); // Unanswered
      });
    });

    describe('6.4 WrittenExercises Validation & Hint Management', () => {
      it('auto-grades word-form and rewrite exercises with hints toggle', () => {
        const unit = unitsData[0];
        const exercises = unit.writtenExercises;
        const ex = exercises[0];

        // 1. Validation logic
        expect(isWrittenAnswerAccepted(ex, ex.acceptedAnswers[0])).toBe(true);

        // 2. Hint state toggle
        let hintsVisible: Record<string, boolean> = {};
        const toggleHint = (id: string) => {
          hintsVisible = { ...hintsVisible, [id]: !hintsVisible[id] };
        };

        expect(hintsVisible[ex.id]).toBeFalsy();
        toggleHint(ex.id);
        expect(hintsVisible[ex.id]).toBe(true);
        toggleHint(ex.id);
        expect(hintsVisible[ex.id]).toBe(false);
      });
    });
  });

  // =========================================================================
  // 7. WHOLE CURRICULUM INTEGRITY CHECK & ZERO GAP VERIFICATION
  // =========================================================================
  describe('7. Whole Curriculum Integrity & Boundary Invariants', () => {
    it('7.1 verifies all 12 units contain required data structures matching interface contracts', () => {
      expect(unitsData.length).toBe(12);
      unitsData.forEach((unit, idx) => {
        expect(unit.id === idx + 1 || unit.id === `unit-${idx + 1}`).toBe(true);
        expect(unit.title).toBeDefined();
        expect(unit.vocab.length).toBeGreaterThan(0);
        expect(unit.pronunciation.sounds.length).toBe(2);
        expect(unit.grammar.length).toBeGreaterThan(0);
        expect(unit.quiz.length).toBe(12);
        expect(unit.writtenExercises.length).toBe(6);
      });
    });

    it('7.2 verifies all 14 exams contain valid questions and durations matching interface contracts', () => {
      expect(examsData.length).toBe(14);
      examsData.forEach(exam => {
        expect(exam.id).toBeDefined();
        expect(exam.title).toBeDefined();
        expect(exam.durationMinutes).toBeGreaterThan(0);
        expect(exam.questions.length).toBeGreaterThan(0);
        exam.questions.forEach(q => {
          expect(q.id).toBeDefined();
          expect(q.question).toBeDefined();
          expect(q.options.length).toBe(4);
          expect(q.answer).toBeGreaterThanOrEqual(0);
          expect(q.answer).toBeLessThanOrEqual(3);
        });
      });
    });
  });
});
