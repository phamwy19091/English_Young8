/**
 * English Young 8 - Modernization Test Engine
 * Zero-dependency, requirement-driven E2E test runner and reporter.
 * Compatible with Node.js v20+ and `node --test`.
 */

import assert from 'node:assert';

class TestRegistry {
  constructor() {
    this.suites = [];
    this.currentSuite = null;
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.skippedTests = 0;
    this.startTime = 0;
    this.endTime = 0;
  }

  describe(name, fn) {
    const parentSuite = this.currentSuite;
    const suite = {
      name,
      parent: parentSuite,
      beforeEach: [],
      afterEach: [],
      tests: [],
      children: []
    };

    if (parentSuite) {
      parentSuite.children.push(suite);
    } else {
      this.suites.push(suite);
    }

    this.currentSuite = suite;
    try {
      fn();
    } finally {
      this.currentSuite = parentSuite;
    }
  }

  beforeEach(fn) {
    if (this.currentSuite) {
      this.currentSuite.beforeEach.push(fn);
    }
  }

  afterEach(fn) {
    if (this.currentSuite) {
      this.currentSuite.afterEach.push(fn);
    }
  }

  it(name, fn) {
    if (!this.currentSuite) {
      throw new Error(`Test "${name}" must be inside a describe block`);
    }
    this.currentSuite.tests.push({ name, fn, skipped: false });
  }

  skip(name, fn) {
    if (!this.currentSuite) {
      throw new Error(`Test "${name}" must be inside a describe block`);
    }
    this.currentSuite.tests.push({ name, fn, skipped: true });
  }

  async runSuite(suite, suitePrefix = '') {
    const fullSuiteName = suitePrefix ? `${suitePrefix} > ${suite.name}` : suite.name;
    console.log(`\n\x1b[1m\x1b[36m▪ ${fullSuiteName}\x1b[0m`);

    // Collect all beforeEach hooks from ancestor suites down to current
    const ancestors = [];
    let curr = suite;
    while (curr) {
      ancestors.unshift(curr);
      curr = curr.parent;
    }

    const allBeforeEach = ancestors.flatMap(s => s.beforeEach);
    const allAfterEach = ancestors.flatMap(s => s.afterEach);

    for (const test of suite.tests) {
      this.totalTests++;
      if (test.skipped) {
        this.skippedTests++;
        console.log(`  \x1b[33m- [SKIP] ${test.name}\x1b[0m`);
        continue;
      }

      const testStart = performance.now();
      try {
        for (const hook of allBeforeEach) {
          await hook();
        }

        await test.fn();

        for (const hook of allAfterEach) {
          await hook();
        }

        const duration = (performance.now() - testStart).toFixed(1);
        this.passedTests++;
        console.log(`  \x1b[32m✔\x1b[0m ${test.name} \x1b[90m(${duration}ms)\x1b[0m`);
      } catch (err) {
        const duration = (performance.now() - testStart).toFixed(1);
        this.failedTests++;
        console.error(`  \x1b[31m✘ ${test.name}\x1b[0m \x1b[90m(${duration}ms)\x1b[0m`);
        console.error(`    \x1b[31m${err.message || err}\x1b[0m`);
        if (err.stack) {
          const firstStackLine = err.stack.split('\n')[1] || '';
          console.error(`    \x1b[90m${firstStackLine.trim()}\x1b[0m`);
        }
      }
    }

    for (const child of suite.children) {
      await this.runSuite(child, fullSuiteName);
    }
  }

  async runAll() {
    this.startTime = performance.now();
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.skippedTests = 0;

    console.log('\x1b[1m\x1b[34m====================================================\x1b[0m');
    console.log('\x1b[1m\x1b[34m  English Young 8 — Modernization E2E Test Suite    \x1b[0m');
    console.log('\x1b[1m\x1b[34m  Methodology: 4-Tier Opaque-Box Acceptance Testing \x1b[0m');
    console.log('\x1b[1m\x1b[34m====================================================\x1b[0m');

    for (const suite of this.suites) {
      await this.runSuite(suite);
    }

    this.endTime = performance.now();
    const totalDuration = ((this.endTime - this.startTime) / 1000).toFixed(2);

    console.log('\n\x1b[1m\x1b[34m----------------------------------------------------\x1b[0m');
    console.log('\x1b[1mTest Results Summary:\x1b[0m');
    console.log(`  Total Tests  : \x1b[1m${this.totalTests}\x1b[0m`);
    console.log(`  Passed       : \x1b[32m${this.passedTests}\x1b[0m`);
    console.log(`  Failed       : \x1b[31m${this.failedTests}\x1b[0m`);
    console.log(`  Skipped      : \x1b[33m${this.skippedTests}\x1b[0m`);
    console.log(`  Duration     : ${totalDuration}s`);
    console.log('\x1b[1m\x1b[34m----------------------------------------------------\x1b[0m');

    return {
      total: this.totalTests,
      passed: this.passedTests,
      failed: this.failedTests,
      skipped: this.skippedTests,
      durationSeconds: Number(totalDuration),
      success: this.failedTests === 0
    };
  }
}

export const registry = new TestRegistry();
export const describe = registry.describe.bind(registry);
export const it = registry.it.bind(registry);
export const test = registry.it.bind(registry);
export const beforeEach = registry.beforeEach.bind(registry);
export const afterEach = registry.afterEach.bind(registry);
export { assert };
