// app/(public)/legal/consent/page.tsx
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Согласие на обработку персональных данных — Вектор Будущего',
  description: 'Форма согласия на обработку персональных данных для участия в конкурсах.',
  alternates: { canonical: '/legal/consent' },
  openGraph: {
    title: 'Согласие на обработку персональных данных — Вектор Будущего',
    description: 'Форма согласия на обработку персональных данных для участия в конкурсах.',
    images: ['/og.jpg'],
  },
}

export default function ConsentPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold text-center mb-8">Согласие на обработку персональных данных</h1>
          <div className="mt-2 flex justify-center">
            <span className="inline-flex items-center rounded-full border bg-white/60 px-3 py-1 text-xs font-semibold text-[rgba(15,23,42,0.72)]">Дата: 23.02.2026</span>
          </div>
          
          <div className="glass-card p-8">
            <div className="prose prose-lg max-w-none">
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-8">
                <p className="font-bold">Внимание!</p>
                <p>При регистрации на сайте вы автоматически даете это согласие.</p>
              </div>

              <section className="mb-8">
                <p className="mb-4">
                  Я, нижеподписавшийся(аяся), настоящим свободно, своей волей и в своем интересе даю согласие 
                  Центру дополнительного образования «Вектор будущего» на обработку своих персональных данных и 
                  персональных данных моего ребенка (подопечного), указанных при регистрации на сайте.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-vector-deep-blue mb-4">Перечень данных</h2>
                <p className="mb-4">
                  Обработке подлежат следующие персональные данные:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>ФИО ребенка/участника</li>
                  <li>Возраст</li>
                  <li>Город проживания</li>
                  <li>ФИО родителя/законного представителя</li>
                  <li>Контактный телефон</li>
                  <li>Адрес электронной почты</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-vector-deep-blue mb-4">Цели обработки</h2>
                <p className="mb-4">
                  Цели обработки персональных данных:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Регистрация на конкурсы</li>
                  <li>Организация конкурсных мероприятий</li>
                  <li>Публикация работ и результатов на сайте</li>
                  <li>Информирование о конкурсах и мероприятиях</li>
                  <li>Выполнение обязательств перед участниками</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-vector-deep-blue mb-4">Срок действия</h2>
                <p className="mb-4">
                  Согласие действует с момента регистрации до момента отзыва согласия.
                </p>
                <p>
                  Отозвать согласие можно путем направления письменного заявления на электронную почту: 
                  <a href="mailto:sriovector@mail.ru" className="text-vector-electric ml-2">sriovector@mail.ru</a>
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-vector-deep-blue mb-4">Гарантии</h2>
                <p className="mb-4">
                  Настоящим подтверждаю, что даю согласие в соответствии с требованиями:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных»</li>
                  <li>Иных нормативных правовых актов РФ</li>
                </ul>
              </section>

              <section className="mb-8 p-6 bg-blue-50 rounded-lg">
                <h3 className="text-xl font-bold text-vector-deep-blue mb-4">✅ Согласие считается полученным при:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Проставлении галочки в форме регистрации</li>
                  <li>Нажатии кнопки «Зарегистрироваться»</li>
                  <li>Использовании функционала сайта после регистрации</li>
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
