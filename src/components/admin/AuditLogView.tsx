import React, { useState } from 'react';
import { AuditLog } from '../../types';
import { ShieldCheck, ShieldAlert, Filter, Clock, Search, FileDown } from 'lucide-react';

interface AuditLogViewProps {
  logs: AuditLog[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'info' | 'warning' | 'critical'>('ALL');

  const filteredLogs = logs.filter((log) => {
    if (severityFilter !== 'ALL' && log.severity !== severityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.actor.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportLogs = () => {
    const jsonStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_logs_sivot_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Keamanan & Integritas Sistem
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Audit Trail & Log Aktivitas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Seluruh rekam jejak sistem tersimpan secara kronologis untuk audit transparansi.
          </p>
        </div>

        <button
          onClick={exportLogs}
          className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
        >
          <FileDown className="w-4 h-4" />
          <span>Export Log (.JSON)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari dalam log audit (tindakan, detail, aktor)..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as 'ALL' | 'info' | 'warning' | 'critical')}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">Semua Tingkat</option>
            <option value="info">Informasi (Info)</option>
            <option value="warning">Peringatan (Warning)</option>
            <option value="critical">Kritis (Critical)</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Tindakan Sistem</th>
                <th className="py-3 px-4">Aktor / Sumber</th>
                <th className="py-3 px-4">Detail Aktivitas</th>
                <th className="py-3 px-4">Tingkat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-sans text-xs">
                    Tidak ada catatan audit yang cocok.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const time = new Date(log.timestamp).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });

                  return (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {time} WIB
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {log.action}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-sans font-medium">
                        {log.actor}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-sans">
                        {log.details}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        {log.severity === 'critical' ? (
                          <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold">
                            Kritis
                          </span>
                        ) : log.severity === 'warning' ? (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">
                            Peringatan
                          </span>
                        ) : (
                          <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            Info
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
