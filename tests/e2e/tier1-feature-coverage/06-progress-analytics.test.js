/**
 * Tier 1: Feature Coverage
 * Suite 06: Progress Analytics, Daily Study Streak & 5-Skill Competency Radar
 * Features covered:
 * - Feature 24: Daily Study Streak Tracker (Date diff logic, distinct dates, persistence)
 * - Feature 25: 5-Skill Competency Radar (Pronunciation, Vocabulary, Grammar, Reading, Writing metrics)
 */

import { describe, it, assert } from '../harness/test-engine.js';
import { createAppSession } from '../harness/test-context.js';
import { calculateStreak, classifyQuestionSkill, compute5SkillRadar } from '../harness/domain-logic.js';

describe('Tier 1: Suite 06 - Progress Analytics, Daily Streak & 5-Skill Radar', () => {

  // --- FEATURE 24: DAILY STUDY STREAK TRACKER ---
  describe('Feature 24: Daily Study Streak Tracker Invariants', () => {
    it('F24.1: Empty exam history returns streak count of 0', () => {
      assert.strictEqual(calculateStreak([]), 0);
      assert.strictEqual(calculateStreak(null), 0);
    });

    it('F24.2: Multiple study attempts on the same calendar day count as 1 distinct streak day', () => {
      const historySameDay = [
        { date: '2026-11-06 09:00:00', score: 8.5 },
        { date: '2026-11-06 14:30:00', score: 9.0 },
        { date: '2026-11-06 20:15:00', score: 9.5 }
      ];
      assert.strictEqual(calculateStreak(historySameDay), 1);
    });

    it('F24.3: Study attempts across distinct calendar days accumulate streak count', () => {
      const historyMultiDays = [
        { date: '2026-11-04', score: 8.0 },
        { date: '2026-11-05', score: 8.5 },
        { date: '2026-11-06', score: 9.0 }
      ];
      assert.strictEqual(calculateStreak(historyMultiDays), 3);
    });

    it('F24.4: Streak count renders accurately on Progress view and Dashboard hero', () => {
      const session = createAppSession();
      session.setStorage(session._getUserKey('ey8_exam_history_v1'), [
        { date: '2026-11-05', score: 8.0 },
        { date: '2026-11-06', score: 9.0 }
      ]);

      session.navigate('#/progress');
      const progressHero = session.getText('.progress-hero');
      assert.ok(progressHero.includes('2 ngày'), `Progress view should display 2 ngày, got "${progressHero}"`);

      session.navigate('#/dashboard');
      const dashHero = session.getText('.hero-welcome');
      assert.ok(dashHero.includes('2 ngày'), `Dashboard should display 2 ngày, got "${dashHero}"`);
    });

    it('F24.5: Submitting a new exam updates the streak and persists in LocalStorage', () => {
      const session = createAppSession();
      session.startExam('exam-15m-1');
      session.submitExam();

      assert.strictEqual(session.getStreak(), 1);
      const history = session.getExamHistory();
      assert.strictEqual(history.length, 1);
      assert.ok(history[0].date, 'Date must be recorded on attempt');
    });
  });

  // --- FEATURE 25: 5-SKILL COMPETENCY RADAR ---
  describe('Feature 25: 5-Skill Competency Radar Invariants', () => {
    it('F25.1: Question skill classifier identifies pronunciation and stress questions', () => {
      assert.strictEqual(classifyQuestionSkill({ section: 'Phát âm /ʊ/ và /uː/' }), 'pronunciation');
      assert.strictEqual(classifyQuestionSkill({ section: 'PRONUNCIATION' }), 'pronunciation');
      assert.strictEqual(classifyQuestionSkill({ section: 'Word stress' }), 'pronunciation');
      assert.strictEqual(classifyQuestionSkill({ section: 'Ngữ âm' }), 'pronunciation');
    });

    it('F25.2: Question skill classifier identifies grammar and structure questions', () => {
      assert.strictEqual(classifyQuestionSkill({ section: 'Grammar: Verbs of liking' }), 'grammar');
      assert.strictEqual(classifyQuestionSkill({ section: 'Ngữ pháp thì hiện tại đơn' }), 'grammar');
      assert.strictEqual(classifyQuestionSkill({ section: 'Prepositions' }), 'grammar');
    });

    it('F25.3: Question skill classifier identifies reading comprehension and cloze questions', () => {
      assert.strictEqual(classifyQuestionSkill({ section: 'Đọc hiểu đoạn văn' }), 'reading');
      assert.strictEqual(classifyQuestionSkill({ section: 'Reading Comprehension' }), 'reading');
      assert.strictEqual(classifyQuestionSkill({ section: 'Cloze test' }), 'reading');
      assert.strictEqual(classifyQuestionSkill({ passage: 'Long reading text...' }), 'reading');
    });

    it('F25.4: Question skill classifier identifies writing, rewrite, and word-form questions', () => {
      assert.strictEqual(classifyQuestionSkill({ section: 'Viết lại câu' }), 'writing');
      assert.strictEqual(classifyQuestionSkill({ section: 'Writing transformation' }), 'writing');
      assert.strictEqual(classifyQuestionSkill({ type: 'word-form' }), 'writing');
      assert.strictEqual(classifyQuestionSkill({ type: 'rewrite' }), 'writing');
    });

    it('F25.5: Question skill classifier defaults to vocabulary for lexical questions', () => {
      assert.strictEqual(classifyQuestionSkill({ section: 'Vocabulary in context' }), 'vocabulary');
      assert.strictEqual(classifyQuestionSkill({ section: 'Từ vựng Unit 1' }), 'vocabulary');
      assert.strictEqual(classifyQuestionSkill({ section: 'Unknown category' }), 'vocabulary');
    });

    it('F25.6: 5-skill radar aggregates correct percentages without division by zero', () => {
      const emptyRadar = compute5SkillRadar([]);
      assert.strictEqual(emptyRadar.pronunciation.percentage, 0);
      assert.strictEqual(emptyRadar.grammar.percentage, 0);
      assert.strictEqual(emptyRadar.vocabulary.percentage, 0);
      assert.strictEqual(emptyRadar.reading.percentage, 0);
      assert.strictEqual(emptyRadar.writing.percentage, 0);
    });

    it('F25.7: 5-skill radar accurately computes mastery percentages from attempt history', () => {
      const mockAttempt = {
        answersDetails: [
          { question: { section: 'pronunciation' }, isCorrect: true },
          { question: { section: 'pronunciation' }, isCorrect: false },
          { question: { section: 'grammar' }, isCorrect: true },
          { question: { section: 'grammar' }, isCorrect: true },
          { question: { section: 'reading' }, isCorrect: false }
        ]
      };

      const radar = compute5SkillRadar([mockAttempt]);
      assert.strictEqual(radar.pronunciation.total, 2);
      assert.strictEqual(radar.pronunciation.correct, 1);
      assert.strictEqual(radar.pronunciation.percentage, 50); // 1/2 = 50%

      assert.strictEqual(radar.grammar.total, 2);
      assert.strictEqual(radar.grammar.correct, 2);
      assert.strictEqual(radar.grammar.percentage, 100); // 2/2 = 100%

      assert.strictEqual(radar.reading.total, 1);
      assert.strictEqual(radar.reading.correct, 0);
      assert.strictEqual(radar.reading.percentage, 0); // 0/1 = 0%
    });

    it('F25.8: Progress view renders skill pills reflecting calculated radar percentages', () => {
      const session = createAppSession();
      session.setStorage(session._getUserKey('ey8_exam_history_v1'), [
        {
          answersDetails: [
            { question: { section: 'pronunciation' }, isCorrect: true },
            { question: { section: 'grammar' }, isCorrect: true }
          ]
        }
      ]);

      session.navigate('#/progress');
      const pronPill = session.getText('[data-skill="pronunciation"]');
      const gramPill = session.getText('[data-skill="grammar"]');

      assert.ok(pronPill.includes('100%'), `Pronunciation pill should show 100%, got "${pronPill}"`);
      assert.ok(gramPill.includes('100%'), `Grammar pill should show 100%, got "${gramPill}"`);
    });
  });
});
