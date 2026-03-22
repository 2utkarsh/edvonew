import { slugify } from '@/lib/query';

export interface ChallengeQuestionRecord {
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
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
  quizDurationMinutes: number;
  prizeDistribution: string[];
  questions: ChallengeQuestionRecord[];
}

function buildDefaultPrizeDistribution(prize: string) {
  const totalPrize = String(prize || 'Recognition and certificates').trim();
  return [
    `Winner: ${totalPrize}`,
    'Runner-up: Merit certificate and portfolio spotlight',
    'Top performers: Community feature and shortlist visibility',
  ];
}

function toQuestionRecord(question: any): ChallengeQuestionRecord | null {
  const prompt = String(question?.prompt || '').trim();
  const options = Array.isArray(question?.options)
    ? question.options.map((option: unknown) => String(option || '').trim()).filter(Boolean)
    : [];
  const correctAnswer = String(question?.correctAnswer || '').trim();
  if (!prompt || options.length < 2 || !correctAnswer || !options.includes(correctAnswer)) return null;
  return {
    prompt,
    options,
    correctAnswer,
    explanation: String(question?.explanation || '').trim(),
    points: Math.max(1, parseInt(String(question?.points || 1), 10) || 1),
  };
}

export function buildDefaultChallengeQuestions(item: Partial<PublicChallengeRecord> & { title?: string; phase?: string; category?: string; objective?: string; deliverables?: string[]; tools?: string[] }): ChallengeQuestionRecord[] {
  const title = String(item.title || 'this challenge').trim();
  const phase = item.phase === 'completed' ? 'completed' : 'ongoing';
  const category = String(item.category || 'General').trim();
  const objective = String(item.objective || item.description || '').trim() || `Work through ${title} with a structured analyst mindset.`;
  const primaryTool = Array.isArray(item.tools) && item.tools.length ? String(item.tools[0] || 'SQL').trim() : 'SQL';
  const deliverable = Array.isArray(item.deliverables) && item.deliverables.length ? String(item.deliverables[0] || 'Final submission deck').trim() : 'Final submission deck';

  return [
    {
      prompt: `What should be your first priority in ${title}?`,
      options: [
        'Understand the business problem and success metric',
        'Jump straight to chart styling',
        'Skip the dataset and write the final answer',
        'Submit without validating assumptions',
      ],
      correctAnswer: 'Understand the business problem and success metric',
      explanation: objective,
      points: 5,
    },
    {
      prompt: `Which tool is the best fit to start this ${category} challenge?`,
      options: [primaryTool, 'Photoshop', 'Canva only', 'Video editor'],
      correctAnswer: primaryTool,
      explanation: `The challenge setup already highlights ${primaryTool} in the recommended stack.`,
      points: 5,
    },
    {
      prompt: phase === 'ongoing' ? `Which output is expected before you submit ${title}?` : `Which output should you finish while practicing ${title}?`,
      options: [deliverable, 'A blank notebook', 'Only a social caption', 'No deliverable is needed'],
      correctAnswer: deliverable,
      explanation: `The challenge deliverables include ${deliverable}.`,
      points: 5,
    },
  ];
}

export function ensureChallengeQuestions(item: Partial<PublicChallengeRecord> & { questions?: unknown }): ChallengeQuestionRecord[] {
  const mapped = Array.isArray(item.questions) ? item.questions.map(toQuestionRecord).filter(Boolean) as ChallengeQuestionRecord[] : [];
  return mapped.length ? mapped : buildDefaultChallengeQuestions(item);
}

