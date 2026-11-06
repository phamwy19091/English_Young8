/**
 * Opaque-Box Test Context and App Session Factory
 * Provides simulated browser environment, user interaction simulation, DOM event triggers,
 * and state synchronization across LocalStorage and UI elements.
 */

import { HeadlessBrowser, MockKeyboardEvent, MockEvent } from './dom-env.js';
import { catalog, getUnits, getExams } from './curriculum-loader.js';
import {
  normalizeWrittenString,
  isWrittenAnswerAccepted,
  normalizeSpellingWord,
  isSpellingMatch,
  cleanSpeechText,
  cloneAndShuffleOptions,
  shuffleArray,
  calculateScore10,
  calculateStreak,
  compute5SkillRadar
} from './domain-logic.js';

export class AppSession {
  constructor(options = {}) {
    this.browser = options.browser || new HeadlessBrowser();
    this.username = options.username || 'em_lop8';
    this.role = options.role || 'student';
    this.activeUnit = getUnits()[0];
    this.flashcardDeckMode = 'unlearned'; // 'unlearned' | 'all'
    this.flashcardIndex = 0;
    this.isCardFlipped = false;
    this.spellingHintsRevealed = 0;
    this.spellingAnswerRevealed = false;

    // Unit Quiz State
    this.unitQuizMode = 'list'; // 'list' | 'focus'
    this.unitFocusQuestionIndex = 0;
    this.unitQuizAnswers = {};
    this.unitQuizSubmitted = false;
    this.unitWrittenAnswers = {};
    this.unitWrittenChecked = {};
    this.unitWrittenHints = {};

    // Exam State
    this.activeExam = null;
    this.examSecondsLeft = 0;
    this.examAnswers = {};
    this.examSubmitted = false;
    this.activeExamResult = null;

    // Mistake In-Card State
    this.mistakeInCardResults = {}; // mistakeId -> { solved: bool, wrong: bool }

    // Admin State
    this.selectedStudentUsername = 'em_lop8';

    // Initialize DOM Root
    this._initDOM();

    // Authenticate & Seed Storage
    this._initStorage();
  }

  _initDOM() {
    const doc = this.browser.document;
    this.appRoot = doc.createElement('div');
    this.appRoot.id = 'app-root';
    doc.body.appendChild(this.appRoot);

    this.toastRoot = doc.createElement('div');
    this.toastRoot.id = 'toast-root';
    doc.body.appendChild(this.toastRoot);

    this.modalRoot = doc.createElement('div');
    this.modalRoot.id = 'modal-root';
    doc.body.appendChild(this.modalRoot);

    this.mobileNavRoot = doc.createElement('div');
    this.mobileNavRoot.id = 'mobile-nav-root';
    doc.body.appendChild(this.mobileNavRoot);
  }

  _getUserKey(base) {
    return `${base}_${this.username}`;
  }

  _initStorage() {
    // Auth Session
    const sessionData = {
      username: this.username,
      role: this.role,
      fullName: this.role === 'admin' ? 'Quản Trị Viên' : 'Em Lớp 8',
      token: `tok_${this.username}_test`
    };
    this.browser.localStorage.setItem('ey8_auth_session_v3', JSON.stringify(sessionData));

    // Default Learned Vocab
    if (!this.browser.localStorage.getItem(this._getUserKey('ey8_learned_vocab_v1'))) {
      this.browser.localStorage.setItem(this._getUserKey('ey8_learned_vocab_v1'), JSON.stringify([]));
    }

    // Default Unit Scores
    if (!this.browser.localStorage.getItem(this._getUserKey('ey8_unit_scores_v1'))) {
      this.browser.localStorage.setItem(this._getUserKey('ey8_unit_scores_v1'), JSON.stringify({}));
    }

    // Default Exam History
    if (!this.browser.localStorage.getItem(this._getUserKey('ey8_exam_history_v1'))) {
      this.browser.localStorage.setItem(this._getUserKey('ey8_exam_history_v1'), JSON.stringify([]));
    }

    // Default Mistakes
    if (!this.browser.localStorage.getItem(this._getUserKey('ey8_mistakes_v1'))) {
      this.browser.localStorage.setItem(this._getUserKey('ey8_mistakes_v1'), JSON.stringify({}));
    }

    // Default System Config
    if (!this.browser.localStorage.getItem('ey8_system_config_v1')) {
      this.browser.localStorage.setItem('ey8_system_config_v1', JSON.stringify({
        supabaseUrl: 'https://demo-ey8.supabase.co',
        supabaseAnonKey: 'demo-anon-key',
        assignments: [],
        customQuestions: []
      }));
    }
  }

