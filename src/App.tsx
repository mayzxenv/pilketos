import React, { useState, useEffect, useCallback } from 'react';
import {
  AuditLog,
  Candidate,
  ElectionSettings,
  Student,
  VotingDevice,
  VoteRecord,
  VoteSubmissionResponse
} from './types';
import { StorageService, subscribeToRealtimeEvents } from './services/storage';
import { Header } from './components/common/Header';
import { LoginView } from './components/student/LoginView';
import { WelcomeView } from './components/student/WelcomeView';
import { CandidateListView } from './components/student/CandidateListView';
import { ConfirmationModal } from './components/student/ConfirmationModal';
import { SuccessView } from './components/student/SuccessView';
import { AdminLayout } from './components/admin/AdminLayout';
import { PIDDisplayView } from './components/display/PIDDisplayView';

export default function App() {
  // Navigation View: 'student' | 'admin' | 'display'
  const [currentView, setCurrentView] = useState<'student' | 'admin' | 'display'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/admin') || hash.includes('admin')) return 'admin';
      if (path.includes('/display') || hash.includes('display')) return 'display';
    }
    return 'student';
  });

  // Global State (synced across tabs via StorageService & BroadcastChannel)
  const [students, setStudents] = useState<Student[]>(() => StorageService.getStudents());
  const [candidates, setCandidates] = useState<Candidate[]>(() => StorageService.getCandidates());
  const [votes, setVotes] = useState<VoteRecord[]>(() => StorageService.getVotes());
  const [settings, setSettings] = useState<ElectionSettings>(() => StorageService.getSettings());
  const [devices, setDevices] = useState<VotingDevice[]>(() => StorageService.getDevices());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => StorageService.getAuditLogs());
  const [activeDeviceId, setActiveDeviceId] = useState<string>(() => StorageService.getActiveDeviceId());

  // Student Flow State
  const [studentStep, setStudentStep] = useState<'login' | 'welcome' | 'candidates' | 'success'>('login');
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [candidateToConfirm, setCandidateToConfirm] = useState<Candidate | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [lastVoteResponse, setLastVoteResponse] = useState<VoteSubmissionResponse | null>(null);

  // Sync state loader
  const reloadAllData = useCallback(() => {
    setStudents(StorageService.getStudents());
    setCandidates(StorageService.getCandidates());
    setVotes(StorageService.getVotes());
    setSettings(StorageService.getSettings());
    setDevices(StorageService.getDevices());
    setAuditLogs(StorageService.getAuditLogs());
    setActiveDeviceId(StorageService.getActiveDeviceId());
  }, []);

  // Listen to realtime events across windows
  useEffect(() => {
    const unsubscribe = subscribeToRealtimeEvents(() => {
      reloadAllData();
    });
    return () => unsubscribe();
  }, [reloadAllData]);

  // Periodic heartbeat updater for devices
  useEffect(() => {
    const timer = setInterval(() => {
      setDevices(StorageService.getDevices());
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // URL sync helper
  const navigateTo = (view: 'student' | 'admin' | 'display') => {
    setCurrentView(view);
    if (typeof window !== 'undefined' && window.history) {
      const url = view === 'student' ? '/' : `/${view}`;
      window.history.pushState(null, '', url);
    }
  };

  // Student Actions
  const handleStudentLoginSuccess = (student: Student) => {
    setCurrentStudent(student);
    setStudentStep('welcome');
  };

  const handleStartVoting = () => {
    setStudentStep('candidates');
  };

  const handleSelectCandidate = (candidate: Candidate) => {
    setCandidateToConfirm(candidate);
    setIsConfirmModalOpen(true);
  };

  const handleVoteSuccess = (response: VoteSubmissionResponse, candidate: Candidate) => {
    setIsConfirmModalOpen(false);
    setLastVoteResponse(response);
    setStudentStep('success');
    reloadAllData();
  };

  const handleFinishAndReset = () => {
    setCurrentStudent(null);
    setCandidateToConfirm(null);
    setLastVoteResponse(null);
    setIsConfirmModalOpen(false);
    setStudentStep('login');
  };

  // Admin Mutations
  const handleAddStudent = (newStudent: Student) => {
    const updated = [...students, newStudent];
    StorageService.saveStudents(updated);
    StorageService.addAuditLog('STUDENT_ADDED', 'Admin', `Menambahkan siswa: ${newStudent.nama} (${newStudent.kelas})`);
    setStudents(updated);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    const updated = students.map((s) => (s.student_id === updatedStudent.student_id ? updatedStudent : s));
    StorageService.saveStudents(updated);
    StorageService.addAuditLog('STUDENT_UPDATED', 'Admin', `Memperbarui siswa: ${updatedStudent.nama} (${updatedStudent.kelas})`);
    setStudents(updated);
  };

  const handleDeleteStudent = (studentId: string) => {
    const updated = students.filter((s) => s.student_id !== studentId);
    StorageService.saveStudents(updated);
    StorageService.addAuditLog('STUDENT_DELETED', 'Admin', `Menghapus student_id: ${studentId}`);
    setStudents(updated);
  };

  const handleImportStudents = (imported: Student[], mode: 'replace' | 'merge') => {
    let finalStudents: Student[] = [];
    if (mode === 'replace') {
      finalStudents = imported;
    } else {
      const map = new Map<string, Student>();
      students.forEach((s) => map.set(s.student_id, s));
      imported.forEach((s) => map.set(s.student_id, s));
      finalStudents = Array.from(map.values());
    }
    StorageService.saveStudents(finalStudents);
    StorageService.addAuditLog(
      'STUDENTS_IMPORTED_CSV',
      'Admin',
      `Import ${imported.length} data siswa dengan metode ${mode.toUpperCase()}. Total DPT kini: ${finalStudents.length}.`,
      'warning'
    );
    setStudents(finalStudents);
  };

  const handleResetDemo = () => {
    StorageService.resetToDemo();
    reloadAllData();
  };

  const handleClearVotesOnly = () => {
    if (window.confirm('PERINGATAN: Seluruh suara dan riwayat pemilihan akan dikosongkan ke 0 untuk memulai sesi baru. Lanjutkan?')) {
      StorageService.clearElectionDataOnly();
      reloadAllData();
    }
  };

  const handleAddCandidate = (cand: Candidate) => {
    const updated = [...candidates, cand];
    StorageService.saveCandidates(updated);
    StorageService.addAuditLog('CANDIDATE_ADDED', 'Admin', `Menambahkan Calon ${cand.nomorUrut}: ${cand.nama}`);
    setCandidates(updated);
  };

  const handleUpdateCandidate = (cand: Candidate) => {
    const updated = candidates.map((c) => (c.id === cand.id ? cand : c));
    StorageService.saveCandidates(updated);
    StorageService.addAuditLog('CANDIDATE_UPDATED', 'Admin', `Memperbarui profil Calon ${cand.nomorUrut}: ${cand.nama}`);
    setCandidates(updated);
  };

  const handleDeleteCandidate = (candId: string) => {
    const updated = candidates.filter((c) => c.id !== candId);
    StorageService.saveCandidates(updated);
    StorageService.addAuditLog('CANDIDATE_DELETED', 'Admin', `Menghapus kandidat ID: ${candId}`);
    setCandidates(updated);
  };

  const handleUpdateSettings = (newSettings: ElectionSettings) => {
    StorageService.saveSettings(newSettings);
    StorageService.addAuditLog(
      'SETTINGS_MODIFIED',
      'Admin',
      `Pengaturan diperbarui. Status pemilihan: ${newSettings.status}`,
      'info'
    );
    setSettings(newSettings);
  };

  const handleDeviceChange = (devId: string) => {
    setActiveDeviceId(devId);
    StorageService.setActiveDeviceId(devId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* If in PID Display Mode, render presentation screen directly without regular navbar */}
      {currentView === 'display' ? (
        <PIDDisplayView
          candidates={candidates}
          students={students}
          votes={votes}
          settings={settings}
          onExitDisplay={() => navigateTo('student')}
        />
      ) : (
        <>
          {/* Top Bar Header */}
          <Header
            currentView={currentView}
            onNavigate={navigateTo}
            activeDeviceId={activeDeviceId}
            onDeviceChange={handleDeviceChange}
            devices={devices}
          />

          {/* Admin Panel View */}
          {currentView === 'admin' ? (
            <AdminLayout
              students={students}
              candidates={candidates}
              votes={votes}
              settings={settings}
              devices={devices}
              auditLogs={auditLogs}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onImportStudents={handleImportStudents}
              onResetDemo={handleResetDemo}
              onClearVotesOnly={handleClearVotesOnly}
              onAddCandidate={handleAddCandidate}
              onUpdateCandidate={handleUpdateCandidate}
              onDeleteCandidate={handleDeleteCandidate}
              onUpdateSettings={handleUpdateSettings}
              onOpenDisplayMode={() => navigateTo('display')}
              onExitAdmin={() => navigateTo('student')}
            />
          ) : (
            /* Student Voting View Flow */
            <div className="flex-1 flex flex-col">
              {studentStep === 'login' && (
                <LoginView onLoginSuccess={handleStudentLoginSuccess} />
              )}

              {studentStep === 'welcome' && currentStudent && (
                <WelcomeView
                  student={currentStudent}
                  settings={settings}
                  candidates={candidates}
                  onStartVoting={handleStartVoting}
                  onLogout={handleFinishAndReset}
                />
              )}

              {studentStep === 'candidates' && currentStudent && (
                <CandidateListView
                  student={currentStudent}
                  candidates={candidates}
                  onSelectAndConfirm={handleSelectCandidate}
                  onBack={() => setStudentStep('welcome')}
                />
              )}

              {studentStep === 'success' && currentStudent && candidateToConfirm && lastVoteResponse && (
                <SuccessView
                  student={currentStudent}
                  chosenCandidate={candidateToConfirm}
                  response={lastVoteResponse}
                  onFinishAndReset={handleFinishAndReset}
                />
              )}

              {/* Confirmation Modal */}
              {isConfirmModalOpen && currentStudent && candidateToConfirm && (
                <ConfirmationModal
                  student={currentStudent}
                  candidate={candidateToConfirm}
                  deviceId={activeDeviceId}
                  onCancel={() => setIsConfirmModalOpen(false)}
                  onVoteSuccess={handleVoteSuccess}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
