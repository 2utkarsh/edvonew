import Link from 'next/link';
import { BriefcaseBusiness, Building2, Compass, TrendingUp } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';

const jobLanes = [
  {
    title: 'Analytics Roles',
    description: 'Business analyst, data analyst, BI developer, and reporting-focused openings.',
  },
  {
    title: 'AI and Data Science',
    description: 'ML, data science, GenAI workflow, and AI product roles for strong builders.',
  },
  {
    title: 'Engineering Tracks',
    description: 'Frontend, backend, full stack, and product engineering opportunities.',
  },
];

export default function JobsLandingPage() {
  return (
    <main className="bg-white dark:bg-slate-950">
      <section className="border-b border-stone-200 dark:border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_35%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.10),_transparent_35%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Badge variant="gradient" className="mb-5 font-bold">Jobs</Badge>
          <h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950 dark:text-white">
            Public jobs page for the static EDVO deployment.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-400">
            The original live job search depends on server APIs. This export-friendly version gives you a
            clean jobs landing page you can host without Node, while keeping the career journey intact.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/careers">
              <Button variant="primary" size="lg" className="!rounded-2xl">Explore Career Paths</Button>
            </Link>
            <Link href="/hire-talent">
              <Button variant="outline" size="lg" className="!rounded-2xl">For Hiring Teams</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="p-8">
            <BriefcaseBusiness className="h-10 w-10 text-orange-500" />
            <h2 className="mt-5 text-2xl font-black">Role discovery</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">Use this page as the upload-only gateway into your hiring and career content.</p>
          </Card>
          <Card className="p-8">
            <Building2 className="h-10 w-10 text-primary-600" />
            <h2 className="mt-5 text-2xl font-black">Company visibility</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">Highlight placement stories, hiring partners, and career-readiness assets.</p>
          </Card>
          <Card className="p-8">
            <TrendingUp className="h-10 w-10 text-emerald-500" />
            <h2 className="mt-5 text-2xl font-black">Static-hosting ready</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">No API dependency, no server runtime, just upload and serve.</p>
          </Card>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {jobLanes.map((lane) => (
            <Card key={lane.title} className="p-8">
              <Compass className="h-8 w-8 text-slate-700 dark:text-slate-200" />
              <h3 className="mt-4 text-2xl font-black">{lane.title}</h3>
              <p className="mt-3 text-slate-600 dark:text-slate-400">{lane.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
