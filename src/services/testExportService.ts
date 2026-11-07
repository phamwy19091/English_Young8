import { UnitQuestion, WrittenExercise } from '../types/curriculum';
import { CustomQuestion } from '../types/storage';
import { unitsData } from '../data/units';
import { examsData } from '../data/exams';

export interface TestGeneratorOptions {
  schoolName: string;
  examTitle: string;
  gradeClass: string;
  schoolYear: string;
  durationMinutes: number;
  examCode: string;
  unitScope: string; // 'all' or 'unit-1', 'unit-2', etc.
  categoryScope: string; // 'all', 'pronunciation', 'grammar', 'vocabulary', 'reading', 'written'
  mcqCount: number;
  includeWritten: boolean;
  writtenCount: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  includeAnswerKey: boolean;
  includeExplanations: boolean;
  includeAnswerGrid: boolean;
}

export interface GeneratedTestPaper {
  id: string;
  options: TestGeneratorOptions;
  mcqQuestions: Array<UnitQuestion & { displayIndex: number }>;
  writtenExercises: Array<WrittenExercise & { displayIndex: number }>;
  answerKey: Array<{
    index: number;
    answerLetter: string;
    answerText: string;
    explanation?: string;
    type: 'mcq' | 'written';
  }>;
  createdAt: string;
}

/**
 * Fisher-Yates array shuffle helper
 */
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Shuffle options of a single question and maintain the correct answer index
 */
function shuffleQuestionOptions(q: UnitQuestion): UnitQuestion {
  const originalOptions = [...q.options];
  const originalAnswerIndex = q.answer;

  // Clean option prefixes if present (e.g., "A. ", "B. ")
  const cleanTexts = originalOptions.map(opt => opt.replace(/^[A-D]\.\s*/i, ''));
  const cleanAnswerText = cleanTexts[originalAnswerIndex];

  const shuffledClean = shuffle(cleanTexts);
  const newAnswerIndex = shuffledClean.indexOf(cleanAnswerText);

  const letters = ['A', 'B', 'C', 'D'];
  const formattedOptions = shuffledClean.map((txt, idx) => `${letters[idx]}. ${txt}`);

  return {
    ...q,
    options: formattedOptions,
    answer: newAnswerIndex >= 0 ? newAnswerIndex : originalAnswerIndex
  };
}

/**
 * Assemble questions from all curriculum data and custom questions
 */
