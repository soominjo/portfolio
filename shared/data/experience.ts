import type { Experience } from '../types/experience'

export const experience: Experience[] = [
  {
    id: 'hytel',
    year: 'March 2026 - September 2026',
    role: 'Junior Software Engineer',
    company: 'Hytel Pte Ltd.',
    current: false,
    highlights: [
      'Collaborated cross-functionally — partnered with product managers, designers, and backend developers to scope, build, and ship frontend and backend features for a mobile-first platform, delivering React web interfaces and Flutter/Dart mobile screens backed by Node and Firestore/Cloud SQL.',
      'Engineered RAG systems & AI integrations — built Retrieval-Augmented Generation pipelines by chunking and vectorizing LTO regulatory documents to power a traffic-law AI assistant, and shipped an AI-powered "fine ticket decoder" that analyzes uploaded citations via computer vision.',
      'Drove quality across enterprise projects — started in cross-functional QA, tracking and triaging bugs through proprietary ticketing software and hardening CI/CD pipelines, before transitioning into full-stack engineering.',
    ],
    techStack: ['React', 'Node.js', 'Firebase / Firestore', 'MySQL / Cloud SQL', 'Flutter', 'Dart', 'RAG Pipelines', 'LLM Integration', 'CI/CD'],
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
