'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin, Youtube, Instagram } from 'lucide-react';
import { useThemeStore } from '@/store/useThemeStore';
import { useHeaderStore } from '@/store/useHeaderStore';
import { useFooterStore } from '@/store/useFooterStore';

export default function Footer() {
  const { config: themeConfig } = useThemeStore();
  const { config: headerConfig } = useHeaderStore();
  const { config: footerConfig } = useFooterStore();

  const socialLinks = [
    { icon: Twitter, label: 'Twitter' },
    { icon: Github, label: 'GitHub' },
    { icon: Linkedin, label: 'LinkedIn' },
    { icon: Youtube, label: 'YouTube' },
    { icon: Instagram, label: 'Instagram' },
  ];

  return (
    <footer className="overflow-hidden bg-gradient-to-b from-secondary-lighter via-white to-white text-slate-950 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="rounded-2xl bg-gradient-to-r from-primary-600 via-primary-700 to-accent-500 p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                {footerConfig.newsletterTitle}
              </h3>
              <p className="text-primary-100 mb-8">
                {footerConfig.newsletterDescription}
              </p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-full border border-white/30 bg-white/15 px-6 py-4 text-white backdrop-blur-sm placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <motion.button
                  type="submit"
                  className="rounded-full bg-slate-950 px-8 py-4 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-slate-900 hover:shadow-lg dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Subscribe
                </motion.button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-border bg-slate-950 px-6 py-16 text-white shadow-[0_30px_80px_rgba(15,23,42,0.22)] dark:border-white/10 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-6">
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Image
                src="/images/edvo-official-logo-v10.png"
                alt="EDVO"
                width={200}
                height={65}
                className="h-14 w-auto"
              />
            </Link>
            <p className="mb-6 leading-relaxed text-slate-300">
              {footerConfig.companyDescription}
            </p>

            <div className="flex gap-4">
              {socialLinks.map((social, index) => {
                const configuredLink =
                  footerConfig.socialLinks.find((item) => item.label === social.label) || footerConfig.socialLinks[index];

                return (
                <motion.a
                  key={social.label}
                  href={configuredLink?.href || '#'}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 transition-all duration-300 hover:scale-110 hover:bg-gradient-to-r hover:from-primary-600 hover:to-accent-500"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
                );
              })}
            </div>
          </motion.div>

          {Object.entries(footerConfig.sections).map(([key, section], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <h3 className="font-semibold text-lg mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-300 transition-colors duration-300 hover:text-accent-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-slate-400">
          <p>&copy; {new Date().getFullYear()} EDVO. All rights reserved.</p>
        </div>
        </div>
      </div>
    </footer>
  );
}
