import type {
  Project,
  Blog,
  Certificate,
  GalleryItem,
  Journey,
  Experience,
  Testimonial,
  Skill,
  ProjectCategory,
  CertificateCategory,
  GalleryCategory,
} from "@/types";

// ─────────────────────────────────────────────────────────────────
// 20 SKILLS DUMMY DATA
// ─────────────────────────────────────────────────────────────────
export const DUMMY_SKILLS: Skill[] = [
  // Frontend
  { id: "sk-1", name: "Next.js", category: "Frontend", level: "Expert", percentage: 95, order: 1, createdAt: "2026-06-27" },
  { id: "sk-2", name: "React.js", category: "Frontend", level: "Expert", percentage: 95, order: 2, createdAt: "2026-06-27" },
  { id: "sk-3", name: "TypeScript", category: "Frontend", level: "Advanced", percentage: 90, order: 3, createdAt: "2026-06-27" },
  { id: "sk-4", name: "TailwindCSS", category: "Frontend", level: "Expert", percentage: 95, order: 4, createdAt: "2026-06-27" },
  { id: "sk-5", name: "Framer Motion", category: "Frontend", level: "Advanced", percentage: 85, order: 5, createdAt: "2026-06-27" },
  { id: "sk-6", name: "Redux Toolkit", category: "Frontend", level: "Intermediate", percentage: 80, order: 6, createdAt: "2026-06-27" },

  // Design
  { id: "sk-7", name: "Figma (UI/UX)", category: "Design", level: "Expert", percentage: 92, order: 7, createdAt: "2026-06-27" },
  { id: "sk-8", name: "Adobe Illustrator", category: "Design", level: "Expert", percentage: 90, order: 8, createdAt: "2026-06-27" },
  { id: "sk-9", name: "Adobe Photoshop", category: "Design", level: "Advanced", percentage: 85, order: 9, createdAt: "2026-06-27" },
  { id: "sk-10", name: "Design Systems", category: "Design", level: "Expert", percentage: 90, order: 10, createdAt: "2026-06-27" },
  { id: "sk-11", name: "Branding & Identity", category: "Design", level: "Advanced", percentage: 88, order: 11, createdAt: "2026-06-27" },

  // Backend
  { id: "sk-12", name: "Node.js", category: "Backend", level: "Intermediate", percentage: 75, order: 12, createdAt: "2026-06-27" },
  { id: "sk-13", name: "REST APIs", category: "Backend", level: "Advanced", percentage: 85, order: 13, createdAt: "2026-06-27" },
  { id: "sk-14", name: "Google Apps Script", category: "Backend", level: "Advanced", percentage: 88, order: 14, createdAt: "2026-06-27" },

  // Tools
  { id: "sk-15", name: "Git & GitHub", category: "Tools", level: "Advanced", percentage: 90, order: 15, createdAt: "2026-06-27" },
  { id: "sk-16", name: "VS Code", category: "Tools", level: "Expert", percentage: 95, order: 16, createdAt: "2026-06-27" },
  { id: "sk-17", name: "Vercel & Netlify", category: "Tools", level: "Advanced", percentage: 90, order: 17, createdAt: "2026-06-27" },

  // Soft Skills
  { id: "sk-18", name: "Leadership", category: "Soft Skills", level: "Expert", percentage: 95, order: 18, createdAt: "2026-06-27" },
  { id: "sk-19", name: "Communication", category: "Soft Skills", level: "Expert", percentage: 92, order: 19, createdAt: "2026-06-27" },
  { id: "sk-20", name: "Problem Solving", category: "Soft Skills", level: "Advanced", percentage: 90, order: 20, createdAt: "2026-06-27" },
];

