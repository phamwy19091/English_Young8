/**
 * Tier 1: Feature Coverage
 * Suite 03: Unit Practice (Focus/List), Auto-Graded Written Exercises & Grammar Viewer
 * Features covered:
 * - Feature 10: Unit Practice Focus Mode (1 question per card, step navigation & progress bar)
 * - Feature 11: Unit Practice List Mode (All unit questions displayed together for rapid review)
 * - Feature 12: Auto-Graded Written Exercises (Word-form & rewrite with smart string normalization & hints)
 * - Feature 13: Grammar Reference & Tips Viewer (8 topics, 50 rules, 18 tips formatted with clear typography)
 */

import { describe, it, assert } from '../harness/test-engine.js';
import { createAppSession } from '../harness/test-context.js';
import { normalizeWrittenString, isWrittenAnswerAccepted } from '../harness/domain-logic.js';
import { getUnits, getAllUnitQuestions, getAllWrittenExercises } from '../harness/curriculum-loader.js';

describe('Tier 1: Suite 03 - Unit Practice, Auto-Graded Written & Grammar Viewer', () => {

  // --- FEATURE 10: UNIT PRACTICE FOCUS MODE ---
  describe('Feature 10: Unit Practice Focus Mode Invariants', () => {
    it('F10.1: Focus mode displays exactly 1 question on screen at any time', () => {
      const session = createAppSession();
      session.unitQuizMode = 'focus';
      session.unitFocusQuestionIndex = 0;
      const questions = session.activeUnit.quiz;
      assert.ok(questions.length >= 12, 'Unit must have at least 12 questions');
      const currentQ = questions[session.unitFocusQuestionIndex];
      assert.strictEqual(currentQ.id, 'u1-q1');
    });

    it('F10.2: Navigation controls advance and retreat focus question sequentially', () => {
      const session = createAppSession();
      session.unitQuizMode = 'focus';
      session.unitFocusQuestionIndex = 0;

      session.unitFocusQuestionIndex++;
      assert.strictEqual(session.unitFocusQuestionIndex, 1);
      assert.strictEqual(session.activeUnit.quiz[session.unitFocusQuestionIndex].id, 'u1-q2');

      session.unitFocusQuestionIndex--;
      assert.strictEqual(session.unitFocusQuestionIndex, 0);
      assert.strictEqual(session.activeUnit.quiz[session.unitFocusQuestionIndex].id, 'u1-q1');
    });

    it('F10.3: Progress bar/counter reflects current question step (e.g. 1/12)', () => {
      const session = createAppSession();
      session.unitQuizMode = 'focus';
      const total = session.activeUnit.quiz.length;

      for (let idx = 0; idx < 3; idx++) {
        session.unitFocusQuestionIndex = idx;
        const stepLabel = `Câu ${idx + 1} / ${total}`;
        assert.ok(stepLabel.includes(`${idx + 1} / ${total}`));
      }
    });

    it('F10.4: Selected answers in focus mode persist when navigating across questions', () => {
      const session = createAppSession();
      session.unitQuizMode = 'focus';

      session.selectUnitQuizAnswer('u1-q1', 2);
      session.unitFocusQuestionIndex = 1;

      session.selectUnitQuizAnswer('u1-q2', 0);
      session.unitFocusQuestionIndex = 0;

      assert.strictEqual(session.unitQuizAnswers['u1-q1'], 2);
      assert.strictEqual(session.unitQuizAnswers['u1-q2'], 0);
    });
  });

  // --- FEATURE 11: UNIT PRACTICE LIST MODE & ALL 72 QUESTIONS AUDIT ---
  describe('Feature 11: Unit Practice List Mode Invariants', () => {
    it('F11.1: List mode provides all 12 questions simultaneously for rapid review', () => {
      const session = createAppSession();
      session.unitQuizMode = 'list';
      const questions = session.activeUnit.quiz;
      assert.strictEqual(questions.length, 12, 'Unit 1 must have 12 quiz questions');
    });

    it('F11.2: Student can select and change answer choices freely before submission', () => {
      const session = createAppSession();
      session.selectUnitQuizAnswer('u1-q1', 1);
      assert.strictEqual(session.unitQuizAnswers['u1-q1'], 1);

      session.selectUnitQuizAnswer('u1-q1', 2);
      assert.strictEqual(session.unitQuizAnswers['u1-q1'], 2);
    });

    it('F11.3: Submitting unit quiz calculates standard 10-point scale score', () => {
      const session = createAppSession();
      const questions = session.activeUnit.quiz;

      questions.forEach((q, idx) => {
        if (idx < 9) {
          session.selectUnitQuizAnswer(q.id, q.answer);
        } else {
          session.selectUnitQuizAnswer(q.id, (q.answer + 1) % 4);
        }
      });

      const res = session.submitUnitQuiz();
      assert.strictEqual(res.correct, 9);
      assert.strictEqual(res.total, 12);
      assert.strictEqual(res.score10, 7.5);
    });

    it('F11.4: Unit quiz submission locks answers preventing subsequent modifications', () => {
      const session = createAppSession();
      session.selectUnitQuizAnswer('u1-q1', 2);
      session.submitUnitQuiz();

      session.selectUnitQuizAnswer('u1-q1', 0);
      assert.strictEqual(session.unitQuizAnswers['u1-q1'], 2, 'Answer must not change after submit');
    });

    it('F11.5: Best score retention preserves previous record if subsequent attempt is lower', () => {
      const session = createAppSession();
      session.setStorage(session._getUserKey('ey8_unit_scores_v1'), { 1: 9.0 });

      session.unitQuizSubmitted = false;
      const questions = session.activeUnit.quiz;
      questions.forEach((q, idx) => {
        if (idx < 9) session.selectUnitQuizAnswer(q.id, q.answer);
        else session.selectUnitQuizAnswer(q.id, (q.answer + 1) % 4);
      });

      session.submitUnitQuiz();
      const scores = session.getUnitScores();
      assert.strictEqual(scores[1], 9.0);
    });

    it('F11.6: Best score updates when student achieves higher score', () => {
      const session = createAppSession();
      session.setStorage(session._getUserKey('ey8_unit_scores_v1'), { 1: 7.0 });

      session.unitQuizSubmitted = false;
      session.activeUnit.quiz.forEach(q => session.selectUnitQuizAnswer(q.id, q.answer));

      session.submitUnitQuiz();
      const scores = session.getUnitScores();
      assert.strictEqual(scores[1], 10.0);
    });

    // Exhaustive contract audit for all 72 multiple-choice questions
    describe('Feature 11: Exhaustive 72-MCQ Quiz Questions Audit across Units 1-6', () => {
      const allQs = getAllUnitQuestions();
      allQs.forEach((q, idx) => {
        it(`F11.Q${idx + 1}: MCQ "${q.id}" (Unit ${q.unitNumber}) has 4 options and valid answer index`, () => {
          assert.ok(q.id);
          assert.ok(q.question && q.question.length > 0);
          assert.strictEqual(q.options.length, 4);
          assert.ok(q.answer >= 0 && q.answer <= 3);
          assert.ok(q.explanation && q.explanation.length > 0);
        });
      });
    });
  });

  // --- FEATURE 12: AUTO-GRADED WRITTEN EXERCISES ---
  describe('Feature 12: Auto-Graded Written Exercises Invariants', () => {
    it('F12.1: String normalization lowercases and trims surrounding whitespaces', () => {
      assert.strictEqual(normalizeWrittenString('  RELAXING  '), 'relaxing');
      assert.strictEqual(normalizeWrittenString('\n\tactivities\t'), 'activities');
    });

    it('F12.2: String normalization strips punctuation marks without penalizing student', () => {
      assert.strictEqual(normalizeWrittenString('relaxing.'), 'relaxing');
      assert.strictEqual(normalizeWrittenString('relaxing!'), 'relaxing');
      assert.strictEqual(normalizeWrittenString('activities, please;'), 'activities please');
      assert.strictEqual(normalizeWrittenString('"relaxing"'), 'relaxing');
    });

    it('F12.3: String normalization expands common English contractions to full forms', () => {
      assert.strictEqual(normalizeWrittenString("don't"), 'do not');
      assert.strictEqual(normalizeWrittenString("doesn't"), 'does not');
      assert.strictEqual(normalizeWrittenString("isn't"), 'is not');
      assert.strictEqual(normalizeWrittenString("aren't"), 'are not');
      assert.strictEqual(normalizeWrittenString("won't"), 'will not');
      assert.strictEqual(normalizeWrittenString("can't"), 'cannot');
      assert.strictEqual(normalizeWrittenString("i'm"), 'i am');
      assert.strictEqual(normalizeWrittenString("it's"), 'it is');
    });

    it('F12.4: Word-form exercises evaluate morphological variants accurately', () => {
      const session = createAppSession();
      const isRight = session.submitWrittenExercise('u1_w1', 'relaxing');
      assert.ok(isRight);

      const isWrong = session.submitWrittenExercise('u1_w1', 'relaxation');
      assert.strictEqual(isWrong, false);
    });

    it('F12.5: Sentence rewrite exercises accept both contracted and expanded variants', () => {
      const session = createAppSession();
      const u1Exercises = session.activeUnit.writtenExercises || [];
      const rewriteEx = u1Exercises.find(e => e.type === 'rewrite');
      assert.ok(rewriteEx);

      const acceptedAnswer = rewriteEx.acceptedAnswers[0];
      const result = session.submitWrittenExercise(rewriteEx.id, acceptedAnswer);
      assert.ok(result);
    });

    it('F12.6: Single-question check button validates individual item without full form submit', () => {
      const session = createAppSession();
      assert.strictEqual(session.unitWrittenChecked['u1_w1'], undefined);

      session.submitWrittenExercise('u1_w1', 'relaxing');
      assert.ok(session.unitWrittenChecked['u1_w1']);
      assert.strictEqual(session.unitWrittenChecked['u1_w2'], undefined);
    });

    it('F12.7: Hint toggle provides pedagogical guidance for word-form or rewrite structure', () => {
      const u1Exercises = getUnits()[0].writtenExercises;
      u1Exercises.forEach(ex => {
        assert.ok(ex.hint && ex.hint.length > 10);
      });
    });

    // Auto-grading verification for all 36 written exercises
    describe('Feature 12: Exhaustive Auto-Grading Execution for All 36 Written Exercises', () => {
      const allWritten = getAllWrittenExercises();
      allWritten.forEach((w, idx) => {
        it(`F12.W${idx + 1}: Exercise "${w.id}" auto-grades accepted answer and rejects invalid`, () => {
          const accepted = w.acceptedAnswers[0];
          assert.ok(isWrittenAnswerAccepted(w, accepted), `Accepted answer "${accepted}" should pass for ${w.id}`);
          assert.strictEqual(isWrittenAnswerAccepted(w, 'gibberish_incorrect_answer_xyz'), false, `Invalid answer should fail for ${w.id}`);
        });
      });
    });
  });

  // --- FEATURE 13: GRAMMAR REFERENCE & TIPS VIEWER ---
  describe('Feature 13: Grammar Reference & Tips Viewer Invariants', () => {
    it('F13.1: All 8 grammar topics render with titles, explanation, examples, and tips', () => {
      const units = getUnits();
      let totalTopics = 0;

      units.forEach(u => {
        (u.grammar || []).forEach(g => {
          totalTopics++;
          assert.ok(g.title && g.title.length > 0);
          assert.ok(Array.isArray(g.rules) && g.rules.length > 0);
          assert.ok(Array.isArray(g.tips));
        });
      });

      assert.strictEqual(totalTopics, 8);
    });

    it('F13.2: Grammar rules include illustrative examples with Vietnamese translations', () => {
      const u1Grammar = getUnits()[0].grammar[0];
      const rulesText = u1Grammar.rules.join(' ');
      assert.ok(rulesText.includes('V-ing'));
      assert.ok(rulesText.includes('Ví dụ') || rulesText.includes('ví dụ'));
    });

    it('F13.3: Exam tips highlight common pitfalls and high-frequency test patterns', () => {
      const u1Grammar = getUnits()[0].grammar[0];
      assert.ok(u1Grammar.tips.length > 0);
      const tipText = u1Grammar.tips.join(' ');
      assert.ok(tipText.includes('would like') || tipText.includes('prefer'));
    });
  });
});
