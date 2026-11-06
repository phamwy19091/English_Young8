# Project: English Young 8 Modernization

## Architecture
- **Framework & Build**: Vite + React 19 + TypeScript + Tailwind CSS
- **Component Model**: Modular functional React components with hooks
- **State Management**: React Context + Custom Hooks for Auth, Study Data, Active Exam Session, Mistake Notebook, and System Config
- **Persistence Layer**: LocalStorage primary (`ey8_auth_session_v3`, `ey8_snapshot_${username}`, `ey8_system_config_v1`), with Supabase v2 client abstraction for cloud synchronization
- **Audio Service**: Web Speech API (`SpeechSynthesisUtterance`, en-US, rate 0.9) with regex cleaning and robust fallback
- **Routing**: Lightweight hash router (`#units`, `#exam/:id`, `#mistakes`, `#admin`, etc.) with browser history support
- **Testing**: Vitest for unit/integration tests + Playwright/Puppeteer/DOM-based E2E test runner for opaque-box acceptance

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Project Scaffolding | Vite + React + TypeScript + Tailwind CSS configuration | M1_CORE | Survey Code |
| 2 | Curriculum Data Migration | 6 Units (86 vocab, 12 phonetics, 8 grammar topics, 72 MCQs) | M1_CORE | Survey Data |
| 3 | Written Exercises Migration | 36 auto-graded written exercises (18 word-form, 18 rewrite) from js/app.js | M1_CORE | Survey Data |
| 4 | Exam Bank Migration | 6 Exams (121 questions, 5 reading comprehension passages) | M1_CORE | Survey Data |
| 5 | Storage & Session Service | LocalStorage schema preservation & Supabase sync abstraction | M1_CORE | Survey Code |
| 6 | Flashcard Studio | 3D card flip, unlearned deck filter, word dots navigation strip | M2_APP_UI | Survey Features |
| 7 | Active Recall Spelling Challenge | Character blanks, masked sentence clues, instant letter validation | M2_APP_UI | Survey Features |
| 8 | Pronunciation Engine | Web Speech API audio synthesis, rate 0.9, en-US, text regex cleaner | M2_APP_UI | Survey Features |
| 9 | Flashcard Keyboard Navigation | Arrow keys for cards, 'S' for audio (fixing legacy bug), Space for flip | M2_APP_UI | Survey Features |
| 10 | Unit Practice Focus Mode | 1 question per card with step navigation & progress bar | M2_APP_UI | Survey Features |
| 11 | Unit Practice List Mode | All unit questions displayed together for rapid review | M2_APP_UI | Survey Features |
| 12 | Auto-Graded Written Exercises | Word-form and rewrite with smart string normalization & hints | M2_APP_UI | Survey Features |
| 13 | Grammar Reference & Tips Viewer | 8 topics, 50 rules, 18 tips formatted with clear typography | M2_APP_UI | Survey Features |
| 14 | Practice Exam Runner | 6 exams with countdown timer, question jumper, and auto-submit | M2_APP_UI | Survey Features |
| 15 | Option Position Shuffling | Fisher-Yates question & ABCD option shuffling to eliminate bias | M2_APP_UI | Survey Data |
| 16 | Reading Passage Sticky Viewer | Shared context display for grouped reading comprehension questions | M2_APP_UI | Survey Data |
| 17 | Exam Submission & Result Screen | Score calculation, correct answer review, time spent | M2_APP_UI | Survey Features |
| 18 | Attempt Detail Modal ("Soi bài làm") | Question-by-question review of past exam attempts | M2_APP_UI | Survey Features |
| 19 | Automatic Mistake Harvesting | Any wrong answer in unit quiz or exam is auto-saved to notebook | M2_APP_UI | Survey Features |
| 20 | Mistake Notebook (Sổ tay câu sai) | Filter by unit/exam/tag, count indicators, persistent storage | M2_APP_UI | Survey Features |
| 21 | Spoiler-Free Mistake Retry | Hide previous answer/explanation, allow student to re-solve in-card | M2_APP_UI | Survey Features |
| 22 | Mistake Batch Practice Mode | Generate custom practice session from all current wrong answers | M2_APP_UI | Survey Features |
| 23 | Adaptive Mistake Clearance | Automatically resolve/remove mistake when answered correctly | M2_APP_UI | Survey Features |
| 24 | Daily Study Streak Tracker | Streak counter with date diff logic, localStorage persistence | M2_APP_UI | Survey Features |
| 25 | 5-Skill Competency Radar | Pronunciation, Vocabulary, Grammar, Reading, Writing metrics | M2_APP_UI | Survey Features |
| 26 | Responsive App Shell | Desktop header + sidebar collapsing to mobile bottom nav | M2_APP_UI | Survey Features |
| 27 | SPA Hash Routing | Deep linking & back button support for all views | M2_APP_UI | Survey Features |
| 28 | Student Portal Dashboard | Welcome hero, daily streak, quick resume, recent achievements | M2_APP_UI | Survey Features |
| 29 | Portal Switcher | Toggle between Student Portal and Admin Portal | M2_APP_UI | Survey Features |
| 30 | Admin Student Monitor | Track student completion, unit scores, exam logs | M2_APP_UI | Survey Features |
| 31 | Admin Homework Assignment Engine | Assign units/exams with due dates and passing score thresholds | M2_APP_UI | Survey Features |
| 32 | Admin Custom QBank Manager | Create and edit custom questions / unit assignments | M2_APP_UI | Survey Features |
| 33 | Admin Cloud Sync & Settings | Configure Supabase URL & anon key, force sync, backup data | M2_APP_UI | Survey Features |
| 34 | E2E Test Suite (Tiers 1-4) | Comprehensive opaque-box test cases verifying all features | M3_FINAL | Test Track |
| 35 | Adversarial Coverage Hardening | White-box stress testing, edge-case coverage (Tier 5) | M3_FINAL | Challenger |

