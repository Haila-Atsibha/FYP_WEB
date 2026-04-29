"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";

export default function CategoryPreview({ categories }) {
  const { t } = useTranslation();

  // If no categories or empty, don't render to keep clean.
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-24 bg-background relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end mb-16 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">{t("explore_services_title")}</h2>
            <p className="text-text-muted mt-4 max-w-xl text-lg">{t("explore_services_subtitle")}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link href="/services" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-primary/20 text-primary font-semibold hover:bg-primary hover:text-white transition-all group shadow-sm bg-surface">
              {t("view_all_services")}
              <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            </Link>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
            >
              <Link
                href={`/services?category=${cat.id}`}
                className="group relative block glass-card rounded-3xl p-8 overflow-hidden transition-all duration-300 h-full"
              >
                {/* Background glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/0 via-primary/0 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <h3 className="relative z-10 text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors flex justify-between items-center">
                  {cat.name}
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex flex-shrink-0 items-center justify-center translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                    <ArrowUpRight className="w-4 h-4 text-primary" />
                  </span>
                </h3>
                <p className="relative z-10 text-text-muted text-sm line-clamp-3 leading-relaxed mt-2">
                  {cat.description || t("category_default_desc")}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
