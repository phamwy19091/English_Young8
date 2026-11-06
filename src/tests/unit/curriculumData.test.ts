import { describe, it, expect } from 'vitest';
import { unitsData, examsData } from '../../data';

describe('Curriculum Data Integrity Audit', () => {
  it('should have exactly 6 units', () => {
    expect(unitsData).toHaveLength(6);
    expect(unitsData.map((u) => u.number)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('should have exactly 86 vocabulary items with full metadata', () => {
    const totalVocab = unitsData.reduce((acc, u) => acc + u.vocab.length, 0);
    expect(totalVocab).toBe(86);

    // Per-unit counts: Unit 1: 15, Unit 2: 15, Unit 3: 14, Unit 4: 14, Unit 5: 14, Unit 6: 14
    expect(unitsData[0].vocab).toHaveLength(15);
    expect(unitsData[1].vocab).toHaveLength(15);
    expect(unitsData[2].vocab).toHaveLength(14);
    expect(unitsData[3].vocab).toHaveLength(14);
    expect(unitsData[4].vocab).toHaveLength(14);
    expect(unitsData[5].vocab).toHaveLength(14);

    // Verify all 86 items contain valid fields
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

  it('should have exactly 12 phonetic sounds across all units', () => {
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
    expect(totalSounds).toBe(12);
  });

  it('should have 8 grammar topics, 50 rules, and 18 tips', () => {
    let totalTopics = 0;
    let totalRules = 0;
    let totalTips = 0;

    unitsData.forEach((u) => {
      totalTopics += u.grammar.length;
      u.grammar.forEach((g) => {
        const rules = Array.isArray(g.rules) ? g.rules : [];
        totalRules += rules.length;
        const tips = (g.tips || g.examTips || []) as string[];
        totalTips += tips.length;
      });
    });

    expect(totalTopics).toBe(8);
    expect(totalRules).toBe(50);
    expect(totalTips).toBe(18);
  });

  it('should have exactly 72 unit multiple-choice questions (12 per unit)', () => {
    const totalQuiz = unitsData.reduce((acc, u) => acc + u.quiz.length, 0);
    expect(totalQuiz).toBe(72);

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

  it('should have exactly 36 unit written exercises (18 word-form, 18 rewrite)', () => {
    const totalWritten = unitsData.reduce((acc, u) => acc + u.writtenExercises.length, 0);
    expect(totalWritten).toBe(36);

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

    expect(wordFormCount).toBe(18);
    expect(rewriteCount).toBe(18);
  });

  it('should have exactly 6 exams and 121 exam questions', () => {
    expect(examsData).toHaveLength(6);

    const questionCounts = examsData.map((e) => e.questions.length);
    expect(questionCounts).toEqual([12, 12, 12, 25, 30, 30]);

    const totalExamQuestions = examsData.reduce((acc, e) => acc + e.questions.length, 0);
    expect(totalExamQuestions).toBe(121);

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

  it('should verify grand total questions equals exactly 229', () => {
    const unitQuiz = unitsData.reduce((acc, u) => acc + u.quiz.length, 0);
    const unitWritten = unitsData.reduce((acc, u) => acc + u.writtenExercises.length, 0);
    const examQuestions = examsData.reduce((acc, e) => acc + e.questions.length, 0);

    const grandTotal = unitQuiz + unitWritten + examQuestions;
    expect(unitQuiz).toBe(72);
    expect(unitWritten).toBe(36);
    expect(examQuestions).toBe(121);
    expect(grandTotal).toBe(229);
  });

  it('should verify reading passages are correctly associated across question groups', () => {
    const allQuestionsWithPassage = examsData.flatMap((e) => e.questions.filter((q) => !!q.passage));
    // 4 in mid1 + 7 in fin1 (4 cloze + 3 reading) + 8 in fin2 (5 cloze + 3 reading) = 19
    expect(allQuestionsWithPassage).toHaveLength(19);

    const groups = new Set(allQuestionsWithPassage.map((q) => q.passageGroupId));
    expect(groups.size).toBe(5);

    // Verify all 19 questions have non-empty passage and non-empty passageGroupId
    allQuestionsWithPassage.forEach((q) => {
      expect(q.passageGroupId).toBeTruthy();
      expect(typeof q.passage).toBe('string');
      expect(q.passage!.length).toBeGreaterThan(50);
    });
  });
});
