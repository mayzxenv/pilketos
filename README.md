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
