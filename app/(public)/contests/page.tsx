import { createClient } from '@/lib/supabase/server'
import ContestCard from '@/components/ContestCard'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default async function ContestsPage() {
  const supabase = await createClient()
  const { data: contests } = await supabase
    .from('contests')
    .select('*')
    .in('status', ['active', 'upcoming'])
    .order('created_at', { ascending: false })

  return (
    <div className="py-16">
      <div className="container-page">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-[var(--font-display)] font-extrabold">Текущие конкурсы</h1>
          <p className="mt-4 text-[rgba(15,23,42,0.70)]">
            Выберите конкурс, отправьте работу и скачайте сертификат или диплом призёра после модерации. Участие полностью онлайн.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {(contests ?? []).map((contest: any) => <ContestCard key={contest.id} contest={contest} />)}
        </div>

        {!contests?.length && (
          <div className="mt-12 card p-8 text-center">
            <div className="text-lg font-semibold">Сейчас нет активных конкурсов</div>
            <Link href="/" className="mt-4 inline-flex items-center gap-2 btn-secondary">На главную <ArrowRight className="w-4 h-4" /></Link>
          </div>
        )}
      </div>
    </div>
  )
}
