import React, { useState, useMemo } from 'react';
import { Student } from '../../types';
import { Search, Filter, CheckCircle2, Clock, XCircle, ArrowUpDown, Download } from 'lucide-react';

interface LiveMonitoringViewProps {
  students: Student[];
}

export const LiveMonitoringView: React.FC<LiveMonitoringViewProps> = ({ students }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VOTED' | 'NOT_VOTED'>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Extract distinct classes
  const classes = useMemo(() => {
    const set = new Set(students.map((s) => s.kelas));
    return Array.from(set).sort();
  }, [students]);

  // Filtered and sorted students
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = s.nama.toLowerCase().includes(q);
          const matchId = s.student_id.toLowerCase().includes(q);
          if (!matchName && !matchId) return false;
        }

        // Class filter
        if (selectedClass !== 'ALL' && s.kelas !== selectedClass) {
          return false;
        }

        // Status filter
        if (statusFilter === 'VOTED' && !s.status_voted) return false;
        if (statusFilter === 'NOT_VOTED' && s.status_voted) return false;

        return true;
      })
      .sort((a, b) => {
        // Sort by voted_at first if both voted
        if (a.voted_at && b.voted_at) {
          const tA = new Date(a.voted_at).getTime();
          const tB = new Date(b.voted_at).getTime();
          return sortOrder === 'desc' ? tB - tA : tA - tB;
        }
        // If one is voted and other is not, put voted first in desc
        if (a.status_voted && !b.status_voted) return sortOrder === 'desc' ? -1 : 1;
        if (!a.status_voted && b.status_voted) return sortOrder === 'desc' ? 1 : -1;
        // Default alphabetical
        return a.nama.localeCompare(b.nama);
      });
  }, [students, searchQuery, selectedClass, statusFilter, sortOrder]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const exportCsvAttendance = () => {
    const headers = ['student_id', 'nama', 'kelas', 'status_voted', 'voted_at', 'device_id'];
    const rows = filteredStudents.map((s) => [
      s.student_id,
      `"${s.nama.replace(/"/g, '""')}"`,
      s.kelas,
      s.status_voted ? 'Sudah' : 'Belum',
      s.voted_at || '-',
      s.device_id || '-'
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kehadiran_pemilih_digivos7_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Live Presence Feed
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Monitoring Pemilih Real-Time
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Daftar kehadiran siswa saat menggunakan hak suara pada bilik laptop sekolah.
          </p>
        </div>

        <button
          onClick={exportCsvAttendance}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Data Kehadiran (.CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari berdasarkan nama atau ID pemilih..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Filter Class */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Kelas ({students.length})</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  Kelas {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'ALL' | 'VOTED' | 'NOT_VOTED');
              setCurrentPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">Semua Status</option>
            <option value="VOTED">✓ Sudah Memilih</option>
            <option value="NOT_VOTED">Belum Memilih</option>
          </select>

          {/* Sort order toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Ubah urutan waktu"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">ID Siswa</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Status Pemilihan</th>
                <th className="py-3 px-4">Waktu Voting</th>
                <th className="py-3 px-4">Perangkat Bilik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada data pemilih yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s) => {
                  const timeFormatted = s.voted_at
                    ? new Date(s.voted_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })
                    : '-';

                  return (
                    <tr
                      key={s.student_id}
                      className="hover:bg-blue-50/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-slate-500 font-medium">
                        {s.student_id}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {s.nama}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {s.kelas}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {s.status_voted ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-[11px] border border-emerald-100">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Sudah Memilih</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full text-[11px] border border-slate-200">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Belum</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {timeFormatted !== '-' ? `${timeFormatted} WIB` : '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {s.device_id || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Menampilkan{' '}
            <strong className="text-slate-800">
              {filteredStudents.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </strong>{' '}
            -{' '}
            <strong className="text-slate-800">
              {Math.min(currentPage * pageSize, filteredStudents.length)}
            </strong>{' '}
            dari <strong className="text-slate-800">{filteredStudents.length}</strong> siswa
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              Sebelumnya
            </button>
            <span className="px-2 font-mono font-semibold text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
