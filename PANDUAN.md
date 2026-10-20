# Vanguard Marketing — Panduan

Platform digital marketing: **portal publik + panel marketing + CRM + pipeline + analytics**.
Frontend React 19 (Vite 8, Tailwind 4), backend Express 5, database SQLite/PostgreSQL,
autentikasi JWT. Seluruh data sekarang tersimpan di server, bukan lagi di browser.

```
Browser (React SPA)  ──fetch /api──►  Express API  ──►  SQLite (lokal) / PostgreSQL (produksi)
        │                                   │
        └── token JWT di localStorage       └── scrypt + JWT + RBAC per modul
```

---

## 1. Menjalankan

```powershell
cd "C:\Users\RAUL\Documents\Default Project\web-starter"
pnpm install
pnpm dev
```

`pnpm dev` menjalankan dua proses:

| Proses | URL | Keterangan |
|---|---|---|
| API | http://localhost:4000 | Express + SQLite (`server/data/vanguard.db`) |
| Web | http://localhost:5173 | Vite, mem-proxy `/api` ke port 4000 |

Perintah lain:

```powershell
pnpm dev:api      # hanya API (node --watch)
pnpm dev:web      # hanya frontend
pnpm build        # build produksi ke dist/
pnpm start        # API + sajikan dist/ sekaligus di http://localhost:4000
pnpm lint         # oxlint (frontend + server)
```

> Mode satu layanan: jalankan `pnpm build` lalu `pnpm start`. Semua route SPA dan `/api`
> dilayani dari port 4000 — ini yang dipakai saat deploy ke VPS/Docker.

## 2. Akun demo

Kata sandi awal semua akun: **`vanguard123`**

| Peran | Email | Bisa akses |
|---|---|---|
| Super Admin | raka@vanguardmarketing.id | Semua modul, reset data, user |
| Marketing Manager | maya@vanguardmarketing.id | Dashboard, CRM, Pipeline, Tugas, Kampanye, Analytics, Konten |
| Sales | dimas@vanguardmarketing.id | Dashboard, CRM (lead miliknya), Pipeline, Tugas |
| Content Editor | nadia@vanguardmarketing.id | Dashboard, Konten |
| Customer Support | hendra@vanguardmarketing.id | Dashboard, CRM |

Login di `/admin/login`. Kata sandi bisa diganti lewat **User & Role → Edit → Kata sandi baru**
(atau diisi saat mengundang pengguna baru). Pengguna baru tanpa kata sandi memakai `vanguard123`.

## 3. Halaman publik

| URL | Isi |
|---|---|
| `/` | Hero + form inquiry, layanan, pembeda, proses, studi kasus, testimoni, blog, CTA |
| `/services` | Enam modul layanan, manfaat, alur implementasi, form konsultasi |
| `/case-studies` | 3 studi kasus dengan metrik sebelum–sesudah |
| `/blog` | Pencarian, filter kategori, artikel unggulan |
| `/blog/:slug` | Detail artikel |
| `/about` | Profil, prinsip kerja, tim, klien |
| `/contact` | Form inquiry, kontak langsung, konteks UTM, FAQ |
| `/lp/:slug` | Landing page kampanye |
| `/thank-you` | Konfirmasi setelah form kampanye dikirim |

## 4. Panel admin

| URL | Modul |
|---|---|
| `/admin` | KPI, tren 30 hari, funnel, kanal, trafik, kampanye, lead terbaru |
| `/admin/leads` | Filter, ekspor CSV, ubah status, penugasan, hapus |
| `/admin/leads/:id` | Timeline aktivitas, status, pemilik, deal, tugas, SLA |
| `/admin/pipeline` | Kanban 5 tahap, nilai & proyeksi berbobot |
| `/admin/tasks` | Tugas terbuka, melewati tenggat, selesai |
| `/admin/campaigns` | Anggaran, realisasi, CPL, tautan UTM, landing page |
| `/admin/analytics` | Kanal, funnel, ROAS, trafik, kualitas data |
| `/admin/content` | Artikel, halaman portal, landing page |
| `/admin/users` | Pengguna, kata sandi, matriks hak akses |
| `/admin/settings` | Identitas, aturan lead & SLA, integrasi, audit, reset/backup |