  // --- OPAQUE NAVIGATION ---
  navigate(hash) {
    const formatted = hash.startsWith('#') ? hash : `#${hash}`;
    this.browser.location.hash = formatted;
    this.renderCurrentView();
  }

  getHash() {
    return this.browser.location.hash;
  }

  // --- STORAGE INSPECTION ---
  getStorage(key) {
    const raw = this.browser.localStorage.getItem(key);
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }

  setStorage(key, value) {
    const raw = typeof value === 'string' ? value : JSON.stringify(value);
    this.browser.localStorage.setItem(key, raw);
  }

  getLearnedVocab() {
    return this.getStorage(this._getUserKey('ey8_learned_vocab_v1')) || [];
  }

  getUnitScores() {
    return this.getStorage(this._getUserKey('ey8_unit_scores_v1')) || {};
  }

  getExamHistory() {
    return this.getStorage(this._getUserKey('ey8_exam_history_v1')) || [];
  }

  getMistakes() {
    return this.getStorage(this._getUserKey('ey8_mistakes_v1')) || {};
  }

  getAssignments() {
    const cfg = this.getStorage('ey8_system_config_v1') || {};
    return cfg.assignments || [];
  }

  getStreak() {
    const hist = this.getExamHistory();
    return calculateStreak(hist);
  }

  // --- SPEECH INSPECTION ---
  getSpokenWords() {
    return this.browser.speechSynthesis.getSpokenTexts();
  }

  clearSpokenWords() {
    this.browser.speechSynthesis.clearHistory();
  }

  // --- FLASHCARD INTERACTIONS ---
  getActiveFlashcardDeck() {
    const all = this.activeUnit.vocab || [];
    if (this.flashcardDeckMode === 'all') return all;
    const learned = new Set(this.getLearnedVocab());
    return all.filter(v => !learned.has(v.id));
  }

  getCurrentFlashcard() {
    const deck = this.getActiveFlashcardDeck();
    if (deck.length === 0) return null;
    return deck[this.flashcardIndex % deck.length];
  }

  flipCard() {
    this.isCardFlipped = !this.isCardFlipped;
    this.renderCurrentView();
  }

  nextCard() {
    const deck = this.getActiveFlashcardDeck();
    if (deck.length > 0) {
      this.flashcardIndex = (this.flashcardIndex + 1) % deck.length;
    }
    this.isCardFlipped = false;
    this.renderCurrentView();
  }

  prevCard() {
    const deck = this.getActiveFlashcardDeck();
    if (deck.length > 0) {
      this.flashcardIndex = (this.flashcardIndex - 1 + deck.length) % deck.length;
    }
    this.isCardFlipped = false;
    this.renderCurrentView();
  }

  setFlashcardDeckMode(mode) {
    this.flashcardDeckMode = mode;
    this.flashcardIndex = 0;
    this.isCardFlipped = false;
    this.renderCurrentView();
  }

  markFlashcardLearned(vocabId) {
    const targetId = vocabId || (this.getCurrentFlashcard() ? this.getCurrentFlashcard().id : null);
    if (!targetId) return;

    const list = this.getLearnedVocab();
    if (!list.includes(targetId)) {
      list.push(targetId);
      this.setStorage(this._getUserKey('ey8_learned_vocab_v1'), list);
    }
    this.browser.showToast('Đã ghi nhớ từ vựng thành công!', 'success');
    this.nextCard();
  }

