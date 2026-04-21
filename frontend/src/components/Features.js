"use client";

import { motion } from "framer-motion";
import { Zap, ShieldCheck, Route } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";

export default function Features() {
  const { t } = useTranslation();
  const items = [
    {
      title: t("feature_1_title"),
      description: t("feature_1_desc"),
      icon: Zap,
      delay: 0.1,
    },
    {
      title: t("feature_2_title"),
      description: t("feature_2_desc"),
      icon: ShieldCheck,
      delay: 0.2,
    },
    {
      title: t("feature_3_title"),
      description: t("feature_3_desc"),
      icon: Route,
      delay: 0.3,
    },
  ];

  return (
    <section className="py-24 bg-background relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">{t("feature_section_title")}</h2>
          <p className="mt-4 text-text-muted text-lg max-w-2xl mx-auto">{t("feature_section_subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((i, idx) => (
            <motion.div 
              key={i.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i.delay }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative p-8 rounded-3xl glass-card overflow-hidden"
            >
              {/* Decorative gradient blur inside card on hover */}
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 z-0"/>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface/80 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors shadow-lg">
                   <i.icon size={32} className="text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{i.title}</h3>
                <p className="text-text-muted leading-relaxed">{i.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
