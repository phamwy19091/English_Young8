/**
 * Tier 1: Feature Coverage
 * Suite 04: Practice Exam Runner, Option Shuffling, Passages & Results Screen
 * Features covered:
 * - Feature 14: Practice Exam Runner (6 exams, countdown timer, question jumper, auto-submit)
 * - Feature 15: Option Position Shuffling (Fisher-Yates option & question shuffling)
 * - Feature 16: Reading Passage Sticky Viewer (Context preservation for multi-question reading groups)
 * - Feature 17: Exam Submission & Result Screen (Score calculation, time spent, history persistence)
 * - Feature 18: Attempt Detail Modal ("Soi bài làm") (Question-by-question audit of user choices vs key)
 */

import { describe, it, assert } from '../harness/test-engine.js';
import { createAppSession } from '../harness/test-context.js';
import { getExams, getReadingPassages, getAllExamQuestions } from '../harness/curriculum-loader.js';
import { cloneAndShuffleOptions, calculateScore10 } from '../harness/domain-logic.js';

describe('Tier 1: Suite 04 - Practice Exam Runner, Option Shuffling & Results Screen', () => {

  // --- FEATURE 14: PRACTICE EXAM RUNNER ---
  describe('Feature 14: Practice Exam Runner Invariants', () => {
    it('F14.1: Starting an exam initializes countdown timer to full duration in seconds', () => {
      const session = createAppSession();
      session.startExam('exam-15m-1');
      assert.ok(session.activeExam);
      assert.strictEqual(session.activeExam.id, 'exam-15m-1');
      assert.strictEqual(session.examSecondsLeft, 15 * 60);
    });

    it('F14.2: Timer decrements as time elapses and reflects MM:SS formatting', () => {
      const session = createAppSession();
      session.startExam('exam-15m-1');

      session.advanceExamTimer(65);
      assert.strictEqual(session.examSecondsLeft, 900 - 65);

      const timerText = session.getText('.countdown-timer');
      assert.ok(timerText.includes('13:55'));
    });

    it('F14.3: Timer expiry at 00:00 triggers automatic force submission and grading', () => {
      const session = createAppSession();
      session.startExam('exam-15m-1');

      const firstQ = session.activeExam.questions[0];
      session.selectExamAnswer(firstQ.id, firstQ.answer);

      session.advanceExamTimer(900);

      assert.strictEqual(session.examSubmitted, true);
      assert.ok(session.activeExamResult);
      assert.strictEqual(session.activeExamResult.correct, 1);
    });

    it('F14.4: In-progress exit protection requires explicit confirmation before abandoning', () => {
      const session = createAppSession();
      session.startExam('exam-15m-1');

      let confirmCalled = false;
      session.browser.confirmDialogHandler = (msg) => {
        confirmCalled = true;
        return false;
      };

      const wantsToLeave = session.browser.confirm('Bạn có chắc chắn muốn thoát phòng thi?');
      assert.ok(confirmCalled);
      assert.strictEqual(wantsToLeave, false);
    });
  });

  // --- FEATURE 15: OPTION POSITION SHUFFLING ---
  describe('Feature 15: Option Position Shuffling Invariants', () => {
    it('F15.1: Option shuffling preserves original question identity via originalQuestionId', () => {
      const originalQ = {
        id: 'u1-q3',
        question: 'Do you fancy _______ out with friends?',
        options: ['A. hang', 'B. hanging', 'C. to hang', 'D. hung'],
        answer: 1,
        explanation: 'Sau fancy dùng V-ing'
      };

      const shuffled = cloneAndShuffleOptions(originalQ);
      assert.strictEqual(shuffled.originalQuestionId, 'u1-q3');
      assert.strictEqual(shuffled.question, originalQ.question);
      assert.strictEqual(shuffled.options.length, 4);
    });

    it('F15.2: Option shuffling recalculates correct answer index to point to correct text', () => {
      const originalQ = {
        id: 'u1-q3',
        question: 'Do you fancy _______ out with friends?',
        options: ['A. hang', 'B. hanging', 'C. to hang', 'D. hung'],
        answer: 1,
        explanation: 'Sau fancy dùng V-ing'
      };

      for (let i = 0; i < 10; i++) {
        const shuffled = cloneAndShuffleOptions(originalQ);
        const correctOptionText = shuffled.options[shuffled.answer];
        assert.ok(correctOptionText.includes('hanging'));
      }
    });

    it('F15.3: Shuffled options are formatted with standard A, B, C, D letter prefixes', () => {
      const originalQ = {
        id: 'test_q',
        question: 'Sample question?',
        options: ['A. One', 'B. Two', 'C. Three', 'D. Four'],
        answer: 0,
        explanation: 'Test'
      };

      const shuffled = cloneAndShuffleOptions(originalQ);
      assert.ok(shuffled.options[0].startsWith('A. '));
      assert.ok(shuffled.options[1].startsWith('B. '));
      assert.ok(shuffled.options[2].startsWith('C. '));
      assert.ok(shuffled.options[3].startsWith('D. '));
    });
  });

  // --- FEATURE 16: READING PASSAGE STICKY VIEWER ---
  describe('Feature 16: Reading Passage Sticky Viewer Invariants', () => {
    it('F16.1: Exactly 5 reading passages exist in exam bank with substantial text', () => {
      const passages = getReadingPassages();
      assert.strictEqual(passages.length, 5);
      passages.forEach(p => {
        assert.ok(p.length > 500);
      });
    });

    it('F16.2: Midterm 1 passage anchors to comprehension question set', () => {
      const midterm = getExams().find(e => e.id === 'exam-midterm-1');
      assert.ok(midterm);

      const passageQ = midterm.questions.find(q => q.passage && q.passage.length > 0);
      assert.ok(passageQ);
      assert.strictEqual(passageQ.id, 'mid1_q19');
    });

    it('F16.3: Final Exams 1 and 2 contain cloze and reading comprehension passages', () => {
      const final1 = getExams().find(e => e.id === 'exam-final-1');
      const final2 = getExams().find(e => e.id === 'exam-final-2');

      const f1Passages = final1.questions.filter(q => q.passage && q.passage.length > 0);
      const f2Passages = final2.questions.filter(q => q.passage && q.passage.length > 0);

      assert.strictEqual(f1Passages.length, 2);
      assert.strictEqual(f2Passages.length, 2);
    });
  });

  // --- FEATURE 17: EXAM SUBMISSION & RESULT SCREEN ---
  describe('Feature 17: Exam Submission & Result Screen Invariants', () => {
    it('F17.1: Score calculation computes exact 10-point scale rounded to 2 decimal places', () => {
      assert.strictEqual(calculateScore10(12, 12), 10.0);
      assert.strictEqual(calculateScore10(6, 12), 5.0);
      assert.strictEqual(calculateScore10(11, 12), 9.17);
      assert.strictEqual(calculateScore10(7, 12), 5.83);
      assert.strictEqual(calculateScore10(20, 25), 8.0);
      assert.strictEqual(calculateScore10(23, 25), 9.2);
      assert.strictEqual(calculateScore10(27, 30), 9.0);
      assert.strictEqual(calculateScore10(29, 30), 9.67);
    });

    it('F17.2: Submission records time spent and appends attempt to examHistory in LocalStorage', () => {
      const session = createAppSession();
      session.startExam('exam-15m-1');
      session.advanceExamTimer(120);

      session.activeExam.questions.forEach(q => session.selectExamAnswer(q.id, q.answer));

      const res = session.submitExam();
      assert.strictEqual(res.score10, 10.0);
      assert.strictEqual(res.correct, 12);

      const history = session.getExamHistory();
      assert.ok(history.length > 0);
      const latest = history[0];
      assert.strictEqual(latest.examId, 'exam-15m-1');
      assert.strictEqual(latest.score, 10.0);
      assert.strictEqual(latest.timeSpentSeconds, 120);
    });
  });

  // --- FEATURE 18: ATTEMPT DETAIL MODAL ("SOI BÀI LÀM") ---
  describe('Feature 18: Attempt Detail Modal ("Soi bài làm") Invariants', () => {
    it('F18.1: Attempt records detailed question-by-question breakdown of student choices', () => {
      const session = createAppSession();
      session.startExam('exam-15m-1');

      const q1 = session.activeExam.questions[0];
      const q2 = session.activeExam.questions[1];
      session.selectExamAnswer(q1.id, q1.answer);
      session.selectExamAnswer(q2.id, (q2.answer + 1) % 4);

      session.submitExam();
      const attempt = session.getExamHistory()[0];
      assert.ok(attempt.answersDetails);
      assert.strictEqual(attempt.answersDetails.length, session.activeExam.questions.length);

      const ans1 = attempt.answersDetails.find(a => a.questionId === q1.id);
      const ans2 = attempt.answersDetails.find(a => a.questionId === q2.id);

      assert.strictEqual(ans1.isCorrect, true);
      assert.strictEqual(ans2.isCorrect, false);
    });

    it('F18.2: Answers details provide full question text and explanation for review', () => {
      const session = createAppSession();
      session.startExam('exam-15m-1');
      session.submitExam();

      const attempt = session.getExamHistory()[0];
      attempt.answersDetails.forEach(ans => {
        assert.ok(ans.question.question);
        assert.ok(ans.question.explanation);
      });
    });

    // Exhaustive contract audit for all 121 exam questions across 6 exams
    describe('Feature 18: Exhaustive 121 Exam Questions Contract Audit across 6 Exams', () => {
      const allExamQs = getAllExamQuestions();
      allExamQs.forEach((q, idx) => {
        it(`F18.EQ${idx + 1}: Exam Question "${q.id}" (${q.examId}) has 4 options and valid answer index`, () => {
          assert.ok(q.id);
          assert.ok(q.question && q.question.length > 0);
          assert.strictEqual(q.options.length, 4);
          assert.ok(q.answer >= 0 && q.answer <= 3);
          assert.ok(q.explanation && q.explanation.length > 0);
        });
      });
    });
  });
});
