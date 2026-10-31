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
    unitQuizMode: "list", // 'list' (xem toàn bộ) | 'focus' (tập trung từng câu)
    unitQuizFocusIndex: 0,

    // Exam state
    examFilter: "all", // all | 15m | midterm | final
    activeExam: null,
    examAnswers: {},
    examSubmitted: false,
    examTimerId: null,
    examSecondsLeft: 0,
    examTotalSeconds: 0,

    // Mistake practice & Spoiler-Free state
    mistakePracticeActive: false,
    mistakeAnswers: {},
    mistakeSubmitted: false,
    mistakeFilter: "all", // 'all' | 'unit' | 'exam'
    mistakeRevealAll: false,
    mistakeRetryChoices: {}, // lưu đáp án học sinh thử chọn lại trên từng thẻ câu sai
    mistakeManualReveal: {}, // lưu các câu học sinh bấm "Xem lời giải"

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

  // =========================================================================
  // HỆ THỐNG TOAST NOTIFICATION & CUSTOM CONFIRM MODAL HIỆN ĐẠI
  // =========================================================================
  window.showToast = function (message, type = "info") {
    let container = document.getElementById("toast-root");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-root";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const icons = {
      success: "✅",
      warning: "⚠️",
      error: "❌",
      info: "💡"
    };

    const toastEl = document.createElement("div");
    toastEl.className = `toast-item ${type}`;
    toastEl.innerHTML = `
      <span style="font-size:1.1rem; line-height:1;">${icons[type] || "💡"}</span>
      <span style="flex:1;">${message}</span>
    `;
    container.appendChild(toastEl);

    setTimeout(() => {
      toastEl.style.opacity = "0";
      toastEl.style.transform = "translateX(30px)";
      toastEl.style.transition = "all 0.25s ease";
      setTimeout(() => {
        if (toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
      }, 260);
    }, 3200);
  };

  let pendingConfirmCallback = null;
  window.showConfirmDialog = function ({
    title = "Xác nhận thao tác",
    message = "Bạn có chắc chắn muốn thực hiện thao tác này?",
    confirmText = "Đồng ý",
    cancelText = "Hủy bỏ",
    isDanger = false,
    onConfirm = null
  }) {
    const modalRoot = document.getElementById("modal-root");
    if (!modalRoot) {
      if (confirm(message) && typeof onConfirm === "function") onConfirm();
      return;
    }
    pendingConfirmCallback = onConfirm;
    modalRoot.innerHTML = `
      <div class="modal-overlay" onclick="closeModal()">
        <div class="modal-content" style="max-width:440px; padding:26px;" onclick="event.stopPropagation()">
          <button class="modal-close-btn" onclick="closeModal()">✕</button>
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
            <div style="width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.4rem; background:${
              isDanger ? "#FEE2E2" : "#EEF2FF"
            }; color:${isDanger ? "#DC2626" : "#4F46E5"}; flex-shrink:0;">
              ${isDanger ? "⚠️" : "❓"}
            </div>
            <h3 style="font-size:1.18rem; font-weight:800; color:var(--text-main);">${title}</h3>
          </div>
          <p style="font-size:0.92rem; color:#475569; line-height:1.55; margin-bottom:22px;">
            ${message}
          </p>
          <div style="display:flex; justify-content:flex-end; gap:10px;">
            <button class="btn btn-outline" onclick="closeModal()">${cancelText}</button>
            <button class="btn ${isDanger ? "btn-danger" : "btn-primary"}" onclick="executeConfirmDialogAction()">
              ${confirmText}
            </button>
          </div>
        </div>
      </div>
    `;
  };

  window.executeConfirmDialogAction = function () {
    const cb = pendingConfirmCallback;
    pendingConfirmCallback = null;
    closeModal();
    if (typeof cb === "function") cb();
  };

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
      showConfirmDialog({
        title: "Thoát phòng thi đang làm dở?",
        message: "Em đang làm dở bài thi. Nếu thoát ra bây giờ, lượt làm bài này sẽ bị hủy. Em có chắc muốn thoát không?",
        confirmText: "Thoát phòng thi",
        cancelText: "Ở lại làm tiếp",
        isDanger: true,
        onConfirm: () => {
          stopExamTimer();
          state.activeExam = null;
          window.switchMainTab(tabName, unitId);
        }
      });
      return;
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
  // HỆ THỐNG ĐỊNH TUYẾN URL & LỊCH SỬ DUYỆT TRANG (GO BACK / GO FORWARD ROUTER)
  // =========================================================================
  const routerState = {
    isRestoringFromUrl: false,
    lastKnownHash: "",
    historyStack: [],
    historyCursor: -1
  };

  function buildRouteHashFromState() {
    const isLoggedIn = window.EY8_Supabase && window.EY8_Supabase.isLoggedIn();
    if (!isLoggedIn) {
      return state.authScreenTab === "register" ? "#/register" : "#/login";
    }

    const isAdmin = window.EY8_Supabase.isAdmin();
    if (isAdmin && !state.adminPreviewStudentMode) {
      if (state.adminTab === "admin-assignments") return "#/admin/assignments";
      if (state.adminTab === "admin-content") return "#/admin/content";
      if (state.adminTab === "admin-users") return "#/admin/users";
      return "#/admin/monitor";
    }

    const prefix = isAdmin && state.adminPreviewStudentMode ? "#/preview" : "#";
    if (state.currentTab === "unit-study") {
      return `${prefix}/unit/${state.selectedUnitId || "unit-1"}/${state.unitSubTab || "vocab"}`;
    }
    if (state.currentTab === "exams") {
      if (state.activeExam && state.activeExam.id) {
        return `${prefix}/exams/room/${state.activeExam.id}`;
      }
      return `${prefix}/exams/${state.examFilter || "all"}`;
    }
    if (state.currentTab === "mistakes") {
      return state.mistakePracticeActive ? `${prefix}/mistakes/practice` : `${prefix}/mistakes`;
    }
    if (state.currentTab === "student-progress") {
      return `${prefix}/progress`;
    }
    return `${prefix}/dashboard`;
  }

  function getPageTitleFromState() {
    const isLoggedIn = window.EY8_Supabase && window.EY8_Supabase.isLoggedIn();
    if (!isLoggedIn) {
      return state.authScreenTab === "register"
        ? "Đăng ký Học sinh — English Young 8"
        : "Đăng nhập — English Young 8";
    }

    const isAdmin = window.EY8_Supabase.isAdmin();
    if (isAdmin && !state.adminPreviewStudentMode) {
      if (state.adminTab === "admin-assignments") return "🎯 Giao Bài Tập — Admin English Young 8";
      if (state.adminTab === "admin-content") return "🗂️ Quản Lý Đề & Câu Hỏi — Admin English Young 8";
      if (state.adminTab === "admin-users") return "👥 Tài Khoản & Hệ Thống — Admin English Young 8";
      return "📊 Giám Sát Học Sinh — Admin English Young 8";
    }

    if (state.currentTab === "unit-study") {
      const unit = (window.STUDY_DATA.units || []).find((u) => u.id === state.selectedUnitId);
      const subLabel =
        state.unitSubTab === "grammar"
          ? "Ngữ pháp"
          : state.unitSubTab === "practice"
          ? "Bài tập"
          : "Từ vựng & Flashcard";
      return `📚 Unit ${unit ? unit.number + ": " + unit.title : ""} (${subLabel}) — English Young 8`;
    }
    if (state.currentTab === "exams") {
      if (state.activeExam) {
        return `⏱️ Đang làm: ${state.activeExam.title} — English Young 8`;
      }
      return "📝 Phòng Luyện Đề Thi — English Young 8";
    }
    if (state.currentTab === "mistakes") {
      return state.mistakePracticeActive
        ? "🔥 Ôn Tập Câu Sai — English Young 8"
        : "📓 Sổ Tay Câu Sai — English Young 8";
    }
    if (state.currentTab === "student-progress") {
      return "🏆 Thành Tích Của Em — English Young 8";
    }
    return "🏠 Bàn Học Của Em — English Young 8";
  }

  function syncUrlWithState() {
    const targetHash = buildRouteHashFromState();
    const pageTitle = getPageTitleFromState();
    document.title = pageTitle;

    if (routerState.isRestoringFromUrl) {
      routerState.lastKnownHash = targetHash;
      return;
    }

    const currentHash = window.location.hash || "";
    if (!currentHash || currentHash === "#") {
      try {
        window.history.replaceState({ hash: targetHash }, pageTitle, targetHash);
      } catch (e) {
        window.location.hash = targetHash;
      }
      routerState.lastKnownHash = targetHash;
      routerState.historyStack = [targetHash];
      routerState.historyCursor = 0;
    } else if (currentHash !== targetHash) {
      try {
        window.history.pushState({ hash: targetHash }, pageTitle, targetHash);
      } catch (e) {
        window.location.hash = targetHash;
      }
      routerState.lastKnownHash = targetHash;
      routerState.historyStack = routerState.historyStack.slice(0, routerState.historyCursor + 1);
      routerState.historyStack.push(targetHash);
      routerState.historyCursor = routerState.historyStack.length - 1;
    }
  }

  function applyRouteFromHash(rawHash) {
    const hash = (rawHash || window.location.hash || "").trim();
    if (!hash || hash === "#" || hash === routerState.lastKnownHash) return false;

    const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    if (parts.length === 0) return false;

    // Bảo vệ khi học sinh đang làm dở bài thi mà bấm nút Back của trình duyệt
    const isTargetSameExamRoom =
      state.activeExam &&
      ((parts[0] === "exams" && parts[1] === "room" && parts[2] === state.activeExam.id) ||
        (parts[0] === "preview" && parts[1] === "exams" && parts[2] === "room" && parts[3] === state.activeExam.id));

    if (state.activeExam && !state.examSubmitted && !isTargetSameExamRoom) {
      if (!confirm("Em đang làm dở đề thi. Thoát ra sẽ hủy lượt làm bài này. Em có chắc không?")) {
        try {
          window.history.pushState({ hash: routerState.lastKnownHash }, document.title, routerState.lastKnownHash);
        } catch (e) {}
        return false;
      }
      stopExamTimer();
      state.activeExam = null;
    }

    const isLoggedIn = window.EY8_Supabase && window.EY8_Supabase.isLoggedIn();
    if (!isLoggedIn) {
      state.authScreenTab = parts[0] === "register" ? "register" : "login";
      routerState.lastKnownHash = hash;
      return true;
    }

    const isAdmin = window.EY8_Supabase.isAdmin();
    if (parts[0] === "admin" && isAdmin) {
      state.adminPreviewStudentMode = false;
      const sub = parts[1] || "monitor";
      if (sub === "assignments") state.adminTab = "admin-assignments";
      else if (sub === "content") state.adminTab = "admin-content";
      else if (sub === "users") state.adminTab = "admin-users";
      else state.adminTab = "admin-monitor";
    } else {
      if (isAdmin) {
        state.adminPreviewStudentMode = true;
        if (parts[0] === "preview") parts.shift();
      }
      const section = parts[0] || "dashboard";
      if (section === "unit") {
        state.currentTab = "unit-study";
        const uId = parts[1] || state.selectedUnitId || "unit-1";
        const sTab = parts[2] || "vocab";
        if (uId !== state.selectedUnitId) {
          state.selectedUnitId = uId;
          state.unitQuizAnswers = {};
          state.unitQuizSubmitted = false;
          resetFlashcardPositionForUnit(uId);
        }
        state.unitSubTab = ["vocab", "grammar", "practice"].includes(sTab) ? sTab : "vocab";
      } else if (section === "exams") {
        state.currentTab = "exams";
        if (parts[1] === "room" && parts[2]) {
          const exId = parts[2];
          if (!state.activeExam || state.activeExam.id !== exId) {
            const ex = (window.STUDY_DATA.exams || []).find((e) => e.id === exId);
            if (ex) {
              stopExamTimer();
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
            }
          }
        } else {
          stopExamTimer();
          state.activeExam = null;
          const f = parts[1] || "all";
          state.examFilter = ["all", "15m", "midterm", "final"].includes(f) ? f : "all";
        }
      } else if (section === "mistakes") {
        state.currentTab = "mistakes";
        state.mistakePracticeActive = parts[1] === "practice";
      } else if (section === "progress") {
        state.currentTab = "student-progress";
      } else {
        state.currentTab = "dashboard";
      }
    }

    const foundIdx = routerState.historyStack.indexOf(hash);
    if (foundIdx !== -1) {
      routerState.historyCursor = foundIdx;
    } else {
      routerState.historyStack.push(hash);
      routerState.historyCursor = routerState.historyStack.length - 1;
    }
    routerState.lastKnownHash = hash;
    return true;
  }

  // =========================================================================
  // RENDER TOÀN TRANG (PHÂN LUỒNG: AUTH SCREEN | ADMIN PORTAL | STUDENT PORTAL)
  // =========================================================================
  function renderApp() {
    const mainHeader = document.getElementById("main-header");
    const previewBarRoot = document.getElementById("admin-preview-bar-root");
    const navTabsEl = document.getElementById("main-nav-tabs");
    const mobileNavRoot = document.getElementById("mobile-nav-root");
    const userContainer = document.getElementById("header-user-container");
    const root = document.getElementById("app-root");

    if (!root) return;

    // Đồng bộ URL Hash & Lịch sử trình duyệt (hỗ trợ nút Back / Forward của trình duyệt & F5)
    syncUrlWithState();

    const isLoggedIn = window.EY8_Supabase && window.EY8_Supabase.isLoggedIn();

    // 1. NẾU CHƯA ĐĂNG NHẬP -> HIỂN THỊ TRANG ĐĂNG NHẬP / ĐĂNG KÝ TOÀN MÀN HÌNH
    if (!isLoggedIn) {
      if (mainHeader) mainHeader.style.display = "none";
      if (previewBarRoot) previewBarRoot.innerHTML = "";
      if (mobileNavRoot) mobileNavRoot.innerHTML = "";
      root.innerHTML = renderFullAuthScreen();
      return;
    }

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
      if (titleEl) {
        titleEl.innerHTML = `English Young 8 <span class="admin-role-badge" style="margin-left:4px; vertical-align:middle;">ADMIN PORTAL</span>`;
      }
      if (subEl) subEl.textContent = "Trung tâm Giám sát & Quản lý Học tập";

      const assignCount = (state.systemStore.assignments || []).length;
      if (navTabsEl) {
        navTabsEl.innerHTML = `
          <button class="nav-tab ${state.adminTab === "admin-monitor" ? "active" : ""}" onclick="switchAdminTab('admin-monitor')">
            📊 Giám Sát Học Sinh
          </button>
          <button class="nav-tab ${state.adminTab === "admin-assignments" ? "active" : ""}" onclick="switchAdminTab('admin-assignments')">
            🎯 Giao Bài Tập ${assignCount > 0 ? `<span class="badge-count" style="background:#F59E0B;">${assignCount}</span>` : `<span style="opacity:0.75;">(0)</span>`}
          </button>
          <button class="nav-tab ${state.adminTab === "admin-content" ? "active" : ""}" onclick="switchAdminTab('admin-content')">
            🗂️ Ngân Hàng Đề
          </button>
          <button class="nav-tab ${state.adminTab === "admin-users" ? "active" : ""}" onclick="switchAdminTab('admin-users')">
            👥 Tài Khoản & Cloud
          </button>
        `;
      }

      if (mobileNavRoot) {
        mobileNavRoot.innerHTML = `
          <nav class="mobile-bottom-nav" style="background:#0F172A; border-top-color:#334155;">
            <button class="mobile-nav-item ${state.adminTab === "admin-monitor" ? "active" : ""}" style="color:${state.adminTab === "admin-monitor" ? "#818CF8" : "#94A3B8"}" onclick="switchAdminTab('admin-monitor')">
              <span class="mobile-nav-icon">📊</span><span>Giám sát</span>
            </button>
            <button class="mobile-nav-item ${state.adminTab === "admin-assignments" ? "active" : ""}" style="color:${state.adminTab === "admin-assignments" ? "#818CF8" : "#94A3B8"}" onclick="switchAdminTab('admin-assignments')">
              <span class="mobile-nav-icon">🎯</span><span>Giao bài</span>
            </button>
            <button class="mobile-nav-item ${state.adminTab === "admin-content" ? "active" : ""}" style="color:${state.adminTab === "admin-content" ? "#818CF8" : "#94A3B8"}" onclick="switchAdminTab('admin-content')">
              <span class="mobile-nav-icon">🗂️</span><span>Ngân hàng đề</span>
            </button>
            <button class="mobile-nav-item ${state.adminTab === "admin-users" ? "active" : ""}" style="color:${state.adminTab === "admin-users" ? "#818CF8" : "#94A3B8"}" onclick="switchAdminTab('admin-users')">
              <span class="mobile-nav-icon">👥</span><span>Tài khoản</span>
            </button>
          </nav>
        `;
      }

      if (userContainer) {
        userContainer.innerHTML = `
          <div class="admin-header-actions">
            <button class="admin-preview-btn" onclick="toggleAdminStudentPreview(true)" title="Chuyển sang xem giao diện dưới góc nhìn của Học sinh">
              <span>👁️</span>
              <span>Góc nhìn Học sinh</span>
            </button>
            <div class="admin-user-pill">
              <div class="admin-user-avatar">👑</div>
              <div class="admin-user-meta">
                <span class="admin-user-name">${currentUser.fullName}</span>
                <span class="admin-role-badge">Admin</span>
              </div>
              <button class="admin-logout-btn" onclick="handleLogout()" title="Đăng xuất">
                Đăng xuất
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

    if (mobileNavRoot) {
      mobileNavRoot.innerHTML = `
        <nav class="mobile-bottom-nav">
          <button class="mobile-nav-item ${state.currentTab === "dashboard" ? "active" : ""}" onclick="switchMainTab('dashboard')">
            <span class="mobile-nav-icon">🏠</span><span>Bàn học</span>
          </button>
          <button class="mobile-nav-item ${state.currentTab === "unit-study" ? "active" : ""}" onclick="switchMainTab('unit-study')">
            <span class="mobile-nav-icon">📚</span><span>6 Unit</span>
          </button>
          <button class="mobile-nav-item ${state.currentTab === "exams" ? "active" : ""}" onclick="switchMainTab('exams')">
            <span class="mobile-nav-icon">📝</span><span>Luyện đề</span>
          </button>
          <button class="mobile-nav-item ${state.currentTab === "mistakes" ? "active" : ""}" onclick="switchMainTab('mistakes')">
            <span class="mobile-nav-icon">📓</span><span>Câu sai (${stats.mistakeCount})</span>
          </button>
          <button class="mobile-nav-item ${state.currentTab === "student-progress" ? "active" : ""}" onclick="switchMainTab('student-progress')">
            <span class="mobile-nav-icon">🏆</span><span>Thành tích</span>
          </button>
        </nav>
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

          <div class="fc-kbd-bar">
            <span class="fc-kbd-item"><kbd>Space</kbd> Lật thẻ</span>
            <span class="fc-kbd-item"><kbd>⬅</kbd> <kbd>➡</kbd> Chuyển từ</span>
            <span class="fc-kbd-item"><kbd>S</kbd> Nghe phát âm</span>
            <span class="fc-kbd-item"><kbd>Enter</kbd> Đánh dấu Đã thuộc</span>
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
    const wordObj = unit && unit.vocabulary ? unit.vocabulary.find((v) => v.id === vocabId) : null;
    if (wordObj) {
      showToast(`Đã thuộc từ "${wordObj.word}" (${wordObj.meaning})!`, "success");
    }

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
    showToast("Đã chuyển từ vựng về danh sách 'Chưa thuộc' để ôn lại.", "info");
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

  // =========================================================================
  // 2B. NGỮ ÂM & NGỮ PHÁP TRỰC QUAN (VISUAL GRAMMAR & PRONUNCIATION STUDIO)
  // =========================================================================
  function renderUnitGrammarSubTab(unit) {
    const pronHtml = unit.pronunciation
      ? `
        <div class="grammar-modern-card">
          <div class="grammar-card-header">
            <div class="grammar-header-icon" style="background:linear-gradient(135deg, #0EA5E9, #0284C7);">🗣️</div>
            <div>
              <div style="font-size:0.76rem; font-weight:800; color:#0284C7; text-transform:uppercase;">
                PHÒNG LUYỆN PHÁT ÂM • UNIT ${unit.number}
              </div>
              <h3 style="font-size:1.25rem; font-weight:900; color:var(--text-main);">
                Phân biệt cặp âm trọng tâm: ${unit.pronunciation.sounds.join("  &  ")}
              </h3>
            </div>
          </div>
          <p style="font-size:0.88rem; color:var(--text-muted);">
            👆 Bấm trực tiếp vào từng từ tiếng Anh bên dưới để nghe giọng đọc chuẩn bản xứ và cảm nhận sự khác biệt của khẩu hình:
          </p>
          <div class="pron-studio-grid">
            ${unit.pronunciation.explanation
              .map(
                (item) => `
                <div class="pron-studio-card">
                  <div>
                    <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px;">
                      <span class="pron-ipa-badge">${item.sound}</span>
                      <span style="font-size:0.76rem; font-weight:700; color:#4338CA; background:white; padding:4px 10px; border-radius:99px; border:1px solid #C7D2FE;">
                        🎧 Bấm từ để nghe
                      </span>
                    </div>
                    <p style="font-size:0.9rem; color:#1E293B; font-weight:500; line-height:1.55;">
                      ${item.desc}
                    </p>
                  </div>
                  <div style="display:flex; flex-wrap:wrap; gap:8px; padding-top:8px; border-top:1px dashed #CBD5E1;">
                    ${item.examples
                      .map(
                        (ex) => `
                        <button class="pron-word-chip" onclick="speakEnglish('${ex.replace(/'/g, "\\'")}', event)">
                          <span>🔊</span>
                          <span>${ex}</span>
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
        (g, gIdx) => `
        <div class="grammar-modern-card">
          <div class="grammar-card-header">
            <div class="grammar-header-icon">📐</div>
            <div>
              <div style="font-size:0.76rem; font-weight:800; color:var(--primary); text-transform:uppercase;">
                CHUYÊN ĐỀ NGỮ PHÁP #${gIdx + 1} • UNIT ${unit.number}
              </div>
              <h3 style="font-size:1.25rem; font-weight:900; color:var(--text-main);">
                ${g.title}
              </h3>
            </div>
          </div>

          <div class="grammar-rules-grid">
            ${g.rules
              .map(
                (r, rIdx) => `
                <div class="grammar-rule-box">
                  <span class="grammar-rule-num">${rIdx + 1}</span>
                  <div style="flex:1; line-height:1.6;">${r}</div>
                </div>
              `
              )
              .join("")}
          </div>

          <div class="exam-trap-modern">
            <div style="display:flex; align-items:center; gap:8px; font-size:0.95rem; font-weight:900; color:#92400E;">
              <span>⚠️</span>
              <span>BẪY ĐỀ THI HAY GẶP & MẸO NHẬN BIẾT NHANH TRONG 5 GIÂY:</span>
            </div>
            <div class="trap-tips-grid">
              ${g.examTips
                .map(
                  (t) => `
                  <div class="trap-tip-item">
                    <span style="font-size:1.05rem;">💡</span>
                    <span>${t}</span>
                  </div>
                `
                )
                .join("")}
            </div>
          </div>
        </div>
      `
      )
      .join("");

    return `
      ${pronHtml}
      ${grammarHtml}
      <div style="background:linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%); border:1.5px solid #C7D2FE; padding:22px 24px; border-radius:18px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px; margin-top:24px;">
        <div>
          <h4 style="font-size:1.08rem; font-weight:800; color:#1E1B4B;">🎯 Đã nắm vững lý thuyết Unit ${unit.number}?</h4>
          <p style="font-size:0.86rem; color:#4338CA;">Hãy áp dụng ngay vào ${unit.practice.length} câu bài tập thực hành có giải thích chi tiết!</p>
        </div>
        <button class="btn btn-primary" onclick="switchUnitSubTab('practice')">
          ✍️ Làm ngay ${unit.practice.length} câu bài tập Unit ${unit.number} ➔
        </button>
      </div>
    `;
  }

  // =========================================================================
  // 2C. BÀI TẬP THỰC HÀNH UNIT (STICKY PROGRESS BAR & FOCUS MODE / LIST MODE)
  // =========================================================================
  function renderUnitPracticeSubTab(unit) {
    const questions = unit.practice || [];
    const answeredCount = Object.keys(state.unitQuizAnswers).length;
    const pctDone = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

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

    // Chấm tròn nhảy nhanh câu hỏi
    const miniDotsHtml = questions
      .map((q, idx) => {
        const uAns = state.unitQuizAnswers[q.id];
        let bg = "#F1F5F9";
        let color = "#475569";
        let border = "#CBD5E1";
        if (!state.unitQuizSubmitted) {
          if (uAns !== undefined) {
            bg = "#4F46E5";
            color = "white";
            border = "#4F46E5";
          }
        } else {
          if (uAns === q.answer) {
            bg = "#10B981";
            color = "white";
            border = "#10B981";
          } else {
            bg = "#EF4444";
            color = "white";
            border = "#EF4444";
          }
        }
        const isFocusCurrent = state.unitQuizMode === "focus" && state.unitQuizFocusIndex === idx;
        return `
          <button
            style="width:30px; height:30px; border-radius:8px; border:1.5px solid ${border}; background:${bg}; color:${color}; font-size:0.78rem; font-weight:800; cursor:pointer; ${
              isFocusCurrent ? "box-shadow:0 0 0 3px rgba(79,70,229,0.3); transform:scale(1.08);" : ""
            }"
            onclick="jumpToUnitQuizQuestion(${idx}, '${q.id}')"
          >
            ${idx + 1}
          </button>
        `;
      })
      .join("");

    // Nội dung câu hỏi (Chế độ Danh sách hoặc Chế độ Tập trung từng câu)
    let questionsBodyHtml = "";
    if (state.unitQuizMode === "focus") {
      if (state.unitQuizFocusIndex >= questions.length) state.unitQuizFocusIndex = 0;
      const focusQ = questions[state.unitQuizFocusIndex];
      const userAns = state.unitQuizAnswers[focusQ.id];
      questionsBodyHtml = `
        ${renderQuestionCardHtml(
          focusQ,
          state.unitQuizFocusIndex + 1,
          userAns,
          state.unitQuizSubmitted,
          "selectUnitQuizOption"
        )}
        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:20px;">
          <button
            class="btn btn-outline"
            ${state.unitQuizFocusIndex === 0 ? "disabled" : ""}
            onclick="stepUnitQuizFocus(-1)"
          >
            ⬅ Câu trước
          </button>
          <span style="font-size:0.88rem; font-weight:700; color:var(--text-muted);">
            Câu ${state.unitQuizFocusIndex + 1} / ${questions.length}
          </span>
          ${
            state.unitQuizFocusIndex < questions.length - 1
              ? `<button class="btn btn-primary" onclick="stepUnitQuizFocus(1)">Câu tiếp theo ➡</button>`
              : !state.unitQuizSubmitted
              ? `<button class="btn btn-success" onclick="submitUnitQuiz('${unit.id}')">✅ Nộp bài & Chấm điểm</button>`
              : `<button class="btn btn-outline" onclick="resetUnitQuiz()">🔄 Làm lại</button>`
          }
        </div>
      `;
    } else {
      questionsBodyHtml = questions
        .map((q, idx) => {
          const userAns = state.unitQuizAnswers[q.id];
          return renderQuestionCardHtml(q, idx + 1, userAns, state.unitQuizSubmitted, "selectUnitQuizOption");
        })
        .join("");
    }

    return `
      ${scoreBannerHtml}

      <div class="quiz-sticky-bar">
        <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
          <div class="quiz-mode-switch">
            <button
              class="quiz-mode-btn ${state.unitQuizMode === "list" ? "active" : ""}"
              onclick="setUnitQuizViewMode('list')"
            >
              📋 Xem cả danh sách (${questions.length} câu)
            </button>
            <button
              class="quiz-mode-btn ${state.unitQuizMode === "focus" ? "active" : ""}"
              onclick="setUnitQuizViewMode('focus')"
            >
              🎯 Từng câu một
            </button>
          </div>
          <span style="font-size:0.84rem; font-weight:700; color:#334155;">
            Đã chọn: <strong style="color:var(--primary);">${answeredCount}/${questions.length}</strong> (${pctDone}%)
          </span>
        </div>

        <div style="display:flex; align-items:center; gap:5px; flex-wrap:wrap;">
          ${miniDotsHtml}
        </div>

        ${
          !state.unitQuizSubmitted
            ? `
            <button class="btn btn-primary btn-sm" style="padding:8px 14px;" onclick="submitUnitQuiz('${unit.id}')">
              ✅ Nộp bài
            </button>
          `
            : `
            <button class="btn btn-outline btn-sm" onclick="resetUnitQuiz()">
              🔄 Làm lại
            </button>
          `
        }
      </div>

      ${questionsBodyHtml}

      ${
        !state.unitQuizSubmitted && state.unitQuizMode === "list"
          ? `
          <div style="background:white; padding:20px; border-radius:var(--radius-lg); border:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
            <span>Đã hoàn thành: <strong>${answeredCount} / ${questions.length}</strong> câu hỏi</span>
            <button class="btn btn-primary" onclick="submitUnitQuiz('${unit.id}')">✅ Nộp bài & Xem giải thích chi tiết</button>
          </div>
        `
          : ""
      }
    `;
  }

  window.setUnitQuizViewMode = function (mode) {
    state.unitQuizMode = mode;
    renderApp();
  };

  window.stepUnitQuizFocus = function (delta) {
    const unit = (window.STUDY_DATA.units || []).find((u) => u.id === state.selectedUnitId);
    if (!unit || !unit.practice) return;
    const nextIdx = state.unitQuizFocusIndex + delta;
    if (nextIdx >= 0 && nextIdx < unit.practice.length) {
      state.unitQuizFocusIndex = nextIdx;
      renderApp();
    }
  };

  window.jumpToUnitQuizQuestion = function (idx, qId) {
    if (state.unitQuizMode === "focus") {
      state.unitQuizFocusIndex = idx;
      renderApp();
    } else {
      scrollToQuestion(qId);
    }
  };

  window.selectUnitQuizOption = function (qId, optIdx) {
    if (state.unitQuizSubmitted) return;
    state.unitQuizAnswers[qId] = optIdx;
    renderApp();
  };

  function finalizeUnitQuizSubmission(unit) {
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

    const prevBest = state.unitScores[unit.id] || 0;
    if (correct >= prevBest) {
      state.unitScores[unit.id] = correct;
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
    showToast(`Đã chấm điểm Unit ${unit.number}: Đạt ${score10}/10 điểm (${correct}/${unit.practice.length} câu)!`, "success");
    renderApp();
    window.scrollTo({ top: 150, behavior: "smooth" });
  }

  window.submitUnitQuiz = function (unitId) {
    const unit = (window.STUDY_DATA.units || []).find((u) => u.id === unitId);
    if (!unit) return;
    const answeredCount = Object.keys(state.unitQuizAnswers).length;
    if (answeredCount < unit.practice.length) {
      showConfirmDialog({
        title: "Chưa chọn hết câu hỏi",
        message: `Em mới chọn ${answeredCount}/${unit.practice.length} câu. Các câu bỏ trống sẽ tính là sai. Em có muốn nộp bài chấm điểm luôn không?`,
        confirmText: "Nộp bài ngay",
        cancelText: "Làm tiếp",
        onConfirm: () => finalizeUnitQuizSubmission(unit)
      });
      return;
    }
    finalizeUnitQuizSubmission(unit);
  };

  window.resetUnitQuiz = function () {
    state.unitQuizAnswers = {};
    state.unitQuizSubmitted = false;
    state.unitQuizFocusIndex = 0;
    renderApp();
  };

  // =========================================================================
  // RENDER THẺ CÂU HỎI CHUẨN PHÒNG THI (ANSWER BUBBLES A / B / C / D)
  // =========================================================================
  function parseOptionBubble(optText, fallbackIdx) {
    const letters = ["A", "B", "C", "D"];
    const raw = String(optText || "").trim();
    const match = raw.match(/^([A-Da-d])[\.\)\:\-]\s*(.*)$/);
    if (match) {
      return {
        letter: match[1].toUpperCase(),
        content: match[2]
      };
    }
    return {
      letter: letters[fallbackIdx] || "A",
      content: raw
    };
  }

  function renderQuestionCardHtml(q, displayNum, userAns, isSubmitted, clickHandlerName) {
    const optionsHtml = q.options
      .map((opt, oIdx) => {
        const parsed = parseOptionBubble(opt, oIdx);
        let cls = "option-btn-modern";
        let stateTag = "";
        if (!isSubmitted) {
          if (userAns === oIdx) cls += " selected";
        } else {
          if (oIdx === q.answer) {
            cls += " correct-ans";
            stateTag = `<span style="margin-left:auto; font-size:0.75rem; font-weight:800; color:#047857;">✔ Đáp án đúng</span>`;
          } else if (userAns === oIdx && userAns !== q.answer) {
            cls += " wrong-ans";
            stateTag = `<span style="margin-left:auto; font-size:0.75rem; font-weight:800; color:#B91C1C;">✘ Em đã chọn</span>`;
          }
        }
        return `
          <button
            class="${cls}"
            ${isSubmitted ? "disabled" : ""}
            onclick="${clickHandlerName}('${q.id}', ${oIdx})"
          >
            <span class="opt-letter-bubble">${parsed.letter}</span>
            <span style="flex:1;">${parsed.content}</span>
            ${stateTag}
          </button>
        `;
      })
      .join("");

    const statusBadge = isSubmitted
      ? userAns === q.answer
        ? `<span style="background:#D1FAE5; color:#065F46; padding:3px 10px; border-radius:99px; font-weight:800; font-size:0.78rem;">✔ Chính xác</span>`
        : `<span style="background:#FEE2E2; color:#991B1B; padding:3px 10px; border-radius:99px; font-weight:800; font-size:0.78rem;">✘ ${
            userAns === undefined ? "Chưa chọn đáp án" : "Sai • Đã lưu vào Sổ tay"
          }</span>`
      : userAns !== undefined
      ? `<span style="background:#EEF2FF; color:#4F46E5; padding:3px 10px; border-radius:99px; font-weight:700; font-size:0.76rem;">Đã chọn phương án ${
          ["A", "B", "C", "D"][userAns]
        }</span>`
      : "";

    return `
      <div class="question-card" id="qcard-${q.id}">
        ${
          q.section
            ? `<div style="font-size:0.76rem; font-weight:800; color:var(--primary); text-transform:uppercase; letter-spacing:0.03em; margin-bottom:8px;">📌 ${q.section}</div>`
            : ""
        }
        ${
          q.passage
            ? `
            <div class="reading-passage-card">
              <div style="font-size:0.8rem; font-weight:800; color:#0369A1; text-transform:uppercase; margin-bottom:6px;">
                📖 ĐOẠN VĂN ĐỌC HIỂU (READING PASSAGE):
              </div>
              <div>${q.passage}</div>
            </div>
          `
            : ""
        }
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
  // 3. STUDENT PORTAL: PHÒNG LUYỆN ĐỀ THI (EXAM TICKET CARDS & EXAM ROOM)
  // =========================================================================
  function renderExamsView() {
    if (state.activeExam) {
      return renderActiveExamRoom();
    }

    const exams = window.STUDY_DATA.exams || [];
    const filtered =
      state.examFilter === "all" ? exams : exams.filter((e) => e.category === state.examFilter);

    return `
      <div class="section-header" style="margin-bottom:22px;">
        <div>
          <h2>📝 Phòng Luyện Đề Kiểm Tra & Thi Học Kì 1</h2>
          <p style="font-size:0.9rem; color:var(--text-muted);">
            Bộ đề bám sát cấu trúc đề thi Tiếng Anh 8 Global Success • Tự động bấm giờ và phân tích lỗi sai
          </p>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="unit-pill ${state.examFilter === "all" ? "active" : ""}" onclick="setExamFilter('all')">
            Tất cả (${exams.length})
          </button>
          <button class="unit-pill ${state.examFilter === "15m" ? "active" : ""}" onclick="setExamFilter('15m')">
            ⚡ Đề 15 Phút
          </button>
          <button class="unit-pill ${state.examFilter === "midterm" ? "active" : ""}" onclick="setExamFilter('midterm')">
            🔥 Đề Giữa Kì 1
          </button>
          <button class="unit-pill ${state.examFilter === "final" ? "active" : ""}" onclick="setExamFilter('final')">
            🏆 Đề Cuối Kì 1
          </button>
        </div>
      </div>

      <div class="exam-tickets-grid">
        ${filtered
          .map((ex) => {
            const attempts = state.examHistory.filter((h) => h.examId === ex.id);
            const bestScore =
              attempts.length > 0 ? Math.max(...attempts.map((a) => Number(a.score10 || 0))).toFixed(1) : null;

            let accentColor = "#4F46E5";
            let pillBg = "#EEF2FF";
            let pillColor = "#4338CA";
            if (ex.category === "15m") {
              accentColor = "#0EA5E9";
              pillBg = "#E0F2FE";
              pillColor = "#0369A1";
            } else if (ex.category === "midterm") {
              accentColor = "#F59E0B";
              pillBg = "#FEF3C7";
              pillColor = "#B45309";
            } else if (ex.category === "final") {
              accentColor = "#E11D48";
              pillBg = "#FFE4E6";
              pillColor = "#BE123C";
            }

            return `
              <div class="exam-ticket-card">
                <div class="exam-ticket-top-strip" style="background:${accentColor};"></div>
                <div class="exam-ticket-body">
                  <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:12px;">
                      <div class="exam-meta-pills">
                        <span class="exam-meta-pill" style="background:${pillBg}; color:${pillColor};">
                          ${ex.badge || "Đề kiểm tra"}
                        </span>
                        <span class="exam-meta-pill" style="background:#F1F5F9; color:#475569;">
                          ⏱️ ${ex.durationMinutes} phút
                        </span>
                        <span class="exam-meta-pill" style="background:#F1F5F9; color:#475569;">
                          📋 ${ex.questions.length} câu
                        </span>
                      </div>
                    </div>

                    <h3 style="font-size:1.15rem; font-weight:900; color:var(--text-main); margin-bottom:6px; line-height:1.3;">
                      ${ex.title}
                    </h3>
                    <div style="font-size:0.82rem; color:${accentColor}; font-weight:700; margin-bottom:8px;">
                      📌 Phạm vi: ${ex.scope}
                    </div>
                    <p style="font-size:0.86rem; color:#475569; line-height:1.55;">
                      ${ex.description}
                    </p>
                  </div>

                  <div>
                    <div class="exam-stats-box" style="margin-bottom:14px;">
                      <span>Số lượt đã thi: <strong>${attempts.length} lần</strong></span>
                      <span>
                        Điểm cao nhất:
                        <strong style="color:${bestScore !== null ? "#059669" : "#64748B"};">
                          ${bestScore !== null ? bestScore + " / 10đ" : "Chưa làm"}
                        </strong>
                      </span>
                    </div>

                    <button
                      class="btn btn-primary"
                      style="width:100%; background:${accentColor};"
                      onclick="startExamById('${ex.id}')"
                    >
                      ${bestScore !== null ? "🔄 Vào Thi Lại Đề Này ➔" : "✍️ Bắt Đầu Vào Phòng Thi ➔"}
                    </button>
                  </div>
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
        showToast("⏰ Đã hết thời gian làm bài! Hệ thống tự động chấm điểm bài thi.", "warning");
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
      <div style="background:white; border:1px solid var(--border); border-radius:14px; padding:12px 18px; margin-bottom:18px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
        <button class="btn btn-outline btn-sm" onclick="exitExamRoom()">⬅ Quay lại danh sách đề thi</button>
        <div style="font-weight:800; color:var(--text-main); font-size:0.95rem;">
          📝 ${ex.title} <span style="color:var(--text-muted); font-weight:600;">(${ex.questions.length} câu • ${ex.durationMinutes} phút)</span>
        </div>
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

          <div style="display:flex; justify-content:space-between; font-size:0.86rem; font-weight:700; margin-bottom:6px;">
            <span>Tiến độ làm bài:</span>
            <span style="color:var(--primary);">${answeredCount} / ${questions.length} câu</span>
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

  function finalizeActiveExamSubmission() {
    const ex = state.activeExam;
    if (!ex || state.examSubmitted) return;

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
    showToast(`Hoàn thành bài thi! Điểm của em: ${score10}/10 điểm.`, "success");
    renderApp();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  window.submitActiveExam = function (forceSubmit) {
    const ex = state.activeExam;
    if (!ex || state.examSubmitted) return;
    const answeredCount = Object.keys(state.examAnswers).length;
    if (!forceSubmit && answeredCount < ex.questions.length) {
      showConfirmDialog({
        title: "Nộp bài thi sớm?",
        message: `Em mới trả lời ${answeredCount}/${ex.questions.length} câu. Các câu chưa chọn sẽ bị tính 0 điểm. Em có chắc chắn muốn nộp bài ngay không?`,
        confirmText: "Nộp bài & Chấm điểm",
        cancelText: "Kiểm tra lại bài",
        onConfirm: () => finalizeActiveExamSubmission()
      });
      return;
    }
    finalizeActiveExamSubmission();
  };

  window.exitExamRoom = function () {
    if (!state.examSubmitted) {
      showConfirmDialog({
        title: "Thoát khỏi phòng thi?",
        message: "Em đang làm dở đề thi. Nếu thoát ra lúc này, kết quả bài đang làm sẽ bị hủy. Em có chắc muốn thoát không?",
        confirmText: "Thoát phòng thi",
        cancelText: "Tiếp tục làm bài",
        isDanger: true,
        onConfirm: () => {
          stopExamTimer();
          state.activeExam = null;
          renderApp();
        }
      });
      return;
    }
    stopExamTimer();
    state.activeExam = null;
    renderApp();
  };

  // =========================================================================
  // 4. STUDENT PORTAL: SỔ TAY CÂU SAI THÔNG MINH (SPOILER-FREE RETRY CARDS)
  // =========================================================================
  function renderMistakesView() {
    const allMistakes = Object.values(state.mistakes);
    const unitMistakesCount = allMistakes.filter((m) => (m.source || "").toLowerCase().includes("unit")).length;
    const examMistakesCount = allMistakes.length - unitMistakesCount;

    const mistakeList = allMistakes.filter((m) => {
      if (state.mistakeFilter === "unit") return (m.source || "").toLowerCase().includes("unit");
      if (state.mistakeFilter === "exam") return !(m.source || "").toLowerCase().includes("unit");
      return true;
    });

    if (allMistakes.length === 0) {
      return `
        <div class="section-header">
          <h2>📓 Sổ Tay Câu Hay Sai Của Em</h2>
        </div>
        <div style="background:white; border:1.5px solid var(--border); border-radius:20px; padding:44px 24px; text-align:center; margin-bottom:32px;">
          <div style="font-size:3.4rem; margin-bottom:12px;">🎉</div>
          <h3 style="font-size:1.35rem; font-weight:900; margin-bottom:8px;">Sổ tay câu sai đang trống!</h3>
          <p style="color:var(--text-muted); max-width:520px; margin:0 auto 20px;">
            Khi em làm bài tập các Unit hoặc làm Đề thi mà có câu trả lời sai, hệ thống sẽ tự động gom vào đây để em tự thử sức lại trước ngày thi thật.
          </p>
          <button class="btn btn-primary" onclick="switchMainTab('exams')">📝 Đi tới Phòng Luyện Đề</button>
        </div>
      `;
    }

    if (state.mistakePracticeActive) {
      return renderMistakePracticeMode(allMistakes);
    }

    const cardsHtml = mistakeList
      .map((m, idx) => {
        const retryChoice = state.mistakeRetryChoices[m.id];
        const isRetryCorrect = retryChoice !== undefined && retryChoice === m.answer;
        const isRetryWrong = retryChoice !== undefined && retryChoice !== m.answer;
        const isRevealed = state.mistakeRevealAll || !!state.mistakeManualReveal[m.id] || isRetryCorrect;

        const optionsHtml = m.options
          .map((opt, oIdx) => {
            const parsed = parseOptionBubble(opt, oIdx);
            let cls = "option-btn-modern";
            let tag = "";

            if (isRevealed) {
              if (oIdx === m.answer) {
                cls += " correct-ans";
                tag = `<span style="margin-left:auto; font-size:0.75rem; font-weight:800; color:#047857;">✔ Đáp án đúng</span>`;
              } else if (retryChoice === oIdx && retryChoice !== m.answer) {
                cls += " wrong-ans";
                tag = `<span style="margin-left:auto; font-size:0.75rem; font-weight:800; color:#B91C1C;">✘ Vừa chọn sai</span>`;
              } else if (oIdx === m.wrongChoice) {
                tag = `<span style="margin-left:auto; font-size:0.74rem; color:#94A3B8;">(Lần trước chọn nhầm)</span>`;
              }
            } else {
              if (retryChoice === oIdx && isRetryWrong) {
                cls += " wrong-ans";
                tag = `<span style="margin-left:auto; font-size:0.75rem; font-weight:800; color:#B91C1C;">✘ Chưa đúng, thử lại nhé!</span>`;
              } else if (oIdx === m.wrongChoice) {
                tag = `<span style="margin-left:auto; font-size:0.74rem; color:#94A3B8;">(Lần trước em chọn)</span>`;
              }
            }

            return `
              <button class="${cls}" onclick="trySolveMistakeCard('${m.id}', ${oIdx})">
                <span class="opt-letter-bubble">${parsed.letter}</span>
                <span style="flex:1;">${parsed.content}</span>
                ${tag}
              </button>
            `;
          })
          .join("");

        return `
          <div class="mistake-retry-card ${isRetryCorrect ? "solved-right" : ""}">
            <div class="q-header" style="margin-bottom:12px;">
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                <span class="q-num" style="background:${isRetryCorrect ? "#D1FAE5" : "#FEE2E2"}; color:${
                  isRetryCorrect ? "#065F46" : "#DC2626"
                };">
                  ${isRetryCorrect ? "🎉 Đã gỡ thành công" : `Câu cần gỡ #${idx + 1}`}
                </span>
                <span style="font-size:0.78rem; font-weight:700; color:var(--text-muted); background:#F1F5F9; padding:3px 10px; border-radius:99px;">
                  📌 Nguồn: ${m.source}
                </span>
              </div>

              <div style="display:flex; align-items:center; gap:8px;">
                ${
                  !isRevealed
                    ? `<button class="btn btn-outline btn-sm" onclick="toggleRevealSingleMistake('${m.id}')">👁️ Xem đáp án</button>`
                    : ""
                }
                <button
                  class="btn ${isRetryCorrect ? "btn-success" : "btn-outline"} btn-sm"
                  onclick="removeMistakeItem('${m.id}')"
                >
                  ✔ Đã hiểu kỹ (Xóa khỏi sổ)
                </button>
              </div>
            </div>

            <div class="q-text">${m.question}</div>

            <div style="font-size:0.8rem; color:#64748B; margin-bottom:10px; font-weight:600;">
              ${
                isRetryCorrect
                  ? "✅ Chính xác! Em đã tự chọn đúng đáp án của câu này:"
                  : "👆 Hãy tự suy nghĩ và bấm chọn lại đáp án A, B, C hoặc D bên dưới:"
              }
            </div>

            <div class="options-list">
              ${optionsHtml}
            </div>

            ${
              isRevealed
                ? `
                <div class="explanation-box" style="margin-top:14px;">
                  <strong>💡 Giải thích cần nhớ:</strong> ${m.explanation}
                </div>
              `
                : ""
            }
          </div>
        `;
      })
      .join("");

    return `
      <div style="background:linear-gradient(135deg, #991B1B 0%, #DC2626 100%); color:white; border-radius:20px; padding:22px 26px; margin-bottom:20px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; box-shadow:0 10px 25px rgba(220,38,38,0.18);">
        <div>
          <span style="font-size:0.76rem; font-weight:800; background:rgba(255,255,255,0.18); padding:3px 10px; border-radius:99px; text-transform:uppercase;">
            📓 SỔ TAY GỠ LỖI SAI THÔNG MINH
          </span>
          <h2 style="font-size:1.45rem; font-weight:900; margin:6px 0 4px;">
            Em đang có ${allMistakes.length} câu cần ôn tập lại
          </h2>
          <p style="font-size:0.88rem; color:#FEE2E2;">
            Đáp án đã được ẩn mặc định để em tự chọn lại ngay trên từng câu — hoặc bấm làm bài kiểm tra tổng hợp!
          </p>
        </div>
        <button class="btn btn-white" style="color:#DC2626; font-weight:800;" onclick="startMistakePractice()">
          🔥 Thi lại toàn bộ ${allMistakes.length} câu sai ➔
        </button>
      </div>

      <div class="mistake-toolbar">
        <div class="vocab-status-tabs">
          <button
            class="vocab-status-tab ${state.mistakeFilter === "all" ? "active" : ""}"
            onclick="setMistakeFilter('all')"
          >
            Tất cả (${allMistakes.length})
          </button>
          <button
            class="vocab-status-tab ${state.mistakeFilter === "unit" ? "active" : ""}"
            onclick="setMistakeFilter('unit')"
          >
            📚 Từ Bài tập Unit (${unitMistakesCount})
          </button>
          <button
            class="vocab-status-tab ${state.mistakeFilter === "exam" ? "active" : ""}"
            onclick="setMistakeFilter('exam')"
          >
            📝 Từ Đề thi (${examMistakesCount})
          </button>
        </div>

        <button class="btn btn-outline btn-sm" onclick="toggleMistakeRevealAll()">
          ${state.mistakeRevealAll ? "🙈 Ẩn lại đáp án để tự làm" : "👁️ Hiện toàn bộ đáp án & lời giải"}
        </button>
      </div>

      ${cardsHtml}
    `;
  }

  window.setMistakeFilter = function (f) {
    state.mistakeFilter = f;
    renderApp();
  };

  window.toggleMistakeRevealAll = function () {
    state.mistakeRevealAll = !state.mistakeRevealAll;
    renderApp();
  };

  window.toggleRevealSingleMistake = function (qId) {
    state.mistakeManualReveal[qId] = !state.mistakeManualReveal[qId];
    renderApp();
  };

  window.trySolveMistakeCard = function (qId, optIdx) {
    state.mistakeRetryChoices[qId] = optIdx;
    const item = state.mistakes[qId];
    if (item && optIdx === item.answer) {
      showToast("🎉 Chính xác! Em đã hiểu câu này, hãy đọc lại lời giải nhé!", "success");
    }
    renderApp();
  };

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
    let removed = 0;
    Object.keys(state.mistakeAnswers).forEach((qId) => {
      if (state.mistakes[qId] && state.mistakeAnswers[qId] === state.mistakes[qId].answer) {
        delete state.mistakes[qId];
        removed++;
      }
    });
    persistActiveStudentState();
    state.mistakePracticeActive = false;
    showToast(`Đã xóa ${removed} câu làm đúng khỏi Sổ tay câu sai!`, "success");
    renderApp();
  };

  window.removeMistakeItem = function (qId) {
    delete state.mistakes[qId];
    delete state.mistakeRetryChoices[qId];
    persistActiveStudentState();
    showToast("Đã xóa câu hỏi khỏi Sổ tay câu sai!", "success");
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

  let adminAutoPickedOnce = false;

  async function refreshAdminUsersList() {
    if (!window.EY8_Supabase) return;
    state.allUsers = await window.EY8_Supabase.getAllUsers();
    const students = state.allUsers.filter((u) => u.role === "student");

    if (students.length > 0) {
      // Ưu tiên chọn tài khoản học sinh thực tế (khác em_lop8 mặc định) trong lần mở đầu tiên
      const realStudents = students.filter((s) => s.username !== "em_lop8");
      if (!adminAutoPickedOnce && realStudents.length > 0 && state.adminSelectedStudent === "em_lop8") {
        state.adminSelectedStudent = realStudents[0].username;
        adminAutoPickedOnce = true;
      } else if (!students.some((s) => s.username === state.adminSelectedStudent)) {
        state.adminSelectedStudent = (realStudents[0] || students[0]).username;
      }
    }
    renderApp();
  }

  async function loadAdminInspectedStudent(username, showNotify = false) {
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
    if (showNotify) {
      showToast(`🔄 Đã đồng bộ dữ liệu mới nhất của học sinh "${targetUser ? targetUser.fullName : username}"!`, "info");
    }
  }

  window.handleAdminChangeStudent = function (username) {
    loadAdminInspectedStudent(username, true);
  };

  window.handleAdminInspectFromUsersTab = function (username) {
    state.adminTab = "admin-monitor";
    syncUrlWithState(false);
    loadAdminInspectedStudent(username, true);
  };

  window.handleQuickAssignFromMonitor = function (targetType, targetId, title, minScore = 8.0) {
    state.adminPreselectAssignment = {
      studentUsername: state.adminSelectedStudent,
      targetValue: `${targetType}|${targetId}|${title}`,
      minScore,
      dueDate: "Trong ngày hôm nay",
      note: `Em ôn kỹ và hoàn thành "${title}" đạt tối thiểu ${minScore} điểm nhé!`
    };
    switchAdminTab("admin-assignments");
    showToast(`📌 Đã chọn sẵn "${title}". Bạn bấm nút Giao Nhiệm Vụ để xác nhận nhé!`, "info");
  };

  // -------------------------------------------------------------------------
  // ADMIN TAB 1: GIÁM SÁT HỌC SINH (EXECUTIVE STUDENT INSPECTOR)
  // -------------------------------------------------------------------------
  function renderAdminMonitorView() {
    const students = state.allUsers.filter((u) => u.role === "student");
    const selectedStudentObj =
      students.find((s) => s.username === state.adminSelectedStudent) || {
        id: "",
        fullName: "Học Sinh Lớp 8",
        username: "em_lop8"
      };

    const rec = state.inspectedStudentRecord;
    const stats = computeStatsFromRecord(rec);
    const skills = calculateSkillStatsFromHistory(rec.examHistory);
    const units = window.STUDY_DATA.units || [];
    const mistakeList = Object.values(rec.mistakes || {});

    const vocabPct = Math.round((stats.learnedCount / (stats.totalVocab || 1)) * 100);
    const completedUnitsCount = Object.keys(rec.unitScores || {}).length;
    const unitPct = Math.round((completedUnitsCount / (units.length || 6)) * 100);
    const numericAvg = stats.avgExamScore === "--" ? 0 : Number(stats.avgExamScore);
    const scorePct = Math.min(100, Math.round(numericAvg * 10));

    let scoreBadgeText = "Chưa có điểm";
    let scoreBadgeBg = "#F1F5F9";
    let scoreBadgeColor = "#64748B";
    if (stats.avgExamScore !== "--") {
      if (numericAvg >= 8) {
        scoreBadgeText = "🌟 Đạt mục tiêu";
        scoreBadgeBg = "#D1FAE5";
        scoreBadgeColor = "#065F46";
      } else if (numericAvg >= 6.5) {
        scoreBadgeText = "👍 Khá";
        scoreBadgeBg = "#FEF3C7";
        scoreBadgeColor = "#92400E";
      } else {
        scoreBadgeText = "⚠️ Cần kèm sát";
        scoreBadgeBg = "#FEE2E2";
        scoreBadgeColor = "#991B1B";
      }
    }

    const lastAttempt = rec.examHistory && rec.examHistory.length > 0 ? rec.examHistory[0] : null;

    return `
      <!-- Thanh Chuyển Đổi Nhanh Học Sinh 1 Chạm -->
      <div class="admin-student-switcher-bar">
        <div class="admin-student-pills-wrap">
          <span style="font-size:0.82rem; font-weight:800; color:var(--text-muted); margin-right:4px;">
            👨‍🎓 Chọn tài khoản Học sinh (${students.length}):
          </span>
          ${students
            .map((s) => {
              const isSelected = s.username === state.adminSelectedStudent;
              return `
                <button class="admin-student-pill ${isSelected ? "active" : ""}" onclick="handleAdminChangeStudent('${s.username}')">
                  <span class="stu-dot"></span>
                  <span>${s.fullName}</span>
                  <span style="opacity:0.75; font-weight:600; font-size:0.76rem;">(@${s.username})</span>
                </button>
              `;
            })
            .join("")}
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button class="btn btn-outline btn-sm" style="font-size:0.78rem; padding:6px 12px;" onclick="switchAdminTab('admin-users')">
            ➕ Quản lý / Thêm tài khoản
          </button>
        </div>
      </div>

      <!-- Banner Trung Tâm Chỉ Huy Học Sinh Đang Giám Sát -->
      <div class="admin-hero-inspector">
        <div class="admin-hero-left">
          <div class="admin-hero-avatar">🎓</div>
          <div>
            <div class="admin-hero-badge-row">
              <span class="admin-cloud-live-tag">● Cloud Sync Thời Gian Thực</span>
              <span style="font-size:0.76rem; color:#A5B4FC; font-weight:700;">Username: @${selectedStudentObj.username}</span>
            </div>
            <div class="admin-hero-title">${selectedStudentObj.fullName}</div>
            <div class="admin-hero-sub">
              ${
                lastAttempt
                  ? `🕒 Lần nộp bài gần nhất: <strong>${lastAttempt.examTitle}</strong> (${lastAttempt.score10}/10 điểm • ${lastAttempt.date})`
                  : `📭 Chưa có lượt nộp đề kiểm tra nào • Đã thuộc <strong>${stats.learnedCount}/${stats.totalVocab}</strong> từ vựng HK1`
              }
            </div>
          </div>
        </div>

        <div class="admin-hero-actions">
          <button class="btn-admin-glass" onclick="loadAdminInspectedStudent('${state.adminSelectedStudent}', true)">
            🔄 Đồng bộ mới nhất
          </button>
          <button class="btn-admin-glass" onclick="openAdminPasswordModal('${selectedStudentObj.id || ""}', '${selectedStudentObj.username}', '${selectedStudentObj.fullName}')">
            🔑 Đổi mật khẩu
          </button>
          <button class="btn-admin-gold" onclick="switchAdminTab('admin-assignments')">
            🎯 Giao bài tập cho ${selectedStudentObj.fullName}
          </button>
        </div>
      </div>

      <!-- 4 Thẻ KPI Quản Trị Có Thanh Tiến Độ -->
      <div class="admin-kpi-grid">
        <div class="admin-kpi-card">
          <div class="admin-kpi-top">
            <div>
              <div class="admin-kpi-value">${stats.avgExamScore} <span style="font-size:0.9rem; font-weight:600; color:var(--text-muted);">/10</span></div>
              <div class="admin-kpi-title">Điểm trung bình các lần thi</div>
            </div>
            <div class="admin-kpi-icon" style="background:#EEF2FF; color:#4F46E5;">🎯</div>
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span class="admin-kpi-tag" style="background:${scoreBadgeBg}; color:${scoreBadgeColor};">${scoreBadgeText}</span>
              <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted);">Mục tiêu: ≥ 8.0</span>
            </div>
            <div class="admin-kpi-bar">
              <div class="admin-kpi-bar-fill" style="width:${scorePct}%; background:#4F46E5;"></div>
            </div>
          </div>
        </div>

        <div class="admin-kpi-card">
          <div class="admin-kpi-top">
            <div>
              <div class="admin-kpi-value">${rec.examHistory.length} <span style="font-size:0.95rem; font-weight:700; color:var(--text-muted);">lượt thi</span></div>
              <div class="admin-kpi-title">Đã làm ${completedUnitsCount}/${units.length} bài tập Unit</div>
            </div>
            <div class="admin-kpi-icon" style="background:#ECFDF5; color:#10B981;">📝</div>
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span class="admin-kpi-tag" style="background:#ECFDF5; color:#065F46;">Hoàn thành ${unitPct}% Unit</span>
              <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted);">${completedUnitsCount}/6 Unit</span>
            </div>
            <div class="admin-kpi-bar">
              <div class="admin-kpi-bar-fill" style="width:${unitPct}%; background:#10B981;"></div>
            </div>
          </div>
        </div>

        <div class="admin-kpi-card">
          <div class="admin-kpi-top">
            <div>
              <div class="admin-kpi-value">${stats.learnedCount} <span style="font-size:0.95rem; font-weight:700; color:var(--text-muted);">/ ${stats.totalVocab} từ</span></div>
              <div class="admin-kpi-title">Từ vựng Học kì 1 đã thuộc</div>
            </div>
            <div class="admin-kpi-icon" style="background:#FEF3C7; color:#D97706;">📖</div>
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span class="admin-kpi-tag" style="background:#FEF3C7; color:#92400E;">Đạt ${vocabPct}% kho từ</span>
              <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted);">Còn ${Math.max(0, stats.totalVocab - stats.learnedCount)} từ</span>
            </div>
            <div class="admin-kpi-bar">
              <div class="admin-kpi-bar-fill" style="width:${vocabPct}%; background:#F59E0B;"></div>
            </div>
          </div>
        </div>

        <div class="admin-kpi-card">
          <div class="admin-kpi-top">
            <div>
              <div class="admin-kpi-value" style="color:${stats.mistakeCount > 0 ? "#DC2626" : "#10B981"};">${stats.mistakeCount} <span style="font-size:0.95rem; font-weight:700; color:var(--text-muted);">câu sai</span></div>
              <div class="admin-kpi-title">Đang lưu trong Sổ tay câu sai</div>
            </div>
            <div class="admin-kpi-icon" style="background:#FEE2E2; color:#EF4444;">⚠️</div>
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span class="admin-kpi-tag" style="background:${stats.mistakeCount > 0 ? "#FEE2E2" : "#D1FAE5"}; color:${stats.mistakeCount > 0 ? "#991B1B" : "#065F46"};">
                ${stats.mistakeCount > 0 ? "Cần nhắc em ôn lại" : "✔ Không tồn đọng"}
              </span>
              <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted);">Tự động lọc</span>
            </div>
            <div class="admin-kpi-bar">
              <div class="admin-kpi-bar-fill" style="width:${stats.mistakeCount > 0 ? Math.min(100, stats.mistakeCount * 5) : 0}%; background:#EF4444;"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="analytics-two-col">
        <!-- Cột 1: Chẩn đoán lỗ hổng kiến thức 5 kỹ năng -->
        <div class="analytics-box">
          <div class="analytics-box-title">
            <span>🩺 Chẩn Đoán Năng Lực 5 Kỹ Năng Tiếng Anh 8</span>
            <span style="font-size:0.78rem; color:var(--text-muted); font-weight:700;">${selectedStudentObj.fullName}</span>
          </div>

          ${
            rec.examHistory.length === 0
              ? `
                <div style="padding:14px 16px; border-radius:12px; background:#EEF2FF; border:1px solid #C7D2FE; margin-bottom:16px; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
                  <div style="font-size:0.84rem; color:#1E1B4B;">
                    💡 <strong>${selectedStudentObj.fullName}</strong> chưa nộp đề thi nào nên các chỉ số kỹ năng đang ở mức <strong>0%</strong>. Hãy giao 1 đề 15 phút để hệ thống phân tích năng lực!
                  </div>
                  <button class="btn btn-primary btn-sm" style="white-space:nowrap;" onclick="handleQuickAssignFromMonitor('exam', 'exam_15m_1', 'Đề kiểm tra 15 phút số 1 (Unit 1 & Unit 2)', 8.0)">
                    ⚡ Giao Đề 15 Phút Số 1
                  </button>
                </div>
              `
              : ""
          }

          ${Object.keys(skills)
            .map((k) => {
              const sk = skills[k];
              const pct = sk.total > 0 ? Math.round((sk.correct / sk.total) * 100) : 0;
              let color = "#94A3B8";
              let statusLabel = "⚪ Chưa có dữ liệu";
              if (sk.total > 0) {
                if (pct >= 80) {
                  color = "#10B981";
                  statusLabel = "🟢 Nắm vững";
                } else if (pct >= 60) {
                  color = "#F59E0B";
                  statusLabel = "🟡 Khá (Hay nhầm câu bẫy)";
                } else {
                  color = "#EF4444";
                  statusLabel = "🔴 Hổng kiến thức (Cần kèm thêm)";
                }
              }

              return `
                <div class="skill-bar-row" style="margin-bottom:14px;">
                  <div class="skill-bar-meta">
                    <span style="font-weight:700;">${sk.icon} ${sk.name}</span>
                    <span style="font-size:0.8rem;"><strong>${pct}%</strong> (${sk.correct}/${sk.total} câu) • ${statusLabel}</span>
                  </div>
                  <div class="skill-bar-track">
                    <div class="skill-bar-fill" style="width: ${pct}%; background: ${color}"></div>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>

        <!-- Cột 2: Kiểm tra tiến độ từng Unit của Học sinh kèm nút Giao Nhanh -->
        <div class="analytics-box">
          <div class="analytics-box-title">
            <span>📚 Tiến Độ Từng Unit (Unit 1 – Unit 6)</span>
            <span style="font-size:0.76rem; color:var(--text-muted);">Bấm "📌 Giao Unit" để yêu cầu em học</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${units
              .map((u) => {
                const totalV = u.vocabulary.length;
                const learnedV = u.vocabulary.filter((v) => rec.learnedVocab[v.id]).length;
                const pct = Math.round((learnedV / totalV) * 100);
                const bestScore = rec.unitScores[u.id];
                const barColor = pct === 100 ? "#10B981" : pct > 0 ? "#4F46E5" : "#CBD5E1";

                return `
                  <div class="admin-unit-row-card">
                    <div class="admin-unit-row-top">
                      <div style="font-weight:800; font-size:0.9rem; color:var(--text-main);">
                        ${u.icon} Unit ${u.number}: ${u.title}
                        <span style="font-weight:600; font-size:0.78rem; color:var(--text-muted);">(${u.viTitle})</span>
                      </div>
                      <button class="btn btn-outline btn-sm" style="padding:3px 9px; font-size:0.74rem; white-space:nowrap;" onclick="handleQuickAssignFromMonitor('unit', '${u.id}', 'Ôn tập & Làm bài tập Unit ${u.number}: ${u.title}', 8.0)">
                        📌 Giao Unit ${u.number}
                      </button>
                    </div>
                    <div class="admin-unit-mini-bar">
                      <div class="admin-unit-mini-fill" style="width:${pct}%; background:${barColor};"></div>
                    </div>
                    <div class="admin-unit-row-meta">
                      <span>📖 Từ vựng: <strong style="color:var(--text-main);">${learnedV}/${totalV} từ (${pct}%)</strong></span>
                      <span>
                        ✍️ Bài tập Unit:
                        <strong style="color:${bestScore !== undefined ? "#059669" : "#DC2626"};">
                          ${bestScore !== undefined ? `Đã làm (${bestScore}/${u.practice.length} câu)` : "Chưa làm"}
                        </strong>
                      </span>
                    </div>
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
          <span style="font-size:0.82rem; color:var(--text-muted);">Kiểm tra thời gian làm bài thực tế và từng phương án em đã chọn</span>
        </div>
        ${renderHistoryTableHtml(rec.examHistory, true)}
      </div>

      <!-- Danh sách các câu học sinh đang làm sai -->
      <div class="analytics-box">
        <div class="analytics-box-title">
          <span>⚠️ Các Câu ${selectedStudentObj.fullName} Đang Làm Sai (${mistakeList.length} câu)</span>
          ${
            mistakeList.length > 0
              ? `<span style="font-size:0.78rem; color:#DC2626; font-weight:700;">Hệ thống đã tự động đưa vào Sổ Tay Câu Sai của em</span>`
              : ""
          }
        </div>
        ${
          mistakeList.length === 0
            ? `<p style="color:var(--text-muted); text-align:center; padding:18px 0;">🎉 Hiện không có câu làm sai nào tồn đọng của <strong>${selectedStudentObj.fullName}</strong>.</p>`
            : `
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:12px;">
                ${mistakeList
                  .slice(0, 12)
                  .map(
                    (m) => `
                    <div style="padding:12px 14px; border:1px solid #FECACA; background:#FEF2F2; border-radius:10px; font-size:0.86rem;">
                      <div style="font-size:0.75rem; font-weight:700; color:#DC2626; margin-bottom:4px;">📌 Nguồn: ${m.source}</div>
                      <div style="font-weight:700; margin-bottom:6px; color:var(--text-main);">${m.question}</div>
                      <div style="color:#065F46; font-weight:700;">✔ Đáp án đúng: ${(m.options && m.options[m.answer]) || ""}</div>
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
  // ADMIN TAB 2: GIAO BÀI TẬP CHO EM (ASSIGNMENT STUDIO + 1-CLICK PRESETS)
  // -------------------------------------------------------------------------
  function renderAdminAssignmentsView() {
    const students = state.allUsers.filter((u) => u.role === "student");
    const units = window.STUDY_DATA.units || [];
    const exams = window.STUDY_DATA.exams || [];
    const assignments = state.systemStore.assignments || [];
    const pre = state.adminPreselectAssignment || null;

    const selectedStu = pre ? pre.studentUsername : state.adminSelectedStudent;
    const selectedTarget = pre ? pre.targetValue : "";
    const defaultMinScore = pre ? pre.minScore : 8.0;
    const defaultDue = pre ? pre.dueDate : "Tối nay trước 21h00";
    const defaultNote = pre ? pre.note : "";

    return `
      <div class="section-header">
        <div>
          <h2>🎯 Giao Bài Tập & Nhiệm Vụ Bắt Buộc Cho Học Sinh</h2>
          <p style="font-size:0.9rem; color:var(--text-muted);">Bài tập bạn giao tại đây sẽ hiển thị nổi bật ngay đầu trang <strong>"🏠 Bàn Học Của Em"</strong> kèm trạng thái tự động kiểm tra điểm số.</p>
        </div>
      </div>

      <div class="analytics-two-col">
        <!-- Form tạo nhiệm vụ mới + Mẫu giao bài 1 chạm -->
        <div class="analytics-box">
          <div class="analytics-box-title">
            <span>➕ Tạo Nhiệm Vụ Giao Bài Mới</span>
            <span style="font-size:0.75rem; color:var(--primary); font-weight:700;">Đồng bộ Cloud tức thì</span>
          </div>

          <div style="margin-bottom:14px;">
            <div style="font-size:0.78rem; font-weight:800; color:var(--text-muted); margin-bottom:6px;">
              ⚡ MẪU GIAO BÀI NHANH 1 CHẠM (Bấm để điền tự động):
            </div>
            <div class="admin-preset-grid">
              <button type="button" class="admin-preset-chip" onclick="applyAssignmentPreset('exam|exam_15m_1|Đề kiểm tra 15 phút số 1 (Unit 1 & Unit 2)', 8.0, 'Tối nay trước 21h00', 'Em làm đề 15 phút số 1 cẩn thận, đọc kỹ giải thích câu sai nhé!')">
                <span>⚡</span>
                <span>Đề 15 Phút Số 1 (≥ 8.0đ)</span>
              </button>
              <button type="button" class="admin-preset-chip" onclick="applyAssignmentPreset('exam|exam_midterm_1|Đề thi Giữa Học kì 1 - Đề chuẩn số 1', 8.0, 'Cuối tuần này', 'Em canh đúng 45 phút làm nghiêm túc Đề Giữa Kì 1 nhé!')">
                <span>🔥</span>
                <span>Đề Giữa Kì 1 Số 1 (≥ 8.0đ)</span>
              </button>
              <button type="button" class="admin-preset-chip" onclick="applyAssignmentPreset('exam|exam_final_1|Đề thi Học kì 1 - Đề tổng hợp số 1', 8.5, 'Chủ nhật tuần này', 'Đề tổng hợp toàn bộ HK1, em cố gắng đạt trên 8.5 điểm nhé!')">
                <span>🏆</span>
                <span>Đề Thi Cuối Kì 1 (≥ 8.5đ)</span>
              </button>
              <button type="button" class="admin-preset-chip" onclick="applyAssignmentPreset('unit|unit1|Ôn tập & Làm bài tập Unit 1: Leisure Time', 8.0, 'Trong ngày hôm nay', 'Em học thuộc hết Flashcard từ vựng rồi làm bài tập Unit 1 nhé!')">
                <span>📚</span>
                <span>Từ vựng & Bài tập Unit 1</span>
              </button>
            </div>
          </div>

          <form onsubmit="event.preventDefault(); handleAdminCreateAssignment();">
            <div class="form-field">
              <label>1. Giao cho Học sinh nào?</label>
              <select id="assign-student" class="form-control-select">
                <option value="all">👨‍🎓 Tất cả học sinh trên hệ thống</option>
                ${students
                  .map(
                    (s) =>
                      `<option value="${s.username}" ${s.username === selectedStu ? "selected" : ""}>🎓 ${s.fullName} (@${s.username})</option>`
                  )
                  .join("")}
              </select>
            </div>

            <div class="form-field">
              <label>2. Chọn Đề thi hoặc Unit yêu cầu hoàn thành</label>
              <select id="assign-target" class="form-control-select" required>
                <optgroup label="📝 Các Đề Kiểm Tra (15 Phút, Giữa Kì, Cuối Kì)">
                  ${exams
                    .map((ex) => {
                      const val = `exam|${ex.id}|${ex.title}`;
                      return `<option value="${val}" ${val === selectedTarget ? "selected" : ""}>📝 ${ex.title}</option>`;
                    })
                    .join("")}
                </optgroup>
                <optgroup label="📚 Học Từ Vựng & Làm Bài Tập Unit (1–6)">
                  ${units
                    .map((u) => {
                      const val = `unit|${u.id}|Ôn tập & Làm bài tập Unit ${u.number}: ${u.title}`;
                      return `<option value="${val}" ${val === selectedTarget ? "selected" : ""}>📚 Unit ${u.number}: ${u.title} (${u.viTitle})</option>`;
                    })
                    .join("")}
                </optgroup>
              </select>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
              <div class="form-field">
                <label>3. Điểm mục tiêu cần đạt (Thang 10)</label>
                <input id="assign-minscore" type="number" step="0.5" min="5" max="10" value="${defaultMinScore}" class="form-control-input" required />
              </div>
              <div class="form-field">
                <label>4. Hạn hoàn thành</label>
                <input id="assign-duedate" type="text" placeholder="Ví dụ: Tối nay 21h / Chủ nhật" value="${defaultDue}" class="form-control-input" required />
              </div>
            </div>

            <div class="form-field">
              <label>5. Lời nhắn / Dặn dò của Anh/Chị</label>
              <input id="assign-note" type="text" value="${defaultNote}" placeholder="Ví dụ: Em làm cẩn thận không khoanh vội nhé, tối anh kiểm tra!" class="form-control-input" />
            </div>

            <button type="submit" class="btn btn-primary" style="width:100%; padding:13px; font-size:0.95rem;">
              📌 Giao Nhiệm Vụ Này Cho Em Ngay
            </button>
          </form>
        </div>

        <!-- Danh sách nhiệm vụ đã giao & Trạng thái hoàn thành -->
        <div class="analytics-box">
          <div class="analytics-box-title">
            <span>📋 Danh Sách Nhiệm Vụ Đã Giao (${assignments.length})</span>
            <span style="font-size:0.78rem; color:var(--text-muted);">Đánh giá theo: <strong>${state.adminSelectedStudent}</strong></span>
          </div>

          ${
            assignments.length === 0
              ? `
                <div style="text-align:center; padding:42px 16px; color:var(--text-muted);">
                  <div style="font-size:2.4rem; margin-bottom:10px;">📋</div>
                  <div style="font-weight:800; color:var(--text-main); margin-bottom:4px;">Chưa có nhiệm vụ nào được giao</div>
                  <p style="font-size:0.86rem;">Hãy bấm vào 1 trong 4 <strong>Mẫu giao bài nhanh</strong> ở cột bên trái để giao bài tập đầu tiên cho em nhé!</p>
                </div>
              `
              : `
                <div style="display:flex; flex-direction:column; gap:12px;">
                  ${assignments
                    .map((task) => {
                      const evalRes = evaluateAssignmentStatus(task, state.inspectedStudentRecord);
                      const stuLabel =
                        task.studentUsername === "all"
                          ? "👨‍🎓 Tất cả học sinh"
                          : `🎓 @${task.studentUsername}`;
                      return `
                        <div style="padding:15px 16px; border:1.5px solid ${evalRes.isCompleted ? "#A7F3D0" : "#E2E8F0"}; background:${evalRes.isCompleted ? "#F0FDF4" : "#FFFFFF"}; border-radius:14px; box-shadow:var(--shadow-sm);">
                          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; margin-bottom:8px; flex-wrap:wrap;">
                            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                              <span style="font-size:0.72rem; font-weight:800; padding:3px 9px; border-radius:99px; background:${evalRes.isCompleted ? "#10B981" : "#F59E0B"}; color:white;">
                                ${evalRes.isCompleted ? "✅ ĐÃ HOÀN THÀNH" : "⏳ ĐANG CHỜ EM LÀM"}
                              </span>
                              <span style="font-size:0.74rem; font-weight:700; padding:2px 8px; border-radius:99px; background:#EEF2FF; color:#3730A3;">
                                ${stuLabel}
                              </span>
                              <span style="font-size:0.76rem; color:var(--text-muted);">⏰ Hạn: <strong>${task.dueDate}</strong></span>
                            </div>
                            <button class="btn btn-outline btn-sm" style="color:var(--danger); padding:3px 9px; font-size:0.75rem;" onclick="handleAdminDeleteAssignment('${task.id}')">🗑️ Xóa</button>
                          </div>
                          <div style="font-weight:800; font-size:0.96rem; margin-bottom:6px; color:var(--text-main);">${task.title}</div>
                          <div style="font-size:0.83rem; color:#334155; display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px;">
                            <span>🎯 Yêu cầu: <strong>≥ ${task.minScore} điểm</strong></span>
                            <span>📊 Kết quả hiện tại: <strong style="color:${evalRes.isCompleted ? "#059669" : "#D97706"};">${evalRes.bestScoreText}</strong></span>
                          </div>
                          ${task.note ? `<div style="font-size:0.8rem; color:#475569; margin-top:8px; padding:7px 10px; background:#F8FAFC; border-radius:8px; border-left:3px solid #6366F1;">💬 <em>"${task.note}"</em></div>` : ""}
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

  window.applyAssignmentPreset = function (targetVal, minScore, dueDate, note) {
    const targetEl = document.getElementById("assign-target");
    const scoreEl = document.getElementById("assign-minscore");
    const dueEl = document.getElementById("assign-duedate");
    const noteEl = document.getElementById("assign-note");

    if (targetEl) targetEl.value = targetVal;
    if (scoreEl) scoreEl.value = minScore;
    if (dueEl) dueEl.value = dueDate;
    if (noteEl) noteEl.value = note;

    showToast("⚡ Đã điền mẫu nhiệm vụ! Bấm 'Giao Nhiệm Vụ Này Cho Em Ngay' để hoàn tất.", "info");
  };

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
    state.adminPreselectAssignment = null;

    if (window.EY8_Supabase) {
      await window.EY8_Supabase.saveSystemStore(state.systemStore);
    }
    renderApp();
    showToast("✅ Đã giao bài tập thành công! Khi em mở web lên sẽ thấy ngay nhiệm vụ này.", "success");
  };

  window.handleAdminDeleteAssignment = function (taskId) {
    showConfirmDialog({
      icon: "🗑️",
      title: "Xóa nhiệm vụ đã giao?",
      message: "Nhiệm vụ này sẽ được gỡ khỏi bảng nhiệm vụ của học sinh.",
      confirmText: "Xóa nhiệm vụ",
      danger: true,
      onConfirm: async () => {
        state.systemStore.assignments = (state.systemStore.assignments || []).filter((t) => t.id !== taskId);
        if (window.EY8_Supabase) {
          await window.EY8_Supabase.saveSystemStore(state.systemStore);
        }
        renderApp();
        showToast("🗑️ Đã xóa nhiệm vụ giao bài.", "info");
      }
    });
  };

  // -------------------------------------------------------------------------
  // ADMIN TAB 3: QUẢN LÝ ĐỀ THI & NGÂN HÀNG CÂU HỎI (CONTENT & QUESTION EXPLORER)
  // -------------------------------------------------------------------------
  function renderAdminContentView() {
    const units = window.STUDY_DATA.units || [];
    const exams = window.STUDY_DATA.exams || [];
    const customQuestions = state.systemStore.customQuestions || [];
    const customExams = state.systemStore.customExams || [];

    const totalUnitQuestions = units.reduce((acc, u) => acc + (u.practice ? u.practice.length : 0), 0);
    const totalExamQuestions = exams.reduce((acc, e) => acc + (e.questions ? e.questions.length : 0), 0);

    // Bộ lọc trình duyệt ngân hàng câu hỏi
    const browserSource = state.adminQBankSource || (exams[0] ? `exam|${exams[0].id}` : "unit|unit1");
    const [bType, bId] = browserSource.split("|");
    let browsedQuestions = [];
    let browsedTitle = "";
    if (bType === "exam") {
      const exObj = exams.find((e) => e.id === bId) || exams[0];
      if (exObj) {
        browsedQuestions = exObj.questions || [];
        browsedTitle = exObj.title;
      }
    } else {
      const uObj = units.find((u) => u.id === bId) || units[0];
      if (uObj) {
        browsedQuestions = uObj.practice || [];
        browsedTitle = `Unit ${uObj.number}: ${uObj.title}`;
      }
    }

    return `
      <div class="section-header">
        <div>
          <h2>🗂️ Quản Lý Ngân Hàng Đề Thi & Học Liệu</h2>
          <p style="font-size:0.9rem; color:var(--text-muted);">Tra cứu toàn bộ câu hỏi trong hệ thống, bổ sung câu hỏi mới từ đề cương trên lớp của em hoặc tạo đề thi riêng.</p>
        </div>
      </div>

      <div class="admin-kpi-grid">
        <div class="admin-kpi-card">
          <div class="admin-kpi-top">
            <div>
              <div class="admin-kpi-value">${units.length} Units</div>
              <div class="admin-kpi-title">${totalUnitQuestions} câu bài tập theo Unit</div>
            </div>
            <div class="admin-kpi-icon" style="background:#EEF2FF; color:#4F46E5;">📚</div>
          </div>
        </div>
        <div class="admin-kpi-card">
          <div class="admin-kpi-top">
            <div>
              <div class="admin-kpi-value">${exams.length} Đề thi</div>
              <div class="admin-kpi-title">${totalExamQuestions} câu hỏi trong phòng thi</div>
            </div>
            <div class="admin-kpi-icon" style="background:#ECFDF5; color:#10B981;">📝</div>
          </div>
        </div>
        <div class="admin-kpi-card">
          <div class="admin-kpi-top">
            <div>
              <div class="admin-kpi-value">${customQuestions.length} câu</div>
              <div class="admin-kpi-title">Câu hỏi do Admin bổ sung thêm</div>
            </div>
            <div class="admin-kpi-icon" style="background:#FEF3C7; color:#D97706;">✨</div>
          </div>
        </div>
        <div class="admin-kpi-card">
          <div class="admin-kpi-top">
            <div>
              <div class="admin-kpi-value">${customExams.length} đề</div>
              <div class="admin-kpi-title">Đề kiểm tra riêng do Admin tạo</div>
            </div>
            <div class="admin-kpi-icon" style="background:#FCE7F3; color:#DB2777;">🏆</div>
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
                ? `<p style="color:var(--text-muted); font-size:0.86rem;">Chưa có câu hỏi bổ sung nào. Bạn có thể thêm câu hỏi từ đề cương trường em ở khung bên trái.</p>`
                : `
                  <div style="display:flex; flex-direction:column; gap:10px; max-height:300px; overflow-y:auto;">
                    ${customQuestions
                      .map(
                        (cq) => `
                        <div style="padding:10px 12px; border:1px solid var(--border); border-radius:8px; font-size:0.84rem; display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                          <div>
                            <div style="font-weight:700;">${cq.question}</div>
                            <div style="color:var(--success); font-size:0.78rem;">✔ Đáp án: ${cq.options[cq.answer]}</div>
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

      <!-- Khung Tra Cứu & Duyệt Ngân Hàng Câu Hỏi Toàn Hệ Thống -->
      <div class="analytics-box" style="margin-top:24px;">
        <div class="analytics-box-title" style="flex-wrap:wrap; gap:12px;">
          <span>🔍 Duyệt & Xem Trước Câu Hỏi Trong Bộ Đề / Unit (${browsedQuestions.length} câu)</span>
          <select class="form-control-select" style="width:auto; min-width:280px; font-weight:700;" onchange="handleAdminChangeQBankBrowser(this.value)">
            <optgroup label="📝 Xem câu hỏi các Đề Kiểm Tra">
              ${exams
                .map(
                  (ex) =>
                    `<option value="exam|${ex.id}" ${browserSource === `exam|${ex.id}` ? "selected" : ""}>📝 ${ex.title} (${(ex.questions || []).length} câu)</option>`
                )
                .join("")}
            </optgroup>
            <optgroup label="📚 Xem câu hỏi Bài tập 6 Unit">
              ${units
                .map(
                  (u) =>
                    `<option value="unit|${u.id}" ${browserSource === `unit|${u.id}` ? "selected" : ""}>📚 Unit ${u.number}: ${u.title} (${(u.practice || []).length} câu)</option>`
                )
                .join("")}
            </optgroup>
          </select>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(360px, 1fr)); gap:12px; max-height:480px; overflow-y:auto; padding-right:4px;">
          ${browsedQuestions
            .map(
              (q, idx) => `
              <div style="padding:14px 16px; border:1px solid var(--border); border-radius:12px; background:#F8FAFC; font-size:0.86rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                  <span style="font-size:0.75rem; font-weight:800; color:var(--primary); background:#EEF2FF; padding:2px 8px; border-radius:99px;">Câu ${idx + 1}</span>
                  <span style="font-size:0.74rem; color:var(--text-muted);">${q.section || browsedTitle}</span>
                </div>
                <div style="font-weight:700; color:var(--text-main); margin-bottom:8px;">${q.question}</div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:8px;">
                  ${(q.options || [])
                    .map(
                      (opt, oIdx) => `
                      <div style="padding:5px 8px; border-radius:6px; font-size:0.8rem; border:1px solid ${oIdx === q.answer ? "#10B981" : "#E2E8F0"}; background:${oIdx === q.answer ? "#ECFDF5" : "#FFFFFF"}; color:${oIdx === q.answer ? "#065F46" : "#334155"}; font-weight:${oIdx === q.answer ? "800" : "500"};">
                        ${opt} ${oIdx === q.answer ? "✔" : ""}
                      </div>
                    `
                    )
                    .join("")}
                </div>
                ${
                  q.explanation
                    ? `<div style="font-size:0.78rem; color:#475569; background:#FFFFFF; padding:6px 10px; border-radius:6px; border-left:3px solid #10B981;">💡 ${q.explanation}</div>`
                    : ""
                }
              </div>
            `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  window.handleAdminChangeQBankBrowser = function (val) {
    state.adminQBankSource = val;
    renderApp();
  };

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
    showToast("✅ Đã thêm câu hỏi mới vào hệ thống và đồng bộ lên đám mây!", "success");
  };

  window.handleAdminDeleteCustomQuestion = function (qId) {
    showConfirmDialog({
      icon: "🗑️",
      title: "Xóa câu hỏi bổ sung?",
      message: "Câu hỏi này sẽ bị gỡ khỏi ngân hàng câu hỏi của hệ thống.",
      confirmText: "Xóa câu hỏi",
      danger: true,
      onConfirm: async () => {
        state.systemStore.customQuestions = (state.systemStore.customQuestions || []).filter(
          (q) => q.id !== qId
        );
        applyCustomContentToStudyData();
        if (window.EY8_Supabase) {
          await window.EY8_Supabase.saveSystemStore(state.systemStore);
        }
        renderApp();
        showToast("🗑️ Đã xóa câu hỏi bổ sung.", "info");
      }
    });
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
    showToast(`🎉 Đã tạo đề "${title}"! Bạn có thể thêm tiếp câu hỏi ở cột bên trái.`, "success");
  };

  // -------------------------------------------------------------------------
  // ADMIN TAB 4: QUẢN LÝ TÀI KHOẢN & CẤU HÌNH HỆ THỐNG (USERS & CLOUD)
  // -------------------------------------------------------------------------
  function renderAdminUsersView() {
    const cfg = window.EY8_Supabase ? window.EY8_Supabase.getConfig() : {};

    return `
      <div class="section-header">
        <div>
          <h2>👥 Quản Lý Tài Khoản Học Sinh & Hệ Thống Cloud</h2>
          <p style="font-size:0.9rem; color:var(--text-muted);">Quản lý mật khẩu của em, nhảy nhanh sang giám sát từng học sinh, cấp tài khoản mới hoặc kiểm tra kết nối Supabase.</p>
        </div>
      </div>

      <div class="analytics-two-col">
        <!-- Cột 1: Danh sách tài khoản -->
        <div class="analytics-box">
          <div class="analytics-box-title">
            <span>📋 Danh Sách Tài Khoản Trên Hệ Thống (${state.allUsers.length})</span>
            <button class="btn btn-outline btn-sm" onclick="refreshAdminUsersList()">🔄 Làm mới danh sách</button>
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
                      <td><code>@${u.username}</code></td>
                      <td>
                        <span class="user-role-tag ${u.role === "admin" ? "admin" : "student"}">
                          ${u.role === "admin" ? "👑 Admin" : "🎓 Học sinh"}
                        </span>
                      </td>
                      <td><code>${u.pinCode || "****"}</code></td>
                      <td>
                        <div style="display:flex; gap:6px; flex-wrap:wrap;">
                          ${
                            u.role === "student"
                              ? `
                              <button class="btn btn-primary btn-sm" style="padding:3px 9px; font-size:0.75rem;" onclick="handleAdminInspectFromUsersTab('${u.username}')">
                                📊 Giám sát
                              </button>
                            `
                              : ""
                          }
                          <button class="btn btn-outline btn-sm" style="padding:3px 8px; font-size:0.76rem;" onclick="openAdminPasswordModal('${u.id}', '${u.username}', '${u.fullName}')">
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
                ✨ Tạo Tài Khoản Ngay
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
      showToast(`✅ Đã tạo tài khoản "${username}" (${role === "admin" ? "Admin" : "Học sinh"}) thành công!`, "success");
    } else {
      showToast("⚠️ " + (res.message || "Không thể tạo tài khoản!"), "warning");
    }
  };

  window.openAdminPasswordModal = function (userId, username, fullName) {
    const modalRoot = document.getElementById("modal-root");
    if (!modalRoot) return;

    modalRoot.innerHTML = `
      <div class="modal-overlay" onclick="closeModal()">
        <div class="modal-content" style="max-width:440px;" onclick="event.stopPropagation()">
          <button class="modal-close-btn" onclick="closeModal()">✕</button>
          <div style="font-size:2rem; margin-bottom:8px;">🔑</div>
          <h3 style="font-size:1.22rem; font-weight:900; margin-bottom:4px;">Đổi Mật Khẩu Tài Khoản</h3>
          <p style="font-size:0.86rem; color:var(--text-muted); margin-bottom:16px;">
            Tài khoản: <strong>${fullName}</strong> (<code>@${username}</code>)
          </p>
          <form onsubmit="event.preventDefault(); submitAdminPasswordModal('${userId}', '${username}');">
            <div class="form-field">
              <label>Mật khẩu / Mã PIN mới (ít nhất 4 ký tự)</label>
              <input id="admin-modal-newpass" type="text" class="form-control-input" placeholder="Nhập mật khẩu mới..." required minlength="4" autofocus />
            </div>
            <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:18px;">
              <button type="button" class="btn btn-outline" onclick="closeModal()">Hủy</button>
              <button type="submit" class="btn btn-primary">💾 Lưu mật khẩu mới</button>
            </div>
          </form>
        </div>
      </div>
    `;
  };

  window.submitAdminPasswordModal = async function (userId, username) {
    const inputEl = document.getElementById("admin-modal-newpass");
    const newPass = inputEl ? inputEl.value.trim() : "";
    if (newPass.length < 4) {
      showToast("⚠️ Mật khẩu phải có ít nhất 4 ký tự!", "warning");
      return;
    }
    closeModal();
    await window.EY8_Supabase.updateUserPasswordOrInfo(userId, username, {
      pinCode: newPass
    });
    await refreshAdminUsersList();
    showToast(`🔑 Đã cập nhật mật khẩu mới cho "@${username}" thành: ${newPass}`, "success");
  };

  window.handleAdminResetStudentData = function (username, userId) {
    showConfirmDialog({
      icon: "🧹",
      title: `Reset tiến độ của "${username}"?`,
      message: `Bạn có chắc chắn muốn XÓA SẠCH lịch sử điểm và đặt lại toàn bộ tiến độ học của tài khoản "${username}" về 0 không?`,
      confirmText: "Đồng ý Reset",
      danger: true,
      onConfirm: async () => {
        await window.EY8_Supabase.resetStudentProgress(username, userId);
        if (state.adminSelectedStudent === username) {
          await loadAdminInspectedStudent(username);
        }
        showToast(`✅ Đã đặt lại toàn bộ tiến độ học tập của "${username}" về ban đầu.`, "success");
      }
    });
  };

  window.handleAdminDeleteUser = function (username) {
    showConfirmDialog({
      icon: "🗑️",
      title: `Xóa tài khoản "${username}"?`,
      message: `Tài khoản "${username}" sẽ bị xóa khỏi hệ thống.`,
      confirmText: "Xóa tài khoản",
      danger: true,
      onConfirm: async () => {
        const res = await window.EY8_Supabase.deleteUserAccount(username);
        if (!res.success) {
          showToast("⚠️ " + res.message, "warning");
          return;
        }
        await refreshAdminUsersList();
        showToast(`🗑️ Đã xóa tài khoản "${username}".`, "info");
      }
    });
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
      showToast("⚠️ Chỉ tài khoản Quản trị viên (Admin) mới có quyền truy cập cấu hình hệ thống!", "warning");
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

  // Lắng nghe sự kiện bấm nút Go Back / Go Forward trên trình duyệt
  function handleBrowserNavigationChange() {
    const changed = applyRouteFromHash(window.location.hash);
    if (changed) {
      routerState.isRestoringFromUrl = true;
      renderApp();
      routerState.isRestoringFromUrl = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  window.addEventListener("popstate", handleBrowserNavigationChange);
  window.addEventListener("hashchange", handleBrowserNavigationChange);

  // Phím tắt bàn phím cho Flashcard Studio (Space = Lật thẻ, ⬅/➡ = Chuyển từ, S = Nghe đọc, Enter = Thuộc từ)
  window.addEventListener("keydown", (e) => {
    const tag = (e.target && e.target.tagName ? e.target.tagName : "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select" || e.target?.isContentEditable) {
      return;
    }
    const isAdmin = window.EY8_Supabase && window.EY8_Supabase.isAdmin();
    if (isAdmin || state.activeTab !== "units" || state.unitSubTab !== "vocab") {
      return;
    }

    const units = window.STUDY_DATA?.units || [];
    const unit = units.find((u) => u.id === state.selectedUnitId) || units[0];
    if (!unit) return;
    const deck = getFlashcardDeck(unit);
    if (!deck || deck.length === 0) return;

    if (e.code === "Space") {
      e.preventDefault();
      window.flipFlashcard();
    } else if (e.code === "ArrowRight") {
      e.preventDefault();
      window.moveFlashcard(1, deck.length);
    } else if (e.code === "ArrowLeft") {
      e.preventDefault();
      window.moveFlashcard(-1, deck.length);
    } else if (e.code === "KeyS") {
      e.preventDefault();
      const idx = Math.min(Math.max(0, state.flashcardIndex), deck.length - 1);
      const currentVocab = deck[idx];
      if (currentVocab && currentVocab.word) {
        window.speakWord(currentVocab.word);
      }
    } else if (e.code === "Enter") {
      e.preventDefault();
      const idx = Math.min(Math.max(0, state.flashcardIndex), deck.length - 1);
      const currentVocab = deck[idx];
      if (currentVocab && !state.learnedVocab[currentVocab.id]) {
        window.markFlashcardLearned(currentVocab.id);
      }
    }
  });

  // Khởi tạo khi trang tải xong (giữ nguyên trang đang mở khi nhấn F5)
  window.addEventListener("DOMContentLoaded", async () => {
    loadActiveUserLocalProgress();
    if (window.location.hash && window.location.hash !== "#") {
      applyRouteFromHash(window.location.hash);
    }
    renderApp();
    await loadSystemStoreAndApply();
    if (window.EY8_Supabase && window.EY8_Supabase.isLoggedIn()) {
      if (window.EY8_Supabase.isAdmin()) {
        await refreshAdminUsersList();
        await loadAdminInspectedStudent(state.adminSelectedStudent);
      } else {
        await syncCloudData(true);
      }
      if (window.location.hash && window.location.hash !== "#") {
        applyRouteFromHash(window.location.hash);
      }
      renderApp();
    }
  });
})();
