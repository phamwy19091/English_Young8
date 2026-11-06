import React, { useState } from 'react';
import { UnitData } from '../../types/curriculum';
import { useStudy } from '../../context/StudyContext';
import { speakEnglish } from '../../services/speechService';
import { Volume2, Search, CheckCircle2, RotateCw } from 'lucide-react';

interface VocabListProps {
  unit: UnitData;
  onSelectVocab?: (vocabId: string) => void;
}

export const VocabList: React.FC<VocabListProps> = ({ unit }) => {
  const { isVocabLearned, markVocabLearned, unmarkVocabLearned } = useStudy();
  const [search, setSearch] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'unlearned' | 'learned'>('all');

  const allVocab = unit.vocab || [];

  const filtered = allVocab.filter(v => {
    const matchesSearch =
      v.word.toLowerCase().includes(search.toLowerCase()) ||
      v.meaning.toLowerCase().includes(search.toLowerCase()) ||
      v.ipa.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    const learned = isVocabLearned(v.id);
    if (filter === 'learned') return learned;
    if (filter === 'unlearned') return !learned;
    return true;
  });

  return (
    <div className="vocab-summary-list max-w-4xl mx-auto py-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm từ vựng hoặc nghĩa..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:border-indigo-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto justify-center">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              filter === 'all' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả ({allVocab.length})
          </button>
          <button
            onClick={() => setFilter('unlearned')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              filter === 'unlearned' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Chưa thuộc ({allVocab.filter(v => !isVocabLearned(v.id)).length})
          </button>
          <button
            onClick={() => setFilter('learned')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              filter === 'learned' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đã thuộc ({allVocab.filter(v => isVocabLearned(v.id)).length})
          </button>
        </div>
      </div>

      {/* Grid of Vocab Items */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
          Không tìm thấy từ vựng nào phù hợp.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filtered.map(v => {
            const learned = isVocabLearned(v.id);
            return (
              <div
                key={v.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  learned
                    ? 'bg-emerald-50/40 border-emerald-200/80'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => speakEnglish(v.word)}
                        className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <div>
                        <span className="font-bold text-slate-900 text-base">{v.word}</span>
                        <span className="ml-2 font-mono text-xs text-slate-500">{v.ipa}</span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
                      {v.type}
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-slate-800 mb-2 pl-8">
                    {v.meaning}
                  </div>

                  <div className="text-xs text-slate-500 italic pl-8 mb-1">
                    "{v.example}"
                  </div>
                  <div className="text-[11px] text-slate-400 pl-8 mb-3">
                    → {v.exampleVi}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  {learned ? (
                    <button
                      onClick={() => unmarkVocabLearned(v.id)}
                      className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Đã thuộc (Nhấn để học lại)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => markVocabLearned(v.id)}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-indigo-600 font-semibold"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Đánh dấu đã thuộc</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
