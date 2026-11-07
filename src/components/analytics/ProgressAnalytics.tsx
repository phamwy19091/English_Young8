import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { useAuth } from '../../context/AuthContext';
import { ExamResultModal } from '../exam/ExamResultModal';
import { Award, Flame, CheckCircle2, TrendingUp, BarChart3, ChevronRight } from 'lucide-react';

export const ProgressAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { streakDays, radarSkills, examHistory, totalLearnedVocabCount } = useStudy();
  const [selectedAttempt, setSelectedAttempt] = useState<any>(null);

  const skillsConfig = [
    { key: 'pronunciation', label: 'Ngữ âm & Trọng âm', color: 'bg-indigo-500', icon: '🗣️' },
    { key: 'vocabulary', label: 'Từ vựng cốt lõi', color: 'bg-emerald-500', icon: '📚' },
    { key: 'grammar', label: 'Ngữ pháp & Cấu trúc', color: 'bg-amber-500', icon: '📖' },
    { key: 'reading', label: 'Đọc hiểu văn bản', color: 'bg-cyan-500', icon: '📑' },
    { key: 'writing', label: 'Viết lại câu & Word-form', color: 'bg-rose-500', icon: '✍️' }
  ] as const;

  // Average exam score
  const totalScores = examHistory.reduce((acc, a) => acc + (a.score || 0), 0);
  const avgScore = examHistory.length > 0 ? (totalScores / examHistory.length).toFixed(1) : '--';

  return (
    <div className="progress-view max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Title */}
      <div className="mb-8">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
          Hồ sơ năng lực học sinh
        </span>
        <h2 className="text-2xl font-black text-slate-900 mt-1">
          Bảng Theo Dõi Thành Tích & Năng Lực 5 Kỹ Năng
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Đo lường tiến độ học tập liên tục của tài khoản: <strong>{user?.username || 'em_lop8'}</strong>
        </p>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Streak */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600">
            <Flame className="w-7 h-7 fill-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{streakDays} ngày</div>
            <div className="text-xs text-slate-400 font-medium">Chuỗi ngày học chăm chỉ</div>
          </div>
        </div>

        {/* Mastered Vocab */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalLearnedVocabCount}/86</div>
            <div className="text-xs text-slate-400 font-medium">Từ vựng đã thuộc</div>
          </div>
        </div>

        {/* Exams count */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{examHistory.length}</div>
            <div className="text-xs text-slate-400 font-medium">Lượt nộp bài thi</div>
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-purple-50 text-purple-600">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{avgScore}</div>
            <div className="text-xs text-slate-400 font-medium">Điểm trung bình đề thi</div>
          </div>
        </div>
      </div>

      {/* 5-Skill Competency Radar Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Đánh giá Độ thuần thục 5 Chuyên đề Cốt lõi
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Tự động cập nhật sau mỗi đề thi
          </span>
        </div>

        <div className="space-y-5">
          {skillsConfig.map(s => {
            const data = radarSkills[s.key] || { total: 0, correct: 0, percentage: 0 };
            return (
              <div key={s.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <span className="text-base">{s.icon}</span>
                    <span>{s.label}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400">
                      ({data.correct}/{data.total} câu đúng)
                    </span>
                    <strong className="text-slate-900 text-sm font-black">
                      {data.percentage}%
                    </strong>
                  </div>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${s.color}`}
                    style={{ width: `${Math.max(5, data.percentage)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Exam Attempt History */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">
            Nhật ký các lần thi thử (Exam Attempt History)
          </h3>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
            {examHistory.length} Lượt nộp
          </span>
        </div>

        {examHistory.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Chưa có bài kiểm tra nào được nộp. Em hãy vào mục <strong>Luyện Đề</strong> để thử sức nhé!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3 pl-2">Tên đề thi</th>
                  <th className="pb-3 text-center">Điểm số</th>
                  <th className="pb-3 text-center">Thời gian làm</th>
                  <th className="pb-3 text-center">Ngày nộp</th>
                  <th className="pb-3 text-right pr-2">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {examHistory.map((att, idx) => {
                  const minutes = Math.floor((att.timeSpentSeconds || 0) / 60);
                  const seconds = (att.timeSpentSeconds || 0) % 60;
                  const timeStr = `${minutes}p ${seconds}s`;

                  return (
                    <tr key={att.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 pl-2 font-bold text-slate-900">
                        {att.examTitle}
                      </td>
                      <td className="py-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md font-black text-xs ${
                            att.score >= 8.0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : att.score >= 5.0
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {att.score}/10
                        </span>
                      </td>
                      <td className="py-3.5 text-center text-slate-600 font-mono">
                        {timeStr}
                      </td>
                      <td className="py-3.5 text-center text-slate-500">
                        {att.submittedAt?.split('T')[0] || '--'}
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <button
                          onClick={() => setSelectedAttempt(att)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold transition-colors"
                        >
                          <span>Soi bài làm</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Attempt Review Modal */}
      <ExamResultModal
        isOpen={Boolean(selectedAttempt)}
        attempt={selectedAttempt}
        onClose={() => setSelectedAttempt(null)}
      />
    </div>
  );
};
