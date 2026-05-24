/**
 * Seeds the Firestore 'projects' collection with Genessis's portfolio projects.
 *
 * Prerequisites — add these to your .env (from Firebase Console > Project Settings > Service accounts):
 *   FIREBASE_PROJECT_ID=portfolio-e2652
 *   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@portfolio-e2652.iam.gserviceaccount.com
 *   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
 *
 * Run: npm run seed
 */

import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env') })

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const db = getFirestore()

const projects = [
  {
    title: 'Maneho.ai',
    purpose:
      'An AI-powered legal traffic assistant that decodes uploaded citations using Cloud Vision OCR and delivers context-aware legal reasoning powered by Gemini LLMs and Vertex AI vector search.',
    role: 'Full-Stack Developer',
    techStack: ['React', 'Firebase', 'Google Vertex AI', 'Cloud Vision OCR', 'Gemini LLMs'],
    liveUrl: '',
    githubUrl: '',
    order: 1,
    isFeatured: true,
  },
  {
    title: 'Commission Monitoring System',
    purpose:
      'A full-featured real estate platform automating tranche generation, commission calculations, and receivables tracking. Deployed to 128 users at Inner SPARC Realty, boosting operational efficiency by 30%.',
    role: 'Full-Stack Developer',
    techStack: ['Python', 'Django', 'SQLite', 'Tailwind CSS'],
    liveUrl: '',
    githubUrl: '',
    order: 2,
    isFeatured: true,
  },
  {
    title: 'Flux — Fitness Tracker',
    purpose:
      'A comprehensive health-tracking web application managing both frontend and backend environments, enabling users to log workouts, monitor progress, and visualize health data.',
    role: 'Full-Stack Developer',
    techStack: ['React', 'TypeScript', 'Node.js', 'Firebase'],
    liveUrl: '',
    githubUrl: '',
    order: 3,
    isFeatured: true,
  },
  {
    title: 'BrighterMind',
    purpose:
      'A capstone mental health web platform offering interactive coping techniques and activities to help students manage anxiety, built with a focus on accessibility and user wellbeing.',
    role: 'Full-Stack Developer',
    techStack: ['React', 'Node.js', 'Firebase', 'Tailwind CSS'],
    liveUrl: '',
    githubUrl: '',
    order: 4,
    isFeatured: true,
  },
]

async function seed() {
  console.log('Seeding projects collection...\n')
  for (const project of projects) {
    const ref = await db.collection('projects').add(project)
    console.log(`✓ Added "${project.title}" (id: ${ref.id})`)
  }
  console.log('\nDone! 4 projects added to Firestore.')
  process.exit(0)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
