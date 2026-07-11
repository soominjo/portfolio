import type { Experience } from '../types/experience'

export const experience: Experience[] = [
  {
    id: 'hytel',
    year: 'March 2026 to Current',
    role: 'Junior Software Engineer',
    company: 'Hytel Pte Ltd.',
    current: true,
    highlights: [
      'Full-stack, mobile-first product — building both frontend and backend for a mobile-first platform using React, Node, and Firestore/Cloud SQL on the web, with Flutter and Dart on mobile.',
      'RAG systems & AI integrations — engineered Retrieval-Augmented Generation pipelines by chunking and vectorizing LTO regulatory documents to power a traffic law AI assistant, and built an AI-powered "fine ticket decoder" that analyzes uploaded citations via computer vision.',
      'Started in QA, grew into full-stack AI development — began on cross-functional QA across enterprise projects, tracking bugs through proprietary ticketing software and hardening CI/CD pipelines, before moving into full-stack engineering.',
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
