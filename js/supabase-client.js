// ==============================================================================
// SUPABASE CLIENT & AUTHENTICATION MODULE - ENGLISH YOUNG 8
// ==============================================================================
(function () {
  const DEFAULT_PROJECT_REF = "iiltwryccctzjbfddjcw";
  const DEFAULT_SUPABASE_URL = `https://${DEFAULT_PROJECT_REF}.supabase.co`;
  const DEFAULT_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpbHR3cnljY2N0empiZmRkamN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyNzMxMTgsImV4cCI6MjEwODg0OTExOH0.6hJjVxbdeFrCyvd-VN_U_rJY-jqAFIY7WbqRZLv6axo";

  const STORAGE_KEY_AUTH = "ey8_auth_user_v2";
  const STORAGE_KEY_URL = "ey8_supabase_url";
  const STORAGE_KEY_ANON = "ey8_supabase_anon_key";

  // Danh sách tài khoản mặc định (Offline fallback)
  const DEFAULT_ACCOUNTS = [
    {
      id: "a0000000-0000-0000-0000-000000000001",
      username: "em_lop8",
      fullName: "Em Lớp 8",
      role: "student",
      pinCode: "1234"
    },
    {
      id: "a0000000-0000-0000-0000-000000000002",
      username: "admin",
      fullName: "Quản Trị Viên (Anh/Chị)",
      role: "admin",
      pinCode: "admin123"
    }
  ];

  const config = {
    url: localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_SUPABASE_URL,
    anonKey: localStorage.getItem(STORAGE_KEY_ANON) || DEFAULT_ANON_KEY,
    currentUser: loadUserSession()
  };

  let client = null;
  let isConnected = false;

  function loadUserSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AUTH);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    // Mặc định đăng nhập với tài khoản học sinh Em Lớp 8 để em mở web lên là học được ngay
    return DEFAULT_ACCOUNTS[0];
  }

  function saveUserSession(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
      config.currentUser = user;
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH);
      config.currentUser = null;
    }
  }

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

  initClient();

  window.EY8_Supabase = {
    getConfig: () => ({ ...config, isConnected: !!client }),

    getCurrentUser: () => config.currentUser || DEFAULT_ACCOUNTS[0],

    isAdmin: () => {
      const u = config.currentUser;
      return u && u.role === "admin";
    },

    isStudent: () => {
      const u = config.currentUser;
      return !u || u.role !== "admin";
    },

    logout: () => {
      saveUserSession(null);
    },

    // 1. Đăng nhập
    login: async (username, password) => {
      const uName = (username || "").trim().toLowerCase();
      const pwd = (password || "").trim();

      // Kiểm tra qua Supabase Database trước
      if (client) {
        try {
          const { data, error } = await client
            .from("users")
            .select("id, username, full_name, role, pin_code, avatar_url, streak_days")
            .eq("username", uName)
            .single();

          if (!error && data) {
            if (data.pin_code && data.pin_code !== pwd) {
              return { success: false, message: "Mật khẩu không chính xác!" };
            }
            const userObj = {
              id: data.id,
              username: data.username,
              fullName: data.full_name,
              role: data.role || "student",
              avatarUrl: data.avatar_url,
              streakDays: data.streak_days || 1
            };
            saveUserSession(userObj);
            return { success: true, user: userObj };
          }
        } catch (e) {
          console.warn("Supabase login check error:", e);
        }
      }

      // Fallback: Kiểm tra tài khoản mặc định
      const matched = DEFAULT_ACCOUNTS.find(
        (a) => a.username.toLowerCase() === uName && a.pinCode === pwd
      );
      if (matched) {
        saveUserSession(matched);
        return { success: true, user: matched };
      }

      return {
        success: false,
        message: "Tên đăng nhập hoặc mật khẩu không đúng!"
      };
    },

    // 2. Đăng ký tài khoản mới
    register: async ({ username, password, fullName, role = "student" }) => {
      const uName = (username || "").trim().toLowerCase();
      const pwd = (password || "").trim();
      const name = (fullName || "").trim();

      if (!uName || !pwd || !name) {
        return { success: false, message: "Vui lòng điền đầy đủ họ tên, tên đăng nhập và mật khẩu!" };
      }

      const newId = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : ("u_" + Date.now());

      const newUser = {
        id: newId,
        username: uName,
        full_name: name,
        role: role,
        pin_code: pwd,
        streak_days: 1
      };

      if (client) {
        try {
          const { error } = await client.from("users").insert(newUser);
          if (error) {
            if (error.code === "23505") {
              return { success: false, message: "Tên đăng nhập này đã có người sử dụng. Hãy chọn tên khác!" };
            }
            throw error;
          }
        } catch (e) {
          console.warn("Supabase register error:", e);
        }
      }

      const userSession = {
        id: newId,
        username: uName,
        fullName: name,
        role: role,
        streakDays: 1
      };
      saveUserSession(userSession);
      return { success: true, user: userSession };
    },

    // 3. Lấy danh sách học sinh (Dành cho Admin)
    getStudentsList: async () => {
      if (client) {
        try {
          const { data, error } = await client
            .from("users")
            .select("id, username, full_name, role, streak_days, last_active_at")
            .eq("role", "student")
            .order("created_at", { ascending: false });

          if (!error && data && data.length > 0) {
            return data;
          }
        } catch (e) {
          console.warn("getStudentsList error:", e);
        }
      }

      // Fallback danh sách mặc định
      return [
        {
          id: DEFAULT_ACCOUNTS[0].id,
          username: DEFAULT_ACCOUNTS[0].username,
          full_name: DEFAULT_ACCOUNTS[0].fullName,
          role: "student",
          streak_days: 1
        }
      ];
    },

    // 4. Đồng bộ tiến độ từ vựng (Chạy ngầm)
    syncVocabProgress: async (vocabId, unitId, status) => {
      if (!client) return null;
      const currentUser = config.currentUser || DEFAULT_ACCOUNTS[0];
      try {
        const { data, error } = await client.from("study_progress").upsert(
          {
            user_id: currentUser.id,
            vocabulary_id: vocabId,
            unit_id: unitId,
            status: status,
            updated_at: new Date().toISOString()
          },
          { onConflict: "user_id,vocabulary_id" }
        );
        return data;
      } catch (e) {
        return null;
      }
    },

    // 5. Lưu kết quả bài làm kiểm tra (Chạy ngầm)
    recordQuizAttempt: async (attemptData) => {
      if (!client) return null;
      const currentUser = config.currentUser || DEFAULT_ACCOUNTS[0];
      try {
        const { data: attempt, error: attemptErr } = await client
          .from("quiz_attempts")
          .insert({
            user_id: currentUser.id,
            exercise_id: attemptData.exerciseId,
            score: attemptData.score,
            raw_score: attemptData.rawScore,
            total_questions: attemptData.totalQuestions,
            time_spent_seconds: attemptData.timeSpentSeconds,
            completed_at: new Date().toISOString()
          })
          .select("id")
          .single();

        if (!attemptErr && attempt && attempt.id && Array.isArray(attemptData.answers)) {
          const answerRows = attemptData.answers.map((ans) => ({
            attempt_id: attempt.id,
            question_id: ans.questionId,
            selected_option_index: ans.selectedOptionIndex,
            is_correct: ans.isCorrect
          }));
          await client.from("attempt_answers").insert(answerRows);
        }

        return attempt;
      } catch (e) {
        return null;
      }
    },

    // 6. Lấy dữ liệu học tập của học sinh chỉ định (Dành cho cả học sinh và Admin)
    fetchCloudStudentData: async (targetUserId) => {
      if (!client) return null;
      const userId = targetUserId || (config.currentUser ? config.currentUser.id : DEFAULT_ACCOUNTS[0].id);
      try {
        const [progRes, attemptsRes] = await Promise.all([
          client.from("study_progress").select("*").eq("user_id", userId),
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
            .eq("user_id", userId)
            .order("completed_at", { ascending: false })
        ]);

        return {
          progress: progRes.data || [],
          attempts: attemptsRes.data || []
        };
      } catch (e) {
        return null;
      }
    },

    saveConfig: (newUrl, newAnonKey) => {
      config.url = (newUrl || DEFAULT_SUPABASE_URL).trim();
      config.anonKey = (newAnonKey || DEFAULT_ANON_KEY).trim();
      localStorage.setItem(STORAGE_KEY_URL, config.url);
      localStorage.setItem(STORAGE_KEY_ANON, config.anonKey);
      initClient();
      return isConnected;
    }
  };
})();