## Milestones
| # | Name | Scope | Dependencies | Status |
| M1 | M1_CORE | Modern build setup (Vite+React+TS+Tailwind), Typed Data Layer (all Units 1-6 & Exams data preserved), LocalStorage & State Services | none | DONE |
| M2 | M2_APP_UI | Interactive Study Studio (Flashcards, Spelling, Unit Practice, Written Exercises), Timed Exam Room with Reading Passages, Sổ tay câu sai (Mistake Notebook), Study Analytics, Responsive Shell (Desktop & Mobile Bottom Nav), SPA Routing, and Admin Portal | M1 | DONE |
| M3 | M3_FINAL | Phase 1: Pass 100% E2E tests (524 tests) published by E2E Testing Track; Phase 2: Adversarial coverage hardening (Tier 5) | M2, TEST_READY.md | DONE |

## Parallel Track: E2E Testing Track
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| TEST | E2E_TEST_TRACK | Design test runner, create opaque-box tests (Tiers 1-4, 524 tests passing), publish TEST_READY.md | none | DONE |

## Interface Contracts

### Data Types (`src/types/curriculum.ts`)
```typescript
export interface VocabularyItem {
  id: string;
  word: string;
  ipa: string;
  type: string;
  meaning: string;
  example: string;
  exampleVi: string;
  tip?: string;
}

export interface PronunciationSound {
  sound: string;
  guide: string;
  examples: string[];
}

export interface GrammarRule {
  rule: string;
  explanation: string;
  examples: string[];
}

export interface GrammarTopic {
  title: string;
  rules: GrammarRule[];
  tips?: string[];
}

export interface UnitQuestion {
  id: string;
  section: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  passage?: string;
  passageGroupId?: string;
}

export interface WrittenExercise {
  id: string;
  unitId: number;
  type: 'word-form' | 'rewrite';
  rootWord?: string;
  prompt: string;
  prefix?: string;
  acceptedAnswers: string[];
  grammarHint?: string;
  explanation: string;
}

export interface UnitData {
  id: number;
  title: string;
  topic: string;
  vocab: VocabularyItem[];
  pronunciation: {
    title: string;
    sounds: PronunciationSound[];
  };
  grammar: GrammarTopic[];
  quiz: UnitQuestion[];
  writtenExercises: WrittenExercise[];
}

export interface ExamData {
  id: string;
  title: string;
  durationMinutes: number;
  grade: number;
  semester: number;
  type: '15m' | 'midterm' | 'final';
  questions: UnitQuestion[];
}
```

### Storage & Persistence (`src/types/storage.ts`)
```typescript
export interface StudentSnapshot {
  username: string;
  learnedVocab: string[]; // vocabulary IDs
  unitScores: Record<number, number>; // unitId -> best score
  examHistory: ExamAttempt[];
  mistakes: MistakeItem[];
  streak: {
    currentStreak: number;
    lastStudyDate: string; // YYYY-MM-DD
  };
  updatedAt: string;
}

export interface MistakeItem {
  id: string;
  sourceType: 'unit' | 'exam';
  sourceId: string | number;
  questionId: string;
  question: UnitQuestion;
  wrongAnswer: number;
  userNote?: string;
  addedAt: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  examTitle: string;
  score: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  answers: Record<string, number>; // questionId -> selectedOptionIndex
  submittedAt: string;
}
```

## Code Layout
```
d:\Project\Antigravity\English_Young8\
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/
│   │   ├── curriculum.ts
│   │   ├── storage.ts
│   │   └── user.ts
│   ├── data/
│   │   ├── units/
│   │   │   ├── unit1.ts ... unit6.ts
│   │   │   └── index.ts
│   │   ├── exams/
│   │   │   ├── exams.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── storageService.ts
│   │   ├── speechService.ts
│   │   ├── adaptiveService.ts
│   │   └── supabaseService.ts
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   ├── StudyContext.tsx
│   │   └── MistakeContext.tsx
│   ├── components/
│   │   ├── common/
│   │   ├── flashcard/
│   │   ├── practice/
│   │   ├── exam/
│   │   ├── mistakes/
│   │   ├── analytics/
│   │   ├── admin/
│   │   └── layout/
│   └── tests/
│       ├── unit/
│       └── e2e/
```
