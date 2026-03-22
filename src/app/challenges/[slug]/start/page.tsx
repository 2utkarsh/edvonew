'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Trophy } from 'lucide-react';
import Button from '@/components/ui/Button';
import { fetchChallengeBySlug, type ChallengeItem } from '../../data';
import NotFoundExperience from '@/components/errors/NotFoundExperience';

function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
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
  const [submissionLocked, setSubmissionLocked] = useState(false);

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
          const submissionKey = `challenge-submitted:${item.slug}`;
          const existingSubmission = typeof window !== 'undefined' ? window.localStorage.getItem(submissionKey) : null;
          const parsedSubmission = existingSubmission ? JSON.parse(existingSubmission) : null;
          setSubmissionLocked(Boolean(parsedSubmission));
          setHasSubmitted(Boolean(parsedSubmission));
          setAnswers(
            item.questions.reduce<Record<string, string>>((accumulator, _question, index) => {
              accumulator[`question-${index}`] = parsedSubmission?.[`question-${index}`] || '';
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

  const submitQuiz = useMemo(() => {
    return () => {
      if (!challenge || submissionLocked) return;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(`challenge-submitted:${challenge.slug}`, JSON.stringify(answers));
      }
      setSubmissionLocked(true);
      setHasSubmitted(true);
    };
  }, [answers, challenge, submissionLocked]);

  useEffect(() => {
    if (!challenge || hasSubmitted || submissionLocked || secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          submitQuiz();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [challenge, hasSubmitted, secondsLeft, submissionLocked, submitQuiz]);

  const totalScore = useMemo(() => challenge?.questions.reduce((sum, question) => sum + question.points, 0) || 0, [challenge]);
  const earnedScore = useMemo(() => {
    if (!challenge || !hasSubmitted) return 0;
    return challenge.questions.reduce((sum, question, index) => {
      const key = `question-${index}`;
      return sum + (answers[key] === question.correctAnswer ? question.points : 0);
    }, 0);
  }, [answers, challenge, hasSubmitted]);

  if (isLoading) {
    return <main className="min-h-screen bg-slate-50 dark:bg-slate-950"><div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8"><div className="h-[420px] animate-pulse rounded-[2rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" /></div></main>;
  }

  if (!challenge || loadError) {
    return <NotFoundExperience variant="challenges" />;
  }

  const timeUp = secondsLeft <= 0;

  function updateAnswer(key: string, value: string) {
    if (hasSubmitted || submissionLocked) return;
    setAnswers((current) => ({ ...current, [key]: value }));
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href={`/challenges/${challenge.slug}`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
              <ArrowLeft className="h-4 w-4" /> Back to Challenge
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <div className={`rounded-full px-4 py-2 text-sm font-black ${timeUp ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'}`}>
                Timer: {formatTime(secondsLeft)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center gap-3"><Trophy className="h-5 w-5 text-primary-600 dark:text-primary-400" /><h2 className="text-2xl font-black text-slate-900 dark:text-white">{challenge.phase === 'ongoing' ? 'Competition Quiz' : 'Practice Quiz'}</h2></div>
          <p className="mb-6 text-slate-600 dark:text-slate-300">{challenge.phase === 'ongoing' ? 'Complete the quiz before the timer runs out. Your score and correct answers appear immediately after submission.' : 'Practice with the timed quiz and review the answers once you finish or the timer expires.'}</p>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Questions</div><div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{challenge.questions.length}</div></div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Timer</div><div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{formatTime(secondsLeft)}</div></div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Submissions</div><div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">1</div></div>
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
                          <input type="radio" name={fieldKey} value={option} checked={checked} onChange={(event) => updateAnswer(fieldKey, event.target.value)} disabled={hasSubmitted || submissionLocked} className="mt-1 h-4 w-4 border-slate-300 text-primary-600 focus:ring-primary-500" />
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
            <Button type="button" variant="primary" size="lg" className="h-14 !rounded-full px-8" onClick={submitQuiz} disabled={submissionLocked}>
              {submissionLocked ? 'Already Submitted' : challenge.phase === 'ongoing' ? 'Submit Competition Quiz' : 'Submit Practice Quiz'}
            </Button>
          </div>
          {(hasSubmitted || timeUp) ? (
            <div className="mt-6 rounded-[1.5rem] border border-primary-200 bg-primary-50 px-5 py-4 text-primary-900 dark:border-primary-500/20 dark:bg-primary-500/10 dark:text-primary-100">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-primary-700 dark:text-primary-300">Quiz Score</div>
              <div className="mt-2 text-3xl font-black">{earnedScore} / {totalScore}</div>
              <div className="mt-2 text-sm font-medium text-primary-800 dark:text-primary-200">{timeUp && !hasSubmitted ? 'Time is up. Your score is based on the answers selected when the timer ended.' : earnedScore === totalScore ? 'Perfect score. Every answer is correct.' : 'Review the correct answers below. This challenge allows only one submission.'}</div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
