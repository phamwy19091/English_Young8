/**
 * Tier 1: Feature Coverage
 * Suite 05: Mistake Notebook, Harvesting, Spoiler-Free Retry & Adaptive Clearance
 * Features covered:
 * - Feature 19: Automatic Mistake Harvesting (Auto-save on quiz/exam submission)
 * - Feature 20: Mistake Notebook (Filter by unit/exam, count indicators, persistent storage)
 * - Feature 21: Spoiler-Free Mistake Retry (Hidden answer key, in-card solving, feedback)
 * - Feature 22: Mistake Batch Practice Mode (Custom practice session from active wrong answers)
 * - Feature 23: Adaptive Mistake Clearance (Auto-removal of mistakes when correctly re-solved)
 */

import { describe, it, assert } from '../harness/test-engine.js';
import { createAppSession } from '../harness/test-context.js';

describe('Tier 1: Suite 05 - Mistake Notebook, Harvesting, Retry & Adaptive Clearance', () => {

  // --- FEATURE 19: AUTOMATIC MISTAKE HARVESTING ---
  describe('Feature 19: Automatic Mistake Harvesting Invariants', () => {
    it('F19.1: Wrong answers in Unit Quiz are automatically harvested into Mistake Notebook', () => {
      const session = createAppSession();
      const q1 = session.activeUnit.quiz[0];

      // Intentionally select wrong answer
      const wrongChoice = (q1.answer + 1) % 4;
      session.selectUnitQuizAnswer(q1.id, wrongChoice);
      session.submitUnitQuiz();

      const mistakes = session.getMistakes();
      assert.ok(mistakes[q1.id], `Question ${q1.id} must be harvested into mistake notebook`);
      assert.strictEqual(mistakes[q1.id].wrongChoice, wrongChoice);
      assert.strictEqual(mistakes[q1.id].answer, q1.answer);
      assert.strictEqual(mistakes[q1.id].resolved, false);
    });

    it('F19.2: Wrong answers in Timed Exam are automatically harvested into Mistake Notebook', () => {
      const session = createAppSession();
      session.startExam('exam-15m-1');
      const q = session.activeExam.questions[0];

      const wrongChoice = (q.answer + 2) % 4;
      session.selectExamAnswer(q.id, wrongChoice);
      session.submitExam();

      const mistakes = session.getMistakes();
      assert.ok(mistakes[q.id], `Exam question ${q.id} must be harvested`);
      assert.strictEqual(mistakes[q.id].wrongChoice, wrongChoice);
      assert.ok(mistakes[q.id].source && mistakes[q.id].source.length > 0, 'Source should identify the exam title');
    });

    it('F19.3: Unanswered questions upon exam submission are captured with wrongChoice = -1', () => {
      const session = createAppSession();
      session.startExam('exam-15m-1');

      // Submit without answering question 0
      const q0 = session.activeExam.questions[0];
      session.submitExam();

      const mistakes = session.getMistakes();
      assert.ok(mistakes[q0.id], 'Unanswered question must be harvested as mistake');
      assert.strictEqual(mistakes[q0.id].wrongChoice, -1, 'Unanswered choice should be -1');
    });

    it('F19.4: Re-answering a question incorrectly updates existing mistake entry without duplication', () => {
      const session = createAppSession();
      session.startExam('exam-15m-1');
      const q = session.activeExam.questions[0];

      session.selectExamAnswer(q.id, 0);
      session.submitExam();

      // Take another attempt and select option 1
      session.examSubmitted = false;
      session.selectExamAnswer(q.id, 1);
      session.submitExam();

      const mistakes = session.getMistakes();
      const matchingKeys = Object.keys(mistakes).filter(k => k === q.id);
      assert.strictEqual(matchingKeys.length, 1, 'Should not create duplicate mistake entries');
      assert.strictEqual(mistakes[q.id].wrongChoice, 1, 'Wrong choice should update to latest');
    });
  });

  // --- FEATURE 20: MISTAKE NOTEBOOK (SỔ TAY CÂU SAI) ---
  describe('Feature 20: Mistake Notebook Invariants', () => {
    it('F20.1: Mistake notebook header displays total count of captured errors', () => {
      const session = createAppSession();
      session.setStorage(session._getUserKey('ey8_mistakes_v1'), {
        'q1': { id: 'q1', question: 'Q1', options: ['A','B','C','D'], answer: 0, source: 'Unit 1' },
        'q2': { id: 'q2', question: 'Q2', options: ['A','B','C','D'], answer: 1, source: 'Exam 1' }
      });
      session.navigate('#/mistakes');

      const headerText = session.getText('.mistakes-header');
      assert.ok(headerText.includes('2 câu'), `Header should display 2 câu, got "${headerText}"`);
    });

    it('F20.2: Mistake items persist in LocalStorage across page reloads', () => {
      const session = createAppSession();
      session.setStorage(session._getUserKey('ey8_mistakes_v1'), {
        'err_101': { id: 'err_101', question: 'Error test', answer: 2, resolved: false }
      });

      // Reload simulation sharing browser storage
      const reloadedSession = createAppSession({ username: session.username, browser: session.browser });
      const stored = reloadedSession.getMistakes();
      assert.ok(stored['err_101'], 'Stored mistake must be recovered from LocalStorage');
    });

    it('F20.3: Manual deletion removes mistake permanently from notebook', () => {
      const session = createAppSession();
      session.setStorage(session._getUserKey('ey8_mistakes_v1'), {
        'm_del': { id: 'm_del', question: 'Delete me', answer: 0 }
      });

      const deleted = session.deleteMistake('m_del');
      assert.strictEqual(deleted, true);
      assert.strictEqual(session.getMistakes()['m_del'], undefined);
    });
  });

  // --- FEATURE 21: SPOILER-FREE MISTAKE RETRY ---
  describe('Feature 21: Spoiler-Free Mistake Retry Invariants', () => {
    it('F21.1: Default mistake card view conceals correct answer key and explanation', () => {
      const session = createAppSession();
      session.setStorage(session._getUserKey('ey8_mistakes_v1'), {
        'm_spoil': {
          id: 'm_spoil',
          question: 'Test question?',
          options: ['A. First', 'B. Second', 'C. Third', 'D. Fourth'],
          answer: 2,
          explanation: 'Secret explanation'
        }
      });
      session.navigate('#/mistakes');

      // Verify card does not reveal answer by default
      const card = session.querySelector('.mistake-card');
      assert.ok(!card.classList.contains('solved'), 'Card must not be marked solved initially');
      assert.ok(!session.getText('.mistake-card').includes('Secret explanation'), 'Explanation must remain hidden');
    });

    it('F21.2: In-card retry solving with correct answer marks card as resolved', () => {
      const session = createAppSession();
      session.setStorage(session._getUserKey('ey8_mistakes_v1'), {
        'm_retry': {
          id: 'm_retry',
          question: 'What is 2+2?',
          options: ['A. 3', 'B. 4', 'C. 5', 'D. 6'],
          answer: 1, // B. 4
          resolved: false
        }
      });
      session.navigate('#/mistakes');

      const res = session.retryMistakeCard('m_retry', 1);
      assert.strictEqual(res.isCorrect, true);

      const card = session.querySelector('.mistake-card');
      assert.ok(card.classList.contains('solved'), 'Card must have solved class');
      assert.ok(session.getText('.mistake-card').includes('Đã gỡ thành công'), 'Card must show success badge');
      assert.strictEqual(session.getMistakes()['m_retry'].resolved, true);
    });

    it('F21.3: In-card retry solving with wrong answer alerts student without revealing key', () => {
      const session = createAppSession();
      session.setStorage(session._getUserKey('ey8_mistakes_v1'), {
        'm_retry': {
          id: 'm_retry',
          question: 'Capital of France?',
          options: ['A. Berlin', 'B. Madrid', 'C. Paris', 'D. Rome'],
          answer: 2, // C. Paris
          resolved: false
        }
      });
      session.navigate('#/mistakes');

      const res = session.retryMistakeCard('m_retry', 0); // Selected Berlin
      assert.strictEqual(res.isCorrect, false);

      const card = session.querySelector('.mistake-card');
      assert.ok(card.classList.contains('wrong-again'), 'Card must have wrong-again class');
      assert.ok(session.getText('.mistake-card').includes('Chưa đúng'), 'Card must prompt retry');
      assert.strictEqual(session.getMistakes()['m_retry'].resolved, false, 'Must remain unresolved');
    });
  });

  // --- FEATURE 22: MISTAKE BATCH PRACTICE MODE ---
  describe('Feature 22: Mistake Batch Practice Mode Invariants', () => {
    it('F22.1: Batch practice enables clearing all resolved mistakes in one operation', () => {
      const session = createAppSession();
      session.setStorage(session._getUserKey('ey8_mistakes_v1'), {
        'm1': { id: 'm1', answer: 0, resolved: true },
        'm2': { id: 'm2', answer: 1, resolved: false },
        'm3': { id: 'm3', answer: 2, resolved: true }
      });

      const cleared = session.clearAllResolvedMistakes();
      assert.strictEqual(cleared, 2, 'Must clear exactly 2 resolved mistakes');

      const remaining = session.getMistakes();
      assert.strictEqual(Object.keys(remaining).length, 1);
      assert.ok(remaining['m2'], 'Unresolved mistake m2 must be preserved');
    });
  });

  // --- FEATURE 23: ADAPTIVE MISTAKE CLEARANCE ---
  describe('Feature 23: Adaptive Mistake Clearance Invariants', () => {
    it('F23.1: Smart Adaptive Quiz prioritizes up to 70% questions from mistake notebook', () => {
      const session = createAppSession();
      // Seed 5 mistakes
      const mistakes = {};
      for (let i = 1; i <= 5; i++) {
        mistakes[`err_${i}`] = {
          id: `err_${i}`,
          question: `Mistake Question ${i}`,
          options: ['A. 1', 'B. 2', 'C. 3', 'D. 4'],
          answer: 0,
          source: 'Unit 1'
        };
      }
      session.setStorage(session._getUserKey('ey8_mistakes_v1'), mistakes);

      // Start 10-question adaptive quiz (70% of 10 = 7, but only 5 mistakes available -> all 5 taken)
      session.startSmartAdaptiveExam(10);
      assert.ok(session.activeExam, 'Adaptive exam must be created');
      assert.strictEqual(session.activeExam.questions.length, 10);

      const adaptiveQuestions = session.activeExam.questions;
      const mistakeIds = new Set(Object.keys(mistakes));
      const mistakesInExam = adaptiveQuestions.filter(q => mistakeIds.has(q.originalQuestionId));
      assert.strictEqual(mistakesInExam.length, 5, 'All 5 available mistakes should be included');
    });

    it('F23.2: Answering a mistake correctly in Smart Adaptive Quiz auto-clears it from notebook', () => {
      const session = createAppSession();
      session.setStorage(session._getUserKey('ey8_mistakes_v1'), {
        'target_err': {
          id: 'target_err',
          question: 'Do you fancy _______ out?',
          options: ['A. hang', 'B. hanging', 'C. to hang', 'D. hung'],
          answer: 1,
          source: 'Unit 1'
        }
      });

      session.startSmartAdaptiveExam(5);
      const targetQ = session.activeExam.questions.find(q => q.originalQuestionId === 'target_err');
      assert.ok(targetQ, 'Target error must be in adaptive exam questions');

      // Answer target question correctly
      session.selectExamAnswer(targetQ.id, targetQ.answer);
      const result = session.submitExam();

      assert.ok(result.resolvedMistakesCount >= 1, 'Should resolve at least 1 mistake');
      const updatedMistakes = session.getMistakes();
      assert.strictEqual(updatedMistakes['target_err'], undefined, 'Resolved mistake must be automatically purged from notebook');
    });

    it('F23.3: Answering a mistake incorrectly in Smart Adaptive Quiz retains it in notebook', () => {
      const session = createAppSession();
      session.setStorage(session._getUserKey('ey8_mistakes_v1'), {
        'persistent_err': {
          id: 'persistent_err',
          question: 'Capital of Japan?',
          options: ['A. Tokyo', 'B. Seoul', 'C. Beijing', 'D. Bangkok'],
          answer: 0,
          source: 'Unit 2'
        }
      });

      session.startSmartAdaptiveExam(5);
      const targetQ = session.activeExam.questions.find(q => q.originalQuestionId === 'persistent_err');
      assert.ok(targetQ);

      // Select wrong answer
      session.selectExamAnswer(targetQ.id, (targetQ.answer + 1) % 4);
      session.submitExam();

      const updatedMistakes = session.getMistakes();
      assert.ok(updatedMistakes['persistent_err'], 'Unresolved mistake must remain in notebook');
    });
  });
});
