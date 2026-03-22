import { slugify } from '@/lib/query';

export interface ChallengeQuestionRecord {
  prompt: string;
  type: string;
  options: string[];
  required: boolean;
  placeholder: string;
}

export interface PublicChallengeRecord {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  category: string;
  phase: 'ongoing' | 'completed';
  visibility: 'active' | 'inactive';
  order: number;
  prize: string;
  participants: string;
  href: string;
  badge?: string;
  objective: string;
  duration: string;
  difficulty: string;
  tools: string[];
  deliverables: string[];
  steps: string[];
  actionUrl: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  registrationDeadline: string;
  expiryDate: string;
  competitionMode: string;
  maxSubmissions: number;
  teamSize: string;
  statusNote: string;
  eligibility: string[];
  rules: string[];
  questions: ChallengeQuestionRecord[];
}

function toQuestionRecord(question: any): ChallengeQuestionRecord | null {
  const prompt = String(question?.prompt || '').trim();
  if (!prompt) return null;
  return {
    prompt,
    type: String(question?.type || 'textarea').trim() || 'textarea',
    options: Array.isArray(question?.options) ? question.options.map((option: unknown) => String(option || '').trim()).filter(Boolean) : [],
    required: question?.required === false ? false : true,
    placeholder: String(question?.placeholder || '').trim(),
  };
}

export function buildDefaultChallengeQuestions(item: Partial<PublicChallengeRecord> & { title?: string; phase?: string; category?: string; objective?: string; deliverables?: string[]; tools?: string[] }): ChallengeQuestionRecord[] {
  const title = String(item.title || 'this challenge').trim();
  const phase = item.phase === 'completed' ? 'completed' : 'ongoing';
  const category = String(item.category || 'General').trim();
  const objective = String(item.objective || item.description || '').trim();
  const deliverable = Array.isArray(item.deliverables) && item.deliverables.length ? String(item.deliverables[0] || '').trim() : 'your final submission';
  const toolOptions = Array.isArray(item.tools) && item.tools.length ? item.tools.map((tool) => String(tool || '').trim()).filter(Boolean) : ['SQL', 'Python', 'Power BI', 'Excel'];

  return [
    {
      prompt: phase === 'ongoing' ? `How will you approach ${title}?` : `What is your practice plan for ${title}?`,
      type: 'textarea',
      options: [],
      required: true,
      placeholder: objective || `Summarize the steps you will take for ${title}.`,
    },
    {
      prompt: 'Which primary tool or workflow will you use?',
      type: 'select',
      options: toolOptions,
      required: true,
      placeholder: 'Choose your tool stack',
    },
    {
      prompt: phase === 'ongoing' ? 'Share your submission or portfolio link' : 'What deliverable will you complete during practice?',
      type: phase === 'ongoing' ? 'text' : 'textarea',
      options: [],
      required: true,
      placeholder: phase === 'ongoing' ? 'https://your-link.com' : `Describe how you will finish ${deliverable} in ${category}.`,
    },
  ];
}

export function ensureChallengeQuestions(item: Partial<PublicChallengeRecord> & { questions?: unknown }): ChallengeQuestionRecord[] {
  const mapped = Array.isArray(item.questions) ? item.questions.map(toQuestionRecord).filter(Boolean) as ChallengeQuestionRecord[] : [];
  return mapped.length ? mapped : buildDefaultChallengeQuestions(item);
}

