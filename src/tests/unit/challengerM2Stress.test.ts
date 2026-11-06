import { describe, it, expect } from 'vitest';
import {
  normalizeWrittenString,
  isWrittenAnswerAccepted,
  normalizeSpellingWord,
  isSpellingMatch,
  cleanSpeechText
} from '../../services/adaptiveService';
import { unitsData } from '../../data/units';
import { VocabularyItem } from '../../types/curriculum';

describe('Challenger M2 Empirical Stress Suite', () => {

  // =========================================================================
  // 1. WRITTEN EXERCISE STRING NORMALIZATION ADVERSARIAL STRESS
  // =========================================================================
  describe('1. Written Exercise String Normalization Adversarial Stress', () => {

    describe('1.1 Contractions Normalization Matrix', () => {
      it('correctly normalizes all standard negative & auxiliary contractions', () => {
        expect(normalizeWrittenString("don't")).toBe('do not');
        expect(normalizeWrittenString("doesn't")).toBe('does not');
        expect(normalizeWrittenString("isn't")).toBe('is not');
        expect(normalizeWrittenString("aren't")).toBe('are not');
        expect(normalizeWrittenString("won't")).toBe('will not');
        expect(normalizeWrittenString("can't")).toBe('cannot');
        expect(normalizeWrittenString("i'm")).toBe('i am');
        expect(normalizeWrittenString("it's")).toBe('it is');
      });

      it('correctly handles uppercase and mixed case contractions', () => {
        expect(normalizeWrittenString("DON'T")).toBe('do not');
        expect(normalizeWrittenString("Doesn'T")).toBe('does not');
        expect(normalizeWrittenString("ISN'T")).toBe('is not');
        expect(normalizeWrittenString("Aren'T")).toBe('are not');
        expect(normalizeWrittenString("WON'T")).toBe('will not');
        expect(normalizeWrittenString("CAN'T")).toBe('cannot');
        expect(normalizeWrittenString("I'M")).toBe('i am');
        expect(normalizeWrittenString("IT'S")).toBe('it is');
      });

      it('correctly handles curly apostrophes in contractions (both right ’ and left ‘)', () => {
        expect(normalizeWrittenString("don’t")).toBe('do not');
        expect(normalizeWrittenString("doesn’t")).toBe('does not');
        expect(normalizeWrittenString("isn’t")).toBe('is not');
        expect(normalizeWrittenString("aren’t")).toBe('are not');
        expect(normalizeWrittenString("won’t")).toBe('will not');
        expect(normalizeWrittenString("can’t")).toBe('cannot');
        expect(normalizeWrittenString("i’m")).toBe('i am');
        expect(normalizeWrittenString("it’s")).toBe('it is');

        // Left single curly quote
        expect(normalizeWrittenString("don‘t")).toBe('do not');
        expect(normalizeWrittenString("won‘t")).toBe('will not');
      });

      it('does NOT alter words containing contractions as sub-words (word boundary integrity)', () => {
        // e.g. "scant" should not become "scannot"
        expect(normalizeWrittenString("scant")).toBe('scant');
        // e.g. "canton" should not become "cannoto"
        expect(normalizeWrittenString("canton")).toBe('canton');
      });

      it('strips non-contracted possessive apostrophes cleanly', () => {
        expect(normalizeWrittenString("family's custom")).toBe('familys custom');
        expect(normalizeWrittenString("family’s custom")).toBe('familys custom');
        expect(normalizeWrittenString("teacher's book")).toBe('teachers book');
      });
    });

    describe('1.2 Punctuation Variations & Stripping', () => {
      it('strips all standard punctuation marks [.,?!;:"] from anywhere in the string', () => {
        expect(normalizeWrittenString("Wait, what? No! Really; yes: done.")).toBe('wait what no really yes done');
        expect(normalizeWrittenString('"Hello world"')).toBe('hello world');
        expect(normalizeWrittenString('She said: "No!"')).toBe('she said no');
      });

      it('handles multiple consecutive punctuation marks without crashing or leaving artifacts', () => {
        expect(normalizeWrittenString("really??!!.....;;;")).toBe('really');
        expect(normalizeWrittenString("???")).toBe('');
        expect(normalizeWrittenString("... ... ...")).toBe('');
      });
    });

    describe('1.3 Whitespace Collapsing & Trimming', () => {
      it('collapses arbitrary whitespace (spaces, tabs, newlines, carriage returns)', () => {
        expect(normalizeWrittenString("   hello   \t\t\n\r   world   ")).toBe('hello world');
        expect(normalizeWrittenString("\n\tsome\n\ttext\n\t")).toBe('some text');
      });

      it('handles empty strings and null/undefined values gracefully', () => {
        expect(normalizeWrittenString("")).toBe('');
        expect(normalizeWrittenString("   ")).toBe('');
        expect(normalizeWrittenString(null as unknown as string)).toBe('');
        expect(normalizeWrittenString(undefined as unknown as string)).toBe('');
      });
    });

    describe('1.4 Exhaustive Validation across All 36 Curriculum Written Exercises', () => {
      const allWrittenExercises = unitsData.flatMap(u => u.writtenExercises || []);

      it('has exactly 36 written exercises across 6 units', () => {
        expect(allWrittenExercises).toHaveLength(36);
      });

      allWrittenExercises.forEach((ex, idx) => {
        it(`Exercise ${idx + 1} (${ex.id}): accepts canonical answer and robustly tolerates adversarial variations`, () => {
          const canonical = ex.acceptedAnswers[0];
          expect(canonical).toBeDefined();

          // 1. Exact canonical matches
          expect(isWrittenAnswerAccepted(ex, canonical)).toBe(true);

          // 2. Adversarial uppercase
          expect(isWrittenAnswerAccepted(ex, canonical.toUpperCase())).toBe(true);

          // 3. Adversarial leading/trailing whitespaces and tabs
          expect(isWrittenAnswerAccepted(ex, `  \t ${canonical} \n  `)).toBe(true);

          // 4. Adversarial punctuation at end (. ? ! ;)
          expect(isWrittenAnswerAccepted(ex, `${canonical}....`)).toBe(true);
          expect(isWrittenAnswerAccepted(ex, `"${canonical}!"`)).toBe(true);

          // 5. Adversarial curly apostrophes if sentence contains apostrophe
          if (canonical.includes("'")) {
            const curlyReplaced = canonical.replace(/'/g, '’');
            expect(isWrittenAnswerAccepted(ex, curlyReplaced)).toBe(true);
          }

          // 6. Adversarial rejection: random gibberish or partial prefix must be rejected
          expect(isWrittenAnswerAccepted(ex, 'completely_incorrect_xyz_random_answer')).toBe(false);
          expect(isWrittenAnswerAccepted(ex, '')).toBe(false);
          expect(isWrittenAnswerAccepted(ex, '   ')).toBe(false);
        });
      });
    });
  });

  // =========================================================================
  // 2. FLASHCARD DECK FILTERS & ACTIVE RECALL SPELLING EMPIRICAL STRESS
  // =========================================================================
  describe('2. Flashcard Deck Filters & Active Recall Spelling Empirical Stress', () => {

    describe('2.1 Spelling Word Normalization and Character Blanks Matching', () => {
      it('normalizes spelling words to lowercase and trims surrounding whitespace', () => {
        expect(normalizeSpellingWord('  LEISURE  ')).toBe('leisure');
        expect(normalizeSpellingWord('Do   DIY')).toBe('do diy');
      });

      it('isSpellingMatch handles exact matching case-insensitively', () => {
        expect(isSpellingMatch('origami', 'ORIGAMI')).toBe(true);
        expect(isSpellingMatch('origami', 'Origami')).toBe(true);
        expect(isSpellingMatch('origami', '  origami  ')).toBe(true);
      });

      it('isSpellingMatch REJECTS partial answers and anagrams', () => {
        expect(isSpellingMatch('leisure', 'leisur')).toBe(false);
        expect(isSpellingMatch('leisure', 'leis')).toBe(false);
        expect(isSpellingMatch('origami', 'origam')).toBe(false);
        expect(isSpellingMatch('origami', 'origamia')).toBe(false);
        expect(isSpellingMatch('origami', 'omigari')).toBe(false);
      });

      it('isSpellingMatch REJECTS empty strings and whitespace-only inputs', () => {
        expect(isSpellingMatch('leisure', '')).toBe(false);
        expect(isSpellingMatch('leisure', '   ')).toBe(false);
        expect(isSpellingMatch('leisure', '\t\n')).toBe(false);
      });

      it('isSpellingMatch accepts phrasal verbs with parentheses in both base and full forms', () => {
        // "hang out (with)"
        expect(isSpellingMatch('hang out (with)', 'hang out')).toBe(true);
        expect(isSpellingMatch('hang out (with)', 'hang out with')).toBe(true);
        expect(isSpellingMatch('hang out (with)', 'hang out (with)')).toBe(true);
        expect(isSpellingMatch('hang out (with)', 'HANG OUT')).toBe(true);
        expect(isSpellingMatch('hang out (with)', '  hang out with  ')).toBe(true);

        // Rejections
        expect(isSpellingMatch('hang out (with)', 'hang')).toBe(false);
        expect(isSpellingMatch('hang out (with)', 'hang in')).toBe(false);
        expect(isSpellingMatch('hang out (with)', 'hang out without')).toBe(false);

        // "concentrate (on)"
        expect(isSpellingMatch('concentrate (on)', 'concentrate')).toBe(true);
        expect(isSpellingMatch('concentrate (on)', 'concentrate on')).toBe(true);
        expect(isSpellingMatch('concentrate (on)', 'concentrate in')).toBe(false);
      });

      it('tests all 86 curriculum vocabulary items with isSpellingMatch', () => {
        const allVocab = unitsData.flatMap(u => u.vocab || []);
        expect(allVocab).toHaveLength(86);

        allVocab.forEach(v => {
          // Exact match passes
          expect(isSpellingMatch(v.word, v.word)).toBe(true);
          // Uppercase passes
          expect(isSpellingMatch(v.word, v.word.toUpperCase())).toBe(true);
          // Padded spaces passes
          expect(isSpellingMatch(v.word, `   ${v.word}   `)).toBe(true);

          // Partial (missing last character) must fail
          const trimmed = v.word.trim();
          if (trimmed.length > 3 && !trimmed.includes('(')) {
            const truncated = trimmed.slice(0, -1);
            expect(isSpellingMatch(v.word, truncated)).toBe(false);
          }
        });
      });
    });

    describe('2.2 Flashcard Deck Filtering & Navigation State Machine', () => {
      const u1Vocab = unitsData[0].vocab;

      it('filters unlearned vs all vocab correctly given a learned set', () => {
        const learnedIds = new Set<string>();

        // Initially no vocab is learned
        const getUnlearned = (deck: VocabularyItem[]) => deck.filter(v => !learnedIds.has(v.id));

        expect(getUnlearned(u1Vocab)).toHaveLength(u1Vocab.length);

        // Learn first 5 items
        for (let i = 0; i < 5; i++) {
          learnedIds.add(u1Vocab[i].id);
        }

        expect(getUnlearned(u1Vocab)).toHaveLength(u1Vocab.length - 5);
        expect(u1Vocab).toHaveLength(15); // "all" mode still has 15
      });

      it('handles empty deck boundary (100% learned) without throwing or returning NaN', () => {
        const learnedIds = new Set<string>(u1Vocab.map(v => v.id));
        const activeDeck = u1Vocab.filter(v => !learnedIds.has(v.id));

        expect(activeDeck).toHaveLength(0);

        // Safe card retrieval when activeDeck is empty
        const currentIndex = 0;
        const currentCard = activeDeck.length > 0 ? activeDeck[currentIndex % activeDeck.length] : null;
        expect(currentCard).toBeNull();

        // Modulo navigation safety check: when activeDeck.length === 0, guard handles it
        const nextIndex = activeDeck.length > 0 ? (currentIndex + 1) % activeDeck.length : 0;
        const prevIndex = activeDeck.length > 0 ? (currentIndex - 1 + activeDeck.length) % activeDeck.length : 0;
        expect(nextIndex).toBe(0);
        expect(prevIndex).toBe(0);
      });

      it('handles single-card deck modulo navigation without jumping out of bounds', () => {
        const singleDeck = [u1Vocab[0]];
        let idx = 0;

        // Next wrap
        idx = (idx + 1) % singleDeck.length;
        expect(idx).toBe(0);

        // Prev wrap
        idx = (idx - 1 + singleDeck.length) % singleDeck.length;
        expect(idx).toBe(0);
      });

      it('wraps around circularly on multi-card deck', () => {
        const len = 5;
        let idx = 0;

        // Advance 5 times
        for (let i = 1; i <= 5; i++) {
          idx = (idx + 1) % len;
          expect(idx).toBe(i % len);
        }
        expect(idx).toBe(0); // Wrapped back to 0

        // Retreat from 0
        idx = (idx - 1 + len) % len;
        expect(idx).toBe(4); // Wrapped to last
      });
    });

    describe('2.3 Active Recall Spelling Hint Progression & Clue Masking', () => {
      it('progressively reveals letters up to cleanTarget.length and clamps at max', () => {
        const target = 'leisure';
        const clean = normalizeSpellingWord(target);
        expect(clean).toBe('leisure');

        let hintsRevealed = 0;
        const revealHint = () => {
          hintsRevealed = Math.min(clean.length, hintsRevealed + 1);
        };

        for (let i = 1; i <= clean.length + 3; i++) {
          revealHint();
          expect(hintsRevealed).toBeLessThanOrEqual(clean.length);
        }
        expect(hintsRevealed).toBe(clean.length);
      });

      it('correctly masks the target word inside the example sentence', () => {
        const word = 'leisure';
        const example = 'Most people enjoy spending their leisure time with friends.';

        const masked = example.replace(
          new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
          '____________'
        );

        expect(masked).toBe('Most people enjoy spending their ____________ time with friends.');
        expect(masked).not.toContain('leisure');
      });

      it('correctly masks phrasal verb with parentheses inside sentence without broken regex', () => {
        const word = 'hang out (with)';
        const example = 'I usually hang out with my close friends on Sundays.';

        // Safe regex escaping
        const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        expect(escaped).toBe('hang out \\(with\\)');

        // When testing with clean base
        const base = word.replace(/\(.*?\)/g, '').trim();
        const masked = example.replace(
          new RegExp(base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
          '____________'
        );
        expect(masked).toContain('____________');
      });
    });

    describe('2.4 Speech Synthesis Text Cleaner Robustness', () => {
      it('strips slashes and phonetic guides from word strings with multiple alternatives', () => {
        expect(cleanSpeechText('load / unload')).toBe('load');
        expect(cleanSpeechText('stressful / stressed')).toBe('stressful');
        expect(cleanSpeechText('upload / download')).toBe('upload');
        expect(cleanSpeechText('poultry / cattle')).toBe('poultry');
      });

      it('strips IPA phonetic guides and explanatory parentheses', () => {
        expect(cleanSpeechText('harvest /ˈhɑːvɪst/ (v)')).toBe('harvest');
        expect(cleanSpeechText('hang out (with) /hæŋ aʊt/')).toBe('hang out');
      });

      it('extracts phonetic symbol when string is an isolated phoneme title', () => {
        expect(cleanSpeechText('/ʊ/ (u ngắn)')).toBe('ʊ');
        expect(cleanSpeechText('/uː/ (u dài)')).toBe('uː');
        expect(cleanSpeechText('/br/ (bờ-r)')).toBe('br');
      });
    });
  });
});
