# E2E Test Infrastructure & Specification Matrix
## English Young 8 — Modernization Project

---

## 1. Executive Summary & Testing Philosophy

The test infrastructure for **English Young 8** implements a rigorous **4-Tier Opaque-Box Acceptance Testing Methodology** designed to verify 100% of the 35 features defined in `PROJECT.md`.

### Core Architectural Principles:
1. **Opaque-Box Requirement-Driven**: Tests interact exclusively through public DOM elements, user events (clicks, keypresses, input values), URL hashes (`#/dashboard`, `#/unit/unit-1/vocab`, `#/exams`, `#/mistakes`), and persistent browser storage (`ey8_auth_session_v3`, `ey8_snapshot_${username}`, `ey8_system_config_v1`).
2. **Zero-Dependency Native Execution**: The test harness runs out of the box on pure Node.js (v20+) using built-in standard modules (`node:assert`, `node:fs`, `node:path`, `node:url`, `node:performance`). No external npm packages or bulky browser binary downloads are required.
3. **Determinism & Lightning Speed**: All 524 tests execute in **~0.13 seconds**, ensuring instant feedback during local development and continuous integration.
4. **Authoritative Curriculum Ground Truth**: Directly validated against the complete curriculum inventory: 6 Units, 86 Core Vocabulary Items, 12 Phonetic Sounds, 8 Grammar Topics (50 rules, 18 tips), 72 Unit Multiple-Choice Quizzes, 36 Unit Written Exercises, 6 Exams (121 questions), and 5 Reading Comprehension Passages.

---

## 2. Test Architecture & Harness Components

```
tests/e2e/
├── runner.js                      # Master test runner entrypoint
├── harness/
│   ├── test-engine.js             # Lightweight describe/it/assert registry & formatted reporter
│   ├── dom-env.js                 # Headless DOM, Storage, SpeechSynthesis & Navigation simulator
│   ├── html-parser.js             # HTML fragment tokenizer & element tree builder
│   ├── domain-logic.js            # Text normalizer, option shuffling, score & radar algorithms
│   ├── curriculum-loader.js       # Curriculum catalog importer with schema normalization
│   └── test-context.js            # AppSession factory orchestrating Student & Admin state
├── tier1-feature-coverage/
│   ├── 01-scaffolding-data.test.js    # F1-F5 (151 tests)
│   ├── 02-flashcard-spelling.test.js  # F6-F9 (26 tests)
│   ├── 03-unit-practice.test.js       # F10-F13 (128 tests)
│   ├── 04-exam-runner.test.js         # F14-F18 (135 tests)
│   ├── 05-mistakes-notebook.test.js   # F19-F23 (14 tests)
│   ├── 06-progress-analytics.test.js  # F24-F25 (13 tests)
│   ├── 07-app-shell-routing.test.js   # F26-F29 (11 tests)
│   └── 08-admin-cloud.test.js         # F30-F35 (11 tests)
├── tier2-boundary-corner/
│   ├── boundary-cases.test.js         # Cold storage, timer expiry, deck completion (15 tests)
│   └── normalization-anchors.test.js  # Contractions, punctuation, passage anchors (14 tests)
├── tier3-cross-feature/
│   └── cross-feature-flows.test.js    # Multi-feature remediation & homework flows (3 tests)
└── tier4-workflows/
    ├── student-journey.test.js        # Full student daily study & exam remediation (2 tests)
    └── admin-journey.test.js          # Full administrative oversight & distribution (1 test)
```

### Component Details:
- **`dom-env.js`**: Pure Node.js headless DOM implementation providing `MockDocument`, `DOMNode`, `DOMTokenList` (`classList`), `DOMStorage` (`localStorage`/`sessionStorage`), `MockSpeechSynthesis`, `MockLocation` (hash routing), `MockHistory` (`back`/`forward`), and DOM event dispatching (`click`, `input`, `keydown`).
- **`domain-logic.js`**: Reference oracle implementing smart written string normalization (stripping punctuation `[.,?!;:"]`, expanding contractions like `don't -> do not`, folding case and spaces), Fisher-Yates question & ABCD option shuffling, 10-point scale score computation, distinct-date streak accumulation, and 5-skill competency radar breakdown.
- **`curriculum-loader.js`**: Loads curriculum data from `.agents/teamwork/survey_data/catalog.json` with property alias normalization matching the `PROJECT.md` interface contracts (`VocabularyItem`, `UnitQuestion`, `WrittenExercise`, `UnitData`, `ExamData`).
- **`test-context.js`**: High-level opaque-box session orchestrator supporting Student (`em_lop8`) and Admin (`admin`) accounts, UI element queries, user actions, and storage inspection.

---

## 3. Runner Commands

### Standard Execution:
```bash
# Execute master test runner across all 4 tiers
node tests/e2e/runner.js

# Or via npm script (when package.json is configured)
npm run test:e2e
```

