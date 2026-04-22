import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Clock3,
  Mail,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import Button from "@/components/ui/Button";
import {
  BUSINESS_EMAIL,
  BUSINESS_LINE,
  COMPANY_NAME,
  LEGAL_ENTITY_NAME,
  REGISTERED_ADDRESS,
  SUPPORT_AVAILABILITY,
  SUPPORT_EMAIL,
  SUPPORT_RESPONSE_WINDOW,
} from "@/lib/company";

const contactChannels = [
  {
    title: "Support and learner help",
    description:
      "Use this for account access, payments, certificates, enrollments, and course-related support.",
    value: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}`,
    icon: Mail,
  },
  {
    title: "Business and partnerships",
    description:
      "Use this for hiring, training, events, ecosystem partnerships, and business coordination.",
    value: BUSINESS_EMAIL,
    href: `mailto:${BUSINESS_EMAIL}`,
    icon: Building2,
  },
];

const merchantDetails = [
  {
    label: "Merchant Legal Name",
    value: LEGAL_ENTITY_NAME,
    icon: ShieldCheck,
  },
  {
    label: "Registered Address",
    value: REGISTERED_ADDRESS,
    icon: MapPin,
  },
  {
    label: "Line of Business",
    value: BUSINESS_LINE,
    icon: Building2,
  },
];

const responseNotes = [
  "Use your registered email address for faster verification.",
  "Include your course, cohort, or transaction reference if relevant.",
  "Attach screenshots for payment, access, or merchant verification issues.",
];

export default function ContactPageContent() {
  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-br from-primary-50 via-white to-accent-50/40 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-primary-950">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
          <div>
            <div className="inline-flex rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-sm">
              Contact EDVO
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
              Reach the right team quickly, and use the exact merchant details when needed.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              {COMPANY_NAME} handles learner support, partnership queries, and
              merchant-related communication from one place. If you are writing
              for payment gateway review, billing clarification, or compliance
              verification, the legal name, registered address, and business
              line below should be used exactly as shown.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="primary" size="lg" className="!rounded-2xl">
                <a href={`mailto:${SUPPORT_EMAIL}`}>
                  Email Support
                  <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
              <Button asChild variant="secondary" size="lg" className="!rounded-2xl">
                <Link href="/help">View Help Center</Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {contactChannels.map((channel) => (
                <a
                  key={channel.title}
                  href={channel.href}
                  className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/10 dark:bg-primary-500/15">
                    <channel.icon className="h-6 w-6 text-primary-700 dark:text-accent-300" />
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">
                    {channel.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {channel.description}
                  </p>
                  <p className="mt-4 break-all text-sm font-semibold text-primary-700 dark:text-accent-300">
                    {channel.value}
                  </p>
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-primary-100 bg-slate-950 p-6 text-white shadow-[0_25px_90px_rgba(37,99,235,0.20)] dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-accent-200">
                Official Reference
              </span>
              <ShieldCheck className="h-7 w-7 text-accent-300" />
            </div>
            <h2 className="mt-8 text-2xl font-bold leading-tight">
              Merchant and support information in one readable place.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              This section is intended for support requests, partnership
              outreach, and merchant verification references.
            </p>

            <div className="mt-8 grid gap-3">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-sm text-slate-300">Support Email</span>
                <span className="text-base font-bold text-white">{SUPPORT_EMAIL}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-sm text-slate-300">Business Email</span>
                <span className="text-base font-bold text-white">{BUSINESS_EMAIL}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-sm text-slate-300">Availability</span>
                <span className="text-base font-bold text-white">{SUPPORT_AVAILABILITY}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-sm text-slate-300">Typical Reply</span>
                <span className="text-base font-bold text-white">{SUPPORT_RESPONSE_WINDOW}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">
              <Building2 className="h-4 w-4" />
              <span>Merchant Details</span>
            </div>
            <h2 className="mt-5 text-3xl font-bold text-slate-950 dark:text-white">
              Official merchant details for payment and compliance reference.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
              If a payment gateway, compliance team, or billing reviewer asks
              for the merchant name, address, or exact business activity, please
              use the details below exactly as displayed.
            </p>
          </div>

          <div className="space-y-4">
            {merchantDetails.map((detail) => (
              <div
                key={detail.label}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/10 dark:bg-primary-500/15">
                    <detail.icon className="h-6 w-6 text-primary-700 dark:text-accent-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      {detail.label}
                    </p>
                    {detail.label === "Registered Address" ? (
                      <address className="mt-3 not-italic text-base leading-8 text-slate-900 dark:text-slate-100">
                        {detail.value}
                      </address>
                    ) : (
                      <p className="mt-3 text-base leading-8 text-slate-900 dark:text-slate-100">
                        {detail.value}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-950 dark:text-white">
              How to help us reply faster
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
              The more specific the request, the faster it can be routed to the
              right team.
            </p>

            <div className="mt-8 space-y-4">
              {responseNotes.map((note) => (
                <div
                  key={note}
                  className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-primary-500/10 p-3 dark:bg-primary-500/15">
                      <Clock3 className="h-5 w-5 text-primary-700 dark:text-accent-300" />
                    </div>
                    <p className="text-base leading-7 text-slate-700 dark:text-slate-200">
                      {note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-gradient-to-r from-primary-600 via-primary-700 to-accent-500 p-8 text-white shadow-[0_25px_80px_rgba(37,99,235,0.28)]">
            <h2 className="text-3xl font-black leading-tight">
              Need support, merchant verification, or a business conversation?
            </h2>
            <p className="mt-4 text-base leading-8 text-primary-50/90">
              Start with the official email that matches your request, and use
              the merchant details shown on this page when legal or billing
              verification is required.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="secondary" size="lg" className="!rounded-2xl !bg-white !text-slate-950 hover:!bg-slate-100">
                <a href={`mailto:${SUPPORT_EMAIL}`}>Contact Support</a>
              </Button>
              <Button asChild variant="outline" size="lg" className="!rounded-2xl !border-white !text-white hover:!bg-white/10">
                <a href={`mailto:${BUSINESS_EMAIL}`}>Business Queries</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
