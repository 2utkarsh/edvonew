'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Trophy, Target, Code2, Users2, History, CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { FadeIn, StaggerGrid } from '@/components/animations';
import { fetchChallenges, ChallengeItem } from './data';

const howItWorks = [
  { step: '01', title: 'Choose a Challenge', description: 'New problem statements each month or choose a past project to work on.' },
  { step: '02', title: 'Build Your Solution', description: 'Work through the dataset, frame your insights clearly, and create a project worth showcasing.' },
  { step: '03', title: 'Submit or Practice', description: 'Live challenges turn into competition entries. Completed ones become practice pages for your portfolio.' },
];

const featureHighlights = [
  { icon: Target, title: 'Real-World Challenges', description: 'Work on industry-relevant datasets.' },
  { icon: Code2, title: 'Boost Your Resume', description: 'Showcase projects that attract recruiters.' },
  { icon: Trophy, title: 'Win Prizes & Certificates', description: 'Stand out in the data community.' },
  { icon: Users2, title: 'Network & Learn', description: 'Join a thriving data-focused community.' },
];

export default function ChallengesPage() {
  const [items, setItems] = useState<ChallengeItem[]>([]);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setIsLoading(true);
        setLoadError('');
        const rows = await fetchChallenges();
        if (!cancelled) setItems(rows);
      } catch (error: any) {
        if (!cancelled) setLoadError(error?.message || 'Unable to load challenges right now.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const ongoingChallenges = useMemo(() => items.filter((item) => item.phase === 'ongoing').sort((a,b) => (a.order||0)-(b.order||0)), [items]);
  const completedChallenges = useMemo(() => items.filter((item) => item.phase === 'completed').sort((a,b) => (a.order||0)-(b.order||0)), [items]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="relative overflow-hidden bg-white px-4 py-20 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-[0.03] dark:opacity-10" />
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-primary-500/10 blur-[100px] dark:bg-primary-500/20" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-accent-500/10 blur-[100px] dark:bg-accent-500/20" />
        <div className="relative mx-auto max-w-4xl text-center">
          <FadeIn>
            <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 dark:border-primary-500/20 dark:bg-primary-500/10 dark:text-primary-300 backdrop-blur-sm"><Sparkles className="h-4 w-4" /><span>Participate. Learn. Get Recognized!</span></div>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-[4rem]">Solve real-world <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">data challenges.</span></h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300 sm:text-xl">Build your portfolio with industry-relevant datasets. Win cash prizes, get recognized by top employers, and stand out in the data community.</p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a href="#ongoing-challenges"><Button variant="primary" size="lg" className="h-14 !rounded-full px-8 text-base shadow-[0_8px_30px_rgb(37,99,235,0.24)]">See Ongoing Challenges</Button></a>
              <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400"><div className="flex -space-x-3">{[1,2,3,4].map((i)=><div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-200 dark:border-slate-950 dark:bg-slate-800" />)}</div><span className="text-sm font-medium">Joined by 10,000+ builders</span></div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section id="ongoing-challenges" className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12"><Badge variant="accent" className="mb-3 uppercase tracking-wider">Live Now</Badge><h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Ongoing Resume Project Challenge(s)</h2><p className="mt-3 text-lg text-slate-600 dark:text-slate-400">Open a competition page, review the brief, and start building your submission.</p></div>
        {loadError ? <div className="mb-8 rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-sm font-medium text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">{loadError}</div> : null}
        {isLoading ? <div className="grid gap-8"><div className="h-[460px] animate-pulse rounded-[2rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" /></div> : ongoingChallenges.length ? <div className="grid gap-8">{ongoingChallenges.map((challenge) => <motion.div key={challenge.id} whileHover={{ y: -4 }} className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-primary-500/5 transition-all dark:border-white/10 dark:bg-slate-900/50 dark:backdrop-blur-xl sm:p-12 lg:grid lg:grid-cols-2 lg:gap-12"><div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" /><div className="relative z-10 flex flex-col justify-center"><div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-accent-100 bg-accent-50 px-4 py-2 text-sm font-bold text-accent-700 dark:border-accent-500/20 dark:bg-accent-500/10 dark:text-accent-400"><Trophy className="h-4 w-4" />Prize Pool: {challenge.prize}</div><h3 className="text-3xl font-bold leading-tight text-slate-900 dark:text-white sm:text-4xl">{challenge.title}</h3><p className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-300">{challenge.description}</p><div className="mt-8 flex flex-wrap items-center gap-6"><div className="flex items-center gap-2 text-slate-700 dark:text-slate-200"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-500/20"><Users2 className="h-5 w-5 text-primary-600 dark:text-primary-400" /></div><span className="font-semibold">{challenge.participants} Participants</span></div><div className="flex items-center gap-2 text-slate-700 dark:text-slate-200"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20"><CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" /></div><span className="font-semibold">{challenge.badge || 'Certified Submissions'}</span></div></div><div className="mt-10"><Link href={`/challenges/${challenge.slug}`}><Button variant="primary" size="lg" className="h-14 !rounded-2xl px-10 shadow-[0_8px_25px_rgb(37,99,235,0.25)] transition-all group-hover:shadow-[0_8px_35px_rgb(37,99,235,0.35)]">Start Competition<ArrowRight className="ml-2 h-5 w-5" /></Button></Link></div></div><div className="relative mt-12 hidden items-center justify-center lg:mt-0 lg:flex"><div className="relative h-[360px] w-full max-w-[400px]"><div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary-400 to-accent-400 opacity-20 blur-2xl" /><div className="relative flex h-full w-full items-center justify-center rounded-[2rem] border border-white/20 bg-white/40 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-800/40"><div className="text-center"><Trophy className="mx-auto h-24 w-24 text-accent-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]" /><div className="mt-6 font-black text-slate-900 dark:text-white text-4xl">{challenge.prize}</div><div className="mt-2 text-lg font-medium text-slate-600 dark:text-slate-400 uppercase tracking-widest">To Be Won</div></div></div></div></div></motion.div>)}</div> : <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">No ongoing challenges right now.</div>}
      </section>

      <section className="bg-white py-24 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="mb-16 text-center"><h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Why Join EDVO Resume Project Challenge?</h2><p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Discover what makes these challenges worth your time and effort.</p></div><StaggerGrid staggerDelay={0.1}><div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{featureHighlights.map((feature) => <div key={feature.title} className="group rounded-3xl border border-slate-100 bg-slate-50 p-8 transition-all hover:bg-white hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/80"><div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-transform group-hover:scale-110 dark:bg-slate-800 dark:ring-white/10"><feature.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" /></div><h3 className="text-xl font-bold text-slate-900 dark:text-white">{feature.title}</h3><p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">{feature.description}</p></div>)}</div></StaggerGrid></div></section>

      <section className="py-24 bg-slate-50 dark:bg-slate-950"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="mb-16 text-center"><h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">How It Works?</h2><p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Simple steps to go from participation to recognition.</p></div><div className="relative mx-auto max-w-5xl"><div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-primary-500/0 via-primary-500 to-primary-500/0 hidden md:block" /><div className="space-y-12 md:space-y-0">{howItWorks.map((item, index) => <div key={item.step} className="relative flex flex-col items-center md:flex-row md:odd:flex-row-reverse md:justify-between md:mb-12"><div className="hidden w-5/12 md:block" /><div className="absolute left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-4 border-slate-50 bg-primary-600 text-lg font-black text-white shadow-lg dark:border-slate-950">{index + 1}</div><div className="w-full md:w-5/12 rounded-[2rem] bg-white p-8 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-center md:text-left"><div className="text-4xl font-black text-slate-100 dark:text-slate-800 mb-4">{item.step}</div><h3 className="text-2xl font-bold text-slate-900 dark:text-white">{item.title}</h3><p className="mt-3 text-slate-600 dark:text-slate-400 text-lg">{item.description}</p></div></div>)}</div></div></div></section>

      <section className="bg-slate-900 py-24 text-white dark:bg-slate-950 border-t border-slate-800"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="mb-12 text-center md:text-left"><h2 className="text-3xl font-bold sm:text-4xl text-white">Completed Challenges</h2><p className="mt-4 text-slate-400 text-lg">Open any completed challenge page and use it as a guided practice project.</p></div>{isLoading ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-[280px] animate-pulse rounded-[2rem] border border-white/10 bg-white/5" />)}</div> : completedChallenges.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{completedChallenges.map((challenge) => <div key={challenge.id} className="group flex flex-col justify-between rounded-[2rem] border border-white/10 bg-white/5 p-8 transition-all hover:bg-white/10 hover:border-white/20"><div><div className="mb-6 flex items-center gap-3"><History className="h-5 w-5 text-slate-400" /><span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">ARCHIVED</span></div><h3 className="text-lg font-bold leading-relaxed text-white group-hover:text-primary-300 line-clamp-3">{challenge.title}</h3></div><div className="mt-8 border-t border-white/10 pt-6"><div className="flex items-center justify-between text-sm text-slate-400 mb-6"><span className="flex items-center gap-2"><Users2 className="h-4 w-4"/> {challenge.participants} Participated</span><span className="font-bold text-white tracking-wide">{challenge.prize} Prize</span></div><Link href={`/challenges/${challenge.slug}`} className="flex w-full items-center justify-center rounded-xl bg-white/10 py-3 text-sm font-bold text-white transition-colors group-hover:bg-primary-600">Practice Now</Link></div></div>)}</div> : <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/5 p-12 text-center text-slate-400">No completed challenges yet.</div>}</div></section>
    </main>
  );
}