### Individual Suite Execution:
```bash
# Run specific tier or feature suite
node -e "import('./tests/e2e/harness/test-engine.js').then(async e => { await import('./tests/e2e/tier1-feature-coverage/01-scaffolding-data.test.js'); const r = await e.registry.runAll(); process.exit(r.success ? 0 : 1); })"
node -e "import('./tests/e2e/harness/test-engine.js').then(async e => { await import('./tests/e2e/tier2-boundary-corner/boundary-cases.test.js'); const r = await e.registry.runAll(); process.exit(r.success ? 0 : 1); })"
node -e "import('./tests/e2e/harness/test-engine.js').then(async e => { await import('./tests/e2e/tier3-cross-feature/cross-feature-flows.test.js'); const r = await e.registry.runAll(); process.exit(r.success ? 0 : 1); })"
node -e "import('./tests/e2e/harness/test-engine.js').then(async e => { await import('./tests/e2e/tier4-workflows/student-journey.test.js'); const r = await e.registry.runAll(); process.exit(r.success ? 0 : 1); })"
```

---

## 4. 35-Feature Coverage Matrix

| # | Feature in PROJECT.md | Milestone | Primary Test Suite | Test Identifiers | Status |
|---|---|---|---|---|---|
| 1 | Project Scaffolding | M1_CORE | `01-scaffolding-data.test.js` | F1.1 - F1.5 | ✅ PASSED |
| 2 | Curriculum Data Migration | M1_CORE | `01-scaffolding-data.test.js` | F2.1 - F2.6, F2.V1 - F2.V86 | ✅ PASSED |
| 3 | Written Exercises Migration | M1_CORE | `01-scaffolding-data.test.js`, `03-unit-practice.test.js` | F3.1 - F3.2, F3.W1 - F3.W36 | ✅ PASSED |
| 4 | Exam Bank Migration | M1_CORE | `01-scaffolding-data.test.js`, `04-exam-runner.test.js` | F4.1 - F4.4, F4.E1 - F4.E6, F18.EQ1 - F18.EQ121 | ✅ PASSED |
| 5 | Storage & Session Service | M1_CORE | `01-scaffolding-data.test.js` | F5.1 - F5.6, B1.1 - B1.3 | ✅ PASSED |
| 6 | Flashcard Studio | M2_STUDY | `02-flashcard-spelling.test.js` | F6.1 - F6.7, B4.1 - B4.3 | ✅ PASSED |
| 7 | Active Recall Spelling Challenge | M2_STUDY | `02-flashcard-spelling.test.js` | F7.1 - F7.8, B2.1 - B2.2 | ✅ PASSED |
| 8 | Pronunciation Engine | M2_STUDY | `02-flashcard-spelling.test.js` | F8.1 - F8.5, B6.1 | ✅ PASSED |
| 9 | Flashcard Keyboard Navigation | M2_STUDY | `02-flashcard-spelling.test.js` | F9.1 - F9.6 | ✅ PASSED |
| 10 | Unit Practice Focus Mode | M2_STUDY | `03-unit-practice.test.js` | F10.1 - F10.4 | ✅ PASSED |
| 11 | Unit Practice List Mode | M2_STUDY | `03-unit-practice.test.js` | F11.1 - F11.6, F11.Q1 - F11.Q72 | ✅ PASSED |
| 12 | Auto-Graded Written Exercises | M2_STUDY | `03-unit-practice.test.js` | F12.1 - F12.7, F12.W1 - F12.W36 | ✅ PASSED |
| 13 | Grammar Reference & Tips Viewer | M2_STUDY | `03-unit-practice.test.js` | F13.1 - F13.3 | ✅ PASSED |
| 14 | Practice Exam Runner | M3_EXAM_NOTEBOOK | `04-exam-runner.test.js` | F14.1 - F14.4, B3.1 - B3.2 | ✅ PASSED |
| 15 | Option Position Shuffling | M3_EXAM_NOTEBOOK | `04-exam-runner.test.js` | F15.1 - F15.3 | ✅ PASSED |
| 16 | Reading Passage Sticky Viewer | M3_EXAM_NOTEBOOK | `04-exam-runner.test.js`, `normalization-anchors.test.js` | F16.1 - F16.3, B3.1 - B3.7 | ✅ PASSED |
| 17 | Exam Submission & Result Screen | M3_EXAM_NOTEBOOK | `04-exam-runner.test.js` | F17.1 - F17.2, B5.1 - B5.4 | ✅ PASSED |
| 18 | Attempt Detail Modal ("Soi bài làm") | M3_EXAM_NOTEBOOK | `04-exam-runner.test.js` | F18.1 - F18.2 | ✅ PASSED |
| 19 | Automatic Mistake Harvesting | M3_EXAM_NOTEBOOK | `05-mistakes-notebook.test.js` | F19.1 - F19.4 | ✅ PASSED |
| 20 | Mistake Notebook (Sổ tay câu sai) | M3_EXAM_NOTEBOOK | `05-mistakes-notebook.test.js` | F20.1 - F20.3 | ✅ PASSED |
| 21 | Spoiler-Free Mistake Retry | M3_EXAM_NOTEBOOK | `05-mistakes-notebook.test.js` | F21.1 - F21.3 | ✅ PASSED |
| 22 | Mistake Batch Practice Mode | M3_EXAM_NOTEBOOK | `05-mistakes-notebook.test.js` | F22.1 | ✅ PASSED |
| 23 | Adaptive Mistake Clearance | M3_EXAM_NOTEBOOK | `05-mistakes-notebook.test.js` | F23.1 - F23.3, C1.1 | ✅ PASSED |
| 24 | Daily Study Streak Tracker | M3_EXAM_NOTEBOOK | `06-progress-analytics.test.js` | F24.1 - F24.5 | ✅ PASSED |
| 25 | 5-Skill Competency Radar | M3_EXAM_NOTEBOOK | `06-progress-analytics.test.js` | F25.1 - F25.8, C3.1 | ✅ PASSED |
| 26 | Responsive App Shell | M4_APP_SHELL | `07-app-shell-routing.test.js` | F26.1 - F26.3 | ✅ PASSED |
| 27 | SPA Hash Routing | M4_APP_SHELL | `07-app-shell-routing.test.js` | F27.1 - F27.4 | ✅ PASSED |
| 28 | Student Portal Dashboard | M4_APP_SHELL | `07-app-shell-routing.test.js` | F28.1 - F28.2 | ✅ PASSED |
| 29 | Portal Switcher | M4_APP_SHELL | `07-app-shell-routing.test.js` | F29.1 - F29.2 | ✅ PASSED |
| 30 | Admin Student Monitor | M4_APP_SHELL | `08-admin-cloud.test.js` | F30.1 - F30.2 | ✅ PASSED |
| 31 | Admin Homework Assignment Engine | M4_APP_SHELL | `08-admin-cloud.test.js` | F31.1 - F31.3, C3.1 | ✅ PASSED |
| 32 | Admin Custom QBank Manager | M4_APP_SHELL | `08-admin-cloud.test.js` | F32.1 | ✅ PASSED |
| 33 | Admin Cloud Sync & Settings | M4_APP_SHELL | `08-admin-cloud.test.js` | F33.1 - F33.2 | ✅ PASSED |
| 34 | E2E Test Suite (Tiers 1-4) | M5_FINAL | `08-admin-cloud.test.js`, `runner.js` | F34.1, All Suites | ✅ PASSED |
| 35 | Adversarial Coverage Hardening | M5_FINAL | `08-admin-cloud.test.js`, Tier 2 | F35.1 - F35.2, B1 - B6 | ✅ PASSED |

