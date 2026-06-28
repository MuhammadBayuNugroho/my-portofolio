import type { LucideIcon } from "lucide-react";
import {
  Home,
  User,
  Compass,
  Code2,
  FolderOpen,
  Image,
  Briefcase,
  Award,
  BookOpen,
  MessageSquare,
  Mail,
  LayoutDashboard,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────
// NAVIGATION ITEM TYPES
// ─────────────────────────────────────────────────────────────────
export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string; // For mega-menu / tooltip
}

// ─────────────────────────────────────────────────────────────────
// PUBLIC NAVIGATION MENU
// ─────────────────────────────────────────────────────────────────
export const PUBLIC_NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: Home,
    description: "Beranda utama",
  },
  {
    label: "About",
    href: "/about",
    icon: User,
    description: "Tentang saya & profil",
  },
  {
    label: "Skills",
    href: "/skills",
    icon: Code2,
    description: "Keahlian & kompetensi",
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderOpen,
    description: "Portofolio proyek",
  },
  {
    label: "Experience",
    href: "/experience",
    icon: Briefcase,
    description: "Pengalaman profesional",
  },
  {
    label: "Certificates",
    href: "/certificates",
    icon: Award,
    description: "Sertifikasi & pencapaian",
  },
  {
    label: "Blog",
    href: "/blog",
    icon: BookOpen,
    description: "Artikel & tulisan",
  },
  {
    label: "Testimonials",
    href: "/testimonials",
    icon: MessageSquare,
    description: "Testimoni & ulasan",
  },
  {
    label: "Contact",
    href: "/contact",
    icon: Mail,
    description: "Hubungi saya",
  },
];

// ─────────────────────────────────────────────────────────────────
// ADMIN DASHBOARD SIDEBAR NAVIGATION
// ─────────────────────────────────────────────────────────────────
export interface AdminNavItem extends NavItem {
  badge?: string;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Projects",
    href: "/admin/projects",
    icon: FolderOpen,
  },
  {
    label: "Gallery",
    href: "/admin/gallery",
    icon: Image,
  },
  {
    label: "Blog",
    href: "/admin/blog",
    icon: BookOpen,
  },
  {
    label: "Experience",
    href: "/admin/experience",
    icon: Briefcase,
  },
  {
    label: "Journey",
    href: "/admin/journey",
    icon: Compass,
  },
  {
    label: "Certificates",
    href: "/admin/certificates",
    icon: Award,
  },
  {
    label: "Testimonials",
    href: "/admin/testimonials",
    icon: MessageSquare,
  },
  {
    label: "Skills",
    href: "/admin/skills",
    icon: Code2,
  },
];
