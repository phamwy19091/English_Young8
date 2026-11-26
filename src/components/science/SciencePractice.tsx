import React, { useState, useEffect } from 'react';
import {
  scienceTopicsData,
  SCIENCE_ELEMENTS_REF,
  SCIENCE_PHYSICS_FORMULAS_REF,
} from '../../data/science/scienceTopics';
import { ScienceBranch } from '../../types/subject';
import { useStudy } from '../../context/StudyContext';
import { useMistakes } from '../../context/MistakeContext';
import { useToast } from '../common/Toast';
import { UnitQuestion } from '../../types/curriculum';
import {
  FlaskConical,
  Atom,
  Dna,
  BookOpen,
  CheckCircle2,
  XCircle,
  Send,
  RotateCcw,
  Table2,
  Beaker,
} from 'lucide-react';

interface SciencePracticeProps {
  initialTopicId?: string;
}

type ScienceSubTab = 'concepts' | 'quiz' | 'reference';

const BRANCH_META: Record<
  ScienceBranch,
  { label: string; badgeClass: string; icon: React.ReactNode }
> = {
  chemistry: {
    label: 'Hóa học',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: <FlaskConical className="w-4 h-4" />,
  },
  physics: {
    label: 'Vật lí',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: <Atom className="w-4 h-4" />,
  },
  biology: {
    label: 'Sinh học',
    badgeClass: 'bg-lime-50 text-lime-700 border-lime-200',
    icon: <Dna className="w-4 h-4" />,
  },
};

