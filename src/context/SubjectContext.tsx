import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { SubjectConfig, SubjectId } from '../types/subject';
import { getSubjectConfig } from '../data/subjects';

const ACTIVE_SUBJECT_STORAGE_KEY = 'ey8_active_subject_v1';

interface SubjectContextType {
  activeSubjectId: SubjectId;
  activeSubject: SubjectConfig;
  setActiveSubject: (id: SubjectId) => void;
}

const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

function isValidSubjectId(value: string | null): value is SubjectId {
  return value === 'english' || value === 'math' || value === 'science';
}

export const SubjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeSubjectId, setActiveSubjectId] = useState<SubjectId>(() => {
    if (typeof window === 'undefined') return 'english';
    try {
      const hash = window.location.hash || '';
      if (hash.includes('#/math')) return 'math';
      if (hash.includes('#/science')) return 'science';
      const stored = window.localStorage.getItem(ACTIVE_SUBJECT_STORAGE_KEY);
      if (isValidSubjectId(stored)) return stored;
    } catch {
      // Ignore storage access errors
    }
    return 'english';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(ACTIVE_SUBJECT_STORAGE_KEY, activeSubjectId);
    } catch {
      // Ignore storage access errors
    }
  }, [activeSubjectId]);

  const setActiveSubject = useCallback((id: SubjectId) => {
    setActiveSubjectId(id);
  }, []);

  const activeSubject = getSubjectConfig(activeSubjectId);

  return (
    <SubjectContext.Provider
      value={{
        activeSubjectId,
        activeSubject,
        setActiveSubject,
      }}
    >
      {children}
    </SubjectContext.Provider>
  );
};

export const useSubject = (): SubjectContextType => {
  const context = useContext(SubjectContext);
  if (!context) {
    // Safe fallback for isolated unit tests rendering components without SubjectProvider
    return {
      activeSubjectId: 'english',
      activeSubject: getSubjectConfig('english'),
      setActiveSubject: () => {},
    };
  }
  return context;
};