  speakCurrentVocab() {
    const card = this.getCurrentFlashcard();
    if (card) {
      this.browser.speechSynthesis.cancel();
      const clean = cleanSpeechText(card.word);
      const utter = new this.browser.SpeechSynthesisUtterance(clean);
      utter.rate = 0.9;
      utter.lang = 'en-US';
      this.browser.speechSynthesis.speak(utter);
    }
  }

  // --- ACTIVE RECALL SPELLING ---
  submitSpelling(input) {
    const card = this.getCurrentFlashcard();
    if (!card) return { success: false, empty: true };

    if (!input || !input.trim()) {
      this.browser.showToast('Vui lòng gõ từ tiếng Anh trước khi kiểm tra!', 'warning');
      return { success: false, empty: true };
    }

    const isMatch = isSpellingMatch(card.word, input);
    if (isMatch) {
      this.speakCurrentVocab();
      this.markFlashcardLearned(card.id);
      this.spellingHintsRevealed = 0;
      this.spellingAnswerRevealed = false;
      return { success: true, correct: true, word: card.word };
    } else {
      return { success: true, correct: false, word: card.word };
    }
  }

  requestSpellingHint() {
    const card = this.getCurrentFlashcard();
    if (!card) return '';
    const clean = normalizeSpellingWord(card.word);
    this.spellingHintsRevealed = Math.min(clean.length, this.spellingHintsRevealed + 1);
    return clean.slice(0, this.spellingHintsRevealed);
  }

  revealSpellingAnswer() {
    const card = this.getCurrentFlashcard();
    if (!card) return '';
    this.spellingAnswerRevealed = true;
    this.speakCurrentVocab();
    return card.word;
  }

  // --- UNIT PRACTICE & WRITTEN EXERCISES ---
  selectUnitQuizAnswer(questionId, optionIdx) {
    if (this.unitQuizSubmitted) return;
    this.unitQuizAnswers[questionId] = optionIdx;
    this.renderCurrentView();
  }

  submitUnitQuiz() {
    const questions = this.activeUnit.quiz || [];
    let correct = 0;
    const mistakes = this.getMistakes();

    questions.forEach(q => {
      const chosen = this.unitQuizAnswers[q.id];
      if (chosen === q.answer) {
        correct++;
      } else {
        // Collect into mistake notebook
        mistakes[q.id] = {
          id: q.id,
          source: `Unit ${this.activeUnit.number}: ${this.activeUnit.title}`,
          question: q.question,
          options: q.options,
          answer: q.answer,
          wrongChoice: chosen !== undefined ? chosen : -1,
          explanation: q.explanation,
          savedAt: new Date().toISOString(),
          resolved: false
        };
      }
    });

    const score10 = calculateScore10(correct, questions.length);
    this.unitQuizSubmitted = true;

    // Save best score
    const scores = this.getUnitScores();
    const prevBest = scores[this.activeUnit.number] || 0;
    if (score10 >= prevBest) {
      scores[this.activeUnit.number] = score10;
      this.setStorage(this._getUserKey('ey8_unit_scores_v1'), scores);
    }

    // Save mistakes
    this.setStorage(this._getUserKey('ey8_mistakes_v1'), mistakes);

    this.renderCurrentView();
    return { correct, total: questions.length, score10 };
  }

  submitWrittenExercise(exerciseId, text) {
    this.unitWrittenAnswers[exerciseId] = text;
    this.unitWrittenChecked[exerciseId] = true;
    const all = this.activeUnit.writtenExercises || [];
    const ex = all.find(w => w.id === exerciseId);
    if (!ex) return false;
    return isWrittenAnswerAccepted(ex, text);
  }

  // --- TIMED EXAM & SMART ADAPTIVE EXAM ---
  startExam(examId) {
    const ex = getExams().find(e => e.id === examId);
    if (!ex) throw new Error(`Exam not found: ${examId}`);
    this.activeExam = { ...ex, isSmartAdaptive: false };
    this.examSecondsLeft = ex.durationMinutes * 60;
    this.examAnswers = {};
    this.examSubmitted = false;
    this.activeExamResult = null;
    this.navigate(`#/exams/room/${examId}`);
  }

