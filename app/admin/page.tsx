
export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      
      <section className="py-20 px-6 text-center bg-gray-50">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Творческие конкурсы для детей, школьников, студентов и взрослых
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Участвуйте, проявляйте талант и получайте дипломы и призы.
          Онлайн и офлайн форматы по всей стране.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <a href="/contests" className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
            Участвовать в конкурсе
          </a>
          <a href="/contests" className="px-6 py-3 rounded-xl border border-gray-300 font-medium hover:bg-gray-100 transition">
            Смотреть текущие конкурсы
          </a>
        </div>
      </section>

      <section className="py-20 px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">Платформа для талантливых и смелых</h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          Мы создаём пространство, где каждый может раскрыть свой потенциал — независимо от возраста и уровня подготовки.
          Наши конкурсы объединяют детей, школьников, студентов и взрослых,
          помогая им развиваться, получать признание и уверенность в себе.
        </p>
      </section>

      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">

          <div className="p-6 bg-white rounded-2xl shadow-sm">
            <h3 className="text-xl font-semibold mb-3">Дети (5–10 лет)</h3>
            <p className="text-gray-600">
              Творческие конкурсы рисунка, поделок, фото и видео.
              Простые и интересные задания с дипломами для каждого участника.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-sm">
            <h3 className="text-xl font-semibold mb-3">Школьники (11–17 лет)</h3>
            <p className="text-gray-600">
              Олимпиады, проекты и исследовательские работы.
              Отличная возможность пополнить портфолио и получить достижения.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-sm">
            <h3 className="text-xl font-semibold mb-3">Студенты</h3>
            <p className="text-gray-600">
              Академические и профессиональные конкурсы, кейсы и проекты.
              Возможность заявить о себе и получить признание.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-sm">
            <h3 className="text-xl font-semibold mb-3">Взрослые</h3>
            <p className="text-gray-600">
              Творческие, педагогические и профессиональные конкурсы.
              Развитие, подтверждение квалификации и новые возможности.
            </p>
          </div>

        </div>
      </section>

      <section className="py-20 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Почему выбирают нас</h2>
        <div className="grid md:grid-cols-2 gap-6 text-gray-700 text-lg">
          <div>✅ Официальные дипломы и сертификаты</div>
          <div>✅ Прозрачная система оценки</div>
          <div>✅ Онлайн и офлайн форматы</div>
          <div>✅ Поддержка участников на каждом этапе</div>
          <div>✅ Удобная подача заявок</div>
        </div>
      </section>

      <section className="py-20 px-6 bg-blue-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-6">Подать заявку просто</h2>
        <p className="mb-8 text-lg">
          Выберите конкурс, заполните форму и загрузите работу.
          Результат и диплом придут в личный кабинет.
        </p>
        <a href="/contests" className="px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition">
          Подать заявку
        </a>
      </section>

    </main>
  );
}
