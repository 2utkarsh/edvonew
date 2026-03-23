'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Handshake,
  Target,
  Clock,
  DollarSign,
  Building2,
  Quote,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { FadeIn } from '@/components/animations';
import { fetchHomeContent, type HomeContentPayload } from '../home-data';

const defaultStats = [
  { label: 'Hiring Partners', value: '350+' },
  { label: 'Job-Ready Candidates', value: '3,000+' },
  { label: 'Successful Placements', value: '1,200+' },
  { label: 'Avg. Retention Rate', value: '96%' },
];

const benefits = [
  {
    title: 'Zero Cost Hiring',
    description: 'We do not charge any recruitment fees for our standard hiring pipelines.',
    icon: DollarSign,
    color: 'bg-green-500/10 text-green-600',
  },
  {
    title: 'Dedicated Support',
    description: 'A dedicated account manager to understand your specific team needs.',
    icon: Handshake,
    color: 'bg-primary-500/10 text-primary-600',
  },
  {
    title: 'Vetted Portfolios',
    description: 'Candidates come with proven project challenges and evaluation signals.',
    icon: Target,
    color: 'bg-accent-500/10 text-accent-600',
  },
];

const impactMetrics = [
  { label: 'Reduce Hiring Time', value: '90%' },
  { label: 'Submit to Hire Ratio', value: '5:1' },
  { label: 'Candidate Drop-off', value: '< 1%' },
  { label: 'Year-Round Pipeline', value: 'Yes' },
];

const engagementModels = [
  {
    title: 'Permanent Hiring',
    description: 'Full-time, in-house team members vetted for your company culture.',
    meta: 'Direct Hire',
  },
  {
    title: 'Remote / Hybrid',
    description: 'Top-tier talent for seamless collaboration across any time zone.',
    meta: 'Flexible',
  },
  {
    title: 'Contract / Project',
    description: 'Specialists for short-term sprints or specific deliverables.',
    meta: 'On-Demand',
  },
];

const defaultTestimonials = [
  {
    quote: 'EDVO demonstrated a deep understanding of our requirements and delivered candidates who not only possessed the technical skills but also fit seamlessly into our company culture.',
    author: 'Bharath Kumar',
    role: 'Head - BI & Analytics, SBFC',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
  },
  {
    quote: 'As a hiring manager who frequently partners with EDVO, I have been consistently impressed with the caliber of candidates. Their focus on practical, project-based learning is exactly what we need.',
    author: 'Subham Singh',
    role: 'Business Analyst, The Media Ant',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  },
];

const defaultHero = {
  badge: 'For HRs & Hiring Managers',
  title: 'Hire The Best Data Professionals at',
  accent: 'zero cost.',
  description: 'Skip CV screening, interview rounds, and save 2X time by hiring vetted Data Analysts and Engineers from our talent pool.',
  primaryLabel: 'Become a Partner',
  primaryHref: '/hire-talent/apply',
  trustNote: 'Trusted by 350+ Industry Leaders',
  backgroundImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000',
};

const defaultCta = {
  title: 'Ready to skip the hiring hustle?',
  description: 'Partner with us today and get access to the top 1% of our vetted data talent. No hidden fees, just great talent.',
  primaryLabel: 'Partner With Us',
  primaryHref: '/hire-talent/apply',
  secondaryLabel: 'See Success Stories',
  secondaryHref: '/testimonials',
};

