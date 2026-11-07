import React, { useState, useEffect } from 'react';
import { unitsData } from '../../data/units';
import { useStudy } from '../../context/StudyContext';
import { FlashcardStudio } from '../flashcard/FlashcardStudio';
import { SpellingStudio } from '../flashcard/SpellingStudio';
import { VocabList } from '../flashcard/VocabList';
import { PhoneticsViewer } from './PhoneticsViewer';
import { GrammarViewer } from './GrammarViewer';
import { UnitQuiz } from './UnitQuiz';
import { WrittenExercises } from './WrittenExercises';

interface UnitPracticeProps {
  initialUnitId?: number;
  initialSubTab?: 'vocab' | 'spelling' | 'list' | 'phonetics' | 'grammar' | 'quiz' | 'written';
}

export const UnitPractice: React.FC<UnitPracticeProps> = ({
  initialUnitId,
  initialSubTab = 'vocab'
}) => {
  const { activeUnitId, setActiveUnitId } = useStudy();

  const [selectedUnitId, setSelectedUnitId] = useState<number>(initialUnitId || activeUnitId || 1);
  const [subTab, setSubTab] = useState<'vocab' | 'spelling' | 'list' | 'phonetics' | 'grammar' | 'quiz' | 'written'>(
    initialSubTab
  );

  useEffect(() => {
    if (initialUnitId && initialUnitId !== selectedUnitId) {
      setSelectedUnitId(initialUnitId);
      setActiveUnitId(initialUnitId);
    }
  }, [initialUnitId, setActiveUnitId]);

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const getUnitNum = (u: any): number => {
    if (typeof u.number === 'number') return u.number;
    const match = String(u.id).match(/\d+/);
    return match ? parseInt(match[0], 10) : 1;
  };

  const currentUnit = unitsData.find(u => getUnitNum(u) === Number(selectedUnitId) || u.id === selectedUnitId || u.id === `unit-${selectedUnitId}`) || unitsData[0];

  const handleUnitChange = (id: number) => {
    setSelectedUnitId(id);
    setActiveUnitId(id);
    window.location.hash = `#/unit/unit-${id}/${subTab}`;
  };

  const handleSubTabChange = (tab: typeof subTab) => {
    setSubTab(tab);
    window.location.hash = `#/unit/unit-${selectedUnitId}/${tab}`;
  };

  const [semesterFilter, setSemesterFilter] = useState<'all' | 1 | 2>('all');
  const displayedUnits = semesterFilter === 'all'
    ? unitsData
    : unitsData.filter(u => (u.semester || (getUnitNum(u) <= 6 ? 1 : 2)) === semesterFilter);

  return (
    <div className="unit-study-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
      {/* Semester Filter & Unit Selector Strip */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-1">Học kỳ:</span>
          <button
            onClick={() => setSemesterFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              semesterFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Tất cả 12 Unit
          </button>
          <button
            onClick={() => setSemesterFilter(1)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              semesterFilter === 1
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
            }`}
          >
            Học kỳ 1 (Unit 1 - 6)
          </button>
          <button
            onClick={() => setSemesterFilter(2)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              semesterFilter === 2
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
            }`}
          >
            Học kỳ 2 (Unit 7 - 12)
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {displayedUnits.map(u => {
            const uNum = getUnitNum(u);
            const isSelected = uNum === Number(selectedUnitId) || u.id === selectedUnitId;
            return (
              <button
                key={u.id}
                onClick={() => handleUnitChange(uNum)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 scale-102'
                    : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <span className="text-base">{u.icon || '📘'}</span>
                <span>Unit {uNum}: {u.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Unit Hero Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                Unit {currentUnit.id}
              </span>
              <span className="text-xs text-slate-400 font-medium">Học kì 1</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 leading-tight">
              {currentUnit.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              {currentUnit.summary || currentUnit.topic}
            </p>
          </div>

          {/* Sub-tab Navigation */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto">
            <button
              onClick={() => handleSubTabChange('vocab')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                subTab === 'vocab'
                  ? 'bg-white text-indigo-600 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🃏 Flashcards
            </button>
            <button
              onClick={() => handleSubTabChange('spelling')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                subTab === 'spelling'
                  ? 'bg-white text-indigo-600 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ✍️ Spelling
            </button>
            <button
              onClick={() => handleSubTabChange('list')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                subTab === 'list'
                  ? 'bg-white text-indigo-600 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📚 Tra từ
            </button>
            <button
              onClick={() => handleSubTabChange('phonetics')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                subTab === 'phonetics'
                  ? 'bg-white text-indigo-600 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🗣️ Ngữ âm
            </button>
            <button
              onClick={() => handleSubTabChange('grammar')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                subTab === 'grammar'
                  ? 'bg-white text-indigo-600 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📖 Ngữ pháp
            </button>
            <button
              onClick={() => handleSubTabChange('quiz')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                subTab === 'quiz'
                  ? 'bg-white text-indigo-600 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🎯 Trắc nghiệm
            </button>
            <button
              onClick={() => handleSubTabChange('written')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                subTab === 'written'
                  ? 'bg-white text-indigo-600 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📝 Tự luận
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content Body */}
      <div className="tab-content">
        {subTab === 'vocab' && <FlashcardStudio unit={currentUnit} />}
        {subTab === 'spelling' && <SpellingStudio unit={currentUnit} />}
        {subTab === 'list' && <VocabList unit={currentUnit} />}
        {subTab === 'phonetics' && <PhoneticsViewer unit={currentUnit} />}
        {subTab === 'grammar' && <GrammarViewer unit={currentUnit} />}
        {subTab === 'quiz' && <UnitQuiz unit={currentUnit} />}
        {subTab === 'written' && <WrittenExercises unit={currentUnit} />}
      </div>
    </div>
  );
};
