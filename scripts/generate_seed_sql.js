const fs = require('fs');
const path = require('path');

// Mock window and document for data files
global.window = {};

// Load data files
require(path.join(__dirname, '../data/units_1_3.js'));
require(path.join(__dirname, '../data/units_4_6.js'));
require(path.join(__dirname, '../data/exams_hk1.js'));

const units = global.window.STUDY_DATA.units;
const exams = global.window.STUDY_DATA.exams;

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

let sql = `-- ==============================================================================
-- SEED DATA: TIẾNG ANH 8 GLOBAL SUCCESS (HỌC KÌ 1: UNIT 1 - UNIT 6 + 6 ĐỀ KIỂM TRA)
-- Chạy sau khi đã chạy schema.sql
-- ==============================================================================

-- 1. GRADES
INSERT INTO grades (id, name, level) VALUES
('grade-8', 'Lớp 8', 8)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. SUBJECTS
INSERT INTO subjects (id, name, code, icon) VALUES
('english', 'Tiếng Anh', 'ENG', '🇬🇧'),
('math', 'Toán', 'MATH', '📐'),
('science', 'Khoa học tự nhiên', 'SCI', '🧪'),
('literature', 'Ngữ văn', 'LIT', '📖')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

-- 3. TEXTBOOK SERIES
INSERT INTO textbook_series (id, name, publisher) VALUES
('global-success', 'Global Success (Kết nối tri thức)', 'NXB Giáo Dục Việt Nam'),
('canh-dieu', 'Cánh Diều', 'NXB Đại Học Sư Phạm'),
('chan-troi-sang-tao', 'Chân Trời Sáng Tạo', 'NXB Giáo Dục Việt Nam')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 4. COURSES
INSERT INTO courses (id, grade_id, subject_id, series_id, title, description) VALUES
('course-eng-8-gs', 'grade-8', 'english', 'global-success', 'Tiếng Anh 8 - Global Success', 'Chương trình ôn tập & luyện thi Tiếng Anh 8 GDPT mới')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- 5. DEFAULT STUDENT PROFILE
INSERT INTO users (id, username, full_name, role, pin_code, streak_days) VALUES
('a0000000-0000-0000-0000-000000000001', 'em_lop8', 'Học Sinh Lớp 8', 'student', '1234', 1)
ON CONFLICT (username) DO UPDATE SET full_name = EXCLUDED.full_name;

`;

