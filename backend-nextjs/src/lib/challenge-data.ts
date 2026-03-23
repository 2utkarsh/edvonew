import { slugify } from '@/lib/query';

export interface ChallengeQuestionRecord {
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

export interface CodingTestCaseRecord {
  input: string;
  expectedOutput: string;
  explanation?: string;
}

export interface CodingChallengeRecord {
  enabled: boolean;
  language: string;
  functionName: string;
  problemStatement: string;
  starterCode: string;
  visibleTestCases: CodingTestCaseRecord[];
  hiddenTestCases: CodingTestCaseRecord[];
  durationMinutes: number;
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
  codingChallenge?: CodingChallengeRecord;
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

function toCodingTestCaseRecord(testCase: any): CodingTestCaseRecord | null {
  const input = String(testCase?.input || '').trim();
  const expectedOutput = String(testCase?.expectedOutput || '').trim();
  if (!input || !expectedOutput) return null;
  return {
    input,
    expectedOutput,
    explanation: testCase?.explanation ? String(testCase.explanation) : undefined,
  };
}

function toCodingChallengeRecord(value: any): CodingChallengeRecord | undefined {
  if (!value || value.enabled !== true) return undefined;
  return {
    enabled: true,
    language: String(value.language || 'javascript'),
    functionName: String(value.functionName || 'solve'),
    problemStatement: String(value.problemStatement || ''),
    starterCode: String(value.starterCode || ''),
    visibleTestCases: Array.isArray(value.visibleTestCases) ? value.visibleTestCases.map(toCodingTestCaseRecord).filter(Boolean) as CodingTestCaseRecord[] : [],
    hiddenTestCases: Array.isArray(value.hiddenTestCases) ? value.hiddenTestCases.map(toCodingTestCaseRecord).filter(Boolean) as CodingTestCaseRecord[] : [],
    durationMinutes: Math.max(1, parseInt(String(value.durationMinutes || 90), 10) || 90),
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

export const MOCK_CHALLENGES: PublicChallengeRecord[] = [];

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
    codingChallenge: toCodingChallengeRecord(item.codingChallenge),
  };
}
