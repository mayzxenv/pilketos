import React, { useState } from 'react';
import { Student } from '../../types';
import { VotingEngine } from '../../services/votingEngine';
import { FloatingSchoolElements, BallotBoxIllustration } from '../common/SchoolDecorations';
import { Search, UserCheck, AlertCircle, ChevronRight, School } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (student: Student) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [inputName, setInputName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [duplicateMatches, setDuplicateMatches] = useState<Student[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setDuplicateMatches([]);

    const trimmed = inputName.trim();
    if (!trimmed) {
      setErrorMessage('Silakan ketikkan nama lengkapmu terlebih dahulu.');
      return;
    }

    try {
      const matches = await VotingEngine.findStudentsByName(trimmed);

      if (matches.length === 0) {
        setErrorMessage('Nama belum terdaftar sebagai pemilih. Silakan hubungi panitia pemungutan suara.');
        return;
      }

      if (matches.length === 1) {
        const student = matches[0];
        if (student.status_voted) {
          setErrorMessage(`Halo ${student.nama} (${student.kelas}), hak suaramu sudah digunakan. Terima kasih telah memilih!`);
          return;
        }
        onLoginSuccess(student);
      } else {
        setDuplicateMatches(matches);
        setShowDuplicateModal(true);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Gagal terhubung ke server pemilihan.');
    }
  };

  const handleSelectDuplicateStudent = (student: Student) => {
    if (student.status_voted) {
      setErrorMessage(`Halo ${student.nama} (${student.kelas}), hak suaramu sudah digunakan.`);
      setShowDuplicateModal(false);
      return;
    }
    setShowDuplicateModal(false);
    onLoginSuccess(student);
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-hidden flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-blue-50/60 via-slate-50 to-indigo-50/40">
      <FloatingSchoolElements variant="full" />

      <div className="relative z-10 w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-900/5 border border-blue-100">
          {/* Header illustration & badges */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-blue-50 border border-blue-100 mb-3 transform hover:scale-105 transition-transform">
              <BallotBoxIllustration className="w-20 h-20" />
            </div>
            
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Halo, Sobat SIVOT! 👋
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Masukkan nama kamu untuk melanjutkan pemilihan.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div>
              <label htmlFor="student-name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Lengkap Siswa
              </label>
              <div className="relative">
                <input
                  id="student-name"
                  type="text"
                  value={inputName}
                  onChange={(e) => {
                    setInputName(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Ketik nama lengkap sesuai data pemilih..."
                  className="w-full px-4 py-3 pl-11 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  autoComplete="off"
                  autoFocus
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Lanjut Memilih →</span>
            </button>
          </form>

        </div>

        <p className="mt-3 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1">
          <School className="w-3.5 h-3.5 text-slate-400" />
          <span>Pemilihan Terbuka & Rahasia · 1 Siswa = 1 Hak Suara</span>
        </p>
      </div>

      {/* Disambiguation Modal for duplicate names */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
              <UserCheck className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              Ditemukan beberapa siswa dengan nama sama
            </h3>
            <p className="mt-1 text-xs text-slate-600">
              Terdapat lebih dari satu siswa bernama <strong className="text-blue-700 font-semibold">{inputName}</strong>. Pilih kelasmu:
            </p>

            <div className="mt-4 space-y-2 max-h-56 overflow-y-auto pr-1">
              {duplicateMatches.map((student) => (
                <button
                  key={student.student_id}
                  onClick={() => handleSelectDuplicateStudent(student)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${
                    student.status_voted
                      ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                      : 'bg-white hover:bg-blue-50/80 border-slate-200 hover:border-blue-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100/70 text-blue-800 font-bold flex items-center justify-center text-xs">
                      {student.kelas}
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-slate-900 block group-hover:text-blue-900">
                        {student.nama}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Kelas {student.kelas} · {student.student_id}
                      </span>
                    </div>
                  </div>

                  <div>
                    {student.status_voted ? (
                      <span className="text-[10px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded">
                        Sudah Memilih
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                        Pilih <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDuplicateModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
              >
                Batal / Ganti Nama
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
