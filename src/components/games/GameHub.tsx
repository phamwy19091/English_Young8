import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { unitsData } from '../../data/units';
import { speakWord, speakEnglish } from '../../services/speechService';
import {
  GameType,
  GameStats,
  GAME_BADGES,
  getGameStats,
  getPlayerRank,
  recordGameSession,
  generateWordMatchDeck,
  generateMeteorChallenges,
  generateScrambleChallenges,
  generateQuizShowQuestions,
  generatePhoneticsChallenges,
  WordMatchCard,
  MeteorChallenge,
  ScrambleChallenge,
  PhoneticsChallenge
} from '../../services/gameService';
import { UnitQuestion } from '../../types/curriculum';
import {
  Gamepad2,
  Zap,
  Rocket,
  Puzzle,
  Trophy,
  Headphones,
  Flame,
  Volume2,
  RotateCcw,
  ArrowLeft,
  Sparkles,
  Heart,
  Clock,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Snowflake,
  Divide,
  Award
} from 'lucide-react';

export const GameHub: React.FC = () => {
  const { user } = useAuth();
  const username = user?.username || 'em_lop8';

  const [stats, setStats] = useState<GameStats>(() => getGameStats(username));
  const [unitScope, setUnitScope] = useState<string>('all');
  const [activeGame, setActiveGame] = useState<GameType | null>(null);

  // Shared game finish state
  const [gameEnded, setGameEnded] = useState(false);
  const [lastResult, setLastResult] = useState<{
    title: string;
    score: number;
    xpEarned: number;
    comboMax: number;
    accuracy: number;
  } | null>(null);

  // ============================================================================
  // GAME 1: WORD MATCH BLITZ STATE
  // ============================================================================
  const [matchCards, setMatchCards] = useState<WordMatchCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<WordMatchCard | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [wrongPairIds, setWrongPairIds] = useState<string[]>([]);
  const [matchScore, setMatchScore] = useState(0);
  const [matchCombo, setMatchCombo] = useState(0);
  const [matchMaxCombo, setMatchMaxCombo] = useState(0);
  const [matchAttempts, setMatchAttempts] = useState(0);
  const [matchSeconds, setMatchSeconds] = useState(0);

  // ============================================================================
  // GAME 2: METEOR STRIKE STATE
  // ============================================================================
  const [meteors, setMeteors] = useState<MeteorChallenge[]>([]);
  const [meteorIdx, setMeteorIdx] = useState(0);
  const [meteorLives, setMeteorLives] = useState(3);
  const [meteorScore, setMeteorScore] = useState(0);
  const [meteorCombo, setMeteorCombo] = useState(0);
  const [meteorMaxCombo, setMeteorMaxCombo] = useState(0);
  const [meteorHits, setMeteorHits] = useState(0);
  const [meteorFallProgress, setMeteorFallProgress] = useState(0);
  const [meteorFeedback, setMeteorFeedback] = useState<'hit' | 'miss' | null>(null);

  // ============================================================================
  // GAME 3: SENTENCE SCRAMBLER STATE
  // ============================================================================
  const [scrambles, setScrambles] = useState<ScrambleChallenge[]>([]);
  const [scrambleIdx, setScrambleIdx] = useState(0);
  const [availableTiles, setAvailableTiles] = useState<Array<{ id: string; text: string }>>([]);
  const [selectedTiles, setSelectedTiles] = useState<Array<{ id: string; text: string }>>([]);
  const [scrambleScore, setScrambleScore] = useState(0);
  const [scrambleCombo, setScrambleCombo] = useState(0);
  const [scrambleMaxCombo, setScrambleMaxCombo] = useState(0);
  const [scrambleCorrectCount, setScrambleCorrectCount] = useState(0);
  const [scrambleStatus, setScrambleStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  // ============================================================================
  // GAME 4: SPEED QUIZ SHOW STATE
  // ============================================================================
  const [quizList, setQuizList] = useState<UnitQuestion[]>([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizLives, setQuizLives] = useState(3);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCombo, setQuizCombo] = useState(0);
  const [quizMaxCombo, setQuizMaxCombo] = useState(0);
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);
  const [quizTimeLeft, setQuizTimeLeft] = useState(15);
  const [quizFrozen, setQuizFrozen] = useState(false);
  const [quizSelectedOpt, setQuizSelectedOpt] = useState<number | null>(null);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [showAiHint, setShowAiHint] = useState(false);
  const [lifelines, setLifelines] = useState({ fifty: true, freeze: true, aiHint: true });

  // ============================================================================
  // GAME 5: PHONETICS SORTER STATE
  // ============================================================================
  const [phoneticsList, setPhoneticsList] = useState<PhoneticsChallenge[]>([]);
  const [phoneticsIdx, setPhoneticsIdx] = useState(0);
  const [phoneticsScore, setPhoneticsScore] = useState(0);
  const [phoneticsCombo, setPhoneticsCombo] = useState(0);
  const [phoneticsMaxCombo, setPhoneticsMaxCombo] = useState(0);
  const [phoneticsCorrectCount, setPhoneticsCorrectCount] = useState(0);
  const [phoneticsFeedback, setPhoneticsFeedback] = useState<{
    correct: boolean;
    chosenBucket: string;
  } | null>(null);

  useEffect(() => {
    setStats(getGameStats(username));
  }, [username]);

  const finishCurrentGame = (
    gameType: GameType,
    gameTitle: string,
    score: number,
    comboMax: number,
    accuracy: number
  ) => {
    const xpEarned = Math.max(15, Math.round(score / 10) + comboMax * 5);
    const updated = recordGameSession(username, {
      gameType,
      gameTitle,
      score,
      xpEarned,
      comboMax,
      accuracy
    });
    setStats(updated);
    setLastResult({ title: gameTitle, score, xpEarned, comboMax, accuracy });
    setGameEnded(true);
  };

  // ============================================================================
  // START GAME HANDLERS
  // ============================================================================
  const startWordMatch = () => {
    const deck = generateWordMatchDeck(unitScope, 6);
    setMatchCards(deck);
    setSelectedCard(null);
    setMatchedPairIds([]);
    setWrongPairIds([]);
    setMatchScore(0);
    setMatchCombo(0);
    setMatchMaxCombo(0);
    setMatchAttempts(0);
    setMatchSeconds(0);
    setGameEnded(false);
    setActiveGame('word_match');
  };

  const startMeteorStrike = () => {
    const list = generateMeteorChallenges(unitScope, 10);
    setMeteors(list);
    setMeteorIdx(0);
    setMeteorLives(3);
    setMeteorScore(0);
    setMeteorCombo(0);
    setMeteorMaxCombo(0);
    setMeteorHits(0);
    setMeteorFallProgress(0);
    setMeteorFeedback(null);
    setGameEnded(false);
    setActiveGame('meteor_strike');
  };

  const initScrambleRound = (challenge: ScrambleChallenge) => {
    setAvailableTiles(
      challenge.scrambledWords.map((w, i) => ({ id: `tile_${i}_${w}`, text: w }))
    );
    setSelectedTiles([]);
    setScrambleStatus('idle');
  };

  const startSentenceScrambler = () => {
    const list = generateScrambleChallenges(unitScope, 6);
    setScrambles(list);
    setScrambleIdx(0);
    setScrambleScore(0);
    setScrambleCombo(0);
    setScrambleMaxCombo(0);
    setScrambleCorrectCount(0);
    setGameEnded(false);
    if (list.length > 0) {
      initScrambleRound(list[0]);
    }
    setActiveGame('sentence_scrambler');
  };

  const startQuizShow = () => {
    const list = generateQuizShowQuestions(unitScope, 12);
    setQuizList(list);
    setQuizIdx(0);
    setQuizLives(3);
    setQuizScore(0);
    setQuizCombo(0);
    setQuizMaxCombo(0);
    setQuizCorrectCount(0);
    setQuizTimeLeft(15);
    setQuizFrozen(false);
    setQuizSelectedOpt(null);
    setHiddenOptions([]);
    setShowAiHint(false);
    setLifelines({ fifty: true, freeze: true, aiHint: true });
    setGameEnded(false);
    setActiveGame('quiz_show');
  };

  const startPhoneticsSorter = () => {
    const list = generatePhoneticsChallenges(unitScope, 10);
    setPhoneticsList(list);
    setPhoneticsIdx(0);
    setPhoneticsScore(0);
    setPhoneticsCombo(0);
    setPhoneticsMaxCombo(0);
    setPhoneticsCorrectCount(0);
    setPhoneticsFeedback(null);
    setGameEnded(false);
    setActiveGame('phonetics_sorter');
  };

  // ============================================================================
  // TIMERS FOR GAMES
  // ============================================================================
  // Timer for Word Match
  useEffect(() => {
    if (activeGame !== 'word_match' || gameEnded) return;
    const timer = setInterval(() => {
      setMatchSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeGame, gameEnded]);

  // Timer for Meteor Strike falling animation
  useEffect(() => {
    if (activeGame !== 'meteor_strike' || gameEnded || meteorFeedback !== null) return;
    const speedStep = 2 + Math.floor(meteorIdx / 3) * 0.5;
    const interval = setInterval(() => {
      setMeteorFallProgress(prev => {
        if (prev + speedStep >= 100) {
          // Meteor hit ground!
          handleMeteorAnswer('');
          return 100;
        }
        return prev + speedStep;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [activeGame, gameEnded, meteorIdx, meteorFeedback]);

  // Timer for Quiz Show
  useEffect(() => {
    if (activeGame !== 'quiz_show' || gameEnded || quizSelectedOpt !== null || quizFrozen) return;
    const timer = setInterval(() => {
      setQuizTimeLeft(prev => {
        if (prev <= 1) {
          handleQuizOptionSelect(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeGame, gameEnded, quizIdx, quizSelectedOpt, quizFrozen]);

  // ============================================================================
  // GAME 1 LOGIC: WORD MATCH BLITZ
  // ============================================================================
  const handleCardClick = (card: WordMatchCard) => {
    if (matchedPairIds.includes(card.pairId) || wrongPairIds.length > 0) return;

    if (card.cardType === 'en') {
      speakWord(card.englishWord);
    }

    if (!selectedCard) {
      setSelectedCard(card);
      return;
    }

    if (selectedCard.id === card.id) {
      setSelectedCard(null);
      return;
    }

    setMatchAttempts(a => a + 1);

    if (selectedCard.pairId === card.pairId && selectedCard.cardType !== card.cardType) {
      // Correct match!
      const newMatched = [...matchedPairIds, card.pairId];
      const newCombo = matchCombo + 1;
      const newMaxCombo = Math.max(matchMaxCombo, newCombo);
      const points = 100 + newCombo * 25;
      const newScore = matchScore + points;

      setMatchedPairIds(newMatched);
      setMatchCombo(newCombo);
      setMatchMaxCombo(newMaxCombo);
      setMatchScore(newScore);
      setSelectedCard(null);

      const totalPairs = matchCards.length / 2;
      if (newMatched.length >= totalPairs) {
        const timeBonus = Math.max(0, (60 - matchSeconds) * 5);
        const finalScore = newScore + timeBonus;
        const acc = Math.round((totalPairs / Math.max(totalPairs, matchAttempts + 1)) * 100);
        setTimeout(() => {
          finishCurrentGame('word_match', 'Ghép Cặp Siêu Tốc', finalScore, newMaxCombo, acc);
        }, 400);
      }
    } else {
      // Wrong match
      setMatchCombo(0);
      setWrongPairIds([selectedCard.id, card.id]);
      setTimeout(() => {
        setWrongPairIds([]);
        setSelectedCard(null);
      }, 650);
    }
  };

  // ============================================================================
  // GAME 2 LOGIC: METEOR STRIKE
  // ============================================================================
  const handleMeteorAnswer = (chosenWord: string) => {
    if (meteorFeedback !== null || gameEnded) return;
    const current = meteors[meteorIdx];
    if (!current) return;

    const isHit = chosenWord.trim().toLowerCase() === current.word.trim().toLowerCase();
    if (isHit) {
      speakWord(current.word);
      const newCombo = meteorCombo + 1;
      const newMax = Math.max(meteorMaxCombo, newCombo);
      const speedBonus = Math.round((100 - meteorFallProgress) * 0.5);
      const newScore = meteorScore + 80 + newCombo * 15 + speedBonus;
      const newHits = meteorHits + 1;

      setMeteorFeedback('hit');
      setMeteorCombo(newCombo);
      setMeteorMaxCombo(newMax);
      setMeteorScore(newScore);
      setMeteorHits(newHits);

      setTimeout(() => {
        if (meteorIdx + 1 >= meteors.length) {
          const acc = Math.round((newHits / meteors.length) * 100);
          finishCurrentGame('meteor_strike', 'Mưa Sao Băng Từ Vựng', newScore, newMax, acc);
        } else {
          setMeteorIdx(i => i + 1);
          setMeteorFallProgress(0);
          setMeteorFeedback(null);
        }
      }, 700);
    } else {
      const nextLives = meteorLives - 1;
      setMeteorFeedback('miss');
      setMeteorCombo(0);
      setMeteorLives(nextLives);

      setTimeout(() => {
        if (nextLives <= 0 || meteorIdx + 1 >= meteors.length) {
          const acc = Math.round((meteorHits / Math.max(1, meteorIdx + 1)) * 100);
          finishCurrentGame('meteor_strike', 'Mưa Sao Băng Từ Vựng', meteorScore, meteorMaxCombo, acc);
        } else {
          setMeteorIdx(i => i + 1);
          setMeteorFallProgress(0);
          setMeteorFeedback(null);
        }
      }, 900);
    }
  };

  // ============================================================================
  // GAME 3 LOGIC: SENTENCE SCRAMBLER
  // ============================================================================
  const handleSelectTile = (tile: { id: string; text: string }) => {
    if (scrambleStatus !== 'idle') return;
    setAvailableTiles(prev => prev.filter(t => t.id !== tile.id));
    setSelectedTiles(prev => [...prev, tile]);
  };

  const handleRemoveTile = (tile: { id: string; text: string }) => {
    if (scrambleStatus !== 'idle') return;
    setSelectedTiles(prev => prev.filter(t => t.id !== tile.id));
    setAvailableTiles(prev => [...prev, tile]);
  };

  const handleScrambleHint = () => {
    const current = scrambles[scrambleIdx];
    if (!current || scrambleStatus !== 'idle') return;
    const nextCorrectIdx = selectedTiles.length;
    const targetWord = current.words[nextCorrectIdx];
    if (!targetWord) return;

    const matchingTile = availableTiles.find(t => t.text === targetWord);
    if (matchingTile) {
      handleSelectTile(matchingTile);
    }
  };

  const handleCheckScramble = () => {
    const current = scrambles[scrambleIdx];
    if (!current || scrambleStatus !== 'idle') return;

    const userSentence = selectedTiles.map(t => t.text).join(' ').trim();
    const isCorrect =
      userSentence.toLowerCase().replace(/[.,!?]/g, '') ===
      current.originalSentence.toLowerCase().replace(/[.,!?]/g, '');

    if (isCorrect) {
      speakEnglish(current.originalSentence);
      const newCombo = scrambleCombo + 1;
      const newMax = Math.max(scrambleMaxCombo, newCombo);
      const newScore = scrambleScore + 120 + newCombo * 20;
      const newCorrect = scrambleCorrectCount + 1;

      setScrambleStatus('correct');
      setScrambleCombo(newCombo);
      setScrambleMaxCombo(newMax);
      setScrambleScore(newScore);
      setScrambleCorrectCount(newCorrect);
    } else {
      setScrambleStatus('wrong');
      setScrambleCombo(0);
    }
  };

  const handleNextScramble = () => {
    if (scrambleIdx + 1 >= scrambles.length) {
      const acc = Math.round((scrambleCorrectCount / Math.max(1, scrambles.length)) * 100);
      finishCurrentGame(
        'sentence_scrambler',
        'Bậc Thầy Sắp Xếp Câu',
        scrambleScore,
        scrambleMaxCombo,
        acc
      );
    } else {
      const next = scrambles[scrambleIdx + 1];
      setScrambleIdx(i => i + 1);
      initScrambleRound(next);
    }
  };

  // ============================================================================
  // GAME 4 LOGIC: SPEED QUIZ SHOW
  // ============================================================================
  const handleQuizOptionSelect = (optIdx: number) => {
    if (quizSelectedOpt !== null || gameEnded) return;
    const current = quizList[quizIdx];
    if (!current) return;

    setQuizSelectedOpt(optIdx);
    const isCorrect = optIdx === current.answer;

    if (isCorrect) {
      const newCombo = quizCombo + 1;
      const newMax = Math.max(quizMaxCombo, newCombo);
      const timeBonus = quizTimeLeft * 4;
      const newScore = quizScore + 100 + newCombo * 20 + timeBonus;
      const newCorrect = quizCorrectCount + 1;

      setQuizCombo(newCombo);
      setQuizMaxCombo(newMax);
      setQuizScore(newScore);
      setQuizCorrectCount(newCorrect);
    } else {
      setQuizCombo(0);
      setQuizLives(l => l - 1);
    }
  };

  const handleNextQuizQuestion = () => {
    const remainingLives = quizSelectedOpt === quizList[quizIdx]?.answer ? quizLives : quizLives;
    if (remainingLives <= 0 || quizIdx + 1 >= quizList.length) {
      const acc = Math.round((quizCorrectCount / Math.max(1, quizIdx + 1)) * 100);
      finishCurrentGame('quiz_show', 'Đấu Trường Tri Thức', quizScore, quizMaxCombo, acc);
    } else {
      setQuizIdx(i => i + 1);
      setQuizSelectedOpt(null);
      setQuizTimeLeft(15);
      setQuizFrozen(false);
      setHiddenOptions([]);
      setShowAiHint(false);
    }
  };

  const useFiftyFifty = () => {
    const current = quizList[quizIdx];
    if (!current || !lifelines.fifty || quizSelectedOpt !== null) return;
    const wrongIndices = [0, 1, 2, 3].filter(i => i !== current.answer);
    const toHide = wrongIndices.slice(0, 2);
    setHiddenOptions(toHide);
    setLifelines(prev => ({ ...prev, fifty: false }));
  };

  const useFreezeTime = () => {
    if (!lifelines.freeze || quizSelectedOpt !== null) return;
    setQuizFrozen(true);
    setLifelines(prev => ({ ...prev, freeze: false }));
  };

  const useAiHintLifeline = () => {
    if (!lifelines.aiHint || quizSelectedOpt !== null) return;
    setShowAiHint(true);
    setLifelines(prev => ({ ...prev, aiHint: false }));
  };

  // ============================================================================
  // GAME 5 LOGIC: PHONETICS SORTER
  // ============================================================================
  const handlePhoneticsSort = (chosenBucket: string) => {
    if (phoneticsFeedback !== null || gameEnded) return;
    const current = phoneticsList[phoneticsIdx];
    if (!current) return;

    speakWord(current.cleanWord);
    const isCorrect = chosenBucket === current.correctBucket;

    if (isCorrect) {
      const newCombo = phoneticsCombo + 1;
      const newMax = Math.max(phoneticsMaxCombo, newCombo);
      const newScore = phoneticsScore + 90 + newCombo * 15;
      const newCorrect = phoneticsCorrectCount + 1;

      setPhoneticsCombo(newCombo);
      setPhoneticsMaxCombo(newMax);
      setPhoneticsScore(newScore);
      setPhoneticsCorrectCount(newCorrect);
      setPhoneticsFeedback({ correct: true, chosenBucket });
    } else {
      setPhoneticsCombo(0);
      setPhoneticsFeedback({ correct: false, chosenBucket });
    }
  };

  const handleNextPhonetics = () => {
    if (phoneticsIdx + 1 >= phoneticsList.length) {
      const acc = Math.round((phoneticsCorrectCount / Math.max(1, phoneticsList.length)) * 100);
      finishCurrentGame(
        'phonetics_sorter',
        'Phân Loại Ngữ Âm',
        phoneticsScore,
        phoneticsMaxCombo,
        acc
      );
    } else {
      setPhoneticsIdx(i => i + 1);
      setPhoneticsFeedback(null);
    }
  };

  const playerRank = getPlayerRank(stats.xp);

  // ============================================================================
  // RENDER GAME VICTORY / SUMMARY MODAL
  // ============================================================================
  if (activeGame && gameEnded && lastResult) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border-2 border-indigo-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center mx-auto text-4xl shadow-lg shadow-amber-500/20">
            🏆
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-wider">
              Hoàn thành trò chơi
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">{lastResult.title}</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs text-slate-500 font-semibold">Tổng Điểm</div>
              <div className="text-2xl font-black text-indigo-600 mt-1">{lastResult.score}</div>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80">
              <div className="text-xs text-amber-800 font-semibold">Kinh Nghiệm</div>
              <div className="text-2xl font-black text-amber-600 mt-1">+{lastResult.xpEarned} XP</div>
            </div>
            <div className="p-4 rounded-2xl bg-orange-50/80 border border-orange-200/80">
              <div className="text-xs text-orange-800 font-semibold">Combo Tối Đa</div>
              <div className="text-2xl font-black text-orange-600 mt-1">x{lastResult.comboMax}</div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80">
              <div className="text-xs text-emerald-800 font-semibold">Độ Chính Xác</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">{lastResult.accuracy}%</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                if (activeGame === 'word_match') startWordMatch();
                else if (activeGame === 'meteor_strike') startMeteorStrike();
                else if (activeGame === 'sentence_scrambler') startSentenceScrambler();
                else if (activeGame === 'quiz_show') startQuizShow();
                else if (activeGame === 'phonetics_sorter') startPhoneticsSorter();
              }}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Chơi lại ván mới</span>
            </button>

            <button
              onClick={() => {
                setActiveGame(null);
                setGameEnded(false);
              }}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Về Sảnh Game Hub</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER ACTIVE MINI-GAME 1: WORD MATCH BLITZ
  // ============================================================================
  if (activeGame === 'word_match') {
    const totalPairs = matchCards.length / 2;
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <button
            onClick={() => setActiveGame(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Thoát</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>{matchSeconds}s</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black">
              🔥 Combo x{matchCombo}
            </div>
            <div className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black">
              Điểm: {matchScore}
            </div>
            <div className="text-xs font-bold text-emerald-700">
              Đã ghép: {matchedPairIds.length}/{totalPairs}
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-black text-slate-900">⚡ Ghép Cặp Từ Vựng Siêu Tốc</h3>
          <p className="text-xs text-slate-500 mt-1">
            Chọn 1 thẻ Từ tiếng Anh (có phát âm) và ghép với thẻ Nghĩa tiếng Việt tương ứng!
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {matchCards.map(card => {
            const isMatched = matchedPairIds.includes(card.pairId);
            const isSelected = selectedCard?.id === card.id;
            const isWrong = wrongPairIds.includes(card.id);

            return (
              <button
                key={card.id}
                disabled={isMatched}
                onClick={() => handleCardClick(card)}
                className={`min-h-[115px] p-4 rounded-2xl border-2 text-center flex flex-col items-center justify-center transition-all ${
                  isMatched
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-400 opacity-40 scale-95 cursor-default'
                    : isWrong
                    ? 'bg-rose-50 border-rose-500 text-rose-800 animate-bounce'
                    : isSelected
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-103'
                    : card.cardType === 'en'
                    ? 'bg-white hover:bg-indigo-50/40 border-indigo-200/80 text-slate-900 shadow-2xs'
                    : 'bg-amber-50/40 hover:bg-amber-50 border-amber-200/80 text-slate-800 shadow-2xs'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">
                  {card.cardType === 'en' ? '🇬🇧 English' : '🇻🇳 Tiếng Việt'}
                </span>
                <span className="text-sm sm:text-base font-black leading-snug">
                  {card.displayMain}
                </span>
                <span className="text-[11px] opacity-75 mt-1">{card.displaySub}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER ACTIVE MINI-GAME 2: METEOR STRIKE
  // ============================================================================
  if (activeGame === 'meteor_strike') {
    const currentMeteor = meteors[meteorIdx];
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 text-white rounded-2xl p-4 border border-slate-800">
          <button
            onClick={() => setActiveGame(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Thoát</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-rose-400">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 ${i < meteorLives ? 'fill-rose-500 text-rose-500' : 'text-slate-700'}`}
                />
              ))}
            </div>
            <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black">
              🔥 Combo x{meteorCombo}
            </div>
            <div className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-black">
              Điểm: {meteorScore}
            </div>
            <div className="text-xs font-bold text-slate-400">
              Thiên thạch {meteorIdx + 1}/{meteors.length}
            </div>
          </div>
        </div>

        {/* Space Arena */}
        <div className="relative bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 border border-indigo-800/60 shadow-2xl overflow-hidden min-h-[340px] flex flex-col justify-between">
          {/* Falling progress danger bar */}
          <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full transition-all duration-150 ${
                meteorFallProgress > 75
                  ? 'bg-rose-500'
                  : meteorFallProgress > 45
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${meteorFallProgress}%` }}
            />
          </div>

          {/* Meteor target box */}
          {currentMeteor && (
            <div className="my-auto text-center space-y-3 py-6">
              <div
                className={`inline-flex flex-col items-center px-8 py-6 rounded-3xl border-2 transition-all ${
                  meteorFeedback === 'hit'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 scale-105'
                    : meteorFeedback === 'miss'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-200 animate-bounce'
                    : 'bg-indigo-900/60 border-amber-400/80 text-white shadow-lg shadow-amber-500/10'
                }`}
              >
                <span className="text-2xl mb-1">☄️</span>
                <span className="text-xs uppercase tracking-widest text-amber-300 font-bold">
                  Nghĩa tiếng Việt cần bắn hạ:
                </span>
                <h3 className="text-xl sm:text-2xl font-black mt-1">{currentMeteor.meaning}</h3>
                <span className="text-xs text-indigo-300 font-mono mt-1">{currentMeteor.ipa}</span>
              </div>
            </div>
          )}

          {/* 4 Laser Missiles */}
          {currentMeteor && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              {currentMeteor.options.map((opt, idx) => (
                <button
                  key={idx}
                  disabled={meteorFeedback !== null}
                  onClick={() => handleMeteorAnswer(opt)}
                  className="px-4 py-3.5 rounded-2xl bg-indigo-600/90 hover:bg-amber-400 hover:text-slate-950 text-white font-black text-sm border border-indigo-400/40 shadow-md transition-all active:scale-95"
                >
                  🚀 {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER ACTIVE MINI-GAME 3: SENTENCE SCRAMBLER
  // ============================================================================
  if (activeGame === 'sentence_scrambler') {
    const currentScramble = scrambles[scrambleIdx];
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <button
            onClick={() => setActiveGame(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Thoát</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black">
              🔥 Combo x{scrambleCombo}
            </div>
            <div className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black">
              Điểm: {scrambleScore}
            </div>
            <div className="text-xs font-bold text-slate-500">
              Câu {scrambleIdx + 1}/{scrambles.length}
            </div>
          </div>
        </div>

        {currentScramble && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                🧩 Sắp xếp các từ thành câu hoàn chỉnh
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-3">
                “{currentScramble.meaningVi}”
              </h3>
              <p className="text-xs text-indigo-600 font-medium mt-1">💡 {currentScramble.hint}</p>
            </div>

            {/* Target Sentence Slot */}
            <div className="min-h-[84px] p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-indigo-200 flex flex-wrap items-center gap-2">
              {selectedTiles.length === 0 ? (
                <span className="text-xs text-slate-400 italic">
                  Nhấn vào các thẻ từ bên dưới theo đúng thứ tự ngữ pháp...
                </span>
              ) : (
                selectedTiles.map(tile => (
                  <button
                    key={tile.id}
                    onClick={() => handleRemoveTile(tile)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-xs hover:bg-rose-600 transition-colors"
                  >
                    {tile.text}
                  </button>
                ))
              )}
            </div>

            {/* Available Word Tiles */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              {availableTiles.map(tile => (
                <button
                  key={tile.id}
                  onClick={() => handleSelectTile(tile)}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-indigo-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-2xs transition-all active:scale-95"
                >
                  {tile.text}
                </button>
              ))}
            </div>

            {/* Status Feedback */}
            {scrambleStatus !== 'idle' && (
              <div
                className={`p-4 rounded-2xl border flex items-start justify-between gap-4 ${
                  scrambleStatus === 'correct'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="space-y-1">
                  <div className="font-black text-sm flex items-center gap-1.5">
                    {scrambleStatus === 'correct' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Chính xác tuyệt đối!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Chưa chính xác! Đáp án chuẩn là:</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-900">{currentScramble.originalSentence}</p>
                </div>

                <button
                  onClick={() => speakEnglish(currentScramble.originalSentence)}
                  className="p-2 rounded-xl bg-white/80 hover:bg-white text-indigo-600 border border-slate-200 shrink-0"
                  title="Nghe phát âm câu"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  disabled={scrambleStatus !== 'idle'}
                  onClick={() => initScrambleRound(currentScramble)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs disabled:opacity-40"
                >
                  Xóa xếp lại
                </button>
                <button
                  disabled={scrambleStatus !== 'idle' || availableTiles.length === 0}
                  onClick={handleScrambleHint}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs disabled:opacity-40"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Gợi ý 1 từ</span>
                </button>
              </div>

              {scrambleStatus === 'idle' ? (
                <button
                  disabled={availableTiles.length > 0}
                  onClick={handleCheckScramble}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black text-xs shadow-md transition-all"
                >
                  Kiểm tra đáp án
                </button>
              ) : (
                <button
                  onClick={handleNextScramble}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all"
                >
                  Câu tiếp theo →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // RENDER ACTIVE MINI-GAME 4: SPEED QUIZ SHOW
  // ============================================================================
  if (activeGame === 'quiz_show') {
    const currentQ = quizList[quizIdx];
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <button
            onClick={() => setActiveGame(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Thoát</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 ${i < quizLives ? 'fill-rose-500 text-rose-500' : 'text-slate-300'}`}
                />
              ))}
            </div>
            <div
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black border ${
                quizFrozen
                  ? 'bg-cyan-50 border-cyan-300 text-cyan-700'
                  : quizTimeLeft <= 5
                  ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{quizFrozen ? 'Đóng băng' : `${quizTimeLeft}s`}</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black">
              Điểm: {quizScore}
            </div>
          </div>
        </div>

        {/* Lifelines Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-indigo-900 to-purple-900 text-white rounded-2xl p-4">
          <div className="text-xs font-bold text-indigo-200">
            Câu hỏi {quizIdx + 1}/{quizList.length} • Chuỗi Combo x{quizCombo}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={!lifelines.fifty || quizSelectedOpt !== null}
              onClick={useFiftyFifty}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 disabled:opacity-30 text-xs font-black border border-white/20"
            >
              <Divide className="w-3.5 h-3.5 text-amber-300" />
              <span>50:50</span>
            </button>
            <button
              disabled={!lifelines.freeze || quizSelectedOpt !== null}
              onClick={useFreezeTime}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 disabled:opacity-30 text-xs font-black border border-white/20"
            >
              <Snowflake className="w-3.5 h-3.5 text-cyan-300" />
              <span>Đóng băng giờ</span>
            </button>
            <button
              disabled={!lifelines.aiHint || quizSelectedOpt !== null}
              onClick={useAiHintLifeline}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 disabled:opacity-30 text-xs font-black border border-white/20"
            >
              <Lightbulb className="w-3.5 h-3.5 text-yellow-300" />
              <span>Gợi ý AI</span>
            </button>
          </div>
        </div>

        {currentQ && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase">{currentQ.section}</span>
              <h3
                className="text-lg font-bold text-slate-900 mt-1"
                dangerouslySetInnerHTML={{ __html: currentQ.question }}
              />
            </div>

            {showAiHint && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                💡 <strong>Tổ tư vấn AI gợi ý:</strong> {currentQ.explanation}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {currentQ.options.map((opt, idx) => {
                if (hiddenOptions.includes(idx)) {
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-300 flex items-center justify-center"
                    >
                      Đã loại trừ (50:50)
                    </div>
                  );
                }

                const isSelected = quizSelectedOpt === idx;
                const isCorrect = idx === currentQ.answer;
                let btnStyle = 'bg-slate-50 hover:bg-indigo-50/60 border-slate-200 text-slate-800';
                if (quizSelectedOpt !== null) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-black';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-50 border-rose-500 text-rose-900';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={quizSelectedOpt !== null}
                    onClick={() => handleQuizOptionSelect(idx)}
                    className={`p-4 rounded-2xl border-2 text-left text-sm font-semibold transition-all ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {quizSelectedOpt !== null && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-xs text-slate-700 leading-relaxed">
                  <strong>Giải thích:</strong> {currentQ.explanation}
                </div>
                <button
                  onClick={handleNextQuizQuestion}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shrink-0"
                >
                  Tiếp tục →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // RENDER ACTIVE MINI-GAME 5: PHONETICS SORTER
  // ============================================================================
  if (activeGame === 'phonetics_sorter') {
    const currentP = phoneticsList[phoneticsIdx];
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <button
            onClick={() => setActiveGame(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Thoát</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black">
              🔥 Combo x{phoneticsCombo}
            </div>
            <div className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black">
              Điểm: {phoneticsScore}
            </div>
            <div className="text-xs font-bold text-slate-500">
              Từ {phoneticsIdx + 1}/{phoneticsList.length}
            </div>
          </div>
        </div>

        {currentP && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-xs space-y-6">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              {currentP.unitTitle}
            </span>

            <div className="space-y-3 py-4">
              <div className="text-xs text-slate-400 font-semibold uppercase">
                Từ này thuộc nhóm ngữ âm nào?
              </div>
              <div className="flex items-center justify-center gap-3">
                <h3 className="text-3xl sm:text-4xl font-black text-slate-900">
                  {currentP.wordDisplay}
                </h3>
                <button
                  onClick={() => speakWord(currentP.cleanWord)}
                  className="p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
                  title="Nghe phát âm"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                disabled={phoneticsFeedback !== null}
                onClick={() => handlePhoneticsSort(currentP.bucketA)}
                className="p-6 rounded-2xl border-2 border-indigo-200 hover:border-indigo-600 bg-indigo-50/40 hover:bg-indigo-50 text-indigo-950 font-black text-lg transition-all"
              >
                🧺 Nhóm {currentP.bucketA}
              </button>
              <button
                disabled={phoneticsFeedback !== null}
                onClick={() => handlePhoneticsSort(currentP.bucketB)}
                className="p-6 rounded-2xl border-2 border-purple-200 hover:border-purple-600 bg-purple-50/40 hover:bg-purple-50 text-purple-950 font-black text-lg transition-all"
              >
                🧺 Nhóm {currentP.bucketB}
              </button>
            </div>

            {phoneticsFeedback && (
              <div
                className={`p-4 rounded-2xl border text-left flex items-center justify-between gap-4 ${
                  phoneticsFeedback.correct
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="text-xs space-y-1">
                  <div className="font-black text-sm">
                    {phoneticsFeedback.correct
                      ? '🎉 Chính xác!'
                      : `❌ Chưa đúng! Đáp án là nhóm ${currentP.correctBucket}`}
                  </div>
                  <p className="text-slate-700">{currentP.guide}</p>
                </div>
                <button
                  onClick={handleNextPhonetics}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs shrink-0"
                >
                  Từ tiếp theo →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // RENDER MAIN GAME ARCADE LOBBY
  // ============================================================================
  return (
    <div className="game-hub-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Player Rank & XP Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-800/50 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-800/80 text-amber-300 text-xs font-bold border border-indigo-700">
            <Gamepad2 className="w-4 h-4" />
            <span>English Young 8 • Trung Tâm Trò Chơi Học Tập (Edutainment Arcade)</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Học Mà Chơi – Chinh Phục Đỉnh Cao! 🚀
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
            Rèn luyện phản xạ từ vựng, ngữ âm và cấu trúc câu qua 5 trò chơi tương tác. Tích lũy điểm kinh nghiệm (XP) để mở khóa danh hiệu Thủ Khoa Tuyển Sinh 10!
          </p>
        </div>

        {/* Player Level Card */}
        <div className="w-full lg:w-80 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl p-2 rounded-2xl bg-amber-400/20 border border-amber-400/30">
                {playerRank.icon}
              </div>
              <div>
                <div className="text-[11px] text-indigo-200 font-bold uppercase">
                  Cấp độ {playerRank.level}
                </div>
                <div className="text-base font-black text-amber-300">{playerRank.title}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-white">{stats.xp} XP</div>
              <div className="text-[10px] text-indigo-300">Mốc kế: {playerRank.nextXp} XP</div>
            </div>
          </div>

          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all"
              style={{ width: `${playerRank.progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-indigo-200 pt-1">
            <span>🎮 Đã chơi: {stats.gamesPlayed} ván</span>
            <span>🔥 Kỷ lục Combo: x{stats.bestCombo}</span>
          </div>
        </div>
      </div>

      {/* Unit Scope Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-800">
            Chọn phạm vi kiến thức muốn luyện trong Game:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setUnitScope('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              unitScope === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Cả năm (12 Units)
          </button>
          <button
            onClick={() => setUnitScope('sem1')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              unitScope === 'sem1'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
            }`}
          >
            Học kỳ 1 (Unit 1–6)
          </button>
          <button
            onClick={() => setUnitScope('sem2')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              unitScope === 'sem2'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
            }`}
          >
            Học kỳ 2 (Unit 7–12)
          </button>
          <select
            value={unitScope.startsWith('unit-') ? unitScope : ''}
            onChange={e => {
              if (e.target.value) setUnitScope(e.target.value);
            }}
            aria-label="Chọn từng Unit cụ thể"
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700"
          >
            <option value="">-- Chọn riêng từng Unit --</option>
            {unitsData.map(u => (
              <option key={u.id} value={String(u.id)}>
                Unit {u.number}: {u.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 5 Mini-Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Game 1 */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Kỷ lục: {stats.highScores.word_match || 0} đ
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900">1. Ghép Cặp Siêu Tốc</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
              Word Match Blitz: Lật mở và nối nhanh các thẻ Từ vựng Tiếng Anh (có phát âm chuẩn) với Nghĩa Tiếng Việt để tích lũy chuỗi Combo.
            </p>
          </div>
          <button
            onClick={startWordMatch}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-100 transition-all active:scale-95"
          >
            ⚡ Vào chơi Ghép Cặp
          </button>
        </div>

        {/* Game 2 */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                <Rocket className="w-6 h-6" />
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Kỷ lục: {stats.highScores.meteor_strike || 0} đ
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900">2. Mưa Sao Băng Từ Vựng</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
              Meteor Strike: Phóng tên lửa từ vựng bắn hạ các thiên thạch mang nghĩa tiếng Việt trước khi chúng va chạm xuống bề mặt Trái Đất!
            </p>
          </div>
          <button
            onClick={startMeteorStrike}
            className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md shadow-purple-100 transition-all active:scale-95"
          >
            🚀 Bắn Hạ Sao Băng
          </button>
        </div>

        {/* Game 3 */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Puzzle className="w-6 h-6" />
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Kỷ lục: {stats.highScores.sentence_scrambler || 0} đ
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900">3. Bậc Thầy Sắp Xếp Câu</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
              Sentence Scrambler: Sắp xếp các mảnh ghép từ bị xáo trộn thành câu hoàn chỉnh đúng ngữ pháp. Rèn kỹ năng viết câu cực đỉnh!
            </p>
          </div>
          <button
            onClick={startSentenceScrambler}
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-100 transition-all active:scale-95"
          >
            🧩 Giải Đố Sắp Xếp Câu
          </button>
        </div>

        {/* Game 4 */}
        <div className="bg-white rounded-3xl border-2 border-amber-300 p-6 shadow-md shadow-amber-500/5 hover:shadow-lg transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
                <Trophy className="w-6 h-6" />
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Kỷ lục: {stats.highScores.quiz_show || 0} đ
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-1.5">
              <span>4. Đấu Trường Tri Thức</span>
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
              Speed Quiz Show: Thử thách sinh tồn 15 giây/câu với 3 mạng ❤️ và 3 quyền trợ giúp đặc biệt (50:50, Đóng băng giờ, Tổ tư vấn AI).
            </p>
          </div>
          <button
            onClick={startQuizShow}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            👑 Bước Vào Đấu Trường
          </button>
        </div>

        {/* Game 5 */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
                <Headphones className="w-6 h-6" />
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                Kỷ lục: {stats.highScores.phonetics_sorter || 0} đ
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900">5. Phân Loại Ngữ Âm</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
              Phonetics Sorter: Nghe phát âm và phân loại nhanh từ vựng vào đúng giỏ âm tiết (/ʊ/ - /uː/, /bl/ - /cl/, /sp/ - /st/, trọng âm...).
            </p>
          </div>
          <button
            onClick={startPhoneticsSorter}
            className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-md shadow-teal-100 transition-all active:scale-95"
          >
            🎧 Luyện Phản Xạ Ngữ Âm
          </button>
        </div>
      </div>

      {/* Badges & Achievements Cabinet */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-black text-slate-900">
              Bộ Sưu Tập Huy Hiệu Danh Giá ({stats.unlockedBadges.length}/{GAME_BADGES.length})
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {GAME_BADGES.map(badge => {
            const unlocked = stats.unlockedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  unlocked
                    ? 'bg-amber-50/60 border-amber-300 shadow-2xs'
                    : 'bg-slate-50 border-slate-200/70 opacity-50 grayscale'
                }`}
              >
                <div className="text-2xl mb-1.5">{badge.icon}</div>
                <div className="text-xs font-black text-slate-900 leading-tight">{badge.title}</div>
                <div className="text-[10px] text-slate-500 mt-1 leading-snug">{badge.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
