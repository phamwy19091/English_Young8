import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';
import { useMistakes } from '../../context/MistakeContext';
import { useSubject } from '../../context/SubjectContext';
import { SUBJECTS_REGISTRY } from '../../data/subjects';
import { SubjectId } from '../../types/subject';
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
  Trophy,
  Calculator,
  FlaskConical,
} from 'lucide-react';

interface HeaderProps {
  currentHash: string;
}

export const Header: React.FC<HeaderProps> = ({ currentHash }) => {
  const { user, role, logout } = useAuth();
  const { streakDays } = useStudy();
  const { mistakes } = useMistakes();
  const { activeSubjectId, activeSubject, setActiveSubject } = useSubject();

  const isTabActive = (pattern: string) => {
    if (pattern === 'dashboard') {
      return currentHash.includes('dashboard') || currentHash === '' || currentHash === '#/';
    }
    return currentHash.includes(pattern);
  };

  const isAdmin = role === 'admin';
  const subjectUnresolvedCount = mistakes.filter(
    m => !m.resolved && (m.subjectId || 'english') === activeSubjectId
  ).length;

  const rawName = user?.fullName || user?.username || 'Học sinh';
  const cleanDisplayName = rawName.replace(/^Học\s*Sinh\s*\((.+)\)$/i, '$1');

  const handleSubjectChange = (newId: SubjectId) => {
    setActiveSubject(newId);
    if (
      currentHash.includes('unit') ||
      currentHash.includes('math') ||
      currentHash.includes('science') ||
      currentHash.includes('games') ||
      currentHash.includes('exams/room')
    ) {
      window.location.hash = '#/dashboard';
    }
  };

  const activeTextColor =
    activeSubjectId === 'math'
      ? 'text-blue-600'
      : activeSubjectId === 'science'
      ? 'text-emerald-600'
      : 'text-indigo-600';

  const logoGradient =
    activeSubjectId === 'math'
      ? 'from-blue-600 to-blue-500 shadow-blue-100'
      : activeSubjectId === 'science'
      ? 'from-emerald-600 to-teal-500 shadow-emerald-100'
      : 'from-indigo-600 to-indigo-500 shadow-indigo-100';

  return (
    <header
      className="app-header sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-3">
        {/* Logo + Subject Switcher */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href={isAdmin ? '#/admin' : '#/dashboard'}
            className="flex items-center gap-2.5 group shrink-0 whitespace-nowrap"
          >
            <div
              className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${logoGradient} flex items-center justify-center text-white font-black text-base shadow-md group-hover:scale-105 transition-transform shrink-0`}
            >
              Y8
            </div>
            <div className="whitespace-nowrap hidden sm:block">
              <div className="logo text-base font-extrabold text-slate-900 leading-tight whitespace-nowrap">
                English Young 8
              </div>
              <p className={`text-[11px] ${activeTextColor} font-medium hidden xl:block whitespace-nowrap`}>
                {isAdmin ? 'Trung Tâm Quản Trị & Giám Sát' : `${activeSubject.name} • ${activeSubject.badge}`}
              </p>
            </div>
          </a>

          {!isAdmin && (
            <select
              aria-label="Chọn môn học"
              value={activeSubjectId}
              onChange={e => handleSubjectChange(e.target.value as SubjectId)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border outline-none cursor-pointer transition-colors ${
                activeSubjectId === 'math'
                  ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100/70'
                  : activeSubjectId === 'science'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/70'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100/70'
              }`}
            >
              {SUBJECTS_REGISTRY.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.id === 'english' ? '🇬🇧 ' : sub.id === 'math' ? '📐 ' : '🔬 '}
                  {sub.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Navigation Tabs (Desktop) - Tailored per Active Subject */}
        <nav className="nav-tabs hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 shrink-0 whitespace-nowrap">
          {isAdmin ? (
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
            <>
              <a
                href="#/dashboard"
                className={`nav-link flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isTabActive('dashboard')
                    ? `active bg-white ${activeTextColor} shadow-xs font-bold`
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 shrink-0 hidden lg:inline" />
                <span>Bàn Học</span>
              </a>

              {activeSubjectId === 'english' && (
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
              )}

              {activeSubjectId === 'math' && (
                <a
                  href="#/math"
                  className={`nav-link flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                    isTabActive('math')
                      ? 'active bg-white text-blue-600 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5 shrink-0 hidden lg:inline" />
                  <span>Chương &amp; Công Thức</span>
                </a>
              )}

              {activeSubjectId === 'science' && (
                <a
                  href="#/science"
                  className={`nav-link flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                    isTabActive('science')
                      ? 'active bg-white text-emerald-600 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5 shrink-0 hidden lg:inline" />
                  <span>Hóa • Lí • Sinh</span>
                </a>
              )}

              <a
                href="#/exams"
                className={`nav-link flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isTabActive('exams')
                    ? `active bg-white ${activeTextColor} shadow-xs font-bold`
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5 shrink-0 hidden lg:inline" />
                <span>
                  {activeSubjectId === 'math'
                    ? 'Đề Thi Toán'
                    : activeSubjectId === 'science'
                    ? 'Đề Thi KHTN'
                    : 'Luyện Đề'}
                </span>
              </a>

              {activeSubjectId === 'english' && (
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
              )}

              <a
                href="#/mistakes"
                className={`nav-link flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isTabActive('mistakes')
                    ? `active bg-white ${activeTextColor} shadow-xs font-bold`
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0 hidden lg:inline" />
                <span>Sổ Câu Sai</span>
                {subjectUnresolvedCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] leading-none font-bold bg-rose-500 text-white shrink-0">
                    {subjectUnresolvedCount}
                  </span>
                )}
              </a>

              {activeSubjectId === 'english' && (
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
              )}
            </>
          )}
        </nav>

        {/* Right Tools */}
        <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
          {!isAdmin && (
            <div
              title={`Chuỗi học tập liên tục: ${streakDays} ngày`}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-700 text-xs font-bold cursor-default whitespace-nowrap shrink-0"
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
              <GraduationCap className={`w-3.5 h-3.5 ${activeTextColor} shrink-0`} />
            )}
            <span className="font-bold max-w-[90px] sm:max-w-[140px] truncate">
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
