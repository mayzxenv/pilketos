import React, { useMemo } from 'react';
import { Student } from '../../types';
import { PieChart, Users, CheckCircle2, Clock } from 'lucide-react';

interface ParticipationViewProps {
  students: Student[];
}

export const ParticipationView: React.FC<ParticipationViewProps> = ({ students }) => {
  const classBreakdown = useMemo(() => {
    const map = new Map<string, { total: number; voted: number }>();
    students.forEach((s) => {
      const entry = map.get(s.kelas) || { total: 0, voted: 0 };
      entry.total++;
      if (s.status_voted) entry.voted++;
      map.set(s.kelas, entry);
    });

    return Array.from(map.entries())
      .map(([kelas, data]) => {
        const percent = data.total > 0 ? (data.voted / data.total) * 100 : 0;
        return {
          kelas,
          total: data.total,
          voted: data.voted,
          unvoted: data.total - data.voted,
          percent: Number(percent.toFixed(1))
        };
      })
      .sort((a, b) => a.kelas.localeCompare(b.kelas));
  }, [students]);

  const overallTotal = students.length;
  const overallVoted = students.filter((s) => s.status_voted).length;
  const overallPercent = overallTotal > 0 ? ((overallVoted / overallTotal) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Statistik Partisipasi Pemilih
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Partisipasi Suara per Kelas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pantau kehadiran pemilihan siswa tingkat kelas 7, 8, dan 9 untuk mengoptimalkan bilik suara.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 text-right">
          <span className="text-[11px] font-bold text-blue-700 block uppercase tracking-wider">
            Partisipasi Global
          </span>
          <span className="text-2xl font-black font-mono text-blue-900">
            {overallPercent}%
          </span>
          <span className="text-[10px] text-slate-500 block">
            {overallVoted} dari {overallTotal} siswa
          </span>
        </div>
      </div>

      {/* Class Turnout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classBreakdown.map((item) => {
          const isComplete = item.voted === item.total;
          return (
            <div
              key={item.kelas}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 font-extrabold text-slate-800 flex items-center justify-center text-sm">
                    {item.kelas}
                  </div>
                  {isComplete ? (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>100% Lengkap</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono font-bold text-blue-700">
                      {item.percent}%
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                  <div className="flex justify-between">
                    <span>Sudah Memilih:</span>
                    <strong className="text-emerald-600">{item.voted} siswa</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Belum Memilih:</span>
                    <strong className="text-amber-600">{item.unvoted} siswa</strong>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Total DPT Kelas:</span>
                    <span>{item.total} siswa</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    isComplete ? 'bg-emerald-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${item.percent}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
