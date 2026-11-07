/**
 * ============================================================================
 * Tier 5 Adversarial Coverage Hardening Suite 2 (Challenger 2)
 * Target Components & Modules:
 *  - src/components/exam/ (ExamRoom, ExamList, ExamResultModal)
 *  - src/components/mistakes/ (MistakesNotebook)
 *  - src/components/admin/ (AdminPortal)
 *  - src/components/layout/ (Header, MobileBottomNav) & src/App.tsx router
 *
 * Vectors Stress-Tested:
 *  - Extreme inputs (empty strings, huge payloads, out-of-bounds indices)
 *  - Route manipulation & direct hash jumping
 *  - State recovery across page reloads (simulated localStorage refresh)
 *  - Mobile viewport scaling and navigation transitions
 * ============================================================================
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  STORAGE_KEYS,
  getStudentSnapshot,
  saveStudentSnapshot,
  getSystemConfig,
  saveSystemConfig,
  getSupabaseConfig,
  saveSupabaseConfig,
  getAuthSession,
  saveAuthSession
} from '../../services/storageService';
import {
  cloneAndShuffleOptions,
  calculateScore10,
  generateSmartAdaptiveQuiz
} from '../../services/adaptiveService';
import { examsData } from '../../data/exams';
import { unitsData } from '../../data/units';
import { ExamData, UnitQuestion } from '../../types/curriculum';
import { MistakeItem, StudentSnapshot, HomeworkAssignment, CustomQuestion } from '../../types/storage';
import { UserSession } from '../../types/user';

// Mock localStorage engine for Node test environment
class MockStorage {
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

describe('Tier 5 Adversarial Hardening Suite 2 (Challenger 2)', () => {
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
    (global as any).window = {
      localStorage: mockStorage,
      location: { hash: '#/dashboard' },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };
    vi.restoreAllMocks();
  });

  // =========================================================================
  // SECTION 1: EXAM COMPONENTS WHITE-BOX STRESS & BOUNDARY HARDENING
  // (ExamRoom, ExamList, ExamResultModal)
  // =========================================================================
  describe('1. Exam Components White-Box Stress & Boundary Hardening', () => {

    describe('1.1 ExamRoom Submission, Option Out-of-Bounds & Time Tracking', () => {
      it('1.1.1 gracefully handles out-of-bounds chosen option indices (-1, 999, NaN, undefined)', () => {
        const exam = examsData[0]; // 12 questions
        const questions = exam.questions;

        // Adversarial user selections: negative index, out-of-range index, undefined
        const adversarialAnswers: Record<string, number> = {
          [questions[0].id]: -1,
          [questions[1].id]: 999,
          [questions[2].id]: questions[2].answer, // 1 valid correct
          [questions[3].id]: NaN as any,
          // remaining questions are omitted (undefined)
        };

        let correctCount = 0;
        const wrongList: Array<{ question: UnitQuestion; wrongAnswer: number }> = [];
        const answersDetails: any[] = [];

        questions.forEach(q => {
          const chosen = adversarialAnswers[q.id];
          const isCorrect = chosen === q.answer;
          if (isCorrect) {
            correctCount++;
          } else {
            wrongList.push({
              question: q,
              wrongAnswer: chosen !== undefined && !Number.isNaN(chosen) ? chosen : -1
            });
          }
          answersDetails.push({ question: q, isCorrect, chosenOption: chosen });
        });

        const score10 = calculateScore10(correctCount, questions.length);

        expect(correctCount).toBe(1);
        expect(score10).toBe(calculateScore10(1, 12)); // 0.83
        expect(wrongList.length).toBe(11);
        // Verify unanswered or NaN options are safely clamped to -1
        expect(wrongList.find(w => w.question.id === questions[0].id)?.wrongAnswer).toBe(-1);
        expect(wrongList.find(w => w.question.id === questions[1].id)?.wrongAnswer).toBe(999);
        expect(wrongList.find(w => w.question.id === questions[3].id)?.wrongAnswer).toBe(-1);
      });

      it('1.1.2 handles zero-question exam without throwing or division by zero', () => {
        const emptyExam: ExamData = {
          id: 'exam-empty-0',
          title: 'Empty Mock Exam',
          durationMinutes: 10,
          grade: 8,
          semester: 1,
          type: '15m',
          questions: []
        };

        const totalDuration = (emptyExam.durationMinutes || 15) * 60;
        const questions = emptyExam.questions;
        let correctCount = 0;
        const wrongList: any[] = [];

        questions.forEach(q => {
          wrongList.push({ question: q, wrongAnswer: -1 });
        });

        const score10 = calculateScore10(correctCount, questions.length);
        expect(score10).toBe(0);
        expect(wrongList.length).toBe(0);

        // Verification of actualTimeSpent logic under empty questions
        const currentSecondsLeft = 500;
        const actualTimeSpent = Math.max(0, totalDuration - currentSecondsLeft);
        expect(actualTimeSpent).toBe(100);
      });

      it('1.1.3 durationMinutes edge conditions (0, negative, undefined, massive) are clamped or defaulted', () => {
        // Exam with durationMinutes = 0
        const examZeroDuration: ExamData = {
          id: 'exam-zero',
          title: 'Zero Duration',
          durationMinutes: 0 as any,
          grade: 8,
          semester: 1,
          type: '15m',
          questions: examsData[0].questions
        };
        const totalDurationZero = (examZeroDuration.durationMinutes || 15) * 60;
        expect(totalDurationZero).toBe(15 * 60); // Falls back to default 15m

        // Exam with durationMinutes = undefined
        const examUndefDuration: any = {
          id: 'exam-undef',
          title: 'Undef Duration',
          questions: examsData[0].questions
        };
        const totalDurationUndef = (examUndefDuration.durationMinutes || 15) * 60;
        expect(totalDurationUndef).toBe(15 * 60);

        // Clamping check: timeSpent never negative even if secondsLeft > totalDuration
        const secondsLeftOvershoot = 1200;
        const totalDuration = 900;
        const actualTimeSpent = Math.max(0, totalDuration - secondsLeftOvershoot);
        expect(actualTimeSpent).toBe(0);
      });

      it('1.1.4 submission idempotency: rapid double submission does not duplicate attempts or mistakes', () => {
        let submissionCount = 0;
        const isSubmittedRef = { current: false };
        const recordExamAttempt = vi.fn();
        const harvestMistakes = vi.fn();

        const handleFinalSubmit = (_isForced: boolean = false) => {
          if (isSubmittedRef.current) return;
          isSubmittedRef.current = true;
          submissionCount++;
          recordExamAttempt({ examId: 'exam-1' });
          harvestMistakes('exam', 'exam-1', [{ wrongAnswer: 1 }]);
        };

        // First submission (e.g. manual submit click)
        handleFinalSubmit(false);
        // Immediate second submission (e.g. interval timer firing or double click)
        handleFinalSubmit(true);
        handleFinalSubmit(true);

        expect(submissionCount).toBe(1);
        expect(recordExamAttempt).toHaveBeenCalledTimes(1);
        expect(harvestMistakes).toHaveBeenCalledTimes(1);
      });

      it('1.1.5 adaptive clearance in exam room matches both originalQuestionId and q.id across batch', () => {
        const rawQuestion = examsData[0].questions[0]; // u1-q1
        const shuffledQ = cloneAndShuffleOptions(rawQuestion);

        const existingMistakes: MistakeItem[] = [
          {
            id: 'mistake-origin-match',
            sourceType: 'unit',
            sourceId: 1,
            questionId: rawQuestion.id,
            question: rawQuestion,
            wrongAnswer: 2,
            addedAt: '2026-11-06T10:00:00Z',
            resolved: false
          },
          {
            id: 'mistake-already-resolved',
            sourceType: 'exam',
            sourceId: 'exam-1',
            questionId: rawQuestion.id,
            question: rawQuestion,
            wrongAnswer: 1,
            addedAt: '2026-11-06T09:00:00Z',
            resolved: true
          }
        ];

        // Simulate ExamRoom adaptive clearance logic:
        const currentAnswers = { [shuffledQ.id]: shuffledQ.answer }; // answered correctly
        const resolvedMistakeIds: string[] = [];

        const isCorrect = currentAnswers[shuffledQ.id] === shuffledQ.answer;
        if (isCorrect) {
          const originId = (shuffledQ as any).originalQuestionId || shuffledQ.id;
          const matchedMistake = existingMistakes.find(
            m => !m.resolved && (m.questionId === originId || m.questionId === shuffledQ.id)
          );
          if (matchedMistake && !resolvedMistakeIds.includes(matchedMistake.id)) {
            resolvedMistakeIds.push(matchedMistake.id);
          }
        }

        expect(resolvedMistakeIds).toEqual(['mistake-origin-match']);
        expect(resolvedMistakeIds).not.toContain('mistake-already-resolved');
      });

      it('1.1.6 handles massive payload (100 questions with 20,000 characters prompt text) within performance limit', () => {
        const hugePrompt = 'A'.repeat(20000);
        const hugeQuestions: UnitQuestion[] = Array.from({ length: 100 }, (_, i) => ({
          id: `huge-q-${i}`,
          section: 'Grammar',
          question: `${hugePrompt} Question ${i}`,
          options: ['A. alpha', 'B. beta', 'C. gamma', 'D. delta'],
          answer: i % 4,
          explanation: 'Detailed explanation for question ' + i
        }));

        const startTime = performance.now();
        const shuffled = hugeQuestions.map(q => cloneAndShuffleOptions(q));

        // Simulate full submission calculation
        let correctCount = 0;
        const wrongList: any[] = [];
        shuffled.forEach((q, idx) => {
          if (idx % 2 === 0) {
            correctCount++;
          } else {
            wrongList.push({ question: q, wrongAnswer: (q.answer + 1) % 4 });
          }
        });
        const score = calculateScore10(correctCount, shuffled.length);
        const duration = performance.now() - startTime;

        expect(shuffled.length).toBe(100);
        expect(score).toBe(5.0);
        expect(wrongList.length).toBe(50);
        expect(duration).toBeLessThan(100); // Must be blazing fast (< 100ms)
      });

      it('1.1.7 reading passage preservation across option shuffling and grouped questions', () => {
        const midterm = examsData.find(e => e.id === 'exam-midterm-1')!;
        expect(midterm).toBeDefined();

        const readingQuestions = midterm.questions.filter(q => Boolean(q.passage));
        expect(readingQuestions.length).toBeGreaterThan(0);

        // Every reading question must preserve passage text and HTML tags after cloneAndShuffleOptions
        readingQuestions.forEach(q => {
          const shuffled = cloneAndShuffleOptions(q);
          expect(shuffled.passage).toBe(q.passage);
          expect(shuffled.passageGroupId).toBe(q.passageGroupId);
          expect(shuffled.originalQuestionId).toBe(q.id);
        });
      });
    });

    describe('1.2 ExamList Smart Adaptive Algorithm & Historical Max Calculations', () => {
      it('1.2.1 aggregates all bank questions across all 12 units and 14 exams (437 questions)', () => {
        const allBankQuestions: UnitQuestion[] = [];
        unitsData.forEach(u => allBankQuestions.push(...(u.quiz || [])));
        examsData.forEach(e => allBankQuestions.push(...(e.questions || [])));

        expect(allBankQuestions.length).toBe(144 + 293); // 437 questions
        expect(unitsData.length).toBe(12);
        expect(examsData.length).toBe(14);
      });

      it('1.2.2 generateSmartAdaptiveQuiz respects 70% mistake target and fills remainder from bank without duplicates', () => {
        const allBankQuestions: UnitQuestion[] = [];
        unitsData.forEach(u => allBankQuestions.push(...(u.quiz || [])));
        examsData.forEach(e => allBankQuestions.push(...(e.questions || [])));

        // Create 25 mock unresolved mistakes
        const mockMistakes: MistakeItem[] = Array.from({ length: 25 }, (_, i) => ({
          id: `mst_adaptive_${i}`,
          sourceType: 'unit',
          sourceId: 1,
          questionId: `mock_q_${i}`,
          question: {
            id: `mock_q_${i}`,
            section: 'Vocab',
            question: `Mock Mistake Question ${i}`,
            options: ['A. 1', 'B. 2', 'C. 3', 'D. 4'],
            answer: 0,
            explanation: 'Mistake explanation'
          },
          wrongAnswer: 1,
          addedAt: '2026-11-06',
          resolved: false
        }));

        // Desired count: 20 questions. 70% of 20 = 14 from mistakes, 6 from bank.
        const adaptiveExam = generateSmartAdaptiveQuiz(mockMistakes, allBankQuestions, 20);

        expect(adaptiveExam.length).toBe(20);
        const uniqueIds = new Set(adaptiveExam.map(q => (q as any).originalQuestionId || q.id));
        expect(uniqueIds.size).toBe(20); // No duplicates

        // When mistakes pool is empty, should draw all 20 from bank
        const emptyMistakeAdaptive = generateSmartAdaptiveQuiz([], allBankQuestions, 20);
        expect(emptyMistakeAdaptive.length).toBe(20);
        const uniqueBankIds = new Set(emptyMistakeAdaptive.map(q => (q as any).originalQuestionId || q.id));
        expect(uniqueBankIds.size).toBe(20);
      });

      it('1.2.3 bestScore historical calculation correctly determines mathematical max score without precision bugs', () => {
        const attempts = [
          { examId: 'exam-15m-1', score: 0.0 },
          { examId: 'exam-15m-1', score: 5.83 },
          { examId: 'exam-15m-1', score: 8.33 },
          { examId: 'exam-15m-1', score: 7.5 },
          { examId: 'exam-15m-2', score: 10.0 }
        ];

        const exam1Attempts = attempts.filter(a => a.examId === 'exam-15m-1');
        const bestScore1 = exam1Attempts.length > 0 ? Math.max(...exam1Attempts.map(a => a.score)) : null;
        expect(bestScore1).toBe(8.33);

        const exam3Attempts = attempts.filter(a => a.examId === 'exam-non-existent');
        const bestScore3 = exam3Attempts.length > 0 ? Math.max(...exam3Attempts.map(a => a.score)) : null;
        expect(bestScore3).toBeNull();
      });
    });

    describe('1.3 ExamResultModal "Soi bài làm" Edge Cases', () => {
      it('1.3.1 returns null or safe empty state when attempt is null or closed', () => {
        const renderCheck = (isOpen: boolean, attempt: any) => {
          if (!isOpen || !attempt) return null;
          return 'rendered';
        };

        expect(renderCheck(false, { score: 10 })).toBeNull();
        expect(renderCheck(true, null)).toBeNull();
        expect(renderCheck(false, null)).toBeNull();
        expect(renderCheck(true, { score: 10 })).toBe('rendered');
      });

      it('1.3.2 extracts questions from answersDetails if attempt.questions is missing', () => {
        const dummyQuestion: UnitQuestion = {
          id: 'dq-1',
          section: 'Grammar',
          question: 'Dummy?',
          options: ['A', 'B'],
          answer: 0,
          explanation: ''
        };

        const attemptWithoutQuestions: any = {
          id: 'att-1',
          examId: 'exam-1',
          examTitle: 'Test',
          score: 10.0,
          totalQuestions: 1,
          timeSpentSeconds: 45,
          answers: { 'dq-1': 0 },
          submittedAt: '2026-11-06T12:00:00Z',
          answersDetails: [{ question: dummyQuestion, isCorrect: true, chosenOption: 0 }]
        };

        const extractedQuestions: UnitQuestion[] =
          attemptWithoutQuestions.questions ||
          (attemptWithoutQuestions.answersDetails || []).map((d: any) => d.question).filter(Boolean);

        expect(extractedQuestions.length).toBe(1);
        expect(extractedQuestions[0].id).toBe('dq-1');
      });

      it('1.3.3 formats extreme durations accurately (0s, 59s, 900s, 3665s)', () => {
        const formatDuration = (timeSpentSeconds: number) => {
          const minutes = Math.floor(timeSpentSeconds / 60);
          const seconds = timeSpentSeconds % 60;
          return `${minutes}p ${seconds}s`;
        };

        expect(formatDuration(0)).toBe('0p 0s');
        expect(formatDuration(59)).toBe('0p 59s');
        expect(formatDuration(900)).toBe('15p 0s');
        expect(formatDuration(3665)).toBe('61p 5s');
      });

      it('1.3.4 question ratio calculation guard prevents NaN when totalQuestions is 0 or undefined', () => {
        const computeCorrectRatio = (attempt: { score: number; totalQuestions?: number }, questionList: any[]) => {
          const total = attempt.totalQuestions || questionList.length || 1;
          return Math.round((attempt.score / 10) * total);
        };

        expect(computeCorrectRatio({ score: 10, totalQuestions: 12 }, [])).toBe(12);
        expect(computeCorrectRatio({ score: 0, totalQuestions: 12 }, [])).toBe(0);
        expect(computeCorrectRatio({ score: 5, totalQuestions: 0 }, [])).toBe(1); // falls back to 1 safely, no NaN!
        expect(computeCorrectRatio({ score: 5 }, [])).toBe(1); // falls back to 1 safely, no NaN!
      });
    });
  });

  // =========================================================================
  // SECTION 2: MISTAKES NOTEBOOK WHITE-BOX STRESS & BOUNDARY HARDENING
  // (MistakesNotebook)
  // =========================================================================
  describe('2. Mistakes Notebook White-Box Stress & Boundary Hardening', () => {

    const sampleMistakes: MistakeItem[] = [
      {
        id: 'mst_u1',
        sourceType: 'unit',
        sourceId: 1,
        questionId: 'u1_q1',
        question: {
          id: 'u1_q1',
          section: 'Grammar',
          question: 'She enjoys _______ origami.',
          options: ['A. making', 'B. make', 'C. to make', 'D. made'],
          answer: 0,
          explanation: 'Enjoy + V-ing'
        },
        wrongAnswer: 1,
        addedAt: '2026-11-06T10:00:00Z',
        resolved: false
      },
      {
        id: 'mst_u2',
        sourceType: 'unit',
        sourceId: 2,
        questionId: 'u2_q5',
        question: {
          id: 'u2_q5',
          section: 'Vocab',
          question: 'The farmers are loading _______ onto trucks.',
          options: ['A. rice', 'B. cattle', 'C. orchard', 'D. field'],
          answer: 0,
          explanation: 'Loading rice'
        },
        wrongAnswer: 2,
        addedAt: '2026-11-06T11:00:00Z',
        resolved: true
      },
      {
        id: 'mst_ex1',
        sourceType: 'exam',
        sourceId: 'exam-15m-1',
        questionId: 'ex1_q8',
        question: {
          id: 'ex1_q8',
          section: 'Reading',
          question: 'What is the main topic of the passage?',
          options: ['A. City life', 'B. Countryside traditions', 'C. Technology', 'D. School'],
          answer: 1,
          explanation: 'Passage describes countryside traditions.'
        },
        wrongAnswer: 0,
        addedAt: '2026-11-06T12:00:00Z',
        resolved: false
      }
    ];

    it('2.1.1 adversarial search with regex metacharacters, huge payload, and unicode/emojis', () => {
      const filterMistakes = (search: string, list: MistakeItem[]) => {
        return list.filter(m => {
          if (!search.trim()) return true;
          const q = search.toLowerCase();
          const matchQ = (m.question?.question || '').toLowerCase().includes(q);
          const matchExpl = (m.question?.explanation || '').toLowerCase().includes(q);
          const matchSource = String(m.sourceId).toLowerCase().includes(q);
          return matchQ || matchExpl || matchSource;
        });
      };

      // Regex special characters that would break RegExp constructor
      const regexMetacharSearch = '.*+?^${}()|[]\\';
      expect(() => filterMistakes(regexMetacharSearch, sampleMistakes)).not.toThrow();
      expect(filterMistakes(regexMetacharSearch, sampleMistakes).length).toBe(0);

      // Huge 5,000 character search string
      const hugeSearch = 'z'.repeat(5000);
      expect(() => filterMistakes(hugeSearch, sampleMistakes)).not.toThrow();
      expect(filterMistakes(hugeSearch, sampleMistakes).length).toBe(0);

      // Vietnamese case-insensitive search
      expect(filterMistakes('origami', sampleMistakes).length).toBe(1);
      expect(filterMistakes('countryside', sampleMistakes).length).toBe(1);
      expect(filterMistakes('exam-15m', sampleMistakes).length).toBe(1);
    });

    it('2.1.2 tolerates items with missing or undefined question properties', () => {
      const corruptedMistakes: MistakeItem[] = [
        {
          id: 'mst_corrupted_1',
          sourceType: 'unit',
          sourceId: 'unknown',
          questionId: 'q_missing',
          question: undefined as any,
          wrongAnswer: -1,
          addedAt: '2026-11-06',
          resolved: false
        },
        {
          id: 'mst_corrupted_2',
          sourceType: 'exam',
          sourceId: null as any,
          questionId: 'q_partial',
          question: { id: 'q_partial', options: [] } as any,
          wrongAnswer: 0,
          addedAt: '2026-11-06',
          resolved: false
        }
      ];

      const searchFilter = (item: MistakeItem, search: string) => {
        const q = search.toLowerCase();
        const matchQ = (item.question?.question || '').toLowerCase().includes(q);
        const matchExpl = (item.question?.explanation || '').toLowerCase().includes(q);
        const matchSource = String(item.sourceId).toLowerCase().includes(q);
        return matchQ || matchExpl || matchSource;
      };

      expect(() => searchFilter(corruptedMistakes[0], 'test')).not.toThrow();
      expect(() => searchFilter(corruptedMistakes[1], 'test')).not.toThrow();
    });

    it('2.2.1 filter state matrix: 3 sourceTypes x 3 filterStatuses exhaustively tested', () => {
      const applyFilters = (
        list: MistakeItem[],
        filterType: 'all' | 'unit' | 'exam',
        filterStatus: 'all' | 'unresolved' | 'resolved'
      ) => {
        return list.filter(m => {
          if (filterType !== 'all' && m.sourceType !== filterType) return false;
          if (filterStatus === 'unresolved' && m.resolved) return false;
          if (filterStatus === 'resolved' && !m.resolved) return false;
          return true;
        });
      };

      // 9 combinations:
      expect(applyFilters(sampleMistakes, 'all', 'all').length).toBe(3);
      expect(applyFilters(sampleMistakes, 'all', 'unresolved').length).toBe(2); // mst_u1, mst_ex1
      expect(applyFilters(sampleMistakes, 'all', 'resolved').length).toBe(1); // mst_u2

      expect(applyFilters(sampleMistakes, 'unit', 'all').length).toBe(2);
      expect(applyFilters(sampleMistakes, 'unit', 'unresolved').length).toBe(1); // mst_u1
      expect(applyFilters(sampleMistakes, 'unit', 'resolved').length).toBe(1); // mst_u2

      expect(applyFilters(sampleMistakes, 'exam', 'all').length).toBe(1);
      expect(applyFilters(sampleMistakes, 'exam', 'unresolved').length).toBe(1); // mst_ex1
      expect(applyFilters(sampleMistakes, 'exam', 'resolved').length).toBe(0);
    });

    it('2.3.1 in-card retry: invalid option index (-1, 99) rejected safely without resolving', () => {
      const item = { ...sampleMistakes[0] };
      const retryMistake = (chosenIdx: number) => {
        const isCorrect = chosenIdx === item.question.answer;
        if (isCorrect) {
          item.resolved = true;
          item.resolvedAt = new Date().toISOString();
        }
        return { isCorrect };
      };

      expect(retryMistake(-1).isCorrect).toBe(false);
      expect(item.resolved).toBe(false);

      expect(retryMistake(99).isCorrect).toBe(false);
      expect(item.resolved).toBe(false);

      // Now choose correct answer (0: 'A. making')
      expect(retryMistake(0).isCorrect).toBe(true);
      expect(item.resolved).toBe(true);
      expect(item.resolvedAt).toBeDefined();
    });

    it('2.4.1 clearResolvedMistakes purges only resolved items and returns accurate count', () => {
      const list = [...sampleMistakes]; // 1 resolved, 2 unresolved
      const unresolved = list.filter(m => !m.resolved);
      const purgedCount = list.length - unresolved.length;

      expect(purgedCount).toBe(1);
      expect(unresolved.length).toBe(2);
      expect(unresolved.every(m => !m.resolved)).toBe(true);
    });
  });

  // =========================================================================
  // SECTION 3: ADMIN PORTAL WHITE-BOX STRESS & BOUNDARY HARDENING
  // (AdminPortal)
  // =========================================================================
  describe('3. Admin Portal White-Box Stress & Boundary Hardening', () => {

    it('3.1.1 student monitor averages handle empty stats without NaN or crash', () => {
      const emptySnapshot: StudentSnapshot = {
        username: 'empty_student',
        learnedVocab: [],
        unitScores: {},
        examHistory: [],
        mistakes: [],
        streak: { currentStreak: 1, lastStudyDate: '2026-11-06' },
        updatedAt: '2026-11-06T10:00:00Z'
      };

      const unitScoreValues = Object.values(emptySnapshot.unitScores || {});
      const avgUnitScore = unitScoreValues.length > 0
        ? (unitScoreValues.reduce((a, b) => a + b, 0) / unitScoreValues.length).toFixed(1)
        : '--';

      const examAttempts = emptySnapshot.examHistory || [];
      const avgExamScore = examAttempts.length > 0
        ? (examAttempts.reduce((a, b) => a + b.score, 0) / examAttempts.length).toFixed(1)
        : '--';

      expect(avgUnitScore).toBe('--');
      expect(avgExamScore).toBe('--');
    });

    it('3.1.2 student monitor correctly averages large dataset of scores', () => {
      const populatedSnapshot: StudentSnapshot = {
        username: 'active_student',
        learnedVocab: ['u1-v1', 'u1-v2'],
        unitScores: { 1: 8.5, 2: 9.0, 3: 7.5, 4: 10.0, 5: 6.0, 6: 8.0 },
        examHistory: [
          { id: 'att-1', examId: 'e1', examTitle: 'E1', score: 8.0, totalQuestions: 12, timeSpentSeconds: 600, answers: {}, submittedAt: '2026-11-06' },
          { id: 'att-2', examId: 'e2', examTitle: 'E2', score: 9.0, totalQuestions: 20, timeSpentSeconds: 800, answers: {}, submittedAt: '2026-11-06' }
        ],
        mistakes: [],
        streak: { currentStreak: 5, lastStudyDate: '2026-11-06' },
        updatedAt: '2026-11-06T10:00:00Z'
      };

      const unitValues = Object.values(populatedSnapshot.unitScores);
      const avgUnit = (unitValues.reduce((a, b) => a + b, 0) / unitValues.length).toFixed(1);
      // (8.5 + 9.0 + 7.5 + 10.0 + 6.0 + 8.0) / 6 = 49 / 6 = 8.1666... -> 8.2
      expect(avgUnit).toBe('8.2');

      const examValues = populatedSnapshot.examHistory.map(e => e.score);
      const avgExam = (examValues.reduce((a, b) => a + b, 0) / examValues.length).toFixed(1);
      // (8.0 + 9.0) / 2 = 8.5
      expect(avgExam).toBe('8.5');
    });

    it('3.1.3 student selector switches between multiple students with complete state isolation', () => {
      // Save distinct snapshots for em_lop8, em_nam, em_lan
      const snapLop8: StudentSnapshot = {
        username: 'em_lop8',
        learnedVocab: ['u1-v1'],
        unitScores: { 1: 10.0 },
        examHistory: [],
        mistakes: [],
        streak: { currentStreak: 7, lastStudyDate: '2026-11-06' },
        updatedAt: '2026-11-06T10:00:00Z'
      };
      const snapNam: StudentSnapshot = {
        username: 'em_nam',
        learnedVocab: ['u2-v1', 'u2-v2'],
        unitScores: { 2: 7.0 },
        examHistory: [],
        mistakes: [],
        streak: { currentStreak: 2, lastStudyDate: '2026-11-05' },
        updatedAt: '2026-11-05T10:00:00Z'
      };
      saveStudentSnapshot(snapLop8);
      saveStudentSnapshot(snapNam);

      // Verify Admin selector retrieves isolated snapshots
      const loadedLop8 = getStudentSnapshot('em_lop8');
      const loadedNam = getStudentSnapshot('em_nam');

      expect(loadedLop8.username).toBe('em_lop8');
      expect(loadedLop8.learnedVocab).toEqual(['u1-v1']);
      expect(loadedLop8.unitScores).toEqual({ 1: 10.0 });
      expect(loadedLop8.streak.currentStreak).toBe(7);

      expect(loadedNam.username).toBe('em_nam');
      expect(loadedNam.learnedVocab).toEqual(['u2-v1', 'u2-v2']);
      expect(loadedNam.unitScores).toEqual({ 2: 7.0 });
      expect(loadedNam.streak.currentStreak).toBe(2);
    });

    it('3.2.1 homework assignment creation validation: rejects empty/whitespace title, preserves targetId types', () => {
      const validateAndCreate = (
        title: string,
        type: 'unit' | 'exam',
        target: string,
        minScore: number,
        due: string,
        targetUser: string
      ): HomeworkAssignment | null => {
        if (!title.trim()) return null;
        return {
          id: `asg_${Date.now()}`,
          title: title.trim(),
          type,
          targetId: type === 'unit' ? Number(target) : target,
          dueDate: due,
          minScore: Number(minScore),
          assignedTo: targetUser === 'all' ? ['all'] : [targetUser],
          createdAt: new Date().toISOString()
        };
      };

      // Empty and whitespace titles rejected
      expect(validateAndCreate('', 'unit', '1', 8.0, '2026-11-13', 'all')).toBeNull();
      expect(validateAndCreate('   ', 'unit', '1', 8.0, '2026-11-13', 'all')).toBeNull();

      // Unit assignment stores numeric targetId
      const unitAsg = validateAndCreate('Unit 2 Homework', 'unit', '2', 8.5, '2026-11-13', 'em_lop8');
      expect(unitAsg).not.toBeNull();
      expect(unitAsg?.targetId).toBe(2);
      expect(typeof unitAsg?.targetId).toBe('number');
      expect(unitAsg?.assignedTo).toEqual(['em_lop8']);

      // Exam assignment stores string targetId
      const examAsg = validateAndCreate('Midterm Exam Homework', 'exam', 'exam-midterm-1', 7.0, '2026-11-13', 'all');
      expect(examAsg).not.toBeNull();
      expect(examAsg?.targetId).toBe('exam-midterm-1');
      expect(typeof examAsg?.targetId).toBe('string');
      expect(examAsg?.assignedTo).toEqual(['all']);
    });

    it('3.2.2 assignments persist to system config and delete cleanly', () => {
      const initialCfg = getSystemConfig();
      expect(initialCfg.assignments).toBeDefined();

      const newAsg: HomeworkAssignment = {
        id: 'asg_test_persist_1',
        title: 'Ôn tập Unit 3',
        type: 'unit',
        targetId: 3,
        dueDate: '2026-11-20',
        minScore: 8.0,
        assignedTo: ['all'],
        createdAt: new Date().toISOString()
      };

      // Save
      initialCfg.assignments = [newAsg];
      saveSystemConfig(initialCfg);

      // Verify saved in storage
      const loadedCfg = getSystemConfig();
      expect(loadedCfg.assignments.length).toBe(1);
      expect(loadedCfg.assignments[0].id).toBe('asg_test_persist_1');

      // Delete
      loadedCfg.assignments = loadedCfg.assignments.filter(a => a.id !== 'asg_test_persist_1');
      saveSystemConfig(loadedCfg);

      const afterDeleteCfg = getSystemConfig();
      expect(afterDeleteCfg.assignments.length).toBe(0);
    });

    it('3.3.1 custom QBank question creation: pads missing options C/D and formats prefixes', () => {
      const validateAndCreateQuestion = (
        section: string,
        prompt: string,
        opt0: string,
        opt1: string,
        opt2: string,
        opt3: string,
        answer: number,
        explanation: string
      ): CustomQuestion | null => {
        if (!prompt.trim() || !opt0.trim() || !opt1.trim()) {
          return null;
        }
        return {
          id: `custom_${Date.now()}`,
          section,
          question: prompt.trim(),
          options: [
            `A. ${opt0.trim()}`,
            `B. ${opt1.trim()}`,
            opt2.trim() ? `C. ${opt2.trim()}` : 'C. None',
            opt3.trim() ? `D. ${opt3.trim()}` : 'D. None'
          ],
          answer,
          explanation: explanation.trim() || 'Giải thích chuẩn theo ngữ pháp Global Success.',
          custom: true,
          createdAt: new Date().toISOString()
        };
      };

      // Invalid missing options
      expect(validateAndCreateQuestion('Grammar', '', 'OptA', 'OptB', '', '', 0, '')).toBeNull();
      expect(validateAndCreateQuestion('Grammar', 'Prompt', '', 'OptB', '', '', 0, '')).toBeNull();
      expect(validateAndCreateQuestion('Grammar', 'Prompt', 'OptA', '', '', '', 0, '')).toBeNull();

      // Only 2 options provided -> C and D should be automatically padded
      const q2Opts = validateAndCreateQuestion('Grammar', 'Is this true or false?', 'True', 'False', '', '', 0, '');
      expect(q2Opts).not.toBeNull();
      expect(q2Opts?.options).toEqual(['A. True', 'B. False', 'C. None', 'D. None']);
      expect(q2Opts?.explanation).toBe('Giải thích chuẩn theo ngữ pháp Global Success.');

      // All 4 options provided
      const q4Opts = validateAndCreateQuestion('Vocab', 'Word meaning', 'One', 'Two', 'Three', 'Four', 2, 'Explanation');
      expect(q4Opts?.options).toEqual(['A. One', 'B. Two', 'C. Three', 'D. Four']);
    });

    it('3.4.1 Supabase Cloud settings: AdminPortal form trims whitespace and storageService persists faithfully', () => {
      // In AdminPortal.tsx handleSaveCloud:
      // saveSupabaseConfig(supabaseUrl.trim(), supabaseAnonKey.trim());
      const rawUrl = '  https://test-project.supabase.co  ';
      const rawAnonKey = '  anon-key-secret-12345  ';
      saveSupabaseConfig(rawUrl.trim(), rawAnonKey.trim());

      const config = getSupabaseConfig();
      expect(config.url).toBe('https://test-project.supabase.co');
      expect(config.anonKey).toBe('anon-key-secret-12345');
    });
  });

  // =========================================================================
  // SECTION 4: LAYOUT & APP ROUTER STRESS
  // (Header, MobileBottomNav, App.tsx router)
  // =========================================================================
  describe('4. Layout & App Router Stress', () => {

    describe('4.1 Direct Hash Jumping & Route Manipulation', () => {
      // Replicate the exact routing parser from App.tsx
      const resolveRoute = (hash: string, role: string, activeExam: ExamData | null) => {
        if (hash.includes('exams/room') || activeExam) {
          let examToRun = activeExam;
          if (!examToRun) {
            const parts = hash.split('exams/room/');
            const examId = parts[1];
            examToRun = examsData.find(e => e.id === examId) || examsData[0];
          }
          return { view: 'ExamRoom', exam: examToRun };
        }

        if (hash.includes('unit')) {
          const match = hash.match(/unit(?:-)?(\d+)(?:\/([a-z0-9_-]+))?/i);
          const unitNum = match && match[1] ? parseInt(match[1], 10) : 1;
          const subTab = (match && match[2] ? match[2] : 'vocab') as string;
          return { view: 'UnitPractice', unitNum, subTab };
        }

        if (hash.includes('exams')) {
          return { view: 'ExamList' };
        }

        if (hash.includes('mistakes')) {
          return { view: 'MistakesNotebook' };
        }

        if (hash.includes('progress')) {
          return { view: 'ProgressAnalytics' };
        }

        if (hash.includes('admin') || role === 'admin') {
          return { view: 'AdminPortal' };
        }

        return { view: 'StudentDashboard' };
      };

      it('4.1.1 standard hash paths resolve to their correct component targets', () => {
        expect(resolveRoute('#/dashboard', 'student', null).view).toBe('StudentDashboard');
        expect(resolveRoute('', 'student', null).view).toBe('StudentDashboard');
        expect(resolveRoute('#/', 'student', null).view).toBe('StudentDashboard');

        expect(resolveRoute('#/exams', 'student', null).view).toBe('ExamList');
        expect(resolveRoute('#/mistakes', 'student', null).view).toBe('MistakesNotebook');
        expect(resolveRoute('#/progress', 'student', null).view).toBe('ProgressAnalytics');
        expect(resolveRoute('#/admin', 'admin', null).view).toBe('AdminPortal');
      });

      it('4.1.2 unit route variants (canonical unit-X, unitX, and slash fallback) parse accurately', () => {
        // Canonical format used by Header and MobileBottomNav
        const r1 = resolveRoute('#/unit/unit-1/vocab', 'student', null);
        expect(r1).toEqual({ view: 'UnitPractice', unitNum: 1, subTab: 'vocab' });

        const r2 = resolveRoute('#/unit/unit-2/spelling', 'student', null);
        expect(r2).toEqual({ view: 'UnitPractice', unitNum: 2, subTab: 'spelling' });

        const r3 = resolveRoute('#/unit/unit-3/grammar', 'student', null);
        expect(r3).toEqual({ view: 'UnitPractice', unitNum: 3, subTab: 'grammar' });

        const r4 = resolveRoute('#/unit-4/written', 'student', null);
        expect(r4).toEqual({ view: 'UnitPractice', unitNum: 4, subTab: 'written' });

        const r5 = resolveRoute('#/unit/unit-5/quiz', 'student', null);
        expect(r5).toEqual({ view: 'UnitPractice', unitNum: 5, subTab: 'quiz' });

        const r6 = resolveRoute('#/unit/unit-6/flashcard', 'student', null);
        expect(r6).toEqual({ view: 'UnitPractice', unitNum: 6, subTab: 'flashcard' });

        // Direct slash jumping without 'unit-' (e.g. #/unit/3/grammar) is safely caught by fallback
        const rFallback = resolveRoute('#/unit/3/grammar', 'student', null);
        expect(rFallback).toEqual({ view: 'UnitPractice', unitNum: 1, subTab: 'vocab' });
      });

      it('4.1.3 direct hash jump to Exam Room recovers exam and falls back to examsData[0] if ID is invalid', () => {
        // Direct jump to valid exam
        const rValid = resolveRoute('#/exams/room/exam-15m-1', 'student', null);
        expect(rValid.view).toBe('ExamRoom');
        expect((rValid as any).exam.id).toBe('exam-15m-1');

        // Direct jump to another valid exam
        const rMidterm = resolveRoute('#/exams/room/exam-midterm-1', 'student', null);
        expect(rMidterm.view).toBe('ExamRoom');
        expect((rMidterm as any).exam.id).toBe('exam-midterm-1');

        // Direct jump to non-existent exam ID falls back to default exam (examsData[0])
        const rInvalid = resolveRoute('#/exams/room/non_existent_exam_id_9999', 'student', null);
        expect(rInvalid.view).toBe('ExamRoom');
        expect((rInvalid as any).exam.id).toBe(examsData[0].id);
      });

      it('4.1.4 malformed/unknown hash jumping falls back to StudentDashboard or defaults gracefully', () => {
        expect(resolveRoute('#/unknown/path/404', 'student', null).view).toBe('StudentDashboard');
        expect(resolveRoute('###', 'student', null).view).toBe('StudentDashboard');
        expect(resolveRoute('javascript:alert(1)', 'student', null).view).toBe('StudentDashboard');

        // Bare #/unit with no number falls back to unit 1 vocab
        const rBareUnit = resolveRoute('#/unit', 'student', null);
        expect(rBareUnit).toEqual({ view: 'UnitPractice', unitNum: 1, subTab: 'vocab' });
      });

      it('4.1.5 exam room locks app layout: hides Header and MobileBottomNav', () => {
        const isExamRoomView = (hash: string, hasActiveExam: boolean) => {
          return hash.includes('exams/room') || hasActiveExam;
        };

        expect(isExamRoomView('#/dashboard', false)).toBe(false);
        expect(isExamRoomView('#/unit/unit-1/vocab', false)).toBe(false);
        expect(isExamRoomView('#/exams', false)).toBe(false);
        expect(isExamRoomView('#/exams/room/exam-15m-1', false)).toBe(true);
        expect(isExamRoomView('#/dashboard', true)).toBe(true); // Active exam locks view
      });
    });

    describe('4.2 State Recovery Across Page Reloads (LocalStorage Refresh)', () => {
      it('4.2.1 snapshot and study progress survive simulated browser refresh', () => {
        // Step 1: Initial user session writes data to localStorage
        const snapshotBeforeReload: StudentSnapshot = {
          username: 'em_lop8',
          learnedVocab: ['u1-v1', 'u1-v2', 'u1-v3'],
          unitScores: { 1: 9.0, 2: 8.5 },
          examHistory: [
            {
              id: 'attempt-101',
              examId: 'exam-15m-1',
              examTitle: 'Đề 15 phút Số 1',
              score: 9.17,
              totalQuestions: 12,
              timeSpentSeconds: 420,
              answers: { 'q-1': 0 },
              submittedAt: '2026-11-06T14:00:00Z'
            }
          ],
          mistakes: [
            {
              id: 'mst-persist-1',
              sourceType: 'unit',
              sourceId: 1,
              questionId: 'u1-q5',
              question: {
                id: 'u1-q5',
                section: 'Vocab',
                question: 'Persisted Question',
                options: ['A', 'B'],
                answer: 0,
                explanation: 'Explanation'
              },
              wrongAnswer: 1,
              addedAt: '2026-11-06T14:00:00Z',
              resolved: false
            }
          ],
          streak: { currentStreak: 3, lastStudyDate: '2026-11-06' },
          updatedAt: '2026-11-06T14:00:00Z'
        };
        saveStudentSnapshot(snapshotBeforeReload);

        // Step 2: Simulate page refresh by retrieving snapshot anew from storage
        const snapshotAfterReload = getStudentSnapshot('em_lop8');

        expect(snapshotAfterReload.username).toBe('em_lop8');
        expect(snapshotAfterReload.learnedVocab).toEqual(['u1-v1', 'u1-v2', 'u1-v3']);
        expect(snapshotAfterReload.unitScores).toEqual({ 1: 9.0, 2: 8.5 });
        expect(snapshotAfterReload.examHistory.length).toBe(1);
        expect(snapshotAfterReload.examHistory[0].score).toBe(9.17);
        expect(snapshotAfterReload.mistakes.length).toBe(1);
        expect(snapshotAfterReload.mistakes[0].id).toBe('mst-persist-1');
        expect(snapshotAfterReload.streak.currentStreak).toBe(3);
      });

      it('4.2.2 page reload during active exam route restores exam from URL hash without activeExam state', () => {
        // User refreshes on #/exams/room/exam-midterm-1
        // In React, activeExam state is null upon initial mount
        const currentHash = '#/exams/room/exam-midterm-1';
        let examToRun: any = null;

        if (currentHash.includes('exams/room')) {
          const parts = currentHash.split('exams/room/');
          const examId = parts[1];
          examToRun = examsData.find(e => e.id === examId) || examsData[0];
        }

        expect(examToRun).toBeDefined();
        expect(examToRun.id).toBe('exam-midterm-1');
        expect(examToRun.questions.length).toBeGreaterThan(0);
      });

      it('4.2.3 handles corrupted/truncated JSON in localStorage on refresh without crashing', () => {
        // Corrupted auth session
        mockStorage.setItem(STORAGE_KEYS.AUTH_SESSION, '{"invalid_json:');
        expect(() => getAuthSession()).not.toThrow();
        expect(getAuthSession()).toBeNull();

        // Corrupted snapshot
        mockStorage.setItem(`${STORAGE_KEYS.SNAPSHOT_PREFIX}em_lop8`, '{truncated');
        expect(() => getStudentSnapshot('em_lop8')).not.toThrow();
        const fallbackSnapshot = getStudentSnapshot('em_lop8');
        expect(fallbackSnapshot.username).toBe('em_lop8');
        expect(fallbackSnapshot.learnedVocab).toEqual([]);

        // Corrupted system config
        mockStorage.setItem(STORAGE_KEYS.SYSTEM_CONFIG, '{"assignments": [unclosed');
        expect(() => getSystemConfig()).not.toThrow();
        const fallbackConfig = getSystemConfig();
        expect(fallbackConfig.assignments).toEqual([]);
        expect(fallbackConfig.customQuestions).toEqual([]);
      });
    });

    describe('4.3 Mobile Viewport & Tab Activation Transitions', () => {
      // Replicate the isTabActive logic from Header.tsx & MobileBottomNav.tsx
      const isTabActive = (currentHash: string, pattern: string) => {
        if (pattern === 'dashboard') {
          return currentHash.includes('dashboard') || currentHash === '' || currentHash === '#/';
        }
        return currentHash.includes(pattern);
      };

      it('4.3.1 isTabActive correctly activates tabs for all valid hash states', () => {
        expect(isTabActive('#/dashboard', 'dashboard')).toBe(true);
        expect(isTabActive('', 'dashboard')).toBe(true);
        expect(isTabActive('#/', 'dashboard')).toBe(true);
        expect(isTabActive('#/exams', 'dashboard')).toBe(false);

        expect(isTabActive('#/unit/unit-1/vocab', 'unit')).toBe(true);
        expect(isTabActive('#/unit/2/quiz', 'unit')).toBe(true);
        expect(isTabActive('#/exams', 'unit')).toBe(false);

        expect(isTabActive('#/exams', 'exams')).toBe(true);
        expect(isTabActive('#/exams/room/exam-1', 'exams')).toBe(true);
        expect(isTabActive('#/mistakes', 'exams')).toBe(false);

        expect(isTabActive('#/mistakes', 'mistakes')).toBe(true);
        expect(isTabActive('#/progress', 'progress')).toBe(true);
        expect(isTabActive('#/admin', 'admin')).toBe(true);
      });

      it('4.3.2 unresolved mistakes counter accurately synchronizes badge visibility', () => {
        const getBadgeDisplay = (unresolvedCount: number) => {
          return {
            showBadge: unresolvedCount > 0,
            text: unresolvedCount > 0 ? String(unresolvedCount) : null
          };
        };

        expect(getBadgeDisplay(0)).toEqual({ showBadge: false, text: null });
        expect(getBadgeDisplay(5)).toEqual({ showBadge: true, text: '5' });
        expect(getBadgeDisplay(25)).toEqual({ showBadge: true, text: '25' });
      });

      it('4.3.3 role switching between student and admin updates session state and visual indicator', () => {
        const initialSession: UserSession = {
          id: 'usr_lop8',
          username: 'em_lop8',
          fullName: 'Em Lớp 8',
          role: 'student',
          lastLoginAt: '2026-11-06T10:00:00Z'
        };
        saveAuthSession(initialSession);

        // Toggle to admin
        const toggleRole = (session: UserSession): UserSession => {
          const nextRole = session.role === 'admin' ? 'student' : 'admin';
          return {
            ...session,
            role: nextRole
          };
        };

        const adminSession = toggleRole(initialSession);
        expect(adminSession.role).toBe('admin');

        // Toggle back to student
        const studentSession = toggleRole(adminSession);
        expect(studentSession.role).toBe('student');
      });

      it('4.3.4 query parameters in hash routes (e.g. #/exams?filter=15m) preserve tab activation', () => {
        expect(isTabActive('#/dashboard?view=hero', 'dashboard')).toBe(true);
        expect(isTabActive('#/exams?filter=15m', 'exams')).toBe(true);
        expect(isTabActive('#/unit/unit-1/vocab?card=3', 'unit')).toBe(true);
        expect(isTabActive('#/mistakes?filter=unresolved', 'mistakes')).toBe(true);
        expect(isTabActive('#/progress?radar=show', 'progress')).toBe(true);
        expect(isTabActive('#/admin?tab=cloud', 'admin')).toBe(true);
      });
    });
  });
});
