'use client';

import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const HiringPartnersSection = () => {
  const partners = [
    { name: 'INTEG', logo: '/images/partners/integ.png' },
    { name: 'IQVIA', logo: '/images/partners/iqvia.png' },
    { name: 'Numerator', logo: '/images/partners/numerator.png' },
    { name: 'OLA ELECTRIC', logo: '/images/partners/ola.png' },
    { name: 'ORACLE', logo: '/images/partners/oracle.png' },
    { name: 'P&G', logo: '/images/partners/pg.png' },
    { name: 'SBFC', logo: '/images/partners/sbfc.png' },
    { name: 'TCS', logo: '/images/partners/tcs.png' },
    { name: 'THE MEDIA ANT', logo: '/images/partners/media-ant.png' },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 px-4 py-20 transition-colors duration-300"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary-500/5 to-transparent dark:from-primary-500/10" />
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-slate-900 dark:text-white">Our Alumni Work at Top Companies</h2>
          <p className="text-slate-600 dark:text-slate-300">Join 76K+ learners who&apos;ve transformed their careers</p>
        </div>

        <div className="group relative mb-12 flex flex-col gap-6 overflow-hidden">
          {/* Marquee Track */}
          <div className="flex w-max animate-marquee gap-8 pr-8 hover:[animation-play-state:paused] sm:gap-12 sm:pr-12">
            {[...partners, ...partners].map((partner, index) => (
              <motion.div
                key={index}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: index * 0.04, duration: 0.35, ease: 'easeOut' }}
                className="flex h-14 w-32 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 text-sm font-semibold text-slate-600 dark:text-slate-300 shadow-sm transition-all hover:border-primary-400/40 dark:hover:border-primary-400/40 hover:text-primary-600 dark:hover:text-white hover:shadow-lg dark:hover:shadow-[0_12px_30px_rgba(37,99,235,0.12)]"
              >
                {partner.name}
              </motion.div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-950 sm:w-48" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-50 to-transparent dark:from-slate-950 sm:w-48" />
        </div>

        <div className="text-center">
          <Link href="/alumni-achievements">
            <Button variant="outline" className="gap-2">
              View All Success Stories <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.section>
  );
};

export default HiringPartnersSection;
