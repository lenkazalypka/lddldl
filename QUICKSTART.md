# ⚡ БЫСТРЫЙ СТАРТ - Векторный проект готов к запуску!

## 📦 Что в архиве?

Полностью рабочий проект с:
- ✅ Исправленной админ-панелью (role вместо is_admin)
- ✅ Полной SQL миграцией базы данных
- ✅ Управлением пользователями
- ✅ Модерацией работ
- ✅ Системой новостей и FAQ
- ✅ Подробной документацией

## 🚀 Запуск за 5 минут

### Шаг 1: Распаковка
```bash
unzip vector-fixed.zip
cd vector-fixed
npm install
```

### Шаг 2: Supabase
1. Создайте проект на [supabase.com](https://supabase.com)
2. SQL Editor → вставьте содержимое `supabase/migrations/20240101000000_initial_schema.sql`
3. Run ✅
4. Storage → Create bucket `contest-photos` (Public ✅)

### Шаг 3: Переменные окружения
```bash
cp .env.example .env.local
```

Заполните `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://ваш-проект.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш-anon-key
```

### Шаг 4: Запуск!
```bash
npm run dev
```

Откройте http://localhost:3000 🎉

### Шаг 5: Создание админа
1. Зарегистрируйтесь на сайте
2. Найдите свой ID: Supabase → Authentication → Users → скопируйте UID
3. SQL Editor:
```sql
UPDATE profiles SET role = 'admin' WHERE id = 'ваш-uid';
```
4. Обновите страницу → зайдите на /admin

## 📚 Документация

В архиве есть:
- **README.md** - полная документация проекта
- **SETUP_ADMIN.md** - подробная инструкция по созданию админа (3 способа!)
- **CHANGELOG.md** - что было исправлено и добавлено
- **Этот файл** - быстрый старт

## ✨ Основные функции

### Для пользователей:
- Регистрация с полными согласиями (152-ФЗ)
- Просмотр активных конкурсов
- Загрузка работ
- Профиль пользователя

### Для админов:
- **Dashboard** - статистика платформы
- **Конкурсы** - создание и управление
- **Работы** - модерация с фильтрами
- **Пользователи** - назначение ролей
- **Новости** - публикация новостей
- **FAQ** - управление вопросами

## 🎯 Готовность

**Статус:** ✅ Production Ready

Проект готов к деплою на Vercel:
```bash
npm install -g vercel
vercel
```

## 🐛 Решение проблем

### "Admin access denied"
→ Проверьте в SQL: `SELECT id, role FROM profiles WHERE id = 'ваш-id'`
→ Должно быть role = 'admin'

### "Supabase URL not set"
→ Проверьте файл .env.local
→ Перезапустите dev сервер

### "Ошибка при загрузке работ"
→ Создайте bucket в Storage: `contest-photos`
→ Сделайте его публичным (Public bucket ✅)

## 📞 Нужна помощь?

1. Прочитайте README.md в корне проекта
2. Прочитайте SETUP_ADMIN.md для проблем с админкой
3. Проверьте логи: F12 в браузере
4. Email: sriovector@mail.ru

## 🎨 Кастомизация

### Цвета
Файл: `tailwind.config.js`
```js
colors: {
  'vector-electric': '#0066FF',  // Ваш цвет
  // ...
}
```

### Шрифты
Файл: `app/layout.tsx`

### Контент
- FAQ: в SQL миграции или через админку
- Новости: через админку
- О центре: `app/page.tsx`

---

**Сделано с ❤️ для Центра «Вектор»**

Успешного запуска! 🚀
