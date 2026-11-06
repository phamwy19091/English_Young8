import React from 'react';
import { UnitData, GrammarTopic, GrammarRule } from '../../types/curriculum';
import { BookOpen, Sparkles } from 'lucide-react';

interface GrammarViewerProps {
  unit: UnitData;
}

export const GrammarViewer: React.FC<GrammarViewerProps> = ({ unit }) => {
  const topics: GrammarTopic[] = unit.grammar || [];

  return (
    <div className="grammar-viewer max-w-4xl mx-auto py-4 space-y-8">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
          Ngữ pháp trọng tâm Unit {unit.id}
        </span>
        <h3 className="text-xl font-black text-slate-900 mt-1">
          Lý thuyết & Quy tắc Ngữ pháp Trọng Điểm
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Hệ thống {topics.length} chủ điểm ngữ pháp với quy tắc cấu trúc và mẹo làm bài thi.
        </p>
      </div>

      {topics.map((topic, tIdx) => {
        const tips = topic.tips || topic.examTips || [];
        return (
          <div
            key={tIdx}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden"
          >
            {/* Topic Header */}
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/10 text-indigo-200">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                    Chuyên đề {tIdx + 1}
                  </span>
                  <h4 className="text-lg font-bold text-white">{topic.title}</h4>
                </div>
              </div>
            </div>

            {/* Rules */}
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                {topic.rules.map((ruleItem, rIdx) => {
                  if (typeof ruleItem === 'string') {
                    return (
                      <div
                        key={rIdx}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3"
                      >
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {rIdx + 1}
                        </span>
                        <div
                          className="text-sm font-medium text-slate-800 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: ruleItem }}
                        />
                      </div>
                    );
                  }

                  const gr = ruleItem as GrammarRule;
                  return (
                    <div
                      key={rIdx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {rIdx + 1}
                        </span>
                        <h5 className="text-sm font-bold text-slate-900">{gr.rule}</h5>
                      </div>

                      {gr.explanation && (
                        <p className="text-xs text-slate-600 pl-8 leading-relaxed">
                          {gr.explanation}
                        </p>
                      )}

                      {gr.examples && gr.examples.length > 0 && (
                        <div className="pl-8 pt-1 space-y-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                            Ví dụ minh họa:
                          </span>
                          {gr.examples.map((ex, exIdx) => (
                            <div
                              key={exIdx}
                              className="text-xs text-indigo-900 italic bg-indigo-50/50 px-3 py-1.5 rounded-lg border border-indigo-100"
                            >
                              • {ex}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Exam Tips if present */}
              {tips.length > 0 && (
                <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Mẹo làm bài thi (Exam Tips):</span>
                  </div>
                  <ul className="space-y-1.5 pl-6 list-disc">
                    {tips.map((tip, tipIdx) => (
                      <li key={tipIdx} className="leading-relaxed font-medium">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
