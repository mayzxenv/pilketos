import React, { useEffect, useState } from 'react';
import { Candidate, Student } from '../../types';
import { FloatingSchoolElements } from '../common/SchoolDecorations';
import { ArrowLeft, ArrowRight, Info, X, Check, Award } from 'lucide-react';
import { speakInstruction } from '../../services/sound';

interface CandidateListViewProps {
  student: Student;
  candidates: Candidate[];
  onSelectAndConfirm: (candidate: Candidate) => void;
  onBack: () => void;
}

export const CandidateListView: React.FC<CandidateListViewProps> = ({
  student,
  candidates,
  onSelectAndConfirm,
  onBack
}) => {
  const [detailModalCandidate, setDetailModalCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    speakInstruction('Silahkan memilih kandidat.');
  }, []);

  return (
    <div className="relative h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-hidden p-3 sm:p-5 flex flex-col justify-between bg-gradient-to-b from-blue-50/40 via-slate-50 to-indigo-50/30">
      <FloatingSchoolElements variant="minimal" />

      {/* Top Header (Compact & Clear) */}
      <div className="relative z-10 max-w-6xl w-full mx-auto flex items-center justify-between bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[11px] text-slate-500 font-medium">
              Pemilih: <strong className="text-slate-900">{student.nama}</strong> ({student.kelas})
            </span>
            <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              Ketuk Salah Satu Calon untuk Langsung Memilih
            </h1>
          </div>
        </div>

        <div className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          {candidates.length} Kandidat Siap Dipilih
        </div>
      </div>

      {/* 4 Candidates Grid (Direct Tap to Confirmation, Visi Misi in Modal) */}
      <div className="relative z-10 max-w-6xl w-full mx-auto my-auto py-2">
        <div className={`grid gap-4 ${
          candidates.length <= 3
            ? 'grid-cols-1 md:grid-cols-3'
            : candidates.length === 4
            ? 'grid-cols-2 lg:grid-cols-4'
            : 'grid-cols-2 md:grid-cols-5'
        }`}>
          {candidates.map((cand) => (
            <div
              key={cand.id}
              onClick={() => onSelectAndConfirm(cand)}
              className="group relative flex flex-col justify-between bg-white hover:bg-blue-50/30 rounded-3xl border-2 border-slate-200 hover:border-blue-500 hover:shadow-2xl transition-all duration-200 cursor-pointer overflow-hidden transform hover:-translate-y-1"
            >
              {/* Top Banner Ribbon */}
              <div className="px-3.5 py-2 bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-800 transition-colors flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Calon <strong className="font-mono text-base">{cand.nomorUrut}</strong>
                </span>

                <span className="text-[11px] font-bold text-blue-600 group-hover:text-white flex items-center gap-0.5">
                  <span>Pilih</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>

              {/* Photo */}
              <div className="relative aspect-square max-h-48 sm:max-h-52 w-full overflow-hidden bg-slate-100">
                <img
                  src={cand.foto}
                  alt={cand.nama}
                  className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent"></div>

                <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
                  <h3 className="text-sm sm:text-base font-black leading-tight drop-shadow-sm truncate">
                    {cand.nama}
                  </h3>
                  <span className="text-[11px] text-blue-200 block mt-0.5">
                    Kelas {cand.kelas}
                  </span>
                </div>
              </div>

              {/* Card Footer: Motto, Hidden Visi Misi Modal button, Direct Select button */}
              <div className="p-3 space-y-2 flex flex-col justify-between flex-1">
                {cand.motto ? (
                  <p className="text-[11px] text-slate-500 italic line-clamp-1 text-center">
                    "{cand.motto}"
                  </p>
                ) : (
                  <div className="h-4"></div>
                )}

                {/* Sembunyikan Visi & Misi di Tombol Lihat Visi Misi */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // Do not trigger selection
                    setDetailModalCandidate(cand);
                  }}
                  className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-blue-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  <span>Lihat Visi & Misi</span>
                </button>

                {/* Direct Action Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAndConfirm(cand);
                  }}
                  className="w-full py-2.5 px-3 bg-blue-600 group-hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Pilih Calon Ini →</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="relative z-10 max-w-6xl w-full mx-auto text-center shrink-0">
        <span className="text-xs text-slate-500 font-medium">
          💡 Cukup <strong>ketuk kartu kandidat</strong> di atas untuk langsung membuka konfirmasi suara.
        </span>
      </div>

      {/* Visi & Misi Modal Pop-up */}
      {detailModalCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                  <img src={detailModalCandidate.foto} alt={detailModalCandidate.nama} className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                    Calon {detailModalCandidate.nomorUrut}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                    {detailModalCandidate.nama} ({detailModalCandidate.kelas})
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setDetailModalCandidate(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Visi Calon</span>
                </span>
                <p className="p-3 bg-blue-50/70 rounded-xl text-slate-800 border border-blue-100 leading-relaxed font-medium">
                  "{detailModalCandidate.visi}"
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                  Misi & Program Kerja
                </span>
                <div className="space-y-1.5">
                  {detailModalCandidate.misi.map((m, i) => (
                    <div key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-700">
                      <span className="font-mono font-bold text-blue-600 text-xs shrink-0">{i + 1}.</span>
                      <span className="leading-tight">{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setDetailModalCandidate(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  const target = detailModalCandidate;
                  setDetailModalCandidate(null);
                  onSelectAndConfirm(target);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm cursor-pointer"
              >
                Pilih Calon {detailModalCandidate.nomorUrut} Sekarang →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
