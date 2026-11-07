import { describe, it, expect } from 'vitest';
import { unitsData, examsData } from '../../data';

describe('Curriculum Data Integrity Audit (Full 12 Units & Entrance 10 Suite)', () => {
  it('should have exactly 12 units', () => {
    expect(unitsData).toHaveLength(12);
    expect(unitsData.map((u) => u.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('should have exactly 170 vocabulary items with full metadata', () => {
    const totalVocab = unitsData.reduce((acc, u) => acc + u.vocab.length, 0);
    expect(totalVocab).toBe(170);

    // Per-unit counts: Unit 1: 15, Unit 2: 15, Units 3-12: 14 each
    expect(unitsData[0].vocab).toHaveLength(15);
    expect(unitsData[1].vocab).toHaveLength(15);
    for (let i = 2; i < 12; i++) {
      expect(unitsData[i].vocab).toHaveLength(14);
    }

    // Verify all 170 items contain valid fields
    unitsData.forEach((unit) => {
      unit.vocab.forEach((v) => {
        expect(v.id).toBeTruthy();
        expect(v.word).toBeTruthy();
        expect(v.ipa).toMatch(/^\/.*\/$/);
        expect(v.type).toBeTruthy();
        expect(v.meaning).toBeTruthy();
        expect(v.example).toBeTruthy();
        expect(v.exampleVi).toBeTruthy();
      });
    });
  });

  it('should have 24 phonetic sounds across all units (2 per unit)', () => {
    let totalSounds = 0;
    unitsData.forEach((u) => {
      const expl = u.pronunciation.explanation || [];
      totalSounds += expl.length;
      expl.forEach((s) => {
        expect(s.sound).toBeTruthy();
        expect(s.guide || s.desc).toBeTruthy();
        expect(s.examples.length).toBeGreaterThan(0);
      });
    });
    expect(totalSounds).toBe(24);
  });

  it('should have grammar topics with valid rules and tips', () => {
    let totalTopics = 0;
    let totalRules = 0;

    unitsData.forEach((u) => {
      totalTopics += u.grammar.length;
      u.grammar.forEach((g) => {
        const rules = Array.isArray(g.rules) ? g.rules : [];
        totalRules += rules.length;
        expect(g.title).toBeTruthy();
        expect(rules.length).toBeGreaterThan(0);
      });
    });

    expect(totalTopics).toBeGreaterThanOrEqual(18);
    expect(totalRules).toBeGreaterThanOrEqual(70);
  });

  it('should have exactly 144 unit multiple-choice questions (12 per unit)', () => {
    const totalQuiz = unitsData.reduce((acc, u) => acc + u.quiz.length, 0);
    expect(totalQuiz).toBe(144);

    unitsData.forEach((unit) => {
      expect(unit.quiz).toHaveLength(12);
      unit.quiz.forEach((q) => {
        expect(q.id).toBeTruthy();
        expect(q.question).toBeTruthy();
        expect(q.options).toHaveLength(4);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(4);
        expect(q.explanation).toBeTruthy();
      });
    });
  });

  it('should have exactly 72 unit written exercises (36 word-form, 36 rewrite)', () => {
    const totalWritten = unitsData.reduce((acc, u) => acc + u.writtenExercises.length, 0);
    expect(totalWritten).toBe(72);

    let wordFormCount = 0;
    let rewriteCount = 0;

    unitsData.forEach((unit) => {
      expect(unit.writtenExercises).toHaveLength(6);
      unit.writtenExercises.forEach((ex) => {
        expect(ex.id).toBeTruthy();
        expect(ex.prompt || ex.question).toBeTruthy();
        expect(ex.acceptedAnswers || ex.accepted).toBeDefined();
        expect((ex.acceptedAnswers || ex.accepted)!.length).toBeGreaterThan(0);
        expect(ex.explanation).toBeTruthy();

        if (ex.type === 'word-form') {
          wordFormCount++;
          expect(ex.rootWord).toBeTruthy();
        } else if (ex.type === 'rewrite') {
          rewriteCount++;
        }
      });
    });

    expect(wordFormCount).toBe(36);
    expect(rewriteCount).toBe(36);
  });

  it('should have 14 exams and all valid exam questions', () => {
    expect(examsData).toHaveLength(14);

    const totalExamQuestions = examsData.reduce((acc, e) => acc + e.questions.length, 0);
    expect(totalExamQuestions).toBe(293);

    examsData.forEach((exam) => {
      expect(exam.id).toBeTruthy();
      expect(exam.title).toBeTruthy();
      expect(exam.durationMinutes).toBeGreaterThan(0);

      exam.questions.forEach((q) => {
        expect(q.id).toBeTruthy();
        expect(q.question).toBeTruthy();
        expect(q.options).toHaveLength(4);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(4);
        expect(q.explanation).toBeTruthy();
      });
    });
  });

  it('should verify grand total questions equals exactly 509', () => {
    const unitQuiz = unitsData.reduce((acc, u) => acc + u.quiz.length, 0);
    const unitWritten = unitsData.reduce((acc, u) => acc + u.writtenExercises.length, 0);
    const examQuestions = examsData.reduce((acc, e) => acc + e.questions.length, 0);

    const grandTotal = unitQuiz + unitWritten + examQuestions;
    expect(unitQuiz).toBe(144);
    expect(unitWritten).toBe(72);
    expect(examQuestions).toBe(293);
    expect(grandTotal).toBe(509);
  });

  it('should verify reading passages are correctly associated across question groups', () => {
    const allQuestionsWithPassage = examsData.flatMap((e) => e.questions.filter((q) => !!q.passage));
    expect(allQuestionsWithPassage.length).toBeGreaterThanOrEqual(19);

    const groups = new Set(allQuestionsWithPassage.map((q) => q.passageGroupId));
    expect(groups.size).toBeGreaterThanOrEqual(5);

    // Verify all passage questions have non-empty passage and non-empty passageGroupId
    allQuestionsWithPassage.forEach((q) => {
      expect(q.passageGroupId).toBeTruthy();
      expect(typeof q.passage).toBe('string');
      expect(q.passage!.length).toBeGreaterThan(30);
    });
  });
});
