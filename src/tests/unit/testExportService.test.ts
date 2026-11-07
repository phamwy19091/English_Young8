import { describe, it, expect } from 'vitest';
import {
  generateTestPaper,
  buildWordDocumentHtml,
  TestGeneratorOptions
} from '../../services/testExportService';

describe('Test Generator & Export Service', () => {
  const defaultOptions: TestGeneratorOptions = {
    schoolName: 'TRƯỜNG THCS NGUYỄN DU',
    examTitle: 'BÀI KIỂM TRA ĐỊNH KỲ TIẾNG ANH 8',
    gradeClass: '8A1',
    schoolYear: '2026 - 2027',
    durationMinutes: 45,
    examCode: '101',
    unitScope: 'all',
    categoryScope: 'all',
    mcqCount: 20,
    includeWritten: true,
    writtenCount: 4,
    shuffleQuestions: true,
    shuffleOptions: true,
    includeAnswerKey: true,
    includeExplanations: true,
    includeAnswerGrid: true,
  };

  it('1. should generate test paper with requested question counts', () => {
    const paper = generateTestPaper(defaultOptions);
    expect(paper).toBeDefined();
    expect(paper.id).toContain('test_');
    expect(paper.mcqQuestions).toHaveLength(20);
    expect(paper.writtenExercises).toHaveLength(4);
    expect(paper.answerKey).toHaveLength(24);
  });

  it('2. should properly number questions consecutively', () => {
    const paper = generateTestPaper(defaultOptions);
    paper.mcqQuestions.forEach((q, idx) => {
      expect(q.displayIndex).toBe(idx + 1);
    });
    paper.writtenExercises.forEach((w, idx) => {
      expect(w.displayIndex).toBe(paper.mcqQuestions.length + idx + 1);
    });
  });

  it('3. should generate valid answer key with letters A-D and explanations', () => {
    const paper = generateTestPaper(defaultOptions);
    const mcqKeys = paper.answerKey.filter(ak => ak.type === 'mcq');
    expect(mcqKeys).toHaveLength(20);
    mcqKeys.forEach(k => {
      expect(['A', 'B', 'C', 'D']).toContain(k.answerLetter);
      expect(k.answerText).toBeTruthy();
    });
  });

  it('4. should filter by unit scope when specified', () => {
    const unit1Options: TestGeneratorOptions = {
      ...defaultOptions,
      unitScope: 'unit-1',
      mcqCount: 12,
      includeWritten: false,
    };
    const paper = generateTestPaper(unit1Options);
    expect(paper.mcqQuestions).toHaveLength(12);
    // All questions should be from unit 1
    paper.mcqQuestions.forEach(q => {
      expect(q.id).toMatch(/^u1-/);
    });
  });

  it('5. should filter by category scope (pronunciation)', () => {
    const pronOptions: TestGeneratorOptions = {
      ...defaultOptions,
      categoryScope: 'pronunciation',
      mcqCount: 10,
      includeWritten: false,
    };
    const paper = generateTestPaper(pronOptions);
    expect(paper.mcqQuestions.length).toBeGreaterThan(0);
    paper.mcqQuestions.forEach(q => {
      const isPron =
        (q.section || '').toLowerCase().includes('pronunciation') ||
        (q.section || '').toLowerCase().includes('ngữ âm') ||
        (q.question || '').toLowerCase().includes('pronounced') ||
        (q.question || '').toLowerCase().includes('stress');
      expect(isPron).toBe(true);
    });
  });

  it('6. should construct valid Word document HTML with headers and answer grid', () => {
    const paper = generateTestPaper(defaultOptions);
    const html = buildWordDocumentHtml(paper);

    expect(html).toContain('urn:schemas-microsoft-com:office:word');
    expect(html).toContain(defaultOptions.schoolName);
    expect(html).toContain(defaultOptions.examTitle);
    expect(html).toContain('MÃ ĐỀ THI: 101');
    expect(html).toContain('BẢNG ĐIỀN ĐÁP ÁN TRẮC NGHIỆM');
    expect(html).toContain('PHẦN I. TRẮC NGHIỆM KHÁCH QUAN');
    expect(html).toContain('PHẦN II. TỰ LUẬN (WRITING)');
    expect(html).toContain('HƯỚNG DẪN CHẤM & ĐÁP ÁN CHI TIẾT');
  });

  it('7. should exclude answer key when includeAnswerKey is false', () => {
    const noKeyOptions: TestGeneratorOptions = {
      ...defaultOptions,
      includeAnswerKey: false,
      includeAnswerGrid: false,
    };
    const paper = generateTestPaper(noKeyOptions);
    const html = buildWordDocumentHtml(paper);

    expect(html).not.toContain('HƯỚNG DẪN CHẤM & ĐÁP ÁN CHI TIẾT');
    expect(html).not.toContain('BẢNG ĐIỀN ĐÁP ÁN TRẮC NGHIỆM');
  });

  it('8. should support custom questions from QBank', () => {
    const customQ = [
      {
        id: 'cust-1',
        section: 'Custom Grammar',
        question: 'Custom question prompt test?',
        options: ['A. one', 'B. two', 'C. three', 'D. four'],
        answer: 1,
        explanation: 'Custom explanation'
      }
    ];

    const paper = generateTestPaper({ ...defaultOptions, unitScope: 'all', mcqCount: 50 }, customQ);
    const foundCustom = paper.mcqQuestions.some(q => q.id === 'cust-1');
    expect(foundCustom).toBe(true);
  });
});
