import React, { useEffect, useState } from 'react';
import { Candidate, Student, VoteSubmissionResponse } from '../../types';
import { fireSchoolConfetti, FloatingSchoolElements } from '../common/SchoolDecorations';
import { Check, ShieldCheck, Clock, UserCheck, ArrowRight } from 'lucide-react';
import { speakInstruction } from '../../services/sound';

interface SuccessViewProps {
  student: Student;
  chosenCandidate: Candidate;
  response: VoteSubmissionResponse;
  onFinishAndReset: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({
  student,
  response,
  onFinishAndReset
}) => {
  // Timer diubah menjadi 5 detik sesuai permintaan pengguna
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Fire festive celebration confetti
    fireSchoolConfetti();
    speakInstruction('Terima kasih telah memilih. Suara Anda berhasil disimpan.');

    // Auto-countdown timer 5 seconds to return to fresh login for the next student
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onFinishAndReset();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onFinishAndReset]);

  return (
    <div className="relative h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-hidden p-3 sm:p-5 flex items-center justify-center bg-gradient-to-b from-emerald-50/60 via-slate-50 to-blue-50/40">
      <FloatingSchoolElements variant="minimal" />

      <div className="relative z-10 max-w-md w-full">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 shadow-2xl shadow-emerald-900/10 border border-emerald-100 text-center">
          {/* Animated Big Checkmark */}
          <div className="relative mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/20 animate-bounce">
            <Check className="w-9 h-9 stroke-[3]" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Suaramu berhasil disimpan!
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            Terima kasih telah menggunakan hak pilihmu dalam Pemilihan Ketua OSIS.
          </p>

          {/* Secure Digital Receipt Info */}
          <div className="my-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 font-semibold text-slate-700">
              <span className="flex items-center gap-1.5 text-blue-700">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Bukti Surat Suara Terverifikasi</span>
              </span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                SAH
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Nama Siswa:</span>
              <span className="font-bold text-slate-800">{student.nama}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Kelas:</span>
              <span className="font-bold text-slate-800">{student.kelas}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Kode Resi Suara:</span>
              <span className="font-mono text-slate-700 font-medium truncate max-w-[180px]">
                {response.receipt_id || 'BLT-SECURE-HASH'}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-800 text-[11px] font-medium flex items-center justify-center gap-2 mb-4">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Hak suara siswa ini telah terkunci dan sesi telah selesai.</span>
          </div>

          {/* Return Button & 5s Countdown */}
          <div className="space-y-2">
            <button
              onClick={onFinishAndReset}
              className="w-full py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Selesai (Kembali ke Bilik Siswa)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Otomatis kembali dalam <strong className="text-emerald-700 font-bold font-mono">{countdown} detik</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
