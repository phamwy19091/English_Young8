import { UnitQuestion } from './curriculum';

export type SubjectId = 'english' | 'math' | 'science';

export type SubjectModule =
  | 'vocab_flashcard'
  | 'games_2d'
  | 'math_formulas'
  | 'math_short_answer'
  | 'science_branches'
  | 'science_reference'
  | 'chapter_quiz'
  | 'timed_exams'
  | 'mistakes';

export type SubjectThemeColor = 'indigo' | 'blue' | 'emerald';

export interface SubjectConfig {
  id: SubjectId;
  name: string;
  shortName: string;
  subtitle: string;
  badge: string;
  themeColor: SubjectThemeColor;
  defaultRoute: string;
  practiceRoute: string;
  practiceLabel: string;
  enabledModules: SubjectModule[];
}

export interface MathFormula {
  id: string;
  name: string;
  expression: string;
  example: string;
  solutionSteps: string[];
  commonTrap?: string;
}

export interface MathShortAnswer {
  id: string;
  prompt: string;
  acceptedAnswers: string[];
  hint: string;
  solution: string;
}

export interface MathChapter {
  id: string;
  number: number;
  semester: 1 | 2;
  title: string;
  summary: string;
  formulas: MathFormula[];
  quiz: UnitQuestion[];
  shortAnswers: MathShortAnswer[];
}

export type ScienceBranch = 'chemistry' | 'physics' | 'biology';

export interface ScienceConcept {
  id: string;
  title: string;
  summary: string;
  formulaOrEquation?: string;
  experimentNote?: string;
  keyPoints: string[];
}

export interface ScienceTopic {
  id: string;
  number: number;
  semester: 1 | 2;
  branch: ScienceBranch;
  title: string;
  summary: string;
  concepts: ScienceConcept[];
  quiz: UnitQuestion[];
}
