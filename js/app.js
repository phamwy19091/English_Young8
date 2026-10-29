// Logic điều khiển chính cho ứng dụng English Young 8 - Global Success
(function () {
  const STORAGE_KEYS = {
    LEARNED_VOCAB: "ey8_learned_vocab_v1",
    UNIT_SCORES: "ey8_unit_scores_v1",
    EXAM_HISTORY: "ey8_exam_history_v1",
    MISTAKES: "ey8_mistakes_v1"
  };

  const state = {
    currentTab: "dashboard", // dashboard | unit-study | exams | mistakes
    selectedUnitId: "unit-1",
    unitSubTab: "vocab", // vocab | grammar | practice
    fcIndex: 0,
    fcFlipped: false,
    vocabFilter: "",
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

    // Persisted data
    learnedVocab: loadJSON(STORAGE_KEYS.LEARNED_VOCAB, {}),
    unitScores: loadJSON(STORAGE_KEYS.UNIT_SCORES, {}),
    examHistory: loadJSON(STORAGE_KEYS.EXAM_HISTORY, []),
    mistakes: loadJSON(STORAGE_KEYS.MISTAKES, {}) // key: questionId -> question object + wrongChoice + timestamp
  };

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

  // Phát âm tiếng Anh bằng Web Speech API của trình duyệt
  window.speakEnglish = function (text, event) {
    if (event) event.stopPropagation();
    if (!("speechSynthesis" in window)) {
      alert("Trình duyệt của bạn không hỗ trợ đọc phát âm tự động.");
      return;
    }
    window.speechSynthesis.cancel();
    // Làm sạch chuỗi nếu có kí hiệu phiên âm đi kèm (ví dụ "book /bʊk/" -> "book")
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

  // Chuyển tab chính
  window.switchMainTab = function (tabName, unitId) {
    if (state.activeExam && !state.examSubmitted && tabName !== "exams") {
      if (!confirm("Bạn đang làm dở bài thi. Bạn có chắc muốn thoát khỏi phòng thi không?")) {
        return;
      }
      stopExamTimer();
      state.activeExam = null;
    }
    state.currentTab = tabName;
    if (unitId) {
      state.selectedUnitId = unitId;
      state.fcIndex = 0;
      state.fcFlipped = false;
      state.unitQuizAnswers = {};
      state.unitQuizSubmitted = false;
    }
    if (tabName === "analytics") {
      syncCloudData(true);
    }
    renderApp();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.openUnitWithSubTab = function (unitId, subTab) {
    state.currentTab = "unit-study";
    state.selectedUnitId = unitId;
    state.unitSubTab = subTab || "vocab";
    state.fcIndex = 0;
    state.fcFlipped = false;
    state.unitQuizAnswers = {};
    state.unitQuizSubmitted = false;
    renderApp();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.notifyFutureSubject = function (subjectName) {
    alert(
      `Môn "${subjectName} - Lớp 8" đã được thiết kế sẵn khung mở rộng!\n\nHiện tại bạn đang ở chế độ ưu tiên ôn tập Tiếng Anh 8 (Global Success - Học kì 1). Khi nào muốn thêm dữ liệu môn ${subjectName}, bạn chỉ cần bảo trợ lý AI tạo thêm file dữ liệu vào thư mục data/ nhé!`
    );
  };

  // Thống kê tổng quan
  function getSummaryStats() {
    const units = window.STUDY_DATA.units || [];
    let totalVocab = 0;
    let learnedCount = 0;
    units.forEach((u) => {
      u.vocabulary.forEach((v) => {
        totalVocab++;
        if (state.learnedVocab[v.id]) learnedCount++;
      });
    });

    const completedUnits = Object.keys(state.unitScores).length;
    const examCount = state.examHistory.length;
    const avgExamScore =
      examCount > 0
        ? (
            state.examHistory.reduce((acc, item) => acc + item.score10, 0) /
            examCount
          ).toFixed(1)
        : "--";
    const mistakeCount = Object.keys(state.mistakes).length;

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

  // ==========================================
  // RENDER TOÀN TRANG
  // ==========================================
  function renderApp() {
    const stats = getSummaryStats();

    // Cập nhật trạng thái nút nav-tab
    document.querySelectorAll(".nav-tab").forEach((btn) => {
      const t = btn.getAttribute("data-tab");
      btn.classList.toggle("active", t === state.currentTab);
    });

    // Cập nhật badge số câu sai trên thanh menu
    const mistakeBadge = document.getElementById("nav-mistake-badge");
    if (mistakeBadge) {
      mistakeBadge.textContent = stats.mistakeCount;
      mistakeBadge.style.display = stats.mistakeCount > 0 ? "inline-block" : "none";
    }

    // Cập nhật khung tài khoản người dùng trên header (Phân quyền Học sinh vs Admin)
    const userContainer = document.getElementById("header-user-container");
    if (userContainer && window.EY8_Supabase) {
      const user = window.EY8_Supabase.getCurrentUser();
      const isAdmin = window.EY8_Supabase.isAdmin();

      // Đổi tên tab linh hoạt theo vai trò
      const navTabAnalytics = document.getElementById("nav-tab-analytics");
      if (navTabAnalytics) {
        navTabAnalytics.innerHTML = isAdmin ? "👑 Quản Trị & Báo Cáo" : "📈 Tiến Độ Của Em";
      }

      userContainer.innerHTML = `
        <div class="user-menu-pill">
          <div class="user-menu-avatar">${isAdmin ? "👑" : "🎓"}</div>
          <div>
            <div style="font-weight:700; line-height:1.2; font-size:0.86rem;">${user ? user.fullName : "Khách"}</div>
            <span class="user-role-tag ${isAdmin ? "admin" : "student"}">${isAdmin ? "Quản trị viên" : "Học sinh"}</span>
          </div>
          <button class="btn-auth-action" onclick="openAuthModal()" title="Bấm để đăng nhập hoặc đổi tài khoản">
            [Đổi tài khoản]
          </button>
        </div>
      `;
    }

    const root = document.getElementById("app-root");
    if (!root) return;

    if (state.currentTab === "dashboard") {
      root.innerHTML = renderDashboard(stats);
    } else if (state.currentTab === "unit-study") {
      root.innerHTML = renderUnitStudy();
    } else if (state.currentTab === "exams") {
      root.innerHTML = renderExamsView();
    } else if (state.currentTab === "mistakes") {
      root.innerHTML = renderMistakesView();
    } else if (state.currentTab === "analytics") {
      root.innerHTML = renderAnalyticsView(stats);
    }
  }

  // ==========================================
  // 1. GIAO DIỆN TỔNG QUAN (DASHBOARD)
  // ==========================================
  function renderDashboard(stats) {
    const units = window.STUDY_DATA.units || [];
    const unitCardsHtml = units
      .map((u) => {
        const totalV = u.vocabulary.length;
        const learnedV = u.vocabulary.filter((v) => state.learnedVocab[v.id]).length;
        const pct = Math.round((learnedV / totalV) * 100);
        const bestQuiz = state.unitScores[u.id];

        return `
          <div class="unit-card" onclick="openUnitWithSubTab('${u.id}', 'vocab')">
            <div>
              <div class="unit-card-top">
                <div class="unit-icon" style="background: ${u.color}">${u.icon}</div>
                <div>
                  <div class="unit-badge" style="color: ${u.color}">UNIT ${u.number} • HỌC KÌ 1</div>
                  <div class="unit-title">${u.title}</div>
                  <div class="unit-vi-title">${u.viTitle}</div>
                </div>
              </div>
              <p class="unit-summary">${u.summary}</p>
            </div>
            <div>
              <div class="unit-progress-bar">
                <div class="unit-progress-fill" style="width: ${pct}%; background: ${u.color}"></div>
              </div>
              <div class="unit-meta">
                <span>📚 Đã thuộc: <strong>${learnedV}/${totalV} từ</strong> (${pct}%)</span>
                <span>🎯 Bài tập: <strong>${bestQuiz !== undefined ? bestQuiz + "/" + u.practice.length : "Chưa làm"}</strong></span>
              </div>
              <div class="unit-actions" onclick="event.stopPropagation()">
                <button class="btn btn-outline btn-sm" style="flex:1" onclick="openUnitWithSubTab('${u.id}', 'vocab')">Từ vựng</button>
                <button class="btn btn-outline btn-sm" style="flex:1" onclick="openUnitWithSubTab('${u.id}', 'grammar')">Ngữ pháp</button>
                <button class="btn btn-primary btn-sm" style="flex:1; background:${u.color}" onclick="openUnitWithSubTab('${u.id}', 'practice')">Luyện tập</button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    return `
      <div class="hero-banner">
        <div class="hero-content">
          <span class="hero-tag">✨ Chương trình GDPT Mới • Tiếng Anh 8 Global Success</span>
          <h2>Chinh phục Kì thi Học kì 1 Lớp 8 thật dễ dàng!</h2>
          <p>Hệ thống ôn tập trọn bộ <strong>Unit 1 đến Unit 6</strong> gồm Flashcard phát âm chuẩn, tóm tắt ngữ pháp + mẹo tránh bẫy đề thi, cùng bộ đề kiểm tra 15 phút, Giữa kì 1 và Cuối kì 1 chấm điểm tự động.</p>
          <div class="hero-actions">
            <button class="btn btn-white" onclick="switchMainTab('unit-study', 'unit-1')">🚀 Bắt đầu ôn từng Unit</button>
            <button class="btn btn-outline-white" onclick="startExamById('exam-final-1')">📝 Thi thử Đề Cuối Kì 1 ngay</button>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.14); padding: 18px 22px; border-radius: 16px; min-width: 240px; backdrop-filter: blur(6px);">
          <div style="font-size:0.82rem; color:#E0E7FF; margin-bottom:6px;">🎯 Mục tiêu Học kì 1</div>
          <div style="font-size:1.15rem; font-weight:800; margin-bottom:8px;">6 Units • 86 Từ trọng tâm</div>
          <div style="font-size:0.85rem; color:#E0E7FF;">• 72 câu bài tập theo từng Unit<br>• 6 Đề thi (15p, Giữa kì, Cuối kì)<br>• Tự động lưu lại câu làm sai</div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #EEF2FF; color: #4F46E5;">📖</div>
          <div class="stat-info">
            <h3>${stats.learnedCount} / ${stats.totalVocab}</h3>
            <p>Từ vựng HK1 đã thuộc</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #D1FAE5; color: #059669;">✅</div>
          <div class="stat-info">
            <h3>${stats.completedUnits} / ${stats.totalUnits} Unit</h3>
            <p>Đã hoàn thành bài tập</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #FEF3C7; color: #D97706;">🏆</div>
          <div class="stat-info">
            <h3>${stats.avgExamScore} điểm</h3>
            <p>Điểm TB (${stats.examCount} lượt thi)</p>
          </div>
        </div>
        <div class="stat-card" style="cursor:pointer" onclick="switchMainTab('mistakes')">
          <div class="stat-icon" style="background: #FEE2E2; color: #DC2626;">📓</div>
          <div class="stat-info">
            <h3>${stats.mistakeCount} câu</h3>
            <p>Cần ôn lại trong Sổ tay</p>
          </div>
        </div>
      </div>

      <div class="section-header">
        <h2>📚 Lộ trình 6 Unit Học kì 1 (Global Success 8)</h2>
        <span style="font-size: 0.86rem; color: var(--text-muted);">Bấm vào từng Unit để học Flashcard, Ngữ pháp & làm bài tập</span>
      </div>
      <div class="units-grid">
        ${unitCardsHtml}
      </div>

      <div class="section-header">
        <h2>🔥 Đề thi trọng tâm chuẩn bị cho Kì thi Cuối kì 1</h2>
        <button class="btn btn-outline btn-sm" onclick="switchMainTab('exams')">Xem tất cả 6 đề thi →</button>
      </div>
      <div class="units-grid">
        ${(window.STUDY_DATA.exams || [])
          .slice(3, 6)
          .map(
            (ex) => `
          <div class="unit-card" onclick="startExamById('${ex.id}')">
            <div>
              <span class="fc-type" style="background:#FEE2E2; color:#DC2626;">⏱ ${ex.durationMinutes} Phút • ${ex.questions.length} Câu</span>
              <h3 class="unit-title" style="margin-bottom:6px;">${ex.title}</h3>
              <p class="unit-summary">${ex.description}</p>
            </div>
            <button class="btn btn-primary" style="width:100%">✍️ Bắt đầu làm đề</button>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  // ==========================================
  // 2. GIAO DIỆN HỌC THEO UNIT (TỪ VỰNG, NGỮ PHÁP, BÀI TẬP)
  // ==========================================
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
    } else {
      subContentHtml = renderUnitPracticeSubTab(unit);
    }

    return `
      <div class="unit-selector-bar">
        ${unitSelectorHtml}
      </div>

      <div style="background:white; border:1px solid var(--border); border-radius:var(--radius-lg); padding:20px 24px; margin-bottom:20px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div class="unit-icon" style="background:${unit.color}; width:54px; height:54px; font-size:1.7rem;">${unit.icon}</div>
          <div>
            <div class="unit-badge" style="color:${unit.color}">UNIT ${unit.number} • TIẾNG ANH 8 GLOBAL SUCCESS</div>
            <h2 style="font-size:1.4rem; font-weight:800;">${unit.title} — ${unit.viTitle}</h2>
            <p style="font-size:0.88rem; color:var(--text-muted);">${unit.summary}</p>
          </div>
        </div>
      </div>

      <div class="sub-tabs">
        <button class="sub-tab ${state.unitSubTab === "vocab" ? "active" : ""}" onclick="switchUnitSubTab('vocab')">
          📇 1. Flashcard & Từ vựng (${unit.vocabulary.length} từ)
        </button>
        <button class="sub-tab ${state.unitSubTab === "grammar" ? "active" : ""}" onclick="switchUnitSubTab('grammar')">
          📐 2. Ngữ âm & Ngữ pháp trọng tâm
        </button>
        <button class="sub-tab ${state.unitSubTab === "practice" ? "active" : ""}" onclick="switchUnitSubTab('practice')">
          ✍️ 3. Bài tập thực hành Unit (${unit.practice.length} câu)
        </button>
      </div>

      ${subContentHtml}
    `;
  }

  window.selectUnit = function (unitId) {
    state.selectedUnitId = unitId;
    state.fcIndex = 0;
    state.fcFlipped = false;
    state.unitQuizAnswers = {};
    state.unitQuizSubmitted = false;
    renderApp();
  };

  window.switchUnitSubTab = function (subTab) {
    state.unitSubTab = subTab;
    renderApp();
  };

  // --- Sub-tab 2.1: Flashcard & Từ vựng ---
  function renderUnitVocabSubTab(unit) {
    const vocabList = unit.vocabulary;
    const currentCard = vocabList[state.fcIndex] || vocabList[0];
    const isLearned = !!state.learnedVocab[currentCard.id];
    const learnedInUnit = vocabList.filter((v) => state.learnedVocab[v.id]).length;

    const filteredVocab = vocabList.filter(
      (v) =>
        v.word.toLowerCase().includes(state.vocabFilter.toLowerCase()) ||
        v.meaning.toLowerCase().includes(state.vocabFilter.toLowerCase())
    );

    return `
      <div class="flashcard-wrapper">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; font-size:0.9rem;">
          <span>Thẻ từ vựng: <strong>${state.fcIndex + 1} / ${vocabList.length}</strong></span>
          <span style="color:var(--success); font-weight:700;">✅ Đã thuộc: ${learnedInUnit}/${vocabList.length} từ</span>
        </div>

        <div class="flashcard-box" onclick="flipFlashcard()">
          <div style="width:100%; display:flex; justify-content:space-between; align-items:center;">
            <span class="fc-type">${currentCard.type}</span>
            <button class="speaker-btn" title="Nghe phát âm" onclick="speakEnglish('${currentCard.word.replace(/'/g, "\\'")}', event)">🔊</button>
          </div>

          <div style="my:auto; padding: 10px 0;">
            <div class="fc-word">${currentCard.word}</div>
            <div class="fc-ipa">${currentCard.ipa}</div>
            ${
              state.fcFlipped
                ? `
                  <div class="fc-meaning">${currentCard.meaning}</div>
                  <div class="fc-example">"${currentCard.example}"</div>
                  <div class="fc-example-vi">→ ${currentCard.exampleVi}</div>
                `
                : `<div style="color:var(--primary); font-weight:600; margin-top:16px; background:var(--primary-light); padding:8px 16px; border-radius:99px; display:inline-block;">👆 Bấm vào thẻ để lật xem nghĩa & ví dụ</div>`
            }
          </div>

          <div class="fc-tip">💡 Mẹo nhớ / Lưu ý thi: ${currentCard.tip}</div>
        </div>

        <div class="fc-controls">
          <button class="btn btn-outline" onclick="prevFlashcard()">⬅ Từ trước</button>
          <button class="btn ${isLearned ? "btn-success" : "btn-outline"}" onclick="toggleLearnedVocab('${currentCard.id}')">
            ${isLearned ? "✅ Đã thuộc từ này (Bấm để bỏ)" : "☑️ Đánh dấu Đã thuộc"}
          </button>
          <button class="btn btn-primary" onclick="nextFlashcard()">Từ tiếp theo ➡</button>
        </div>
      </div>

      <div class="section-header" style="margin-top:36px;">
        <h2>📋 Bảng tổng hợp từ vựng Unit ${unit.number}</h2>
        <input
          type="text"
          placeholder="🔍 Tìm nhanh từ vựng hoặc nghĩa..."
          value="${state.vocabFilter}"
          oninput="filterVocabList(this.value)"
          style="padding:8px 14px; border:1px solid var(--border); border-radius:var(--radius-sm); width:260px; font-size:0.9rem;"
        />
      </div>

      <div class="vocab-grid">
        ${filteredVocab
          .map((v) => {
            const learned = !!state.learnedVocab[v.id];
            return `
              <div class="vocab-item ${learned ? "learned" : ""}">
                <div>
                  <div class="vocab-item-header">
                    <div>
                      <span class="vocab-word-title">${v.word}</span>
                      <span style="font-size:0.85rem; color:var(--text-muted); margin-left:6px;">${v.ipa}</span>
                      <span class="fc-type" style="margin-left:6px; margin-bottom:0;">${v.type}</span>
                    </div>
                    <button class="speaker-btn" onclick="speakEnglish('${v.word.replace(/'/g, "\\'")}', event)" title="Nghe phát âm">🔊</button>
                  </div>
                  <div style="font-weight:700; font-size:1rem; margin:6px 0; color:#0F172A;">${v.meaning}</div>
                  <div style="font-size:0.86rem; color:#334155; font-style:italic;">• ${v.example}</div>
                  <div style="font-size:0.82rem; color:var(--text-muted); margin-bottom:8px;">(${v.exampleVi})</div>
                </div>
                <div>
                  <div style="font-size:0.8rem; background:#FEF3C7; color:#92400E; padding:6px 10px; border-radius:6px; margin-bottom:8px;">
                    💡 ${v.tip}
                  </div>
                  <button class="btn btn-sm ${learned ? "btn-success" : "btn-outline"}" style="width:100%" onclick="toggleLearnedVocab('${v.id}')">
                    ${learned ? "✅ Đã thuộc" : "Đánh dấu Đã thuộc"}
                  </button>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  }

  window.flipFlashcard = function () {
    state.fcFlipped = !state.fcFlipped;
    renderApp();
  };

  window.prevFlashcard = function () {
    const unit = (window.STUDY_DATA.units || []).find((u) => u.id === state.selectedUnitId);
    if (!unit) return;
    state.fcIndex = (state.fcIndex - 1 + unit.vocabulary.length) % unit.vocabulary.length;
    state.fcFlipped = false;
    renderApp();
  };

  window.nextFlashcard = function () {
    const unit = (window.STUDY_DATA.units || []).find((u) => u.id === state.selectedUnitId);
    if (!unit) return;
    state.fcIndex = (state.fcIndex + 1) % unit.vocabulary.length;
    state.fcFlipped = false;
    renderApp();
  };

  window.toggleLearnedVocab = function (vocabId) {
    let isNowLearned = false;
    if (state.learnedVocab[vocabId]) {
      delete state.learnedVocab[vocabId];
      isNowLearned = false;
    } else {
      state.learnedVocab[vocabId] = true;
      isNowLearned = true;
    }
    saveJSON(STORAGE_KEYS.LEARNED_VOCAB, state.learnedVocab);

    // Đồng bộ lên Supabase nếu có kết nối
    if (window.EY8_Supabase && window.EY8_Supabase.syncVocabProgress) {
      window.EY8_Supabase.syncVocabProgress(
        vocabId,
        state.selectedUnitId,
        isNowLearned ? "mastered" : "learning"
      );
    }

    renderApp();
  };

  window.filterVocabList = function (val) {
    state.vocabFilter = val;
    renderApp();
    const input = document.querySelector('input[placeholder*="Tìm nhanh"]');
    if (input) {
      input.focus();
      input.setSelectionRange(val.length, val.length);
    }
  };

  // --- Sub-tab 2.2: Ngữ âm & Ngữ pháp ---
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
          ✍️ Áp dụng làm ngay 12 câu bài tập Unit ${unit.number} →
        </button>
      </div>
    `;
  }

  // --- Sub-tab 2.3: Bài tập thực hành Unit ---
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
        // Lưu vào sổ tay câu sai
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
    // Lưu vào lịch sử chung để hiển thị bảng báo cáo
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

    saveJSON(STORAGE_KEYS.UNIT_SCORES, state.unitScores);
    saveJSON(STORAGE_KEYS.EXAM_HISTORY, state.examHistory);
    saveJSON(STORAGE_KEYS.MISTAKES, state.mistakes);

    // Đồng bộ lên Supabase nếu có kết nối
    if (window.EY8_Supabase && window.EY8_Supabase.recordQuizAttempt) {
      window.EY8_Supabase.recordQuizAttempt({
        exerciseId: `quiz-${unit.id}`,
        score: score10,
        rawScore: correct,
        totalQuestions: unit.practice.length,
        timeSpentSeconds: 300,
        answers: answersList
      });
    }

    saveJSON(STORAGE_KEYS.UNIT_SCORES, state.unitScores);
    saveJSON(STORAGE_KEYS.MISTAKES, state.mistakes);
    state.unitQuizSubmitted = true;
    renderApp();
    window.scrollTo({ top: 180, behavior: "smooth" });
  };

  window.resetUnitQuiz = function () {
    state.unitQuizAnswers = {};
    state.unitQuizSubmitted = false;
    renderApp();
  };

  // Hàm dùng chung để vẽ 1 thẻ câu hỏi trắc nghiệm
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

  // ==========================================
  // 3. GIAO DIỆN PHÒNG LUYỆN ĐỀ THI (EXAMS)
  // ==========================================
  function renderExamsView() {
    if (state.activeExam) {
      return renderActiveExamRoom();
    }

    const exams = window.STUDY_DATA.exams || [];
    const filtered =
      state.examFilter === "all"
        ? exams
        : exams.filter((e) => e.category === state.examFilter);

    return `
      <div class="section-header">
        <div>
          <h2>📝 Phòng Luyện Đề Kiểm Tra & Thi Học Kì 1</h2>
          <p style="font-size:0.9rem; color:var(--text-muted);">Đề thi thiết kế bám sát ma trận đề kiểm tra Tiếng Anh 8 Global Success của Bộ GD&ĐT</p>
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
              attempts.length > 0
                ? Math.max(...attempts.map((a) => a.score10)).toFixed(1)
                : null;

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

    saveJSON(STORAGE_KEYS.EXAM_HISTORY, state.examHistory);
    saveJSON(STORAGE_KEYS.MISTAKES, state.mistakes);

    // Đồng bộ lên Supabase nếu có kết nối
    if (window.EY8_Supabase && window.EY8_Supabase.recordQuizAttempt) {
      window.EY8_Supabase.recordQuizAttempt({
        exerciseId: ex.id,
        score: score10,
        rawScore: correct,
        totalQuestions: ex.questions.length,
        timeSpentSeconds,
        answers: answersList
      });
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

  // ==========================================
  // 4. GIAO DIỆN SỔ TAY CÂU SAI & LỊCH SỬ ĐIỂM
  // ==========================================
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

    const historyHtml =
      state.examHistory.length === 0
        ? `<p style="color:var(--text-muted);">Chưa có lịch sử làm đề thi nào.</p>`
        : `
          <div style="background:white; border:1px solid var(--border); border-radius:var(--radius-lg); overflow:hidden;">
            <table style="width:100%; border-collapse:collapse; text-align:left; font-size:0.92rem;">
              <thead>
                <tr style="background:#F8FAFC; border-bottom:1px solid var(--border);">
                  <th style="padding:12px 16px;">Tên đề thi</th>
                  <th style="padding:12px 16px;">Điểm (Thang 10)</th>
                  <th style="padding:12px 16px;">Số câu đúng</th>
                  <th style="padding:12px 16px;">Thời gian làm</th>
                  <th style="padding:12px 16px;">Ngày giờ</th>
                </tr>
              </thead>
              <tbody>
                ${state.examHistory
                  .map(
                    (h) => `
                    <tr style="border-bottom:1px solid var(--border);">
                      <td style="padding:12px 16px; font-weight:600;">${h.examTitle}</td>
                      <td style="padding:12px 16px;"><span style="background:#D1FAE5; color:#065F46; font-weight:800; padding:3px 10px; border-radius:99px;">${h.score10} đ</span></td>
                      <td style="padding:12px 16px;">${h.correct}/${h.total} câu</td>
                      <td style="padding:12px 16px;">${h.timeSpent}</td>
                      <td style="padding:12px 16px; color:var(--text-muted);">${h.date}</td>
                    </tr>
                  `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `;

    return `
      <div class="section-header">
        <h2>📓 Sổ Tay Câu Hay Sai (Mistake Notebook)</h2>
      </div>
      ${mistakeSectionHtml}

      <div class="section-header" style="margin-top:36px;">
        <h2>📊 Lịch Sử Làm Đề Kiểm Tra</h2>
      </div>
      ${historyHtml}
    `;
  }

  function renderMistakePracticeMode(mistakeList) {
    return `
      <div style="margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
        <button class="btn btn-outline btn-sm" onclick="exitMistakePractice()">⬅ Quay lại xem Sổ tay</button>
        <span style="font-weight:700; color:var(--danger);">Chế độ: Làm lại ${mistakeList.length} câu từng sai (Câu nào làm đúng sẽ được gợi ý xóa khỏi Sổ tay!)</span>
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
    saveJSON(STORAGE_KEYS.MISTAKES, state.mistakes);
    state.mistakePracticeActive = false;
    renderApp();
  };

  window.removeMistakeItem = function (qId) {
    delete state.mistakes[qId];
    saveJSON(STORAGE_KEYS.MISTAKES, state.mistakes);
    renderApp();
  };

  // ==========================================
  // 5. GIAO DIỆN BÁO CÁO HỌC TẬP & PHÂN TÍCH NĂNG LỰC (ANALYTICS)
  // ==========================================
  function calculateSkillStats() {
    const skills = {
      pronunciation: { name: "Ngữ âm (Pronunciation & Stress)", correct: 0, total: 0, icon: "🗣️" },
      vocabulary: { name: "Từ vựng (Vocabulary & Collocations)", correct: 0, total: 0, icon: "📖" },
      grammar: { name: "Ngữ pháp (Grammar Structures)", correct: 0, total: 0, icon: "✍️" },
      reading: { name: "Kỹ năng Đọc hiểu (Reading)", correct: 0, total: 0, icon: "📑" },
      writing: { name: "Viết lại câu & Giao tiếp (Writing)", correct: 0, total: 0, icon: "✏️" }
    };

    state.examHistory.forEach((h) => {
      if (!h.questions || !h.answers) return;
      h.questions.forEach((q) => {
        const sec = (q.section || "").toLowerCase();
        let targetKey = "grammar"; // Mặc định
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

  function renderAnalyticsView(stats) {
    const currentUser = window.EY8_Supabase ? window.EY8_Supabase.getCurrentUser() : { fullName: "Em Lớp 8", role: "student" };
    const isAdmin = window.EY8_Supabase ? window.EY8_Supabase.isAdmin() : false;
    const skills = calculateSkillStats();
    const units = window.STUDY_DATA.units || [];

    // Tính chuỗi ngày học từ examHistory
    const distinctDates = new Set(state.examHistory.map((h) => (h.date ? h.date.split(" ")[1] : "")));
    const streakDays = Math.max(1, distinctDates.size);

    const bannerHtml = isAdmin
      ? `
        <!-- Hero Banner Dành Cho Quản Trị Viên (Admin) -->
        <div class="analytics-hero" style="background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);">
          <div class="analytics-student-info">
            <div class="student-avatar" style="background:#4338CA; border-color:#818CF8;">👑</div>
            <div>
              <div style="font-size:0.85rem; color:#C7D2FE; text-transform:uppercase; letter-spacing:0.5px;">Bảng Điều Khiển Quản Trị & Báo Cáo Phụ Huynh</div>
              <h2 style="font-size:1.6rem; font-weight:800; margin:2px 0;">Xin chào, ${currentUser.fullName}</h2>
              <div style="font-size:0.85rem; color:#E0E7FF; margin-top:4px;">Theo dõi tiến độ, phân tích năng lực và xem chi tiết bài làm của học sinh</div>
            </div>
          </div>

          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <button class="btn btn-outline-white btn-sm" onclick="openSupabaseSettingsModal()">
              ⚙️ Cài đặt Supabase Cloud
            </button>
            <button class="btn btn-white btn-sm" onclick="syncCloudNow()">
              🔄 Tải dữ liệu mới nhất
            </button>
          </div>
        </div>
      `
      : `
        <!-- Hero Banner Dành Cho Học Sinh (Tuyệt đối không có nút kỹ thuật phức tạp) -->
        <div class="analytics-hero" style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);">
          <div class="analytics-student-info">
            <div class="student-avatar" style="background:#4F46E5; border-color:#818CF8;">🎓</div>
            <div>
              <div style="font-size:0.85rem; color:#94A3B8; text-transform:uppercase; letter-spacing:0.5px;">Góc Học Tập Cá Nhân • Lớp 8</div>
              <h2 style="font-size:1.6rem; font-weight:800; margin:2px 0;">Chào mừng em, ${currentUser.fullName}!</h2>
              <div class="streak-pill">🔥 Chuỗi ngày học liên tục: <strong>${streakDays} ngày</strong></div>
            </div>
          </div>

          <div style="background: rgba(255,255,255,0.08); padding: 12px 18px; border-radius: var(--radius-md); font-size:0.88rem; max-width: 320px; border: 1px solid rgba(255,255,255,0.15);">
            🌟 <em>Mỗi ngày luyện 1 bài tập và thuộc 5 từ mới để đạt điểm 10 kì thi Học kì 1 nhé!</em>
          </div>
        </div>
      `;

    return `
      ${bannerHtml}

      <!-- 4 Thẻ KPI Chỉ số tổng quan -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon" style="background:#EEF2FF; color:#4F46E5;">🎯</div>
          <div>
            <div class="kpi-val">${stats.avgExamScore} <span style="font-size:0.9rem; font-weight:600; color:var(--text-muted);">/10</span></div>
            <div class="kpi-label">Điểm thi trung bình</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon" style="background:#ECFDF5; color:#10B981;">📝</div>
          <div>
            <div class="kpi-val">${state.examHistory.length}</div>
            <div class="kpi-label">Lượt làm đề & bài tập</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon" style="background:#FEF3C7; color:#D97706;">📖</div>
          <div>
            <div class="kpi-val">${stats.learnedCount} <span style="font-size:0.9rem; font-weight:600; color:var(--text-muted);">/ ${stats.totalVocab} từ</span></div>
            <div class="kpi-label">Từ vựng đã thuộc (${Math.round((stats.learnedCount / (stats.totalVocab || 1)) * 100)}%)</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon" style="background:#FEE2E2; color:#EF4444;">⚠️</div>
          <div>
            <div class="kpi-val">${stats.mistakeCount}</div>
            <div class="kpi-label">Câu sai đang trong Sổ tay</div>
          </div>
        </div>
      </div>

      <!-- 2 Cột: Phân tích Năng lực & Tiến độ theo từng Unit -->
      <div class="analytics-two-col">
        <!-- Cột 1: Phân tích kỹ năng dạng bài -->
        <div class="analytics-box">
          <div class="analytics-box-title">
            <span>📊 Đánh Giá Năng Lực Theo Dạng Bài</span>
            <span style="font-size:0.8rem; font-weight:500; color:var(--text-muted);">(Dựa trên các bài đã nộp)</span>
          </div>

          ${
            state.examHistory.length === 0
              ? `
                <div style="text-align:center; padding:30px 10px; color:var(--text-muted);">
                  <div style="font-size:2rem; margin-bottom:8px;">⏳</div>
                  <p>Em chưa nộp bài kiểm tra nào.<br>Hãy làm ít nhất 1 bài để hệ thống phân tích điểm mạnh & điểm yếu nhé!</p>
                  <button class="btn btn-primary btn-sm" style="margin-top:12px;" onclick="switchMainTab('exams')">🚀 Làm đề kiểm tra ngay</button>
                </div>
              `
              : Object.keys(skills)
                  .map((k) => {
                    const sk = skills[k];
                    const pct = sk.total > 0 ? Math.round((sk.correct / sk.total) * 100) : 0;
                    let color = "#10B981"; // Xanh lá
                    let statusLabel = "🟢 Vững vàng";
                    if (pct < 60) {
                      color = "#EF4444"; // Đỏ
                      statusLabel = "🔴 Cần ôn lại ngay";
                    } else if (pct < 80) {
                      color = "#F59E0B"; // Vàng
                      statusLabel = "🟡 Tạm ổn (Cần luyện thêm)";
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

          <div style="margin-top:18px; padding:12px 16px; background:#F8FAFC; border-radius:var(--radius-sm); border:1px solid var(--border); font-size:0.84rem; color:var(--text-muted);">
            💡 <strong>Lời khuyên dành cho phụ huynh / người hướng dẫn:</strong> Kỹ năng nào dưới <strong>70%</strong>, bạn hãy nhắc em mở tab <em>"Học theo Unit"</em> để đọc lại phần đóng khung <em>"Bẫy đề thi hay gặp"</em> tương ứng.
          </div>
        </div>

        <!-- Cột 2: Tiến độ 6 Unit Học kì 1 -->
        <div class="analytics-box">
          <div class="analytics-box-title">
            <span>📚 Tiến Độ 6 Unit Học Kì 1</span>
            <button class="btn btn-outline btn-sm" onclick="switchMainTab('unit-study')">Chi tiết Unit ➔</button>
          </div>

          <div style="display:flex; flex-direction:column; gap:12px;">
            ${units
              .map((u) => {
                const totalV = u.vocabulary.length;
                const learnedV = u.vocabulary.filter((v) => state.learnedVocab[v.id]).length;
                const pct = Math.round((learnedV / totalV) * 100);
                const bestScore = state.unitScores[u.id];

                return `
                  <div style="padding:12px 14px; border:1px solid var(--border); border-radius:var(--radius-sm); display:flex; align-items:center; justify-content:space-between; gap:12px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                      <span style="font-size:1.4rem;">${u.icon}</span>
                      <div>
                        <div style="font-weight:700; font-size:0.9rem;">Unit ${u.number}: ${u.title}</div>
                        <div style="font-size:0.78rem; color:var(--text-muted);">Từ vựng: ${learnedV}/${totalV} (${pct}%) • Điểm bài tập: ${bestScore !== undefined ? bestScore + "/" + u.practice.length : "Chưa làm"}</div>
                      </div>
                    </div>
                    <button class="btn btn-outline btn-sm" onclick="openUnitWithSubTab('${u.id}', 'vocab')">Ôn tập</button>
                  </div>
                `;
              })
              .join("")}
          </div>
        </div>
      </div>

      <!-- Bảng Nhật ký Làm bài Chi tiết (Có nút xem lại chi tiết bài làm) -->
      <div class="analytics-box">
        <div class="analytics-box-title">
          <span>📋 Nhật Ký Làm Bài Thi & Kiểm Tra Chi Tiết</span>
          <span style="font-size:0.85rem; color:var(--text-muted); font-weight:500;">(Bấm "Xem chi tiết" để xem lại bài làm của em)</span>
        </div>

        ${
          state.examHistory.length === 0
            ? `<p style="color:var(--text-muted); text-align:center; padding:24px 0;">Chưa có dữ liệu bài làm nào được ghi nhận.</p>`
            : `
              <div style="overflow-x:auto;">
                <table class="custom-table">
                  <thead>
                    <tr>
                      <th>Thời gian nộp</th>
                      <th>Tên đề kiểm tra / bài tập</th>
                      <th>Điểm số</th>
                      <th>Số câu đúng</th>
                      <th>Thời gian làm</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${state.examHistory
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
                            <td>
                              <span style="font-weight:700; color:var(--text-main);">${h.examTitle}</span>
                            </td>
                            <td>
                              <span style="background:${scoreBg}; color:${scoreColor}; font-weight:800; padding:4px 10px; border-radius:99px;">
                                ${h.score10} đ
                              </span>
                            </td>
                            <td><strong>${h.correct} / ${h.total}</strong> câu</td>
                            <td>${h.timeSpent}</td>
                            <td>
                              <button class="btn btn-outline btn-sm" onclick="openAttemptDetailModal(${idx})">
                                👁️ Xem chi tiết
                              </button>
                            </td>
                          </tr>
                        `;
                      })
                      .join("")}
                  </tbody>
                </table>
              </div>
            `
        }
      </div>
    `;
  }

  // ==========================================
  // CÁC CỬA SỔ MODAL POPUP
  // ==========================================

  window.closeModal = function () {
    const modalRoot = document.getElementById("modal-root");
    if (modalRoot) modalRoot.innerHTML = "";
  };

  // 1. Modal xem lại chi tiết bài làm
  window.openAttemptDetailModal = function (historyIndex) {
    const item = state.examHistory[historyIndex];
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
            <div style="font-size:0.82rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Chi tiết bài làm ngày ${item.date}</div>
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
                                  badge = " (Đáp án đúng)";
                                } else if (userChoice === oIdx && !isCorrect) {
                                  optBg = "#FEE2E2";
                                  optBorder = "#EF4444";
                                  optColor = "#991B1B";
                                  badge = " (Em đã chọn)";
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

  // ==========================================
  // MODAL ĐĂNG NHẬP / ĐĂNG KÝ (PHÂN QUYỀN HỌC SINH & ADMIN)
  // ==========================================
  window.openAuthModal = function (defaultTab = "login") {
    const modalRoot = document.getElementById("modal-root");
    if (!modalRoot) return;

    const currentUser = window.EY8_Supabase ? window.EY8_Supabase.getCurrentUser() : null;

    modalRoot.innerHTML = `
      <div class="modal-overlay" onclick="closeModal()">
        <div class="modal-content" style="max-width: 480px;" onclick="event.stopPropagation()">
          <button class="modal-close-btn" onclick="closeModal()">✕</button>

          <div class="auth-tabs">
            <button id="auth-tab-btn-login" class="auth-tab-btn ${defaultTab === "login" ? "active" : ""}" onclick="switchAuthTab('login')">
              🔑 Đăng Nhập
            </button>
            <button id="auth-tab-btn-register" class="auth-tab-btn ${defaultTab === "register" ? "active" : ""}" onclick="switchAuthTab('register')">
              ✨ Đăng Ký Tài Khoản
            </button>
          </div>

          <!-- Tab Đăng Nhập -->
          <div id="auth-pane-login" style="display: ${defaultTab === "login" ? "block" : "none"};">
            <div style="display:flex; flex-direction:column; gap:14px;">
              <div>
                <label style="font-size:0.85rem; font-weight:700; display:block; margin-bottom:4px;">Tên đăng nhập (Username)</label>
                <input id="login-username" type="text" style="width:100%; padding:10px 12px; border:1px solid var(--border); border-radius:var(--radius-sm); font-size:0.9rem;" placeholder="Nhập tên đăng nhập..." />
              </div>

              <div>
                <label style="font-size:0.85rem; font-weight:700; display:block; margin-bottom:4px;">Mật khẩu / Mã PIN</label>
                <input id="login-password" type="password" style="width:100%; padding:10px 12px; border:1px solid var(--border); border-radius:var(--radius-sm); font-size:0.9rem;" placeholder="Nhập mật khẩu..." />
              </div>

              <div id="login-error-msg" style="display:none; padding:10px 12px; border-radius:var(--radius-sm); background:#FEF2F2; color:#991B1B; font-size:0.85rem;"></div>

              <button class="btn btn-primary" style="width:100%; padding:12px; font-size:0.95rem; font-weight:700;" onclick="handleLoginSubmit()">
                Đăng Nhập Ngay
              </button>
            </div>

            <!-- Nút đăng nhập nhanh tiện lợi -->
            <div class="quick-login-box">
              <div class="quick-login-title">⚡ Chọn nhanh tài khoản mẫu:</div>
              <div class="quick-login-btns">
                <button class="btn btn-outline btn-sm" onclick="quickFillLogin('em_lop8', '1234')">
                  🎓 Em Lớp 8
                </button>
                <button class="btn btn-outline btn-sm" onclick="quickFillLogin('admin', 'admin123')">
                  👑 Quản Trị Viên (Admin)
                </button>
              </div>
            </div>
          </div>

          <!-- Tab Đăng Ký -->
          <div id="auth-pane-register" style="display: ${defaultTab === "register" ? "block" : "none"};">
            <div style="display:flex; flex-direction:column; gap:14px;">
              <div>
                <label style="font-size:0.85rem; font-weight:700; display:block; margin-bottom:4px;">Họ và Tên</label>
                <input id="reg-fullname" type="text" style="width:100%; padding:10px 12px; border:1px solid var(--border); border-radius:var(--radius-sm); font-size:0.9rem;" placeholder="Ví dụ: Minh Trang" />
              </div>

              <div>
                <label style="font-size:0.85rem; font-weight:700; display:block; margin-bottom:4px;">Tên đăng nhập (viết liền không dấu)</label>
                <input id="reg-username" type="text" style="width:100%; padding:10px 12px; border:1px solid var(--border); border-radius:var(--radius-sm); font-size:0.9rem;" placeholder="Ví dụ: minhtrang" />
              </div>

              <div>
                <label style="font-size:0.85rem; font-weight:700; display:block; margin-bottom:4px;">Mật khẩu</label>
                <input id="reg-password" type="password" style="width:100%; padding:10px 12px; border:1px solid var(--border); border-radius:var(--radius-sm); font-size:0.9rem;" placeholder="Tạo mật khẩu dễ nhớ..." />
              </div>

              <div>
                <label style="font-size:0.85rem; font-weight:700; display:block; margin-bottom:4px;">Vai trò tài khoản</label>
                <select id="reg-role" style="width:100%; padding:10px 12px; border:1px solid var(--border); border-radius:var(--radius-sm); font-size:0.9rem;">
                  <option value="student" selected>🎓 Học sinh (Lớp 8)</option>
                  <option value="admin">👑 Phụ huynh / Quản trị viên (Admin)</option>
                </select>
              </div>

              <div id="reg-error-msg" style="display:none; padding:10px 12px; border-radius:var(--radius-sm); background:#FEF2F2; color:#991B1B; font-size:0.85rem;"></div>

              <button class="btn btn-primary" style="width:100%; padding:12px; font-size:0.95rem; font-weight:700;" onclick="handleRegisterSubmit()">
                Tạo Tài Khoản & Vào Học
              </button>
            </div>
          </div>

          ${
            currentUser
              ? `
                <div style="margin-top:18px; padding-top:14px; border-top:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size:0.85rem; color:var(--text-muted);">Đang đăng nhập: <strong>${currentUser.fullName}</strong></span>
                  <button class="btn btn-outline btn-sm" style="color:var(--danger); border-color:#FECACA;" onclick="handleLogout()">Đăng xuất</button>
                </div>
              `
              : ""
          }
        </div>
      </div>
    `;
  };

  window.switchAuthTab = function (tab) {
    const pLogin = document.getElementById("auth-pane-login");
    const pReg = document.getElementById("auth-pane-register");
    const bLogin = document.getElementById("auth-tab-btn-login");
    const bReg = document.getElementById("auth-tab-btn-register");
    if (pLogin && pReg) {
      pLogin.style.display = tab === "login" ? "block" : "none";
      pReg.style.display = tab === "register" ? "block" : "none";
    }
    if (bLogin && bReg) {
      bLogin.classList.toggle("active", tab === "login");
      bReg.classList.toggle("active", tab === "register");
    }
  };

  window.quickFillLogin = function (u, p) {
    const uEl = document.getElementById("login-username");
    const pEl = document.getElementById("login-password");
    if (uEl) uEl.value = u;
    if (pEl) pEl.value = p;
    handleLoginSubmit();
  };

  window.handleLoginSubmit = async function () {
    const uEl = document.getElementById("login-username");
    const pEl = document.getElementById("login-password");
    const errEl = document.getElementById("login-error-msg");
    if (!uEl || !pEl) return;

    if (window.EY8_Supabase) {
      const res = await window.EY8_Supabase.login(uEl.value, pEl.value);
      if (res.success) {
        closeModal();
        renderApp();
        syncCloudData(true);
      } else {
        if (errEl) {
          errEl.style.display = "block";
          errEl.textContent = res.message || "Tên đăng nhập hoặc mật khẩu không chính xác!";
        }
      }
    }
  };

  window.handleRegisterSubmit = async function () {
    const nEl = document.getElementById("reg-fullname");
    const uEl = document.getElementById("reg-username");
    const pEl = document.getElementById("reg-password");
    const rEl = document.getElementById("reg-role");
    const errEl = document.getElementById("reg-error-msg");

    if (window.EY8_Supabase) {
      const res = await window.EY8_Supabase.register({
        fullName: nEl ? nEl.value : "",
        username: uEl ? uEl.value : "",
        password: pEl ? pEl.value : "",
        role: rEl ? rEl.value : "student"
      });

      if (res.success) {
        closeModal();
        renderApp();
        alert(`🎉 Tạo tài khoản thành công! Chào mừng ${res.user.fullName}.`);
        syncCloudData(true);
      } else {
        if (errEl) {
          errEl.style.display = "block";
          errEl.textContent = res.message || "Đăng ký không thành công!";
        }
      }
    }
  };

  window.handleLogout = function () {
    if (window.EY8_Supabase) {
      window.EY8_Supabase.logout();
      closeModal();
      renderApp();
    }
  };

  // 2. Modal Cài đặt Supabase Cloud (CHỈ DÀNH CHO ADMIN)
  window.openSupabaseSettingsModal = function () {
    if (window.EY8_Supabase && !window.EY8_Supabase.isAdmin()) {
      alert("Tính năng cài đặt kỹ thuật này chỉ dành riêng cho tài khoản Quản trị viên (Admin)!");
      return;
    }

    const modalRoot = document.getElementById("modal-root");
    if (!modalRoot) return;

    const cfg = window.EY8_Supabase ? window.EY8_Supabase.getConfig() : {};
    const currentUser = window.EY8_Supabase ? window.EY8_Supabase.getCurrentUser() : {};

    modalRoot.innerHTML = `
      <div class="modal-overlay" onclick="closeModal()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <button class="modal-close-btn" onclick="closeModal()">✕</button>

          <h3 style="font-size:1.3rem; font-weight:800; margin-bottom:6px;">⚙️ Cấu Hình Supabase Cloud Database (Admin)</h3>
          <p style="font-size:0.88rem; color:var(--text-muted); margin-bottom:18px;">
            Khu vực quản lý kết nối cơ sở dữ liệu Supabase dành cho Quản trị viên.
          </p>

          <div style="display:flex; flex-direction:column; gap:14px;">
            <div>
              <label style="font-size:0.85rem; font-weight:700; display:block; margin-bottom:4px;">Supabase Project URL</label>
              <input id="input-supabase-url" type="text" style="width:100%; padding:10px 12px; border:1px solid var(--border); border-radius:var(--radius-sm); font-family:monospace; font-size:0.85rem;" value="${cfg.url || "https://iiltwryccctzjbfddjcw.supabase.co"}" placeholder="https://xxx.supabase.co" />
            </div>

            <div>
              <label style="font-size:0.85rem; font-weight:700; display:block; margin-bottom:4px;">Supabase Anon Public API Key</label>
              <input id="input-supabase-key" type="password" style="width:100%; padding:10px 12px; border:1px solid var(--border); border-radius:var(--radius-sm); font-family:monospace; font-size:0.85rem;" value="${cfg.anonKey || ""}" placeholder="Dán mã anon public key tại đây..." />
            </div>

            <div id="supabase-modal-msg" style="display:none; padding:10px 14px; border-radius:var(--radius-sm); font-size:0.85rem;"></div>

            <div style="display:flex; gap:10px; margin-top:10px;">
              <button class="btn btn-primary" style="flex:1" onclick="saveAndTestSupabaseConfig()">
                💾 Lưu & Kiểm tra Kết nối
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
    const nameEl = document.getElementById("input-student-name");
    const msgEl = document.getElementById("supabase-modal-msg");

    if (!urlEl || !keyEl) return;

    const url = urlEl.value.trim();
    const key = keyEl.value.trim();
    const studentName = nameEl ? nameEl.value.trim() : "Học Sinh Lớp 8";

    if (!key) {
      msgEl.style.display = "block";
      msgEl.style.background = "#FEF2F2";
      msgEl.style.color = "#991B1B";
      msgEl.textContent = "⚠️ Vui lòng dán Anon Key của Supabase để tiếp tục.";
      return;
    }

    msgEl.style.display = "block";
    msgEl.style.background = "#EEF2FF";
    msgEl.style.color = "#3730A3";
    msgEl.textContent = "⏳ Đang kết nối tới Supabase...";

    if (window.EY8_Supabase) {
      window.EY8_Supabase.saveConfig(url, key);
      window.EY8_Supabase.setCurrentStudent({ fullName: studentName });

      const res = await window.EY8_Supabase.testConnection();
      if (res.ok) {
        msgEl.style.background = "#ECFDF5";
        msgEl.style.color = "#065F46";
        msgEl.textContent = "🎉 Kết nối thành công tới Supabase Database!";
        setTimeout(() => {
          closeModal();
          renderApp();
        }, 1200);
      } else {
        msgEl.style.background = "#FEF2F2";
        msgEl.style.color = "#991B1B";
        msgEl.textContent = `❌ Lỗi kết nối: ${res.message}. Hãy kiểm tra xem bạn đã chạy file schema.sql trên Supabase chưa nhé!`;
      }
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

  async function syncCloudData(silent = false) {
    if (!window.EY8_Supabase) return;
    const cfg = window.EY8_Supabase.getConfig();
    if (!cfg.isConnected) return;

    try {
      const cloudData = await window.EY8_Supabase.fetchCloudStudentData();
      if (!cloudData) return;

      let hasChanges = false;

      // 1. Đồng bộ từ vựng đã thuộc
      if (cloudData.progress && cloudData.progress.length > 0) {
        cloudData.progress.forEach((p) => {
          if (p.status === "mastered" && !state.learnedVocab[p.vocabulary_id]) {
            state.learnedVocab[p.vocabulary_id] = true;
            hasChanges = true;
          }
        });
        if (hasChanges) saveJSON(STORAGE_KEYS.LEARNED_VOCAB, state.learnedVocab);
      }

      // 2. Đồng bộ các lượt thi và chi tiết từng câu từ máy em về máy bạn
      if (cloudData.attempts && cloudData.attempts.length > 0) {
        const existingAttemptIds = new Set(
          state.examHistory.map((h) => h.id || `${h.examId}_${h.date}`)
        );

        cloudData.attempts.forEach((att) => {
          const attId = att.id;
          if (!existingAttemptIds.has(attId)) {
            const reconstructedQuestions = [];
            const answersRecord = {};

            if (att.attempt_answers && att.attempt_answers.length > 0) {
              att.attempt_answers.forEach((ans) => {
                answersRecord[ans.question_id] = ans.selected_option_index;
                const qObj = findQuestionById(ans.question_id);
                if (qObj) {
                  reconstructedQuestions.push(qObj);
                }
              });
            }

            const examTitle =
              att.exercises && att.exercises.title
                ? att.exercises.title
                : `Bài kiểm tra ${att.exercise_id}`;
            const badge =
              att.exercises && att.exercises.badge ? att.exercises.badge : "Đã làm";

            state.examHistory.unshift({
              id: att.id,
              examId: att.exercise_id,
              examTitle: examTitle,
              category: (att.exercises && att.exercises.category) || "exam",
              badge: badge,
              correct: att.raw_score,
              total: att.total_questions,
              score10: Number(Number(att.score).toFixed(2)),
              timeSpent: formatTime(att.time_spent_seconds || 0),
              timeSpentSeconds: att.time_spent_seconds || 0,
              date: new Date(att.completed_at).toLocaleString("vi-VN"),
              answers: answersRecord,
              questions: reconstructedQuestions
            });
            hasChanges = true;
          }
        });

        if (hasChanges) {
          saveJSON(STORAGE_KEYS.EXAM_HISTORY, state.examHistory);
        }
      }

      if (hasChanges) {
        renderApp();
      }

      if (!silent) {
        alert("✅ Đã đồng bộ dữ liệu bài làm mới nhất từ đám mây Supabase!");
      }
    } catch (err) {
      console.warn("syncCloudData warning:", err);
    }
  }

  window.syncCloudNow = async function () {
    if (!window.EY8_Supabase) return;
    const cfg = window.EY8_Supabase.getConfig();
    if (!cfg.isConnected) {
      openSupabaseSettingsModal();
      return;
    }
    await syncCloudData(false);
  };

  // Khởi tạo khi trang tải xong
  window.addEventListener("DOMContentLoaded", () => {
    renderApp();
    // Tự động kiểm tra và đồng bộ từ đám mây Supabase ngầm
    setTimeout(() => {
      syncCloudData(true);
    }, 1000);
  });
})();
