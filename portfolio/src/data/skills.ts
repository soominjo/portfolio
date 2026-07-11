export interface SkillGroup {
  category: string
  icon: string
  skills: string[]
}

export const skillGroups: SkillGroup[] = [
  {
    category: 'Frontend',
    icon: '⬡',
    skills: [
      'React',
      'Next.js',
      'Flutter',
      'Dart',
      'TanStack Query',
      'Zustand',
      'Shadcn UI',
      'TypeScript',
      'Tailwind CSS',
      'Google Stitch',
      'Framer Motion',
      'Vite',
    ],
  },
  {
    category: 'Backend',
    icon: '◈',
    skills: [
      'Node.js',
      'tRPC',
      'Zod',
      'Firebase / Firestore',
      'MySQL / Cloud SQL',
      'Python',
      'Django / Laravel / PHP',
    ],
  },
  {
    category: 'AI & Data',
    icon: '◎',
    skills: ['Genkit', 'Gemini', 'RAG Pipelines', 'LLM Integration', 'Hugging Face', 'Computer Vision', 'Vectorization'],
  },
  {
    category: 'QA & DevOps',
    icon: '◇',
    skills: [
      'Turborepo / pnpm',
      'Git',
      'GitHub Actions',
      'GitHub Desktop',
      'CI/CD',
      'Google Cloud / Firebase CLI',
      'Playwright',
      'Vitest',
      'Figma',
      'Vercel',
    ],
  },
]