export const MOCK_CHALLENGES: PublicChallengeRecord[] = [
  {
    id: 'databricks-2',
    slug: 'databricks-2',
    title: 'Build With Databricks: Hands-On Project Challenge - 2',
    description: 'Solve practical data problems through our resume project challenge and gain hands-on experience to boost your skills.',
    image: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=1200',
    category: 'Resume Projects',
    phase: 'ongoing',
    visibility: 'active',
    order: 1,
    prize: 'Rs 2,00,000',
    participants: '2.5k+',
    href: '/challenges/databricks-2',
    badge: 'Certified Submissions',
    objective: 'Build a polished analytics story from raw business data and present recommendations that feel interview-ready.',
    duration: '7 days',
    difficulty: 'Intermediate',
    tools: ['SQL', 'Power BI', 'Python', 'Presentation Deck'],
    deliverables: ['Insight summary PDF', 'Dashboard or notebook', 'LinkedIn post with key takeaways'],
    steps: ['Download the challenge brief and dataset.', 'Analyze the data and document your logic clearly.', 'Prepare your final dashboard or notebook.', 'Publish your takeaways and submit your solution link.'],
    actionUrl: '/courses',
    startDate: '2026-03-20',
    startTime: '09:00',
    endDate: '2026-03-27',
    endTime: '23:59',
    registrationDeadline: '2026-03-24',
    expiryDate: '2026-03-27',
    competitionMode: 'Individual',
    maxSubmissions: 1,
    teamSize: 'Solo',
    statusNote: 'Live and accepting submissions now.',
    eligibility: ['Open to all learners', 'Basic SQL and dashboard skills recommended', 'One final submission per participant'],
    rules: ['Submit original work only', 'Share a public portfolio or post link', 'Late submissions are not ranked'],
    questions: [
      { prompt: 'Share your solution summary', type: 'textarea', options: [], required: true, placeholder: 'Briefly explain your approach and key insights.' },
      { prompt: 'What tool stack did you use?', type: 'select', options: ['SQL + Power BI', 'Python + Notebook', 'Excel + Presentation', 'Mixed stack'], required: true, placeholder: '' },
      { prompt: 'Paste your portfolio or submission link', type: 'text', options: [], required: true, placeholder: 'https://...' },
    ],
  },
  {
    id: 'food-delivery',
    slug: 'food-delivery',
    title: 'Providing Insights for Crisis Recovery in an Online Food Delivery Startup',
    description: 'Explore retention, operations, and performance levers for a food delivery business recovering from disruption.',
    image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&q=80&w=1200',
    category: 'Business Analytics',
    phase: 'completed',
    visibility: 'active',
    order: 1,
    prize: 'Rs 25,000',
    participants: '2265',
    href: '/challenges/food-delivery',
    objective: 'Practice diagnosing a startup recovery problem using ops, retention, and delivery performance metrics.',
    duration: 'Self-paced practice',
    difficulty: 'Beginner to Intermediate',
    tools: ['Excel', 'SQL', 'Power BI'],
    deliverables: ['Practice analysis workbook', 'Recommendation notes', 'Portfolio-ready summary'],
    steps: ['Review the case statement.', 'Explore the provided business metrics.', 'Identify root causes and opportunities.', 'Turn your work into a polished practice project.'],
    actionUrl: '',
    startDate: '2025-10-01',
    startTime: '09:00',
    endDate: '2025-10-08',
    endTime: '23:59',
    registrationDeadline: '2025-10-05',
    expiryDate: '2025-10-08',
    competitionMode: 'Individual',
    maxSubmissions: 1,
    teamSize: 'Solo',
    statusNote: 'Competition closed. Available now as a guided practice challenge.',
    eligibility: ['Open as a practice case study', 'Recommended for analytics learners'],
    rules: ['Use it for learning and portfolio building', 'No live ranking for archived challenges'],
    questions: [
      { prompt: 'What is the first metric you would investigate?', type: 'textarea', options: [], required: true, placeholder: 'Explain why this metric matters.' },
      { prompt: 'Which area is the biggest recovery lever?', type: 'select', options: ['Retention', 'Delivery operations', 'Marketing efficiency', 'Restaurant supply'], required: true, placeholder: '' },
      { prompt: 'How will you turn this into a practice-ready deliverable?', type: 'textarea', options: [], required: true, placeholder: 'Describe the workbook, deck, or summary you will complete.' },
    ],
  },
  {
    id: 'newspaper',
    slug: 'newspaper',
    title: 'Provide Insights to Guide a Legacy Newspaper\'s Survival in a Post-COVID Digital Era',
    description: 'Use customer and content analytics to recommend sustainable digital growth for a media business.',
    image: 'https://images.unsplash.com/photo-1504711331083-9c895941bf81?auto=format&fit=crop&q=80&w=1200',
    category: 'Strategy & Insights',
    phase: 'completed',
    visibility: 'active',
    order: 2,
    prize: 'Rs 50,000',
    participants: '1551',
    href: '/challenges/newspaper',
    objective: 'Practice digital growth analysis by translating audience, content, and monetization signals into strategy.',
    duration: 'Self-paced practice',
    difficulty: 'Intermediate',
    tools: ['SQL', 'Spreadsheet Modeling', 'Presentation Deck'],
    deliverables: ['Content funnel analysis', 'Growth recommendation deck', 'Executive summary'],
    steps: ['Understand the newsroom business problem.', 'Analyze audience and revenue trends.', 'Prioritize the biggest growth levers.', 'Present a practical transformation plan.'],
    actionUrl: '',
    startDate: '2025-08-14',
    startTime: '10:00',
    endDate: '2025-08-21',
    endTime: '23:59',
    registrationDeadline: '2025-08-18',
    expiryDate: '2025-08-21',
    competitionMode: 'Team or Individual',
    maxSubmissions: 1,
    teamSize: 'Up to 3',
    statusNote: 'Archived challenge now open for portfolio practice.',
    eligibility: ['Open to aspiring analysts and strategists'],
    rules: ['Cite assumptions clearly', 'Keep recommendations business-focused'],
    questions: [
      { prompt: 'Which growth lever would you prioritize first?', type: 'textarea', options: [], required: true, placeholder: 'Describe your reasoning.' },
      { prompt: 'What output would you create first?', type: 'select', options: ['Retention cohort analysis', 'Revenue trend model', 'Executive summary deck', 'Content performance dashboard'], required: true, placeholder: '' },
      { prompt: 'What will your final practice deliverable include?', type: 'textarea', options: [], required: true, placeholder: 'Summarize the analysis, recommendation, and presentation you plan to complete.' },
    ],
  },
  {
    id: 'air-purifier',
    slug: 'air-purifier',
    title: 'Conduct Product Market Fit Research for Air Purifier Development Using AQI Analytics',
    description: 'Blend market sizing, AQI analysis, and product positioning to validate an air purifier opportunity.',
    image: 'https://images.unsplash.com/photo-1620912189866-b8d3421f3e37?auto=format&fit=crop&q=80&w=1200',
    category: 'Product Research',
    phase: 'completed',
    visibility: 'active',
    order: 3,
    prize: 'Rs 50,000',
    participants: '2810',
    href: '/challenges/air-purifier',
    objective: 'Practice product research and market sizing by combining air quality data with market opportunity insights.',
    duration: 'Self-paced practice',
    difficulty: 'Intermediate',
    tools: ['Python', 'Spreadsheets', 'Market Research'],
    deliverables: ['Research summary', 'Opportunity sizing sheet', 'Recommendation slide'],
    steps: ['Review the product brief and market context.', 'Study AQI and user demand patterns.', 'Size the opportunity and key segments.', 'Recommend a clear go-to-market direction.'],
    actionUrl: '',
    startDate: '2025-06-11',
    startTime: '09:00',
    endDate: '2025-06-18',
    endTime: '23:59',
    registrationDeadline: '2025-06-14',
    expiryDate: '2025-06-18',
    competitionMode: 'Individual',
    maxSubmissions: 1,
    teamSize: 'Solo',
    statusNote: 'Archived challenge now open for product analytics practice.',
    eligibility: ['Open to product and market research learners'],
    rules: ['Support conclusions with data', 'Keep your recommendation concise and actionable'],
    questions: [
      { prompt: 'Which segment would you analyze first?', type: 'textarea', options: [], required: true, placeholder: 'Explain your choice.' },
      { prompt: 'What kind of deliverable will you build?', type: 'select', options: ['Market sizing sheet', 'Research memo', 'Recommendation deck', 'Dashboard'], required: true, placeholder: '' },
      { prompt: 'What proof points will make your recommendation stronger?', type: 'textarea', options: [], required: true, placeholder: 'List the AQI, market, and customer signals you will highlight.' },
    ],
  },
];

