// Konten pemasaran portal publik (copywriting contoh).
// Dipisah dari komponen supaya tim konten bisa mengganti teks tanpa menyentuh kode UI,
// dan mudah dipindahkan ke headless CMS nanti.

export const COMPANY = {
  name: 'Vanguard Marketing',
  tagline:
    'Platform terpadu yang membantu bisnis mengumpulkan prospek, mengelola tindak lanjut penjualan, dan memahami kinerja kampanye pemasaran dalam satu alur kerja.',
  shortPitch:
    'Dari form website sampai laporan kampanye, semua tercatat di satu sistem.',
  address: 'Jl. Casablanca Raya No. 88, Jakarta Selatan 12870',
  phone: '+62 812 0001 1122',
  whatsapp: '6281200011122',
  email: 'hello@vanguardmarketing.id',
  hours: 'Senin–Jumat, 09.00–18.00 WIB',
}

export const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/services', label: 'Layanan' },
  { to: '/case-studies', label: 'Studi Kasus' },
  { to: '/blog', label: 'Blog' },
  { to: '/about', label: 'Tentang' },
  { to: '/contact', label: 'Kontak' },
]

export const SERVICES = [
  {
    slug: 'lead-generation',
    icon: 'target',
    title: 'Lead Generation Terukur',
    summary:
      'Landing page yang fokus konversi, form yang tidak menyulitkan, dan penugasan lead otomatis ke sales.',
    points: [
      'Form inquiry dengan validasi & antibot sederhana',
      'Penugasan otomatis berbasis giliran atau wilayah',
      'Target waktu respons terpantau di dashboard',
    ],
    forWho: 'Tim yang sudah beriklan tetapi lead-nya masih tersebar di WhatsApp dan email.',
  },
  {
    slug: 'campaign-management',
    icon: 'campaign',
    title: 'Manajemen Kampanye Multi-Kanal',
    summary:
      'Kelola Google Ads, Meta Ads, email, dan konten organik dari satu tempat, lengkap dengan anggaran dan realisasi.',
    points: [
      'Kategori kanal & status kampanye',
      'Pencatatan anggaran vs realisasi belanja',
      'Landing page per kampanye',
    ],
    forWho: 'Agensi dan tim in-house yang mengelola lebih dari satu kanal sekaligus.',
  },
  {
    slug: 'utm-attribution',
    icon: 'link',
    title: 'Pelacakan UTM & Atribusi Sumber',
    summary:
      'Setiap lead menyimpan utm_source, utm_medium, dan utm_campaign sehingga kualitas per kanal bisa dibandingkan.',
    points: [
      'Konvensi penamaan UTM yang konsisten',
      'Laporan sumber vs kualitas lead',
      'Deteksi kanal dengan biaya per lead terbaik',
    ],
    forWho: 'Bisnis yang ingin tahu kanal mana yang benar-benar menghasilkan penjualan.',
  },
  {
    slug: 'crm-pipeline',
    icon: 'pipeline',
    title: 'CRM & Pipeline Penjualan',
    summary:
      'Database prospek dengan tahap New sampai Won, riwayat aktivitas, tugas follow-up, dan nilai deal.',
    points: [
      'Tahap pipeline: New, Contacted, Qualified, Proposal, Won, Lost',
      'Activity log: telepon, email, meeting, WhatsApp',
      'Proyeksi pendapatan berbobot probabilitas',
    ],
    forWho: 'Tim sales kecil yang butuh disiplin proses tanpa aplikasi yang rumit.',
  },
  {
    slug: 'email-automation',
    icon: 'email',
    title: 'Automasi Email Dasar',
    summary:
      'Konfirmasi otomatis ke prospek, notifikasi internal ke sales, dan pengingat follow-up yang terkendali.',
    points: [
      'Email konfirmasi saat form dikirim',
      'Notifikasi ke sales pemilik lead',
      'Pengingat bila lead belum disentuh sesuai target',
    ],
    forWho: 'Bisnis yang ingin menjaga respons tetap di bawah satu jam.',
  },
  {
    slug: 'analytics-reporting',
    icon: 'analytics',
    title: 'Analytics & Pelaporan',
    summary:
      'Dashboard operasional: total lead, kualitas per sumber, biaya per lead, hingga laporan funnel penjualan.',
    points: [
      'Kartu KPI: lead baru, berkualifikasi, menang',
      'Funnel konversi per tahap',
      'Kinerja kampanye berdasarkan kanal',
    ],
    forWho: 'Manajemen yang membutuhkan angka yang bisa langsung ditindaklanjuti.',
  },
]

