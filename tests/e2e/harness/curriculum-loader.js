/**
 * Curriculum Data Loader and Invariant Verifier
 * Loads the complete curriculum catalog (Units 1-6, 86 Vocab, 12 Phonetics, 8 Grammar topics, 72 MCQs, 36 Written, 6 Exams, 121 Exam Qs, 5 Passages).
 * Normalizes property aliases between catalog.json and PROJECT.md interface contracts.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../');

function normalizeUnit(u) {
  const vocab = u.vocabulary || u.vocab || [];
  const quiz = u.practice || u.quiz || [];
  const writtenExercises = (u.written || u.writtenExercises || []).map(w => ({
    ...w,
    prompt: w.prompt || w.question,
    acceptedAnswers: w.acceptedAnswers || w.accepted || []
  }));
  const grammar = (u.grammar || []).map(g => ({
    ...g,
    tips: g.examTips || g.tips || []
  }));

  return {
    ...u,
    vocab,
    vocabulary: vocab,
    quiz,
    practice: quiz,
    writtenExercises,
    written: writtenExercises,
    grammar
  };
}

export function loadCatalog() {
  const catalogPath = path.join(projectRoot, '.agents/teamwork/survey_data/catalog.json');
  if (fs.existsSync(catalogPath)) {
    const raw = fs.readFileSync(catalogPath, 'utf8');
    const parsed = JSON.parse(raw);
    parsed.units = (parsed.units || []).map(normalizeUnit);
    return parsed;
  }

  throw new Error(`Curriculum catalog not found at ${catalogPath}`);
}

export const catalog = loadCatalog();

export function getUnits() {
  return catalog.units || [];
}

export function getUnitById(unitId) {
  return getUnits().find(u => u.id === unitId || `unit-${u.number}` === unitId || u.number === Number(unitId));
}

export function getAllVocab() {
  return getUnits().flatMap(u => (u.vocab || []).map(v => ({ ...v, unitId: u.id, unitNumber: u.number })));
}

export function getAllUnitQuestions() {
  return getUnits().flatMap(u => (u.quiz || []).map(q => ({ ...q, unitId: u.id, unitNumber: u.number })));
}

export function getAllWrittenExercises() {
  return getUnits().flatMap(u => (u.writtenExercises || []).map(w => ({ ...w, unitId: u.id, unitNumber: u.number })));
}

export function getExams() {
  return catalog.exams || [];
}

export function getExamById(examId) {
  return getExams().find(e => e.id === examId);
}

export function getAllExamQuestions() {
  return getExams().flatMap(e => (e.questions || []).map(q => ({ ...q, examId: e.id, examTitle: e.title })));
}

export function getReadingPassages() {
  const passages = [];
  getExams().forEach(e => {
    (e.questions || []).forEach(q => {
      if (q.passage && q.passage.trim().length > 0) {
        passages.push({
          examId: e.id,
          questionId: q.id,
          passage: q.passage,
          length: q.passage.length
        });
      }
    });
  });
  return passages;
}
