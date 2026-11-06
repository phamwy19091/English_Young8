import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { unitsData, examsData } from '../../data';
import * as storageService from '../../services/storageService';
import * as speechService from '../../services/speechService';

// Helper to load legacy files in a clean sandbox
function loadLegacyStudyData() {
  const rootDir = path.resolve(__dirname, '../../../');
  const units1_3Path = path.join(rootDir, 'data', 'units_1_3.js');
  const units4_6Path = path.join(rootDir, 'data', 'units_4_6.js');
  const examsPath = path.join(rootDir, 'data', 'exams_hk1.js');
  const appJsPath = path.join(rootDir, 'js', 'app.js');

  const context: Record<string, any> = { window: {} };
  vm.createContext(context);

  const units1_3Code = fs.readFileSync(units1_3Path, 'utf8');
  const units4_6Code = fs.readFileSync(units4_6Path, 'utf8');
  const examsCode = fs.readFileSync(examsPath, 'utf8');

  vm.runInContext(units1_3Code, context);
  vm.runInContext(units4_6Code, context);
  vm.runInContext(examsCode, context);

  // Extract UNIT_WRITTEN_EXERCISES from js/app.js
  const appJsCode = fs.readFileSync(appJsPath, 'utf8');
  const startMarker = 'const UNIT_WRITTEN_EXERCISES =';
  const startIndex = appJsCode.indexOf(startMarker);
  if (startIndex === -1) {
    throw new Error('Could not find UNIT_WRITTEN_EXERCISES in js/app.js');
  }
  const endMarker = 'function getWrittenExercisesForUnit';
  const endIndex = appJsCode.indexOf(endMarker, startIndex);
  if (endIndex === -1) {
    throw new Error('Could not find end of UNIT_WRITTEN_EXERCISES in js/app.js');
  }

  const writtenSnippet = appJsCode.substring(startIndex, endIndex).trim();
  // Evaluate the extracted snippet
  const writtenExercises = vm.runInContext(
    `(() => { ${writtenSnippet}; return UNIT_WRITTEN_EXERCISES; })()`,
    context
  );

  return {
    legacyUnits: context.window.STUDY_DATA.units,
    legacyExams: context.window.STUDY_DATA.exams,
    legacyWritten: writtenExercises,
  };
}

