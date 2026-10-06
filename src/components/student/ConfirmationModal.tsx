import React, { useState } from 'react';
import { Candidate, Student, VoteSubmissionResponse } from '../../types';
import { VotingEngine } from '../../services/votingEngine';
import { ShieldAlert, CheckCircle2, ArrowLeft, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  student: Student;
  candidate: Candidate;
  deviceId: string;
  onCancel: () => void;
  onVoteSuccess: (response: VoteSubmissionResponse, candidate: Candidate) => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  student,
  candidate,
  deviceId,
  onCancel,
  onVoteSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRecoveringStatus, setIsRecoveringStatus] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);

  // Generate unique idempotency key once when modal opens
  const [idempotencyKey] = useState(() => {
    return `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  });

  const handleConfirmVote = async () => {
    if (isSubmitting || isRecoveringStatus) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setRecoveryMessage(null);

    try {
      const response = await VotingEngine.submitVoteAtomic({
        student_id: student.student_id,
        candidate_id: candidate.id,
        idempotency_key: idempotencyKey,
        device_id: deviceId
      });

      if (response.success) {
        onVoteSuccess(response, candidate);
      } else {
        setErrorMessage(response.message || 'Gagal menyimpan suara.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.warn('Network or server exception during submission:', err);
      if (err instanceof Error && err.message.startsWith('Gagal menyimpan suara:')) {
        setErrorMessage(err.message);
        setIsSubmitting(false);
        return;
      }
      // As specified in Section 16: Handle network disconnect safely!
      // Do NOT show "Voting gagal." Immediately inspect idempotency status to prevent duplicate votes
      setIsSubmitting(false);
      setIsRecoveringStatus(true);
      setRecoveryMessage('Koneksi terputus. Memeriksa status suara di server...');

      try {
        const check = await VotingEngine.checkVoteStatus(idempotencyKey, student.student_id);
        if (check.isVoted) {
          // Vote actually succeeded in server before glitch!
          onVoteSuccess({
            success: true,
            message: check.message,
            receipt_id: 'VERIFIED-SERVER-RECOVERY',
            timestamp: new Date().toISOString()
          }, candidate);
        } else {
          setErrorMessage('Koneksi ke server sempat terganggu. Suara belum tersimpan. Silakan klik Konfirmasi ulang.');
        }
      } catch {
        setErrorMessage('Terjadi gangguan jaringan server. Hubungi petugas bilik voting sebelum mengulang.');
      } finally {
        setIsRecoveringStatus(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-hidden relative">
        {/* Top warning ribbon */}
        <div className="flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl mb-5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Konfirmasi Pilihan Suara Final</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
          Yakin dengan pilihanmu?
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Periksa kembali rincian calon ketua pilihanmu di bawah ini:
        </p>

        {/* Selected Candidate Summary Card */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 via-slate-50 to-indigo-50/50 border border-blue-200 flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-blue-600 shadow-md shrink-0">
            <img
              src={candidate.foto}
              alt={candidate.nama}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-1 left-1 bg-blue-600 text-white font-mono text-xs font-black px-1.5 py-0.5 rounded">
              {candidate.nomorUrut}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              Calon {candidate.nomorUrut}
            </span>
            <h3 className="text-lg font-black text-slate-900 truncate leading-snug">
              {candidate.nama}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Kelas {candidate.kelas}
            </p>
            {candidate.motto && (
              <p className="text-[11px] text-slate-500 italic mt-1 truncate">
                "{candidate.motto}"
              </p>
            )}
          </div>
        </div>

        {/* Voter Identity Confirmation */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <span>Identitas Pemilih:</span>
          <span className="font-bold text-slate-800">
            {student.nama} ({student.kelas})
          </span>
        </div>

        {/* Irreversible notice */}
        <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-900 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span className="font-medium">
            Setelah dikonfirmasi, pilihan tidak dapat diubah kembali dan hak suara akan dinyatakan selesai.
          </span>
        </div>

        {/* Recovery progress notice */}
        {isRecoveringStatus && (
          <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2 animate-pulse">
            <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
            <span>{recoveryMessage || 'Memeriksa status suara di server...'}</span>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting || isRecoveringStatus}
            className="w-full sm:w-auto py-3 px-5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>

          <button
            type="button"
            onClick={handleConfirmVote}
            disabled={isSubmitting || isRecoveringStatus}
            className="w-full sm:w-auto py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan Suara...</span>
              </>
            ) : isRecoveringStatus ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Memeriksa Status...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Konfirmasi Suara</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
