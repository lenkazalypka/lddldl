import Link from 'next/link'
import { CalendarDays, MapPin, Monitor } from 'lucide-react'

export interface Course {
  id: string
  title: string
  description: string
  format: 'online' | 'offline'
  formats?: string[] | null
  price_type: 'free' | 'paid'
  price: number | null
  location: string | null
  starts_at: string | null
  ends_at: string | null
}

function Pill({ children, tone = 'gray' }: { children: React.ReactNode; tone?: 'gray' | 'blue' | 'green' | 'amber' }) {
  const style: React.CSSProperties =
    tone === 'blue'
      ? { background: 'rgba(30,64,175,0.10)', color: 'var(--primary)', borderColor: 'rgba(30,64,175,0.18)' }
      : tone === 'green'
        ? { background: 'rgba(18,183,106,0.12)', color: '#067647', borderColor: 'rgba(18,183,106,0.22)' }
        : tone === 'amber'
          ? { background: 'rgba(245,158,11,0.12)', color: '#92400E', borderColor: 'rgba(245,158,11,0.22)' }
          : { background: 'rgba(148,163,184,0.14)', color: 'rgba(15,23,42,0.70)', borderColor: 'rgba(148,163,184,0.30)' }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-bold" style={style}>
      {children}
    </span>
  )
}

export default function CourseCard({ course }: { course: Course }) {
  const available = course.formats && course.formats.length ? course.formats : [course.format]
  const hasOnline = available.includes('online')
  const hasOffline = available.includes('offline')
  return (
    <div className="card p-6 hover:-translate-y-1 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-extrabold leading-snug" style={{ color: 'var(--ink)' }}>{course.title}</h3>
          <p className="mt-2 text-sm line-clamp-3" style={{ color: 'rgba(15,23,42,0.68)' }}>{course.description}</p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex flex-wrap justify-end gap-2">
            {hasOnline && <Pill tone="blue">🖥 Онлайн</Pill>}
            {hasOffline && <Pill tone="blue">🏫 Оффлайн</Pill>}
          </div>
          <Pill tone={course.price_type === 'free' ? 'green' : 'amber'}>
            {course.price_type === 'free' ? 'Бесплатно' : `Платно${course.price ? ` • ${course.price} ₽` : ''}`}
          </Pill>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm" style={{ color: 'rgba(15,23,42,0.68)' }}>
        {hasOnline && (
          <span className="inline-flex items-center gap-2">
            <Monitor className="w-4 h-4" /> Онлайн
          </span>
        )}
        {hasOffline && (
          <span className="inline-flex items-center gap-2">
            <MapPin className="w-4 h-4" /> {course.location || 'Оффлайн'}
          </span>
        )}
        <span className="inline-flex items-center gap-2">
          <CalendarDays className="w-4 h-4" />
          {course.starts_at ? course.starts_at : '—'}
          {course.ends_at ? ` → ${course.ends_at}` : ''}
        </span>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-4">
          <Link href={`/courses/${course.id}`} className="text-[var(--primary)] font-semibold hover:underline">
            Подробнее →
          </Link>
          <Link href={`/courses/${course.id}#signup`} className="btn-secondary px-4 py-2">
            Записаться
          </Link>
        </div>
      </div>
    </div>
  )
}
