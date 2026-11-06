import React, { useState } from 'react';
import { UnitData, WrittenExercise } from '../../types/curriculum';
import { isWrittenAnswerAccepted } from '../../services/adaptiveService';
import { useToast } from '../common/Toast';
import { CheckCircle2, XCircle, Lightbulb, RotateCcw } from 'lucide-react';

interface WrittenExercisesProps {
  unit: UnitData;
}

export const WrittenExercises: React.FC<WrittenExercisesProps> = ({ unit }) => {
  const { showToast } = useToast();
  const exercises: WrittenExercise[] = unit.writtenExercises || [];

  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});
  const [hintsVisible, setHintsVisible] = useState<Record<string, boolean>>({});

  const handleInputChange = (exId: string, val: string) => {
    setInputs(prev => ({ ...prev, [exId]: val }));
    if (checkedMap[exId]) {
      setCheckedMap(prev => ({ ...prev, [exId]: false }));
    }
  };

  const checkSingle = (ex: WrittenExercise) => {
    const val = inputs[ex.id] || '';
    if (!val.trim()) {
      showToast('Vui lòng nhập câu trả lời trước khi kiểm tra!', 'warning');
      return;
    }
    setCheckedMap(prev => ({ ...prev, [ex.id]: true }));
    const isCorrect = isWrittenAnswerAccepted(ex, val);
    if (isCorrect) {
      showToast('Chính xác! Câu viết hoàn toàn chuẩn xác.', 'success');
    } else {
      showToast('Chưa chính xác, em hãy kiểm tra lại cấu trúc ngữ pháp!', 'error');
    }
  };

  const checkAll = () => {
    const newChecked: Record<string, boolean> = {};
    let correctCount = 0;

    exercises.forEach(ex => {
      newChecked[ex.id] = true;
      if (isWrittenAnswerAccepted(ex, inputs[ex.id] || '')) {
        correctCount++;
      }
    });

    setCheckedMap(newChecked);
    showToast(`Đã chấm xong! Kết quả: ${correctCount}/${exercises.length} câu đúng.`, 'info');
  };

  const toggleHint = (exId: string) => {
    setHintsVisible(prev => ({ ...prev, [exId]: !prev[exId] }));
  };

  const handleReset = () => {
    setInputs({});
    setCheckedMap({});
    setHintsVisible({});
  };

  return (
    <div className="written-exercises-view max-w-3xl mx-auto py-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Bài tập tự luận Unit {unit.id}
          </span>
          <h3 className="text-lg font-bold text-slate-900">
            {exercises.length} Câu tự luận (Chia dạng từ & Viết lại câu)
          </h3>
          <p className="text-xs text-slate-500">
            Hệ thống tự động chấm điểm thông minh (chấp nhận viết tắt và bỏ qua dấu câu).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={checkAll}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-colors"
          >
            Chấm tất cả câu
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Làm lại từ đầu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List of Written Exercises */}
      <div className="space-y-6">
        {exercises.map((ex, idx) => {
          const userVal = inputs[ex.id] || '';
          const isChecked = Boolean(checkedMap[ex.id]);
          const isCorrect = isChecked && isWrittenAnswerAccepted(ex, userVal);
          const showHint = Boolean(hintsVisible[ex.id]);

          return (
            <div
              key={ex.id}
              className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                isChecked
                  ? isCorrect
                    ? 'bg-emerald-50/30 border-emerald-300'
                    : 'bg-rose-50/30 border-rose-300'
                  : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              {/* Type and number */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Câu {idx + 1}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      ex.type === 'word-form'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {ex.type === 'word-form' ? 'Word-form' : 'Sentence rewrite'}
                  </span>
                  {ex.rootWord && (
                    <span className="text-xs font-mono font-bold text-slate-600">
                      Từ gốc: <span className="text-indigo-600">({ex.rootWord})</span>
                    </span>
                  )}
                </div>

                {/* Status indicator */}
                {isChecked && (
                  <div>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4" /> Đúng
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-500 font-bold text-xs">
                        <XCircle className="w-4 h-4" /> Chưa đúng
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Prompt sentence */}
              <div
                className="text-base font-bold text-slate-900 mb-3"
                dangerouslySetInnerHTML={{ __html: ex.prompt }}
              />

              {/* Input row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3">
                {ex.prefix && (
                  <span className="font-bold text-slate-800 text-sm whitespace-nowrap">
                    {ex.prefix}
                  </span>
                )}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={userVal}
                    onChange={e => handleInputChange(ex.id, e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        checkSingle(ex);
                      }
                    }}
                    placeholder={
                      ex.type === 'word-form'
                        ? 'Điền dạng đúng của từ...'
                        : 'Viết tiếp câu hoàn chỉnh...'
                    }
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all ${
                      isChecked
                        ? isCorrect
                          ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold'
                          : 'border-rose-400 bg-rose-50/50 text-slate-900'
                        : 'border-slate-200 focus:border-indigo-500 bg-slate-50 focus:bg-white text-slate-900'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => checkSingle(ex)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors shrink-0"
                  >
                    Kiểm tra
                  </button>
                  <button
                    onClick={() => toggleHint(ex.id)}
                    className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
                    title="Gợi ý ngữ pháp"
                  >
                    <Lightbulb className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Hint Box */}
              {showHint && ex.grammarHint && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 mb-3 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold mb-0.5">Gợi ý cấu trúc:</strong>
                    <span>{ex.grammarHint}</span>
                  </div>
                </div>
              )}

              {/* Explanation & Accepted Answers when checked */}
              {isChecked && (
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-1.5">
                  <div className="text-slate-700">
                    <strong className="text-slate-900">Đáp án chuẩn: </strong>
                    <span className="font-semibold text-emerald-700">
                      {(ex.acceptedAnswers || []).join(' / ')}
                    </span>
                  </div>
                  {ex.explanation && (
                    <div className="text-slate-500 leading-relaxed">
                      <strong>Giải thích: </strong> {ex.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