export function generateTestPaper(
  options: TestGeneratorOptions,
  customQuestions: CustomQuestion[] = []
): GeneratedTestPaper {
  // 1. Gather all Multiple Choice Questions
  let allMCQs: UnitQuestion[] = [];

  unitsData.forEach(u => {
    // Filter by unitScope if not 'all'
    if (options.unitScope !== 'all' && u.id !== options.unitScope && String(u.number) !== options.unitScope) {
      return;
    }
    if (u.quiz && Array.isArray(u.quiz)) {
      allMCQs.push(...u.quiz);
    }
  });

  // Include questions from Exams if unitScope is 'all'
  if (options.unitScope === 'all') {
    examsData.forEach(e => {
      if (e.questions && Array.isArray(e.questions)) {
        allMCQs.push(...e.questions);
      }
    });
  }

  // Include custom questions from QBank
  if (customQuestions.length > 0) {
    customQuestions.forEach(cq => {
      allMCQs.push({
        id: cq.id,
        section: cq.section || 'Custom Bank',
        question: cq.question,
        options: cq.options,
        answer: cq.answer,
        explanation: cq.explanation || ''
      });
    });
  }

  // Filter by categoryScope
  if (options.categoryScope !== 'all') {
    allMCQs = allMCQs.filter(q => {
      const sectionLower = (q.section || '').toLowerCase();
      const promptLower = (q.question || '').toLowerCase();

      switch (options.categoryScope) {
        case 'pronunciation':
          return sectionLower.includes('pronunciation') || sectionLower.includes('ngữ âm') || promptLower.includes('pronounced') || promptLower.includes('stress');
        case 'grammar':
          return sectionLower.includes('grammar') || sectionLower.includes('ngữ pháp');
        case 'vocabulary':
          return sectionLower.includes('vocabulary') || sectionLower.includes('từ vựng');
        case 'reading':
          return Boolean(q.passage) || sectionLower.includes('reading') || sectionLower.includes('đọc');
        default:
          return true;
      }
    });
  }

  // Deduplicate MCQs by question text
  const uniqueMCQs: UnitQuestion[] = [];
  const seenTexts = new Set<string>();
  for (const q of allMCQs) {
    const normalized = q.question.replace(/\s+/g, ' ').trim().toLowerCase();
    if (!seenTexts.has(normalized)) {
      seenTexts.add(normalized);
      uniqueMCQs.push(q);
    }
  }

  // Shuffle or slice MCQs
  let finalMCQs = options.shuffleQuestions ? shuffle(uniqueMCQs) : uniqueMCQs;
  finalMCQs = finalMCQs.slice(0, Math.min(options.mcqCount, finalMCQs.length));

  if (options.shuffleOptions) {
    finalMCQs = finalMCQs.map(shuffleQuestionOptions);
  }

  const numberedMCQs = finalMCQs.map((q, idx) => ({
    ...q,
    displayIndex: idx + 1
  }));

  // 2. Gather Written Exercises if requested
  let numberedWritten: Array<WrittenExercise & { displayIndex: number }> = [];
  if (options.includeWritten && options.writtenCount > 0) {
    let allWritten: WrittenExercise[] = [];
    unitsData.forEach(u => {
      if (options.unitScope !== 'all' && u.id !== options.unitScope && String(u.number) !== options.unitScope) {
        return;
      }
      if (u.writtenExercises && Array.isArray(u.writtenExercises)) {
        allWritten.push(...u.writtenExercises);
      }
    });

    let selectedWritten = options.shuffleQuestions ? shuffle(allWritten) : allWritten;
    selectedWritten = selectedWritten.slice(0, Math.min(options.writtenCount, selectedWritten.length));

    numberedWritten = selectedWritten.map((w, idx) => ({
      ...w,
      displayIndex: numberedMCQs.length + idx + 1
    }));
  }

  // 3. Assemble Answer Key
  const letters = ['A', 'B', 'C', 'D'];
  const answerKey: Array<{
    index: number;
    answerLetter: string;
    answerText: string;
    explanation?: string;
    type: 'mcq' | 'written';
  }> = [];

  numberedMCQs.forEach(q => {
    const letter = letters[q.answer] || 'A';
    const optText = q.options[q.answer] || '';
    answerKey.push({
      index: q.displayIndex,
      answerLetter: letter,
      answerText: optText,
      explanation: q.explanation,
      type: 'mcq'
    });
  });

  numberedWritten.forEach(w => {
    answerKey.push({
      index: w.displayIndex,
      answerLetter: '',
      answerText: (w as any).expectedAnswer || (w as any).answer || w.prompt,
      explanation: (w as any).explanation || '',
      type: 'written'
    });
  });

  return {
    id: `test_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    options,
    mcqQuestions: numberedMCQs,
    writtenExercises: numberedWritten,
    answerKey,
    createdAt: new Date().toISOString()
  };
}

/**
 * Generate full HTML suitable for Microsoft Word (.doc) export
 */
export function buildWordDocumentHtml(paper: GeneratedTestPaper): string {
  const { options, mcqQuestions, writtenExercises, answerKey } = paper;

  const totalQuestions = mcqQuestions.length + writtenExercises.length;

  // Build Answer Grid Table
  let answerGridHtml = '';
  if (options.includeAnswerGrid && mcqQuestions.length > 0) {
    const itemsPerRow = 10;
    const rowsCount = Math.ceil(mcqQuestions.length / itemsPerRow);

    let rowsHtml = '';
    for (let r = 0; r < rowsCount; r++) {
      let qNumCells = '';
      let ansCells = '';
      for (let c = 0; c < itemsPerRow; c++) {
        const qIdx = r * itemsPerRow + c + 1;
        if (qIdx <= mcqQuestions.length) {
          qNumCells += `<td style="border:1px solid #000; text-align:center; font-weight:bold; width:35px; background:#f2f2f2; font-size:10pt;">${qIdx}</td>`;
          ansCells += `<td style="border:1px solid #000; text-align:center; height:26px; width:35px;">&nbsp;</td>`;
        } else {
          qNumCells += `<td style="border:1px solid #000; text-align:center; width:35px; background:#f9f9f9;">&nbsp;</td>`;
          ansCells += `<td style="border:1px solid #000; text-align:center; width:35px;">&nbsp;</td>`;
        }
      }
      rowsHtml += `<tr>${qNumCells}</tr><tr>${ansCells}</tr>`;
    }

    answerGridHtml = `
      <div style="margin-top:15px; margin-bottom:20px;">
        <div style="font-weight:bold; font-size:11pt; margin-bottom:5px;">BẢNG ĐIỀN ĐÁP ÁN TRẮC NGHIỆM:</div>
        <table style="border-collapse:collapse; width:100%; border:1px solid #000;">
          ${rowsHtml}
        </table>
      </div>
    `;
  }

  // Build MCQs HTML
  const mcqsHtml = mcqQuestions
    .map(q => {
      let passageHtml = '';
      if (q.passage) {
        passageHtml = `
          <div style="background:#f4f4f4; border-left:3px solid #333; padding:8px 12px; margin:8px 0; font-style:italic; font-size:11pt;">
            <strong>Read the passage and choose the best answer:</strong><br/>
            ${q.passage.replace(/\n/g, '<br/>')}
          </div>
        `;
      }

      const optionsHtml = q.options
        .map(opt => `<td style="padding:4px 8px; width:50%; vertical-align:top; font-size:11.5pt;">${opt}</td>`)
        .reduce((rows, cell, idx) => {
          if (idx % 2 === 0) rows.push(`<tr>${cell}`);
          else rows[rows.length - 1] += `${cell}</tr>`;
          return rows;
        }, [] as string[])
        .join('');

      return `
        <div style="margin-bottom:14px; page-break-inside:avoid;">
          ${passageHtml}
          <div style="font-size:11.5pt; font-weight:bold; margin-bottom:4px;">
            Câu ${q.displayIndex}. <span style="font-weight:normal;">${q.question}</span>
          </div>
          <table style="width:100%; border-collapse:collapse; margin-left:12px;">
            ${optionsHtml}
          </table>
        </div>
      `;
    })
    .join('');

  // Build Written Section HTML
  let writtenHtml = '';
  if (writtenExercises.length > 0) {
    const exercisesHtml = writtenExercises
      .map(w => {
        const rootWordBadge = w.rootWord ? `<strong>(${w.rootWord})</strong>: ` : '';
        return `
          <div style="margin-bottom:14px; page-break-inside:avoid; font-size:11.5pt;">
            <div style="margin-bottom:4px;">
              <strong>Câu ${w.displayIndex}.</strong> ${rootWordBadge}${w.prompt}
            </div>
            <div style="border-bottom:1px dashed #666; height:24px; margin-left:15px; width:95%;"></div>
          </div>
        `;
      })
      .join('');

    writtenHtml = `
      <div style="margin-top:25px; margin-bottom:15px; page-break-inside:avoid;">
        <div style="font-weight:bold; font-size:12.5pt; text-transform:uppercase; margin-bottom:10px; border-bottom:1.5px solid #000; padding-bottom:3px;">
          PHẦN II. TỰ LUẬN (WRITING) - ${writtenExercises.length} CÂU
        </div>
        ${exercisesHtml}
      </div>
    `;
  }

  // Build Answer Key Sheet HTML
  let answerKeySectionHtml = '';
  if (options.includeAnswerKey) {
    const answerTableRows = answerKey
      .map(ak => {
        const expl = options.includeExplanations && ak.explanation ? `<div style="font-size:10pt; color:#555; margin-top:2px;"><em>${ak.explanation}</em></div>` : '';
        return `
          <tr>
            <td style="border:1px solid #333; text-align:center; font-weight:bold; width:50px; font-size:11pt; padding:6px;">Câu ${ak.index}</td>
            <td style="border:1px solid #333; text-align:center; font-weight:black; font-size:12pt; width:60px; color:#002060; padding:6px;">${ak.answerLetter || '-'}</td>
            <td style="border:1px solid #333; font-size:11pt; padding:6px;">
              <strong>${ak.answerText}</strong>
              ${expl}
            </td>
          </tr>
        `;
      })
      .join('');

    answerKeySectionHtml = `
      <div style="page-break-before:always; margin-top:30px;">
        <table style="width:100%; border-collapse:collapse; margin-bottom:15px;">
          <tr>
            <td style="width:40%; text-align:center; font-size:11pt; vertical-align:top;">
              <strong>${options.schoolName || 'TRƯỜNG THCS TIẾNG ANH 8'}</strong><br/>
              <strong>TỔ CHUYÊN MÔN TIẾNG ANH</strong>
            </td>
            <td style="width:60%; text-align:center; font-size:11pt; vertical-align:top;">
              <strong style="font-size:12pt; text-transform:uppercase;">HƯỚNG DẪN CHẤM & ĐÁP ÁN CHI TIẾT</strong><br/>
              <strong>${options.examTitle}</strong><br/>
              <em>MÃ ĐỀ THI: ${options.examCode || '101'}</em>
            </td>
          </tr>
        </table>

        <div style="font-size:11pt; margin-bottom:12px;">
          Tổng số câu hỏi: <strong>${totalQuestions} câu</strong> • Thang điểm: <strong>10.0 điểm</strong> (Mỗi câu tương đương ${(10 / Math.max(1, totalQuestions)).toFixed(2)} điểm).
        </div>

        <table style="width:100%; border-collapse:collapse; border:1.5px solid #000;">
          <thead>
            <tr style="background:#e8eef8;">
              <th style="border:1px solid #333; padding:8px; width:50px; text-align:center; font-size:11pt;">Câu</th>
              <th style="border:1px solid #333; padding:8px; width:60px; text-align:center; font-size:11pt;">Đáp án</th>
              <th style="border:1px solid #333; padding:8px; text-align:left; font-size:11pt;">Nội dung đáp án & Lời giải chi tiết</th>
            </tr>
          </thead>
          <tbody>
            ${answerTableRows}
          </tbody>
        </table>
      </div>
    `;
  }

  return `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${options.examTitle} - Mã đề ${options.examCode}</title>
      <style>
        @page {
          size: 21.0cm 29.7cm;
          margin: 2.0cm 2.0cm 2.0cm 2.5cm;
          mso-header-margin: 1.0cm;
          mso-footer-margin: 1.0cm;
          mso-paper-source: 0;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11.5pt;
          line-height: 1.35;
          color: #000000;
        }
        p { margin: 0 0 6pt 0; }
        .page-break { page-break-before: always; }
      </style>
    </head>
    <body>
      <!-- HEADER EXAM BLOCK -->
      <table style="width:100%; border-collapse:collapse; margin-bottom:12px;">
        <tr>
          <td style="width:45%; text-align:center; font-size:11pt; vertical-align:top; line-height:1.4;">
            <span style="font-size:10.5pt; text-transform:uppercase;">PHÒNG GD&ĐT HUYỆN/QUẬN</span><br/>
            <strong style="text-transform:uppercase; font-size:11pt;">${options.schoolName || 'TRƯỜNG THCS ENGLISH YOUNG 8'}</strong><br/>
            <span style="font-size:10.5pt;">NĂM HỌC ${options.schoolYear || '2026 - 2027'}</span><br/>
            <div style="border-bottom:1px solid #000; width:80px; margin:4px auto;"></div>
          </td>
          <td style="width:55%; text-align:center; font-size:11pt; vertical-align:top; line-height:1.4;">
            <strong style="text-transform:uppercase; font-size:12pt;">${options.examTitle || 'BÀI KIỂM TRA ĐỊNH KỲ TIẾNG ANH 8'}</strong><br/>
            <span>Môn: <strong>TIẾNG ANH 8 (GLOBAL SUCCESS)</strong></span><br/>
            <span>Thời gian làm bài: <strong>${options.durationMinutes} phút</strong> <em>(Không kể thời gian phát đề)</em></span><br/>
            <div style="margin-top:4px; font-weight:bold; font-size:11pt; border:1px solid #000; display:inline-block; padding:2px 10px;">
              MÃ ĐỀ THI: ${options.examCode || '101'}
            </div>
          </td>
        </tr>
      </table>

      <!-- STUDENT INFO AND SCORE BOX -->
      <table style="width:100%; border-collapse:collapse; margin-bottom:15px; border:1px solid #000;">
        <tr>
          <td style="width:65%; padding:8px 12px; font-size:11pt; vertical-align:middle; line-height:1.8;">
            Họ và tên thí sinh: ............................................................................ Lớp: <strong>${options.gradeClass || '8A...'}</strong><br/>
            Số báo danh: ........................................... Phòng thi số: ....................................
          </td>
          <td style="width:35%; border-left:1px solid #000; text-align:center; font-size:10pt; padding:6px; vertical-align:top;">
            <strong>ĐIỂM SỐ</strong><br/><br/>
            <div style="height:35px;"></div>
            <em>(Ký và ghi rõ họ tên GV chấm)</em>
          </td>
        </tr>
      </table>

      ${answerGridHtml}

      <!-- EXAM INSTRUCTIONS -->
      <div style="font-style:italic; font-size:10.5pt; margin-bottom:14px; border-bottom:1px solid #ccc; padding-bottom:4px;">
        * Thí sinh không được sử dụng từ điển hoặc bất kỳ tài liệu tham khảo nào trong phòng thi.
      </div>

      <!-- PART I. MULTIPLE CHOICE QUESTIONS -->
      <div style="margin-bottom:10px;">
        <div style="font-weight:bold; font-size:12pt; text-transform:uppercase; margin-bottom:10px;">
          PHẦN I. TRẮC NGHIỆM KHÁCH QUAN (${mcqQuestions.length} CÂU)
        </div>
        ${mcqsHtml}
      </div>

      <!-- PART II. WRITTEN EXERCISES (IF ANY) -->
      ${writtenHtml}

      <div style="text-align:center; font-weight:bold; margin-top:25px; margin-bottom:20px; font-size:11pt;">
        --- HẾT ---<br/>
        <em style="font-weight:normal; font-size:10pt;">(Cán bộ coi thi không giải thích gì thêm)</em>
      </div>

      <!-- ANSWER KEY SECTION (IF ENABLED) -->
      ${answerKeySectionHtml}
    </body>
    </html>
  `;
}

/**
 * Trigger download of the test paper as an editable Word Document (.doc)
 */
export function downloadTestPaperAsWord(paper: GeneratedTestPaper): void {
  const htmlContent = buildWordDocumentHtml(paper);
  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8'
  });

  const sanitizedTitle = (paper.options.examTitle || 'De_Thi_Tieng_Anh_8')
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '_');
  const filename = `${sanitizedTitle}_MaDe_${paper.options.examCode || '101'}.doc`;

  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(downloadLink.href);
}