  startSmartAdaptiveExam(count = 10) {
    const mistakeMap = this.getMistakes();
    const mistakeList = Object.values(mistakeMap);
    const pool = [];
    const usedIds = new Set();

    // Take up to 70% from mistakes
    const shuffledMistakes = shuffleArray(mistakeList);
    const maxMistakes = Math.min(shuffledMistakes.length, Math.ceil(count * 0.7));
    for (let i = 0; i < maxMistakes; i++) {
      const m = shuffledMistakes[i];
      usedIds.add(m.id);
      pool.push({
        id: m.id,
        originalQuestionId: m.id,
        section: `📓 Câu từng sai (${m.source || 'Đề thi'})`,
        question: m.question,
        options: m.options,
        answer: m.answer,
        explanation: m.explanation
      });
    }

    // Fill remaining from curriculum
    const allQs = getUnits().flatMap(u => (u.quiz || []).map(q => ({ ...q, section: `Unit ${u.number}` })));
    for (const q of shuffleArray(allQs)) {
      if (pool.length >= count) break;
      if (!usedIds.has(q.id)) {
        usedIds.add(q.id);
        pool.push(q);
      }
    }

    // Shuffle ABCD options for each question
    const shuffledQuestions = pool.map(q => cloneAndShuffleOptions(q));

    this.activeExam = {
      id: `smart-adaptive-${Date.now()}`,
      title: `⚡ Đề Thông Minh Gỡ Lỗi (${count} câu)`,
      durationMinutes: count * 1.5,
      questions: shuffledQuestions,
      isSmartAdaptive: true
    };
    this.examSecondsLeft = this.activeExam.durationMinutes * 60;
    this.examAnswers = {};
    this.examSubmitted = false;
    this.activeExamResult = null;
    this.navigate('#/exams/room/smart-adaptive');
  }

  selectExamAnswer(questionId, optionIdx) {
    if (this.examSubmitted) return;
    this.examAnswers[questionId] = optionIdx;
    this.renderCurrentView();
  }

  advanceExamTimer(seconds) {
    if (this.examSubmitted || !this.activeExam) return;
    this.examSecondsLeft = Math.max(0, this.examSecondsLeft - seconds);
    if (this.examSecondsLeft === 0) {
      this.submitExam(true);
    } else {
      this.renderCurrentView();
    }
  }

  submitExam(force = false) {
    if (!this.activeExam || this.examSubmitted) return this.activeExamResult;

    const questions = this.activeExam.questions || [];
    let correct = 0;
    let resolvedMistakesCount = 0;
    const mistakes = this.getMistakes();
    const answerDetails = [];

    questions.forEach(q => {
      const chosen = this.examAnswers[q.id];
      const targetMistakeKey = q.originalQuestionId || q.id;
      const isRight = chosen === q.answer;

      answerDetails.push({
        questionId: targetMistakeKey,
        question: q,
        chosen,
        isCorrect: isRight
      });

      if (isRight) {
        correct++;
        // Auto-clearance in adaptive mode
        if (this.activeExam.isSmartAdaptive && mistakes[targetMistakeKey]) {
          delete mistakes[targetMistakeKey];
          resolvedMistakesCount++;
        }
      } else {
        // Collect mistake
        mistakes[targetMistakeKey] = {
          id: targetMistakeKey,
          source: this.activeExam.title,
          question: q.question,
          options: q.options,
          answer: q.answer,
          wrongChoice: chosen !== undefined ? chosen : -1,
          explanation: q.explanation,
          savedAt: new Date().toISOString(),
          resolved: false
        };
      }
    });

    const score10 = calculateScore10(correct, questions.length);
    const timeSpent = (this.activeExam.durationMinutes * 60) - this.examSecondsLeft;

    const attempt = {
      id: `att_${Date.now()}`,
      examId: this.activeExam.id,
      examTitle: this.activeExam.title,
      score: score10,
      totalQuestions: questions.length,
      correctCount: correct,
      timeSpentSeconds: timeSpent,
      answers: { ...this.examAnswers },
      answersDetails: answerDetails,
      date: new Date().toISOString().slice(0, 10),
      submittedAt: new Date().toISOString()
    };

    // Update history
    const history = this.getExamHistory();
    history.unshift(attempt);
    this.setStorage(this._getUserKey('ey8_exam_history_v1'), history);

    // Save updated mistakes
    this.setStorage(this._getUserKey('ey8_mistakes_v1'), mistakes);

    // Update Homework assignments if applicable
    this._checkAssignmentCompletion(this.activeExam.id, score10);

    this.examSubmitted = true;
    this.activeExamResult = {
      score10,
      correct,
      total: questions.length,
      resolvedMistakesCount,
      attemptId: attempt.id
    };

    this.renderCurrentView();
    return this.activeExamResult;
  }

