"use client";

import { PageLayout } from "@/components/public/PageLayout";
import { Container } from "@/components/public/Container";
import { Card, Button, Modal } from "@/components/ui";
import { SITE_CONFIG } from "@/constants/site";
import {
  User,
  Award,
  Shield,
  FileText,
  ArrowRight,
  Star,
  Calendar,
  MapPin,
  GraduationCap,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUpVariants, staggerContainerVariants } from "@/lib/animations";
import useSWR from "swr";
import { experiencesApi, settingsApi } from "@/lib/api";
import fotoAbout from "../../../public/foto-about.jpg";

export default function AboutPage() {
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);

  const { data: experiences = [] } = useSWR("experiences", () =>
    experiencesApi.getAll().then((res) => res.data || [])
  );

  const { data: settings = [] } = useSWR("settings", () =>
    settingsApi.getAll().then((res) => res.data || [])
  );

  const dynamicResumeUrl = settings.find((s) => s.key === "resume_url")?.value;
  const resumeUrl = dynamicResumeUrl || SITE_CONFIG.resumeUrl;

  const educationHistory = experiences.filter((exp) =>
    ["Education", "Pendidikan"].includes(exp.type)
  );
  const latestEducation = educationHistory.length > 0 ? educationHistory[0] : null;

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
    <PageLayout mainClassName="py-16">
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
            <motion.div
              variants={fadeUpVariants}
              className="lg:col-span-5 relative aspect-square max-w-sm mx-auto lg:max-w-none w-full rounded-2xl overflow-hidden border border-border bg-background-elevated shadow-card"
            >
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
              <motion.div
                variants={fadeUpVariants}
                className="inline-flex self-start items-center gap-2 rounded-full bg-accent-muted/20 px-3 py-1 text-xs font-semibold text-accent"
              >
                <User size={12} />
                <span>Tentang Pengembang</span>
              </motion.div>

              <motion.h1
                variants={fadeUpVariants}
                className="font-display text-display tracking-tight text-foreground"
              >
                Muhammad Bayu Nugroho
              </motion.h1>

              <motion.p
                variants={fadeUpVariants}
                className="text-body text-foreground-muted leading-relaxed"
              >
                Halo! Saya adalah seorang Frontend Developer, UI/UX Designer, dan Graphic Designer
                yang berbasis di Indonesia. Saya memiliki hasrat mendalam untuk merekayasa aplikasi
                web yang intuitif, cepat, serta memadukannya dengan identitas visual yang premium dan
                elegan.
              </motion.p>

              <motion.p
                variants={fadeUpVariants}
                className="text-body text-foreground-muted leading-relaxed"
              >
                Selain berkutat dengan kode pemrograman, saya memiliki pengalaman luas memimpin
                kepengurusan organisasi mahasiswa. Saya percaya bahwa kombinasi antara keahlian
                teknis tingkat tinggi, rasa estetika visual, serta kemampuan kepemimpinan
                kolaboratif adalah kunci utama dalam menciptakan produk digital berdampak luas.
              </motion.p>

              <motion.div variants={fadeUpVariants} className="flex flex-wrap gap-4 mt-4">
                <Button variant="primary" size="md" asChild>
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-2"
                  >
                    Unduh Resume / CV
                    <FileText size={16} />
                  </a>
                </Button>
                <Button variant="secondary" size="md" asChild>
                  <a href="/contact" className="gap-2">
                    Mari Mulai Proyek
                    <ArrowRight size={16} />
                  </a>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Core Values / Pilar Utama */}
          <div className="flex flex-col gap-8">
            <div className="text-center max-w-xl mx-auto">
              <motion.h2
                variants={fadeUpVariants}
                className="font-display text-h1 text-foreground mb-3"
              >
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
                      <div
                        className={`h-12 w-12 rounded-lg bg-background-overlay flex items-center justify-center mb-6 ${val.color}`}
                      >
                        <val.icon size={24} />
                      </div>
                      <h3 className="font-display text-h3 text-foreground mb-3 font-semibold">
                        {val.title}
                      </h3>
                      <p className="text-xs text-foreground-muted leading-relaxed">{val.desc}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Jenjang Pendidikan Section */}
          {latestEducation && (
            <motion.div variants={fadeUpVariants} className="flex flex-col gap-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-success">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h2 className="font-display text-h3 text-foreground">Jenjang Pendidikan Terkini</h2>
                  <p className="text-[10px] text-foreground-muted">Riwayat akademis utama</p>
                </div>
              </div>

              <Card
                className="p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                hoverEffect={true}
              >
                <div className="flex-1">
                  <h3 className="font-display text-h3 font-bold text-foreground mb-1">
                    {latestEducation.title}
                  </h3>
                  <p className="text-sm font-medium text-foreground-muted mb-3">
                    {latestEducation.organization}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-foreground-subtle">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {latestEducation.startDate} —{" "}
                      {latestEducation.isCurrent ? "Sekarang" : latestEducation.endDate || "-"}
                    </span>
                    {latestEducation.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} />
                        {latestEducation.location}
                      </span>
                    )}
                  </div>
                </div>
                {educationHistory.length > 1 && (
                  <button
                    onClick={() => setIsEducationModalOpen(true)}
                    className="whitespace-nowrap px-4 py-2 bg-background-elevated hover:bg-background-overlay border border-border rounded-md text-xs font-semibold text-foreground transition-colors cursor-pointer"
                  >
                    Lihat Selengkapnya
                  </button>
                )}
              </Card>
            </motion.div>
          )}
        </motion.div>
      </Container>

      {/* Education History Modal — reusable Modal component */}
      <Modal
        isOpen={isEducationModalOpen}
        onClose={() => setIsEducationModalOpen(false)}
        title={
          <span className="flex items-center gap-3">
            <GraduationCap className="text-success" size={24} />
            Riwayat Pendidikan
          </span>
        }
        maxWidth="max-w-2xl"
      >
        <div className="p-6 overflow-y-auto flex flex-col gap-6 relative">
          <div className="absolute left-9 top-6 bottom-6 w-0.5 bg-border" />
          {educationHistory.map((edu) => (
            <div key={edu.id} className="relative pl-10">
              <span className="absolute left-[-5px] top-1 h-4 w-4 rounded-full border-2 border-success bg-background-elevated z-10 flex items-center justify-center shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              <h3 className="font-display text-body font-bold text-foreground">{edu.title}</h3>
              <p className="text-xs text-foreground-muted mb-2">{edu.organization}</p>
              <div className="flex items-center gap-3 text-[10px] text-foreground-subtle mb-2">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {edu.startDate} — {edu.isCurrent ? "Sekarang" : edu.endDate || "-"}
                </span>
                {edu.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {edu.location}
                  </span>
                )}
              </div>
              {edu.description && (
                <p className="text-xs text-foreground-muted leading-relaxed">{edu.description}</p>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </PageLayout>
  );
}