## 5. Alur yang bisa diuji

**A. Form → CRM → pipeline → laporan**

1. Buka `/contact` atau `/`, isi form, centang persetujuan, kirim.
2. Lead tersimpan di server dengan status **New**, sumber/UTM tercatat, dan otomatis
   ditugaskan ke sales secara rotasi.
3. Login Sales → `/admin/leads` → buka lead → tambah aktivitas "Telepon".
   Waktu respons tercatat dan peringatan SLA hilang.
4. Ubah status ke **Qualified** → deal otomatis muncul di `/admin/pipeline`.
5. Klik **Menang** → status lead ikut menjadi **Won**, tugas terbuka ditutup.
6. Dashboard & Analytics ikut berubah.

**B. Atribusi UTM**

```
http://localhost:5173/lp/konsultasi-digital-marketing?utm_source=meta&utm_medium=paid_social&utm_campaign=uji-meta
```

Kirim form di halaman itu. Lead menyimpan `utm_source`, `utm_medium`, `utm_campaign`,
halaman masuk, dan `campaignId` yang benar.

**C. Anti-duplikat**

Kirim ulang dengan email/nomor telepon yang sama. Server **memperbarui** lead yang ada
(bukan membuat baris baru) dan menambahkan catatan di timeline. Email pengguna juga unik —
mengundang email yang sudah terdaftar akan ditolak (409).

**D. RBAC**

Login Sales, lalu buka `/admin/campaigns`, `/admin/analytics`, `/admin/users`.
Server menolak dengan 403 dan UI menampilkan "Akses ditolak". Sales hanya menerima lead,
tugas, dan notifikasi miliknya — pembatasan dilakukan di server, bukan hanya di tampilan.

## 6. Struktur folder

```
server/
  index.js              # Express app, routing /api, static dist (mode satu layanan)
  db.js                # driver SQLite (node:sqlite) & PostgreSQL (pg), skema, seed
  auth.js              # scrypt, JWT, middleware requireAuth/requireModule
  services.js          # logika bisnis: anti-duplikat, rotasi, deal, SLA, reset
  data/                # database SQLite lokal (tidak ikut Git)
src/
  main.jsx             # entry + BrowserRouter
  App.jsx              # route + guard RBAC + pelacakan kunjungan + gate loading
  index.css            # design system (token, .btn, .card, .table, .input)
  lib/
    api.js             # klien fetch + token + semua endpoint
    constants.js       # status, kanal, peran, MODULE_ACCESS (dipakai server juga)
    seed.js            # data contoh deterministik (dipakai server saat DB kosong)
    analytics.js       # funnel, CPL, ROAS, tren
    utm.js             # penangkapan & interpretasi UTM
    content.js         # copywriting portal
    format.js          # rupiah, tanggal, CSV
    storage.js         # helper localStorage (hanya sesi & konteks UTM)
  context/
    DataContext.jsx    # snapshot API + aksi (refresh, submitLead, CRUD)
    AuthContext.jsx    # login API, sesi JWT, can(module)
  components/          # layout, form lead, chart SVG, UI
  pages/public/        # 11 halaman portal
  pages/admin/         # 10 modul panel
```

## 7. API

Semua respons JSON. Endpoint berautentikasi memakai header:

```
Authorization: Bearer <token>
```