  // --- MISTAKE NOTEBOOK ACTIONS ---
  retryMistakeCard(mistakeId, optionIdx) {
    const mistakes = this.getMistakes();
    const item = mistakes[mistakeId];
    if (!item) return { success: false };

    const isCorrect = optionIdx === item.answer;
    this.mistakeInCardResults[mistakeId] = {
      solved: isCorrect,
      wrong: !isCorrect,
      chosen: optionIdx
    };

    if (isCorrect) {
      item.resolved = true;
      item.resolvedAt = new Date().toISOString();
      this.setStorage(this._getUserKey('ey8_mistakes_v1'), mistakes);
    }

    this.renderCurrentView();
    return { success: true, isCorrect };
  }

  deleteMistake(mistakeId) {
    const mistakes = this.getMistakes();
    if (mistakes[mistakeId]) {
      delete mistakes[mistakeId];
      this.setStorage(this._getUserKey('ey8_mistakes_v1'), mistakes);
      delete this.mistakeInCardResults[mistakeId];
      this.browser.showToast('Đã xóa câu hỏi khỏi Sổ tay câu sai!', 'info');
      this.renderCurrentView();
      return true;
    }
    return false;
  }

  clearAllResolvedMistakes() {
    const mistakes = this.getMistakes();
    let count = 0;
    for (const key of Object.keys(mistakes)) {
      if (mistakes[key].resolved) {
        delete mistakes[key];
        count++;
      }
    }
    this.setStorage(this._getUserKey('ey8_mistakes_v1'), mistakes);
    this.renderCurrentView();
    return count;
  }

  // --- ADMIN PORTAL ACTIONS ---
  _checkAssignmentCompletion(targetExamId, score) {
    const cfg = this.getStorage('ey8_system_config_v1') || {};
    const assignments = cfg.assignments || [];
    let updated = false;

    assignments.forEach(asg => {
      if (asg.studentUsername === this.username && asg.targetExamId === targetExamId) {
        if (score >= (asg.minScore || 8.0)) {
          asg.status = 'completed';
          asg.completedAt = new Date().toISOString();
          asg.achievedScore = score;
          updated = true;
        }
      }
    });

    if (updated) {
      this.setStorage('ey8_system_config_v1', cfg);
    }
  }

  createAssignment(assignment) {
    const cfg = this.getStorage('ey8_system_config_v1') || { assignments: [] };
    const newAsg = {
      id: `asg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...assignment
    };
    cfg.assignments = cfg.assignments || [];
    cfg.assignments.unshift(newAsg);
    this.setStorage('ey8_system_config_v1', cfg);
    return newAsg;
  }

  createCustomQuestion(question) {
    const cfg = this.getStorage('ey8_system_config_v1') || { customQuestions: [] };
    const newQ = {
      id: `custom_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...question
    };
    cfg.customQuestions = cfg.customQuestions || [];
    cfg.customQuestions.push(newQ);
    this.setStorage('ey8_system_config_v1', cfg);
    return newQ;
  }

