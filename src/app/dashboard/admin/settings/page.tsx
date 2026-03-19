'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Eye,
  Globe,
  LayoutTemplate,
  Palette,
  Save,
  Settings,
  Sparkles,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useHeaderStore } from '@/store/useHeaderStore';
import { useThemeStore } from '@/store/useThemeStore';
import { FooterSection, useFooterStore } from '@/store/useFooterStore';

type SettingsTab = 'website' | 'header' | 'footer';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('website');
  const [saved, setSaved] = useState(false);
  const { config: themeConfig, setLogoText, setMode } = useThemeStore();
  const { config: headerConfig, updateLogoText, setConfig: setHeaderConfig } = useHeaderStore();
  const {
    config: footerConfig,
    updateSection,
    updateNewsletter,
    updateCompanyDescription,
  } = useFooterStore();

  const tabs = [
    { id: 'website' as const, label: 'Website', icon: Globe },
    { id: 'header' as const, label: 'Header', icon: LayoutTemplate },
    { id: 'footer' as const, label: 'Footer', icon: Palette },
  ];

  const visibleFooterSections = useMemo(
    () => Object.entries(footerConfig.sections) as [keyof typeof footerConfig.sections, FooterSection][],
    [footerConfig.sections]
  );

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <DashboardLayout userRole="admin" userName="Admin User">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">
              <Settings className="h-3.5 w-3.5" />
              Site Settings
            </div>
            <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
              Reference admin style controls
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Manage website branding, header behavior, and the new footer container from one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/admin/header"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Eye className="h-4 w-4" />
              Advanced Header Editor
            </Link>
            <button
              onClick={flashSaved}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              <Save className="h-4 w-4" />
              {saved ? 'Saved' : 'Save Layout'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800 dark:hover:bg-slate-800'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'website' && (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Website basics</h2>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Brand text</span>
                  <input
                    value={headerConfig.logoText}
                    onChange={(e) => {
                      updateLogoText(e.target.value);
                      setLogoText(e.target.value);
                    }}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Theme mode</span>
                  <select
                    value={themeConfig.mode}
                    onChange={(e) => setMode(e.target.value as 'light' | 'dark')}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Company description</span>
                  <textarea
                    value={footerConfig.companyDescription}
                    onChange={(e) => updateCompanyDescription(e.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-slate-900 p-6 text-white shadow-[0_25px_80px_rgba(37,99,235,0.25)]">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]">
                  Live Preview
                </span>
                <Sparkles className="h-5 w-5 text-accent-300" />
              </div>
              <h3 className="mt-6 text-2xl font-bold">{headerConfig.logoText}</h3>
              <p className="mt-3 max-w-md text-sm leading-7 text-primary-100">
                {footerConfig.companyDescription}
              </p>
              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm">Theme: {themeConfig.mode}</div>
                <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm">
                  Announcement CTA: {headerConfig.announcement.ctaText}
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'header' && (
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Header quick settings</h2>
              <div className="mt-6 grid gap-5">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Announcement message</span>
                  <textarea
                    value={headerConfig.announcement.centerText}
                    onChange={(e) =>
                      setHeaderConfig({
                        ...headerConfig,
                        announcement: { ...headerConfig.announcement, centerText: e.target.value },
                      })
                    }
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Register button text</span>
                  <input
                    value={headerConfig.registerText}
                    onChange={(e) => setHeaderConfig({ ...headerConfig, registerText: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
              <h2 className="text-lg font-semibold">Reference-style header preview</h2>
              <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
                <div
                  className="px-4 py-2 text-center text-xs font-medium"
                  style={{ backgroundColor: headerConfig.announcement.bgColor, color: headerConfig.announcement.textColor }}
                >
                  {headerConfig.announcement.centerText}
                </div>
                <div className="m-3 flex items-center justify-between rounded-2xl bg-primary-950/95 px-5 py-4 shadow-xl">
                  <div className="font-bold">{headerConfig.logoText}</div>
                  <div className="hidden gap-4 text-sm text-slate-300 md:flex">
                    {headerConfig.navLinks.slice(0, 4).map((item) => (
                      <span key={item.label}>{item.label}</span>
                    ))}
                  </div>
                  <div className="rounded-xl bg-accent-500 px-3 py-2 text-sm font-semibold text-white">
                    {headerConfig.registerText}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'footer' && (
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Footer content</h2>
              <div className="mt-6 space-y-6">
                <label className="space-y-2 block">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Newsletter title</span>
                  <input
                    value={footerConfig.newsletterTitle}
                    onChange={(e) => updateNewsletter(e.target.value, footerConfig.newsletterDescription)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </label>
                <label className="space-y-2 block">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Newsletter description</span>
                  <textarea
                    value={footerConfig.newsletterDescription}
                    onChange={(e) => updateNewsletter(footerConfig.newsletterTitle, e.target.value)}
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  {visibleFooterSections.map(([key, section]) => (
                    <div key={key} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                      <label className="space-y-2 block">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{section.title} title</span>
                        <input
                          value={section.title}
                          onChange={(e) => updateSection(key, { ...section, title: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        />
                      </label>
                      <div className="mt-3 space-y-2">
                        {section.links.slice(0, 3).map((link, index) => (
                          <input
                            key={link.label + index}
                            value={link.label}
                            onChange={(e) => {
                              const nextLinks = section.links.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, label: e.target.value } : item
                              );
                              updateSection(key, { ...section, links: nextLinks });
                            }}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[32px] bg-primary-950 p-6 text-white shadow-[0_30px_80px_rgba(15,23,42,0.24)]">
              <h2 className="text-lg font-semibold">Live footer preview</h2>
              <div className="mt-6 space-y-6">
                <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 p-5">
                  <h3 className="text-xl font-bold">{footerConfig.newsletterTitle}</h3>
                  <p className="mt-2 text-sm text-primary-100">{footerConfig.newsletterDescription}</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {visibleFooterSections.slice(0, 2).map(([key, section]) => (
                    <div key={key}>
                      <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">{section.title}</h3>
                      <div className="space-y-2 text-sm text-slate-400">
                        {section.links.slice(0, 4).map((link) => (
                          <div key={link.label}>{link.label}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