// ─────────────────────────────────────────────────────────────────
// 10 JOURNEY DUMMY DATA
// ─────────────────────────────────────────────────────────────────
export const DUMMY_JOURNEY: Journey[] = [
  {
    id: "jr-1",
    year: "2026",
    title: "Digital Leadership Award",
    organization: "Youth Tech Foundation",
    role: "Penerima Penghargaan",
    description: "Penghargaan atas kepemimpinan dalam mendigitalisasi program kerja organisasi mahasiswa tingkat nasional.",
    type: "Achievement",
    highlight: true,
    createdAt: "2026-06-27",
  },
  {
    id: "jr-2",
    year: "2025",
    title: "Ketua Umum Himpunan Mahasiswa",
    organization: "Universitas Indonesia",
    role: "Ketua Umum",
    description: "Memimpin 150+ anggota aktif, menjalankan program transformasi digital hub organisasi, dan meluncurkan 12 proyek internal.",
    type: "Leadership",
    highlight: true,
    createdAt: "2026-06-27",
  },
  {
    id: "jr-3",
    year: "2024",
    title: "Juara 1 Web Design Competition",
    organization: "National Informatics Festival",
    role: "Pemenang Utama",
    description: "Juara pertama desain portofolio dengan performa Lighthouse 100 dan interface bergaya Apple Glassmorphism.",
    type: "Achievement",
    highlight: true,
    createdAt: "2026-06-27",
  },
  {
    id: "jr-4",
    year: "2024",
    title: "Internship Frontend Developer",
    organization: "Agensi Desain Creative Loop",
    role: "Frontend Engineer Intern",
    description: "Mengembangkan interactive user interfaces untuk 8 klien global menggunakan Next.js dan TailwindCSS.",
    type: "Career",
    highlight: false,
    createdAt: "2026-06-27",
  },
  {
    id: "jr-5",
    year: "2023",
    title: "Studi S1 Teknik Informatika",
    organization: "Universitas Indonesia",
    role: "Mahasiswa",
    description: "Fokus pada interaksi manusia dan komputer (HCI), rekayasa perangkat lunak, dan kecerdasan buatan.",
    type: "Education",
    highlight: false,
    createdAt: "2026-06-27",
  },
  {
    id: "jr-6",
    year: "2023",
    title: "Relawan Pengajar Desain Grafis",
    organization: "Komunitas Berbagi Ilmu",
    role: "Instruktur Sukarela",
    description: "Mengajarkan dasar-dasar UI/UX menggunakan Figma kepada 50+ anak muda kurang mampu.",
    type: "Volunteer",
    highlight: false,
    createdAt: "2026-06-27",
  },
  {
    id: "jr-7",
    year: "2022",
    title: "Freelance Graphic Designer",
    organization: "99designs & Upwork",
    role: "Freelance Designer",
    description: "Membuat branding identity, logo, dan marketing assets untuk puluhan startup mancanegara.",
    type: "Career",
    highlight: false,
    createdAt: "2026-06-27",
  },
  {
    id: "jr-8",
    year: "2022",
    title: "Wakil Ketua OSIS",
    organization: "SMA Negeri 1 Jakarta",
    role: "Wakil Ketua",
    description: "Mengkoordinasi 10 divisi ekstrakurikuler dan memimpin penyelenggaraan Pentas Seni tahunan dengan 3000+ pengunjung.",
    type: "Leadership",
    highlight: false,
    createdAt: "2026-06-27",
  },
  {
    id: "jr-9",
    year: "2021",
    title: "Sertifikasi Desain Adobe Illustrator",
    organization: "Adobe Certified Professional",
    role: "Certified Specialist",
    description: "Sertifikasi keahlian profesional dalam pembuatan asset ilustrasi berbasis vektor.",
    type: "Education",
    highlight: false,
    createdAt: "2026-06-27",
  },
  {
    id: "jr-10",
    year: "2020",
    title: "Memulai Belajar Pemrograman Web",
    organization: "Self-Taught / Otodidak",
    role: "Pembelajar",
    description: "Memulai eksplorasi HTML, CSS, JavaScript, dan framework CSS modern.",
    type: "Education",
    highlight: false,
    createdAt: "2026-06-27",
  },
];

