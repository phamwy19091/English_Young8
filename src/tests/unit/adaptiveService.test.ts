import { describe, it, expect } from 'vitest';
import {
  normalizeWrittenString,
  isWrittenAnswerAccepted,
  normalizeSpellingWord,
  isSpellingMatch,
  cleanSpeechText,
  cloneAndShuffleOptions,
  shuffleArray,
  calculateScore10,
  calculateStreak,
  classifyQuestionSkill,
  compute5SkillRadar,
  generateSmartAdaptiveQuiz
} from '../../services/adaptiveService';
import { UnitQuestion } from '../../types/curriculum';
import { MistakeItem } from '../../types/storage';

describe('AdaptiveService & Domain Logic', () => {
  describe('normalizeWrittenString', () => {
    it('should strip punctuation and fold case', () => {
      expect(normalizeWrittenString('Hello, World!')).toBe('hello world');
      expect(normalizeWrittenString('Is that right? Yes; it is.')).toBe('is that right yes it is');
    });

    it('should expand common contractions', () => {
      expect(normalizeWrittenString("I don't know")).toBe('i do not know');
      expect(normalizeWrittenString("She doesn't care")).toBe('she does not care');
      expect(normalizeWrittenString("We won't go")).toBe('we will not go');
      expect(normalizeWrittenString("They aren't ready")).toBe('they are not ready');
      expect(normalizeWrittenString("I'm happy")).toBe('i am happy');
      expect(normalizeWrittenString("It's amazing")).toBe('it is amazing');
    });

    it('should normalize typographic curly apostrophes identically to straight ones', () => {
      expect(normalizeWrittenString('don’t')).toBe('do not');
      expect(normalizeWrittenString('it’s')).toBe('it is');
    });

    it('should collapse multiple whitespace and trim', () => {
      expect(normalizeWrittenString('   too    many     spaces   ')).toBe('too many spaces');
    });
  });

  describe('isWrittenAnswerAccepted', () => {
    const item = {
      acceptedAnswers: ['she does not like milk', 'she hates milk']
    };

    it('should accept exact normalized match', () => {
      expect(isWrittenAnswerAccepted(item, 'she does not like milk')).toBe(true);
      expect(isWrittenAnswerAccepted(item, "she doesn't like milk.")).toBe(true);
      expect(isWrittenAnswerAccepted(item, 'She hates milk!')).toBe(true);
    });

    it('should reject incorrect answers', () => {
      expect(isWrittenAnswerAccepted(item, 'she likes milk')).toBe(false);
      expect(isWrittenAnswerAccepted(item, '')).toBe(false);
    });
  });

  describe('isSpellingMatch & normalizeSpellingWord', () => {
    it('should normalize spelling word', () => {
      expect(normalizeSpellingWord('   HELLO   world  ')).toBe('hello world');
    });

    it('should match case-insensitively and trimmed', () => {
      expect(isSpellingMatch('Leisure', 'leisure')).toBe(true);
      expect(isSpellingMatch('origami', '  ORIGAMI  ')).toBe(true);
    });

    it('should handle phrasal verbs with parentheses', () => {
      expect(isSpellingMatch('hang out (with)', 'hang out')).toBe(true);
      expect(isSpellingMatch('hang out (with)', 'hang out with')).toBe(true);
      expect(isSpellingMatch('concentrate (on)', 'concentrate')).toBe(true);
      expect(isSpellingMatch('concentrate (on)', 'concentrate on')).toBe(true);
    });

    it('should reject wrong spelling', () => {
      expect(isSpellingMatch('leisure', 'liesure')).toBe(false);
      expect(isSpellingMatch('leisure', '')).toBe(false);
    });
  });

  describe('cleanSpeechText', () => {
    it('should remove IPA phonetic transcriptions', () => {
      expect(cleanSpeechText('harvest /ˈhɑːvɪst/ (v)')).toBe('harvest');
      expect(cleanSpeechText('leisure /ˈleʒə/')).toBe('leisure');
    });

    it('should extract phonetic symbol when input is an isolated phoneme', () => {
      expect(cleanSpeechText('/ʊ/ (u ngắn)')).toBe('ʊ');
    });
  });

  describe('cloneAndShuffleOptions & shuffleArray', () => {
    it('should shuffle array elements preserving all items', () => {
      const arr = [1, 2, 3, 4, 5];
      const res = shuffleArray(arr);
      expect(res.length).toBe(5);
      expect(res.sort()).toEqual([1, 2, 3, 4, 5]);
    });
    const sampleQuestion: UnitQuestion = {
      id: 'q_test_1',
      section: 'Grammar',
      question: 'She is fond of ______ books.',
      options: ['A. reading', 'B. read', 'C. to read', 'D. reads'],
      answer: 0,
      explanation: 'Fond of + V-ing'
    };

    it('should shuffle options and update answer index to match the original correct option', () => {
      const shuffled = cloneAndShuffleOptions(sampleQuestion);
      expect(shuffled.options.length).toBe(4);
      // Correct option text was "reading"
      const correctOption = shuffled.options[shuffled.answer];
      expect(correctOption).toContain('reading');
      expect(shuffled.originalQuestionId).toBe('q_test_1');
    });
  });

  describe('calculateScore10', () => {
    it('should calculate 10-point scale rounded to 2 decimal places', () => {
      expect(calculateScore10(12, 12)).toBe(10);
      expect(calculateScore10(0, 12)).toBe(0);
      expect(calculateScore10(1, 12)).toBe(0.83);
      expect(calculateScore10(6, 12)).toBe(5);
    });

    it('should safely return 0 when totalCount is 0 or negative', () => {
      expect(calculateScore10(0, 0)).toBe(0);
    });
  });

  describe('calculateStreak', () => {
    it('should count distinct study dates', () => {
      const history = [
        { submittedAt: '2026-11-01T10:00:00Z' },
        { submittedAt: '2026-11-01T15:00:00Z' },
        { submittedAt: '2026-11-02T09:00:00Z' },
        { submittedAt: '2026-11-03T18:00:00Z' }
      ];
      expect(calculateStreak(history)).toBe(3);
    });

    it('should return 0 for empty history', () => {
      expect(calculateStreak([])).toBe(0);
    });
  });

  describe('classifyQuestionSkill & compute5SkillRadar', () => {
    it('should classify questions into 5 core competencies', () => {
      expect(classifyQuestionSkill({ section: 'Pronunciation / Stress' })).toBe('pronunciation');
      expect(classifyQuestionSkill({ section: 'Grammar and Structures' })).toBe('grammar');
      expect(classifyQuestionSkill({ section: 'Reading Comprehension', passage: 'Text...' })).toBe('reading');
      expect(classifyQuestionSkill({ section: 'Written Sentence Transformation' })).toBe('writing');
      expect(classifyQuestionSkill({ section: 'Vocabulary in Context' })).toBe('vocabulary');
    });

    it('should compute radar percentage metrics correctly', () => {
      const mockAttempts = [
        {
          answersDetails: [
            { question: { section: 'Pronunciation' }, isCorrect: true },
            { question: { section: 'Pronunciation' }, isCorrect: false },
            { question: { section: 'Grammar' }, isCorrect: true },
            { question: { section: 'Grammar' }, isCorrect: true }
          ]
        }
      ];

      const radar = compute5SkillRadar(mockAttempts);
      expect(radar.pronunciation.total).toBe(2);
      expect(radar.pronunciation.correct).toBe(1);
      expect(radar.pronunciation.percentage).toBe(50);
      expect(radar.grammar.total).toBe(2);
      expect(radar.grammar.correct).toBe(2);
      expect(radar.grammar.percentage).toBe(100);
      expect(radar.vocabulary.percentage).toBe(0);
    });
  });

  describe('generateSmartAdaptiveQuiz', () => {
    it('should prioritize up to 70% from mistakes notebook and remainder from bank', () => {
      const mockMistakes: MistakeItem[] = Array.from({ length: 15 }, (_, i) => ({
        id: `m_${i}`,
        sourceType: 'unit',
        sourceId: 1,
        questionId: `q_mistake_${i}`,
        question: {
          id: `q_mistake_${i}`,
          section: 'Grammar',
          question: `Mistake question ${i}`,
          options: ['A. 1', 'B. 2', 'C. 3', 'D. 4'],
          answer: 0,
          explanation: 'Expl'
        },
        wrongAnswer: 1,
        addedAt: new Date().toISOString(),
        resolved: false
      }));

      const mockBank: UnitQuestion[] = Array.from({ length: 30 }, (_, i) => ({
        id: `q_bank_${i}`,
        section: 'Vocab',
        question: `Bank question ${i}`,
        options: ['A. 1', 'B. 2', 'C. 3', 'D. 4'],
        answer: 0,
        explanation: 'Expl'
      }));

      const quiz = generateSmartAdaptiveQuiz(mockMistakes, mockBank, 20);
      expect(quiz.length).toBe(20);
      // All options in quiz should be formatted with A/B/C/D
      quiz.forEach(q => {
        expect(q.options[0]).toMatch(/^A\./);
        expect(q.options[1]).toMatch(/^B\./);
      });
    });

    it('should fallback to 100% bank if mistakes list is empty', () => {
      const mockBank: UnitQuestion[] = Array.from({ length: 25 }, (_, i) => ({
        id: `q_bank_${i}`,
        section: 'Vocab',
        question: `Bank question ${i}`,
        options: ['A. 1', 'B. 2', 'C. 3', 'D. 4'],
        answer: 0,
        explanation: 'Expl'
      }));

      const quiz = generateSmartAdaptiveQuiz([], mockBank, 10);
      expect(quiz.length).toBe(10);
    });
  });
});
