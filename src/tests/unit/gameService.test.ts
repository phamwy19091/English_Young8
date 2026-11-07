import { describe, it, expect, beforeEach } from 'vitest';
import {
  getPlayerRank,
  getGameStats,
  recordGameSession,
  generateWordMatchDeck,
  generateMeteorChallenges,
  generateScrambleChallenges,
  generateQuizShowQuestions,
  generatePhoneticsChallenges
} from '../../services/gameService';

// In-memory localStorage mock for Node vitest environment
class LocalStorageMock {
  private store: Record<string, string> = {};
  clear() { this.store = {}; }
  getItem(key: string): string | null { return this.store[key] ?? null; }
  setItem(key: string, value: string): void { this.store[key] = String(value); }
  removeItem(key: string): void { delete this.store[key]; }
}
Object.defineProperty(globalThis, 'localStorage', {
  value: new LocalStorageMock(),
  writable: true,
});

describe('Game Service & Edutainment Arcade Logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. should accurately compute player rank and level progression', () => {
    const r1 = getPlayerRank(0);
    expect(r1.level).toBe(1);
    expect(r1.title).toBe('Tân Binh Lớp 8');

    const r3 = getPlayerRank(650);
    expect(r3.level).toBe(3);
    expect(r3.title).toBe('Chiến Binh Từ Vựng');

    const r6 = getPlayerRank(4000);
    expect(r6.level).toBe(6);
    expect(r6.title).toBe('Thủ Khoa Tuyển Sinh 10');
    expect(r6.progressPercent).toBe(100);
  });

  it('2. should generate balanced Word Match Blitz decks with matching pairs', () => {
    const deck = generateWordMatchDeck('all', 6);
    expect(deck).toHaveLength(12);

    const enCards = deck.filter(c => c.cardType === 'en');
    const viCards = deck.filter(c => c.cardType === 'vi');
    expect(enCards).toHaveLength(6);
    expect(viCards).toHaveLength(6);
  });

  it('3. should generate Meteor Strike challenges with 4 options including the correct word', () => {
    const meteors = generateMeteorChallenges('sem2', 8);
    expect(meteors).toHaveLength(8);
    meteors.forEach(m => {
      expect(m.options).toHaveLength(4);
      expect(m.options).toContain(m.word);
      expect(m.meaning).toBeTruthy();
    });
  });

  it('4. should generate Sentence Scrambler challenges with scrambled word tiles', () => {
    const scrambles = generateScrambleChallenges('unit-8', 5);
    expect(scrambles.length).toBeGreaterThan(0);
    scrambles.forEach(s => {
      expect(s.words.length).toBeGreaterThanOrEqual(5);
      expect(s.scrambledWords).toHaveLength(s.words.length);
      expect(s.meaningVi).toBeTruthy();
    });
  });

  it('5. should generate Speed Quiz Show questions from curriculum and exams', () => {
    const questions = generateQuizShowQuestions('all', 12);
    expect(questions).toHaveLength(12);
    questions.forEach(q => {
      expect(q.options).toHaveLength(4);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(4);
    });
  });

  it('6. should generate Phonetics Sorter challenges with two distinct buckets', () => {
    const phonetics = generatePhoneticsChallenges('sem1', 10);
    expect(phonetics).toHaveLength(10);
    phonetics.forEach(p => {
      expect(p.bucketA).toBeTruthy();
      expect(p.bucketB).toBeTruthy();
      expect([p.bucketA, p.bucketB]).toContain(p.correctBucket);
    });
  });

  it('7. should persist game sessions, accumulate XP, and unlock badges', () => {
    const initial = getGameStats('test_gamer');
    expect(initial.gamesPlayed).toBe(0);

    const updated = recordGameSession('test_gamer', {
      gameType: 'word_match',
      gameTitle: 'Ghép Cặp Siêu Tốc',
      score: 620,
      xpEarned: 85,
      comboMax: 6,
      accuracy: 95
    });

    expect(updated.gamesPlayed).toBe(1);
    expect(updated.xp).toBeGreaterThanOrEqual(85);
    expect(updated.bestCombo).toBe(6);
    expect(updated.highScores.word_match).toBe(620);
    expect(updated.unlockedBadges).toContain('first_game');
    expect(updated.unlockedBadges).toContain('combo_master');
    expect(updated.unlockedBadges).toContain('word_blitz_pro');
  });
});
