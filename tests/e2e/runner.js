#!/usr/bin/env node

/**
 * English Young 8 — Modernization E2E Master Test Runner
 * Executes all 4-tier opaque-box test suites covering all 35 features in PROJECT.md.
 * Zero external dependencies. Runnable with pure Node.js (v20+).
 *
 * Usage:
 *   node tests/e2e/runner.js
 *   npm run test:e2e
 */

import { registry } from './harness/test-engine.js';

// Tier 1: Feature Coverage (Core platform, study, exam, mistakes, progress, admin)
import './tier1-feature-coverage/01-scaffolding-data.test.js';
import './tier1-feature-coverage/02-flashcard-spelling.test.js';
import './tier1-feature-coverage/03-unit-practice.test.js';
import './tier1-feature-coverage/04-exam-runner.test.js';
import './tier1-feature-coverage/05-mistakes-notebook.test.js';
import './tier1-feature-coverage/06-progress-analytics.test.js';
import './tier1-feature-coverage/07-app-shell-routing.test.js';
import './tier1-feature-coverage/08-admin-cloud.test.js';

// Tier 2: Boundary & Corner Cases (Storage cold-boot, timer expiry, out-of-order, normalization, anchors)
import './tier2-boundary-corner/boundary-cases.test.js';
import './tier2-boundary-corner/normalization-anchors.test.js';

// Tier 3: Cross-Feature Combinations (Remediation cycle, deck filter mastery, exam to homework completion)
import './tier3-cross-feature/cross-feature-flows.test.js';

// Tier 4: Real-World Student & Admin Workflows (Authentic end-to-end user journeys)
import './tier4-workflows/student-journey.test.js';
import './tier4-workflows/admin-journey.test.js';

async function main() {
  const result = await registry.runAll();

  if (!result.success) {
    console.error(`\n\x1b[31mE2E Test Suite Run FAILED with ${result.failed} failure(s).\x1b[0m`);
    process.exit(1);
  } else {
    console.log(`\n\x1b[32m✔ All ${result.passed} E2E tests passed successfully across Tiers 1-4!\x1b[0m\n`);
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
