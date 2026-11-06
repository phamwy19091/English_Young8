import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import {
  getStudentSnapshot,
  getSystemConfig,
  saveSystemConfig,
  saveSupabaseConfig,
  getSupabaseConfig
} from '../../services/storageService';
import { StudentSnapshot, HomeworkAssignment, CustomQuestion } from '../../types/storage';
import { unitsData } from '../../data/units';
import { examsData } from '../../data/exams';
import {
  Users,
  Calendar,
  FileQuestion,
  Cloud,
  Eye,
  Trash2,
  RotateCw
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const { switchUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'monitor' | 'assignments' | 'qbank' | 'cloud'>('monitor');

  // Monitor State
  const [selectedStudent, setSelectedStudent] = useState<string>('em_lop8');
  const [studentSnapshot, setStudentSnapshot] = useState<StudentSnapshot | null>(null);

  // Homework Assignment State
  const [assignments, setAssignments] = useState<HomeworkAssignment[]>([]);
  const [newAsgTitle, setNewAsgTitle] = useState<string>('');
  const [newAsgType, setNewAsgType] = useState<'unit' | 'exam'>('unit');
  const [newAsgTarget, setNewAsgTarget] = useState<string>('1');
  const [newAsgScore, setNewAsgScore] = useState<number>(8.0);
  const [newAsgDue, setNewAsgDue] = useState<string>(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [newAsgTargetUser, setNewAsgTargetUser] = useState<string>('all');

  // Custom Question State
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [newQSection, setNewQSection] = useState<string>('Grammar');
  const [newQPrompt, setNewQPrompt] = useState<string>('');
  const [newQOpt0, setNewQOpt0] = useState<string>('');
  const [newQOpt1, setNewQOpt1] = useState<string>('');
  const [newQOpt2, setNewQOpt2] = useState<string>('');
  const [newQOpt3, setNewQOpt3] = useState<string>('');
  const [newQAnswer, setNewQAnswer] = useState<number>(0);
  const [newQExplanation, setNewQExplanation] = useState<string>('');

  // Cloud Config State
  const [supabaseUrl, setSupabaseUrl] = useState<string>('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState<string>('');

  // Load Initial Data
  useEffect(() => {
    // Load student snapshot
    const snap = getStudentSnapshot(selectedStudent);
    setStudentSnapshot(snap);

    // Load system config
    const cfg = getSystemConfig();
    setAssignments(cfg.assignments || []);
    setCustomQuestions(cfg.customQuestions || []);

    // Load cloud config
    const cloudCfg = getSupabaseConfig();
    setSupabaseUrl(cloudCfg.url || '');
    setSupabaseAnonKey(cloudCfg.anonKey || '');
  }, [selectedStudent]);

  // Handle Create Assignment
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsgTitle.trim()) {
      showToast('Vui lòng nhập tiêu đề bài tập!', 'warning');
      return;
    }

    const newAsg: HomeworkAssignment = {
      id: `asg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: newAsgTitle.trim(),
      type: newAsgType,
      targetId: newAsgType === 'unit' ? Number(newAsgTarget) : newAsgTarget,
      dueDate: newAsgDue,
      minScore: Number(newAsgScore),
      assignedTo: newAsgTargetUser === 'all' ? ['all'] : [newAsgTargetUser],
      createdAt: new Date().toISOString()
    };

    const updated = [newAsg, ...assignments];
    setAssignments(updated);

    const cfg = getSystemConfig();
    cfg.assignments = updated;
    saveSystemConfig(cfg);

    setNewAsgTitle('');
    showToast('Đã giao bài tập thành công!', 'success');
  };

  const handleDeleteAssignment = (id: string) => {
    const updated = assignments.filter(a => a.id !== id);
    setAssignments(updated);
    const cfg = getSystemConfig();
    cfg.assignments = updated;
    saveSystemConfig(cfg);
    showToast('Đã xóa bài tập.', 'info');
  };

  // Handle Create Custom Question
  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQPrompt.trim() || !newQOpt0.trim() || !newQOpt1.trim()) {
      showToast('Vui lòng nhập câu hỏi và ít nhất 2 phương án!', 'warning');
      return;
    }

    const newQ: CustomQuestion = {
      id: `custom_${Date.now()}`,
      section: newQSection,
      question: newQPrompt.trim(),
      options: [
        `A. ${newQOpt0.trim()}`,
        `B. ${newQOpt1.trim()}`,
        newQOpt2.trim() ? `C. ${newQOpt2.trim()}` : 'C. None',
        newQOpt3.trim() ? `D. ${newQOpt3.trim()}` : 'D. None'
      ],
      answer: newQAnswer,
      explanation: newQExplanation.trim() || 'Giải thích chuẩn theo ngữ pháp Global Success.',
      custom: true,
      createdAt: new Date().toISOString()
    };

    const updated = [newQ, ...customQuestions];
    setCustomQuestions(updated);

    const cfg = getSystemConfig();
    cfg.customQuestions = updated;
    saveSystemConfig(cfg);

    setNewQPrompt('');
    setNewQOpt0('');
    setNewQOpt1('');
    setNewQOpt2('');
    setNewQOpt3('');
    setNewQExplanation('');
    showToast('Đã lưu câu hỏi tùy chỉnh vào QBank!', 'success');
  };

  const handleDeleteQuestion = (id: string) => {
    const updated = customQuestions.filter(q => q.id !== id);
    setCustomQuestions(updated);
    const cfg = getSystemConfig();
    cfg.customQuestions = updated;
    saveSystemConfig(cfg);
    showToast('Đã xóa câu hỏi tùy chỉnh.', 'info');
  };

  // Handle Save Cloud Config
  const handleSaveCloud = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseUrl.trim(), supabaseAnonKey.trim());
    showToast('Đã lưu cấu hình kết nối Supabase Cloud thành công!', 'success');
  };

  // Handle Student View Preview
  const handlePreviewStudent = () => {
    switchUser(selectedStudent, 'student');
    window.location.hash = '#/dashboard';
    showToast(`Đã chuyển sang góc nhìn học sinh: ${selectedStudent}`, 'info');
  };

  // Compute student monitor stats
  const unitScoreValues = studentSnapshot ? Object.values(studentSnapshot.unitScores || {}) : [];
  const avgUnitScore = unitScoreValues.length > 0
    ? (unitScoreValues.reduce((a, b) => a + b, 0) / unitScoreValues.length).toFixed(1)
    : '--';

  const examAttempts = studentSnapshot?.examHistory || [];
  const avgExamScore = examAttempts.length > 0
    ? (examAttempts.reduce((a, b) => a + b.score, 0) / examAttempts.length).toFixed(1)
    : '--';

  return (
    <div className="admin-view max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Admin Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-400/30">
                Executive Admin Portal
              </span>
              <span className="text-xs text-slate-400">English Young 8 Modernized</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Cổng Quản Trị & Giám Sát Học Tập
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Giám sát tiến độ học sinh thời gian thực, phân hệ giao bài tập về nhà, ngân hàng câu hỏi tùy chỉnh QBank và cấu hình kết nối Supabase Cloud.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePreviewStudent}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-md hover:bg-slate-100 transition-colors"
            >
              <Eye className="w-4 h-4 text-indigo-600" />
              <span>Góc nhìn Học sinh</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex items-center gap-2 border-t border-slate-800 pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('monitor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'monitor'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Giám sát học sinh</span>
          </button>

          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'assignments'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Giao bài tập ({assignments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('qbank')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'qbank'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileQuestion className="w-4 h-4" />
            <span>Ngân hàng câu hỏi QBank ({customQuestions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cloud')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'cloud'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Cấu hình Cloud & Backup</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Student Monitor */}
      {activeTab === 'monitor' && (
        <div className="space-y-6">
          {/* Student Selector Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Chọn học sinh theo dõi:
              </span>
              <select
                value={selectedStudent}
                onChange={e => setSelectedStudent(e.target.value)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 text-xs font-bold outline-none focus:border-indigo-500"
              >
                <option value="em_lop8">Em Lớp 8 (em_lop8)</option>
                <option value="em_nam">Em Nam (em_nam)</option>
                <option value="em_lan">Em Lan (em_lan)</option>
              </select>
            </div>

            <button
              onClick={() => {
                const snap = getStudentSnapshot(selectedStudent);
                setStudentSnapshot(snap);
                showToast(`Đã làm mới dữ liệu của ${selectedStudent}`, 'info');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Làm mới dữ liệu</span>
            </button>
          </div>

          {/* Student Stats Summary */}
          {studentSnapshot && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
                <span className="text-xs text-slate-400 font-medium block mb-1">
                  Từ vựng đã thuộc
                </span>
                <div className="text-2xl font-black text-slate-900">
                  {(studentSnapshot.learnedVocab || []).length}/86
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
                <span className="text-xs text-slate-400 font-medium block mb-1">
                  Điểm trung bình Unit
                </span>
                <div className="text-2xl font-black text-indigo-600">{avgUnitScore}/10</div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
                <span className="text-xs text-slate-400 font-medium block mb-1">
                  Điểm trung bình Đề thi
                </span>
                <div className="text-2xl font-black text-purple-600">{avgExamScore}/10</div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
                <span className="text-xs text-slate-400 font-medium block mb-1">
                  Số câu sai đang lưu
                </span>
                <div className="text-2xl font-black text-rose-600">
                  {(studentSnapshot.mistakes || []).filter(m => !m.resolved).length}
                </div>
              </div>
            </div>
          )}

          {/* Detailed Unit Scores Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6">
            <h4 className="text-base font-bold text-slate-900 mb-4">
              Điểm số các bài kiểm tra Unit (Thang điểm 10)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {unitsData.map(u => {
                const score = studentSnapshot?.unitScores?.[Number(u.id)];
                return (
                  <div
                    key={u.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center"
                  >
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                      Unit {u.id}
                    </span>
                    <div className="text-xl font-black text-slate-900">
                      {score !== undefined ? `${score}` : '--'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Exam History Log */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6">
            <h4 className="text-base font-bold text-slate-900 mb-4">
              Lịch sử nộp bài thi của học sinh
            </h4>
            {examAttempts.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Chưa có bài kiểm tra nào được nộp.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                      <th className="pb-3 pl-2">Đề thi</th>
                      <th className="pb-3 text-center">Điểm số</th>
                      <th className="pb-3 text-center">Thời gian làm</th>
                      <th className="pb-3 text-right pr-2">Ngày nộp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {examAttempts.map((att, i) => (
                      <tr key={att.id || i}>
                        <td className="py-3 pl-2 font-bold text-slate-900">{att.examTitle}</td>
                        <td className="py-3 text-center font-black text-indigo-600">
                          {att.score}/10
                        </td>
                        <td className="py-3 text-center text-slate-500 font-mono">
                          {Math.floor(att.timeSpentSeconds / 60)}p {att.timeSpentSeconds % 60}s
                        </td>
                        <td className="py-3 text-right pr-2 text-slate-400">
                          {att.submittedAt?.split('T')[0]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Homework Assignments */}
      {activeTab === 'assignments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Assignment Form */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 lg:col-span-1">
            <h4 className="text-base font-bold text-slate-900 mb-4">Giao nhiệm vụ mới</h4>
            <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên nhiệm vụ:</label>
                <input
                  type="text"
                  value={newAsgTitle}
                  onChange={e => setNewAsgTitle(e.target.value)}
                  placeholder="VD: Ôn tập trắc nghiệm Unit 1 đạt 8.0đ"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Loại bài tập:</label>
                <select
                  value={newAsgType}
                  onChange={e => setNewAsgType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="unit">Trắc nghiệm Unit (Units 1 - 6)</option>
                  <option value="exam">Đề kiểm tra chuẩn (Exams 1 - 6)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mục tiêu (Unit hoặc Đề thi):</label>
                {newAsgType === 'unit' ? (
                  <select
                    value={newAsgTarget}
                    onChange={e => setNewAsgTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-medium"
                  >
                    {unitsData.map(u => (
                      <option key={u.id} value={u.id}>Unit {u.id}: {u.title}</option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={newAsgTarget}
                    onChange={e => setNewAsgTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-medium"
                  >
                    {examsData.map(e => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Điểm tối thiểu:</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="10"
                    value={newAsgScore}
                    onChange={e => setNewAsgScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hạn nộp:</label>
                  <input
                    type="date"
                    value={newAsgDue}
                    onChange={e => setNewAsgDue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Giao cho:</label>
                <select
                  value={newAsgTargetUser}
                  onChange={e => setNewAsgTargetUser(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="all">Tất cả học sinh (all)</option>
                  <option value="em_lop8">Học sinh em_lop8</option>
                  <option value="em_nam">Học sinh em_nam</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-200 transition-colors"
              >
                Tạo bài tập
              </button>
            </form>
          </div>

          {/* Assignments List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 lg:col-span-2">
            <h4 className="text-base font-bold text-slate-900 mb-4">
              Danh sách bài tập đang giao ({assignments.length})
            </h4>

            {assignments.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Chưa có nhiệm vụ bài tập nào được giao.
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map(asg => (
                  <div
                    key={asg.id}
                    className="p-4 rounded-2xl border border-slate-200/90 hover:border-slate-300 transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-50 text-purple-700">
                          {asg.type}
                        </span>
                        <span className="text-xs text-slate-400">Hạn: {asg.dueDate}</span>
                      </div>
                      <h5 className="text-sm font-bold text-slate-900">{asg.title}</h5>
                      <span className="text-xs text-slate-500">
                        Yêu cầu đạt: <strong>{asg.minScore} điểm</strong> • Giao cho: {asg.assignedTo.join(', ')}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteAssignment(asg.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: QBank Manager */}
      {activeTab === 'qbank' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Question Form */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 lg:col-span-1">
            <h4 className="text-base font-bold text-slate-900 mb-4">Thêm câu hỏi mới vào QBank</h4>
            <form onSubmit={handleCreateQuestion} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Chuyên đề:</label>
                <select
                  value={newQSection}
                  onChange={e => setNewQSection(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="Grammar">Grammar (Ngữ pháp)</option>
                  <option value="Vocabulary">Vocabulary (Từ vựng)</option>
                  <option value="Pronunciation">Pronunciation (Ngữ âm)</option>
                  <option value="Reading">Reading (Đọc hiểu)</option>
                  <option value="Writing">Writing (Viết câu)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nội dung câu hỏi:</label>
                <textarea
                  rows={2}
                  value={newQPrompt}
                  onChange={e => setNewQPrompt(e.target.value)}
                  placeholder="VD: She enjoys ______ origami in her free time."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">4 Phương án trả lời:</label>
                <input
                  type="text"
                  placeholder="Phương án A"
                  value={newQOpt0}
                  onChange={e => setNewQOpt0(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
                <input
                  type="text"
                  placeholder="Phương án B"
                  value={newQOpt1}
                  onChange={e => setNewQOpt1(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
                <input
                  type="text"
                  placeholder="Phương án C"
                  value={newQOpt2}
                  onChange={e => setNewQOpt2(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
                <input
                  type="text"
                  placeholder="Phương án D"
                  value={newQOpt3}
                  onChange={e => setNewQOpt3(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Đáp án đúng:</label>
                <select
                  value={newQAnswer}
                  onChange={e => setNewQAnswer(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-medium"
                >
                  <option value={0}>Phương án A</option>
                  <option value={1}>Phương án B</option>
                  <option value={2}>Phương án C</option>
                  <option value={3}>Phương án D</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Giải thích:</label>
                <textarea
                  rows={2}
                  value={newQExplanation}
                  onChange={e => setNewQExplanation(e.target.value)}
                  placeholder="Giải thích cấu trúc ngữ pháp..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-200 transition-colors"
              >
                Lưu câu hỏi tùy chỉnh
              </button>
            </form>
          </div>

          {/* QBank List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 lg:col-span-2">
            <h4 className="text-base font-bold text-slate-900 mb-4">
              Danh sách câu hỏi tùy chỉnh ({customQuestions.length})
            </h4>

            {customQuestions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Chưa có câu hỏi tùy chỉnh nào. Các câu hỏi tạo ở đây sẽ được ưu tiên đưa vào các Đề thi thông minh.
              </div>
            ) : (
              <div className="space-y-4">
                {customQuestions.map(q => (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                        {q.section}
                      </span>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-sm font-bold text-slate-900">{q.question}</div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                      {q.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-lg ${
                            idx === q.answer
                              ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                              : 'bg-slate-50'
                          }`}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <div className="text-xs text-slate-500 pt-1">
                        <strong>Giải thích:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Cloud Settings */}
      {activeTab === 'cloud' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-2xs p-8 space-y-6">
          <div>
            <h4 className="text-lg font-bold text-slate-900">Cấu hình kết nối Supabase Cloud</h4>
            <p className="text-xs text-slate-500 mt-1">
              Hệ thống hoạt động theo mô hình <strong>Offline-First</strong>: mọi dữ liệu luôn được lưu vào LocalStorage và tự động đồng bộ lên Supabase Cloud khi có kết nối Internet.
            </p>
          </div>

          <form onSubmit={handleSaveCloud} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Supabase Project URL:</label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={e => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-mono text-xs outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Supabase Anon Key:</label>
              <textarea
                rows={3}
                value={supabaseAnonKey}
                onChange={e => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-mono text-xs outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-200 transition-colors"
              >
                Lưu cấu hình Cloud
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
