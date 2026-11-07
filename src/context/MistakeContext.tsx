import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { MistakeItem } from '../types/storage';
import { UnitQuestion } from '../types/curriculum';
import { useAuth } from './AuthContext';
import { getStudentSnapshot, saveStudentSnapshot } from '../services/storageService';
import { supabaseService } from '../services/supabaseService';
import { cloneAndShuffleOptions, shuffleArray } from '../services/adaptiveService';

interface MistakeContextType {
  mistakes: MistakeItem[];
  harvestMistakes: (
    sourceType: 'unit' | 'exam',
    sourceId: string | number,
    wrongList: Array<{ question: UnitQuestion; wrongAnswer: number }>
  ) => void;
  retryMistake: (mistakeId: string, optionIdx: number) => { isCorrect: boolean };
  resolveMistake: (mistakeId: string) => void;
  resolveMistakesBatch: (mistakeIds: string[]) => void;
  deleteMistake: (mistakeId: string) => void;
  clearResolvedMistakes: () => number;
  generateBatchQuiz: (count?: number) => UnitQuestion[];
  unresolvedCount: number;
}

const MistakeContext = createContext<MistakeContextType | undefined>(undefined);

export const MistakeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);

  // Load snapshot when username changes
  useEffect(() => {
    if (!user?.username) {
      setMistakes([]);
      return;
    }
    const snap = getStudentSnapshot(user.username);
    setMistakes(snap.mistakes || []);

    if (user.role === 'student') {
      supabaseService.fetchStudentFullRecord(user.username).then(cloudSnap => {
        setMistakes(cloudSnap.mistakes || []);
      }).catch(err => console.warn('MistakeContext cloud sync error:', err));
    }
  }, [user?.username, user?.role]);

  // Persist mistakes to snapshot
  const persistMistakes = useCallback((newMistakes: MistakeItem[]) => {
    setMistakes(newMistakes);
    if (user?.username) {
      const snap = getStudentSnapshot(user.username);
      snap.mistakes = newMistakes;
      snap.updatedAt = new Date().toISOString();
      saveStudentSnapshot(snap);
      if (user) supabaseService.syncStudentSnapshotToCloud(user, snap);
    }
  }, [user]);

  const harvestMistakes = useCallback(
    (
      sourceType: 'unit' | 'exam',
      sourceId: string | number,
      wrongList: Array<{ question: UnitQuestion; wrongAnswer: number }>
    ) => {
      if (!wrongList || wrongList.length === 0) return;

      setMistakes(prev => {
        const current = [...prev];
        const existingMap = new Map<string, MistakeItem>();
        current.forEach(m => existingMap.set(m.questionId, m));

        const now = new Date().toISOString();
        wrongList.forEach(({ question, wrongAnswer }) => {
          const qId = question.id;
          const existing = existingMap.get(qId);
          if (existing) {
            existing.wrongAnswer = wrongAnswer;
            existing.question = question; // Synchronize question options and answer key with latest shuffle
            existing.resolved = false;
            existing.addedAt = now;
          } else {
            const newItem: MistakeItem = {
              id: `mst_${qId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              sourceType,
              sourceId,
              questionId: qId,
              question,
              wrongAnswer,
              addedAt: now,
              resolved: false
            };
            current.push(newItem);
            existingMap.set(qId, newItem);
          }
        });

        if (user?.username) {
          const snap = getStudentSnapshot(user.username);
          snap.mistakes = current;
          snap.updatedAt = now;
          saveStudentSnapshot(snap);
        }
        return current;
      });
    },
    [user?.username]
  );

  const retryMistake = useCallback(
    (mistakeId: string, optionIdx: number) => {
      const current = [...mistakes];
      const item = current.find(m => m.id === mistakeId);
      if (!item) return { isCorrect: false };

      const isCorrect = optionIdx === item.question.answer;
      if (isCorrect) {
        item.resolved = true;
        item.resolvedAt = new Date().toISOString();
        persistMistakes(current);
      }
      return { isCorrect };
    },
    [mistakes, persistMistakes]
  );

  const resolveMistakesBatch = useCallback(
    (mistakeIds: string[]) => {
      if (!mistakeIds || mistakeIds.length === 0) return;
      const idSet = new Set(mistakeIds);
      setMistakes(prev => {
        const now = new Date().toISOString();
        const updated = prev.map(m =>
          idSet.has(m.id) ? { ...m, resolved: true, resolvedAt: now } : m
        );
        if (user?.username) {
          const snap = getStudentSnapshot(user.username);
          snap.mistakes = updated;
          snap.updatedAt = now;
          saveStudentSnapshot(snap);
        }
        return updated;
      });
    },
    [user?.username]
  );

  const resolveMistake = useCallback(
    (mistakeId: string) => {
      setMistakes(prev => {
        const now = new Date().toISOString();
        const updated = prev.map(m =>
          m.id === mistakeId ? { ...m, resolved: true, resolvedAt: now } : m
        );
        if (user?.username) {
          const snap = getStudentSnapshot(user.username);
          snap.mistakes = updated;
          snap.updatedAt = now;
          saveStudentSnapshot(snap);
        }
        return updated;
      });
    },
    [user?.username]
  );

  const deleteMistake = useCallback(
    (mistakeId: string) => {
      setMistakes(prev => {
        const filtered = prev.filter(m => m.id !== mistakeId);
        if (user?.username) {
          const snap = getStudentSnapshot(user.username);
          snap.mistakes = filtered;
          snap.updatedAt = new Date().toISOString();
          saveStudentSnapshot(snap);
        }
        return filtered;
      });
    },
    [user?.username]
  );

  const clearResolvedMistakes = useCallback(() => {
    const unresolved = mistakes.filter(m => !m.resolved);
    const count = mistakes.length - unresolved.length;
    persistMistakes(unresolved);
    return count;
  }, [mistakes, persistMistakes]);

  const generateBatchQuiz = useCallback(
    (count?: number) => {
      const pool = mistakes.filter(m => !m.resolved).map(m => m.question);
      const shuffled = shuffleArray(pool);
      const selected = count ? shuffled.slice(0, count) : shuffled;
      return selected.map(q => cloneAndShuffleOptions(q));
    },
    [mistakes]
  );

  const unresolvedCount = mistakes.filter(m => !m.resolved).length;

  return (
    <MistakeContext.Provider
      value={{
        mistakes,
        harvestMistakes,
        retryMistake,
        resolveMistake,
        resolveMistakesBatch,
        deleteMistake,
        clearResolvedMistakes,
        generateBatchQuiz,
        unresolvedCount
      }}
    >
      {children}
    </MistakeContext.Provider>
  );
};

export const useMistakes = (): MistakeContextType => {
  const context = useContext(MistakeContext);
  if (!context) {
    throw new Error('useMistakes must be used within a MistakeProvider');
  }
  return context;
};