// ─────────────────────────────────────────────────────────────────
// 8 EXPERIENCE DUMMY DATA
// ─────────────────────────────────────────────────────────────────
export const DUMMY_EXPERIENCE: Experience[] = [
  {
    id: "ex-1",
    title: "Lead Frontend Engineer",
    organization: "Vercel Partners Agensi",
    location: "Jakarta, Remote",
    startDate: "2025-01-01",
    isCurrent: true,
    description: "Memimpin tim frontend dalam mengimplementasikan desain modular di atas framework Next.js 15, mengoptimalkan FCP dan LCP web hingga di bawah 1 detik.",
    highlights: ["Memimpin tim dengan 4 pengembang junior", "Peningkatan performa web sebesar 40%", "Penerapan metodologi Clean Architecture"],
    type: "Professional",
    createdAt: "2026-06-27",
  },
  {
    id: "ex-2",
    title: "Ketua Umum Himpunan Mahasiswa",
    organization: "HMIF Universitas Indonesia",
    location: "Depok, Indonesia",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    isCurrent: false,
    description: "Mengendalikan operasional organisasi mahasiswa teknik informatika, menyusun rencana kerja tahunan digitalisasi berkas, serta menjalin kolaborasi dengan partner korporat.",
    highlights: ["Mengelola anggaran internal", "Mendigitalisasi dokumen operasional", "Meningkatkan engagement anggota"],
    type: "Organizational",
    createdAt: "2026-06-27",
  },
  {
    id: "ex-3",
    title: "Senior UI/UX Designer & Developer",
    organization: "Design Hub Studio",
    location: "Bandung, Indonesia",
    startDate: "2023-08-01",
    endDate: "2024-12-31",
    isCurrent: false,
    description: "Merancang desain sistem terpadu (design system tokens) berbasis Figma untuk 5 produk SaaS dan mengimplementasikannya dalam bentuk UI Component Next.js.",
    highlights: ["Merancang design system terpadu", "Kolaborasi erat dengan tim produk", "Redesain UI/UX web korporasi"],
    type: "Professional",
    createdAt: "2026-06-27",
  },
  {
    id: "ex-4",
    title: "Freelance Frontend Web Developer",
    organization: "Self-Employed",
    location: "Global, Remote",
    startDate: "2022-05-01",
    endDate: "2023-07-31",
    isCurrent: false,
    description: "Mengembangkan situs web portofolio, e-commerce landing pages, dan dashboard analytics untuk 25+ klien dari berbagai belahan dunia.",
    highlights: ["25+ klien sukses di seluruh dunia", "Rata-rata kepuasan klien 98%", "Integrasi payment gateway lokal"],
    type: "Freelance",
    createdAt: "2026-06-27",
  },
  {
    id: "ex-5",
    title: "Desainer Grafis Utama",
    organization: "Youth Leadership Forum",
    location: "Jakarta, Indonesia",
    startDate: "2022-01-01",
    endDate: "2022-10-31",
    isCurrent: false,
    description: "Menyusun panduan branding grafis, merchandise kit, dan seluruh aset sosial media promosi forum kepemimpinan pemuda nasional.",
    highlights: ["Menyusun panduan branding grafis", "Peningkatan jangkauan sosmed sebesar 120%", "Desain merchandise & media promosi"],
    type: "Organizational",
    createdAt: "2026-06-27",
  },
  {
    id: "ex-6",
    title: "Mentor Sukarela Coding & Design",
    organization: "Sekolah Dasar Binaan Indonesia",
    location: "Jakarta, Indonesia",
    startDate: "2021-06-01",
    endDate: "2021-12-31",
    isCurrent: false,
    description: "Mengajarkan konsep dasar coding block dan pembuatan desain grafis menggunakan perangkat lunak gratis kepada anak-anak usia sekolah dasar.",
    highlights: ["Membimbing 30 anak didik", "Menggunakan kurikulum interaktif", "Membuat kontes desain mini"],
    type: "Volunteer",
    createdAt: "2026-06-27",
  },
  {
    id: "ex-7",
    title: "Intern UI Designer",
    organization: "Agensi Koding Creative Loop",
    location: "Depok, Indonesia",
    startDate: "2020-09-01",
    endDate: "2020-12-31",
    isCurrent: false,
    description: "Mendukung desainer senior dalam merancang komponen antarmuka web, merekonstruksi wireframe, dan membuat mockup representatif.",
    highlights: ["Mendukung desainer senior", "Merancang wireframe interaktif", "Belajar metodologi UI/UX"],
    type: "Professional",
    createdAt: "2026-06-27",
  },
  {
    id: "ex-8",
    title: "Kepala Hubungan Masyarakat",
    organization: "OSIS SMA Negeri 1 Jakarta",
    location: "Jakarta, Indonesia",
    startDate: "2020-01-01",
    endDate: "2020-12-31",
    isCurrent: false,
    description: "Menjembatani komunikasi internal pengurus OSIS dengan komite sekolah dan pihak luar, serta mengelola kanal informasi resmi sekolah.",
    highlights: ["Menjembatani komunikasi internal", "Mengelola publikasi media massa", "Menggalang kerjasama sponsorship"],
    type: "Organizational",
    createdAt: "2026-06-27",
  },
];

