import { getPageSection } from '@/lib/page';
import { cn } from '@/lib/utils';
import Section from '@/app/intro/partials/section';
import { usePage } from '@inertiajs/react';
import { InnerPageProps } from '..';

const getMemberDescription = (member: Record<string, any>) => {
   return member.description || member.bio || member.content || member.title || member.role || 'Experienced mentor focused on helping learners build confidence, clarity, and career-ready outcomes through practical guidance.';
};

const Team = () => {
   const { props } = usePage<InnerPageProps>();
   const teamSection = getPageSection(props.innerPage, 'team');
   const members = teamSection?.properties.array || [];

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

         <div className="space-y-8 md:space-y-10">
            {members.map((member: Record<string, any>, index: number) => {
               const reverseLayout = index % 2 === 1;

               return (
                  <div
                     key={`item-${index}`}
                     className={cn(
                        'grid items-center gap-6 overflow-hidden rounded-[28px] border border-border/60 bg-white/80 p-5 shadow-sm dark:bg-slate-900/70 md:grid-cols-2 md:p-8',
                        reverseLayout && 'md:[&>*:first-child]:order-2 md:[&>*:last-child]:order-1'
                     )}
                  >
                     <div className="space-y-4">
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Team</p>
                        <div className="space-y-2">
                           <h2 className="text-2xl font-bold md:text-3xl">{member.name || member.title}</h2>
                           {(member.role || member.title) && (
                              <p className="text-muted-foreground text-sm font-medium md:text-base">{member.role || member.title}</p>
                           )}
                        </div>
                        <p className="text-muted-foreground text-sm leading-7 md:text-base">
                           {getMemberDescription(member)}
                        </p>
                     </div>

                     <div className="relative h-[280px] overflow-hidden rounded-[24px] bg-slate-100 dark:bg-slate-800 md:h-[340px]">
                        <img src={member.image} alt={member.name || member.title} className="h-full w-full object-cover object-center" />
                     </div>
                  </div>
               );
            })}
         </div>
      </Section>
   );
};

export default Team;
