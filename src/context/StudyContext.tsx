import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { UnitData, ExamData } from '../types/curriculum';
import { ExamAttempt } from '../types/storage';
import { unitsData } from '../data/units';
import { useAuth } from './AuthContext';
import { getStudentSnapshot, saveStudentSnapshot } from '../services/storageService';
import { supabaseService } from '../services/supabaseService';
import { calculateStreak, compute5SkillRadar, SkillCompetency } from '../services/adaptiveService';

interface ExtendedExamAttempt extends ExamAttempt {
  answersDetails?: Array<{ question?: any; isCorrect?: boolean; section?: string }>;
}

interface StudyContextType {
  activeUnitId: number;
  activeUnit: UnitData;
  setActiveUnitId: (id: number) => void;
  learnedVocab: string[];
  markVocabLearned: (vocabId: string) => void;
  unmarkVocabLearned: (vocabId: string) => void;
  isVocabLearned: (vocabId: string) => boolean;
  unitScores: Record<number, number>;
  saveUnitScore: (unitNumber: number, score: number) => void;
  examHistory: ExtendedExamAttempt[];
  recordExamAttempt: (attemptData: {
    examId: string;
    examTitle: string;
    score: number;
    totalQuestions: number;
    timeSpentSeconds: number;
    answers: Record<string, number>;
    answersDetails?: Array<{ question?: any; isCorrect?: boolean; section?: string }>;
  }) => ExtendedExamAttempt;
  streakDays: number;
  radarSkills: Record<'pronunciation' | 'vocabulary' | 'grammar' | 'reading' | 'writing', SkillCompetency>;
  activeExam: ExamData | null;
  startExam: (exam: ExamData) => void;
  cancelActiveExam: () => void;
  totalLearnedVocabCount: number;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeUnitId, setActiveUnitId] = useState<number>(1);
  const [learnedVocab, setLearnedVocab] = useState<string[]>([]);
  const [unitScores, setUnitScores] = useState<Record<number, number>>({});
  const [examHistory, setExamHistory] = useState<ExtendedExamAttempt[]>([]);
  const [activeExam, setActiveExam] = useState<ExamData | null>(null);

  // Load snapshot when user changes
  useEffect(() => {
    if (!user?.username) {
      setLearnedVocab([]);
      setUnitScores({});
      setExamHistory([]);
      return;
    }
    // 1. Instant local render
    const snap = getStudentSnapshot(user.username);
    setLearnedVocab(snap.learnedVocab || []);
    setUnitScores(snap.unitScores || {});
    setExamHistory(snap.examHistory as ExtendedExamAttempt[] || []);

    // 2. Async cloud sync for student
    if (user.role === 'student') {
      supabaseService.fetchStudentFullRecord(user.username).then(cloudSnap => {
        setLearnedVocab(cloudSnap.learnedVocab || []);
        setUnitScores(cloudSnap.unitScores || {});
        setExamHistory(cloudSnap.examHistory as ExtendedExamAttempt[] || []);
      }).catch(err => console.warn('StudyContext cloud sync error:', err));
    }
  }, [user?.username, user?.role]);

  const activeUnit = useMemo(() => {
    return unitsData.find(u => u.id === activeUnitId) || unitsData[0];
  }, [activeUnitId]);

  const markVocabLearned = useCallback((vocabId: string) => {
    if (!user?.username) return;
    setLearnedVocab(prev => {
      if (prev.includes(vocabId)) return prev;
      const updated = [...prev, vocabId];
      const snap = getStudentSnapshot(user.username);
      snap.learnedVocab = updated;
      snap.updatedAt = new Date().toISOString();
      saveStudentSnapshot(snap);
      if (user) supabaseService.syncStudentSnapshotToCloud(user, snap);
      return updated;
    });
  }, [user]);

  const unmarkVocabLearned = useCallback((vocabId: string) => {
    if (!user?.username) return;
    setLearnedVocab(prev => {
      const updated = prev.filter(id => id !== vocabId);
      const snap = getStudentSnapshot(user.username);
      snap.learnedVocab = updated;
      snap.updatedAt = new Date().toISOString();
      saveStudentSnapshot(snap);
      if (user) supabaseService.syncStudentSnapshotToCloud(user, snap);
      return updated;
    });
  }, [user]);

  const isVocabLearned = useCallback((vocabId: string) => {
    return learnedVocab.includes(vocabId);
  }, [learnedVocab]);

  const saveUnitScore = useCallback((unitNumber: number, score: number) => {
    if (!user?.username) return;
    setUnitScores(prev => {
      const prevBest = prev[unitNumber] || 0;
      if (score < prevBest) return prev;
      const updated = { ...prev, [unitNumber]: score };
      const snap = getStudentSnapshot(user.username);
      snap.unitScores = updated;
      snap.updatedAt = new Date().toISOString();
      saveStudentSnapshot(snap);
      if (user) supabaseService.syncStudentSnapshotToCloud(user, snap);
      return updated;
    });
  }, [user]);

  const recordExamAttempt = useCallback((attemptData: {
    examId: string;
    examTitle: string;
    score: number;
    totalQuestions: number;
    timeSpentSeconds: number;
    answers: Record<string, number>;
    answersDetails?: Array<{ question?: any; isCorrect?: boolean; section?: string }>;
  }) => {
    const newAttempt: ExtendedExamAttempt = {
      id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      ...attemptData,
      submittedAt: new Date().toISOString()
    };

    setExamHistory(prev => {
      const updated = [newAttempt, ...prev];
      if (user?.username) {
        const snap = getStudentSnapshot(user.username);
        snap.examHistory = updated;
        snap.streak = {
          currentStreak: calculateStreak(updated),
          lastStudyDate: new Date().toISOString().split('T')[0]
        };
        snap.updatedAt = new Date().toISOString();
        saveStudentSnapshot(snap);
        if (user) supabaseService.syncStudentSnapshotToCloud(user, snap);
      }
      return updated;
    });

    return newAttempt;
  }, [user?.username]);

  const streakDays = useMemo(() => {
    return calculateStreak(examHistory);
  }, [examHistory]);

  const radarSkills = useMemo(() => {
    return compute5SkillRadar(examHistory);
  }, [examHistory]);

  const startExam = useCallback((exam: ExamData) => {
    setActiveExam(exam);
  }, []);

  const cancelActiveExam = useCallback(() => {
    setActiveExam(null);
  }, []);

  return (
    <StudyContext.Provider
      value={{
        activeUnitId,
        activeUnit,
        setActiveUnitId,
        learnedVocab,
        markVocabLearned,
        unmarkVocabLearned,
        isVocabLearned,
        unitScores,
        saveUnitScore,
        examHistory,
        recordExamAttempt,
        streakDays,
        radarSkills,
        activeExam,
        startExam,
        cancelActiveExam,
        totalLearnedVocabCount: learnedVocab.length
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = (): StudyContextType => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
