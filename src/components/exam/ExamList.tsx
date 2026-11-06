import React from 'react';
import { ExamData, UnitQuestion } from '../../types/curriculum';
import { examsData } from '../../data/exams';
import { unitsData } from '../../data/units';
import { useStudy } from '../../context/StudyContext';
import { useMistakes } from '../../context/MistakeContext';
import { generateSmartAdaptiveQuiz } from '../../services/adaptiveService';
import { GraduationCap, Clock, Sparkles, Zap } from 'lucide-react';

interface ExamListProps {
  onStartExam: (exam: ExamData) => void;
}

export const ExamList: React.FC<ExamListProps> = ({ onStartExam }) => {
  const { examHistory } = useStudy();
  const { mistakes } = useMistakes();

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
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-800/50 mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
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

      {/* Standard Exams Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Ngân hàng 6 Đề thi Chuẩn Global Success
            </h3>
            <p className="text-xs text-slate-500">
              Bao gồm Đề 15 phút, Đề Giữa kì 1 và Đề Cuối kì 1 có bấm giờ và tự động thu bài.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
            6 Đề thi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examsData.map(exam => {
            // Find best score from history
            const attempts = examHistory.filter(a => a.examId === exam.id);
            const bestScore = attempts.length > 0
              ? Math.max(...attempts.map(a => a.score))
              : null;

            return (
              <div
                key={exam.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100/60 uppercase">
                      {exam.type}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-mono text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.durationMinutes} phút</span>
                    </div>
                  </div>

                  <h4 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                    {exam.title}
                  </h4>
                  <p className="text-xs text-slate-500 mb-6">
                    {exam.questions.length} câu trắc nghiệm • Phát âm, Ngữ pháp, Từ vựng, Đọc hiểu & Viết
                  </p>

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
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 transition-all active:scale-95"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Vào phòng thi (Bắt đầu)</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
