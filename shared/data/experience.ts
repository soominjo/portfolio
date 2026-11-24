import type { Experience } from '../types/experience'

export const experience: Experience[] = [
  {
    id: 'hytel',
    year: 'March 2026 - Present',
    role: 'Software Engineer',
    company: 'Hytel Pte Ltd.',
    current: true,
    highlights: [
      'Won Hytel its largest project — built the winning prototype in a multi-firm pitch for the next version of Flinki, capturing exactly what the client wanted.',
      "Built Flinki's web and mobile frontend — React and Flutter across the whole product, plus Node backend work, alongside product managers, designers and fellow developers in the Philippines and Zambia.",
      'Integrated payments, wearables and events — connected Stripe, wearable devices and third-party event platforms, and cleaned up the codebase to cut tech debt.',
      'Engineered AI features with RAG and computer vision — a traffic-law assistant grounded in chunked, vectorized LTO regulations, and a fine-ticket decoder that reads uploaded citations.',
    ],
    techStack: ['React', 'TypeScript', 'Flutter', 'Dart', 'Node.js', 'Firebase / Firestore', 'MySQL / Cloud SQL', 'Stripe', 'RAG Pipelines', 'LLM Integration', 'CI/CD'],
  },
  {
    id: 'inner-sparc-realty',
    year: 'March 2025 - March 2026',
    role: 'Full-Stack Developer',
    company: 'Inner SPARC Realty Corporation',
    current: false,
    highlights: [
      'Engineered & scaled core systems — promoted from IT Intern to build a Commission Monitoring System with Python, Django, SQLite, and Tailwind CSS, the centralized repository for company commission vouchers.',
      'Drove efficiency & automation — deployed the platform to 128 users, automating tranche generation, commission calculations, and receivables tracking, boosting operational efficiency by 30%.',
      'Increased user adoption — built interactive reporting dashboards for executives and led training sessions for sales teams, ensuring smooth onboarding.',
    ],
    techStack: ['Python', 'Django', 'SQLite', 'Tailwind CSS'],
  },
]