// 6. UNITS & LESSONS
sql += `-- 6. UNITS & LESSONS\n`;
for (const u of units) {
  sql += `INSERT INTO units (id, course_id, unit_number, semester, title, vi_title, summary, icon, color) VALUES\n`;
  sql += `(${escapeSql(u.id)}, 'course-eng-8-gs', ${u.number}, ${u.semester || 1}, ${escapeSql(u.title)}, ${escapeSql(u.viTitle)}, ${escapeSql(u.summary)}, ${escapeSql(u.icon)}, ${escapeSql(u.color)})\n`;
  sql += `ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, vi_title = EXCLUDED.vi_title, summary = EXCLUDED.summary;\n\n`;

  // Lessons
  const vocabLessonId = `${u.id}-lesson-vocab`;
  const grammarLessonId = `${u.id}-lesson-grammar`;
  const quizLessonId = `${u.id}-lesson-quiz`;

  sql += `INSERT INTO lessons (id, unit_id, title, lesson_type, order_index) VALUES\n`;
  sql += `(${escapeSql(vocabLessonId)}, ${escapeSql(u.id)}, ${escapeSql('Từ vựng & Ngữ âm ' + u.title)}, 'vocabulary', 1),\n`;
  sql += `(${escapeSql(grammarLessonId)}, ${escapeSql(u.id)}, ${escapeSql('Ngữ pháp trọng tâm ' + u.title)}, 'grammar', 2),\n`;
  sql += `(${escapeSql(quizLessonId)}, ${escapeSql(u.id)}, ${escapeSql('Bài tập củng cố ' + u.title)}, 'practice', 3)\n`;
  sql += `ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;\n\n`;

  // Vocabulary
  if (u.vocabulary && u.vocabulary.length > 0) {
    sql += `-- VOCABULARY FOR ${u.id.toUpperCase()}\n`;
    sql += `INSERT INTO vocabulary (id, unit_id, lesson_id, word, ipa, word_type, meaning, example, example_vi, tip, order_index) VALUES\n`;
    const vRows = u.vocabulary.map((v, idx) => {
      return `(${escapeSql(v.id)}, ${escapeSql(u.id)}, ${escapeSql(vocabLessonId)}, ${escapeSql(v.word)}, ${escapeSql(v.ipa)}, ${escapeSql(v.type)}, ${escapeSql(v.meaning)}, ${escapeSql(v.example)}, ${escapeSql(v.exampleVi)}, ${escapeSql(v.tip)}, ${idx + 1})`;
    });
    sql += vRows.join(',\n') + '\nON CONFLICT (id) DO UPDATE SET meaning = EXCLUDED.meaning, example = EXCLUDED.example, tip = EXCLUDED.tip;\n\n';
  }

  // Grammar
  if (u.grammar && u.grammar.length > 0) {
    sql += `-- GRAMMAR FOR ${u.id.toUpperCase()}\n`;
    sql += `INSERT INTO grammar_topics (id, unit_id, lesson_id, topic_title, formula, explanation, exam_traps, order_index) VALUES\n`;
    const gRows = u.grammar.map((g, idx) => {
      const gId = g.id || `u${u.number}-g${idx + 1}`;
      const formula = g.formula || null;
      const explanation = g.explanation || (Array.isArray(g.rules) ? g.rules.join('\n') : null);
      const examTraps = g.examTrap || (Array.isArray(g.examTips) ? g.examTips.join('\n') : null);
      return `(${escapeSql(gId)}, ${escapeSql(u.id)}, ${escapeSql(grammarLessonId)}, ${escapeSql(g.title)}, ${escapeSql(formula)}, ${escapeSql(explanation)}, ${escapeSql(examTraps)}, ${idx + 1})`;
    });
    sql += gRows.join(',\n') + '\nON CONFLICT (id) DO UPDATE SET topic_title = EXCLUDED.topic_title, explanation = EXCLUDED.explanation, formula = EXCLUDED.formula, exam_traps = EXCLUDED.exam_traps;\n\n';
  }

  // Unit Practice Quiz (Exercise)
  const practiceList = u.practice || u.practiceQuiz;
  if (practiceList && practiceList.length > 0) {
    const quizExId = `quiz-${u.id}`;
    sql += `-- EXERCISE (PRACTICE QUIZ) FOR ${u.id.toUpperCase()}\n`;
    sql += `INSERT INTO exercises (id, course_id, unit_id, lesson_id, title, category, badge, duration_minutes, scope, description) VALUES\n`;
    sql += `(${escapeSql(quizExId)}, 'course-eng-8-gs', ${escapeSql(u.id)}, ${escapeSql(quizLessonId)}, ${escapeSql('Bài tập củng cố ' + u.title)}, 'unit_quiz', 'Luyện tập', 15, ${escapeSql('Kiến thức ' + u.title)}, '12 câu trắc nghiệm kiểm tra từ vựng, ngữ pháp và phát âm')\n`;
    sql += `ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;\n\n`;

    // Questions & Options
    for (let qIdx = 0; qIdx < practiceList.length; qIdx++) {
      const q = practiceList[qIdx];
      sql += `INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES\n`;
      sql += `(${escapeSql(q.id)}, ${escapeSql(quizExId)}, 'Trắc nghiệm củng cố', ${escapeSql(q.question)}, ${escapeSql(q.explanation)}, ${qIdx + 1})\n`;
      sql += `ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;\n`;

      if (q.options && q.options.length > 0) {
        sql += `INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES\n`;
        const optRows = q.options.map((opt, oIdx) => {
          const optId = `${q.id}_opt_${oIdx}`;
          const isCorrect = (oIdx === q.answer);
          return `(${escapeSql(optId)}, ${escapeSql(q.id)}, ${oIdx}, ${escapeSql(opt)}, ${isCorrect ? 'TRUE' : 'FALSE'})`;
        });
        sql += optRows.join(',\n') + '\nON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;\n';
      }
      sql += '\n';
    }
  }
}

// 7. EXAMS (15M, MIDTERM, FINAL)
sql += `-- ==============================================================================\n`;
sql += `-- 7. EXAMS (15 PHÚT, GIỮA KÌ 1, CUỐI KÌ 1)\n`;
sql += `-- ==============================================================================\n`;

for (const ex of exams) {
  sql += `INSERT INTO exercises (id, course_id, unit_id, lesson_id, title, category, badge, duration_minutes, scope, description) VALUES\n`;
  sql += `(${escapeSql(ex.id)}, 'course-eng-8-gs', NULL, NULL, ${escapeSql(ex.title)}, ${escapeSql(ex.category)}, ${escapeSql(ex.badge)}, ${ex.durationMinutes}, ${escapeSql(ex.scope)}, ${escapeSql(ex.description)})\n`;
  sql += `ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;\n\n`;

  for (let qIdx = 0; qIdx < ex.questions.length; qIdx++) {
    const q = ex.questions[qIdx];
    sql += `INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES\n`;
    sql += `(${escapeSql(q.id)}, ${escapeSql(ex.id)}, ${escapeSql(q.section)}, ${escapeSql(q.question)}, ${escapeSql(q.explanation)}, ${qIdx + 1})\n`;
    sql += `ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;\n`;

    if (q.options && q.options.length > 0) {
      sql += `INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES\n`;
      const optRows = q.options.map((opt, oIdx) => {
        const optId = `${q.id}_opt_${oIdx}`;
        const isCorrect = (oIdx === q.answer);
        return `(${escapeSql(optId)}, ${escapeSql(q.id)}, ${oIdx}, ${escapeSql(opt)}, ${isCorrect ? 'TRUE' : 'FALSE'})`;
      });
      sql += optRows.join(',\n') + '\nON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;\n';
    }
    sql += '\n';
  }
}

fs.writeFileSync(path.join(__dirname, '../supabase/seed_data.sql'), sql, 'utf8');
console.log('Seed SQL generated successfully!');
