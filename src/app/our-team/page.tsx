import type { Metadata } from 'next';
import InstructorsSection from '@/components/home/instructors-section';

export const metadata: Metadata = {
  title: 'Our Team | EDVO',
  description: 'Meet the EDVO team guiding learners with practical, industry-focused experience.',
};

export default function OurTeamPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <InstructorsSection />
    </main>
  );
}
