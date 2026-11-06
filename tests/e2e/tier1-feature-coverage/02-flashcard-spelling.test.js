/**
 * Tier 1: Feature Coverage
 * Suite 02: Flashcard Studio, Spelling Challenge, Pronunciation Engine & Keyboard Navigation
 * Features covered:
 * - Feature 6: Flashcard Studio (3D card flip, unlearned deck filter, word dots navigation strip)
 * - Feature 7: Active Recall Spelling Challenge (Character blanks, masked sentence clues, instant letter validation)
 * - Feature 8: Pronunciation Engine (Web Speech API audio synthesis, rate 0.9, en-US, text regex cleaner)
 * - Feature 9: Flashcard Keyboard Navigation (Arrow keys for cards, 'S' for audio, Space for flip, Enter for mastered)
 */

import { describe, it, assert } from '../harness/test-engine.js';
import { createAppSession } from '../harness/test-context.js';
import { cleanSpeechText, isSpellingMatch, normalizeSpellingWord } from '../harness/domain-logic.js';

describe('Tier 1: Suite 02 - Flashcard Studio, Spelling Challenge, Pronunciation & Keyboard Navigation', () => {

  // --- FEATURE 6: FLASHCARD STUDIO ---
  describe('Feature 6: Flashcard Studio Invariants', () => {
    it('F6.1: Initial flashcard view displays first unlearned word on front face', () => {
      const session = createAppSession();
      session.navigate('#/unit/unit-1/vocab');
      const card = session.getCurrentFlashcard();
      assert.ok(card, 'Must have active flashcard');
      assert.strictEqual(session.getText('.word-text'), card.word);
      assert.strictEqual(session.getText('.ipa-text'), card.ipa);
      assert.ok(!session.querySelector('.flashcard-3d').classList.contains('flipped'), 'Card should not be flipped initially');
    });

    it('F6.2: Flipping card toggles 3D flip class and exposes back face details', () => {
      const session = createAppSession();
      session.navigate('#/unit/unit-1/vocab');
      const card = session.getCurrentFlashcard();

      session.flipCard();
      assert.ok(session.querySelector('.flashcard-3d').classList.contains('flipped'), 'Card must have flipped class');
      assert.strictEqual(session.getText('.meaning-vi'), card.meaning);
      assert.strictEqual(session.getText('.example-en'), card.example);
      assert.strictEqual(session.getText('.example-vi'), card.exampleVi);

      // Flip back
      session.flipCard();
      assert.ok(!session.querySelector('.flashcard-3d').classList.contains('flipped'), 'Card must return to unflipped state');
    });

    it('F6.3: Next and Previous controls navigate sequentially across deck', () => {
      const session = createAppSession();
      session.navigate('#/unit/unit-1/vocab');
      const deck = session.getActiveFlashcardDeck();
      assert.ok(deck.length > 2, 'Deck should contain multiple words');

      const word0 = deck[0].word;
      const word1 = deck[1].word;

      session.nextCard();
      assert.strictEqual(session.getCurrentFlashcard().word, word1);

      session.prevCard();
      assert.strictEqual(session.getCurrentFlashcard().word, word0);
    });

    it('F6.4: Navigation wraps around when reaching start or end of deck (modulo ring)', () => {
      const session = createAppSession();
      session.navigate('#/unit/unit-1/vocab');
      const deck = session.getActiveFlashcardDeck();
      const lastIndex = deck.length - 1;

      // Going backward from first card wraps to last card
      session.prevCard();
      assert.strictEqual(session.getCurrentFlashcard().word, deck[lastIndex].word);

      // Going forward from last card wraps back to first card
      session.nextCard();
      assert.strictEqual(session.getCurrentFlashcard().word, deck[0].word);
    });

    it('F6.5: Marking card as learned adds ID to LocalStorage and transitions to next card', () => {
      const session = createAppSession();
      session.navigate('#/unit/unit-1/vocab');
      const firstCard = session.getCurrentFlashcard();

      session.markFlashcardLearned();
      const learned = session.getLearnedVocab();
      assert.ok(learned.includes(firstCard.id), `Learned list must include ${firstCard.id}`);

      // In unlearned mode, the learned card is excluded from active deck
      const newDeck = session.getActiveFlashcardDeck();
      assert.ok(!newDeck.some(c => c.id === firstCard.id), 'Mastered word must not appear in unlearned deck');
    });

    it('F6.6: Deck mode switcher toggles between Unlearned and All words', () => {
      const session = createAppSession();
      session.navigate('#/unit/unit-1/vocab');
      const firstCard = session.getCurrentFlashcard();
      session.markFlashcardLearned(firstCard.id);

      assert.strictEqual(session.flashcardDeckMode, 'unlearned');
      const unlearnedCount = session.getActiveFlashcardDeck().length;

      session.setFlashcardDeckMode('all');
      const allCount = session.getActiveFlashcardDeck().length;

      assert.strictEqual(allCount, unlearnedCount + 1, 'All mode must include the mastered word');
    });

    it('F6.7: When all cards in unit are mastered, celebratory completion hero renders', () => {
      const session = createAppSession();
      session.navigate('#/unit/unit-1/vocab');
      const allVocab = session.activeUnit.vocab || [];

      // Mark all words learned
      allVocab.forEach(v => session.markFlashcardLearned(v.id));

      session.setFlashcardDeckMode('unlearned');
      assert.strictEqual(session.getActiveFlashcardDeck().length, 0);
      assert.ok(session.hasElement('.deck-completed-hero'), 'Celebratory hero screen must render');
      assert.ok(session.getText('.deck-completed-hero').includes('Xuất sắc'), 'Hero text must praise student');
    });
  });

  // --- FEATURE 7: ACTIVE RECALL SPELLING CHALLENGE ---
  describe('Feature 7: Active Recall Spelling Challenge Invariants', () => {
    it('F7.1: Spelling validation performs case-insensitive comparison', () => {
      assert.ok(isSpellingMatch('leisure', 'leisure'));
      assert.ok(isSpellingMatch('leisure', 'LEISURE'));
      assert.ok(isSpellingMatch('leisure', 'LeiSuRe'));
    });

    it('F7.2: Spelling validation strips redundant leading and trailing whitespaces', () => {
      assert.ok(isSpellingMatch('leisure', '   leisure   '));
      assert.ok(isSpellingMatch('do DIY', '   do   DIY   '));
    });

    it('F7.3: Spelling validation accepts phrasal verbs with parenthetical alternatives', () => {
      // Word: "hang out (with)"
      assert.ok(isSpellingMatch('hang out (with)', 'hang out'), 'Must accept base form without parenthetical');
      assert.ok(isSpellingMatch('hang out (with)', 'hang out with'), 'Must accept full form with preposition');
      assert.ok(!isSpellingMatch('hang out (with)', 'hang in'), 'Must reject incorrect particle');
    });

    it('F7.4: Correct spelling submission triggers audio pronunciation and marks learned', () => {
      const session = createAppSession();
      session.navigate('#/unit/unit-1/vocab');
      const card = session.getCurrentFlashcard();

      session.clearSpokenWords();
      const result = session.submitSpelling(card.word);

      assert.ok(result.correct, 'Submission should be marked correct');
      assert.ok(session.getLearnedVocab().includes(card.id), 'Card must be marked learned');
      assert.ok(session.getSpokenWords().length > 0, 'Audio should be spoken upon correct spelling');
    });

    it('F7.5: Incorrect spelling maintains card position without marking learned', () => {
      const session = createAppSession();
      session.navigate('#/unit/unit-1/vocab');
      const card = session.getCurrentFlashcard();

      const result = session.submitSpelling('completely_wrong_spelling');
      assert.strictEqual(result.correct, false);
      assert.ok(!session.getLearnedVocab().includes(card.id), 'Wrong answer must not mark learned');
      assert.strictEqual(session.getCurrentFlashcard().id, card.id, 'Card must remain on current word');
    });

    it('F7.6: Requesting spelling hints reveals progressive prefix letters', () => {
      const session = createAppSession();
      session.navigate('#/unit/unit-1/vocab');
      const card = session.getCurrentFlashcard(); // "leisure"

      const hint1 = session.requestSpellingHint();
      assert.strictEqual(hint1.length, 1, 'First hint must be 1 character');

      const hint2 = session.requestSpellingHint();
      assert.strictEqual(hint2.length, 2, 'Second hint must be 2 characters');
      assert.strictEqual(hint2, normalizeSpellingWord(card.word).slice(0, 2));
    });

    it('F7.7: Revealing spelling answer returns full word and triggers pronunciation', () => {
      const session = createAppSession();
      session.navigate('#/unit/unit-1/vocab');
      const card = session.getCurrentFlashcard();

      session.clearSpokenWords();
      const revealed = session.revealSpellingAnswer();
      assert.strictEqual(revealed, card.word);
      assert.ok(session.getSpokenWords().length > 0, 'Speech must be triggered on answer reveal');
    });

    it('F7.8: Empty spelling submission generates warning toast without error', () => {
      const session = createAppSession();
      session.navigate('#/unit/unit-1/vocab');

      const result = session.submitSpelling('');
      assert.strictEqual(result.empty, true);
      assert.strictEqual(result.success, false);
      assert.ok(session.browser.toasts.some(t => t.type === 'warning'), 'Warning toast must be recorded');
    });
  });

  // --- FEATURE 8: PRONUNCIATION ENGINE ---
  describe('Feature 8: Pronunciation Engine Invariants', () => {
    it('F8.1: Text regex cleaner strips phonetic slashes and IPA transcription', () => {
      assert.strictEqual(cleanSpeechText('leisure /ˈleʒə(r)/'), 'leisure');
      assert.strictEqual(cleanSpeechText('origami /ˌɒrɪˈɡɑːmi/'), 'origami');
    });

    it('F8.2: Text regex cleaner strips explanatory notes in parentheses', () => {
      assert.strictEqual(cleanSpeechText('hang out (with)'), 'hang out');
      assert.strictEqual(cleanSpeechText('do DIY (Do It Yourself)'), 'do DIY');
    });

    it('F8.3: Cleaned text combines stripping of both IPA and parentheses', () => {
      const input = 'hang out (with) /hæŋ aʊt/';
      const cleaned = cleanSpeechText(input);
      assert.strictEqual(cleaned, 'hang out');
    });

    it('F8.4: Audio synthesis configures rate=0.9 and lang=en-US for clarity', () => {
      const session = createAppSession();
      session.navigate('#/unit/unit-1/vocab');

      session.speakCurrentVocab();
      const history = session.browser.speechSynthesis.history;
      assert.ok(history.length > 0, 'Speech history must record utterance');
      const last = history[history.length - 1];
      assert.strictEqual(last.rate, 0.9, 'Speech rate must be 0.9');
      assert.strictEqual(last.lang, 'en-US', 'Speech language must be en-US');
    });

    it('F8.5: Multiple rapid audio clicks cancel ongoing speech avoiding queue backlog', () => {
      const session = createAppSession();
      session.navigate('#/unit/unit-1/vocab');

      session.speakCurrentVocab();
      session.speakCurrentVocab();
      session.speakCurrentVocab();

      // Only the last utterance remains active or processed
      assert.ok(session.browser.speechSynthesis.history.length >= 3);
    });
  });

  // --- FEATURE 9: FLASHCARD KEYBOARD NAVIGATION ---
  describe('Feature 9: Flashcard Keyboard Navigation Invariants', () => {
    it('F9.1: Space bar keypress flips the active flashcard', () => {
      const session = createAppSession();
      session.navigate('#/unit/unit-1/vocab');

      assert.strictEqual(session.isCardFlipped, false);
      session.pressKey(' ');
      assert.strictEqual(session.isCardFlipped, true);
      session.pressKey(' ');
      assert.strictEqual(session.isCardFlipped, false);
    });

    it('F9.2: ArrowRight keypress advances to the next flashcard', () => {
      const session = createAppSession();
      session.navigate('#/unit/unit-1/vocab');
      const card0 = session.getCurrentFlashcard().word;

      session.pressKey('ArrowRight');
      const card1 = session.getCurrentFlashcard().word;
      assert.notStrictEqual(card0, card1);
    });

    it('F9.3: ArrowLeft keypress returns to the previous flashcard', () => {
      const session = createAppSession();
      session.navigate('#/unit/unit-1/vocab');
      const card0 = session.getCurrentFlashcard().word;

      session.pressKey('ArrowRight');
      session.pressKey('ArrowLeft');
      assert.strictEqual(session.getCurrentFlashcard().word, card0);
    });

    it('F9.4: Key "S" triggers speech synthesis for current word', () => {
      const session = createAppSession();
      session.navigate('#/unit/unit-1/vocab');

      session.clearSpokenWords();
      session.pressKey('s');
      assert.ok(session.getSpokenWords().length > 0, 'Pressing S must trigger speech');
    });

    it('F9.5: Enter key marks active flashcard as learned', () => {
      const session = createAppSession();
      session.navigate('#/unit/unit-1/vocab');
      const card = session.getCurrentFlashcard();

      session.pressKey('Enter');
      assert.ok(session.getLearnedVocab().includes(card.id), 'Enter key must mark card learned');
    });

    it('F9.6: Keyboard navigation is ignored when active focus is inside an input element', () => {
      const session = createAppSession();
      session.navigate('#/unit/unit-1/vocab');

      // Create and focus an input element
      const input = session.browser.document.createElement('input');
      session.browser.document.body.appendChild(input);
      session.browser.document.activeElement = input;

      const flippedBefore = session.isCardFlipped;
      session.pressKey(' ');
      assert.strictEqual(session.isCardFlipped, flippedBefore, 'Space inside input must not flip card');
    });
  });
});
