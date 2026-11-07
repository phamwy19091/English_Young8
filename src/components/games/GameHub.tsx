import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateStudyStreak } from '../../services/storageService';
import { speakEnglish } from '../../services/speechService';
import { unitsData } from '../../data/units';
import { UnitQuestion } from '../../types/curriculum';
import {
  GameType,
  GAME_BADGES,
  getGameStats,
  getPlayerRank,
  recordGameSession,
  generateMeteorChallenges,
  generateScrambleChallenges,
  generateQuizShowQuestions,
  generatePhoneticsChallenges,
  MeteorChallenge,
  ScrambleChallenge,
  PhoneticsChallenge,
} from '../../services/gameService';
import {
  Gamepad2,
  Sparkles,
  Volume2,
  ArrowLeft,
  Heart,
  Award,
  CheckCircle2,
  Lightbulb,
  Swords,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crosshair,
} from 'lucide-react';

export const GameHub: React.FC = () => {
  const { user } = useAuth();
  const username = user?.username || 'em_lop8';

  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [unitScope, setUnitScope] = useState<string>('all');
  const [stats, setStats] = useState(() => getGameStats(username));
  const [lastResult, setLastResult] = useState<{
    gameTitle: string;
    score: number;
    xpEarned: number;
    maxCombo: number;
    accuracy: number;
  } | null>(null);

  useEffect(() => {
    setStats(getGameStats(username));
  }, [username]);

  const rank = getPlayerRank(stats.xp);

  const handleFinishGame = useCallback(
    (
      gameType: GameType,
      gameTitle: string,
      score: number,
      comboMax: number,
      accuracy: number
    ) => {
      const xpEarned = Math.max(25, Math.round(score / 8) + comboMax * 6);
      const updatedStats = recordGameSession(username, {
        gameType,
        gameTitle,
        score,
        xpEarned,
        comboMax,
        accuracy,
      });
      setStats(updatedStats);
      updateStudyStreak(username);
      setLastResult({
        gameTitle,
        score,
        xpEarned,
        maxCombo: comboMax,
        accuracy,
      });
      setActiveGame(null);
    },
    [username]
  );

  // ============================================================================
  // GAME 1: 2D DUNGEON VOCAB QUEST (Hiệp Sĩ Mê Cung Từ Vựng 2D)
  // Move Knight with WASD/Arrows, Space to swing sword at Slimes & open Chests
  // ============================================================================
  const VocabDungeon2D: React.FC = () => {
    const [challenges] = useState<MeteorChallenge[]>(() =>
      generateMeteorChallenges(unitScope, 10)
    );
    const [roundIdx, setRoundIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [lives, setLives] = useState(3);
    const [correctCount, setCorrectCount] = useState(0);
    const [feedbackBanner, setFeedbackBanner] = useState<{
      text: string;
      type: 'ok' | 'err' | 'info';
    } | null>({
      text: 'Dùng phím WASD / Mũi tên di chuyển Hiệp Sĩ tới Rương có từ Tiếng Anh đúng nghĩa và nhấn SPACE!',
      type: 'info',
    });

    // 2D World state (Arena 100x100 percentage coordinates)
    const [hero, setHero] = useState({
      x: 50,
      y: 54,
      facing: 'right' as 'left' | 'right',
      attacking: false,
      invulnerable: 0,
      speedBoost: 0,
    });

    const [slimes, setSlimes] = useState<
      Array<{ id: number; x: number; y: number; vx: number; vy: number; hp: number }>
    >([
      { id: 1, x: 25, y: 30, vx: 0.35, vy: 0.25, hp: 1 },
      { id: 2, x: 75, y: 70, vx: -0.35, vy: -0.28, hp: 1 },
    ]);

    const [powerUp, setPowerUp] = useState<{
      x: number;
      y: number;
      type: 'speed' | 'heart' | 'shield';
    } | null>({ x: 50, y: 25, type: 'speed' });

    const keysRef = useRef<Record<string, boolean>>({});
    const heroRef = useRef(hero);
    heroRef.current = hero;

    const currentChallenge = challenges[roundIdx];

    // 4 Chests placed in the 4 corners of the 2D dungeon
    const chestPositions = [
      { x: 16, y: 22, label: 'A' },
      { x: 84, y: 22, label: 'B' },
      { x: 16, y: 80, label: 'C' },
      { x: 84, y: 80, label: 'D' },
    ];

    useEffect(() => {
      if (currentChallenge) {
        speakEnglish(currentChallenge.word);
      }
    }, [roundIdx, currentChallenge]);

    const triggerSwordAndInteract = useCallback(() => {
      const h = heroRef.current;
      setHero((prev) => ({ ...prev, attacking: true }));
      setTimeout(() => {
        setHero((prev) => ({ ...prev, attacking: false }));
      }, 250);

      // 1. Check if hitting any Slime within sword range (radius 16)
      setSlimes((prevSlimes) =>
        prevSlimes.map((s) => {
          const dist = Math.hypot(s.x - h.x, s.y - h.y);
          if (dist < 16) {
            setScore((sc) => sc + 40);
            const pushAngle = Math.atan2(s.y - h.y, s.x - h.x);
            return {
              ...s,
              x: Math.max(8, Math.min(92, s.x + Math.cos(pushAngle) * 24)),
              y: Math.max(12, Math.min(88, s.y + Math.sin(pushAngle) * 24)),
            };
          }
          return s;
        })
      );

      // 2. Check if near a Chest (radius 17)
      if (!currentChallenge) return;
      for (let i = 0; i < chestPositions.length; i++) {
        const pos = chestPositions[i];
        const dist = Math.hypot(pos.x - h.x, pos.y - h.y);
        if (dist < 17) {
          const chosenWord = currentChallenge.options[i];
          if (chosenWord === currentChallenge.word) {
            // Correct Chest!
            const newCombo = combo + 1;
            const gained = 150 + newCombo * 30;
            const nextScore = score + gained;
            const nextMaxCombo = Math.max(maxCombo, newCombo);
            setCombo(newCombo);
            setMaxCombo(nextMaxCombo);
            setScore(nextScore);
            setCorrectCount((c) => c + 1);
            speakEnglish(currentChallenge.word);
            setFeedbackBanner({
              text: `✨ Chính xác! "${currentChallenge.word}" = ${currentChallenge.meaning} (+${gained} đ)`,
              type: 'ok',
            });

            // Spawn random power-up
            const types: Array<'speed' | 'heart' | 'shield'> = ['speed', 'heart', 'shield'];
            setPowerUp({
              x: 30 + Math.random() * 40,
              y: 25 + Math.random() * 50,
              type: types[Math.floor(Math.random() * types.length)],
            });

            if (roundIdx + 1 >= challenges.length) {
              setTimeout(() => {
                handleFinishGame(
                  'word_match',
                  'Hiệp Sĩ Mê Cung Từ Vựng 2D',
                  nextScore + lives * 100,
                  nextMaxCombo,
                  Math.round(((correctCount + 1) / challenges.length) * 100)
                );
              }, 600);
            } else {
              setRoundIdx((r) => r + 1);
              setHero((prev) => ({ ...prev, x: 50, y: 54 }));
            }
          } else {
            // Wrong Chest!
            const nextLives = lives - 1;
            setLives(nextLives);
            setCombo(0);
            setFeedbackBanner({
              text: `💥 Rương bẫy! Rương "${chosenWord}" không đúng nghĩa "${currentChallenge.meaning}"!`,
              type: 'err',
            });
            if (nextLives <= 0) {
              setTimeout(() => {
                handleFinishGame(
                  'word_match',
                  'Hiệp Sĩ Mê Cung Từ Vựng 2D',
                  score,
                  maxCombo,
                  Math.round((correctCount / challenges.length) * 100)
                );
              }, 600);
            }
          }
          break;
        }
      }
    }, [
      chestPositions,
      currentChallenge,
      combo,
      score,
      maxCombo,
      roundIdx,
      challenges.length,
      lives,
      correctCount,
      handleFinishGame,
    ]);

    // Keyboard listeners
    useEffect(() => {
      const onKeyDown = (e: KeyboardEvent) => {
        const k = e.key.toLowerCase();
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) {
          e.preventDefault();
        }
        keysRef.current[k] = true;
        if (k === ' ' || k === 'e' || k === 'enter' || k === 'j') {
          triggerSwordAndInteract();
        }
      };
      const onKeyUp = (e: KeyboardEvent) => {
        keysRef.current[e.key.toLowerCase()] = false;
      };
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      return () => {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
      };
    }, [triggerSwordAndInteract]);

    // 2D Game Loop (30fps tick)
    useEffect(() => {
      const interval = setInterval(() => {
        const k = keysRef.current;
        setHero((prev) => {
          const step = prev.speedBoost > 0 ? 2.3 : 1.55;
          let nx = prev.x;
          let ny = prev.y;
          let facing = prev.facing;

          if (k['w'] || k['arrowup']) ny -= step;
          if (k['s'] || k['arrowdown']) ny += step;
          if (k['a'] || k['arrowleft']) {
            nx -= step;
            facing = 'left';
          }
          if (k['d'] || k['arrowright']) {
            nx += step;
            facing = 'right';
          }

          nx = Math.max(7, Math.min(93, nx));
          ny = Math.max(12, Math.min(88, ny));

          return {
            ...prev,
            x: nx,
            y: ny,
            facing,
            invulnerable: Math.max(0, prev.invulnerable - 1),
            speedBoost: Math.max(0, prev.speedBoost - 1),
          };
        });

        // Move Slimes toward hero slightly + bounce off walls
        setSlimes((prevSlimes) =>
          prevSlimes.map((s) => {
            const h = heroRef.current;
            const angle = Math.atan2(h.y - s.y, h.x - s.x);
            const speed = 0.42 + roundIdx * 0.04;
            let nx = s.x + Math.cos(angle) * speed;
            let ny = s.y + Math.sin(angle) * speed;
            nx = Math.max(8, Math.min(92, nx));
            ny = Math.max(14, Math.min(86, ny));

            // Collision with Hero
            const dist = Math.hypot(nx - h.x, ny - h.y);
            if (dist < 7.5 && h.invulnerable === 0) {
              setHero((hp) => ({ ...hp, invulnerable: 35 }));
              setLives((l) => {
                const nl = l - 1;
                if (nl <= 0) {
                  setTimeout(() => {
                    handleFinishGame(
                      'word_match',
                      'Hiệp Sĩ Mê Cung Từ Vựng 2D',
                      score,
                      maxCombo,
                      Math.round((correctCount / challenges.length) * 100)
                    );
                  }, 300);
                }
                return Math.max(0, nl);
              });
              setCombo(0);
              setFeedbackBanner({
                text: '👾 Bị Quái Vật Slime chạm trúng! Nhấn SPACE để vung kiếm đẩy lùi quái!',
                type: 'err',
              });
              nx = Math.max(8, Math.min(92, nx - Math.cos(angle) * 18));
              ny = Math.max(14, Math.min(86, ny - Math.sin(angle) * 18));
            }
            return { ...s, x: nx, y: ny };
          })
        );

        // Check Power-up pickup
        setPowerUp((curr) => {
          if (!curr) return null;
          const h = heroRef.current;
          if (Math.hypot(curr.x - h.x, curr.y - h.y) < 9) {
            if (curr.type === 'speed') {
              setHero((p) => ({ ...p, speedBoost: 150 }));
              setFeedbackBanner({ text: '⚡ Nhặt Giày Tốc Độ: Tăng tốc chạy!', type: 'ok' });
            } else if (curr.type === 'heart') {
              setLives((l) => Math.min(5, l + 1));
              setFeedbackBanner({ text: '❤️ Nhặt Bình Máu: +1 Mạng!', type: 'ok' });
            } else {
              setHero((p) => ({ ...p, invulnerable: 120 }));
              setFeedbackBanner({ text: '🛡️ Nhặt Khiên Ánh Sáng: Bất tử 4 giây!', type: 'ok' });
            }
            setScore((s) => s + 50);
            return null;
          }
          return curr;
        });
      }, 33);

      return () => clearInterval(interval);
    }, [roundIdx, score, maxCombo, correctCount, challenges.length, handleFinishGame]);

    if (!currentChallenge) return null;

    return (
      <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 text-white shadow-2xl border border-indigo-500/30">
        {/* Top HUD */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
          <button
            onClick={() => setActiveGame(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" /> Thoát
          </button>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 bg-rose-950/80 px-3 py-1 rounded-xl border border-rose-700/40">
              {Array.from({ length: Math.max(3, lives) }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 ${
                    i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-700'
                  }`}
                />
              ))}
            </div>
            <div className="text-xs font-bold text-indigo-300 bg-indigo-950/80 px-3 py-1.5 rounded-xl border border-indigo-700/40">
              Ải: {roundIdx + 1}/{challenges.length}
            </div>
            {combo > 1 && (
              <div className="text-xs font-black text-amber-300 bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-400/40 animate-bounce">
                🔥 COMBO x{combo}
              </div>
            )}
            <div className="text-sm font-black text-emerald-400 bg-emerald-950/80 px-3.5 py-1.5 rounded-xl border border-emerald-700/40">
              {score} PTS
            </div>
          </div>
        </div>

        {/* Target Mission Prompt */}
        <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-indigo-950 border border-indigo-500/40 rounded-2xl p-3.5 mb-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl shrink-0">
              📜
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                Kho báu cần tìm (Nghĩa Tiếng Việt):
              </span>
              <span className="text-lg sm:text-xl font-black text-amber-300">
                "{currentChallenge.meaning}"
              </span>
              <span className="ml-2 text-xs text-slate-400">{currentChallenge.ipa}</span>
            </div>
          </div>
          <button
            onClick={() => speakEnglish(currentChallenge.word)}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Volume2 className="w-4 h-4" /> Nghe Gợi Ý Phát Âm
          </button>
        </div>

        {/* 2D Dungeon Canvas Viewport */}
        <div
          className="relative w-full h-[380px] sm:h-[430px] rounded-2xl overflow-hidden border-2 border-slate-700 shadow-inner select-none"
          style={{
            backgroundColor: '#1e293b',
            backgroundImage:
              'radial-gradient(#334155 1.5px, transparent 1.5px), linear-gradient(to right, rgba(51,65,85,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(51,65,85,0.25) 1px, transparent 1px)',
            backgroundSize: '24px 24px, 48px 48px, 48px 48px',
          }}
        >
          {/* Central Rune Circle */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-2 border-dashed border-indigo-500/30 flex items-center justify-center pointer-events-none">
            <div className="text-[10px] font-bold text-indigo-400/50 uppercase text-center">
              Cổ Ngữ<br />2D Arena
            </div>
          </div>

          {/* 4 Treasure Chests */}
          {chestPositions.map((pos, idx) => {
            const optionWord = currentChallenge.options[idx];
            const dist = Math.hypot(pos.x - hero.x, pos.y - hero.y);
            const isNear = dist < 17;
            return (
              <div
                key={idx}
                onClick={() => {
                  setHero((p) => ({ ...p, x: pos.x, y: pos.y }));
                  heroRef.current = { ...heroRef.current, x: pos.x, y: pos.y };
                  setTimeout(() => triggerSwordAndInteract(), 50);
                }}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-150 ${
                  isNear ? 'scale-110 z-20' : 'hover:scale-105 z-10'
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-2xl border-2 text-center shadow-lg min-w-[125px] sm:min-w-[145px] ${
                    isNear
                      ? 'bg-amber-500/30 border-amber-300 shadow-amber-500/30 animate-pulse'
                      : 'bg-slate-800/95 border-slate-600'
                  }`}
                >
                  <div className="text-2xl mb-0.5">{isNear ? '🔓✨' : '🧰'}</div>
                  <div className="text-xs sm:text-sm font-black text-white">{optionWord}</div>
                  {isNear && (
                    <div className="text-[10px] font-extrabold text-amber-300 mt-0.5">
                      [Nhấn SPACE để mở]
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Power-Up Item on Map */}
          {powerUp && (
            <div
              style={{ left: `${powerUp.x}%`, top: `${powerUp.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 animate-bounce"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/30">
                {powerUp.type === 'speed' ? '⚡' : powerUp.type === 'heart' ? '❤️' : '🛡️'}
              </div>
            </div>
          )}

          {/* Patrolling Slime Monsters */}
          {slimes.map((s) => (
            <div
              key={s.id}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-75 pointer-events-none"
            >
              <div className="relative flex flex-col items-center">
                <div className="px-1.5 py-0.5 rounded bg-rose-600 text-[9px] font-bold text-white mb-0.5 shadow">
                  Slime
                </div>
                <div className="text-3xl filter drop-shadow-md animate-bounce">👾</div>
              </div>
            </div>
          ))}

          {/* 2D Knight Player Character */}
          <div
            style={{ left: `${hero.x}%`, top: `${hero.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-75 pointer-events-none ${
              hero.invulnerable > 0 ? 'opacity-70 scale-110' : ''
            }`}
          >
            <div className="relative flex flex-col items-center">
              {hero.attacking && (
                <div className="absolute -inset-6 rounded-full border-4 border-amber-400 bg-amber-400/20 animate-ping" />
              )}
              {hero.invulnerable > 0 && (
                <div className="absolute -inset-3 rounded-full border-2 border-cyan-400 bg-cyan-400/15 animate-pulse" />
              )}
              <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-[10px] font-extrabold text-white shadow mb-0.5 whitespace-nowrap">
                {hero.speedBoost > 0 ? '⚡ Hiệp Sĩ' : '🛡️ Hiệp Sĩ'}
              </span>
              <div
                className={`text-4xl select-none transition-transform ${
                  hero.facing === 'left' ? '-scale-x-100' : ''
                } ${hero.attacking ? 'rotate-12 scale-125' : ''}`}
              >
                🤺
              </div>
            </div>
          </div>

          {/* Live Status Banner at Bottom of Viewport */}
          {feedbackBanner && (
            <div
              className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-xl text-xs font-bold border shadow-lg whitespace-nowrap max-w-[95%] truncate ${
                feedbackBanner.type === 'ok'
                  ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
                  : feedbackBanner.type === 'err'
                  ? 'bg-rose-950/90 border-rose-400 text-rose-200'
                  : 'bg-slate-900/90 border-indigo-400/50 text-indigo-200'
              }`}
            >
              {feedbackBanner.text}
            </div>
          )}
        </div>

        {/* Keyboard Guide & Touch Controls */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800/70 p-3 rounded-2xl border border-slate-700/70">
          <div className="text-xs text-slate-300 flex flex-wrap items-center gap-2">
            <span className="px-2 py-1 rounded bg-slate-700 font-bold text-amber-300">
              W A S D / Phím Mũi Tên
            </span>
            <span>Di chuyển Hiệp Sĩ 8 hướng</span>
            <span className="px-2 py-1 rounded bg-slate-700 font-bold text-emerald-300 ml-2">
              SPACE / ENTER
            </span>
            <span>Vung kiếm đánh Slime & Mở Rương</span>
          </div>

          {/* On-Screen Touch D-Pad + Action Button */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onMouseDown={() => (keysRef.current['a'] = true)}
                onMouseUp={() => (keysRef.current['a'] = false)}
                onTouchStart={() => (keysRef.current['a'] = true)}
                onTouchEnd={() => (keysRef.current['a'] = false)}
                className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 active:bg-indigo-600"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex flex-col gap-1">
                <button
                  onMouseDown={() => (keysRef.current['w'] = true)}
                  onMouseUp={() => (keysRef.current['w'] = false)}
                  onTouchStart={() => (keysRef.current['w'] = true)}
                  onTouchEnd={() => (keysRef.current['w'] = false)}
                  className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 active:bg-indigo-600"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
                <button
                  onMouseDown={() => (keysRef.current['s'] = true)}
                  onMouseUp={() => (keysRef.current['s'] = false)}
                  onTouchStart={() => (keysRef.current['s'] = true)}
                  onTouchEnd={() => (keysRef.current['s'] = false)}
                  className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 active:bg-indigo-600"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
              <button
                onMouseDown={() => (keysRef.current['d'] = true)}
                onMouseUp={() => (keysRef.current['d'] = false)}
                onTouchStart={() => (keysRef.current['d'] = true)}
                onTouchEnd={() => (keysRef.current['d'] = false)}
                className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 active:bg-indigo-600"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={triggerSwordAndInteract}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <Swords className="w-4 h-4" /> CHÉM / MỞ RƯƠNG
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // GAME 2: 2D SPACE SHOOTER (Phi Thuyền Không Gian Bắn UFO Từ Vựng 2D)
  // Real spaceship steering (A/D or Left/Right) + Spacebar laser projectiles!
  // ============================================================================
  const SpaceShooter2D: React.FC = () => {
    const [challenges] = useState<MeteorChallenge[]>(() =>
      generateMeteorChallenges(unitScope, 10)
    );
    const [waveIdx, setWaveIdx] = useState(0);
    const [shipX, setShipX] = useState(50);
    const [lives, setLives] = useState(3);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [lasers, setLasers] = useState<Array<{ id: number; x: number; y: number }>>([]);
    const [ufos, setUfos] = useState<
      Array<{ id: number; word: string; x: number; y: number; vx: number }>
    >([]);
    const [explosions, setExplosions] = useState<
      Array<{ id: number; x: number; y: number; text: string; ok: boolean }>
    >([]);

    const keysRef = useRef<Record<string, boolean>>({});
    const shipXRef = useRef(shipX);
    shipXRef.current = shipX;
    const waveIdxRef = useRef(waveIdx);
    waveIdxRef.current = waveIdx;

    const currentChallenge = challenges[waveIdx];

    // Spawn 4 UFO targets for current wave
    useEffect(() => {
      if (!currentChallenge) return;
      const spawned = currentChallenge.options.map((w, idx) => ({
        id: idx + Date.now(),
        word: w,
        x: 16 + idx * 22,
        y: 12 + (idx % 2) * 8,
        vx: idx % 2 === 0 ? 0.35 : -0.35,
      }));
      setUfos(spawned);
    }, [waveIdx, currentChallenge]);

    const fireLaser = useCallback(() => {
      setLasers((prev) => [
        ...prev.slice(-6),
        { id: Date.now() + Math.random(), x: shipXRef.current, y: 82 },
      ]);
    }, []);

    // Keyboard controls
    useEffect(() => {
      const onKeyDown = (e: KeyboardEvent) => {
        const k = e.key.toLowerCase();
        if (['arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
        keysRef.current[k] = true;
        if (k === ' ' || k === 'w' || k === 'arrowup' || k === 'enter') {
          fireLaser();
        }
      };
      const onKeyUp = (e: KeyboardEvent) => {
        keysRef.current[e.key.toLowerCase()] = false;
      };
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      return () => {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
      };
    }, [fireLaser]);

    // 2D Space Physics & Laser-UFO Collision Loop
    useEffect(() => {
      if (!currentChallenge) return;
      const timer = setInterval(() => {
        const k = keysRef.current;
        if (k['a'] || k['arrowleft']) {
          setShipX((x) => Math.max(8, x - 2.4));
        }
        if (k['d'] || k['arrowright']) {
          setShipX((x) => Math.min(92, x + 2.4));
        }

        // Move UFOs slowly downward and swaying left-right
        setUfos((prevUfos) => {
          const updated = prevUfos.map((u) => {
            let nx = u.x + u.vx;
            let nvx = u.vx;
            if (nx < 10 || nx > 90) nvx = -nvx;
            return {
              ...u,
              x: Math.max(10, Math.min(90, nx)),
              y: u.y + 0.18 + waveIdxRef.current * 0.02,
              vx: nvx,
            };
          });

          // Check if UFOs reached bottom defense line (y >= 82)
          if (updated.some((u) => u.y >= 82)) {
            setLives((l) => {
              const nl = l - 1;
              if (nl <= 0) {
                setTimeout(() => {
                  handleFinishGame(
                    'meteor_strike',
                    'Phi Thuyền Không Gian 2D',
                    score,
                    maxCombo,
                    Math.round((correctCount / challenges.length) * 100)
                  );
                }, 300);
              }
              return Math.max(0, nl);
            });
            setCombo(0);
            if (waveIdxRef.current + 1 < challenges.length) {
              setWaveIdx((w) => w + 1);
            }
            return [];
          }
          return updated;
        });

        // Advance lasers
        setLasers((prevLasers) => {
          const activeLasers: Array<{ id: number; x: number; y: number }> = [];
          for (const laser of prevLasers) {
            const ny = laser.y - 4.5;
            if (ny > 4) {
              activeLasers.push({ ...laser, y: ny });
            }
          }
          return activeLasers;
        });
      }, 33);

      return () => clearInterval(timer);
    }, [currentChallenge, score, maxCombo, correctCount, challenges.length, handleFinishGame]);

    // Check laser collisions with UFOs
    useEffect(() => {
      if (!currentChallenge || lasers.length === 0 || ufos.length === 0) return;

      for (const l of lasers) {
        const hitUfo = ufos.find(
          (u) => Math.abs(u.x - l.x) < 10 && Math.abs(u.y - l.y) < 8
        );
        if (hitUfo) {
          setLasers((prev) => prev.filter((item) => item.id !== l.id));

          if (hitUfo.word === currentChallenge.word) {
            const newCombo = combo + 1;
            const gained = 160 + newCombo * 30;
            const nextScore = score + gained;
            const nextMax = Math.max(maxCombo, newCombo);
            setScore(nextScore);
            setCombo(newCombo);
            setMaxCombo(nextMax);
            setCorrectCount((c) => c + 1);
            speakEnglish(currentChallenge.word);
            setExplosions((ex) => [
              ...ex.slice(-4),
              { id: Date.now(), x: hitUfo.x, y: hitUfo.y, text: `+${gained} BẮN TRÚNG!`, ok: true },
            ]);

            if (waveIdx + 1 >= challenges.length) {
              setTimeout(() => {
                handleFinishGame(
                  'meteor_strike',
                  'Phi Thuyền Không Gian 2D',
                  nextScore + lives * 100,
                  nextMax,
                  Math.round(((correctCount + 1) / challenges.length) * 100)
                );
              }, 500);
            } else {
              setWaveIdx((w) => w + 1);
            }
          } else {
            setUfos((prev) => prev.filter((u) => u.id !== hitUfo.id));
            setCombo(0);
            const nextLives = lives - 1;
            setLives(nextLives);
            setExplosions((ex) => [
              ...ex.slice(-4),
              { id: Date.now(), x: hitUfo.x, y: hitUfo.y, text: 'SAI MỤC TIÊU!', ok: false },
            ]);
            if (nextLives <= 0) {
              setTimeout(() => {
                handleFinishGame(
                  'meteor_strike',
                  'Phi Thuyền Không Gian 2D',
                  score,
                  maxCombo,
                  Math.round((correctCount / challenges.length) * 100)
                );
              }, 500);
            }
          }
          break;
        }
      }
    }, [
      lasers,
      ufos,
      currentChallenge,
      combo,
      score,
      maxCombo,
      waveIdx,
      challenges.length,
      lives,
      correctCount,
      handleFinishGame,
    ]);

    if (!currentChallenge) return null;

    return (
      <div className="bg-slate-950 rounded-3xl p-4 sm:p-6 text-white shadow-2xl border border-purple-500/30">
        {/* Top HUD */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
          <button
            onClick={() => setActiveGame(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 px-3 py-1.5 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" /> Thoát
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-rose-950/80 px-3 py-1 rounded-xl border border-rose-700/40">
              {[0, 1, 2].map((i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 ${
                    i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-700'
                  }`}
                />
              ))}
            </div>
            <div className="text-xs font-bold text-purple-300 bg-purple-950/80 px-3 py-1.5 rounded-xl border border-purple-700/40">
              Đợt UFO: {waveIdx + 1}/{challenges.length}
            </div>
            <div className="text-sm font-black text-emerald-400 bg-emerald-950/80 px-3.5 py-1.5 rounded-xl border border-emerald-700/40">
              {score} PTS
            </div>
          </div>
        </div>

        {/* Target Mission Bar */}
        <div className="bg-purple-950/60 border border-purple-500/40 rounded-2xl p-3 mb-3 flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 block">
              🎯 Lái phi thuyền bắn hạ UFO mang từ vựng có nghĩa:
            </span>
            <span className="text-lg sm:text-xl font-black text-amber-300">
              "{currentChallenge.meaning}" ({currentChallenge.ipa})
            </span>
          </div>
          <button
            onClick={() => speakEnglish(currentChallenge.word)}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Volume2 className="w-4 h-4" /> Nghe Từ
          </button>
        </div>

        {/* 2D Space Canvas */}
        <div
          className="relative w-full h-[380px] sm:h-[420px] rounded-2xl overflow-hidden border-2 border-purple-500/30 select-none"
          style={{
            background:
              'radial-gradient(ellipse at bottom, #1e1b4b 0%, #090a0f 100%)',
          }}
        >
          {/* Moving UFO Targets */}
          {ufos.map((u) => (
            <div
              key={u.id}
              onClick={() => {
                setShipX(u.x);
                shipXRef.current = u.x;
                setLasers((prev) => [...prev, { id: Date.now(), x: u.x, y: u.y + 5 }]);
              }}
              style={{ left: `${u.x}%`, top: `${u.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-crosshair group"
            >
              <div className="flex flex-col items-center">
                <div className="px-3 py-1.5 rounded-xl bg-slate-900/95 border-2 border-cyan-400/80 group-hover:border-amber-400 text-xs sm:text-sm font-black text-white shadow-lg shadow-cyan-500/20 whitespace-nowrap">
                  🛸 {u.word}
                </div>
                <div className="w-8 h-2 rounded-full bg-cyan-400/40 blur-xs mt-0.5" />
              </div>
            </div>
          ))}

          {/* Twin Plasma Lasers */}
          {lasers.map((l) => (
            <div
              key={l.id}
              style={{ left: `${l.x}%`, top: `${l.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex gap-3 pointer-events-none"
            >
              <div className="w-1.5 h-6 rounded-full bg-amber-400 shadow-lg shadow-amber-400" />
              <div className="w-1.5 h-6 rounded-full bg-amber-400 shadow-lg shadow-amber-400" />
            </div>
          ))}

          {/* Particle Explosions */}
          {explosions.map((ex) => (
            <div
              key={ex.id}
              style={{ left: `${ex.x}%`, top: `${ex.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 text-xs font-black px-2.5 py-1 rounded-full animate-ping pointer-events-none ${
                ex.ok ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white'
              }`}
            >
              {ex.text}
            </div>
          ))}

          {/* Defense Laser Line */}
          <div className="absolute bottom-14 inset-x-0 border-b border-dashed border-rose-500/40" />

          {/* Player 2D Spaceship */}
          <div
            style={{ left: `${shipX}%`, bottom: '12px' }}
            className="absolute -translate-x-1/2 z-30 transition-all duration-75 pointer-events-none flex flex-col items-center"
          >
            <div className="text-4xl filter drop-shadow-[0_0_12px_rgba(56,189,248,0.8)]">
              🚀
            </div>
            <div className="w-3 h-4 bg-gradient-to-b from-amber-400 to-transparent rounded-full animate-pulse -mt-1" />
          </div>
        </div>

        {/* Controls Bar */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-300 flex flex-wrap items-center gap-2">
            <span className="px-2 py-1 rounded bg-slate-800 font-bold text-cyan-300">
              A / D hoặc ⬅️ / ➡️
            </span>
            <span>Lái Phi Thuyền</span>
            <span className="px-2 py-1 rounded bg-slate-800 font-bold text-amber-300 ml-2">
              SPACE / W / ⬆️
            </span>
            <span>Bắn Đạn Laser Kép</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onMouseDown={() => (keysRef.current['a'] = true)}
              onMouseUp={() => (keysRef.current['a'] = false)}
              onTouchStart={() => (keysRef.current['a'] = true)}
              onTouchEnd={() => (keysRef.current['a'] = false)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> TRÁI
            </button>
            <button
              onClick={fireLaser}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 font-black text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <Crosshair className="w-4 h-4" /> BẮN LASER (SPACE)
            </button>
            <button
              onMouseDown={() => (keysRef.current['d'] = true)}
              onMouseUp={() => (keysRef.current['d'] = false)}
              onTouchStart={() => (keysRef.current['d'] = true)}
              onTouchEnd={() => (keysRef.current['d'] = false)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs flex items-center gap-1"
            >
              PHẢI <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // GAME 3: 2D NINJA PARKOUR SENTENCE RUNNER (Ninja Vượt Địa Hình Ghép Câu 2D)
  // Real 2D Platformer with gravity, jumping across platforms to collect words!
  // ============================================================================
  const NinjaPlatformer2D: React.FC = () => {
    const [challenges] = useState<ScrambleChallenge[]>(() =>
      generateScrambleChallenges(unitScope, 6)
    );
    const [idx, setIdx] = useState(0);
    const [pickedIndices, setPickedIndices] = useState<number[]>([]);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [statusMsg, setStatusMsg] = useState(
      'Điều khiển Ninja nhảy (W / Space) lên các bậc thềm chạm vào các từ theo đúng thứ tự câu (hoặc click vào từ)!'
    );

    const [ninja, setNinja] = useState({
      x: 10,
      y: 78,
      vy: 0,
      onGround: true,
      facing: 'right' as 'left' | 'right',
    });

    const keysRef = useRef<Record<string, boolean>>({});
    const current = challenges[idx];

    const platforms = [
      { x: 18, y: 62, w: 22 },
      { x: 50, y: 48, w: 24 },
      { x: 82, y: 62, w: 22 },
      { x: 32, y: 30, w: 22 },
      { x: 68, y: 30, w: 22 },
    ];

    useEffect(() => {
      setPickedIndices([]);
      setNinja({ x: 10, y: 78, vy: 0, onGround: true, facing: 'right' });
    }, [idx]);

    const expectedWords = current ? current.words : [];

    const collectWordTile = useCallback(
      (tileIndex: number) => {
        if (!current || pickedIndices.includes(tileIndex)) return;
        const nextOrderIdx = pickedIndices.length;
        const clickedWord = current.scrambledWords[tileIndex];
        const targetWord = expectedWords[nextOrderIdx];

        if (
          clickedWord.toLowerCase().replace(/[.,?!]/g, '') ===
          targetWord?.toLowerCase().replace(/[.,?!]/g, '')
        ) {
          const nextPicked = [...pickedIndices, tileIndex];
          setPickedIndices(nextPicked);
          setScore((s) => s + 35);
          speakEnglish(clickedWord.replace(/[.,?!]/g, ''));

          if (nextPicked.length === current.scrambledWords.length) {
            const newCombo = combo + 1;
            const gained = 180 + newCombo * 35;
            const nextScore = score + gained;
            const nextMax = Math.max(maxCombo, newCombo);
            setCombo(newCombo);
            setMaxCombo(nextMax);
            setScore(nextScore);
            setCorrectCount((c) => c + 1);
            setStatusMsg(`🎉 Hoàn hảo! "${current.originalSentence}" (+${gained} đ)`);
            speakEnglish(current.originalSentence);

            setTimeout(() => {
              if (idx + 1 >= challenges.length) {
                handleFinishGame(
                  'sentence_scrambler',
                  'Ninja Vượt Địa Hình Ghép Câu 2D',
                  nextScore,
                  nextMax,
                  Math.round(((correctCount + 1) / challenges.length) * 100)
                );
              } else {
                setIdx((i) => i + 1);
              }
            }, 1100);
          } else {
            setStatusMsg(`✅ Đã thu thập "${clickedWord}"! Hãy tìm từ tiếp theo!`);
          }
        } else {
          setCombo(0);
          setStatusMsg(
            `⚠️ Chưa đúng thứ tự! Từ tiếp theo cần nhặt là "${targetWord}".`
          );
        }
      },
      [
        current,
        pickedIndices,
        expectedWords,
        combo,
        score,
        maxCombo,
        idx,
        challenges.length,
        correctCount,
        handleFinishGame,
      ]
    );

    // Keyboard controls for 2D Platformer
    useEffect(() => {
      const onKeyDown = (e: KeyboardEvent) => {
        const k = e.key.toLowerCase();
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) {
          e.preventDefault();
        }
        keysRef.current[k] = true;
        if (k === 'w' || k === 'arrowup' || k === ' ') {
          setNinja((prev) => ({
            ...prev,
            vy: -4.2,
            onGround: false,
          }));
        }
      };
      const onKeyUp = (e: KeyboardEvent) => {
        keysRef.current[e.key.toLowerCase()] = false;
      };
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      return () => {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
      };
    }, []);

    // 2D Platformer Gravity Loop
    useEffect(() => {
      if (!current) return;
      const timer = setInterval(() => {
        const k = keysRef.current;
        setNinja((prev) => {
          let nx = prev.x;
          let facing = prev.facing;
          if (k['a'] || k['arrowleft']) {
            nx -= 1.8;
            facing = 'left';
          }
          if (k['d'] || k['arrowright']) {
            nx += 1.8;
            facing = 'right';
          }
          nx = Math.max(5, Math.min(95, nx));

          let nvy = prev.vy + 0.38;
          let ny = prev.y + nvy;
          let onGround = false;

          if (nvy >= 0) {
            for (const p of platforms) {
              if (
                Math.abs(nx - p.x) <= p.w / 2 &&
                prev.y <= p.y &&
                ny >= p.y - 2
              ) {
                ny = p.y - 2;
                nvy = 0;
                onGround = true;
                break;
              }
            }
          }

          if (ny >= 80) {
            ny = 80;
            nvy = 0;
            onGround = true;
          }
          if (ny < 8) {
            ny = 8;
            nvy = 0.5;
          }

          return { x: nx, y: ny, vy: nvy, onGround, facing };
        });
      }, 33);

      return () => clearInterval(timer);
    }, [current]);

    // Check proximity between Ninja and floating Word Scrolls
    useEffect(() => {
      if (!current) return;
      current.scrambledWords.forEach((_, wIdx) => {
        if (pickedIndices.includes(wIdx)) return;
        const total = current.scrambledWords.length;
        const wx = 12 + (wIdx / Math.max(1, total - 1)) * 76;
        const wy = wIdx % 3 === 0 ? 52 : wIdx % 3 === 1 ? 22 : 72;
        if (Math.hypot(ninja.x - wx, ninja.y - wy) < 8.5) {
          collectWordTile(wIdx);
        }
      });
    }, [ninja.x, ninja.y, current, pickedIndices, collectWordTile]);

    if (!current) return null;

    return (
      <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 text-white shadow-2xl border border-indigo-500/30">
        {/* Top HUD */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
          <button
            onClick={() => setActiveGame(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" /> Thoát
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-indigo-300 bg-indigo-950 px-3 py-1.5 rounded-xl border border-indigo-700/40">
              Màn Parkour: {idx + 1}/{challenges.length}
            </span>
            <span className="text-sm font-black text-emerald-400 bg-emerald-950 px-3.5 py-1.5 rounded-xl border border-emerald-700/40">
              {score} PTS
            </span>
          </div>
        </div>

        {/* Collected Sentence Bar */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-3.5 mb-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4" /> Nghĩa câu: "{current.meaningVi}" ({current.hint})
            </span>
            <button
              onClick={() => speakEnglish(current.originalSentence)}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Volume2 className="w-3.5 h-3.5" /> Nghe Câu Mẫu
            </button>
          </div>
          <div className="min-h-[44px] bg-slate-950/80 rounded-xl p-2.5 flex flex-wrap items-center gap-2 border border-indigo-500/30">
            {pickedIndices.length === 0 ? (
              <span className="text-xs text-slate-400 italic">
                Nhảy chạm vào các Cuộn Bí Kíp Từ Vựng theo đúng thứ tự câu...
              </span>
            ) : (
              pickedIndices.map((ti, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-sm shadow"
                >
                  {current.scrambledWords[ti]}
                </span>
              ))
            )}
          </div>
        </div>

        {/* 2D Side-Scrolling Platformer World */}
        <div
          className="relative w-full h-[360px] sm:h-[400px] rounded-2xl overflow-hidden border-2 border-indigo-500/30 select-none"
          style={{
            background:
              'linear-gradient(180deg, #0f172a 0%, #1e1b4b 70%, #312e81 100%)',
          }}
        >
          {/* Floating Stone Platforms */}
          {platforms.map((p, i) => (
            <div
              key={i}
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.w}%`,
              }}
              className="absolute -translate-x-1/2 h-3.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-400 to-indigo-500 border-t-2 border-indigo-200 shadow-lg"
            />
          ))}

          {/* Ground Floor */}
          <div className="absolute bottom-0 inset-x-0 h-[16%] bg-gradient-to-t from-slate-950 to-indigo-950 border-t-4 border-emerald-500/60" />

          {/* Floating Word Scrolls */}
          {current.scrambledWords.map((word, wIdx) => {
            if (pickedIndices.includes(wIdx)) return null;
            const total = current.scrambledWords.length;
            const wx = 12 + (wIdx / Math.max(1, total - 1)) * 76;
            const wy = wIdx % 3 === 0 ? 52 : wIdx % 3 === 1 ? 22 : 72;
            const isNextTarget =
              word.toLowerCase().replace(/[.,?!]/g, '') ===
              expectedWords[pickedIndices.length]?.toLowerCase().replace(/[.,?!]/g, '');

            return (
              <button
                key={wIdx}
                onClick={() => collectWordTile(wIdx)}
                style={{ left: `${wx}%`, top: `${wy}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm border-2 shadow-lg transition-transform hover:scale-110 cursor-pointer ${
                  isNextTarget
                    ? 'bg-amber-500/90 border-amber-200 text-slate-950 shadow-amber-500/30'
                    : 'bg-slate-800/95 border-indigo-400 text-white'
                }`}
              >
                📜 {word}
              </button>
            );
          })}

          {/* 2D Ninja Character */}
          <div
            style={{ left: `${ninja.x}%`, top: `${ninja.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none flex flex-col items-center"
          >
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black mb-0.5 shadow">
              Ninja
            </span>
            <div
              className={`text-4xl transition-transform ${
                ninja.facing === 'left' ? '-scale-x-100' : ''
              } ${!ninja.onGround ? '-rotate-12 scale-110' : ''}`}
            >
              🥷
            </div>
          </div>

          {/* Status Message Overlay */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 px-4 py-1 rounded-xl bg-slate-900/90 border border-indigo-500/40 text-xs font-bold text-indigo-200 whitespace-nowrap max-w-[95%] truncate">
            {statusMsg}
          </div>
        </div>

        {/* Controls Bar */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-800/70 p-3 rounded-2xl border border-slate-700">
          <div className="text-xs text-slate-300 flex flex-wrap items-center gap-2">
            <span className="px-2 py-1 rounded bg-slate-700 font-bold text-amber-300">
              A / D (⬅️ / ➡️)
            </span>
            <span>Chạy trái/phải</span>
            <span className="px-2 py-1 rounded bg-slate-700 font-bold text-emerald-300 ml-2">
              W / SPACE / ⬆️
            </span>
            <span>Nhảy Parkour & Nhảy Đôi (Hoặc chạm trực tiếp vào từ)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onMouseDown={() => (keysRef.current['a'] = true)}
              onMouseUp={() => (keysRef.current['a'] = false)}
              onTouchStart={() => (keysRef.current['a'] = true)}
              onTouchEnd={() => (keysRef.current['a'] = false)}
              className="px-3.5 py-2 rounded-xl bg-slate-700 font-bold text-xs"
            >
              ⬅️ TRÁI
            </button>
            <button
              onClick={() =>
                setNinja((p) => ({ ...p, vy: -4.2, onGround: false }))
              }
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs cursor-pointer"
            >
              ⬆️ NHẢY CAO (SPACE)
            </button>
            <button
              onMouseDown={() => (keysRef.current['d'] = true)}
              onMouseUp={() => (keysRef.current['d'] = false)}
              onTouchStart={() => (keysRef.current['d'] = true)}
              onTouchEnd={() => (keysRef.current['d'] = false)}
              className="px-3.5 py-2 rounded-xl bg-slate-700 font-bold text-xs"
            >
              PHẢI ➡️
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // GAME 4: 2D BOSS BATTLE RPG ARENA (Đấu Trường Pháp Sư Diệt Rồng Hắc Ám 2D)
  // Move Mage to Magic Runes (A/B/C/D), Jump over Boss Fireballs, Cast Spells!
  // ============================================================================
  const BossBattleArena2D: React.FC = () => {
    const [questions] = useState<UnitQuestion[]>(() =>
      generateQuizShowQuestions(unitScope, 12)
    );
    const [qIdx, setQIdx] = useState(0);
    const [heroHp, setHeroHp] = useState(100);
    const [bossHp, setBossHp] = useState(100);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [battleLog, setBattleLog] = useState(
      'Di chuyển Pháp Sư (A/D) tới Cột Phép A, B, C, D đúng và nhấn ENTER/E để phóng Sấm Sét! Nhấn W/Space để nhảy né Cầu Lửa của Rồng!'
    );
    const [spellEffect, setSpellEffect] = useState<'lightning' | 'dragon_hit' | null>(null);

    const [mage, setMage] = useState({ x: 25, y: 76, vy: 0, onGround: true });
    const [fireballX, setFireballX] = useState(82);

    const keysRef = useRef<Record<string, boolean>>({});
    const mageRef = useRef(mage);
    mageRef.current = mage;

    const currentQ = questions[qIdx];
    const runePositions = [15, 35, 55, 75];

    const castSpellAtRune = useCallback(
      (chosenIdx: number) => {
        if (!currentQ) return;
        const isCorrect = chosenIdx === currentQ.answer;

        if (isCorrect) {
          const newCombo = combo + 1;
          const dmg = 12;
          const gained = 180 + newCombo * 30;
          const nextScore = score + gained;
          const nextMax = Math.max(maxCombo, newCombo);
          const nextBossHp = Math.max(0, bossHp - dmg);

          setScore(nextScore);
          setCombo(newCombo);
          setMaxCombo(nextMax);
          setBossHp(nextBossHp);
          setCorrectCount((c) => c + 1);
          setSpellEffect('lightning');
          setTimeout(() => setSpellEffect(null), 450);
          setBattleLog(
            `⚡ Tuyệt chiêu Sấm Sét trúng Rồng Hắc Ám! (-${dmg}% HP Boss) • ${currentQ.explanation}`
          );

          if (qIdx + 1 >= questions.length || nextBossHp <= 0) {
            setTimeout(() => {
              handleFinishGame(
                'quiz_show',
                'Quyết Đấu Rồng Hắc Ám 2D',
                nextScore + heroHp * 5,
                nextMax,
                Math.round(((correctCount + 1) / questions.length) * 100)
              );
            }, 900);
          } else {
            setTimeout(() => setQIdx((i) => i + 1), 900);
          }
        } else {
          setCombo(0);
          const nextHeroHp = Math.max(0, heroHp - 25);
          setHeroHp(nextHeroHp);
          setSpellEffect('dragon_hit');
          setTimeout(() => setSpellEffect(null), 450);
          setBattleLog(
            `🔥 Sai phép thuật! Đáp án đúng là ${String.fromCharCode(
              65 + currentQ.answer
            )}: ${currentQ.explanation}`
          );

          if (nextHeroHp <= 0 || qIdx + 1 >= questions.length) {
            setTimeout(() => {
              handleFinishGame(
                'quiz_show',
                'Quyết Đấu Rồng Hắc Ám 2D',
                score,
                maxCombo,
                Math.round((correctCount / questions.length) * 100)
              );
            }, 900);
          } else {
            setTimeout(() => setQIdx((i) => i + 1), 900);
          }
        }
      },
      [
        currentQ,
        combo,
        score,
        maxCombo,
        bossHp,
        qIdx,
        questions.length,
        heroHp,
        correctCount,
        handleFinishGame,
      ]
    );

    // Keyboard controls
    useEffect(() => {
      const onKeyDown = (e: KeyboardEvent) => {
        const k = e.key.toLowerCase();
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) {
          e.preventDefault();
        }
        keysRef.current[k] = true;

        if (k === 'w' || k === 'arrowup' || k === ' ') {
          setMage((p) => (p.onGround ? { ...p, vy: -4.2, onGround: false } : p));
        }

        if (k === '1') castSpellAtRune(0);
        if (k === '2') castSpellAtRune(1);
        if (k === '3') castSpellAtRune(2);
        if (k === '4') castSpellAtRune(3);

        if (k === 'e' || k === 'enter' || k === 'j') {
          const mx = mageRef.current.x;
          let closestIdx = 0;
          let minDist = 999;
          runePositions.forEach((rx, idx) => {
            const d = Math.abs(mx - rx);
            if (d < minDist) {
              minDist = d;
              closestIdx = idx;
            }
          });
          if (minDist < 12) {
            castSpellAtRune(closestIdx);
          }
        }
      };
      const onKeyUp = (e: KeyboardEvent) => {
        keysRef.current[e.key.toLowerCase()] = false;
      };
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      return () => {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
      };
    }, [castSpellAtRune]);

    // 2D Physics & Dragon Fireball Loop
    useEffect(() => {
      const timer = setInterval(() => {
        const k = keysRef.current;
        setMage((prev) => {
          let nx = prev.x;
          if (k['a'] || k['arrowleft']) nx -= 2.0;
          if (k['d'] || k['arrowright']) nx += 2.0;
          nx = Math.max(8, Math.min(78, nx));

          let nvy = prev.vy + 0.4;
          let ny = prev.y + nvy;
          let onGround = false;
          if (ny >= 76) {
            ny = 76;
            nvy = 0;
            onGround = true;
          }
          return { x: nx, y: ny, vy: nvy, onGround };
        });

        setFireballX((fx) => {
          const nfx = fx - 1.35;
          const m = mageRef.current;
          if (Math.abs(nfx - m.x) < 4.5 && m.y > 68) {
            setHeroHp((hp) => Math.max(10, hp - 5));
            setBattleLog('💥 Trúng Cầu Lửa của Rồng! Nhấn W hoặc SPACE để nhảy qua Cầu Lửa!');
            return 84;
          }
          return nfx < 5 ? 84 : nfx;
        });
      }, 33);
      return () => clearInterval(timer);
    }, []);

    if (!currentQ) return null;

    return (
      <div className="bg-slate-950 rounded-3xl p-4 sm:p-6 text-white shadow-2xl border border-amber-500/30">
        {/* Top HUD: Health Bars */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3 pb-3 border-b border-slate-800">
          <button
            onClick={() => setActiveGame(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 px-3 py-1.5 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" /> Thoát
          </button>

          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="flex-1">
              <div className="flex justify-between text-[11px] font-bold text-cyan-300 mb-1">
                <span>🧙‍♂️ Pháp Sư Học Sinh</span>
                <span>{heroHp}% HP</span>
              </div>
              <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all"
                  style={{ width: `${heroHp}%` }}
                />
              </div>
            </div>

            <span className="text-xs font-black text-amber-400">VS</span>

            <div className="flex-1">
              <div className="flex justify-between text-[11px] font-bold text-rose-400 mb-1">
                <span>🐉 Rồng Hắc Ám (Hiệp {qIdx + 1}/{questions.length})</span>
                <span>{bossHp}% HP</span>
              </div>
              <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-amber-500 transition-all"
                  style={{ width: `${bossHp}%` }}
                />
              </div>
            </div>
          </div>

          <div className="text-sm font-black text-emerald-400 bg-emerald-950 px-3.5 py-1.5 rounded-xl border border-emerald-700/40">
            {score} PTS
          </div>
        </div>

        {/* Question Banner */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 mb-3">
          <div className="text-sm sm:text-base font-extrabold text-white mb-3">
            <span className="text-amber-400 mr-2">[Câu {qIdx + 1}]</span>
            <span dangerouslySetInnerHTML={{ __html: currentQ.question }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentQ.options.map((opt: string, idx: number) => {
              const letter = String.fromCharCode(65 + idx);
              const isMageNear = Math.abs(mage.x - runePositions[idx]) < 10;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setMage((p) => ({ ...p, x: runePositions[idx] }));
                    castSpellAtRune(idx);
                  }}
                  className={`text-left px-3 py-2 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isMageNear
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-amber-400/50'
                  }`}
                >
                  <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0">
                    {letter}
                  </span>
                  <span dangerouslySetInnerHTML={{ __html: opt }} />
                </button>
              );
            })}
          </div>
        </div>

        {/* 2D Boss Arena Viewport */}
        <div
          className="relative w-full h-[250px] sm:h-[280px] rounded-2xl overflow-hidden border-2 border-amber-500/30 select-none"
          style={{
            background:
              'linear-gradient(180deg, #1e1b4b 0%, #31102f 65%, #1f2937 100%)',
          }}
        >
          {/* 4 Magic Rune Pillars on the Arena Floor */}
          {runePositions.map((rx, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isNear = Math.abs(mage.x - rx) < 10;
            return (
              <div
                key={idx}
                onClick={() => {
                  setMage((p) => ({ ...p, x: rx }));
                  castSpellAtRune(idx);
                }}
                style={{ left: `${rx}%`, bottom: '18%' }}
                className="absolute -translate-x-1/2 z-10 flex flex-col items-center cursor-pointer"
              >
                <div
                  className={`w-12 h-16 rounded-t-xl border-2 flex flex-col items-center justify-center transition-all ${
                    isNear
                      ? 'bg-amber-500/40 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.6)] -translate-y-1'
                      : 'bg-indigo-950/80 border-indigo-500/40'
                  }`}
                >
                  <span className="text-xs font-black text-amber-300">CỘT {letter}</span>
                  <span className="text-lg">🔮</span>
                </div>
              </div>
            );
          })}

          {spellEffect === 'lightning' && (
            <div className="absolute inset-0 bg-amber-400/20 z-30 flex items-center justify-center animate-ping pointer-events-none">
              <span className="text-6xl">⚡💥⚡</span>
            </div>
          )}

          {/* Fireball rolling along floor */}
          <div
            style={{ left: `${fireballX}%`, bottom: '20%' }}
            className="absolute -translate-x-1/2 z-20 text-3xl animate-spin pointer-events-none"
          >
            ☄️
          </div>

          {/* 2D Mage Hero */}
          <div
            style={{ left: `${mage.x}%`, top: `${mage.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none flex flex-col items-center"
          >
            <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black mb-0.5">
              Pháp Sư
            </span>
            <div className="text-4xl">🧙‍♂️</div>
          </div>

          {/* 2D Dragon Boss */}
          <div
            style={{ right: '4%', bottom: '16%' }}
            className={`absolute z-20 flex flex-col items-center transition-transform ${
              spellEffect === 'lightning' ? 'scale-125 brightness-150' : 'animate-bounce'
            }`}
          >
            <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black mb-1">
              BOSS RỒNG HẮC ÁM
            </span>
            <div className="text-6xl sm:text-7xl select-none">🐉</div>
          </div>

          {/* Arena Floor */}
          <div className="absolute bottom-0 inset-x-0 h-[18%] bg-slate-900 border-t-4 border-amber-500/50 flex items-center justify-center px-4">
            <p className="text-xs font-bold text-amber-200 truncate">{battleLog}</p>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 bg-slate-900 p-3 rounded-2xl border border-slate-800 text-xs">
          <div className="text-slate-300 flex flex-wrap items-center gap-2">
            <span className="px-2 py-1 rounded bg-slate-800 font-bold text-cyan-300">
              A / D (⬅️ / ➡️)
            </span>
            <span>Chạy tới Cột Phép</span>
            <span className="px-2 py-1 rounded bg-slate-800 font-bold text-amber-300">
              W / SPACE
            </span>
            <span>Nhảy né Cầu Lửa</span>
            <span className="px-2 py-1 rounded bg-slate-800 font-bold text-emerald-300">
              E / ENTER hoặc Phím 1-4
            </span>
            <span>Tung Tuyệt Chiêu Sấm Sét</span>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // GAME 5: 2D PHONETICS MAGNET ROBOT (Robot Nam Châm Hứng Âm Tiết 2D)
  // Move Robot left/right (A/D), Toggle Magnet Polarity (Space/W) to catch orbs!
  // ============================================================================
  const PhoneticsBot2D: React.FC = () => {
    const [challenges] = useState<PhoneticsChallenge[]>(() =>
      generatePhoneticsChallenges(unitScope, 12)
    );
    const [idx, setIdx] = useState(0);
    const [botX, setBotX] = useState(50);
    const [polarity, setPolarity] = useState<'A' | 'B'>('A');
    const [orb, setOrb] = useState({ x: 50, y: 10 });
    const [bomb, setBomb] = useState({ x: 25, y: 0 });
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [lives, setLives] = useState(3);
    const [correctCount, setCorrectCount] = useState(0);
    const [msg, setMsg] = useState(
      'Di chuyển Robot (A/D) để hứng Quả Cầu Từ Vựng và nhấn SPACE để Đổi Cực Nam Châm khớp với âm IPA!'
    );

    const keysRef = useRef<Record<string, boolean>>({});
    const botXRef = useRef(botX);
    botXRef.current = botX;
    const polarityRef = useRef(polarity);
    polarityRef.current = polarity;

    const current = challenges[idx];

    useEffect(() => {
      if (current) {
        speakEnglish(current.cleanWord);
        setOrb({ x: 20 + Math.random() * 60, y: 8 });
        setBomb({ x: 15 + Math.random() * 70, y: -20 });
      }
    }, [idx, current]);

    // Keyboard controls
    useEffect(() => {
      const onKeyDown = (e: KeyboardEvent) => {
        const k = e.key.toLowerCase();
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) {
          e.preventDefault();
        }
        keysRef.current[k] = true;
        if (k === ' ' || k === 'w' || k === 'arrowup' || k === 'q' || k === 'e') {
          setPolarity((p) => (p === 'A' ? 'B' : 'A'));
        }
      };
      const onKeyUp = (e: KeyboardEvent) => {
        keysRef.current[e.key.toLowerCase()] = false;
      };
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      return () => {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
      };
    }, []);

    // 2D Robot Catcher Loop
    useEffect(() => {
      if (!current) return;
      const timer = setInterval(() => {
        const k = keysRef.current;
        if (k['a'] || k['arrowleft']) setBotX((x) => Math.max(10, x - 2.5));
        if (k['d'] || k['arrowright']) setBotX((x) => Math.min(90, x + 2.5));

        setBomb((b) => {
          const ny = b.y + 1.25;
          if (ny >= 74 && ny <= 84 && Math.abs(b.x - botXRef.current) < 9) {
            setLives((l) => Math.max(0, l - 1));
            setCombo(0);
            setMsg('💣 Trúng Bom Nhiễu Sóng! Hãy lách Robot tránh xa quả bom!');
            return { x: 15 + Math.random() * 70, y: -25 };
          }
          return ny > 95 ? { x: 15 + Math.random() * 70, y: -15 } : { ...b, y: ny };
        });

        setOrb((o) => {
          const ny = o.y + 0.95;
          if (ny >= 72 && ny <= 85 && Math.abs(o.x - botXRef.current) < 12) {
            const chosenSound =
              polarityRef.current === 'A' ? current.bucketA : current.bucketB;
            if (chosenSound === current.correctBucket) {
              const newCombo = combo + 1;
              const gained = 150 + newCombo * 25;
              const nextScore = score + gained;
              const nextMax = Math.max(maxCombo, newCombo);
              setScore(nextScore);
              setCombo(newCombo);
              setMaxCombo(nextMax);
              setCorrectCount((c) => c + 1);
              speakEnglish(current.cleanWord);
              setMsg(
                `✅ Hứng chuẩn âm ${current.correctBucket}! "${current.cleanWord}" (${current.guide})`
              );

              if (idx + 1 >= challenges.length) {
                setTimeout(() => {
                  handleFinishGame(
                    'phonetics_sorter',
                    'Robot Nam Châm Ngữ Âm 2D',
                    nextScore,
                    nextMax,
                    Math.round(((correctCount + 1) / challenges.length) * 100)
                  );
                }, 400);
              } else {
                setIdx((i) => i + 1);
              }
            } else {
              setCombo(0);
              const nl = lives - 1;
              setLives(nl);
              setMsg(
                `❌ Sai cực âm! "${current.cleanWord}" thuộc âm ${current.correctBucket}!`
              );
              if (nl <= 0 || idx + 1 >= challenges.length) {
                setTimeout(() => {
                  handleFinishGame(
                    'phonetics_sorter',
                    'Robot Nam Châm Ngữ Âm 2D',
                    score,
                    maxCombo,
                    Math.round((correctCount / challenges.length) * 100)
                  );
                }, 400);
              } else {
                setIdx((i) => i + 1);
              }
            }
            return { x: 50, y: 8 };
          }

          if (ny > 92) {
            return { x: 20 + Math.random() * 60, y: 8 };
          }
          return { ...o, y: ny };
        });
      }, 33);

      return () => clearInterval(timer);
    }, [current, combo, score, maxCombo, idx, challenges.length, lives, correctCount, handleFinishGame]);

    if (!current) return null;

    return (
      <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 text-white shadow-2xl border border-emerald-500/30">
        {/* Top HUD */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
          <button
            onClick={() => setActiveGame(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" /> Thoát
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-rose-950 px-3 py-1 rounded-xl border border-rose-700/40">
              {[0, 1, 2].map((i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 ${
                    i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-emerald-300 bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-700/40">
              Từ: {idx + 1}/{challenges.length}
            </span>
            <span className="text-sm font-black text-amber-400 bg-amber-950 px-3.5 py-1.5 rounded-xl border border-amber-700/40">
              {score} PTS
            </span>
          </div>
        </div>

        {/* Polarity Selector Bar */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={() => setPolarity('A')}
            className={`p-3 rounded-2xl border-2 font-black text-center transition-all cursor-pointer ${
              polarity === 'A'
                ? 'bg-indigo-600 border-indigo-300 text-white shadow-lg shadow-indigo-500/30 scale-[1.01]'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider">Cực Nam Châm A</div>
            <div className="text-2xl font-black">{current.bucketA}</div>
          </button>
          <button
            onClick={() => setPolarity('B')}
            className={`p-3 rounded-2xl border-2 font-black text-center transition-all cursor-pointer ${
              polarity === 'B'
                ? 'bg-emerald-600 border-emerald-300 text-white shadow-lg shadow-emerald-500/30 scale-[1.01]'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider">Cực Nam Châm B</div>
            <div className="text-2xl font-black">{current.bucketB}</div>
          </button>
        </div>

        {/* 2D Catcher Viewport */}
        <div
          className="relative w-full h-[350px] sm:h-[380px] rounded-2xl overflow-hidden border-2 border-emerald-500/30 select-none"
          style={{
            background: 'linear-gradient(180deg, #022c22 0%, #0f172a 100%)',
          }}
        >
          {/* Falling Word Crystal */}
          <div
            style={{ left: `${orb.x}%`, top: `${orb.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
          >
            <div className="px-4 py-2 rounded-2xl bg-amber-400 text-slate-950 font-black text-base sm:text-lg shadow-xl border-2 border-white whitespace-nowrap flex items-center gap-2">
              <span>💎</span>
              <span>{current.wordDisplay}</span>
            </div>
          </div>

          {/* Falling Bomb Hazard */}
          <div
            style={{ left: `${bomb.x}%`, top: `${bomb.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 text-3xl pointer-events-none"
          >
            💣
          </div>

          {/* 2D SoundBot Player */}
          <div
            style={{ left: `${botX}%`, bottom: '16px' }}
            className="absolute -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none"
          >
            <div
              className={`px-3 py-1 rounded-full text-xs font-black border-2 mb-1 shadow-lg ${
                polarity === 'A'
                  ? 'bg-indigo-600 border-indigo-200 text-white'
                  : 'bg-emerald-600 border-emerald-200 text-white'
              }`}
            >
              🧲 Cực {polarity === 'A' ? current.bucketA : current.bucketB}
            </div>
            <div className="text-5xl">🤖</div>
          </div>

          {/* Status Message */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 px-4 py-1 rounded-xl bg-slate-950/90 border border-emerald-500/40 text-xs font-bold text-emerald-200 whitespace-nowrap max-w-[95%] truncate">
            {msg}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 bg-slate-800/80 p-3 rounded-2xl border border-slate-700 text-xs">
          <div className="text-slate-300 flex flex-wrap items-center gap-2">
            <span className="px-2 py-1 rounded bg-slate-700 font-bold text-emerald-300">
              A / D (⬅️ / ➡️)
            </span>
            <span>Di chuyển Robot hứng Tinh Thể</span>
            <span className="px-2 py-1 rounded bg-slate-700 font-bold text-amber-300 ml-2">
              SPACE / W / ⬆️
            </span>
            <span>Đổi Cực Nam Châm ({current.bucketA} ↔ {current.bucketB})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setBotX((x) => Math.max(10, x - 12))}
              className="px-3 py-2 rounded-xl bg-slate-700 font-bold"
            >
              ⬅️ TRÁI
            </button>
            <button
              onClick={() => setPolarity((p) => (p === 'A' ? 'B' : 'A'))}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black cursor-pointer"
            >
              🔄 ĐỔI CỰC (SPACE)
            </button>
            <button
              onClick={() => setBotX((x) => Math.min(90, x + 12))}
              className="px-3 py-2 rounded-xl bg-slate-700 font-bold"
            >
              PHẢI ➡️
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER ACTIVE 2D GAME
  // ============================================================================
  if (activeGame === 'word_match') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <VocabDungeon2D />
      </div>
    );
  }
  if (activeGame === 'meteor_strike') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <SpaceShooter2D />
      </div>
    );
  }
  if (activeGame === 'sentence_scrambler') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <NinjaPlatformer2D />
      </div>
    );
  }
  if (activeGame === 'quiz_show') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <BossBattleArena2D />
      </div>
    );
  }
  if (activeGame === 'phonetics_sorter') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <PhoneticsBot2D />
      </div>
    );
  }

  // ============================================================================
  // RENDER GAME HUB LOBBY
  // ============================================================================
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-950 via-purple-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold mb-3">
              <Gamepad2 className="w-4 h-4" />
              <span>English Young 8 • Đấu Trường Game 2D Tương Tác</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
              Phiêu Lưu 2D – Chinh Phục Tiếng Anh 8! 🚀
            </h1>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Điều khiển nhân vật bằng bàn phím (<kbd className="px-1.5 py-0.5 rounded bg-white/10 font-bold text-amber-300">WASD</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-bold text-amber-300">Phím Mũi Tên</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-bold text-emerald-300">SPACE</kbd>): Nhập vai Hiệp Sĩ săn kho báu, lái Phi Thuyền bắn UFO, nhảy Parkour cùng Ninja và quyết đấu Boss Rồng Hắc Ám!
            </p>
          </div>

          {/* Player Rank Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 min-w-[290px] shrink-0">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl shrink-0">
                  {rank.icon}
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                    Cấp độ {rank.level}
                  </span>
                  <h3 className="text-base font-black text-amber-300 whitespace-nowrap">
                    {rank.title}
                  </h3>
                </div>
              </div>
              <div className="text-right whitespace-nowrap">
                <span className="text-lg font-black text-white">{stats.xp} XP</span>
                <span className="block text-[10px] text-indigo-300">
                  Mốc kế: {rank.nextXp} XP
                </span>
              </div>
            </div>

            <div className="w-full h-2.5 bg-slate-950/60 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-500"
                style={{ width: `${rank.progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-indigo-200 pt-1">
              <span>🎮 Đã chơi: <strong>{stats.gamesPlayed}</strong> trận</span>
              <span>🔥 Kỷ lục Combo: <strong>x{stats.bestCombo}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Post-Game Victory Banner */}
      {lastResult && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border-2 border-emerald-300 rounded-3xl p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-lg shrink-0">
                🏆
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                  Tổng Kết Màn Chơi • {lastResult.gameTitle}
                </span>
                <h3 className="text-2xl font-black text-slate-900">
                  +{lastResult.score} Điểm • Nhận +{lastResult.xpEarned} XP!
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Combo tối đa: <strong>x{lastResult.maxCombo}</strong> • Độ chính xác:{' '}
                  <strong>{lastResult.accuracy}%</strong>
                </p>
              </div>
            </div>
            <button
              onClick={() => setLastResult(null)}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 self-start sm:self-center cursor-pointer"
            >
              Đóng thông báo
            </button>
          </div>
        </div>
      )}

      {/* Curriculum Scope Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-bold text-slate-800">
            Chọn phạm vi kiến thức nạp vào Thế Giới Game 2D:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'Cả năm (12 Units)' },
            { id: 'sem1', label: 'Học kỳ 1 (Unit 1–6)' },
            { id: 'sem2', label: 'Học kỳ 2 (Unit 7–12)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setUnitScope(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                unitScope === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <select
            value={unitScope.startsWith('unit-') ? unitScope : ''}
            onChange={(e) => {
              if (e.target.value) setUnitScope(e.target.value);
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 focus:outline-none"
          >
            <option value="">-- Chọn riêng từng Unit --</option>
            {unitsData.map((u) => (
              <option key={u.id} value={u.id}>
                Unit {u.number}: {u.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 5 Interactive 2D Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Game 1 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl">
                🤺
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-extrabold">
                Kỷ lục: {stats.highScores.word_match || 0} đ
              </span>
            </div>
            <div className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-black uppercase mb-1">
              2D RPG Dungeon • WASD + Space
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-1.5">
              1. Hiệp Sĩ Mê Cung Từ Vựng 2D
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Điều khiển <strong>Hiệp Sĩ Nhí</strong> di chuyển 8 hướng trong hầm ngục 2D, vung kiếm đẩy lùi quái vật Slime, nhặt vật phẩm Tăng Tốc/Khiên và mở đúng Rương Kho Báu Từ Vựng!
            </p>
          </div>
          <button
            onClick={() => setActiveGame('word_match')}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md shadow-amber-100 transition-all cursor-pointer"
          >
            Vào Hầm Ngục 2D →
          </button>
        </div>

        {/* Game 2 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-2xl">
                🚀
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-extrabold">
                Kỷ lục: {stats.highScores.meteor_strike || 0} đ
              </span>
            </div>
            <div className="inline-block px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-black uppercase mb-1">
              2D Space Shooter • A/D + Space Laser
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-1.5">
              2. Phi Thuyền Bắn Đĩa Bay UFO 2D
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Lái <strong>Phi Thuyền Chiến Đấu 2D</strong> lách qua làn mưa UFO và nhấn <strong>Spacebar</strong> bắn đạn Laser Kép tiêu diệt đúng đĩa bay mang từ Tiếng Anh mục tiêu!
            </p>
          </div>
          <button
            onClick={() => setActiveGame('meteor_strike')}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-100 transition-all cursor-pointer"
          >
            Lái Phi Thuyền 2D →
          </button>
        </div>

        {/* Game 3 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-2xl">
                🥷
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-extrabold">
                Kỷ lục: {stats.highScores.sentence_scrambler || 0} đ
              </span>
            </div>
            <div className="inline-block px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase mb-1">
              2D Parkour Platformer • Trọng Lực & Nhảy Đôi
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-1.5">
              3. Ninja Vượt Địa Hình Ghép Câu 2D
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Điều khiển <strong>Ninja</strong> chạy và nhảy Parkour qua các bậc thềm đá nổi để thu thập các Cuộn Bí Kíp Từ Vựng theo đúng trật tự ngữ pháp câu Tiếng Anh 8!
            </p>
          </div>
          <button
            onClick={() => setActiveGame('sentence_scrambler')}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 transition-all cursor-pointer"
          >
            Chạy Parkour 2D →
          </button>
        </div>

        {/* Game 4 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-2xl">
                🐉
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-extrabold">
                Kỷ lục: {stats.highScores.quiz_show || 0} đ
              </span>
            </div>
            <div className="inline-block px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-black uppercase mb-1">
              2D Boss Battle RPG • Nhảy Né Cầu Lửa & Phép Thuật
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-1.5">
              4. Quyết Đấu Rồng Hắc Ám 2D
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Nhập vai <strong>Pháp Sư Học Sinh</strong> nhảy né Cầu Lửa của Rồng Hắc Ám, chạy đến Cột Phép A, B, C, D đúng để triệu hồi Sấm Sét tiêu diệt Boss Ngữ Pháp & Đề Thi Vào 10!
            </p>
          </div>
          <button
            onClick={() => setActiveGame('quiz_show')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white font-bold text-sm shadow-md shadow-rose-100 transition-all cursor-pointer"
          >
            Khiêu Chiến Boss 2D →
          </button>
        </div>

        {/* Game 5 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl">
                🤖
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold">
                Kỷ lục: {stats.highScores.phonetics_sorter || 0} đ
              </span>
            </div>
            <div className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase mb-1">
              2D Arcade Catcher • Đổi Cực Nam Châm Âm Tiết
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-1.5">
              5. Robot Nam Châm Ngữ Âm 2D
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Điều khiển <strong>Robot Âm Nhạc 2D</strong> trượt hứng các Tinh Thể Từ Vựng đang rơi, nhấn <strong>Space</strong> đổi cực Nam Châm khớp âm IPA và né tránh Bom Điện Từ!
            </p>
          </div>
          <button
            onClick={() => setActiveGame('phonetics_sorter')}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-100 transition-all cursor-pointer"
          >
            Điều Khiển Robot 2D →
          </button>
        </div>

        {/* Badges Showcase Card */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Award className="w-4 h-4" /> Bộ Sưu Tập Huy Hiệu
              </span>
              <span className="text-xs font-bold text-indigo-200">
                {stats.unlockedBadges.length}/{GAME_BADGES.length} Đã mở
              </span>
            </div>
            <div className="space-y-2.5 max-h-[210px] overflow-y-auto pr-1">
              {GAME_BADGES.map((b) => {
                const unlocked = stats.unlockedBadges.includes(b.id);
                return (
                  <div
                    key={b.id}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border ${
                      unlocked
                        ? 'bg-white/10 border-amber-400/40 text-white'
                        : 'bg-white/5 border-white/5 text-slate-500 opacity-60'
                    }`}
                  >
                    <span className="text-xl">{b.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{b.title}</p>
                      <p className="text-[10px] text-indigo-200 truncate">{b.description}</p>
                    </div>
                    {unlocked && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
