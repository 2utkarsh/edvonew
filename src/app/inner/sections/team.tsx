import { getPageSection } from '@/lib/page';
import { cn } from '@/lib/utils';
import Section from '@/app/intro/partials/section';
import { usePage } from '@inertiajs/react';
import { InnerPageProps } from '..';

const PDF_TEAM_MEMBERS = [
   {
      name: 'Alok Pandey',
      role: 'Mentor, EDVO | Mentor of Change, NITI Aayog | Startup & MSME Growth Catalyst',
      description:
         'Alok Pandey is an experienced entrepreneurship mentor and ecosystem builder with 17+ years of expertise in innovation, startup development, and MSME growth. As a Mentor of Change with NITI Aayog, he has guided thousands of individuals, institutions, and emerging entrepreneurs. His work spans advanced domains such as quantum computing, chip design, and large-scale capacity-building programs. With strong expertise in CSR, research, and social impact, he brings strategic depth and real-world execution to EDVO\'s learning ecosystem.',
   },
   {
      name: 'Akanksha Singh',
      role: 'Mentor, EDVO | Marketing & Growth Architect | AI Marketing Strategist',
      description:
         'Akanksha Singh is a Marketing & Growth Architect with 10+ years of experience in performance marketing, brand strategy, and digital business growth. She has guided 120+ startups across 20+ different domains, helping founders and learners build strong digital presence, execute growth strategies, and achieve market visibility. With expertise in AI marketing, Google Ads, and analytics, she focuses on bridging the gap between learning and real-world execution. At EDVO, she builds industry-ready skills aligned with modern digital trends.',
   },
   {
      name: 'Arishna Bhushan Mishra',
      role: 'Mentor, EDVO | Marketing Engineer | Performance & Growth Strategist',
      description:
         'Arishna Bhushan Mishra is a Marketing Engineer and Performance & Growth Strategist with 8+ years of experience in performance marketing, data-driven strategy, and growth systems. He has guided 80+ startups across multiple domains and mentored 1,800+ learners, helping them develop practical, execution-focused skills and structured digital strategies. With a strong foundation in engineering and business, he specializes in building scalable marketing systems and simplifying complex concepts into actionable frameworks. At EDVO, he focuses on making learners job-ready with real-world digital expertise.',
   },
];

const getMemberDescription = (member: Record<string, any>) => {
   return member.description || member.bio || member.content || member.title || member.role || 'Experienced mentor focused on helping learners build confidence, clarity, and career-ready outcomes through practical guidance.';
};

const getMemberRole = (member: Record<string, any>) => {
   return member.role || member.title || 'Team Member';
};

const getInitials = (name: string) => {
   return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('');
};

const Team = () => {
   const { props } = usePage<InnerPageProps>();
   const teamSection = getPageSection(props.innerPage, 'team');
   const sectionMembers = teamSection?.properties.array || [];
   const extraMembers = props.innerPage.slug === 'our-team' ? PDF_TEAM_MEMBERS : [];
   const members = [...sectionMembers, ...extraMembers].filter(
      (member, index, array) =>
         array.findIndex((candidate) => (candidate.name || candidate.title) === (member.name || member.title)) === index
   );

   return (
      <Section
         customize={props.customize}
         pageSection={teamSection}
         containerClass={cn('py-20 md:py-[120px]')}
         contentClass={cn('space-y-10')}
      >
         <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-2xl font-bold md:text-[30px]">{teamSection?.title}</h1>
            <p className="text-muted-foreground mt-4 text-base leading-7 md:text-lg">{teamSection?.description}</p>
         </div>

         <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {members.map((member: Record<string, any>, index: number) => {
               const memberName = member.name || member.title || `Team Member ${index + 1}`;
               const memberRole = getMemberRole(member);
               const memberDescription = getMemberDescription(member);

               return (
                  <div
                     key={`item-${index}`}
                     className="flex h-full flex-col overflow-hidden rounded-[28px] border border-border/60 bg-white/80 p-5 shadow-sm transition-transform duration-300 hover:-translate-y-1 dark:bg-slate-900/70 md:p-6"
                  >
                     <div className="mb-5">
                        {member.image ? (
                           <div className="relative h-[240px] overflow-hidden rounded-[24px] bg-slate-100 dark:bg-slate-800">
                              <img src={member.image} alt={memberName} className="h-full w-full object-cover object-center" />
                           </div>
                        ) : (
                           <div className="relative flex h-[240px] items-center justify-center overflow-hidden rounded-[24px] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_35%),linear-gradient(135deg,_#18213b_0%,_#273c75_50%,_#6d28d9_100%)]">
                              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/30 bg-white/90 text-2xl font-bold text-slate-900 shadow-lg">
                                 {getInitials(memberName)}
                              </div>
                           </div>
                        )}
                     </div>

                     <div className="flex flex-1 flex-col space-y-4">
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Team</p>
                        <div className="space-y-2">
                           <h2 className="text-2xl font-bold">{memberName}</h2>
                           <p className="text-muted-foreground text-sm font-medium md:text-base">{memberRole}</p>
                        </div>
                        <p className="text-muted-foreground text-sm leading-7 md:text-base">{memberDescription}</p>
                     </div>
                  </div>
               );
            })}
         </div>
      </Section>
   );
};

export default Team;
