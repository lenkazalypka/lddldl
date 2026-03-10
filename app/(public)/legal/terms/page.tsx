// app/(public)/legal/terms/page.tsx
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Пользовательское соглашение — Вектор Будущего',
  description: 'Условия использования сайта и участия в конкурсах.',
  alternates: { canonical: '/legal/terms' },
  openGraph: {
    title: 'Пользовательское соглашение — Вектор Будущего',
    description: 'Условия использования сайта и участия в конкурсах.',
    images: ['/og.jpg'],
  },
}

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold text-center mb-8">Пользовательское соглашение</h1>
          <div className="mt-2 flex justify-center">
            <span className="inline-flex items-center rounded-full border bg-white/60 px-3 py-1 text-xs font-semibold text-[rgba(15,23,42,0.72)]">Редакция: 23.02.2026</span>
          </div>
          
          <div className="glass-card p-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-vector-medium mb-6">
                <strong>Дата вступления в силу:</strong> {new Date().toLocaleDateString('ru-RU')}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-vector-deep-blue mb-4">1. Общие положения</h2>
                <p className="mb-4">
                  Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения 
                  между Центром дополнительного образования «Вектор будущего» (далее — «Администрация») 
                  и Пользователем сайта.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-vector-deep-blue mb-4">2. Регистрация</h2>
                <p className="mb-4">
                  Для участия в конкурсах необходима регистрация на сайте. При регистрации Пользователь обязуется:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Предоставлять достоверную информацию</li>
                  <li>Дать согласие на обработку персональных данных</li>
                  <li>Принимать условия настоящего Соглашения</li>
                  <li>Не передавать учетные данные третьим лицам</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-vector-deep-blue mb-4">3. Участие в конкурсах</h2>
                <p className="mb-4">
                  Участники конкурсов обязаны:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Отправлять только собственные работы</li>
                  <li>Не нарушать авторские права третьих лиц</li>
                  <li>Соблюдать этические нормы</li>
                  <li>Следовать правилам конкретного конкурса</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-vector-deep-blue mb-4">4. Права и обязанности</h2>
                <p className="mb-4">
                  Администрация вправе:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Отказать в участии без объяснения причин</li>
                  <li>Удалить работу, нарушающую правила</li>
                  <li>Изменять условия конкурсов</li>
                  <li>Публиковать работы участников на сайте</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-vector-deep-blue mb-4">5. Отправка работ</h2>
                <p className="mb-4">
                  Работы отправляются исключительно на электронную почту: 
                  <a href="mailto:sriovector@mail.ru" className="text-vector-electric ml-2">sriovector@mail.ru</a>
                </p>
                <p>
                  Загрузка через сайт не предусмотрена для обеспечения безопасности.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-vector-deep-blue mb-4">6. Ответственность</h2>
                <p className="mb-4">
                  Администрация не несет ответственности:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>За технические проблемы при отправке работ</li>
                  <li>За неправильное оформление работ</li>
                  <li>За нарушение авторских прав участниками</li>
                  <li>За действия третьих лиц</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
