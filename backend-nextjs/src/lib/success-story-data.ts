export interface PublicSuccessStory {
  id: string;
  name: string;
  location: string;
  beforeRole: string;
  afterRole: string;
  companyLogo: string;
  avatar: string;
  linkedinUrl: string;
  category: string;
  tags: string[];
  status: 'active' | 'inactive';
  order: number;
}

export const MOCK_SUCCESS_STORIES: PublicSuccessStory[] = [
  {
    id: 'swapnaja-gurav',
    name: 'Swapnaja Gurav',
    location: 'Thane, Maharashtra',
    beforeRole: 'Associate Customer Services',
    afterRole: 'Lead Process Associate',
    companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    linkedinUrl: 'https://linkedin.com',
    category: 'Career Growth',
    tags: ['Career Growth', 'From Non-IT'],
    status: 'active',
    order: 1,
  },
  {
    id: 'adithya-narayanan',
    name: 'Adithya Narayanan',
    location: 'Chennai, Tamil Nadu',
    beforeRole: 'Fresher',
    afterRole: 'Data Analyst',
    companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    linkedinUrl: 'https://linkedin.com',
    category: 'First Tech Job',
    tags: ['First Tech Job', 'Data Science'],
    status: 'active',
    order: 2,
  },
  {
    id: 'rahul-keshri',
    name: 'Rahul Keshri',
    location: 'Bengaluru, Karnataka',
    beforeRole: 'Civil Engineer',
    afterRole: 'BI Developer',
    companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    linkedinUrl: 'https://linkedin.com',
    category: 'Major Shift',
    tags: ['Major Shift', 'Engineering'],
    status: 'active',
    order: 3,
  },
  {
    id: 'priyanka-patil',
    name: 'Priyanka Patil',
    location: 'Pune, Maharashtra',
    beforeRole: 'Manual Tester',
    afterRole: 'Full Stack Developer',
    companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    linkedinUrl: 'https://linkedin.com',
    category: 'Career Growth',
    tags: ['Technical Upskill', 'Development'],
    status: 'active',
    order: 4,
  },
  {
    id: 'vikram-joshi',
    name: 'Vikram Joshi',
    location: 'Noida, Uttar Pradesh',
    beforeRole: 'BPO Employee',
    afterRole: 'Machine Learning Engineer',
    companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Uber_logo_2018.svg',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
    linkedinUrl: 'https://linkedin.com',
    category: 'Career Growth',
    tags: ['Dream Choice', 'AI & ML'],
    status: 'active',
    order: 5,
  },
  {
    id: 'ananya-iyer',
    name: 'Ananya Iyer',
    location: 'Mumbai, Maharashtra',
    beforeRole: 'Administrative Assistant',
    afterRole: 'Business Consultant',
    companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    linkedinUrl: 'https://linkedin.com',
    category: 'Career Growth',
    tags: ['Career Transition', 'Analytics'],
    status: 'active',
    order: 6,
  },
];

export function mapSuccessStoryToPublicStory(item: any): PublicSuccessStory {
  return {
    id: String(item._id || item.id || item.slug),
    name: String(item.name || 'EDVO Learner'),
    location: String(item.location || ''),
    beforeRole: String(item.beforeRole || ''),
    afterRole: String(item.afterRole || ''),
    companyLogo: String(item.companyLogo || '/images/edvo-official-logo-v10.png'),
    avatar: String(item.avatar || '/images/edvo-official-logo-v10.png'),
    linkedinUrl: String(item.linkedinUrl || '#'),
    category: String(item.category || 'Career Growth'),
    tags: Array.isArray(item.tags) ? item.tags.map((tag: unknown) => String(tag)) : [],
    status: item.status === 'inactive' ? 'inactive' : 'active',
    order: Number(item.order || 0),
  };
}
