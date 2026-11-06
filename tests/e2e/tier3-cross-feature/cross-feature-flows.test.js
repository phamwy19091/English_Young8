/**
 * Tier 3: Cross-Feature Combinations
 * Comprehensive integration flows spanning multiple functional modules:
 * - Flow 1: Quiz Error -> Mistake Notebook -> In-Card Retry -> Adaptive Quiz -> Auto-Clearance -> Streak Update
 * - Flow 2: Flashcards -> Safe Marking -> Unlearned Deck Filter -> Spelling Mastery -> Vocab State
 * - Flow 3: Timed Exam -> Attempt Review -> 5-Skill Radar -> Admin Monitor -> Homework Auto-Completion
 */

import { describe, it, assert } from '../harness/test-engine.js';
import { createAppSession } from '../harness/test-context.js';
import { compute5SkillRadar } from '../harness/domain-logic.js';

describe('Tier 3: Cross-Feature Combinations', () => {

  // --- FLOW 1: ERROR RECOVERY & REMEDIATION LIFECYCLE ---
  describe('Flow 1: Quiz Error -> Mistake Notebook -> In-Card Retry -> Adaptive Exam -> Auto-Clearance -> Streak', () => {
    it('C1.1: Complete mistake remediation lifecycle from harvesting through adaptive clearance and streak accrual', () => {
      const session = createAppSession({ username: 'em_lan' });

      // Step 1: Student takes Unit 1 Quiz and makes 2 errors (q1 and q2)
      const q1 = session.activeUnit.quiz[0]; // u1-q1
      const q2 = session.activeUnit.quiz[1]; // u1-q2
      session.selectUnitQuizAnswer(q1.id, (q1.answer + 1) % 4);
      session.selectUnitQuizAnswer(q2.id, (q2.answer + 2) % 4);
      // Answer remainder correctly
      session.activeUnit.quiz.slice(2).forEach(q => session.selectUnitQuizAnswer(q.id, q.answer));

      const quizResult = session.submitUnitQuiz();
      assert.strictEqual(quizResult.correct, 10);
      assert.strictEqual(quizResult.score10, 8.33);

      // Step 2: Verify mistakes are collected in notebook
      let mistakes = session.getMistakes();
      assert.ok(mistakes[q1.id], 'u1-q1 must be in mistake notebook');
      assert.ok(mistakes[q2.id], 'u1-q2 must be in mistake notebook');
      assert.strictEqual(Object.keys(mistakes).length, 2);

      // Step 3: Student opens Mistake Notebook and retries q1 in-card correctly
      session.navigate('#/mistakes');
      const retryResult = session.retryMistakeCard(q1.id, q1.answer);
      assert.strictEqual(retryResult.isCorrect, true);
      assert.strictEqual(session.getMistakes()[q1.id].resolved, true);

      // Step 4: Student starts Smart Adaptive Exam to remediate remaining errors
      session.startSmartAdaptiveExam(5);
      assert.strictEqual(session.activeExam.isSmartAdaptive, true);

      // Verify q2 is included in adaptive exam
      const targetQ = session.activeExam.questions.find(q => q.originalQuestionId === q2.id);
      assert.ok(targetQ, 'u1-q2 must be prioritized into adaptive exam');

      // Step 5: Student answers targetQ correctly
      session.selectExamAnswer(targetQ.id, targetQ.answer);
      // Answer others
      session.activeExam.questions.forEach(q => {
        if (q.id !== targetQ.id) session.selectExamAnswer(q.id, q.answer);
      });

      const examResult = session.submitExam();
      assert.ok(examResult.resolvedMistakesCount >= 1, 'Adaptive exam must resolve target mistake');

      // Step 6: Verify q2 is automatically purged from mistake notebook
      mistakes = session.getMistakes();
      assert.strictEqual(mistakes[q2.id], undefined, 'q2 must be automatically cleared from notebook');

      // Step 7: Verify student study streak is updated
      const streak = session.getStreak();
      assert.ok(streak >= 1, 'Streak must be updated after exam completion');
    });
  });

  // --- FLOW 2: FLASHCARD STUDY & SPELLING MASTERY LIFECYCLE ---
  describe('Flow 2: Flashcards -> Safe Marking -> Deck Filter -> Spelling Studio -> Mastery Sync', () => {
    it('C2.1: Flashcard mastery updates unlearned deck and spelling challenge reflects progress', () => {
      const session = createAppSession({ username: 'em_quang' });
      session.navigate('#/unit/unit-1/vocab');

      const initialDeck = session.getActiveFlashcardDeck();
      const initialCount = initialDeck.length; // 15 words
      assert.strictEqual(initialCount, 15);

      // Step 1: Student studies flashcards and marks 2 words as learned
      const word1 = initialDeck[0];
      const word2 = initialDeck[1];
      session.markFlashcardLearned(word1.id);
      session.markFlashcardLearned(word2.id);

      // Step 2: In unlearned deck mode, only 13 words remain
      session.setFlashcardDeckMode('unlearned');
      const unlearnedDeck = session.getActiveFlashcardDeck();
      assert.strictEqual(unlearnedDeck.length, 13);
      assert.ok(!unlearnedDeck.some(w => w.id === word1.id));
      assert.ok(!unlearnedDeck.some(w => w.id === word2.id));

      // Step 3: Student engages Active Recall Spelling for the 3rd word
      const word3 = unlearnedDeck[0];
      const spellResult = session.submitSpelling(word3.word);
      assert.strictEqual(spellResult.correct, true);

      // Step 4: Successful spelling automatically marks word3 as learned
      const updatedLearned = session.getLearnedVocab();
      assert.ok(updatedLearned.includes(word3.id), 'Word 3 must be marked learned');

      // Step 5: Unlearned deck now has 12 words
      const finalUnlearned = session.getActiveFlashcardDeck();
      assert.strictEqual(finalUnlearned.length, 12);

      // Step 6: Switching to 'all' deck displays full 15 words
      session.setFlashcardDeckMode('all');
      assert.strictEqual(session.getActiveFlashcardDeck().length, 15);
    });
  });

  // --- FLOW 3: TIMED EXAM -> 5-SKILL RADAR -> ADMIN OVERSIGHT & ASSIGNMENT ---
  describe('Flow 3: Timed Exam -> Attempt Inspection -> 5-Skill Radar -> Admin Monitor & Assignment', () => {
    it('C3.1: Exam attempt propagates to 5-skill radar, admin monitor, and homework completion', () => {
      // Create shared browser instance to simulate student and teacher interacting
      const studentSession = createAppSession({ username: 'em_lop8', role: 'student' });
      const adminSession = createAppSession({
        username: 'admin',
        role: 'admin',
        browser: studentSession.browser
      });

      // Step 1: Admin creates Homework Assignment for em_lop8 (Exam 15m 1, minScore 8.0)
      const asg = adminSession.createAssignment({
        studentUsername: 'em_lop8',
        targetExamId: 'exam-15m-1',
        title: 'Bắt buộc: Luyện Đề 15 Phút Số 1 (≥ 8.0đ)',
        minScore: 8.0
      });
      assert.strictEqual(asg.status, 'pending');

      // Step 2: Student starts Exam 15m 1
      studentSession.startExam('exam-15m-1');
      studentSession.advanceExamTimer(300); // 5 minutes spent

      // Student answers 10/12 correctly = 8.33
      studentSession.activeExam.questions.forEach((q, idx) => {
        if (idx < 10) studentSession.selectExamAnswer(q.id, q.answer);
        else studentSession.selectExamAnswer(q.id, (q.answer + 1) % 4);
      });

      const examRes = studentSession.submitExam();
      assert.strictEqual(examRes.correct, 10);
      assert.strictEqual(examRes.score10, 8.33);

      // Step 3: Assignment status automatically updates to completed!
      const studentAssignments = studentSession.getAssignments();
      const targetAsg = studentAssignments.find(a => a.id === asg.id);
      assert.strictEqual(targetAsg.status, 'completed', 'Assignment must be marked completed');
      assert.strictEqual(targetAsg.achievedScore, 8.33);

      // Step 4: 5-Skill competency radar updates with detailed metrics
      const history = studentSession.getExamHistory();
      const radar = compute5SkillRadar(history);
      assert.ok(radar.pronunciation.total > 0 || radar.grammar.total > 0);

      // Step 5: Admin inspects student progress in Admin Monitor
      adminSession.selectedStudentUsername = 'em_lop8';
      const remoteHistory = adminSession.getStorage('ey8_exam_history_v1_em_lop8');
      assert.strictEqual(remoteHistory.length, 1);
      assert.strictEqual(remoteHistory[0].score, 8.33);

      // Step 6: Admin can inspect question-by-question attempt details
      const attemptDetails = remoteHistory[0].answersDetails;
      assert.strictEqual(attemptDetails.length, 12);
      const correctAnswers = attemptDetails.filter(a => a.isCorrect);
      assert.strictEqual(correctAnswers.length, 10);
    });
  });
});
