import React, { useState, useEffect, useCallback } from 'react';
import { UnitData, VocabularyItem } from '../../types/curriculum';
import { useStudy } from '../../context/StudyContext';
import { useToast } from '../common/Toast';
import { speakEnglish } from '../../services/speechService';
import { Volume2, ChevronLeft, ChevronRight, CheckCircle2, RotateCw, Sparkles } from 'lucide-react';

interface FlashcardStudioProps {
  unit: UnitData;
}

export const FlashcardStudio: React.FC<FlashcardStudioProps> = ({ unit }) => {
  const { isVocabLearned, markVocabLearned, unmarkVocabLearned } = useStudy();
  const { showToast } = useToast();

  const [deckMode, setDeckMode] = useState<'unlearned' | 'all'>('unlearned');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const allVocab = unit.vocab || [];
  const activeDeck = deckMode === 'all'
    ? allVocab
    : allVocab.filter(v => !isVocabLearned(v.id));

  // Reset index if out of bounds
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [unit.id, deckMode]);

  const currentCard: VocabularyItem | null = activeDeck.length > 0
    ? activeDeck[currentIndex % activeDeck.length]
    : null;

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const handleNext = useCallback(() => {
    if (activeDeck.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % activeDeck.length);
    setIsFlipped(false);
  }, [activeDeck.length]);

  const handlePrev = useCallback(() => {
    if (activeDeck.length === 0) return;
    setCurrentIndex(prev => (prev - 1 + activeDeck.length) % activeDeck.length);
    setIsFlipped(false);
  }, [activeDeck.length]);

  const handleSpeak = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentCard) {
      speakEnglish(currentCard.word);
    }
  }, [currentCard]);

  const handleMarkLearned = useCallback(() => {
    if (!currentCard) return;
    markVocabLearned(currentCard.id);
    showToast(`Đã thuộc từ "${currentCard.word}"!`, 'success');
    setIsFlipped(false);
  }, [currentCard, markVocabLearned, showToast]);

  // Global Keyboard Navigation (Feature 9)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Rule: ignore if focused in input or textarea
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (currentCard) {
          speakEnglish(currentCard.word);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleMarkLearned();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, handleMarkLearned, currentCard]);

  return (
    <div className="flashcard-container max-w-2xl mx-auto flex flex-col items-center py-4">
      {/* Deck Mode Toggle */}
      <div className="deck-mode-toggle flex items-center gap-2 p-1 bg-slate-200/80 rounded-xl mb-6 shadow-inner">
        <button
          onClick={() => setDeckMode('unlearned')}
          className={`pill-unlearned px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            deckMode === 'unlearned'
              ? 'active bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🎯 Chưa thuộc ({allVocab.filter(v => !isVocabLearned(v.id)).length})
        </button>
        <button
          onClick={() => setDeckMode('all')}
          className={`pill-all px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            deckMode === 'all'
              ? 'active bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📚 Tất cả ({allVocab.length})
        </button>
      </div>

      {/* Hero congratulations when deck is empty */}
      {!currentCard ? (
        <div className="deck-completed-hero w-full bg-white rounded-3xl border border-indigo-100 p-8 text-center shadow-lg animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-white flex items-center justify-center mx-auto mb-4 shadow-md shadow-amber-200">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Xuất sắc! Em đã thuộc trọn bộ từ vựng
          </h2>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Tất cả {allVocab.length} từ vựng của Unit {unit.id} đã được chinh phục. Em có thể chuyển sang chế độ ôn tập tất cả hoặc làm bài tập trắc nghiệm.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setDeckMode('all')}
              className="btn-review-all inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all"
            >
              <RotateCw className="w-4 h-4" />
              <span>Ôn tập tất cả</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Word Dots Progress Strip */}
          <div className="flex items-center gap-1.5 mb-4 flex-wrap justify-center max-w-md px-2">
            {activeDeck.map((v, idx) => {
              const isLearned = isVocabLearned(v.id);
              const isCurrent = idx === currentIndex % activeDeck.length;
              return (
                <button
                  key={v.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsFlipped(false);
                  }}
                  title={`${v.word} (${isLearned ? 'Đã thuộc' : 'Chưa thuộc'})`}
                  className={`w-3 h-3 rounded-full transition-all ${
                    isCurrent
                      ? 'bg-indigo-600 ring-2 ring-indigo-300 scale-125'
                      : isLearned
                      ? 'bg-emerald-400 hover:bg-emerald-500'
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              );
            })}
          </div>

          {/* 3D Flip Card Container */}
          <div
            className="w-full h-80 perspective-1000 cursor-pointer select-none mb-6"
            onClick={handleFlip}
          >
            <div className={`flashcard-3d ${isFlipped ? 'flipped' : ''}`}>
              {/* Front Face */}
              <div className="card-face card-front bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 shadow-xl border border-indigo-700/50 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="fc-type px-2.5 py-1 rounded-md bg-indigo-800/80 text-indigo-200 text-xs font-mono font-bold uppercase tracking-wider">
                    {currentCard.type || 'vocab'}
                  </span>
                  <div className="flex items-center gap-2">
                    {isVocabLearned(currentCard.id) ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đã thuộc</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-semibold">
                        Từ {(currentIndex % activeDeck.length) + 1}/{activeDeck.length}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-center my-auto">
                  <div className="word-text text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                    {currentCard.word}
                  </div>
                  <div className="ipa-text text-lg sm:text-xl font-mono text-indigo-300 font-medium">
                    {currentCard.ipa}
                  </div>
                  <button
                    onClick={handleSpeak}
                    className="btn-audio-speak mt-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/50 transition-transform active:scale-95"
                    aria-label="Phát âm"
                  >
                    <Volume2 className="w-6 h-6" />
                  </button>
                </div>

                <div className="text-center text-xs text-indigo-300/70">
                  <span>Chạm hoặc nhấn Space để lật thẻ • Nhấn S để phát âm</span>
                </div>
              </div>

              {/* Back Face */}
              <div className="card-face card-back bg-white text-slate-800 p-6 shadow-xl border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="font-bold text-slate-900 text-base">{currentCard.word}</span>
                  <span className="text-xs text-slate-400 font-mono">{currentCard.ipa}</span>
                </div>

                <div className="space-y-4 my-auto text-left">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block mb-0.5">
                      Nghĩa tiếng Việt:
                    </span>
                    <div className="meaning-vi text-xl font-bold text-slate-900">
                      {currentCard.meaning}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Ví dụ ngữ cảnh:
                    </span>
                    <div className="example-en text-sm font-medium text-indigo-900 italic">
                      "{currentCard.example}"
                    </div>
                    <div className="example-vi text-xs text-slate-600">
                      → {currentCard.exampleVi}
                    </div>
                  </div>

                  {currentCard.tip && (
                    <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200/70">
                      <strong className="font-semibold">Mẹo ghi nhớ:</strong> {currentCard.tip}
                    </div>
                  )}
                </div>

                <div className="text-center text-xs text-slate-400 border-t border-slate-100 pt-3">
                  <span>Chạm hoặc nhấn Space để lật về mặt trước</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation & Action Controls */}
          <div className="card-controls flex items-center justify-between w-full max-w-md gap-3">
            <button
              onClick={handlePrev}
              className="btn-prev-card flex-1 flex items-center justify-center gap-1 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-xs transition-all active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Từ trước</span>
            </button>

            {isVocabLearned(currentCard.id) ? (
              <button
                onClick={() => {
                  unmarkVocabLearned(currentCard.id);
                  showToast(`Đã chuyển "${currentCard.word}" sang chưa thuộc`, 'info');
                }}
                className="flex-1 flex items-center justify-center gap-1 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 font-bold text-xs shadow-xs transition-all active:scale-95"
              >
                <RotateCw className="w-4 h-4" />
                <span>Học lại từ này</span>
              </button>
            ) : (
              <button
                onClick={handleMarkLearned}
                className="btn-mark-learned flex-1 flex items-center justify-center gap-1 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Đã thuộc từ này</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="btn-next-card flex-1 flex items-center justify-center gap-1 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-xs transition-all active:scale-95"
            >
              <span>Từ tiếp theo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Keyboard shortcut legend */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">← / →</kbd> Chuyển từ
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">Space</kbd> Lật thẻ
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">S</kbd> Phát âm
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">Enter</kbd> Đã thuộc
            </span>
          </div>
        </>
      )}
    </div>
  );
};
