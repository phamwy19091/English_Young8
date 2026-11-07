import React from 'react';
import { unitsData } from '../../data/units';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';
import { useMistakes } from '../../context/MistakeContext';
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
  Calendar
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { streakDays, totalLearnedVocabCount, unitScores, examHistory } = useStudy();
  const { unresolvedCount } = useMistakes();

  const totalVocab = unitsData.reduce((acc, u) => acc + u.vocab.length, 0);

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
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-indigo-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-800/80 text-indigo-200 text-xs font-semibold border border-indigo-700/60">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Tiếng Anh 8 Global Success • Học kì 1</span>
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
              {Object.keys(unitScores).length}/6
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

      {/* 6 Units Hub */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Chương trình học tập 6 Unit (Semester 1)
            </h3>
            <p className="text-xs text-slate-500">
              Toàn bộ từ vựng, ngữ âm, ngữ pháp, bài tập trắc nghiệm và tự luận.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">
            Unit 1 – Unit 6
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unitsData.map(unit => {
            const unitNum = unit.number || Number(String(unit.id).replace(/^unit-?/i, ''));
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
    </div>
  );
};