// ─────────────────────────────────────────────────────────────────
// 6 TESTIMONIAL DUMMY DATA
// ─────────────────────────────────────────────────────────────────
export const DUMMY_TESTIMONIALS: Testimonial[] = [
  {
    id: "ts-1",
    authorName: "Alexander Wright",
    authorRole: "Product Director",
    authorOrganization: "InnoTech Solutions",
    authorImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    content: "Bayu adalah developer yang langka. Dia tidak hanya menulis kode yang sangat rapi dan berkinerja tinggi, tetapi juga memiliki mata desainer yang jeli dalam menyeimbangkan estetika minimalis dengan efisiensi interaksi.",
    rating: 5,
    relation: "Client",
    status: "Published",
    featured: true,
    createdAt: "2026-06-27",
  },
  {
    id: "ts-2",
    authorName: "Budi Santoso",
    authorRole: "Chief Technology Officer",
    authorOrganization: "Fintech Nusantara",
    authorImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    content: "Pekerjaan migrasi dashboard kami ke Next.js yang dilakukan oleh Bayu berjalan sangat lancar. Performa LCP naik drastis dan tim developer internal kami menyukai design system modular yang dibuatnya.",
    rating: 5,
    relation: "Client",
    status: "Published",
    featured: true,
    createdAt: "2026-06-27",
  },
  {
    id: "ts-3",
    authorName: "Sarah Amalia",
    authorRole: "Wakil Ketua Himpunan",
    authorOrganization: "HMIF Universitas Indonesia",
    authorImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    content: "Sebagai Ketua Himpunan, Bayu berhasil menyatukan tim desainer dan developer untuk mendigitalisasi seluruh administrasi kami. Kepemimpinannya mengayomi, visioner, dan sangat terorganisir dengan rapi.",
    rating: 5,
    relation: "Colleague",
    status: "Published",
    featured: true,
    createdAt: "2026-06-27",
  },
  {
    id: "ts-4",
    authorName: "Devon Reynolds",
    authorRole: "Lead Creative Specialist",
    authorOrganization: "Creative Loop Agency",
    authorImageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
    content: "Selama internship, Bayu menunjukkan inisiatif yang luar biasa. Ia cepat mengadopsi framework Next.js dan secara konsisten memberikan alternatif desain visual yang segar dan profesional.",
    rating: 5,
    relation: "Mentor",
    status: "Published",
    featured: false,
    createdAt: "2026-06-27",
  },
  {
    id: "ts-5",
    authorName: "Fajar Nugraha",
    authorRole: "Head of Marketing",
    authorOrganization: "SaaS Booster",
    authorImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    content: "Desain identitas visual yang diciptakan Bayu membuat brand kami terlihat menonjol dan tepercaya di mata investor. Ia sangat profesional dan selalu memberikan update pengerjaan tepat waktu.",
    rating: 5,
    relation: "Client",
    status: "Published",
    featured: false,
    createdAt: "2026-06-27",
  },
  {
    id: "ts-6",
    authorName: "Lia Clarissa",
    authorRole: "Frontend Engineer Intern",
    authorOrganization: "Design Hub Studio",
    authorImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    content: "Dibimbing langsung oleh Mas Bayu selama pengerjaan komponen design system memberikan saya pemahaman yang mendalam tentang atomic design dan bagaimana menulis kode TypeScript yang aman.",
    rating: 5,
    relation: "Supervisee",
    status: "Published",
    featured: false,
    createdAt: "2026-06-27",
  },
];

// ─────────────────────────────────────────────────────────────────
// 12 PROJECTS DUMMY DATA
// ─────────────────────────────────────────────────────────────────
export const DUMMY_PROJECTS: Project[] = Array.from({ length: 12 }).map((_, i) => {
  const index = i + 1;
  const categories: ProjectCategory[] = ["Web", "UI/UX", "Graphic Design", "Mobile App", "Open Source"];
  const category = categories[i % categories.length];

  return {
    id: `pr-${index}`,
    title: `Proyek Kreatif Bayu #${index} — ${category} Portfolio`,
    slug: `proyek-kreatif-bayu-${index}`,
    description: `Deskripsi proyek lengkap untuk Muhammad Bayu Nugroho portofolio ke-${index}. Proyek ini merupakan solusi modern untuk tantangan digital saat ini dengan visual eksklusif bergaya Apple dan optimasi performa tinggi.`,
    contentMarkdown: `# Studi Kasus Proyek #${index}\n\n## Latar Belakang\nProyek ini dirancang sebagai implementasi nyata dari konsep visual minimalis yang terintegrasi penuh dengan struktur kode bersih.\n\n## Solusi\nKami membangun arsitektur Next.js dengan state management global yang tangguh.\n\n## Hasil\nLighthouse score di atas 95 pada aspek performa, SEO, dan aksesibilitas.`,
    coverImage: `https://images.unsplash.com/photo-${1500000000000 + index * 10000}?w=600`,
    images: [
      `https://images.unsplash.com/photo-${1500000000000 + index * 10000}?w=600`,
      `https://images.unsplash.com/photo-${1510000000000 + index * 10000}?w=600`
    ],
    techStack: ["Next.js", "TailwindCSS", "TypeScript", "Framer Motion", "Figma"].slice(0, (i % 4) + 2),
    category,
    status: "Published",
    featured: i < 3,
    order: index,
    createdAt: "2026-06-27",
  };
});

