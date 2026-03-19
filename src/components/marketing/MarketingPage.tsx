'use client';

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  Compass,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import type { MarketingPageConfig } from "@/lib/public-pages";
import { cn } from "@/lib/utils";

interface MarketingPageProps {
  config: MarketingPageConfig;
}

export default function MarketingPage({ config }: MarketingPageProps) {
  return (
    <main className="bg-stone-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <section className="relative overflow-hidden border-b border-orange-100 dark:border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.18),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_32%),linear-gradient(180deg,_#fffaf5_0%,_#fff_55%,_#fff7ed_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.1),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.08),_transparent_32%),linear-gradient(180deg,_#0f172a_0%,_#020617_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
            <div>
              <Badge variant="gradient" className="mb-5 !from-orange-500 !to-amber-500 font-bold">
                {config.eyebrow}
              </Badge>
              <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
                {config.title}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-400">
                {config.description}
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {config.heroPoints.map((point) => (
                  <div
                    key={point}
                    className="rounded-2xl border border-orange-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/50 px-4 py-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500 dark:text-orange-400" />
                      <p className="text-sm font-medium leading-6 text-slate-700 dark:text-slate-300">{point}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={config.primaryCta.href}>
                  <Button variant="primary" size="lg" className="!rounded-2xl !bg-orange-500 hover:!bg-orange-600 !font-black shadow-xl shadow-orange-500/20">
                    {config.primaryCta.label}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href={config.secondaryCta.href}>
                  <Button variant="outline" size="lg" className="!rounded-2xl !border-orange-400 !text-orange-600 hover:!bg-orange-500 hover:!text-white dark:!border-slate-700 dark:!text-slate-300 dark:hover:!bg-slate-800 dark:hover:!text-white !font-black">
                    {config.secondaryCta.label}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-black p-8 text-white shadow-[0_35px_100px_rgba(15,23,42,0.25)] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                 <Sparkles className="w-64 h-64" />
               </div>
               <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-orange-200 backdrop-blur">
                    EDVO
                  </span>
                  <Sparkles className="h-7 w-7 text-orange-400" />
                </div>
                <h2 className="mt-8 text-2xl font-black leading-tight">
                  Practical learning, cleaner navigation, and zero public dead ends.
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-400 italic">
                  This page is part of a unified public route system so learners can always move
                  from discovery to action without running into broken pages.
                </p>
                <div className="mt-8 grid gap-3">
                  {config.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition-colors"
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{stat.label}</span>
                      <span className="text-base font-black text-white">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 dark:bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-700 dark:text-orange-400">
              <Compass className="h-4 w-4" />
              <span>Spotlight</span>
            </div>
            <h2 className="mt-5 text-3xl font-black text-slate-950 dark:text-white tracking-tight">{config.spotlight.title}</h2>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
              {config.spotlight.description}
            </p>
          </div>
          <div className="grid gap-4">
            {config.spotlight.items.map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-900/40 px-6 py-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-orange-500/10 p-3">
                    <TrendingUp className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                  </div>
                  <p className="text-base font-bold leading-7 text-slate-700 dark:text-slate-300">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {config.sections.map((section, index) => (
        <section
          key={section.title}
          className={cn(index % 2 === 0 ? "bg-stone-50 dark:bg-slate-900/20" : "bg-white dark:bg-slate-950", "transition-colors")}
        >
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <h2 className="text-4xl font-black text-slate-950 dark:text-white tracking-tight">{section.title}</h2>
              <p className="mt-4 text-lg leading-7 text-slate-600 dark:text-slate-400">{section.description}</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {section.cards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-[2.5rem] border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:shadow-black/20"
                >
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <h3 className="text-xl font-black text-slate-950 dark:text-white tracking-tight leading-snug">{card.title}</h3>
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      {card.meta || "Featured"}
                    </span>
                  </div>
                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">{card.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}

      {config.faqs && config.faqs.length > 0 ? (
        <section className="border-t border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors">
          <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-700 dark:text-blue-400">
                <CircleHelp className="h-4 w-4" />
                <span>FAQ</span>
              </div>
              <h2 className="mt-5 text-4xl font-black text-slate-950 dark:text-white tracking-tight">Questions people usually ask</h2>
            </div>
            <div className="grid gap-6">
              {config.faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-[2rem] border border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-900/40 px-8 py-6 hover:border-orange-200 dark:hover:border-orange-500/30 transition-all"
                >
                  <h3 className="text-lg font-black text-slate-950 dark:text-white tracking-tight">{faq.question}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[3.5rem] bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 px-10 py-16 text-slate-950 shadow-[0_45px_100px_rgba(249,115,22,0.4)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none">
              <Sparkles className="w-80 h-80" />
            </div>
            
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-4xl font-black leading-tight sm:text-5xl tracking-tighter">
                Keep the learner journey moving.
              </h2>
              <p className="mt-6 text-lg leading-7 font-medium text-slate-900/80">
                Every major public link now has a real destination. From here, users can jump into
                courses, jobs, resources, or the next relevant action without hitting a 404.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link href="/courses">
                  <Button variant="secondary" size="lg" className="!rounded-2xl !bg-black !text-white hover:!bg-slate-900 !px-10 !py-5 !text-lg !font-black shadow-2xl">
                    Explore Courses
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button variant="outline" size="lg" className="!rounded-2xl !border-black !text-black hover:!bg-black hover:!text-white !px-10 !py-5 !text-lg !font-black">
                    Browse Jobs
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
