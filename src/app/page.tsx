import type { Metadata } from "next";
import { Navbar } from "@/components/public/Navbar";
import { Hero } from "@/components/public/home/Hero";
import { About } from "@/components/public/home/About";
import { SkillsPreview } from "@/components/public/home/SkillsPreview";
import { Contact } from "@/components/public/home/Contact";
import { Footer } from "@/components/public/Footer";
import { SITE_CONFIG } from "@/constants/site";

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} — Frontend Developer & Designer`,
  description: SITE_CONFIG.shortBio,
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Hero />
        <About />
        <SkillsPreview />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
