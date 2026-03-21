export interface BlogPost {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  thumbnail: string;
  content: string[];
}

export const BLOG_CATEGORIES = [
  { id: 'all', label: 'All Articles', icon: 'BookOpen' },
  { id: 'Roadmaps', label: 'Roadmaps', icon: 'Rocket' },
  { id: 'Data Science', label: 'Data Science', icon: 'Database' },
  { id: 'AI & ML', label: 'AI & ML', icon: 'Brain' },
  { id: 'Programming', label: 'Coding', icon: 'Code' },
  { id: 'Career Tips', label: 'Soft Skills', icon: 'GraduationCap' },
] as const;

export const MOCK_BLOGS: BlogPost[] = [
  {
    id: '1',
    title: 'Software Engineer to AI Engineer: The Most Effective Path (2026)',
    description: 'Transitioning from traditional software engineering to AI engineering requires a strategic shift in both mindset and skills. This roadmap covers everything from math fundamentals to deploying LLM applications.',
    category: 'Roadmaps',
    author: 'Dhaval Patel',
    date: 'March 10, 2026',
    readTime: '12 min read',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
    content: [
      'The move from software engineering into AI engineering is not a jump into a completely different profession. It is a progression that builds on strong fundamentals in programming, systems thinking, and product delivery.',
      'What changes is the stack you prioritize. Instead of only shipping CRUD features, you begin working with data pipelines, embeddings, evaluation loops, vector search, prompt orchestration, and model-aware application design.',
      'A practical path starts with Python fluency, SQL confidence, statistics basics, and a clear understanding of how machine learning systems are deployed in production. Once those are in place, modern LLM application development becomes much easier to reason about.',
      'The fastest learners avoid trying to master every theory topic upfront. They build small projects, test ideas end to end, and gradually deepen the math only where it improves system quality, debugging, or model performance.',
      'If you already know how to ship software reliably, you are closer than you think. The real upgrade is learning how to work with uncertainty, experiments, and model behavior while still delivering business outcomes.'
    ],
  },
  {
    id: '2',
    title: 'Top 20 Data Engineering Interview Questions with Practical Solutions',
    description: 'Master the most frequently asked questions about ETL pipelines, data warehousing, and big data processing frameworks like Spark and Flink.',
    category: 'Career Tips',
    author: 'Hema Patel',
    date: 'March 8, 2026',
    readTime: '15 min read',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bbbda536ad0a?auto=format&fit=crop&q=80&w=800',
    content: [
      'Strong data engineering interviews focus less on textbook definitions and more on decision-making. Interviewers want to know how you think about reliability, scale, schema changes, and failure recovery.',
      'You should be ready to explain batch versus streaming tradeoffs, partitioning strategies, idempotent jobs, late-arriving data, and how to monitor pipeline health in real systems.',
      'The best preparation method is to answer each question with context, architecture, and a concrete example from a project or a realistic scenario. That makes your understanding feel operational instead of memorized.',
      'Practical solutions matter because teams hire engineers who can reduce incidents and keep data trustworthy. Show how you would debug broken dashboards, malformed events, or exploding warehouse costs.',
      'If your answers consistently tie architecture choices to business impact, you will stand out even against candidates with similar tools on their resume.'
    ],
  },
  {
    id: '3',
    title: 'Mastering SQL for Data Analytics: Beyond Basic SELECT Queries',
    description: 'Learn window functions, CTEs, and query optimization techniques that distinguish a junior analyst from a senior professional.',
    category: 'Data Science',
    author: 'Arjun Reddy',
    date: 'March 5, 2026',
    readTime: '10 min read',
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=800',
    content: [
      'SQL becomes truly powerful when you move beyond filtering rows and start shaping analysis with ranking, partitioning, rolling windows, and reusable common table expressions.',
      'Window functions help you answer questions that are painful with plain group-by queries. They let you compare each row to a cohort, sequence, or moving average without destroying row-level detail.',
      'Senior analysts also think about performance. That means understanding joins, indexing constraints, intermediate result sizes, and how query structure affects execution plans.',
      'Readable SQL is just as important as clever SQL. If your teammates cannot maintain your query, it becomes a liability no matter how fast it runs.',
      'The goal is not only to write correct queries. It is to produce trustworthy analysis that can be reused, explained, and scaled across the team.'
    ],
  },
  {
    id: '4',
    title: 'Building Your First AI Agent with LangChain and Python',
    description: 'Step-by-step guide to creating an autonomous agent that can browse the web, execute code, and solve complex tasks using GPT-4.',
    category: 'AI & ML',
    author: 'Sneha Gupta',
    date: 'March 2, 2026',
    readTime: '18 min read',
    thumbnail: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&q=80&w=800',
    content: [
      'Your first AI agent should be small, observable, and easy to evaluate. Starting with too many tools or too much autonomy makes failures difficult to diagnose.',
      'A clean beginner architecture usually includes a planner, one or two tools, memory scoped to the task, and a feedback loop for validation before returning the final answer.',
      'Python remains a strong choice because the ecosystem around model APIs, vector stores, evaluation libraries, and orchestration frameworks is mature and well documented.',
      'The most important skill is not wiring up a framework. It is learning how to constrain behavior, inspect intermediate steps, and decide when a workflow should be deterministic instead of agentic.',
      'If you design with observability from day one, you will learn faster and avoid many of the frustrations people associate with early agent projects.'
    ],
  },
  {
    id: '5',
    title: 'The Future of Web Development: Next.js 16 and Beyond',
    description: 'Explore the latest features in modern web frameworks and how server components are changing the way we build user interfaces.',
    category: 'Programming',
    author: 'Karan Singh',
    date: 'Feb 28, 2026',
    readTime: '8 min read',
    thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&q=80&w=800',
    content: [
      'Modern web development is increasingly about controlling boundaries between server work and client work instead of pushing everything into the browser by default.',
      'Frameworks like Next.js reward teams that think carefully about data fetching, cache behavior, progressive rendering, and route-level ownership of state.',
      'The developer experience improves when architecture aligns with the runtime. Features such as server actions, streaming, and colocated routing are useful because they reduce glue code and make intent clearer.',
      'At the same time, frontend teams still need strong fundamentals. Good UX, accessibility, performance budgets, and maintainable component systems matter more than ever.',
      'The future is not about chasing every new API. It is about using the platform more deliberately so products become faster, simpler, and easier to evolve.'
    ],
  },
  {
    id: '6',
    title: 'Context Engineering: The Most Important Skill for AI Era',
    description: 'Why managing context is more important than prompt engineering when building scalable production AI systems.',
    category: 'AI & ML',
    author: 'Dhaval Patel',
    date: 'Feb 25, 2026',
    readTime: '14 min read',
    thumbnail: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&q=80&w=800',
    content: [
      'Prompt engineering helps at the surface level, but context engineering is what makes AI systems dependable in production. It determines what the model sees, when it sees it, and how much it can trust.',
      'Great systems carefully retrieve, compress, rank, and format information so the model receives the right evidence instead of a noisy dump of loosely related text.',
      'This discipline sits at the intersection of product thinking, retrieval design, evaluation, and latency management. It is where many real-world AI quality gains come from.',
      'Teams that treat context as a first-class system concern usually ship better outcomes than teams that keep rewriting prompts without changing the surrounding information flow.',
      'In practice, context engineering means designing the conversation the model has with the application, not just the sentence the user sees on screen.'
    ],
  },
];

export function getBlogById(id: string) {
  return MOCK_BLOGS.find((blog) => blog.id === id);
}
