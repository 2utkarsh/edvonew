export interface MarketingStat {
  label: string;
  value: string;
}

export interface MarketingCard {
  title: string;
  description: string;
  meta?: string;
}

export interface MarketingSection {
  title: string;
  description: string;
  cards: MarketingCard[];
}

export interface MarketingFaq {
  question: string;
  answer: string;
}

export interface MarketingPageConfig {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  heroPoints: string[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  stats: MarketingStat[];
  spotlight: {
    title: string;
    description: string;
    items: string[];
  };
  sections: MarketingSection[];
  faqs?: MarketingFaq[];
}

export const publicPageConfigs: Record<string, MarketingPageConfig> = {
  about: {
    slug: "about",
    eyebrow: "About EDVO",
    title: "CodeBasics-inspired learning, built for outcomes.",
    description:
      "EDVO combines structured roadmaps, industry projects, mock interviews, and mentor support so learners can move from confusion to confidence.",
    heroPoints: [
      "Project-first learning tracks",
      "Mentor-led doubt solving and career guidance",
      "Courses, jobs, challenges, and events in one platform",
    ],
    primaryCta: { label: "Explore Courses", href: "/courses" },
    secondaryCta: { label: "See Challenges", href: "/challenges" },
    stats: [
      { label: "Learners", value: "500K+" },
      { label: "Hiring Partners", value: "350+" },
      { label: "Projects Shipped", value: "12K+" },
      { label: "Live Cohorts", value: "40+" },
    ],
    spotlight: {
      title: "What makes EDVO different",
      description:
        "We focus on the same things serious learners care about: practical skills, accountability, and visible career momentum.",
      items: [
        "Guided roadmaps instead of random playlists",
        "Hands-on capstone work with portfolio outcomes",
        "Placement-oriented prep built into the curriculum",
      ],
    },
    sections: [
      {
        title: "Learning experience",
        description: "A tight, no-fluff approach designed to keep momentum high.",
        cards: [
          {
            title: "Structured cohorts",
            description: "Every roadmap is broken into weekly targets so learners know what to do next.",
            meta: "Weekly cadence",
          },
          {
            title: "Real project labs",
            description: "Students build dashboards, apps, case studies, and interview-ready portfolios.",
            meta: "Portfolio focused",
          },
          {
            title: "Career accountability",
            description: "Resume reviews, mock interviews, and hiring prep are part of the flow.",
            meta: "Placement support",
          },
        ],
      },
      {
        title: "Who we serve",
        description: "The platform is designed for students, career switchers, and hiring teams.",
        cards: [
          {
            title: "Students",
            description: "Build core skills early and turn theory into practical work.",
            meta: "Freshers",
          },
          {
            title: "Working professionals",
            description: "Upskill with live classes, recordings, and focused specialization tracks.",
            meta: "Career switchers",
          },
          {
            title: "Companies",
            description: "Access evaluated talent across data, development, and business workflows.",
            meta: "Hiring teams",
          },
        ],
      },
    ],
  },
  challenges: {
    slug: "challenges",
    eyebrow: "Data Challenges",
    title: "Practice like CodeBasics: learn by solving real business problems.",
    description:
      "Our challenge hub is built for analysts, data scientists, and builders who want realistic datasets, time-boxed tasks, and visible rankings.",
    heroPoints: [
      "Weekly SQL, Python, BI, and GenAI tasks",
      "Public leaderboards and mentor walkthroughs",
      "Resume-worthy submissions and certificates",
    ],
    primaryCta: { label: "Start With Courses", href: "/courses" },
    secondaryCta: { label: "Join Events", href: "/events" },
    stats: [
      { label: "Active Challenges", value: "18" },
      { label: "Participants", value: "42K+" },
      { label: "Hiring Reviews", value: "120+" },
      { label: "Prize Pool", value: "Rs 7.5L" },
    ],
    spotlight: {
      title: "Why learners love these challenges",
      description:
        "The focus is not random puzzle-solving. Each challenge maps to practical analytics and product thinking.",
      items: [
        "Company-style problem statements",
        "Submission rubrics and solution reviews",
        "Peer comparison without overwhelming beginners",
      ],
    },
    sections: [
      {
        title: "Active tracks",
        description: "Choose the stream that matches your current level and target role.",
        cards: [
          {
            title: "SQL Friday Sprint",
            description: "Business questions on churn, retention, funnel leaks, and revenue patterns.",
            meta: "Beginner to intermediate",
          },
          {
            title: "Power BI Storytelling",
            description: "Turn raw datasets into executive dashboards with clear narratives.",
            meta: "Analyst track",
          },
          {
            title: "GenAI Workflow Build",
            description: "Design prompt, retrieval, and evaluation flows for realistic use cases.",
            meta: "Advanced track",
          },
        ],
      },
      {
        title: "Challenge flow",
        description: "A predictable loop so learners stay focused and improve each round.",
        cards: [
          {
            title: "Brief release",
            description: "Get the dataset, objective, constraints, and success criteria.",
            meta: "Day 1",
          },
          {
            title: "Submission window",
            description: "Upload notebooks, dashboards, or solution docs within the deadline.",
            meta: "3 to 7 days",
          },
          {
            title: "Review and rankings",
            description: "See benchmark solutions, judge notes, and top submissions.",
            meta: "Outcome driven",
          },
        ],
      },
    ],
  },
  resources: {
    slug: "resources",
    eyebrow: "Resources",
    title: "A focused resource library for learners who like practical explanations.",
    description:
      "Browse explainers, templates, interview notes, and curated study paths across analytics, development, and career prep.",
    heroPoints: [
      "Short, practical guides",
      "Interview and project templates",
      "Role-specific learning paths",
    ],
    primaryCta: { label: "Read Blog", href: "/resources/blog" },
    secondaryCta: { label: "Career Guides", href: "/resources/guides" },
    stats: [
      { label: "Resource Packs", value: "120+" },
      { label: "Templates", value: "45+" },
      { label: "Playbooks", value: "28" },
      { label: "Guides Shared", value: "300+" },
    ],
    spotlight: {
      title: "Built for clarity",
      description:
        "Everything here is designed to reduce overwhelm and give learners the next useful step quickly.",
      items: [
        "No jargon-heavy filler",
        "Examples that map to actual work",
        "Reusable templates you can adapt immediately",
      ],
    },
    sections: [
      {
        title: "Popular collections",
        description: "Start with the categories most learners use every week.",
        cards: [
          {
            title: "Interview prep sheets",
            description: "Role-wise prep notes for analyst, developer, and data science interviews.",
            meta: "High demand",
          },
          {
            title: "Project starter kits",
            description: "Dataset ideas, problem statements, README structures, and presentation checklists.",
            meta: "Portfolio support",
          },
          {
            title: "Learning plans",
            description: "Roadmaps for freshers, working professionals, and placement prep.",
            meta: "Step-by-step",
          },
        ],
      },
    ],
  },
  "resources-blog": {
    slug: "resources/blog",
    eyebrow: "Blog",
    title: "Actionable articles for data, dev, and career growth.",
    description:
      "This section mirrors the CodeBasics vibe: crisp posts, practical breakdowns, and business-flavored case studies instead of generic theory.",
    heroPoints: [
      "Case-study style explainers",
      "Industry workflow breakdowns",
      "Short reads with clear takeaways",
    ],
    primaryCta: { label: "Open Courses", href: "/courses" },
    secondaryCta: { label: "View Guides", href: "/resources/guides" },
    stats: [
      { label: "Articles", value: "240+" },
      { label: "Monthly Readers", value: "90K+" },
      { label: "Case Studies", value: "35+" },
      { label: "Interview Reads", value: "60+" },
    ],
    spotlight: {
      title: "What you will find here",
      description: "Useful content that helps learners connect concepts to business and hiring outcomes.",
      items: [
        "SQL and analytics walkthroughs",
        "Prompt engineering and GenAI practicals",
        "Resume, portfolio, and interview insights",
      ],
    },
    sections: [
      {
        title: "Featured lanes",
        description: "Choose a lane based on your current goal.",
        cards: [
          {
            title: "Analytics explained simply",
            description: "Posts that break down metrics, dashboards, and decision-making patterns.",
            meta: "Business analysis",
          },
          {
            title: "Data portfolio guides",
            description: "How to shape projects that recruiters and hiring managers will actually review.",
            meta: "Career acceleration",
          },
          {
            title: "AI workflows",
            description: "Prompting, evaluation, retrieval, and experimentation explained without hype.",
            meta: "Modern tooling",
          },
        ],
      },
    ],
  },
  "resources-tutorials": {
    slug: "resources/tutorials",
    eyebrow: "Free Courses",
    title: "Hands-on free courses with a clear start, finish, and outcome.",
    description:
      "These free courses are made for people who learn best by building dashboards, notebooks, and small production-style projects.",
    heroPoints: [
      "Stepwise implementation free courses",
      "Beginner-friendly code and BI walkthroughs",
      "Fast outputs you can reuse in your portfolio",
    ],
    primaryCta: { label: "Browse Courses", href: "/courses" },
    secondaryCta: { label: "Try Challenges", href: "/challenges" },
    stats: [
      { label: "Free Courses", value: "80+" },
      { label: "Mini Projects", value: "26" },
      { label: "Tooling Guides", value: "19" },
      { label: "Hands-on Hours", value: "140+" },
    ],
    spotlight: {
      title: "Free courses that ship something",
      description: "Every free course is aimed at a visible output rather than passive reading.",
      items: [
        "Dashboard builds",
        "SQL notebook exercises",
        "End-to-end app and AI workflow demos",
      ],
    },
    sections: [
      {
        title: "Free course categories",
        description: "Pick a stack and keep moving.",
        cards: [
          {
            title: "Power BI from raw CSV",
            description: "Clean data, model it, and turn it into a business dashboard.",
            meta: "Analytics",
          },
          {
            title: "Next.js portfolio projects",
            description: "Ship polished web experiences with reusable sections and clear UX.",
            meta: "Frontend",
          },
          {
            title: "GenAI prototypes",
            description: "Build prompt chains, retrieval experiments, and evaluation loops.",
            meta: "AI engineering",
          },
        ],
      },
    ],
  },
  "resources-guides": {
    slug: "resources/guides",
    eyebrow: "Career Guides",
    title: "Career guides for learners who want the shortest path to employability.",
    description:
      "Use these guides to plan role transitions, portfolio strategy, interview prep, and hiring outreach without guesswork.",
    heroPoints: [
      "Role-wise roadmaps",
      "Resume and LinkedIn improvement guides",
      "Interview and networking playbooks",
    ],
    primaryCta: { label: "See Hire Talent", href: "/hire-talent" },
    secondaryCta: { label: "Read Testimonials", href: "/testimonials" },
    stats: [
      { label: "Roadmaps", value: "22" },
      { label: "Interview Kits", value: "18" },
      { label: "Resume Templates", value: "14" },
      { label: "Placement Plays", value: "30+" },
    ],
    spotlight: {
      title: "Built around job outcomes",
      description: "These guides help learners improve not just knowledge, but also signal and visibility.",
      items: [
        "Portfolio curation checklists",
        "Mock interview preparation plans",
        "Weekly application execution systems",
      ],
    },
    sections: [
      {
        title: "Guide bundles",
        description: "Practical resources you can apply immediately.",
        cards: [
          {
            title: "Analyst to data scientist roadmap",
            description: "How to stack SQL, Python, ML, and storytelling in the right order.",
            meta: "Transition guide",
          },
          {
            title: "Developer placement kit",
            description: "Resume, GitHub, projects, and interview prep tuned for product companies.",
            meta: "Job search",
          },
          {
            title: "LinkedIn visibility system",
            description: "Simple weekly posting and outreach structure to increase opportunities.",
            meta: "Personal brand",
          },
        ],
      },
    ],
  },
  events: {
    slug: "events",
    eyebrow: "Events",
    title: "Live sessions that feel useful, not just promotional.",
    description:
      "Join master classes, workshops, hackathons, and cohort launches focused on practical skills, hiring readiness, and industry workflows.",
    heroPoints: [
      "Live workshops with assignments",
      "Mentor Q&A and roadmap sessions",
      "Career and portfolio review events",
    ],
    primaryCta: { label: "Join Master Classes", href: "/events/webinars" },
    secondaryCta: { label: "See Workshops", href: "/events/workshops" },
    stats: [
      { label: "Upcoming Events", value: "24" },
      { label: "Monthly Attendees", value: "18K+" },
      { label: "Workshop Hours", value: "90+" },
      { label: "Mentors Live", value: "65+" },
    ],
    spotlight: {
      title: "Designed for busy learners",
      description:
        "Sessions are built to deliver a concrete takeaway, whether that is a dashboard, project, strategy, or interview insight.",
      items: [
        "Recordings for registered attendees",
        "Short, focused event tracks",
        "Events tied to learning paths and jobs",
      ],
    },
    sections: [
      {
        title: "Event formats",
        description: "Pick the format that matches your current goal.",
        cards: [
          {
            title: "Master Classes",
            description: "Big-picture sessions on industry trends, roadmaps, and hiring expectations.",
            meta: "Strategic view",
          },
          {
            title: "Workshops",
            description: "Hands-on builds with files, datasets, and mentor guidance.",
            meta: "Execution focused",
          },
          {
            title: "Hackathons",
            description: "Collaborative competitions where you solve practical business problems fast.",
            meta: "High energy",
          },
        ],
      },
    ],
  },
  "events-webinars": {
    slug: "events/webinars",
    eyebrow: "Master Classes",
    title: "Roadmap-first master classes for learners and career switchers.",
    description:
      "Attend live sessions that explain what to learn, how to build proof of work, and how to position yourself in the market.",
    heroPoints: [
      "Role-based roadmap sessions",
      "Industry trend briefings",
      "Portfolio and hiring Q&A",
    ],
    primaryCta: { label: "Explore Jobs", href: "/jobs" },
    secondaryCta: { label: "Browse Guides", href: "/resources/guides" },
    stats: [
      { label: "Live Speakers", value: "40+" },
      { label: "Sessions/Month", value: "12" },
      { label: "Avg Attendance", value: "1.5K" },
      { label: "Replay Views", value: "25K+" },
    ],
    spotlight: {
      title: "Common master class topics",
      description: "Each session is mapped to learner problems that actually matter.",
      items: [
        "How to break into data roles",
        "How to build your first serious portfolio",
        "What hiring managers look for in 2026",
      ],
    },
    sections: [
      {
        title: "Upcoming themes",
        description: "Fresh sessions across AI, analytics, and development.",
        cards: [
          {
            title: "From Excel to Power BI",
            description: "A realistic upskilling path for business and operations professionals.",
            meta: "Beginner friendly",
          },
          {
            title: "GenAI careers without hype",
            description: "A grounded look at skills, tooling, and proof-of-work expectations.",
            meta: "AI roadmap",
          },
          {
            title: "Resume teardown live",
            description: "See what gets cut, what gets highlighted, and why.",
            meta: "Career clinic",
          },
        ],
      },
    ],
  },
  "events-workshops": {
    slug: "events/workshops",
    eyebrow: "Workshops",
    title: "Hands-on workshops where learners build something real in one sitting.",
    description:
      "These workshops are deliberately practical: participants leave with dashboards, notebooks, mini apps, or reviewable outputs.",
    heroPoints: [
      "Build with mentors live",
      "Take-home files and templates",
      "Outputs you can extend into projects",
    ],
    primaryCta: { label: "See Free Courses", href: "/resources/tutorials" },
    secondaryCta: { label: "Browse Courses", href: "/courses" },
    stats: [
      { label: "Workshop Tracks", value: "9" },
      { label: "Projects Built", value: "300+" },
      { label: "Practice Labs", value: "48" },
      { label: "Completion Rate", value: "82%" },
    ],
    spotlight: {
      title: "Workshop outcomes",
      description: "The structure is simple: brief, build, feedback, iterate.",
      items: [
        "Project templates included",
        "Mentor checkpoints during the build",
        "Optional review after submission",
      ],
    },
    sections: [
      {
        title: "Popular workshops",
        description: "Current high-demand build sessions.",
        cards: [
          {
            title: "Executive dashboard in Power BI",
            description: "Model data and build a clear business dashboard from scratch.",
            meta: "2-hour build",
          },
          {
            title: "Next.js landing page sprint",
            description: "Create a polished marketing page with reusable components and sections.",
            meta: "Frontend lab",
          },
          {
            title: "Prompt evaluation workshop",
            description: "Compare output quality, define criteria, and improve prompts systematically.",
            meta: "AI workshop",
          },
        ],
      },
    ],
  },
  "events-hackathons": {
    slug: "events/hackathons",
    eyebrow: "Hackathons",
    title: "Fast-paced hackathons built around teamwork, output, and judging clarity.",
    description:
      "Join high-energy events where teams solve realistic product, AI, analytics, or automation problems and pitch their solutions.",
    heroPoints: [
      "Clear judging rubrics",
      "Mentor office hours during the event",
      "Portfolio and networking upside",
    ],
    primaryCta: { label: "Join Challenges", href: "/challenges" },
    secondaryCta: { label: "Hire Talent", href: "/hire-talent" },
    stats: [
      { label: "Teams Formed", value: "1.2K+" },
      { label: "Mentors", value: "55" },
      { label: "Prize Pool", value: "Rs 12L" },
      { label: "Hiring Intros", value: "90+" },
    ],
    spotlight: {
      title: "Why these hackathons stand out",
      description: "We bias toward clear problems, useful deliverables, and fair evaluation.",
      items: [
        "Business and product context included",
        "Not just code quantity, but solution quality",
        "Strong post-event showcase value",
      ],
    },
    sections: [
      {
        title: "Hackathon lanes",
        description: "Pick the lane that suits your strengths.",
        cards: [
          {
            title: "AI automation sprint",
            description: "Build assistants and workflow automations for realistic team use cases.",
            meta: "AI systems",
          },
          {
            title: "Analytics challenge weekend",
            description: "Solve a business dataset case and present the decision story.",
            meta: "Data storytelling",
          },
          {
            title: "Product prototyping jam",
            description: "Turn a brief into a clickable product concept or MVP.",
            meta: "Builder lane",
          },
        ],
      },
    ],
  },
  testimonials: {
    slug: "testimonials",
    eyebrow: "Testimonials",
    title: "Real career progress from learners who shipped work and stayed consistent.",
    description:
      "From freshers to working professionals, these stories show what happens when structured learning meets execution.",
    heroPoints: [
      "Role transitions into analytics and development",
      "Portfolio-led interview wins",
      "Learner stories with measurable outcomes",
    ],
    primaryCta: { label: "Start Learning", href: "/courses" },
    secondaryCta: { label: "Open Career Guides", href: "/resources/guides" },
    stats: [
      { label: "Success Stories", value: "1,100+" },
      { label: "Avg Salary Jump", value: "68%" },
      { label: "Career Switches", value: "4.5K+" },
      { label: "Top Package", value: "32 LPA" },
    ],
    spotlight: {
      title: "Patterns behind the wins",
      description:
        "The strongest outcomes usually come from learners who finish projects, seek feedback, and stay visible in public or mock review loops.",
      items: [
        "Consistent project execution",
        "Resume and mock interview iteration",
        "Applying with stronger proof-of-work",
      ],
    },
    sections: [
      {
        title: "Stories we hear often",
        description: "A snapshot of the most common transformations on the platform.",
        cards: [
          {
            title: "Non-tech to analyst",
            description: "Learners use SQL, dashboards, and business storytelling to enter data roles.",
            meta: "High conversion path",
          },
          {
            title: "Fresher to developer",
            description: "Project-based frontend and full-stack work helps candidates stand out quickly.",
            meta: "Portfolio first",
          },
          {
            title: "Professional to AI builder",
            description: "Experienced people layer modern AI workflows on top of domain expertise.",
            meta: "Career acceleration",
          },
        ],
      },
    ],
  },
  "hire-talent": {
    slug: "hire-talent",
    eyebrow: "Hire Talent",
    title: "Hire job-ready learners with visible projects and evaluated skills.",
    description:
      "EDVO helps teams discover candidates who have built relevant work, completed challenge tracks, and shown consistency across practical assessments.",
    heroPoints: [
      "Pre-screened learner profiles",
      "Project and challenge-based evaluation signals",
      "Support for internships, full-time, and contract roles",
    ],
    primaryCta: { label: "Contact Hiring Team", href: "/contact" },
    secondaryCta: { label: "See Student Stories", href: "/testimonials" },
    stats: [
      { label: "Hiring Partners", value: "350+" },
      { label: "Candidate Pool", value: "25K+" },
      { label: "Avg Shortlist Time", value: "72 hrs" },
      { label: "Domains Covered", value: "12" },
    ],
    spotlight: {
      title: "What companies get",
      description: "A more useful signal than resumes alone: project quality, communication, and consistency.",
      items: [
        "Skill-tagged learner profiles",
        "Challenge and cohort performance indicators",
        "Support for custom hiring drives and workshops",
      ],
    },
    sections: [
      {
        title: "Hiring use cases",
        description: "Different ways companies use EDVO talent pipelines.",
        cards: [
          {
            title: "Early talent hiring",
            description: "Source freshers who already have visible work and reviewable projects.",
            meta: "Campus alternative",
          },
          {
            title: "Niche skill hiring",
            description: "Find candidates in analytics, full stack, BI, automation, and GenAI workflows.",
            meta: "Specialized roles",
          },
          {
            title: "Employer branding",
            description: "Run branded challenges or events to attract relevant candidates.",
            meta: "Top-of-funnel",
          },
        ],
      },
    ],
  },
  pricing: {
    slug: "pricing",
    eyebrow: "Pricing",
    title: "Simple pricing built around serious learning, not confusion.",
    description:
      "Choose between self-paced access, live cohorts, and premium career support depending on how much structure you want.",
    heroPoints: [
      "Transparent plan comparison",
      "Cohort and self-paced options",
      "Upskill now, upgrade later",
    ],
    primaryCta: { label: "View Courses", href: "/courses" },
    secondaryCta: { label: "Talk to Team", href: "/contact" },
    stats: [
      { label: "Entry Plan", value: "Rs 2,999" },
      { label: "Cohort Tracks", value: "15+" },
      { label: "EMI Options", value: "Available" },
      { label: "Upgrade Flex", value: "Anytime" },
    ],
    spotlight: {
      title: "How to choose",
      description: "Pick the plan based on accountability, live support, and career acceleration needs.",
      items: [
        "Self-paced for flexible learners",
        "Live cohort for structure and feedback",
        "Career plan for mentorship and placement prep",
      ],
    },
    sections: [
      {
        title: "Plan shapes",
        description: "A quick view of the kinds of plans available across the platform.",
        cards: [
          {
            title: "Self-paced",
            description: "Recorded content, templates, and practice sets for independent learners.",
            meta: "Lowest commitment",
          },
          {
            title: "Live cohort",
            description: "Mentor-led classes, assignments, and milestones that keep you moving.",
            meta: "Most popular",
          },
          {
            title: "Career support",
            description: "Includes feedback loops, mocks, portfolio review, and hiring prep.",
            meta: "Best for transitions",
          },
        ],
      },
    ],
    faqs: [
      {
        question: "Can I upgrade later?",
        answer: "Yes. Plans are designed so learners can move into live or premium support when they need more accountability.",
      },
      {
        question: "Do all courses have the same pricing?",
        answer: "No. Pricing varies by depth, mentor involvement, live support, and included career services.",
      },
      {
        question: "Is EMI available?",
        answer: "Yes, EMI and installment options are available on selected flagship cohort programs.",
      },
    ],
  },
  business: {
    slug: "business",
    eyebrow: "For Business",
    title: "Upskill teams with focused programs, hands-on workshops, and measurable progress.",
    description:
      "EDVO Business helps companies train internal teams across analytics, reporting, AI workflows, and modern product delivery.",
    heroPoints: [
      "Custom cohorts for teams",
      "Workshops tied to business use cases",
      "Progress visibility for managers",
    ],
    primaryCta: { label: "Book a Demo", href: "/contact" },
    secondaryCta: { label: "See Workshops", href: "/events/workshops" },
    stats: [
      { label: "Teams Trained", value: "120+" },
      { label: "Domains", value: "Analytics, AI, Dev" },
      { label: "Custom Tracks", value: "30+" },
      { label: "Avg CSAT", value: "4.8/5" },
    ],
    spotlight: {
      title: "Business outcomes first",
      description: "Training is mapped to actual team bottlenecks, not generic catalogs alone.",
      items: [
        "Use-case driven curriculum design",
        "Hands-on labs with company contexts",
        "Leadership-level reporting on progress",
      ],
    },
    sections: [
      {
        title: "Where teams use EDVO",
        description: "Common internal enablement scenarios.",
        cards: [
          {
            title: "BI and dashboard adoption",
            description: "Train ops and business teams to move from manual reports to clear dashboards.",
            meta: "Reporting transformation",
          },
          {
            title: "AI workflow onboarding",
            description: "Help teams use prompting, retrieval, and automation responsibly and effectively.",
            meta: "AI readiness",
          },
          {
            title: "Manager upskilling",
            description: "Give team leads enough technical fluency to guide cross-functional work better.",
            meta: "Leadership enablement",
          },
        ],
      },
    ],
  },
  students: {
    slug: "students",
    eyebrow: "For Students",
    title: "A clear path from learning basics to building a standout profile.",
    description:
      "Students use EDVO to learn practical skills early, build projects, and enter internships or first jobs with more confidence.",
    heroPoints: [
      "Foundational to advanced roadmaps",
      "Beginner-safe projects and mentor sessions",
      "Internship, challenge, and portfolio support",
    ],
    primaryCta: { label: "Create Account", href: "/auth/register" },
    secondaryCta: { label: "Browse Jobs", href: "/jobs" },
    stats: [
      { label: "Student Users", value: "300K+" },
      { label: "Internships Listed", value: "1.1K+" },
      { label: "Project Templates", value: "70+" },
      { label: "Beginner Tracks", value: "25+" },
    ],
    spotlight: {
      title: "Why students stick with EDVO",
      description: "The product tries to remove the three biggest blockers: confusion, inconsistency, and weak proof-of-work.",
      items: [
        "Clear weekly next steps",
        "Project ideas that are actually doable",
        "More confidence before applying anywhere",
      ],
    },
    sections: [
      {
        title: "Best starting points",
        description: "A few paths that work well for students in early-stage learning.",
        cards: [
          {
            title: "SQL + Power BI starter path",
            description: "A strong entry point for analytics-minded students.",
            meta: "Low barrier",
          },
          {
            title: "Frontend portfolio track",
            description: "Build polished pages and apps that are easy to showcase publicly.",
            meta: "Visual output",
          },
          {
            title: "Challenge + job loop",
            description: "Use challenges to build skill proof, then apply with stronger signal.",
            meta: "Execution path",
          },
        ],
      },
    ],
  },
  careers: {
    slug: "careers",
    eyebrow: "Careers",
    title: "Join a team obsessed with practical learning and visible learner outcomes.",
    description:
      "We are building products, programs, and communities that help people learn faster and get closer to meaningful work.",
    heroPoints: [
      "Education meets product thinking",
      "High ownership and learner empathy",
      "Work across content, community, and technology",
    ],
    primaryCta: { label: "Contact Us", href: "/contact" },
    secondaryCta: { label: "Read About EDVO", href: "/about" },
    stats: [
      { label: "Open Teams", value: "6" },
      { label: "Hiring Locations", value: "Hybrid + Remote" },
      { label: "Mission", value: "Practical learning" },
      { label: "Culture", value: "Ownership" },
    ],
    spotlight: {
      title: "What we value",
      description: "The team moves best when people care about clarity, speed, and learner trust.",
      items: [
        "Bias toward shipping useful things",
        "Respect for craft and iteration",
        "Strong learner-first decision making",
      ],
    },
    sections: [
      {
        title: "Where people contribute",
        description: "The work spans product, learning, and growth systems.",
        cards: [
          {
            title: "Education and content",
            description: "Design courses, assignments, workshops, and useful explanatory material.",
            meta: "Learning teams",
          },
          {
            title: "Product and engineering",
            description: "Improve the experience across discovery, learning, community, and hiring flows.",
            meta: "Build systems",
          },
          {
            title: "Career and community",
            description: "Support learners through events, reviews, mentorship, and hiring programs.",
            meta: "Learner success",
          },
        ],
      },
    ],
  },
  blog: {
    slug: "blog",
    eyebrow: "Blog",
    title: "One place for business-flavored learning content and practical career reads.",
    description:
      "Use the blog to understand concepts faster, explore industry-style examples, and sharpen how you present your skills to employers.",
    heroPoints: [
      "Short practical reads",
      "Career and interview posts",
      "Analytics, dev, and AI topics",
    ],
    primaryCta: { label: "Open Resource Blog", href: "/resources/blog" },
    secondaryCta: { label: "Browse Guides", href: "/resources/guides" },
    stats: [
      { label: "Readers", value: "90K+" },
      { label: "Posts", value: "240+" },
      { label: "Categories", value: "12" },
      { label: "Weekly Reads", value: "Featured" },
    ],
    spotlight: {
      title: "Start here",
      description: "If you are new, the best entry points are the posts that explain work, not just tools.",
      items: [
        "Business case studies",
        "Skill-building articles",
        "Career positioning guides",
      ],
    },
    sections: [
      {
        title: "Reader favorites",
        description: "Common entry points into the blog ecosystem.",
        cards: [
          {
            title: "How to make dashboards recruiters notice",
            description: "Small improvements that change how your work is perceived.",
            meta: "Portfolio",
          },
          {
            title: "How to explain SQL project impact",
            description: "Translate technical work into business-friendly language.",
            meta: "Interview prep",
          },
          {
            title: "What to learn before GenAI projects",
            description: "A grounded roadmap before you start building flashy demos.",
            meta: "AI basics",
          },
        ],
      },
    ],
  },
  press: {
    slug: "press",
    eyebrow: "Press",
    title: "News, launches, and notable milestones from the EDVO ecosystem.",
    description:
      "Find platform announcements, cohort launch updates, product releases, learner milestones, and partnership highlights.",
    heroPoints: [
      "Product and cohort updates",
      "Partnership announcements",
      "Milestones across learning and hiring",
    ],
    primaryCta: { label: "See Partners", href: "/partners" },
    secondaryCta: { label: "Read About Us", href: "/about" },
    stats: [
      { label: "Announcements", value: "55+" },
      { label: "Launches", value: "18" },
      { label: "Partnerships", value: "30+" },
      { label: "Media Assets", value: "Available on request" },
    ],
    spotlight: {
      title: "What press teams can expect",
      description: "A concise overview of what is happening across the product and learner community.",
      items: [
        "Cohort launches",
        "New challenge and hiring programs",
        "Platform growth and learner stories",
      ],
    },
    sections: [
      {
        title: "Recent themes",
        description: "The announcements we share most often.",
        cards: [
          {
            title: "Flagship cohort launches",
            description: "New live programs across analytics, development, and AI tracks.",
            meta: "Programs",
          },
          {
            title: "Hiring network expansion",
            description: "Partnerships and initiatives that create more learner opportunities.",
            meta: "Careers",
          },
          {
            title: "Product updates",
            description: "Changes to routing, learning flows, and the public-facing experience.",
            meta: "Platform",
          },
        ],
      },
    ],
  },
  partners: {
    slug: "partners",
    eyebrow: "Partners",
    title: "Partner with EDVO across hiring, training, events, and community growth.",
    description:
      "We collaborate with companies, communities, and institutions that care about practical learning and stronger career outcomes.",
    heroPoints: [
      "Hiring and talent partnerships",
      "Workshop and event collaboration",
      "Community and education programs",
    ],
    primaryCta: { label: "Become a Partner", href: "/contact" },
    secondaryCta: { label: "Hire Talent", href: "/hire-talent" },
    stats: [
      { label: "Partners", value: "350+" },
      { label: "Communities", value: "40+" },
      { label: "Institutions", value: "18" },
      { label: "Events Co-hosted", value: "70+" },
    ],
    spotlight: {
      title: "Collaboration models",
      description: "We keep partnerships outcome-oriented and easy to start.",
      items: [
        "Branded challenges",
        "Talent sourcing and hiring drives",
        "Skill-building workshops for communities and campuses",
      ],
    },
    sections: [
      {
        title: "Common partner goals",
        description: "How organizations usually work with us.",
        cards: [
          {
            title: "Talent access",
            description: "Reach learners with stronger project proof and evaluated skill signals.",
            meta: "Hiring",
          },
          {
            title: "Skill development",
            description: "Run hands-on workshops or learning series for internal and external audiences.",
            meta: "Training",
          },
          {
            title: "Brand and community",
            description: "Show up meaningfully in front of ambitious learners and builders.",
            meta: "Ecosystem",
          },
        ],
      },
    ],
  },
  help: {
    slug: "help",
    eyebrow: "Help Center",
    title: "Get unstuck quickly with clear answers and the right next step.",
    description:
      "Use the help center for account issues, course access, cohort support, payments, certificates, and general platform questions.",
    heroPoints: [
      "Account and access support",
      "Payment and certificate help",
      "Course and cohort guidance",
    ],
    primaryCta: { label: "Contact Support", href: "/contact" },
    secondaryCta: { label: "Read FAQ", href: "/faq" },
    stats: [
      { label: "Help Topics", value: "60+" },
      { label: "Resolved Queries", value: "25K+" },
      { label: "Avg First Response", value: "< 24 hrs" },
      { label: "Support Channels", value: "3" },
    ],
    spotlight: {
      title: "Most common support needs",
      description: "Start with the areas learners usually need help with first.",
      items: [
        "Login and registration issues",
        "Course access and recordings",
        "Certificates, invoices, and cohort timing",
      ],
    },
    sections: [
      {
        title: "Support categories",
        description: "Navigate directly to the right problem space.",
        cards: [
          {
            title: "Account support",
            description: "Password resets, email updates, and profile troubleshooting.",
            meta: "Access",
          },
          {
            title: "Learning support",
            description: "Course navigation, recordings, assignments, and live session questions.",
            meta: "Course help",
          },
          {
            title: "Payments and certificates",
            description: "Invoices, plan confirmation, refunds, and certificate timelines.",
            meta: "Operations",
          },
        ],
      },
    ],
  },
  contact: {
    slug: "contact",
    eyebrow: "Contact",
    title: "Reach the EDVO team for support, partnerships, or enrollment help.",
    description:
      "Whether you are a learner, hiring partner, or business team, this is the fastest way to get routed to the right conversation.",
    heroPoints: [
      "Support, sales, and partnership queries",
      "Fast routing to the right team",
      "Useful for learners and companies alike",
    ],
    primaryCta: { label: "Email Support", href: "mailto:support@edvo.in" },
    secondaryCta: { label: "View Help Center", href: "/help" },
    stats: [
      { label: "Support Email", value: "support@edvo.in" },
      { label: "Business Email", value: "partners@edvo.in" },
      { label: "Response Window", value: "24 hrs" },
      { label: "Availability", value: "Mon-Sat" },
    ],
    spotlight: {
      title: "How to reach us faster",
      description: "Sharing the right context helps the team resolve things quickly.",
      items: [
        "Mention your registered email",
        "Include course or cohort name if relevant",
        "Add screenshots for access or payment issues",
      ],
    },
    sections: [
      {
        title: "Common contact reasons",
        description: "The kinds of requests we handle most often.",
        cards: [
          {
            title: "Enrollment guidance",
            description: "Help choosing the right track, plan, or cohort based on your goals.",
            meta: "Admissions",
          },
          {
            title: "Business and partnerships",
            description: "Training, hiring, events, and ecosystem collaboration requests.",
            meta: "Partnerships",
          },
          {
            title: "Account and access issues",
            description: "Troubleshoot login, payment, certificate, or dashboard concerns.",
            meta: "Support",
          },
        ],
      },
    ],
    faqs: [
      {
        question: "Where should hiring teams reach out?",
        answer: "Use the contact route for now and mention hiring in the message so the request is routed correctly.",
      },
      {
        question: "How fast does support reply?",
        answer: "Typical first response is within 24 hours during the standard support window.",
      },
    ],
  },
  privacy: {
    slug: "privacy",
    eyebrow: "Privacy Policy",
    title: "A simple privacy overview for learners, visitors, and hiring partners.",
    description:
      "EDVO collects the minimum information needed to operate accounts, learning workflows, support, and partner-facing experiences responsibly.",
    heroPoints: [
      "Account and activity data handling",
      "Operational and support usage",
      "Clear boundaries on platform use",
    ],
    primaryCta: { label: "Contact Us", href: "/contact" },
    secondaryCta: { label: "Read Terms", href: "/terms" },
    stats: [
      { label: "Policy Scope", value: "Users + visitors" },
      { label: "Use Cases", value: "Learning + support" },
      { label: "Consent Areas", value: "Account and communication" },
      { label: "Control", value: "Request-based" },
    ],
    spotlight: {
      title: "Plain-language summary",
      description: "This page is a product-style overview, not a replacement for legal review.",
      items: [
        "We use user information to deliver the platform and support services",
        "We limit access internally to operational needs",
        "Users can contact support for account-related privacy concerns",
      ],
    },
    sections: [
      {
        title: "Key policy areas",
        description: "The practical topics users usually care about most.",
        cards: [
          {
            title: "Account information",
            description: "Basic details like name, email, and enrollment status are used to provide access and support.",
            meta: "Identity and access",
          },
          {
            title: "Usage information",
            description: "Learning activity and engagement data help improve the experience and troubleshoot issues.",
            meta: "Platform operations",
          },
          {
            title: "Communications",
            description: "Important course, payment, and support updates may be sent through registered channels.",
            meta: "Notifications",
          },
        ],
      },
    ],
  },
  terms: {
    slug: "terms",
    eyebrow: "Terms of Service",
    title: "Clear platform rules so learners and partners know what to expect.",
    description:
      "These terms summarize acceptable platform usage, access expectations, account responsibilities, and general service boundaries.",
    heroPoints: [
      "Account responsibility basics",
      "Learning access and acceptable use",
      "General limits and expectations",
    ],
    primaryCta: { label: "Need Help?", href: "/help" },
    secondaryCta: { label: "Contact EDVO", href: "/contact" },
    stats: [
      { label: "Applies To", value: "All users" },
      { label: "Focus", value: "Platform use" },
      { label: "Updates", value: "As product evolves" },
      { label: "Questions", value: "Handled by support" },
    ],
    spotlight: {
      title: "In plain words",
      description: "Use the platform responsibly, protect your account, and respect content and community guidelines.",
      items: [
        "Keep account credentials secure",
        "Do not misuse course or community access",
        "Use official support channels when issues arise",
      ],
    },
    sections: [
      {
        title: "Core expectations",
        description: "The most important boundaries for normal usage.",
        cards: [
          {
            title: "Account integrity",
            description: "Users are responsible for activity under their account and should keep login details protected.",
            meta: "Security",
          },
          {
            title: "Content usage",
            description: "Platform materials are meant for enrolled or authorized use as defined by the plan and program.",
            meta: "Access rights",
          },
          {
            title: "Respectful participation",
            description: "Community, workshop, and challenge participation should remain professional and constructive.",
            meta: "Community conduct",
          },
        ],
      },
    ],
  },
  faq: {
    slug: "faq",
    eyebrow: "FAQ",
    title: "Quick answers to the questions learners ask most often.",
    description:
      "Start here for common questions about courses, plans, access, recordings, support, certificates, and career outcomes.",
    heroPoints: [
      "Course and cohort basics",
      "Payments and upgrades",
      "Certificates and career support",
    ],
    primaryCta: { label: "Open Help Center", href: "/help" },
    secondaryCta: { label: "Contact Support", href: "/contact" },
    stats: [
      { label: "FAQ Topics", value: "40+" },
      { label: "Most Read", value: "Access and payments" },
      { label: "Support Escalation", value: "Available" },
      { label: "Useful For", value: "All learners" },
    ],
    spotlight: {
      title: "Best place to start",
      description: "If you are unsure about a plan, course format, or support path, these answers usually cover the basics.",
      items: [
        "How learning access works",
        "What is included in premium support",
        "How certificates and recordings are handled",
      ],
    },
    sections: [
      {
        title: "Frequently asked areas",
        description: "The categories users ask about every day.",
        cards: [
          {
            title: "Plans and pricing",
            description: "What changes between self-paced, live, and premium support tracks.",
            meta: "Before purchase",
          },
          {
            title: "Learning access",
            description: "How long recordings, materials, and sessions remain available.",
            meta: "During learning",
          },
          {
            title: "Career support",
            description: "What guidance, mocks, and hiring-oriented help are part of selected tracks.",
            meta: "Outcomes",
          },
        ],
      },
    ],
    faqs: [
      {
        question: "Do courses include recordings?",
        answer: "Many flagship and live programs include recordings, but exact access duration depends on the specific course or plan.",
      },
      {
        question: "Will I get a certificate?",
        answer: "Yes, courses and cohort programs may include certificates subject to completion requirements for that track.",
      },
      {
        question: "Can beginners start on EDVO?",
        answer: "Yes. Several tracks are built specifically for beginners and early-stage career starters.",
      },
      {
        question: "Is there placement support?",
        answer: "Selected programs include stronger career support such as resume reviews, mock interviews, and hiring guidance.",
      },
    ],
  },
  "courses-ds-gen-ai": {
    slug: "courses/ds-gen-ai",
    eyebrow: "Featured Course",
    title: "Data Science with Generative AI now has a direct landing page too.",
    description:
      "This route backs the announcement bar so users never hit a dead link. From here they can jump into the detailed course experience or explore the full catalog.",
    heroPoints: [
      "Announcement-safe public route",
      "Fast path to flagship course details",
      "Consistent with the rest of the public site",
    ],
    primaryCta: { label: "Browse All Courses", href: "/courses" },
    secondaryCta: { label: "Create Account", href: "/auth/register" },
    stats: [
      { label: "Format", value: "Live + Recorded" },
      { label: "Duration", value: "8 months" },
      { label: "Hiring Partners", value: "350+" },
      { label: "Start Window", value: "March 2026" },
    ],
    spotlight: {
      title: "Why this page exists",
      description:
        "The announcement CTA should always resolve cleanly. This static route ensures users land on a valid page first.",
      items: [
        "No announcement-bar 404s",
        "Strong entry point for flagship program traffic",
        "Easy onward navigation into catalog and registration",
      ],
    },
    sections: [
      {
        title: "Program highlights",
        description: "A quick snapshot before the learner dives deeper.",
        cards: [
          {
            title: "Modern curriculum",
            description: "Python, ML, SQL, MLOps, and GenAI coverage in one guided track.",
            meta: "Core curriculum",
          },
          {
            title: "Mentor support",
            description: "Live sessions, doubt solving, and guided milestones for better consistency.",
            meta: "Support layer",
          },
          {
            title: "Career focus",
            description: "Designed to improve project quality, interview readiness, and job visibility.",
            meta: "Outcome oriented",
          },
        ],
      },
    ],
  },
};

export function getPublicPageConfig(slug: string): MarketingPageConfig {
  const config = publicPageConfigs[slug];

  if (!config) {
    throw new Error(`Missing public page config for slug: ${slug}`);
  }

  return config;
}















