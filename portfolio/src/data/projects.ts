import type { Project } from '../types/project'

export const featuredProjects: Project[] = [
  // ── Engineering ────────────────────────────────────────────────────────────
  {
    id: 'maneho-ai',
    title: 'Maneho.ai',
    category: 'engineering',
    purpose:
      'An AI-powered legal traffic assistant that decodes uploaded citations using Cloud Vision OCR and delivers context-aware legal reasoning powered by Gemini LLMs and Vertex AI vector search.',
    role: 'Full-Stack Developer',
    techStack: ['React', 'Firebase', 'Google Vertex AI', 'Cloud Vision OCR', 'Gemini LLMs'],
    imageUrl: '/maneho.ai.png',
    liveUrl: '',
    githubUrl: '',
    order: 1,
    isFeatured: true,
  },
  {
    id: 'commission-monitoring-system',
    title: 'Commission Monitoring System',
    category: 'engineering',
    purpose:
      'A full-featured real estate platform automating tranche generation, commission calculations, and receivables tracking. Deployed to 128 users at Inner SPARC Realty, boosting operational efficiency by 30%.',
    role: 'Full-Stack Developer',
    techStack: ['Python', 'Django', 'SQLite', 'Tailwind CSS'],
    imageUrl: '/commission-monitoring-system.jpeg',
    liveUrl: '',
    githubUrl: '',
    order: 2,
    isFeatured: true,
  },
  {
    id: 'flux-fitness-tracker',
    title: 'Flux — Fitness Tracker',
    category: 'engineering',
    purpose:
      'A comprehensive health-tracking web application managing both frontend and backend environments, enabling users to log workouts, monitor progress, and visualize health data.',
    role: 'Full-Stack Developer',
    techStack: ['React', 'TypeScript', 'Node.js', 'Firebase'],
    imageUrl: '/flux.png',
    liveUrl: '',
    githubUrl: '',
    order: 3,
    isFeatured: true,
  },
  {
    id: 'unwnd-cafe',
    title: 'unwnd.cafe',
    category: 'engineering',
    purpose:
      'A cozy café website with a serene aesthetic, featuring a full menu, online ordering flow, and content managed through Sanity CMS — built to reflect the calm, welcoming vibe of the brand.',
    role: 'Full-Stack Developer',
    techStack: ['React', 'TypeScript', 'Node.js', 'Sanity'],
    imageUrl: '/unwnd.cafe.png',
    liveUrl: '',
    githubUrl: '',
    order: 4,
    isFeatured: true,
  },

  // ── QA Engineering ─────────────────────────────────────────────────────────
  {
    id: 'cadpractice',
    title: 'CADpractice',
    category: 'qa',
    purpose:
      'A gamified CAD training platform for STEM educators featuring a growing library of professional 3D modeling challenges. Tested the automated validation engine, instant feedback system, and real-time skills tracking across multiple difficulty levels.',
    role: 'QA Engineer',
    techStack: ['Manual Testing', 'Test Planning', 'Regression Testing', 'UI/UX QA'],
    imageUrl: '/cadpractice.png',
    liveUrl: 'https://www.cadpractice.com/',
    order: 1,
    isFeatured: true,
  },
  {
    id: 'mythica',
    title: 'Mythica',
    category: 'qa',
    purpose:
      'An editorial platform exploring gods, heroes, and legends across world mythologies. Conducted end-to-end testing of content navigation, cross-browser compatibility, responsive layouts, and accessibility across desktop and mobile viewports.',
    role: 'QA Engineer',
    techStack: ['E2E Testing', 'Cross-browser QA', 'Accessibility Testing', 'Mobile QA'],
    imageUrl: '/mythica.png',
    liveUrl: 'https://exploremythica.org/',
    order: 2,
    isFeatured: true,
  },
  {
    id: 'switchboard',
    title: 'Switchboard',
    category: 'qa',
    purpose:
      'An AI-powered project management platform for connecting, routing, and shipping software teams. Tested AI chat context handling, sprint health tracking, blocker detection, and multi-project scoping across user roles.',
    role: 'QA Engineer',
    techStack: ['AI Feature Testing', 'Manual Testing', 'Regression Testing', 'API Testing'],
    imageUrl: '/switchboard.png',
    liveUrl: 'https://app.switchboardpm.ai/login',
    order: 3,
    isFeatured: true,
  },
  {
    id: 'tms',
    title: 'Talent Management System',
    category: 'qa',
    purpose:
      'A comprehensive HR platform managing attendance, skills taxonomy, gap analysis, and payroll for organizations. Validated role-based access controls, skills competency workflows, leaderboard logic, and data integrity across all modules.',
    role: 'QA Engineer',
    techStack: ['Functional Testing', 'RBAC Testing', 'Manual Testing', 'Regression Testing'],
    imageUrl: '/tms.png',
    liveUrl: 'https://tms-prod-10a31.web.app/',
    order: 4,
    isFeatured: true,
  },
]
