import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PolicyPageContent } from "@/lib/policy-pages";

interface PolicyEssayPageProps {
  content: PolicyPageContent;
}

export default function PolicyEssayPage({ content }: PolicyEssayPageProps) {
  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-primary-50 via-white to-accent-50/40 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-primary-950">
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="inline-flex rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-sm">
            {content.eyebrow}
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
            {content.title}
          </h1>
          <p className="mt-6 max-w-4xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            {content.intro}
          </p>

          <div className="mt-10 grid gap-6 border-y border-slate-200/80 py-6 text-sm dark:border-white/10 sm:grid-cols-3">
            {content.meta.map((item) => (
              <div key={item.label}>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  {item.label}
                </p>
                <p className="mt-2 text-base font-medium leading-7 text-slate-900 dark:text-slate-100">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-950">
        <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          {content.sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className={index === 0 ? undefined : "mt-12 border-t border-slate-200 pt-12 dark:border-white/10"}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-600 dark:text-accent-300">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">
                {section.title}
              </h2>
              <div className="mt-6 space-y-5">
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-base leading-8 text-slate-700 dark:text-slate-300"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}

          <section className="mt-14 border-t border-slate-200 pt-8 dark:border-white/10">
            <p className="text-base leading-8 text-slate-700 dark:text-slate-300">
              {content.closing}
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-flex items-center text-sm font-semibold text-primary-700 transition-colors hover:text-primary-800 dark:text-accent-300 dark:hover:text-accent-200"
            >
              Contact Us
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </section>
        </article>
      </section>
    </>
  );
}
