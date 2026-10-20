// Data contoh (seed) untuk MVP.
// Dibuat deterministik supaya angka di dashboard stabil setiap kali dibuka,
// dan cukup realistis untuk menguji alur form -> CRM -> pipeline -> laporan.

import { ROLES } from './constants.js'

// PRNG sederhana (mulberry32) agar hasil seed selalu sama.
function createRandom(seed = 20261020) {
  let t = seed
  return function random() {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

const FIRST_NAMES = [
  'Andi', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Gilang', 'Hendra', 'Indah',
  'Joko', 'Kartika', 'Lukman', 'Maya', 'Nadia', 'Oscar', 'Putri', 'Rizky',
  'Sari', 'Taufik', 'Umi', 'Vina', 'Wahyu', 'Yuni', 'Zaki', 'Bagas', 'Clara',
  'Damar', 'Elisa', 'Fajar', 'Grace',
]

const LAST_NAMES = [
  'Pratama', 'Santoso', 'Wijaya', 'Hartono', 'Nugroho', 'Ramadhan', 'Saputra',
  'Halim', 'Kusuma', 'Maulana', 'Permata', 'Sihombing', 'Anggraini', 'Firmansyah',
  'Lestari', 'Setiawan', 'Wibowo', 'Utami', 'Prabowo', 'Yulianto',
]

const COMPANIES = [
  'PT Sinar Abadi', 'CV Mitra Karya', 'Toko Bangun Jaya', 'Klinik Sehat Bersama',
  'Kopi Nusantara Group', 'PT Arta Properti', 'Bengkel Prima Motor',
  'Rumah Sakit Harapan', 'CV Digital Kreasi', 'PT Logistik Cepat',
  'Akademi Bahasa Cerdas', 'PT Furnitur Minimalis', 'Salon Glow Studio',
  'PT Tekstil Mandiri', 'Restoran Rasa Nusantara', 'PT Agro Subur',
  'Travel Wisata Indah', 'PT Edukasi Cerdas', 'Studio Foto Lumen',
  'PT Kimia Presisi', 'Butik Rias Ayu', 'PT Otomotif Terang',
]

const JOB_TITLES = [
  'Owner', 'Marketing Manager', 'Head of Sales', 'Operations Lead',
  'Founder', 'Business Development', 'Procurement', 'Digital Marketer',
]

const SOURCE_WEIGHTS = [
  { source: 'Google Ads', weight: 22, campaignIndex: [0, 1] },
  { source: 'Meta Ads', weight: 20, campaignIndex: [2, 3] },
  { source: 'Organic Search', weight: 18, campaignIndex: [4] },
  { source: 'LinkedIn', weight: 10, campaignIndex: [3] },
  { source: 'Email Campaign', weight: 9, campaignIndex: [5] },
  { source: 'Referral', weight: 8, campaignIndex: [6] },
  { source: 'Social Media', weight: 8, campaignIndex: [3, 2] },
  { source: 'Direct', weight: 5, campaignIndex: [4] },
]

const UTM_MEDIUM = {
  'Google Ads': 'cpc',
  'Meta Ads': 'paid_social',
  'Organic Search': 'organic',
  LinkedIn: 'paid_social',
  'Email Campaign': 'email',
  Referral: 'referral',
  'Social Media': 'social',
  Direct: 'none',
}

// Bobot status: makin lama lead masuk, makin mungkin sudah lanjut/closed.
const STATUS_BY_AGE = [
  { maxDays: 5, distribution: [0.55, 0.32, 0.08, 0.03, 0.01, 0.01] },
  { maxDays: 21, distribution: [0.14, 0.3, 0.26, 0.16, 0.08, 0.06] },
  { maxDays: 60, distribution: [0.05, 0.12, 0.22, 0.2, 0.24, 0.17] },
  { maxDays: 999, distribution: [0.03, 0.07, 0.14, 0.16, 0.34, 0.26] },
]

const STATUS_ORDER = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']

function pick(random, list) {
  return list[Math.floor(random() * list.length)]
}

function weightedSource(random) {
  const total = SOURCE_WEIGHTS.reduce((sum, s) => sum + s.weight, 0)
  let roll = random() * total
  for (const item of SOURCE_WEIGHTS) {
    roll -= item.weight
    if (roll <= 0) return item
  }
  return SOURCE_WEIGHTS[0]
}

function weightedStatus(random, ageDays) {
  const band = STATUS_BY_AGE.find((b) => ageDays <= b.maxDays)
  let roll = random()
  for (let i = 0; i < band.distribution.length; i += 1) {
    roll -= band.distribution[i]
    if (roll <= 0) return STATUS_ORDER[i]
  }
  return 'new'
}

function isoDaysAgo(days, hourOffset = 0) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(8 + (hourOffset % 11), (hourOffset * 7) % 60, 0, 0)
  return date.toISOString()
}

function isoDaysFromNow(days, hourOffset = 0) {
  return isoDaysAgo(-days, hourOffset)
}

export function createSeedData() {
  const random = createRandom()
  const now = new Date()

  // --- Users ---------------------------------------------------------------
  const users = [
    {
      id: 'usr_001',
      name: 'Raka Prasetyo',
      email: 'raka@vanguardmarketing.id',
      role: 'super_admin',
      jobTitle: 'Head of Marketing',
      phone: '0812-1000-0001',
      status: 'active',
      lastLoginAt: isoDaysAgo(0, 1),
      createdAt: isoDaysAgo(240),
    },
    {
      id: 'usr_002',
      name: 'Maya Anggraini',
      email: 'maya@vanguardmarketing.id',
      role: 'marketing_manager',
      jobTitle: 'Marketing Manager',
      phone: '0812-1000-0002',
      status: 'active',
      lastLoginAt: isoDaysAgo(0, 2),
      createdAt: isoDaysAgo(220),
    },
    {
      id: 'usr_003',
      name: 'Dimas Nugroho',
      email: 'dimas@vanguardmarketing.id',
      role: 'sales',
      jobTitle: 'Senior Sales Executive',
      phone: '0812-1000-0003',
      status: 'active',
      lastLoginAt: isoDaysAgo(0, 3),
      createdAt: isoDaysAgo(180),
    },
    {
      id: 'usr_004',
      name: 'Sinta Lestari',
      email: 'sinta@vanguardmarketing.id',
      role: 'sales',
      jobTitle: 'Sales Executive',
      phone: '0812-1000-0004',
      status: 'active',
      lastLoginAt: isoDaysAgo(1, 4),
      createdAt: isoDaysAgo(150),
    },
    {
      id: 'usr_005',
      name: 'Bayu Wibowo',
      email: 'bayu@vanguardmarketing.id',
      role: 'sales',
      jobTitle: 'Sales Executive',
      phone: '0812-1000-0005',
      status: 'active',
      lastLoginAt: isoDaysAgo(1, 5),
      createdAt: isoDaysAgo(120),
    },
    {
      id: 'usr_006',
      name: 'Nadia Kusuma',
      email: 'nadia@vanguardmarketing.id',
      role: 'content_editor',
      jobTitle: 'Content Editor',
      phone: '0812-1000-0006',
      status: 'active',
      lastLoginAt: isoDaysAgo(2, 6),
      createdAt: isoDaysAgo(140),
    },
    {
      id: 'usr_007',
      name: 'Hendra Saputra',
      email: 'hendra@vanguardmarketing.id',
      role: 'support',
      jobTitle: 'Customer Support',
      phone: '0812-1000-0007',
      status: 'active',
      lastLoginAt: isoDaysAgo(0, 7),
      createdAt: isoDaysAgo(90),
    },
    {
      id: 'usr_008',
      name: 'Putri Ramadhan',
      email: 'putri@vanguardmarketing.id',
      role: 'sales',
      jobTitle: 'Inside Sales',
      phone: '0812-1000-0008',
      status: 'inactive',
      lastLoginAt: isoDaysAgo(45),
      createdAt: isoDaysAgo(200),
    },
  ]

  const salesReps = users.filter((u) => u.role === 'sales' && u.status === 'active')

  // --- Campaigns + landing pages ------------------------------------------
  const campaignBlueprints = [
    {
      name: 'Google Search — Jasa Digital Marketing',
      channel: 'google_ads',
      status: 'active',
      budget: 45000000,
      spend: 38750000,
      slug: 'konsultasi-digital-marketing',
      headline: 'Naikkan Lead Berkualitas dalam 30 Hari',
      subheadline:
        'Audit gratis funnel marketing Anda. Tim kami merancang kampanye yang menghasilkan prospek siap beli — bukan sekadar kunjungan.',
      offer: 'Audit funnel gratis + rencana kanal 30 hari',
      start: 75,
      end: 15,
    },
    {
      name: 'Google Search — Software CRM UMKM',
      channel: 'google_ads',
      status: 'active',
      budget: 28000000,
      spend: 21400000,
      slug: 'crm-untuk-umkm',
      headline: 'Berhenti Kehilangan Prospek di Spreadsheet',
      subheadline:
        'Satukan form website, WhatsApp, dan pipeline sales dalam satu dashboard yang bisa dipakai tim kecil tanpa pelatihan panjang.',
      offer: 'Trial 14 hari + migrasi data gratis',
      start: 60,
      end: 30,
    },
    {
      name: 'Meta Ads — Retargeting Pengunjung Blog',
      channel: 'meta_ads',
      status: 'active',
      budget: 32000000,
      spend: 28900000,
      slug: 'panduan-lead-generation',
      headline: 'Template Funnel yang Sudah Terbukti',
      subheadline:
        'Unduh template funnel 5 tahap yang kami pakai untuk klien UMKM dan B2B, lengkap dengan contoh metrik target.',
      offer: 'E-book gratis 24 halaman',
      start: 45,
      end: 20,
    },
    {
      name: 'Meta Ads — Webinar Pipeline Sales',
      channel: 'meta_ads',
      status: 'active',
      budget: 24000000,
      spend: 15600000,
      slug: 'webinar-pipeline-sales',
      headline: 'Webinar: Membangun Pipeline yang Bisa Diprediksi',
      subheadline:
        'Sesi 60 menit bersama praktisi sales B2B: cara menetapkan tahap pipeline, target respons, dan laporan mingguan.',
      offer: 'Kursi webinar gratis (terbatas 100)',
      start: 30,
      end: 10,
    },
    {
      name: 'SEO — Content Cluster Lead Generation',
      channel: 'organic',
      status: 'active',
      budget: 18000000,
      spend: 11200000,
      slug: 'panduan-crm-gratis',
      headline: 'Panduan Memilih CRM untuk Tim Kecil',
      subheadline:
        'Bandingkan fitur inti CRM, hitung biaya per lead, dan tentukan kapan waktunya pindah dari spreadsheet.',
      offer: 'Checklist evaluasi CRM (PDF)',
      start: 90,
      end: 0,
    },
    {
      name: 'Email Nurture — Prospek Belum Siap Beli',
      channel: 'email',
      status: 'active',
      budget: 12000000,
      spend: 8400000,
      slug: 'nurture-email-prospek',
      headline: 'Rangkaian Email untuk Prospek yang Menunda',
      subheadline:
        'Lima email siap pakai untuk menjaga hubungan sampai prospek siap mengambil keputusan.',
      offer: 'Template email + jadwal kirim',
      start: 120,
      end: 0,
    },
    {
      name: 'Referral — Program Mitra Agensi',
      channel: 'referral',
      status: 'paused',
      budget: 15000000,
      spend: 4200000,
      slug: 'program-mitra-agensi',
      headline: 'Program Mitra untuk Agensi Digital',
      subheadline:
        'Kelola kampanye klien dan laporkan performa kanal dari satu akun, dengan komisi referral yang transparan.',
      offer: 'Komisi 15% + dashboard white-label',
      start: 150,
      end: 0,
    },
  ]

  const campaigns = campaignBlueprints.map((c, index) => ({
    id: `cmp_${String(index + 1).padStart(3, '0')}`,
    name: c.name,
    channel: c.channel,
    status: c.status,
    budget: c.budget,
    spend: c.spend,
    landingPageSlug: c.slug,
    startDate: isoDaysAgo(c.start),
    endDate: c.end ? isoDaysFromNow(c.end) : null,
    createdBy: 'usr_002',
    createdAt: isoDaysAgo(c.start + 2),
  }))

  const landingPages = campaignBlueprints.map((c, index) => ({
    id: `lp_${String(index + 1).padStart(3, '0')}`,
    campaignId: `cmp_${String(index + 1).padStart(3, '0')}`,
    slug: c.slug,
    title: c.headline,
    subtitle: c.subheadline,
    offer: c.offer,
    status: c.status === 'paused' ? 'draft' : 'published',
    sections: [
      { title: 'Kenapa ini penting', body: 'Prospek hilang karena respons lambat dan data tersebar di banyak tempat.' },
      { title: 'Apa yang Anda dapat', body: 'Satu alur kerja dari form masuk sampai laporan bulanan.' },
      { title: 'Berapa lama', body: 'Implementasi dasar 2-3 minggu untuk satu tim kecil.' },
    ],
    createdAt: isoDaysAgo(c.start + 2),
  }))

  // --- Posts & Pages -------------------------------------------------------
  const postBlueprints = [
    {
      title: '7 Cara Meningkatkan Konversi Landing Page B2B',
      category: 'Lead Generation',
      excerpt:
        'Form yang panjang dan CTA samar adalah penyebab utama landing page B2B gagal. Berikut perbaikan yang bisa dieksekusi minggu ini.',
      days: 4,
    },
    {
      title: 'Menghitung Cost per Lead yang Sehat per Kanal',
      category: 'Paid Ads',
      excerpt:
        'CPL murah belum tentu menguntungkan. Kami bahas cara menyandingkan CPL dengan kualitas lead dan nilai deal.',
      days: 12,
    },
    {
      title: 'UTM Tracking: Kesalahan yang Membuat Laporan Kacau',
      category: 'Paid Ads',
      excerpt:
        'Nama kampanye yang tidak konsisten membuat atribusi tidak bisa dipercaya. Pakai konvensi ini sebelum kampanye berikutnya.',
      days: 19,
    },
    {
      title: 'Kapan UMKM Sebaiknya Mulai Pakai CRM',
      category: 'CRM & Sales',
      excerpt:
        'Tanda-tanda tim Anda sudah melewati kapasitas spreadsheet, dan cara migrasi tanpa menghentikan penjualan.',
      days: 27,
    },
    {
      title: 'Alur Email Otomatis Pertama yang Perlu Dibuat',
      category: 'Automation',
      excerpt:
        'Tiga email dasar: konfirmasi, edukasi, dan pengingat. Cukup untuk menjaga respons di bawah satu jam.',
      days: 35,
    },
    {
      title: 'Checklist SEO Teknis untuk Website Perusahaan',
      category: 'SEO',
      excerpt:
        'Dari kecepatan halaman sampai structured data: daftar periksa yang bisa diaudit dalam satu sore.',
      days: 48,
    },
  ]

  const posts = postBlueprints.map((p, index) => ({
    id: `post_${String(index + 1).padStart(3, '0')}`,
    title: p.title,
    slug: p.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-'),
    excerpt: p.excerpt,
    content: `${p.excerpt}\n\n## Ringkasan\n\nLead yang berkualitas datang dari alur yang jelas: sumber tercatat, respons cepat, dan tindak lanjut yang konsisten. Bagian ini membahas langkah praktis yang bisa diterapkan tim kecil tanpa menambah alat baru.\n\n## Langkah praktis\n\n1. Tetapkan satu kanal utama untuk diuji selama 30 hari.\n2. Catat sumber setiap lead secara otomatis lewat parameter UTM.\n3. Tentukan target waktu respons dan pantau di dashboard.\n4. Tinjau kualitas lead per kanal setiap minggu, bukan hanya jumlahnya.\n\n## Yang perlu diukur\n\nWaktu respons pertama, persentase lead lengkap, dan konversi dari lead ke prospek berkualifikasi. Tiga metrik ini cukup untuk menilai apakah alur sudah bekerja.`,
    category: p.category,
    authorId: 'usr_006',
    status: 'published',
    readMinutes: 4 + (index % 4),
    views: 320 + index * 137,
    publishedAt: isoDaysAgo(p.days),
    createdAt: isoDaysAgo(p.days + 3),
  }))

  const pages = [
    {
      id: 'page_001',
      slug: 'home',
      title: 'Home',
      status: 'published',
      authorId: 'usr_006',
      excerpt: 'Halaman utama: value proposition, layanan, bukti sosial, dan CTA konsultasi.',
      updatedAt: isoDaysAgo(6),
    },
    {
      id: 'page_002',
      slug: 'about',
      title: 'Tentang Kami',
      status: 'published',
      authorId: 'usr_006',
      excerpt: 'Profil perusahaan, cara kerja tim, dan prinsip pengukuran.',
      updatedAt: isoDaysAgo(14),
    },
    {
      id: 'page_003',
      slug: 'services',
      title: 'Layanan',
      status: 'published',
      authorId: 'usr_006',
      excerpt: 'Enam layanan utama dari audit kanal sampai automasi email.',
      updatedAt: isoDaysAgo(9),
    },
    {
      id: 'page_004',
      slug: 'case-studies',
      title: 'Studi Kasus',
      status: 'published',
      authorId: 'usr_006',
      excerpt: 'Hasil proyek percontohan pada segmen UMKM dan B2B.',
      updatedAt: isoDaysAgo(21),
    },
    {
      id: 'page_005',
      slug: 'contact',
      title: 'Kontak',
      status: 'published',
      authorId: 'usr_006',
      excerpt: 'Form inquiry, detail kantor, WhatsApp, dan FAQ.',
      updatedAt: isoDaysAgo(3),
    },
    {
      id: 'page_006',
      slug: 'pricing',
      title: 'Paket Harga',
      status: 'draft',
      authorId: 'usr_002',
      excerpt: 'Draft paket langganan Starter, Growth, dan Scale.',
      updatedAt: isoDaysAgo(2),
    },
  ]

  // --- Leads ---------------------------------------------------------------
  const leads = []
  const activities = []
  const deals = []
  const tasks = []
  const notifications = []
  const events = []
  const leadCount = 68

  for (let i = 0; i < leadCount; i += 1) {
    const srcInfo = weightedSource(random)
    const ageDays = Math.floor(random() * 88) + 1
    const status = weightedStatus(random, ageDays)
    const campaignIndex = pick(random, srcInfo.campaignIndex)
    const campaign = campaigns[campaignIndex]
    const salesRep = pick(random, salesReps)
    const name = `${pick(random, FIRST_NAMES)} ${pick(random, LAST_NAMES)}`
    const company = pick(random, COMPANIES)
    const createdAt = isoDaysAgo(ageDays, i)
    // Distribusi miring ke kanan: mayoritas lead direspons cepat, sebagian kecil
    // terlambat — supaya laporan SLA punya variasi yang wajar.
    const responseMinutes = Math.round(4 + Math.pow(random(), 4) * 260)
    const contactedAt = status === 'new' ? null : new Date(new Date(createdAt).getTime() + responseMinutes * 60000).toISOString()
    const leadId = `lead_${String(i + 1).padStart(3, '0')}`

    const lead = {
      id: leadId,
      name,
      email: `${name.toLowerCase().replace(/[^a-z]/g, '.')}@${company
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 14)}.co.id`,
      phone: `08${String(1000000000 + Math.floor(random() * 899999999)).slice(0, 10)}`,
      company,
      jobTitle: pick(random, JOB_TITLES),
      city: pick(random, ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Denpasar', 'Makassar']),
      source: srcInfo.source,
      campaignId: campaign?.id ?? null,
      utmSource: srcInfo.source.toLowerCase().replace(/\s+/g, '_'),
      utmMedium: UTM_MEDIUM[srcInfo.source],
      utmCampaign: campaign?.name ?? null,
      landingPage: campaign?.landingPageSlug ?? 'home',
      status,
      assignedTo: salesRep.id,
      consent: true,
      message:
        `Kami ${company} ingin menindaklanjuti ${campaign?.name ?? 'konsultasi'} untuk tim ` +
        `${Math.floor(random() * 20) + 3} orang. Mohon dihubungi pada jam kerja.`,
      budgetEstimate: Math.round((8 + random() * 90)) * 1000000,
      responseMinutes: status === 'new' ? null : responseMinutes,
      contactedAt,
      createdAt,
      updatedAt: contactedAt ?? createdAt,
    }

    // Riwayat aktivitas mengikuti status lead.
    activities.push({
      id: `act_${leadId}_new`,
      leadId,
      type: 'status_change',
      notes: 'Lead dibuat otomatis dari form website dengan status New.',
      createdBy: 'system',
      createdAt,
      meta: { from: null, to: 'new' },
    })
    if (status !== 'new') {
      activities.push({
        id: `act_${leadId}_contact`,
        leadId,
        type: pick(random, ['call', 'email', 'whatsapp']),
        notes: pick(random, [
          'Menelepon prospek, menjelaskan paket dasar dan menjadwalkan demo.',
          'Mengirim email ringkasan layanan beserta tautan jadwal konsultasi.',
          'Follow-up WhatsApp, prospek meminta proposal tertulis.',
          'Diskusi kebutuhan awal, prospek menyebut anggaran kuartal depan.',
        ]),
        createdBy: salesRep.id,
        createdAt: contactedAt,
      })
      activities.push({
        id: `act_${leadId}_moved`,
        leadId,
        type: 'status_change',
        notes: `Status diperbarui dari New menjadi Contacted.`,
        createdBy: salesRep.id,
        createdAt: contactedAt,
        meta: { from: 'new', to: 'contacted' },
      })
    }
    if (['qualified', 'proposal', 'won', 'lost'].includes(status)) {
      const qualifiedAt = isoDaysAgo(Math.max(0, ageDays - Math.round(3 + random() * 5)), i + 2)
      activities.push({
        id: `act_${leadId}_qualified`,
        leadId,
        type: 'meeting',
        notes: 'Meeting kebutuhan: kualifikasi anggaran, waktu, dan pemegang keputusan.',
        createdBy: salesRep.id,
        createdAt: qualifiedAt,
      })
    }
    if (['proposal', 'won', 'lost'].includes(status)) {
      activities.push({
        id: `act_${leadId}_proposal`,
        leadId,
        type: 'email',
        notes: 'Proposal dan estimasi biaya dikirim ke prospek.',
        createdBy: salesRep.id,
        createdAt: isoDaysAgo(Math.max(0, ageDays - Math.round(6 + random() * 8)), i + 3),
      })
    }

    leads.push(lead)

    // Deal untuk lead yang sudah masuk pipeline.
    if (['qualified', 'proposal', 'won', 'lost'].includes(status)) {
      const stage = status
      const probability = { qualified: 45, proposal: 70, won: 100, lost: 0 }[stage]
      deals.push({
        id: `deal_${leadId}`,
        leadId,
        dealName: `${company} — ${campaign?.name?.split('—')[1]?.trim() ?? 'Paket Digital Marketing'}`,
        value: lead.budgetEstimate,
        stage,
        probability,
        expectedCloseDate: isoDaysFromNow(Math.round(random() * 30) - 5),
        ownerId: salesRep.id,
        createdAt: lead.updatedAt,
        updatedAt: lead.updatedAt,
      })
    }

    // Task hanya untuk lead yang masih aktif di pipeline.
    if (['new', 'contacted', 'qualified', 'proposal'].includes(status)) {
      tasks.push({
        id: `task_${leadId}`,
        leadId,
        assignedTo: salesRep.id,
        type: pick(random, ['call', 'email', 'follow_up', 'proposal', 'meeting']),
        status: random() > 0.45 ? 'open' : 'done',
        dueDate: isoDaysFromNow(Math.round(random() * 6) - 1, i),
        notes: 'Tindak lanjut sesuai target respons internal (< 1 jam untuk lead baru).',
        createdAt: lead.createdAt,
      })
    }
  }

  // Notifikasi contoh untuk tiap tim.
  const recentLeads = [...leads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 12)
  recentLeads.forEach((lead, index) => {
    notifications.push({
      id: `ntf_lead_${lead.id}`,
      userId: lead.assignedTo,
      type: 'lead_assigned',
      message: `Lead baru dari ${lead.source}: ${lead.name} (${lead.company}) ditugaskan kepada Anda.`,
      leadId: lead.id,
      read: index > 4,
      createdAt: lead.createdAt,
    })
  })
  notifications.push({
    id: 'ntf_campaign_sync',
    userId: 'usr_002',
    type: 'integration_error',
    message: 'Sinkronisasi Google Ads gagal sekali pada 09:12. Sistem akan mencoba ulang otomatis.',
    read: false,
    createdAt: isoDaysAgo(0, 9),
  })
  notifications.push({
    id: 'ntf_week_report',
    userId: 'usr_001',
    type: 'report',
    message: 'Laporan mingguan kanal sudah siap: kualitas lead Meta Ads turun 8% dibanding minggu lalu.',
    read: false,
    createdAt: isoDaysAgo(1, 8),
  })

  // Analytics events: page view + form submit per kanal.
  const pagePaths = ['/home', '/services', '/blog', '/case-studies', '/contact', ...landingPages.map((p) => `/lp/${p.slug}`)]
  for (let i = 0; i < 640; i += 1) {
    const srcInfo = weightedSource(random)
    const campaignIndex = pick(random, srcInfo.campaignIndex)
    const campaign = campaigns[campaignIndex]
    const eventDate = isoDaysAgo(Math.floor(random() * 88) + 1, i)
    const isSubmit = random() < 0.11
    events.push({
      id: `evt_${i}`,
      eventName: isSubmit ? 'form_submit' : 'page_view',
      campaignId: campaign?.id ?? null,
      source: srcInfo.source,
      pageUrl: pick(random, pagePaths),
      utmSource: srcInfo.source.toLowerCase().replace(/\s+/g, '_'),
      utmMedium: UTM_MEDIUM[srcInfo.source],
      device: random() > 0.38 ? 'mobile' : 'desktop',
      sessionMinutes: Math.round(1 + random() * 8),
      createdAt: eventDate,
    })
  }

  const settings = {
    companyName: 'Vanguard Marketing',
    tagline: 'Platform terpadu untuk prospek, penjualan, dan kinerja kampanye.',
    whatsapp: '6281200011122',
    email: 'hello@vanguardmarketing.id',
    address: 'Jl. Casablanca Raya No. 88, Jakarta Selatan 12870',
    leadResponseTargetMinutes: 60,
    duplicateMatchRules: ['email', 'phone'],
    notifySalesOnNewLead: true,
    sendConfirmationEmail: true,
    utmConvention: 'utm_source / utm_medium / utm_campaign (huruf kecil, garis bawah)',
    timezone: 'Asia/Jakarta',
  }

  return {
    users,
    campaigns,
    landingPages,
    posts,
    pages,
    leads,
    activities,
    deals,
    tasks,
    notifications,
    events,
    settings,
    meta: { seededAt: now.toISOString(), version: 5 },
  }
}

export const DEMO_ACCOUNTS = ROLES.map((role, index) => {
  const user = [
    { name: 'Raka Prasetyo', email: 'raka@vanguardmarketing.id' },
    { name: 'Maya Anggraini', email: 'maya@vanguardmarketing.id' },
    { name: 'Dimas Nugroho', email: 'dimas@vanguardmarketing.id' },
    { name: 'Nadia Kusuma', email: 'nadia@vanguardmarketing.id' },
    { name: 'Hendra Saputra', email: 'hendra@vanguardmarketing.id' },
  ][index]

  return {
    role: role.value,
    roleLabel: role.label,
    name: user.name,
    email: user.email,
    description: role.description,
  }
})

export const DEMO_PASSWORD = 'vanguard123'