export function mapChallengeDocumentToPublicChallenge(item: any): PublicChallengeRecord {
  return {
    id: String(item._id || item.id || item.slug),
    slug: String(item.slug || slugify(String(item.title || item._id || 'challenge'))),
    title: String(item.title || 'Untitled Challenge'),
    description: String(item.description || ''),
    image: String(item.image || '/images/edvo-official-logo-v10.png'),
    category: String(item.category || 'General'),
    phase: item.phase === 'completed' ? 'completed' : 'ongoing',
    visibility: item.visibility === 'inactive' ? 'inactive' : 'active',
    order: Number(item.order || 0),
    prize: String(item.prize || ''),
    participants: String(item.participants || ''),
    href: String(item.href || `/challenges/${item.slug || ''}`),
    badge: item.badge ? String(item.badge) : undefined,
    objective: String(item.objective || item.description || ''),
    duration: String(item.duration || (item.phase === 'completed' ? 'Self-paced practice' : '7 days')),
    difficulty: String(item.difficulty || 'Intermediate'),
    tools: Array.isArray(item.tools) ? item.tools.map((tool: unknown) => String(tool || '')).filter(Boolean) : [],
    deliverables: Array.isArray(item.deliverables) ? item.deliverables.map((entry: unknown) => String(entry || '')).filter(Boolean) : [],
    steps: Array.isArray(item.steps) ? item.steps.map((entry: unknown) => String(entry || '')).filter(Boolean) : [],
    actionUrl: String(item.actionUrl || ''),
    startDate: String(item.startDate || ''),
    startTime: String(item.startTime || ''),
    endDate: String(item.endDate || ''),
    endTime: String(item.endTime || ''),
    registrationDeadline: String(item.registrationDeadline || ''),
    expiryDate: String(item.expiryDate || ''),
    competitionMode: String(item.competitionMode || 'Individual'),
    maxSubmissions: Number(item.maxSubmissions || 1),
    teamSize: String(item.teamSize || 'Solo or small team'),
    statusNote: String(item.statusNote || ''),
    eligibility: Array.isArray(item.eligibility) ? item.eligibility.map((entry: unknown) => String(entry || '')).filter(Boolean) : [],
    rules: Array.isArray(item.rules) ? item.rules.map((entry: unknown) => String(entry || '')).filter(Boolean) : [],
    questions: ensureChallengeQuestions(item),
  };
}
