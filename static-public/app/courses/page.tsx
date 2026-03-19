import Link from 'next/link';
import { ArrowRight, Clock3, Layers3, Sparkles, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';

const featuredCourses = [
  {
    title: 'Data Analytics Career Track',
    description: 'Excel, SQL, Power BI, Python, storytelling, and portfolio-ready case studies.',
    meta: 'Beginner to job-ready',
  },
  {
    title: 'AI Engineering Bootcamp',
    description: 'Agents, orchestration, deployment, evaluation, and production-style AI workflows.',
    meta: 'Flagship cohort',
  },
  {
    title: 'Full Stack Development',
    description: 'Frontend, backend, auth, deployment, and polished portfolio project delivery.',
    meta: 'Career transition',
  },
];

export default function CoursesLandingPage() {
  return (
    <main className="bg-stone-50 dark:bg-slate-950">
      <section className="border-b border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Badge variant="gradient" className="mb-5 font-bold">Course Catalog</Badge>
          <h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950 dark:text-white">
            Public course landing page for static hosting.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-400">
            This version is built for upload-only hosting. It highlights the main EDVO learning tracks
            and sends users toward your key public journeys without requiring a Node server.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/courses/ds-gen-ai">
              <Button variant="primary" size="lg" className="!rounded-2xl !bg-orange-500 hover:!bg-orange-600">
                View Flagship Program
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/bootcamps">
              <Button variant="outline" size="lg" className="!rounded-2xl">
                Explore Bootcamps
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="p-8">
            <Clock3 className="h-10 w-10 text-orange-500" />
            <h2 className="mt-5 text-2xl font-black">Self-paced + cohort mix</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">Use one public entry point for both evergreen courses and flagship programs.</p>
          </Card>
          <Card className="p-8">
            <Users className="h-10 w-10 text-primary-600" />
            <h2 className="mt-5 text-2xl font-black">Career-oriented learning</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">Position the catalog around job outcomes, portfolio proof, and mentor support.</p>
          </Card>
          <Card className="p-8">
            <Layers3 className="h-10 w-10 text-emerald-500" />
            <h2 className="mt-5 text-2xl font-black">Hosting-safe public site</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">This page works as static HTML so it can be uploaded directly to normal hosting.</p>
          </Card>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {featuredCourses.map((course) => (
            <Card key={course.title} className="p-8">
              <Badge variant="info">{course.meta}</Badge>
              <h3 className="mt-4 text-2xl font-black">{course.title}</h3>
              <p className="mt-3 text-slate-600 dark:text-slate-400">{course.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
