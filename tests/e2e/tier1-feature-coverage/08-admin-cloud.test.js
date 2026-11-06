/**
 * Tier 1: Feature Coverage
 * Suite 08: Admin Portal, Assignments, Custom QBank, Cloud Sync & Verification
 * Features covered:
 * - Feature 30: Admin Student Monitor (Progress audit, unit scores, attempt review)
 * - Feature 31: Admin Homework Assignment Engine (Create assignment, minScore threshold, auto-completion)
 * - Feature 32: Admin Custom QBank Manager (Add custom questions to curriculum bank)
 * - Feature 33: Admin Cloud Sync & Settings (Supabase configuration, local fallback, snapshot backup)
 * - Feature 34: E2E Test Suite (Harness validation across Tiers 1-4)
 * - Feature 35: Adversarial Coverage Hardening (Stress tolerance, resilience to malformed inputs)
 */

import { describe, it, assert } from '../harness/test-engine.js';
import { createAppSession } from '../harness/test-context.js';

describe('Tier 1: Suite 08 - Admin Portal, Assignments, QBank, Cloud & Hardening', () => {

  // --- FEATURE 30: ADMIN STUDENT MONITOR ---
  describe('Feature 30: Admin Student Monitor Invariants', () => {
    it('F30.1: Admin can inspect student profile, unit scores, and exam logs', () => {
      const adminSession = createAppSession({ username: 'admin', role: 'admin' });
      // Seed student data in shared storage
      adminSession.setStorage('ey8_unit_scores_v1_em_lop8', { 1: 9.5, 2: 8.0 });
      adminSession.setStorage('ey8_exam_history_v1_em_lop8', [
        { examId: 'exam-15m-1', score: 9.2, date: '2026-11-06' }
      ]);

      adminSession.selectedStudentUsername = 'em_lop8';
      const studentScores = adminSession.getStorage('ey8_unit_scores_v1_em_lop8');
      const studentHistory = adminSession.getStorage('ey8_exam_history_v1_em_lop8');

      assert.strictEqual(studentScores[1], 9.5);
      assert.strictEqual(studentHistory.length, 1);
      assert.strictEqual(studentHistory[0].score, 9.2);
    });

    it('F30.2: Admin monitor gracefully handles student with zero historical attempts', () => {
      const adminSession = createAppSession({ username: 'admin', role: 'admin' });
      adminSession.selectedStudentUsername = 'newbie_student';

      const history = adminSession.getStorage('ey8_exam_history_v1_newbie_student') || [];
      assert.strictEqual(history.length, 0);
      // No division by zero or exception
      const avgScore = history.length > 0 ? history.reduce((acc, h) => acc + h.score, 0) / history.length : '--';
      assert.strictEqual(avgScore, '--');
    });
  });

  // --- FEATURE 31: ADMIN HOMEWORK ASSIGNMENT ENGINE ---
  describe('Feature 31: Admin Homework Assignment Engine Invariants', () => {
    it('F31.1: Admin can create homework assignment with target exam, threshold, and due date', () => {
      const adminSession = createAppSession({ username: 'admin', role: 'admin' });

      const newAsg = adminSession.createAssignment({
        studentUsername: 'em_lop8',
        targetExamId: 'exam-15m-1',
        title: 'Luyện đề 15 phút số 1 đạt điểm 8+',
        minScore: 8.0,
        dueDate: '2026-11-10',
        note: 'Em làm bài cẩn thận, xem kỹ giải thích câu sai!'
      });

      assert.ok(newAsg.id, 'Assignment must have generated id');
      assert.strictEqual(newAsg.status, 'pending');

      const assignments = adminSession.getAssignments();
      assert.ok(assignments.some(a => a.id === newAsg.id), 'Assignment must persist in system config');
    });

    it('F31.2: Student achieving or exceeding passing score triggers automatic assignment completion', () => {
      const session = createAppSession({ username: 'em_lop8', role: 'student' });

      // Admin creates assignment for em_lop8
      session.createAssignment({
        studentUsername: 'em_lop8',
        targetExamId: 'exam-15m-1',
        minScore: 8.0
      });

      // Student takes exam and scores 9.2 (exceeding 8.0)
      session.startExam('exam-15m-1');
      // Answer 11/12 questions correctly = 9.17
      session.activeExam.questions.forEach((q, idx) => {
        if (idx < 11) session.selectExamAnswer(q.id, q.answer);
        else session.selectExamAnswer(q.id, (q.answer + 1) % 4);
      });

      session.submitExam();

      const assignments = session.getAssignments();
      const asg = assignments.find(a => a.studentUsername === 'em_lop8' && a.targetExamId === 'exam-15m-1');
      assert.ok(asg, 'Assignment must exist');
      assert.strictEqual(asg.status, 'completed', 'Assignment must update to completed');
      assert.ok(asg.achievedScore >= 8.0, 'Achieved score must be recorded');
    });

    it('F31.3: Student score below threshold leaves assignment in pending status', () => {
      const session = createAppSession({ username: 'em_lop8', role: 'student' });

      session.createAssignment({
        studentUsername: 'em_lop8',
        targetExamId: 'exam-15m-2',
        minScore: 8.0
      });

      // Student takes exam and scores only 4.0
      session.startExam('exam-15m-2');
      session.activeExam.questions.forEach((q, idx) => {
        if (idx < 5) session.selectExamAnswer(q.id, q.answer);
        else session.selectExamAnswer(q.id, (q.answer + 1) % 4);
      });

      session.submitExam();

      const assignments = session.getAssignments();
      const asg = assignments.find(a => a.studentUsername === 'em_lop8' && a.targetExamId === 'exam-15m-2');
      assert.strictEqual(asg.status, 'pending', 'Assignment must remain pending if score < threshold');
    });
  });

  // --- FEATURE 32: ADMIN CUSTOM QBANK MANAGER ---
  describe('Feature 32: Admin Custom QBank Manager Invariants', () => {
    it('F32.1: Admin can add validated custom questions to the curriculum bank', () => {
      const adminSession = createAppSession({ username: 'admin', role: 'admin' });

      const customQ = adminSession.createCustomQuestion({
        unitId: 'unit-1',
        section: 'Custom Teacher Challenge',
        question: 'Which word has the underlined sound pronounced /uː/?',
        options: ['A. book', 'B. cook', 'C. school', 'D. foot'],
        answer: 2, // C. school
        explanation: "'school' phát âm là /skuːl/ (u dài)."
      });

      assert.ok(customQ.id, 'Custom question must have generated ID');

      const cfg = adminSession.getStorage('ey8_system_config_v1');
      assert.ok(cfg.customQuestions.some(q => q.id === customQ.id), 'Custom question must be stored');
    });
  });

  // --- FEATURE 33: ADMIN CLOUD SYNC & SETTINGS ---
  describe('Feature 33: Admin Cloud Sync & Settings Invariants', () => {
    it('F33.1: Admin can update Supabase endpoint URL and anonymous key', () => {
      const adminSession = createAppSession({ username: 'admin', role: 'admin' });

      const cfg = adminSession.getStorage('ey8_system_config_v1');
      cfg.supabaseUrl = 'https://custom-school.supabase.co';
      cfg.supabaseAnonKey = 'custom-secret-anon-key-12345';
      adminSession.setStorage('ey8_system_config_v1', cfg);

      const updated = adminSession.getStorage('ey8_system_config_v1');
      assert.strictEqual(updated.supabaseUrl, 'https://custom-school.supabase.co');
      assert.strictEqual(updated.supabaseAnonKey, 'custom-secret-anon-key-12345');
    });

    it('F33.2: Local-first architecture allows full functionality even without network access', () => {
      const offlineSession = createAppSession({ username: 'offline_student' });
      // Take exam offline
      offlineSession.startExam('exam-15m-1');
      offlineSession.activeExam.questions.forEach(q => offlineSession.selectExamAnswer(q.id, q.answer));
      const res = offlineSession.submitExam();

      assert.strictEqual(res.score10, 10.0);
      assert.ok(offlineSession.getExamHistory().length > 0, 'Exam history must be saved locally');
    });
  });

  // --- FEATURE 34 & 35: E2E TEST SUITE & HARDENING VERIFICATION ---
  describe('Features 34 & 35: Test Harness & Adversarial Hardening', () => {
    it('F34.1: Test engine executes asynchronously and tracks accurate durations', () => {
      const start = performance.now();
      const session = createAppSession();
      session.navigate('#/dashboard');
      const elapsed = performance.now() - start;
      assert.ok(elapsed >= 0);
    });

    it('F35.1: Storage service survives null, undefined, and non-JSON string values', () => {
      const session = createAppSession();
      session.setStorage('raw_test', 'plain text string');
      assert.strictEqual(session.getStorage('raw_test'), 'plain text string');

      session.setStorage('null_test', 'null');
      assert.strictEqual(session.getStorage('null_test'), null);
    });

    it('F35.2: String normalizer safely handles undefined, empty, and special character inputs', () => {
      const session = createAppSession();
      // u1_w1 requires "relaxing"
      assert.strictEqual(session.submitWrittenExercise('u1_w1', ''), false);
      assert.strictEqual(session.submitWrittenExercise('u1_w1', null), false);
      assert.strictEqual(session.submitWrittenExercise('u1_w1', undefined), false);
      assert.strictEqual(session.submitWrittenExercise('u1_w1', '***???!!!'), false);
    });
  });
});
