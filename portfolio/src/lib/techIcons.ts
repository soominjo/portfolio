import {
  siDart,
  siDjango,
  siFigma,
  siFirebase,
  siFlutter,
  siFramer,
  siGit,
  siGithub,
  siGithubactions,
  siGooglecloud,
  siGooglegemini,
  siHtml5,
  siHuggingface,
  siLaravel,
  siMapbox,
  siMysql,
  siNextdotjs,
  siNodedotjs,
  siPhp,
  siPnpm,
  siPython,
  siReact,
  siReactquery,
  siSanity,
  siShadcnui,
  siSqlite,
  siTailwindcss,
  siTrpc,
  siTurborepo,
  siTypescript,
  siVercel,
  siVite,
  siVitest,
  siZod,
  type SimpleIcon,
} from 'simple-icons'

/** A brand mark from Simple Icons (CC0): a 24×24 SVG path and its brand colour. */
export interface TechIcon {
  readonly title: string
  /** Brand colour as six hex digits, without the leading #. */
  readonly hex: string
  /** SVG path data for a 0 0 24 24 viewBox. */
  readonly path: string
}

// Names exactly as shared/data writes them. Simple Icons has no mark for
// Playwright, Zustand, Genkit or Google Stitch, and concepts such as
// "RAG Pipelines" have none either, so those names return null.
const MARKS: ReadonlyArray<readonly [name: string, icon: SimpleIcon]> = [
  // Web and mobile
  ['React', siReact],
  ['Next.js', siNextdotjs],
  ['Flutter', siFlutter],
  ['Dart', siDart],
  ['TanStack Query', siReactquery],
  ['Shadcn UI', siShadcnui],
  ['TypeScript', siTypescript],
  ['Tailwind CSS', siTailwindcss],
  ['Framer Motion', siFramer],
  ['Vite', siVite],
  ['HTML', siHtml5],
  // Back end and data
  ['Node.js', siNodedotjs],
  ['tRPC', siTrpc],
  ['Zod', siZod],
  ['Firebase', siFirebase],
  ['Firebase / Firestore', siFirebase],
  ['Firebase CLI', siFirebase],
  ['MySQL', siMysql],
  ['MySQL / Cloud SQL', siMysql],
  ['Cloud SQL', siGooglecloud],
  ['SQLite', siSqlite],
  ['Python', siPython],
  ['Django', siDjango],
  ['Laravel', siLaravel],
  ['PHP', siPhp],
  ['Sanity', siSanity],
  ['Mapbox', siMapbox],
  // AI
  ['Gemini', siGooglegemini],
  ['Gemini LLMs', siGooglegemini],
  ['Hugging Face', siHuggingface],
  ['Google Vertex AI', siGooglecloud],
  ['Cloud Vision OCR', siGooglecloud],
  // Tooling, cloud and delivery
  ['Google Cloud', siGooglecloud],
  ['Turborepo', siTurborepo],
  ['pnpm', siPnpm],
  ['Git', siGit],
  ['GitHub', siGithub],
  ['GitHub Actions', siGithubactions],
  ['GitHub Desktop', siGithub],
  ['Vitest', siVitest],
  ['Figma', siFigma],
  ['Vercel', siVercel],
]

function normalizeName(name: string): string {
  return name.trim().toLowerCase()
}

const LOOKUP: ReadonlyMap<string, TechIcon> = new Map(
  MARKS.map(([name, icon]) => [
    normalizeName(name),
    Object.freeze({ title: icon.title, hex: icon.hex, path: icon.path }),
  ]),
)

/** The brand mark for a tool or service name, or null when there is none. */
export function getTechIcon(name: string): TechIcon | null {
  return LOOKUP.get(normalizeName(name)) ?? null
}
