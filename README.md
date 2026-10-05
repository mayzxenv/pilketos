# SIVOT

SIVOT adalah aplikasi e-voting Ketua OSIS berbasis React dan Vite.

## Menjalankan lokal

1. Salin `.env.example` menjadi `.env`.
2. Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.
3. Jalankan:

```bash
npm install
npm run dev
```

Build produksi dapat diuji dengan:

```bash
npm run build
npm run preview
```

## Deploy ke Vercel

1. Push folder project ini ke repository GitHub/GitLab/Bitbucket.
2. Di Vercel pilih **Add New Project**, lalu import repository tersebut.
3. Biarkan pengaturan berikut:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Di **Settings -> Environment Variables**, tambahkan:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Pilih environment **Production** (dan **Preview** bila diperlukan), lalu deploy.

`vercel.json` sudah menyiapkan fallback SPA sehingga URL `/admin` dan `/display`
tetap dapat dibuka atau di-refresh langsung.

## Batasan penting sebelum dipakai pemilihan sungguhan

**Alur aplikasi sekarang sudah memakai Supabase sebagai sumber data utama.** Pencarian
DPT, submit suara transaksional, CRUD admin, dashboard, reset pemilu, dan audit log
terhubung ke database terpusat. `localStorage` hanya tersisa sebagai nilai awal sebelum
data remote selesai dimuat dan untuk menyimpan pilihan perangkat lokal.

Setelah perubahan schema, jalankan ulang seluruh isi `supabase/schema.sql` di Supabase
SQL Editor. Script tersebut menambahkan RPC pencarian DPT yang aman dan memperketat
akses tabel siswa. Pastikan migration dijalankan pada project yang sama dengan
`VITE_SUPABASE_URL`.

Sebelum pemilu sungguhan, tetap lakukan simulasi end-to-end dengan beberapa perangkat,
uji backup/restore, dan verifikasi RLS di project produksi. Aplikasi tidak dapat
memvalidasi koneksi atau isi database Supabase sampai environment variable dan schema
produksi sudah benar-benar dipasang.

Sebelum hari pemilihan, panitia juga perlu:

- menjalankan dan menguji schema Supabase serta RLS di project produksi;
- memastikan login admin, import DPT, dan sinkronisasi data berjalan end-to-end;
- menguji pencegahan double-vote dan konkurensi dari beberapa bilik;
- menyiapkan backup, akun admin terpisah, dan prosedur pemulihan;
- melakukan simulasi penuh dengan data uji sebelum membuka status pemilihan `ACTIVE`.

## Setup Supabase

1. Buat project di Supabase.
2. Buka **SQL Editor**, jalankan seluruh isi `supabase/schema.sql`.
3. Buka **Authentication -> Users**, pilih **Add user**, lalu buat akun email/password
   untuk admin. Nonaktifkan email confirmation bila ingin login langsung untuk akun panitia.
4. Salin URL project dan anon key dari **Project Settings -> API** ke `.env` lokal atau
   Environment Variables Vercel.

Login admin sekarang memakai Supabase Auth. Password tidak lagi disimpan di source code
atau `VITE_*`.

Schema database dan fungsi transaksi voting tersedia di `supabase/schema.sql`. Sebelum
pemilihan sungguhan, lakukan pengujian end-to-end terhadap RLS, import DPT, transaksi
anti-double-vote, dan backup database.
