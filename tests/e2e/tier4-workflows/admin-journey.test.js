/**
 * Tier 4: Real-World Admin Workflows
 * End-to-end administrative user journeys:
 * - Journey 3: Admin Management & Supervision Workflow (Login -> Monitor -> Inspect Attempt -> Assign Homework -> Add Question -> Cloud Sync -> Preview)
 */

import { describe, it, assert } from '../harness/test-engine.js';
import { createAppSession } from '../harness/test-context.js';

describe('Tier 4: Real-World Admin Workflows & User Journeys', () => {

  describe('Journey 3: Administrative Management & Homework Distribution Workflow', () => {
    it('W2.1: Full administrative supervision, student monitoring, assignment distribution, and question creation', () => {
      // Step 1: Admin logs in with administrative credentials
      const adminSession = createAppSession({ username: 'admin', role: 'admin' });
      assert.strictEqual(adminSession.role, 'admin');

      // Admin navigates to Admin Portal
      adminSession.navigate('#/admin');
      assert.ok(adminSession.hasElement('.admin-view'));
      assert.ok(adminSession.getText('.admin-header').includes('Cổng Quản Trị'));

      // Step 2: Admin monitors student progress
      adminSession.selectedStudentUsername = 'em_lop8';
      // Seed student data in shared storage
      adminSession.setStorage('ey8_learned_vocab_v1_em_lop8', ['u1-v1', 'u1-v2', 'u1-v3']);
      adminSession.setStorage('ey8_unit_scores_v1_em_lop8', { 1: 9.17 });
      adminSession.setStorage('ey8_exam_history_v1_em_lop8', [
        {
          id: 'att_001',
          examId: 'exam-15m-1',
          score: 8.5,
          timeSpentSeconds: 400,
          answersDetails: [
            { questionId: 'u1-q1', question: { question: 'Q1' }, isCorrect: true },
            { questionId: 'u1-q2', question: { question: 'Q2' }, isCorrect: false }
          ]
        }
      ]);

      const studentVocab = adminSession.getStorage('ey8_learned_vocab_v1_em_lop8');
      assert.strictEqual(studentVocab.length, 3);

      const studentScores = adminSession.getStorage('ey8_unit_scores_v1_em_lop8');
      assert.strictEqual(studentScores[1], 9.17);

      // Step 3: Admin inspects student's past attempt details
      const studentHistory = adminSession.getStorage('ey8_exam_history_v1_em_lop8');
      const latestAttempt = studentHistory[0];
      assert.strictEqual(latestAttempt.score, 8.5);
      assert.strictEqual(latestAttempt.answersDetails.length, 2);

      // Step 4: Admin creates Homework Assignment for em_lop8
      const assignment = adminSession.createAssignment({
        studentUsername: 'em_lop8',
        targetExamId: 'exam-midterm-1',
        title: 'Chinh phục Đề Giữa Kì 1 (≥ 8.5đ)',
        minScore: 8.5,
        dueDate: 'Chủ nhật tuần này',
        note: 'Em dành trọn 45 phút làm bài nghiêm túc nhé!'
      });

      assert.ok(assignment.id);
      assert.strictEqual(assignment.status, 'pending');
      assert.strictEqual(adminSession.getAssignments().length, 1);

      // Step 5: Admin adds a custom question to the question bank
      const customQ = adminSession.createCustomQuestion({
        unitId: 'unit-1',
        section: 'Teacher Challenge: Pronunciation',
        question: 'Choose the word whose underlined part is pronounced differently:',
        options: ['A. book', 'B. cook', 'C. school', 'D. foot'],
        answer: 2,
        explanation: 'school has /uː/, others have /ʊ/'
      });

      assert.ok(customQ.id);
      const customList = adminSession.getStorage('ey8_system_config_v1').customQuestions;
      assert.ok(customList.some(q => q.id === customQ.id));

      // Step 6: Admin configures Supabase Cloud Settings
      const cfg = adminSession.getStorage('ey8_system_config_v1');
      cfg.supabaseUrl = 'https://englishyoung8-lms.supabase.co';
      cfg.supabaseAnonKey = 'ey8-public-anon-key-v3';
      adminSession.setStorage('ey8_system_config_v1', cfg);

      const updatedCfg = adminSession.getStorage('ey8_system_config_v1');
      assert.strictEqual(updatedCfg.supabaseUrl, 'https://englishyoung8-lms.supabase.co');

      // Step 7: Admin previews student perspective ("Góc nhìn Học sinh")
      adminSession.navigate('#/dashboard');
      assert.ok(adminSession.hasElement('.dashboard-view'));
      assert.strictEqual(adminSession.role, 'admin', 'Role remains admin while previewing student dashboard');
    });
  });
});
