export interface PublicTeamMember {
  id: string;
  name: string;
  title: string;
  bio: string;
  image: string;
  status: 'active' | 'inactive';
}

export const MOCK_TEAM_MEMBERS: PublicTeamMember[] = [
  {
    id: 'alok-pandey',
    name: 'Alok Pandey',
    title: 'Chief Mentor, EDVO | Mentor of Change, NITI Aayog | Startup & MSME Growth Catalyst',
    bio: 'Alok Pandey is an experienced entrepreneurship mentor and ecosystem builder with 17+ years of expertise in innovation, startup development, and MSME growth. As a Mentor of Change with NITI Aayog, he has guided thousands of individuals, institutions, and emerging entrepreneurs. His work spans advanced domains such as quantum computing, chip design, and large-scale capacity-building programs. With strong expertise in CSR, research, and social impact, he brings strategic depth and real-world execution to EDVO\'s learning ecosystem.',
    image: '/images/profiles/alok-pandey.png',
    status: 'active',
  },
  {
    id: 'akanksha-singh',
    name: 'Akanksha Singh',
    title: 'Mentor, EDVO | Marketing & Growth Architect | AI Marketing Strategist',
    bio: 'Akanksha Singh is a Marketing & Growth Architect with 10+ years of experience in performance marketing, brand strategy, and digital business growth. She has guided 120+ startups across 20+ different domains, helping founders and learners build strong digital presence, execute growth strategies, and achieve market visibility. With expertise in AI marketing, Google Ads, and analytics, she focuses on bridging the gap between learning and real-world execution. At EDVO, she builds industry-ready skills aligned with modern digital trends.',
    image: '/images/profiles/akanksha-singh.jpeg',
    status: 'active',
  },
  {
    id: 'krishna-bhushan-mishra',
    name: 'Krishna Bhushan Mishra',
    title: 'Mentor, EDVO | Marketing Engineer | Performance & Growth Strategist',
    bio: 'Krishna Bhushan Mishra is a Marketing Engineer and Performance & Growth Strategist with 8+ years of experience in performance marketing, data-driven strategy, and growth systems. He has guided 80+ startups across multiple domains and mentored 1,800+ learners, helping them develop practical, execution-focused skills and structured digital strategies. With a strong foundation in engineering and business, he specializes in building scalable marketing systems and simplifying complex concepts into actionable frameworks. At EDVO, he focuses on making learners job-ready with real-world digital expertise.',
    image: '/images/profiles/krishna-bhushan-mishra.jpeg',
    status: 'active',
  },
];

export function mapTeamMemberToPublicTeamMember(item: any): PublicTeamMember {
  return {
    id: String(item._id || item.id || item.slug),
    name: String(item.name || 'EDVO Mentor'),
    title: String(item.title || 'Mentor, EDVO'),
    bio: String(item.bio || 'Experienced mentor guiding learners with practical, industry-focused knowledge.'),
    image: String(item.image || '/images/edvo-official-logo-v10.png'),
    status: item.status === 'inactive' ? 'inactive' : 'active',
  };
}
