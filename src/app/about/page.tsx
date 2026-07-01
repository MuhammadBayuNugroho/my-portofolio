"use client";

import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { Container } from "@/components/public/Container";
import { Card } from "@/components/ui/Card";
import { SITE_CONFIG } from "@/constants/site";
import { User, Award, Shield, FileText, ArrowRight, Star } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUpVariants, staggerContainerVariants } from "@/lib/animations";
import fotoAbout from "@/assets/foto-about.jpg";

export default function AboutPage() {
  const values = [
    {
      title: "Kualitas & Presisi",
      desc: "Menulis kode yang bersih, terdokumentasi, dan terstruktur rapi dengan performa render secepat kilat.",
      icon: Shield,
      color: "text-accent",
    },
    {
      title: "Estetika Minimalis",
      desc: "Mengedepankan visual premium, bersih, dan berfokus pada kemudahan interaksi pengguna layaknya gaya Apple.",
      icon: Star,
      color: "text-violet",
    },
    {
      title: "Kepemimpinan Digital",
      desc: "Mentransformasikan proses kepengurusan organisasi melalui otomatisasi sistem digital yang andal.",
      icon: Award,
      color: "text-success",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-16">
        <Container>
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-16"
          >
            {/* Intro Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Profile Photo Card */}
              <motion.div variants={fadeUpVariants} className="lg:col-span-5 relative aspect-square max-w-sm mx-auto lg:max-w-none w-full rounded-2xl overflow-hidden border border-border bg-background-elevated shadow-card">
                <Image
                  src={fotoAbout}
                  alt={SITE_CONFIG.name}
                  fill
                  priority
                  className="object-cover object-top"
                  unoptimized
                />
              </motion.div>

              {/* Text Info */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <motion.div variants={fadeUpVariants} className="inline-flex self-start items-center gap-2 rounded-full bg-accent-muted/20 px-3 py-1 text-xs font-semibold text-accent">
                  <User size={12} />
                  <span>Tentang Pengembang</span>
                </motion.div>

                <motion.h1 variants={fadeUpVariants} className="font-display text-display tracking-tight text-foreground">
                  Muhammad Bayu Nugroho
                </motion.h1>

                <motion.p variants={fadeUpVariants} className="text-body text-foreground-muted leading-relaxed">
                  Halo! Saya adalah seorang Frontend Developer, UI/UX Designer, dan Graphic Designer yang berbasis di Indonesia. Saya memiliki hasrat mendalam untuk merekayasa aplikasi web yang intuitif, cepat, serta memadukannya dengan identitas visual yang premium dan elegan.
                </motion.p>

                <motion.p variants={fadeUpVariants} className="text-body text-foreground-muted leading-relaxed">
                  Selain berkutat dengan kode pemrograman, saya memiliki pengalaman luas memimpin kepengurusan organisasi mahasiswa. Saya percaya bahwa kombinasi antara keahlian teknis tingkat tinggi, rasa estetika visual, serta kemampuan kepemimpinan kolaboratif adalah kunci utama dalam menciptakan produk digital berdampak luas.
                </motion.p>

                <motion.div variants={fadeUpVariants} className="flex flex-wrap gap-4 mt-4">
                  <a href={SITE_CONFIG.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center font-sans font-medium rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-accent cursor-pointer bg-accent text-accent-foreground hover:bg-accent-hover px-4 py-2 text-caption gap-2">
                    Unduh Resume / CV
                    <FileText size={16} />
                  </a>
                  <a href="/contact" className="inline-flex items-center justify-center font-sans font-medium rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-accent cursor-pointer bg-background-elevated text-foreground hover:bg-background-overlay border border-border px-4 py-2 text-caption gap-2">
                    Mari Mulai Proyek
                    <ArrowRight size={16} />
                  </a>
                </motion.div>
              </div>
            </div>

            {/* Core Values / Pilar Utama */}
            <div className="flex flex-col gap-8">
              <div className="text-center max-w-xl mx-auto">
                <motion.h2 variants={fadeUpVariants} className="font-display text-h1 text-foreground mb-3">
                  Pilar Profesional Saya
                </motion.h2>
                <motion.p variants={fadeUpVariants} className="text-xs text-foreground-muted">
                  Prinsip utama yang saya pegang teguh dalam setiap baris kode dan keputusan desain visual.
                </motion.p>
              </div>

              <motion.div
                variants={staggerContainerVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                {values.map((val, idx) => (
                  <motion.div key={idx} variants={fadeUpVariants}>
                    <Card className="p-6 h-full flex flex-col justify-between" hoverEffect={true}>
                      <div>
                        <div className={`h-12 w-12 rounded-lg bg-background-overlay flex items-center justify-center mb-6 ${val.color}`}>
                          <val.icon size={24} />
                        </div>
                        <h3 className="font-display text-h3 text-foreground mb-3 font-semibold">
                          {val.title}
                        </h3>
                        <p className="text-xs text-foreground-muted leading-relaxed">
                          {val.desc}
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
