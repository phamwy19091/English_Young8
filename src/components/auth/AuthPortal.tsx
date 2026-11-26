import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import {
  BookOpen,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export interface AuthPortalProps {
  initialMode?: 'login' | 'register';
}

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

  // Login form state
  const [loginUser, setLoginUser] = useState<string>('');
  const [loginPass, setLoginPass] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Register form state
  const [regFullName, setRegFullName] = useState<string>('');
  const [regUsername, setRegUsername] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPass, setRegConfirmPass] = useState<string>('');

  // Sync mode when initialMode prop changes externally
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Load remembered username if present
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

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrorMsg('');
    if (typeof window !== 'undefined') {
      window.location.hash = newMode === 'register' ? '#/register' : '#/login';
    }
  };

  const passwordsMatch = regConfirmPass.length > 0 && regPassword === regConfirmPass;
  const passwordsMismatch = regConfirmPass.length > 0 && regPassword !== regConfirmPass;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedUser = loginUser.trim();
    const trimmedPass = loginPass.trim();

    if (!trimmedUser || !trimmedPass) {
      setErrorMsg('Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      if (rememberMe) {
        localStorage.setItem(STORAGE_REMEMBER_KEY, JSON.stringify({ username: trimmedUser }));
      } else {
        localStorage.removeItem(STORAGE_REMEMBER_KEY);
      }

      const res = await login(trimmedUser, trimmedPass);
      if (res.success) {
        showToast(`Đăng nhập thành công! Chào mừng ${trimmedUser}.`, 'success');
      } else {
        setErrorMsg(res.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi kết nối đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedName = regFullName.trim();
    const trimmedUser = regUsername.trim().toLowerCase();
    const trimmedPass = regPassword.trim();
    const trimmedConfirm = regConfirmPass.trim();

    if (!trimmedName || !trimmedUser || !trimmedPass || !trimmedConfirm) {
      setErrorMsg('Vui lòng điền đầy đủ tất cả các thông tin đăng ký.');
      return;
    }

    if (!trimmedUser.includes('@') && !/^[a-z0-9_]+$/.test(trimmedUser)) {
      setErrorMsg('Tên đăng nhập chỉ được chứa chữ thường không dấu, số hoặc gạch dưới (_).');
      return;
    }

    if (trimmedPass.length < 6) {
      setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (trimmedPass !== trimmedConfirm) {
      setErrorMsg('Mật khẩu nhập lại không khớp.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        fullName: trimmedName,
        username: trimmedUser,
        password: trimmedPass,
        role: 'student',
        createdByAdmin: false,
      });

      if (res.success) {
        showToast(`Tạo tài khoản thành công! Chào mừng ${trimmedName}.`, 'success');
      } else {
        setErrorMsg(res.message || 'Đăng ký không thành công.');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi tạo tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  const inputBaseClass =
    'w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 bg-white outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-colors';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-800">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
        {/* Minimal Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">English Young 8</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Ôn tập &amp; Luyện thi Tiếng Anh lớp 8
            </p>
          </div>
        </div>

        {/* Segmented Mode Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
              mode === 'login'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
              mode === 'register'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="login-username" className="block text-sm font-medium text-slate-700">
                Tên đăng nhập hoặc Email
              </label>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                value={loginUser}
                onChange={e => setLoginUser(e.target.value)}
                placeholder="Nhập tên đăng nhập..."
                className={inputBaseClass}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showLoginPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={loginPass}
                  onChange={e => setLoginPass(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className={`${inputBaseClass} pr-10`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(prev => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md"
                  aria-label={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none pt-0.5">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-600">Ghi nhớ tên đăng nhập</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <span>Đăng nhập</span>
              )}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="reg-fullname" className="block text-sm font-medium text-slate-700">
                Họ và tên
              </label>
              <input
                id="reg-fullname"
                type="text"
                autoComplete="name"
                value={regFullName}
                onChange={e => setRegFullName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Minh Anh"
                className={inputBaseClass}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-username" className="block text-sm font-medium text-slate-700">
                Tên đăng nhập
              </label>
              <input
                id="reg-username"
                type="text"
                autoComplete="username"
                value={regUsername}
                onChange={e => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                placeholder="Ví dụ: minhanh8a"
                className={inputBaseClass}
                required
              />
              <p className="text-xs text-slate-500">
                Chữ thường không dấu, số hoặc gạch dưới (_)
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showRegPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  minLength={6}
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className={`${inputBaseClass} pr-10`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(prev => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md"
                  aria-label={showRegPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-confirm-password" className="block text-sm font-medium text-slate-700">
                Nhập lại mật khẩu
              </label>
              <div className="relative">
                <input
                  id="reg-confirm-password"
                  type={showRegConfirmPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  minLength={6}
                  value={regConfirmPass}
                  onChange={e => setRegConfirmPass(e.target.value)}
                  placeholder="Nhập lại mật khẩu..."
                  className={`${inputBaseClass} pr-10 ${
                    passwordsMismatch
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                      : passwordsMatch
                      ? 'border-emerald-500 focus:border-emerald-600 focus:ring-emerald-100'
                      : ''
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegConfirmPass(prev => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md"
                  aria-label={showRegConfirmPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showRegConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordsMismatch && (
                <p className="text-xs text-rose-600">Mật khẩu nhập lại chưa khớp.</p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-emerald-600">Mật khẩu trùng khớp.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tạo tài khoản...</span>
                </>
              ) : (
                <span>Tạo tài khoản</span>
              )}
            </button>
          </form>
        )}

        {/* Footer Mode Switch */}
        <div className="pt-2 border-t border-slate-100 text-center text-sm text-slate-500">
          {mode === 'login' ? (
            <p>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => switchMode('register')}
                className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Đăng ký ngay
              </button>
            </p>
          ) : (
            <p>
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Đăng nhập
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
