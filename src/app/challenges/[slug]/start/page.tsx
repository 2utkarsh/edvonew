'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Play, Terminal, Trophy } from 'lucide-react';
import Button from '@/components/ui/Button';
import { fetchChallengeBySlug, type ChallengeItem, type CodingTestCase } from '../../data';
import NotFoundExperience from '@/components/errors/NotFoundExperience';

function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

function parseInput(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return '';
  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
}

function normalizeOutput(output: unknown) {
  if (typeof output === 'string') return output.trim();
  if (typeof output === 'number' || typeof output === 'boolean') return String(output);
  return JSON.stringify(output);
}

function runCodingTestSuite(code: string, functionName: string, testCases: CodingTestCase[]) {
  try {
    const evaluator = new Function(`${code}\nreturn typeof ${functionName} !== 'undefined' ? ${functionName} : null;`);
    const solve = evaluator();
    if (typeof solve !== 'function') {
      return { ok: false, error: `Function ${functionName} was not found in your code.`, results: [] as any[] };
    }

    const results = testCases.map((testCase) => {
      try {
        const actual = normalizeOutput(solve(parseInput(testCase.input)));
        const expected = normalizeOutput(testCase.expectedOutput);
        return { ...testCase, actual, passed: actual === expected };
      } catch (error: any) {
        return { ...testCase, actual: error?.message || 'Runtime error', passed: false };
      }
    });

    return { ok: true, results };
  } catch (error: any) {
    return { ok: false, error: error?.message || 'Code failed to compile.', results: [] as any[] };
  }
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
  const [code, setCode] = useState('');
  const [visibleResults, setVisibleResults] = useState<any[]>([]);
  const [hiddenResults, setHiddenResults] = useState<any[]>([]);
  const [runnerError, setRunnerError] = useState('');

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
          const durationSeconds = item.codingChallenge?.enabled ? item.codingChallenge.durationMinutes * 60 : item.quizDurationMinutes * 60;
          setSecondsLeft(Math.max(60, durationSeconds));
          const submissionKey = `challenge-submitted:${item.slug}`;
          const existingSubmission = typeof window !== 'undefined' ? window.localStorage.getItem(submissionKey) : null;
          const parsedSubmission = existingSubmission ? JSON.parse(existingSubmission) : null;
          setSubmissionLocked(Boolean(parsedSubmission));
          setHasSubmitted(Boolean(parsedSubmission));
          setAnswers(
            item.questions.reduce<Record<string, string>>((accumulator, _question, index) => {
              accumulator[`question-${index}`] = parsedSubmission?.answers?.[`question-${index}`] || parsedSubmission?.[`question-${index}`] || '';
              return accumulator;
            }, {})
          );
          setCode(parsedSubmission?.code || item.codingChallenge?.starterCode || '');
          setVisibleResults(parsedSubmission?.visibleResults || []);
          setHiddenResults(parsedSubmission?.hiddenResults || []);
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

  const isCodingChallenge = Boolean(challenge?.codingChallenge?.enabled);

  const submitQuiz = useMemo(() => {
    return () => {
      if (!challenge || submissionLocked) return;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(`challenge-submitted:${challenge.slug}`, JSON.stringify({ answers, code, visibleResults, hiddenResults }));
      }
      setSubmissionLocked(true);
      setHasSubmitted(true);
    };
  }, [answers, challenge, code, hiddenResults, submissionLocked, visibleResults]);

  useEffect(() => {
    if (!challenge || hasSubmitted || submissionLocked || secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          if (isCodingChallenge && challenge.codingChallenge) {
            const visibleSuite = runCodingTestSuite(code, challenge.codingChallenge.functionName, challenge.codingChallenge.visibleTestCases);
            const hiddenSuite = runCodingTestSuite(code, challenge.codingChallenge.functionName, challenge.codingChallenge.hiddenTestCases);
            setVisibleResults(visibleSuite.results);
            setHiddenResults(hiddenSuite.results);
          }
          submitQuiz();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [challenge, code, hasSubmitted, isCodingChallenge, secondsLeft, submissionLocked, submitQuiz]);

  const totalScore = useMemo(() => challenge?.questions.reduce((sum, question) => sum + question.points, 0) || 0, [challenge]);
  const earnedScore = useMemo(() => {
    if (!challenge || !hasSubmitted) return 0;
    return challenge.questions.reduce((sum, question, index) => {
      const key = `question-${index}`;
      return sum + (answers[key] === question.correctAnswer ? question.points : 0);
    }, 0);
  }, [answers, challenge, hasSubmitted]);

  const codingPassedCount = useMemo(() => hiddenResults.filter((result) => result.passed).length, [hiddenResults]);
  const codingTotalCount = useMemo(() => hiddenResults.length, [hiddenResults]);

  if (isLoading) {
    return <main className="min-h-screen bg-slate-50 dark:bg-slate-950"><div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8"><div className="h-[420px] animate-pulse rounded-[2rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" /></div></main>;
  }

  if (!challenge || loadError) {
    return <NotFoundExperience variant="challenges" />;
  }

  const timeUp = secondsLeft <= 0;

  function updateAnswer(key: string, value: string) {
    if (hasSubmitted || submissionLocked) return;
    setAnswers((current) => ({ ...current, [key]: value }));
  }

  function runVisibleTests() {
    const codingChallenge = challenge?.codingChallenge;
    if (!codingChallenge) return;
    const suite = runCodingTestSuite(code, codingChallenge.functionName, codingChallenge.visibleTestCases);
    setRunnerError(suite.ok ? '' : suite.error || 'Unable to run tests.');
    setVisibleResults(suite.results);
  }

  function submitCodingChallenge() {
    const codingChallenge = challenge?.codingChallenge;
    if (!codingChallenge || submissionLocked) return;
    const visibleSuite = runCodingTestSuite(code, codingChallenge.functionName, codingChallenge.visibleTestCases);
    const hiddenSuite = runCodingTestSuite(code, codingChallenge.functionName, codingChallenge.hiddenTestCases);
    setRunnerError(visibleSuite.ok && hiddenSuite.ok ? '' : visibleSuite.error || hiddenSuite.error || 'Unable to evaluate code.');
    setVisibleResults(visibleSuite.results);
    setHiddenResults(hiddenSuite.results);
    submitQuiz();
  }

  if (isCodingChallenge && challenge.codingChallenge) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link href={`/challenges/${challenge.slug}`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"><ArrowLeft className="h-4 w-4" />Back to Challenge</Link>
              <div className="flex flex-wrap items-center gap-3">
                <div className={`rounded-full px-4 py-2 text-sm font-black ${timeUp ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'}`}>Timer: {formatTime(secondsLeft)}</div>
                <div className="rounded-full bg-slate-900 px-4 py-2 text-sm font-black text-white dark:bg-white dark:text-slate-950">{challenge.codingChallenge.language.toUpperCase()}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.45fr_0.8fr]">
            <aside className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
              <div><div className="mb-3 flex items-center gap-3"><Trophy className="h-5 w-5 text-primary-600 dark:text-primary-400" /><h2 className="text-2xl font-black text-slate-900 dark:text-white">{challenge.title}</h2></div><p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{challenge.codingChallenge.problemStatement || challenge.objective}</p></div>
              <div className="rounded-[1.5rem] bg-slate-50 p-5 dark:bg-slate-800/70"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Function Name</div><div className="mt-2 font-mono text-lg font-black text-slate-900 dark:text-white">{challenge.codingChallenge.functionName}(input)</div></div>
              <div className="rounded-[1.5rem] bg-slate-50 p-5 dark:bg-slate-800/70"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Visible Test Cases</div><div className="mt-4 space-y-4">{challenge.codingChallenge.visibleTestCases.slice(0,5).map((testCase, index) => <div key={`${testCase.input}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Case {index + 1}</div><div className="mt-2 text-sm text-slate-700 dark:text-slate-200"><div><span className="font-black">Input:</span> <code>{testCase.input}</code></div><div className="mt-1"><span className="font-black">Expected:</span> <code>{testCase.expectedOutput}</code></div>{testCase.explanation ? <div className="mt-2 text-slate-500 dark:text-slate-400">{testCase.explanation}</div> : null}</div></div>)}</div></div>
              <div className="rounded-[1.5rem] bg-slate-50 p-5 text-sm text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">Hidden test cases: <span className="font-black text-slate-900 dark:text-white">{challenge.codingChallenge.hiddenTestCases.length}</span>. They run on final submission only.</div>
            </aside>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
              <div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="text-xl font-black text-slate-900 dark:text-white">Code Editor</h3><p className="text-sm text-slate-500 dark:text-slate-400">Write your solution in the center editor. Use the starter code from admin.</p></div><div className="flex gap-3"><Button onClick={runVisibleTests} variant="outline" className="!rounded-full"><Play className="h-4 w-4" />Run Visible Tests</Button><Button onClick={submitCodingChallenge} disabled={submissionLocked} className="!rounded-full">{submissionLocked ? 'Submitted' : 'Submit Solution'}</Button></div></div>
              <textarea value={code} onChange={(event) => !submissionLocked && setCode(event.target.value)} spellCheck={false} disabled={submissionLocked} className="min-h-[640px] w-full rounded-[1.5rem] border border-slate-200 bg-slate-950 p-5 font-mono text-sm leading-7 text-emerald-200 outline-none focus:border-primary-500 dark:border-slate-700" />
            </section>

            <aside className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
              <div className="rounded-[1.5rem] bg-slate-50 p-5 dark:bg-slate-800/70"><div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"><Terminal className="h-4 w-4" />Run Results</div>{runnerError ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{runnerError}</div> : null}<div className="mt-4 space-y-3">{visibleResults.length ? visibleResults.map((result, index) => <div key={`${result.input}-${index}`} className={`rounded-2xl border px-4 py-3 text-sm ${result.passed ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200' : 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200'}`}><div className="font-black">Case {index + 1}: {result.passed ? 'Passed' : 'Failed'}</div><div className="mt-1">Expected: <code>{result.expectedOutput}</code></div><div>Actual: <code>{result.actual}</code></div></div>) : <div className="text-sm text-slate-500 dark:text-slate-400">Run visible tests to see results here.</div>}</div></div>
              {(hasSubmitted || timeUp) ? <div className="rounded-[1.5rem] border border-primary-200 bg-primary-50 px-5 py-4 text-primary-900 dark:border-primary-500/20 dark:bg-primary-500/10 dark:text-primary-100"><div className="text-xs font-black uppercase tracking-[0.18em] text-primary-700 dark:text-primary-300">Hidden Test Score</div><div className="mt-2 text-3xl font-black">{codingPassedCount} / {codingTotalCount}</div><div className="mt-2 text-sm font-medium text-primary-800 dark:text-primary-200">Your final score is based on hidden test cases controlled by admin.</div></div> : null}
            </aside>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href={`/challenges/${challenge.slug}`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"><ArrowLeft className="h-4 w-4" /> Back to Challenge</Link>
            <div className="flex flex-wrap items-center gap-3"><div className={`rounded-full px-4 py-2 text-sm font-black ${timeUp ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'}`}>Timer: {formatTime(secondsLeft)}</div></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center gap-3"><Trophy className="h-5 w-5 text-primary-600 dark:text-primary-400" /><h2 className="text-2xl font-black text-slate-900 dark:text-white">{challenge.phase === 'ongoing' ? 'Competition Quiz' : 'Practice Quiz'}</h2></div>
          <p className="mb-6 text-slate-600 dark:text-slate-300">{challenge.phase === 'ongoing' ? 'Complete the quiz before the timer runs out. Your score and correct answers appear immediately after submission.' : 'Practice with the timed quiz and review the answers once you finish or the timer expires.'}</p>
          <div className="mb-6 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Questions</div><div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{challenge.questions.length}</div></div><div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Timer</div><div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{formatTime(secondsLeft)}</div></div><div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Submissions</div><div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">1</div></div></div>
          <div className="space-y-5">{challenge.questions.map((question, index) => { const fieldKey = `question-${index}`; const selectedAnswer = answers[fieldKey] || ''; const isCorrect = selectedAnswer === question.correctAnswer; return <div key={fieldKey} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/60"><div className="mb-3 flex items-start justify-between gap-4"><div className="text-base font-black text-slate-900 dark:text-white">{index + 1}. {question.prompt}</div><div className="rounded-full bg-primary-50 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">{question.points} pts</div></div><div className="space-y-3">{question.options.map((option) => { const checked = selectedAnswer === option; const showCorrect = hasSubmitted && option === question.correctAnswer; const showWrong = hasSubmitted && checked && option !== question.correctAnswer; const className = ['flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition', showCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200' : '', showWrong ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-200' : '', !showCorrect && !showWrong ? 'border-slate-200 bg-white text-slate-700 hover:border-primary-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200' : '',].filter(Boolean).join(' '); return <label key={option} className={className}><input type="radio" name={fieldKey} value={option} checked={checked} onChange={(event) => updateAnswer(fieldKey, event.target.value)} disabled={hasSubmitted || submissionLocked} className="mt-1 h-4 w-4 border-slate-300 text-primary-600 focus:ring-primary-500" /><span className="text-sm font-medium">{option}</span></label>; })}</div>{hasSubmitted ? <div className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${isCorrect ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200'}`}><div>Correct answer: <span className="font-black">{question.correctAnswer}</span></div>{question.explanation ? <div className="mt-1">{question.explanation}</div> : null}</div> : null}</div>; })}</div>
          <div className="mt-6 flex flex-wrap gap-4"><Button type="button" variant="primary" size="lg" className="h-14 !rounded-full px-8" onClick={submitQuiz} disabled={submissionLocked}>{submissionLocked ? 'Already Submitted' : challenge.phase === 'ongoing' ? 'Submit Competition Quiz' : 'Submit Practice Quiz'}</Button></div>
          {(hasSubmitted || timeUp) ? <div className="mt-6 rounded-[1.5rem] border border-primary-200 bg-primary-50 px-5 py-4 text-primary-900 dark:border-primary-500/20 dark:bg-primary-500/10 dark:text-primary-100"><div className="text-xs font-black uppercase tracking-[0.18em] text-primary-700 dark:text-primary-300">Quiz Score</div><div className="mt-2 text-3xl font-black">{earnedScore} / {totalScore}</div><div className="mt-2 text-sm font-medium text-primary-800 dark:text-primary-200">{timeUp && !hasSubmitted ? 'Time is up. Your score is based on the answers selected when the timer ended.' : earnedScore === totalScore ? 'Perfect score. Every answer is correct.' : 'Review the correct answers below. This challenge allows only one submission.'}</div></div> : null}
        </div>
      </section>
    </main>
  );
}

