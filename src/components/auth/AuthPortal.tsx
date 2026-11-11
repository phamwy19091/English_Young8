import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import {
  GraduationCap,
  ShieldCheck,
  Cloud,
  Eye,
  EyeOff,
  User,
  KeyRound,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  LogIn,
  UserPlus,
  HelpCircle,
  Zap,
  BookOpen,
  Check,
  Lock,
  Info
} from 'lucide-react';

interface AuthPortalProps {
  initialMode?: 'login' | 'register';
}

interface Persona {
  id: string;
  emoji: string;
  name: string;
  tagline: string;
}

const STUDENT_PERSONAS: Persona[] = [
  { id: 'astronaut', emoji: '🚀', name: 'Phi hành gia', tagline: 'Khám phá vũ trụ từ vựng' },
  { id: 'owl', emoji: '🦉', name: 'Cú thông thái', tagline: 'Siêu trí tuệ ngữ pháp' },
  { id: 'speedster', emoji: '⚡', name: 'Siêu tốc độ', tagline: 'Phản xạ thi thử đỉnh cao' },
  { id: 'lion', emoji: '🦁', name: 'Sư tử dũng cảm', tagline: 'Chinh phục mọi đề khó' },
  { id: 'artist', emoji: '🎨', name: 'Nghệ sĩ trẻ', tagline: 'Sáng tạo câu chuyện Anh ngữ' },
  { id: 'dolphin', emoji: '🐬', name: 'Cá heo tinh anh', tagline: 'Nhạy bén kỹ năng nghe nói' },
];

const STORAGE_REMEMBER_KEY = 'ey8_remember_login_v1';

