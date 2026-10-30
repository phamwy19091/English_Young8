// ==============================================================================
// LOGIC ĐIỀU KHIỂN CHÍNH: ENGLISH YOUNG 8 (STUDENT PORTAL & ADMIN PORTAL)
// ==============================================================================
(function () {
  const BASE_STORAGE_KEYS = {
    LEARNED_VOCAB: "ey8_learned_vocab_v1",
    UNIT_SCORES: "ey8_unit_scores_v1",
    EXAM_HISTORY: "ey8_exam_history_v1",
    MISTAKES: "ey8_mistakes_v1"
  };

  // Lưu bản gốc của danh sách câu hỏi/đề thi trước khi ghép dữ liệu tùy chỉnh của Admin
  const baseUnitsClone = JSON.parse(JSON.stringify(window.STUDY_DATA.units || []));
  const baseExamsClone = JSON.parse(JSON.stringify(window.STUDY_DATA.exams || []));

  const state = {
    // Auth Screen state
    authScreenTab: "login", // 'login' | 'register'
    showPassword: false,

    // Student Portal state
    currentTab: "dashboard", // dashboard | unit-study | exams | mistakes | student-progress
    selectedUnitId: "unit-1",
    unitSubTab: "vocab", // vocab | grammar | practice
    fcIndex: 0,
    fcFlipped: false,
    fcDeckMode: "unlearned", // 'unlearned' (chỉ học từ chưa thuộc - mặc định) | 'all' (ôn tất cả)
    vocabFilter: "",
    vocabStatusFilter: "all", // 'all' | 'unlearned' | 'learned'
    unitQuizAnswers: {},
    unitQuizSubmitted: false,

    // Exam state
    examFilter: "all", // all | 15m | midterm | final
    activeExam: null,
    examAnswers: {},
    examSubmitted: false,
    examTimerId: null,
    examSecondsLeft: 0,
    examTotalSeconds: 0,

    // Mistake practice mode
    mistakePracticeActive: false,
    mistakeAnswers: {},
    mistakeSubmitted: false,

    // Admin Portal state
    adminTab: "admin-monitor", // 'admin-monitor' | 'admin-assignments' | 'admin-content' | 'admin-users'
    adminPreviewStudentMode: false,
    adminSelectedStudent: "em_lop8",
    allUsers: [],
    inspectedStudentRecord: {
      learnedVocab: {},
      unitScores: {},
      examHistory: [],
      mistakes: {}
    },

    // System store (Nhiệm vụ giao bài & Đề/Câu hỏi do Admin thêm)
    systemStore: {
      assignments: [],
      customQuestions: [],
      customExams: []
    },

    // Dữ liệu học tập của học sinh đang đăng nhập
    learnedVocab: {},
    unitScores: {},
    examHistory: [],
    mistakes: {}
  };

  function getActiveUsername() {
    const u = window.EY8_Supabase ? window.EY8_Supabase.getCurrentUser() : null;
    return u && u.username ? u.username.toLowerCase() : "em_lop8";
  }

  function getUserScopedKey(baseKey, username) {
    const uName = (username || getActiveUsername()).toLowerCase();
    if (uName === "em_lop8") return baseKey;
    return `${baseKey}_${uName}`;
  }

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  // Nạp dữ liệu học tập cục bộ theo đúng học sinh đang đăng nhập
  function loadActiveUserLocalProgress() {
    const uName = getActiveUsername();
    const snapRaw = localStorage.getItem(`ey8_snapshot_${uName}`);
    if (snapRaw) {
      try {
        const snap = JSON.parse(snapRaw);
        state.learnedVocab = snap.learnedVocab || {};
        state.unitScores = snap.unitScores || {};
        state.examHistory = snap.examHistory || [];
        state.mistakes = snap.mistakes || {};
        return;
      } catch (e) {}
    }

    state.learnedVocab = loadJSON(getUserScopedKey(BASE_STORAGE_KEYS.LEARNED_VOCAB, uName), {});
    state.unitScores = loadJSON(getUserScopedKey(BASE_STORAGE_KEYS.UNIT_SCORES, uName), {});
    state.examHistory = loadJSON(getUserScopedKey(BASE_STORAGE_KEYS.EXAM_HISTORY, uName), []);
    state.mistakes = loadJSON(getUserScopedKey(BASE_STORAGE_KEYS.MISTAKES, uName), {});
  }

  function persistActiveStudentState() {
    const uName = getActiveUsername();
    saveJSON(getUserScopedKey(BASE_STORAGE_KEYS.LEARNED_VOCAB, uName), state.learnedVocab);
    saveJSON(getUserScopedKey(BASE_STORAGE_KEYS.UNIT_SCORES, uName), state.unitScores);
    saveJSON(getUserScopedKey(BASE_STORAGE_KEYS.EXAM_HISTORY, uName), state.examHistory);
    saveJSON(getUserScopedKey(BASE_STORAGE_KEYS.MISTAKES, uName), state.mistakes);

    const snapshot = {
      learnedVocab: state.learnedVocab,
      unitScores: state.unitScores,
      examHistory: state.examHistory,
      mistakes: state.mistakes
    };

    if (window.EY8_Supabase && window.EY8_Supabase.saveStudentStateSnapshot) {
      window.EY8_Supabase.saveStudentStateSnapshot(window.EY8_Supabase.getCurrentUser(), snapshot);
    }
  }

  // Ghép đề thi & câu hỏi tùy chỉnh của Admin vào STUDY_DATA
  function applyCustomContentToStudyData() {
    const unitsCopy = JSON.parse(JSON.stringify(baseUnitsClone));
    const examsCopy = JSON.parse(JSON.stringify(baseExamsClone));

    const customExams = state.systemStore.customExams || [];
    customExams.forEach((ce) => {
      if (!examsCopy.some((e) => e.id === ce.id)) {
        examsCopy.unshift(ce);
      }
    });

    const customQuestions = state.systemStore.customQuestions || [];
    customQuestions.forEach((cq) => {
      if (cq.targetType === "unit") {
        const u = unitsCopy.find((item) => item.id === cq.targetId);
        if (u && u.practice && !u.practice.some((q) => q.id === cq.id)) {
          u.practice.push(cq);
        }
      } else if (cq.targetType === "exam") {
        const ex = examsCopy.find((item) => item.id === cq.targetId);
        if (ex && ex.questions && !ex.questions.some((q) => q.id === cq.id)) {
          ex.questions.push(cq);
        }
      }
    });

    window.STUDY_DATA.units = unitsCopy;
    window.STUDY_DATA.exams = examsCopy;
  }

  // Phát âm tiếng Anh bằng Web Speech API
  window.speakEnglish = function (text, event) {
    if (event) event.stopPropagation();
    if (!("speechSynthesis" in window)) {
      alert("Trình duyệt của bạn không hỗ trợ đọc phát âm tự động.");
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.split("/")[0].replace(/\(.*?\)/g, "").trim();
    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.lang = "en-US";
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  };

  function stopExamTimer() {
    if (state.examTimerId) {
      clearInterval(state.examTimerId);
      state.examTimerId = null;
    }
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  window.handleBrandClick = function () {
    if (!window.EY8_Supabase || !window.EY8_Supabase.isLoggedIn()) return;
    if (window.EY8_Supabase.isAdmin() && !state.adminPreviewStudentMode) {
      switchAdminTab("admin-monitor");
    } else {
      switchMainTab("dashboard");
    }
  };

  // Đặt vị trí Flashcard thông minh vào từ CHƯA THUỘC đầu tiên của Unit (tránh lặp lại từ đã thuộc)
  function resetFlashcardPositionForUnit(unitId) {
    const units = window.STUDY_DATA.units || [];
    const unit = units.find((u) => u.id === unitId) || units[0];
    state.fcFlipped = false;
    if (!unit) {
      state.fcIndex = 0;
      return;
    }
    const unlearnedList = unit.vocabulary.filter((v) => !state.learnedVocab[v.id]);
    if (unlearnedList.length > 0) {
      state.fcDeckMode = "unlearned";
      state.fcIndex = 0;
    } else {
      state.fcIndex = 0;
    }
  }

  // Chuyển tab dành cho Học sinh
  window.switchMainTab = function (tabName, unitId) {
    if (state.activeExam && !state.examSubmitted && tabName !== "exams") {
      if (!confirm("Em đang làm dở bài thi. Em có chắc muốn thoát khỏi phòng thi không?")) {
        return;
      }
      stopExamTimer();
      state.activeExam = null;
    }
    state.currentTab = tabName;
    if (unitId) {
      state.selectedUnitId = unitId;
      state.unitQuizAnswers = {};
      state.unitQuizSubmitted = false;
      resetFlashcardPositionForUnit(unitId);
    } else if (tabName === "unit-study") {
      resetFlashcardPositionForUnit(state.selectedUnitId);
    }
    if (tabName === "student-progress" || tabName === "dashboard") {
      syncCloudData(true);
    }
    renderApp();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Chuyển tab dành cho Admin
  window.switchAdminTab = function (adminTabName) {
    state.adminTab = adminTabName;
    if (adminTabName === "admin-monitor") {
      loadAdminInspectedStudent(state.adminSelectedStudent);
    } else if (adminTabName === "admin-users") {
      refreshAdminUsersList();
    }
    renderApp();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.toggleAdminStudentPreview = function (enablePreview) {
    state.adminPreviewStudentMode = !!enablePreview;
    if (enablePreview) {
      state.currentTab = "dashboard";
    }
    renderApp();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.openUnitWithSubTab = function (unitId, subTab) {
    state.currentTab = "unit-study";
    state.selectedUnitId = unitId;
    state.unitSubTab = subTab || "vocab";
    state.unitQuizAnswers = {};
    state.unitQuizSubmitted = false;
    resetFlashcardPositionForUnit(unitId);
    renderApp();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.notifyFutureSubject = function (subjectName) {
    alert(
      `Môn "${subjectName} - Lớp 8" đã được thiết kế sẵn khung dữ liệu đa môn!\nHiện tại hệ thống đang mở khóa học Tiếng Anh 8 (Global Success).`
    );
  };

  // Thống kê tổng quan từ một bản ghi học tập bất kỳ
  function computeStatsFromRecord(record) {
    const units = window.STUDY_DATA.units || [];
    const learnedMap = (record && record.learnedVocab) || {};
    const uScores = (record && record.unitScores) || {};
    const eHistory = (record && record.examHistory) || [];
    const mMap = (record && record.mistakes) || {};

    let totalVocab = 0;
    let learnedCount = 0;
    units.forEach((u) => {
      u.vocabulary.forEach((v) => {
        totalVocab++;
        if (learnedMap[v.id]) learnedCount++;
      });
    });

    const completedUnits = Object.keys(uScores).length;
    const examCount = eHistory.length;
    const avgExamScore =
      examCount > 0
        ? (eHistory.reduce((acc, item) => acc + Number(item.score10 || 0), 0) / examCount).toFixed(1)
        : "--";
    const mistakeCount = Object.keys(mMap).length;

    return {
      totalVocab,
      learnedCount,
      completedUnits,
      totalUnits: units.length,
      examCount,
      avgExamScore,
      mistakeCount
    };
  }

  function getSummaryStats() {
    return computeStatsFromRecord(state);
  }

  // =========================================================================
  // RENDER TOÀN TRANG (PHÂN LUỒNG: AUTH SCREEN | ADMIN PORTAL | STUDENT PORTAL)
  // =========================================================================
  function renderApp() {
    const topBar = document.getElementById("top-subject-bar");
    const mainHeader = document.getElementById("main-header");
    const previewBarRoot = document.getElementById("admin-preview-bar-root");
    const navTabsEl = document.getElementById("main-nav-tabs");
    const userContainer = document.getElementById("header-user-container");
    const root = document.getElementById("app-root");

    if (!root) return;

    const isLoggedIn = window.EY8_Supabase && window.EY8_Supabase.isLoggedIn();

    // 1. NẾU CHƯA ĐĂNG NHẬP -> HIỂN THỊ TRANG ĐĂNG NHẬP / ĐĂNG KÝ TOÀN MÀN HÌNH
    if (!isLoggedIn) {
      if (topBar) topBar.style.display = "none";
      if (mainHeader) mainHeader.style.display = "none";
      if (previewBarRoot) previewBarRoot.innerHTML = "";
      root.innerHTML = renderFullAuthScreen();
      return;
    }

    if (topBar) topBar.style.display = "block";
    if (mainHeader) mainHeader.style.display = "block";

    const currentUser = window.EY8_Supabase.getCurrentUser();
    const isAdmin = window.EY8_Supabase.isAdmin();
    const stats = getSummaryStats();

    // 2. NẾU LÀ ADMIN (VÀ KHÔNG Ở CHẾ ĐỘ XEM THỬ HỌC SINH) -> HIỂN THỊ ADMIN PORTAL
    if (isAdmin && !state.adminPreviewStudentMode) {
      if (previewBarRoot) previewBarRoot.innerHTML = "";
      if (mainHeader) mainHeader.classList.add("admin-header-theme");

      const logoEl = document.getElementById("header-brand-logo");
      const titleEl = document.getElementById("header-brand-title");
      const subEl = document.getElementById("header-brand-subtitle");
      if (logoEl) {
        logoEl.textContent = "👑";
        logoEl.style.background = "linear-gradient(135deg, #F59E0B, #D97706)";
      }
      if (titleEl) titleEl.textContent = "English Young 8 • Admin Portal";
      if (subEl) subEl.textContent = "Hệ thống Quản trị, Giao bài tập & Giám sát Học sinh";

      if (navTabsEl) {
        navTabsEl.innerHTML = `
          <button class="nav-tab ${state.adminTab === "admin-monitor" ? "active" : ""}" onclick="switchAdminTab('admin-monitor')">
            📊 Giám Sát Học Sinh
          </button>
          <button class="nav-tab ${state.adminTab === "admin-assignments" ? "active" : ""}" onclick="switchAdminTab('admin-assignments')">
            🎯 Giao Bài Tập (${(state.systemStore.assignments || []).length})
          </button>
          <button class="nav-tab ${state.adminTab === "admin-content" ? "active" : ""}" onclick="switchAdminTab('admin-content')">
            🗂️ Quản Lý Đề & Câu Hỏi
          </button>
          <button class="nav-tab ${state.adminTab === "admin-users" ? "active" : ""}" onclick="switchAdminTab('admin-users')">
            👥 Tài Khoản & Hệ Thống
          </button>
        `;
      }

      if (userContainer) {
        userContainer.innerHTML = `
          <div style="display:flex; align-items:center; gap:10px;">
            <button class="btn btn-outline btn-sm" style="background:rgba(255,255,255,0.1); color:white; border-color:rgba(255,255,255,0.25);" onclick="toggleAdminStudentPreview(true)" title="Xem giao diện dưới góc nhìn của Học sinh">
              👁️ Xem thử chế độ Học sinh
            </button>
            <div class="user-menu-pill" style="background:#1E293B; border-color:#334155; color:white;">
              <div class="user-menu-avatar" style="background:#D97706;">👑</div>
              <div>
                <div style="font-weight:700; line-height:1.2; font-size:0.84rem; color:white;">${currentUser.fullName}</div>
                <span class="user-role-tag admin">Quản trị viên</span>
              </div>
              <button class="btn-auth-action" style="color:#FCA5A5;" onclick="handleLogout()">
                [Đăng xuất]
              </button>
            </div>
          </div>
        `;
      }

      if (state.adminTab === "admin-monitor") {
        root.innerHTML = renderAdminMonitorView();
      } else if (state.adminTab === "admin-assignments") {
        root.innerHTML = renderAdminAssignmentsView();
      } else if (state.adminTab === "admin-content") {
        root.innerHTML = renderAdminContentView();
      } else if (state.adminTab === "admin-users") {
        root.innerHTML = renderAdminUsersView();
      }
      return;
    }

    // 3. GIAO DIỆN HỌC SINH (STUDENT PORTAL)
    if (mainHeader) mainHeader.classList.remove("admin-header-theme");
    const logoEl = document.getElementById("header-brand-logo");
    const titleEl = document.getElementById("header-brand-title");
    const subEl = document.getElementById("header-brand-subtitle");
    if (logoEl) {
      logoEl.textContent = "E8";
      logoEl.style.background = "linear-gradient(135deg, var(--primary), var(--secondary))";
    }
    if (titleEl) titleEl.textContent = "English Young 8";
    if (subEl) subEl.textContent = "Global Success • Học kì 1";

    if (previewBarRoot) {
      previewBarRoot.innerHTML = isAdmin
        ? `
          <div class="admin-preview-banner">
            <span>👁️ Bạn đang ở <strong>Chế độ Xem thử Giao diện Học sinh</strong>.</span>
            <button class="btn btn-primary btn-sm" style="padding:4px 12px; font-size:0.78rem;" onclick="toggleAdminStudentPreview(false)">
              ⬅ Quay lại Bảng Quản Trị Admin
            </button>
          </div>
        `
        : "";
    }

    // Đếm nhiệm vụ chưa hoàn thành của học sinh
    const pendingTasksCount = getStudentAssignedTasks().filter((t) => !t.isCompleted).length;

    if (navTabsEl) {
      navTabsEl.innerHTML = `
        <button class="nav-tab ${state.currentTab === "dashboard" ? "active" : ""}" onclick="switchMainTab('dashboard')">
          🏠 Bàn Học Của Em
          ${pendingTasksCount > 0 ? `<span class="badge-count" style="background:#F59E0B;">${pendingTasksCount}</span>` : ""}
        </button>
        <button class="nav-tab ${state.currentTab === "unit-study" ? "active" : ""}" onclick="switchMainTab('unit-study')">
          📚 Học Unit (1–6)
        </button>
        <button class="nav-tab ${state.currentTab === "exams" ? "active" : ""}" onclick="switchMainTab('exams')">
          📝 Luyện Đề Thi
        </button>
        <button class="nav-tab ${state.currentTab === "mistakes" ? "active" : ""}" onclick="switchMainTab('mistakes')">
          📓 Sổ Câu Sai
          ${stats.mistakeCount > 0 ? `<span class="badge-count">${stats.mistakeCount}</span>` : ""}
        </button>
        <button class="nav-tab ${state.currentTab === "student-progress" ? "active" : ""}" onclick="switchMainTab('student-progress')">
          🏆 Thành Tích
        </button>
      `;
    }

    if (userContainer) {
      userContainer.innerHTML = `
        <div class="user-menu-pill" style="flex-shrink:0; white-space:nowrap;">
          <div class="user-menu-avatar">🎓</div>
          <div>
            <div style="font-weight:700; line-height:1.15; font-size:0.84rem;">${currentUser.fullName}</div>
            <span class="user-role-tag student">Học sinh Lớp 8</span>
          </div>
          <button class="btn-auth-action" onclick="handleLogout()" title="Đăng xuất khỏi tài khoản">
            [Đăng xuất]
          </button>
        </div>
      `;
    }

    if (state.currentTab === "dashboard") {
      root.innerHTML = renderDashboard(stats);
    } else if (state.currentTab === "unit-study") {
      root.innerHTML = renderUnitStudy();
    } else if (state.currentTab === "exams") {
      root.innerHTML = renderExamsView();
    } else if (state.currentTab === "mistakes") {
      root.innerHTML = renderMistakesView();
    } else if (state.currentTab === "student-progress") {
      root.innerHTML = renderStudentProgressView(stats);
    }
  }

  // =========================================================================
  // TRANG ĐĂNG NHẬP & ĐĂNG KÝ TOÀN MÀN HÌNH (FULL-SCREEN AUTH PORTAL)
  // =========================================================================
  function renderFullAuthScreen() {
    const isLogin = state.authScreenTab === "login";

    return `
      <div class="auth-page-wrapper">
        <div class="auth-split-card">
          <!-- Cột Trái: Giới thiệu Hệ thống -->
          <div class="auth-brand-panel">
            <div>
              <div class="auth-brand-badge">
                <span>🇬🇧</span>
                <span>Tiếng Anh 8 • Global Success (GDPT Mới)</span>
              </div>
              <h2>Hệ Thống Ôn Tập & Luyện Thi Lớp 8</h2>
              <p>Nền tảng học từ vựng, nắm chắc ngữ pháp và luyện đề kiểm tra Học kì 1 với lộ trình cá nhân hóa và giám sát tiến độ trực tuyến.</p>

              <div class="auth-feature-list">
                <div class="auth-feature-item">
                  <span class="auth-feature-icon">🎓</span>
                  <div>
                    <strong>Không gian Học sinh riêng biệt</strong>
                    <span>Học Flashcard có phát âm chuẩn, làm đề thi bấm giờ, tự động lưu Sổ tay câu hay sai và nhận bài tập được giao.</span>
                  </div>
                </div>

                <div class="auth-feature-item">
                  <span class="auth-feature-icon">👑</span>
                  <div>
                    <strong>Cổng Quản trị & Giám sát (Dành cho Anh/Chị & Phụ huynh)</strong>
                    <span>Theo dõi điểm số từ xa, soi chi tiết từng câu trả lời, giao bài tập bắt buộc và quản lý ngân hàng đề thi.</span>
                  </div>
                </div>

                <div class="auth-feature-item">
                  <span class="auth-feature-icon">☁️</span>
                  <div>
                    <strong>Đồng bộ đám mây thời gian thực</strong>
                    <span>Học trên bất kỳ máy tính hay điện thoại nào, dữ liệu được lưu trữ an toàn trên cơ sở dữ liệu đám mây.</span>
                  </div>
                </div>
              </div>
            </div>

            <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.15); font-size: 0.8rem; color: #C7D2FE; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
              <span>© 2026 English Young 8 Learning Platform</span>
              <span>🟢 Máy chủ Cloud: Sẵn sàng</span>
            </div>
          </div>

          <!-- Cột Phải: Form Đăng Nhập / Đăng Ký -->
          <div class="auth-form-panel">
            <div style="margin-bottom: 18px;">
              <h3 style="font-size: 1.5rem; font-weight: 900; color: var(--text-main); margin-bottom: 4px;">
                ${isLogin ? "Chào mừng quay trở lại! 👋" : "Tạo tài khoản Học sinh mới ✨"}
              </h3>
              <p style="font-size: 0.88rem; color: var(--text-muted);">
                ${
                  isLogin
                    ? "Đăng nhập bằng tài khoản Học sinh để vào bàn học, hoặc tài khoản Admin để vào trang quản lý."
                    : "Điền thông tin bên dưới để tạo tài khoản học tập riêng cho em."
                }
              </p>
            </div>

            <div class="auth-mode-switch">
              <button class="auth-mode-btn ${isLogin ? "active" : ""}" onclick="switchAuthScreenMode('login')">
                🔑 Đăng Nhập
              </button>
              <button class="auth-mode-btn ${!isLogin ? "active" : ""}" onclick="switchAuthScreenMode('register')">
                📝 Đăng Ký Học Sinh
              </button>
            </div>

            ${
              isLogin
                ? `
                <!-- FORM ĐĂNG NHẬP -->
                <form onsubmit="event.preventDefault(); submitAuthLogin();">
                  <div class="form-field">
                    <label for="auth-login-user">Tên đăng nhập (Username)</label>
                    <div class="input-with-icon">
                      <input id="auth-login-user" type="text" autocomplete="username" placeholder="Ví dụ: em_lop8 hoặc tên đăng nhập của bạn" required />
                    </div>
                  </div>

                  <div class="form-field">
                    <label for="auth-login-pass">Mật khẩu / Mã PIN</label>
                    <div class="input-with-icon">
                      <input id="auth-login-pass" type="${state.showPassword ? "text" : "password"}" autocomplete="current-password" placeholder="Nhập mật khẩu..." required />
                      <button type="button" class="pwd-toggle-btn" onclick="toggleAuthPasswordVisibility()" title="Hiện/Ẩn mật khẩu">
                        ${state.showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>

                  <div id="auth-screen-error" style="display:none; margin-bottom:14px; padding:10px 14px; border-radius:10px; background:#FEF2F2; border:1px solid #FECACA; color:#991B1B; font-size:0.85rem; font-weight:600;"></div>

                  <button type="submit" id="auth-submit-btn" class="btn btn-primary" style="width:100%; padding:13px; font-size:0.96rem; border-radius:10px;">
                    Đăng Nhập Vào Hệ Thống ➔
                  </button>
                </form>

                <div style="margin-top: 22px; padding: 14px; background: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 12px; font-size: 0.82rem; color: var(--text-muted);">
                  <div style="font-weight: 700; color: var(--text-main); margin-bottom: 6px;">💡 Hướng dẫn dành cho Học sinh:</div>
                  <div>• Tài khoản học sinh mặc định: Tên đăng nhập <code>em_lop8</code> — Mã PIN: <code>1234</code></div>
                  <div style="margin-top:4px;">• Hoặc em có thể bấm sang tab <strong>"Đăng Ký Học Sinh"</strong> để tự tạo tài khoản mang tên mình.</div>
                </div>
              `
                : `
                <!-- FORM ĐĂNG KÝ TÀI KHOẢN HỌC SINH (KHÔNG CHO PHÉP TỰ CHỌN ADMIN) -->
                <form onsubmit="event.preventDefault(); submitAuthRegister();">
                  <div class="form-field">
                    <label for="auth-reg-fullname">Họ và Tên học sinh</label>
                    <input id="auth-reg-fullname" class="form-control-input" type="text" placeholder="Ví dụ: Nguyễn Minh Trang" required />
                  </div>

                  <div class="form-field">
                    <label for="auth-reg-user">Tên đăng nhập (viết liền, không dấu)</label>
                    <input id="auth-reg-user" class="form-control-input" type="text" placeholder="Ví dụ: minhtrang8" required />
                  </div>

                  <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
                    <div class="form-field">
                      <label for="auth-reg-pass">Mật khẩu (tối thiểu 4 ký tự)</label>
                      <input id="auth-reg-pass" class="form-control-input" type="password" placeholder="Nhập mật khẩu..." required />
                    </div>
                    <div class="form-field">
                      <label for="auth-reg-pass-confirm">Nhập lại mật khẩu</label>
                      <input id="auth-reg-pass-confirm" class="form-control-input" type="password" placeholder="Xác nhận mật khẩu..." required />
                    </div>
                  </div>

                  <div style="margin-bottom: 16px; padding: 10px 12px; background: #EEF2FF; border-radius: 8px; font-size: 0.8rem; color: #3730A3;">
                    🎓 Tài khoản đăng ký tại đây được phân quyền mặc định là <strong>Học sinh Lớp 8</strong>.
                  </div>

                  <div id="auth-screen-error" style="display:none; margin-bottom:14px; padding:10px 14px; border-radius:10px; background:#FEF2F2; border:1px solid #FECACA; color:#991B1B; font-size:0.85rem; font-weight:600;"></div>

                  <button type="submit" id="auth-reg-submit-btn" class="btn btn-primary" style="width:100%; padding:13px; font-size:0.96rem; border-radius:10px;">
                    ✨ Hoàn Tất Đăng Ký & Vào Học Ngay
                  </button>
                </form>
              `
            }
          </div>
        </div>
      </div>
    `;
  }

  window.switchAuthScreenMode = function (mode) {
    state.authScreenTab = mode;
    renderApp();
  };

  window.toggleAuthPasswordVisibility = function () {
    const uVal = document.getElementById("auth-login-user")?.value || "";
    const pVal = document.getElementById("auth-login-pass")?.value || "";
    state.showPassword = !state.showPassword;
    renderApp();
    const uEl = document.getElementById("auth-login-user");
    const pEl = document.getElementById("auth-login-pass");
    if (uEl) uEl.value = uVal;
    if (pEl) pEl.value = pVal;
  };

  window.submitAuthLogin = async function () {
    const uEl = document.getElementById("auth-login-user");
    const pEl = document.getElementById("auth-login-pass");
    const errEl = document.getElementById("auth-screen-error");
    const btnEl = document.getElementById("auth-submit-btn");

    if (!uEl || !pEl) return;
    if (btnEl) {
      btnEl.disabled = true;
      btnEl.textContent = "⏳ Đang kiểm tra đăng nhập...";
    }

    const res = await window.EY8_Supabase.login(uEl.value, pEl.value);
    if (res.success) {
      state.adminPreviewStudentMode = false;
      loadActiveUserLocalProgress();
      await loadSystemStoreAndApply();
      if (window.EY8_Supabase.isAdmin()) {
        state.adminTab = "admin-monitor";
        await refreshAdminUsersList();
        await loadAdminInspectedStudent(state.adminSelectedStudent);
      } else {
        state.currentTab = "dashboard";
        await syncCloudData(true);
      }
      renderApp();
    } else {
      if (btnEl) {
        btnEl.disabled = false;
        btnEl.textContent = "Đăng Nhập Vào Hệ Thống ➔";
      }
      if (errEl) {
        errEl.style.display = "block";
        errEl.textContent = "⚠️ " + (res.message || "Sai tên đăng nhập hoặc mật khẩu!");
      }
    }
  };

  window.submitAuthRegister = async function () {
    const nameEl = document.getElementById("auth-reg-fullname");
    const userEl = document.getElementById("auth-reg-user");
    const passEl = document.getElementById("auth-reg-pass");
    const confirmEl = document.getElementById("auth-reg-pass-confirm");
    const errEl = document.getElementById("auth-screen-error");
    const btnEl = document.getElementById("auth-reg-submit-btn");

    if (!nameEl || !userEl || !passEl || !confirmEl) return;

    if (passEl.value !== confirmEl.value) {
      if (errEl) {
        errEl.style.display = "block";
        errEl.textContent = "⚠️ Mật khẩu xác nhận không khớp. Vui lòng nhập lại!";
      }
      return;
    }

    if (btnEl) {
      btnEl.disabled = true;
      btnEl.textContent = "⏳ Đang khởi tạo tài khoản...";
    }

    const res = await window.EY8_Supabase.register({
      fullName: nameEl.value,
      username: userEl.value,
      password: passEl.value,
      role: "student",
      createdByAdmin: false
    });

    if (res.success) {
      state.currentTab = "dashboard";
      loadActiveUserLocalProgress();
      await loadSystemStoreAndApply();
      renderApp();
    } else {
      if (btnEl) {
        btnEl.disabled = false;
        btnEl.textContent = "✨ Hoàn Tất Đăng Ký & Vào Học Ngay";
      }
      if (errEl) {
        errEl.style.display = "block";
        errEl.textContent = "⚠️ " + (res.message || "Không thể đăng ký tài khoản!");
      }
    }
  };

  window.handleLogout = function () {
    stopExamTimer();
    state.activeExam = null;
    state.adminPreviewStudentMode = false;
    if (window.EY8_Supabase) {
      window.EY8_Supabase.logout();
    }
    closeModal();
    renderApp();
  };

  // =========================================================================
  // KIỂM TRA NHIỆM VỤ ĐƯỢC ADMIN GIAO CHO HỌC SINH
  // =========================================================================
  function evaluateAssignmentStatus(task, studentRecord) {
    const eHistory = (studentRecord && studentRecord.examHistory) || [];
    const uScores = (studentRecord && studentRecord.unitScores) || {};
    const learnedMap = (studentRecord && studentRecord.learnedVocab) || {};

    if (task.targetType === "exam") {
      const attempts = eHistory.filter((h) => h.examId === task.targetId);
      const best = attempts.length > 0 ? Math.max(...attempts.map((a) => Number(a.score10 || 0))) : null;
      const isCompleted = best !== null && best >= Number(task.minScore || 5);
      return {
        isCompleted,
        bestScoreText: best !== null ? `${best} / 10 điểm` : "Chưa làm",
        attemptsCount: attempts.length
      };
    } else {
      // Unit task
      const unit = (window.STUDY_DATA.units || []).find((u) => u.id === task.targetId);
      const totalQ = unit && unit.practice ? unit.practice.length : 12;
      const rawBest = uScores[task.targetId];
      const score10 = rawBest !== undefined ? Number(((rawBest / totalQ) * 10).toFixed(1)) : null;
      const learnedInUnit = unit ? unit.vocabulary.filter((v) => learnedMap[v.id]).length : 0;
      const totalV = unit ? unit.vocabulary.length : 15;
      const isCompleted = score10 !== null && score10 >= Number(task.minScore || 7);
      return {
        isCompleted,
        bestScoreText:
          score10 !== null
            ? `Bài tập: ${score10}/10đ (${learnedInUnit}/${totalV} từ)`
            : `Chưa làm bài tập (${learnedInUnit}/${totalV} từ)`,
        attemptsCount: rawBest !== undefined ? 1 : 0
      };
    }
  }

  function getStudentAssignedTasks() {
    const uName = getActiveUsername();
    const list = state.systemStore.assignments || [];
    return list
      .filter((t) => !t.studentUsername || t.studentUsername === "all" || t.studentUsername.toLowerCase() === uName)
      .map((t) => {
        const evalRes = evaluateAssignmentStatus(t, state);
        return { ...t, ...evalRes };
      });
  }

  window.startAssignedTask = function (targetType, targetId) {
    if (targetType === "exam") {
      startExamById(targetId);
    } else {
      openUnitWithSubTab(targetId, "vocab");
    }
  };

  // =========================================================================
  // 1. STUDENT PORTAL: BÀN HỌC CỦA EM (DASHBOARD / COMMAND CENTER)
  // =========================================================================
  function renderDashboard(stats) {
    const units = window.STUDY_DATA.units || [];
    const exams = window.STUDY_DATA.exams || [];
    const currentUser = (window.EY8_Supabase && window.EY8_Supabase.getCurrentUser()) || {
      fullName: "Học sinh"
    };
    const assignedTasks = getStudentAssignedTasks();

    // Tìm Unit học sinh đang học dở (hoặc Unit đầu tiên chưa hoàn thành)
    let activeUnit = units[0];
    for (let i = 0; i < units.length; i++) {
      const u = units[i];
      const lCount = u.vocabulary.filter((v) => state.learnedVocab[v.id]).length;
      const qScore = state.unitScores[u.id];
      const isStarted = lCount > 0 || qScore !== undefined;
      const isDone = lCount === u.vocabulary.length && qScore !== undefined && qScore >= u.practice.length * 0.8;
      if (isStarted && !isDone) {
        activeUnit = u;
        break;
      }
    }
    if (!activeUnit) activeUnit = units[0];

    const activeLearnedV = activeUnit.vocabulary.filter((v) => state.learnedVocab[v.id]).length;
    const activeTotalV = activeUnit.vocabulary.length;
    const activeUnlearnedList = activeUnit.vocabulary.filter((v) => !state.learnedVocab[v.id]);
    const activeBestQuiz = state.unitScores[activeUnit.id];

    // Chọn 1 từ vựng chưa thuộc tiêu biểu trong ngày để hiển thị ở Sidebar
    let spotlightVocab = activeUnlearnedList[0] || null;
    let spotlightUnit = activeUnit;
    if (!spotlightVocab) {
      for (const u of units) {
        const found = u.vocabulary.find((v) => !state.learnedVocab[v.id]);
        if (found) {
          spotlightVocab = found;
          spotlightUnit = u;
          break;
        }
      }
    }
    if (!spotlightVocab && activeUnit && activeUnit.vocabulary.length > 0) {
      spotlightVocab = activeUnit.vocabulary[0];
    }

    // Tính % tiến độ Học kì 1
    const vocabPct = stats.totalVocab > 0 ? Math.round((stats.learnedCount / stats.totalVocab) * 100) : 0;
    const unitPct = stats.totalUnits > 0 ? Math.round((stats.completedUnits / stats.totalUnits) * 100) : 0;
    const avgScoreNum = stats.avgExamScore !== "--" ? Number(stats.avgExamScore) : 0;
    const examScorePct = Math.min(100, Math.round(avgScoreNum * 10));
    const overallMasteryPct = Math.round((vocabPct + unitPct + (stats.examCount > 0 ? examScorePct : 0)) / (stats.examCount > 0 ? 3 : 2));

    // Nhiệm vụ được Admin giao
    const assignedTasksHtml =
      assignedTasks.length > 0
        ? `
        <div class="assigned-tasks-panel">
          <div class="assigned-tasks-header">
            <div>
              <h3 style="font-size:1.12rem; font-weight:800; color:#92400E;">
                📌 Nhiệm Vụ Học Tập Anh/Chị Giao Cho Em (${assignedTasks.filter((x) => x.isCompleted).length}/${assignedTasks.length} hoàn thành)
              </h3>
              <p style="font-size:0.84rem; color:#B45309;">Hãy hoàn thành các bài tập dưới đây đúng hạn và đạt điểm mục tiêu nhé!</p>
            </div>
          </div>
          <div class="assigned-task-grid">
            ${assignedTasks
              .map(
                (t) => `
                <div class="assigned-task-card ${t.isCompleted ? "completed" : ""}">
                  <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:6px;">
                      <span style="font-size:0.74rem; font-weight:800; padding:3px 9px; border-radius:99px; background:${t.isCompleted ? "#10B981" : "#F59E0B"}; color:white;">
                        ${t.isCompleted ? "✅ ĐÃ HOÀN THÀNH" : "⏳ CẦN LÀM"}
                      </span>
                      <span style="font-size:0.78rem; color:var(--text-muted); font-weight:600;">📅 Hạn: ${t.dueDate || "Trong tuần"}</span>
                    </div>
                    <h4 style="font-size:0.98rem; font-weight:800; color:var(--text-main); margin-bottom:4px;">${t.title}</h4>
                    <div style="font-size:0.82rem; color:#475569; margin-bottom:6px;">
                      🎯 Yêu cầu đạt: <strong>≥ ${t.minScore} điểm</strong> • Hiện tại: <strong>${t.bestScoreText}</strong>
                    </div>
                    ${
                      t.note
                        ? `<div style="font-size:0.8rem; background:rgba(0,0,0,0.03); padding:6px 10px; border-radius:6px; color:#334155; font-style:italic;">💬 Lời nhắn: "${t.note}"</div>`
                        : ""
                    }
                  </div>
                  <button class="btn ${t.isCompleted ? "btn-outline" : "btn-primary"} btn-sm" style="width:100%" onclick="startAssignedTask('${t.targetType}', '${t.targetId}')">
                    ${t.isCompleted ? "🔄 Ôn lại bài này" : "✍️ Bắt đầu làm ngay ➔"}
                  </button>
                </div>
              `
              )
              .join("")}
          </div>
        </div>
      `
        : "";

    // Danh sách thẻ 6 Unit đã nâng cấp
    const unitCardsHtml = units
      .map((u) => {
        const totalV = u.vocabulary.length;
        const learnedV = u.vocabulary.filter((v) => state.learnedVocab[v.id]).length;
        const vPct = Math.round((learnedV / totalV) * 100);
        const totalQ = u.practice.length;
        const bestQuiz = state.unitScores[u.id];
        const qPct = bestQuiz !== undefined ? Math.round((bestQuiz / totalQ) * 100) : 0;
        const quizScore10 = bestQuiz !== undefined ? ((bestQuiz / totalQ) * 10).toFixed(1) : null;

        const isCompleted = learnedV === totalV && bestQuiz !== undefined && qPct >= 80;
        const isInProgress = !isCompleted && (learnedV > 0 || bestQuiz !== undefined);

        let statusClass = "status-not-started";
        let chipClass = "not-started";
        let chipText = "⚪ Chưa học";
        if (isCompleted) {
          statusClass = "status-completed";
          chipClass = "completed";
          chipText = "✅ Đã hoàn thành";
        } else if (isInProgress) {
          statusClass = "status-in-progress";
          chipClass = "in-progress";
          chipText = "🔥 Đang học dở";
        }

        return `
          <div class="unit-card-modern ${statusClass}" onclick="openUnitWithSubTab('${u.id}', 'vocab')">
            <div>
              <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:10px; margin-bottom:12px;">
                <div style="display:flex; align-items:center; gap:12px;">
                  <div class="unit-icon" style="background:${u.color}; width:46px; height:46px; font-size:1.4rem;">${u.icon}</div>
                  <div>
                    <div class="unit-badge" style="color:${u.color}">UNIT ${u.number} • HỌC KÌ 1</div>
                    <div class="unit-title" style="font-size:1.1rem;">${u.title}</div>
                    <div class="unit-vi-title">${u.viTitle}</div>
                  </div>
                </div>
                <span class="unit-status-chip ${chipClass}">${chipText}</span>
              </div>

              <p class="unit-summary" style="margin-bottom:0;">${u.summary}</p>
            </div>

            <div>
              <div class="unit-dual-metrics">
                <div class="unit-metric-line">
                  <div class="unit-metric-label">
                    <span>📚 Từ vựng đã thuộc</span>
                    <strong>${learnedV}/${totalV} từ (${vPct}%)</strong>
                  </div>
                  <div class="mastery-bar-track" style="height:6px; background:#E2E8F0;">
                    <div class="mastery-bar-fill" style="width:${vPct}%; background:${u.color};"></div>
                  </div>
                </div>

                <div class="unit-metric-line">
                  <div class="unit-metric-label">
                    <span>🎯 Bài tập thực hành</span>
                    <strong>${
                      bestQuiz !== undefined
                        ? `${bestQuiz}/${totalQ} câu (${quizScore10}đ)`
                        : "Chưa làm"
                    }</strong>
                  </div>
                  <div class="mastery-bar-track" style="height:6px; background:#E2E8F0;">
                    <div class="mastery-bar-fill" style="width:${qPct}%; background:#10B981;"></div>
                  </div>
                </div>
              </div>

              <div class="unit-step-buttons" style="margin-top:12px;" onclick="event.stopPropagation()">
                <button class="unit-step-btn" onclick="openUnitWithSubTab('${u.id}', 'vocab')">
                  🃏 Từ vựng
                </button>
                <button class="unit-step-btn" onclick="openUnitWithSubTab('${u.id}', 'grammar')">
                  📐 Ngữ pháp
                </button>
                <button class="unit-step-btn primary-step" style="background:${u.color}" onclick="openUnitWithSubTab('${u.id}', 'practice')">
                  ✍️ Luyện tập
                </button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    // Danh sách 4 đề thi tiêu biểu ở cột phải
    const featuredExams = exams.slice(0, 4);
    const quickExamsHtml = featuredExams
      .map((ex) => {
        const attempts = state.examHistory.filter((h) => h.examId === ex.id);
        const bestScore =
          attempts.length > 0 ? Math.max(...attempts.map((a) => Number(a.score10 || 0))) : null;
        return `
          <div class="quick-exam-item">
            <div style="min-width:0;">
              <div style="font-size:0.84rem; font-weight:800; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${ex.title}
              </div>
              <div style="font-size:0.75rem; color:var(--text-muted);">
                ⏱️ ${ex.durationMinutes} phút • ${ex.questions.length} câu ${
                  bestScore !== null
                    ? `• <strong style="color:${bestScore >= 7 ? "#059669" : "#D97706"}">Cao nhất: ${bestScore}đ</strong>`
                    : "• Chưa thi"
                }
              </div>
            </div>
            <button class="btn btn-outline btn-sm" style="flex-shrink:0; padding:5px 10px; font-size:0.76rem;" onclick="startExamById('${ex.id}')">
              ${bestScore !== null ? "Thi lại" : "Làm đề ➔"}
            </button>
          </div>
        `;
      })
      .join("");

    return `
      ${assignedTasksHtml}

      <!-- TẦNG 1: WELCOME HUB 2 CỘT (TRÁI: TIẾP TỤC HỌC THÔNG MINH | PHẢI: TIẾN ĐỘ HỌC KÌ 1) -->
      <div class="dashboard-welcome-hub">
        <div class="welcome-hero-card">
          <div>
            <div class="welcome-user-greeting" style="margin-bottom:10px;">
              <span class="welcome-pill-tag">✨ Tiếng Anh 8 Global Success • Học kì 1</span>
              <span style="font-size:0.8rem; color:#C7D2FE; font-weight:600;">
                🎓 Tài khoản: <strong style="color:white;">${currentUser.fullName}</strong>
              </span>
            </div>
            <h2 style="font-size:1.55rem; font-weight:900; line-height:1.25; margin-bottom:6px;">
              Chào ${currentUser.fullName}, cùng bứt phá điểm số hôm nay nhé! 🚀
            </h2>
            <p style="font-size:0.9rem; color:#E0E7FF;">
              Hệ thống đã tự động ghi nhớ tiến độ học của em. Hãy tiếp tục bài học đang dang dở bên dưới:
            </p>
          </div>

          <div class="continue-study-spotlight">
            <div style="display:flex; align-items:center; gap:12px;">
              <div class="unit-icon" style="background:${activeUnit.color}; width:48px; height:48px; font-size:1.45rem; border:2px solid rgba(255,255,255,0.4);">
                ${activeUnit.icon}
              </div>
              <div>
                <div style="font-size:0.74rem; font-weight:800; color:#FDE68A; text-transform:uppercase; letter-spacing:0.04em;">
                  📍 ĐANG HỌC DỞ • UNIT ${activeUnit.number}
                </div>
                <div style="font-size:1.05rem; font-weight:800; color:white;">
                  ${activeUnit.title} (${activeUnit.viTitle})
                </div>
                <div style="font-size:0.8rem; color:#E0E7FF;">
                  Đã thuộc: <strong>${activeLearnedV}/${activeTotalV} từ</strong> • Bài tập: <strong>${
                    activeBestQuiz !== undefined ? activeBestQuiz + "/" + activeUnit.practice.length + " câu" : "Chưa làm"
                  }</strong>
                </div>
              </div>
            </div>

            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button class="btn btn-white btn-sm" style="padding:9px 15px; font-weight:800;" onclick="openUnitWithSubTab('${activeUnit.id}', 'vocab')">
                ▶ Học tiếp Từ vựng (${activeTotalV - activeLearnedV} từ còn lại)
              </button>
              <button class="btn btn-outline-white btn-sm" style="padding:9px 14px;" onclick="openUnitWithSubTab('${activeUnit.id}', 'practice')">
                ✍️ Làm bài tập
              </button>
            </div>
          </div>
        </div>

        <!-- Cột Phải Tầng 1: Bảng Tiến Độ Tổng Quan Học Kì 1 -->
        <div class="semester-mastery-card">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
            <div>
              <h3 style="font-size:1.05rem; font-weight:800; color:var(--text-main);">📊 Tiến Độ Học Kì 1 Của Em</h3>
              <p style="font-size:0.78rem; color:var(--text-muted);">Tổng hợp từ 6 Unit & Phòng luyện đề</p>
            </div>
            <span style="font-size:0.82rem; font-weight:800; padding:5px 12px; border-radius:99px; background:#EEF2FF; color:#4F46E5;">
              Đạt ${overallMasteryPct}%
            </span>
          </div>

          <div style="display:flex; flex-direction:column; gap:12px;">
            <div class="mastery-metric-row">
              <div class="mastery-metric-top">
                <span>📖 Từ vựng HK1 đã thuộc</span>
                <span style="color:#4F46E5;">${stats.learnedCount} / ${stats.totalVocab} từ (${vocabPct}%)</span>
              </div>
              <div class="mastery-bar-track">
                <div class="mastery-bar-fill" style="width:${vocabPct}%; background:#4F46E5;"></div>
              </div>
            </div>

            <div class="mastery-metric-row">
              <div class="mastery-metric-top">
                <span>✅ Bài tập thực hành 6 Unit</span>
                <span style="color:#059669;">${stats.completedUnits} / ${stats.totalUnits} Unit (${unitPct}%)</span>
              </div>
              <div class="mastery-bar-track">
                <div class="mastery-bar-fill" style="width:${unitPct}%; background:#10B981;"></div>
              </div>
            </div>

            <div class="mastery-metric-row">
              <div class="mastery-metric-top">
                <span>🏆 Điểm TB Luyện đề (${stats.examCount} lượt)</span>
                <span style="color:#D97706;">${stats.avgExamScore} / 10 điểm</span>
              </div>
              <div class="mastery-bar-track">
                <div class="mastery-bar-fill" style="width:${examScorePct}%; background:#F59E0B;"></div>
              </div>
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; padding-top:8px; border-top:1px dashed var(--border); font-size:0.8rem;">
            <span style="color:var(--text-muted);">☁️ Đã đồng bộ tự động</span>
            <button class="btn-auth-action" style="color:var(--primary); font-weight:700;" onclick="switchMainTab('student-progress')">
              Xem báo cáo chi tiết ➔
            </button>
          </div>
        </div>
      </div>

      <!-- TẦNG 2: 3 HÀNH ĐỘNG ƯU TIÊN TRONG NGÀY (PRIORITY ACTION STRIP) -->
      <div class="priority-actions-grid">
        <div class="priority-action-card active-study" onclick="openUnitWithSubTab('${activeUnit.id}', 'vocab')">
          <div style="display:flex; align-items:center; gap:12px;">
            <div class="priority-icon-box" style="background:#EEF2FF; color:#4F46E5;">🃏</div>
            <div>
              <div style="font-size:0.74rem; font-weight:800; color:#4F46E5; text-transform:uppercase;">Bước 1 • Học Flashcard</div>
              <div style="font-size:0.96rem; font-weight:800; color:var(--text-main);">
                Unit ${activeUnit.number} còn ${activeTotalV - activeLearnedV} từ chưa thuộc
              </div>
              <div style="font-size:0.78rem; color:var(--text-muted);">Bấm để mở các thẻ từ chưa thuộc</div>
            </div>
          </div>
          <span style="font-weight:800; color:#4F46E5; font-size:1.1rem;">➔</span>
        </div>

        <div class="priority-action-card ${stats.mistakeCount > 0 ? "urgent-alert" : ""}" onclick="switchMainTab('mistakes')">
          <div style="display:flex; align-items:center; gap:12px;">
            <div class="priority-icon-box" style="background:#FEE2E2; color:#DC2626;">📓</div>
            <div>
              <div style="font-size:0.74rem; font-weight:800; color:#DC2626; text-transform:uppercase;">Bước 2 • Gỡ Câu Hay Sai</div>
              <div style="font-size:0.96rem; font-weight:800; color:var(--text-main);">
                ${stats.mistakeCount > 0 ? `Đang có ${stats.mistakeCount} câu sai cần ôn lại` : "Tuyệt vời! 0 câu tồn đọng"}
              </div>
              <div style="font-size:0.78rem; color:var(--text-muted);">
                ${stats.mistakeCount > 0 ? "Làm đúng lại để xóa khỏi sổ tay" : "Em đã nắm vững các câu từng sai"}
              </div>
            </div>
          </div>
          <span style="font-weight:800; color:#DC2626; font-size:1.1rem;">➔</span>
        </div>

        <div class="priority-action-card exam-ready" onclick="switchMainTab('exams')">
          <div style="display:flex; align-items:center; gap:12px;">
            <div class="priority-icon-box" style="background:#FEF3C7; color:#D97706;">⏱️</div>
            <div>
              <div style="font-size:0.74rem; font-weight:800; color:#B45309; text-transform:uppercase;">Bước 3 • Phòng Luyện Đề</div>
              <div style="font-size:0.96rem; font-weight:800; color:var(--text-main);">
                ${exams.length} Đề kiểm tra 15p, Giữa kì & Cuối kì
              </div>
              <div style="font-size:0.78rem; color:var(--text-muted);">Bấm giờ tự động & giải thích chi tiết</div>
            </div>
          </div>
          <span style="font-weight:800; color:#D97706; font-size:1.1rem;">➔</span>
        </div>
      </div>

      <!-- TẦNG 3: BỐ CỤC 2 CỘT (TRÁI: LỘ TRÌNH 6 UNIT | PHẢI: TIỆN ÍCH HỌC NHANH) -->
      <div class="dashboard-main-layout">
        <!-- Cột Trái: 6 Unit -->
        <div>
          <div class="section-header" style="margin-bottom:14px;">
            <h2>📚 Lộ Trình 6 Unit Học Kì 1 (Global Success 8)</h2>
            <span style="font-size: 0.83rem; color: var(--text-muted);">
              Chọn từng Unit để học Từ vựng, Ngữ pháp & Bài tập
            </span>
          </div>
          <div class="units-grid-modern">
            ${unitCardsHtml}
          </div>
        </div>

        <!-- Cột Phải: Tiện Ích Học Nhanh Ngay Trên Trang Chủ -->
        <div class="dashboard-side-panel">
          <!-- Widget 1: Từ vựng nhanh trong ngày -->
          ${
            spotlightVocab
              ? `
              <div class="side-widget-card">
                <div class="side-widget-header">
                  <h3>💡 Từ Vựng Cần Nhớ Hôm Nay</h3>
                  <span style="font-size:0.72rem; font-weight:700; color:#4F46E5; background:#EEF2FF; padding:2px 8px; border-radius:99px;">
                    Unit ${spotlightUnit.number}
                  </span>
                </div>
                <div class="quick-word-box">
                  <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:8px; margin-bottom:6px;">
                    <div>
                      <div style="font-size:1.35rem; font-weight:900; color:#1E1B4B; line-height:1.2;">
                        ${spotlightVocab.word}
                      </div>
                      <div style="font-size:0.84rem; color:#64748B; font-family:monospace; margin-top:2px;">
                        ${spotlightVocab.ipa} • <strong>${spotlightVocab.type}</strong>
                      </div>
                    </div>
                    <button class="speaker-btn" onclick="speakEnglish('${spotlightVocab.word.replace(/'/g, "\\'")}', event)" title="Nghe phát âm">
                      🔊
                    </button>
                  </div>
                  <div style="font-size:1rem; font-weight:800; color:#0F172A; margin-bottom:6px;">
                    👉 ${spotlightVocab.meaning}
                  </div>
                  <div style="font-size:0.82rem; color:#334155; font-style:italic; margin-bottom:4px;">
                    "${spotlightVocab.example}"
                  </div>
                  <div style="font-size:0.77rem; color:#64748B; margin-bottom:10px;">
                    (${spotlightVocab.exampleVi})
                  </div>
                  <div style="font-size:0.76rem; background:#FFFBEB; border:1px solid #FDE68A; color:#92400E; padding:6px 10px; border-radius:8px; margin-bottom:12px;">
                    💡 ${spotlightVocab.tip}
                  </div>
                  <div style="display:flex; gap:8px;">
                    <button class="btn btn-primary btn-sm" style="flex:1;" onclick="markVocabLearned('${spotlightVocab.id}', false)">
                      ✅ Đã thuộc từ này
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="openUnitWithSubTab('${spotlightUnit.id}', 'vocab')">
                      Học Unit ${spotlightUnit.number}
                    </button>
                  </div>
                </div>
              </div>
            `
              : ""
          }

          <!-- Widget 2: Đề Thi Thử Nhanh -->
          <div class="side-widget-card">
            <div class="side-widget-header">
              <h3>📝 Đề Thi Thử Trọng Tâm</h3>
              <button class="btn-auth-action" style="color:var(--primary); font-weight:700;" onclick="switchMainTab('exams')">
                Tất cả (${exams.length}) ➔
              </button>
            </div>
            <div>
              ${quickExamsHtml}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 2. STUDENT PORTAL: HỌC THEO UNIT (TỪ VỰNG, NGỮ PHÁP, BÀI TẬP)
  // =========================================================================
  function renderUnitStudy() {
    const units = window.STUDY_DATA.units || [];
    const unit = units.find((u) => u.id === state.selectedUnitId) || units[0];

    const unitSelectorHtml = units
      .map(
        (u) => `
        <button class="unit-pill ${u.id === unit.id ? "active" : ""}" onclick="selectUnit('${u.id}')">
          ${u.icon} Unit ${u.number}: ${u.title}
        </button>
      `
      )
      .join("");

    let subContentHtml = "";
    if (state.unitSubTab === "vocab") {
      subContentHtml = renderUnitVocabSubTab(unit);
    } else if (state.unitSubTab === "grammar") {
      subContentHtml = renderUnitGrammarSubTab(unit);
    } else if (state.unitSubTab === "practice") {
      subContentHtml = renderUnitPracticeSubTab(unit);
    }

    return `
      <div class="unit-selector-bar">
        ${unitSelectorHtml}
      </div>

      <div style="background:white; padding:22px 24px; border-radius:var(--radius-lg); border:1px solid var(--border); margin-bottom:20px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div class="unit-icon" style="background:${unit.color}; width:52px; height:52px; font-size:1.6rem;">${unit.icon}</div>
          <div>
            <div style="font-size:0.8rem; font-weight:700; color:${unit.color}; text-transform:uppercase;">UNIT ${unit.number} • TIẾNG ANH 8 GLOBAL SUCCESS</div>
            <h2 style="font-size:1.4rem; font-weight:800;">${unit.title} (${unit.viTitle})</h2>
            <p style="font-size:0.88rem; color:var(--text-muted);">${unit.summary}</p>
          </div>
        </div>
      </div>

      <div class="sub-tabs">
        <button class="sub-tab ${state.unitSubTab === "vocab" ? "active" : ""}" onclick="switchUnitSubTab('vocab')">
          🗂️ 1. Từ vựng & Flashcard (${unit.vocabulary.length} từ)
        </button>
        <button class="sub-tab ${state.unitSubTab === "grammar" ? "active" : ""}" onclick="switchUnitSubTab('grammar')">
          📐 2. Ngữ âm & Ngữ pháp trọng tâm
        </button>
        <button class="sub-tab ${state.unitSubTab === "practice" ? "active" : ""}" onclick="switchUnitSubTab('practice')">
          ✍️ 3. Bài tập thực hành Unit ${unit.number} (${unit.practice.length} câu)
        </button>
      </div>

      ${subContentHtml}
    `;
  }

  window.selectUnit = function (unitId) {
    state.selectedUnitId = unitId;
    state.unitQuizAnswers = {};
    state.unitQuizSubmitted = false;
    resetFlashcardPositionForUnit(unitId);
    renderApp();
  };

  window.switchUnitSubTab = function (subTab) {
    state.unitSubTab = subTab;
    renderApp();
  };

  function getActiveFlashcardDeck(unit) {
    const vocabList = (unit && unit.vocabulary) || [];
    if (state.fcDeckMode === "unlearned") {
      return vocabList.filter((v) => !state.learnedVocab[v.id]);
    }
    return vocabList;
  }

  function renderUnitVocabSubTab(unit) {
    const vocabList = unit.vocabulary || [];
    const totalCount = vocabList.length;
    const learnedInUnit = vocabList.filter((v) => state.learnedVocab[v.id]).length;
    const unlearnedCount = totalCount - learnedInUnit;
    const progressPct = totalCount > 0 ? Math.round((learnedInUnit / totalCount) * 100) : 0;

    // Bộ thẻ đang hiển thị trên Flashcard Studio
    const activeDeck = getActiveFlashcardDeck(unit);
    if (state.fcIndex >= activeDeck.length) {
      state.fcIndex = Math.max(0, activeDeck.length - 1);
    }
    const currentCard = activeDeck[state.fcIndex] || null;
    const isCurrentLearned = currentCard ? !!state.learnedVocab[currentCard.id] : false;

    // Phần 1: Nội dung bên trong Flashcard Studio Stage
    let flashcardBodyHtml = "";
    if (!currentCard) {
      // Đã thuộc hết 100% từ trong chế độ "Chỉ học từ chưa thuộc"
      flashcardBodyHtml = `
        <div class="flashcard-wrapper">
          <div class="fc-card-3d card-mastered" style="cursor:default; justify-content:center; gap:14px;">
            <div style="font-size:3.2rem; line-height:1;">🎉</div>
            <h3 style="font-size:1.5rem; font-weight:900; color:#065F46;">
              Xuất sắc! Em đã thuộc trọn bộ ${totalCount}/${totalCount} từ vựng Unit ${unit.number}!
            </h3>
            <p style="font-size:0.94rem; color:#475569; max-width:480px;">
              Không còn từ vựng nào chưa thuộc trong Unit này. Em có thể ôn lại toàn bộ ${totalCount} thẻ hoặc chuyển sang làm bài tập thực hành nhé!
            </p>
            <div style="display:flex; gap:12px; flex-wrap:wrap; justify-content:center; margin-top:8px;">
              <button class="btn btn-outline" onclick="setFlashcardDeckMode('all')">
                📚 Xem & Ôn lại toàn bộ (${totalCount} từ)
              </button>
              <button class="btn btn-primary" onclick="switchUnitSubTab('practice')">
                ✍️ Làm bài tập thực hành Unit ${unit.number} ➔
              </button>
            </div>
          </div>
        </div>
      `;
    } else {
      const wordStripHtml = activeDeck
        .map((item, idx) => {
          const itemLearned = !!state.learnedVocab[item.id];
          const isActive = idx === state.fcIndex;
          return `
            <button
              class="fc-word-dot ${isActive ? "active" : ""} ${itemLearned ? "is-learned" : ""}"
              onclick="jumpToFlashcard(${idx})"
              title="${item.word}: ${item.meaning}"
            >
              <span>${idx + 1}. ${item.word}</span>
              ${itemLearned ? `<span>✓</span>` : ""}
            </button>
          `;
        })
        .join("");

      flashcardBodyHtml = `
        <div class="fc-word-strip">
          ${wordStripHtml}
        </div>

        <div class="flashcard-wrapper">
          <div class="fc-card-3d ${state.fcFlipped ? "is-flipped" : ""} ${isCurrentLearned ? "card-mastered" : ""}" onclick="flipFlashcard()">
            <div class="fc-card-top-meta">
              <span class="fc-type">${currentCard.type}</span>
              <span style="font-size:0.78rem; font-weight:800; padding:4px 12px; border-radius:99px; background:${isCurrentLearned ? "#D1FAE5" : "#FEF3C7"}; color:${isCurrentLearned ? "#065F46" : "#92400E"};">
                ${isCurrentLearned ? "✅ Đã thuộc" : `⏳ Từ ${state.fcIndex + 1} / ${activeDeck.length} (${state.fcDeckMode === "unlearned" ? "Chưa thuộc" : "Tất cả"})`}
              </span>
            </div>

            ${
              !state.fcFlipped
                ? `
                <div style="my:auto; padding: 10px 0;">
                  <div class="fc-word">${currentCard.word}</div>
                  <div class="fc-ipa">${currentCard.ipa}</div>
                  <div style="margin-top:4px;">
                    <button class="speaker-btn" style="width:48px; height:48px; font-size:1.3rem;" onclick="speakEnglish('${currentCard.word.replace(/'/g, "\\'")}', event)" title="Nghe phát âm chuẩn">
                      🔊
                    </button>
                  </div>
                </div>
                <span class="fc-hint">👆 Bấm vào thẻ để lật xem nghĩa tiếng Việt & câu ví dụ</span>
              `
                : `
                <div style="width:100%;">
                  <div style="display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:4px;">
                    <span style="font-size:1.25rem; font-weight:900; color:#4F46E5;">${currentCard.word}</span>
                    <span style="font-size:0.95rem; color:#64748B; font-family:monospace;">${currentCard.ipa}</span>
                    <button class="speaker-btn" style="width:32px; height:32px; font-size:0.9rem;" onclick="speakEnglish('${currentCard.word.replace(/'/g, "\\'")}', event)" title="Nghe phát âm">🔊</button>
                  </div>
                  <div class="fc-meaning">${currentCard.meaning}</div>
                  <div class="fc-example-box">
                    <div class="fc-example">🇬🇧 "${currentCard.example}"</div>
                    <div class="fc-example-vi">🇻🇳 → ${currentCard.exampleVi}</div>
                  </div>
                  <div class="fc-tip">💡 <strong>Mẹo nhớ / Lưu ý thi:</strong> ${currentCard.tip}</div>
                </div>
                <span class="fc-hint">👆 Bấm vào thẻ để lật lại mặt trước</span>
              `
            }
          </div>

          <div class="fc-controls">
            <button class="fc-nav-btn" onclick="prevFlashcard()">⬅ Từ trước</button>

            ${
              !isCurrentLearned
                ? `
                <button class="fc-mark-learned-btn" onclick="markVocabLearned('${currentCard.id}', true)">
                  ✅ Đã thuộc từ này & Qua từ tiếp theo ➔
                </button>
              `
                : `
                <div class="fc-already-learned-group">
                  <span class="fc-learned-locked-pill">
                    🎉 Đã thuộc từ này
                  </span>
                  <button class="fc-unmark-sub-btn" onclick="unmarkVocabLearned('${currentCard.id}')" title="Chuyển từ này về danh sách chưa thuộc để học lại">
                    ↩️ Đặt lại: Chưa thuộc
                  </button>
                </div>
              `
            }

            <button class="fc-nav-btn" onclick="nextFlashcard()">Từ tiếp theo ➡</button>
          </div>
        </div>
      `;
    }

    // Phần 2: Lọc danh sách cho Bảng tổng hợp từ vựng bên dưới
    const filteredVocab = vocabList.filter((v) => {
      const matchSearch =
        v.word.toLowerCase().includes(state.vocabFilter.toLowerCase()) ||
        v.meaning.toLowerCase().includes(state.vocabFilter.toLowerCase());
      if (!matchSearch) return false;
      if (state.vocabStatusFilter === "unlearned") return !state.learnedVocab[v.id];
      if (state.vocabStatusFilter === "learned") return !!state.learnedVocab[v.id];
      return true;
    });

    return `
      <!-- KHU VỰC 1: FLASHCARD STUDIO (TƯƠNG PHẢN CAO, TÁCH BIỆT VỚI BẢNG TỪ VỰNG) -->
      <div class="fc-studio-stage" id="flashcard-studio-top">
        <div class="fc-studio-topbar">
          <div class="fc-studio-title">
            <span style="font-size:1.45rem;">🃏</span>
            <div>
              <div style="font-size:1.08rem; font-weight:800; color:white;">
                Phòng Học Thẻ Ghi Nhớ (Flashcard Thông Minh)
              </div>
              <div style="font-size:0.8rem; color:#C7D2FE;">
                Tự động ẩn các từ em đã thuộc để không bị bấm nhầm hoặc học lặp lại
              </div>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
            <span class="fc-studio-badge">
              ✅ Tiến độ: ${learnedInUnit} / ${totalCount} từ (${progressPct}%)
            </span>
            <div class="fc-deck-mode-switch">
              <button
                class="fc-deck-mode-btn ${state.fcDeckMode === "unlearned" ? "active" : ""}"
                onclick="setFlashcardDeckMode('unlearned')"
              >
                🎯 Chỉ từ chưa thuộc (${unlearnedCount})
              </button>
              <button
                class="fc-deck-mode-btn ${state.fcDeckMode === "all" ? "active" : ""}"
                onclick="setFlashcardDeckMode('all')"
              >
                📚 Xem tất cả (${totalCount})
              </button>
            </div>
          </div>
        </div>

        ${flashcardBodyHtml}
      </div>

      <!-- KHU VỰC 2: BẢNG TỔNG HỢP TỪ VỰNG (TRA CỨU NHANH & CHỐNG BẤM NHẦM) -->
      <div class="vocab-summary-panel">
        <div class="vocab-toolbar">
          <div>
            <h2 style="font-size:1.22rem; font-weight:800; color:var(--text-main);">
              📋 Bảng Tra Cứu Từ Vựng Unit ${unit.number} (${totalCount} từ)
            </h2>
            <p style="font-size:0.83rem; color:var(--text-muted);">
              Các từ đã thuộc được khóa trạng thái an toàn để tránh bấm nhầm khi cuộn trang
            </p>
          </div>

          <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
            <div class="vocab-status-tabs">
              <button
                class="vocab-status-tab ${state.vocabStatusFilter === "all" ? "active" : ""}"
                onclick="setVocabStatusFilter('all')"
              >
                Tất cả (${totalCount})
              </button>
              <button
                class="vocab-status-tab ${state.vocabStatusFilter === "unlearned" ? "active" : ""}"
                onclick="setVocabStatusFilter('unlearned')"
              >
                ⏳ Chưa thuộc (${unlearnedCount})
              </button>
              <button
                class="vocab-status-tab ${state.vocabStatusFilter === "learned" ? "active" : ""}"
                onclick="setVocabStatusFilter('learned')"
              >
                ✅ Đã thuộc (${learnedInUnit})
              </button>
            </div>

            <input
              type="text"
              placeholder="🔍 Tìm từ hoặc nghĩa..."
              value="${state.vocabFilter}"
              oninput="filterVocabList(this.value)"
              style="padding:8px 14px; border-radius:10px; border:1.5px solid var(--border); min-width:220px; font-size:0.88rem;"
            />
          </div>
        </div>

        ${
          filteredVocab.length === 0
            ? `
            <div style="text-align:center; padding:32px 16px; color:var(--text-muted);">
              Không có từ vựng nào trong bộ lọc này.
            </div>
          `
            : `
            <div class="vocab-list-grid">
              ${filteredVocab
                .map((v) => {
                  const learned = !!state.learnedVocab[v.id];
                  return `
                    <div class="vocab-item ${learned ? "learned" : ""}">
                      <div>
                        <div class="vocab-item-header">
                          <div>
                            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                              <span class="vocab-word-title">${v.word}</span>
                              <span class="fc-type" style="padding:2px 8px; font-size:0.75rem;">${v.type}</span>
                            </div>
                            <div style="font-size:0.86rem; color:var(--text-muted); font-family:monospace; margin-top:2px;">
                              ${v.ipa}
                            </div>
                          </div>
                          <button class="speaker-btn" onclick="speakEnglish('${v.word.replace(/'/g, "\\'")}', event)" title="Nghe phát âm">🔊</button>
                        </div>

                        <div class="vocab-meaning-text">${v.meaning}</div>
                        <div style="font-size:0.85rem; color:#334155; font-style:italic; margin-bottom:2px;">"${v.example}"</div>
                        <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:10px;">→ ${v.exampleVi}</div>

                        <div style="font-size:0.8rem; background:#FFFBEB; border:1px solid #FDE68A; color:#92400E; padding:7px 10px; border-radius:8px;">
                          💡 ${v.tip}
                        </div>
                      </div>

                      <div class="vocab-item-footer">
                        <button class="btn btn-outline btn-sm" onclick="reviewVocabInFlashcard('${v.id}')">
                          🃏 Xem Flashcard
                        </button>

                        ${
                          !learned
                            ? `
                            <button class="btn btn-primary btn-sm" onclick="markVocabLearned('${v.id}', false)">
                              📌 Đánh dấu Đã thuộc
                            </button>
                          `
                            : `
                            <div style="display:flex; align-items:center; gap:8px;">
                              <span class="vocab-learned-safe-badge">
                                ✅ Đã thuộc
                              </span>
                              <button class="vocab-reset-mini-btn" onclick="unmarkVocabLearned('${v.id}')" title="Chuyển về trạng thái Chưa thuộc">
                                ↩️ Học lại
                              </button>
                            </div>
                          `
                        }
                      </div>
                    </div>
                  `;
                })
                .join("")}
            </div>
          `
        }
      </div>
    `;
  }

  window.setFlashcardDeckMode = function (mode) {
    state.fcDeckMode = mode;
    state.fcIndex = 0;
    state.fcFlipped = false;
    renderApp();
  };

  window.setVocabStatusFilter = function (filterMode) {
    state.vocabStatusFilter = filterMode;
    renderApp();
  };

  window.jumpToFlashcard = function (idx) {
    state.fcIndex = idx;
    state.fcFlipped = false;
    renderApp();
  };

  window.reviewVocabInFlashcard = function (vocabId) {
    const unit = (window.STUDY_DATA.units || []).find((u) => u.id === state.selectedUnitId);
    if (!unit) return;
    let deck = getActiveFlashcardDeck(unit);
    let idx = deck.findIndex((v) => v.id === vocabId);
    if (idx === -1) {
      state.fcDeckMode = "all";
      deck = unit.vocabulary;
      idx = deck.findIndex((v) => v.id === vocabId);
    }
    state.fcIndex = Math.max(0, idx);
    state.fcFlipped = false;
    renderApp();
    const el = document.getElementById("flashcard-studio-top");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  window.flipFlashcard = function () {
    state.fcFlipped = !state.fcFlipped;
    renderApp();
  };

  window.prevFlashcard = function () {
    const unit = (window.STUDY_DATA.units || []).find((u) => u.id === state.selectedUnitId);
    if (!unit) return;
    const deck = getActiveFlashcardDeck(unit);
    if (deck.length === 0) return;
    state.fcIndex = (state.fcIndex - 1 + deck.length) % deck.length;
    state.fcFlipped = false;
    renderApp();
  };

  window.nextFlashcard = function () {
    const unit = (window.STUDY_DATA.units || []).find((u) => u.id === state.selectedUnitId);
    if (!unit) return;
    const deck = getActiveFlashcardDeck(unit);
    if (deck.length === 0) return;
    state.fcIndex = (state.fcIndex + 1) % deck.length;
    state.fcFlipped = false;
    renderApp();
  };

  // Đánh dấu 1 chiều: ĐÃ THUỘC (Không bao giờ tự hủy khi bấm nhầm lần 2)
  window.markVocabLearned = function (vocabId, fromFlashcard) {
    state.learnedVocab[vocabId] = true;
    state.fcFlipped = false;
    persistActiveStudentState();

    if (window.EY8_Supabase && window.EY8_Supabase.syncVocabProgress) {
      window.EY8_Supabase.syncVocabProgress(vocabId, state.selectedUnitId, "mastered", state);
    }

    const unit = (window.STUDY_DATA.units || []).find((u) => u.id === state.selectedUnitId);
    if (unit && fromFlashcard) {
      if (state.fcDeckMode === "unlearned") {
        // Từ vừa học đã tự động rời khỏi danh sách Chưa thuộc, giữ nguyên fcIndex (hoặc về 0 nếu ở cuối)
        const remaining = unit.vocabulary.filter((v) => !state.learnedVocab[v.id]);
        if (state.fcIndex >= remaining.length) {
          state.fcIndex = 0;
        }
      } else {
        // Nếu đang ở chế độ Xem tất cả, tự động chuyển sang từ tiếp theo
        state.fcIndex = (state.fcIndex + 1) % unit.vocabulary.length;
      }
    }
    renderApp();
  };

  // Đặt lại từ về trạng thái Chưa thuộc (chỉ kích hoạt qua nút phụ "↩️ Học lại")
  window.unmarkVocabLearned = function (vocabId) {
    delete state.learnedVocab[vocabId];
    persistActiveStudentState();

    if (window.EY8_Supabase && window.EY8_Supabase.syncVocabProgress) {
      window.EY8_Supabase.syncVocabProgress(vocabId, state.selectedUnitId, "learning", state);
    }
    renderApp();
  };

  // Giữ hàm tương thích ngược nếu có nơi gọi
  window.toggleLearnedVocab = function (vocabId) {
    if (state.learnedVocab[vocabId]) {
      window.unmarkVocabLearned(vocabId);
    } else {
      window.markVocabLearned(vocabId, false);
    }
  };

  window.filterVocabList = function (val) {
    state.vocabFilter = val;
    renderApp();
    const input = document.querySelector('input[placeholder*="Tìm từ hoặc nghĩa"]');
    if (input) {
      input.focus();
      input.setSelectionRange(val.length, val.length);
    }
  };

  function renderUnitGrammarSubTab(unit) {
    const pronHtml = unit.pronunciation
      ? `
        <div class="grammar-card">
          <h3>🗣️ Ngữ âm trọng tâm Unit ${unit.number}: ${unit.pronunciation.sounds.join(" và ")}</h3>
          <p style="font-size:0.88rem; color:var(--text-muted); margin-bottom:14px;">Bấm vào từng từ ví dụ bên dưới để nghe máy đọc mẫu và phân biệt âm:</p>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
            ${unit.pronunciation.explanation
              .map(
                (item) => `
                <div style="background:#F8FAFC; border:1px solid var(--border); padding:16px; border-radius:12px;">
                  <div style="font-size:1.1rem; font-weight:800; color:var(--primary); margin-bottom:6px;">Âm ${item.sound}</div>
                  <p style="font-size:0.88rem; color:#334155; margin-bottom:12px;">${item.desc}</p>
                  <div style="display:flex; flex-wrap:wrap; gap:8px;">
                    ${item.examples
                      .map(
                        (ex) => `
                        <button class="btn btn-outline btn-sm" onclick="speakEnglish('${ex.replace(/'/g, "\\'")}', event)">
                          🔊 ${ex}
                        </button>
                      `
                      )
                      .join("")}
                  </div>
                </div>
              `
              )
              .join("")}
          </div>
        </div>
      `
      : "";

    const grammarHtml = (unit.grammar || [])
      .map(
        (g) => `
        <div class="grammar-card">
          <h3>📐 ${g.title}</h3>
          <ul class="grammar-list">
            ${g.rules.map((r) => `<li>• ${r}</li>`).join("")}
          </ul>
          <div class="exam-trap-box">
            <h4>⚠️ BẪY ĐỀ THI HAY GẶP & MẸO LÀM BÀI NHANH:</h4>
            <ul>
              ${g.examTips.map((t) => `<li>${t}</li>`).join("")}
            </ul>
          </div>
        </div>
      `
      )
      .join("");

    return `
      ${pronHtml}
      ${grammarHtml}
      <div style="text-align:center; margin-top:24px;">
        <button class="btn btn-primary" onclick="switchUnitSubTab('practice')">
          ✍️ Áp dụng làm ngay ${unit.practice.length} câu bài tập Unit ${unit.number} →
        </button>
      </div>
    `;
  }

  function renderUnitPracticeSubTab(unit) {
    const questions = unit.practice || [];
    let correctCount = 0;
    if (state.unitQuizSubmitted) {
      questions.forEach((q) => {
        if (state.unitQuizAnswers[q.id] === q.answer) correctCount++;
      });
    }

    const scoreBannerHtml = state.unitQuizSubmitted
      ? `
        <div class="score-banner">
          <div>
            <span class="hero-tag">🎉 Đã hoàn thành bài tập Unit ${unit.number}</span>
            <h3 style="font-size:1.45rem; font-weight:800; margin-bottom:4px;">
              Kết quả: Đúng ${correctCount} / ${questions.length} câu (${((correctCount / questions.length) * 10).toFixed(1)} điểm)
            </h3>
            <p style="font-size:0.9rem; opacity:0.92;">
              ${
                correctCount === questions.length
                  ? "Xuất sắc! Em đã nắm vững toàn bộ kiến thức của Unit này!"
                  : "Các câu làm sai đã được tự động lưu vào 'Sổ tay câu sai' kèm giải thích chi tiết bên dưới."
              }
            </p>
          </div>
          <div style="display:flex; align-items:center; gap:14px;">
            <div class="score-circle">
              ${((correctCount / questions.length) * 10).toFixed(1)}
              <span>/ 10 điểm</span>
            </div>
            <button class="btn btn-white" onclick="resetUnitQuiz()">🔄 Làm lại</button>
          </div>
        </div>
      `
      : "";

    const questionsHtml = questions
      .map((q, idx) => {
        const userAns = state.unitQuizAnswers[q.id];
        return renderQuestionCardHtml(q, idx + 1, userAns, state.unitQuizSubmitted, "selectUnitQuizOption");
      })
      .join("");

    return `
      ${scoreBannerHtml}
      ${questionsHtml}
      ${
        !state.unitQuizSubmitted
          ? `
          <div style="background:white; padding:20px; border-radius:var(--radius-lg); border:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
            <span>Đã chọn: <strong>${Object.keys(state.unitQuizAnswers).length} / ${questions.length}</strong> câu</span>
            <button class="btn btn-primary" onclick="submitUnitQuiz('${unit.id}')">✅ Nộp bài & Xem giải thích chi tiết</button>
          </div>
        `
          : ""
      }
    `;
  }

  window.selectUnitQuizOption = function (qId, optIdx) {
    if (state.unitQuizSubmitted) return;
    state.unitQuizAnswers[qId] = optIdx;
    renderApp();
  };

  window.submitUnitQuiz = function (unitId) {
    const unit = (window.STUDY_DATA.units || []).find((u) => u.id === unitId);
    if (!unit) return;
    const answeredCount = Object.keys(state.unitQuizAnswers).length;
    if (answeredCount < unit.practice.length) {
      if (!confirm(`Em mới làm ${answeredCount}/${unit.practice.length} câu. Em có chắc muốn chấm điểm luôn không?`)) {
        return;
      }
    }

    let correct = 0;
    const answersRecord = {};
    const answersList = [];

    unit.practice.forEach((q) => {
      const chosen = state.unitQuizAnswers[q.id];
      answersRecord[q.id] = chosen;
      const isRight = chosen === q.answer;
      answersList.push({
        questionId: q.id,
        selectedOptionIndex: chosen !== undefined ? chosen : -1,
        isCorrect: isRight
      });

      if (isRight) {
        correct++;
      } else {
        state.mistakes[q.id] = {
          id: q.id,
          source: `Unit ${unit.number}: ${unit.title}`,
          question: q.question,
          options: q.options,
          answer: q.answer,
          wrongChoice: chosen,
          explanation: q.explanation,
          savedAt: new Date().toLocaleDateString("vi-VN")
        };
      }
    });

    const prevBest = state.unitScores[unitId] || 0;
    if (correct >= prevBest) {
      state.unitScores[unitId] = correct;
    }

    const score10 = Number(((correct / unit.practice.length) * 10).toFixed(2));
    state.examHistory.unshift({
      examId: `quiz-${unit.id}`,
      examTitle: `Bài tập củng cố Unit ${unit.number}: ${unit.title}`,
      category: "unit_quiz",
      badge: "Luyện tập",
      correct,
      total: unit.practice.length,
      score10,
      timeSpent: "Hoàn thành",
      timeSpentSeconds: 300,
      date: new Date().toLocaleString("vi-VN"),
      answers: answersRecord,
      questions: unit.practice
    });

    persistActiveStudentState();

    if (window.EY8_Supabase && window.EY8_Supabase.recordQuizAttempt) {
      window.EY8_Supabase.recordQuizAttempt(
        {
          exerciseId: `quiz-${unit.id}`,
          score: score10,
          rawScore: correct,
          totalQuestions: unit.practice.length,
          timeSpentSeconds: 300,
          answers: answersList
        },
        state
      );
    }

    state.unitQuizSubmitted = true;
    renderApp();
    window.scrollTo({ top: 180, behavior: "smooth" });
  };

  window.resetUnitQuiz = function () {
    state.unitQuizAnswers = {};
    state.unitQuizSubmitted = false;
    renderApp();
  };

  function renderQuestionCardHtml(q, displayNum, userAns, isSubmitted, clickHandlerName) {
    const optionsHtml = q.options
      .map((opt, oIdx) => {
        let cls = "option-btn";
        if (!isSubmitted) {
          if (userAns === oIdx) cls += " selected";
        } else {
          if (oIdx === q.answer) cls += " correct-ans";
          else if (userAns === oIdx && userAns !== q.answer) cls += " wrong-ans";
        }
        return `
          <button
            class="${cls}"
            ${isSubmitted ? "disabled" : ""}
            onclick="${clickHandlerName}('${q.id}', ${oIdx})"
          >
            ${opt}
          </button>
        `;
      })
      .join("");

    const statusBadge = isSubmitted
      ? userAns === q.answer
        ? `<span style="color:var(--success); font-weight:700; font-size:0.85rem;">✔ Chính xác</span>`
        : `<span style="color:var(--danger); font-weight:700; font-size:0.85rem;">✘ Sai (${userAns === undefined ? "Chưa chọn" : "Đã lưu vào Sổ tay"})</span>`
      : "";

    return `
      <div class="question-card" id="qcard-${q.id}">
        ${q.section ? `<div style="font-size:0.78rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:8px;">${q.section}</div>` : ""}
        ${q.passage ? `<div class="passage-box"><strong>📖 Bài đọc:</strong>\n${q.passage}</div>` : ""}
        <div class="q-header">
          <span class="q-num">Câu ${displayNum}</span>
          ${statusBadge}
        </div>
        <div class="q-text">${q.question}</div>
        <div class="options-list">
          ${optionsHtml}
        </div>
        ${
          isSubmitted
            ? `
            <div class="explanation-box">
              <strong>💡 Giải thích chi tiết:</strong> ${q.explanation}
            </div>
          `
            : ""
        }
      </div>
    `;
  }

  // =========================================================================
  // 3. STUDENT PORTAL: PHÒNG LUYỆN ĐỀ THI (EXAMS)
  // =========================================================================
  function renderExamsView() {
    if (state.activeExam) {
      return renderActiveExamRoom();
    }

    const exams = window.STUDY_DATA.exams || [];
    const filtered =
      state.examFilter === "all" ? exams : exams.filter((e) => e.category === state.examFilter);

    return `
      <div class="section-header">
        <div>
          <h2>📝 Phòng Luyện Đề Kiểm Tra & Thi Học Kì 1</h2>
          <p style="font-size:0.9rem; color:var(--text-muted);">Đề thi thiết kế bám sát ma trận đề kiểm tra Tiếng Anh 8 Global Success</p>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="unit-pill ${state.examFilter === "all" ? "active" : ""}" onclick="setExamFilter('all')">Tất cả (${exams.length})</button>
          <button class="unit-pill ${state.examFilter === "15m" ? "active" : ""}" onclick="setExamFilter('15m')">Đề 15 Phút</button>
          <button class="unit-pill ${state.examFilter === "midterm" ? "active" : ""}" onclick="setExamFilter('midterm')">Đề Giữa Kì 1</button>
          <button class="unit-pill ${state.examFilter === "final" ? "active" : ""}" onclick="setExamFilter('final')">Đề Cuối Kì 1</button>
        </div>
      </div>

      <div class="units-grid">
        ${filtered
          .map((ex) => {
            const attempts = state.examHistory.filter((h) => h.examId === ex.id);
            const bestScore =
              attempts.length > 0 ? Math.max(...attempts.map((a) => a.score10)).toFixed(1) : null;

            return `
              <div class="unit-card">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <span class="fc-type" style="margin:0;">${ex.badge} • ⏱ ${ex.durationMinutes} phút</span>
                    <span style="font-size:0.82rem; font-weight:700; color:var(--text-muted);">${ex.questions.length} câu</span>
                  </div>
                  <h3 class="unit-title" style="margin-bottom:6px;">${ex.title}</h3>
                  <div style="font-size:0.82rem; color:var(--primary); font-weight:600; margin-bottom:8px;">📌 Phạm vi: ${ex.scope}</div>
                  <p class="unit-summary">${ex.description}</p>
                </div>
                <div>
                  <div class="unit-meta">
                    <span>Số lần đã làm: <strong>${attempts.length} lần</strong></span>
                    <span>Điểm cao nhất: <strong style="color:var(--success)">${bestScore ? bestScore + "/10" : "Chưa thi"}</strong></span>
                  </div>
                  <button class="btn btn-primary" style="width:100%" onclick="startExamById('${ex.id}')">
                    ✍️ Bắt đầu làm bài
                  </button>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  }

  window.setExamFilter = function (filter) {
    state.examFilter = filter;
    renderApp();
  };

  window.startExamById = function (examId) {
    const ex = (window.STUDY_DATA.exams || []).find((e) => e.id === examId);
    if (!ex) return;
    stopExamTimer();
    state.currentTab = "exams";
    state.activeExam = ex;
    state.examAnswers = {};
    state.examSubmitted = false;
    state.examTotalSeconds = ex.durationMinutes * 60;
    state.examSecondsLeft = ex.durationMinutes * 60;

    state.examTimerId = setInterval(() => {
      if (state.examSecondsLeft > 0) {
        state.examSecondsLeft--;
        const timerEl = document.getElementById("exam-timer-display");
        if (timerEl) timerEl.textContent = formatTime(state.examSecondsLeft);
      } else {
        stopExamTimer();
        alert("⏰ Đã hết thời gian làm bài! Hệ thống sẽ tự động chấm điểm bài thi của em.");
        submitActiveExam(true);
      }
    }, 1000);

    renderApp();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  function renderActiveExamRoom() {
    const ex = state.activeExam;
    const questions = ex.questions;
    const answeredCount = Object.keys(state.examAnswers).length;

    let correctCount = 0;
    let score10 = 0;
    if (state.examSubmitted) {
      questions.forEach((q) => {
        if (state.examAnswers[q.id] === q.answer) correctCount++;
      });
      score10 = Number(((correctCount / questions.length) * 10).toFixed(2));
    }

    const paletteHtml = questions
      .map((q, idx) => {
        let cls = "q-dot";
        const uAns = state.examAnswers[q.id];
        if (!state.examSubmitted) {
          if (uAns !== undefined) cls += " answered";
        } else {
          if (uAns === q.answer) cls += " correct";
          else cls += " wrong";
        }
        return `<button class="${cls}" onclick="scrollToQuestion('${q.id}')">${idx + 1}</button>`;
      })
      .join("");

    return `
      <div style="margin-bottom:16px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
        <button class="btn btn-outline btn-sm" onclick="exitExamRoom()">⬅ Quay lại danh sách đề thi</button>
        <span style="font-weight:700; color:var(--primary);">${ex.title}</span>
      </div>

      ${
        state.examSubmitted
          ? `
          <div class="score-banner">
            <div>
              <span class="hero-tag">🏁 Đã nộp bài & Chấm điểm</span>
              <h3 style="font-size:1.5rem; font-weight:800; margin-bottom:4px;">
                Điểm số: ${score10} / 10 điểm (Đúng ${correctCount}/${questions.length} câu)
              </h3>
              <p style="font-size:0.9rem; opacity:0.92;">
                Thời gian làm bài: ${formatTime(state.examTotalSeconds - state.examSecondsLeft)} • Hãy xem kỹ lời giải chi tiết từng câu bên dưới nhé!
              </p>
            </div>
            <div style="display:flex; align-items:center; gap:12px;">
              <div class="score-circle">
                ${score10}
                <span>/ 10 điểm</span>
              </div>
              <button class="btn btn-white" onclick="startExamById('${ex.id}')">🔄 Thi lại đề này</button>
            </div>
          </div>
        `
          : ""
      }

      <div class="exam-layout">
        <div>
          ${questions
            .map((q, idx) =>
              renderQuestionCardHtml(
                q,
                idx + 1,
                state.examAnswers[q.id],
                state.examSubmitted,
                "selectExamOption"
              )
            )
            .join("")}
        </div>

        <div class="exam-sidebar">
          <div class="timer-box">
            <div style="font-size:0.78rem; opacity:0.8; margin-bottom:2px;">
              ${state.examSubmitted ? "ĐÃ HOÀN THÀNH" : "THỜI GIAN CÒN LẠI"}
            </div>
            <div class="timer-value" id="exam-timer-display">${formatTime(state.examSecondsLeft)}</div>
          </div>

          <div style="display:flex; justify-content:space-between; font-size:0.86rem; font-weight:600;">
            <span>Tiến độ làm bài:</span>
            <span>${answeredCount} / ${questions.length} câu</span>
          </div>

          <div class="q-palette">
            ${paletteHtml}
          </div>

          ${
            !state.examSubmitted
              ? `
              <button class="btn btn-primary" style="width:100%" onclick="submitActiveExam(false)">
                ✅ Nộp bài & Chấm điểm
              </button>
            `
              : `
              <button class="btn btn-outline" style="width:100%" onclick="exitExamRoom()">
                📋 Xem danh sách đề khác
              </button>
            `
          }
        </div>
      </div>
    `;
  }

  window.scrollToQuestion = function (qId) {
    const el = document.getElementById("qcard-" + qId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  window.selectExamOption = function (qId, optIdx) {
    if (state.examSubmitted) return;
    state.examAnswers[qId] = optIdx;
    renderApp();
  };

  window.submitActiveExam = function (forceSubmit) {
    const ex = state.activeExam;
    if (!ex || state.examSubmitted) return;
    const answeredCount = Object.keys(state.examAnswers).length;
    if (!forceSubmit && answeredCount < ex.questions.length) {
      if (
        !confirm(
          `Em mới trả lời ${answeredCount}/${ex.questions.length} câu. Em có chắc chắn muốn nộp bài sớm không?`
        )
      ) {
        return;
      }
    }

    stopExamTimer();
    let correct = 0;
    const answersRecord = {};
    const answersList = [];

    ex.questions.forEach((q) => {
      const chosen = state.examAnswers[q.id];
      answersRecord[q.id] = chosen;
      const isRight = chosen === q.answer;
      answersList.push({
        questionId: q.id,
        selectedOptionIndex: chosen !== undefined ? chosen : -1,
        isCorrect: isRight
      });

      if (isRight) {
        correct++;
      } else {
        state.mistakes[q.id] = {
          id: q.id,
          source: ex.title,
          question: q.question,
          options: q.options,
          answer: q.answer,
          wrongChoice: chosen,
          explanation: q.explanation,
          savedAt: new Date().toLocaleDateString("vi-VN")
        };
      }
    });

    const timeSpentSeconds = state.examTotalSeconds - state.examSecondsLeft;
    const score10 = Number(((correct / ex.questions.length) * 10).toFixed(2));
    state.examHistory.unshift({
      examId: ex.id,
      examTitle: ex.title,
      category: ex.category || "exam",
      badge: ex.badge || "Đề thi",
      correct,
      total: ex.questions.length,
      score10,
      timeSpent: formatTime(timeSpentSeconds),
      timeSpentSeconds,
      date: new Date().toLocaleString("vi-VN"),
      answers: answersRecord,
      questions: ex.questions
    });

    persistActiveStudentState();

    if (window.EY8_Supabase && window.EY8_Supabase.recordQuizAttempt) {
      window.EY8_Supabase.recordQuizAttempt(
        {
          exerciseId: ex.id,
          score: score10,
          rawScore: correct,
          totalQuestions: ex.questions.length,
          timeSpentSeconds,
          answers: answersList
        },
        state
      );
    }

    state.examSubmitted = true;
    renderApp();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.exitExamRoom = function () {
    if (!state.examSubmitted) {
      if (!confirm("Em đang làm dở đề thi. Thoát ra sẽ hủy lượt làm bài này. Em có chắc không?")) {
        return;
      }
    }
    stopExamTimer();
    state.activeExam = null;
    renderApp();
  };

  // =========================================================================
  // 4. STUDENT PORTAL: SỔ TAY CÂU SAI (MISTAKES)
  // =========================================================================
  function renderMistakesView() {
    const mistakeList = Object.values(state.mistakes);

    const mistakeSectionHtml =
      mistakeList.length === 0
        ? `
          <div style="background:white; border:1px solid var(--border); border-radius:var(--radius-lg); padding:36px; text-align:center; margin-bottom:32px;">
            <div style="font-size:3rem; margin-bottom:10px;">🎉</div>
            <h3 style="font-size:1.25rem; font-weight:800; margin-bottom:6px;">Sổ tay câu sai đang trống!</h3>
            <p style="color:var(--text-muted); margin-bottom:16px;">Khi em làm bài tập các Unit hoặc làm Đề thi mà có câu trả lời sai, hệ thống sẽ tự động gom vào đây để em ôn lại trước ngày thi thật.</p>
            <button class="btn btn-primary" onclick="switchMainTab('exams')">📝 Đi tới Phòng Luyện Đề</button>
          </div>
        `
        : state.mistakePracticeActive
        ? renderMistakePracticeMode(mistakeList)
        : `
          <div style="background:#FEF2F2; border:1px solid #FECACA; border-radius:var(--radius-lg); padding:20px 24px; margin-bottom:20px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
            <div>
              <h3 style="color:#991B1B; font-size:1.15rem; font-weight:800;">🎯 Em đang có ${mistakeList.length} câu cần ôn tập lại</h3>
              <p style="color:#7F1D1D; font-size:0.9rem;">Làm lại các câu từng sai là cách nhanh nhất để tăng từ 7–8 điểm lên 9–10 điểm!</p>
            </div>
            <button class="btn btn-primary" style="background:#DC2626;" onclick="startMistakePractice()">
              🔥 Làm bài ôn lại ${mistakeList.length} câu sai ngay
            </button>
          </div>

          ${mistakeList
            .map(
              (m, idx) => `
              <div class="question-card">
                <div class="q-header">
                  <span class="q-num" style="background:#FEE2E2; color:#DC2626;">Câu hay sai #${idx + 1} • Nguồn: ${m.source}</span>
                  <button class="btn btn-outline btn-sm" onclick="removeMistakeItem('${m.id}')">✔ Đã hiểu kỹ (Xóa khỏi sổ tay)</button>
                </div>
                <div class="q-text">${m.question}</div>
                <div class="options-list">
                  ${m.options
                    .map(
                      (opt, oIdx) => `
                      <div class="option-btn ${oIdx === m.answer ? "correct-ans" : oIdx === m.wrongChoice ? "wrong-ans" : ""}">
                        ${opt} ${oIdx === m.answer ? " (Đáp án đúng)" : oIdx === m.wrongChoice ? " (Em đã chọn)" : ""}
                      </div>
                    `
                    )
                    .join("")}
                </div>
                <div class="explanation-box">
                  <strong>💡 Giải thích cần nhớ:</strong> ${m.explanation}
                </div>
              </div>
            `
            )
            .join("")}
        `;

    return `
      <div class="section-header">
        <h2>📓 Sổ Tay Câu Hay Sai Của Em</h2>
      </div>
      ${mistakeSectionHtml}
    `;
  }

  function renderMistakePracticeMode(mistakeList) {
    return `
      <div style="margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
        <button class="btn btn-outline btn-sm" onclick="exitMistakePractice()">⬅ Quay lại xem Sổ tay</button>
        <span style="font-weight:700; color:var(--danger);">Chế độ: Làm lại ${mistakeList.length} câu từng sai</span>
      </div>
      ${mistakeList
        .map((m, idx) =>
          renderQuestionCardHtml(
            m,
            idx + 1,
            state.mistakeAnswers[m.id],
            state.mistakeSubmitted,
            "selectMistakePracticeOption"
          )
        )
        .join("")}
      <div style="margin-top:16px; display:flex; gap:12px;">
        ${
          !state.mistakeSubmitted
            ? `<button class="btn btn-primary" onclick="submitMistakePractice()">✅ Kiểm tra đáp án</button>`
            : `<button class="btn btn-success" onclick="clearSolvedMistakes()">🎉 Xóa các câu vừa làm ĐÚNG khỏi Sổ tay</button>
               <button class="btn btn-outline" onclick="startMistakePractice()">🔄 Làm lại lần nữa</button>`
        }
      </div>
    `;
  }

  window.startMistakePractice = function () {
    state.mistakePracticeActive = true;
    state.mistakeAnswers = {};
    state.mistakeSubmitted = false;
    renderApp();
  };

  window.exitMistakePractice = function () {
    state.mistakePracticeActive = false;
    renderApp();
  };

  window.selectMistakePracticeOption = function (qId, optIdx) {
    if (state.mistakeSubmitted) return;
    state.mistakeAnswers[qId] = optIdx;
    renderApp();
  };

  window.submitMistakePractice = function () {
    state.mistakeSubmitted = true;
    renderApp();
  };

  window.clearSolvedMistakes = function () {
    Object.keys(state.mistakeAnswers).forEach((qId) => {
      if (state.mistakes[qId] && state.mistakeAnswers[qId] === state.mistakes[qId].answer) {
        delete state.mistakes[qId];
      }
    });
    persistActiveStudentState();
    state.mistakePracticeActive = false;
    renderApp();
  };

  window.removeMistakeItem = function (qId) {
    delete state.mistakes[qId];
    persistActiveStudentState();
    renderApp();
  };

  // =========================================================================
  // 5. STUDENT PORTAL: THÀNH TÍCH CÁ NHÂN CỦA EM (STUDENT PROGRESS)
  // =========================================================================
  function calculateSkillStatsFromHistory(examHistoryList) {
    const skills = {
      pronunciation: { name: "Ngữ âm (Pronunciation & Stress)", correct: 0, total: 0, icon: "🗣️" },
      vocabulary: { name: "Từ vựng (Vocabulary & Collocations)", correct: 0, total: 0, icon: "📖" },
      grammar: { name: "Ngữ pháp (Grammar Structures)", correct: 0, total: 0, icon: "✍️" },
      reading: { name: "Kỹ năng Đọc hiểu (Reading)", correct: 0, total: 0, icon: "📑" },
      writing: { name: "Viết lại câu & Giao tiếp (Writing)", correct: 0, total: 0, icon: "✏️" }
    };

    (examHistoryList || []).forEach((h) => {
      if (!h.questions || !h.answers) return;
      h.questions.forEach((q) => {
        const sec = (q.section || "").toLowerCase();
        let targetKey = "grammar";
        if (sec.includes("pronunciation") || sec.includes("ngữ âm") || sec.includes("stress")) {
          targetKey = "pronunciation";
        } else if (sec.includes("vocabulary") || sec.includes("từ vựng")) {
          targetKey = "vocabulary";
        } else if (sec.includes("reading") || sec.includes("đọc")) {
          targetKey = "reading";
        } else if (sec.includes("writing") || sec.includes("viết")) {
          targetKey = "writing";
        } else if (sec.includes("grammar") || sec.includes("ngữ pháp")) {
          targetKey = "grammar";
        }

        skills[targetKey].total++;
        if (h.answers[q.id] === q.answer) {
          skills[targetKey].correct++;
        }
      });
    });

    return skills;
  }

  function renderStudentProgressView(stats) {
    const currentUser = window.EY8_Supabase.getCurrentUser() || { fullName: "Em Lớp 8" };
    const distinctDates = new Set(state.examHistory.map((h) => (h.date ? h.date.split(" ")[1] : "")));
    const streakDays = Math.max(1, distinctDates.size);

    return `
      <div class="analytics-hero" style="background: linear-gradient(135deg, #312E81 0%, #4F46E5 100%);">
        <div class="analytics-student-info">
          <div class="student-avatar" style="background:#6366F1; border-color:#A5B4FC;">🏆</div>
          <div>
            <div style="font-size:0.85rem; color:#C7D2FE; text-transform:uppercase; letter-spacing:0.5px;">Bảng Thành Tích Cá Nhân</div>
            <h2 style="font-size:1.6rem; font-weight:800; margin:2px 0;">Học sinh: ${currentUser.fullName}</h2>
            <div class="streak-pill">🔥 Chuỗi ngày học chăm chỉ: <strong>${streakDays} ngày</strong></div>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.14); padding: 12px 18px; border-radius: 12px; font-size:0.88rem; max-width: 300px;">
          🌟 <em>Mọi bài làm của em đều được lưu lại để xem sự tiến bộ qua từng ngày!</em>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#EEF2FF; color:#4F46E5;">🎯</div>
          <div>
            <div class="kpi-val">${stats.avgExamScore} <span style="font-size:0.9rem; font-weight:600; color:var(--text-muted);">/10</span></div>
            <div class="kpi-label">Điểm trung bình của em</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#ECFDF5; color:#10B981;">📝</div>
          <div>
            <div class="kpi-val">${state.examHistory.length}</div>
            <div class="kpi-label">Đề & Bài tập đã hoàn thành</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#FEF3C7; color:#D97706;">📖</div>
          <div>
            <div class="kpi-val">${stats.learnedCount} <span style="font-size:0.9rem; font-weight:600; color:var(--text-muted);">/ ${stats.totalVocab}</span></div>
            <div class="kpi-label">Từ vựng đã thuộc</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#FEE2E2; color:#EF4444;">📓</div>
          <div>
            <div class="kpi-val">${stats.mistakeCount}</div>
            <div class="kpi-label">Câu cần sửa trong Sổ tay</div>
          </div>
        </div>
      </div>

      <div class="analytics-box">
        <div class="analytics-box-title">
          <span>📋 Lịch Sử Các Bài Đã Làm Của Em</span>
          <span style="font-size:0.85rem; color:var(--text-muted); font-weight:500;">Bấm "Xem lại bài" để xem đáp án & giải thích</span>
        </div>
        ${renderHistoryTableHtml(state.examHistory, false)}
      </div>
    `;
  }

  function renderHistoryTableHtml(historyList, isAdminInspect) {
    if (!historyList || historyList.length === 0) {
      return `<p style="color:var(--text-muted); text-align:center; padding:28px 0;">Chưa có bài kiểm tra nào được nộp.</p>`;
    }
    return `
      <div style="overflow-x:auto;">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Thời gian nộp</th>
              <th>Tên đề kiểm tra / bài tập</th>
              <th>Điểm số</th>
              <th>Số câu đúng</th>
              <th>Thời gian làm</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            ${historyList
              .map((h, idx) => {
                let scoreColor = "#065F46";
                let scoreBg = "#D1FAE5";
                if (h.score10 < 5.0) {
                  scoreColor = "#991B1B";
                  scoreBg = "#FEE2E2";
                } else if (h.score10 < 8.0) {
                  scoreColor = "#92400E";
                  scoreBg = "#FEF3C7";
                }

                return `
                  <tr>
                    <td style="color:var(--text-muted); font-size:0.85rem;">${h.date}</td>
                    <td><strong>${h.examTitle}</strong></td>
                    <td>
                      <span style="background:${scoreBg}; color:${scoreColor}; font-weight:800; padding:4px 10px; border-radius:99px;">
                        ${h.score10} đ
                      </span>
                    </td>
                    <td><strong>${h.correct} / ${h.total}</strong> câu</td>
                    <td>${h.timeSpent}</td>
                    <td>
                      <button class="btn btn-outline btn-sm" onclick="openAttemptDetailModal(${idx}, ${isAdminInspect ? "true" : "false"})">
                        🔍 ${isAdminInspect ? "Soi bài làm" : "Xem lại bài"}
                      </button>
                    </td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  // =========================================================================
  // =========================================================================
  // PHẦN QUẢN TRỊ VIÊN (ADMIN PORTAL - 4 PHÂN HỆ CHUYÊN BIỆT)
  // =========================================================================
  // =========================================================================

  async function refreshAdminUsersList() {
    if (!window.EY8_Supabase) return;
    state.allUsers = await window.EY8_Supabase.getAllUsers();
    const students = state.allUsers.filter((u) => u.role === "student");
    if (students.length > 0 && !students.some((s) => s.username === state.adminSelectedStudent)) {
      state.adminSelectedStudent = students[0].username;
    }
    renderApp();
  }

  async function loadAdminInspectedStudent(username) {
    if (!window.EY8_Supabase) return;
    state.adminSelectedStudent = username;

    if (state.allUsers.length === 0) {
      state.allUsers = await window.EY8_Supabase.getAllUsers();
    }
    const targetUser = state.allUsers.find((u) => u.username === username);
    const record = await window.EY8_Supabase.fetchStudentFullRecord(
      username,
      targetUser ? targetUser.id : null
    );

    const newRecord = {
      learnedVocab: {},
      unitScores: {},
      examHistory: [],
      mistakes: {}
    };

    if (record && record.snapshot) {
      newRecord.learnedVocab = record.snapshot.learnedVocab || {};
      newRecord.unitScores = record.snapshot.unitScores || {};
      newRecord.examHistory = record.snapshot.examHistory || [];
      newRecord.mistakes = record.snapshot.mistakes || {};
    }

    // Ghép thêm dữ liệu từ các bảng quan hệ Supabase nếu có
    if (record && record.progress && record.progress.length > 0) {
      record.progress.forEach((p) => {
        if (p.status === "mastered") newRecord.learnedVocab[p.vocabulary_id] = true;
      });
    }

    if (record && record.attempts && record.attempts.length > 0) {
      const existingIds = new Set(newRecord.examHistory.map((h) => h.id || `${h.examId}_${h.date}`));
      record.attempts.forEach((att) => {
        if (!existingIds.has(att.id)) {
          const reconstructedQuestions = [];
          const answersRecord = {};
          if (att.attempt_answers && att.attempt_answers.length > 0) {
            att.attempt_answers.forEach((ans) => {
              answersRecord[ans.question_id] = ans.selected_option_index;
              const qObj = findQuestionById(ans.question_id);
              if (qObj) reconstructedQuestions.push(qObj);
            });
          }
          newRecord.examHistory.push({
            id: att.id,
            examId: att.exercise_id,
            examTitle:
              att.exercises && att.exercises.title
                ? att.exercises.title
                : `Bài kiểm tra ${att.exercise_id}`,
            correct: att.raw_score,
            total: att.total_questions,
            score10: Number(Number(att.score).toFixed(2)),
            timeSpent: formatTime(att.time_spent_seconds || 0),
            date: new Date(att.completed_at).toLocaleString("vi-VN"),
            answers: answersRecord,
            questions: reconstructedQuestions
          });
        }
      });
    }

    state.inspectedStudentRecord = newRecord;
    renderApp();
  }

  window.handleAdminChangeStudent = function (username) {
    loadAdminInspectedStudent(username);
  };

  // -------------------------------------------------------------------------
  // ADMIN TAB 1: GIÁM SÁT HỌC SINH (MONITORING & ANALYTICS)
  // -------------------------------------------------------------------------
  function renderAdminMonitorView() {
    const students = state.allUsers.filter((u) => u.role === "student");
    const selectedStudentObj =
      students.find((s) => s.username === state.adminSelectedStudent) || {
        fullName: "Em Lớp 8",
        username: "em_lop8"
      };

    const rec = state.inspectedStudentRecord;
    const stats = computeStatsFromRecord(rec);
    const skills = calculateSkillStatsFromHistory(rec.examHistory);
    const units = window.STUDY_DATA.units || [];
    const mistakeList = Object.values(rec.mistakes || {});

    return `
      <!-- Thanh chọn Học sinh để giám sát -->
      <div class="admin-control-bar">
        <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
          <span style="font-weight:800; color:var(--text-main);">🎓 Học sinh đang giám sát:</span>
          <select class="form-control-select" style="width:auto; min-width:240px; font-weight:700;" onchange="handleAdminChangeStudent(this.value)">
            ${students
              .map(
                (s) => `
                <option value="${s.username}" ${s.username === state.adminSelectedStudent ? "selected" : ""}>
                  ${s.fullName} (username: ${s.username})
                </option>
              `
              )
              .join("")}
          </select>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" onclick="loadAdminInspectedStudent('${state.adminSelectedStudent}')">
            🔄 Cập nhật tiến độ mới nhất từ máy của em
          </button>
          <button class="btn btn-primary btn-sm" onclick="switchAdminTab('admin-assignments')">
            🎯 Giao bài tập mới cho ${selectedStudentObj.fullName}
          </button>
        </div>
      </div>

      <!-- 4 KPI Giám sát Học sinh -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#EEF2FF; color:#4F46E5;">🎯</div>
          <div>
            <div class="kpi-val">${stats.avgExamScore} <span style="font-size:0.9rem; font-weight:600; color:var(--text-muted);">/10</span></div>
            <div class="kpi-label">Điểm trung bình các lần thi</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#ECFDF5; color:#10B981;">📝</div>
          <div>
            <div class="kpi-val">${rec.examHistory.length} bài</div>
            <div class="kpi-label">Tổng số lượt nộp bài</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#FEF3C7; color:#D97706;">📖</div>
          <div>
            <div class="kpi-val">${stats.learnedCount} / ${stats.totalVocab}</div>
            <div class="kpi-label">Từ vựng đã thuộc (${Math.round((stats.learnedCount / (stats.totalVocab || 1)) * 100)}%)</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#FEE2E2; color:#EF4444;">⚠️</div>
          <div>
            <div class="kpi-val">${stats.mistakeCount} câu</div>
            <div class="kpi-label">Đang làm sai chưa khắc phục</div>
          </div>
        </div>
      </div>

      <div class="analytics-two-col">
        <!-- Cột 1: Chẩn đoán lỗ hổng kiến thức 5 kỹ năng -->
        <div class="analytics-box">
          <div class="analytics-box-title">
            <span>🩺 Chẩn Đoán Năng Lực & Lỗ Hổng Kiến Thức</span>
            <span style="font-size:0.78rem; color:var(--text-muted);">${selectedStudentObj.fullName}</span>
          </div>

          ${
            rec.examHistory.length === 0
              ? `
                <div style="text-align:center; padding:32px 12px; color:var(--text-muted);">
                  <div style="font-size:2.2rem; margin-bottom:8px;">📭</div>
                  <p>Học sinh <strong>${selectedStudentObj.fullName}</strong> chưa nộp bài kiểm tra nào.<br>Bạn hãy vào mục <strong>"Giao Bài Tập"</strong> để giao đề cho em làm nhé!</p>
                </div>
              `
              : Object.keys(skills)
                  .map((k) => {
                    const sk = skills[k];
                    const pct = sk.total > 0 ? Math.round((sk.correct / sk.total) * 100) : 0;
                    let color = "#10B981";
                    let statusLabel = "🟢 Nắm vững";
                    if (pct < 60) {
                      color = "#EF4444";
                      statusLabel = "🔴 Hổng kiến thức (Cần kèm thêm)";
                    } else if (pct < 80) {
                      color = "#F59E0B";
                      statusLabel = "🟡 Khá (Hay nhầm câu bẫy)";
                    }

                    return `
                      <div class="skill-bar-row">
                        <div class="skill-bar-meta">
                          <span>${sk.icon} ${sk.name}</span>
                          <span><strong>${pct}%</strong> (${sk.correct}/${sk.total} câu) • ${statusLabel}</span>
                        </div>
                        <div class="skill-bar-track">
                          <div class="skill-bar-fill" style="width: ${pct}%; background: ${color}"></div>
                        </div>
                      </div>
                    `;
                  })
                  .join("")
          }
        </div>

        <!-- Cột 2: Kiểm tra tiến độ từng Unit của Học sinh -->
        <div class="analytics-box">
          <div class="analytics-box-title">
            <span>📚 Tiến Độ Từng Unit Của ${selectedStudentObj.fullName}</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${units
              .map((u) => {
                const totalV = u.vocabulary.length;
                const learnedV = u.vocabulary.filter((v) => rec.learnedVocab[v.id]).length;
                const pct = Math.round((learnedV / totalV) * 100);
                const bestScore = rec.unitScores[u.id];

                return `
                  <div style="padding:10px 14px; border:1px solid var(--border); border-radius:10px; display:flex; align-items:center; justify-content:space-between; gap:10px;">
                    <div>
                      <div style="font-weight:700; font-size:0.9rem;">${u.icon} Unit ${u.number}: ${u.title}</div>
                      <div style="font-size:0.8rem; color:var(--text-muted);">
                        Thuộc từ: <strong>${learnedV}/${totalV} từ (${pct}%)</strong> • Bài tập Unit: <strong style="color:${bestScore !== undefined ? "var(--success)" : "var(--danger)"};">${bestScore !== undefined ? bestScore + "/" + u.practice.length + " câu" : "Chưa làm"}</strong>
                      </div>
                    </div>
                    <span style="font-weight:800; font-size:0.82rem; color:${pct === 100 ? "var(--success)" : "var(--primary)"};">${pct}%</span>
                  </div>
                `;
              })
              .join("")}
          </div>
        </div>
      </div>

      <!-- Bảng Soi Chi Tiết Bài Làm Của Học Sinh -->
      <div class="analytics-box" style="margin-bottom:24px;">
        <div class="analytics-box-title">
          <span>🔍 Nhật Ký Nộp Bài & Soi Chi Tiết Bài Làm Của ${selectedStudentObj.fullName}</span>
          <span style="font-size:0.82rem; color:var(--text-muted);">Kiểm tra thời gian làm bài thực tế và từng câu trả lời</span>
        </div>
        ${renderHistoryTableHtml(rec.examHistory, true)}
      </div>

      <!-- Danh sách các câu học sinh đang làm sai -->
      <div class="analytics-box">
        <div class="analytics-box-title">
          <span>⚠️ Các Câu ${selectedStudentObj.fullName} Đang Làm Sai (${mistakeList.length} câu)</span>
        </div>
        ${
          mistakeList.length === 0
            ? `<p style="color:var(--text-muted); text-align:center; padding:18px 0;">Hiện không có câu làm sai nào tồn đọng.</p>`
            : `
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:12px;">
                ${mistakeList
                  .slice(0, 12)
                  .map(
                    (m) => `
                    <div style="padding:12px 14px; border:1px solid #FECACA; background:#FEF2F2; border-radius:10px; font-size:0.86rem;">
                      <div style="font-size:0.75rem; font-weight:700; color:#DC2626; margin-bottom:4px;">Nguồn: ${m.source}</div>
                      <div style="font-weight:700; margin-bottom:6px;">${m.question}</div>
                      <div style="color:#065F46; font-weight:600;">✔ Đáp án đúng: ${(m.options && m.options[m.answer]) || ""}</div>
                    </div>
                  `
                  )
                  .join("")}
              </div>
            `
        }
      </div>
    `;
  }

  // -------------------------------------------------------------------------
  // ADMIN TAB 2: GIAO BÀI TẬP CHO EM (ASSIGNMENT MANAGER)
  // -------------------------------------------------------------------------
  function renderAdminAssignmentsView() {
    const students = state.allUsers.filter((u) => u.role === "student");
    const units = window.STUDY_DATA.units || [];
    const exams = window.STUDY_DATA.exams || [];
    const assignments = state.systemStore.assignments || [];

    return `
      <div class="section-header">
        <div>
          <h2>🎯 Giao Bài Tập & Nhiệm Vụ Bắt Buộc Cho Học Sinh</h2>
          <p style="font-size:0.9rem; color:var(--text-muted);">Bài tập bạn giao tại đây sẽ hiển thị nổi bật ngay đầu trang "Bàn Học Của Em" khi em đăng nhập.</p>
        </div>
      </div>

      <div class="analytics-two-col">
        <!-- Form tạo nhiệm vụ mới -->
        <div class="analytics-box">
          <div class="analytics-box-title">
            <span>➕ Tạo Nhiệm Vụ Giao Bài Mới</span>
          </div>

          <form onsubmit="event.preventDefault(); handleAdminCreateAssignment();">
            <div class="form-field">
              <label>Giao cho Học sinh</label>
              <select id="assign-student" class="form-control-select">
                <option value="all">👨‍🎓 Tất cả học sinh</option>
                ${students
                  .map(
                    (s) =>
                      `<option value="${s.username}" ${s.username === state.adminSelectedStudent ? "selected" : ""}>${s.fullName} (${s.username})</option>`
                  )
                  .join("")}
              </select>
            </div>

            <div class="form-field">
              <label>Chọn Đề thi hoặc Unit yêu cầu làm</label>
              <select id="assign-target" class="form-control-select" required>
                <optgroup label="📝 Các Đề Kiểm Tra (15 Phút, Giữa Kì, Cuối Kì)">
                  ${exams
                    .map((ex) => `<option value="exam|${ex.id}|${ex.title}">📝 ${ex.title}</option>`)
                    .join("")}
                </optgroup>
                <optgroup label="📚 Học Từ Vựng & Làm Bài Tập Unit (1–6)">
                  ${units
                    .map(
                      (u) =>
                        `<option value="unit|${u.id}|Ôn tập & Làm bài tập Unit ${u.number}: ${u.title}">📚 Unit ${u.number}: ${u.title} (${u.viTitle})</option>`
                    )
                    .join("")}
                </optgroup>
              </select>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
              <div class="form-field">
                <label>Điểm mục tiêu cần đạt (Thang 10)</label>
                <input id="assign-minscore" type="number" step="0.5" min="5" max="10" value="8.0" class="form-control-input" required />
              </div>
              <div class="form-field">
                <label>Hạn hoàn thành</label>
                <input id="assign-duedate" type="text" placeholder="Ví dụ: Tối nay 21h / Chủ nhật" value="Trong ngày hôm nay" class="form-control-input" required />
              </div>
            </div>

            <div class="form-field">
              <label>Lời nhắn / Dặn dò của Anh/Chị</label>
              <input id="assign-note" type="text" placeholder="Ví dụ: Em làm cẩn thận không khoanh vội nhé, tối anh kiểm tra!" class="form-control-input" />
            </div>

            <button type="submit" class="btn btn-primary" style="width:100%; padding:12px;">
              📌 Giao Nhiệm Vụ Này Cho Em Ngay
            </button>
          </form>
        </div>

        <!-- Danh sách nhiệm vụ đã giao & Trạng thái hoàn thành -->
        <div class="analytics-box">
          <div class="analytics-box-title">
            <span>📋 Danh Sách Nhiệm Vụ Đã Giao (${assignments.length})</span>
          </div>

          ${
            assignments.length === 0
              ? `<p style="color:var(--text-muted); text-align:center; padding:32px 0;">Bạn chưa giao nhiệm vụ nào. Hãy tạo nhiệm vụ ở cột bên trái nhé!</p>`
              : `
                <div style="display:flex; flex-direction:column; gap:12px;">
                  ${assignments
                    .map((task) => {
                      const evalRes = evaluateAssignmentStatus(task, state.inspectedStudentRecord);
                      return `
                        <div style="padding:14px; border:1px solid ${evalRes.isCompleted ? "#A7F3D0" : "var(--border)"}; background:${evalRes.isCompleted ? "#F0FDF4" : "#F8FAFC"}; border-radius:12px;">
                          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; margin-bottom:6px;">
                            <div>
                              <span style="font-size:0.72rem; font-weight:800; padding:2px 8px; border-radius:99px; background:${evalRes.isCompleted ? "#10B981" : "#F59E0B"}; color:white;">
                                ${evalRes.isCompleted ? "✅ ĐÃ HOÀN THÀNH" : "⏳ CHƯA HOÀN THÀNH"}
                              </span>
                              <span style="font-size:0.78rem; color:var(--text-muted); margin-left:6px;">Giao ngày ${task.createdAt} • Hạn: ${task.dueDate}</span>
                            </div>
                            <button class="btn btn-outline btn-sm" style="color:var(--danger); padding:2px 8px;" onclick="handleAdminDeleteAssignment('${task.id}')">Xóa</button>
                          </div>
                          <div style="font-weight:800; font-size:0.95rem; margin-bottom:4px;">${task.title}</div>
                          <div style="font-size:0.82rem; color:#334155;">
                            🎯 Mục tiêu: <strong>≥ ${task.minScore} điểm</strong> • Kết quả của em: <strong>${evalRes.bestScoreText}</strong>
                          </div>
                          ${task.note ? `<div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px; font-style:italic;">💬 "${task.note}"</div>` : ""}
                        </div>
                      `;
                    })
                    .join("")}
                </div>
              `
          }
        </div>
      </div>
    `;
  }

  window.handleAdminCreateAssignment = async function () {
    const studentVal = document.getElementById("assign-student")?.value || "all";
    const targetRaw = document.getElementById("assign-target")?.value || "";
    const minScore = Number(document.getElementById("assign-minscore")?.value || 8);
    const dueDate = document.getElementById("assign-duedate")?.value || "Trong tuần";
    const note = document.getElementById("assign-note")?.value || "";

    const parts = targetRaw.split("|");
    if (parts.length < 3) return;

    const newTask = {
      id: "task_" + Date.now(),
      studentUsername: studentVal,
      targetType: parts[0],
      targetId: parts[1],
      title: parts[2],
      minScore,
      dueDate,
      note,
      createdAt: new Date().toLocaleDateString("vi-VN")
    };

    state.systemStore.assignments = state.systemStore.assignments || [];
    state.systemStore.assignments.unshift(newTask);

    if (window.EY8_Supabase) {
      await window.EY8_Supabase.saveSystemStore(state.systemStore);
    }
    renderApp();
    alert("✅ Đã giao bài tập thành công! Khi em mở web lên sẽ thấy ngay nhiệm vụ này.");
  };

  window.handleAdminDeleteAssignment = async function (taskId) {
    state.systemStore.assignments = (state.systemStore.assignments || []).filter((t) => t.id !== taskId);
    if (window.EY8_Supabase) {
      await window.EY8_Supabase.saveSystemStore(state.systemStore);
    }
    renderApp();
  };

  // -------------------------------------------------------------------------
  // ADMIN TAB 3: QUẢN LÝ ĐỀ THI & CÂU HỎI (CONTENT & QUESTION BANK MANAGER)
  // -------------------------------------------------------------------------
  function renderAdminContentView() {
    const units = window.STUDY_DATA.units || [];
    const exams = window.STUDY_DATA.exams || [];
    const customQuestions = state.systemStore.customQuestions || [];
    const customExams = state.systemStore.customExams || [];

    const totalUnitQuestions = units.reduce((acc, u) => acc + (u.practice ? u.practice.length : 0), 0);
    const totalExamQuestions = exams.reduce((acc, e) => acc + (e.questions ? e.questions.length : 0), 0);

    return `
      <div class="section-header">
        <div>
          <h2>🗂️ Quản Lý Ngân Hàng Đề Thi & Học Liệu</h2>
          <p style="font-size:0.9rem; color:var(--text-muted);">Thêm câu hỏi trắc nghiệm mới từ đề cương ở trường của em hoặc tạo đề kiểm tra mới.</p>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#EEF2FF; color:#4F46E5;">📚</div>
          <div>
            <div class="kpi-val">${units.length} Units</div>
            <div class="kpi-label">${totalUnitQuestions} câu bài tập theo Unit</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#ECFDF5; color:#10B981;">📝</div>
          <div>
            <div class="kpi-val">${exams.length} Đề thi</div>
            <div class="kpi-label">${totalExamQuestions} câu hỏi trong phòng thi</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#FEF3C7; color:#D97706;">✨</div>
          <div>
            <div class="kpi-val">${customQuestions.length} câu</div>
            <div class="kpi-label">Câu hỏi do Admin bổ sung thêm</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#FCE7F3; color:#DB2777;">🏆</div>
          <div>
            <div class="kpi-val">${customExams.length} đề</div>
            <div class="kpi-label">Đề kiểm tra riêng do Admin tạo</div>
          </div>
        </div>
      </div>

      <div class="analytics-two-col">
        <!-- Cột 1: Thêm câu hỏi trắc nghiệm mới -->
        <div class="analytics-box">
          <div class="analytics-box-title">
            <span>➕ Thêm Câu Hỏi Trắc Nghiệm Mới Vào Đề / Unit</span>
          </div>

          <form onsubmit="event.preventDefault(); handleAdminAddQuestion();">
            <div class="form-field">
              <label>Thêm câu hỏi này vào đâu?</label>
              <select id="admin-q-target" class="form-control-select" required>
                <optgroup label="📝 Thêm vào Đề Kiểm Tra">
                  ${exams.map((ex) => `<option value="exam|${ex.id}">📝 ${ex.title}</option>`).join("")}
                </optgroup>
                <optgroup label="📚 Thêm vào Bài tập Unit (1–6)">
                  ${units.map((u) => `<option value="unit|${u.id}">📚 Unit ${u.number}: ${u.title}</option>`).join("")}
                </optgroup>
              </select>
            </div>

            <div class="form-field">
              <label>Chuyên đề / Kỹ năng (Để hệ thống thống kê năng lực)</label>
              <select id="admin-q-section" class="form-control-select">
                <option value="II. Vocabulary & Grammar (Ngữ pháp)">✍️ Ngữ pháp (Grammar)</option>
                <option value="II. Vocabulary (Từ vựng)">📖 Từ vựng (Vocabulary)</option>
                <option value="I. Pronunciation (Ngữ âm)">🗣️ Ngữ âm (Pronunciation & Stress)</option>
                <option value="III. Reading (Đọc hiểu)">📑 Đọc hiểu (Reading)</option>
                <option value="IV. Writing (Viết lại câu)">✏️ Viết lại câu (Writing)</option>
              </select>
            </div>

            <div class="form-field">
              <label>Nội dung câu hỏi (Đề bài)</label>
              <input id="admin-q-text" type="text" class="form-control-input" placeholder="Ví dụ: My sister is keen on _______ origami in her free time." required />
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
              <div class="form-field">
                <label>Phương án A</label>
                <input id="admin-q-opt0" type="text" class="form-control-input" placeholder="A. make" required />
              </div>
              <div class="form-field">
                <label>Phương án B</label>
                <input id="admin-q-opt1" type="text" class="form-control-input" placeholder="B. making" required />
              </div>
              <div class="form-field">
                <label>Phương án C</label>
                <input id="admin-q-opt2" type="text" class="form-control-input" placeholder="C. to make" required />
              </div>
              <div class="form-field">
                <label>Phương án D</label>
                <input id="admin-q-opt3" type="text" class="form-control-input" placeholder="D. made" required />
              </div>
            </div>

            <div class="form-field">
              <label>Đáp án đúng là phương án nào?</label>
              <select id="admin-q-correct" class="form-control-select">
                <option value="0">Đáp án A</option>
                <option value="1" selected>Đáp án B</option>
                <option value="2">Đáp án C</option>
                <option value="3">Đáp án D</option>
              </select>
            </div>

            <div class="form-field">
              <label>Lời giải thích chi tiết bằng tiếng Việt</label>
              <input id="admin-q-explain" type="text" class="form-control-input" placeholder="Ví dụ: Cụm từ 'be keen on + V-ing' (say mê làm gì) -> chọn making." required />
            </div>

            <button type="submit" class="btn btn-primary" style="width:100%; padding:12px;">
              💾 Lưu Câu Hỏi Vào Hệ Thống
            </button>
          </form>
        </div>

        <!-- Cột 2: Tạo Đề Kiểm Tra Mới & Danh sách câu hỏi đã thêm -->
        <div style="display:flex; flex-direction:column; gap:20px;">
          <div class="analytics-box">
            <div class="analytics-box-title">
              <span>🆕 Tạo Khung Đề Kiểm Tra Mới</span>
            </div>
            <form onsubmit="event.preventDefault(); handleAdminCreateExam();">
              <div class="form-field">
                <label>Tên đề kiểm tra mới</label>
                <input id="admin-ex-title" type="text" class="form-control-input" placeholder="Ví dụ: Đề kiểm tra 15 phút (Đề cương trường em)" required />
              </div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <div class="form-field">
                  <label>Phân loại đề</label>
                  <select id="admin-ex-cat" class="form-control-select">
                    <option value="15m">Đề 15 Phút</option>
                    <option value="midterm">Đề Giữa Kì 1</option>
                    <option value="final">Đề Cuối Kì 1</option>
                  </select>
                </div>
                <div class="form-field">
                  <label>Thời gian làm bài (Phút)</label>
                  <input id="admin-ex-duration" type="number" min="5" max="90" value="15" class="form-control-input" required />
                </div>
              </div>
              <div class="form-field">
                <label>Phạm vi kiến thức / Mô tả</label>
                <input id="admin-ex-desc" type="text" class="form-control-input" placeholder="Ví dụ: Tổng hợp từ vựng & ngữ pháp trọng tâm trên lớp" required />
              </div>
              <button type="submit" class="btn btn-outline" style="width:100%;">
                ➕ Khởi tạo Đề thi mới
              </button>
            </form>
          </div>

          <div class="analytics-box">
            <div class="analytics-box-title">
              <span>📋 Các Câu Hỏi Admin Đã Thêm (${customQuestions.length})</span>
            </div>
            ${
              customQuestions.length === 0
                ? `<p style="color:var(--text-muted); font-size:0.86rem;">Chưa có câu hỏi bổ sung nào. Bạn có thể thêm câu hỏi ở khung bên trái.</p>`
                : `
                  <div style="display:flex; flex-direction:column; gap:10px; max-height:320px; overflow-y:auto;">
                    ${customQuestions
                      .map(
                        (cq) => `
                        <div style="padding:10px 12px; border:1px solid var(--border); border-radius:8px; font-size:0.84rem; display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                          <div>
                            <div style="font-weight:700;">${cq.question}</div>
                            <div style="color:var(--success); font-size:0.78rem;">Đáp án: ${cq.options[cq.answer]}</div>
                          </div>
                          <button class="btn btn-outline btn-sm" style="color:var(--danger); padding:2px 8px;" onclick="handleAdminDeleteCustomQuestion('${cq.id}')">Xóa</button>
                        </div>
                      `
                      )
                      .join("")}
                  </div>
                `
            }
          </div>
        </div>
      </div>
    `;
  }

  window.handleAdminAddQuestion = async function () {
    const targetRaw = document.getElementById("admin-q-target")?.value || "";
    const section = document.getElementById("admin-q-section")?.value || "";
    const qText = document.getElementById("admin-q-text")?.value.trim() || "";
    const opt0 = document.getElementById("admin-q-opt0")?.value.trim() || "";
    const opt1 = document.getElementById("admin-q-opt1")?.value.trim() || "";
    const opt2 = document.getElementById("admin-q-opt2")?.value.trim() || "";
    const opt3 = document.getElementById("admin-q-opt3")?.value.trim() || "";
    const answerIdx = Number(document.getElementById("admin-q-correct")?.value || 0);
    const explain = document.getElementById("admin-q-explain")?.value.trim() || "";

    const [targetType, targetId] = targetRaw.split("|");
    if (!targetType || !targetId || !qText) return;

    const formatOpt = (prefix, val) => (val.startsWith(prefix) ? val : `${prefix}. ${val}`);

    const newQuestion = {
      id: "custom_q_" + Date.now(),
      targetType,
      targetId,
      section,
      question: qText,
      options: [
        formatOpt("A", opt0),
        formatOpt("B", opt1),
        formatOpt("C", opt2),
        formatOpt("D", opt3)
      ],
      answer: answerIdx,
      explanation: explain
    };

    state.systemStore.customQuestions = state.systemStore.customQuestions || [];
    state.systemStore.customQuestions.unshift(newQuestion);
    applyCustomContentToStudyData();

    if (window.EY8_Supabase) {
      await window.EY8_Supabase.saveSystemStore(state.systemStore);
    }

    renderApp();
    alert("✅ Đã thêm câu hỏi mới vào hệ thống và đồng bộ lên đám mây!");
  };

  window.handleAdminDeleteCustomQuestion = async function (qId) {
    state.systemStore.customQuestions = (state.systemStore.customQuestions || []).filter(
      (q) => q.id !== qId
    );
    applyCustomContentToStudyData();
    if (window.EY8_Supabase) {
      await window.EY8_Supabase.saveSystemStore(state.systemStore);
    }
    renderApp();
  };

  window.handleAdminCreateExam = async function () {
    const title = document.getElementById("admin-ex-title")?.value.trim() || "";
    const cat = document.getElementById("admin-ex-cat")?.value || "15m";
    const duration = Number(document.getElementById("admin-ex-duration")?.value || 15);
    const desc = document.getElementById("admin-ex-desc")?.value.trim() || "";

    if (!title) return;

    const badgeMap = { "15m": "15 Phút", midterm: "Giữa Kì 1", final: "Cuối Kì 1" };
    const newExam = {
      id: "exam_custom_" + Date.now(),
      title,
      category: cat,
      badge: badgeMap[cat] || "Đề riêng",
      durationMinutes: duration,
      scope: "Đề do Quản trị viên biên soạn",
      description: desc,
      questions: [
        {
          id: "custom_init_q_" + Date.now(),
          section: "II. Vocabulary & Grammar",
          question: "My brother is very fond _______ doing puzzles in his free time.",
          options: ["A. in", "B. on", "C. of", "D. at"],
          answer: 2,
          explanation: "Cấu trúc cố định: 'be fond of + V-ing' (thích làm gì)."
        }
      ]
    };

    state.systemStore.customExams = state.systemStore.customExams || [];
    state.systemStore.customExams.unshift(newExam);
    applyCustomContentToStudyData();

    if (window.EY8_Supabase) {
      await window.EY8_Supabase.saveSystemStore(state.systemStore);
    }

    renderApp();
    alert(`🎉 Đã tạo đề "${title}"! Bạn có thể thêm tiếp các câu hỏi vào đề này ở cột bên trái.`);
  };

  // -------------------------------------------------------------------------
  // ADMIN TAB 4: QUẢN LÝ TÀI KHOẢN & CẤU HÌNH HỆ THỐNG (USERS & SYSTEM)
  // -------------------------------------------------------------------------
  function renderAdminUsersView() {
    const cfg = window.EY8_Supabase ? window.EY8_Supabase.getConfig() : {};

    return `
      <div class="section-header">
        <div>
          <h2>👥 Quản Lý Tài Khoản Học Sinh & Hệ Thống</h2>
          <p style="font-size:0.9rem; color:var(--text-muted);">Quản lý mật khẩu của em, tạo thêm tài khoản mới hoặc kiểm tra kết nối cơ sở dữ liệu Supabase.</p>
        </div>
      </div>

      <div class="analytics-two-col">
        <!-- Cột 1: Danh sách tài khoản -->
        <div class="analytics-box">
          <div class="analytics-box-title">
            <span>📋 Danh Sách Tài Khoản Trên Hệ Thống (${state.allUsers.length})</span>
            <button class="btn btn-outline btn-sm" onclick="refreshAdminUsersList()">🔄 Làm mới</button>
          </div>

          <div style="overflow-x:auto;">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Họ và Tên</th>
                  <th>Username</th>
                  <th>Vai trò</th>
                  <th>Mật khẩu / PIN</th>
                  <th>Thao tác quản trị</th>
                </tr>
              </thead>
              <tbody>
                ${state.allUsers
                  .map(
                    (u) => `
                    <tr>
                      <td><strong>${u.fullName}</strong></td>
                      <td><code>${u.username}</code></td>
                      <td>
                        <span class="user-role-tag ${u.role === "admin" ? "admin" : "student"}">
                          ${u.role === "admin" ? "👑 Admin" : "🎓 Học sinh"}
                        </span>
                      </td>
                      <td><code>${u.pinCode || "****"}</code></td>
                      <td>
                        <div style="display:flex; gap:6px; flex-wrap:wrap;">
                          <button class="btn btn-outline btn-sm" style="padding:3px 8px; font-size:0.76rem;" onclick="handleAdminChangeUserPassword('${u.id}', '${u.username}', '${u.fullName}')">
                            🔑 Đổi MK
                          </button>
                          ${
                            u.role === "student"
                              ? `
                              <button class="btn btn-outline btn-sm" style="padding:3px 8px; font-size:0.76rem; color:#D97706;" onclick="handleAdminResetStudentData('${u.username}', '${u.id}')">
                                🧹 Reset điểm
                              </button>
                            `
                              : ""
                          }
                          ${
                            u.username !== "admin" && u.username !== "em_lop8"
                              ? `
                              <button class="btn btn-outline btn-sm" style="padding:3px 8px; font-size:0.76rem; color:var(--danger);" onclick="handleAdminDeleteUser('${u.username}')">
                                🗑️ Xóa
                              </button>
                            `
                              : ""
                          }
                        </div>
                      </td>
                    </tr>
                  `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Cột 2: Tạo tài khoản mới & Cấu hình Supabase -->
        <div style="display:flex; flex-direction:column; gap:20px;">
          <div class="analytics-box">
            <div class="analytics-box-title">
              <span>➕ Tạo Tài Khoản Mới (Quyền Admin)</span>
            </div>
            <form onsubmit="event.preventDefault(); handleAdminCreateUserAccount();">
              <div class="form-field">
                <label>Họ và Tên</label>
                <input id="adm-new-fullname" type="text" class="form-control-input" placeholder="Ví dụ: Em Minh Khôi" required />
              </div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <div class="form-field">
                  <label>Tên đăng nhập</label>
                  <input id="adm-new-username" type="text" class="form-control-input" placeholder="Ví dụ: minhkhoi8" required />
                </div>
                <div class="form-field">
                  <label>Mật khẩu / Mã PIN</label>
                  <input id="adm-new-password" type="text" class="form-control-input" placeholder="Ví dụ: 123456" required />
                </div>
              </div>
              <div class="form-field">
                <label>Phân quyền tài khoản (Chỉ Admin mới được cấp quyền này)</label>
                <select id="adm-new-role" class="form-control-select">
                  <option value="student" selected>🎓 Học sinh (Chỉ vào bàn học & làm đề)</option>
                  <option value="admin">👑 Quản trị viên / Phụ huynh (Toàn quyền quản lý)</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%;">
                ✨ Tạo Tài Khoản
              </button>
            </form>
          </div>

          <div class="analytics-box">
            <div class="analytics-box-title">
              <span>☁️ Kết Nối Cơ Sở Dữ Liệu Đám Mây Supabase</span>
              <span style="font-size:0.78rem; padding:3px 10px; border-radius:99px; background:${cfg.isConnected ? "#D1FAE5" : "#FEE2E2"}; color:${cfg.isConnected ? "#065F46" : "#991B1B"}; font-weight:700;">
                ${cfg.isConnected ? "🟢 Đang hoạt động" : "🔴 Chưa kết nối"}
              </span>
            </div>
            <p style="font-size:0.84rem; color:var(--text-muted); margin-bottom:12px;">
              Project URL: <code>${cfg.url}</code>
            </p>
            <button class="btn btn-outline btn-sm" onclick="openSupabaseSettingsModal()">
              ⚙️ Kiểm tra & Cấu hình nâng cao Supabase Key
            </button>
          </div>
        </div>
      </div>
    `;
  }

  window.handleAdminCreateUserAccount = async function () {
    const fullName = document.getElementById("adm-new-fullname")?.value.trim() || "";
    const username = document.getElementById("adm-new-username")?.value.trim() || "";
    const password = document.getElementById("adm-new-password")?.value.trim() || "";
    const role = document.getElementById("adm-new-role")?.value || "student";

    const res = await window.EY8_Supabase.register({
      fullName,
      username,
      password,
      role,
      createdByAdmin: true
    });

    if (res.success) {
      await refreshAdminUsersList();
      alert(`✅ Đã tạo tài khoản "${username}" (${role === "admin" ? "Admin" : "Học sinh"}) thành công!`);
    } else {
      alert("⚠️ " + (res.message || "Không thể tạo tài khoản!"));
    }
  };

  window.handleAdminChangeUserPassword = async function (userId, username, fullName) {
    const newPass = prompt(`Nhập mật khẩu / mã PIN mới cho tài khoản "${fullName}" (${username}):`);
    if (!newPass || !newPass.trim()) return;
    if (newPass.trim().length < 4) {
      alert("Mật khẩu phải có ít nhất 4 ký tự!");
      return;
    }
    await window.EY8_Supabase.updateUserPasswordOrInfo(userId, username, {
      pinCode: newPass.trim()
    });
    await refreshAdminUsersList();
    alert(`✅ Đã cập nhật mật khẩu mới cho "${username}" thành: ${newPass.trim()}`);
  };

  window.handleAdminResetStudentData = async function (username, userId) {
    if (
      !confirm(
        `Bạn có chắc chắn muốn XÓA SẠCH lịch sử điểm và đặt lại tiến độ học của tài khoản "${username}" về 0 không?`
      )
    ) {
      return;
    }
    await window.EY8_Supabase.resetStudentProgress(username, userId);
    if (state.adminSelectedStudent === username) {
      await loadAdminInspectedStudent(username);
    }
    alert(`✅ Đã đặt lại toàn bộ tiến độ học tập của "${username}" về ban đầu.`);
  };

  window.handleAdminDeleteUser = async function (username) {
    if (!confirm(`Bạn có chắc muốn xóa tài khoản "${username}" không?`)) return;
    const res = await window.EY8_Supabase.deleteUserAccount(username);
    if (!res.success) {
      alert(res.message);
      return;
    }
    await refreshAdminUsersList();
  };

  // =========================================================================
  // CÁC CỬA SỔ MODAL POPUP (SOI CHI TIẾT BÀI LÀM & CẤU HÌNH SUPABASE ADMIN)
  // =========================================================================
  window.closeModal = function () {
    const modalRoot = document.getElementById("modal-root");
    if (modalRoot) modalRoot.innerHTML = "";
  };

  window.openAttemptDetailModal = function (historyIndex, isAdminInspect = false) {
    const targetList = isAdminInspect ? state.inspectedStudentRecord.examHistory : state.examHistory;
    const item = targetList[historyIndex];
    if (!item) return;

    const modalRoot = document.getElementById("modal-root");
    if (!modalRoot) return;

    const questions = item.questions || [];
    const answers = item.answers || {};

    modalRoot.innerHTML = `
      <div class="modal-overlay" onclick="closeModal()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <button class="modal-close-btn" onclick="closeModal()">✕</button>

          <div style="border-bottom:1px solid var(--border); padding-bottom:14px; margin-bottom:18px;">
            <div style="font-size:0.82rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">
              Chi tiết bài làm • Ngày ${item.date}
            </div>
            <h3 style="font-size:1.3rem; font-weight:800; color:var(--text-main); margin:4px 0;">${item.examTitle}</h3>
            <div style="display:flex; gap:12px; align-items:center; font-size:0.9rem; margin-top:8px;">
              <span style="background:#D1FAE5; color:#065F46; padding:3px 10px; border-radius:99px; font-weight:800;">Điểm số: ${item.score10} / 10 đ</span>
              <span>Đúng: <strong>${item.correct}/${item.total}</strong> câu</span>
              <span>Thời gian làm: <strong>${item.timeSpent}</strong></span>
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:16px;">
            ${
              questions.length === 0
                ? `<p style="color:var(--text-muted);">Không tìm thấy danh sách câu hỏi chi tiết của lượt làm bài này.</p>`
                : questions
                    .map((q, qIdx) => {
                      const userChoice = answers[q.id];
                      const isCorrect = userChoice === q.answer;

                      return `
                        <div style="border:1px solid ${isCorrect ? "#A7F3D0" : "#FECACA"}; background:${isCorrect ? "#F0FDF4" : "#FEF2F2"}; border-radius:var(--radius-md); padding:16px;">
                          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <span style="font-weight:700; font-size:0.95rem;">Câu ${qIdx + 1}: ${q.section || ""}</span>
                            <span style="font-weight:800; font-size:0.85rem; padding:2px 8px; border-radius:99px; background:${isCorrect ? "#10B981" : "#EF4444"}; color:white;">
                              ${isCorrect ? "✓ ĐÚNG" : "✗ SAI"}
                            </span>
                          </div>

                          <p style="font-size:0.95rem; font-weight:600; margin-bottom:12px; color:var(--text-main);">${q.question || q.question_text}</p>

                          <div style="display:grid; grid-template-columns:1fr; gap:6px;">
                            ${(q.options || [])
                              .map((opt, oIdx) => {
                                let optBg = "#FFFFFF";
                                let optBorder = "#E2E8F0";
                                let optColor = "#0F172A";
                                let badge = "";

                                if (oIdx === q.answer) {
                                  optBg = "#D1FAE5";
                                  optBorder = "#10B981";
                                  optColor = "#065F46";
                                  badge = " ✔ (Đáp án đúng)";
                                } else if (userChoice === oIdx && !isCorrect) {
                                  optBg = "#FEE2E2";
                                  optBorder = "#EF4444";
                                  optColor = "#991B1B";
                                  badge = " ✘ (Đã chọn sai)";
                                }

                                return `
                                  <div style="padding:8px 12px; border-radius:var(--radius-sm); border:1px solid ${optBorder}; background:${optBg}; color:${optColor}; font-size:0.88rem; font-weight:${oIdx === q.answer || userChoice === oIdx ? "700" : "400"};">
                                    ${opt}${badge}
                                  </div>
                                `;
                              })
                              .join("")}
                          </div>

                          ${
                            q.explanation
                              ? `
                                <div style="margin-top:10px; padding:8px 12px; background:rgba(255,255,255,0.7); border-radius:var(--radius-sm); font-size:0.85rem; color:#1F2937;">
                                  💡 <strong>Giải thích:</strong> ${q.explanation}
                                </div>
                              `
                              : ""
                          }
                        </div>
                      `;
                    })
                    .join("")
            }
          </div>
        </div>
      </div>
    `;
  };

  window.openSupabaseSettingsModal = function () {
    if (!window.EY8_Supabase || !window.EY8_Supabase.isAdmin()) {
      alert("Chỉ tài khoản Quản trị viên (Admin) mới có quyền truy cập cấu hình hệ thống!");
      return;
    }

    const modalRoot = document.getElementById("modal-root");
    if (!modalRoot) return;
    const cfg = window.EY8_Supabase.getConfig();

    modalRoot.innerHTML = `
      <div class="modal-overlay" onclick="closeModal()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <button class="modal-close-btn" onclick="closeModal()">✕</button>
          <h3 style="font-size:1.3rem; font-weight:800; margin-bottom:6px;">⚙️ Cấu Hình Kết Nối Supabase Cloud (Admin)</h3>
          <p style="font-size:0.88rem; color:var(--text-muted); margin-bottom:18px;">
            Thông tin kết nối cơ sở dữ liệu đám mây đã được nhúng sẵn. Bạn có thể kiểm tra trạng thái kết nối tại đây.
          </p>

          <div style="display:flex; flex-direction:column; gap:14px;">
            <div>
              <label style="font-size:0.85rem; font-weight:700; display:block; margin-bottom:4px;">Supabase Project URL</label>
              <input id="input-supabase-url" type="text" class="form-control-input" style="font-family:monospace;" value="${cfg.url || ""}" />
            </div>
            <div>
              <label style="font-size:0.85rem; font-weight:700; display:block; margin-bottom:4px;">Supabase Anon Public Key</label>
              <input id="input-supabase-key" type="password" class="form-control-input" style="font-family:monospace;" value="${cfg.anonKey || ""}" />
            </div>
            <div id="supabase-modal-msg" style="display:none; padding:10px 14px; border-radius:8px; font-size:0.85rem;"></div>
            <div style="display:flex; gap:10px; margin-top:10px;">
              <button class="btn btn-primary" style="flex:1" onclick="saveAndTestSupabaseConfig()">
                💾 Kiểm tra & Lưu kết nối
              </button>
              <button class="btn btn-outline" onclick="closeModal()">Đóng</button>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  window.saveAndTestSupabaseConfig = async function () {
    const urlEl = document.getElementById("input-supabase-url");
    const keyEl = document.getElementById("input-supabase-key");
    const msgEl = document.getElementById("supabase-modal-msg");
    if (!urlEl || !keyEl || !msgEl) return;

    msgEl.style.display = "block";
    msgEl.style.background = "#EEF2FF";
    msgEl.style.color = "#3730A3";
    msgEl.textContent = "⏳ Đang kiểm tra kết nối tới Supabase...";

    window.EY8_Supabase.saveConfig(urlEl.value.trim(), keyEl.value.trim());
    const res = await window.EY8_Supabase.testConnection();
    if (res.ok) {
      msgEl.style.background = "#ECFDF5";
      msgEl.style.color = "#065F46";
      msgEl.textContent = "🎉 Kết nối tới Supabase Cloud hoàn toàn ổn định!";
    } else {
      msgEl.style.background = "#FEF2F2";
      msgEl.style.color = "#991B1B";
      msgEl.textContent = `❌ Lỗi: ${res.message}`;
    }
  };

  function findQuestionById(qId) {
    for (const u of window.STUDY_DATA.units || []) {
      if (u.practice) {
        const found = u.practice.find((q) => q.id === qId);
        if (found) return found;
      }
    }
    for (const ex of window.STUDY_DATA.exams || []) {
      if (ex.questions) {
        const found = ex.questions.find((q) => q.id === qId);
        if (found) return found;
      }
    }
    return null;
  }

  async function loadSystemStoreAndApply() {
    if (!window.EY8_Supabase) return;
    const store = await window.EY8_Supabase.loadSystemStore();
    if (store) {
      state.systemStore = store;
      applyCustomContentToStudyData();
    }
  }

  async function syncCloudData(silent = false) {
    if (!window.EY8_Supabase || !window.EY8_Supabase.isLoggedIn()) return;
    await loadSystemStoreAndApply();

    const currentUser = window.EY8_Supabase.getCurrentUser();
    if (!currentUser || currentUser.role === "admin") return;

    try {
      const record = await window.EY8_Supabase.fetchStudentFullRecord(currentUser.username, currentUser.id);
      if (!record) return;

      let hasChanges = false;
      if (record.snapshot) {
        if (
          record.snapshot.learnedVocab &&
          Object.keys(record.snapshot.learnedVocab).length > Object.keys(state.learnedVocab).length
        ) {
          state.learnedVocab = { ...state.learnedVocab, ...record.snapshot.learnedVocab };
          hasChanges = true;
        }
        if (record.snapshot.unitScores) {
          state.unitScores = { ...state.unitScores, ...record.snapshot.unitScores };
        }
        if (
          Array.isArray(record.snapshot.examHistory) &&
          record.snapshot.examHistory.length > state.examHistory.length
        ) {
          state.examHistory = record.snapshot.examHistory;
          hasChanges = true;
        }
        if (record.snapshot.mistakes) {
          state.mistakes = { ...state.mistakes, ...record.snapshot.mistakes };
        }
      }

      if (hasChanges) {
        persistActiveStudentState();
        renderApp();
      }
    } catch (e) {
      console.warn("syncCloudData warning:", e);
    }
  }

  // Khởi tạo khi trang tải xong
  window.addEventListener("DOMContentLoaded", async () => {
    loadActiveUserLocalProgress();
    renderApp();
    await loadSystemStoreAndApply();
    if (window.EY8_Supabase && window.EY8_Supabase.isLoggedIn()) {
      if (window.EY8_Supabase.isAdmin()) {
        await refreshAdminUsersList();
        await loadAdminInspectedStudent(state.adminSelectedStudent);
      } else {
        await syncCloudData(true);
      }
      renderApp();
    }
  });
})();
