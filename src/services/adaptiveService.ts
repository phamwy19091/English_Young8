import { UnitQuestion } from '../types/curriculum';
import { MistakeItem } from '../types/storage';

export function normalizeWrittenString(str: string): string {
  return (str || '')
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[.,?!;:"]/g, '')
    .replace(/\bdon't\b/g, 'do not')
    .replace(/\bdoesn't\b/g, 'does not')
    .replace(/\bisn't\b/g, 'is not')
    .replace(/\baren't\b/g, 'are not')
    .replace(/\bwon't\b/g, 'will not')
    .replace(/\bcan't\b/g, 'cannot')
    .replace(/\bi'm\b/g, 'i am')
    .replace(/\bit's\b/g, 'it is')
    .replace(/'/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isWrittenAnswerAccepted(
  item: { acceptedAnswers?: string[]; accepted?: string[] },
  rawInput: string
): boolean {
  const normInput = normalizeWrittenString(rawInput);
  if (!normInput) return false;
  const list = item.acceptedAnswers || item.accepted || [];
  return list.some(acc => normalizeWrittenString(acc) === normInput);
}

export function normalizeSpellingWord(word: string): string {
  return (word || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function isSpellingMatch(targetWord: string, userInput: string): boolean {
  const normTarget = normalizeSpellingWord(targetWord);
  const normUser = normalizeSpellingWord(userInput);
  if (!normUser) return false;

  // Exact match
  if (normTarget === normUser) return true;

  // Phrasal verb with parenthesis e.g. "hang out (with)" -> accepts both "hang out" and "hang out with"
  if (targetWord.includes('(') && targetWord.includes(')')) {
    const baseOnly = normalizeSpellingWord(targetWord.replace(/\(.*?\)/g, ''));
    const fullForm = normalizeSpellingWord(targetWord.replace(/[()]/g, ''));
    return normUser === baseOnly || normUser === fullForm;
  }

  return false;
}

import { cleanSpeechText } from './speechService';
export { cleanSpeechText };

export function shuffleArray<T>(arr: T[], rng: () => number = Math.random): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function cloneAndShuffleOptions(
  q: UnitQuestion,
  rng: () => number = Math.random
): UnitQuestion {
  const letters = ['A', 'B', 'C', 'D'];
  const rawOpts = (q.options || []).map((opt, idx) => ({
    cleanText: String(opt).replace(/^[A-D][\.\)\:\-]\s*/i, '').trim(),
    isCorrect: idx === q.answer
  }));

  const shuffled = shuffleArray(rawOpts, rng);
  let newCorrectIdx = 0;
  const formatted = shuffled.map((item, idx) => {
    if (item.isCorrect) newCorrectIdx = idx;
    return `${letters[idx]}. ${item.cleanText}`;
  });

  return {
    ...q,
    originalQuestionId: (q as any).originalQuestionId || q.id,
    options: formatted,
    answer: newCorrectIdx
  };
}

export function calculateScore10(correctCount: number, totalCount: number): number {
  if (!totalCount || totalCount <= 0) return 0;
  return Number(((correctCount / totalCount) * 10).toFixed(2));
}

export function calculateStreak(historyList: Array<{ date?: string; submittedAt?: string }>): number {
  if (!Array.isArray(historyList) || historyList.length === 0) return 0;
  const distinctDates = new Set<string>();
  historyList.forEach(item => {
    if (item.date) {
      const d = item.date.split(' ')[0] || item.date;
      distinctDates.add(d);
    } else if (item.submittedAt) {
      const d = item.submittedAt.split('T')[0];
      distinctDates.add(d);
    }
  });
  return Math.max(1, distinctDates.size);
}

export function classifyQuestionSkill(q: {
  section?: string;
  question?: string;
  type?: string;
  passage?: string;
}): 'pronunciation' | 'vocabulary' | 'grammar' | 'reading' | 'writing' {
  const section = String(q.section || '').toLowerCase();

  if (
    section.includes('pronunciation') ||
    section.includes('phát âm') ||
    section.includes('ngữ âm') ||
    section.includes('stress')
  ) {
    return 'pronunciation';
  }
  if (
    section.includes('grammar') ||
    section.includes('ngữ pháp') ||
    section.includes('tenses') ||
    section.includes('preposition')
  ) {
    return 'grammar';
  }
  if (
    section.includes('reading') ||
    section.includes('đọc hiểu') ||
    section.includes('cloze') ||
    Boolean(q.passage)
  ) {
    return 'reading';
  }
  if (
    section.includes('writing') ||
    section.includes('viết lại câu') ||
    section.includes('written') ||
    q.type === 'word-form' ||
    q.type === 'rewrite'
  ) {
    return 'writing';
  }
  return 'vocabulary';
}

export interface SkillCompetency {
  total: number;
  correct: number;
  percentage: number;
}

export function compute5SkillRadar(
  attemptsList: Array<{
    answersDetails?: Array<{ question?: any; isCorrect?: boolean; section?: string }>;
  }>
): Record<'pronunciation' | 'vocabulary' | 'grammar' | 'reading' | 'writing', SkillCompetency> {
  const skills: Record<
    'pronunciation' | 'vocabulary' | 'grammar' | 'reading' | 'writing',
    SkillCompetency
  > = {
    pronunciation: { total: 0, correct: 0, percentage: 0 },
    vocabulary: { total: 0, correct: 0, percentage: 0 },
    grammar: { total: 0, correct: 0, percentage: 0 },
    reading: { total: 0, correct: 0, percentage: 0 },
    writing: { total: 0, correct: 0, percentage: 0 }
  };

  if (!Array.isArray(attemptsList)) return skills;

  attemptsList.forEach(attempt => {
    const detailedAnswers = attempt.answersDetails || [];
    detailedAnswers.forEach(ans => {
      const skill = classifyQuestionSkill(ans.question || ans);
      skills[skill].total++;
      if (ans.isCorrect) {
        skills[skill].correct++;
      }
    });
  });

  for (const key of Object.keys(skills) as Array<keyof typeof skills>) {
    const item = skills[key];
    item.percentage = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
  }

  return skills;
}

export function generateSmartAdaptiveQuiz(
  mistakes: MistakeItem[],
  bankQuestions: UnitQuestion[],
  desiredCount: number = 20
): UnitQuestion[] {
  const unresolvedMistakes = mistakes.filter(m => !m.resolved);
  const mistakeQuestions = unresolvedMistakes.map(m => m.question);

  const mistakeTarget = Math.min(
    Math.round(desiredCount * 0.7),
    mistakeQuestions.length
  );
  const shuffledMistakes = shuffleArray(mistakeQuestions);
  const selectedMistakes = shuffledMistakes.slice(0, mistakeTarget);

  const remainingNeeded = desiredCount - selectedMistakes.length;
  const existingIds = new Set(selectedMistakes.map(q => q.id));
  const candidateBank = bankQuestions.filter(q => !existingIds.has(q.id));
  const shuffledBank = shuffleArray(candidateBank);
  const selectedBank = shuffledBank.slice(0, remainingNeeded);

  const combined = shuffleArray([...selectedMistakes, ...selectedBank]);
  return combined.map(q => cloneAndShuffleOptions(q));
}
