import React from 'react';
import { Candidate, ElectionSettings, Student, VotingDevice } from '../../types';
import { AdminMenuKey } from './AdminSidebar';
import { Users, UserCheck, UserX, Percent, Activity, Laptop, ArrowRight, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

interface AdminDashboardProps {
  students: Student[];
  candidates: Candidate[];
  settings: ElectionSettings;
  devices: VotingDevice[];
  onNavigateMenu: (menu: AdminMenuKey) => void;
  onOpenDisplayMode: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  students,
  settings,
  devices,
  onNavigateMenu,
  onOpenDisplayMode
}) => {
  const totalVoters = students.length;
  const votedCount = students.filter((s) => s.status_voted).length;
  const unvotedCount = totalVoters - votedCount;
  const participationRate = totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(1) : '0';

  // Recent voters (sorted by voted_at desc)
  const recentVoted = students
    .filter((s) => s.status_voted && s.voted_at)
    .sort((a, b) => new Date(b.voted_at!).getTime() - new Date(a.voted_at!).getTime())
    .slice(0, 8);

  const getStatusText = () => {
    switch (settings.status) {
      case 'ACTIVE':
        return { text: 'Sedang Berlangsung', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'CLOSED':
        return { text: 'Telah Ditutup', color: 'text-rose-700 bg-rose-50 border-rose-200' };
      case 'NOT_STARTED':
      default:
        return { text: 'Belum Dibuka', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    }
  };

  const statusInfo = getStatusText();

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              {settings.school_name}
            </span>
            <span className="text-slate-300">·</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Dashboard Pemilihan Ketua OSIS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            DIGIVOS7 mengawasi proses pemungutan suara secara real-time, transparan, dan terlindungi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateMenu('election_status')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Kelola Status
          </button>
          <button
            onClick={onOpenDisplayMode}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-all flex items-center gap-1.5"
          >
            <span>Buka Display PID</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Main Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pemilih */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Pemilih</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {totalVoters}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Daftar Pemilih Tetap (DPT)
          </div>
        </div>

        {/* Sudah Memilih */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Sudah Memilih</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 font-mono">
            {votedCount}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">
            Suara tersimpan aman di database
          </div>
        </div>

        {/* Belum Memilih */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Belum Memilih</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600 font-mono">
            {unvotedCount}
          </div>
          <div className="text-[11px] text-amber-700 mt-1 font-medium">
            Siswa menunggu giliran bilik
          </div>
        </div>

        {/* Partisipasi */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tingkat Partisipasi</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-indigo-600 font-mono">
            {participationRate}%
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${participationRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Activity & Device Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Aktivitas Terbaru (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">
                Aktivitas Pemungutan Suara Real-Time
              </h2>
            </div>
            <button
              onClick={() => onNavigateMenu('realtime_activity')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Lihat Semua →
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {recentVoted.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Belum ada aktivitas suara yang masuk.
              </div>
            ) : (
              recentVoted.map((voter) => {
                const timeStr = voter.voted_at
                  ? new Date(voter.voted_at).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })
                  : '-';
                return (
                  <div
                    key={voter.student_id}
                    className="py-3 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-[11px]">
                        {voter.kelas}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block">
                          {voter.nama}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {voter.device_id || 'Bilik Suara'} · ID: {voter.student_id}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Selesai Memilih</span>
                      </span>
                      <span className="block font-mono text-[10px] text-slate-400 mt-0.5">
                        {timeStr} WIB
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 3 Laptop Voting Devices (1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Status 3 Perangkat Bilik
                </h2>
              </div>
              <button
                onClick={() => onNavigateMenu('device_status')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Detail
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                      <Laptop className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">
                        {device.name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {device.location}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Aktif</span>
                    </span>
                    <span className="block font-mono text-[10px] text-slate-400">
                      {device.votes_processed} suara
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 bg-blue-50/50 p-3 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-1">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Prinsip Rahasia Suara</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Panitia hanya memantau data kehadiran pemilih. Pilihan figur kandidat terenkripsi secara anonim dan terpisah dari profil siswa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
