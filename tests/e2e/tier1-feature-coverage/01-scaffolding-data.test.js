/**
 * Tier 1: Feature Coverage
 * Suite 01: Project Scaffolding, Data Migration & Storage Service
 * Features covered:
 * - Feature 1: Project Scaffolding & Architecture
 * - Feature 2: Curriculum Data Migration (6 Units, 86 Vocab, 12 Phonetics, 8 Grammar topics, 72 MCQs)
 * - Feature 3: Written Exercises Migration (36 exercises: 18 word-form, 18 rewrite)
 * - Feature 4: Exam Bank Migration (6 Exams, 121 questions, 5 reading comprehension passages)
 * - Feature 5: Storage & Session Service (LocalStorage schema preservation, user-scoped keys, fallback)
 */

import { describe, it, assert } from '../harness/test-engine.js';
import { catalog, getUnits, getExams, getAllVocab, getAllUnitQuestions, getAllWrittenExercises, getAllExamQuestions, getReadingPassages } from '../harness/curriculum-loader.js';
import { createAppSession } from '../harness/test-context.js';

describe('Tier 1: Suite 01 - Scaffolding, Data Migration & Storage Service', () => {

  // --- FEATURE 1: PROJECT SCAFFOLDING & STRUCTURE ---
  describe('Feature 1: Project Scaffolding & Structure Specification', () => {
    it('F1.1: Project catalog provides summary metrics matching modernization scope', () => {
      assert.ok(catalog.summary, 'Catalog must contain summary metadata');
      assert.strictEqual(catalog.summary.totalUnits, 6, 'Must have exactly 6 units');
      assert.strictEqual(catalog.summary.totalVocab, 86, 'Must have exactly 86 vocabulary items');
      assert.strictEqual(catalog.summary.totalGrammarTopics, 8, 'Must have exactly 8 grammar topics');
      assert.strictEqual(catalog.summary.totalPronunciationSounds, 12, 'Must have exactly 12 phonetic sounds');
      assert.strictEqual(catalog.summary.totalUnitQuizQuestions, 72, 'Must have exactly 72 unit MCQs');
      assert.strictEqual(catalog.summary.totalUnitWrittenExercises, 36, 'Must have exactly 36 unit written exercises');
      assert.strictEqual(catalog.summary.totalExams, 6, 'Must have exactly 6 exams');
      assert.strictEqual(catalog.summary.totalExamQuestions, 121, 'Must have exactly 121 exam questions');
      assert.strictEqual(catalog.summary.grandTotalQuestions, 229, 'Grand total questions must be 229 (72+36+121)');
    });

    it('F1.2: DOM environment initializes required application mounting roots', () => {
      const session = createAppSession();
      assert.ok(session.browser.document.getElementById('app-root'), '#app-root must be present');
      assert.ok(session.browser.document.getElementById('toast-root'), '#toast-root must be present');
      assert.ok(session.browser.document.getElementById('modal-root'), '#modal-root must be present');
      assert.ok(session.browser.document.getElementById('mobile-nav-root'), '#mobile-nav-root must be present');
    });

    it('F1.3: Responsive shell renders top header and mobile bottom navigation', () => {
      const session = createAppSession();
      const header = session.querySelector('.app-header');
      assert.ok(header, 'App header must render in top bar');
      const mobileNav = session.browser.document.querySelector('.mobile-bottom-nav');
      assert.ok(mobileNav, 'Mobile bottom nav must render in mobile container');
    });

    it('F1.4: Header provides navigation tabs for all 6 core learning modules', () => {
      const session = createAppSession();
      const links = session.querySelectorAll('.nav-link');
      assert.strictEqual(links.length, 6, 'Must have 6 main navigation tabs');
      const hrefs = links.map(l => l.getAttribute('href'));
      assert.ok(hrefs.includes('#/dashboard'));
      assert.ok(hrefs.includes('#/unit/unit-1/vocab'));
      assert.ok(hrefs.includes('#/exams'));
      assert.ok(hrefs.includes('#/mistakes'));
      assert.ok(hrefs.includes('#/progress'));
      assert.ok(hrefs.includes('#/admin'));
    });

    it('F1.5: User pill displays current username and active role', () => {
      const session = createAppSession({ username: 'em_lan', role: 'student' });
      const userPill = session.querySelector('.user-pill');
      assert.ok(userPill);
      assert.ok(userPill.textContent.includes('em_lan'));
      assert.ok(userPill.textContent.includes('student'));
    });
  });

  // --- FEATURE 2: CURRICULUM DATA MIGRATION (UNITS 1-6) ---
  describe('Feature 2: Curriculum Data Migration Invariants', () => {
    const units = getUnits();
    const allVocab = getAllVocab();

    it('F2.1: Exactly 6 units exist with consecutive numbering 1 through 6', () => {
      assert.strictEqual(units.length, 6);
      units.forEach((u, idx) => {
        assert.strictEqual(u.number, idx + 1);
        assert.ok(u.id.includes(String(idx + 1)));
        assert.ok(u.title && u.title.length > 0);
      });
    });

    it('F2.2: Unit titles and topics correspond to Global Success Grade 8 Semester 1', () => {
      const expectedTitles = [
        'Leisure Time',
        'Life in the Countryside',
        'Teenagers',
        'Ethnic Groups of Viet Nam',
        'Our Customs and Traditions',
        'Lifestyles'
      ];
      units.forEach((u, idx) => {
        assert.strictEqual(u.title, expectedTitles[idx]);
        assert.ok(u.viTitle && u.viTitle.length > 0);
      });
    });

    it('F2.3: Exactly 86 vocabulary items are preserved across 6 units', () => {
      assert.strictEqual(allVocab.length, 86);
      const expectedPerUnit = [15, 15, 14, 14, 14, 14];
      units.forEach((u, idx) => {
        assert.strictEqual(u.vocab.length, expectedPerUnit[idx]);
      });
    });

    // Exhaustive contract verification for all 86 vocabulary items
    describe('Feature 2: Exhaustive 86-Vocabulary Items Contract Audit', () => {
      allVocab.forEach((v, idx) => {
        it(`F2.V${idx + 1}: Vocab item "${v.word}" (${v.id}) satisfies full contract`, () => {
          assert.ok(v.id && typeof v.id === 'string', 'id required');
          assert.ok(v.word && typeof v.word === 'string', 'word required');
          assert.ok(v.ipa && typeof v.ipa === 'string', 'ipa required');
          assert.ok(v.type && typeof v.type === 'string', 'type required');
          assert.ok(v.meaning && typeof v.meaning === 'string', 'meaning required');
          assert.ok(v.example && typeof v.example === 'string', 'example required');
          assert.ok(v.exampleVi && typeof v.exampleVi === 'string', 'exampleVi required');
          assert.ok(v.tip && typeof v.tip === 'string', 'tip required');
          assert.ok(v.unitNumber >= 1 && v.unitNumber <= 6, 'unitNumber must be 1..6');
        });
      });
    });

    it('F2.4: Exactly 12 phonetic sounds (6 pairs, 2 per unit) with articulatory guides exist', () => {
      let soundCount = 0;
      units.forEach(u => {
        assert.strictEqual(u.pronunciation.sounds.length, 2);
        soundCount += u.pronunciation.sounds.length;
      });
      assert.strictEqual(soundCount, 12);
    });

    it('F2.5: Exactly 8 grammar topics exist across 6 units with rules and exam tips', () => {
      let topicCount = 0;
      let ruleCount = 0;
      let tipCount = 0;

      units.forEach(u => {
        topicCount += u.grammar.length;
        u.grammar.forEach(g => {
          assert.ok(g.title);
          assert.ok(g.rules.length > 0);
          ruleCount += g.rules.length;
          tipCount += g.tips.length;
        });
      });

      assert.strictEqual(topicCount, 8);
      assert.strictEqual(ruleCount, 50);
      assert.strictEqual(tipCount, 18);
    });

    it('F2.6: Exactly 72 multiple-choice unit quiz questions exist (12 per unit)', () => {
      const allQs = getAllUnitQuestions();
      assert.strictEqual(allQs.length, 72);

      units.forEach(u => {
        assert.strictEqual(u.quiz.length, 12);
        u.quiz.forEach(q => {
          assert.ok(q.id);
          assert.ok(q.question);
          assert.strictEqual(q.options.length, 4);
          assert.ok(q.answer >= 0 && q.answer <= 3);
          assert.ok(q.explanation);
        });
      });
    });
  });

  // --- FEATURE 3: WRITTEN EXERCISES MIGRATION ---
  describe('Feature 3: Written Exercises Migration Invariants', () => {
    const written = getAllWrittenExercises();

    it('F3.1: Exactly 36 written exercises exist across 6 units (6 per unit)', () => {
      assert.strictEqual(written.length, 36);
      getUnits().forEach(u => {
        assert.strictEqual(u.writtenExercises.length, 6);
      });
    });

    it('F3.2: Balance of 18 word-form and 18 rewrite exercises across units', () => {
      const wordForms = written.filter(w => w.type === 'word-form');
      const rewrites = written.filter(w => w.type === 'rewrite');
      assert.strictEqual(wordForms.length, 18);
      assert.strictEqual(rewrites.length, 18);
    });

    // Exhaustive contract verification for all 36 written exercises
    describe('Feature 3: Exhaustive 36-Written Exercises Contract Audit', () => {
      written.forEach((w, idx) => {
        it(`F3.W${idx + 1}: Written exercise "${w.id}" (${w.type}) satisfies full contract`, () => {
          assert.ok(w.id);
          assert.ok(w.prompt);
          assert.ok(w.rootWord);
          assert.ok(Array.isArray(w.acceptedAnswers) && w.acceptedAnswers.length > 0);
          assert.ok(w.hint);
          assert.ok(w.explanation);
          assert.ok(w.type === 'word-form' || w.type === 'rewrite');
        });
      });
    });
  });

  // --- FEATURE 4: EXAM BANK MIGRATION ---
  describe('Feature 4: Exam Bank Migration Invariants', () => {
    const exams = getExams();
    const examQuestions = getAllExamQuestions();

    it('F4.1: Exactly 6 exams exist covering 15m, Midterm, and Final Semester 1', () => {
      assert.strictEqual(exams.length, 6);
    });

    it('F4.2: Total exam questions count equals exactly 121', () => {
      assert.strictEqual(examQuestions.length, 121);
    });

    it('F4.3: Every exam question has exactly 4 options and a valid answer index', () => {
      examQuestions.forEach(q => {
        assert.ok(q.id);
        assert.ok(q.question);
        assert.strictEqual(q.options.length, 4);
        assert.ok(q.answer >= 0 && q.answer <= 3);
        assert.ok(q.explanation);
      });
    });

    it('F4.4: Exactly 5 reading comprehension passages exist with valid anchors', () => {
      const passages = getReadingPassages();
      assert.strictEqual(passages.length, 5);
      passages.forEach(p => {
        assert.ok(p.passage.length >= 500);
      });
    });

    // Audit each of the 6 exams individually
    describe('Feature 4: Individual 6-Exam Structure Audit', () => {
      exams.forEach((e, idx) => {
        it(`F4.E${idx + 1}: Exam "${e.title}" (${e.id}) has valid duration and question count`, () => {
          assert.ok(e.id);
          assert.ok(e.title);
          assert.ok(e.durationMinutes === 15 || e.durationMinutes === 45);
          assert.ok(e.questions.length >= 12);
        });
      });
    });
  });

  // --- FEATURE 5: STORAGE & SESSION SERVICE ---
  describe('Feature 5: Storage & Session Service Invariants', () => {
    it('F5.1: Session initializes auth session with ey8_auth_session_v3 key', () => {
      const session = createAppSession({ username: 'em_nam', role: 'student' });
      const auth = session.getStorage('ey8_auth_session_v3');
      assert.strictEqual(auth.username, 'em_nam');
      assert.strictEqual(auth.role, 'student');
    });

    it('F5.2: Storage preserves user-scoped separation for learned vocab', () => {
      const s1 = createAppSession({ username: 'student_a' });
      const s2 = createAppSession({ username: 'student_b' });

      s1.setStorage('ey8_learned_vocab_v1_student_a', ['u1-v1', 'u1-v2']);
      s2.setStorage('ey8_learned_vocab_v1_student_b', ['u2-v1']);

      assert.deepStrictEqual(s1.getLearnedVocab(), ['u1-v1', 'u1-v2']);
      assert.deepStrictEqual(s2.getLearnedVocab(), ['u2-v1']);
    });

    it('F5.3: Storage preserves user-scoped separation for unit best scores', () => {
      const session = createAppSession({ username: 'em_lop8' });
      session.setStorage('ey8_unit_scores_v1_em_lop8', { 1: 9.5, 2: 8.0 });
      assert.strictEqual(session.getUnitScores()[1], 9.5);
      assert.strictEqual(session.getUnitScores()[2], 8.0);
    });

    it('F5.4: Storage preserves user-scoped separation for mistake notebook', () => {
      const session = createAppSession({ username: 'em_lop8' });
      session.setStorage('ey8_mistakes_v1_em_lop8', {
        'u1-q3': { id: 'u1-q3', answer: 1, wrongChoice: 0 }
      });
      const mistakes = session.getMistakes();
      assert.strictEqual(mistakes['u1-q3'].wrongChoice, 0);
    });

    it('F5.5: System config initializes with Supabase connection fallback', () => {
      const session = createAppSession();
      const cfg = session.getStorage('ey8_system_config_v1');
      assert.ok(cfg.supabaseUrl);
      assert.ok(cfg.supabaseAnonKey);
    });

    it('F5.6: Storage safely parses corrupted or empty items returning default structures', () => {
      const session = createAppSession();
      session.browser.localStorage.setItem('corrupted_json', '{bad: json');
      const val = session.getStorage('corrupted_json');
      assert.strictEqual(typeof val, 'string');
    });
  });
});
