'use client';

import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const HiringPartnersSection = ({ section, partners = [] as any[] }: { section?: { title?: string; description?: string; buttonLabel?: string; buttonHref?: string }; partners?: any[] }) => {
  const selectedPartners = partners.filter((partner) => partner?.showOnHome);
  const rows = (selectedPartners.length ? selectedPartners : partners).slice(0, 4);
  const fallbackRows = [
    { name: 'INTEG', logo: '/images/partners/integ.png' },
    { name: 'IQVIA', logo: '/images/partners/iqvia.png' },
    { name: 'Numerator', logo: '/images/partners/numerator.png' },
    { name: 'OLA ELECTRIC', logo: '/images/partners/ola.png' },
  ];
  const displayRows = rows.length ? rows : fallbackRows;
  const successStoriesHref = section?.buttonHref && section.buttonHref !== '/alumni-achievements' ? section.buttonHref : '/testimonials/success-stories';

  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden border-t border-slate-200 bg-slate-50 px-4 py-20 transition-colors duration-300 dark:border-white/10 dark:bg-slate-950"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary-500/5 to-transparent dark:from-primary-500/10" />
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-slate-900 dark:text-white">{section?.title || 'Our Alumni Work at Top Companies'}</h2>
          <p className="text-slate-600 dark:text-slate-300">{section?.description || "Join 76K+ learners who've transformed their careers"}</p>
        </div>

        <div className="group relative mb-12 flex flex-col gap-6 overflow-hidden">
          <div className="flex w-max animate-marquee gap-8 pr-8 hover:[animation-play-state:paused] sm:gap-12 sm:pr-12">
            {[...displayRows, ...displayRows].map((partner, index) => (
              <motion.div
                key={partner.name + '-' + index}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: index * 0.04, duration: 0.35, ease: 'easeOut' }}
                className="flex h-16 w-36 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:border-primary-400/40 hover:text-primary-600 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300 dark:hover:border-primary-400/40 dark:hover:text-white dark:hover:shadow-[0_12px_30px_rgba(37,99,235,0.12)]"
              >
                {partner.logo ? <img src={partner.logo} alt={partner.name} className="max-h-10 w-full object-contain" /> : <span>{partner.name}</span>}
              </motion.div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-950 sm:w-48" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-50 to-transparent dark:from-slate-950 sm:w-48" />
        </div>

        <div className="text-center">
          <Link href={successStoriesHref}>
            <Button variant="outline" className="gap-2">
              {section?.buttonLabel || 'View All Success Stories'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.section>
  );
};

export default HiringPartnersSection;


