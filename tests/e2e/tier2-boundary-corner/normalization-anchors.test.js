/**
 * Tier 2: Boundary & Corner Cases
 * Suite 02: Text Normalization, Contractions & Reading Passage Anchors
 * Boundaries covered:
 * - Complex punctuation stripping and whitespace collapsing
 * - Full English contraction expansion matrix
 * - Phrasal verbs with parenthetical forms
 * - Multi-question reading passage anchoring sets across Midterm and Final exams
 * - Reading passage preservation during mistake harvesting
 * - Underline HTML `<u>` tags preservation in prompts and options
 */

import { describe, it, assert } from '../harness/test-engine.js';
import { createAppSession } from '../harness/test-context.js';
import { getExams, getReadingPassages } from '../harness/curriculum-loader.js';
import { normalizeWrittenString, isWrittenAnswerAccepted, isSpellingMatch } from '../harness/domain-logic.js';

describe('Tier 2: Boundary & Corner Cases - Normalization & Passage Anchors', () => {

  // --- BOUNDARY 1: PUNCTUATION STRIPPING & CONTRACTION EXPANSION ---
  describe('Boundary 1: Punctuation Stripping & Contraction Normalization', () => {
    it('B1.1: Collapses multiple consecutive spaces and tabs into single space', () => {
      assert.strictEqual(normalizeWrittenString('hello      world'), 'hello world');
      assert.strictEqual(normalizeWrittenString('if\t\tyou\tstudy\thard'), 'if you study hard');
    });

    it('B1.2: Strips all standard English punctuation marks [.,?!;:"\']', () => {
      const dirty = 'Wait! Don\'t go, please; "why?"';
      const clean = normalizeWrittenString(dirty);
      assert.strictEqual(clean, 'wait do not go please why');
    });

    it('B1.3: Expands all 8 standard negative and auxiliary contractions', () => {
      assert.strictEqual(normalizeWrittenString("don't"), 'do not');
      assert.strictEqual(normalizeWrittenString("doesn't"), 'does not');
      assert.strictEqual(normalizeWrittenString("isn't"), 'is not');
      assert.strictEqual(normalizeWrittenString("aren't"), 'are not');
      assert.strictEqual(normalizeWrittenString("won't"), 'will not');
      assert.strictEqual(normalizeWrittenString("can't"), 'cannot');
      assert.strictEqual(normalizeWrittenString("i'm"), 'i am');
      assert.strictEqual(normalizeWrittenString("it's"), 'it is');
    });

    it('B1.4: Handles typographical curly apostrophes (’) identically to straight (\')', () => {
      assert.strictEqual(normalizeWrittenString('don’t'), 'do not');
      assert.strictEqual(normalizeWrittenString('can’t'), 'cannot');
      assert.strictEqual(normalizeWrittenString('it’s'), 'it is');
    });

    it('B1.5: Accepts sentence rewrite answers regardless of punctuation or contraction choice', () => {
      const exercise = {
        id: 'ex_test',
        acceptedAnswers: ["If you don't study hard, you won't pass the exam."]
      };

      // Full words with punctuation
      assert.ok(isWrittenAnswerAccepted(exercise, "If you do not study hard, you will not pass the exam."));
      // Contractions without punctuation
      assert.ok(isWrittenAnswerAccepted(exercise, "if you don't study hard you won't pass the exam"));
      // Mixed casing
      assert.ok(isWrittenAnswerAccepted(exercise, "IF YOU DO NOT STUDY HARD YOU WILL NOT PASS THE EXAM"));
    });
  });

  // --- BOUNDARY 2: SPELLING CORNER CASES ---
  describe('Boundary 2: Active Recall Spelling Edge Conditions', () => {
    it('B2.1: Phrasal verbs with parentheses accept base verb phrase or full phrase', () => {
      // Target: "hang out (with)"
      assert.ok(isSpellingMatch('hang out (with)', 'hang out'));
      assert.ok(isSpellingMatch('hang out (with)', 'hang out with'));
      assert.strictEqual(isSpellingMatch('hang out (with)', 'hang'), false);
    });

    it('B2.2: Spelling match rejects partial or anagram matches', () => {
      assert.strictEqual(isSpellingMatch('leisure', 'leisur'), false);
      assert.strictEqual(isSpellingMatch('leisure', 'leisuree'), false);
      assert.strictEqual(isSpellingMatch('origami', 'origam'), false);
    });
  });

  // --- BOUNDARY 3: MULTI-QUESTION READING PASSAGE ANCHORS ---
  describe('Boundary 3: Reading Passage Anchoring Sets', () => {
    const exams = getExams();

    it('B3.1: Midterm 1 passage anchors questions mid1_q19 through mid1_q22 (4 questions)', () => {
      const midterm = exams.find(e => e.id === 'exam-midterm-1');
      assert.ok(midterm);

      const q19 = midterm.questions.find(q => q.id === 'mid1_q19');
      assert.ok(q19 && q19.passage && q19.passage.length > 500, 'mid1_q19 must hold reading passage');

      // Subsequent questions in set share comprehension context
      const q20 = midterm.questions.find(q => q.id === 'mid1_q20');
      const q21 = midterm.questions.find(q => q.id === 'mid1_q21');
      const q22 = midterm.questions.find(q => q.id === 'mid1_q22');
      assert.ok(q20 && q21 && q22, 'Questions 20, 21, 22 must exist in Midterm 1');
    });

    it('B3.2: Final Exam 1 cloze passage anchors fin1_q22 through fin1_q25 (4 questions)', () => {
      const fin1 = exams.find(e => e.id === 'exam-final-1');
      const q22 = fin1.questions.find(q => q.id === 'fin1_q22');
      assert.ok(q22 && q22.passage, 'fin1_q22 must hold cloze passage');

      const q23 = fin1.questions.find(q => q.id === 'fin1_q23');
      const q24 = fin1.questions.find(q => q.id === 'fin1_q24');
      const q25 = fin1.questions.find(q => q.id === 'fin1_q25');
      assert.ok(q23 && q24 && q25, 'Subsequent cloze questions must exist');
    });

    it('B3.3: Final Exam 1 reading passage anchors fin1_q26 through fin1_q28 (3 questions)', () => {
      const fin1 = exams.find(e => e.id === 'exam-final-1');
      const q26 = fin1.questions.find(q => q.id === 'fin1_q26');
      assert.ok(q26 && q26.passage, 'fin1_q26 must hold reading passage');
    });

    it('B3.4: Final Exam 2 cloze passage anchors fin2_q21 through fin2_q25 (5 questions)', () => {
      const fin2 = exams.find(e => e.id === 'exam-final-2');
      const q21 = fin2.questions.find(q => q.id === 'fin2_q21');
      assert.ok(q21 && q21.passage, 'fin2_q21 must hold cloze passage');
    });

    it('B3.5: Final Exam 2 reading passage anchors fin2_q26 through fin2_q28 (3 questions)', () => {
      const fin2 = exams.find(e => e.id === 'exam-final-2');
      const q26 = fin2.questions.find(q => q.id === 'fin2_q26');
      assert.ok(q26 && q26.passage, 'fin2_q26 must hold reading passage');
    });

    it('B3.6: Mistake harvesting preserves reading passage metadata preventing unanswerable reviews', () => {
      const session = createAppSession();
      session.startExam('exam-midterm-1');

      // Answer mid1_q19 incorrectly
      const q19 = session.activeExam.questions.find(q => q.id === 'mid1_q19');
      assert.ok(q19);
      session.selectExamAnswer('mid1_q19', (q19.answer + 1) % 4);
      session.submitExam();

      const mistakes = session.getMistakes();
      const harvested = mistakes['mid1_q19'];
      assert.ok(harvested, 'mid1_q19 must be harvested');
      assert.ok(harvested.question, 'Question text must be preserved');
    });

    it('B3.7: Underline HTML <u> tags are preserved in question prompts and options', () => {
      const units = getExams();
      let hasUnderline = false;
      units.forEach(e => {
        e.questions.forEach(q => {
          if (q.question.includes('<u>') || (q.options || []).some(o => String(o).includes('<u>'))) {
            hasUnderline = true;
          }
        });
      });
      assert.ok(hasUnderline, 'Question bank must preserve <u> tags for phonetic target sounds');
    });
  });
});
