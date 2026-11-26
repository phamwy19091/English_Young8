import React, { useState, useEffect } from 'react';
import { mathChaptersData } from '../../data/math/mathChapters';
import { useStudy } from '../../context/StudyContext';
import { useMistakes } from '../../context/MistakeContext';
import { useToast } from '../common/Toast';
import { UnitQuestion } from '../../types/curriculum';
import {
  Calculator,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Send,
  RotateCcw,
  PenLine,
} from 'lucide-react';

interface MathPracticeProps {
  initialChapterId?: string;
}

type MathSubTab = 'formulas' | 'quiz' | 'short_answer';

function normalizeMathAnswer(raw: string): string {
  return (raw || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/,/g, '.');
}

export const MathPractice: React.FC<MathPracticeProps> = ({ initialChapterId }) => {
  const { subjectProgress, saveChapterScore } = useStudy();
  const { harvestMistakes } = useMistakes();
  const { showToast } = useToast();

  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    initialChapterId || mathChaptersData[0].id
  );
  const [activeTab, setActiveTab] = useState<MathSubTab>('formulas');

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Short-answer state
  const [shortInputs, setShortInputs] = useState<Record<string, string>>({});
  const [shortChecked, setShortChecked] = useState<Record<string, boolean>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialChapterId && mathChaptersData.some(c => c.id === initialChapterId)) {
      setSelectedChapterId(initialChapterId);
    }
  }, [initialChapterId]);

  const activeChapter =
    mathChaptersData.find(c => c.id === selectedChapterId) || mathChaptersData[0];

  const chapterScores = subjectProgress.math?.chapterScores || {};

  const handleSelectChapter = (id: string) => {
    setSelectedChapterId(id);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setShortInputs({});
    setShortChecked({});
    setRevealedHints({});
    window.location.hash = `#/math/${id}`;
  };

  const handleSubmitQuiz = () => {
    const questions = activeChapter.quiz;
    let correctCount = 0;
    const wrongList: Array<{ question: UnitQuestion; wrongAnswer: number }> = [];

    questions.forEach(q => {
      const chosen = selectedAnswers[q.id];
      if (chosen === q.answer) {
        correctCount += 1;
      } else {
        wrongList.push({ question: q, wrongAnswer: typeof chosen === 'number' ? chosen : -1 });
      }
    });

    const score10 = Number(((correctCount / Math.max(1, questions.length)) * 10).toFixed(1));
    saveChapterScore('math', activeChapter.id, score10);
    if (wrongList.length > 0) {
      harvestMistakes('unit', activeChapter.id, wrongList, 'math');
    }
    setQuizSubmitted(true);
    showToast(
      `Hoàn thành ${activeChapter.title}: ${correctCount}/${questions.length} câu (${score10}/10 điểm)!`,
      score10 >= 7 ? 'success' : 'info'
    );
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
  };

  const handleCheckShortAnswer = (saId: string) => {
    setShortChecked(prev => ({ ...prev, [saId]: true }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-blue-200/80 shadow-2xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Toán 8 • Kết nối tri thức với cuộc sống
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {activeChapter.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{activeChapter.summary}</p>
          </div>
        </div>

        <a
          href="#/exams"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shrink-0"
        >
          <span>Vào Phòng Thi Toán 8</span>
        </a>
      </div>

      {/* Chapter Selector Strip */}
      <div className="flex flex-wrap gap-2">
        {mathChaptersData.map(ch => {
          const isCurrent = ch.id === activeChapter.id;
          const best = chapterScores[ch.id];
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => handleSelectChapter(ch.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                isCurrent
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40'
              }`}
            >
              <span>Chương {ch.number}</span>
              {typeof best === 'number' && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                    isCurrent ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {best}đ
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tailored Math Sub-Tabs */}
      <div className="flex flex-wrap gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('formulas')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
            activeTab === 'formulas'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Công thức &amp; Dạng bài ({activeChapter.formulas.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
            activeTab === 'quiz'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Trắc nghiệm ({activeChapter.quiz.length} câu)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('short_answer')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
            activeTab === 'short_answer'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PenLine className="w-4 h-4" />
          <span>Điền đáp số ({activeChapter.shortAnswers.length} bài)</span>
        </button>
      </div>

      {/* TAB 1: FORMULAS & WORKED EXAMPLES */}
      {activeTab === 'formulas' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {activeChapter.formulas.map(f => (
            <div
              key={f.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-2xs"
            >
              <h3 className="text-base font-extrabold text-slate-900">{f.name}</h3>

              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 font-mono text-xs sm:text-sm font-bold text-blue-900 leading-relaxed">
                {f.expression}
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700">Ví dụ minh họa:</div>
                <p className="text-sm font-semibold text-slate-800">{f.example}</p>
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/70 space-y-1.5">
                  {f.solutionSteps.map((step, idx) => (
                    <p key={idx} className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {step}
                    </p>
                  ))}
                </div>
              </div>

              {f.commonTrap && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Lưu ý bẫy hay sai:</strong> {f.commonTrap}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: CHAPTER MULTIPLE CHOICE */}
      {activeTab === 'quiz' && (
        <div className="space-y-4 max-w-4xl">
          {activeChapter.quiz.map((q, idx) => {
            const chosen = selectedAnswers[q.id];
            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700">
                    Câu {idx + 1} • {q.section}
                  </span>
                  {quizSubmitted && (
                    <span
                      className={`text-xs font-bold flex items-center gap-1 ${
                        chosen === q.answer ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {chosen === q.answer ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Đúng
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" /> Chưa đúng
                        </>
                      )}
                    </span>
                  )}
                </div>

                <p className="text-sm sm:text-base font-bold text-slate-900">{q.question}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = chosen === optIdx;
                    const isCorrectOpt = q.answer === optIdx;

                    let btnClass =
                      'border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-300 text-slate-800';
                    if (quizSubmitted) {
                      if (isCorrectOpt) {
                        btnClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                      } else if (isSelected && !isCorrectOpt) {
                        btnClass = 'border-rose-400 bg-rose-50 text-rose-800';
                      }
                    } else if (isSelected) {
                      btnClass = 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-300';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        disabled={quizSubmitted}
                        onClick={() =>
                          setSelectedAnswers(prev => ({ ...prev, [q.id]: optIdx }))
                        }
                        className={`text-left px-4 py-2.5 rounded-xl border text-xs sm:text-sm transition-colors ${btnClass}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {quizSubmitted && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700">
                    <strong className="text-blue-700">Lời giải: </strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {!quizSubmitted ? (
              <button
                type="button"
                onClick={handleSubmitQuiz}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Chấm điểm bài tập chương</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResetQuiz}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Làm lại chương này</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SHORT-ANSWER CALCULATION */}
      {activeTab === 'short_answer' && (
        <div className="space-y-4 max-w-4xl">
          {activeChapter.shortAnswers.map((sa, idx) => {
            const val = shortInputs[sa.id] || '';
            const checked = Boolean(shortChecked[sa.id]);
            const isCorrect =
              checked &&
              sa.acceptedAnswers.some(
                ans => normalizeMathAnswer(ans) === normalizeMathAnswer(val)
              );

            return (
              <div
                key={sa.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-3 shadow-2xs"
              >
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700">
                  Bài tự luận ngắn {idx + 1}
                </span>
                <p className="text-sm sm:text-base font-bold text-slate-900">{sa.prompt}</p>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    value={val}
                    onChange={e => {
                      setShortInputs(prev => ({ ...prev, [sa.id]: e.target.value }));
                      if (checked) {
                        setShortChecked(prev => ({ ...prev, [sa.id]: false }));
                      }
                    }}
                    placeholder="Nhập đáp số (ví dụ: 10 hoặc 36)..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => handleCheckShortAnswer(sa.id)}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-colors"
                  >
                    Kiểm tra đáp số
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRevealedHints(prev => ({ ...prev, [sa.id]: !prev[sa.id] }))
                    }
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-4 h-4 text-amber-500" />
                    <span>Gợi ý</span>
                  </button>
                </div>

                {revealedHints[sa.id] && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                    <strong>Gợi ý:</strong> {sa.hint}
                  </div>
                )}

                {checked && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs sm:text-sm ${
                      isCorrect
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div className="font-bold mb-1">
                      {isCorrect
                        ? '✔ Chính xác!'
                        : `✘ Chưa đúng. Đáp số đúng là: ${sa.acceptedAnswers[0]}`}
                    </div>
                    <div>
                      <strong>Hướng dẫn giải:</strong> {sa.solution}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
