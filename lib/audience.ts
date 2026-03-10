export type AudienceKey = 'kids_u7' | 'school' | 'students' | 'adults' | 'all'

export const AUDIENCE_UI: Record<AudienceKey, { label: string; tone: string }> = {
  kids_u7:   { label: '👶 Дети до 7',     tone: 'bg-[rgba(59,130,246,0.10)] text-[rgba(30,64,175,0.95)] border-[rgba(59,130,246,0.20)]' },
  school:    { label: '🎒 Школьники',     tone: 'bg-[rgba(30,64,175,0.10)] text-[var(--primary)] border-[rgba(30,64,175,0.18)]' },
  students:  { label: '🎓 Студенты',      tone: 'bg-[rgba(99,102,241,0.10)] text-[rgba(67,56,202,0.95)] border-[rgba(99,102,241,0.22)]' },
  adults:    { label: '🧑 Взрослые',       tone: 'bg-[rgba(15,23,42,0.06)] text-[rgba(15,23,42,0.72)] border-[rgba(15,23,42,0.12)]' },
  all:       { label: '🌍 Все желающие',  tone: 'bg-[rgba(245,158,11,0.12)] text-[rgba(146,64,14,0.95)] border-[rgba(245,158,11,0.22)]' },
}

export function normalizeAudiences(raw: unknown): AudienceKey[] {
  const allowed: AudienceKey[] = ['kids_u7','school','students','adults','all']
  if (!Array.isArray(raw)) return ['all']
  const cleaned = raw.filter((x): x is AudienceKey => typeof x === 'string' && (allowed as string[]).includes(x))
  if (cleaned.includes('all')) return ['all']
  return cleaned.length ? cleaned : ['all']
}
