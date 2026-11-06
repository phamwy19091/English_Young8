import React from 'react';
import { UnitData, PronunciationSound } from '../../types/curriculum';
import { speakEnglish } from '../../services/speechService';
import { Volume2 } from 'lucide-react';

interface PhoneticsViewerProps {
  unit: UnitData;
}

export const PhoneticsViewer: React.FC<PhoneticsViewerProps> = ({ unit }) => {
  const pronunciation = unit.pronunciation;
  const sounds = pronunciation?.sounds || [];

  return (
    <div className="phonetics-viewer max-w-4xl mx-auto py-4 space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
          Ngữ âm chuẩn IPA Unit {unit.id}
        </span>
        <h3 className="text-xl font-black text-slate-900 mt-1">
          {pronunciation?.title || 'Luyện phát âm & Phân biệt cặp âm chuẩn'}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Nhấn vào nút loa để nghe phát âm từng âm đơn và các từ ví dụ tương ứng.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sounds.map((item, idx) => {
          if (typeof item === 'string') {
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center justify-between"
              >
                <div className="text-2xl font-mono font-bold text-indigo-600">{item}</div>
                <button
                  onClick={() => speakEnglish(item)}
                  className="p-3 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            );
          }

          const soundObj = item as PronunciationSound;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 font-mono font-black text-2xl flex items-center justify-center border border-indigo-100">
                      {soundObj.sound}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                        Âm vị {idx + 1}
                      </span>
                      <h4 className="text-base font-bold text-slate-900">{soundObj.sound}</h4>
                    </div>
                  </div>

                  <button
                    onClick={() => speakEnglish(soundObj.sound)}
                    className="p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 mb-4 leading-relaxed">
                  <strong className="text-slate-800 block mb-0.5">Hướng dẫn khẩu hình:</strong>
                  {soundObj.guide || soundObj.desc}
                </div>

                {soundObj.examples && soundObj.examples.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Từ vựng minh họa:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {soundObj.examples.map((ex, eIdx) => (
                        <button
                          key={eIdx}
                          onClick={() => speakEnglish(ex)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                          title="Bấm để nghe phát âm từ này"
                        >
                          <span>{ex}</span>
                          <Volume2 className="w-3 h-3 text-indigo-500" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
