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

interface MarketingPageHomePaletteProps {
  config: MarketingPageConfig;
}

export default function MarketingPageHomePalette({
  config,
}: MarketingPageHomePaletteProps) {
  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-primary-950">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-[-8rem] top-[-4rem] h-72 w-72 rounded-full bg-primary-500/15 blur-3xl dark:bg-primary-500/20" />
          <div className="absolute bottom-[-6rem] right-[-4rem] h-80 w-80 rounded-full bg-accent-500/15 blur-3xl dark:bg-accent-500/15" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-24">
          <div>
            <Badge variant="gradient" className="mb-6">
              {config.eyebrow}
            </Badge>
            <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
              {config.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              {config.description}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {config.heroPoints.map((point) => (
                <div
                  key={point}
                  className="rounded-2xl border border-primary-100 bg-white/85 px-4 py-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/75"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-600 dark:text-accent-400" />
                    <p className="text-sm font-medium leading-6 text-slate-700 dark:text-slate-200">
                      {point}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={config.primaryCta.href}>
                <Button variant="primary" size="lg" className="!rounded-2xl">
                  {config.primaryCta.label}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href={config.secondaryCta.href}>
                <Button variant="secondary" size="lg" className="!rounded-2xl">
                  {config.secondaryCta.label}
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-primary-100 bg-slate-950 p-6 text-white shadow-[0_25px_90px_rgba(37,99,235,0.20)] dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-accent-200">
                EDVO
              </span>
              <Sparkles className="h-7 w-7 text-accent-300" />
            </div>
            <h2 className="mt-8 text-2xl font-bold leading-tight">
              Same journey, same palette, no dead-end public pages.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              These pages now follow the homepage blue and orange system so the whole public
              site feels like one product in both light and dark mode.
            </p>
            <div className="mt-8 grid gap-3">
              {config.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <span className="text-sm text-slate-300">{stat.label}</span>
                  <span className="text-base font-bold text-white">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">
              <Compass className="h-4 w-4" />
              <span>Spotlight</span>
            </div>
            <h2 className="mt-5 text-3xl font-bold text-slate-950 dark:text-white">
              {config.spotlight.title}
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
              {config.spotlight.description}
            </p>
          </div>

          <div className="grid gap-4">
            {config.spotlight.items.map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-primary-50/70 px-5 py-5 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-900"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-primary-500/10 p-3">
                    <TrendingUp className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <p className="text-base font-medium leading-7 text-slate-700 dark:text-slate-200">
                    {item}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {config.sections.map((section, index) => (
        <section
          key={section.title}
          className={
            index % 2 === 0
              ? "bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950"
              : "bg-white dark:bg-slate-950"
          }
        >
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold text-slate-950 dark:text-white">
                {section.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                {section.description}
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {section.cards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-bold text-slate-950 dark:text-white">
                      {card.title}
                    </h3>
                    <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-white/10 dark:text-slate-200">
                      {card.meta || "Featured"}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {card.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}

      {config.faqs && config.faqs.length > 0 ? (
        <section className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent-50 px-4 py-2 text-sm font-semibold text-accent-700 dark:bg-accent-500/10 dark:text-accent-300">
                <CircleHelp className="h-4 w-4" />
                <span>FAQ</span>
              </div>
              <h2 className="mt-5 text-3xl font-bold text-slate-950 dark:text-white">
                Questions people usually ask
              </h2>
            </div>

            <div className="mt-10 grid gap-4">
              {config.faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5 dark:border-slate-800 dark:bg-slate-900"
                >
                  <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                    {faq.question}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] bg-gradient-to-r from-primary-600 via-primary-700 to-accent-500 px-6 py-10 text-white shadow-[0_25px_80px_rgba(37,99,235,0.28)] sm:px-10">
            <h2 className="text-3xl font-black leading-tight sm:text-4xl">
              Keep the learner journey moving.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-primary-50/90">
              Every major public link now lands on a styled page that matches the homepage color
              system and respects light and dark mode.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/courses">
                <Button
                  variant="secondary"
                  size="lg"
                  className="!rounded-2xl !bg-white !text-slate-950 hover:!bg-slate-100"
                >
                  Explore Courses
                </Button>
              </Link>
              <Link href="/jobs">
                <Button
                  variant="outline"
                  size="lg"
                  className="!rounded-2xl !border-white !text-white hover:!bg-white/10"
                >
                  Browse Jobs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
