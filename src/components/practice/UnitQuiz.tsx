import React, { useState, useCallback } from 'react';
import { UnitData, UnitQuestion } from '../../types/curriculum';
import { useStudy } from '../../context/StudyContext';
import { useMistakes } from '../../context/MistakeContext';
import { useToast } from '../common/Toast';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { calculateScore10 } from '../../services/adaptiveService';
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, Check, RotateCcw } from 'lucide-react';

interface UnitQuizProps {
  unit: UnitData;
}

export const UnitQuiz: React.FC<UnitQuizProps> = ({ unit }) => {
  const { unitScores, saveUnitScore } = useStudy();
  const { harvestMistakes } = useMistakes();
  const { showToast } = useToast();

  const questions: UnitQuestion[] = unit.quiz || [];
  const [viewMode, setViewMode] = useState<'list' | 'focus'>('list');
  const [focusIndex, setFocusIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState<boolean>(false);

  const bestScore = unitScores[Number(unit.id)] ?? null;

  const handleSelectOption = useCallback((qId: string, optIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qId]: optIdx }));
  }, [isSubmitted]);

  const handleSubmit = useCallback(() => {
    let correctCount = 0;
    const wrongList: Array<{ question: UnitQuestion; wrongAnswer: number }> = [];

    questions.forEach(q => {
      const chosen = selectedAnswers[q.id];
      if (chosen === q.answer) {
        correctCount++;
      } else {
        wrongList.push({
          question: q,
          wrongAnswer: chosen !== undefined ? chosen : -1
        });
      }
    });

    const score10 = calculateScore10(correctCount, questions.length);
    setIsSubmitted(true);
    saveUnitScore(Number(unit.id), score10);

    if (wrongList.length > 0) {
      harvestMistakes('unit', unit.id, wrongList);
      showToast(`Đã nộp bài! Đạt ${score10}/10 điểm. Đã lưu ${wrongList.length} câu chưa đúng vào Sổ tay câu sai.`, 'warning');
    } else {
      showToast(`Tuyệt đối 10/10 điểm! Chúc mừng em đã hoàn thành xuất sắc!`, 'success');
    }
  }, [questions, selectedAnswers, unit.id, saveUnitScore, harvestMistakes, showToast]);

  const onPreSubmit = () => {
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < questions.length) {
      setShowConfirmSubmit(true);
    } else {
      handleSubmit();
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setFocusIndex(0);
  };

  // Score statistics
  const correctCount = isSubmitted
    ? questions.filter(q => selectedAnswers[q.id] === q.answer).length
    : 0;
  const currentScore10 = isSubmitted
    ? calculateScore10(correctCount, questions.length)
    : 0;

  const currentQuestion = questions[focusIndex] || questions[0];

  return (
    <div className="unit-quiz-view max-w-3xl mx-auto py-4">
      {/* Quiz Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Trắc nghiệm củng cố Unit {unit.id}
            </span>
            {bestScore !== null && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                Kỷ lục: {bestScore}/10
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {questions.length} Câu trắc nghiệm (Ngữ âm, Ngữ pháp, Từ vựng)
          </h3>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'list'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Xem cả danh sách
          </button>
          <button
            onClick={() => setViewMode('focus')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'focus'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🎯 Từng câu một
          </button>
        </div>
      </div>

      {/* Submitted Result Banner */}
      {isSubmitted && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-indigo-200 shrink-0">
              {currentScore10}
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900">
                Kết quả: {correctCount}/{questions.length} câu đúng
              </h4>
              <p className="text-xs text-slate-500">
                {currentScore10 >= 8.0
                  ? '🌟 Kết quả tuyệt vời! Em đã nắm chắc kiến thức Unit này.'
                  : currentScore10 >= 5.0
                  ? '👍 Khá tốt! Em hãy xem lại các câu sai bên dưới hoặc vào Sổ câu sai để làm lại.'
                  : '💪 Cần cố gắng thêm! Em xem kỹ lời giải và luyện tập lại nhé.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-colors shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Làm lại Unit Quiz</span>
          </button>
        </div>
      )}

      {/* Mode 1: Focus Mode (1 question per card) */}
      {viewMode === 'focus' && currentQuestion && (
        <div>
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
              <span>Câu {focusIndex + 1} / {questions.length}</span>
              <span>Đã chọn: {Object.keys(selectedAnswers).length}/{questions.length}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${((focusIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Dots navigation */}
          <div className="flex items-center gap-1.5 mb-6 flex-wrap justify-center">
            {questions.map((q, idx) => {
              const isSelected = selectedAnswers[q.id] !== undefined;
              const isCurrent = idx === focusIndex;
              let dotColor = 'bg-slate-200 text-slate-600';
              if (isSubmitted) {
                const isRight = selectedAnswers[q.id] === q.answer;
                dotColor = isRight ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white';
              } else if (isSelected) {
                dotColor = 'bg-indigo-600 text-white';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setFocusIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${dotColor} ${
                    isCurrent ? 'ring-2 ring-indigo-400 scale-110 shadow-xs' : ''
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Single Question Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600 uppercase">
                {currentQuestion.section}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Câu hỏi {focusIndex + 1}
              </span>
            </div>

            <div
              className="text-lg font-bold text-slate-900 mb-6 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
            />

            {/* Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((opt, optIdx) => {
                const isChosen = selectedAnswers[currentQuestion.id] === optIdx;
                const isCorrect = currentQuestion.answer === optIdx;

                let optStyle = 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-800';
                if (isSubmitted) {
                  if (isCorrect) {
                    optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                  } else if (isChosen && !isCorrect) {
                    optStyle = 'border-rose-400 bg-rose-50 text-rose-900';
                  }
                } else if (isChosen) {
                  optStyle = 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-2xs';
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                    disabled={isSubmitted}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${optStyle}`}
                  >
                    <span dangerouslySetInnerHTML={{ __html: opt }} />
                    {isSubmitted && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isSubmitted && isChosen && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation when submitted */}
            {isSubmitted && currentQuestion.explanation && (
              <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-950 space-y-1">
                <span className="font-bold text-indigo-900 block">💡 Giải thích chi tiết:</span>
                <p className="leading-relaxed">{currentQuestion.explanation}</p>
              </div>
            )}
          </div>

          {/* Stepper controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setFocusIndex(prev => Math.max(0, prev - 1))}
              disabled={focusIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Câu trước</span>
            </button>

            {!isSubmitted ? (
              <button
                onClick={onPreSubmit}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition-all"
              >
                Nộp bài & Chấm điểm
              </button>
            ) : null}

            <button
              onClick={() => setFocusIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={focusIndex === questions.length - 1}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              <span>Câu sau</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mode 2: List Mode (All questions rendered together) */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">
                  Câu {idx + 1} • <span className="uppercase">{q.section}</span>
                </span>
                {isSubmitted && (
                  <span>
                    {selectedAnswers[q.id] === q.answer ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" /> Đúng
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-500 text-xs font-bold">
                        <XCircle className="w-4 h-4" /> Sai
                      </span>
                    )}
                  </span>
                )}
              </div>

              <div
                className="text-base font-bold text-slate-900 mb-4"
                dangerouslySetInnerHTML={{ __html: q.question }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                {q.options.map((opt, optIdx) => {
                  const isChosen = selectedAnswers[q.id] === optIdx;
                  const isCorrect = q.answer === optIdx;

                  let optClass = 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-800';
                  if (isSubmitted) {
                    if (isCorrect) {
                      optClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                    } else if (isChosen && !isCorrect) {
                      optClass = 'border-rose-400 bg-rose-50 text-rose-900';
                    }
                  } else if (isChosen) {
                    optClass = 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-2xs';
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      disabled={isSubmitted}
                      className={`text-left p-3.5 rounded-xl border transition-all text-xs flex items-center justify-between ${optClass}`}
                    >
                      <span dangerouslySetInnerHTML={{ __html: opt }} />
                      {isSubmitted && isCorrect && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {isSubmitted && q.explanation && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                  <strong className="text-slate-800">Giải thích:</strong> {q.explanation}
                </div>
              )}
            </div>
          ))}

          {!isSubmitted && (
            <div className="text-center pt-4 pb-8">
              <button
                onClick={onPreSubmit}
                className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all active:scale-95"
              >
                Nộp bài & Chấm điểm ({Object.keys(selectedAnswers).length}/{questions.length} câu)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog before submitting if unfinished */}
      <ConfirmDialog
        isOpen={showConfirmSubmit}
        title="Nộp bài khi chưa làm hết?"
        message={`Em mới trả lời ${Object.keys(selectedAnswers).length}/${questions.length} câu hỏi. Các câu chưa chọn sẽ bị tính là câu sai và lưu vào Sổ tay câu sai. Em có chắc muốn nộp bài ngay không?`}
        confirmText="Vẫn nộp bài"
        cancelText="Làm tiếp"
        isDanger={false}
        onConfirm={() => {
          setShowConfirmSubmit(false);
          handleSubmit();
        }}
        onCancel={() => setShowConfirmSubmit(false)}
      />
    </div>
  );
};
