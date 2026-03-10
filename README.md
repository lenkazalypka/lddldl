# 🚀 Центр дополнительного образования «Вектор»

EdTech платформа для проведения конкурсов детских работ.

## 📋 Технологии

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend:** Supabase (Auth, Database, Storage)
- **UI:** Lucide React Icons, Framer Motion
- **Хостинг:** Vercel (рекомендуется)

## 🎯 Основные функции

- ✅ Регистрация и авторизация пользователей
- ✅ Создание и управление конкурсами
- ✅ Загрузка работ участников
- ✅ Админ-панель для модерации
- ✅ Система новостей и FAQ
- ✅ Защита персональных данных (152-ФЗ)

## 🛠️ Быстрый старт

### 1. Клонирование

```bash
git clone https://github.com/lenkazalypka/vector.git
cd vector
npm install
```

### 2. Настройка Supabase

1. Создайте проект на [supabase.com](https://supabase.com)
2. В **SQL Editor** выполните `supabase/migrations/20240101000000_initial_schema.sql`
3. В **Storage** создайте bucket `contest-photos` (публичный)
4. Скопируйте URL и anon key из Settings → API

### 3. Переменные окружения

```bash
cp .env.example .env.local
```

Заполните `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

### 4. Создание админа

После регистрации выполните в SQL Editor:

```sql
UPDATE profiles SET role = 'admin' WHERE id = 'ваш-user-id';
```

### 5. Запуск

```bash
npm run dev
```

Откройте http://localhost:3000

## 📁 Структура

```
app/
  (public)/     # Публичные страницы
  (protected)/  # Для авторизованных
  admin/        # Админ-панель
components/     # UI компоненты
lib/supabase/   # Supabase клиенты
supabase/       # Миграции БД
```

## 🚀 Деплой

```bash
vercel
```

Или через GitHub → Vercel

## 📞 Контакты

sriovector@mail.ru

---

Made with ❤️
