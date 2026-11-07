import { unitsData } from '../data/units';
import { examsData } from '../data/exams';
import { UnitQuestion, VocabularyItem } from '../types/curriculum';
import { getStudentSnapshot } from './storageService';

export type GameType =
  | 'word_match'
  | 'meteor_strike'
  | 'sentence_scrambler'
  | 'quiz_show'
  | 'phonetics_sorter';

export interface GameSessionRecord {
  id: string;
  gameType: GameType;
  gameTitle: string;
  score: number;
  xpEarned: number;
  comboMax: number;
  accuracy: number;
  date: string;
}

export interface GameStats {
  xp: number;
  gamesPlayed: number;
  bestCombo: number;
  highScores: Record<GameType, number>;
  unlockedBadges: string[];
  recentSessions: GameSessionRecord[];
}

export interface PlayerRank {
  level: number;
  title: string;
  icon: string;
  minXp: number;
  nextXp: number;
  progressPercent: number;
}

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export const GAME_BADGES: BadgeDefinition[] = [
  {
    id: 'first_game',
    title: 'Khởi Đầu Hứng Khởi',
    description: 'Hoàn thành ván trò chơi học tập đầu tiên',
    icon: '🎮',
    color: 'indigo'
  },
  {
    id: 'combo_master',
    title: 'Chuỗi Combo Bất Bại',
    description: 'Đạt chuỗi Combo từ 5 câu đúng liên tiếp trở lên',
    icon: '🔥',
    color: 'amber'
  },
  {
    id: 'word_blitz_pro',
    title: 'Tia Chớp Từ Vựng',
    description: 'Đạt trên 500 điểm trong trò chơi Ghép Cặp Siêu Tốc',
    icon: '⚡',
    color: 'emerald'
  },
  {
    id: 'meteor_defender',
    title: 'Xạ Thủ Ngân Hà',
    description: 'Bắn hạ thành công 10 thiên thạch từ vựng trong Mưa Sao Băng',
    icon: '🚀',
    color: 'purple'
  },
  {
    id: 'grammar_architect',
    title: 'Kiến Trúc Sư Ngữ Pháp',
    description: 'Hoàn thành xuất sắc thử thách Bậc Thầy Sắp Xếp Câu',
    icon: '🧩',
    color: 'blue'
  },
  {
    id: 'millionaire_scholar',
    title: 'Quán Quân Đấu Trường',
    description: 'Đạt trên 800 điểm trong Đấu Trường Tri Thức',
    icon: '👑',
    color: 'rose'
  },
  {
    id: 'golden_ear',
    title: 'Đôi Tai Vàng Ngữ Âm',
    description: 'Phân loại chính xác ngữ âm trong Phonetics Sorter',
    icon: '🎧',
    color: 'teal'
  }
];

const RANKS = [
  { level: 1, title: 'Tân Binh Lớp 8', icon: '🌱', minXp: 0, nextXp: 200 },
  { level: 2, title: 'Học Giả Chăm Chỉ', icon: '📘', minXp: 200, nextXp: 500 },
  { level: 3, title: 'Chiến Binh Từ Vựng', icon: '⚔️', minXp: 500, nextXp: 1000 },
  { level: 4, title: 'Kỵ Sĩ Ngữ Pháp', icon: '🛡️', minXp: 1000, nextXp: 2000 },
  { level: 5, title: 'Cao Thủ Toàn Năng', icon: '🔥', minXp: 2000, nextXp: 3500 },
  { level: 6, title: 'Thủ Khoa Tuyển Sinh 10', icon: '👑', minXp: 3500, nextXp: 10000 }
];

const STORAGE_PREFIX = 'ey8_game_stats_';

export function getPlayerRank(xp: number): PlayerRank {
  const safeXp = Math.max(0, Math.floor(xp || 0));
  let matched = RANKS[0];
  for (const r of RANKS) {
    if (safeXp >= r.minXp) {
      matched = r;
    }
  }
  const span = Math.max(1, matched.nextXp - matched.minXp);
  const currentInSpan = Math.min(span, Math.max(0, safeXp - matched.minXp));
  const progressPercent = matched.level === 6 ? 100 : Math.round((currentInSpan / span) * 100);

  return {
    ...matched,
    progressPercent
  };
}

