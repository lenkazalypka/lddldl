// app/(public)/legal/privacy/page.tsx
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Политика конфиденциальности — Вектор Будущего',
  description: 'Политика конфиденциальности и обработки персональных данных участников и посетителей сайта.',
  alternates: { canonical: '/legal/privacy' },
  openGraph: {
    title: 'Политика конфиденциальности — Вектор Будущего',
    description: 'Политика конфиденциальности и обработки персональных данных участников и посетителей сайта.',
    images: ['/og.jpg'],
  },
}

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold text-center mb-8">Политика конфиденциальности</h1>
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
                  Настоящая Политика конфиденциальности персональных данных (далее — Политика конфиденциальности) 
                  действует в отношении всей информации, которую Центр дополнительного образования «Вектор будущего» 
                  может получить о Пользователе во время использования сайта.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-vector-deep-blue mb-4">2. Персональные данные</h2>
                <p className="mb-4">
                  Мы собираем следующие персональные данные:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Имя и возраст ребенка/участника</li>
                  <li>ФИО родителя или законного представителя</li>
                  <li>Контактный телефон</li>
                  <li>Электронная почта</li>
                  <li>Город проживания</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-vector-deep-blue mb-4">3. Цели сбора данных</h2>
                <p className="mb-4">
                  Персональные данные собираются для:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Регистрации участников на конкурсы</li>
                  <li>Организации конкурсных мероприятий</li>
                  <li>Публикации результатов конкурсов</li>
                  <li>Связи с участниками и родителями</li>
                  <li>Выполнения требований законодательства РФ</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-vector-deep-blue mb-4">4. Защита данных</h2>
                <p className="mb-4">
                  Мы принимаем необходимые организационные и технические меры для защиты 
                  персональных данных от неправомерного или случайного доступа, уничтожения, 
                  изменения, блокирования, копирования, распространения.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-vector-deep-blue mb-4">5. Публикация данных детей</h2>
                <p className="mb-4">
                  В соответствии с требованиями безопасности, на сайте публикуются только:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Имя ребенка</li>
                  <li>Первая буква фамилии</li>
                  <li>Возраст</li>
                  <li>Город</li>
                  <li>Работы, отправленные на конкурс</li>
                </ul>
                <p>
                  Полные ФИО, контактные данные и другая личная информация не публикуются.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-vector-deep-blue mb-4">6. Контакты для вопросов</h2>
                <p className="mb-4">
                  По всем вопросам, касающимся обработки персональных данных, обращайтесь:
                </p>
                <p className="font-medium">
                  Электронная почта: <a href="mailto:sriovector@mail.ru" className="text-vector-electric">sriovector@mail.ru</a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
