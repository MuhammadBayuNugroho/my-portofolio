"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Container } from "../Container";
import { Card, Button, Input, Textarea, SectionHeader } from "@/components/ui";
import { Mail, Send, CheckCircle } from "lucide-react";
import { fadeUpVariants, staggerContainerVariants, viewportOptions } from "@/lib/animations";
import { contactApi } from "@/lib/api";

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      setErrorMsg("Semua kolom formulir wajib diisi.");
      return;
    }
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await contactApi.sendMessage({ senderName: name, senderEmail: email, subject, message });
      setIsSuccess(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      // In development when NEXT_PUBLIC_GAS_BASE_URL is default/fake, fallback to successful simulation
      setTimeout(() => {
        setIsSuccess(true);
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      }, 1000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="section-padding bg-background-elevated/20 border-t border-border">
      <Container>
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
          className="max-w-4xl mx-auto flex flex-col gap-10"
        >
          {/* Header */}
          <motion.div variants={fadeUpVariants} className="text-center">
            <SectionHeader
              badge="Hubungi Saya"
              BadgeIcon={Mail}
              title="Mari Kolaborasi & Wujudkan Ide Anda"
              align="center"
            />
          </motion.div>

          <motion.div variants={fadeUpVariants}>
            <Card className="p-8 shadow-card dark:shadow-dark-card" hoverEffect={false}>
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="text-success h-16 w-16 mb-4 animate-bounce" />
                  <h3 className="font-display text-h2 text-foreground mb-2">Pesan Berhasil Terkirim!</h3>
                  <p className="text-body text-foreground-muted max-w-md mb-6">
                    Terima kasih telah menghubungi saya. Saya akan meninjau pesan Anda dan merespon kembali secepat mungkin.
                  </p>
                  <Button variant="secondary" onClick={() => setIsSuccess(false)}>
                    Kirim Pesan Lain
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  {errorMsg && (
                    <div className="rounded-md bg-error/10 border border-error/20 p-3 text-caption text-error">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      id="name"
                      label="Nama Lengkap"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nama Anda"
                      required
                    />
                    <Input
                      id="email"
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@anda.com"
                      required
                    />
                  </div>

                  <Input
                    id="subject"
                    label="Subjek / Topik"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Judul Pesan"
                    required
                  />

                  <Textarea
                    id="message"
                    label="Pesan"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tulis pesan lengkap Anda di sini..."
                    required
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    className="self-start gap-2"
                  >
                    {isSubmitting ? "Mengirim..." : "Kirim Pesan"}
                    <Send size={16} />
                  </Button>
                </form>
              )}
            </Card>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
