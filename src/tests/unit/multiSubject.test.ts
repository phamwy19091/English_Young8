import { describe, it, expect } from 'vitest';
import { SUBJECTS_REGISTRY, getSubjectConfig } from '../../data/subjects';
import { mathChaptersData } from '../../data/math/mathChapters';
import { mathExamsData } from '../../data/math/mathExams';
import {
  scienceTopicsData,
  SCIENCE_ELEMENTS_REF,
  SCIENCE_PHYSICS_FORMULAS_REF,
} from '../../data/science/scienceTopics';
import { scienceExamsData } from '../../data/science/scienceExams';
import { normalizeExamAttempt, normalizeMistakeItem } from '../../services/storageService';

describe('Multi-Subject Architecture & Content Tests', () => {
  it('1. registers 3 subjects with strictly tailored modules (no English flashcards/games in Math or Science)', () => {
    expect(SUBJECTS_REGISTRY.map(s => s.id)).toEqual(['english', 'math', 'science']);

    const english = getSubjectConfig('english');
    const math = getSubjectConfig('math');
    const science = getSubjectConfig('science');

    expect(english.enabledModules).toContain('vocab_flashcard');
    expect(english.enabledModules).toContain('games_2d');

    expect(math.enabledModules).toContain('math_formulas');
    expect(math.enabledModules).toContain('math_short_answer');
    expect(math.enabledModules).not.toContain('vocab_flashcard');
    expect(math.enabledModules).not.toContain('games_2d');

    expect(science.enabledModules).toContain('science_branches');
    expect(science.enabledModules).toContain('science_reference');
    expect(science.enabledModules).not.toContain('vocab_flashcard');
    expect(science.enabledModules).not.toContain('games_2d');
  });

  it('2. validates all 6 Toán 8 (KNTT) chapters and 3 Math exams', () => {
    expect(mathChaptersData).toHaveLength(6);

    mathChaptersData.forEach(ch => {
      expect(ch.formulas.length).toBeGreaterThanOrEqual(2);
      expect(ch.quiz).toHaveLength(6);
      expect(ch.shortAnswers).toHaveLength(3);

      ch.quiz.forEach(q => {
        expect(q.options).toHaveLength(4);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThanOrEqual(3);
        expect(q.explanation.length).toBeGreaterThan(5);
      });

      ch.shortAnswers.forEach(sa => {
        expect(sa.acceptedAnswers.length).toBeGreaterThanOrEqual(1);
        expect(sa.solution.length).toBeGreaterThan(5);
      });
    });

    expect(mathExamsData).toHaveLength(3);
    mathExamsData.forEach(exam => {
      expect(exam.subjectId).toBe('math');
      expect(exam.questions.length).toBeGreaterThanOrEqual(10);
      exam.questions.forEach(q => {
        expect(q.options).toHaveLength(4);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThanOrEqual(3);
      });
    });
  });

  it('3. validates all 6 KHTN 8 (KNTT) topics across Chemistry, Physics, Biology and 3 Science exams', () => {
    expect(scienceTopicsData).toHaveLength(6);

    const branches = new Set(scienceTopicsData.map(t => t.branch));
    expect(branches).toEqual(new Set(['chemistry', 'physics', 'biology']));

    scienceTopicsData.forEach(topic => {
      expect(topic.concepts.length).toBeGreaterThanOrEqual(2);
      expect(topic.quiz).toHaveLength(6);
      topic.quiz.forEach(q => {
        expect(q.options).toHaveLength(4);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThanOrEqual(3);
        expect(q.explanation.length).toBeGreaterThan(5);
      });
    });

    expect(SCIENCE_ELEMENTS_REF.length).toBeGreaterThanOrEqual(10);
    expect(SCIENCE_PHYSICS_FORMULAS_REF.length).toBeGreaterThanOrEqual(5);

    expect(scienceExamsData).toHaveLength(3);
    scienceExamsData.forEach(exam => {
      expect(exam.subjectId).toBe('science');
      expect(exam.questions.length).toBeGreaterThanOrEqual(10);
      exam.questions.forEach(q => {
        expect(q.options).toHaveLength(4);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThanOrEqual(3);
      });
    });
  });

  it('4. preserves subjectId in normalized exam attempts and mistakes', () => {
    const mathAttempt = normalizeExamAttempt({
      id: 'att_math_1',
      subjectId: 'math',
      examId: 'math-exam-15m-1',
      examTitle: 'Toán 15p',
      score: 9,
      totalQuestions: 10,
      timeSpentSeconds: 400,
    });
    expect(mathAttempt.subjectId).toBe('math');

    const scienceMistake = normalizeMistakeItem({
      id: 'mst_sci_1',
      subjectId: 'science',
      sourceType: 'unit',
      sourceId: 'sci-chem-1',
      question: {
        id: 'sc1_q2',
        section: 'Hóa học',
        question: 'Test?',
        options: ['A', 'B', 'C', 'D'],
        answer: 1,
        explanation: 'Giải thích',
      },
      wrongAnswer: 0,
    });
    expect(scienceMistake?.subjectId).toBe('science');
  });
});
