import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../common/Toast';
import { getSystemConfig } from '../../services/storageService';
import { CustomQuestion } from '../../types/storage';
import {
  TestGeneratorOptions,
  GeneratedTestPaper,
  generateTestPaper,
  downloadTestPaperAsWord
} from '../../services/testExportService';
import {
  Printer,
  FileDown,
  Sparkles,
  Shuffle,
  Layers,
  Settings2,
  Copy
} from 'lucide-react';

export const TestGenerator: React.FC = () => {
  const { showToast } = useToast();
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Custom questions from Admin storage
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);

  // Generator Options State
  const [options, setOptions] = useState<TestGeneratorOptions>({
    schoolName: 'TRƯỜNG THCS NGUYỄN DU',
    examTitle: 'BÀI KIỂM TRA ĐỊNH KỲ TIẾNG ANH 8',
    gradeClass: '8A1',
    schoolYear: '2026 - 2027',
    durationMinutes: 45,
    examCode: '101',
    unitScope: 'all',
    categoryScope: 'all',
    mcqCount: 25,
    includeWritten: true,
    writtenCount: 4,
    shuffleQuestions: true,
    shuffleOptions: true,
    includeAnswerKey: true,
    includeExplanations: true,
    includeAnswerGrid: true,
  });

  // Current Generated Test Paper
  const [paper, setPaper] = useState<GeneratedTestPaper | null>(null);

  // Preview Mode: 'exam' | 'key'
  const [previewTab, setPreviewTab] = useState<'exam' | 'key'>('exam');

  // Load custom questions on mount
  useEffect(() => {
    const cfg = getSystemConfig();
    setCustomQuestions(cfg.customQuestions || []);

    // Generate initial sample test paper
    const initialPaper = generateTestPaper(options, cfg.customQuestions || []);
    setPaper(initialPaper);
  }, []);

  // Handle Generate Test Paper
  const handleGenerate = (customCode?: string) => {
    const opts = { ...options, ...(customCode ? { examCode: customCode } : {}) };
    const newPaper = generateTestPaper(opts, customQuestions);
    setPaper(newPaper);
    showToast(`Đã tạo thành công Đề thi mã ${opts.examCode}! (${newPaper.mcqQuestions.length + newPaper.writtenExercises.length} câu)`, 'success');
  };

  // Handle Batch Generate 4 Variants
  const handleBatchGenerate4Codes = () => {
    const codes = ['101', '102', '103', '104'];
    let count = 0;
    codes.forEach((code, idx) => {
      setTimeout(() => {
        const variantOpts = { ...options, examCode: code, shuffleQuestions: true, shuffleOptions: true };
        const variantPaper = generateTestPaper(variantOpts, customQuestions);
        downloadTestPaperAsWord(variantPaper);
        count++;
        if (count === codes.length) {
          showToast('Đã tải xuống thành công trọn bộ 4 mã đề (101, 102, 103, 104) dạng file Word!', 'success');
        }
      }, idx * 400);
    });
  };

  // Handle Export Word (.doc)
  const handleExportWord = () => {
    if (!paper) {
      showToast('Vui lòng tạo đề thi trước khi xuất file!', 'warning');
      return;
    }
    downloadTestPaperAsWord(paper);
    showToast(`Đã tải file Word: Mã đề ${paper.options.examCode}.doc`, 'success');
  };

  // Handle Print / PDF
  const handlePrint = () => {
    if (!paper) {
      showToast('Vui lòng tạo đề thi trước khi in!', 'warning');
      return;
    }
    window.print();
  };

  const totalQuestionCount = (paper?.mcqQuestions.length || 0) + (paper?.writtenExercises.length || 0);

  return (
    <div className="space-y-8 test-generator-root">
      {/* Print stylesheet override for standard A4 exam output */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-test-area, #printable-test-area * {
            visibility: visible;
          }
          #printable-test-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 1.5cm;
            font-size: 11pt;
            color: #000;
            background: #fff;
          }
          .no-print {
            display: none !important;
          }
          .page-break-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .page-break-always {
            break-before: always;
            page-break-before: always;
          }
        }
      `}</style>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Bộ Tạo & Xuất Đề Thi Thông Minh
              </span>
              <span className="text-xs text-slate-400">Tiếng Anh 8 Global Success</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Xuất Đề Kiểm Tra Ra File Word (.doc) & In PDF
            </h2>
            <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Tự động chọn lọc câu hỏi từ ngân hàng Unit 1–6 và Đề thi học kỳ. Định dạng chuẩn phách của Bộ GD&ĐT, kèm bảng điền đáp án trắc nghiệm, khung điểm và trang hướng dẫn chấm chi tiết.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportWord}
              disabled={!paper}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Tải file Word (.doc)</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={!paper}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In ra giấy / Lưu PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Controls vs Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Generator Form (no-print) */}
        <div className="lg:col-span-5 space-y-6 no-print">
          {/* Preset Exam Templates */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Mẫu đề thi chuẩn nhanh (1 chạm):</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setOptions(prev => ({
                    ...prev,
                    examTitle: 'BÀI KIỂM TRA 15 PHÚT TIẾNG ANH 8',
                    durationMinutes: 15,
                    mcqCount: 15,
                    includeWritten: false,
                    includeAnswerGrid: true
                  }));
                  setTimeout(() => handleGenerate(), 50);
                }}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-left transition-all"
              >
                <div className="text-xs font-bold text-slate-800">⏱️ Đề 15 phút</div>
                <div className="text-[11px] text-slate-400">15 câu trắc nghiệm</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOptions(prev => ({
                    ...prev,
                    examTitle: 'BÀI KIỂM TRA ĐỊNH KỲ 1 TIẾT (45 PHÚT)',
                    durationMinutes: 45,
                    mcqCount: 25,
                    includeWritten: true,
                    writtenCount: 4,
                    includeAnswerGrid: true
                  }));
                  setTimeout(() => handleGenerate(), 50);
                }}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-left transition-all"
              >
                <div className="text-xs font-bold text-slate-800">📝 Đề 1 tiết (45p)</div>
                <div className="text-[11px] text-slate-400">25 TN + 4 tự luận</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOptions(prev => ({
                    ...prev,
                    examTitle: 'ĐỀ THI KHẢO SÁT GIỮA HỌC KỲ 1',
                    durationMinutes: 60,
                    mcqCount: 40,
                    includeWritten: true,
                    writtenCount: 6,
                    includeAnswerGrid: true
                  }));
                  setTimeout(() => handleGenerate(), 50);
                }}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-left transition-all"
              >
                <div className="text-xs font-bold text-slate-800">🎯 Đề Giữa Kỳ (60p)</div>
                <div className="text-[11px] text-slate-400">40 TN + 6 tự luận</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOptions(prev => ({
                    ...prev,
                    examTitle: 'ĐỀ THI HỌC KỲ 1 & KHẢO SÁT VÀO 10',
                    durationMinutes: 60,
                    mcqCount: 50,
                    includeWritten: false,
                    includeAnswerGrid: true
                  }));
                  setTimeout(() => handleGenerate(), 50);
                }}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-left transition-all"
              >
                <div className="text-xs font-bold text-slate-800">🏆 Đề Tuyển Sinh 10</div>
                <div className="text-[11px] text-slate-400">50 câu chuẩn 60p</div>
              </button>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">Thiết lập cấu hình đề thi</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Form Config</span>
            </div>

            {/* School & Header Info */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Tên Trường / Trung tâm</label>
                <input
                  type="text"
                  value={options.schoolName}
                  onChange={e => setOptions(prev => ({ ...prev, schoolName: e.target.value }))}
                  placeholder="Ví dụ: TRƯỜNG THCS NGUYỄN DU"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Tiêu đề bài kiểm tra</label>
                <input
                  type="text"
                  value={options.examTitle}
                  onChange={e => setOptions(prev => ({ ...prev, examTitle: e.target.value }))}
                  placeholder="Ví dụ: BÀI KIỂM TRA ĐỊNH KỲ TIẾNG ANH 8"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Khối / Lớp</label>
                  <input
                    type="text"
                    value={options.gradeClass}
                    onChange={e => setOptions(prev => ({ ...prev, gradeClass: e.target.value }))}
                    placeholder="8A1"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Mã đề thi</label>
                  <input
                    type="text"
                    value={options.examCode}
                    onChange={e => setOptions(prev => ({ ...prev, examCode: e.target.value }))}
                    placeholder="101"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-indigo-700 outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Năm học</label>
                  <input
                    type="text"
                    value={options.schoolYear}
                    onChange={e => setOptions(prev => ({ ...prev, schoolYear: e.target.value }))}
                    placeholder="2026 - 2027"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Thời gian làm bài (Phút)</label>
                  <input
                    type="number"
                    value={options.durationMinutes}
                    onChange={e => setOptions(prev => ({ ...prev, durationMinutes: Number(e.target.value) || 45 }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600"
                    min={5}
                    max={120}
                  />
                </div>
              </div>
            </div>

            {/* Question Filters */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Phạm vi bài học (Unit)</label>
                  <select
                    value={options.unitScope}
                    onChange={e => setOptions(prev => ({ ...prev, unitScope: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600 bg-slate-50"
                  >
                    <option value="all">Toàn bộ Unit 1 - Unit 6</option>
                    <option value="unit-1">Chỉ Unit 1: Leisure Time</option>
                    <option value="unit-2">Chỉ Unit 2: Countryside</option>
                    <option value="unit-3">Chỉ Unit 3: Teenagers</option>
                    <option value="unit-4">Chỉ Unit 4: Ethnic Groups</option>
                    <option value="unit-5">Chỉ Unit 5: Customs & Traditions</option>
                    <option value="unit-6">Chỉ Unit 6: Lifestyles</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Chuyên đề câu hỏi</label>
                  <select
                    value={options.categoryScope}
                    onChange={e => setOptions(prev => ({ ...prev, categoryScope: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600 bg-slate-50"
                  >
                    <option value="all">Tổng hợp tất cả chuyên đề</option>
                    <option value="pronunciation">Ngữ âm & Phát âm</option>
                    <option value="grammar">Ngữ pháp trọng tâm</option>
                    <option value="vocabulary">Từ vựng theo chủ đề</option>
                    <option value="reading">Bài đọc hiểu đoạn văn</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Số câu trắc nghiệm: <span className="text-indigo-600 font-black">{options.mcqCount}</span>
                  </label>
                  <input
                    type="range"
                    min={5}
                    max={50}
                    step={1}
                    value={options.mcqCount}
                    onChange={e => setOptions(prev => ({ ...prev, mcqCount: Number(e.target.value) }))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Số câu tự luận viết: <span className="text-indigo-600 font-black">{options.includeWritten ? options.writtenCount : 0}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="inc-written"
                      checked={options.includeWritten}
                      onChange={e => setOptions(prev => ({ ...prev, includeWritten: e.target.checked }))}
                      className="rounded accent-indigo-600 cursor-pointer"
                    />
                    <label htmlFor="inc-written" className="text-xs text-slate-700 font-medium cursor-pointer">
                      Kèm tự luận
                    </label>
                    {options.includeWritten && (
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={options.writtenCount}
                        onChange={e => setOptions(prev => ({ ...prev, writtenCount: Number(e.target.value) || 4 }))}
                        className="w-16 px-2 py-1 rounded-lg border border-slate-300 text-xs text-center font-bold"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Checkboxes for Shuffling & Answer Key */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.shuffleQuestions}
                  onChange={e => setOptions(prev => ({ ...prev, shuffleQuestions: e.target.checked }))}
                  className="rounded accent-indigo-600 cursor-pointer"
                />
                <span>Xáo trộn ngẫu nhiên thứ tự các câu hỏi</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.shuffleOptions}
                  onChange={e => setOptions(prev => ({ ...prev, shuffleOptions: e.target.checked }))}
                  className="rounded accent-indigo-600 cursor-pointer"
                />
                <span>Xáo trộn vị trí đáp án A, B, C, D (đổi vị trí ngẫu nhiên)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeAnswerGrid}
                  onChange={e => setOptions(prev => ({ ...prev, includeAnswerGrid: e.target.checked }))}
                  className="rounded accent-indigo-600 cursor-pointer"
                />
                <span>Kèm khung bảng điền đáp án trắc nghiệm nhanh cho học sinh</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeAnswerKey}
                  onChange={e => setOptions(prev => ({ ...prev, includeAnswerKey: e.target.checked }))}
                  className="rounded accent-indigo-600 cursor-pointer"
                />
                <span>Kèm Hướng dẫn chấm & Đáp án chi tiết ở trang cuối</span>
              </label>

              {options.includeAnswerKey && (
                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 ml-5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeExplanations}
                    onChange={e => setOptions(prev => ({ ...prev, includeExplanations: e.target.checked }))}
                    className="rounded accent-indigo-600 cursor-pointer"
                  />
                  <span>Kèm lời giải thích ngữ pháp chi tiết cho từng câu</span>
                </label>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <button
                type="button"
                onClick={() => handleGenerate()}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Shuffle className="w-4 h-4" />
                <span>Tạo & Trộn Đề Thi Mới Ngay</span>
              </button>

              <button
                type="button"
                onClick={handleBatchGenerate4Codes}
                className="w-full py-2.5 rounded-2xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-800 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                title="Tự động tạo 4 mã đề 101, 102, 103, 104 và tải về 4 file Word"
              >
                <Copy className="w-4 h-4" />
                <span>Tự động tạo 4 Mã Đề (101, 102, 103, 104)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Printable Document Preview */}
        <div className="lg:col-span-7 space-y-4">
          {/* Preview Navigation Header (no-print) */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 no-print">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewTab('exam')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  previewTab === 'exam'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📄 Đề Thi Học Sinh ({totalQuestionCount} câu)
              </button>

              <button
                onClick={() => setPreviewTab('key')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  previewTab === 'key'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🎯 Đáp Án & Hướng Dẫn Chấm
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                Mã đề: <strong>{paper?.options.examCode || '101'}</strong>
              </span>

              <button
                onClick={handleExportWord}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Tải file Word (.doc)"
              >
                <FileDown className="w-4 h-4" />
              </button>

              <button
                onClick={handlePrint}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                title="In hoặc Lưu PDF"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Paper View Container (This is what gets printed) */}
          <div
            id="printable-test-area"
            ref={printAreaRef}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-10 font-serif leading-relaxed text-slate-900 min-h-[600px]"
          >
            {paper && previewTab === 'exam' ? (
              /* TAB 1: EXAM SHEET PREVIEW */
              <div>
                {/* School & Exam Header */}
                <div className="grid grid-cols-12 gap-4 pb-4 border-b border-slate-300 mb-6 text-center">
                  <div className="col-span-5 text-center leading-tight">
                    <span className="text-[11px] uppercase tracking-wider block text-slate-600">Phòng GD&ĐT Huyện/Quận</span>
                    <strong className="text-xs uppercase font-black text-slate-900 block my-1">
                      {paper.options.schoolName}
                    </strong>
                    <span className="text-[11px] text-slate-500">Năm học {paper.options.schoolYear}</span>
                    <div className="w-16 h-px bg-slate-400 mx-auto mt-2"></div>
                  </div>

                  <div className="col-span-7 text-center leading-tight">
                    <strong className="text-sm uppercase font-black text-slate-900 block mb-1">
                      {paper.options.examTitle}
                    </strong>
                    <div className="text-xs text-slate-700">Môn: <strong>TIẾNG ANH 8 (GLOBAL SUCCESS)</strong></div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Thời gian: <strong>{paper.options.durationMinutes} phút</strong> (Không kể phát đề)
                    </div>
                    <div className="inline-block mt-2 px-3 py-0.5 rounded border border-slate-800 font-bold text-xs font-mono">
                      MÃ ĐỀ: {paper.options.examCode}
                    </div>
                  </div>
                </div>

                {/* Student Info Box */}
                <div className="grid grid-cols-12 border border-slate-800 mb-6 text-xs leading-loose">
                  <div className="col-span-8 p-3 space-y-1">
                    <div>Họ và tên thí sinh: ............................................................................ Lớp: <strong>{paper.options.gradeClass}</strong></div>
                    <div>Số báo danh: ........................................... Phòng thi số: ....................................</div>
                  </div>
                  <div className="col-span-4 border-l border-slate-800 p-2 text-center flex flex-col justify-between">
                    <strong className="text-[11px]">ĐIỂM SỐ</strong>
                    <div className="text-[10px] text-slate-500 italic mt-4">(Ký & ghi rõ họ tên GV chấm)</div>
                  </div>
                </div>

                {/* Quick Answer Grid (If Enabled) */}
                {paper.options.includeAnswerGrid && paper.mcqQuestions.length > 0 && (
                  <div className="mb-6 border border-slate-300 p-3 rounded-xl bg-slate-50/50">
                    <span className="text-[11px] font-bold uppercase tracking-wider block mb-2 text-slate-700">
                      Bảng điền đáp án trắc nghiệm:
                    </span>
                    <div className="grid grid-cols-10 gap-1 text-center font-mono text-xs">
                      {paper.mcqQuestions.map(q => (
                        <div key={q.displayIndex} className="border border-slate-400 bg-white rounded">
                          <div className="bg-slate-200 py-0.5 font-bold text-[10px]">{q.displayIndex}</div>
                          <div className="h-6"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exam Sub-Note */}
                <div className="text-[11px] italic text-slate-500 mb-6 border-b border-slate-200 pb-2">
                  * Thí sinh không được sử dụng từ điển hoặc tài liệu trong quá trình làm bài.
                </div>

                {/* Part I: MCQs */}
                <div className="space-y-5">
                  <div className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-800 pb-1">
                    Phần I. Trắc nghiệm khách quan ({paper.mcqQuestions.length} câu)
                  </div>

                  {paper.mcqQuestions.map(q => (
                    <div key={q.displayIndex} className="space-y-2 page-break-avoid">
                      {q.passage && (
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs italic text-slate-700 leading-relaxed mb-2">
                          <strong className="block text-slate-900 not-italic mb-1">📖 Read the passage:</strong>
                          <div dangerouslySetInnerHTML={{ __html: q.passage }} />
                        </div>
                      )}

                      <div className="text-xs font-bold text-slate-900">
                        Câu {q.displayIndex}.{' '}
                        <span className="font-normal font-sans" dangerouslySetInnerHTML={{ __html: q.question }} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4 text-xs font-sans">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="text-slate-800">
                            <span dangerouslySetInnerHTML={{ __html: opt }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Part II: Written (If Any) */}
                {paper.writtenExercises.length > 0 && (
                  <div className="mt-8 pt-6 border-t-2 border-slate-800 space-y-5 page-break-avoid">
                    <div className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-800 pb-1">
                      Phần II. Tự luận (Writing) - {paper.writtenExercises.length} câu
                    </div>

                    {paper.writtenExercises.map(w => (
                      <div key={w.displayIndex} className="space-y-2 text-xs page-break-avoid">
                        <div>
                          <strong>Câu {w.displayIndex}.</strong>{' '}
                          {w.rootWord && <span className="font-bold text-indigo-700">({w.rootWord}): </span>}
                          <span className="font-sans">{w.prompt}</span>
                        </div>
                        <div className="border-b border-dashed border-slate-400 h-6 ml-4"></div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Exam End Note */}
                <div className="text-center font-bold text-xs mt-10 pt-4 border-t border-slate-200 text-slate-500">
                  --- HẾT ---
                  <div className="font-normal text-[10px] mt-0.5">(Cán bộ coi thi không giải thích gì thêm)</div>
                </div>
              </div>
            ) : paper && previewTab === 'key' ? (
              /* TAB 2: ANSWER KEY PREVIEW */
              <div className="space-y-6">
                <div className="border-b border-slate-300 pb-4 text-center leading-tight">
                  <div className="text-xs uppercase text-slate-500">{paper.options.schoolName} • TỔ TIẾNG ANH</div>
                  <h3 className="text-base font-black uppercase text-indigo-950 mt-1">
                    HƯỚNG DẪN CHẤM & ĐÁP ÁN CHI TIẾT
                  </h3>
                  <div className="text-xs text-slate-600 mt-1">
                    {paper.options.examTitle} — <strong>MÃ ĐỀ: {paper.options.examCode}</strong>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Tổng số: <strong>{totalQuestionCount} câu</strong> • Thang điểm: <strong>10.0 điểm</strong> (Mỗi câu tương đương {(10 / Math.max(1, totalQuestionCount)).toFixed(2)} điểm).
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                        <th className="p-2.5 w-16 text-center border-r border-slate-300">Câu</th>
                        <th className="p-2.5 w-20 text-center border-r border-slate-300">Đáp án</th>
                        <th className="p-2.5">Nội dung chi tiết & Lời giải thích</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {paper.answerKey.map(ak => (
                        <tr key={ak.index} className="hover:bg-slate-50/80">
                          <td className="p-2.5 font-bold text-center border-r border-slate-300 text-slate-700">
                            Câu {ak.index}
                          </td>
                          <td className="p-2.5 font-black text-center border-r border-slate-300 text-indigo-700 text-sm">
                            {ak.answerLetter || '-'}
                          </td>
                          <td className="p-2.5 font-sans">
                            <strong className="text-slate-900">{ak.answerText}</strong>
                            {ak.explanation && (
                              <div className="text-[11px] text-slate-500 mt-0.5 italic">
                                💡 {ak.explanation}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