export const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Audit funnel & data',
    body: 'Kami petakan sumber lead saat ini, waktu respons rata-rata, dan metrik yang sudah tercatat.',
  },
  {
    step: '02',
    title: 'Susun alur form → CRM',
    body: 'Form inquiry, aturan duplikat, penugasan sales, dan notifikasi disiapkan lebih dahulu.',
  },
  {
    step: '03',
    title: 'Jalankan & lacak kampanye',
    body: 'Kampanye per kanal dihubungkan ke landing page dengan parameter UTM yang konsisten.',
  },
  {
    step: '04',
    title: 'Tinjau mingguan',
    body: 'Kualitas lead per kanal ditinjau tiap minggu, anggaran dialihkan ke kanal yang terbukti.',
  },
]

export const WHY_US = [
  {
    title: 'Satu alur, bukan banyak alat',
    body: 'Form, CRM, penugasan, notifikasi, dan laporan berjalan dalam satu sistem sehingga data tidak perlu disalin manual.',
  },
  {
    title: 'Sumber kampanye selalu tercatat',
    body: 'Setiap lead membawa utm_source, utm_medium, dan utm_campaign sehingga tim dapat membandingkan kualitas antar kanal.',
  },
  {
    title: 'Metrik yang bisa ditindaklanjuti',
    body: 'Dashboard menampilkan waktu respons, lead belum disentuh, dan nilai pipeline — bukan hanya jumlah kunjungan.',
  },
  {
    title: 'Ringan untuk tim kecil',
    body: 'Konfigurasi sederhana dan peran pengguna yang jelas. Tidak butuh tim IT khusus untuk mulai.',
  },
]

export const CASE_STUDIES = [
  {
    slug: 'klinik-sehat-bersama',
    client: 'Klinik Sehat Bersama',
    industry: 'Kesehatan',
    segment: 'UMKM',
    headline: 'Waktu respons turun dari 9 jam menjadi 42 menit',
    summary:
      'Sebelumnya inquiry dari Instagram dan website dibalas manual dari dua akun berbeda. Setelah form dan CRM disatukan, semua prospek masuk ke satu daftar dengan penugasan otomatis.',
    metrics: [
      { label: 'Waktu respons pertama', before: '9 jam', after: '42 menit' },
      { label: 'Lead dengan sumber tercatat', before: '38%', after: '96%' },
      { label: 'Lead duplikat per bulan', before: '54', after: '6' },
    ],
    channels: ['Organic Search', 'Meta Ads', 'Direct'],
    quote:
      'Yang paling terasa: kami akhirnya tahu prospek dari mana yang benar-benar datang ke klinik.',
    author: 'Dewi Kartika, Manajer Operasional',
  },
  {
    slug: 'pt-tekstil-mandiri',
    client: 'PT Tekstil Mandiri',
    industry: 'Manufaktur B2B',
    segment: 'B2B',
    headline: 'Pipeline 90 hari yang akhirnya bisa diprediksi',
    summary:
      'Siklus penjualan panjang membuat tim sales sulit memperkirakan pendapatan. Tahap pipeline dan proyeksi berbobot probabilitas memberi gambaran yang lebih realistis.',
    metrics: [
      { label: 'Deal terbuka dengan tahap jelas', before: '31%', after: '100%' },
      { label: 'Akurasi proyeksi kuartal', before: '±35%', after: '±11%' },
      { label: 'Follow-up tepat waktu', before: '46%', after: '88%' },
    ],
    channels: ['Google Ads', 'LinkedIn', 'Referral'],
    quote:
      'Proyeksi kuartal kami tidak lagi tebak-tebakan, karena setiap deal punya tahap dan tanggal perkiraan.',
    author: 'Lukman Halim, Head of Sales',
  },
  {
    slug: 'digital-kreasi-agency',
    client: 'CV Digital Kreasi',
    industry: 'Agensi Digital',
    segment: 'Agensi',
    headline: 'Pelaporan 7 klien dalam satu dashboard',
    summary:
      'Tim agensi harus menyusun laporan manual per klien setiap minggu. Dengan kategori kanal dan kampanye terpisah, laporan bisa disusun tanpa ekspor data ulang.',
    metrics: [
      { label: 'Waktu menyusun laporan mingguan', before: '6 jam', after: '45 menit' },
      { label: 'Kampanye aktif terpantau', before: '4', after: '17' },
      { label: 'Kualitas lead per kanal terukur', before: 'Tidak ada', after: 'Semua kanal' },
    ],
    channels: ['Google Ads', 'Meta Ads', 'Email Campaign'],
    quote:
      'Waktu yang dulu dipakai merapikan spreadsheet sekarang dipakai memperbaiki kreatif iklan.',
    author: 'Gilang Permata, Founder',
  },
]

