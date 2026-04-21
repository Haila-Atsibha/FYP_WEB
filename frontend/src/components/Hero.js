"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslation } from "../hooks/useTranslation";

export default function Hero() {
  const { t } = useTranslation();
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden transition-colors duration-500">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/hero-bg.png" 
          alt="Modern Architecture Background" 
          fill 
          priority
          className="object-cover object-center w-full h-full opacity-20 dark:opacity-30 select-none mix-blend-luminosity"
        />
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-hero-gradient" />
      </div>

      <div className="relative z-20 max-w-5xl mx-auto text-center px-6 mt-16 pb-16 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-block mb-6 px-5 py-2 rounded-full backdrop-blur-xl bg-surface/30 border border-primary/30 text-accent font-medium text-sm tracking-wide shadow-[0_0_15px_rgba(99,102,241,0.2)]"
        >
          {t("hero_badge")}
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tight leading-tight"
        >
          {t("hero_title_1")} <br className="hidden md:block" />
          <span className="text-gradient">{t("hero_title_2")}</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
          className="mt-8 text-text-muted text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed"
        >
          {t("hero_subtitle")}
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
          className="mt-14 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6"
        >
          <Link href="/services" className="w-full sm:w-auto relative group">
            <div className="absolute inset-0 bg-primary/40 rounded-full blur-md group-hover:bg-primary/60 transition-all duration-300"></div>
            <div className="relative bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-primary text-white px-10 py-4 rounded-full shadow-lg font-semibold active:scale-95 text-center transition-all duration-300 border border-white/20">
              {t("hero_order_btn")}
            </div>
          </Link>
          <Link href="/auth/register" className="w-full sm:w-auto glass-card text-foreground px-10 py-4 rounded-full shadow-md hover:bg-surface/80 hover:border-primary/50 transition-all font-semibold active:scale-95 text-center border-white/10 backdrop-blur-lg">
            {t("hero_create_btn")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
