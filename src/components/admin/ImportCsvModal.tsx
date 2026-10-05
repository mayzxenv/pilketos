import React, { useState } from 'react';
import { Student } from '../../types';
import { Upload, AlertCircle, CheckCircle, FileText, Download, X, FileSpreadsheet, ClipboardCopy } from 'lucide-react';

interface ImportCsvModalProps {
  onClose: () => void;
  onImportConfirm: (newStudents: Student[], mode: 'replace' | 'merge') => void;
}

interface ParsedRow {
  student_id: string;
  nama: string;
  kelas: string;
  isValid: boolean;
  error?: string;
}

export const ImportCsvModal: React.FC<ImportCsvModalProps> = ({ onClose, onImportConfirm }) => {
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isPreviewReady, setIsPreviewReady] = useState(false);

  // File Upload parser (handles CSV, TSV, TXT, Excel-exported text)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      parseRawContent(content);
    };
    reader.readAsText(file);
  };

  // Smart flexible parser: handles tabs (Excel copy-paste), commas (CSV), and semicolons (European Excel)
  const parseRawContent = (text: string) => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const errors: string[] = [];
    const rows: ParsedRow[] = [];
    const seenIds = new Set<string>();

    if (lines.length === 0) {
      setValidationErrors(['Teks kosong atau file tidak memuat baris data.']);
      setParsedRows([]);
      setIsPreviewReady(false);
      return;
    }

    // Determine delimiter (tab, comma, or semicolon)
    const firstLine = lines[0];
    const isTab = firstLine.includes('\t');
    const isSemicolon = firstLine.includes(';') && !isTab;
    const delimiter = isTab ? '\t' : isSemicolon ? ';' : ',';

    const header = firstLine.toLowerCase().split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ''));
    
    // Check if first line has recognized header names
    let idIdx = header.findIndex((h) => h.includes('id') || h.includes('nis') || h.includes('nomor'));
    let nameIdx = header.findIndex((h) => h.includes('nama') || h.includes('name') || h.includes('siswa'));
    let classIdx = header.findIndex((h) => h.includes('kelas') || h.includes('class') || h.includes('tingkat') || h.includes('rombel'));

    const hasHeader = nameIdx !== -1 || classIdx !== -1;
    const startIndex = hasHeader ? 1 : 0;

    // If no header, infer columns based on position
    if (!hasHeader) {
      const firstCols = lines[0].split(delimiter);
      if (firstCols.length === 2) {
        nameIdx = 0;
        classIdx = 1;
        idIdx = -1;
      } else if (firstCols.length >= 3) {
        idIdx = 0;
        nameIdx = 1;
        classIdx = 2;
      }
    }

    let generatedIdCounter = 1;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      const cols = line.split(delimiter).map((c) => c.trim().replace(/^"|"$/g, ''));
      
      let nama = nameIdx !== -1 ? cols[nameIdx] : cols[0];
      let kelas = classIdx !== -1 ? cols[classIdx] : cols[1];
      let id = idIdx !== -1 ? cols[idIdx] : '';

      // Auto-generate student_id if not present in the Excel spreadsheet
      if (!id) {
        id = `STU-${String(generatedIdCounter).padStart(4, '0')}`;
        generatedIdCounter++;
      }

      let rowError: string | undefined;

      if (!nama || !kelas) {
        rowError = 'Kolom nama atau kelas kosong';
      } else if (seenIds.has(id)) {
        rowError = `ID ganda: ${id}`;
      } else {
        seenIds.add(id);
      }

      rows.push({
        student_id: id,
        nama: nama || '-',
        kelas: kelas ? kelas.toUpperCase() : '-',
        isValid: !rowError,
        error: rowError
      });
    }

    const invalidCount = rows.filter((r) => !r.isValid).length;
    if (invalidCount > 0) {
      errors.push(`Ditemukan ${invalidCount} baris tidak lengkap.`);
    }

    setValidationErrors(errors);
    setParsedRows(rows);
    setIsPreviewReady(rows.length > 0 && rows.some((r) => r.isValid));
  };

  const handleApplyImport = () => {
    const validStudents: Student[] = parsedRows
      .filter((r) => r.isValid)
      .map((r) => ({
        student_id: r.student_id,
        nama: r.nama,
        kelas: r.kelas,
        status_voted: false,
        voted_at: null,
        device_id: null
      }));

    if (validStudents.length === 0) return;
    onImportConfirm(validStudents, importMode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Upload & Impor Daftar Siswa (Excel / CSV / Spreadsheet)
              </h2>
              <p className="text-xs text-slate-500">
                Mendukung berkas Excel, CSV, Google Sheets, atau tempel (Ctrl+V) langsung dari spreadsheet.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* File Upload Zone */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
            <div className="flex items-center gap-3">
              <Upload className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Unggah Berkas Excel / CSV / Spreadsheet
                </span>
                <span className="text-[11px] text-slate-500">
                  Format didukung: .xlsx, .xls, .csv, .tsv, .txt
                </span>
              </div>
            </div>

            <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-colors">
              <span>Pilih Berkas Komputer</span>
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.tsv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Direct Paste from Excel / Google Sheets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <ClipboardCopy className="w-3.5 h-3.5 text-blue-600" />
                <span>Atau Tempel (Copy-Paste) Sel Langsung dari Excel / Google Sheets:</span>
              </label>
            </div>
            <textarea
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                parseRawContent(e.target.value);
              }}
              rows={4}
              placeholder="Contoh copy-paste dari Excel:&#10;Ahmad	9A&#10;Budi	8B&#10;Citra	7C"
              className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
            />
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              {validationErrors.map((err, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-amber-900">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}

          {/* Preview Table */}
          {parsedRows.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">
                  Pratinjau Data ({parsedRows.filter((r) => r.isValid).length} Baris Siap Diimpor):
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Menampilkan 6 baris pertama
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                    <tr>
                      <th className="py-2 px-3">student_id</th>
                      <th className="py-2 px-3">nama</th>
                      <th className="py-2 px-3">kelas</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.slice(0, 8).map((row, idx) => (
                      <tr key={idx} className={row.isValid ? '' : 'bg-rose-50'}>
                        <td className="py-1.5 px-3 font-mono text-slate-600">{row.student_id}</td>
                        <td className="py-1.5 px-3 font-semibold text-slate-900">{row.nama}</td>
                        <td className="py-1.5 px-3 text-slate-600">{row.kelas}</td>
                        <td className="py-1.5 px-3">
                          {row.isValid ? (
                            <span className="text-emerald-700 font-bold text-[10px]">Valid</span>
                          ) : (
                            <span className="text-rose-700 font-bold text-[10px]">{row.error}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mode Selection */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-800 block">
              Pilihan Penerapan Data:
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <label
                className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-colors ${
                  importMode === 'replace'
                    ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="text-blue-600"
                  />
                  <span>Ganti Seluruh Data DPT</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Menggantikan seluruh pemilih dengan data baru ini
                </span>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-colors ${
                  importMode === 'merge'
                    ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="importMode"
                    value="merge"
                    checked={importMode === 'merge'}
                    onChange={() => setImportMode('merge')}
                    className="text-blue-600"
                  />
                  <span>Gabungkan (Merge Tambahan)</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Menambahkan siswa baru ke daftar yang sudah ada
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleApplyImport}
            disabled={!isPreviewReady}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Konfirmasi & Simpan Daftar Siswa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
