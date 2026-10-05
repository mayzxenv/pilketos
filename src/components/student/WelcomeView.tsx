import React, { useEffect } from 'react';
import { Candidate, ElectionSettings, Student } from '../../types';
import { FloatingSchoolElements } from '../common/SchoolDecorations';
import { HERO_IMAGE } from '../../data/initialData';
import { CheckCircle2, ArrowRight, Award, UserCheck, ShieldAlert, LogOut, Sparkles } from 'lucide-react';
import { playWelcomeSound } from '../../services/sound';

interface WelcomeViewProps {
  student: Student;
  settings: ElectionSettings;
  candidates: Candidate[];
  onStartVoting: () => void;
  onLogout: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  student,
  settings,
  candidates,
  onStartVoting,
  onLogout
}) => {
  useEffect(() => {
    playWelcomeSound();
  }, []);

  return (
    <div className="relative h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-hidden p-3 sm:p-5 lg:p-6 flex items-center justify-center bg-gradient-to-b from-blue-50/50 via-slate-50 to-indigo-50/30">
      <FloatingSchoolElements variant="minimal" />

      {/* Single-Screen Horizontal Card (Menyamping Tanpa Scroll) */}
      <div className="relative z-10 w-full max-w-6xl bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 shadow-xl shadow-blue-900/5 border border-blue-100 flex flex-col justify-between max-h-[95vh]">
        {/* Top Mini Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-0.5 rounded-full">
              {settings.school_name}
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{settings.stage === 'PUTARAN_2_OPSIONAL' ? 'Putaran 2 (Tie-Breaker)' : 'Tahap Utama (Putaran 1)'}</span>
            </span>
          </div>

          <button
            onClick={onLogout}
            className="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Bukan kamu? Keluar</span>
          </button>
        </div>

        {/* Horizontal 2-Column Split: KIRI Identitas & BANNER, KANAN TATA CARA MENYAMPING */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 my-3 items-center">
          {/* Kolom Kiri: Sambutan & Hero Mini (5 cols) */}
          <div className="md:col-span-5 flex flex-col justify-center space-y-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Bilik Suara Digital Siswa</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight mt-0.5">
                Halo, {student.nama}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Siswa Kelas <strong className="text-blue-900 font-bold">{student.kelas}</strong> · Hak pilihmu aktif dan sah digunakan.
              </p>
            </div>

            {/* Mini School Banner */}
            <div className="relative rounded-2xl overflow-hidden aspect-[16/8] border border-slate-100 shadow-sm bg-slate-100">
              <img
                src={HERO_IMAGE}
                alt="Sekolah SIVOT"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-3 text-white">
                <span className="text-[10px] uppercase font-bold text-blue-300">
                  {settings.subtitle}
                </span>
                <span className="text-sm font-bold">
                  {settings.title}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-500">Kandidat Tersedia:</span>
              <span className="font-bold text-blue-900 font-mono">{candidates.length} Calon Ketua</span>
            </div>
          </div>

          {/* Kolom Kanan: TATA CARA MENYAMPING (HORIZONTAL) (7 cols) */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                Tata Cara Memilih (3 Langkah Cepat)
              </span>

              {/* 3 Step Cards Side-by-Side (Menyamping) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Langkah 1 */}
                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 flex flex-col justify-between">
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center mb-2">
                      1
                    </div>
                    <h3 className="font-bold text-xs text-slate-900">
                      Pilih Kandidat
                    </h3>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                      Baca visi & misi, lalu ketuk calon yang paling kamu percaya.
                    </p>
                  </div>
                </div>

                {/* Langkah 2 */}
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex flex-col justify-between">
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-mono font-bold text-xs flex items-center justify-center mb-2">
                      2
                    </div>
                    <h3 className="font-bold text-xs text-slate-900">
                      Konfirmasi Suara
                    </h3>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                      Pastikan fotonya sesuai sebelum menekan tombol konfirmasi.
                    </p>
                  </div>
                </div>

                {/* Langkah 3 */}
                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col justify-between">
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center mb-2">
                      3
                    </div>
                    <h3 className="font-bold text-xs text-slate-900">
                      Selesai & Sah
                    </h3>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                      Suaramu tersimpan secara rahasia dan sesi otomatis selesai.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Secret Ballot Assurance */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Asas LUBER:</strong> Pilihanmu sepenuhnya rahasia dan aman. Satu siswa berhak atas 1 suara.
              </span>
            </div>

            {/* Action CTA Button */}
            <div className="pt-1 flex items-center justify-between gap-4">
              <span className="text-[11px] text-slate-400">
                Waktu voting: ~1 menit per siswa
              </span>
              <button
                onClick={onStartVoting}
                className="py-3 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-blue-600/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Mulai Memilih Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
