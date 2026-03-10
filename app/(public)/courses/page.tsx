import { createClient } from '@/lib/supabase/server'
import CourseCard from '@/components/CourseCard'
import Link from 'next/link'

type SearchParams = { format?: string; price?: string }

const pillBase = 'inline-flex items-center px-3 py-2 rounded-full border text-sm font-semibold transition-colors'

function PillLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={
        active
          ? `${pillBase} bg-[rgba(30,64,175,0.10)] border-[rgba(30,64,175,0.22)] text-[var(--primary)]`
          : `${pillBase} bg-white border-slate-200 text-slate-700 hover:bg-slate-50`
      }
    >
      {children}
    </Link>
  )
}

export default async function CoursesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const format = sp.format === 'online' || sp.format === 'offline' ? sp.format : 'all'
  const price = sp.price === 'free' || sp.price === 'paid' ? sp.price : 'all'

  const supabase = await createClient()
  let q = supabase.from('courses').select('*').eq('status', 'published').order('created_at', { ascending: false })

  // If `formats` exists (V7), filter by array contains. Otherwise fall back to legacy `format`.
  if (format !== 'all') {
    // @ts-ignore
    q = (q as any).contains ? (q as any).contains('formats', [format]) : q.eq('format', format)
  }
  if (price !== 'all') q = q.eq('price_type', price)

  const { data: courses } = await q

  const mk = (next: Partial<SearchParams>) => {
    const params = new URLSearchParams()
    const f = next.format ?? (format === 'all' ? undefined : format)
    const p = next.price ?? (price === 'all' ? undefined : price)
    if (f) params.set('format', f)
    if (p) params.set('price', p)
    const s = params.toString()
    return s ? `/courses?${s}` : '/courses'
  }

  return (
    <div className="container-page py-12">
      <div className="mb-8">
        <h1 className="font-[var(--font-display)] text-4xl md:text-5xl leading-[1.05]">
          Курсы <span className="text-[var(--primary)]">«Вектор будущего»</span>
        </h1>
        <p className="mt-3 text-slate-600 max-w-2xl">
          Отдельная вкладка с курсами: онлайн/оффлайн, бесплатные и платные. Здесь публикуются только актуальные курсы.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <PillLink href={mk({ format: undefined })} active={format === 'all'}>
            Формат: Все
          </PillLink>
          <PillLink href={mk({ format: 'online' })} active={format === 'online'}>
            🖥 Онлайн
          </PillLink>
          <PillLink href={mk({ format: 'offline' })} active={format === 'offline'}>
            🏫 Оффлайн
          </PillLink>

          <span className="mx-2 w-px bg-slate-200" />

          <PillLink href={mk({ price: undefined })} active={price === 'all'}>
            Цена: Все
          </PillLink>
          <PillLink href={mk({ price: 'free' })} active={price === 'free'}>
            💚 Бесплатно
          </PillLink>
          <PillLink href={mk({ price: 'paid' })} active={price === 'paid'}>
            💎 Платно
          </PillLink>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(courses as any[] | null)?.map((c) => (
          <CourseCard key={c.id} course={c as any} />
        ))}
      </div>

      {(!courses || courses.length === 0) && (
        <div className="card p-10 text-center text-slate-600">
          Пока нет опубликованных курсов. Администратор может добавить их в админ‑панели.
        </div>
      )}
    </div>
  )
}
