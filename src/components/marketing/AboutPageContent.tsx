import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import Button from "@/components/ui/Button";
import {
  BUSINESS_LINE,
  LEGAL_ENTITY_NAME,
  REGISTERED_ADDRESS,
} from "@/lib/company";

const offerings = [
  {
    icon: BookOpen,
    title: "Practical learning programs",
    description:
      "EDVO offers live bootcamps, self-paced courses, workshops, and digital learning resources designed to help learners build usable skills.",
  },
  {
    icon: Briefcase,
    title: "Career-focused support",
    description:
      "Along with learning content, the platform supports projects, interview preparation, and career growth for students and working professionals.",
  },
  {
    icon: Users,
    title: "Learners and hiring communities",
    description:
      "EDVO serves students, career switchers, and organizations looking for skilled talent, practical training, and structured upskilling programs.",
  },
];

const complianceDetails = [
  {
    label: "Legal Name",
    value: LEGAL_ENTITY_NAME,
  },
  {
    label: "Registered Address",
    value: REGISTERED_ADDRESS,
  },
  {
    label: "Line of Business",
    value: BUSINESS_LINE,
  },
];

export default function AboutPageContent() {
  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-br from-primary-50 via-white to-accent-50/40 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-primary-950">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-20">
          <div>
            <div className="inline-flex rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-sm">
              About EDVO
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
              EDVO helps learners build practical skills for modern careers.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              EDVO is an online education and professional upskilling platform
              operated by {LEGAL_ENTITY_NAME}. We provide digital learning
              services through live bootcamps, self-paced courses,
              workshops, digital resources, and career support programs that
              help learners move from theory to practical work.
            </p>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700 dark:text-slate-300">
              Our focus is simple: make learning structured, understandable, and
              useful in real career situations. We aim to support students,
              freshers, and working professionals with guided learning paths,
              projects, and a more job-relevant learning experience.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/courses">
                <Button variant="primary" size="lg" className="!rounded-2xl">
                  Explore Courses
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="secondary" size="lg" className="!rounded-2xl">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary-500/10 p-3 dark:bg-primary-500/15">
                <ShieldCheck className="h-6 w-6 text-primary-700 dark:text-accent-300" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  Registered Details
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                  Legal and address information
                </h2>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {complianceDetails.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200 px-4 py-4 dark:border-white/10 dark:bg-white/5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-2 text-base leading-7 text-slate-900 dark:text-slate-100">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold text-slate-950 dark:text-white">
              What EDVO does
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
              EDVO is built around practical digital learning. The platform is
              meant for people who want clear structure, real project exposure,
              and support that helps them move toward academic and professional
              growth with more confidence.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {offerings.map((item) => (
              <article
                key={item.title}
                className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/10 dark:bg-primary-500/15">
                  <item.icon className="h-6 w-6 text-primary-700 dark:text-accent-300" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-950 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-950 dark:text-white">
              Registered office details
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
              These details can be used for official reference, merchant
              communication, and compliance-related verification.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-primary-500/10 p-3 dark:bg-primary-500/15">
                  <Building2 className="h-5 w-5 text-primary-700 dark:text-accent-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Legal Name
                  </p>
                  <p className="mt-2 text-base leading-7 text-slate-900 dark:text-slate-100">
                    {LEGAL_ENTITY_NAME}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-primary-500/10 p-3 dark:bg-primary-500/15">
                  <MapPin className="h-5 w-5 text-primary-700 dark:text-accent-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Address
                  </p>
                  <p className="mt-2 text-base leading-7 text-slate-900 dark:text-slate-100">
                    {REGISTERED_ADDRESS}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
