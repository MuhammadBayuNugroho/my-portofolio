"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { SITE_CONFIG } from "@/constants/site";
import { fadeUpVariants, staggerContainerVariants } from "@/lib/animations";
import fotoUtama from "../../../../public/foto-utama.png";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-12 lg:py-20 flex flex-col justify-center bg-background">
      {/* Background radial highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.08),transparent_40%)]" />
      
      <motion.div
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center px-4"
      >
        {/* Profile Image */}
        <motion.div
          variants={fadeUpVariants}
          className="relative h-28 w-28 rounded-full overflow-hidden border-2 border-border/80 shadow-soft mx-auto mb-4 bg-background-elevated"
        >
          <Image
            src={fotoUtama}
            alt={SITE_CONFIG.name}
            fill
            priority
            className="object-cover"
          />
        </motion.div>

        {/* Availability Badge */}
        <motion.div variants={fadeUpVariants} className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background-elevated px-4 py-1.5 text-xs text-foreground-muted shadow-soft dark:shadow-dark-soft">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse-slow" />
          <span>Tersedia untuk Kolaborasi & Proyek Baru</span>
        </motion.div>

        {/* Big Apple Headline */}
        <motion.h1
          variants={fadeUpVariants}
          className="font-display text-display tracking-tight text-foreground mb-4 max-w-4xl mx-auto"
        >
          Membangun Pengalaman Digital Melalui{" "}
          <span className="gradient-text font-bold">Kode, Desain & Kepemimpinan</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          variants={fadeUpVariants}
          className="text-body-lg text-foreground-muted max-w-2xl mx-auto mb-6"
        >
          Halo, saya <span className="text-foreground font-semibold">{SITE_CONFIG.name}</span>. {SITE_CONFIG.shortBio}
        </motion.p>

        {/* Call to Actions */}
        <motion.div variants={fadeUpVariants} className="flex flex-wrap justify-center gap-4 mb-10">
          <Button variant="primary" size="lg" asChild>
            <Link href="/projects">Lihat Portofolio</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/contact">Hubungi Saya</Link>
          </Button>
        </motion.div>

        {/* Quick Stats Grid */}
        <motion.div
          variants={fadeUpVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto border-t border-border/60 pt-10"
        >
          {[
            { label: "Pengalaman Kerja", value: SITE_CONFIG.stats.experience },
            { label: "Proyek Selesai", value: SITE_CONFIG.stats.projects },
            { label: "Organisasi Dipimpin", value: SITE_CONFIG.stats.organizations },
            { label: "Sertifikasi Profesional", value: SITE_CONFIG.stats.certifications },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <p className="font-display text-h2 font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-xs text-foreground-muted">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