  // --- KEYBOARD SHORTCUT DISPATCHER ---
  pressKey(key, options = {}) {
    const evt = new MockKeyboardEvent('keydown', { key, ...options });

    // Respect input focus rule: if focus is on input/textarea, do not trigger card flip
    const activeElement = this.browser.document.activeElement;
    const isTextInput = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');

    if (key === ' ' || key === 'Space') {
      if (!isTextInput && this.browser.location.hash.includes('vocab')) {
        this.flipCard();
      }
    } else if (key === 'ArrowRight') {
      if (!isTextInput && this.browser.location.hash.includes('vocab')) {
        this.nextCard();
      }
    } else if (key === 'ArrowLeft') {
      if (!isTextInput && this.browser.location.hash.includes('vocab')) {
        this.prevCard();
      }
    } else if (key === 's' || key === 'S') {
      if (!isTextInput && this.browser.location.hash.includes('vocab')) {
        this.speakCurrentVocab();
      }
    } else if (key === 'Enter') {
      if (!isTextInput && this.browser.location.hash.includes('vocab')) {
        this.markFlashcardLearned();
      }
    }

    this.browser.dispatchEvent(evt);
  }

  // --- DOM RENDERING ORCHESTRATOR ---
  renderCurrentView() {
    const hash = this.getHash();
    const doc = this.browser.document;
    this.appRoot.children = [];

    // Header Element
    const header = doc.createElement('header');
    header.className = 'app-header';
    header.setAttribute('role', 'banner');
    header.innerHTML = `
      <div class="logo">English Young 8</div>
      <nav class="nav-tabs">
        <a href="#/dashboard" class="nav-link ${hash.includes('dashboard') ? 'active' : ''}">Bàn Học</a>
        <a href="#/unit/unit-1/vocab" class="nav-link ${hash.includes('unit') ? 'active' : ''}">6 Unit</a>
        <a href="#/exams" class="nav-link ${hash.includes('exams') ? 'active' : ''}">Luyện Đề</a>
        <a href="#/mistakes" class="nav-link ${hash.includes('mistakes') ? 'active' : ''}">Sổ Câu Sai</a>
        <a href="#/progress" class="nav-link ${hash.includes('progress') ? 'active' : ''}">Thành Tích</a>
        <a href="#/admin" class="nav-link ${hash.includes('admin') ? 'active' : ''}">Quản Trị</a>
      </nav>
      <div class="user-pill">${this.username} (${this.role})</div>
    `;
    this.appRoot.appendChild(header);

    // Main Content
    const main = doc.createElement('main');
    main.className = 'main-container';

    if (hash.includes('vocab')) {
      main.appendChild(this._renderFlashcardView());
    } else if (hash.includes('exams/room')) {
      main.appendChild(this._renderExamRoomView());
    } else if (hash.includes('mistakes')) {
      main.appendChild(this._renderMistakesView());
    } else if (hash.includes('progress')) {
      main.appendChild(this._renderProgressView());
    } else if (hash.includes('admin')) {
      main.appendChild(this._renderAdminView());
    } else {
      main.appendChild(this._renderDashboardView());
    }

    this.appRoot.appendChild(main);

    // Mobile Bottom Nav
    const bottomNav = doc.createElement('nav');
    bottomNav.className = 'mobile-bottom-nav';
    bottomNav.innerHTML = `
      <a href="#/dashboard" class="b-nav-item">🏠 Bàn học</a>
      <a href="#/unit/unit-1/vocab" class="b-nav-item">📚 6 Unit</a>
      <a href="#/exams" class="b-nav-item">📝 Luyện đề</a>
      <a href="#/mistakes" class="b-nav-item">📓 Câu sai</a>
      <a href="#/progress" class="b-nav-item">🏆 Thành tích</a>
    `;
    this.mobileNavRoot.children = [];
    this.mobileNavRoot.appendChild(bottomNav);
  }

