import React, { useState, useMemo } from 'react';
import { ExamData, UnitQuestion } from '../../types/curriculum';
import { examsData } from '../../data/exams';
import { unitsData } from '../../data/units';
import { useStudy } from '../../context/StudyContext';
import { useMistakes } from '../../context/MistakeContext';
import { generateSmartAdaptiveQuiz } from '../../services/adaptiveService';
import { GraduationCap, Clock, Sparkles, Zap, Flame, Award, BookOpen, Layers } from 'lucide-react';

interface ExamListProps {
  onStartExam: (exam: ExamData) => void;
}

type ExamFilterType = 'all' | 'entrance10' | 'sem1' | 'sem2' | '15m' | 'midterm_final';

export const ExamList: React.FC<ExamListProps> = ({ onStartExam }) => {
  const { examHistory } = useStudy();
  const { mistakes } = useMistakes();
  const [activeFilter, setActiveFilter] = useState<ExamFilterType>('all');

  const filteredExams = useMemo(() => {
    switch (activeFilter) {
      case 'entrance10':
        return examsData.filter(e => e.type === 'entrance10' || e.category === 'entrance10' || (e.badge && e.badge.includes('Tuyển Sinh')));
      case 'sem1':
        return examsData.filter(e => e.semester === 1 && e.type !== 'entrance10');
      case 'sem2':
        return examsData.filter(e => e.semester === 2 && e.type !== 'entrance10');
      case '15m':
        return examsData.filter(e => e.type === '15m');
      case 'midterm_final':
        return examsData.filter(e => e.type === 'midterm' || e.type === 'final');
      case 'all':
      default:
        return examsData;
    }
  }, [activeFilter]);

  const entrance10Count = useMemo(() => {
    return examsData.filter(e => e.type === 'entrance10' || (e.badge && e.badge.includes('Tuyển Sinh'))).length;
  }, []);

  const handleStartSmartAdaptive = () => {
    // Collect bank questions from all units and exams
    const allBankQuestions: UnitQuestion[] = [];
    unitsData.forEach(u => allBankQuestions.push(...(u.quiz || [])));
    examsData.forEach(e => allBankQuestions.push(...(e.questions || [])));

    const adaptiveQuestions = generateSmartAdaptiveQuiz(mistakes, allBankQuestions, 20);

    const smartExam: ExamData = {
      id: `smart_adaptive_${Date.now()}`,
      title: '⚡ Đề Thi Thông Minh Đảo Đáp Án (Cá nhân hóa)',
      durationMinutes: 20,
      grade: 8,
      semester: 1,
      type: '15m',
      questions: adaptiveQuestions
    };

    onStartExam(smartExam);
  };

  return (
    <div className="exam-list-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Smart Adaptive Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-800/50 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-800/80 text-amber-300 text-xs font-bold border border-indigo-700/50">
            <Zap className="w-3.5 h-3.5 fill-amber-300" />
            <span>Thuật toán Adaptive EdTech</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Đề Thi Thông Minh Đảo Đáp Án
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
            Hệ thống tự động phân tích các câu em từng làm sai (chiếm 70% đề) kết hợp câu hỏi ngẫu nhiên từ ngân hàng đề, đồng thời đảo thứ tự phương án A/B/C/D để rèn luyện trí nhớ bản chất.
          </p>
        </div>

        <button
          onClick={handleStartSmartAdaptive}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Bắt đầu Đề Thông Minh (20 câu)</span>
        </button>
      </div>

      {/* Filter Tabs Navigation */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
        <button
          onClick={() => setActiveFilter('all')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Tất cả ({examsData.length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('entrance10')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeFilter === 'entrance10'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/70'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
          <span>Luyện Thi Vào 10 ({entrance10Count})</span>
        </button>

        <button
          onClick={() => setActiveFilter('sem1')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'sem1'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Học kỳ 1 (Unit 1 - 6)</span>
        </button>

        <button
          onClick={() => setActiveFilter('sem2')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'sem2'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Học kỳ 2 (Unit 7 - 12)</span>
        </button>

        <button
          onClick={() => setActiveFilter('15m')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeFilter === '15m'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Đề 15 phút</span>
        </button>

        <button
          onClick={() => setActiveFilter('midterm_final')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'midterm_final'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Giữa kỳ & Cuối kỳ</span>
        </button>
      </div>

      {/* Standard Exams Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {activeFilter === 'entrance10' && <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />}
              <span>
                {activeFilter === 'entrance10'
                  ? 'Phân hệ Luyện Thi Tuyển Sinh Vào Lớp 10 (Chuẩn Đề Sở GD&ĐT)'
                  : activeFilter === 'sem2'
                  ? 'Ngân hàng Đề thi Học Kỳ 2 (Global Success)'
                  : activeFilter === 'sem1'
                  ? 'Ngân hàng Đề thi Học Kỳ 1 (Global Success)'
                  : 'Ngân hàng Đề thi Trực tuyến Chuẩn & Luyện thi Tuyển sinh 10'}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              {activeFilter === 'entrance10'
                ? 'Đề thi 60 phút - 50 câu chuẩn hóa cấu trúc đề thi chính thức, bao phủ 8 dạng bài có đáp án & lời giải chi tiết.'
                : 'Bao gồm Đề 15 phút, Đề Giữa kì và Đề Cuối kì có bấm giờ, tự động thu bài và soi chi tiết bài làm.'}
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
            {filteredExams.length} Đề thi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map(exam => {
            const isEntrance = exam.type === 'entrance10' || (exam.badge && exam.badge.includes('Tuyển Sinh'));

            // Find best score from history
            const attempts = examHistory.filter(a => a.examId === exam.id);
            const bestScore = attempts.length > 0
              ? Math.max(...attempts.map(a => a.score))
              : null;

            return (
              <div
                key={exam.id}
                className={`bg-white rounded-3xl transition-all p-6 flex flex-col justify-between ${
                  isEntrance
                    ? 'border-2 border-amber-300 shadow-md shadow-amber-500/10 hover:shadow-lg hover:border-amber-400'
                    : 'border border-slate-200/90 shadow-2xs hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg uppercase ${
                      isEntrance
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 font-black'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-100/60'
                    }`}>
                      {exam.badge || exam.type}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-mono text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.durationMinutes} phút</span>
                    </div>
                  </div>

                  <h4 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                    {exam.title}
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">
                    {exam.questions.length} câu trắc nghiệm • {exam.description || 'Phát âm, Ngữ pháp, Từ vựng, Đọc hiểu & Viết'}
                  </p>

                  {/* Entrance exam target indicator */}
                  {isEntrance && (
                    <div className="mb-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-[11px] font-bold">
                      <Sparkles className="w-3 h-3 text-orange-500" />
                      <span>Đề chuẩn Sở • 50 câu - 60 phút</span>
                    </div>
                  )}

                  {/* Past stats if attempted */}
                  {bestScore !== null && (
                    <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 mb-4 flex items-center justify-between text-xs">
                      <span className="text-emerald-800 font-medium">Kỷ lục của em:</span>
                      <strong className="text-emerald-700 font-black text-sm">
                        {bestScore}/10 ({attempts.length} lần thi)
                      </strong>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onStartExam(exam)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 ${
                    isEntrance
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black shadow-amber-500/20'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>{isEntrance ? 'Thử sức Tuyển Sinh 10' : 'Vào phòng thi (Bắt đầu)'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
