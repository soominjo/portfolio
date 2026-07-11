import { useEffect, type ReactNode } from 'react'
import { profile } from '../../../shared/data/profile'
import { skillGroups } from '../../../shared/data/skills'
import { useExperience } from '../hooks/useExperience'
import { useProjects } from '../hooks/useProjects'

interface HighlightParts {
  label: string
  detail: string
}

function splitHighlight(highlight: string): HighlightParts {
  const separatorIndex = highlight.indexOf(' — ')
  if (separatorIndex === -1) return { label: '', detail: highlight }
  return {
    label: highlight.slice(0, separatorIndex),
    detail: highlight.slice(separatorIndex + 3),
  }
}

interface SectionProps {
  title: string
  children: ReactNode
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="mb-6 last:mb-0">
      <h2 className="text-xs font-bold tracking-[0.2em] uppercase border-b border-slate-300 pb-1.5 mb-3">
        {title}
      </h2>
      {children}
    </section>
  )
}

export function Resume() {
  const { experience } = useExperience()
  const { projects } = useProjects()
  const engineeringProjects = projects
    .filter(project => project.category === 'engineering')
    .sort((a, b) => a.order - b.order)

  useEffect(() => {
    const timer = setTimeout(() => window.print(), 400)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <style>{`
        @page { size: A4; margin: 14mm; }
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print flex justify-center gap-3 py-4 bg-slate-100 border-b border-slate-200 sticky top-0">
        <button
          onClick={() => window.print()}
          className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors"
        >
          Print / Save as PDF
        </button>
        <a
          href="/"
          className="px-5 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-white transition-colors"
        >
          Back to Portfolio
        </a>
      </div>

      <div className="max-w-4xl mx-auto px-10 py-10 print:px-0 print:py-0">
        {/* Header */}
        <header className="text-center mb-4">
          <h1 className="text-3xl font-bold tracking-wide uppercase">{profile.name}</h1>
          <p className="text-sm font-semibold tracking-[0.25em] uppercase text-slate-600 mt-1.5">
            {profile.title}
          </p>
        </header>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs border-y border-slate-300 py-2.5 mb-6">
          <span>{profile.location}</span>
          <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {profile.linkedinUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
          </a>
          <a href={`mailto:${profile.email}`} className="hover:underline">
            {profile.email}
          </a>
          <span>{profile.phone}</span>
        </div>

        {/* Technical Skills */}
        <Section title="Technical Skills">
          <ul className="space-y-1 text-sm leading-relaxed">
            {skillGroups.map(group => (
              <li key={group.category}>
                <strong>{group.category}:</strong> {group.skills.join(', ')}
              </li>
            ))}
          </ul>
        </Section>

        {/* Work Experience */}
        <Section title="Work Experience">
          <div className="space-y-4">
            {experience.map(item => (
              <div key={item.id}>
                <div className="flex justify-between items-baseline flex-wrap gap-x-3">
                  <h3 className="font-bold text-sm">{item.role}</h3>
                  <span className="text-xs text-slate-600">{item.year}</span>
                </div>
                <p className="text-xs italic text-slate-600 mb-1.5">{item.company}</p>
                <ul className="space-y-1 text-sm leading-relaxed list-disc pl-4">
                  {item.highlights.map(highlight => {
                    const { label, detail } = splitHighlight(highlight)
                    return (
                      <li key={highlight}>
                        {label && <strong>{label}: </strong>}
                        {detail}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* Projects */}
        <Section title="Projects">
          <ul className="space-y-1.5 text-sm leading-relaxed">
            {engineeringProjects.map(project => (
              <li key={project.id}>
                <strong>{project.title}:</strong> {project.purpose}
              </li>
            ))}
          </ul>
        </Section>

        {/* Education */}
        <Section title="Education">
          <ul className="space-y-1.5 text-sm leading-relaxed">
            {profile.education.map(edu => (
              <li key={edu.school}>
                <strong>{edu.degree}</strong> | {edu.school} | {edu.years}
                {edu.honors && <span> — {edu.honors}</span>}
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  )
}
