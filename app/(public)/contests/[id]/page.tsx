import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Trophy, Clock3, BadgeCheck, Mail } from 'lucide-react'

export default async function ContestDetail({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: contest } = await supabase.from('contests').select('*').eq('id', params.id).single()
  if (!contest) notFound()

  const submissionEmail = (contest as any).submission_email || (contest as any).email || null

  return (
    <div className="py-16">
      <div className="container-page max-w-4xl">
        <div className="card overflow-hidden">
          {(contest as any).cover_url ? <img src={(contest as any).cover_url} alt={contest.title} className="w-full h-64 object-cover" /> : null}
          <div className="p-8">
            <div className="flex items-center gap-3 text-sm text-[rgba(15,23,42,0.60)]"><Trophy className="w-4 h-4 text-[var(--accent)]" /> Онлайн-конкурс</div>
            <h1 className="mt-4 text-3xl md:text-4xl font-[var(--font-display)] font-extrabold">{contest.title}</h1>
            <p className="mt-4 text-[rgba(15,23,42,0.75)]">{contest.description}</p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card p-4"><div className="text-sm font-semibold">Проверка</div><div className="mt-1 text-sm text-[rgba(15,23,42,0.70)] flex items-center gap-2"><Clock3 className="w-4 h-4" /> 1–3 дня</div></div>
              <div className="card p-4"><div className="text-sm font-semibold">Документ</div><div className="mt-1 text-sm text-[rgba(15,23,42,0.70)] flex items-center gap-2"><BadgeCheck className="w-4 h-4" /> Сертификат / Диплом I–III</div></div>
              <div className="card p-4"><div className="text-sm font-semibold">Сроки</div><div className="mt-1 text-sm text-[rgba(15,23,42,0.70)]">{new Date((contest as any).start_date).toLocaleDateString('ru-RU')} — {new Date((contest as any).end_date).toLocaleDateString('ru-RU')}</div></div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-lg font-semibold">Как участвовать</div>
                <ol className="mt-3 list-decimal list-inside text-[rgba(15,23,42,0.75)] space-y-2">
                  <li>Подготовьте работу в нужном формате.</li>
                  <li>Отправьте письмо с данными участника и названием работы.</li>
                  <li>Дождитесь проверки модератором.</li>
                  <li>После одобрения откройте личную ссылку и скачайте документ.</li>
                </ol>
              </div>
              <div className="card p-5 bg-[rgba(30,64,175,0.04)]">
                <div className="text-sm font-semibold">Куда отправлять</div>
                {submissionEmail ? (
                  <a href={`mailto:${submissionEmail}`} className="mt-3 inline-flex items-center gap-2 text-[var(--primary)] font-semibold"><Mail className="w-4 h-4" /> {submissionEmail}</a>
                ) : (
                  <div className="mt-3 text-sm text-[rgba(15,23,42,0.6)]">Почта организатора будет добавлена администратором.</div>
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {submissionEmail ? <a href={`mailto:${submissionEmail}`} className="btn-primary inline-flex items-center gap-2">Отправить работу</a> : null}
              <Link href="/contests" className="btn-secondary inline-flex items-center gap-2">Все конкурсы <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
