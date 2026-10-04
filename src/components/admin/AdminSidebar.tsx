import React from 'react';
import {
  LayoutDashboard,
  Vote,
  Users,
  UserCheck,
  Activity,
  Laptop,
  BarChart3,
  FileText,
  ShieldAlert,
  LogOut,
  Sliders,
  PieChart,
  Tv,
  FileSpreadsheet
} from 'lucide-react';
import { BallotBoxIllustration } from '../common/SchoolDecorations';

export type AdminMenuKey =
  | 'dashboard'
  | 'election_status'
  | 'election_settings'
  | 'candidates'
  | 'voters'
  | 'voter_import'
  | 'voter_status'
  | 'realtime_activity'
  | 'participation'
  | 'device_status'
  | 'voting_results'
  | 'charts'
  | 'presentation_mode'
  | 'reports'
  | 'spreadsheet_sync'
  | 'audit_log';

interface AdminSidebarProps {
  currentMenu: AdminMenuKey;
  onSelectMenu: (menu: AdminMenuKey) => void;
  onOpenDisplayMode: () => void;
  onLogoutAdmin: () => void;
  electionStatus: 'NOT_STARTED' | 'ACTIVE' | 'CLOSED';
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentMenu,
  onSelectMenu,
  onOpenDisplayMode,
  onLogoutAdmin,
  electionStatus
}) => {
  const getStatusBadge = () => {
    switch (electionStatus) {
      case 'ACTIVE':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Berlangsung</span>
          </span>
        );
      case 'CLOSED':
        return (
          <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
            Ditutup
          </span>
        );
      case 'NOT_STARTED':
      default:
        return (
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            Belum Dibuka
          </span>
        );
    }
  };

  const navItemClass = (key: AdminMenuKey) => {
    const isActive = currentMenu === key;
    return `w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left ${
      isActive
        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;
  };

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col h-full sticky top-16 select-none overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <BallotBoxIllustration className="w-11 h-11" />
          <div>
            <span className="text-base font-extrabold text-blue-900 leading-tight block">
              SIVOT
            </span>
            <span className="text-[10px] text-slate-500 font-medium block leading-tight">
              Sistem Informasi Voting Terpadu
            </span>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Navigation Sections */}
      <div className="p-3 space-y-4 flex-1">
        {/* Dashboard */}
        <div>
          <button
            onClick={() => onSelectMenu('dashboard')}
            className={navItemClass('dashboard')}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
        </div>

        {/* Pemilihan */}
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Pemilihan
          </span>
          <div className="space-y-0.5">
            <button
              onClick={() => onSelectMenu('election_status')}
              className={navItemClass('election_status')}
            >
              <Vote className="w-4 h-4" />
              <span>Status & Tahapan</span>
            </button>
            <button
              onClick={() => onSelectMenu('election_settings')}
              className={navItemClass('election_settings')}
            >
              <Sliders className="w-4 h-4" />
              <span>Pengaturan Agenda</span>
            </button>
          </div>
        </div>

        {/* Kandidat */}
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Kandidat
          </span>
          <div className="space-y-0.5">
            <button
              onClick={() => onSelectMenu('candidates')}
              className={navItemClass('candidates')}
            >
              <Users className="w-4 h-4" />
              <span>Daftar & Kelola Calon</span>
            </button>
          </div>
        </div>

        {/* Pemilih */}
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Pemilih
          </span>
          <div className="space-y-0.5">
            <button
              onClick={() => onSelectMenu('voters')}
              className={navItemClass('voters')}
            >
              <UserCheck className="w-4 h-4" />
              <span>Daftar Pemilih (DPT)</span>
            </button>
            <button
              onClick={() => onSelectMenu('voter_import')}
              className={navItemClass('voter_import')}
            >
              <FileText className="w-4 h-4" />
              <span>Import Data CSV</span>
            </button>
            <button
              onClick={() => onSelectMenu('voter_status')}
              className={navItemClass('voter_status')}
            >
              <Activity className="w-4 h-4" />
              <span>Status Kehadiran</span>
            </button>
          </div>
        </div>

        {/* Monitoring */}
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Monitoring
          </span>
          <div className="space-y-0.5">
            <button
              onClick={() => onSelectMenu('realtime_activity')}
              className={navItemClass('realtime_activity')}
            >
              <Activity className="w-4 h-4" />
              <span>Aktivitas Real-Time</span>
            </button>
            <button
              onClick={() => onSelectMenu('participation')}
              className={navItemClass('participation')}
            >
              <PieChart className="w-4 h-4" />
              <span>Partisipasi Kelas</span>
            </button>
            <button
              onClick={() => onSelectMenu('device_status')}
              className={navItemClass('device_status')}
            >
              <Laptop className="w-4 h-4" />
              <span>Status Perangkat (Bilik & Admin)</span>
            </button>
          </div>
        </div>

        {/* Hasil */}
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Hasil & Presentasi
          </span>
          <div className="space-y-0.5">
            <button
              onClick={() => onSelectMenu('voting_results')}
              className={navItemClass('voting_results')}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Hasil Suara (Ketos/Waketos)</span>
            </button>
            <button
              onClick={() => onSelectMenu('charts')}
              className={navItemClass('charts')}
            >
              <PieChart className="w-4 h-4" />
              <span>Grafik Batang & Pie</span>
            </button>
            <button
              onClick={onOpenDisplayMode}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors text-left"
            >
              <Tv className="w-4 h-4" />
              <span>Buka Display PID Layar Penuh</span>
            </button>
          </div>
        </div>

        {/* Integrasi & Laporan */}
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Integrasi & Laporan
          </span>
          <div className="space-y-0.5">
            <button
              onClick={() => onSelectMenu('spreadsheet_sync')}
              className={navItemClass('spreadsheet_sync')}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Google Spreadsheet</span>
            </button>
            <button
              onClick={() => onSelectMenu('reports')}
              className={navItemClass('reports')}
            >
              <FileText className="w-4 h-4" />
              <span>Rekap & Cetak BA</span>
            </button>
          </div>
        </div>

        {/* Sistem */}
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Sistem
          </span>
          <div className="space-y-0.5">
            <button
              onClick={() => onSelectMenu('audit_log')}
              className={navItemClass('audit_log')}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Audit Log & Keamanan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logout button at bottom */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={onLogoutAdmin}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar dari Admin</span>
        </button>
      </div>
    </aside>
  );
};
