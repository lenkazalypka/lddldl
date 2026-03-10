import { createClient } from '@/lib/supabase/server'
import ContestCard from '@/components/ContestCard'
import NewsCard from '@/components/NewsCard'
import Link from 'next/link'
import { ArrowRight, BadgeCheck, Clock3, Sparkles, Trophy } from 'lucide-react'

const FAQ = [
  {
    q: 'Как подать работу?',
    a: 'Выберите конкурс, отправьте работу на почту из карточки конкурса и укажите: ФИО, возраст, город и название работы.',
  },
  {
    q: 'Кто может участвовать?',
    a: 'Дети, школьники, студенты, педагоги и взрослые — ограничения зависят от конкретного конкурса.',
  },
  {
    q: 'Когда будет результат?',
    a: 'Обычно проверка занимает 1–3 дня. Итоги и победители публикуются на странице конкурса в день подведения итогов.',
  },
  {
    q: 'Как получить диплом?',
    a: 'После модерации появится страница участника со статусом и кнопкой скачивания сертификата или диплома (1–3 место).',
  },
]

export default async function HomePage() {
  const supabase = await createClient()

  const [
    { data: contests },
    { data: news },
    worksCountRes,
    contestsCountRes,
    worksPreviewRes,
  ] = await Promise.all([
    supabase.from('contests').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(6),
    supabase.from('news').select('*').order('published_at', { ascending: false }).limit(3),
    supabase.from('contest_photos').select('id', { count: 'exact', head: true }).eq('approved', true),
    supabase.from('contests').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase
      .from('contest_photos')
      .select('id, image_url')
      .eq('approved', true)
      .order('uploaded_at', { ascending: false })
      .limit(8),
  ])

  const worksCount = worksCountRes.count ?? 0
  const activeContestsCount = contestsCountRes.count ?? 0
  const worksPreview = worksPreviewRes.data ?? []

  return (
    <div className="bg-blobs">
      {/* HERO */}
      <section className="pt-14 md:pt-18 pb-12 md:pb-16">
        <div className="container-page grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold bg-[rgba(30,64,175,0.10)] border-[rgba(30,64,175,0.18)] text-[var(--primary)]">
              <Sparkles className="w-4 h-4" />
              Современные онлайн-конкурсы • дипломы
            </div>

            <h1 className="mt-5 font-[var(--font-display)] text-4xl md:text-5xl lg:text-6xl leading-[1.03]">
              Конкурсы нового формата
              <span className="block text-[var(--primary)]">для детей и педагогов</span>
            </h1>

            <p className="mt-5 text-base md:text-lg text-[rgba(15,23,42,0.72)] max-w-xl">
              Участвуйте онлайн: отправьте работу на почту конкурса — и следите за статусом на сайте.
              После модерации вы сможете скачать сертификат участника или диплом призёра (I–III место).
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/contests" className="btn-primary inline-flex items-center justify-center gap-2">
                Смотреть конкурсы <Trophy className="w-4 h-4" />
              </Link>
              <Link href="#how" className="btn-secondary inline-flex items-center justify-center gap-2">
                Как это работает <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3 max-w-md">
              <div className="card p-4">
                <div className="text-sm text-[rgba(15,23,42,0.68)]">Активных</div>
                <div className="mt-1 text-xl font-extrabold text-[var(--primary)]">
                  {activeContestsCount ? `${activeContestsCount}+` : '—'}
                </div>
              </div>
              <div className="card p-4">
                <div className="text-sm text-[rgba(15,23,42,0.68)]">Работ в галерее</div>
                <div className="mt-1 text-xl font-extrabold text-[var(--primary)]">
                  {worksCount ? `${worksCount}+` : '—'}
                </div>
              </div>
              <div className="card p-4">
                <div className="text-sm text-[rgba(15,23,42,0.68)]">Проверка</div>
                <div className="mt-1 text-xl font-extrabold text-[var(--primary)]">1–3 дня</div>
              </div>
            </div>
          </div>

          {/* Certificate mock */}
          <div className="animate-fade-up">
            <div className="relative">
              <div className="absolute -inset-8 rounded-[36px] blur-2xl opacity-80 bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.35),transparent_55%),radial-gradient(circle_at_75%_35%,rgba(30,64,175,0.28),transparent_55%),radial-gradient(circle_at_55%_80%,rgba(245,158,11,0.22),transparent_55%)]" />
              <div className="relative card p-6 md:p-8 overflow-hidden">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[rgba(15,23,42,0.72)]">
                    <BadgeCheck className="w-4 h-4 text-[var(--accent)]" />
                    Дипломы и сертификаты
                  </div>
                  <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full border bg-[rgba(16,185,129,0.10)] border-[rgba(16,185,129,0.20)] text-[rgba(5,150,105,0.95)]">
                    <Clock3 className="w-3.5 h-3.5" />
                    Быстро и удобно
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4">
                  <div className="rounded-2xl border border-[rgba(15,23,42,0.10)] bg-white p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold text-[rgba(15,23,42,0.55)]">CERTIFICATE</div>
                        <div className="mt-1 text-xl font-extrabold">Сертификат участника</div>
                        <div className="mt-2 text-sm text-[rgba(15,23,42,0.68)]">
                          Доступен на сайте после модерации. Можно скачать в PDF.
                        </div>
                      </div>
                      <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white"
                           style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary2))' }}>
                        <Trophy className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="mt-5 rounded-xl bg-[rgba(15,23,42,0.03)] p-4 text-sm text-[rgba(15,23,42,0.70)]">
                      Номер документа • дата выдачи • I–III место для призёров
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="card card-hover p-5">
                      <div className="text-sm font-extrabold">I–III место</div>
                      <div className="mt-1 text-sm text-[rgba(15,23,42,0.68)]">
                        Диплом призёра с местом и номинацией.
                      </div>
                    </div>
                    <div className="card card-hover p-5">
                      <div className="text-sm font-extrabold">Проверка статуса</div>
                      <div className="mt-1 text-sm text-[rgba(15,23,42,0.68)]">
                        Страница участника со статусом и кнопкой скачивания.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-[rgba(15,23,42,0.62)]">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border bg-white">
                    ✅ PDF
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border bg-white">
                    ✅ Уникальный номер
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border bg-white">
                    ✅ После модерации
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AUDIENCE */}
      <section className="py-10 md:py-12">
        <div className="container-page">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card card-hover p-6">
              <div className="text-sm font-extrabold">Дети</div>
              <div className="mt-2 text-sm text-[rgba(15,23,42,0.68)]">Рисунок, поделки, фото и видео.</div>
            </div>
            <div className="card card-hover p-6">
              <div className="text-sm font-extrabold">Школьники</div>
              <div className="mt-2 text-sm text-[rgba(15,23,42,0.68)]">Проекты, исследования, творчество.</div>
            </div>
            <div className="card card-hover p-6">
              <div className="text-sm font-extrabold">Студенты</div>
              <div className="mt-2 text-sm text-[rgba(15,23,42,0.68)]">Кейсы и академические конкурсы.</div>
            </div>
            <div className="card card-hover p-6">
              <div className="text-sm font-extrabold">Педагоги и взрослые</div>
              <div className="mt-2 text-sm text-[rgba(15,23,42,0.68)]">Методика, практика, проф.рост.</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="py-14 md:py-16">
        <div className="container-page">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-[var(--font-display)] font-extrabold">Как это работает</h2>
              <p className="mt-2 text-[rgba(15,23,42,0.70)] max-w-2xl">
                Мы специально сделали процесс простым — чтобы участие занимало пару минут.
              </p>
            </div>
            <Link href="/contests" className="hidden md:inline-flex btn-ghost items-center gap-2">
              Перейти к конкурсам <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card p-6">
              <div className="text-xs font-bold text-[rgba(15,23,42,0.55)]">ШАГ 01</div>
              <div className="mt-2 font-extrabold">Выберите конкурс</div>
              <div className="mt-2 text-sm text-[rgba(15,23,42,0.68)]">Откройте карточку и посмотрите условия.</div>
            </div>
            <div className="card p-6">
              <div className="text-xs font-bold text-[rgba(15,23,42,0.55)]">ШАГ 02</div>
              <div className="mt-2 font-extrabold">Отправьте работу</div>
              <div className="mt-2 text-sm text-[rgba(15,23,42,0.68)]">На почту конкурса + данные участника.</div>
            </div>
            <div className="card p-6">
              <div className="text-xs font-bold text-[rgba(15,23,42,0.55)]">ШАГ 03</div>
              <div className="mt-2 font-extrabold">Дождитесь модерации</div>
              <div className="mt-2 text-sm text-[rgba(15,23,42,0.68)]">Обычно 1–3 дня, статус будет на сайте.</div>
            </div>
            <div className="card p-6">
              <div className="text-xs font-bold text-[rgba(15,23,42,0.55)]">ШАГ 04</div>
              <div className="mt-2 font-extrabold">Скачайте диплом</div>
              <div className="mt-2 text-sm text-[rgba(15,23,42,0.68)]">Сертификат участника или диплом призёра.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ACTIVE CONTESTS */}
      <section className="py-14 md:py-16">
        <div className="container-page">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-[var(--font-display)] font-extrabold">Текущие конкурсы</h2>
              <p className="mt-2 text-[rgba(15,23,42,0.70)] max-w-2xl">
                Выбирайте конкурс и участвуйте онлайн. Работы появляются в галерее после модерации.
              </p>
            </div>
            <Link href="/contests" className="btn-secondary hidden md:inline-flex items-center gap-2">
              Все конкурсы <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {(contests ?? []).map((contest: any) => (
              <ContestCard key={contest.id} contest={contest} />
            ))}
          </div>

          <div className="mt-6 md:hidden">
            <Link href="/contests" className="btn-secondary w-full inline-flex items-center justify-center gap-2">
              Все конкурсы <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      <section className="py-14 md:py-16">
        <div className="container-page">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-[var(--font-display)] font-extrabold">Галерея работ</h2>
              <p className="mt-2 text-[rgba(15,23,42,0.70)] max-w-2xl">
                Реальные работы участников — вдохновляйтесь и присоединяйтесь ✨
              </p>
            </div>
            <Link href="/gallery" className="btn-ghost hidden md:inline-flex items-center gap-2">
              Открыть галерею <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            {worksPreview.length ? (
              worksPreview.map((w: any) => (
                <div key={w.id} className="card overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={w.image_url}
                    alt="Работа участника"
                    className="w-full aspect-square object-cover"
                    loading="lazy"
                  />
                </div>
              ))
            ) : (
              <>
                <div className="card h-40" />
                <div className="card h-40" />
                <div className="card h-40 hidden md:block" />
                <div className="card h-40 hidden md:block" />
              </>
            )}
          </div>

          <div className="mt-6 md:hidden">
            <Link href="/gallery" className="btn-ghost w-full inline-flex items-center justify-center gap-2">
              Открыть галерею <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* NEWS */}
      <section className="py-14 md:py-16">
        <div className="container-page">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-[var(--font-display)] font-extrabold">Новости</h2>
              <p className="mt-2 text-[rgba(15,23,42,0.70)] max-w-2xl">
                Объявления, новые конкурсы и результаты.
              </p>
            </div>
            <Link href="/news" className="btn-ghost hidden md:inline-flex items-center gap-2">
              Все новости <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {(news ?? []).map((item: any) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 md:py-16">
        <div className="container-page">
          <h2 className="text-2xl md:text-3xl font-[var(--font-display)] font-extrabold">Вопросы и ответы</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAQ.map((item) => (
              <div key={item.q} className="card p-6">
                <div className="font-extrabold">{item.q}</div>
                <div className="mt-2 text-sm text-[rgba(15,23,42,0.68)]">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-14 md:py-16">
        <div className="container-page">
          <div className="card p-8 md:p-10 overflow-hidden relative">
            <div className="absolute -inset-6 blur-2xl opacity-70 bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.30),transparent_55%),radial-gradient(circle_at_75%_35%,rgba(30,64,175,0.22),transparent_55%),radial-gradient(circle_at_50%_90%,rgba(245,158,11,0.18),transparent_55%)]" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold bg-white text-[rgba(15,23,42,0.74)]">
                <BadgeCheck className="w-4 h-4 text-[var(--accent)]" />
                Всё для участия онлайн
              </div>
              <h3 className="mt-4 text-2xl md:text-3xl font-[var(--font-display)] font-extrabold">
                Готовы участвовать?
              </h3>
              <p className="mt-2 text-[rgba(15,23,42,0.70)] max-w-2xl">
                Выберите конкурс, отправьте работу и скачайте сертификат или диплом после модерации.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link href="/contests" className="btn-primary inline-flex items-center justify-center gap-2">
                  Перейти к конкурсам <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="#how" className="btn-secondary inline-flex items-center justify-center gap-2">
                  Как участвовать <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
