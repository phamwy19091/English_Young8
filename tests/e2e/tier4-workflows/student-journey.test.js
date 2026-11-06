/**
 * Tier 4: Real-World Student Workflows
 * End-to-end user journeys replicating authentic student learning sessions:
 * - Journey 1: Comprehensive Unit 1 Daily Study Journey (Dashboard -> Flashcards -> Spelling -> Grammar -> Unit Quiz -> Written)
 * - Journey 2: Exam Preparation & Weakness Remediation Journey (Exam Room -> Timer -> Results -> Mistake Notebook -> Adaptive Exam -> Radar)
 */

import { describe, it, assert } from '../harness/test-engine.js';
import { createAppSession } from '../harness/test-context.js';
import { getUnits, getExams } from '../harness/curriculum-loader.js';

describe('Tier 4: Real-World Student Workflows & User Journeys', () => {

  // --- JOURNEY 1: UNIT 1 DAILY STUDY SESSION ---
  describe('Journey 1: Student Unit 1 Daily Study Session', () => {
    it('W1.1: Complete student study session across Flashcards, Spelling, Quiz, and Written', () => {
      // Step 1: Student arrives at Dashboard
      const session = createAppSession({ username: 'em_mai', role: 'student' });
      session.navigate('#/dashboard');
      assert.ok(session.hasElement('.dashboard-view'));
      assert.ok(session.getText('.hero-welcome').includes('em_mai'));

      // Step 2: Student enters Unit 1 Flashcard Studio
      session.navigate('#/unit/unit-1/vocab');
      assert.ok(session.hasElement('.flashcard-container'));
      const initialCard = session.getCurrentFlashcard();
      assert.ok(initialCard, 'Flashcard must be ready');

      // Student listens to pronunciation
      session.clearSpokenWords();
      session.speakCurrentVocab();
      assert.ok(session.getSpokenWords().length > 0, 'Audio should play');

      // Student flips card to view Vietnamese meaning & exam tips
      session.pressKey(' ');
      assert.strictEqual(session.isCardFlipped, true);

      // Student marks card as learned
      session.pressKey('Enter');
      assert.ok(session.getLearnedVocab().includes(initialCard.id));

      // Step 3: Student engages Active Recall Spelling
      const secondCard = session.getCurrentFlashcard();
      assert.ok(secondCard);
      const spellRes = session.submitSpelling(secondCard.word);
      assert.strictEqual(spellRes.correct, true);
      assert.ok(session.getLearnedVocab().includes(secondCard.id));

      // Step 4: Student solves Unit 1 Multiple Choice Quiz in List mode
      session.activeUnit.quiz.forEach((q, idx) => {
        // Answer 11 correctly, 1 wrong (q0)
        if (idx === 0) {
          session.selectUnitQuizAnswer(q.id, (q.answer + 1) % 4);
        } else {
          session.selectUnitQuizAnswer(q.id, q.answer);
        }
      });

      const quizRes = session.submitUnitQuiz();
      assert.strictEqual(quizRes.correct, 11);
      assert.strictEqual(quizRes.score10, 9.17);
      assert.strictEqual(session.getUnitScores()[1], 9.17);

      // Verify the 1 wrong question is harvested into Mistake Notebook
      const mistakes = session.getMistakes();
      assert.ok(mistakes[session.activeUnit.quiz[0].id]);

      // Step 5: Student solves Written Exercises
      const u1Written = session.activeUnit.writtenExercises;
      const wfEx = u1Written.find(w => w.type === 'word-form');
      const rwEx = u1Written.find(w => w.type === 'rewrite');

      assert.ok(session.submitWrittenExercise(wfEx.id, wfEx.acceptedAnswers[0]));
      assert.ok(session.submitWrittenExercise(rwEx.id, rwEx.acceptedAnswers[0]));

      // Step 6: Session complete: verify progress state
      assert.ok(session.getLearnedVocab().length >= 2);
      assert.strictEqual(session.getUnitScores()[1], 9.17);
    });
  });

  // --- JOURNEY 2: EXAM PREPARATION & WEAKNESS REMEDIATION ---
  describe('Journey 2: Student Exam Preparation & Weakness Remediation', () => {
    it('W1.2: Complete exam room, attempt review, mistake remediation, and adaptive clearance journey', () => {
      const session = createAppSession({ username: 'em_tuan', role: 'student' });

      // Step 1: Student opens Exam Room for 15-Minute Exam 1
      session.startExam('exam-15m-1');
      assert.ok(session.hasElement('.exam-room'));
      assert.strictEqual(session.examSecondsLeft, 15 * 60);

      // Step 2: Student spends 6 minutes and answers questions (10 right, 2 wrong)
      session.advanceExamTimer(360);

      const qList = session.activeExam.questions;
      const wrongQ1 = qList[0];
      const wrongQ2 = qList[1];

      session.selectExamAnswer(wrongQ1.id, (wrongQ1.answer + 1) % 4);
      session.selectExamAnswer(wrongQ2.id, (wrongQ2.answer + 2) % 4);
      qList.slice(2).forEach(q => session.selectExamAnswer(q.id, q.answer));

      // Step 3: Student submits exam
      const examResult = session.submitExam();
      assert.strictEqual(examResult.correct, 10);
      assert.strictEqual(examResult.score10, 8.33);

      // Step 4: Verify attempt recorded in Exam History
      const history = session.getExamHistory();
      assert.strictEqual(history.length, 1);
      assert.strictEqual(history[0].score, 8.33);

      // Step 5: Student reviews Attempt Details ("Soi bài làm")
      const attempt = history[0];
      assert.strictEqual(attempt.answersDetails.length, 12);
      const wrongAudits = attempt.answersDetails.filter(a => !a.isCorrect);
      assert.strictEqual(wrongAudits.length, 2);

      // Step 6: Student navigates to Mistake Notebook
      session.navigate('#/mistakes');
      assert.ok(session.hasElement('.mistakes-view'));
      let mistakes = session.getMistakes();
      assert.ok(mistakes[wrongQ1.id]);
      assert.ok(mistakes[wrongQ2.id]);

      // Student retries wrongQ1 in-card correctly
      const retryRes = session.retryMistakeCard(wrongQ1.id, wrongQ1.answer);
      assert.strictEqual(retryRes.isCorrect, true);

      // Step 7: Student launches Smart Adaptive Exam to clear wrongQ2
      session.startSmartAdaptiveExam(5);
      const adaptiveTarget = session.activeExam.questions.find(q => q.originalQuestionId === wrongQ2.id);
      assert.ok(adaptiveTarget, 'Adaptive exam must draw wrongQ2');

      // Student answers target correctly
      session.selectExamAnswer(adaptiveTarget.id, adaptiveTarget.answer);
      session.activeExam.questions.forEach(q => {
        if (q.id !== adaptiveTarget.id) session.selectExamAnswer(q.id, q.answer);
      });

      const adaptiveRes = session.submitExam();
      assert.ok(adaptiveRes.resolvedMistakesCount >= 1);

      // Step 8: Verify wrongQ2 is cleared from Mistake Notebook
      mistakes = session.getMistakes();
      assert.strictEqual(mistakes[wrongQ2.id], undefined, 'wrongQ2 must be auto-cleared');

      // Step 9: Verify Progress view shows updated streak and history
      session.navigate('#/progress');
      assert.ok(session.hasElement('.progress-view'));
      assert.strictEqual(session.getExamHistory().length, 2);
      assert.strictEqual(session.getStreak(), 1);
    });
  });
});
