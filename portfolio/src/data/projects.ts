import type { Project } from '../types/project'

export const featuredProjects: Project[] = [
  {
    id: 'maneho-ai',
    title: 'Maneho.ai',
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
]
