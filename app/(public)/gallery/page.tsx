import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export default async function GalleryPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contest_photos')
    .select('id, image_url, work_title, name, surname_initial, age, city, uploaded_at, contest_id, contests(title)')
    .eq('approved', true)
    .order('uploaded_at', { ascending: false })
    .limit(60)

  // Images are stored in a private bucket. We generate signed URLs on the server.
  const admin = createAdminClient()
  const paths = (data ?? [])
    .map((x: any) => (x.image_url as string | null) ?? null)
    .filter((u: any): u is string => Boolean(u) && !u.startsWith('http'))

  const signedMap: Record<string, string> = {}
  await Promise.all(
    paths.map(async (p) => {
      const { data: s } = await admin.storage.from('contest-photos').createSignedUrl(p, 60 * 30)
      if (s?.signedUrl) signedMap[p] = s.signedUrl
    })
  )

  const items = (data ?? []).map((x: any) => ({
    id: x.id as string,
    image_url: (!String(x.image_url).startsWith('http') ? signedMap[x.image_url as string] : x.image_url) as string,
    work_title: x.work_title as string | null,
    name: x.name as string,
    surname_initial: x.surname_initial as string,
    age: x.age as number,
    city: x.city as string,
    uploaded_at: x.uploaded_at as string,
    contest_id: x.contest_id as string,
    contest_title: x.contests?.title as string | undefined,
  }))

  return (
    <main className="container-page py-10">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-3xl sm:text-4xl font-[var(--font-display)] font-extrabold tracking-tight">
            Галерея работ
          </h1>
          <p className="mt-2 text-[rgba(15,23,42,0.72)] max-w-2xl">
            Здесь — опубликованные работы участников. Чтобы попасть в галерею, отправьте работу на почту конкурса и дождитесь модерации.
          </p>
          {error ? (
            <p className="mt-3 text-sm text-red-600">Не удалось загрузить галерею: {error.message}</p>
          ) : null}
        </div>

        <Link href="/contests" className="btn-secondary inline-flex items-center gap-2">
          Смотреть конкурсы <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((it) => (
          <Link
            key={it.id}
            href={`/contests/${it.contest_id}`}
            className="group card card-hover overflow-hidden"
          >
            <div className="relative aspect-[4/3] bg-[rgba(15,23,42,0.04)]">
              <Image
                src={it.image_url}
                alt={it.work_title ?? 'Работа участника'}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </div>

            <div className="p-4">
              <div className="font-semibold text-[rgba(15,23,42,0.9)] line-clamp-1">
                {it.work_title ?? 'Работа участника'}
              </div>
              <div className="mt-1 text-xs text-[rgba(15,23,42,0.62)]">
                {it.name} {it.surname_initial}. • {it.age} • {it.city}
              </div>
              {it.contest_title ? (
                <div className="mt-2 text-xs font-semibold text-[rgba(30,64,175,0.92)] line-clamp-1">
                  {it.contest_title}
                </div>
              ) : null}
            </div>
          </Link>
        ))}
      </div>

      {!items.length && !error ? (
        <div className="mt-10 card p-6">
          <div className="text-lg font-bold">Пока работ нет</div>
          <div className="mt-1 text-[rgba(15,23,42,0.72)]">
            Загляните чуть позже — мы добавим первые работы после модерации.
          </div>
        </div>
      ) : null}
    </main>
  )
}
