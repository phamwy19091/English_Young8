import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';
import { useMistakes } from '../../context/MistakeContext';
import {
  Flame,
  ShieldCheck,
  LogOut,
  Eye,
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  Gamepad2,
  AlertCircle,
  Trophy
} from 'lucide-react';

interface HeaderProps {
  currentHash: string;
}

export const Header: React.FC<HeaderProps> = ({ currentHash }) => {
  const { user, role, logout } = useAuth();
  const { streakDays } = useStudy();
  const { unresolvedCount } = useMistakes();

  const isTabActive = (pattern: string) => {
    if (pattern === 'dashboard') {
      return currentHash.includes('dashboard') || currentHash === '' || currentHash === '#/';
    }
    return currentHash.includes(pattern);
  };

  const isAdmin = role === 'admin';

  // Clean display name so "Học Sinh (test123)" doesn't redundantly repeat "(Học sinh)"
  const rawName = user?.fullName || user?.username || 'Học sinh';
  const cleanDisplayName = rawName.replace(/^Học\s*Sinh\s*\((.+)\)$/i, '$1');

  return (
    <header
      className="app-header sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Logo - Strictly Single Line */}
        <a
          href={isAdmin ? '#/admin' : '#/dashboard'}
          className="flex items-center gap-2.5 group shrink-0 whitespace-nowrap"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-black text-base shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform shrink-0">
            E8
          </div>
          <div className="whitespace-nowrap">
            <div className="logo text-base font-extrabold text-slate-900 leading-tight whitespace-nowrap">
              English Young 8
            </div>
            <p className="text-[11px] text-indigo-600 font-medium hidden xl:block whitespace-nowrap">
              {isAdmin ? 'Trung Tâm Quản Trị & Giám Sát' : 'Global Success • Lớp 8 & Vào 10'}
            </p>
          </div>
        </a>

        {/* Navigation Tabs (Desktop) - Strictly Single Line Pill Bar */}
        <nav className="nav-tabs hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 shrink-0 whitespace-nowrap">
          {isAdmin ? (
            /* ADMIN NAVIGATION TABS */
            <>
              <a
                href="#/admin"
                className={`nav-link flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isTabActive('admin')
                    ? 'active bg-white text-purple-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Cổng Quản Trị</span>
              </a>
              <a
                href="#/dashboard"
                className={`nav-link flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isTabActive('dashboard')
                    ? 'active bg-white text-indigo-600 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Eye className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Góc Nhìn Học Sinh</span>
              </a>
              <a
                href="#/games"
                className={`nav-link flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isTabActive('games')
                    ? 'active bg-amber-50 text-amber-800 border border-amber-200/80 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Gamepad2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Đấu Trường 2D</span>
              </a>
            </>
          ) : (
            /* STUDENT NAVIGATION TABS */
            <>
              <a
                href="#/dashboard"
                className={`nav-link flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isTabActive('dashboard')
                    ? 'active bg-white text-indigo-600 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 shrink-0 hidden lg:inline" />
                <span>Bàn Học</span>
              </a>
              <a
                href="#/unit/unit-1/vocab"
                className={`nav-link flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isTabActive('unit')
                    ? 'active bg-white text-indigo-600 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0 hidden lg:inline" />
                <span>12 Unit</span>
              </a>
              <a
                href="#/exams"
                className={`nav-link flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isTabActive('exams')
                    ? 'active bg-white text-indigo-600 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5 shrink-0 hidden lg:inline" />
                <span>Luyện Đề</span>
              </a>
              <a
                href="#/games"
                className={`nav-link flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isTabActive('games')
                    ? 'active bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs font-bold'
                    : 'text-amber-700 bg-amber-50/70 hover:bg-amber-100/80'
                }`}
              >
                <Gamepad2 className="w-4 h-4 shrink-0" />
                <span>Game 2D</span>
              </a>
              <a
                href="#/mistakes"
                className={`nav-link flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isTabActive('mistakes')
                    ? 'active bg-white text-indigo-600 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0 hidden lg:inline" />
                <span>Sổ Câu Sai</span>
                {unresolvedCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] leading-none font-bold bg-rose-500 text-white shrink-0">
                    {unresolvedCount}
                  </span>
                )}
              </a>
              <a
                href="#/progress"
                className={`nav-link flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isTabActive('progress')
                    ? 'active bg-white text-indigo-600 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 shrink-0 hidden lg:inline" />
                <span>Thành Tích</span>
              </a>
            </>
          )}
        </nav>

        {/* Right Tools - Strictly Single Line */}
        <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
          {!isAdmin && (
            <div
              title={`Chuỗi học tập liên tục: ${streakDays} ngày`}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-700 text-xs font-bold cursor-default whitespace-nowrap shrink-0"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
              <span>{streakDays} ngày</span>
            </div>
          )}

          {/* User pill */}
          <div
            className={`user-pill flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 ${
              isAdmin
                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                : 'bg-slate-100 text-slate-700 border border-slate-200/70'
            }`}
          >
            {isAdmin ? (
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            ) : (
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            )}
            <span className="font-bold max-w-[110px] sm:max-w-[140px] truncate">
              {cleanDisplayName}
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold leading-none ${
                isAdmin ? 'bg-purple-200/80 text-purple-900' : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              {isAdmin ? 'Admin' : 'HS'}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            title="Đăng xuất khỏi hệ thống"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-slate-200/70 hover:border-rose-200 whitespace-nowrap shrink-0"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden lg:inline">Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
};