export function getGameStats(username = 'em_lop8'): GameStats {
  const key = `${STORAGE_PREFIX}${username}`;
  const defaultStats: GameStats = {
    xp: 0,
    gamesPlayed: 0,
    bestCombo: 0,
    highScores: {
      word_match: 0,
      meteor_strike: 0,
      sentence_scrambler: 0,
      quiz_show: 0,
      phonetics_sorter: 0
    },
    unlockedBadges: [],
    recentSessions: []
  };

  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    const snapshot = getStudentSnapshot(username);
    // Calculate base study XP from learned vocabulary and completed exams
    const studyXp = (snapshot.learnedVocab?.length || 0) * 5 + (snapshot.examHistory?.length || 0) * 25;

    if (!raw) {
      return {
        ...defaultStats,
        xp: studyXp
      };
    }

    const parsed = JSON.parse(raw);
    return {
      xp: Math.max(Number(parsed.xp) || 0, studyXp),
      gamesPlayed: Number(parsed.gamesPlayed) || 0,
      bestCombo: Number(parsed.bestCombo) || 0,
      highScores: {
        ...defaultStats.highScores,
        ...(parsed.highScores || {})
      },
      unlockedBadges: Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : [],
      recentSessions: Array.isArray(parsed.recentSessions) ? parsed.recentSessions.slice(0, 15) : []
    };
  } catch {
    return defaultStats;
  }
}

