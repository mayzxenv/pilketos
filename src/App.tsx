import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  AuditLog,
  Candidate,
  ElectionSettings,
  Student,
  VotingDevice,
  VoteRecord,
  VoteSubmissionResponse
} from './types';
import { StorageService, broadcastEvent, subscribeToRealtimeEvents } from './services/storage';
import { Header } from './components/common/Header';
import { LoginView } from './components/student/LoginView';
import { WelcomeView } from './components/student/WelcomeView';
import { CandidateListView } from './components/student/CandidateListView';
import { ConfirmationModal } from './components/student/ConfirmationModal';
import { SuccessView } from './components/student/SuccessView';
import { AdminLayout } from './components/admin/AdminLayout';
import { PIDDisplayView } from './components/display/PIDDisplayView';
import { playClickSound } from './services/sound';
import { RemoteStorageService } from './services/remoteStorage';

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
  const refreshInFlight = useRef(false);

  // Sync state loader
  const reloadAllData = useCallback(async (includeVotingData = false) => {
    const [remoteCandidates, remoteSettings] = await Promise.all([
      RemoteStorageService.getCandidates(),
      RemoteStorageService.getSettings()
    ]);
    setCandidates(remoteCandidates);
    setSettings(remoteSettings);

    if (includeVotingData) {
      const [remoteStudents, remoteVotes] = await Promise.all([
        RemoteStorageService.getStudents(),
        RemoteStorageService.getVotes()
      ]);
      setStudents(remoteStudents);
      setVotes(remoteVotes);

      // Device and audit-log tables are intentionally restricted to admins.
      // PID only needs the public DPT/vote aggregates and must not fail its
      // entire refresh because those admin-only queries are unavailable.
      if (currentView === 'admin') {
        try {
          const [remoteDevices, remoteAuditLogs] = await Promise.all([
            RemoteStorageService.getDevices(),
            RemoteStorageService.getAuditLogs()
          ]);
          setDevices(remoteDevices);
          setAuditLogs(remoteAuditLogs);
        } catch (error: unknown) {
          console.error('Gagal memuat data perangkat atau audit log admin:', error);
        }
      }
    }
  }, [currentView]);

  useEffect(() => {
    void reloadAllData().catch((error: unknown) => {
      console.error('Gagal memuat data pemilu dari Supabase:', error);
    });
  }, [reloadAllData]);

  useEffect(() => {
    if (currentView !== 'display' && currentView !== 'admin') return;
    const refreshVotingData = () => {
      if (refreshInFlight.current) return;
      refreshInFlight.current = true;
      void reloadAllData(true).catch((error: unknown) => {
        console.error('Gagal menyinkronkan data PID/admin dari Supabase:', error);
      }).finally(() => {
        refreshInFlight.current = false;
      });
    };
    refreshVotingData();
    const timer = window.setInterval(refreshVotingData, 1000);
    return () => window.clearInterval(timer);
  }, [currentView, reloadAllData]);

  // Listen to realtime events across windows
  useEffect(() => {
    const unsubscribe = subscribeToRealtimeEvents(() => {
      // PID and admin views need fresh vote/DPT aggregates after another
      // voting tab submits a ballot.
      const shouldReloadVotingData = currentView === 'admin' || currentView === 'display';
      void reloadAllData(shouldReloadVotingData).catch((error: unknown) => {
        console.error('Gagal menyinkronkan data pemilu:', error);
      });
    });
    return () => unsubscribe();
  }, [currentView, reloadAllData]);

  // Keep interaction feedback consistent across student, admin, and display screens.
  useEffect(() => {
    const handleDocumentClick = () => {
      playClickSound();
    };

    document.addEventListener('click', handleDocumentClick, true);
    return () => document.removeEventListener('click', handleDocumentClick, true);
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
    // Notify PID/admin tabs immediately. The receiving tab then fetches the
    // authoritative vote and DPT state from Supabase.
    broadcastEvent('VOTING_DATA_UPDATED', {
      studentId: currentStudent?.student_id,
      candidateId: candidate.id
    });
    void reloadAllData();
  };

  const handleFinishAndReset = useCallback(() => {
    setCurrentStudent(null);
    setCandidateToConfirm(null);
    setLastVoteResponse(null);
    setIsConfirmModalOpen(false);
    setStudentStep('login');
  }, []);

  // Admin Mutations
  const handleAddStudent = async (newStudent: Student) => {
    await RemoteStorageService.saveStudents([...students, newStudent]);
    await RemoteStorageService.addAuditLog('STUDENT_ADDED', 'Admin', `Menambahkan siswa: ${newStudent.nama} (${newStudent.kelas})`);
    await reloadAllData(true);
  };

  const handleUpdateStudent = async (updatedStudent: Student) => {
    await RemoteStorageService.saveStudents([updatedStudent]);
    await RemoteStorageService.addAuditLog('STUDENT_UPDATED', 'Admin', `Memperbarui siswa: ${updatedStudent.nama} (${updatedStudent.kelas})`);
    await reloadAllData(true);
  };

  const handleDeleteStudent = async (studentId: string) => {
    await RemoteStorageService.deleteStudent(studentId);
    await RemoteStorageService.addAuditLog('STUDENT_DELETED', 'Admin', `Menghapus student_id: ${studentId}`);
    await reloadAllData(true);
  };

  const handleImportStudents = async (imported: Student[], mode: 'replace' | 'merge') => {
    let finalStudents = imported;
    if (mode === 'merge') {
      const map = new Map(students.map((student) => [student.student_id, student]));
      imported.forEach((student) => map.set(student.student_id, student));
      finalStudents = Array.from(map.values());
    }
    if (mode === 'replace') {
      await RemoteStorageService.replaceStudents(finalStudents);
    } else {
      await RemoteStorageService.saveStudents(finalStudents);
    }
    await RemoteStorageService.addAuditLog(
      'STUDENTS_IMPORTED_CSV',
      'Admin',
      `Import ${imported.length} data siswa dengan metode ${mode.toUpperCase()}. Total DPT kini: ${finalStudents.length}.`,
      'warning'
    );
    await reloadAllData(true);
  };

  const handleClearVotesOnly = () => {
    if (window.confirm('Reset hasil suara sekarang? Semua suara dan status sudah memilih akan dikosongkan, tetapi DPT, kandidat, banner, dan pengaturan tetap dipertahankan.')) {
      void RemoteStorageService.clearVoteResultsOnly()
        .then(() => reloadAllData(true))
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : 'Gagal mereset hasil suara.';
          window.alert(message);
        });
    }
  };

  const handleClearElectionData = () => {
    if (window.confirm('PERINGATAN KERAS: reset ini akan menghapus permanen semua kandidat, DPT, suara, data PID/perangkat, request voting, dan audit log. Data tidak dapat dipulihkan. Lanjutkan?')
      && window.confirm('Konfirmasi terakhir: hapus SEMUA data pemilu sekarang?')) {
      void RemoteStorageService.clearElectionDataOnly()
        .then(() => reloadAllData(true))
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : 'Gagal mereset seluruh data pemilu.';
          window.alert(message);
        });
    }
  };

  const handleAddCandidate = async (cand: Candidate) => {
    await RemoteStorageService.saveCandidates([cand]);
    await RemoteStorageService.addAuditLog('CANDIDATE_ADDED', 'Admin', `Menambahkan Calon ${cand.nomorUrut}: ${cand.nama}`);
    await reloadAllData();
  };

  const handleUpdateCandidate = async (cand: Candidate) => {
    await RemoteStorageService.saveCandidates([cand]);
    await RemoteStorageService.addAuditLog('CANDIDATE_UPDATED', 'Admin', `Memperbarui profil Calon ${cand.nomorUrut}: ${cand.nama}`);
    await reloadAllData();
  };

  const handleDeleteCandidate = async (candId: string) => {
    await RemoteStorageService.deleteCandidate(candId);
    await RemoteStorageService.addAuditLog('CANDIDATE_DELETED', 'Admin', `Menghapus kandidat ID: ${candId}`);
    setCandidates((currentCandidates) => currentCandidates.filter((candidate) => candidate.id !== candId));
    await reloadAllData();
  };

  const handleUpdateSettings = async (newSettings: ElectionSettings) => {
    await RemoteStorageService.saveSettings(newSettings);
    setSettings(newSettings);
    broadcastEvent('SETTINGS_UPDATED', newSettings);
    try {
      await RemoteStorageService.addAuditLog(
        'SETTINGS_MODIFIED',
        'Admin',
        `Pengaturan diperbarui. Status pemilihan: ${newSettings.status}`,
        'info'
      );
    } catch (error) {
      console.warn('Pengaturan tersimpan, tetapi audit log gagal dicatat:', error);
    }
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
              onClearVotesOnly={handleClearVotesOnly}
              onClearElectionData={handleClearElectionData}
              onAddCandidate={handleAddCandidate}
              onUpdateCandidate={handleUpdateCandidate}
              onDeleteCandidate={handleDeleteCandidate}
              onUpdateSettings={handleUpdateSettings}
              onOpenDisplayMode={() => navigateTo('display')}
              onExitAdmin={() => navigateTo('student')}
              onAdminAuthenticated={() => {
                void reloadAllData(true).catch((error: unknown) => {
                  console.error('Gagal memuat data admin dari Supabase:', error);
                });
              }}
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
