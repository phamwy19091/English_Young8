/**
 * Tier 1: Feature Coverage
 * Suite 07: Responsive App Shell, SPA Hash Routing, Dashboard & Portal Switcher
 * Features covered:
 * - Feature 26: Responsive App Shell (Desktop layout vs mobile bottom navigation)
 * - Feature 27: SPA Hash Routing (Deep linking, history back/forward, state recovery)
 * - Feature 28: Student Portal Dashboard (Welcome hero, streak display, unit grid)
 * - Feature 29: Portal Switcher (Student Portal vs Admin Portal switching & permissions)
 */

import { describe, it, assert } from '../harness/test-engine.js';
import { createAppSession } from '../harness/test-context.js';
import { getUnits } from '../harness/curriculum-loader.js';

describe('Tier 1: Suite 07 - App Shell, Hash Routing, Dashboard & Portal Switcher', () => {

  // --- FEATURE 26: RESPONSIVE APP SHELL ---
  describe('Feature 26: Responsive App Shell Invariants', () => {
    it('F26.1: Desktop header renders logo, navigation links, and active user badge', () => {
      const session = createAppSession({ username: 'em_lop8', role: 'student' });
      assert.ok(session.hasElement('.app-header'), 'Header must render');
      assert.ok(session.getText('.logo').includes('English Young 8'), 'Logo must contain app title');
      assert.ok(session.getText('.user-pill').includes('em_lop8'), 'User pill must display username');
    });

    it('F26.2: Mobile bottom navigation renders 5 essential ergonomic tab links', () => {
      const session = createAppSession();
      const mobileNav = session.browser.document.querySelector('.mobile-bottom-nav');
      assert.ok(mobileNav, 'Mobile bottom nav must exist');

      const items = mobileNav.querySelectorAll('.b-nav-item');
      assert.strictEqual(items.length, 5, 'Must have 5 mobile bottom navigation items');

      const textCombined = items.map(i => i.textContent).join(' ');
      assert.ok(textCombined.includes('Bàn học'));
      assert.ok(textCombined.includes('6 Unit'));
      assert.ok(textCombined.includes('Luyện đề'));
      assert.ok(textCombined.includes('Câu sai'));
      assert.ok(textCombined.includes('Thành tích'));
    });

    it('F26.3: Required accessibility mounting containers exist in document body', () => {
      const session = createAppSession();
      const doc = session.browser.document;
      assert.ok(doc.getElementById('app-root'), '#app-root required');
      assert.ok(doc.getElementById('toast-root'), '#toast-root required');
      assert.ok(doc.getElementById('modal-root'), '#modal-root required');
      assert.ok(doc.getElementById('mobile-nav-root'), '#mobile-nav-root required');
    });
  });

  // --- FEATURE 27: SPA HASH ROUTING ---
  describe('Feature 27: SPA Hash Routing Invariants', () => {
    it('F27.1: Changing URL hash routes dynamically to designated views without page refresh', () => {
      const session = createAppSession();

      // Dashboard
      session.navigate('#/dashboard');
      assert.ok(session.hasElement('.dashboard-view'));

      // Flashcards
      session.navigate('#/unit/unit-1/vocab');
      assert.ok(session.hasElement('.flashcard-container'));

      // Exam room
      session.startExam('exam-15m-1');
      assert.ok(session.hasElement('.exam-room'));

      // Mistakes
      session.navigate('#/mistakes');
      assert.ok(session.hasElement('.mistakes-view'));

      // Progress
      session.navigate('#/progress');
      assert.ok(session.hasElement('.progress-view'));

      // Admin
      session.navigate('#/admin');
      assert.ok(session.hasElement('.admin-view'));
    });

    it('F27.2: Active navigation tab highlight updates automatically to match current URL hash', () => {
      const session = createAppSession();

      session.navigate('#/mistakes');
      const activeLink = session.querySelector('.nav-link.active');
      assert.ok(activeLink, 'Must have active nav link');
      assert.strictEqual(activeLink.getAttribute('href'), '#/mistakes');

      session.navigate('#/progress');
      const newActive = session.querySelector('.nav-link.active');
      assert.strictEqual(newActive.getAttribute('href'), '#/progress');
    });

    it('F27.3: Browser history back and forward navigation transitions views faithfully', () => {
      const session = createAppSession();

      session.navigate('#/dashboard');
      session.browser.history.pushState(null, '', '#/dashboard');

      session.navigate('#/mistakes');
      session.browser.history.pushState(null, '', '#/mistakes');

      assert.ok(session.browser.location.hash.includes('mistakes'));

      // Go back
      session.browser.history.back();
      session.renderCurrentView();
      assert.ok(session.browser.location.hash.includes('dashboard'));
      assert.ok(session.hasElement('.dashboard-view'));

      // Go forward
      session.browser.history.forward();
      session.renderCurrentView();
      assert.ok(session.browser.location.hash.includes('mistakes'));
      assert.ok(session.hasElement('.mistakes-view'));
    });

    it('F27.4: Page reload with existing hash restores intended sub-view seamlessly', () => {
      const session = createAppSession();
      session.navigate('#/mistakes');

      // Simulate F5 reload keeping browser history/location
      const reloaded = createAppSession({
        username: session.username,
        browser: session.browser
      });
      reloaded.navigate(session.getHash());

      assert.strictEqual(reloaded.getHash(), '#/mistakes');
      assert.ok(reloaded.hasElement('.mistakes-view'));
    });
  });

  // --- FEATURE 28: STUDENT PORTAL DASHBOARD ---
  describe('Feature 28: Student Portal Dashboard Invariants', () => {
    it('F28.1: Dashboard hero section greets student by name and displays daily streak', () => {
      const session = createAppSession({ username: 'em_quang' });
      session.navigate('#/dashboard');

      const hero = session.getText('.hero-welcome');
      assert.ok(hero.includes('em_quang'), `Hero must greet em_quang, got "${hero}"`);
      assert.ok(hero.includes('Chuỗi'), 'Hero must show streak pill');
    });

    it('F28.2: Dashboard displays 6 Unit cards with titles and sequence numbers', () => {
      const session = createAppSession();
      session.navigate('#/dashboard');

      const unitCards = session.querySelectorAll('.unit-card');
      assert.strictEqual(unitCards.length, 6, 'Must display all 6 unit cards');

      const units = getUnits();
      unitCards.forEach((card, idx) => {
        assert.strictEqual(card.getAttribute('data-unit'), String(idx + 1));
        assert.ok(card.textContent.includes(units[idx].title), `Card should contain ${units[idx].title}`);
      });
    });
  });

  // --- FEATURE 29: PORTAL SWITCHER ---
  describe('Feature 29: Portal Switcher Invariants', () => {
    it('F29.1: Admin account session renders administrative views and executive badge', () => {
      const adminSession = createAppSession({ username: 'admin', role: 'admin' });
      assert.strictEqual(adminSession.role, 'admin');
      assert.ok(adminSession.getText('.user-pill').includes('admin'));

      adminSession.navigate('#/admin');
      assert.ok(adminSession.hasElement('.admin-view'));
      assert.ok(adminSession.getText('.admin-header').includes('Cổng Quản Trị Viên'));
    });

    it('F29.2: Student and Admin sessions maintain separate storage scopes', () => {
      const studentSession = createAppSession({ username: 'em_lop8', role: 'student' });
      const adminSession = createAppSession({ username: 'admin', role: 'admin', browser: studentSession.browser });

      studentSession.setStorage('ey8_learned_vocab_v1_em_lop8', ['u1-v1']);
      adminSession.setStorage('ey8_learned_vocab_v1_admin', ['u2-v1', 'u2-v2']);

      assert.deepStrictEqual(studentSession.getLearnedVocab(), ['u1-v1']);
      assert.deepStrictEqual(adminSession.getLearnedVocab(), ['u2-v1', 'u2-v2']);
    });
  });
});