---

## 5. Test Case Volume Breakdown across Tiers 1–4

| Tier | Category | Number of Test Cases | Key Focus Areas |
|---|---|:---:|---|
| **Tier 1** | Feature Coverage (Core Platform) | **489** | Complete verification of all 35 features: 86 vocabulary items, 36 written exercises, 72 unit MCQs, 121 exam questions, flashcard controls, spelling challenge, pronunciation engine, focus/list modes, exam countdown, mistake notebook, study streak, 5-skill radar, dashboard, admin portal, and cloud settings. |
| **Tier 2** | Boundary & Corner Cases | **29** | Cold-boot storage recovery, corrupted JSON resilience, 00:00 timer expiry forced submission, all-learned deck completion, single-card decks, 0.0/10 and 10.0/10 scores, fractional rounding (e.g. 5.83), multi-user isolation on shared device, punctuation stripping, curly apostrophe contractions (`don’t`), and multi-question reading passage anchoring. |
| **Tier 3** | Cross-Feature Combinations | **3** | Integration flows connecting disjoint features: (1) Unit Quiz Error -> Mistake Notebook -> In-Card Retry -> Smart Adaptive Quiz -> Auto-Clearance -> Streak Accrual; (2) Flashcard Safe Marking -> Unlearned Deck Filter -> Active Recall Spelling -> Mastery Sync; (3) Timed Exam -> Attempt Inspection -> 5-Skill Radar -> Admin Monitor -> Homework Auto-Completion. |
| **Tier 4** | Real-World User Workflows | **3** | End-to-end user journeys replicating genuine human usage: (1) New Student Full Unit 1 Study Session (Flashcards -> Spelling -> Grammar -> Unit Quiz -> Written); (2) Targeted Exam Preparation & Weakness Remediation Session; (3) Administrative Oversight & Homework Distribution Workflow. |
| **Total** | **All 4 Tiers** | **524** | **Exceeds required threshold (>= 403 tests) by 121 tests (130% target).** |

---

## 6. Verification & Sign-Off

- **Execution Command**: `node tests/e2e/runner.js`
- **Total Tests Executed**: 524
- **Pass Rate**: 100% (524 passed, 0 failed, 0 skipped)
- **Execution Time**: ~0.13 seconds
- **Memory Consumption**: < 45 MB RSS
- **Environment Tested**: Node.js v24.14.0 on Windows (compatible with Node.js v20+)
