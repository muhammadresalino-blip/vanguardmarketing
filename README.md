# Vanguard Marketing

Platform digital marketing MVP: portal publik, CRM lead, pipeline penjualan, kampanye, dan
analytics dalam satu aplikasi.

- **Frontend:** React 19 + Vite 8 + Tailwind CSS 4 (JavaScript)
- **Backend:** Express 5 + JWT, RBAC per modul
- **Database:** SQLite lokal (tanpa setup) atau PostgreSQL untuk produksi

## Jalankan

```bash
pnpm install
pnpm dev
```

- Portal publik: http://localhost:5173
- Panel tim: http://localhost:5173/admin/login
- API: http://localhost:4000/api/health
- Kata sandi demo: `vanguard123` (daftar akun ada di halaman login)

Mode satu layanan (API + hasil build sekaligus):

```bash
pnpm build
pnpm start        # http://localhost:4000
```

## Dokumentasi

Panduan lengkap — arsitektur, akun demo, alur uji, endpoint API, database, deploy
(Vercel/Netlify + Render + PostgreSQL), keamanan, dan troubleshooting:
**[PANDUAN.md](./PANDUAN.md)**

## Perintah

| Perintah | Fungsi |
|---|---|
| `pnpm dev` | API + frontend sekaligus |
| `pnpm dev:api` | API saja (port 4000) |
| `pnpm dev:web` | Frontend saja (port 5173) |
| `pnpm build` | Build produksi ke `dist/` |
| `pnpm start` | API melayani `dist/` + `/api` |
| `pnpm lint` | Lint frontend + server |

## Lisensi

Proyek contoh untuk keperluan internal. Sesuaikan sebelum dipakai komersial.
