import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';
import { useMistakes } from '../../context/MistakeContext';
import { Flame, ShieldCheck, User } from 'lucide-react';

interface HeaderProps {
  currentHash: string;
}

export const Header: React.FC<HeaderProps> = ({ currentHash }) => {
  const { user, role, toggleRole } = useAuth();
  const { streakDays } = useStudy();
  const { unresolvedCount } = useMistakes();

  const isTabActive = (pattern: string) => {
    if (pattern === 'dashboard') {
      return currentHash.includes('dashboard') || currentHash === '' || currentHash === '#/';
    }
    return currentHash.includes(pattern);
  };

  return (
    <header className="app-header sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
            E8
          </div>
          <div>
            <div className="logo text-lg font-bold text-slate-900 leading-tight">English Young 8</div>
            <p className="text-[11px] text-indigo-600 font-medium hidden sm:block">Global Success • Lớp 8 HK1</p>
          </div>
        </a>

        {/* Navigation Tabs (Desktop) */}
        <nav className="nav-tabs hidden md:flex items-center gap-1">
          <a
            href="#/dashboard"
            className={`nav-link px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              isTabActive('dashboard')
                ? 'active bg-indigo-50 text-indigo-600 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Bàn Học
          </a>
          <a
            href="#/unit/unit-1/vocab"
            className={`nav-link px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              isTabActive('unit')
                ? 'active bg-indigo-50 text-indigo-600 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            6 Unit
          </a>
          <a
            href="#/exams"
            className={`nav-link px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              isTabActive('exams')
                ? 'active bg-indigo-50 text-indigo-600 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Luyện Đề
          </a>
          <a
            href="#/mistakes"
            className={`nav-link relative px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              isTabActive('mistakes')
                ? 'active bg-indigo-50 text-indigo-600 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Sổ Câu Sai</span>
            {unresolvedCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {unresolvedCount}
              </span>
            )}
          </a>
          <a
            href="#/progress"
            className={`nav-link px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              isTabActive('progress')
                ? 'active bg-indigo-50 text-indigo-600 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Thành Tích
          </a>
          <a
            href="#/admin"
            className={`nav-link px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              isTabActive('admin')
                ? 'active bg-indigo-50 text-indigo-600 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Quản Trị
          </a>
        </nav>

        {/* Right tools: Streak + Portal Switcher + User Pill */}
        <div className="flex items-center gap-2.5">
          {/* Daily streak */}
          <div
            title={`Chuỗi học tập liên tục: ${streakDays} ngày`}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-xs font-bold cursor-default"
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <span>{streakDays} ngày</span>
          </div>

          {/* Portal Switcher Button */}
          <button
            onClick={toggleRole}
            title={`Đổi sang chế độ ${role === 'admin' ? 'Học sinh' : 'Quản trị'}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              role === 'admin'
                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {role === 'admin' ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Admin</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-slate-600" />
                <span>Học sinh</span>
              </>
            )}
          </button>

          {/* User pill */}
          <div className="user-pill flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
            <span>{user.username}</span>
            <span className="text-[10px] uppercase font-bold text-slate-500">({role})</span>
          </div>
        </div>
      </div>
    </header>
  );
};
