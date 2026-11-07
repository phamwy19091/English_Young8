import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';

interface AuthPortalProps {
  initialMode?: 'login' | 'register';
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ initialMode = 'login' }) => {
  const { login, register } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Login form
  const [loginUser, setLoginUser] = useState<string>('');
  const [loginPass, setLoginPass] = useState<string>('');

  // Register form
  const [regFullName, setRegFullName] = useState<string>('');
  const [regUsername, setRegUsername] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPass, setRegConfirmPass] = useState<string>('');

  const handleQuickFill = (username: string, pin: string) => {
    setLoginUser(username);
    setLoginPass(pin);
    setErrorMsg('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginUser.trim() || !loginPass.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu!');
      return;
    }

    setLoading(true);
    try {
      const res = await login(loginUser.trim(), loginPass.trim());
      if (res.success) {
        showToast(`Đăng nhập thành công! Chào mừng ${loginUser}`, 'success');
      } else {
        setErrorMsg(res.message || 'Sai tên đăng nhập hoặc mật khẩu!');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi kết nối đăng nhập!');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!regFullName.trim() || !regUsername.trim() || !regPassword.trim() || !regConfirmPass.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ các thông tin đăng ký!');
      return;
    }

    if (regPassword !== regConfirmPass) {
      setErrorMsg('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại!');
      return;
    }

    if (regPassword.length < 4) {
      setErrorMsg('Mật khẩu phải có ít nhất 4 ký tự!');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        fullName: regFullName.trim(),
        username: regUsername.trim(),
        password: regPassword.trim(),
        role: 'student',
        createdByAdmin: false,
      });

      if (res.success) {
        showToast('Chúc mừng em đã đăng ký tài khoản thành công!', 'success');
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Branding Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-8 sm:p-10 text-white flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-indigo-900/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-800/60 border border-indigo-700/70 text-indigo-200 text-xs font-bold">
              <span>🇬🇧</span>
              <span>Tiếng Anh 8 • Global Success</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                Hệ Thống Ôn Tập & Luyện Thi Lớp 8
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
                Nền tảng học từ vựng, ngữ pháp và luyện đề kiểm tra có chấm điểm, quản lý sổ tay câu sai và đồng bộ dữ liệu thời gian thực.
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-4 pt-4 border-t border-indigo-800/40">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-400/30">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Không gian Học sinh riêng biệt</h4>
                  <p className="text-[11px] text-indigo-200/80 leading-normal mt-0.5">
                    Học Flashcard 3D có phát âm chuẩn, thi thử có bấm giờ và lưu sổ tay câu sai.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 border border-purple-400/30">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Cổng Quản trị & Giám sát</h4>
                  <p className="text-[11px] text-indigo-200/80 leading-normal mt-0.5">
                    Theo dõi tiến độ học sinh, giao bài tập về nhà và quản lý ngân hàng câu hỏi.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/30">
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Đồng bộ Cloud Supabase</h4>
                  <p className="text-[11px] text-indigo-200/80 leading-normal mt-0.5">
                    Lưu trữ kết quả an toàn trên máy tính và điện thoại mà không lo mất dữ liệu.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-indigo-900/60 flex items-center justify-between text-[11px] text-indigo-300 relative z-10">
            <span>© 2026 English Young 8</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Máy chủ Cloud: Sẵn sàng
            </span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-6">
            {/* Form Title & Mode Switcher */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {mode === 'login' ? 'Chào mừng quay trở lại! 👋' : 'Tạo tài khoản Học sinh mới ✨'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {mode === 'login'
                    ? 'Đăng nhập tài khoản Học sinh để vào học, hoặc Admin để quản lý.'
                    : 'Điền thông tin để tạo tài khoản học tập riêng cho em.'}
                </p>
              </div>

              {/* Mode Toggle Buttons */}
              <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    mode === 'login'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  🔑 Đăng Nhập
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    mode === 'register'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  📝 Đăng Ký Học Sinh
                </button>
              </div>
            </div>

            {/* Error Message Box */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Mode 1: LOGIN FORM */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Tên đăng nhập (Username)</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={loginUser}
                      onChange={e => setLoginUser(e.target.value)}
                      placeholder="Ví dụ: em_lop8 hoặc admin"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Mật khẩu / Mã PIN</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPass}
                      onChange={e => setLoginPass(e.target.value)}
                      placeholder="Nhập mật khẩu..."
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Đang kiểm tra đăng nhập...</span>
                  ) : (
                    <>
                      <span>Đăng Nhập Vào Hệ Thống</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Quick Credentials Chips */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Đăng nhập nhanh (Nhấn để điền):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickFill('em_lop8', '1234')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200/60 transition-colors"
                    >
                      🎓 Học sinh mẫu (em_lop8 / 1234)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFill('admin', 'admin123')}
                      className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold border border-purple-200/60 transition-colors"
                    >
                      👑 Quản trị viên (admin / admin123)
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* Mode 2: REGISTER FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Họ và Tên học sinh</label>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={e => setRegFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Minh Trang"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Tên đăng nhập (chữ thường, không dấu)</label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={e => setRegUsername(e.target.value.toLowerCase())}
                    placeholder="Ví dụ: minhtrang8"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Mật khẩu (≥ 4 ký tự)</label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Mật khẩu..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nhập lại mật khẩu</label>
                    <input
                      type="password"
                      value={regConfirmPass}
                      onChange={e => setRegConfirmPass(e.target.value)}
                      placeholder="Xác nhận lại..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-[11px] text-indigo-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-600" />
                  <span>Tài khoản đăng ký tại đây được phân quyền mặc định là <strong>Học sinh Lớp 8</strong>.</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Đang tạo tài khoản...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Hoàn Tất Đăng Ký & Vào Học Ngay</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
