// ==============================================================================
// SUPABASE CLIENT & CLOUD SYNC MODULE - ENGLISH YOUNG 8
// ==============================================================================
(function () {
  const DEFAULT_PROJECT_REF = "iiltwryccctzjbfddjcw";
  const DEFAULT_SUPABASE_URL = `https://${DEFAULT_PROJECT_REF}.supabase.co`;
  const DEFAULT_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpbHR3cnljY2N0empiZmRkamN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyNzMxMTgsImV4cCI6MjEwODg0OTExOH0.6hJjVxbdeFrCyvd-VN_U_rJY-jqAFIY7WbqRZLv6axo";
  const STORAGE_KEY_ANON = "ey8_supabase_anon_key";
  const STORAGE_KEY_URL = "ey8_supabase_url";
  const STORAGE_KEY_STUDENT = "ey8_current_student";

  // Thông tin cấu hình: Luôn ưu tiên dùng key đã nhúng sẵn, em chỉ việc vào học
  const config = {
    url: localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_SUPABASE_URL,
    anonKey: localStorage.getItem(STORAGE_KEY_ANON) || DEFAULT_ANON_KEY,
    currentStudent: JSON.parse(
      localStorage.getItem(STORAGE_KEY_STUDENT) ||
        JSON.stringify({
          id: "a0000000-0000-0000-0000-000000000001",
          username: "em_lop8",
          fullName: "Học Sinh Lớp 8",
          role: "student"
        })
    )
  };

  let client = null;
  let isConnected = false;

  function initClient() {
    if (window.supabase && config.url && config.anonKey) {
      try {
        client = window.supabase.createClient(config.url, config.anonKey);
        isConnected = true;
      } catch (e) {
        console.warn("Supabase init error:", e);
        client = null;
        isConnected = false;
      }
    } else {
      client = null;
      isConnected = false;
    }
  }

  // Khởi tạo ngay khi nạp script
  initClient();

  window.EY8_Supabase = {
    getConfig: () => ({ ...config, isConnected: !!client }),

    saveConfig: (newUrl, newAnonKey) => {
      config.url = (newUrl || DEFAULT_SUPABASE_URL).trim();
      config.anonKey = (newAnonKey || "").trim();
      localStorage.setItem(STORAGE_KEY_URL, config.url);
      localStorage.setItem(STORAGE_KEY_ANON, config.anonKey);
      initClient();
      return isConnected;
    },

    getCurrentStudent: () => config.currentStudent,

    setCurrentStudent: (studentObj) => {
      config.currentStudent = { ...config.currentStudent, ...studentObj };
      localStorage.setItem(STORAGE_KEY_STUDENT, JSON.stringify(config.currentStudent));
    },

    testConnection: async () => {
      if (!client) return { ok: false, message: "Chưa cấu hình Anon Key" };
      try {
        const { data, error } = await client.from("subjects").select("id, name").limit(1);
        if (error) throw error;
        return { ok: true, data };
      } catch (err) {
        return { ok: false, message: err.message || "Không thể kết nối tới Supabase" };
      }
    },

    // 1. Đồng bộ tiến độ từ vựng (Study Progress)
    syncVocabProgress: async (vocabId, unitId, status, reviewCount = 1) => {
      if (!client) return null;
      const studentId = config.currentStudent.id;
      try {
        const { data, error } = await client.from("study_progress").upsert(
          {
            user_id: studentId,
            vocabulary_id: vocabId,
            unit_id: unitId,
            status: status, // 'mastered' | 'learning'
            review_count: reviewCount,
            updated_at: new Date().toISOString()
          },
          { onConflict: "user_id,vocabulary_id" }
        );
        if (error) console.warn("Supabase syncVocabProgress warning:", error);
        return data;
      } catch (e) {
        console.warn("Sync error:", e);
        return null;
      }
    },

    // 2. Lưu kết quả bài làm kiểm tra (Quiz Attempts & Attempt Answers)
    recordQuizAttempt: async (attemptData) => {
      if (!client) return null;
      const studentId = config.currentStudent.id;
      try {
        // 2.1 Tạo lượt làm bài (quiz_attempts)
        const { data: attempt, error: attemptErr } = await client
          .from("quiz_attempts")
          .insert({
            user_id: studentId,
            exercise_id: attemptData.exerciseId,
            score: attemptData.score,
            raw_score: attemptData.rawScore,
            total_questions: attemptData.totalQuestions,
            time_spent_seconds: attemptData.timeSpentSeconds,
            completed_at: new Date().toISOString()
          })
          .select("id")
          .single();

        if (attemptErr) {
          console.warn("Supabase recordQuizAttempt error:", attemptErr);
          return null;
        }

        // 2.2 Lưu chi tiết từng câu trả lời (attempt_answers)
        if (attempt && attempt.id && Array.isArray(attemptData.answers)) {
          const answerRows = attemptData.answers.map((ans) => ({
            attempt_id: attempt.id,
            question_id: ans.questionId,
            selected_option_index: ans.selectedOptionIndex,
            is_correct: ans.isCorrect
          }));

          const { error: ansErr } = await client.from("attempt_answers").insert(answerRows);
          if (ansErr) console.warn("Supabase attempt_answers insert error:", ansErr);
        }

        return attempt;
      } catch (e) {
        console.warn("recordQuizAttempt exception:", e);
        return null;
      }
    },

    // 3. Tải toàn bộ lịch sử và tiến độ của học sinh từ Supabase
    fetchCloudStudentData: async () => {
      if (!client) return null;
      const studentId = config.currentStudent.id;
      try {
        const [progRes, attemptsRes] = await Promise.all([
          client.from("study_progress").select("*").eq("user_id", studentId),
          client
            .from("quiz_attempts")
            .select(`
              id,
              exercise_id,
              score,
              raw_score,
              total_questions,
              time_spent_seconds,
              completed_at,
              exercises (title, category, badge),
              attempt_answers (question_id, selected_option_index, is_correct)
            `)
            .eq("user_id", studentId)
            .order("completed_at", { ascending: false })
        ]);

        return {
          progress: progRes.data || [],
          attempts: attemptsRes.data || []
        };
      } catch (e) {
        console.warn("fetchCloudStudentData error:", e);
        return null;
      }
    }
  };
})();
