'use client';

import Link from 'next/link';
import { 
  ArrowRight, 
  Trophy, 
  Target, 
  Code2, 
  Users2, 
  History,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Medal
} from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { FadeIn, StaggerGrid } from '@/components/animations';

const ongoingChallenges = [
  {
    id: 'databricks-2',
    title: 'Build With Databricks: Hands-On Project Challenge - 2',
    description: 'Solve practical data problems through our resume project challenge and gain hands-on experience to boost your skills.',
    prize: '₹ 2,00,000',
    participants: '2.5k+',
    href: '/challenges/databricks-2'
  }
];

const completedChallenges = [
  {
    title: 'Providing Insights for Crisis Recovery in an Online Food Delivery Startup',
    participants: '2265',
    prize: '₹ 25,000',
    href: '/challenges/food-delivery'
  },
  {
    title: 'Provide Insights to Guide a Legacy Newspaper’s Survival in a Post-COVID Digital Era',
    participants: '1551',
    prize: '₹ 50,000',
    href: '/challenges/newspaper'
  },
  {
    title: 'Conduct Product Market Fit Research for Air Purifier Development Using AQI Analytics',
    participants: '2810',
    prize: '₹ 50,000',
    href: '/challenges/air-purifier'
  }
];

const howItWorks = [
  {
    step: '01',
    title: 'Choose a Challenge',
    description: 'New problem statements each month or choose a past project to work on.'
  },
  {
    step: '02',
    title: 'Submit Your Work',
    description: 'Share your insights & solutions via LinkedIn and publish as a post.'
  },
  {
    step: '03',
    title: 'Get Recognized',
    description: 'Showcase your work to stand out, earn rewards, and win prizes.'
  }
];

const featureHighlights = [
  {
    icon: Target,
    title: 'Real-World Challenges',
    description: 'Work on industry-relevant datasets.'
  },
  {
    icon: Code2,
    title: 'Boost Your Resume',
    description: 'Showcase projects that attract recruiters.'
  },
  {
    icon: Trophy,
    title: 'Win Prizes & Certificates',
    description: 'Stand out in the data community.'
  },
  {
    icon: Users2,
    title: 'Network & Learn',
    description: 'Join a thriving data-focused community.'
  }
];

