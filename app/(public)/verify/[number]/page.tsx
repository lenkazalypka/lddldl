import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BadgeCheck, ArrowRight, Trophy } from 'lucide-react'

export default async function VerifyPage({ params }: { params: { number: string } }) {
  const admin = createAdminClient()
  const certNumber = decodeURIComponent(params.number)

  const { data: doc } = await admin
    .from('contest_documents')
    .select('work_id, certificate_number, issued_at, award')
    .eq('certificate_number', certNumber)
    .maybeSingle()

  if (!doc) notFound()

  const { data: work } = await admin
    .from('contest_photos')
    .select('id, approved, name, surname_initial, age, city, work_title, place, nomination, contests(title)')
    .eq('id', doc.work_id)
    .single()

  if (!work || !work.approved) notFound()
  const isPrize = work.place !== null && [1, 2, 3].includes(work.place as any)

  return (
    <div className="py-16">
      <div className="container-page max-w-3xl">
        <div className="card p-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold bg-white">
            <BadgeCheck className="w-4 h-4 text-[var(--accent)]" />
            Документ действителен
          </div>

          <h1 className="mt-5 text-2xl md:text-3xl font-[var(--font-display)] font-extrabold">Проверка документа</h1>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-5"><div className="text-xs font-bold text-[rgba(15,23,42,0.55)]">НОМЕР</div><div className="mt-1 font-extrabold">{doc.certificate_number}</div></div>
            <div className="card p-5"><div className="text-xs font-bold text-[rgba(15,23,42,0.55)]">ТИП</div><div className="mt-1 font-extrabold">{isPrize ? 'Диплом призёра' : 'Сертификат участника'}</div></div>
            <div className="card p-5"><div className="text-xs font-bold text-[rgba(15,23,42,0.55)]">УЧАСТНИК</div><div className="mt-1 font-extrabold">{work.name} {work.surname_initial}.</div><div className="mt-1 text-sm text-[rgba(15,23,42,0.70)]">{work.age} лет • {work.city}</div></div>
            <div className="card p-5"><div className="text-xs font-bold text-[rgba(15,23,42,0.55)]">КОНКУРС</div><div className="mt-1 font-extrabold">{(work as any).contests?.title ?? '—'}</div><div className="mt-1 text-sm text-[rgba(15,23,42,0.70)]">{work.work_title ? `«${work.work_title}»` : ''}</div></div>
          </div>

          {isPrize && (
            <div className="mt-4 card p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Trophy className="w-4 h-4 text-[var(--accent)]" />
                {work.place} место{work.nomination ? ` • ${work.nomination}` : ''}
              </div>
            </div>
          )}

          {doc.issued_at ? <div className="mt-4 text-sm text-[rgba(15,23,42,0.6)]">Дата выдачи: {new Date(doc.issued_at).toLocaleDateString('ru-RU')}</div> : null}

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/contests" className="btn-primary inline-flex items-center justify-center gap-2">Конкурсы <ArrowRight className="w-4 h-4" /></Link>
            <Link href="/" className="btn-secondary inline-flex items-center justify-center gap-2">На главную <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </div>
    </div>
  )
}
