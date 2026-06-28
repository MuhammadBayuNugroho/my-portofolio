"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Container } from "../Container";
import { fadeUpVariants, staggerContainerVariants, viewportOptions } from "@/lib/animations";
import { User, ShieldAlert, Award, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function About() {
  return (
    <section className="section-padding bg-background-elevated/40 border-y border-border/40">
      <Container>
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
        >
          {/* Left: Heading & Intro */}
          <div className="lg:col-span-5">
            <motion.div variants={fadeUpVariants} className="inline-flex items-center gap-2 rounded-full bg-accent-muted/20 px-3 py-1 text-xs font-semibold text-accent mb-4">
              <User size={12} />
              <span>Tentang Saya</span>
            </motion.div>
            
            <motion.h2 variants={fadeUpVariants} className="font-display text-h1 text-foreground mb-6">
              Mewujudkan Visi Melalui Desain Sistem & Kode
            </motion.h2>

            <motion.p variants={fadeUpVariants} className="text-body text-foreground-muted mb-6 leading-relaxed">
              Saya adalah seorang pengembang frontend yang memiliki antusiasme mendalam terhadap seni desain grafis dan arsitektur web modern. Dengan latar belakang kepemimpinan organisasi, saya selalu berusaha menyatukan performa teknis (clean code) dengan rasa keindahan estetika minimalis.
            </motion.p>

            <motion.p variants={fadeUpVariants} className="text-body text-foreground-muted mb-8 leading-relaxed">
              Fokus utama saya saat ini adalah membangun antarmuka web interaktif yang scalable, mudah dipelihara, dan memiliki aksesibilitas serta performa optimal untuk audiens global.
            </motion.p>

            <motion.div variants={fadeUpVariants}>
              <Link href="/about" className="inline-flex items-center gap-1.5 text-accent font-medium hover:text-accent-hover transition-colors text-caption">
                Selengkapnya tentang perjalanan saya
                <ArrowUpRight size={16} />
              </Link>
            </motion.div>
          </div>

          {/* Right: Core Pillars Card Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="flex flex-col justify-between min-h-[200px]" hoverEffect={true}>
              <div>
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-4">
                  <Award size={20} />
                </div>
                <h3 className="font-display text-h3 text-foreground mb-2">Desainer UI/UX</h3>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  Menyusun design systems komprehensif berbasis token di Figma untuk konsistensi visual produk jangka panjang.
                </p>
              </div>
            </Card>

            <Card className="flex flex-col justify-between min-h-[200px]" hoverEffect={true}>
              <div>
                <div className="h-10 w-10 rounded-lg bg-violet/10 flex items-center justify-center text-violet mb-4">
                  <User size={20} />
                </div>
                <h3 className="font-display text-h3 text-foreground mb-2">Frontend Dev</h3>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  Implementasi Next.js & TypeScript yang strict untuk menghasilkan aplikasi web yang andal dan SEO-friendly.
                </p>
              </div>
            </Card>

            <Card className="flex flex-col justify-between min-h-[200px]" hoverEffect={true}>
              <div>
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center text-success mb-4">
                  <ShieldAlert size={20} />
                </div>
                <h3 className="font-display text-h3 text-foreground mb-2">Kepemimpinan</h3>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  Berpengalaman memimpin tim kepengurusan organisasi mahasiswa dengan pendekatan transformasi digital.
                </p>
              </div>
            </Card>

            <Card className="flex flex-col justify-between min-h-[200px]" hoverEffect={true}>
              <div>
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-4">
                  <Award size={20} />
                </div>
                <h3 className="font-display text-h3 text-foreground mb-2">AI Enthusiast</h3>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  Memanfaatkan AI workflow untuk meningkatkan efisiensi pengembangan dan eksplorasi desain produk.
                </p>
              </div>
            </Card>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