export default function HireTalentPage() {
  const [homeContent, setHomeContent] = useState<HomeContentPayload>({});

  useEffect(() => {
    let cancelled = false;
    fetchHomeContent().then((payload) => {
      if (!cancelled) setHomeContent(payload || {});
    }).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const hero = useMemo(() => ({ ...defaultHero, ...((homeContent.hireTalentHero || {}) as Record<string, string>) }), [homeContent.hireTalentHero]);
  const partners = useMemo(() => ((Array.isArray(homeContent.hiringPartners) && homeContent.hiringPartners.length ? homeContent.hiringPartners : []) as any[]), [homeContent.hiringPartners]);
  const testimonials = useMemo(() => ((Array.isArray(homeContent.hireTalentTestimonials) && homeContent.hireTalentTestimonials.length ? homeContent.hireTalentTestimonials : defaultTestimonials) as any[]), [homeContent.hireTalentTestimonials]);
  const cta = useMemo(() => ({ ...defaultCta, ...((homeContent.hireTalentCta || {}) as Record<string, string>) }), [homeContent.hireTalentCta]);
  const heroStats = defaultStats;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="relative overflow-hidden bg-slate-900 px-4 py-24 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url('${hero.backgroundImage}')` }} />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/90 to-primary-900/50" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <FadeIn>
              <Badge variant="accent" className="mb-6 uppercase tracking-widest">{hero.badge}</Badge>
              <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">
                {hero.title} <span className="text-lime-400">{hero.accent}</span>
              </h1>
              <p className="mt-8 text-xl leading-relaxed text-slate-300">{hero.description}</p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link href={hero.primaryHref || '/hire-talent/apply'}>
                  <Button variant="primary" size="lg" className="!rounded-2xl !bg-lime-300 !text-slate-950 hover:!bg-lime-200">
                    {hero.primaryLabel}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-4 border-l border-white/20 pl-6 text-slate-400">
                  <Building2 className="h-6 w-6" />
                  <span className="text-sm font-medium">{hero.trustNote}</span>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="grid grid-cols-2 gap-4">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                    <div className="text-3xl font-black text-lime-400">{stat.value}</div>
                    <div className="mt-1 text-sm text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {partners.length ? (
        <section className="border-b border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 text-center text-sm font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Our Hiring Partners</div>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {partners.map((partner, index) => (
                <div key={`${partner.name}-${index}`} className="flex min-h-[88px] items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800/60">
                  {partner.logo ? <img src={partner.logo} alt={partner.name} className="max-h-10 w-auto object-contain" /> : <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{partner.name}</span>}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Streamlining Recruitment for Leaders</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">We address what other job platforms miss: true skill verification.</p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {impactMetrics.map((metric) => (
              <div key={metric.label} className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="text-4xl font-black text-primary-600 dark:text-accent-400">{metric.value}</div>
                <div className="mt-3 font-semibold text-slate-900 dark:text-slate-200">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Why Partner with Us?</h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                EDVO shapes data professionals who are prepared for more than just technical challenges. We integrate essential workplace skills and professional communication.
              </p>

              <div className="mt-12 space-y-6">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="flex gap-6 rounded-[2rem] border border-slate-100 p-6 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                    <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${benefit.color}`}>
                      <benefit.icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold dark:text-white">{benefit.title}</h3>
                      <p className="mt-2 text-slate-600 dark:text-slate-400">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative rounded-[2.5rem] bg-slate-100 p-8 dark:bg-slate-800">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold dark:text-white">Engagement Models</h3>
                <Badge variant="info">Flexible</Badge>
              </div>
              <div className="space-y-4">
                {engagementModels.map((model) => (
                  <div key={model.title} className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-950">
                    <div>
                      <h4 className="font-bold dark:text-white">{model.title}</h4>
                      <p className="text-sm text-slate-500">{model.description}</p>
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-primary-500">{model.meta}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-2xl bg-primary-600 p-6 text-white">
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-lime-400" />
                  <p className="font-medium text-primary-50">Hire remote Data Analysts who work with you full-time from anywhere.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Hear from our Hiring Partners</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <div key={`${testimonial.author}-${index}`} className="relative rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <Quote className="absolute right-10 top-10 h-12 w-12 text-slate-100 dark:text-white/5" />
                <p className="relative z-10 text-lg italic leading-relaxed text-slate-700 dark:text-slate-300">"{testimonial.quote}"</p>
                <div className="mt-10 flex items-center gap-4">
                  <img src={testimonial.image || '/images/edvo-official-logo-v10.png'} alt={testimonial.author} className="h-12 w-12 rounded-full border-2 border-primary-100 object-cover dark:border-slate-700" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{testimonial.author}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[3rem] bg-slate-950 p-12 text-center text-white sm:p-20">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-900/40 via-transparent to-accent-900/40" />
            <div className="relative z-10">
              <h2 className="text-3xl font-black sm:text-5xl">{cta.title}</h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">{cta.description}</p>
              <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
                <Link href={cta.primaryHref || '/hire-talent/apply'}>
                  <Button variant="primary" size="lg" className="h-14 !rounded-2xl !bg-lime-300 px-10 !text-slate-950">
                    {cta.primaryLabel}
                  </Button>
                </Link>
                <Link href={cta.secondaryHref || '/testimonials'}>
                  <Button variant="outline" size="lg" className="h-14 !rounded-2xl !border-white/20 px-10 !text-white hover:!bg-white/10">
                    {cta.secondaryLabel}
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