| Method | Endpoint | Akses | Fungsi |
|---|---|---|---|
| GET | `/api/health` | publik | Status + driver database |
| GET | `/api/public/bootstrap` | publik | Kampanye, landing page, artikel, halaman, pengaturan |
| GET | `/api/bootstrap` | login | Snapshot lengkap (dibatasi per peran) |
| POST | `/api/auth/login` | publik | `{ email, password }` → token + user + snapshot |
| GET | `/api/auth/me` | login | Profil dari token |
| POST | `/api/leads` | publik | Kirim form (anti-duplikat + rotasi sales) |
| POST | `/api/events` | publik | Catat page view / form submit |
| PATCH | `/api/leads/:id/status` | CRM | Ubah status + deal otomatis |
| PATCH | `/api/leads/:id/assign` | manajer | Pindahkan pemilik lead |
| POST | `/api/leads/:id/activities` | CRM | Tambah aktivitas |
| DELETE | `/api/leads/:id` | manajer | Hapus lead + relasinya |
| POST/PATCH/DELETE | `/api/campaigns...` | kampanye | CRUD kampanye |
| POST/PATCH | `/api/landing-pages...` | kampanye/konten | CRUD landing page |
| PATCH | `/api/deals/:id/stage` | pipeline | Pindah tahap + sinkron status lead |
| POST/PATCH | `/api/tasks...`, `/api/tasks/:id/toggle` | tugas | CRUD + selesai |
| POST/PATCH/DELETE | `/api/posts...` | konten | CRUD artikel |
| POST/PATCH | `/api/pages...` | konten | CRUD halaman |
| POST/PATCH | `/api/users...` | super admin | CRUD pengguna + kata sandi |
| PATCH | `/api/notifications/:id/read` | login | Tandai dibaca |
| POST | `/api/notifications/read-all` | login | Tandai semua |
| PUT | `/api/settings` | super admin | Simpan pengaturan |
| POST | `/api/admin/reset` | super admin | Kembalikan data contoh |

Rate limit login: 10 percobaan per menit per IP. Token berlaku 12 jam.

## 8. Database & data contoh

**Lokal (default):** SQLite di `server/data/vanguard.db` (dibuat otomatis saat pertama jalan).
**Produksi:** isi `DATABASE_URL` dengan connection string PostgreSQL — driver `pg` dipakai otomatis.

Skema saat ini:

- `records(collection, id, data, created_at, updated_at)` — dokumen JSON per entitas
  (`users`, `leads`, `activities`, `deals`, `tasks`, `campaigns`, `landingPages`, `posts`,
  `pages`, `notifications`, `events`, `settings`).
- `credentials(user_id, password_hash)` — hash scrypt.
- `app_meta(key, value)` — versi seed.

Data contoh (68 lead, 7 kampanye, 6 artikel, 640 event) dibuat **hanya bila database kosong**.
Reset ke data contoh: login Super Admin → `/admin/settings` → *Reset ke data contoh*.
Backup JSON di halaman yang sama mengunduh snapshot yang sedang dilihat.

> Dokumen disimpan sebagai JSON agar migrasi dari MVP cepat dan aman. Ketika volume data
> membesar, pecah `records` menjadi tabel ternormalisasi (leads, deals, dst.) — kontrak API
> tidak perlu berubah karena semua akses lewat `server/db.js` dan `server/services.js`.

## 9. Design system

- Primary navy `#1E3A8A`
- Secondary teal `#0D9488`
- Accent orange `#F97316`

Kelas siap pakai di `src/index.css`: `.btn-primary`, `.btn-accent`, `.btn-teal`,
`.btn-outline`, `.btn-ghost`, `.btn-sm`, `.card`, `.card-pad`, `.input`, `.label`,
`.table`, `.container-page`, `.section`, `.eyebrow`.

## 10. Deploy

### Opsi A — Vercel (frontend) + Render (API + PostgreSQL) — disarankan

1. **Push ke GitHub** (lihat bagian Git di bawah).
2. **Render**: *New → Blueprint* → pilih repo. `render.yaml` membuat:
   - web service `vanguard-api` (Node 24, `node server/index.js`, health `/api/health`)
   - PostgreSQL `vanguard-db`, otomatis terhubung lewat `DATABASE_URL`
   - `JWT_SECRET` dibuat acak
3. Setelah API jadi, salin URL-nya (mis. `https://vanguard-api.onrender.com`).
   Isi env `CORS_ORIGIN` di Render dengan domain frontend (mis. `https://vanguard.vercel.app`).
4. **Vercel**: *Add New Project* → import repo → framework Vite.
   Tambahkan env `VITE_API_URL=https://vanguard-api.onrender.com`, lalu deploy.
   `vercel.json` sudah mengatur SPA rewrite.
