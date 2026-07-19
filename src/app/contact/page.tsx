"use client";

import { PageLayout } from "@/components/public/PageLayout";
import { Container } from "@/components/public/Container";
import { Card } from "@/components/ui";
import { Contact } from "@/components/public/home/Contact";
import { SITE_CONFIG } from "@/constants/site";
import { Mail, MapPin, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUpVariants, staggerContainerVariants } from "@/lib/animations";

export default function ContactPage() {
  const contactDetails = [
    {
      title: "Kirim Email Resmi",
      value: SITE_CONFIG.email,
      desc: "Untuk penawaran kerjasama, pembicara, atau proyek freelance.",
      icon: Mail,
      href: `mailto:${SITE_CONFIG.email}`,
      color: "text-accent",
    },
    {
      title: "Lokasi Kantor",
      value: SITE_CONFIG.location ?? "Jakarta, Indonesia",
      desc: "Bisa berdiskusi via remote (Zoom/Meet) maupun offline.",
      icon: MapPin,
      color: "text-violet",
    },
    {
      title: "Media Sosial & Github",
      value: "Lihat tautan publik",
      desc: "Menghubungkan langsung ke GitHub, LinkedIn, dan Instagram.",
      icon: Share2,
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
            className="flex flex-col gap-12"
          >
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto">
              <h1 className="font-display text-h1 text-foreground mb-4">
                Hubungi Saya
              </h1>
              <p className="text-body text-foreground-muted">
                Punya ide proyek, diskusi kemitraan, atau sekadar ingin menyapa? Silakan kirimkan pesan Anda melalui formulir di bawah.
              </p>
            </div>

            {/* Quick Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {contactDetails.map((detail, idx) => {
                const CardWrapper = detail.href ? "a" : "div";
                return (
                  <motion.div key={idx} variants={fadeUpVariants}>
                    <CardWrapper
                      href={detail.href}
                      className="block h-full"
                      target={detail.href ? "_blank" : undefined}
                      rel={detail.href ? "noopener noreferrer" : undefined}
                    >
                      <Card className="p-6 h-full flex flex-col justify-between" hoverEffect={!!detail.href}>
                        <div>
                          <div className={`h-10 w-10 rounded-lg bg-background-overlay flex items-center justify-center mb-4 ${detail.color}`}>
                            <detail.icon size={20} />
                          </div>
                          <h3 className="font-display text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2">
                            {detail.title}
                          </h3>
                          <p className="text-caption font-semibold text-foreground mb-2 break-all">
                            {detail.value}
                          </p>
                          <p className="text-xs text-foreground-muted leading-relaxed">
                            {detail.desc}
                          </p>
                        </div>
                      </Card>
                    </CardWrapper>
                  </motion.div>
                );
              })}
            </div>

            {/* Form Section */}
            <motion.div variants={fadeUpVariants} className="mt-8">
              <Contact />
            </motion.div>
          </motion.div>
        </Container>
    </PageLayout>
  );
}