export default function ChallengesPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white px-4 py-20 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-[0.03] dark:opacity-10" />
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-primary-500/10 blur-[100px] dark:bg-primary-500/20" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-accent-500/10 blur-[100px] dark:bg-accent-500/20" />
        
        <div className="relative mx-auto max-w-4xl text-center">
          <FadeIn>
            <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 dark:border-primary-500/20 dark:bg-primary-500/10 dark:text-primary-300 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              <span>Participate. Learn. Get Recognized!</span>
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-[4rem]">
              Solve real-world <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">data challenges.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300 sm:text-xl">
              Build your portfolio with industry-relevant datasets. Win cash prizes, get recognized by top employers, and stand out in the data community.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button variant="primary" size="lg" className="h-14 !rounded-full px-8 text-base shadow-[0_8px_30px_rgb(37,99,235,0.24)]">
                See Ongoing Challenges
              </Button>
              <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-200 dark:border-slate-950 dark:bg-slate-800" />
                  ))}
                </div>
                <span className="text-sm font-medium">Joined by 10,000+ builders</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Ongoing Challenges */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12">
          <Badge variant="accent" className="mb-3 uppercase tracking-wider">Live Now</Badge>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Ongoing Resume Project Challenge(s)</h2>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">Solve practical data problems and gain hands-on experience to boost your skills.</p>
        </div>

        <div className="grid gap-8">
          {ongoingChallenges.map((challenge) => (
            <motion.div 
              key={challenge.id}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-primary-500/5 transition-all dark:border-white/10 dark:bg-slate-900/50 dark:backdrop-blur-xl sm:p-12 lg:grid lg:grid-cols-2 lg:gap-12"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              
              <div className="relative z-10 flex flex-col justify-center">
                <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-accent-100 bg-accent-50 px-4 py-2 text-sm font-bold text-accent-700 dark:border-accent-500/20 dark:bg-accent-500/10 dark:text-accent-400">
                  <Trophy className="h-4 w-4" />
                  Prize Pool: {challenge.prize}
                </div>
                <h3 className="text-3xl font-bold leading-tight text-slate-900 dark:text-white sm:text-4xl">
                  {challenge.title}
                </h3>
                <p className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                  {challenge.description}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-500/20">
                      <Users2 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="font-semibold">{challenge.participants} Participants</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="font-semibold">Certified Submissions</span>
                  </div>
                </div>
                <div className="mt-10">
                  <Link href={challenge.href}>
                    <Button variant="primary" size="lg" className="h-14 !rounded-2xl px-10 shadow-[0_8px_25px_rgb(37,99,235,0.25)] transition-all group-hover:shadow-[0_8px_35px_rgb(37,99,235,0.35)]">
                      Participate Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Decorative Right Side for the Featured Card */}
              <div className="relative mt-12 hidden items-center justify-center lg:mt-0 lg:flex">
                <div className="relative h-[360px] w-full max-w-[400px]">
                   <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary-400 to-accent-400 opacity-20 blur-2xl" />
                   <div className="relative flex h-full w-full items-center justify-center rounded-[2rem] border border-white/20 bg-white/40 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-800/40">
                      <div className="text-center">
                        <Trophy className="mx-auto h-24 w-24 text-accent-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]" />
                        <div className="mt-6 font-black text-slate-900 dark:text-white text-4xl">{challenge.prize}</div>
                        <div className="mt-2 text-lg font-medium text-slate-600 dark:text-slate-400 uppercase tracking-widest">To Be Won</div>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Join */}
      <section className="bg-white py-24 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Why Join EDVO Resume Project Challenge?</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Discover what makes these challenges worth your time and effort.</p>
          </div>
          
          <StaggerGrid staggerDelay={0.1}>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {featureHighlights.map((feature) => (
                <div key={feature.title} className="group rounded-3xl border border-slate-100 bg-slate-50 p-8 transition-all hover:bg-white hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/80">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-transform group-hover:scale-110 dark:bg-slate-800 dark:ring-white/10">
                    <feature.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </StaggerGrid>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
             <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">How It Works?</h2>
             <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Simple steps to go from participation to recognition.</p>
          </div>
          
          <div className="relative mx-auto max-w-5xl">
            <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-primary-500/0 via-primary-500 to-primary-500/0 hidden md:block" />
            <div className="space-y-12 md:space-y-0">
              {howItWorks.map((item, index) => (
                <div key={item.step} className="relative flex flex-col items-center md:flex-row md:odd:flex-row-reverse md:justify-between md:mb-12">
                  <div className="hidden w-5/12 md:block" />
                  <div className="absolute left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-4 border-slate-50 bg-primary-600 text-lg font-black text-white shadow-lg dark:border-slate-950">
                    {index + 1}
                  </div>
                  <div className="w-full md:w-5/12 rounded-[2rem] bg-white p-8 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-center md:text-left">
                    <div className="text-4xl font-black text-slate-100 dark:text-slate-800 mb-4">{item.step}</div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{item.title}</h3>
                    <p className="mt-3 text-slate-600 dark:text-slate-400 text-lg">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Completed Challenges */}
      <section className="bg-slate-900 py-24 text-white dark:bg-slate-950 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center md:text-left">
            <h2 className="text-3xl font-bold sm:text-4xl text-white">Completed Challenges</h2>
            <p className="mt-4 text-slate-400 text-lg">Solve practical data problems and grow through hands-on experience.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {completedChallenges.map((challenge) => (
              <div key={challenge.title} className="group flex flex-col justify-between rounded-[2rem] border border-white/10 bg-white/5 p-8 transition-all hover:bg-white/10 hover:border-white/20">
                <div>
                  <div className="mb-6 flex items-center gap-3">
                    <History className="h-5 w-5 text-slate-400" />
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">ARCHIVED</span>
                  </div>
                  <h3 className="text-lg font-bold leading-relaxed text-white group-hover:text-primary-300 line-clamp-3">
                    {challenge.title}
                  </h3>
                </div>
                
                <div className="mt-8 border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between text-sm text-slate-400 mb-6">
                    <span className="flex items-center gap-2"><Users2 className="h-4 w-4"/> {challenge.participants} Participated</span>
                    <span className="font-bold text-white tracking-wide">{challenge.prize} Prize</span>
                  </div>
                  <Link href={challenge.href} className="flex w-full items-center justify-center rounded-xl bg-white/10 py-3 text-sm font-bold text-white transition-colors group-hover:bg-primary-600">
                    Practice Now
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
             <Link href="/challenges/all">
               <Button variant="outline" size="lg" className="!rounded-full !border-white/20 !text-white hover:!bg-white/10 px-8">
                 View All Challenges
               </Button>
             </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