  _renderFlashcardView() {
    const doc = this.browser.document;
    const cardEl = doc.createElement('div');
    cardEl.className = 'flashcard-container';

    const card = this.getCurrentFlashcard();
    const deck = this.getActiveFlashcardDeck();

    if (!card) {
      cardEl.innerHTML = `
        <div class="deck-completed-hero">
          <h2>Xuất sắc! Em đã thuộc trọn bộ từ vựng</h2>
          <button class="btn-review-all" onclick="setFlashcardDeckMode('all')">Ôn tập tất cả</button>
        </div>
      `;
      return cardEl;
    }

    cardEl.innerHTML = `
      <div class="deck-mode-toggle">
        <span class="pill-unlearned ${this.flashcardDeckMode === 'unlearned' ? 'active' : ''}">Chưa thuộc (${deck.length})</span>
        <span class="pill-all ${this.flashcardDeckMode === 'all' ? 'active' : ''}">Tất cả (${(this.activeUnit.vocab || []).length})</span>
      </div>
      <div class="flashcard-3d ${this.isCardFlipped ? 'flipped' : ''}">
        <div class="card-face card-front">
          <div class="word-text">${card.word}</div>
          <div class="ipa-text">${card.ipa}</div>
          <button class="btn-audio-speak" aria-label="Phát âm">🔊</button>
        </div>
        <div class="card-face card-back">
          <div class="meaning-vi">${card.meaning}</div>
          <div class="example-en">${card.example}</div>
          <div class="example-vi">${card.exampleVi}</div>
        </div>
      </div>
      <div class="card-controls">
        <button class="btn-prev-card">Từ trước</button>
        <button class="btn-mark-learned">Đã thuộc từ này</button>
        <button class="btn-next-card">Từ tiếp theo</button>
      </div>
    `;
    return cardEl;
  }

