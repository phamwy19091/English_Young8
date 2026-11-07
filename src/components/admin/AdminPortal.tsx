import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import {
  getStudentSnapshot,
  getSystemConfig,
  saveSystemConfig,
  saveSupabaseConfig,
  getSupabaseConfig,
  getLocalUsers
} from '../../services/storageService';
import { supabaseService } from '../../services/supabaseService';
import { StudentSnapshot, HomeworkAssignment, CustomQuestion } from '../../types/storage';
import { UserSession } from '../../types/user';
import { unitsData } from '../../data/units';
import { examsData } from '../../data/exams';
import {
  Users,
  Calendar,
  FileQuestion,
  Cloud,
  Eye,
  Trash2,
  RotateCw,
  UserPlus,
  KeyRound,
  ShieldCheck,
  Download,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const { switchUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'users' | 'monitor' | 'assignments' | 'qbank' | 'cloud'>('users');

  // Users Management State
  const [allUsers, setAllUsers] = useState<UserSession[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [newStuFullName, setNewStuFullName] = useState<string>('');
  const [newStuUsername, setNewStuUsername] = useState<string>('');
  const [newStuPassword, setNewStuPassword] = useState<string>('');

  // Password change modal/inline
  const [changingPasswordUser, setChangingPasswordUser] = useState<string | null>(null);
  const [updatedPasswordValue, setUpdatedPasswordValue] = useState<string>('');

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
  const [cloudTestResult, setCloudTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [testingCloud, setTestingCloud] = useState<boolean>(false);

  // Fetch all users on mount
  const refreshUsersList = async () => {
    setLoadingUsers(true);
    try {
      const users = await supabaseService.getAllUsers();
      setAllUsers(users);
      if (users.length > 0 && !users.some(u => u.username === selectedStudent)) {
        const firstStudent = users.find(u => u.role === 'student') || users[0];
        setSelectedStudent(firstStudent.username);
      }
    } catch (err) {
      console.warn('Failed to load users:', err);
      setAllUsers(getLocalUsers());
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    refreshUsersList();

    // Load initial system config
    const cfg = getSystemConfig();
    setAssignments(cfg.assignments || []);
    setCustomQuestions(cfg.customQuestions || []);

    // Load cloud config
    const cloudCfg = getSupabaseConfig();
    setSupabaseUrl(cloudCfg.url || '');
    setSupabaseAnonKey(cloudCfg.anonKey || '');
  }, []);

  // Reload snapshot when selectedStudent changes
  useEffect(() => {
    if (selectedStudent) {
      const snap = getStudentSnapshot(selectedStudent);
      setStudentSnapshot(snap);
    }
  }, [selectedStudent]);

  // Handle Add New Student
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStuFullName.trim() || !newStuUsername.trim() || !newStuPassword.trim()) {
      showToast('Vui lòng điền đầy đủ Họ tên, Username và Mật khẩu!', 'warning');
      return;
    }

    const res = await supabaseService.register({
      fullName: newStuFullName.trim(),
      username: newStuUsername.trim(),
      password: newStuPassword.trim(),
      role: 'student',
      createdByAdmin: true,
    });

    if (res.success) {
      showToast(`Đã tạo thành công tài khoản học sinh: ${newStuUsername}`, 'success');
      setNewStuFullName('');
      setNewStuUsername('');
      setNewStuPassword('');
      await refreshUsersList();
    } else {
      showToast(res.message || 'Lỗi khi tạo tài khoản!', 'error');
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (username: string) => {
    if (username === 'admin' || username === 'em_lop8') {
      showToast('Không thể xóa 2 tài khoản mặc định của hệ thống!', 'warning');
      return;
    }
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản "${username}" không? Toàn bộ dữ liệu của học sinh này sẽ bị xóa.`)) {
      const res = await supabaseService.deleteUserAccount(username);
      if (res.success) {
        showToast(`Đã xóa tài khoản "${username}".`, 'info');
        await refreshUsersList();
      } else {
        showToast(res.message || 'Không thể xóa tài khoản này!', 'error');
      }
    }
  };

  // Handle Change User Password
  const handleSaveUserPassword = async (username: string) => {
    if (!updatedPasswordValue.trim()) {
      showToast('Vui lòng nhập mật khẩu mới!', 'warning');
      return;
    }
    const res = await supabaseService.updateUserPasswordOrInfo(username, {
      pinCode: updatedPasswordValue.trim()
    });
    if (res.success) {
      showToast(`Đã đổi mật khẩu cho "${username}" thành công!`, 'success');
      setChangingPasswordUser(null);
      setUpdatedPasswordValue('');
      await refreshUsersList();
    }
  };

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
      explanation: newQExplanation.trim() || 'Giải thích theo ngữ pháp Global Success.',
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
    supabaseService.updateCredentials(supabaseUrl.trim(), supabaseAnonKey.trim());
    showToast('Đã lưu cấu hình kết nối Supabase Cloud thành công!', 'success');
  };

  const handleTestCloudConnection = async () => {
    setTestingCloud(true);
    setCloudTestResult(null);
    try {
      const res = await supabaseService.testConnection();
      setCloudTestResult(res);
      if (res.success) {
        showToast('Kết nối Supabase Cloud thành công!', 'success');
      } else {
        showToast(res.message || 'Kết nối thất bại!', 'error');
      }
    } finally {
      setTestingCloud(false);
    }
  };

  // Handle Export Backup JSON
  const handleExportBackup = () => {
    const backupData = {
      users: getLocalUsers(),
      systemConfig: getSystemConfig(),
      exportDate: new Date().toISOString(),
      platform: 'English Young 8 Modernized'
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EnglishYoung8_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã xuất file sao lưu thành công!', 'success');
  };

  // Handle Student View Preview
  const handlePreviewStudent = () => {
    switchUser(selectedStudent, 'student');
    window.location.hash = '#/dashboard';
    showToast(`Đang xem ở góc nhìn học sinh: ${selectedStudent}`, 'info');
  };

  // Computed student monitor stats
  const unitScoreValues = studentSnapshot ? Object.values(studentSnapshot.unitScores || {}) : [];
  const avgUnitScore = unitScoreValues.length > 0
    ? (unitScoreValues.reduce((a, b) => a + b, 0) / unitScoreValues.length).toFixed(1)
    : '--';

  const examAttempts = studentSnapshot?.examHistory || [];
  const avgExamScore = examAttempts.length > 0
    ? (examAttempts.reduce((a, b) => a + b.score, 0) / examAttempts.length).toFixed(1)
    : '--';

  const studentsList = allUsers.filter(u => u.role !== 'admin');

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
              <span className="text-xs text-slate-400">English Young 8 • Toàn Quyền Quản Trị</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Trung Tâm Quản Lý & Giám Sát Học Tập
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Quản lý tài khoản học sinh, theo dõi kết quả làm bài trực tuyến, phân hệ giao bài tập về nhà và cấu hình cơ sở dữ liệu Supabase.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePreviewStudent}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-md hover:bg-slate-100 transition-colors"
            >
              <Eye className="w-4 h-4 text-indigo-600" />
              <span>Góc nhìn Học sinh ({selectedStudent})</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex items-center gap-2 border-t border-slate-800 pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Quản lý Tài Khoản ({allUsers.length})</span>
          </button>

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
            <span>Cấu hình Cloud & Sao Lưu</span>
          </button>
        </div>
      </div>

      {/* TAB 1: USER ACCOUNTS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Add New Student Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Thêm Tài Khoản Học Sinh Mới</h3>
                  <p className="text-xs text-slate-500">Tạo tài khoản học tập cho học sinh, lưu trực tiếp vào CSDL Supabase.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={refreshUsersList}
                disabled={loadingUsers}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
                <span>Làm mới danh sách</span>
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Họ và tên học sinh</label>
                <input
                  type="text"
                  value={newStuFullName}
                  onChange={e => setNewStuFullName(e.target.value)}
                  placeholder="Ví dụ: Lê Hải Nam"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:border-purple-600"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Tên đăng nhập (Username)</label>
                <input
                  type="text"
                  value={newStuUsername}
                  onChange={e => setNewStuUsername(e.target.value.toLowerCase())}
                  placeholder="Ví dụ: hainam8"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:border-purple-600"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Mật khẩu / Mã PIN</label>
                <input
                  type="text"
                  value={newStuPassword}
                  onChange={e => setNewStuPassword(e.target.value)}
                  placeholder="Nhập mật khẩu/PIN khởi tạo..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:border-purple-600"
                  required
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-100 transition-colors flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Tạo Tài Khoản Ngay</span>
                </button>
              </div>
            </form>
          </div>

          {/* Accounts Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">
                Danh Sách Tài Khoản Trong Hệ Thống ({allUsers.length})
              </h3>
              <span className="text-xs text-slate-400">Được đồng bộ giữa Local Storage & Supabase</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">Học sinh / Người dùng</th>
                    <th className="py-3 px-5">Tên đăng nhập</th>
                    <th className="py-3 px-5">Vai trò</th>
                    <th className="py-3 px-5">Mã PIN / Mật khẩu</th>
                    <th className="py-3 px-5">Chuỗi học</th>
                    <th className="py-3 px-5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {allUsers.map(u => {
                    const isSystemAcc = u.username === 'admin' || u.username === 'em_lop8';
                    const isEditingThis = changingPasswordUser === u.username;

                    return (
                      <tr key={u.id || u.username} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5 font-bold text-slate-900 flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {u.role === 'admin' ? 'A' : 'S'}
                          </div>
                          <div>
                            <div>{u.fullName || u.username}</div>
                            {isSystemAcc && (
                              <span className="text-[10px] text-amber-600 font-bold">Mặc định hệ thống</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-5 font-mono text-slate-700 font-semibold">
                          {u.username}
                        </td>

                        <td className="py-3.5 px-5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'admin'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}>
                            {u.role === 'admin' ? 'Quản Trị' : 'Học Sinh'}
                          </span>
                        </td>

                        <td className="py-3.5 px-5 font-mono">
                          {isEditingThis ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={updatedPasswordValue}
                                onChange={e => setUpdatedPasswordValue(e.target.value)}
                                placeholder="PIN mới"
                                className="w-24 px-2 py-1 text-xs border border-purple-400 rounded-lg outline-none"
                              />
                              <button
                                onClick={() => handleSaveUserPassword(u.username)}
                                className="px-2 py-1 rounded-lg bg-purple-600 text-white font-bold text-[10px]"
                              >
                                Lưu
                              </button>
                              <button
                                onClick={() => setChangingPasswordUser(null)}
                                className="px-2 py-1 rounded-lg bg-slate-200 text-slate-600 font-bold text-[10px]"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-slate-700">
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-bold">
                                {u.pinCode || '****'}
                              </span>
                              <button
                                onClick={() => {
                                  setChangingPasswordUser(u.username);
                                  setUpdatedPasswordValue(u.pinCode || '');
                                }}
                                title="Đổi mật khẩu"
                                className="p-1 text-slate-400 hover:text-purple-600"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-5 font-bold text-amber-600">
                          {u.streakDays || 1} ngày
                        </td>

                        <td className="py-3.5 px-5 text-right space-x-1.5">
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => {
                                setSelectedStudent(u.username);
                                setActiveTab('monitor');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors"
                            >
                              Soi Chi Tiết
                            </button>
                          )}

                          {!isSystemAcc && (
                            <button
                              onClick={() => handleDeleteUser(u.username)}
                              title="Xóa tài khoản này"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT MONITOR */}
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
                className="px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 text-xs font-bold outline-none focus:border-indigo-500"
              >
                {studentsList.map(s => (
                  <option key={s.username} value={s.username}>
                    {s.fullName || s.username} ({s.username})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const snap = getStudentSnapshot(selectedStudent);
                  setStudentSnapshot(snap);
                  showToast(`Đã làm mới dữ liệu của ${selectedStudent}`, 'info');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Làm mới snapshot</span>
              </button>

              <button
                onClick={handlePreviewStudent}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Đóng vai học sinh này</span>
              </button>
            </div>
          </div>

          {/* Student Metrics 4 Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
              <div className="text-2xl font-black text-slate-900">{avgUnitScore}/10</div>
              <div className="text-xs text-slate-500 font-medium">Điểm TB các Unit</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
              <div className="text-2xl font-black text-slate-900">{avgExamScore}/10</div>
              <div className="text-xs text-slate-500 font-medium">Điểm TB Đề Kiểm Tra</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
              <div className="text-2xl font-black text-slate-900">
                {studentSnapshot?.learnedVocab?.length || 0}/86
              </div>
              <div className="text-xs text-slate-500 font-medium">Từ vựng đã thuộc</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
              <div className="text-2xl font-black text-rose-600">
                {studentSnapshot?.mistakes?.filter(m => !m.resolved)?.length || 0}
              </div>
              <div className="text-xs text-slate-500 font-medium">Câu sai chưa sửa</div>
            </div>
          </div>

          {/* Detailed Unit Scores Grid */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              Điểm số các Unit của {selectedStudent}:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {unitsData.map(u => {
                const sc = studentSnapshot?.unitScores?.[Number(u.id)] ?? null;
                return (
                  <div key={u.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Unit {u.id}</span>
                    <span className="text-base font-black text-slate-800">
                      {sc !== null ? `${sc}đ` : 'Chưa làm'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Exam History Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Lịch sử làm bài thi thử:</h3>
            {examAttempts.length === 0 ? (
              <p className="text-xs text-slate-400">Học sinh chưa làm đề kiểm tra nào.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                      <th className="py-2.5">Đề kiểm tra</th>
                      <th className="py-2.5">Điểm số</th>
                      <th className="py-2.5">Thời gian</th>
                      <th className="py-2.5">Ngày nộp bài</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {examAttempts.map(att => (
                      <tr key={att.id}>
                        <td className="py-2.5 font-bold text-slate-800">{att.examTitle}</td>
                        <td className="py-2.5 font-black text-indigo-600">{att.score}/10</td>
                        <td className="py-2.5 text-slate-500">{Math.floor(att.timeSpentSeconds / 60)}p {att.timeSpentSeconds % 60}s</td>
                        <td className="py-2.5 text-slate-400">{att.submittedAt?.split('T')[0]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          {/* Create Assignment Form */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-black text-slate-900">Giao Nhiệm Vụ Bài Tập Về Nhà</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tiêu đề nhiệm vụ</label>
                  <input
                    type="text"
                    value={newAsgTitle}
                    onChange={e => setNewAsgTitle(e.target.value)}
                    placeholder="Ví dụ: Ôn tập Unit 1 chuẩn bị kiểm tra 15 phút"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:border-indigo-600"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Học sinh được giao</label>
                  <select
                    value={newAsgTargetUser}
                    onChange={e => setNewAsgTargetUser(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:border-indigo-600"
                  >
                    <option value="all">Tất cả học sinh ('all')</option>
                    {studentsList.map(s => (
                      <option key={s.username} value={s.username}>
                        {s.fullName || s.username} ({s.username})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Loại mục tiêu</label>
                  <select
                    value={newAsgType}
                    onChange={e => setNewAsgType(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none"
                  >
                    <option value="unit">Bài tập Unit</option>
                    <option value="exam">Đề kiểm tra thi thử</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Mục tiêu cụ thể</label>
                  {newAsgType === 'unit' ? (
                    <select
                      value={newAsgTarget}
                      onChange={e => setNewAsgTarget(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none"
                    >
                      {unitsData.map(u => (
                        <option key={u.id} value={u.id}>Unit {u.id}: {u.title}</option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={newAsgTarget}
                      onChange={e => setNewAsgTarget(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none"
                    >
                      {examsData.map(ex => (
                        <option key={ex.id} value={ex.id}>{ex.title}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Mục tiêu điểm số (≥)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="10"
                    value={newAsgScore}
                    onChange={e => setNewAsgScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Hạn nộp</label>
                  <input
                    type="date"
                    value={newAsgDue}
                    onChange={e => setNewAsgDue(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-100 transition-colors"
              >
                Giao Bài Tập Này
              </button>
            </form>
          </div>

          {/* Assignments List */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-black text-slate-900">Danh Sách Bài Tập Đang Giao ({assignments.length})</h3>
            {assignments.length === 0 ? (
              <p className="text-xs text-slate-400">Chưa có bài tập nào được giao.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {assignments.map(asg => (
                  <div key={asg.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span>Hạn nộp: {asg.dueDate}</span>
                        <span className="font-bold text-purple-600">≥ {asg.minScore}đ</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{asg.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Giao cho: <strong>{asg.assignedTo?.join(', ') || 'all'}</strong>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 mt-3 flex justify-end">
                      <button
                        onClick={() => handleDeleteAssignment(asg.id)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa bài này</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: QBANK */}
      {activeTab === 'qbank' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-black text-slate-900">Thêm Câu Hỏi Trắc Nghiệm Tùy Chỉnh (QBank)</h3>
            <form onSubmit={handleCreateQuestion} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Chuyên đề câu hỏi</label>
                  <select
                    value={newQSection}
                    onChange={e => setNewQSection(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none"
                  >
                    <option value="Grammar">Ngữ Pháp (Grammar)</option>
                    <option value="Vocabulary">Từ Vựng (Vocabulary)</option>
                    <option value="Pronunciation">Phát Âm (Pronunciation)</option>
                    <option value="Reading">Đọc Hiểu (Reading)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Đáp án đúng</label>
                  <select
                    value={newQAnswer}
                    onChange={e => setNewQAnswer(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none"
                  >
                    <option value={0}>Phương án A</option>
                    <option value={1}>Phương án B</option>
                    <option value={2}>Phương án C</option>
                    <option value={3}>Phương án D</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nội dung câu hỏi</label>
                <textarea
                  value={newQPrompt}
                  onChange={e => setNewQPrompt(e.target.value)}
                  placeholder="Nhập nội dung câu hỏi trắc nghiệm..."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newQOpt0}
                  onChange={e => setNewQOpt0(e.target.value)}
                  placeholder="Phương án A"
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none"
                  required
                />
                <input
                  type="text"
                  value={newQOpt1}
                  onChange={e => setNewQOpt1(e.target.value)}
                  placeholder="Phương án B"
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none"
                  required
                />
                <input
                  type="text"
                  value={newQOpt2}
                  onChange={e => setNewQOpt2(e.target.value)}
                  placeholder="Phương án C (Tùy chọn)"
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none"
                />
                <input
                  type="text"
                  value={newQOpt3}
                  onChange={e => setNewQOpt3(e.target.value)}
                  placeholder="Phương án D (Tùy chọn)"
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Giải thích đáp án</label>
                <input
                  type="text"
                  value={newQExplanation}
                  onChange={e => setNewQExplanation(e.target.value)}
                  placeholder="Giải thích ngữ pháp hoặc từ vựng tương ứng..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-100 transition-colors"
              >
                Lưu Câu Hỏi Vào QBank
              </button>
            </form>
          </div>

          {/* QBank Questions List */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-black text-slate-900">Danh Sách Câu Hỏi QBank ({customQuestions.length})</h3>
            {customQuestions.length === 0 ? (
              <p className="text-xs text-slate-400">Chưa có câu hỏi tùy chỉnh nào.</p>
            ) : (
              <div className="space-y-3">
                {customQuestions.map(q => (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">
                        {q.section}
                      </span>
                      <p className="text-sm font-bold text-slate-800 mt-1">{q.question}</p>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-slate-600">
                        {q.options.map((opt, i) => (
                          <span key={i} className={i === q.answer ? 'font-bold text-emerald-600' : ''}>
                            {opt} {i === q.answer && '✓'}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600"
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

      {/* TAB 5: CLOUD & BACKUP */}
      {activeTab === 'cloud' && (
        <div className="space-y-6">
          {/* Cloud Config */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Cấu Hình Kết Nối Supabase Cloud</h3>
                <p className="text-xs text-slate-500">Kết nối trực tiếp tới cơ sở dữ liệu Supabase để đồng bộ học sinh và tiến độ.</p>
              </div>

              <button
                type="button"
                onClick={handleTestCloudConnection}
                disabled={testingCloud}
                className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Cloud className="w-4 h-4" />
                <span>{testingCloud ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}</span>
              </button>
            </div>

            {cloudTestResult && (
              <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                cloudTestResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                {cloudTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                <span>{cloudTestResult.message}</span>
              </div>
            )}

            <form onSubmit={handleSaveCloud} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Supabase Project URL</label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={e => setSupabaseUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono outline-none focus:border-indigo-600"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Supabase Anon Key</label>
                <textarea
                  value={supabaseAnonKey}
                  onChange={e => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono outline-none focus:border-indigo-600"
                  required
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-100 transition-colors"
              >
                Lưu Cấu Hình Cloud
              </button>
            </form>
          </div>

          {/* Backup & Export */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-black text-slate-900">Sao Lưu & Phục Hồi Dữ Liệu Cục Bộ</h3>
            <p className="text-xs text-slate-500">
              Xuất toàn bộ danh sách tài khoản học sinh, bài tập đã giao và câu hỏi QBank ra tập tin JSON an toàn.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleExportBackup}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Xuất file Sao Lưu (.json)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
