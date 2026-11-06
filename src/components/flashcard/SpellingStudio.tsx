import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UnitData, VocabularyItem } from '../../types/curriculum';
import { useStudy } from '../../context/StudyContext';
import { useToast } from '../common/Toast';
import { speakEnglish } from '../../services/speechService';
import { isSpellingMatch, normalizeSpellingWord } from '../../services/adaptiveService';
import { Volume2, CheckCircle2, XCircle, Lightbulb, Eye, ArrowRight } from 'lucide-react';

interface SpellingStudioProps {
  unit: UnitData;
}

export const SpellingStudio: React.FC<SpellingStudioProps> = ({ unit }) => {
  const { markVocabLearned } = useStudy();
  const { showToast } = useToast();

  const allVocab = unit.vocab || [];
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');
  const [hintsRevealed, setHintsRevealed] = useState<number>(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const inputRef = useRef<HTMLInputElement>(null);

  const currentCard: VocabularyItem | null = allVocab.length > 0
    ? allVocab[currentIndex % allVocab.length]
    : null;

  // Reset state on card change
  useEffect(() => {
    setUserInput('');
    setHintsRevealed(0);
    setIsAnswerRevealed(false);
    setStatus('idle');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, unit.id]);

  const cleanTarget = currentCard ? normalizeSpellingWord(currentCard.word) : '';

  const handleCheck = useCallback(() => {
    if (!currentCard) return;

    if (!userInput.trim()) {
      showToast('Vui lòng gõ từ tiếng Anh trước khi kiểm tra!', 'warning');
      return;
    }

    const matched = isSpellingMatch(currentCard.word, userInput);
    if (matched) {
      setStatus('correct');
      speakEnglish(currentCard.word);
      markVocabLearned(currentCard.id);
      showToast('Chính xác! Đã tự động lưu vào danh sách Đã thuộc.', 'success');
    } else {
      setStatus('wrong');
      showToast('Chưa chính xác, em hãy thử lại hoặc dùng Gợi ý nhé!', 'error');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [currentCard, userInput, markVocabLearned, showToast]);

  const handleNext = useCallback(() => {
    if (allVocab.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % allVocab.length);
  }, [allVocab.length]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (status === 'correct') {
        handleNext();
      } else {
        handleCheck();
      }
    }
  };

  const handleHint = () => {
    if (!cleanTarget) return;
    setHintsRevealed(prev => Math.min(cleanTarget.length, prev + 1));
  };

  const handleReveal = () => {
    if (!currentCard) return;
    setIsAnswerRevealed(true);
    speakEnglish(currentCard.word);
  };

  if (!currentCard) {
    return <div className="text-center py-12 text-slate-500">Không có từ vựng nào trong bài này.</div>;
  }

  // Mask target word in sentence
  const maskedExample = currentCard.example.replace(
    new RegExp(currentCard.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
    '____________'
  );

  return (
    <div className="spelling-challenge max-w-2xl mx-auto py-4">
      {/* Progress & Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Thử thách Active Recall Spelling
          </span>
          <h3 className="text-xl font-black text-slate-900">Nghe & Gõ Từ Vựng</h3>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
          Từ {currentIndex + 1} / {allVocab.length}
        </span>
      </div>

      {/* Challenge Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 mb-6">
        {/* Clue Section */}
        <div className="text-center mb-6">
          <button
            onClick={() => speakEnglish(currentCard.word)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-sm shadow-xs transition-colors mb-4"
            title="Bấm để nghe phát âm"
          >
            <Volume2 className="w-5 h-5 text-indigo-600" />
            <span>Nghe phát âm chuẩn</span>
          </button>

          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Nghĩa tiếng Việt
          </div>
          <div className="text-2xl font-black text-slate-900 mb-4">
            {currentCard.meaning}
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm italic text-slate-700 max-w-lg mx-auto">
            "{maskedExample}"
          </div>
        </div>

        {/* Hints / Blank slots */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 font-mono text-xl sm:text-2xl font-bold tracking-widest text-indigo-600 mb-2">
            {isAnswerRevealed
              ? currentCard.word
              : cleanTarget.split('').map((char, idx) => {
                  if (char === ' ') return <span key={idx} className="mx-1.5 text-slate-300">␣</span>;
                  if (idx < hintsRevealed) return <span key={idx} className="text-indigo-600 border-b-2 border-indigo-500 px-1">{char}</span>;
                  return <span key={idx} className="text-slate-300 border-b-2 border-slate-300 px-1">_</span>;
                })}
          </div>
          <span className="text-xs text-slate-400">
            Từ gồm {cleanTarget.replace(/\s+/g, '').length} chữ cái ({currentCard.type})
          </span>
        </div>

        {/* Input & Check */}
        <div className="max-w-md mx-auto mb-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={e => {
                setUserInput(e.target.value);
                if (status === 'wrong') setStatus('idle');
              }}
              onKeyDown={handleKeyDown}
              disabled={status === 'correct'}
              placeholder="Gõ từ tiếng Anh vào đây..."
              className={`w-full px-5 py-3.5 rounded-2xl border-2 text-base font-semibold transition-all outline-none ${
                status === 'correct'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                  : status === 'wrong'
                  ? 'border-rose-400 bg-rose-50/50 text-slate-900 focus:border-rose-500'
                  : 'border-slate-200 focus:border-indigo-500 bg-slate-50 focus:bg-white text-slate-900'
              }`}
            />
            {status === 'correct' && (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 absolute right-4 top-3.5" />
            )}
            {status === 'wrong' && (
              <XCircle className="w-6 h-6 text-rose-500 absolute right-4 top-3.5" />
            )}
          </div>
        </div>

        {/* Feedback message */}
        {status === 'correct' && (
          <div className="max-w-md mx-auto mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center text-sm font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Chính xác 100%! Em nhớ rất tốt.</span>
          </div>
        )}

        {status === 'wrong' && (
          <div className="max-w-md mx-auto mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-center text-sm font-semibold flex items-center justify-center gap-2">
            <XCircle className="w-5 h-5 text-rose-500" />
            <span>Chưa khớp chính tả, em kiểm tra lại các ký tự nhé!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {status === 'correct' ? (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-200 transition-all"
            >
              <span>Từ tiếp theo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={handleCheck}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all active:scale-95"
              >
                Kiểm tra (Enter)
              </button>
              <button
                onClick={handleHint}
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs transition-colors"
              >
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>Gợi ý chữ cái ({hintsRevealed}/{cleanTarget.length})</span>
              </button>
              <button
                onClick={handleReveal}
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                <Eye className="w-4 h-4 text-slate-500" />
                <span>Xem đáp án</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
