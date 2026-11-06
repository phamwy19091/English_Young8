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
  desc?: string;
  examples: string[];
}

export interface GrammarRule {
  rule: string;
  explanation?: string;
  examples?: string[];
}

export interface GrammarTopic {
  title: string;
  rules: string[] | GrammarRule[];
  tips?: string[];
  examTips?: string[];
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
  originalQuestionId?: string;
}

export interface WrittenExercise {
  id: string;
  unitId: number;
  type: 'word-form' | 'rewrite';
  rootWord?: string;
  prompt: string;
  question?: string; // backwards compatibility alias
  prefix?: string;
  acceptedAnswers: string[];
  accepted?: string[]; // backwards compatibility alias
  grammarHint?: string;
  hint?: string; // backwards compatibility alias
  explanation: string;
}

export interface UnitData {
  id: number | string;
  number?: number;
  semester?: number;
  title: string;
  viTitle?: string;
  topic?: string;
  icon?: string;
  color?: string;
  summary?: string;
  vocab: VocabularyItem[];
  vocabulary?: VocabularyItem[]; // alias
  pronunciation: {
    title?: string;
    sounds: (string | PronunciationSound)[];
    explanation?: PronunciationSound[];
  };
  grammar: GrammarTopic[];
  quiz: UnitQuestion[];
  practice?: UnitQuestion[]; // alias
  writtenExercises: WrittenExercise[];
  written?: WrittenExercise[]; // alias
}

export interface ExamData {
  id: string;
  title: string;
  category?: string;
  badge?: string;
  durationMinutes: number;
  grade: number;
  semester: number;
  type: '15m' | 'midterm' | 'final';
  scope?: string;
  description?: string;
  questions: UnitQuestion[];
}
