import type { Metadata } from 'next';
import OurTeamClient from './our-team-client';

export const metadata: Metadata = {
  title: 'Our Team | EDVO',
  description: 'Meet the EDVO team guiding learners with practical, industry-focused experience.',
};

export default function OurTeamPage() {
  return <OurTeamClient />;
}
