// ==============================================================================
// SUPABASE CLIENT, AUTHENTICATION & CLOUD SYNC MODULE - ENGLISH YOUNG 8
// ==============================================================================
(function () {
  const DEFAULT_PROJECT_REF = "iiltwryccctzjbfddjcw";
  const DEFAULT_SUPABASE_URL = `https://${DEFAULT_PROJECT_REF}.supabase.co`;
  const DEFAULT_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpbHR3cnljY2N0empiZmRkamN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyNzMxMTgsImV4cCI6MjEwODg0OTExOH0.6hJjVxbdeFrCyvd-VN_U_rJY-jqAFIY7WbqRZLv6axo";

  const STORAGE_KEY_AUTH = "ey8_auth_session_v3";
  const STORAGE_KEY_URL = "ey8_supabase_url";
  const STORAGE_KEY_ANON = "ey8_supabase_anon_key";
  const STORAGE_KEY_LOCAL_USERS = "ey8_local_users_v1";
  const STORAGE_KEY_SYSTEM_CONFIG = "ey8_system_config_v1";

  const SYSTEM_CONFIG_USER_ID = "a0000000-0000-0000-0000-000000000999";
  const SYSTEM_CONFIG_USERNAME = "__ey8_system_store__";

  // Danh sách tài khoản khởi tạo mặc định
  const INITIAL_ACCOUNTS = [
    {
      id: "a0000000-0000-0000-0000-000000000001",
      username: "em_lop8",
      fullName: "Em Lớp 8",
      role: "student",
      pinCode: "1234",
      streakDays: 1
    },
    {
      id: "a0000000-0000-0000-0000-000000000002",
      username: "admin",
      fullName: "Quản Trị Viên (Anh/Chị)",
      role: "admin",
      pinCode: "admin123",
      streakDays: 0
    }
  ];

  function getLocalUsers() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LOCAL_USERS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    localStorage.setItem(STORAGE_KEY_LOCAL_USERS, JSON.stringify(INITIAL_ACCOUNTS));
    return [...INITIAL_ACCOUNTS];
  }

  function saveLocalUsers(list) {
    try {
      localStorage.setItem(STORAGE_KEY_LOCAL_USERS, JSON.stringify(list));
    } catch (e) {}
  }

  function loadUserSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AUTH);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null; // Bắt buộc đăng nhập khi chưa có phiên
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

  const config = {
    url: localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_SUPABASE_URL,
    anonKey: localStorage.getItem(STORAGE_KEY_ANON) || DEFAULT_ANON_KEY,
    currentUser: loadUserSession()
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

  initClient();

  // Đảm bảo tài khoản mặc định tồn tại trên Supabase
  async function ensureDefaultAccountsOnCloud() {
    if (!client) return;
    try {
      for (const acc of INITIAL_ACCOUNTS) {
        await client.from("users").upsert(
          {
            id: acc.id,
            username: acc.username,
            full_name: acc.fullName,
            role: acc.role,
            pin_code: acc.pinCode,
            streak_days: acc.streakDays || 1
          },
          { onConflict: "username", ignoreDuplicates: true }
        );
      }
    } catch (e) {}
  }

  setTimeout(ensureDefaultAccountsOnCloud, 800);

  window.EY8_Supabase = {
    getConfig: () => ({ ...config, isConnected: !!client }),

    getCurrentUser: () => config.currentUser,

    isLoggedIn: () => !!config.currentUser,

    isAdmin: () => {
      const u = config.currentUser;
      return !!(u && u.role === "admin");
    },

    isStudent: () => {
      const u = config.currentUser;
      return !!(u && u.role !== "admin");
    },

    logout: () => {
      saveUserSession(null);
    },

    testConnection: async () => {
      if (!client) return { ok: false, message: "Chưa khởi tạo kết nối Supabase" };
      try {
        const { data, error } = await client.from("users").select("id, username").limit(1);
        if (error) throw error;
        return { ok: true, data };
      } catch (err) {
        return { ok: false, message: err.message || "Không thể kết nối tới bảng dữ liệu Supabase" };
      }
    },

    // =========================================================================
    // 1. ĐĂNG NHẬP & ĐĂNG KÝ TÀI KHOẢN
    // =========================================================================
    login: async (username, password) => {
      const uName = (username || "").trim().toLowerCase();
      const pwd = (password || "").trim();

      if (!uName || !pwd) {
        return { success: false, message: "Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu!" };
      }

      // 1. Kiểm tra trên Supabase Cloud trước
      if (client) {
        try {
          const { data, error } = await client
            .from("users")
            .select("id, username, full_name, role, pin_code, avatar_url, streak_days")
            .eq("username", uName)
            .neq("role", "system")
            .maybeSingle();

          if (!error && data) {
            if (data.pin_code && data.pin_code !== pwd) {
              return { success: false, message: "Mật khẩu không chính xác. Vui lòng kiểm tra lại!" };
            }

            // Cập nhật thời gian hoạt động mới nhất
            client
              .from("users")
              .update({ last_active_at: new Date().toISOString() })
              .eq("id", data.id)
              .then(() => {});

            const userObj = {
              id: data.id,
              username: data.username,
              fullName: data.full_name,
              role: data.role || "student",
              pinCode: data.pin_code,
              avatarUrl: data.avatar_url,
              streakDays: data.streak_days || 1
            };

            // Đồng bộ vào danh sách local
            const localList = getLocalUsers();
            const idx = localList.findIndex((x) => x.username.toLowerCase() === uName);
            if (idx >= 0) localList[idx] = { ...localList[idx], ...userObj };
            else localList.push(userObj);
            saveLocalUsers(localList);

            saveUserSession(userObj);
            return { success: true, user: userObj };
          }
        } catch (e) {
          console.warn("Supabase login query warning:", e);
        }
      }

      // 2. Fallback kiểm tra trong Local Users
      const localList = getLocalUsers();
      const matched = localList.find((a) => a.username.toLowerCase() === uName);
      if (matched) {
        if (matched.pinCode !== pwd) {
          return { success: false, message: "Mật khẩu không chính xác!" };
        }
        saveUserSession(matched);
        return { success: true, user: matched };
      }

      return {
        success: false,
        message: "Tài khoản không tồn tại hoặc sai tên đăng nhập!"
      };
    },

    // Đăng ký tài khoản (Mặc định ngoài trang chủ chỉ tạo Student, trừ khi Admin tạo)
    register: async ({ username, password, fullName, role = "student", createdByAdmin = false }) => {
      const uName = (username || "").trim().toLowerCase();
      const pwd = (password || "").trim();
      const name = (fullName || "").trim();

      if (!name || !uName || !pwd) {
        return { success: false, message: "Vui lòng điền đầy đủ Họ tên, Tên đăng nhập và Mật khẩu!" };
      }
      if (!/^[a-z0-9_]+$/.test(uName)) {
        return {
          success: false,
          message: "Tên đăng nhập chỉ được chứa chữ cái thường không dấu, chữ số hoặc dấu gạch dưới (_)!"
        };
      }
      if (pwd.length < 4) {
        return { success: false, message: "Mật khẩu phải có ít nhất 4 ký tự!" };
      }

      // Chặn việc tự ý nâng quyền Admin nếu không phải từ bảng điều khiển Admin
      const finalRole = createdByAdmin ? role : "student";
      const newId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "a0000000-0000-4000-8000-" + String(Date.now()).padStart(12, "0");

      const localList = getLocalUsers();
      if (localList.some((u) => u.username.toLowerCase() === uName)) {
        return { success: false, message: "Tên đăng nhập này đã tồn tại. Vui lòng chọn tên khác!" };
      }

      if (client) {
        try {
          const { data: existing } = await client
            .from("users")
            .select("id")
            .eq("username", uName)
            .maybeSingle();

          if (existing) {
            return { success: false, message: "Tên đăng nhập này đã được sử dụng trên hệ thống!" };
          }

          const { error } = await client.from("users").insert({
            id: newId,
            username: uName,
            full_name: name,
            role: finalRole,
            pin_code: pwd,
            streak_days: 1,
            last_active_at: new Date().toISOString()
          });

          if (error && error.code === "23505") {
            return { success: false, message: "Tên đăng nhập này đã tồn tại!" };
          }
        } catch (e) {
          console.warn("Supabase register error:", e);
        }
      }

      const userSession = {
        id: newId,
        username: uName,
        fullName: name,
        role: finalRole,
        pinCode: pwd,
        streakDays: 1
      };

      localList.push(userSession);
      saveLocalUsers(localList);

      if (!createdByAdmin) {
        saveUserSession(userSession);
      }

      return { success: true, user: userSession };
    },

    // =========================================================================
    // 2. QUẢN LÝ NGƯỜI DÙNG DÀNH CHO ADMIN
    // =========================================================================
    getAllUsers: async () => {
      const localList = getLocalUsers();
      if (client) {
        try {
          const { data, error } = await client
            .from("users")
            .select("id, username, full_name, role, pin_code, avatar_url, streak_days, last_active_at, created_at")
            .neq("username", SYSTEM_CONFIG_USERNAME)
            .order("created_at", { ascending: true });

          if (!error && data && data.length > 0) {
            const merged = data.map((row) => ({
              id: row.id,
              username: row.username,
              fullName: row.full_name,
              role: row.role || "student",
              pinCode: row.pin_code || "****",
              avatarUrl: row.avatar_url,
              streakDays: row.streak_days || 1,
              lastActiveAt: row.last_active_at
            }));
            saveLocalUsers(merged);
            return merged;
          }
        } catch (e) {
          console.warn("getAllUsers error:", e);
        }
      }
      return localList;
    },

    updateUserPasswordOrInfo: async (userId, username, updates) => {
      const localList = getLocalUsers();
      const idx = localList.findIndex((u) => u.id === userId || u.username === username);
      if (idx >= 0) {
        if (updates.fullName) localList[idx].fullName = updates.fullName;
        if (updates.pinCode) localList[idx].pinCode = updates.pinCode;
        if (updates.role) localList[idx].role = updates.role;
        saveLocalUsers(localList);
      }

      if (client) {
        try {
          const dbUpdates = {};
          if (updates.fullName) dbUpdates.full_name = updates.fullName;
          if (updates.pinCode) dbUpdates.pin_code = updates.pinCode;
          if (updates.role) dbUpdates.role = updates.role;
          await client.from("users").update(dbUpdates).eq("username", username);
        } catch (e) {
          console.warn("updateUserPasswordOrInfo error:", e);
        }
      }
      return { success: true };
    },

    deleteUserAccount: async (username) => {
      if (username === "admin" || username === "em_lop8") {
        return { success: false, message: "Không thể xóa 2 tài khoản gốc mặc định của hệ thống!" };
      }
      const localList = getLocalUsers().filter((u) => u.username !== username);
      saveLocalUsers(localList);

      if (client) {
        try {
          await client.from("users").delete().eq("username", username);
        } catch (e) {}
      }
      return { success: true };
    },

    // =========================================================================
    // 3. ĐỒNG BỘ TIẾN ĐỘ HỌC SINH (2 LỚP: RELATIONAL TABLES + SNAPSHOT JSON)
    // =========================================================================
    saveStudentStateSnapshot: async (studentUser, stateSnapshot) => {
      const targetUser = studentUser || config.currentUser;
      if (!targetUser || targetUser.role === "admin") return;

      const snapshotPayload = {
        learnedVocab: stateSnapshot.learnedVocab || {},
        unitScores: stateSnapshot.unitScores || {},
        examHistory: (stateSnapshot.examHistory || []).slice(0, 50),
        mistakes: stateSnapshot.mistakes || {},
        updatedAt: new Date().toISOString()
      };

      // Lưu snapshot theo từng username trên localStorage
      try {
        localStorage.setItem(`ey8_snapshot_${targetUser.username}`, JSON.stringify(snapshotPayload));
      } catch (e) {}

      // Đồng bộ snapshot lên cột avatar_url của bảng users trên Supabase để Admin ở máy khác đọc được 100%
      if (client) {
        try {
          await client
            .from("users")
            .update({
              avatar_url: JSON.stringify(snapshotPayload),
              last_active_at: new Date().toISOString()
            })
            .eq("username", targetUser.username);
        } catch (e) {
          console.warn("saveStudentStateSnapshot cloud warning:", e);
        }
      }
    },

    syncVocabProgress: async (vocabId, unitId, status, fullStateSnapshot) => {
      const currentUser = config.currentUser;
      if (!currentUser) return null;

      if (fullStateSnapshot) {
        window.EY8_Supabase.saveStudentStateSnapshot(currentUser, fullStateSnapshot);
      }

      if (!client) return null;
      try {
        const { data } = await client.from("study_progress").upsert(
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

    recordQuizAttempt: async (attemptData, fullStateSnapshot) => {
      const currentUser = config.currentUser;
      if (!currentUser) return null;

      if (fullStateSnapshot) {
        window.EY8_Supabase.saveStudentStateSnapshot(currentUser, fullStateSnapshot);
      }

      if (!client) return null;
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

    // Lấy toàn bộ dữ liệu học tập của 1 học sinh bất kỳ (Dùng cho cả Học sinh & Admin)
    fetchStudentFullRecord: async (username, userId) => {
      let cloudSnapshot = null;
      let relationalProgress = [];
      let relationalAttempts = [];

      if (client) {
        try {
          const userQuery = username
            ? client.from("users").select("id, username, full_name, avatar_url, streak_days, last_active_at").eq("username", username).maybeSingle()
            : client.from("users").select("id, username, full_name, avatar_url, streak_days, last_active_at").eq("id", userId).maybeSingle();

          const { data: userRow } = await userQuery;
          const resolvedId = (userRow && userRow.id) || userId;

          if (userRow && userRow.avatar_url && userRow.avatar_url.startsWith("{")) {
            try {
              cloudSnapshot = JSON.parse(userRow.avatar_url);
            } catch (e) {}
          }

          if (resolvedId) {
            const [progRes, attemptsRes] = await Promise.all([
              client.from("study_progress").select("*").eq("user_id", resolvedId),
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
                .eq("user_id", resolvedId)
                .order("completed_at", { ascending: false })
            ]);
            relationalProgress = progRes.data || [];
            relationalAttempts = attemptsRes.data || [];
          }
        } catch (e) {
          console.warn("fetchStudentFullRecord cloud warning:", e);
        }
      }

      // Kiểm tra bản lưu cục bộ theo username nếu có
      let localSnapshot = null;
      if (username) {
        try {
          const raw = localStorage.getItem(`ey8_snapshot_${username}`);
          if (raw) localSnapshot = JSON.parse(raw);
        } catch (e) {}
      }

      return {
        snapshot: cloudSnapshot || localSnapshot,
        progress: relationalProgress,
        attempts: relationalAttempts
      };
    },

    resetStudentProgress: async (username, userId) => {
      const emptySnapshot = {
        learnedVocab: {},
        unitScores: {},
        examHistory: [],
        mistakes: {},
        updatedAt: new Date().toISOString()
      };
      try {
        localStorage.setItem(`ey8_snapshot_${username}`, JSON.stringify(emptySnapshot));
      } catch (e) {}

      if (client) {
        try {
          await client
            .from("users")
            .update({ avatar_url: JSON.stringify(emptySnapshot) })
            .eq("username", username);
          if (userId) {
            await client.from("study_progress").delete().eq("user_id", userId);
            await client.from("quiz_attempts").delete().eq("user_id", userId);
          }
        } catch (e) {}
      }
      return { success: true };
    },

    // =========================================================================
    // 4. ĐỒNG BỘ NHIỆM VỤ GIAO BÀI TẬP & ĐỀ THI/CÂU HỎI TÙY CHỈNH CỦA ADMIN
    // =========================================================================
    loadSystemStore: async () => {
      let localStore = { assignments: [], customQuestions: [], customExams: [] };
      try {
        const raw = localStorage.getItem(STORAGE_KEY_SYSTEM_CONFIG);
        if (raw) localStore = { ...localStore, ...JSON.parse(raw) };
      } catch (e) {}

      if (client) {
        try {
          const { data } = await client
            .from("users")
            .select("avatar_url")
            .eq("username", SYSTEM_CONFIG_USERNAME)
            .maybeSingle();

          if (data && data.avatar_url && data.avatar_url.startsWith("{")) {
            const parsed = JSON.parse(data.avatar_url);
            localStore = {
              assignments: parsed.assignments || localStore.assignments || [],
              customQuestions: parsed.customQuestions || localStore.customQuestions || [],
              customExams: parsed.customExams || localStore.customExams || []
            };
            localStorage.setItem(STORAGE_KEY_SYSTEM_CONFIG, JSON.stringify(localStore));
          }
        } catch (e) {}
      }
      return localStore;
    },

    saveSystemStore: async (newStore) => {
      try {
        localStorage.setItem(STORAGE_KEY_SYSTEM_CONFIG, JSON.stringify(newStore));
      } catch (e) {}

      if (client) {
        try {
          await client.from("users").upsert(
            {
              id: SYSTEM_CONFIG_USER_ID,
              username: SYSTEM_CONFIG_USERNAME,
              full_name: "System Store",
              role: "system",
              pin_code: "system_locked",
              avatar_url: JSON.stringify(newStore),
              last_active_at: new Date().toISOString()
            },
            { onConflict: "username" }
          );
        } catch (e) {
          console.warn("saveSystemStore error:", e);
        }
      }
      return { success: true };
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
