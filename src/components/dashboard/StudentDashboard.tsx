import React, { useState } from 'react';
import { unitsData } from '../../data/units';
import { mathChaptersData } from '../../data/math/mathChapters';
import { scienceTopicsData } from '../../data/science/scienceTopics';
import { SUBJECTS_REGISTRY } from '../../data/subjects';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';
import { useMistakes } from '../../context/MistakeContext';
import { useSubject } from '../../context/SubjectContext';
import { getSystemConfig } from '../../services/storageService';
import {
  BookOpen,
  GraduationCap,
  Flame,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Calendar,
  Calculator,
  FlaskConical,
  Atom,
  Dna,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { streakDays, totalLearnedVocabCount, unitScores, subjectProgress, examHistory } = useStudy();
  const { mistakes, unresolvedCount } = useMistakes();
  const { activeSubjectId, setActiveSubject } = useSubject();
  const [semesterFilter, setSemesterFilter] = useState<'all' | 1 | 2>('all');

  const mathChapterScores = subjectProgress.math?.chapterScores || {};
  const scienceTopicScores = subjectProgress.science?.chapterScores || {};
  const mathExamsCount = examHistory.filter(e => e.subjectId === 'math').length;
  const scienceExamsCount = examHistory.filter(e => e.subjectId === 'science').length;
  const mathMistakesCount = mistakes.filter(m => !m.resolved && m.subjectId === 'math').length;
  const scienceMistakesCount = mistakes.filter(m => !m.resolved && m.subjectId === 'science').length;

  const totalVocab = unitsData.reduce((acc, u) => acc + u.vocab.length, 0);

  const getUnitNumber = (u: any): number => {
    if (typeof u.number === 'number') return u.number;
    const match = String(u.id).match(/\d+/);
    return match ? parseInt(match[0], 10) : 1;
  };

  const displayedUnits = semesterFilter === 'all'
    ? unitsData
    : unitsData.filter(u => (u.semester || (getUnitNumber(u) <= 6 ? 1 : 2)) === semesterFilter);

  // Load assignments for this student
  const sysConfig = getSystemConfig();
  const currentUsername = user?.username || 'em_lop8';
  const studentAssignments = (sysConfig?.assignments || []).filter(asg => {
    if (!asg) return false;
    const targets = Array.isArray(asg.assignedTo)
      ? asg.assignedTo
      : (asg as any).studentUsername
      ? [(asg as any).studentUsername]
      : ['all'];
    return targets.includes('all') || targets.includes(currentUsername);
  });

  return (
    <div className="dashboard-view max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Multi-Subject Selector Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SUBJECTS_REGISTRY.map(sub => {
          const isSelected = activeSubjectId === sub.id;
          const activeStyles =
            sub.id === 'math'
              ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-200'
              : sub.id === 'science'
              ? 'border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-200'
              : 'border-indigo-500 bg-indigo-50/70 ring-1 ring-indigo-200';

          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => setActiveSubject(sub.id)}
              className={`text-left p-4 rounded-2xl border transition-all flex items-center gap-3.5 ${
                isSelected
                  ? `${activeStyles} shadow-xs`
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  sub.id === 'math'
                    ? 'bg-blue-100 text-blue-700'
                    : sub.id === 'science'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {sub.id === 'math' ? (
                  <Calculator className="w-5 h-5" />
                ) : sub.id === 'science' ? (
                  <FlaskConical className="w-5 h-5" />
                ) : (
                  <BookOpen className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900">{sub.name}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-600">
                    {sub.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">{sub.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* MATH 8 DEDICATED DASHBOARD */}
      {activeSubjectId === 'math' && (
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-blue-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-blue-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/80 text-blue-100 text-xs font-semibold border border-blue-700/60">
                <Calculator className="w-3.5 h-3.5 text-amber-300" />
                <span>Toán 8 • Kết nối tri thức với cuộc sống</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Chào {user?.fullName || user?.username || 'Học sinh'}, cùng chinh phục Toán 8! 📐
              </h2>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                Ôn chắc Sổ tay Công thức &amp; Định lý, giải bài trắc nghiệm từng bước, tự luận điền đáp số ngắn và thi thử bấm giờ theo đúng cấu trúc Toán 8.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
                <Flame className="w-7 h-7 fill-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-black text-amber-300">{streakDays} Ngày</div>
                <div className="text-xs text-blue-200 font-medium">Chuỗi học tập</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">
                  {Object.keys(mathChapterScores).length}/{mathChaptersData.length}
                </div>
                <div className="text-xs text-slate-500 font-medium">Chương đã luyện tập</div>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-sky-50 text-sky-600">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{mathExamsCount}</div>
                <div className="text-xs text-slate-500 font-medium">Lượt thi Toán 8</div>
              </div>
            </div>
            <a
              href="#/mistakes"
              className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-center gap-4 hover:border-rose-200 transition-colors"
            >
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-rose-600">{mathMistakesCount}</div>
                <div className="text-xs text-slate-500 font-medium">Câu Toán sai cần gỡ</div>
              </div>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {mathChaptersData.map(ch => {
              const best = mathChapterScores[ch.id];
              return (
                <div
                  key={ch.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700">
                        Chương {ch.number} • HK{ch.semester}
                      </span>
                      {typeof best === 'number' && (
                        <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {best}/10
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mb-1.5">{ch.title}</h4>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">{ch.summary}</p>
                    <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 mb-4 border border-slate-100">
                      <div className="flex justify-between text-slate-600">
                        <span>Công thức &amp; Định lý:</span>
                        <strong className="text-slate-900">{ch.formulas.length} mục</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Trắc nghiệm + Điền đáp số:</span>
                        <strong className="text-slate-900">
                          {ch.quiz.length + ch.shortAnswers.length} bài
                        </strong>
                      </div>
                    </div>
                  </div>
                  <a
                    href={`#/math/${ch.id}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold text-center transition-colors"
                  >
                    Học &amp; Luyện Chương {ch.number}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SCIENCE 8 DEDICATED DASHBOARD */}
      {activeSubjectId === 'science' && (
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-100 text-xs font-semibold border border-emerald-700/60">
                <FlaskConical className="w-3.5 h-3.5 text-amber-300" />
                <span>Khoa học tự nhiên 8 • Kết nối tri thức</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Khám phá Hóa học, Vật lí &amp; Sinh học cùng {user?.fullName || user?.username || 'em'}! 🔬
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                Hệ thống kiến thức theo từng phân môn Hóa – Lí – Sinh, kèm bảng tra cứu nguyên tố/công thức nhanh, trắc nghiệm thí nghiệm và đề thi tích hợp.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
                <Flame className="w-7 h-7 fill-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-black text-amber-300">{streakDays} Ngày</div>
                <div className="text-xs text-emerald-200 font-medium">Chuỗi học tập</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">
                  {Object.keys(scienceTopicScores).length}/{scienceTopicsData.length}
                </div>
                <div className="text-xs text-slate-500 font-medium">Chủ đề đã luyện tập</div>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-teal-50 text-teal-600">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{scienceExamsCount}</div>
                <div className="text-xs text-slate-500 font-medium">Lượt thi KHTN 8</div>
              </div>
            </div>
            <a
              href="#/mistakes"
              className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-center gap-4 hover:border-rose-200 transition-colors"
            >
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-rose-600">{scienceMistakesCount}</div>
                <div className="text-xs text-slate-500 font-medium">Câu KHTN sai cần gỡ</div>
              </div>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {scienceTopicsData.map(topic => {
              const best = scienceTopicScores[topic.id];
              const isChem = topic.branch === 'chemistry';
              const isPhys = topic.branch === 'physics';
              return (
                <div
                  key={topic.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${
                          isChem
                            ? 'bg-emerald-50 text-emerald-700'
                            : isPhys
                            ? 'bg-sky-50 text-sky-700'
                            : 'bg-lime-50 text-lime-800'
                        }`}
                      >
                        {isChem ? (
                          <FlaskConical className="w-3.5 h-3.5" />
                        ) : isPhys ? (
                          <Atom className="w-3.5 h-3.5" />
                        ) : (
                          <Dna className="w-3.5 h-3.5" />
                        )}
                        {isChem ? 'Hóa học' : isPhys ? 'Vật lí' : 'Sinh học'}
                      </span>
                      {typeof best === 'number' && (
                        <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {best}/10
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mb-1.5">{topic.title}</h4>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">{topic.summary}</p>
                    <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 mb-4 border border-slate-100">
                      <div className="flex justify-between text-slate-600">
                        <span>Trọng tâm &amp; Thí nghiệm:</span>
                        <strong className="text-slate-900">{topic.concepts.length} phần</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Câu hỏi luyện tập:</span>
                        <strong className="text-slate-900">{topic.quiz.length} câu</strong>
                      </div>
                    </div>
                  </div>
                  <a
                    href={`#/science/${topic.id}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold text-center transition-colors"
                  >
                    Học chủ đề này
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ENGLISH 8 DASHBOARD (Preserved Intact) */}
      {activeSubjectId === 'english' && (
        <>
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-indigo-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-800/80 text-indigo-200 text-xs font-semibold border border-indigo-700/60">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Tiếng Anh 8 Global Success • Học kì 1 & Học kì 2</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Chào mừng trở lại, <span className="text-amber-400">{user?.fullName || user?.username || 'Học sinh'}</span>! 👋
          </h2>

          <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
            Hôm nay em hãy tiếp tục duy trì thói quen học tập: lướt qua thẻ từ vựng Flashcard 3D, thử thách Active Recall Spelling và làm đề kiểm tra có bấm giờ nhé.
          </p>
        </div>

        {/* Quick Streak Widget */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex items-center gap-4 shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
            <Flame className="w-8 h-8 fill-amber-400" />
          </div>
          <div>
            <div className="text-3xl font-black text-amber-300">{streakDays} Ngày</div>
            <div className="text-xs text-indigo-200 font-medium">Chuỗi ngày học chăm chỉ</div>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalLearnedVocabCount}/{totalVocab}</div>
            <div className="text-xs text-slate-400 font-medium">Từ vựng đã thuộc</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {Object.keys(unitScores).length}/{unitsData.length}
            </div>
            <div className="text-xs text-slate-400 font-medium">Unit đã kiểm tra</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-purple-50 text-purple-600">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{examHistory.length}</div>
            <div className="text-xs text-slate-400 font-medium">Lượt thi thử</div>
          </div>
        </div>

        <a
          href="#/mistakes"
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center gap-4 hover:border-rose-200 transition-colors group"
        >
          <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-600 group-hover:scale-105 transition-transform">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-rose-600">{unresolvedCount}</div>
            <div className="text-xs text-slate-400 font-medium">Câu sai cần gỡ</div>
          </div>
        </a>
      </div>

      {/* Homework Assignments if any */}
      {studentAssignments.length > 0 && (
        <div className="bg-amber-50/60 rounded-3xl border border-amber-200/80 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-black text-amber-950">
              Nhiệm vụ bài tập được giao ({studentAssignments.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {studentAssignments.map(asg => (
              <div
                key={asg.id}
                className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Hạn nộp: {asg.dueDate}</span>
                    <span className="font-bold text-amber-600">Mục tiêu: {asg.minScore}đ</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2">{asg.title}</h4>
                </div>

                <a
                  href={asg.type === 'unit' ? `#/unit/unit-${asg.targetId}/quiz` : `#/exams`}
                  className="mt-3 flex items-center justify-between text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  <span>Làm nhiệm vụ này</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Game Arcade Quick Launch Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 rounded-3xl border-2 border-amber-300/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-black">
            <span>🎮 MỚI: EDUTAINMENT ARCADE</span>
          </div>
          <h3 className="text-lg font-black text-slate-900">
            Trung Tâm Trò Chơi Học Tập – Tích Lũy XP & Săn Huy Hiệu!
          </h3>
          <p className="text-xs text-slate-600">
            5 Mini-Games: Ghép Cặp Siêu Tốc, Mưa Sao Băng Từ Vựng, Bậc Thầy Sắp Xếp Câu, Đấu Trường Tri Thức & Phân Loại Ngữ Âm.
          </p>
        </div>

        <a
          href="#/games"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 shrink-0 transition-all"
        >
          <span>Khám phá 5 Trò Chơi</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {/* Curriculum Units Hub */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Chương trình học tập 12 Unit (Global Success)
            </h3>
            <p className="text-xs text-slate-500">
              Toàn bộ từ vựng, ngữ âm, ngữ pháp, bài tập trắc nghiệm và tự luận viết câu cả năm học.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSemesterFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                semesterFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Tất cả (12 Units)
            </button>
            <button
              onClick={() => setSemesterFilter(1)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                semesterFilter === 1
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
              }`}
            >
              Học kỳ 1
            </button>
            <button
              onClick={() => setSemesterFilter(2)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                semesterFilter === 2
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
              }`}
            >
              Học kỳ 2
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedUnits.map(unit => {
            const unitNum = getUnitNumber(unit);
            const best = unitScores[unitNum] ?? null;

            return (
              <div
                key={unit.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-6 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl p-2.5 rounded-2xl bg-indigo-50 border border-indigo-100/50 group-hover:scale-105 transition-transform">
                        {unit.icon || '📘'}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
                          Unit {unitNum}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 leading-snug">
                          {unit.title}
                        </h4>
                      </div>
                    </div>

                    {best !== null && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200">
                        {best}/10
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mb-5 line-clamp-2 leading-relaxed">
                    {unit.summary || unit.topic}
                  </p>

                  <div className="bg-slate-50 rounded-2xl p-3.5 text-xs space-y-2 mb-5 border border-slate-100">
                    <div className="flex justify-between text-slate-600">
                      <span>Từ vựng:</span>
                      <strong className="text-slate-800">{unit.vocab.length} từ</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Trắc nghiệm:</span>
                      <strong className="text-slate-800">{unit.quiz.length} câu</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Tự luận viết câu:</span>
                      <strong className="text-slate-800">{unit.writtenExercises.length} câu</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={`#/unit/unit-${unit.id}/vocab`}
                    className="flex-1 text-center py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
                  >
                    Flashcards
                  </a>
                  <a
                    href={`#/unit/unit-${unit.id}/quiz`}
                    className="flex-1 text-center py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    Trắc nghiệm
                  </a>
                  <a
                    href={`#/unit/unit-${unit.id}/written`}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Bài tập tự luận"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
        </>
      )}
    </div>
  );
};