export const AuthPortal: React.FC<AuthPortalProps> = ({ initialMode = 'login' }) => {
  const { login, register } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);
  const [showRegConfirmPass, setShowRegConfirmPass] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [quickFillNotice, setQuickFillNotice] = useState<string>('');

  // Login form state
  const [loginUser, setLoginUser] = useState<string>('');
  const [loginPass, setLoginPass] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Register form state
  const [regFullName, setRegFullName] = useState<string>('');
  const [regUsername, setRegUsername] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPass, setRegConfirmPass] = useState<string>('');
  const [selectedPersona, setSelectedPersona] = useState<Persona>(STUDENT_PERSONAS[0]);

  // Sync state if initialMode prop changes externally (e.g. browser back/forward or hash change)
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Load remembered credentials if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_REMEMBER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.username) {
          setLoginUser(parsed.username);
          setRememberMe(true);
        }
      }
    } catch {
      // Ignore storage errors safely
    }
  }, []);

  // Update URL hash when switching modes for clean deep-linking
  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrorMsg('');
    setQuickFillNotice('');
    if (typeof window !== 'undefined') {
      window.location.hash = newMode === 'register' ? '#/register' : '#/login';
    }
  };

  // Quick fill demo accounts
  const handleQuickFill = (role: 'student' | 'admin') => {
    if (role === 'student') {
      setLoginUser('em_lop8');
      setLoginPass('1234');
      setQuickFillNotice('✨ Đã điền tài khoản Học sinh mẫu (em_lop8)');
    } else {
      setLoginUser('admin');
      setLoginPass('admin123');
      setQuickFillNotice('🛡️ Đã điền tài khoản Quản trị viên (admin)');
    }
    setErrorMsg('');
    if (mode !== 'login') {
      setMode('login');
    }
  };

  // Real-time password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) {
      return {
        score: 0,
        label: 'Chưa nhập',
        colorClass: 'bg-slate-200 text-slate-400',
        barClass: 'bg-slate-200 w-0',
        checks: {
          min4: false,
          min6: false,
          hasLetter: false,
          hasNumber: false,
          hasSpecialOrUpper: false,
        },
      };
    }

    const checks = {
      min4: pass.length >= 4,
      min6: pass.length >= 6,
      hasLetter: /[a-zA-Z]/.test(pass),
      hasNumber: /[0-9]/.test(pass),
      hasSpecialOrUpper: /[^a-zA-Z0-9]/.test(pass) || /[A-Z]/.test(pass),
    };

    let score = 0;
    if (checks.min4) score += 1;
    if (checks.min6) score += 1;
    if (checks.hasLetter && checks.hasNumber) score += 1;
    if (checks.hasSpecialOrUpper) score += 1;

    if (score <= 1) {
      return {
        score,
        label: 'Yếu',
        colorClass: 'text-rose-600',
        barClass: 'bg-rose-500 w-1/4',
        checks,
      };
    }
    if (score <= 3) {
      return {
        score,
        label: 'Trung bình',
        colorClass: 'text-amber-600',
        barClass: 'bg-amber-500 w-3/4',
        checks,
      };
    }
    return {
      score,
      label: 'Rất mạnh',
      colorClass: 'text-emerald-600',
      barClass: 'bg-emerald-500 w-full',
      checks,
    };
  };

  const passwordStrength = getPasswordStrength(regPassword);
  const passwordsMatch = regConfirmPass.length > 0 && regPassword === regConfirmPass;
  const passwordsMismatch = regConfirmPass.length > 0 && regPassword !== regConfirmPass;

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setQuickFillNotice('');

    const trimmedUser = loginUser.trim();
    const trimmedPass = loginPass.trim();

    if (!trimmedUser || !trimmedPass) {
      setErrorMsg('Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu!');
      return;
    }

    setLoading(true);
    try {
      // Remember me handling
      if (rememberMe) {
        localStorage.setItem(STORAGE_REMEMBER_KEY, JSON.stringify({ username: trimmedUser }));
      } else {
        localStorage.removeItem(STORAGE_REMEMBER_KEY);
      }

      const res = await login(trimmedUser, trimmedPass);
      if (res.success) {
        showToast(`Đăng nhập thành công! Chào mừng ${trimmedUser}`, 'success');
      } else {
        setErrorMsg(res.message || 'Sai tên đăng nhập hoặc mật khẩu!');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi kết nối đăng nhập!');
    } finally {
      setLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setQuickFillNotice('');

    const trimmedName = regFullName.trim();
    const trimmedUser = regUsername.trim();
    const trimmedPass = regPassword.trim();
    const trimmedConfirm = regConfirmPass.trim();

    if (!trimmedName || !trimmedUser || !trimmedPass || !trimmedConfirm) {
      setErrorMsg('Vui lòng điền đầy đủ các thông tin đăng ký!');
      return;
    }

    if (trimmedPass !== trimmedConfirm) {
      setErrorMsg('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại!');
      return;
    }

    if (trimmedPass.length < 4) {
      setErrorMsg('Mật khẩu / Mã PIN phải có ít nhất 4 ký tự!');
      return;
    }

    setLoading(true);
    try {
      // Save avatar preference for student
      try {
        localStorage.setItem(`ey8_avatar_${trimmedUser}`, selectedPersona.emoji);
      } catch {
        // Safe storage ignore
      }

      const res = await register({
        fullName: trimmedName,
        username: trimmedUser,
        password: trimmedPass,
        role: 'student',
        createdByAdmin: false,
      });

      if (res.success) {
        showToast(`Chúc mừng ${selectedPersona.emoji} ${trimmedName} đã tạo tài khoản thành công!`, 'success');
      } else {
        setErrorMsg(res.message || 'Đăng ký không thành công!');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi tạo tài khoản!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-900 to-slate-950 flex items-center justify-center p-3 sm:p-6 lg:p-8 relative overflow-hidden text-slate-100">
      {/* Dynamic Background Light Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-80 h-80 rounded-full bg-emerald-600/15 blur-3xl pointer-events-none" />

      {/* Decorative Grid Mesh */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Main Glassmorphic Container */}
      <div className="max-w-5xl w-full bg-slate-900/85 backdrop-blur-2xl border border-slate-700/60 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.65)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px] relative z-10">
        
        {/* Left Branding Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950/90 via-indigo-900/60 to-slate-950/90 p-6 sm:p-9 text-white flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-indigo-800/40 relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            {/* Header Badge & Program */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold backdrop-blur-md shadow-sm">
                <span className="text-sm">🇬🇧</span>
                <span>Tiếng Anh 8 • Global Success</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold">
                2026 Edition
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                Cổng Luyện Thi & Bứt Phá Điểm Số
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200/80 leading-relaxed font-normal">
                Hệ sinh thái học tập thông minh lớp 8: Flashcard phát âm chuẩn, phòng thi bấm giờ, sổ tay câu sai tự động và đồng bộ đám mây thời gian thực.
              </p>
            </div>

            {/* Feature Cards Showcase */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-indigo-950/40 border border-indigo-800/30 hover:border-indigo-500/40 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-400/30 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    12 Units Từ Vựng & Ngữ Pháp
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  </h4>
                  <p className="text-[11px] text-indigo-200/70 leading-normal mt-0.5">
                    Flashcard tương tác 3D, bài tập điền từ, trắc nghiệm và phát âm chuẩn bản ngữ.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-indigo-950/40 border border-indigo-800/30 hover:border-violet-500/40 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-300 flex items-center justify-center shrink-0 border border-violet-400/30 group-hover:scale-105 transition-transform">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Phòng Thi Thử Bấm Giờ</h4>
                  <p className="text-[11px] text-indigo-200/70 leading-normal mt-0.5">
                    Bộ đề giữa kỳ & cuối kỳ chuẩn cấu trúc Bộ GD&ĐT, tự động chấm điểm và xếp hạng.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-indigo-950/40 border border-indigo-800/30 hover:border-rose-500/40 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0 border border-rose-400/30 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Sổ Tay Câu Sai Cá Nhân Hoá</h4>
                  <p className="text-[11px] text-indigo-200/70 leading-normal mt-0.5">
                    Tự động lưu câu sai, giải thích ngữ pháp chi tiết để không lặp lại lỗi cũ.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-indigo-950/40 border border-indigo-800/30 hover:border-emerald-500/40 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/30 group-hover:scale-105 transition-transform">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Đồng Bộ Cloud Supabase</h4>
                  <p className="text-[11px] text-indigo-200/70 leading-normal mt-0.5">
                    Bảo mật tuyệt đối, học tiếp liền mạch trên máy tính bàn, laptop và điện thoại.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="pt-6 border-t border-indigo-800/40 flex items-center justify-between text-[11px] text-indigo-300/80 relative z-10">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              English Young 8 Core
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Hệ Thống Trực Tuyến
            </span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 bg-white text-slate-800 p-6 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-6">

            {/* Header & Mode Switcher */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  {mode === 'login' ? (
                    <>
                      <span>Chào mừng quay lại!</span>
                      <span className="animate-bounce">👋</span>
                    </>
                  ) : (
                    <>
                      <span>Tạo Tài Khoản Mới</span>
                      <Sparkles className="w-6 h-6 text-indigo-600 inline" />
                    </>
                  )}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {mode === 'login'
                    ? 'Đăng nhập để tiếp tục lộ trình học tập và xem bảng điểm của em.'
                    : 'Gia nhập lớp học tiếng Anh 8 chỉ với vài bước đơn giản!'}
                </p>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="flex items-center p-1.5 rounded-2xl bg-slate-100 border border-slate-200 shadow-inner">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    mode === 'login'
                      ? 'bg-white text-indigo-600 shadow-md shadow-slate-200/80 scale-[1.02]'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng Nhập</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    mode === 'register'
                      ? 'bg-white text-indigo-600 shadow-md shadow-slate-200/80 scale-[1.02]'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Đăng Ký Học Sinh</span>
                </button>
              </div>
            </div>

            {/* Quick Test Accounts Banner (Only in Login mode) */}
            {mode === 'login' && (
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100/90 text-indigo-900 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-indigo-700">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    Đăng nhập nhanh tài khoản thử nghiệm:
                  </span>
                  <span className="text-[10px] bg-indigo-200/60 px-1.5 py-0.5 rounded text-indigo-800 font-semibold">1-Click</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('student')}
                    className="py-1.5 px-2.5 rounded-xl bg-white border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-[11px] font-bold text-slate-700 hover:text-indigo-600 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 text-left"
                    title="Đăng nhập tài khoản Học sinh mẫu (em_lop8 / 1234)"
                  >
                    <span>🎓</span>
                    <span className="truncate">Học sinh mẫu</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin')}
                    className="py-1.5 px-2.5 rounded-xl bg-white border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-[11px] font-bold text-slate-700 hover:text-indigo-600 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 text-left"
                    title="Đăng nhập tài khoản Quản trị viên (admin / admin123)"
                  >
                    <span>🛡️</span>
                    <span className="truncate">Quản trị viên</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Fill Confirmation Notice */}
            {quickFillNotice && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{quickFillNotice}</span>
              </div>
            )}

            {/* Error Message Box */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Mode 1: LOGIN FORM */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Username Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span>Tên đăng nhập</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">Ví dụ: em_lop8</span>
                  </div>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={loginUser}
                      onChange={e => setLoginUser(e.target.value)}
                      placeholder="Nhập tên đăng nhập..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50/50 hover:bg-white focus:bg-white"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span>Mật khẩu / Mã PIN</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">Mã PIN 4 số hoặc mật khẩu</span>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPass}
                      onChange={e => setLoginPass(e.target.value)}
                      placeholder="Nhập mã PIN hoặc mật khẩu..."
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50/50 hover:bg-white focus:bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
                      title={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox & Helper Notice */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-600 font-medium">Ghi nhớ tài khoản</span>
                  </label>
                  <span className="text-[11px] text-indigo-600 hover:underline cursor-pointer flex items-center gap-1" title="Mẹo: Học sinh chỉ cần nhập mã PIN 4 số đơn giản, không cần nhớ mật khẩu phức tạp.">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Hỗ trợ học sinh
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-indigo-300 active:scale-[0.99]"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang xác thực tài khoản...</span>
                    </div>
                  ) : (
                    <>
                      <span>Đăng Nhập Vào Hệ Thống</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Mode 2: REGISTER FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                
                {/* Persona / Avatar Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span>Chọn Biểu Tượng Học Sinh (Persona)</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    </label>
                    <span className="text-[11px] text-indigo-600 font-semibold">{selectedPersona.name}</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {STUDENT_PERSONAS.map(p => {
                      const isSelected = selectedPersona.id === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedPersona(p)}
                          className={`p-2 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border ${
                            isSelected
                              ? 'bg-indigo-50 border-indigo-600 shadow-md shadow-indigo-100 scale-105 ring-2 ring-indigo-200'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                          }`}
                          title={`${p.name}: ${p.tagline}`}
                        >
                          <span className="text-2xl">{p.emoji}</span>
                          <span className="text-[10px] font-bold text-slate-700 truncate w-full text-center">
                            {p.name.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-xl border border-slate-200/60 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>{selectedPersona.emoji} {selectedPersona.name}: <strong>{selectedPersona.tagline}</strong></span>
                  </div>
                </div>

                {/* Full Name Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>Họ và Tên học sinh</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={e => setRegFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Minh Anh"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50/50 hover:bg-white focus:bg-white"
                    required
                  />
                </div>

                {/* Username Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span>Tên đăng nhập (viết thường, không dấu)</span>
                      <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={regUsername}
                      onChange={e => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder="Ví dụ: minhanh_8a"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50/50 hover:bg-white focus:bg-white"
                      required
                    />
                  </div>
                </div>

                {/* Password & Confirm Password Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span>Mật khẩu / PIN (≥ 4 ký tự)</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="Nhập mật khẩu..."
                        className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50/50 hover:bg-white focus:bg-white"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                        title={showRegPassword ? 'Ẩn' : 'Hiện'}
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span>Nhập lại mật khẩu</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showRegConfirmPass ? 'text' : 'password'}
                        value={regConfirmPass}
                        onChange={e => setRegConfirmPass(e.target.value)}
                        placeholder="Nhập lại mật khẩu..."
                        className={`w-full pl-9 pr-9 py-2 rounded-xl border text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none transition-all bg-slate-50/50 hover:bg-white focus:bg-white ${
                          passwordsMismatch
                            ? 'border-rose-400 focus:ring-2 focus:ring-rose-100'
                            : passwordsMatch
                            ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                            : 'border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100'
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPass(!showRegConfirmPass)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                        title={showRegConfirmPass ? 'Ẩn' : 'Hiện'}
                      >
                        {showRegConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Strength Meter & Requirements Breakdown */}
                {regPassword.length > 0 && (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        Độ mạnh mật khẩu:
                        <span className={`font-extrabold ${passwordStrength.colorClass}`}>
                          {passwordStrength.label}
                        </span>
                      </span>
                      {passwordsMatch && (
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          Mật khẩu trùng khớp
                        </span>
                      )}
                      {passwordsMismatch && (
                        <span className="text-[11px] font-bold text-rose-500">
                          Chưa khớp nhau!
                        </span>
                      )}
                    </div>

                    {/* Dynamic Bar */}
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${passwordStrength.barClass}`} />
                    </div>

                    {/* Requirements Checklist */}
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 pt-1">
                      <div className="flex items-center gap-1">
                        {passwordStrength.checks.min4 ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block shrink-0" />
                        )}
                        <span>Tối thiểu 4 ký tự</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {passwordStrength.checks.hasLetter ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block shrink-0" />
                        )}
                        <span>Chứa chữ cái (a-z)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {passwordStrength.checks.hasNumber ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block shrink-0" />
                        )}
                        <span>Chứa chữ số (0-9)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {passwordStrength.checks.hasSpecialOrUpper ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block shrink-0" />
                        )}
                        <span>Chữ hoa / ký tự đặc biệt</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Default Student Permission Badge */}
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-[11px] text-indigo-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-600" />
                  <span>
                    Tài khoản được phân quyền mặc định: <strong>Học sinh Lớp 8</strong> (tham gia toàn bộ Unit, đề thi & trò chơi).
                  </span>
                </div>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-indigo-300 active:scale-[0.99]"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang tạo tài khoản học tập...</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Hoàn Tất Đăng Ký & Bắt Đầu Học Ngay</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Quick Switch Link at bottom */}
            <div className="pt-2 text-center">
              {mode === 'login' ? (
                <p className="text-xs text-slate-500">
                  Chưa có tài khoản học sinh?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    Đăng ký ngay tại đây
                  </button>
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  Đã có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    Đăng nhập tại đây
                  </button>
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
