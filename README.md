# SIVOT

SIVOT adalah aplikasi e-voting Ketua OSIS berbasis React dan Vite.

## Menjalankan lokal

1. Salin `.env.example` menjadi `.env`.
2. Isi `VITE_ADMIN_USERNAME` dan `VITE_ADMIN_PASSWORD`.
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
   - `VITE_ADMIN_USERNAME`
   - `VITE_ADMIN_PASSWORD`
5. Pilih environment **Production** (dan **Preview** bila diperlukan), lalu deploy.

`vercel.json` sudah menyiapkan fallback SPA sehingga URL `/admin` dan `/display`
tetap dapat dibuka atau di-refresh langsung.

## Batasan penting sebelum dipakai pemilihan sungguhan

Versi ini menyimpan siswa, suara, pengaturan, dan log di `localStorage` browser.
Data tidak tersinkron ke database dan tidak dibagikan antar-perangkat; `BroadcastChannel`
hanya bekerja antar-tab pada browser/perangkat yang sama. Karena itu deploy ke Vercel
hanya membuat aplikasi dapat diakses online, bukan membuat sistem voting multi-perangkat.

Selain itu, `VITE_ADMIN_PASSWORD` adalah variabel client-side dan dapat terlihat di
bundle browser. Untuk pemakaian produksi, autentikasi dan data voting perlu dipindahkan
ke backend/database (misalnya Supabase, Firebase, atau API server dengan database).