export function recordGameSession(
  username: string,
  session: Omit<GameSessionRecord, 'id' | 'date'>
): GameStats {
  const current = getGameStats(username);
  const newXp = current.xp + Math.max(0, session.xpEarned);
  const newGamesPlayed = current.gamesPlayed + 1;
  const newBestCombo = Math.max(current.bestCombo, session.comboMax);
  const prevHigh = current.highScores[session.gameType] || 0;
  const newHighScores = {
    ...current.highScores,
    [session.gameType]: Math.max(prevHigh, session.score)
  };

  const badges = new Set<string>(current.unlockedBadges);
  badges.add('first_game');
  if (newBestCombo >= 5) badges.add('combo_master');
  if (session.gameType === 'word_match' && session.score >= 500) badges.add('word_blitz_pro');
  if (session.gameType === 'meteor_strike' && session.score >= 400) badges.add('meteor_defender');
  if (session.gameType === 'sentence_scrambler' && session.score >= 400) badges.add('grammar_architect');
  if (session.gameType === 'quiz_show' && session.score >= 800) badges.add('millionaire_scholar');
  if (session.gameType === 'phonetics_sorter' && session.score >= 400) badges.add('golden_ear');

  const record: GameSessionRecord = {
    ...session,
    id: `gs_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    date: new Date().toISOString()
  };

  const updated: GameStats = {
    xp: newXp,
    gamesPlayed: newGamesPlayed,
    bestCombo: newBestCombo,
    highScores: newHighScores,
    unlockedBadges: Array.from(badges),
    recentSessions: [record, ...current.recentSessions].slice(0, 15)
  };

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`${STORAGE_PREFIX}${username}`, JSON.stringify(updated));
    }
  } catch {
    // ignore quota errors
  }

  return updated;
}

// Helper to shuffle an array
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Helper to filter units by scope ('all' | 'sem1' | 'sem2' | 'unit-1'...)
function getUnitsByScope(scope: string) {
  if (!scope || scope === 'all') return unitsData;
  if (scope === 'sem1') return unitsData.filter(u => (u.semester || (Number(u.number) <= 6 ? 1 : 2)) === 1);
  if (scope === 'sem2') return unitsData.filter(u => (u.semester || (Number(u.number) <= 6 ? 1 : 2)) === 2);
  const filtered = unitsData.filter(u => u.id === scope || String(u.number) === scope);
  return filtered.length > 0 ? filtered : unitsData;
}

// 1. WORD MATCH BLITZ GENERATOR
export interface WordMatchCard {
  id: string;
  pairId: string;
  cardType: 'en' | 'vi';
  displayMain: string;
  displaySub: string;
  englishWord: string;
}

export function generateWordMatchDeck(unitScope = 'all', pairCount = 6): WordMatchCard[] {
  const units = getUnitsByScope(unitScope);
  const allVocab: VocabularyItem[] = units.flatMap(u => u.vocab || []);
  const selected = shuffleArray(allVocab).slice(0, Math.min(pairCount, allVocab.length));

  const cards: WordMatchCard[] = [];
  selected.forEach(v => {
    cards.push({
      id: `${v.id}_en`,
      pairId: v.id,
      cardType: 'en',
      displayMain: v.word,
      displaySub: `${v.ipa} (${v.type})`,
      englishWord: v.word
    });
    cards.push({
      id: `${v.id}_vi`,
      pairId: v.id,
      cardType: 'vi',
      displayMain: v.meaning,
      displaySub: 'Nghĩa tiếng Việt',
      englishWord: v.word
    });
  });

  return shuffleArray(cards);
}

// 2. METEOR STRIKE GENERATOR
export interface MeteorChallenge {
  id: string;
  word: string;
  ipa: string;
  meaning: string;
  options: string[];
}

export function generateMeteorChallenges(unitScope = 'all', count = 12): MeteorChallenge[] {
  const units = getUnitsByScope(unitScope);
  const allVocab: VocabularyItem[] = units.flatMap(u => u.vocab || []);
  const allWords = allVocab.map(v => v.word);
  const picked = shuffleArray(allVocab).slice(0, Math.min(count, allVocab.length));

  return picked.map(v => {
    const distractors = shuffleArray(allWords.filter(w => w.toLowerCase() !== v.word.toLowerCase())).slice(0, 3);
    const options = shuffleArray([v.word, ...distractors]);
    return {
      id: v.id,
      word: v.word,
      ipa: v.ipa,
      meaning: v.meaning,
      options
    };
  });
}

// 3. SENTENCE SCRAMBLER GENERATOR
export interface ScrambleChallenge {
  id: string;
  originalSentence: string;
  words: string[];
  scrambledWords: string[];
  meaningVi: string;
  hint: string;
}

export function generateScrambleChallenges(unitScope = 'all', count = 8): ScrambleChallenge[] {
  const units = getUnitsByScope(unitScope);
  const candidates: ScrambleChallenge[] = [];

  units.forEach(u => {
    (u.vocab || []).forEach(v => {
      if (v.example && v.exampleVi) {
        const cleanSentence = v.example.trim();
        const words = cleanSentence.split(/\s+/).filter(Boolean);
        if (words.length >= 5 && words.length <= 14) {
          let scrambled = shuffleArray(words);
          if (scrambled.join(' ') === words.join(' ') && words.length > 1) {
            scrambled = [...words.slice(1), words[0]];
          }
          candidates.push({
            id: `scr_${v.id}`,
            originalSentence: cleanSentence,
            words,
            scrambledWords: scrambled,
            meaningVi: v.exampleVi,
            hint: `Từ khóa trọng tâm: "${v.word}" (${v.meaning})`
          });
        }
      }
    });
  });

  return shuffleArray(candidates).slice(0, Math.min(count, candidates.length));
}

// 4. SPEED QUIZ SHOW GENERATOR
export function generateQuizShowQuestions(unitScope = 'all', count = 15): UnitQuestion[] {
  const units = getUnitsByScope(unitScope);
  const pool: UnitQuestion[] = [];
  units.forEach(u => pool.push(...(u.quiz || [])));

  if (unitScope === 'all') {
    examsData.forEach(e => pool.push(...(e.questions || []).filter(q => !q.passage)));
  }

  return shuffleArray(pool).slice(0, Math.min(count, pool.length));
}

// 5. PHONETICS SORTER GENERATOR
export interface PhoneticsChallenge {
  id: string;
  wordDisplay: string;
  cleanWord: string;
  correctBucket: string;
  bucketA: string;
  bucketB: string;
  unitTitle: string;
  guide: string;
}

export function generatePhoneticsChallenges(unitScope = 'all', count = 12): PhoneticsChallenge[] {
  const units = getUnitsByScope(unitScope);
  const items: PhoneticsChallenge[] = [];

  units.forEach(u => {
    const explanations = u.pronunciation?.explanation || [];
    if (explanations.length >= 2) {
      const soundA = explanations[0];
      const soundB = explanations[1];
      const bucketA = soundA.sound;
      const bucketB = soundB.sound;

      (soundA.examples || []).forEach((ex, idx) => {
        const cleanWord = ex.split('/')[0].replace(/[↗↘]/g, '').trim();
        items.push({
          id: `ph_${u.id}_a_${idx}`,
          wordDisplay: cleanWord,
          cleanWord,
          correctBucket: bucketA,
          bucketA,
          bucketB,
          unitTitle: `Unit ${u.number || u.id}: ${u.title}`,
          guide: `${bucketA}: ${soundA.guide || soundA.desc || ''}`
        });
      });

      (soundB.examples || []).forEach((ex, idx) => {
        const cleanWord = ex.split('/')[0].replace(/[↗↘]/g, '').trim();
        items.push({
          id: `ph_${u.id}_b_${idx}`,
          wordDisplay: cleanWord,
          cleanWord,
          correctBucket: bucketB,
          bucketA,
          bucketB,
          unitTitle: `Unit ${u.number || u.id}: ${u.title}`,
          guide: `${bucketB}: ${soundB.guide || soundB.desc || ''}`
        });
      });
    }
  });

  return shuffleArray(items).slice(0, Math.min(count, items.length));
}
