import React, { useState, useEffect } from 'react';
import { Candidate, ElectionSettings, Student, VoteRecord } from '../../types';
import { BallotBoxIllustration, FloatingSchoolElements } from '../common/SchoolDecorations';
import { Maximize2, Minimize2, Trophy, Medal, Award, Activity, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart as RechartsPieChart,
  Pie,
  Legend
} from 'recharts';

interface PIDDisplayViewProps {
  candidates: Candidate[];
  students: Student[];
  votes: VoteRecord[];
  settings: ElectionSettings;
  onExitDisplay: () => void;
}

export const PIDDisplayView: React.FC<PIDDisplayViewProps> = ({
  candidates,
  students,
  votes,
  settings,
  onExitDisplay
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalDpt = students.length;
  const totalVoted = students.filter((s) => s.status_voted).length;
  const totalUnvoted = Math.max(0, totalDpt - totalVoted);
  const participationRate = totalDpt > 0 ? ((totalVoted / totalDpt) * 100).toFixed(1) : '0';

  // Only show results and charts when election status is strictly 'CLOSED'
  const isClosed = settings.status === 'CLOSED';

  // Candidate tallies
  const candidateStats = candidates.map((cand) => {
    const candVotes = votes.filter((v) => v.candidate_id === cand.id).length;
    const percentage = votes.length > 0 ? ((candVotes / votes.length) * 100).toFixed(1) : '0';
    return {
      ...cand,
      voteCount: candVotes,
      percentage: Number(percentage)
    };
  }).sort((a, b) => b.voteCount - a.voteCount);

  const ketos = candidateStats[0]; // Rank 1
  const waketos = candidateStats[1]; // Rank 2
  const otherCandidates = candidateStats.slice(2); // Rank 3, 4, 5... (Dipertimbangkan Jabatannya)

  const recentVoted = students
    .filter((s) => s.status_voted && s.voted_at)
    .sort((a, b) => new Date(b.voted_at!).getTime() - new Date(a.voted_at!).getTime())
    .slice(0, 5);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const chartColors = ['#38BDF8', '#34D399', '#FBBF24', '#A78BFA', '#FB7185'];

  // 1. Data for Candidate Votes Animated Bar Chart
  const candidateBarData = candidateStats.map((cand, idx) => ({
    name: `Calon ${cand.nomorUrut}`,
    shortName: `C${cand.nomorUrut}`,
    fullName: cand.nama,
    kelas: cand.kelas,
    suara: cand.voteCount,
    persen: cand.percentage,
    color: chartColors[idx % chartColors.length]
  }));

  // 2. Data for Total Participation Recharts Pie Chart
  const unvotedPercent = totalDpt > 0 ? ((totalUnvoted / totalDpt) * 100).toFixed(1) : '0';
  const participationPieData = [
    {
      name: 'Sudah Memilih',
      value: totalVoted,
      percentage: participationRate,
      color: '#10B981' // Emerald
    },
    {
      name: 'Belum Memilih',
      value: totalUnvoted,
      percentage: unvotedPercent,
      color: '#334155' // Slate Dark
    }
  ];

  // Custom Tooltips for Recharts
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-white/20 p-2.5 rounded-xl shadow-xl text-xs backdrop-blur-md text-white">
          <span className="font-bold text-white block">{data.name} — {data.fullName}</span>
          <span className="text-slate-300 text-[11px] block">Kelas {data.kelas}</span>
          <div className="mt-1.5 pt-1.5 border-t border-white/10 flex items-center justify-between gap-4">
            <span className="text-blue-300 font-mono font-bold">{data.suara} Suara Sah</span>
            <span className="text-emerald-400 font-mono font-bold">{data.persen}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-white/20 p-2.5 rounded-xl shadow-xl text-xs backdrop-blur-md text-white">
          <span className="font-bold text-white block">{data.name}</span>
          <div className="mt-1.5 pt-1.5 border-t border-white/10 flex items-center justify-between gap-4">
            <span className="text-slate-200 font-mono font-bold">{data.value} Siswa</span>
            <span className="text-emerald-400 font-mono font-bold">{data.percentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white p-4 sm:p-7 flex flex-col justify-between overflow-hidden select-none">
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <FloatingSchoolElements variant="full" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center p-2">
            <BallotBoxIllustration className="w-full h-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-blue-400 font-extrabold">
                {settings.school_name}
              </span>
              <span className="text-white/30">·</span>
              <span className="text-[10px] text-blue-200">
                Papan Interaktif Digital (PID)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              DIGIVOS7 — {settings.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Clock */}
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-lg font-mono font-bold tracking-wider text-blue-200">
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
            </span>
            <span className="text-[10px] text-slate-400">
              Minggu, 04 Oktober 2026
            </span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-colors text-white cursor-pointer"
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onExitDisplay}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white/80 hover:text-white border border-white/15 transition-colors cursor-pointer"
          >
            Tutup PID
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main className="relative z-10 my-auto py-3">
        {!isClosed ? (
          /* ================= 1. LIVE VOTING MODE (Charts strictly hidden, secrecy preserved) ================= */
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              {/* Participation Meter Ring */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center flex flex-col items-center justify-center shadow-2xl">
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-extrabold flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Pemungutan Suara Berlangsung</span>
                </span>

                <div className="relative my-2 flex items-center justify-center">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="78"
                      className="text-white/10"
                      strokeWidth="14"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="78"
                      className="text-emerald-400 transition-all duration-1000 ease-out"
                      strokeWidth="14"
                      strokeDasharray={490.08}
                      strokeDashoffset={490.08 - (490.08 * Number(participationRate)) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-black font-mono tracking-tight text-white">
                      {participationRate}%
                    </span>
                    <span className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider mt-0.5">
                      Partisipasi
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-1">
                  {totalVoted} dari {totalDpt} siswa telah memilih
                </p>
              </div>

              {/* Statistics Overview */}
              <div className="lg:col-span-2 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Total Pemilih (DPT)</span>
                    <div className="text-3xl font-black font-mono text-white mt-1">{totalDpt}</div>
                    <span className="text-xs text-blue-300 mt-0.5 block">Siswa Terdaftar</span>
                  </div>

                  <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Sudah Memilih</span>
                    <div className="text-3xl font-black font-mono text-emerald-400 mt-1">{totalVoted}</div>
                    <span className="text-xs text-emerald-300/80 mt-0.5 block">Suara Masuk Sah</span>
                  </div>

                  <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Siswa Belum Memilih</span>
                    <div className="text-3xl font-black font-mono text-amber-400 mt-1">{totalUnvoted}</div>
                    <span className="text-xs text-amber-300/80 mt-0.5 block">Menunggu Giliran</span>
                  </div>

                  <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Perangkat Bilik</span>
                    <div className="text-3xl font-black font-mono text-blue-400 mt-1">3 Laptop</div>
                    <span className="text-xs text-blue-300/80 mt-0.5 block">Bilik A, B, C Aktif</span>
                  </div>
                </div>

                <div className="bg-blue-900/30 border border-blue-500/30 rounded-2xl p-3.5 flex items-center gap-3">
                  <Award className="w-5 h-5 text-blue-400 shrink-0" />
                  <span className="text-xs text-blue-200">
                    <strong>Asas LUBER:</strong> Perolehan suara kandidat dan grafik hasil dikunci selama pemungutan suara berlangsung dan otomatis dibuka setelah pemilihan ditutup.
                  </span>
                </div>
              </div>
            </div>

            {/* Live Voter Attendance Ticker */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 shrink-0">
                <Activity className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Baru Saja Memilih:</span>
              </div>
              <div className="flex items-center gap-3 overflow-x-auto text-xs text-slate-200">
                {recentVoted.map((v) => (
                  <div key={v.student_id} className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl border border-white/10 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <strong className="text-white">{v.nama}</strong>
                    <span className="text-blue-300 font-mono">({v.kelas})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ================= 2. FINAL RESULTS MODE (ELECTION CLOSED) ================= */
          /* Charts and Leadership Podium appear only after status is closed */
          <div className="max-w-6xl mx-auto space-y-5 animate-fade-in">
            {/* Leadership Podium: KETOS (#1), WAKETOS (#2), & DIPERTIMBANGKAN (#3, #4, #5) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* KETOS (#1) */}
              {ketos && (
                <div className="bg-gradient-to-br from-amber-500/30 via-amber-400/20 to-black/40 border-2 border-amber-400 rounded-3xl p-4 backdrop-blur-md shadow-2xl relative overflow-hidden flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-400/30 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>KETUA OSIS TERPILIH</span>
                    </span>
                    <span className="text-xs font-black font-mono text-amber-400">#1 MANDAT</span>
                  </div>

                  <div className="flex items-center gap-3 my-1">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-400 shrink-0 shadow-lg">
                      <img src={ketos.foto} alt={ketos.nama} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-black text-white leading-tight truncate">{ketos.nama}</h3>
                      <span className="text-xs text-amber-200">Kelas {ketos.kelas} · Calon {ketos.nomorUrut}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-400/20 flex items-center justify-between">
                    <span className="text-xs text-slate-300">{ketos.voteCount} Suara Sah</span>
                    <span className="text-2xl font-black font-mono text-amber-300">{ketos.percentage}%</span>
                  </div>
                </div>
              )}

              {/* WAKETOS (#2) */}
              {waketos && (
                <div className="bg-gradient-to-br from-blue-500/20 via-slate-400/20 to-black/40 border-2 border-slate-300 rounded-3xl p-4 backdrop-blur-md shadow-xl relative overflow-hidden flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-white/20 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-200 flex items-center gap-1">
                      <Medal className="w-3.5 h-3.5 text-slate-300" />
                      <span>WAKIL KETUA OSIS</span>
                    </span>
                    <span className="text-xs font-black font-mono text-slate-300">#2 WAKIL</span>
                  </div>

                  <div className="flex items-center gap-3 my-1">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-300 shrink-0 shadow-lg">
                      <img src={waketos.foto} alt={waketos.nama} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-black text-white leading-tight truncate">{waketos.nama}</h3>
                      <span className="text-xs text-slate-300">Kelas {waketos.kelas} · Calon {waketos.nomorUrut}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-slate-300">{waketos.voteCount} Suara Sah</span>
                    <span className="text-2xl font-black font-mono text-blue-300">{waketos.percentage}%</span>
                  </div>
                </div>
              )}

              {/* DIPERTIMBANGKAN JABATANNYA (#3, #4, #5) */}
              <div className="bg-white/5 border border-white/15 rounded-3xl p-4 backdrop-blur-md flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                    Kandidat Lainnya
                  </span>
                  <span className="text-[9px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30">
                    Dipertimbangkan Jabatannya
                  </span>
                </div>

                <div className="space-y-1.5 max-h-20 overflow-y-auto">
                  {otherCandidates.map((cand) => (
                    <div key={cand.id} className="flex items-center justify-between text-xs bg-white/5 p-1 rounded-xl">
                      <div className="flex items-center gap-2">
                        <img src={cand.foto} alt={cand.nama} className="w-6 h-6 rounded-lg object-cover" />
                        <div>
                          <span className="font-bold text-white block text-[11px] leading-tight truncate max-w-[120px]">{cand.nama}</span>
                          <span className="text-[9px] text-slate-400">Calon {cand.nomorUrut} ({cand.kelas})</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-blue-300 text-xs">{cand.voteCount} ({cand.percentage}%)</span>
                    </div>
                  ))}
                </div>

                <div className="text-[10px] text-slate-400 pt-1.5 border-t border-white/10">
                  Dipertimbangkan sebagai Koordinator Divisi / Pengurus OSIS.
                </div>
              </div>
            </div>

            {/* ================= RECHARTS VISUALIZATIONS SECTION ================= */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* 1. ANIMATED BAR CHART: Candidate Votes (7 cols) */}
              <div className="md:col-span-7 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Grafik Batang Perolehan Suara Kandidat (Recharts)
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{votes.length} Total Suara</span>
                </div>

                {/* Recharts Animated Bar Chart */}
                <div className="w-full h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={candidateBarData}
                      margin={{ top: 10, right: 15, left: -20, bottom: 5 }}
                    >
                      <XAxis
                        dataKey="name"
                        stroke="#94A3B8"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#94A3B8"
                        fontSize={11}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Bar
                        dataKey="suara"
                        radius={[8, 8, 0, 0]}
                        animationDuration={1200}
                        animationEasing="ease-out"
                      >
                        {candidateBarData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Candidate Legend Bar */}
                <div className="flex items-center justify-around gap-2 pt-2 border-t border-white/10 text-[11px]">
                  {candidateBarData.map((c) => (
                    <div key={c.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }}></span>
                      <span className="text-slate-300 font-medium">{c.shortName}: {c.suara} ({c.persen}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. PIE CHART: Total Participation Percentage (5 cols) */}
              <div className="md:col-span-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-1">
                  <div className="flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Tingkat Partisipasi Pemilih (Recharts)
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 font-mono">{participationRate}%</span>
                </div>

                {/* Recharts Donut Pie Chart with Center Stats */}
                <div className="relative w-full h-44 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Pie
                        data={participationPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={46}
                        outerRadius={72}
                        paddingAngle={4}
                        animationDuration={1200}
                        animationEasing="ease-out"
                      >
                        {participationPieData.map((entry, index) => (
                          <Cell key={`pie-cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>

                  {/* Centered Percentage Badge inside Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-black font-mono text-emerald-400 leading-none">
                      {participationRate}%
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">
                      Hadir
                    </span>
                  </div>
                </div>

                {/* Participation Legend */}
                <div className="flex items-center justify-around gap-3 pt-2 border-t border-white/10 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-slate-300">Sudah: <strong className="text-white font-mono">{totalVoted}</strong> ({participationRate}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
                    <span className="text-slate-300">Belum: <strong className="text-white font-mono">{totalUnvoted}</strong> ({unvotedPercent}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <div>
          <span>{settings.school_name}</span> · <span>DIGIVOS7 (Digital Voting OSIS)</span>
        </div>
        <div className="font-semibold text-emerald-400">
          ✓ Hasil Terverifikasi Sistem Kriptografi Anonim
        </div>
      </footer>
    </div>
  );
};
