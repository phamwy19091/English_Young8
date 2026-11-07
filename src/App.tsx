import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudyProvider, useStudy } from './context/StudyContext';
import { MistakeProvider } from './context/MistakeContext';
import { ToastProvider } from './components/common/Toast';
import { Header } from './components/layout/Header';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { UnitPractice } from './components/practice/UnitPractice';
import { ExamList } from './components/exam/ExamList';
import { ExamRoom } from './components/exam/ExamRoom';
import { MistakesNotebook } from './components/mistakes/MistakesNotebook';
import { ProgressAnalytics } from './components/analytics/ProgressAnalytics';
import { AdminPortal } from './components/admin/AdminPortal';
import { AuthPortal } from './components/auth/AuthPortal';
import { GameHub } from './components/games/GameHub';
import { ExamData } from './types/curriculum';
import { examsData } from './data/exams';

const AppContent: React.FC = () => {
  const { user, role, isAuthenticated } = useAuth();
  const [currentHash, setCurrentHash] = useState<string>(() => {
    return typeof window !== 'undefined' ? window.location.hash || '' : '';
  });

  const { activeExam, startExam, cancelActiveExam } = useStudy();

  useEffect(() => {
    // If not authenticated, ensure hash is login
    if (!isAuthenticated) {
      if (!window.location.hash || !window.location.hash.includes('register')) {
        window.location.hash = '#/login';
      }
    } else {
      // If authenticated and no hash or pointing to auth, redirect based on role
      if (!window.location.hash || window.location.hash === '#/' || window.location.hash.includes('login') || window.location.hash.includes('register')) {
        window.location.hash = role === 'admin' ? '#/admin' : '#/dashboard';
      }
    }

    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated, role]);

  // If not logged in, render the AuthPortal
  if (!isAuthenticated || !user) {
    const isRegister = currentHash.includes('register');
    return <AuthPortal initialMode={isRegister ? 'register' : 'login'} />;
  }

  // Parse hash route
  const renderCurrentView = () => {
    const hash = currentHash;

    // Student trying to access admin -> redirect
    if (role === 'student' && hash.includes('admin')) {
      window.location.hash = '#/dashboard';
      return <StudentDashboard />;
    }

    if (hash.includes('exams/room') || activeExam) {
      let examToRun = activeExam;
      if (!examToRun) {
        const parts = hash.split('exams/room/');
        const examId = parts[1];
        examToRun = examsData.find(e => e.id === examId) || examsData[0];
      }

      return (
        <ExamRoom
          exam={examToRun}
          onExit={() => {
            cancelActiveExam();
            window.location.hash = '#/exams';
          }}
        />
      );
    }

    if (hash.includes('unit')) {
      const match = hash.match(/unit(?:-)?(\d+)(?:\/([a-z0-9_-]+))?/i);
      const unitNum = match && match[1] ? parseInt(match[1], 10) : 1;
      const subTab = (match && match[2] ? match[2] : 'vocab') as any;

      return <UnitPractice initialUnitId={unitNum} initialSubTab={subTab} />;
    }

    if (hash.includes('exams')) {
      return (
        <ExamList
          onStartExam={(exam: ExamData) => {
            startExam(exam);
            window.location.hash = `#/exams/room/${exam.id}`;
          }}
        />
      );
    }

    if (hash.includes('mistakes')) {
      return (
        <MistakesNotebook
          onStartCustomQuiz={(customQuestions) => {
            const batchExam: ExamData = {
              id: `mistake_batch_${Date.now()}`,
              title: '🔥 Làm lại nhanh các câu sai',
              durationMinutes: 15,
              grade: 8,
              semester: 1,
              type: '15m',
              questions: customQuestions
            };
            startExam(batchExam);
            window.location.hash = `#/exams/room/${batchExam.id}`;
          }}
        />
      );
    }

    if (hash.includes('games')) {
      return <GameHub />;
    }

    if (hash.includes('progress')) {
      return <ProgressAnalytics />;
    }

    if (role === 'admin' && (hash.includes('admin') || !hash.includes('dashboard'))) {
      return <AdminPortal />;
    }

    // Default: Dashboard
    return <StudentDashboard />;
  };

  const isExamRoomView = currentHash.includes('exams/room') || Boolean(activeExam);

  return (
    <div id="app-root" className="min-h-screen flex flex-col bg-slate-50 text-slate-800 pb-16 md:pb-0">
      {/* Header is hidden inside timed Exam Room for maximum focus */}
      {!isExamRoomView && <Header currentHash={currentHash} />}

      {/* Main content view */}
      <main className="main-container flex-1 w-full">
        {renderCurrentView()}
      </main>

      {/* Mobile Bottom Navigation (only for students) */}
      {!isExamRoomView && role === 'student' && <MobileBottomNav currentHash={currentHash} />}

      {/* Mounting container for accessibility and modals */}
      <div id="modal-root" />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <StudyProvider>
        <MistakeProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </MistakeProvider>
      </StudyProvider>
    </AuthProvider>
  );
};

export default App;
