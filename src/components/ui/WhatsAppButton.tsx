"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WhatsAppButton() {
  const pathname = usePathname();

  // Do not show on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Pre-formatted message for WhatsApp
  const waNumber = "6282330449041";
  const waMessage = "Halo Bayu, saya tertarik dengan portofolio Anda. Boleh ngobrol sebentar?";
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

  return (
    <AnimatePresence>
      <motion.a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 flex items-center justify-center p-3 sm:p-4 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Hubungi via WhatsApp"
      >
        <MessageCircle size={28} className="drop-shadow-sm" />
      </motion.a>
    </AnimatePresence>
  );
}
