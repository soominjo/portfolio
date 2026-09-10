import type { VercelRequest, VercelResponse } from '@vercel/node'
import Groq from 'groq-sdk'
import { isRateLimited, getClientIp } from './lib/rateLimit'
import { profile } from '../shared/data/profile'
import { experience } from '../shared/data/experience'
import { skillGroups } from '../shared/data/skills'
import { featuredProjects } from '../shared/data/projects'
import type { Project } from '../shared/types/project'

const ASSISTANT_INSTRUCTIONS = `You are a friendly AI assistant on Genessis Contreras's portfolio website.
Your role is to answer questions from recruiters, HR professionals, and visitors who want to learn about Genessis.

Keep answers professional, warm, and concise (2-4 sentences unless more detail is genuinely needed).
Always refer to Genessis in the third person ("he", "Genessis") — you are his assistant, never speak as him.
If asked something completely unrelated to Genessis, politely say you are only here to answer questions about him.
Never make up information that is not listed below.

Format with Markdown. For a broad question (e.g. "tell me about him", "who is Genessis"), respond with a short
one-sentence introduction followed by concise bullet points grouped under bold labels like **Most Recent Role**,
**Skills & Projects**, **Education**, and **Passions**. For narrow, specific questions, answer in plain sentences
without bullets — only use lists when summarizing multiple items.`

const PROJECT_TYPE_LABELS: Record<Project['type'], string> = {
  personal: 'Personal project',
  professional: 'Professional work for an employer or client',
}

function formatProject(project: Project, index: number): string {
  const typeLabel = PROJECT_TYPE_LABELS[project.type]
  return `${index + 1}. ${project.title} (${project.role} — ${typeLabel})\n   ${project.purpose}\n   Tech: ${project.techStack.join(', ')}`
}

function buildKnowledgeBase(): string {
  const educationBlock = profile.education
    .map(edu => `- ${edu.degree}\n  ${edu.school} | ${edu.years}${edu.honors ? ` | ${edu.honors}` : ''}`)
    .join('\n')

  const experienceBlock = experience
    .map((item, i) => {
      const highlights = item.highlights.map(h => `   - ${h}`).join('\n')
      return `${i + 1}. ${item.role} — ${item.company} (${item.year})\n${highlights}`
    })
    .join('\n\n')

  const skillsBlock = skillGroups.map(group => `${group.category}: ${group.skills.join(', ')}`).join('\n')

  const engineeringProjects = featuredProjects.filter(p => p.category === 'engineering').sort((a, b) => a.order - b.order)
  const qaProjects = featuredProjects.filter(p => p.category === 'qa').sort((a, b) => a.order - b.order)

  const certificationsBlock = profile.certifications.map(c => `- ${c}`).join('\n')

  return `=== ABOUT GENESSIS ===
Full Name: ${profile.name}
Nickname: Gens
Location: ${profile.location}, Philippines
Email: ${profile.email}
Phone: ${profile.phone}
Most Recent Role: ${profile.title} at Hytel Pte Ltd. (March 2026 - September 2026) — this role has ended.
Status: Not currently employed; actively open to new opportunities. Never describe him as currently working at Hytel.
Note: Project links and live demos are not shared publicly — several projects are still in progress or private. Do not invent URLs.

=== EDUCATION ===
${educationBlock}

=== WORK EXPERIENCE ===
${experienceBlock}

=== TECHNICAL SKILLS ===
${skillsBlock}

=== ENGINEERING PROJECTS ===
${engineeringProjects.map(formatProject).join('\n\n')}

=== QA ENGINEERING PROJECTS ===
${qaProjects.map(formatProject).join('\n\n')}

=== CERTIFICATIONS ===
${certificationsBlock}

=== PERSONALITY & STRENGTHS ===
Genessis is a driven, detail-oriented engineer who brings a QA mindset to everything he builds.
He is passionate about AI integration, building reliable software, and bridging the gap between complex technical systems and end-users.
He was promoted quickly at Inner SPARC based on merit and most recently shipped cutting-edge AI features at Hytel, collaborating closely with product managers and fellow developers.
He graduated with Honors in Information Technology and has strong cross-functional experience spanning frontend, backend, QA, and AI.`
}

const SYSTEM_PROMPT = `${ASSISTANT_INSTRUCTIONS}\n\n${buildKnowledgeBase()}`

// Groq retired llama-3.1-8b-instant on 2026-08-16 and recommends openai/gpt-oss-20b.
// Override with GROQ_MODEL in the environment when Groq deprecates the next one.
const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-20b'
const GROQ_MODEL = process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL

const MAX_COMPLETION_TOKENS = 1024

const CLIENT_ERROR_MESSAGE = 'The assistant is temporarily unavailable. Please try again in a moment.'

interface ChatMessage {
  role: 'user' | 'model'
  content: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  if (isRateLimited(`chat:${getClientIp(req)}`, 20, 5 * 60 * 1000)) {
    return res.status(429).json({ success: false, error: 'Too many requests. Please slow down and try again shortly.' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    console.error('[/api/chat] GROQ_API_KEY is not set')
    return res.status(500).json({ success: false, error: 'Chatbot not configured' })
  }

  const { message, messages } = req.body ?? {}

  if (typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'Invalid input' })
  }

  if (message.trim().length > 500) {
    return res.status(400).json({ success: false, error: 'Message too long' })
  }

  try {
    const groq = new Groq({ apiKey })

    const history = Array.isArray(messages)
      ? messages
          .filter((m: ChatMessage) => m.role === 'user' || m.role === 'model')
          .map((m: ChatMessage) => ({
            role: m.role === 'model' ? 'assistant' : 'user' as 'user' | 'assistant',
            content: m.content,
          }))
      : []

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: message.trim() },
      ],
      // gpt-oss is a reasoning model: keep its hidden reasoning short so the
      // token budget goes to the visible answer, and never return the reasoning.
      reasoning_effort: 'low',
      include_reasoning: false,
      max_completion_tokens: MAX_COMPLETION_TOKENS,
    })

    const choice = completion.choices[0]
    const reply = choice?.message?.content?.trim() ?? ''

    if (!reply) {
      console.error('[/api/chat] Empty reply from Groq', {
        model: GROQ_MODEL,
        finishReason: choice?.finish_reason,
        usage: completion.usage,
      })
      return res.status(502).json({ success: false, error: CLIENT_ERROR_MESSAGE })
    }

    return res.status(200).json({ success: true, reply })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    // Log the upstream detail server-side only; never echo provider errors to visitors.
    console.error(`[/api/chat] Groq error (model=${GROQ_MODEL}):`, msg)
    return res.status(500).json({ success: false, error: CLIENT_ERROR_MESSAGE })
  }
}