  _renderExamRoomView() {
    const doc = this.browser.document;
    const roomEl = doc.createElement('div');
    roomEl.className = 'exam-room';

    if (!this.activeExam) {
      roomEl.innerHTML = `<div>Không có đề thi đang làm.</div>`;
      return roomEl;
    }

    const minutes = Math.floor(this.examSecondsLeft / 60);
    const seconds = this.examSecondsLeft % 60;
    const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    roomEl.innerHTML = `
      <div class="exam-header">
        <h2>${this.activeExam.title}</h2>
        <div class="countdown-timer">⏳ ${timeFormatted}</div>
        <button class="btn-submit-exam">Nộp bài</button>
      </div>
      <div class="exam-questions-list">
        ${(this.activeExam.questions || []).map((q, idx) => `
          <div class="question-card" data-qid="${q.id}">
            <div class="q-title">Câu ${idx + 1}: ${q.question}</div>
            ${q.passage ? `<div class="passage-sticky-box">${q.passage}</div>` : ''}
            <div class="options-group">
              ${(q.options || []).map((opt, oIdx) => `
                <button class="option-btn ${this.examAnswers[q.id] === oIdx ? 'selected' : ''}" data-idx="${oIdx}">
                  ${opt}
                </button>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
    return roomEl;
  }

  _renderMistakesView() {
    const doc = this.browser.document;
    const el = doc.createElement('div');
    el.className = 'mistakes-view';

    const mistakes = this.getMistakes();
    const list = Object.values(mistakes);

    el.innerHTML = `
      <div class="mistakes-header">
        <h2>Sổ Tay Câu Sai (${list.length} câu)</h2>
        <button class="btn-batch-practice">Làm lại nhanh tại chỗ</button>
      </div>
      <div class="mistake-cards-list">
        ${list.map((m, idx) => {
          const res = this.mistakeInCardResults[m.id];
          return `
            <div class="mistake-card ${res && res.solved ? 'solved' : ''} ${res && res.wrong ? 'wrong-again' : ''}" data-mid="${m.id}">
              <div class="m-source">${m.source}</div>
              <div class="m-question">Câu ${idx + 1}: ${m.question}</div>
              <div class="m-options">
                ${(m.options || []).map((opt, oIdx) => `
                  <button class="m-opt-btn" data-idx="${oIdx}">${opt}</button>
                `).join('')}
              </div>
              ${res && res.solved ? `<div class="badge-solved">🎉 Đã gỡ thành công!</div><button class="btn-del-mistake">Xóa khỏi sổ</button>` : ''}
              ${res && res.wrong ? `<div class="badge-wrong">✘ Chưa đúng, thử lại nhé!</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
    return el;
  }

  _renderProgressView() {
    const doc = this.browser.document;
    const el = doc.createElement('div');
    el.className = 'progress-view';
    const streak = this.getStreak();
    const history = this.getExamHistory();
    const radar = compute5SkillRadar(history);

    el.innerHTML = `
      <div class="progress-hero">
        <div class="streak-badge">🔥 Chuỗi ngày học: ${streak} ngày</div>
        <div class="attempts-count">Tổng số bài hoàn thành: ${history.length}</div>
      </div>
      <div class="skill-radar-grid">
        <div class="skill-pill" data-skill="pronunciation">Ngữ âm: ${radar.pronunciation.percentage}%</div>
        <div class="skill-pill" data-skill="vocabulary">Từ vựng: ${radar.vocabulary.percentage}%</div>
        <div class="skill-pill" data-skill="grammar">Ngữ pháp: ${radar.grammar.percentage}%</div>
        <div class="skill-pill" data-skill="reading">Đọc hiểu: ${radar.reading.percentage}%</div>
        <div class="skill-pill" data-skill="writing">Viết: ${radar.writing.percentage}%</div>
      </div>
    `;
    return el;
  }

  _renderAdminView() {
    const doc = this.browser.document;
    const el = doc.createElement('div');
    el.className = 'admin-view';
    const assignments = this.getAssignments();

    el.innerHTML = `
      <div class="admin-header">
        <h2>Cổng Quản Trị Viên</h2>
        <div class="admin-student-selector">
          <span>Học sinh: ${this.selectedStudentUsername}</span>
        </div>
      </div>
      <div class="admin-assignments-list">
        <h3>Danh sách bài tập đã giao (${assignments.length})</h3>
        ${assignments.map(a => `
          <div class="assignment-item" data-id="${a.id}">
            <span>${a.title || a.targetExamId}</span>
            <span class="status-badge ${a.status}">${a.status}</span>
          </div>
        `).join('')}
      </div>
    `;
    return el;
  }

  _renderDashboardView() {
    const doc = this.browser.document;
    const el = doc.createElement('div');
    el.className = 'dashboard-view';
    el.innerHTML = `
      <div class="hero-welcome">
        <h2>Chào mừng trở lại, ${this.username}!</h2>
        <div class="streak-pill">🔥 Chuỗi ${this.getStreak()} ngày</div>
      </div>
      <div class="unit-grid">
        ${getUnits().map(u => `
          <div class="unit-card" data-unit="${u.number}">
            <div class="unit-title">Unit ${u.number}: ${u.title}</div>
          </div>
        `).join('')}
      </div>
    `;
    return el;
  }

  // --- QUERY SELECTOR SHORTCUTS ---
  querySelector(selector) {
    return this.appRoot.querySelector(selector);
  }

  querySelectorAll(selector) {
    return this.appRoot.querySelectorAll(selector);
  }

  getText(selector) {
    const el = this.querySelector(selector);
    return el ? el.textContent.trim() : '';
  }

  hasElement(selector) {
    return !!this.querySelector(selector);
  }

  click(selector) {
    const el = this.querySelector(selector);
    if (!el) throw new Error(`Element not found for click: ${selector}`);
    el.click();
  }

  type(selector, text) {
    const el = this.querySelector(selector);
    if (!el) throw new Error(`Element not found for type: ${selector}`);
    el.value = text;
    const evt = new MockEvent('input', { bubbles: true });
    el.dispatchEvent(evt);
  }
}

export function createAppSession(options = {}) {
  const session = new AppSession(options);
  session.renderCurrentView();
  return session;
}
