import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CourseSignup from '@/components/CourseSignup'
import { CalendarDays, MapPin, Monitor } from 'lucide-react'

export default async function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (!course) return notFound()

  const formats = (course as any).formats as string[] | null
  const available = formats && formats.length ? formats : [course.format]

  return (
    <div className="container-page py-12">
      <div className="mb-8">
        <Link href="/courses" className="text-[var(--primary)] font-semibold hover:underline">
          ← Все курсы
        </Link>
      </div>

      <div className="card p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="font-[var(--font-display)] text-4xl md:text-5xl leading-[1.05]">{course.title}</h1>
            <p className="mt-4 text-slate-700 text-lg leading-relaxed">{course.description}</p>
          </div>

          <div className="shrink-0 flex flex-col gap-3">
            <a href="#signup" className="btn-primary text-center">
              Записаться
            </a>
            <div className="flex flex-wrap gap-2">
              {available.includes('online') && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200">
                  🖥 Онлайн
                </span>
              )}
              {available.includes('offline') && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold bg-slate-50 text-slate-700 border-slate-200">
                  🏫 Оффлайн
                </span>
              )}
              <span
                className={
                  course.price_type === 'free'
                    ? 'inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold bg-amber-50 text-amber-800 border-amber-200'
                }
              >
                {course.price_type === 'free' ? '💚 Бесплатно' : `💎 Платно${course.price ? ` • ${course.price} ₽` : ''}`}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4 text-sm text-slate-700">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 font-semibold">
              {available.includes('online') && !available.includes('offline') ? <Monitor className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
              Формат
            </div>
            <p className="mt-2 text-slate-600">
              {available.includes('online') && available.includes('offline')
                ? 'Онлайн или оффлайн — выбираете при записи'
                : available.includes('online')
                  ? 'Онлайн'
                  : 'Оффлайн'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 font-semibold">
              <CalendarDays className="w-4 h-4" />
              Даты
            </div>
            <p className="mt-2 text-slate-600">
              {course.starts_at ? course.starts_at : '—'}
              {course.ends_at ? ` → ${course.ends_at}` : ''}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 font-semibold">
              <MapPin className="w-4 h-4" />
              Локация (для оффлайн)
            </div>
            <p className="mt-2 text-slate-600">{course.location || '—'}</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <CourseSignup course={course as any} />
      </div>
    </div>
  )
}