// ─────────────────────────────────────────────────────────────────
// 15 BLOGS DUMMY DATA
// ─────────────────────────────────────────────────────────────────
export const DUMMY_BLOGS: Blog[] = Array.from({ length: 15 }).map((_, i) => {
  const index = i + 1;
  return {
    id: `bl-${index}`,
    title: `Membangun Web Cepat dan Modern Bagian ke-${index}`,
    slug: `membangun-web-cepat-dan-modern-bagian-${index}`,
    excerpt: `Artikel ulasan mendalam mengenai best practice pemrograman frontend Next.js, metodologi desain clean style, serta tips kepemimpinan di era digital.`,
    contentMarkdown: `# Panduan Pengembangan Web #${index}\n\nPengembangan web modern menuntut kita untuk selalu menjaga kualitas kode agar produk akhir tetap scalable.\n\n## Prinsip Clean Code\nTulis kode yang mudah dibaca oleh orang lain, bukan hanya mesin. Gunakan TypeScript tipe strict dan reusable helpers.`,
    coverImage: `https://images.unsplash.com/photo-${1520000000000 + index * 10000}?w=600`,
    tags: ["Frontend", "Design", "Leadership", "Next.js"].slice(0, (i % 3) + 1),
    category: i % 2 === 0 ? "Tech" : "Design",
    status: "Published",
    views: 120 + index * 14,
    readingTime: 3 + (i % 5),
    featured: i === 0,
    createdAt: "2026-06-27",
  };
});

// ─────────────────────────────────────────────────────────────────
// 20 CERTIFICATES DUMMY DATA
// ─────────────────────────────────────────────────────────────────
export const DUMMY_CERTIFICATES: Certificate[] = Array.from({ length: 20 }).map((_, i) => {
  const index = i + 1;
  const categories: CertificateCategory[] = ["Frontend", "Design", "Leadership", "Backend", "Cloud"];
  const category = categories[i % categories.length];

  return {
    id: `crt-${index}`,
    title: `Sertifikasi Keahlian ${category} Specialist #${index}`,
    issuer: `Lembaga Sertifikasi Global ${index}`,
    category,
    issueDate: "2025-06-27",
    credentialId: `ID-CERT-${100000 + index}`,
    credentialUrl: "https://credentials.example.com",
    imageUrl: `https://images.unsplash.com/photo-${1550000000000 + index * 10000}?w=600`,
    description: `Sertifikasi resmi yang membuktikan keahlian mendalam di bidang ${category} dengan pengujian komprehensif.`,
    status: "Active",
    featured: i < 4,
    createdAt: "2026-06-27",
  };
});

// ─────────────────────────────────────────────────────────────────
// 40 GALLERY DUMMY DATA
// ─────────────────────────────────────────────────────────────────
export const DUMMY_GALLERY: GalleryItem[] = Array.from({ length: 40 }).map((_, i) => {
  const index = i + 1;
  const categories: GalleryCategory[] = ["Web Design", "Graphic Design", "Branding", "Illustration", "UI/UX"];
  const category = categories[i % categories.length];

  return {
    id: `gal-${index}`,
    title: `Karya Seni Visual #${index}`,
    description: `Aset portfolio desain grafis bertema minimalis modern, dirancang oleh Muhammad Bayu Nugroho.`,
    imageUrl: `https://images.unsplash.com/photo-${1530000000000 + index * 5000}?w=800`,
    thumbnailUrl: `https://images.unsplash.com/photo-${1530000000000 + index * 5000}?w=400`,
    category,
    tags: ["Minimalist", "AppleStyle", "Creative", "Figma"].slice(0, (i % 3) + 2),
    status: "Published",
    featured: i < 6,
    order: index,
    createdAt: "2026-06-27",
  };
});
