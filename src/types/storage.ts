import { UnitQuestion } from './curriculum';
import type { SubjectId } from './subject';

export interface ExamAttempt {
  id: string;
  subjectId?: SubjectId;
  examId: string;
  examTitle: string;
  score: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  answers: Record<string, number>; // questionId -> selectedOptionIndex
  submittedAt: string;
}

export interface MistakeItem {
  id: string;
  subjectId?: SubjectId;
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

export interface SubjectProgressEntry {
  chapterScores: Record<string, number>;
  completedTopics: string[];
}

export interface StudentSnapshot {
  username: string;
  learnedVocab: string[]; // vocabulary IDs
  unitScores: Record<number, number>; // unitId -> best score
  subjectProgress?: Record<string, SubjectProgressEntry>;
  examHistory: ExamAttempt[];
  mistakes: MistakeItem[];
  streak: {
    currentStreak: number;
    lastStudyDate: string; // YYYY-MM-DD
  };
  updatedAt: string;
}

export interface HomeworkAssignment {
  id: string;
  title: string;
  type: 'unit' | 'exam';
  targetId: string | number;
  dueDate: string;
  minScore: number;
  assignedTo: string[]; // usernames or ['all']
  createdAt: string;
}

export interface CustomQuestion extends UnitQuestion {
  custom: true;
  createdAt: string;
}

export interface SystemConfig {
  assignments: HomeworkAssignment[];
  customQuestions: CustomQuestion[];
  updatedAt: string;
}
