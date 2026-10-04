import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Key, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { BallotBoxIllustration, FloatingSchoolElements } from '../common/SchoolDecorations';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onBackToStudent: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onBackToStudent
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const u = username.trim().toLowerCase();
    const p = password.trim();

    // Valid demo credentials
    if ((u === 'admin' || u === 'panitia' || u === 'operator') && (p === 'admin123' || p === 'sivot2026')) {
      onLoginSuccess();
    } else {
      setErrorMessage('Username atau kata sandi admin tidak sesuai. Gunakan akun demo di bawah.');
    }
  };

  const handleUseDemoAccount = () => {
    setUsername('admin');
    setPassword('admin123');
    setErrorMessage(null);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 overflow-hidden text-white">
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <FloatingSchoolElements variant="full" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
        <button
          onClick={onBackToStudent}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Bilik Siswa</span>
        </button>

        <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/30 border border-blue-400/30 mb-3 shadow-lg">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Login Khusus Admin
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Portal pengawasan pemilihan dan manajemen SIVOT
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Username Panitia
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ketik username (contoh: admin)..."
                  className="w-full px-4 py-3 pl-11 rounded-xl text-sm bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  autoFocus
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ketik sandi (contoh: admin123)..."
                  className="w-full px-4 py-3 pl-11 rounded-xl text-sm bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                />
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Masuk ke Panel Pengawasan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Card */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Akun Demo Panitia Tersedia:</span>
                </span>
                <button
                  type="button"
                  onClick={handleUseDemoAccount}
                  className="text-[11px] font-bold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                >
                  Isi Otomatis
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400 block text-[9px]">USERNAME</span>
                  <span className="font-bold text-white">admin</span>
                </div>
                <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400 block text-[9px]">PASSWORD</span>
                  <span className="font-bold text-white">admin123</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
