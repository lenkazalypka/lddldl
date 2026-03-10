import Link from 'next/link'
import { Calendar, Users, Trophy } from 'lucide-react'
import { AUDIENCE_UI, normalizeAudiences, type AudienceKey } from '@/lib/audience'

type ContestStatus = 'active' | 'upcoming' | 'finished'

export interface ContestCardData {
  id: string
  title: string
  description: string
  cover_url?: string | null
  coverUrl?: string | null
  start_date?: string
  startDate?: string
  end_date?: string
  endDate?: string
  status: ContestStatus
  audiences?: AudienceKey[] | string[] | null
  participant_count?: number | null
  participantCount?: number | null
}

interface ContestCardProps {
  contest?: ContestCardData
  id?: string
  title?: string
  description?: string
  coverUrl?: string | null
  startDate?: string
  endDate?: string
  status?: ContestStatus
  participantCount?: number
  audiences?: AudienceKey[] | string[] | null
}

const statusUI: Record<ContestStatus, { label: string; tone: string }> = {
  active: { label: 'Идёт сейчас', tone: 'bg-[rgba(30,64,175,0.10)] text-[var(--primary)] border-[rgba(30,64,175,0.18)]' },
  upcoming: { label: 'Скоро', tone: 'bg-[rgba(245,158,11,0.12)] text-[var(--accent)] border-[rgba(245,158,11,0.20)]' },
  finished: { label: 'Завершён', tone: 'bg-[rgba(15,23,42,0.06)] text-[rgba(15,23,42,0.70)] border-[rgba(15,23,42,0.12)]' },
}

function fmt(dateStr?: string) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })
  } catch {
    return dateStr
  }
}

export default function ContestCard(props: ContestCardProps) {
  const contest = props.contest
  const id = contest?.id ?? props.id ?? ''
  const title = contest?.title ?? props.title ?? 'Конкурс'
  const description = contest?.description ?? props.description ?? 'Подробности скоро появятся.'
  const coverUrl = contest?.coverUrl ?? contest?.cover_url ?? props.coverUrl ?? null
  const startDate = contest?.startDate ?? contest?.start_date ?? props.startDate
  const endDate = contest?.endDate ?? contest?.end_date ?? props.endDate
  const status = contest?.status ?? props.status ?? 'upcoming'
  const participantCount = contest?.participantCount ?? contest?.participant_count ?? props.participantCount ?? 0
  const aud = normalizeAudiences(contest?.audiences ?? props.audiences)
  const ui = statusUI[status]

  return (
    <Link href={`/contests/${id}`} className="block h-full">
      <article className="card card-hover h-full overflow-hidden">
        <div className="h-1.5 w-full bg-[linear-gradient(90deg,var(--primary),var(--primary2))]" />
        <div className="p-5 flex h-full flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-[var(--font-display)] text-lg md:text-xl leading-snug line-clamp-2">{title}</h3>
              <p className="mt-1 text-sm text-[rgba(15,23,42,0.72)] line-clamp-3">{description}</p>
            </div>
            <span className={`shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold ${ui.tone}`}>
              <Trophy className="w-3.5 h-3.5" />
              {ui.label}
            </span>
          </div>

          {coverUrl ? (
            <div className="rounded-2xl overflow-hidden border border-[var(--border)] bg-[rgba(15,23,42,0.02)]">
              <img src={coverUrl} alt={title} className="w-full h-40 object-cover" loading="lazy" />
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--border)] bg-[linear-gradient(135deg,rgba(30,64,175,0.10),rgba(59,130,246,0.06))] h-40 flex items-center justify-center">
              <div className="flex items-center gap-2 text-[rgba(30,64,175,0.85)]">
                <Trophy className="w-5 h-5" />
                <span className="text-sm font-semibold">Открыт набор участников</span>
              </div>
            </div>
          )}

          {aud.length ? (
            <div className="flex flex-wrap items-center gap-2">
              {aud.map((a) => {
                const chip = AUDIENCE_UI[a]
                return <span key={a} className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${chip.tone}`}>{chip.label}</span>
              })}
            </div>
          ) : null}

          <div className="mt-auto flex items-center justify-between gap-3 text-sm text-[rgba(15,23,42,0.72)]">
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{fmt(startDate)} — {fmt(endDate)}</span></div>
            <div className="flex items-center gap-2"><Users className="w-4 h-4" /><span>{participantCount}</span></div>
          </div>

          <div className="pt-1"><div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">Подробнее <span aria-hidden className="translate-y-[1px]">→</span></div></div>
        </div>
      </article>
    </Link>
  )
}
