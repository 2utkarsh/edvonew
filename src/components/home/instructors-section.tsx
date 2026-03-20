'use client';

import Badge from '@/components/ui/Badge';

const instructors = [
  {
    name: 'Alok Pandey',
    title: 'Chief Mentor, EDVO | Mentor of Change, NITI Aayog | Startup & MSME Growth Catalyst',
    bio: 'Alok Pandey is an experienced entrepreneurship mentor and ecosystem builder with 17+ years of expertise in innovation, startup development, and MSME growth. As a Mentor of Change with NITI Aayog, he has guided thousands of individuals, institutions, and emerging entrepreneurs. His work spans advanced domains such as quantum computing, chip design, and large-scale capacity-building programs. With strong expertise in CSR, research, and social impact, he brings strategic depth and real-world execution to EDVO\'s learning ecosystem.',
    image: '/images/profiles/alok-pandey.png',
  },
  {
    name: 'Akanksha Singh',
    title: 'Mentor, EDVO | Marketing & Growth Architect | AI Marketing Strategist',
    bio: 'Akanksha Singh is a Marketing & Growth Architect with 10+ years of experience in performance marketing, brand strategy, and digital business growth. She has guided 120+ startups across 20+ different domains, helping founders and learners build strong digital presence, execute growth strategies, and achieve market visibility. With expertise in AI marketing, Google Ads, and analytics, she focuses on bridging the gap between learning and real-world execution. At EDVO, she builds industry-ready skills aligned with modern digital trends.',
    image: '/images/profiles/priya-bhatia.svg',
  },
  {
    name: 'Krishna Bhushan Mishra',
    title: 'Mentor, EDVO | Marketing Engineer | Performance & Growth Strategist',
    bio: 'Krishna Bhushan Mishra is a Marketing Engineer and Performance & Growth Strategist with 8+ years of experience in performance marketing, data-driven strategy, and growth systems. He has guided 80+ startups across multiple domains and mentored 1,800+ learners, helping them develop practical, execution-focused skills and structured digital strategies. With a strong foundation in engineering and business, he specializes in building scalable marketing systems and simplifying complex concepts into actionable frameworks. At EDVO, he focuses on making learners job-ready with real-world digital expertise.',
    image: '/images/profiles/krishna.jpg',
  },
];

const InstructorsSection = () => {
  return (
    <section className="bg-gradient-to-b from-slate-50 to-white px-4 py-16 dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 text-center">
          <Badge variant="secondary" className="mb-4 inline-flex px-6 py-2 text-sm font-semibold uppercase tracking-[0.22em] md:text-base">Our Team</Badge>
        </div>
        <h2 className="mb-4 text-center text-3xl font-bold text-slate-950 dark:text-white md:text-4xl">
          Learn from AI & Data Experts <span className="text-primary-600 dark:text-primary-300">with Real Industry Experience</span>
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-slate-600 dark:text-slate-300">
          Industry experience meets the art of teaching, making complex concepts feel simple.
        </p>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {instructors.map((instructor) => (
            <article
              key={instructor.name}
              className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20"
            >
              <img
                src={instructor.image}
                alt={instructor.name}
                className="mb-5 h-40 w-40 rounded-2xl object-cover object-center shadow-lg shadow-primary-500/20"
              />
              <h3 className="mb-2 text-2xl font-bold text-slate-950 dark:text-white">{instructor.name}</h3>
              <p className="mb-4 text-sm font-medium leading-6 text-primary-600 dark:text-primary-300">{instructor.title}</p>
              <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{instructor.bio}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstructorsSection;





