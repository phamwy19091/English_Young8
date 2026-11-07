import React from 'react';
import { Home, BookOpen, GraduationCap, AlertCircle, Award, Gamepad2 } from 'lucide-react';
import { useMistakes } from '../../context/MistakeContext';

interface MobileBottomNavProps {
  currentHash: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentHash }) => {
  const { unresolvedCount } = useMistakes();

  const isTabActive = (pattern: string) => {
    if (pattern === 'dashboard') {
      return currentHash.includes('dashboard') || currentHash === '' || currentHash === '#/';
    }
    return currentHash.includes(pattern);
  };

  return (
    <div id="mobile-nav-root">
      <nav
        className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden flex items-center justify-around px-1 py-1.5 shadow-lg"
        role="navigation"
        aria-label="Mobile Navigation"
      >
        <a
          href="#/dashboard"
          className={`b-nav-item flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
            isTabActive('dashboard') ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Bàn học</span>
        </a>

        <a
          href="#/unit/unit-1/vocab"
          className={`b-nav-item flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
            isTabActive('unit') ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>12 Unit</span>
        </a>

        <a
          href="#/exams"
          className={`b-nav-item flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
            isTabActive('exams') ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-5 h-5" />
          <span>Luyện đề</span>
        </a>

        <a
          href="#/games"
          className={`b-nav-item flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
            isTabActive('games') ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Gamepad2 className="w-5 h-5" />
          <span>Trò chơi</span>
        </a>

        <a
          href="#/mistakes"
          className={`b-nav-item relative flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
            isTabActive('mistakes') ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <AlertCircle className="w-5 h-5" />
            {unresolvedCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white">
                {unresolvedCount}
              </span>
            )}
          </div>
          <span>Câu sai</span>
        </a>

        <a
          href="#/progress"
          className={`b-nav-item flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
            isTabActive('progress') ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-5 h-5" />
          <span>Thành tích</span>
        </a>
      </nav>
    </div>
  );
};