5. Buka domain Vercel → login demo → ganti kata sandi akun nyata.

Catatan paket gratis Render: API tidur setelah idle (permintaan pertama bisa lambat
±30–60 detik) dan PostgreSQL gratis punya batas ukuran. Untuk produksi nyata, naikkan paket.

### Opsi B — Netlify + Render

Sama seperti di atas, tetapi frontend di Netlify. `netlify.toml` sudah berisi build command,
publish `dist`, dan redirect SPA. Tetap set `VITE_API_URL` dan `CORS_ORIGIN`.

### Opsi C — satu server (VPS / Fly.io / Docker)

```bash
pnpm install
pnpm build
node server/index.js        # menyajikan dist/ + /api di port 4000
```

Atau pakai `Dockerfile`:

```bash
docker build -t vanguard-marketing .
docker run -p 4000:4000 -e JWT_SECRET=... -v vanguard-data:/app/server/data vanguard-marketing
```

Tanpa `DATABASE_URL`, data tersimpan di volume SQLite. Untuk multi-instance, wajib PostgreSQL.

### Variabel lingkungan

| Variabel | Dipakai | Keterangan |
|---|---|---|
| `PORT` | API | Default 4000 |
| `JWT_SECRET` | API | **Wajib** di produksi; buat nilai acak panjang |
| `DATABASE_URL` | API | Kosong = SQLite; `postgresql://...` = PostgreSQL |
| `DATABASE_SSL` | API | `false` untuk Postgres tanpa SSL |
| `CORS_ORIGIN` | API | Origin frontend, pisahkan koma |
| `DATA_DIR` | API | Lokasi file SQLite (default `server/data`) |
| `VITE_API_URL` | build frontend | URL API bila beda domain |

Salin `.env.example` menjadi `.env` untuk pengembangan lokal. `.env` tidak ikut Git.

## 11. Keamanan & batasan

Sudah ada: hash scrypt, JWT 12 jam, rate limit login, RBAC per modul di server,
pembatasan data sales, validasi input dasar, CORS terbatas.

Belum ada (sebaiknya sebelum produksi serius):

- Verifikasi email, lupa kata sandi, 2FA.
- Audit log server (halaman audit masih memakai data contoh).
- Rate limit endpoint publik selain login dan proteksi bot pada form.
- Integrasi email/WhatsApp/Ads sungguhan (masih tampilan konfigurasi).
- Skema database ternormalisasi & migrasi berversi.
- Backup otomatis (baru backup manual JSON).

## 12. Tips untuk RAM 4 GB

- `pnpm dev` menjalankan dua proses Node; tutup tab/aplikasi lain saat mengembangkan.
- Jangan menjalankan `dev`, `build`, dan `preview` bersamaan.
- `pnpm start` (mode produksi) lebih ringan daripada dev server karena tanpa HMR.
- Pakai `pnpm`, jangan `npm install`.

## 13. Git

Repo sudah diinisialisasi (`main`). Identitas repo ini disetel lokal:

```powershell
git config user.name "Raul"
git config user.email "raul@vanguardmarketing.local"
```

Ganti dengan email GitHub bila repo akan di-push. Perintah harian:

```powershell
git status
git add -A
git commit -m "pesan perubahan"
```

## 14. Troubleshooting

| Gejala | Penyebab & solusi |
|---|---|
| Layar "Server belum bisa dihubungi" | API belum jalan → `pnpm dev:api`; cek `http://localhost:4000/api/health` |
| Login "Kata sandi salah" | Ganti kata sandi pernah dilakukan; reset DB atau minta Super Admin mengganti |
| Data kembali ke contoh | Database dihapus/di-reset, atau deploy Render tanpa `DATABASE_URL` (filesystem ephemeral) |
| CORS error saat deploy | `CORS_ORIGIN` di API belum memuat domain frontend |
| 401 setelah 12 jam | Token kedaluwarsa; login ulang |
| Ingin mulai bersih | Super Admin → Pengaturan → *Reset ke data contoh*, atau hapus `server/data/vanguard.db` lalu restart API |
