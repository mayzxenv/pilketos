import React from 'react';
import { Candidate, ElectionSettings, Student, VoteRecord } from '../../types';
import { Printer, Download, Trophy, Medal } from 'lucide-react';

interface ReportsViewProps {
  candidates: Candidate[];
  students: Student[];
  votes: VoteRecord[];
  settings: ElectionSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  candidates,
  students,
  votes,
  settings
}) => {
  const totalDpt = students.length;
  const totalVotesCast = votes.length;
  const totalUnvoted = totalDpt - totalVotesCast;
  const participationRate = totalDpt > 0 ? ((totalVotesCast / totalDpt) * 100).toFixed(1) : '0';

  const candidateStats = candidates.map((cand) => {
    const candVotes = votes.filter((v) => v.candidate_id === cand.id).length;
    const percentage = totalVotesCast > 0 ? ((candVotes / totalVotesCast) * 100).toFixed(1) : '0';
    return {
      ...cand,
      voteCount: candVotes,
      percentage: Number(percentage)
    };
  }).sort((a, b) => b.voteCount - a.voteCount);

  const ketos = candidateStats[0];
  const waketos = candidateStats[1];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const lines = [
      `BERITA ACARA REKAPITULASI HASIL PEMILIHAN KETUA OSIS`,
      `SEKOLAH: ${settings.school_name}`,
      `AGENDA: ${settings.title}`,
      `TAHAPAN: ${settings.stage === 'PUTARAN_2_OPSIONAL' ? 'PUTARAN 2 (TIE-BREAKER)' : 'TAHAP UTAMA (PUTARAN 1)'}`,
      `PERIODE: ${settings.subtitle} / ${settings.academic_year}`,
      `TANGGAL CETAK: ${new Date().toLocaleDateString('id-ID')}`,
      ``,
      `STATISTIK SUARA`,
      `Total DPT: ${totalDpt}`,
      `Total Suara Masuk: ${totalVotesCast}`,
      `Tidak Memilih: ${totalUnvoted}`,
      `Persentase Partisipasi: ${participationRate}%`,
      ``,
      `PEROLEHAN SUARA KANDIDAT`,
      `Nomor Urut,Nama Kandidat,Kelas,Jumlah Suara,Persentase,Status Penetapan`,
      ...candidateStats.map((c, i) => {
        const status = i === 0 ? 'KETUA OSIS TERPILIH' : i === 1 ? 'WAKIL KETUA OSIS' : 'DIPERTIMBANGKAN JABATANNYA';
        return `${c.nomorUrut},"${c.nama}",${c.kelas},${c.voteCount},${c.percentage}%,${status}`;
      })
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `berita_acara_sivot_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Dokumen Resmi Pemilihan
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Berita Acara Rekapitulasi Suara
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Penetapan resmi Ketua OSIS, Wakil Ketua OSIS, dan kandidat lainnya.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen</span>
          </button>
        </div>
      </div>

      {/* Official Paper Document Container */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
        {/* Kop Surat Sekolah */}
        <div className="text-center pb-6 border-b-2 border-slate-900 mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
            KEMENTERIAN PENDIDIKAN DAN KEBUDAYAAN
          </h2>
          <h3 className="text-xl sm:text-2xl font-black uppercase text-slate-950 mt-1">
            {settings.school_name}
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Komisi Pemilihan Umum OSIS Terpadu (SIVOT) · Tahun Pelajaran {settings.academic_year}
          </p>
        </div>

        {/* Title */}
        <div className="text-center my-6">
          <h4 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900">
            BERITA ACARA REKAPITULASI HASIL PEMILIHAN KETUA OSIS
          </h4>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Nomor: BA-OSIS/{new Date().getFullYear()}/0410-SIVOT · {settings.stage === 'PUTARAN_2_OPSIONAL' ? 'PUTARAN 2' : 'TAHAP UTAMA'}
          </p>
        </div>

        <div className="text-xs text-slate-700 leading-relaxed mb-6 space-y-2">
          <p>
            Pada hari ini, <strong>Minggu tanggal 04 Oktober 2026</strong>, telah dilaksanakan pemungutan dan penghitungan suara secara elektronik melalui sistem <strong>SIVOT (Sistem Informasi Voting Terpadu)</strong> di lingkungan {settings.school_name} dengan rincian sebagai berikut:
          </p>
        </div>

        {/* Participation Stats Table */}
        <div className="mb-6">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
            I. DATA PEMILIH DAN PENGGUNAAN HAK SUARA
          </h5>
          <table className="w-full text-xs text-left border border-slate-300">
            <tbody className="divide-y divide-slate-200">
              <tr className="bg-slate-50">
                <td className="py-2 px-3 font-semibold w-2/3">Jumlah Pemilih Terdaftar (DPT)</td>
                <td className="py-2 px-3 font-mono font-bold text-right">{totalDpt} Siswa</td>
              </tr>
              <tr>
                <td className="py-2 px-3">Jumlah Pengguna Hak Pilih (Suara Masuk)</td>
                <td className="py-2 px-3 font-mono font-bold text-right">{totalVotesCast} Suara</td>
              </tr>
              <tr className="bg-slate-50">
                <td className="py-2 px-3">Jumlah Pemilih yang Tidak Menggunakan Hak Suara</td>
                <td className="py-2 px-3 font-mono text-right">{totalUnvoted} Siswa</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-slate-900">Tingkat Partisipasi Pemilihan</td>
                <td className="py-2 px-3 font-mono font-black text-right text-blue-900">{participationRate}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Results Table with Roles: Ketos, Waketos, Dipertimbangkan */}
        <div className="mb-8">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
            II. RINCIAN PEROLEHAN SUARA & PENETAPAN PENGURUS
          </h5>
          <table className="w-full text-xs text-left border border-slate-300">
            <thead className="bg-slate-100 font-bold border-b border-slate-300">
              <tr>
                <th className="py-2 px-3">No</th>
                <th className="py-2 px-3">Nama Lengkap Kandidat</th>
                <th className="py-2 px-3">Kelas</th>
                <th className="py-2 px-3 text-right">Perolehan Suara</th>
                <th className="py-2 px-3 text-right">Persentase</th>
                <th className="py-2 px-3">Penetapan Jabatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {candidateStats.map((c, i) => {
                const isKetos = i === 0;
                const isWaketos = i === 1;
                return (
                  <tr key={c.id} className={isKetos ? 'bg-amber-50/60 font-semibold' : ''}>
                    <td className="py-2 px-3 font-mono font-bold">{c.nomorUrut}</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{c.nama}</td>
                    <td className="py-2 px-3">{c.kelas}</td>
                    <td className="py-2 px-3 font-mono font-bold text-right">{c.voteCount}</td>
                    <td className="py-2 px-3 font-mono font-bold text-right text-blue-900">{c.percentage}%</td>
                    <td className="py-2 px-3">
                      {isKetos ? (
                        <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                          Ketua OSIS Terpilih
                        </span>
                      ) : isWaketos ? (
                        <span className="font-bold text-slate-800 bg-slate-200 px-2 py-0.5 rounded text-[11px]">
                          Wakil Ketua OSIS
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[11px]">
                          Dipertimbangkan Jabatannya
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Formal Declaration */}
        {ketos && waketos && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 mb-8 leading-relaxed space-y-1">
            <p>
              1. Menetapkan <strong>{ketos.nama}</strong> (Kelas {ketos.kelas}) sebagai <strong>Ketua OSIS {settings.school_name}</strong> Masa Bakti {settings.subtitle}.
            </p>
            <p>
              2. Menetapkan <strong>{waketos.nama}</strong> (Kelas {waketos.kelas}) sebagai <strong>Wakil Ketua OSIS {settings.school_name}</strong> Masa Bakti {settings.subtitle}.
            </p>
            <p>
              3. Kandidat lainnya dipertimbangkan jabatannya dalam struktur kepengurusan harian OSIS sesuai dengan keahlian dan minat bakat.
            </p>
          </div>
        )}

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-6 text-center text-xs pt-8 border-t border-slate-200">
          <div>
            <span className="block text-slate-500">Ketua Panitia Pemilihan</span>
            <div className="h-16"></div>
            <span className="font-bold underline block text-slate-900">Fajar Kurniawan</span>
            <span className="text-[10px] text-slate-400">NISN. 008129381</span>
          </div>

          <div>
            <span className="block text-slate-500">Pembina OSIS</span>
            <div className="h-16"></div>
            <span className="font-bold underline block text-slate-900">Drs. Hendro Wibowo</span>
            <span className="text-[10px] text-slate-400">NIP. 19780512 200312 1 002</span>
          </div>

          <div>
            <span className="block text-slate-500">Kepala Sekolah</span>
            <div className="h-16"></div>
            <span className="font-bold underline block text-slate-900">Dr. Hj. Sri Wahyuni, M.Pd.</span>
            <span className="text-[10px] text-slate-400">NIP. 19690415 199403 2 001</span>
          </div>
        </div>
      </div>
    </div>
  );
};