describe('Adversarial M1 Audit: Legacy vs TypeScript Modules Fidelity', () => {
  const { legacyUnits, legacyExams, legacyWritten } = loadLegacyStudyData();

  it('Stress-test 1: Unit counts and root metadata must match 100%', () => {
    expect(unitsData).toHaveLength(6);
    expect(legacyUnits).toHaveLength(6);

    for (let i = 0; i < 6; i++) {
      const modern = unitsData[i];
      const legacy = legacyUnits[i];

      expect(modern.id).toBe(legacy.id);
      expect(modern.number).toBe(legacy.number);
      expect(modern.title).toBe(legacy.title);
      expect(modern.viTitle).toBe(legacy.viTitle);
      expect(modern.summary).toBe(legacy.summary);
      expect(modern.icon).toBe(legacy.icon);
      expect(modern.color).toBe(legacy.color);
    }
  });

  it('Stress-test 2: Vocabulary full-fidelity comparison (all 86 items)', () => {
    let totalVocab = 0;
    for (let i = 0; i < 6; i++) {
      const modernVocab = unitsData[i].vocab;
      const legacyVocab = legacyUnits[i].vocabulary;

      expect(modernVocab).toHaveLength(legacyVocab.length);
      totalVocab += modernVocab.length;

      for (let j = 0; j < modernVocab.length; j++) {
        const m = modernVocab[j];
        const l = legacyVocab[j];

        expect(m.id).toBe(l.id);
        expect(m.word).toBe(l.word);
        expect(m.ipa).toBe(l.ipa);
        expect(m.type).toBe(l.type);
        expect(m.meaning).toBe(l.meaning);
        expect(m.example).toBe(l.example);
        expect(m.exampleVi).toBe(l.exampleVi);
        expect(m.tip).toBe(l.tip);
      }
    }
    expect(totalVocab).toBe(86);
  });

  it('Stress-test 3: Pronunciation full-fidelity comparison (12 sounds)', () => {
    let totalSounds = 0;
    for (let i = 0; i < 6; i++) {
      const modernExpl = unitsData[i].pronunciation.explanation || [];
      const legacyExpl = legacyUnits[i].pronunciation.explanation;

      expect(modernExpl).toHaveLength(legacyExpl.length);
      totalSounds += modernExpl.length;

      for (let j = 0; j < modernExpl.length; j++) {
        const m = modernExpl[j];
        const l = legacyExpl[j];

        expect(m.sound).toBe(l.sound);
        expect(m.desc || m.guide).toBe(l.desc);
        expect(m.examples).toEqual(l.examples);
      }
    }
    expect(totalSounds).toBe(12);
  });

  it('Stress-test 4: Grammar topics, rules, and tips full-fidelity comparison', () => {
    let totalTopics = 0;
    for (let i = 0; i < 6; i++) {
      const modernGrammar = unitsData[i].grammar;
      const legacyGrammar = legacyUnits[i].grammar;

      expect(modernGrammar).toHaveLength(legacyGrammar.length);
      totalTopics += modernGrammar.length;

      for (let j = 0; j < modernGrammar.length; j++) {
        const m = modernGrammar[j];
        const l = legacyGrammar[j];

        expect(m.title).toBe(l.title);
        expect(m.rules).toEqual(l.rules);
        const modernTips = m.examTips || m.tips || [];
        const legacyTips = l.examTips || l.tips || [];
        expect(modernTips).toEqual(legacyTips);
      }
    }
    expect(totalTopics).toBe(8);
  });

  it('Stress-test 5: Unit Multiple-Choice Quiz questions full-fidelity comparison (72 questions)', () => {
    let totalQuiz = 0;
    for (let i = 0; i < 6; i++) {
      const modernQuiz = unitsData[i].quiz;
      const legacyPractice = legacyUnits[i].practice;

      expect(modernQuiz).toHaveLength(legacyPractice.length);
      expect(modernQuiz).toHaveLength(12);
      totalQuiz += modernQuiz.length;

      for (let j = 0; j < modernQuiz.length; j++) {
        const m = modernQuiz[j];
        const l = legacyPractice[j];

        expect(m.id).toBe(l.id);
        expect(m.question).toBe(l.question);
        expect(m.options).toEqual(l.options);
        expect(m.answer).toBe(l.answer);
        expect(m.explanation).toBe(l.explanation);
      }
    }
    expect(totalQuiz).toBe(72);
  });

  it('Stress-test 6: Written exercises comparison against js/app.js (36 exercises)', () => {
    let totalWritten = 0;
    for (let i = 0; i < 6; i++) {
      const unitKey = `unit-${i + 1}`;
      const modernWritten = unitsData[i].writtenExercises;
      const legacyUnitWritten = legacyWritten[unitKey];

      expect(modernWritten).toHaveLength(legacyUnitWritten.length);
      expect(modernWritten).toHaveLength(6);
      totalWritten += modernWritten.length;

      for (let j = 0; j < modernWritten.length; j++) {
        const m = modernWritten[j];
        const l = legacyUnitWritten[j];

        expect(m.id).toBe(l.id);
        expect(m.type).toBe(l.type);
        expect(m.rootWord).toBe(l.rootWord);
        expect(m.prompt || m.question).toBe(l.question);
        expect(m.prefix).toBe(l.prefix);
        expect(m.acceptedAnswers || m.accepted).toEqual(l.accepted);
        expect(m.grammarHint || m.hint).toBe(l.hint);
        expect(m.explanation).toBe(l.explanation);
      }
    }
    expect(totalWritten).toBe(36);
  });

  it('Stress-test 7: Exams metadata and questions full-fidelity comparison (6 exams, 121 questions)', () => {
    expect(examsData).toHaveLength(6);
    expect(legacyExams).toHaveLength(6);

    let totalQuestions = 0;
    for (let i = 0; i < 6; i++) {
      const mExam = examsData[i];
      const lExam = legacyExams[i];

      expect(mExam.id).toBe(lExam.id);
      expect(mExam.title).toBe(lExam.title);
      expect(mExam.durationMinutes).toBe(lExam.durationMinutes);
      expect(mExam.questions).toHaveLength(lExam.questions.length);
      totalQuestions += mExam.questions.length;

      for (let j = 0; j < mExam.questions.length; j++) {
        const mQ = mExam.questions[j];
        const lQ = lExam.questions[j];

        expect(mQ.id).toBe(lQ.id);
        expect(mQ.section).toBe(lQ.section);
        expect(mQ.question).toBe(lQ.question);
        expect(mQ.options).toEqual(lQ.options);
        expect(mQ.answer).toBe(lQ.answer);
        expect(mQ.explanation).toBe(lQ.explanation);

        // If legacy question had a passage, modern must have that exact passage
        if (lQ.passage) {
          expect(mQ.passage).toBe(lQ.passage);
        }
      }
    }
    expect(totalQuestions).toBe(121);
  });

  it('Stress-test 8: Reading passage group integrity across exams', () => {
    // Collect all questions with passages
    const allQuestionsWithPassage = examsData.flatMap((e) =>
      e.questions.filter((q) => !!q.passage)
    );

    // Midterm 1: questions 19-22 (4 questions)
    // Final 1: cloze 22-25 (4 questions), reading 26-28 (3 questions)
    // Final 2: cloze 21-25 (5 questions), reading 26-28 (3 questions)
    // Total = 4 + 7 + 8 = 19
    expect(allQuestionsWithPassage).toHaveLength(19);

    const groupMap = new Map<string, string>();
    allQuestionsWithPassage.forEach((q) => {
      expect(q.passageGroupId).toBeDefined();
      expect(q.passage).toBeDefined();
      expect(typeof q.passage).toBe('string');
      expect(q.passage!.length).toBeGreaterThan(50);

      // Verify that all questions in the same passageGroupId share the exact same passage text
      if (groupMap.has(q.passageGroupId!)) {
        expect(q.passage).toBe(groupMap.get(q.passageGroupId!));
      } else {
        groupMap.set(q.passageGroupId!, q.passage!);
      }
    });

    expect(groupMap.size).toBe(5);

    // Verify questions that should NOT have passages have passage === undefined
    const questionsWithoutPassage = examsData.flatMap((e) =>
      e.questions.filter((q) => !q.passage)
    );
    expect(questionsWithoutPassage).toHaveLength(121 - 19); // 102 questions
    questionsWithoutPassage.forEach((q) => {
      expect(q.passage).toBeUndefined();
      expect(q.passageGroupId).toBeUndefined();
    });
  });
});

