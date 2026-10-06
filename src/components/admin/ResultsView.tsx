import React, { useState } from 'react';
import { Candidate, ElectionSettings, Student, VoteRecord } from '../../types';
import { getVoteWeight, getVoterWeight } from '../../services/voteWeights';
import { BarChart3, Award, Users, ShieldAlert, Eye, EyeOff, CheckCircle2, Trophy, Medal, PieChart, Sparkles, AlertTriangle } from 'lucide-react';

interface ResultsViewProps {
  candidates: Candidate[];
  students: Student[];
  votes: VoteRecord[];
  settings: ElectionSettings;
  onOpenDisplayMode: () => void;
  onActivateStage2?: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  candidates,
  students,
  votes,
  settings,
  onOpenDisplayMode,
  onActivateStage2
}) => {
  const [adminBypassPreview, setAdminBypassPreview] = useState(false);

  const totalVoters = students.reduce((total, student) => total + getVoterWeight(student), 0);
  const totalVotesCast = votes.reduce((total, vote) => total + getVoteWeight(vote), 0);
  const participationRate = totalVoters > 0 ? ((totalVotesCast / totalVoters) * 100).toFixed(1) : '0';

  // Calculate vote tally for each candidate
  const candidateStats = candidates.map((cand) => {
    const candVotes = votes.filter((v) => v.candidate_id === cand.id).reduce((total, vote) => total + getVoteWeight(vote), 0);
    const percentage = totalVotesCast > 0 ? ((candVotes / totalVotesCast) * 100).toFixed(1) : '0';
    return {
      ...cand,
      voteCount: candVotes,
      percentage: Number(percentage)
    };
  }).sort((a, b) => b.voteCount - a.voteCount);

  const isElectionClosed = settings.status === 'CLOSED';
  const canViewResults = isElectionClosed || adminBypassPreview;

  // Designate roles based on rank
  const ketos = candidateStats[0]; // Rank 1
  const waketos = candidateStats[1]; // Rank 2
  const otherCandidates = candidateStats.slice(2); // Rank 3, 4, 5... (Dipertimbangkan Jabatannya)

  // Tie detection check (persamaan suara)
  const isTie = ketos && waketos && ketos.voteCount === waketos.voteCount && ketos.voteCount > 0;

  const colors = [
    { bar: 'bg-blue-600', text: 'text-blue-600', hex: '#2563EB', light: 'bg-blue-50' },
    { bar: 'bg-emerald-600', text: 'text-emerald-600', hex: '#10B981', light: 'bg-emerald-50' },
    { bar: 'bg-amber-500', text: 'text-amber-500', hex: '#F59E0B', light: 'bg-amber-50' },
    { bar: 'bg-purple-600', text: 'text-purple-600', hex: '#8B5CF6', light: 'bg-purple-50' },
    { bar: 'bg-rose-500', text: 'text-rose-500', hex: '#F43F5E', light: 'bg-rose-50' }
  ];

  // SVG Pie Chart math calculation
  let cumulativeAngle = 0;
  const pieSlices = candidateStats.map((cand, idx) => {
    const sliceAngle = (cand.percentage / 100) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + sliceAngle;
    cumulativeAngle += sliceAngle;

    // Convert polar to cartesian coordinates
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    const x1 = 100 + 80 * Math.cos(startRad);
    const y1 = 100 + 80 * Math.sin(startRad);
    const x2 = 100 + 80 * Math.cos(endRad);
    const y2 = 100 + 80 * Math.sin(endRad);
    const largeArc = sliceAngle > 180 ? 1 : 0;
    const pathData = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return {
      ...cand,
      color: colors[idx % colors.length],
      pathData
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              {settings.stage === 'PUTARAN_2_OPSIONAL' ? 'Putaran 2 (Tie-Breaker)' : 'Tahap Utama (Putaran 1)'}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Rekapitulasi Resmi
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Hasil & Penetapan Pengurus OSIS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Penetapan otomatis: Suara #1 Ketua OSIS, Suara #2 Wakil Ketua, dan Kandidat lainnya Dipertimbangkan Jabatannya.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isElectionClosed && (
            <button
              onClick={() => setAdminBypassPreview(!adminBypassPreview)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
            >
              {adminBypassPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{adminBypassPreview ? 'Kunci Pratinjau' : 'Buka Pratinjau Panitia'}</span>
            </button>
          )}

          <button
            onClick={onOpenDisplayMode}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            Tampilkan di Layar Display PID
          </button>
        </div>
      </div>

      {/* Tie Breaker Option Alert if votes are equal */}
      {isTie && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-900 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <strong className="block font-bold">Terjadi Persamaan Suara (Tie) pada Peringkat #1!</strong>
              <span>Calon {ketos.nomorUrut} ({ketos.nama}) dan Calon {waketos.nomorUrut} ({waketos.nama}) sama-sama memperoleh {ketos.voteCount} suara.</span>
            </div>
          </div>
          {onActivateStage2 && (
            <button
              onClick={onActivateStage2}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-sm shrink-0"
            >
              Aktifkan Putaran 2 (Opsi Tie-Breaker)
            </button>
          )}
        </div>
      )}

      {/* Locked Overlay if Election is Still Active and Preview is not bypassed */}
      {!canViewResults ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900">
            Hasil Terkunci Selama Pemilihan Berlangsung
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Perolehan suara kandidat dikunci demi menjamin asas LUBER. Tutup pemilihan di menu Status atau buka pratinjau panitia.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setAdminBypassPreview(true)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span>Buka Pratinjau Terbatas Panitia</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Executive Leadership Podium: KETOS, WAKETOS & DIPERTIMBANGKAN */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. KETUA OSIS TERPILIH (#1) */}
            {ketos && (
              <div className="bg-gradient-to-br from-amber-500/10 via-amber-100/40 to-white border-2 border-amber-400 rounded-3xl p-5 shadow-md flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-bl-xl flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  <span>KETUA OSIS TERPILIH</span>
                </div>

                <div>
                  <div className="flex items-center gap-4 mb-4 mt-2">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-500 shadow-md shrink-0 bg-slate-100">
                      <img src={ketos.foto} alt={ketos.nama} className="w-full h-full object-contain" />
                      <span className="absolute bottom-1 left-1 bg-amber-500 text-slate-950 font-black font-mono text-[10px] px-1.5 py-0.5 rounded">
                        {ketos.nomorUrut}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                        Peringkat #1 (Suara Terbanyak)
                      </span>
                      <h3 className="text-lg font-black text-slate-900 leading-tight">
                        {ketos.nama}
                      </h3>
                      <span className="text-xs text-slate-600">
                        Kelas {ketos.kelas}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60 text-xs">
                    <span className="text-slate-500 block text-[11px]">Mandat Penetapan:</span>
                    <strong className="text-slate-900 font-semibold block">Ditetapkan Sebagai Ketua OSIS Periode {settings.academic_year}</strong>
                  </div>
                </div>

                <div className="pt-4 border-t border-amber-200 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Perolehan</span>
                    <span className="text-2xl font-black font-mono text-slate-900">{ketos.voteCount} Suara</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Persentase</span>
                    <span className="text-2xl font-black font-mono text-amber-700">{ketos.percentage}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. WAKIL KETUA OSIS TERPILIH (#2) */}
            {waketos && (
              <div className="bg-gradient-to-br from-slate-100 via-blue-50/50 to-white border-2 border-slate-300 rounded-3xl p-5 shadow-md flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-slate-700 text-white font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-bl-xl flex items-center gap-1">
                  <Medal className="w-3 h-3 text-slate-200" />
                  <span>WAKIL KETUA OSIS</span>
                </div>

                <div>
                  <div className="flex items-center gap-4 mb-4 mt-2">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-400 shadow-md shrink-0 bg-slate-100">
                      <img src={waketos.foto} alt={waketos.nama} className="w-full h-full object-contain" />
                      <span className="absolute bottom-1 left-1 bg-slate-700 text-white font-black font-mono text-[10px] px-1.5 py-0.5 rounded">
                        {waketos.nomorUrut}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                        Peringkat #2 (Suara Terbanyak Ke-2)
                      </span>
                      <h3 className="text-lg font-black text-slate-900 leading-tight">
                        {waketos.nama}
                      </h3>
                      <span className="text-xs text-slate-600">
                        Kelas {waketos.kelas}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/80 p-3 rounded-xl border border-slate-200 text-xs">
                    <span className="text-slate-500 block text-[11px]">Mandat Penetapan:</span>
                    <strong className="text-slate-900 font-semibold block">Ditetapkan Sebagai Wakil Ketua OSIS Periode {settings.academic_year}</strong>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Perolehan</span>
                    <span className="text-2xl font-black font-mono text-slate-900">{waketos.voteCount} Suara</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Persentase</span>
                    <span className="text-2xl font-black font-mono text-blue-700">{waketos.percentage}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. KANDIDAT DIPERTIMBANGKAN JABATANNYA (#3, #4, #5) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between md:col-span-2 lg:col-span-1">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Kandidat Lainnya
                  </span>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                    Dipertimbangkan Jabatannya
                  </span>
                </div>

                <div className="space-y-3">
                  {otherCandidates.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      Hanya terdapat 2 kandidat utama dalam pemilihan ini.
                    </p>
                  ) : (
                    otherCandidates.map((cand, idx) => (
                      <div key={cand.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-white">
                            <img src={cand.foto} alt={cand.nama} className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-slate-900 block leading-tight">
                              {cand.nama}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Calon {cand.nomorUrut} · Kelas {cand.kelas}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono font-bold text-xs text-slate-900 block">
                            {cand.voteCount} Suara
                          </span>
                          <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                            {cand.percentage}%
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-slate-600">
                Kandidat peringkat ke-3 dan seterusnya dipertimbangkan jabatannya sebagai <strong>Koordinator Divisi / Pengurus Harian OSIS</strong>.
              </div>
            </div>
          </div>

          {/* DUAL CHARTS: GRAFIK BATANG & GRAFIK PIE/LINGKARAN */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 1. GRAFIK BATANG (BAR CHART) - 7 cols */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Grafik Batang Perolehan Suara
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {totalVotesCast} Total Suara Masuk
                </span>
              </div>

              <div className="space-y-4 pt-2">
                {candidateStats.map((cand, idx) => {
                  const color = colors[idx % colors.length];
                  return (
                    <div key={cand.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-bold text-slate-800">
                          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-blue-900">
                            {cand.nomorUrut}
                          </span>
                          <span>{cand.nama}</span>
                          <span className="text-slate-400 font-normal">({cand.kelas})</span>
                        </div>
                        <div className="font-mono font-bold text-slate-900">
                          <span>{cand.voteCount} Suara</span>
                          <span className="text-slate-400 font-normal ml-1.5">({cand.percentage}%)</span>
                        </div>
                      </div>

                      <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                        <div
                          className={`${color.bar} h-full rounded-full transition-all duration-700 ease-out`}
                          style={{ width: `${Math.max(4, cand.percentage)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. GRAFIK PIE / LINGKARAN (PIE CHART) - 5 cols */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Grafik Lingkaran (Pie Chart)
                  </h3>
                </div>
                <span className="text-xs text-indigo-600 font-bold">
                  Distribusi Suara
                </span>
              </div>

              {/* SVG Pie Visualization */}
              <div className="flex items-center justify-center my-3">
                <svg viewBox="0 0 200 200" className="w-44 h-44 drop-shadow-sm">
                  {pieSlices.map((slice) => (
                    <path
                      key={slice.id}
                      d={slice.pathData}
                      fill={slice.color.hex}
                      className="transition-all hover:opacity-85 cursor-pointer"
                    >
                      <title>{`${slice.nama}: ${slice.voteCount} Suara (${slice.percentage}%)`}</title>
                    </path>
                  ))}
                  <circle cx="100" cy="100" r="42" fill="white" />
                  <text x="100" y="96" textAnchor="middle" className="text-[10px] font-bold fill-slate-400">
                    TOTAL
                  </text>
                  <text x="100" y="112" textAnchor="middle" className="text-xs font-black fill-slate-900 font-mono">
                    {totalVotesCast}
                  </text>
                </svg>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100">
                {candidateStats.map((cand, idx) => (
                  <div key={cand.id} className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: colors[idx % colors.length].hex }}
                    ></span>
                    <span className="truncate text-slate-700 text-[11px] font-medium">
                      {cand.nomorUrut}. {cand.nama}
                    </span>
                    <strong className="text-slate-900 font-mono text-[11px] ml-auto">
                      {cand.percentage}%
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