export const SciencePractice: React.FC<SciencePracticeProps> = ({ initialTopicId }) => {
  const { subjectProgress, saveChapterScore } = useStudy();
  const { harvestMistakes } = useMistakes();
  const { showToast } = useToast();

  const [branchFilter, setBranchFilter] = useState<'all' | ScienceBranch>('all');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    initialTopicId || scienceTopicsData[0].id
  );
  const [activeTab, setActiveTab] = useState<ScienceSubTab>('concepts');

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (initialTopicId && scienceTopicsData.some(t => t.id === initialTopicId)) {
      setSelectedTopicId(initialTopicId);
    }
  }, [initialTopicId]);

  const visibleTopics =
    branchFilter === 'all'
      ? scienceTopicsData
      : scienceTopicsData.filter(t => t.branch === branchFilter);

  const activeTopic =
    scienceTopicsData.find(t => t.id === selectedTopicId) ||
    visibleTopics[0] ||
    scienceTopicsData[0];

  const topicScores = subjectProgress.science?.chapterScores || {};

  const handleSelectTopic = (id: string) => {
    setSelectedTopicId(id);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    window.location.hash = `#/science/${id}`;
  };

  const handleBranchChange = (branch: 'all' | ScienceBranch) => {
    setBranchFilter(branch);
    if (branch !== 'all') {
      const firstInBranch = scienceTopicsData.find(t => t.branch === branch);
      if (firstInBranch) {
        setSelectedTopicId(firstInBranch.id);
        setSelectedAnswers({});
        setQuizSubmitted(false);
      }
    }
  };

  const handleSubmitQuiz = () => {
    const questions = activeTopic.quiz;
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
    saveChapterScore('science', activeTopic.id, score10);
    if (wrongList.length > 0) {
      harvestMistakes('unit', activeTopic.id, wrongList, 'science');
    }
    setQuizSubmitted(true);
    showToast(
      `Hoàn thành ${activeTopic.title}: ${correctCount}/${questions.length} câu (${score10}/10 điểm)!`,
      score10 >= 7 ? 'success' : 'info'
    );
  };

  const branchInfo = BRANCH_META[activeTopic.branch];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-emerald-200/80 shadow-2xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                KHTN 8 • Kết nối tri thức
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${branchInfo.badgeClass}`}
              >
                {branchInfo.icon}
                {branchInfo.label}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {activeTopic.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{activeTopic.summary}</p>
          </div>
        </div>

        <a
          href="#/exams"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shrink-0"
        >
          <span>Vào Phòng Thi KHTN 8</span>
        </a>
      </div>

      {/* Branch Filter + Topic Selector */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleBranchChange('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              branchFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Tất cả phân môn (6 chủ đề)
          </button>
          <button
            type="button"
            onClick={() => handleBranchChange('chemistry')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              branchFilter === 'chemistry'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Hóa học</span>
          </button>
          <button
            type="button"
            onClick={() => handleBranchChange('physics')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              branchFilter === 'physics'
                ? 'bg-sky-600 text-white'
                : 'bg-sky-50 hover:bg-sky-100 text-sky-700'
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            <span>Vật lí</span>
          </button>
          <button
            type="button"
            onClick={() => handleBranchChange('biology')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              branchFilter === 'biology'
                ? 'bg-lime-600 text-white'
                : 'bg-lime-50 hover:bg-lime-100 text-lime-800'
            }`}
          >
            <Dna className="w-3.5 h-3.5" />
            <span>Sinh học</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {visibleTopics.map(t => {
            const isCurrent = t.id === activeTopic.id;
            const best = topicScores[t.id];
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectTopic(t.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                  isCurrent
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                }`}
              >
                <span>{t.title.split(':')[0]}</span>
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
      </div>

      {/* Tailored Science Sub-Tabs */}
      <div className="flex flex-wrap gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('concepts')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
            activeTab === 'concepts'
              ? 'bg-white text-emerald-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Kiến thức &amp; Thí nghiệm</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
            activeTab === 'quiz'
              ? 'bg-white text-emerald-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Luyện tập chủ đề ({activeTopic.quiz.length} câu)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reference')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
            activeTab === 'reference'
              ? 'bg-white text-emerald-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Table2 className="w-4 h-4" />
          <span>Bảng tra cứu nhanh</span>
        </button>
      </div>

      {/* TAB 1: CONCEPTS & EXPERIMENTS */}
      {activeTab === 'concepts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {activeTopic.concepts.map(c => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-2xs"
            >
              <h3 className="text-base font-extrabold text-slate-900">{c.title}</h3>
              <p className="text-sm text-slate-700 leading-relaxed">{c.summary}</p>

              {c.formulaOrEquation && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 font-mono text-xs sm:text-sm font-bold text-emerald-900">
                  {c.formulaOrEquation}
                </div>
              )}

              {c.experimentNote && (
                <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs sm:text-sm text-sky-900 flex items-start gap-2">
                  <Beaker className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>{c.experimentNote}</span>
                </div>
              )}

              <ul className="space-y-1.5 list-disc pl-5 text-xs sm:text-sm text-slate-700">
                {c.keyPoints.map((kp, i) => (
                  <li key={i}>{kp}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: TOPIC QUIZ */}
      {activeTab === 'quiz' && (
        <div className="space-y-4 max-w-4xl">
          {activeTopic.quiz.map((q, idx) => {
            const chosen = selectedAnswers[q.id];
            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">
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
                      'border-slate-200 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-300 text-slate-800';
                    if (quizSubmitted) {
                      if (isCorrectOpt) {
                        btnClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                      } else if (isSelected && !isCorrectOpt) {
                        btnClass = 'border-rose-400 bg-rose-50 text-rose-800';
                      }
                    } else if (isSelected) {
                      btnClass =
                        'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-300';
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
                    <strong className="text-emerald-700">Giải thích: </strong>
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
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Chấm điểm chủ đề</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSelectedAnswers({});
                  setQuizSubmitted(false);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Làm lại chủ đề này</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: QUICK REFERENCE TABLES */}
      {activeTab === 'reference' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Nguyên tố Hóa học thường gặp (Lớp 8)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-emerald-50 text-emerald-900 border-b border-emerald-200">
                    <th className="py-2 px-3 font-bold">Kí hiệu</th>
                    <th className="py-2 px-3 font-bold">Tên nguyên tố</th>
                    <th className="py-2 px-3 font-bold">NTK (amu)</th>
                    <th className="py-2 px-3 font-bold">Hóa trị</th>
                  </tr>
                </thead>
                <tbody>
                  {SCIENCE_ELEMENTS_REF.map(el => (
                    <tr key={el.symbol} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold text-emerald-700">
                        {el.symbol}
                      </td>
                      <td className="py-2 px-3 text-slate-800">{el.name}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{el.atomicMass}</td>
                      <td className="py-2 px-3 text-slate-600">{el.valence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Công thức Vật lí trọng tâm (KHTN 8)
            </h3>
            <div className="space-y-3">
              {SCIENCE_PHYSICS_FORMULAS_REF.map(item => (
                <div
                  key={item.name}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900">{item.name}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                      {item.unit}
                    </span>
                  </div>
                  <div className="font-mono text-sm font-bold text-sky-700">{item.formula}</div>
                  <p className="text-xs text-slate-500">{item.variables}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
