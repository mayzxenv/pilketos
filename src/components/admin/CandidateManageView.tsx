import React, { useState, useRef } from 'react';
import { Candidate } from '../../types';
import { Plus, Edit2, Trash2, Award, X, Upload, Image as ImageIcon, Check } from 'lucide-react';

interface CandidateManageViewProps {
  candidates: Candidate[];
  onAddCandidate: (candidate: Candidate) => void;
  onUpdateCandidate: (candidate: Candidate) => void;
  onDeleteCandidate: (candidateId: string) => void;
}

export const CandidateManageView: React.FC<CandidateManageViewProps> = ({
  candidates,
  onAddCandidate,
  onUpdateCandidate,
  onDeleteCandidate
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form State
  const [nomorUrut, setNomorUrut] = useState('04');
  const [nama, setNama] = useState('');
  const [kelas, setKelas] = useState('8A');
  const [foto, setFoto] = useState('');
  const [visi, setVisi] = useState('');
  const [misiText, setMisiText] = useState('');
  const [motto, setMotto] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingCandidate(null);
    const nextNum = String(candidates.length + 1).padStart(2, '0');
    setNomorUrut(nextNum);
    setNama('');
    setKelas('8A');
    setFoto('');
    setVisi('');
    setMisiText('1. Mengembangkan minat bakat siswa\n2. Menjalin solidaritas antar kelas\n3. Menjaga kebersihan lingkungan sekolah');
    setMotto('Aspiratif, Solutif, Bersahabat!');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Candidate) => {
    setEditingCandidate(c);
    setNomorUrut(c.nomorUrut);
    setNama(c.nama);
    setKelas(c.kelas);
    setFoto(c.foto);
    setVisi(c.visi);
    setMisiText(c.misi.join('\n'));
    setMotto(c.motto || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Handle local device image upload
  const handleDeviceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setFormError('Ukuran berkas foto terlalu besar (maksimal 5MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setFoto(result);
        setFormError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !nomorUrut.trim() || !visi.trim()) {
      setFormError('Nama, nomor urut, dan visi wajib diisi.');
      return;
    }

    const misiList = misiText
      .split('\n')
      .map((m) => m.trim().replace(/^\d+[\.\-\)]\s*/, ''))
      .filter(Boolean);

    if (misiList.length === 0) {
      setFormError('Minimal sertakan 1 poin misi.');
      return;
    }

    if (!editingCandidate) {
      const newCand: Candidate = {
        id: `cand-${Date.now()}`,
        nomorUrut: nomorUrut.trim(),
        nama: nama.trim(),
        kelas: kelas.trim(),
        foto: foto.trim(),
        visi: visi.trim(),
        misi: misiList,
        motto: motto.trim(),
        status: 'active'
      };
      onAddCandidate(newCand);
    } else {
      const updated: Candidate = {
        ...editingCandidate,
        nomorUrut: nomorUrut.trim(),
        nama: nama.trim(),
        kelas: kelas.trim(),
        foto: foto.trim(),
        visi: visi.trim(),
        misi: misiList,
        motto: motto.trim()
      };
      onUpdateCandidate(updated);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Kandidat Perorangan OSIS
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Manajemen Calon Ketua OSIS ({candidates.length} Kandidat)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Setiap calon adalah siswa perorangan dengan foto yang dapat diunggah langsung dari perangkat laptop/HP.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Calon Ketua</span>
        </button>
      </div>

      {/* Candidates Grid */}
      <div className={`grid gap-6 ${
        candidates.length <= 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      }`}>
        {candidates.map((cand) => (
          <div
            key={cand.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Nomor Urut
                  </span>
                  <span className="text-xl font-black font-mono text-blue-900">
                    {cand.nomorUrut}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(cand)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors border border-slate-200 cursor-pointer"
                    title="Edit Profil Kandidat"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus Calon ${cand.nomorUrut} (${cand.nama})?`)) {
                        onDeleteCandidate(cand.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-white rounded-lg transition-colors border border-slate-200 cursor-pointer"
                    title="Hapus Kandidat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Photo & Name */}
              <div className="p-4 flex items-center gap-3 border-b border-slate-100">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-sm">
                  <img
                    src={cand.foto}
                    alt={cand.nama}
                    className="w-full h-full object-cover object-top"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm text-slate-900 truncate">
                    {cand.nama}
                  </h3>
                  <div className="text-xs text-slate-500 font-medium">
                    Kelas {cand.kelas}
                  </div>
                  {cand.motto && (
                    <div className="text-[10px] text-blue-700 italic truncate mt-0.5">
                      "{cand.motto}"
                    </div>
                  )}
                </div>
              </div>

              {/* Visi preview */}
              <div className="p-4 space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Visi Calon
                  </span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-3">
                    "{cand.visi}"
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    {cand.misi.length} Program Misi
                  </span>
                  <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                    Tersedia di bilik suara
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-right">
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ● Aktif di Bilik Voting
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Candidate Modal with Local Device Photo Upload */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingCandidate ? `Edit Calon ${editingCandidate.nomorUrut}` : 'Tambah Calon Ketua OSIS Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor Urut Calon
                  </label>
                  <input
                    type="text"
                    value={nomorUrut}
                    onChange={(e) => setNomorUrut(e.target.value)}
                    placeholder="01"
                    className="w-full px-3 py-2 font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kelas Kandidat
                  </label>
                  <input
                    type="text"
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value.toUpperCase())}
                    placeholder="8A atau 8D"
                    className="w-full px-3 py-2 font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Masukkan nama kandidat"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Motto Kampanye
                </label>
                <input
                  type="text"
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  placeholder="Cerdas Berpikir, Peduli Bertindak!"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Foto Kandidat dengan Tombol Unggah dari Perangkat Ini */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <label className="block font-bold text-slate-800">
                  Foto Calon Kandidat
                </label>

                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-200 shrink-0 bg-white shadow-sm">
                    <img src={foto} alt="Preview" className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-1.5 flex-1">
                    {/* BUTTON UNGGAH DARI PERANGKAT INI */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleDeviceImageUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah Foto dari Perangkat Ini</span>
                    </button>

                    <span className="text-[10px] text-slate-400 block text-center">
                      Format JPG, PNG, atau WEBP dari galeri/folder komputer
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Visi Utama
                </label>
                <textarea
                  rows={2}
                  value={visi}
                  onChange={(e) => setVisi(e.target.value)}
                  placeholder="Tuliskan visi singkat yang kuat..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Misi & Program Kerja (1 Baris = 1 Poin)
                </label>
                <textarea
                  rows={3}
                  value={misiText}
                  onChange={(e) => setMisiText(e.target.value)}
                  placeholder="1. Poin misi pertama&#10;2. Poin misi kedua&#10;3. Poin misi ketiga"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {formError && (
                <div className="p-2.5 bg-rose-50 text-rose-800 rounded-xl">
                  {formError}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm cursor-pointer"
                >
                  Simpan Kandidat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