describe('Adversarial M1 Audit: Question Quality & Boundary Stress Testing', () => {
  const allQuestions = [
    ...unitsData.flatMap((u) => u.quiz),
    ...examsData.flatMap((e) => e.questions),
  ];

  it('Stress-test 9: All 193 multiple-choice questions must have exactly 4 non-empty options', () => {
    expect(allQuestions).toHaveLength(193); // 72 unit MCQs + 121 exam MCQs

    allQuestions.forEach((q) => {
      expect(q.options).toHaveLength(4);
      q.options.forEach((opt) => {
        expect(typeof opt).toBe('string');
        expect(opt.trim().length).toBeGreaterThan(0);
      });

      // Adversarial check: No duplicate options within any question
      const uniqueOpts = new Set(q.options);
      expect(uniqueOpts.size).toBe(4);
    });
  });

  it('Stress-test 10: All 193 multiple-choice questions must have answer in range 0..3', () => {
    allQuestions.forEach((q) => {
      expect(Number.isInteger(q.answer)).toBe(true);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThanOrEqual(3);
      // Ensure target option exists
      expect(q.options[q.answer]).toBeDefined();
    });
  });

  it('Stress-test 11: Global ID uniqueness across all 229 questions', () => {
    const allUnitQuizIds = unitsData.flatMap((u) => u.quiz.map((q) => q.id));
    const allWrittenIds = unitsData.flatMap((u) =>
      u.writtenExercises.map((w) => w.id)
    );
    const allExamQuestionIds = examsData.flatMap((e) =>
      e.questions.map((q) => q.id)
    );

    const allCombinedIds = [
      ...allUnitQuizIds,
      ...allWrittenIds,
      ...allExamQuestionIds,
    ];
    expect(allCombinedIds).toHaveLength(229);

    const uniqueIds = new Set(allCombinedIds);
    expect(uniqueIds.size).toBe(229);
  });

  it('Stress-test 12: Global Vocabulary ID uniqueness (86 vocabs)', () => {
    const allVocabIds = unitsData.flatMap((u) => u.vocab.map((v) => v.id));
    expect(allVocabIds).toHaveLength(86);
    const uniqueVocabIds = new Set(allVocabIds);
    expect(uniqueVocabIds.size).toBe(86);
  });

  it('Stress-test 13: Non-empty explanations and no placeholder/corrupted strings', () => {
    const forbiddenPatterns = ['[object Object]', 'undefined', 'null', 'NaN', 'TODO', 'FIXME'];

    allQuestions.forEach((q) => {
      expect(q.explanation).toBeTruthy();
      expect(q.explanation.trim().length).toBeGreaterThan(5);

      forbiddenPatterns.forEach((pat) => {
        expect(q.question).not.toContain(pat);
        expect(q.explanation).not.toContain(pat);
        q.options.forEach((opt) => expect(opt).not.toContain(pat));
      });
    });

    unitsData.forEach((u) => {
      u.writtenExercises.forEach((w) => {
        expect(w.explanation).toBeTruthy();
        expect(w.acceptedAnswers.length).toBeGreaterThan(0);
        forbiddenPatterns.forEach((pat) => {
          expect(w.prompt).not.toContain(pat);
          expect(w.explanation).not.toContain(pat);
        });
      });
    });
  });
});

