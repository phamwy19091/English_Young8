import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ExamData, UnitQuestion } from '../../types/curriculum';
import { useStudy } from '../../context/StudyContext';
import { useMistakes } from '../../context/MistakeContext';
import { useToast } from '../common/Toast';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ExamResultModal } from './ExamResultModal';
import {
  calculateScore10,
  cloneAndShuffleOptions
} from '../../services/adaptiveService';
import { Clock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

interface ExamRoomProps {
  exam: ExamData;
  onExit: () => void;
}

export const ExamRoom: React.FC<ExamRoomProps> = ({ exam, onExit }) => {
  const { recordExamAttempt } = useStudy();
  const { mistakes, harvestMistakes, resolveMistakesBatch } = useMistakes();
  const { showToast } = useToast();

  // Prepare shuffled questions
  const shuffledQuestions = useMemo(() => {
    const questions = exam.questions || [];
    return questions.map(q => cloneAndShuffleOptions(q));
  }, [exam]);

  const totalDuration = (exam.durationMinutes || 15) * 60;
  const [secondsLeft, setSecondsLeft] = useState<number>(() => totalDuration);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [showPreSubmitConfirm, setShowPreSubmitConfirm] = useState<boolean>(false);
  const [activeResult, setActiveResult] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Refs to prevent stale closure during countdown timer auto-submit
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const secondsLeftRef = useRef(secondsLeft);
  secondsLeftRef.current = secondsLeft;

  const isSubmittedRef = useRef(isSubmitted);
  isSubmittedRef.current = isSubmitted;

  const handleSelectOption = (qId: string, optIdx: number) => {
    if (isSubmittedRef.current) return;
    setAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const handleFinalSubmit = useCallback(
    (isForced: boolean = false) => {
      if (isSubmittedRef.current) return;
      isSubmittedRef.current = true;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const currentAnswers = answersRef.current;
      const currentSecondsLeft = secondsLeftRef.current;
      const actualTimeSpent = isForced ? totalDuration : Math.max(0, totalDuration - currentSecondsLeft);

      let correctCount = 0;
      const wrongList: Array<{ question: UnitQuestion; wrongAnswer: number }> = [];
      const answersDetails: any[] = [];
      const resolvedMistakeIds: string[] = [];

      shuffledQuestions.forEach(q => {
        const chosen = currentAnswers[q.id];
        const isCorrect = chosen === q.answer;
        if (isCorrect) {
          correctCount++;
          // Adaptive clearance: if this question was in mistakes, resolve it
          const originId = (q as any).originalQuestionId || q.id;
          const matchedMistake = mistakes.find(
            m => !m.resolved && (m.questionId === originId || m.questionId === q.id)
          );
          if (matchedMistake && !resolvedMistakeIds.includes(matchedMistake.id)) {
            resolvedMistakeIds.push(matchedMistake.id);
          }
        } else {
          wrongList.push({
            question: q,
            wrongAnswer: chosen !== undefined ? chosen : -1
          });
        }

        answersDetails.push({
          question: q,
          isCorrect,
          chosenOption: chosen
        });
      });

      // Atomic batch resolution of resolved mistakes
      if (resolvedMistakeIds.length > 0) {
        resolveMistakesBatch(resolvedMistakeIds);
      }

      const score10 = calculateScore10(correctCount, shuffledQuestions.length);
      setIsSubmitted(true);

      // Save attempt
      const attempt = recordExamAttempt({
        examId: exam.id,
        examTitle: exam.title,
        score: score10,
        totalQuestions: shuffledQuestions.length,
        timeSpentSeconds: actualTimeSpent,
        answers: currentAnswers,
        answersDetails
      });

      // Harvest wrong answers
      if (wrongList.length > 0) {
        harvestMistakes('exam', exam.id, wrongList);
      }

      const resultObj = {
        ...attempt,
        questions: shuffledQuestions,
        answersDetails,
        score10,
        correctCount,
        resolvedCount: resolvedMistakeIds.length
      };

      setActiveResult(resultObj);

      if (isForced) {
        showToast('Hết giờ làm bài! Hệ thống đã tự động thu bài và chấm điểm.', 'warning');
      } else {
        showToast(`Đã nộp bài! Đạt ${score10}/10 điểm.`, 'success');
      }
    },
    [
      shuffledQuestions,
      exam,
      totalDuration,
      mistakes,
      recordExamAttempt,
      resolveMistakesBatch,
      harvestMistakes,
      showToast
    ]
  );

  const handleFinalSubmitRef = useRef(handleFinalSubmit);
  handleFinalSubmitRef.current = handleFinalSubmit;

  // Countdown Timer
  useEffect(() => {
    if (isSubmitted) return;

    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          // Auto-submit on expiry using latest ref
          handleFinalSubmitRef.current(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isSubmitted]);

  const onPreSubmit = () => {
    const answeredCount = Object.keys(answersRef.current).length;
    if (answeredCount < shuffledQuestions.length) {
      setShowPreSubmitConfirm(true);
    } else {
      handleFinalSubmit(false);
    }
  };

  const timeSpentSeconds = activeResult?.timeSpentSeconds ?? (totalDuration - secondsLeft);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const scrollToQuestion = (idx: number) => {
    const el = document.getElementById(`q-card-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="exam-room min-h-screen bg-slate-50 flex flex-col">
      {/* Sticky Top Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!isSubmitted) {
                  setShowExitConfirm(true);
                } else {
                  onExit();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Quay lại danh sách đề</span>
            </button>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight">
                {exam.title}
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">
                {shuffledQuestions.length} câu • {exam.durationMinutes} phút
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Countdown timer */}
            <div
              className={`countdown-timer flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-mono font-bold shadow-xs ${
                secondsLeft <= 60
                  ? 'bg-rose-100 text-rose-700 animate-pulse border border-rose-300'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>⏳ {timeFormatted}</span>
            </div>

            {/* Submit button */}
            {!isSubmitted && (
              <button
                onClick={onPreSubmit}
                className="btn-submit-exam px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all active:scale-95"
              >
                Nộp bài ({Object.keys(answers).length}/{shuffledQuestions.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Body: Questions List + Sticky Question Palette Sidebar */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Side: Question Cards */}
        <div className="flex-1 w-full space-y-6 exam-questions-list">
          {/* Result Banner if submitted */}
          {isSubmitted && activeResult && (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 animate-in fade-in">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-3xl shadow-inner">
                  {activeResult.score10}
                </div>
                <div>
                  <h3 className="text-xl font-black">
                    Hoàn thành bài thi! ({activeResult.correctCount}/{shuffledQuestions.length} câu đúng)
                  </h3>
                  <p className="text-xs text-emerald-100 mt-1">
                    Thời gian hoàn thành: {Math.floor(timeSpentSeconds / 60)}p {timeSpentSeconds % 60}s.
                    {activeResult.resolvedCount > 0 &&
                      ` Đã gỡ thành công ${activeResult.resolvedCount} câu khỏi Sổ tay câu sai!`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-xs shadow-md hover:bg-emerald-50 transition-colors"
                >
                  🔍 Soi chi tiết bài làm
                </button>
                <button
                  onClick={onExit}
                  className="px-5 py-2.5 rounded-xl bg-black/20 hover:bg-black/30 text-white font-bold text-xs transition-colors"
                >
                  Đóng phòng thi
                </button>
              </div>
            </div>
          )}

          {/* List of Questions */}
          {shuffledQuestions.map((q, idx) => {
            const chosenIdx = answers[q.id];

            return (
              <div
                key={q.id || idx}
                id={`q-card-${idx}`}
                data-qid={q.id}
                className="question-card bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 sm:p-8 scroll-mt-24 transition-all"
              >
                {/* Question Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400">
                    Câu hỏi {idx + 1} • <span className="uppercase">{q.section}</span>
                  </span>
                  {isSubmitted && (
                    <span>
                      {chosenIdx === q.answer ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" /> Đúng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-500 text-xs font-bold">
                          <AlertCircle className="w-4 h-4" /> Chưa đúng
                        </span>
                      )}
                    </span>
                  )}
                </div>

                {/* Sticky reading passage if any */}
                {q.passage && (
                  <div className="passage-sticky-box mb-6 p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-slate-700 leading-relaxed max-h-56 overflow-y-auto">
                    <strong className="block text-indigo-950 font-bold mb-1">
                      📖 Đọc đoạn văn sau và trả lời câu hỏi:
                    </strong>
                    <div dangerouslySetInnerHTML={{ __html: q.passage }} />
                  </div>
                )}

                {/* Question Prompt */}
                <div
                  className="q-title text-base sm:text-lg font-bold text-slate-900 mb-6 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: q.question }}
                />

                {/* Options Group */}
                <div className="options-group space-y-3">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = chosenIdx === oIdx;
                    const isRight = q.answer === oIdx;

                    let btnStyle = 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-800';
                    if (isSubmitted) {
                      if (isRight) {
                        btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                      } else if (isSelected && !isRight) {
                        btnStyle = 'border-rose-400 bg-rose-50 text-rose-900';
                      }
                    } else if (isSelected) {
                      btnStyle = 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-2xs';
                    }

                    return (
                      <button
                        key={oIdx}
                        data-idx={oIdx}
                        onClick={() => handleSelectOption(q.id, oIdx)}
                        disabled={isSubmitted}
                        className={`option-btn w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between text-sm ${btnStyle} ${
                          isSelected ? 'selected' : ''
                        }`}
                      >
                        <span dangerouslySetInnerHTML={{ __html: opt }} />
                        {isSubmitted && isRight && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation when submitted */}
                {isSubmitted && q.explanation && (
                  <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                    <strong className="text-slate-800">💡 Giải thích chi tiết: </strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Side: Sticky Question Palette Sidebar */}
        <div className="w-full lg:w-80 shrink-0 sticky top-24">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
            <h4 className="text-sm font-bold text-slate-900 mb-2">
              Hoa tiêu câu hỏi ({Object.keys(answers).length}/{shuffledQuestions.length})
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Bấm vào số câu để cuộn nhanh đến câu đó.
            </p>

            <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
              {shuffledQuestions.map((q, idx) => {
                const isSelected = answers[q.id] !== undefined;
                let bg = 'bg-slate-100 text-slate-600 hover:bg-slate-200';
                if (isSubmitted) {
                  const isRight = answers[q.id] === q.answer;
                  bg = isRight ? 'bg-emerald-500 text-white font-bold' : 'bg-rose-500 text-white font-bold';
                } else if (isSelected) {
                  bg = 'bg-indigo-600 text-white font-bold shadow-xs';
                }

                return (
                  <button
                    key={q.id || idx}
                    onClick={() => scrollToQuestion(idx)}
                    className={`h-9 rounded-xl text-xs font-semibold transition-all ${bg}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2">
              {!isSubmitted ? (
                <button
                  onClick={onPreSubmit}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all active:scale-95"
                >
                  Nộp bài & Chấm điểm
                </button>
              ) : (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition-all"
                >
                  🔍 Soi chi tiết bài làm
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Exit In-Progress Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showExitConfirm}
        title="Thoát phòng thi dở dang?"
        message="Bài thi đang diễn ra, nếu em thoát bây giờ thì kết quả chưa nộp sẽ bị hủy bỏ. Em có chắc chắn muốn thoát không?"
        confirmText="Xác nhận thoát"
        cancelText="Làm tiếp"
        isDanger={true}
        onConfirm={() => {
          setShowExitConfirm(false);
          onExit();
        }}
        onCancel={() => setShowExitConfirm(false)}
      />

      {/* Unfinished Submission Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showPreSubmitConfirm}
        title="Nộp bài khi chưa chọn hết?"
        message={`Em mới làm ${Object.keys(answers).length}/${shuffledQuestions.length} câu hỏi. Các câu chưa chọn sẽ tính 0 điểm. Em có muốn nộp ngay không?`}
        confirmText="Vẫn nộp bài"
        cancelText="Làm tiếp"
        isDanger={false}
        onConfirm={() => {
          setShowPreSubmitConfirm(false);
          handleFinalSubmit(false);
        }}
        onCancel={() => setShowPreSubmitConfirm(false)}
      />

      {/* Review Modal ("Soi bài làm") */}
      <ExamResultModal
        isOpen={showReviewModal}
        attempt={activeResult}
        onClose={() => setShowReviewModal(false)}
      />
    </div>
  );
};