export const TESTIMONIALS = [
  {
    quote:
      'Kami tidak kehilangan prospek lagi setelah form masuk langsung jadi lead dan muncul di dashboard sales.',
    name: 'Indah Utami',
    role: 'Marketing Manager, PT Arta Properti',
  },
  {
    quote:
      'Laporan per kanal membuat kami berhenti membakar anggaran di kanal yang lead-nya tidak berkualitas.',
    name: 'Taufik Santoso',
    role: 'Owner, Bengkel Prima Motor',
  },
  {
    quote:
      'Implementasi dasar selesai dua minggu, dan tim sales sudah terbiasa pada minggu pertama.',
    name: 'Grace Sihombing',
    role: 'Head of Growth, CV Mitra Karya',
  },
]

export const CLIENT_LOGOS = [
  'Sinar Abadi',
  'Mitra Karya',
  'Prima Motor',
  'Arta Properti',
  'Digital Kreasi',
  'Tekstil Mandiri',
  'Logistik Cepat',
  'Kopi Nusantara',
]

export const FAQS = [
  {
    question: 'Berapa lama implementasi awal?',
    answer:
      'Untuk satu tim kecil, alur dasar form → CRM → penugasan → notifikasi biasanya selesai dalam 2–3 minggu, sudah termasuk penyesuaian isi formulir.',
  },
  {
    question: 'Apakah data lama dari spreadsheet bisa dipindahkan?',
    answer:
      'Bisa. Kami menyiapkan pemetaan kolom dan membersihkan duplikat berdasarkan email atau nomor telepon sebelum data dimasukkan.',
  },
  {
    question: 'Bagaimana jika kami hanya butuh satu kanal dulu?',
    answer:
      'Justru itu yang kami sarankan. Mulai dari kanal yang paling banyak menghasilkan lead, ukur 30 hari, lalu tambahkan kanal lain setelah metrik dasarnya stabil.',
  },
  {
    question: 'Apakah bisa terhubung ke WhatsApp?',
    answer:
      'Bisa, melalui penyedia resmi WhatsApp Business API. Kami juga menyiapkan pencatatan persetujuan komunikasi agar sesuai kebijakan privasi.',
  },
  {
    question: 'Bagaimana perhitungan Return on Ad Spend?',
    answer:
      'ROAS dihitung dari nilai deal yang menang dibandingkan realisasi belanja kampanye. Karena itu pencatatan anggaran dan nilai deal perlu diisi konsisten.',
  },
]

export const STATS = [
  { value: '< 1 jam', label: 'Target waktu respons lead baru' },
  { value: '96%', label: 'Lead dengan sumber kampanye tercatat' },
  { value: '6 tahap', label: 'Tahap pipeline dari New sampai Won' },
  { value: '1 dashboard', label: 'Untuk marketing, sales, dan manajemen' },
]
