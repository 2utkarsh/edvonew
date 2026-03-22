import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Clock3, Layers3, Target, Trophy, Users2, CheckCircle2, FileText } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { fetchChallengeBySlug } from '../data';

export default async function ChallengeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const challenge = await fetchChallengeBySlug(slug);
    const primaryLabel = challenge.phase === 'ongoing' ? 'Start Competition' : 'Start Practice';
    const secondaryLabel = challenge.phase === 'ongoing' ? 'Explore Courses' : 'Back to Challenges';
    const secondaryHref = challenge.phase === 'ongoing' ? '/courses' : '/challenges';

    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <section className="relative overflow-hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/8 via-transparent to-accent-500/8" />
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
            <div className="relative z-10">
              <Badge variant="gradient" className="mb-5">{challenge.phase === 'ongoing' ? 'Live Competition' : 'Practice Challenge'}</Badge>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">{challenge.title}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">{challenge.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{challenge.category}</div>
                <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{challenge.difficulty}</div>
                <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{challenge.duration}</div>
              </div>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href={challenge.actionUrl || '/courses'}>
                  <Button variant="primary" size="lg" className="h-13 !rounded-full px-8">{primaryLabel}<ArrowRight className="ml-2 h-5 w-5" /></Button>
                </Link>
                <Link href={secondaryHref}>
                  <Button variant="outline" size="lg" className="h-13 !rounded-full px-8">{secondaryLabel}</Button>
                </Link>
              </div>
            </div>
            <div className="relative min-h-[320px] overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <Image src={challenge.image} alt={challenge.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 flex flex-wrap gap-3 p-6 text-white">
                <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-md"><div className="text-xs uppercase tracking-[0.2em] text-white/70">Prize</div><div className="mt-1 text-lg font-black">{challenge.prize}</div></div>
                <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-md"><div className="text-xs uppercase tracking-[0.2em] text-white/70">Participants</div><div className="mt-1 text-lg font-black">{challenge.participants}</div></div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-8">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-center gap-3"><Target className="h-5 w-5 text-primary-600 dark:text-primary-400" /><h2 className="text-2xl font-black text-slate-900 dark:text-white">Challenge Objective</h2></div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{challenge.objective || challenge.description}</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><div className="mb-3 flex items-center gap-3"><Clock3 className="h-5 w-5 text-primary-600 dark:text-primary-400" /><div className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Duration</div></div><div className="text-xl font-black text-slate-900 dark:text-white">{challenge.duration}</div></div>
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><div className="mb-3 flex items-center gap-3"><Layers3 className="h-5 w-5 text-primary-600 dark:text-primary-400" /><div className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Difficulty</div></div><div className="text-xl font-black text-slate-900 dark:text-white">{challenge.difficulty}</div></div>
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><div className="mb-3 flex items-center gap-3"><Trophy className="h-5 w-5 text-primary-600 dark:text-primary-400" /><div className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Prize</div></div><div className="text-xl font-black text-slate-900 dark:text-white">{challenge.prize}</div></div>
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><div className="mb-3 flex items-center gap-3"><Users2 className="h-5 w-5 text-primary-600 dark:text-primary-400" /><div className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Participants</div></div><div className="text-xl font-black text-slate-900 dark:text-white">{challenge.participants}</div></div>
              </div>
            </div>
            <div className="space-y-8">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-5 flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary-600 dark:text-primary-400" /><h2 className="text-2xl font-black text-slate-900 dark:text-white">What You Will Use</h2></div>
                <div className="flex flex-wrap gap-3">{challenge.tools.length ? challenge.tools.map((tool) => <span key={tool} className="rounded-full bg-primary-50 px-4 py-2 text-sm font-bold text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">{tool}</span>) : <span className="text-slate-500 dark:text-slate-400">Tools will be shared in the challenge brief.</span>}</div>
              </div>
              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-5 flex items-center gap-3"><FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" /><h2 className="text-2xl font-black text-slate-900 dark:text-white">Deliverables</h2></div>
                <div className="space-y-3">{challenge.deliverables.length ? challenge.deliverables.map((entry, index) => <div key={entry} className="flex items-start gap-3"><div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">{index + 1}</div><p className="text-slate-600 dark:text-slate-300">{entry}</p></div>) : <p className="text-slate-500 dark:text-slate-400">Deliverables will appear here once they are added from admin.</p>}</div>
              </div>
              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-5 flex items-center gap-3"><ArrowRight className="h-5 w-5 text-primary-600 dark:text-primary-400" /><h2 className="text-2xl font-black text-slate-900 dark:text-white">How To {challenge.phase === 'ongoing' ? 'Compete' : 'Practice'}</h2></div>
                <div className="space-y-4">{challenge.steps.length ? challenge.steps.map((step, index) => <div key={step} className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-black text-white">{index + 1}</div><p className="pt-1 text-slate-600 dark:text-slate-300">{step}</p></div>) : <p className="text-slate-500 dark:text-slate-400">Steps will appear here once they are added from admin.</p>}</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  } catch {
    notFound();
  }
}
