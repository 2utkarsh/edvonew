'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Clock3, Gift, Moon, ShieldCheck, Sun, Target, Trophy } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { fetchChallengeBySlug, type ChallengeItem } from '../../data';
import NotFoundExperience from '@/components/errors/NotFoundExperience';
import { useThemeStore } from '@/store/useThemeStore';

function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

function formatDate(value: string) {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ChallengeStartPage() {
  const params = useParams<{ slug: string }>();
  const slug = String(params?.slug || '');
  const [challenge, setChallenge] = useState<ChallengeItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
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
          setSecondsLeft(Math.max(60, item.quizDurationMinutes * 60));
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

  useEffect(() => {
    if (!challenge || hasSubmitted || secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setHasSubmitted(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [challenge, hasSubmitted, secondsLeft]);

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

  const phaseLabel = challenge.phase === 'ongoing' ? 'Live Competition' : 'Practice Session';
  const timeUp = secondsLeft <= 0;

  function updateAnswer(key: string, value: string) {
    if (hasSubmitted) return;
    setAnswers((current) => ({ ...current, [key]: value }));
  }

  function submitQuiz() {
    setHasSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href={`/challenges/${challenge.slug}`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                <ArrowLeft className="h-4 w-4" /> Back to Challenge
              </Link>
              <Badge variant="gradient">{phaseLabel}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className={`rounded-full px-4 py-2 text-sm font-black ${timeUp ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'}`}>
                Timer: {formatTime(secondsLeft)}
              </div>
              {themeConfig.adminDarkModeEnabled ? (
                <button
                  type="button"
                  onClick={toggleMode}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                >
                  {themeConfig.mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {themeConfig.mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-8">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="relative h-64 w-full">
                <Image src={challenge.image} alt={challenge.title} fill className="object-cover" />
              </div>
              <div className="space-y-5 p-8">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <Badge variant="gradient">{challenge.category}</Badge>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-slate-700 dark:bg-slate-800 dark:text-slate-200">{challenge.difficulty}</span>
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white">{challenge.title}</h1>
                  <p className="mt-3 text-slate-600 dark:text-slate-300">{challenge.description}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Quiz Time</div><div className="mt-2 text-xl font-black text-slate-900 dark:text-white">{challenge.quizDurationMinutes} minutes</div></div>
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Total Points</div><div className="mt-2 text-xl font-black text-slate-900 dark:text-white">{totalScore}</div></div>
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Prize Pool</div><div className="mt-2 text-xl font-black text-slate-900 dark:text-white">{challenge.prize}</div></div>
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Window</div><div className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{formatDate(challenge.startDate)} to {formatDate(challenge.endDate)}</div></div>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/70">
                  <div className="mb-3 flex items-center gap-2 text-slate-900 dark:text-white"><Gift className="h-5 w-5 text-primary-600 dark:text-primary-400" /><h2 className="text-lg font-black">Prize Distribution</h2></div>
                  <div className="space-y-2">{challenge.prizeDistribution.map((entry) => <div key={entry} className="text-sm font-medium text-slate-700 dark:text-slate-300">- {entry}</div>)}</div>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/70">
                  <div className="mb-3 flex items-center gap-2 text-slate-900 dark:text-white"><Target className="h-5 w-5 text-primary-600 dark:text-primary-400" /><h2 className="text-lg font-black">Challenge Objective</h2></div>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{challenge.objective}</p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/70">
                  <div className="mb-3 flex items-center gap-2 text-slate-900 dark:text-white"><ShieldCheck className="h-5 w-5 text-primary-600 dark:text-primary-400" /><h2 className="text-lg font-black">Rules</h2></div>
                  <div className="space-y-2">{challenge.rules.map((entry) => <div key={entry} className="text-sm font-medium text-slate-700 dark:text-slate-300">- {entry}</div>)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-5 flex items-center gap-3"><Trophy className="h-5 w-5 text-primary-600 dark:text-primary-400" /><h2 className="text-2xl font-black text-slate-900 dark:text-white">{challenge.phase === 'ongoing' ? 'Competition Quiz' : 'Practice Quiz'}</h2></div>
              <p className="mb-6 text-slate-600 dark:text-slate-300">{challenge.phase === 'ongoing' ? 'Complete the quiz before the timer runs out. Your score and correct answers appear immediately after submission.' : 'Practice with the timed quiz and review the answers once you finish or the timer expires.'}</p>
              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Questions</div><div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{challenge.questions.length}</div></div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Timer</div><div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{formatTime(secondsLeft)}</div></div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Submissions</div><div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{challenge.maxSubmissions}</div></div>
              </div>
              <div className="space-y-5">
                {challenge.questions.map((question, index) => {
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
                              <input type="radio" name={fieldKey} value={option} checked={checked} onChange={(event) => updateAnswer(fieldKey, event.target.value)} disabled={hasSubmitted} className="mt-1 h-4 w-4 border-slate-300 text-primary-600 focus:ring-primary-500" />
                              <span className="text-sm font-medium">{option}</span>
                            </label>
                          );
                        })}
                      </div>
                      {hasSubmitted ? <div className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${isCorrect ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200'}`}><div>Correct answer: <span className="font-black">{question.correctAnswer}</span></div>{question.explanation ? <div className="mt-1">{question.explanation}</div> : null}</div> : null}
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex flex-wrap gap-4">
                <Button type="button" variant="primary" size="lg" className="h-14 !rounded-full px-8" onClick={submitQuiz}>
                  {challenge.phase === 'ongoing' ? 'Submit Competition Quiz' : 'Submit Practice Quiz'}
                </Button>
                {hasSubmitted ? <Button type="button" variant="outline" size="lg" className="h-14 !rounded-full px-8" onClick={() => { setHasSubmitted(false); setSecondsLeft(Math.max(60, challenge.quizDurationMinutes * 60)); setAnswers(challenge.questions.reduce<Record<string, string>>((accumulator, _question, index) => { accumulator[`question-${index}`] = ''; return accumulator; }, {})); }}>Restart Quiz</Button> : null}
              </div>
              {(hasSubmitted || timeUp) ? (
                <div className="mt-6 rounded-[1.5rem] border border-primary-200 bg-primary-50 px-5 py-4 text-primary-900 dark:border-primary-500/20 dark:bg-primary-500/10 dark:text-primary-100">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-primary-700 dark:text-primary-300">Quiz Score</div>
                  <div className="mt-2 text-3xl font-black">{earnedScore} / {totalScore}</div>
                  <div className="mt-2 text-sm font-medium text-primary-800 dark:text-primary-200">{timeUp && !hasSubmitted ? 'Time is up. Your score is based on the answers selected when the timer ended.' : earnedScore === totalScore ? 'Perfect score. Every answer is correct.' : 'Review the correct answers and restart if you want another timed attempt.'}</div>
                </div>
              ) : null}
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-5 flex items-center gap-3"><Clock3 className="h-5 w-5 text-primary-600 dark:text-primary-400" /><h2 className="text-2xl font-black text-slate-900 dark:text-white">Start Page Checklist</h2></div>
              <div className="space-y-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                {challenge.steps.map((step) => <div key={step}>- {step}</div>)}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
