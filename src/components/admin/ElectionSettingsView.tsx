import React, { useRef, useState } from 'react';
import { ElectionSettings } from '../../types';
import { Vote, AlertTriangle, ShieldCheck, CheckCircle2, Sliders, RefreshCw, WifiOff, Award, ArrowRight } from 'lucide-react';

interface ElectionSettingsViewProps {
  settings: ElectionSettings;
  onUpdateSettings: (newSettings: ElectionSettings) => void;
  onClearVotesOnly: () => void;
}

export const ElectionSettingsView: React.FC<ElectionSettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onClearVotesOnly,
}) => {
  const [title, setTitle] = useState(settings.title);
  const [subtitle, setSubtitle] = useState(settings.subtitle);
  const [schoolName, setSchoolName] = useState(settings.school_name);
  const [academicYear, setAcademicYear] = useState(settings.academic_year);
  const [stage, setStage] = useState(settings.stage || 'PUTARAN_1');
  const [simError, setSimError] = useState(settings.network_simulation_error);
  const [bannerImageUrl, setBannerImageUrl] = useState(settings.banner_image_url ?? '');
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  const [confirmCloseModal, setConfirmCloseModal] = useState(false);
  const [confirmOpenModal, setConfirmOpenModal] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      title: title.trim(),
      subtitle: subtitle.trim(),
      school_name: schoolName.trim(),
      academic_year: academicYear.trim(),
      stage: stage,
      network_simulation_error: simError,
      banner_image_url: bannerImageUrl.trim() || null
    });
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Berkas banner harus berupa gambar.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran banner maksimal 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setBannerImageUrl(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleSetStatus = (status: 'NOT_STARTED' | 'ACTIVE' | 'CLOSED') => {
    if (status === 'CLOSED') {
      setConfirmCloseModal(true);
    } else if (status === 'ACTIVE') {
      setConfirmOpenModal(true);
    } else {
      onUpdateSettings({ ...settings, status: 'NOT_STARTED' });
    }
  };

  const confirmClose = () => {
    onUpdateSettings({ ...settings, status: 'CLOSED' });
    setConfirmCloseModal(false);
  };

  const confirmOpen = () => {
    onUpdateSettings({ ...settings, status: 'ACTIVE' });
    setConfirmOpenModal(false);
  };

  const toggleStage = (newStage: 'PUTARAN_1' | 'PUTARAN_2_OPSIONAL') => {
    setStage(newStage);
    onUpdateSettings({ ...settings, stage: newStage });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Kontrol Tahapan Pemilihan
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Status & Pengaturan Tahap Pemilihan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cukup satu tahap utama. Tahap kedua disediakan sebagai opsi jika terjadi persamaan suara (seri).
          </p>
        </div>

        {saveSuccessMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan berhasil disimpan!</span>
          </div>
        )}
      </div>

      {/* Stage Selector: Putaran 1 (Utama) vs Putaran 2 (Opsi Tie-Breaker) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Banner Halaman Sambutan</h2>
          <p className="text-xs text-slate-500 mt-1">Gambar lanskap yang tampil di kolom DIGIVOS7 pada halaman kedua.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="w-full md:w-80 aspect-[2.4/1] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 border border-slate-200">
            {bannerImageUrl ? (
              <img src={bannerImageUrl} alt="Preview banner" className="w-full h-full object-cover" />
            ) : (
              <div className="h-full flex items-center justify-center text-xs font-bold text-white/80">Belum ada banner</div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
            <button type="button" onClick={() => bannerInputRef.current?.click()} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">
              {bannerImageUrl ? 'Ganti Banner' : 'Tambah Banner'}
            </button>
            {bannerImageUrl && (
              <button type="button" onClick={() => setBannerImageUrl('')} className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                Hapus Banner
              </button>
            )}
            <p className="w-full text-[11px] text-slate-500">Format gambar umum, maksimal 5MB. Klik “Simpan Pengaturan Umum” di bawah untuk menyimpan.</p>
          </div>
        </div>
      </div>

      {/* Stage Selector: Putaran 1 (Utama) vs Putaran 2 (Opsi Tie-Breaker) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Konfigurasi Putaran Pemilihan
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            {settings.stage === 'PUTARAN_2_OPSIONAL' ? '🔴 Opsi Putaran 2 Aktif' : '🟢 Tahap Utama (Putaran 1) Aktif'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Putaran 1 */}
          <div
            onClick={() => toggleStage('PUTARAN_1')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              stage === 'PUTARAN_1'
                ? 'bg-blue-50/70 border-blue-600 shadow-md ring-2 ring-blue-500/20'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Tahap Utama (Standar)
              </span>
              {stage === 'PUTARAN_1' && (
                <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                  Aktif Digunakan
                </span>
              )}
            </div>
            <h3 className="font-extrabold text-base text-slate-900">
              Putaran 1 (Tahap Utama Tunggal)
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Seluruh pemilih memberikan 1 suara untuk menentukan langsung <strong>Ketua OSIS (Peringkat 1)</strong> dan <strong>Wakil Ketua OSIS (Peringkat 2)</strong>. Cukup 1 tahap saja untuk mayoritas pemilihan.
            </p>
          </div>

          {/* Putaran 2 Opsional */}
          <div
            onClick={() => toggleStage('PUTARAN_2_OPSIONAL')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              stage === 'PUTARAN_2_OPSIONAL'
                ? 'bg-amber-50/80 border-amber-600 shadow-md ring-2 ring-amber-500/20'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Tahap Tambahan (Opsi Khusus)
              </span>
              {stage === 'PUTARAN_2_OPSIONAL' && (
                <span className="text-[10px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded-full">
                  Aktif Digunakan
                </span>
              )}
            </div>
            <h3 className="font-extrabold text-base text-slate-900">
              Putaran 2 (Opsi Persamaan Suara / Seri)
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Hanya diaktifkan jika terjadi persamaan suara persis pada peringkat teratas untuk menentukan suara penentu antara dua calon tertinggi.
            </p>
          </div>
        </div>
      </div>

      {/* Status Controller Card: Belum Dibuka / Berlangsung / Ditutup */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-6">
          <Vote className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">
            Kendali Akses Bilik Suara Siswa
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status 1: Belum Dibuka */}
          <div
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              settings.status === 'NOT_STARTED'
                ? 'bg-amber-50/60 border-amber-400 ring-2 ring-amber-400/20 shadow-sm'
                : 'bg-slate-50 border-slate-200 opacity-80 hover:opacity-100'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Status Akses
                </span>
                {settings.status === 'NOT_STARTED' && (
                  <span className="text-[10px] font-extrabold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                    Aktif
                  </span>
                )}
              </div>
              <h3 className="font-extrabold text-base text-slate-900">
                Belum Dibuka
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Bilik voting terkunci. Siswa menunggu instruksi panitia.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleSetStatus('NOT_STARTED')}
              disabled={settings.status === 'NOT_STARTED'}
              className="mt-4 w-full py-2 px-3 text-xs font-bold rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Set Belum Dibuka
            </button>
          </div>

          {/* Status 2: Berlangsung */}
          <div
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              settings.status === 'ACTIVE'
                ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                : 'bg-slate-50 border-slate-200 opacity-80 hover:opacity-100'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Pemungutan Suara
                </span>
                {settings.status === 'ACTIVE' && (
                  <span className="text-[10px] font-extrabold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span>Aktif</span>
                  </span>
                )}
              </div>
              <h3 className="font-extrabold text-base text-slate-900">
                Sedang Berlangsung
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Bilik voting terbuka untuk seluruh siswa di laptop 1, 2, dan 3.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleSetStatus('ACTIVE')}
              disabled={settings.status === 'ACTIVE'}
              className="mt-4 w-full py-2 px-3 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Buka Pemilihan Sekarang
            </button>
          </div>

          {/* Status 3: Ditutup */}
          <div
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              settings.status === 'CLOSED'
                ? 'bg-rose-50/70 border-rose-500 ring-2 ring-rose-500/20 shadow-md'
                : 'bg-slate-50 border-slate-200 opacity-80 hover:opacity-100'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                  Penutupan
                </span>
                {settings.status === 'CLOSED' && (
                  <span className="text-[10px] font-extrabold bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full">
                    Terkunci
                  </span>
                )}
              </div>
              <h3 className="font-extrabold text-base text-slate-900">
                Telah Ditutup
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Voting dikunci. Hasil resmi Ketos, Waketos, dan grafik dibuka ke publik.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleSetStatus('CLOSED')}
              disabled={settings.status === 'CLOSED'}
              className="mt-4 w-full py-2 px-3 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Tutup Pemilihan & Kunci
            </button>
          </div>
        </div>
      </div>

      {/* Identity & Network Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Identitas Pemilihan Sekolah
            </h2>
          </div>

          <form onSubmit={handleSaveGeneral} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Sekolah
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Judul Agenda Pemilihan
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Masa Bakti / Periode
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tahun Ajaran
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all"
              >
                Simpan Perubahan Identitas
              </button>
            </div>
          </form>
        </div>

        {/* Network resilience configuration */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <WifiOff className="w-4 h-4 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">
                Ketahanan Koneksi
              </h2>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-900 block">
                    Mode Gangguan Koneksi:
                  </span>
                  <span className="text-[11px] text-amber-700">
                    {simError ? '🔴 Aktif — Menguji idempotency & recovery' : '🟢 Non-Aktif (Koneksi Normal)'}
                  </span>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simError}
                    onChange={(e) => {
                      setSimError(e.target.checked);
                      onUpdateSettings({ ...settings, network_simulation_error: e.target.checked });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Data pemilih dan suara berasal dari input panitia dan pemilih.</span>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      {confirmCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Konfirmasi Penutupan Pemilihan
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Apakah kamu yakin ingin menutup pemilihan? Seluruh bilik voting laptop akan dikunci dan pengumuman penetapan Ketos, Waketos, serta grafik hasil resmi akan ditampilkan.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmCloseModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmClose}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
              >
                Ya, Tutup & Kunci Pemilihan
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Buka Pemungutan Suara
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Bilik suara pada 3 laptop voting akan dibuka untuk seluruh siswa terdaftar.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpenModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmOpen}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
              >
                Buka Bilik Suara Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
