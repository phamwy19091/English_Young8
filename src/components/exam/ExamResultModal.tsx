import React from 'react';
import { ExamAttempt } from '../../types/storage';
import { UnitQuestion } from '../../types/curriculum';
import { unitsData } from '../../data/units';
import { examsData } from '../../data/exams';
import { X, CheckCircle2, XCircle } from 'lucide-react';

interface ExamResultModalProps {
  isOpen: boolean;
  attempt: (ExamAttempt & {
    questions?: UnitQuestion[];
    answersDetails?: any[];
    score10?: number;
    correct?: number;
    raw_score?: number;
    total?: number;
    total_questions?: number;
    timeSpent?: string;
    date?: string;
  }) | null;
  onClose: () => void;
}

export const ExamResultModal: React.FC<ExamResultModalProps> = ({
  isOpen,
  attempt,
  onClose
}) => {
  if (!isOpen || !attempt) return null;

  // 1. Resolve Score (never undefined or NaN)
  const scoreVal = typeof attempt.score === 'number' && !isNaN(attempt.score)
    ? attempt.score
    : typeof attempt.score10 === 'number' && !isNaN(attempt.score10)
    ? attempt.score10
    : 0;

  // 2. Resolve Questions list with dynamic curriculum fallback
  let questions: UnitQuestion[] = [];
  if (Array.isArray(attempt.questions) && attempt.questions.length > 0) {
    questions = attempt.questions;
  } else if (Array.isArray(attempt.answersDetails) && attempt.answersDetails.length > 0) {
    questions = attempt.answersDetails.map((d: any) => d.question).filter(Boolean);
  } else {
    const examId = attempt.examId || (attempt as any).exercise_id || '';
    if (examId.startsWith('quiz-unit-') || examId.startsWith('unit-')) {
      const match = examId.match(/\d+/);
      const uNum = match ? Number(match[0]) : 1;
      const u = unitsData.find(unit => unit.number === uNum || unit.id === `unit-${uNum}`);
      if (u && u.quiz) questions = u.quiz;
    } else {
      const ex = examsData.find(e => e.id === examId);
      if (ex && ex.questions) questions = ex.questions;
    }
  }

  // 3. Resolve Total and Correct Count (avoid any NaN)
  const totalQ = attempt.totalQuestions || attempt.total || attempt.total_questions || (questions.length > 0 ? questions.length : 12);

  let correctCount = attempt.correct ?? attempt.raw_score;
  if (correctCount === undefined || isNaN(correctCount)) {
    correctCount = Math.round((scoreVal / 10) * totalQ);
  }

  // 4. Resolve Time
  const timeSec = typeof attempt.timeSpentSeconds === 'number' && !isNaN(attempt.timeSpentSeconds)
    ? attempt.timeSpentSeconds
    : typeof (attempt as any).time_spent_seconds === 'number' && !isNaN((attempt as any).time_spent_seconds)
    ? (attempt as any).time_spent_seconds
    : 0;
  const minutes = Math.floor(timeSec / 60);
  const seconds = timeSec % 60;
  const timeFormatted = typeof attempt.timeSpent === 'string' && attempt.timeSpent !== 'Hoàn thành'
    ? attempt.timeSpent
    : `${minutes}p ${seconds}s`;

  const dateFormatted = attempt.submittedAt?.split('T')[0] || attempt.date || 'Gần đây';

  return (
    <div
      id="modal-root"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in"
    >
      <div className="bg-white rounded-3xl max-w-4xl w-full my-8 p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                Soi chi tiết bài làm
              </span>
              <span className="text-xs text-slate-400">
                {dateFormatted}
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900">{attempt.examTitle}</h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score and Stats Banner */}
        <div className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Điểm số
            </span>
            <div className="text-2xl font-black text-indigo-600">{scoreVal}/10</div>
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Số câu đúng
            </span>
            <div className="text-2xl font-black text-slate-900">
              {correctCount}/{totalQ}
            </div>
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Thời gian làm
            </span>
            <div className="text-2xl font-black text-slate-700">{timeFormatted}</div>
          </div>
        </div>

        {/* Question Review Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {questions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Chi tiết các câu hỏi của lần thi này không khả dụng.
            </div>
          ) : (
            questions.map((q, idx) => {
              const answersObj = attempt.answers || {};
              const userChoice = answersObj[q.id];
              const isCorrect = userChoice !== undefined && userChoice === q.answer;
              const options = Array.isArray(q.options) ? q.options : [];

              return (
                <div
                  key={q.id || idx}
                  className={`p-5 rounded-2xl border transition-all ${
                    isCorrect
                      ? 'bg-emerald-50/20 border-emerald-200'
                      : 'bg-rose-50/20 border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-400">
                      Câu {idx + 1} • <span className="uppercase">{q.section || 'Trắc nghiệm'}</span>
                    </span>
                    <div>
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4" /> Đúng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-500 font-bold text-xs">
                          <XCircle className="w-4 h-4" /> Sai
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Reading passage if applicable */}
                  {q.passage && (
                    <div className="mb-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-48 overflow-y-auto">
                      <strong className="block text-slate-900 mb-1">📖 Đoạn văn đọc hiểu:</strong>
                      <div dangerouslySetInnerHTML={{ __html: q.passage }} />
                    </div>
                  )}

                  <div
                    className="text-sm font-bold text-slate-900 mb-3"
                    dangerouslySetInnerHTML={{ __html: q.question }}
                  />

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {options.map((opt, oIdx) => {
                      const isSelected = userChoice === oIdx;
                      const isRightAnswer = q.answer === oIdx;

                      let optClass = 'bg-slate-50 text-slate-700 border-slate-200';
                      if (isRightAnswer) {
                        optClass = 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold';
                      } else if (isSelected && !isRightAnswer) {
                        optClass = 'bg-rose-100 text-rose-900 border-rose-400 font-bold';
                      }

                      return (
                        <div
                          key={oIdx}
                          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${optClass}`}
                        >
                          <span dangerouslySetInnerHTML={{ __html: opt }} />
                          {isSelected && !isRightAnswer && (
                            <span className="text-[10px] font-bold text-rose-600 ml-1">
                              (Em đã chọn)
                            </span>
                          )}
                          {isRightAnswer && (
                            <span className="text-[10px] font-bold text-emerald-700 ml-1">
                              (Đáp án đúng)
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                      <strong className="text-slate-800">💡 Giải thích:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
          >
            Đóng xem lại
          </button>
        </div>
      </div>
    </div>
  );
};
