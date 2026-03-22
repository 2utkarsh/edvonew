'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, FileText, Layers3, Moon, ShieldCheck, Sun, Target, Trophy, Users2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { fetchChallengeBySlug, type ChallengeItem } from '../data';
import NotFoundExperience from '@/components/errors/NotFoundExperience';
import { useThemeStore } from '@/store/useThemeStore';

function formatDate(value: string) {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ChallengeDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = String(params?.slug || '');
  const [challenge, setChallenge] = useState<ChallengeItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { config: themeConfig, toggleMode } = useThemeStore();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!slug) {
        if (!cancelled) {
          setLoadError('Challenge not found');
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setLoadError('');
        setHasSubmitted(false);
        const item = await fetchChallengeBySlug(slug);
        if (!cancelled) {
          setChallenge(item);
          setAnswers(
            item.questions.reduce<Record<string, string>>((accumulator, _question, index) => {
              accumulator[`question-${index}`] = '';
              return accumulator;
            }, {})
          );
        }
      } catch (error: any) {
        if (!cancelled) setLoadError(error?.message || 'Challenge not found');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const isExpired = useMemo(() => {
    if (!challenge?.expiryDate) return false;
    const expiry = new Date(challenge.expiryDate);
    return !Number.isNaN(expiry.getTime()) && expiry.getTime() < Date.now();
  }, [challenge]);

  const totalScore = useMemo(() => challenge?.questions.reduce((sum, question) => sum + question.points, 0) || 0, [challenge]);
  const earnedScore = useMemo(() => {
    if (!challenge || !hasSubmitted) return 0;
    return challenge.questions.reduce((sum, question, index) => {
      const key = `question-${index}`;
      return sum + (answers[key] === question.correctAnswer ? question.points : 0);
    }, 0);
  }, [answers, challenge, hasSubmitted]);

  if (isLoading) {
    return <main className="min-h-screen bg-slate-50 dark:bg-slate-950"><div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"><div className="h-[420px] animate-pulse rounded-[2rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" /></div></main>;
  }

  if (!challenge || loadError) {
    return <NotFoundExperience variant="challenges" />;
  }

  const primaryLabel = challenge.phase === 'ongoing' ? 'Start Competition' : 'Start Practice';
  const primaryHref = '#challenge-quiz';
  const secondaryLabel = challenge.phase === 'ongoing' ? 'Explore Courses' : 'Back to Challenges';
  const secondaryHref = challenge.phase === 'ongoing' ? '/courses' : '/challenges';
  const quizTitle = challenge.phase === 'ongoing' ? 'Competition Quiz' : 'Practice Quiz';
  const quizDescription =
    challenge.phase === 'ongoing'
      ? 'Answer the challenge MCQs below, then check your score and review the correct answers.'
      : 'Use these MCQs to practice the challenge, then review your score and the correct answers after submission.';

  function updateAnswer(key: string, value: string) {
    setAnswers((current) => ({ ...current, [key]: value }));
  }

  function handleQuestionnaireSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="relative overflow-hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/8 via-transparent to-accent-500/8" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
          <div className="relative z-10">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <Badge variant="gradient">{challenge.phase === 'ongoing' ? 'Live Competition' : 'Practice Challenge'}</Badge>
              {isExpired ? <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-red-600 dark:bg-red-500/10 dark:text-red-300">Expired</span> : null}
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-slate-700 dark:bg-slate-800 dark:text-slate-200">Quiz Included</span>
            </div>
            {themeConfig.adminDarkModeEnabled ? (
              <div className="mb-5">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                  title={themeConfig.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {themeConfig.mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {themeConfig.mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
            ) : null}
            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">{challenge.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">{challenge.description}</p>
            {challenge.statusNote ? <p className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">{challenge.statusNote}</p> : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{challenge.category}</div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{challenge.difficulty}</div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{challenge.duration}</div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{challenge.competitionMode}</div>
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href={primaryHref}>
                <Button variant="primary" size="lg" className="h-14 !rounded-full px-8">{primaryLabel}<ArrowRight className="ml-2 h-5 w-5" /></Button>
              </Link>
              <Link href={secondaryHref}>
                <Button variant="outline" size="lg" className="h-14 !rounded-full px-8">{secondaryLabel}</Button>
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

      <section id="challenge-workspace" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-8">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-3"><Target className="h-5 w-5 text-primary-600 dark:text-primary-400" /><h2 className="text-2xl font-black text-slate-900 dark:text-white">Challenge Objective</h2></div>
              <p className="leading-relaxed text-slate-600 dark:text-slate-300">{challenge.objective || challenge.description}</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><div className="mb-3 flex items-center gap-3"><Clock3 className="h-5 w-5 text-primary-600 dark:text-primary-400" /><div className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Duration</div></div><div className="text-xl font-black text-slate-900 dark:text-white">{challenge.duration}</div></div>
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><div className="mb-3 flex items-center gap-3"><Layers3 className="h-5 w-5 text-primary-600 dark:text-primary-400" /><div className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Difficulty</div></div><div className="text-xl font-black text-slate-900 dark:text-white">{challenge.difficulty}</div></div>
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><div className="mb-3 flex items-center gap-3"><Trophy className="h-5 w-5 text-primary-600 dark:text-primary-400" /><div className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Prize</div></div><div className="text-xl font-black text-slate-900 dark:text-white">{challenge.prize}</div></div>
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><div className="mb-3 flex items-center gap-3"><Users2 className="h-5 w-5 text-primary-600 dark:text-primary-400" /><div className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Participants</div></div><div className="text-xl font-black text-slate-900 dark:text-white">{challenge.participants}</div></div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><div className="mb-3 flex items-center gap-3"><CalendarDays className="h-5 w-5 text-primary-600 dark:text-primary-400" /><div className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Start</div></div><div className="text-base font-bold text-slate-900 dark:text-white">{formatDate(challenge.startDate)}</div><div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{challenge.startTime || 'Not set'}</div></div>
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><div className="mb-3 flex items-center gap-3"><CalendarDays className="h-5 w-5 text-primary-600 dark:text-primary-400" /><div className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">End</div></div><div className="text-base font-bold text-slate-900 dark:text-white">{formatDate(challenge.endDate)}</div><div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{challenge.endTime || 'Not set'}</div></div>
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><div className="mb-3 flex items-center gap-3"><CalendarDays className="h-5 w-5 text-primary-600 dark:text-primary-400" /><div className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Registration Deadline</div></div><div className="text-base font-bold text-slate-900 dark:text-white">{formatDate(challenge.registrationDeadline)}</div></div>
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><div className="mb-3 flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-primary-600 dark:text-primary-400" /><div className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Limits</div></div><div className="text-base font-bold text-slate-900 dark:text-white">{challenge.maxSubmissions} submission{challenge.maxSubmissions === 1 ? '' : 's'}</div><div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{challenge.teamSize}</div></div>
            </div>
          </div>
          <div className="space-y-8">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
              <div id="challenge-quiz" className="mb-5 flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary-600 dark:text-primary-400" /><h2 className="text-2xl font-black text-slate-900 dark:text-white">{quizTitle}</h2></div>
              <p className="mb-6 text-slate-600 dark:text-slate-300">{quizDescription}</p>
              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-4 dark:bg-slate-800/70"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Quiz Questions</div><div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{challenge.questions.length}</div></div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4 dark:bg-slate-800/70"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Total Points</div><div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{totalScore}</div></div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4 dark:bg-slate-800/70"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Mode</div><div className="mt-2 text-base font-black text-slate-900 dark:text-white">{challenge.phase === 'ongoing' ? 'Competition Quiz' : 'Practice Quiz'}</div></div>
              </div>
              <form className="space-y-5" onSubmit={handleQuestionnaireSubmit}>
                {challenge.questions.length ? challenge.questions.map((question, index) => {
                  const fieldKey = `question-${index}`;
                  const selectedAnswer = answers[fieldKey] || '';
                  const isCorrect = selectedAnswer === question.correctAnswer;
                  return (
                    <div key={fieldKey} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/60">
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <div className="text-base font-black text-slate-900 dark:text-white">{index + 1}. {question.prompt}</div>
                        <div className="rounded-full bg-primary-50 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">{question.points} pts</div>
                      </div>
                      <div className="space-y-3">
                        {question.options.map((option) => {
                          const checked = selectedAnswer === option;
                          const showCorrect = hasSubmitted && option === question.correctAnswer;
                          const showWrong = hasSubmitted && checked && option !== question.correctAnswer;
                          const className = [
                            'flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition',
                            showCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200' : '',
                            showWrong ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-200' : '',
                            !showCorrect && !showWrong ? 'border-slate-200 bg-white text-slate-700 hover:border-primary-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200' : '',
                          ].filter(Boolean).join(' ');
                          return (
                            <label key={option} className={className}>
                              <input
                                type="radio"
                                name={fieldKey}
                                value={option}
                                checked={checked}
                                onChange={(event) => updateAnswer(fieldKey, event.target.value)}
                                className="mt-1 h-4 w-4 border-slate-300 text-primary-600 focus:ring-primary-500"
                              />
                              <span className="text-sm font-medium">{option}</span>
                            </label>
                          );
                        })}
                      </div>
                      {hasSubmitted ? (
                        <div className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${isCorrect ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200'}`}>
                          <div>Correct answer: <span className="font-black">{question.correctAnswer}</span></div>
                          {question.explanation ? <div className="mt-1">{question.explanation}</div> : null}
                        </div>
                      ) : null}
                    </div>
                  );
                }) : <div className="rounded-2xl bg-slate-50 px-4 py-4 text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">No quiz has been added from admin yet.</div>}
                <div className="flex flex-wrap gap-4">
                  <Button type="submit" variant="primary" size="lg" className="h-14 !rounded-full px-8">{challenge.phase === 'ongoing' ? 'Submit Competition Quiz' : 'Submit Practice Quiz'}</Button>
                  {hasSubmitted ? <Button type="button" variant="outline" size="lg" className="h-14 !rounded-full px-8" onClick={() => setHasSubmitted(false)}>Try Again</Button> : null}
                </div>
                {hasSubmitted ? (
                  <div className="rounded-[1.5rem] border border-primary-200 bg-primary-50 px-5 py-4 text-primary-900 dark:border-primary-500/20 dark:bg-primary-500/10 dark:text-primary-100">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-primary-700 dark:text-primary-300">Quiz Score</div>
                    <div className="mt-2 text-3xl font-black">{earnedScore} / {totalScore}</div>
                    <div className="mt-2 text-sm font-medium text-primary-800 dark:text-primary-200">{earnedScore === totalScore ? 'Perfect score. Every answer is correct.' : 'Review the highlighted correct answers and try again if you want a better score.'}</div>
                  </div>
                ) : null}
              </form>
            </div>
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
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-5 flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-primary-600 dark:text-primary-400" /><h2 className="text-2xl font-black text-slate-900 dark:text-white">Eligibility and Rules</h2></div>
              <div className="space-y-6">
                <div>
                  <div className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Eligibility</div>
                  <div className="space-y-2">{challenge.eligibility.length ? challenge.eligibility.map((entry) => <div key={entry} className="text-slate-600 dark:text-slate-300">- {entry}</div>) : <div className="text-slate-500 dark:text-slate-400">No eligibility notes added yet.</div>}</div>
                </div>
                <div>
                  <div className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Rules</div>
                  <div className="space-y-2">{challenge.rules.length ? challenge.rules.map((entry) => <div key={entry} className="text-slate-600 dark:text-slate-300">- {entry}</div>) : <div className="text-slate-500 dark:text-slate-400">No rules added yet.</div>}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
