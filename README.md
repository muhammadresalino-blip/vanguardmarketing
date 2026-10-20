# Vanguard Marketing

**An Integrated Digital Marketing & Lead Management Platform**

Vanguard Marketing is a web-based digital marketing platform designed to help businesses manage their online presence, capture and organize leads, monitor marketing campaigns, streamline sales follow-ups, and analyze marketing performance through a centralized dashboard.

## Overview

Vanguard Marketing aims to connect digital marketing activities with sales operations in one integrated workflow. Instead of managing website inquiries, campaign data, and customer prospects separately, the platform is designed to bring these processes together.

## Key Features

- **Public Web Portal** — Company profile, service pages, blog, and campaign landing pages.
- **Lead Generation** — Capture prospect information through inquiry forms.
- **CRM & Lead Management** — Organize contacts, track lead status, assign sales representatives, and record activities.
- **Campaign Management** — Manage marketing campaigns and track lead acquisition sources.
- **Marketing Automation** — Support email notifications, follow-up reminders, and basic automated workflows.
- **Analytics Dashboard** — Monitor leads, conversion rates, campaign performance, and marketing metrics.
- **Content Management** — Manage website pages, articles, and promotional content.
- **Role-Based Access Control** — Organize access for administrators, marketing teams, sales teams, and content editors.

## Core Workflow

1. Visitors discover the website through search engines, social media, or advertising campaigns.
2. Visitors submit an inquiry or lead generation form.
3. The system records lead information and campaign attribution.
4. Leads are assigned to the appropriate sales representative.
5. Sales representatives follow up and update lead statuses.
6. Marketing and sales teams review performance through analytics and reporting.

## Proposed Technology Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** NestJS or Node.js
- **Database:** PostgreSQL
- **Authentication:** Secure authentication with role-based access control
- **Analytics:** Google Analytics 4 and internal reporting
- **Integrations:** Email services, WhatsApp Business Platform, Google Ads, and Meta Ads, subject to implementation
- **Deployment:** Vercel and a suitable backend hosting provider

*The technology stack represents the proposed architecture and may evolve during implementation.*

## Development Roadmap

### Phase 1 — MVP
- Public website and landing pages
- Lead capture forms
- Basic CRM and lead status management
- Sales assignment and follow-up tracking
- Basic analytics dashboard

### Phase 2 — Marketing Automation
- Automated email notifications
- Follow-up reminders
- Campaign segmentation
- Content management improvements
- Enhanced campaign tracking

### Phase 3 — Growth & Scalability
- Third-party marketing integrations
- Advanced reporting and analytics
- AI-assisted recommendations
- Multi-brand or multi-tenant support

## Project Goals

- Centralize marketing and sales workflows.
- Improve lead organization and follow-up efficiency.
- Provide clearer visibility into campaign performance.
- Help businesses make data-informed marketing decisions.
- Build a scalable foundation for future digital marketing capabilities.

## Project Status

**Planning and product design**

This repository is based on the initial product concept, requirements, proposed architecture, and development roadmap. Features and integrations will depend on the implementation phase.


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

A license has not yet been specified. Please add an appropriate license before distributing or reusing this project publicly.
Proyek contoh untuk keperluan internal. Sesuaikan sebelum dipakai komersial.