export function ensurePrizeDistribution(item: Partial<PublicChallengeRecord> & { prizeDistribution?: unknown; prize?: unknown }) {
  const mapped = Array.isArray(item.prizeDistribution) ? item.prizeDistribution.map((entry) => String(entry || '').trim()).filter(Boolean) : [];
  return mapped.length ? mapped : buildDefaultPrizeDistribution(String(item.prize || ''));
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
    quizDurationMinutes: 60,
    prizeDistribution: ['Winner: Rs 1,00,000', '1st Runner-up: Rs 60,000', '2nd Runner-up: Rs 40,000'],
    questions: [
      { prompt: 'What should you do first before building your Databricks challenge output?', options: ['Understand the challenge brief and business goal', 'Design the final certificate', 'Skip data exploration', 'Only copy a public dashboard'], correctAnswer: 'Understand the challenge brief and business goal', explanation: 'Strong competition work starts by grounding the analysis in the business objective and expected outcome.', points: 5 },
      { prompt: 'Which stack is most aligned with this challenge?', options: ['SQL + Power BI', 'Only Photoshop', 'Only Figma', 'Only Premiere Pro'], correctAnswer: 'SQL + Power BI', explanation: 'The challenge emphasizes analytical work with SQL and dashboard storytelling.', points: 5 },
      { prompt: 'Which deliverable is expected for submission?', options: ['Insight summary PDF', 'A blank slide deck', 'Only a profile photo', 'No final output'], correctAnswer: 'Insight summary PDF', explanation: 'The challenge deliverables include an insight summary PDF together with the core analysis assets.', points: 5 },
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
    quizDurationMinutes: 35,
    prizeDistribution: ['Top score benchmark: 15/15', 'Portfolio-ready practice completion certificate', 'Featured practice submissions in community recap'],
    questions: [
      { prompt: 'Which area is the strongest first lens for this recovery case?', options: ['Retention and repeat orders', 'Changing the logo', 'Ignoring operations', 'Posting random ads'], correctAnswer: 'Retention and repeat orders', explanation: 'Recovery analysis should start by understanding where repeat demand is breaking down.', points: 5 },
      { prompt: 'Which tool is appropriate for this practice challenge?', options: ['Excel', 'Only Illustrator', 'Only After Effects', 'Only Blender'], correctAnswer: 'Excel', explanation: 'The practice stack includes spreadsheet analysis for structured business data review.', points: 5 },
      { prompt: 'What should you complete by the end of practice?', options: ['Practice analysis workbook', 'A random meme post', 'No deliverable', 'A color palette only'], correctAnswer: 'Practice analysis workbook', explanation: 'The workbook is one of the intended practice outputs for this challenge.', points: 5 },
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
    quizDurationMinutes: 40,
    prizeDistribution: ['Top score benchmark: 15/15', 'Best strategy deck feature', 'Top insight summary spotlight'],
    questions: [
      { prompt: 'What should you evaluate first in this newsroom challenge?', options: ['Audience and revenue trends', 'The office paint color', 'Only the homepage font', 'Nothing before final recommendations'], correctAnswer: 'Audience and revenue trends', explanation: 'The challenge focuses on sustainable digital growth, so audience and revenue signals come first.', points: 5 },
      { prompt: 'Which deliverable best matches this challenge?', options: ['Growth recommendation deck', 'A wedding album', 'Only a company slogan', 'No presentation at all'], correctAnswer: 'Growth recommendation deck', explanation: 'The recommended output includes a deck that translates analysis into strategic action.', points: 5 },
      { prompt: 'Which working style fits this challenge setup?', options: ['Team or Individual', 'Only multiplayer gaming', 'Video editing only', 'No analysis workflow'], correctAnswer: 'Team or Individual', explanation: 'This archived challenge was designed for either team-based or solo problem solving.', points: 5 },
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
    quizDurationMinutes: 45,
    prizeDistribution: ['Top score benchmark: 15/15', 'Best product research summary spotlight', 'Top opportunity sizing sheet feature'],
    questions: [
      { prompt: 'What should anchor your first analysis pass here?', options: ['AQI data and customer demand signals', 'Only product color ideas', 'Random slogans', 'Skipping the market context'], correctAnswer: 'AQI data and customer demand signals', explanation: 'This challenge is about product-market fit, so demand and AQI evidence should lead the analysis.', points: 5 },
      { prompt: 'Which deliverable is a direct fit for this practice?', options: ['Opportunity sizing sheet', 'Only a wallpaper image', 'No written output', 'A party invitation'], correctAnswer: 'Opportunity sizing sheet', explanation: 'Opportunity sizing is one of the central outputs in this product research challenge.', points: 5 },
      { prompt: 'Which tool is part of the intended workflow?', options: ['Python', 'Only audio editing', 'Only 3D modeling', 'Only poster design'], correctAnswer: 'Python', explanation: 'Python is part of the recommended stack for analyzing AQI and product opportunity data.', points: 5 },
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
    quizDurationMinutes: Math.max(1, Number(item.quizDurationMinutes || 45) || 45),
    prizeDistribution: ensurePrizeDistribution(item),
    questions: ensureChallengeQuestions(item),
  };
}
