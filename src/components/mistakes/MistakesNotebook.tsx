import React, { useState } from 'react';
import { useMistakes } from '../../context/MistakeContext';
import { useToast } from '../common/Toast';
import { MistakeItem } from '../../types/storage';
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  EyeOff,
  Flame,
  Search
} from 'lucide-react';

interface MistakesNotebookProps {
  onStartCustomQuiz?: (questions: any[]) => void;
}

export const MistakesNotebook: React.FC<MistakesNotebookProps> = ({ onStartCustomQuiz }) => {
  const {
    mistakes,
    retryMistake,
    resolveMistake,
    deleteMistake,
    clearResolvedMistakes,
    generateBatchQuiz
  } = useMistakes();
  const { showToast } = useToast();

  const [filterType, setFilterType] = useState<'all' | 'unit' | 'exam'>('all');
  const [filterStatus, setFilterStatus] = useState<'unresolved' | 'resolved' | 'all'>('unresolved');
  const [search, setSearch] = useState<string>('');
  const [globalReveal, setGlobalReveal] = useState<boolean>(false);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [retryFeedback, setRetryFeedback] = useState<Record<string, { isCorrect: boolean; chosenIdx: number }>>({});

  const filteredMistakes = mistakes.filter(m => {
    if (filterType !== 'all' && m.sourceType !== filterType) return false;
    if (filterStatus === 'unresolved' && m.resolved) return false;
    if (filterStatus === 'resolved' && !m.resolved) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchQ = (m.question?.question || '').toLowerCase().includes(q);
      const matchExpl = (m.question?.explanation || '').toLowerCase().includes(q);
      const matchSource = String(m.sourceId).toLowerCase().includes(q);
      if (!matchQ && !matchExpl && !matchSource) return false;
    }

    return true;
  });

  const handleRetryOption = (m: MistakeItem, optIdx: number) => {
    const result = retryMistake(m.id, optIdx);
    setRetryFeedback(prev => ({
      ...prev,
      [m.id]: { isCorrect: result.isCorrect, chosenIdx: optIdx }
    }));

    if (result.isCorrect) {
      showToast('🎉 Xuất sắc! Em đã chọn đúng và gỡ thành công câu này.', 'success');
      // Automatically reveal explanation when solved
      setRevealedIds(prev => ({ ...prev, [m.id]: true }));
    } else {
      showToast('✘ Chưa đúng rồi, em hãy thử suy nghĩ lại một lần nữa nhé!', 'error');
    }
  };

  const toggleRevealSingle = (mId: string) => {
    setRevealedIds(prev => ({ ...prev, [mId]: !prev[mId] }));
  };

  const handleClearAllResolved = () => {
    const count = clearResolvedMistakes();
    showToast(`Đã dọn dẹp ${count} câu đã gỡ thành công khỏi Sổ tay.`, 'info');
  };

  const handleStartBatch = () => {
    const batch = generateBatchQuiz();
    if (batch.length === 0) {
      showToast('Không có câu hỏi nào để làm lại!', 'warning');
      return;
    }
    if (onStartCustomQuiz) {
      onStartCustomQuiz(batch);
    }
  };

  const unresolvedCount = mistakes.filter(m => !m.resolved).length;
  const resolvedCount = mistakes.filter(m => m.resolved).length;

  return (
    <div className="mistakes-view max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <AlertCircle className="w-5 h-5" />
              </span>
              <h2 className="text-2xl font-black text-slate-900">Sổ Tay Câu Sai (Mistake Notebook)</h2>
            </div>
            <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
              Tự động thu gom các câu em trả lời chưa đúng từ bài tập Unit và đề thi.
              Chế độ <strong>Spoiler-Free</strong> giúp em tự gỡ lỗi mà không bị lộ đáp án trước.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleStartBatch}
              disabled={unresolvedCount === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-rose-200 transition-all active:scale-95"
            >
              <Flame className="w-4 h-4 fill-white" />
              <span>Làm lại nhanh tại chỗ ({unresolvedCount})</span>
            </button>

            {resolvedCount > 0 && (
              <button
                onClick={handleClearAllResolved}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
              >
                Xóa {resolvedCount} câu đã gỡ
              </button>
            )}
          </div>
        </div>

        {/* Filter and search bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả nguồn
            </button>
            <button
              onClick={() => setFilterType('unit')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filterType === 'unit'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Từ Unit
            </button>
            <button
              onClick={() => setFilterType('exam')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filterType === 'exam'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Từ Đề thi
            </button>
            <div className="h-4 w-px bg-slate-200 mx-1" />
            <button
              onClick={() => setFilterStatus('unresolved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filterStatus === 'unresolved'
                  ? 'bg-white text-rose-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chưa gỡ ({unresolvedCount})
            </button>
            <button
              onClick={() => setFilterStatus('resolved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filterStatus === 'resolved'
                  ? 'bg-white text-emerald-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đã gỡ xong ({resolvedCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm trong câu sai..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={() => setGlobalReveal(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-colors whitespace-nowrap"
            >
              {globalReveal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{globalReveal ? 'Ẩn toàn bộ giải' : 'Hiện toàn bộ giải'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredMistakes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-1">
            Không có câu sai nào trong mục này!
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Em đang làm bài rất tốt. Bất kỳ câu nào làm chưa đúng trong Unit Quiz hoặc Đề thi sẽ tự động xuất hiện tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredMistakes.map((m) => {
            const q = m.question;
            const isRevealed = globalReveal || Boolean(revealedIds[m.id]);
            const feedback = retryFeedback[m.id];
            const isResolved = m.resolved;

            return (
              <div
                key={m.id}
                className={`bg-white rounded-3xl border transition-all p-6 sm:p-7 shadow-xs ${
                  isResolved
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : feedback && !feedback.isCorrect
                    ? 'border-rose-300 bg-rose-50/10'
                    : 'border-slate-200'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-slate-100 text-slate-600">
                      {m.sourceType === 'unit' ? `Unit ${m.sourceId}` : `Đề thi: ${m.sourceId}`}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {m.addedAt?.split('T')[0]}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isResolved ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đã gỡ thành công</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                        Cần gỡ lỗi
                      </span>
                    )}

                    <button
                      onClick={() => {
                        deleteMistake(m.id);
                        showToast('Đã xóa câu hỏi khỏi Sổ tay câu sai!', 'info');
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Xóa khỏi sổ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Reading passage if applicable */}
                {q.passage && (
                  <div className="mb-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-48 overflow-y-auto">
                    <strong className="block text-slate-900 mb-1">📖 Đoạn văn đọc hiểu:</strong>
                    <div dangerouslySetInnerHTML={{ __html: q.passage }} />
                  </div>
                )}

                {/* Question Prompt */}
                <div
                  className="text-base font-bold text-slate-900 mb-5 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: q.question }}
                />

                {/* Options (Spoiler-Free In-Card Retry) */}
                <div className="space-y-2.5 mb-5">
                  {q.options.map((opt, optIdx) => {
                    const wasWrongChoice = m.wrongAnswer === optIdx;
                    const isCorrectAnswer = q.answer === optIdx;
                    const isRetryChosen = feedback?.chosenIdx === optIdx;

                    let optStyle = 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-800';
                    if (isRevealed || isResolved) {
                      if (isCorrectAnswer) {
                        optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                      } else if (wasWrongChoice) {
                        optStyle = 'border-rose-300 bg-rose-50/70 text-rose-950';
                      }
                    } else if (isRetryChosen) {
                      optStyle = feedback.isCorrect
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-rose-400 bg-rose-50 text-rose-950 font-semibold';
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleRetryOption(m, optIdx)}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between text-xs sm:text-sm ${optStyle}`}
                      >
                        <span dangerouslySetInnerHTML={{ __html: opt }} />
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {wasWrongChoice && !isResolved && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-100/80 px-2 py-0.5 rounded-md">
                              (Lần trước em chọn)
                            </span>
                          )}
                          {(isRevealed || isResolved) && isCorrectAnswer && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                              (Đáp án đúng)
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Retry In-Card Feedback Message */}
                {feedback && !isResolved && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 mb-4 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>✘ Chưa đúng, thử lại nhé! Em hãy đọc kỹ lại câu hỏi.</span>
                  </div>
                )}

                {/* Explanation container */}
                {isRevealed && q.explanation && (
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 mb-4 space-y-1">
                    <strong className="block font-bold text-indigo-900">💡 Lời giải thích chi tiết:</strong>
                    <p className="leading-relaxed">{q.explanation}</p>
                  </div>
                )}

                {/* Card footer controls */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => toggleRevealSingle(m.id)}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-indigo-600 font-semibold"
                  >
                    {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{isRevealed ? 'Ẩn đáp án & lời giải' : '👁️ Xem đáp án & lời giải'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {!isResolved ? (
                      <button
                        onClick={() => {
                          resolveMistake(m.id);
                          showToast('Đã đánh dấu đã hiểu câu hỏi này.', 'success');
                        }}
                        className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-bold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đã hiểu kỹ</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          deleteMistake(m.id);
                          showToast('Đã xóa khỏi sổ!', 'info');
                        }}
                        className="text-rose-600 hover:text-rose-800 font-bold"
                      >
                        Xóa khỏi sổ
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