describe('Adversarial M1 Audit: Services Edge Cases & Corruption Resistance', () => {
  it('Stress-test 14: StorageService handles corrupted JSON without crashing', () => {
    const originalWindow = (global as any).window;
    const mockStore: Record<string, string> = {
      ey8_snapshot_testuser: '{invalid json corrupt!!',
    };

    (global as any).window = {
      localStorage: {
        getItem: (key: string) => mockStore[key] || null,
        setItem: (key: string, val: string) => {
          mockStore[key] = val;
        },
        removeItem: (key: string) => {
          delete mockStore[key];
        },
        clear: () => {},
        key: () => null,
        length: 0,
      },
    };

    try {
      // Must not throw, should return fallback default snapshot
      const snapshot = storageService.getStudentSnapshot('testuser');
      expect(snapshot).toBeDefined();
      expect(snapshot.username).toBe('testuser');
      expect(snapshot.learnedVocab).toEqual([]);
      expect(snapshot.unitScores).toEqual({});
      expect(snapshot.mistakes).toEqual([]);
    } finally {
      (global as any).window = originalWindow;
    }
  });

  it('Stress-test 15: StorageService normalizes legacy object-based data structures', () => {
    const originalWindow = (global as any).window;
    const legacyMockStore: Record<string, string> = {
      ey8_snapshot_legacyuser: JSON.stringify({
        username: 'legacyuser',
        // Legacy formats sometimes saved learnedVocab as an object or dictionary: { "u1-v1": true, "u1-v2": true }
        learnedVocab: { 'u1-v1': true, 'u1-v2': true },
        // Legacy unitScores might be an object
        unitScores: { '1': 95, '2': 80 },
        mistakes: null,
      }),
    };

    (global as any).window = {
      localStorage: {
        getItem: (key: string) => legacyMockStore[key] || null,
        setItem: (key: string, val: string) => {
          legacyMockStore[key] = val;
        },
        removeItem: (key: string) => {
          delete legacyMockStore[key];
        },
        clear: () => {},
        key: () => null,
        length: 0,
      },
    };

    try {
      const normalized = storageService.getStudentSnapshot('legacyuser');
      expect(Array.isArray(normalized.learnedVocab)).toBe(true);
      expect(normalized.learnedVocab).toContain('u1-v1');
      expect(normalized.learnedVocab).toContain('u1-v2');
      expect(normalized.unitScores[1]).toBe(95);
      expect(Array.isArray(normalized.mistakes)).toBe(true);
    } finally {
      (global as any).window = originalWindow;
    }
  });

  it('Stress-test 16: SpeechService cleanSpeechText edge cases', () => {
    // Normal cases
    expect(speechService.cleanSpeechText('leisure /leʒə/')).toBe('leisure');
    expect(speechService.cleanSpeechText('do DIY (Do It Yourself)')).toBe('do DIY');
    // Edge cases
    expect(speechService.cleanSpeechText('')).toBe('');
    expect(speechService.cleanSpeechText('   ')).toBe('');
    expect(speechService.cleanSpeechText('multiple /slash1/ /slash2/')).toBe('multiple');
    expect(speechService.cleanSpeechText('Vietnamese: Ruộng bậc thang (terraced field)')).toBe('Vietnamese: Ruộng bậc thang');
  });
});
