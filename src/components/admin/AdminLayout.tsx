import React, { useState } from 'react';
import {
  AuditLog,
  Candidate,
  ElectionSettings,
  Student,
  VotingDevice,
  VoteRecord
} from '../../types';
import { AdminMenuKey, AdminSidebar } from './AdminSidebar';
import { AdminDashboard } from './AdminDashboard';
import { VoterManageView } from './VoterManageView';
import { ImportCsvModal } from './ImportCsvModal';
import { LiveMonitoringView } from './LiveMonitoringView';
import { CandidateManageView } from './CandidateManageView';
import { ElectionSettingsView } from './ElectionSettingsView';
import { DeviceStatusView } from './DeviceStatusView';
import { ResultsView } from './ResultsView';
import { ParticipationView } from './ParticipationView';
import { ReportsView } from './ReportsView';
import { SpreadsheetSyncView } from './SpreadsheetSyncView';
import { AuditLogView } from './AuditLogView';
import { AdminLoginPage } from './AdminLoginPage';
import { AuthService } from '../../services/auth';

interface AdminLayoutProps {
  students: Student[];
  candidates: Candidate[];
  votes: VoteRecord[];
  settings: ElectionSettings;
  devices: VotingDevice[];
  auditLogs: AuditLog[];
  onAddStudent: (s: Student) => void;
  onUpdateStudent: (s: Student) => void;
  onDeleteStudent: (id: string) => void;
  onImportStudents: (students: Student[], mode: 'replace' | 'merge') => void;
  onClearVotesOnly: () => void;
  onAddCandidate: (c: Candidate) => void;
  onUpdateCandidate: (c: Candidate) => void;
  onDeleteCandidate: (id: string) => void;
  onUpdateSettings: (s: ElectionSettings) => void;
  onOpenDisplayMode: () => void;
  onExitAdmin: () => void;
  onAdminAuthenticated: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  students,
  candidates,
  votes,
  settings,
  devices,
  auditLogs,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onImportStudents,
  onClearVotesOnly,
  onAddCandidate,
  onUpdateCandidate,
  onDeleteCandidate,
  onUpdateSettings,
  onOpenDisplayMode,
  onExitAdmin,
  onAdminAuthenticated
}) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<AdminMenuKey>('dashboard');
  const [isImportCsvOpen, setIsImportCsvOpen] = useState(false);

  // Require the configured administrator account before showing election controls.
  if (!isAdminAuthenticated) {
    return (
      <AdminLoginPage
        onLoginSuccess={() => {
          setIsAdminAuthenticated(true);
          onAdminAuthenticated();
        }}
        onBackToStudent={onExitAdmin}
      />
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      {/* Sticky Fixed Left Sidebar */}
      <AdminSidebar
        currentMenu={currentMenu}
        onSelectMenu={(menu) => {
          if (menu === 'voter_import') {
            setIsImportCsvOpen(true);
          } else {
            setCurrentMenu(menu);
          }
        }}
        onOpenDisplayMode={onOpenDisplayMode}
        onLogoutAdmin={async () => {
          await AuthService.signOut();
          setIsAdminAuthenticated(false);
          onExitAdmin();
        }}
        electionStatus={settings.status}
      />

      {/* Main Admin View Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {currentMenu === 'dashboard' && (
          <AdminDashboard
            students={students}
            candidates={candidates}
            settings={settings}
            devices={devices}
            onNavigateMenu={(menu) => {
              if (menu === 'voter_import') setIsImportCsvOpen(true);
              else setCurrentMenu(menu);
            }}
            onOpenDisplayMode={onOpenDisplayMode}
          />
        )}

        {(currentMenu === 'election_status' || currentMenu === 'election_settings') && (
          <ElectionSettingsView
            settings={settings}
            onUpdateSettings={onUpdateSettings}
            onClearVotesOnly={onClearVotesOnly}
          />
        )}

        {currentMenu === 'candidates' && (
          <CandidateManageView
            candidates={candidates}
            onAddCandidate={onAddCandidate}
            onUpdateCandidate={onUpdateCandidate}
            onDeleteCandidate={onDeleteCandidate}
          />
        )}

        {(currentMenu === 'voters' || currentMenu === 'voter_status') && (
          <VoterManageView
            students={students}
            onAddStudent={onAddStudent}
            onUpdateStudent={onUpdateStudent}
            onDeleteStudent={onDeleteStudent}
            onOpenImportCsv={() => setIsImportCsvOpen(true)}
            onClearVotesOnly={onClearVotesOnly}
          />
        )}

        {currentMenu === 'realtime_activity' && (
          <LiveMonitoringView students={students} />
        )}

        {currentMenu === 'participation' && (
          <ParticipationView students={students} />
        )}

        {currentMenu === 'device_status' && (
          <DeviceStatusView devices={devices} />
        )}

        {(currentMenu === 'voting_results' || currentMenu === 'charts') && (
          <ResultsView
            candidates={candidates}
            students={students}
            votes={votes}
            settings={settings}
            onOpenDisplayMode={onOpenDisplayMode}
            onActivateStage2={() => {
              onUpdateSettings({ ...settings, stage: 'PUTARAN_2_OPSIONAL' });
              alert('Opsi Putaran 2 (Tie-Breaker) telah diaktifkan!');
            }}
          />
        )}

        {currentMenu === 'spreadsheet_sync' && (
          <SpreadsheetSyncView
            students={students}
            candidates={candidates}
            votes={votes}
            settings={settings}
            onUpdateSettings={onUpdateSettings}
          />
        )}

        {currentMenu === 'reports' && (
          <ReportsView
            candidates={candidates}
            students={students}
            votes={votes}
            settings={settings}
          />
        )}

        {currentMenu === 'audit_log' && (
          <AuditLogView logs={auditLogs} />
        )}
      </main>

      {/* CSV Import Modal */}
      {isImportCsvOpen && (
        <ImportCsvModal
          onClose={() => setIsImportCsvOpen(false)}
          onImportConfirm={(newStudents, mode) => {
            onImportStudents(newStudents, mode);
            setIsImportCsvOpen(false);
          }}
        />
      )}
    </div>
  );
};
