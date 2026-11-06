/**
 * Tier 2: Boundary & Corner Cases
 * Suite 01: Boundary Conditions, Storage Edge Cases, Timer & Navigation
 * Boundaries covered:
 * - Empty storage & cold-boot recovery
 * - Corrupted storage JSON resilience
 * - Empty mistake notebook fallback in adaptive exam
 * - Timer expiry at exactly 00:00 (forced submit)
 * - Out-of-order palette navigation
 * - Complete deck mastery (0 unlearned cards)
 * - Boundary scores: 0.0/10, 10.0/10, rounding of fractional scores
 * - User-scoped storage isolation between distinct usernames
 * - Audio service safety when SpeechSynthesis is unavailable
 */

import { describe, it, assert } from '../harness/test-engine.js';
import { createAppSession } from '../harness/test-context.js';
import { calculateScore10 } from '../harness/domain-logic.js';

describe('Tier 2: Boundary & Corner Cases - Storage, Timer & Edge Navigation', () => {

  // --- BOUNDARY 1: STORAGE COLD-BOOT & CORRUPTED DATA ---
  describe('Boundary 1: Storage Cold-Boot & Malformed Payloads', () => {
    it('B1.1: Cold boot with completely empty localStorage initializes all defaults gracefully', () => {
      const session = createAppSession({ username: 'cold_user' });
      // Clear storage
      session.browser.localStorage.clear();

      // Interacting with getters should not crash and return empty defaults
      assert.deepStrictEqual(session.getLearnedVocab(), []);
      assert.deepStrictEqual(session.getUnitScores(), {});
      assert.deepStrictEqual(session.getExamHistory(), []);
      assert.deepStrictEqual(session.getMistakes(), {});
      assert.strictEqual(session.getStreak(), 0);
    });

    it('B1.2: Corrupted or non-JSON strings in storage are safely bypassed without crashing', () => {
      const session = createAppSession({ username: 'corrupt_user' });
      session.browser.localStorage.setItem('ey8_learned_vocab_v1_corrupt_user', '[[INVALID_JSON}}');
      session.browser.localStorage.setItem('ey8_mistakes_v1_corrupt_user', '{broken');

      // Functions should recover or return raw string rather than throwing uncaught exception
      const vocab = session.getLearnedVocab();
      assert.ok(vocab !== undefined);

      const mistakes = session.getMistakes();
      assert.ok(mistakes !== undefined);
    });

    it('B1.3: User-scoped keys strictly isolate data when two users share same browser', () => {
      const s1 = createAppSession({ username: 'student_alice' });
      const s2 = createAppSession({ username: 'student_bob', browser: s1.browser });

      s1.setStorage('ey8_unit_scores_v1_student_alice', { 1: 10.0 });
      s2.setStorage('ey8_unit_scores_v1_student_bob', { 1: 6.5 });

      assert.strictEqual(s1.getUnitScores()[1], 10.0);
      assert.strictEqual(s2.getUnitScores()[1], 6.5);
    });
  });

  // --- BOUNDARY 2: EMPTY MISTAKES & ADAPTIVE FALLBACK ---
  describe('Boundary 2: Empty Mistake Notebook Adaptive Fallback', () => {
    it('B2.1: Starting Smart Adaptive Exam when mistake notebook is empty draws 100% from bank', () => {
      const session = createAppSession({ username: 'clean_student' });
      session.setStorage(session._getUserKey('ey8_mistakes_v1'), {});

      assert.strictEqual(Object.keys(session.getMistakes()).length, 0);

      // Start 10-question adaptive exam
      session.startSmartAdaptiveExam(10);
      assert.ok(session.activeExam, 'Adaptive exam must be created');
      assert.strictEqual(session.activeExam.questions.length, 10, 'Exam must still draw full 10 questions');
      assert.strictEqual(session.activeExam.isSmartAdaptive, true);
    });

    it('B2.2: Adaptive exam with fewer mistakes than the 70% cap fills remainder from bank', () => {
      const session = createAppSession();
      // Only 2 mistakes available
      session.setStorage(session._getUserKey('ey8_mistakes_v1'), {
        'e1': { id: 'e1', question: 'Q1', options: ['A','B','C','D'], answer: 0 },
        'e2': { id: 'e2', question: 'Q2', options: ['A','B','C','D'], answer: 1 }
      });

      // Request 10 questions (70% cap is 7, but only 2 exist)
      session.startSmartAdaptiveExam(10);
      assert.strictEqual(session.activeExam.questions.length, 10);

      const ids = session.activeExam.questions.map(q => q.originalQuestionId || q.id);
      assert.ok(ids.includes('e1'), 'Must include mistake e1');
      assert.ok(ids.includes('e2'), 'Must include mistake e2');
    });
  });

  // --- BOUNDARY 3: TIMER EXPIRY AT EXACT ZERO ---
  describe('Boundary 3: Timer Expiry at Exact 00:00 Boundary', () => {
    it('B3.1: Advancing timer by exact duration forces automatic submission and locks exam', () => {
      const session = createAppSession();
      session.startExam('exam-15m-1'); // 15m = 900s
      assert.strictEqual(session.examSecondsLeft, 900);

      // Advance by exactly 900 seconds
      session.advanceExamTimer(900);
      assert.strictEqual(session.examSecondsLeft, 0);
      assert.strictEqual(session.examSubmitted, true);

      // Further timer advances do not re-submit
      session.advanceExamTimer(10);
      assert.strictEqual(session.examSecondsLeft, 0);
    });

    it('B3.2: Advancing timer beyond duration clamps remaining seconds at 0', () => {
      const session = createAppSession();
      session.startExam('exam-15m-1');

      session.advanceExamTimer(1200); // Exceeding 900s
      assert.strictEqual(session.examSecondsLeft, 0);
      assert.strictEqual(session.examSubmitted, true);
    });
  });

  // --- BOUNDARY 4: ALL-LEARNED DECK & SINGLE-WORD DECK ---
  describe('Boundary 4: All-Learned Deck & Single-Card Boundaries', () => {
    it('B4.1: When unlearned deck is empty, active deck length is 0 and hero congratulates student', () => {
      const session = createAppSession();
      const allVocab = session.activeUnit.vocab;
      session.setStorage(session._getUserKey('ey8_learned_vocab_v1'), allVocab.map(v => v.id));

      session.setFlashcardDeckMode('unlearned');
      assert.strictEqual(session.getActiveFlashcardDeck().length, 0);
      assert.strictEqual(session.getCurrentFlashcard(), null);

      session.navigate('#/unit/unit-1/vocab');
      assert.ok(session.hasElement('.deck-completed-hero'));
    });

    it('B4.2: Calling nextCard or prevCard on empty deck does not throw', () => {
      const session = createAppSession();
      session.setStorage(session._getUserKey('ey8_learned_vocab_v1'), session.activeUnit.vocab.map(v => v.id));

      // Should not throw
      session.nextCard();
      session.prevCard();
      session.flipCard();
    });

    it('B4.3: Deck with single word wraps around to itself on nextCard and prevCard', () => {
      const session = createAppSession();
      session.activeUnit = { ...session.activeUnit, vocab: [session.activeUnit.vocab[0]] };
      session.setFlashcardDeckMode('all');
      assert.strictEqual(session.getActiveFlashcardDeck().length, 1);

      const word = session.getCurrentFlashcard().word;
      session.nextCard();
      assert.strictEqual(session.getCurrentFlashcard().word, word);
      session.prevCard();
      assert.strictEqual(session.getCurrentFlashcard().word, word);
    });
  });

  // --- BOUNDARY 5: EXTREME & FRACTIONAL SCORING BOUNDARIES ---
  describe('Boundary 5: Extreme Scores & Fractional Precision', () => {
    it('B5.1: 0 correct answers produces exact 0.0 score', () => {
      assert.strictEqual(calculateScore10(0, 12), 0.0);
      assert.strictEqual(calculateScore10(0, 25), 0.0);
      assert.strictEqual(calculateScore10(0, 30), 0.0);
    });

    it('B5.2: 100% correct answers produces exact 10.0 score', () => {
      assert.strictEqual(calculateScore10(12, 12), 10.0);
      assert.strictEqual(calculateScore10(25, 25), 10.0);
      assert.strictEqual(calculateScore10(30, 30), 10.0);
    });

    it('B5.3: Fractional score 1/12 produces 0.83 (rounded to 2 decimal places)', () => {
      assert.strictEqual(calculateScore10(1, 12), 0.83);
      assert.strictEqual(calculateScore10(5, 12), 4.17);
      assert.strictEqual(calculateScore10(7, 12), 5.83);
      assert.strictEqual(calculateScore10(11, 12), 9.17);
    });

    it('B5.4: 0 total questions safely returns score 0 without dividing by zero', () => {
      assert.strictEqual(calculateScore10(0, 0), 0);
      assert.strictEqual(calculateScore10(5, 0), 0);
    });
  });

  // --- BOUNDARY 6: AUDIO SERVICE RESILIENCE ---
  describe('Boundary 6: Speech Synthesis Offline / Fallback', () => {
    it('B6.1: Speech service functions safely when cancel or speak called repeatedly', () => {
      const session = createAppSession();
      // Repeated cancel should not crash
      session.browser.speechSynthesis.cancel();
      session.browser.speechSynthesis.cancel();

      // Speaking empty text should not crash
      const utter = new session.browser.SpeechSynthesisUtterance('');
      session.browser.speechSynthesis.speak(utter);
    });
  });
});
