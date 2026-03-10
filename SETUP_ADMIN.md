# 🔐 Как создать первого администратора

## Метод 1: Через Supabase Dashboard (Рекомендуется)

### Шаг 1: Зарегистрируйтесь на сайте
1. Запустите проект: `npm run dev`
2. Откройте http://localhost:3000
3. Перейдите на страницу регистрации
4. Создайте аккаунт (используйте свой реальный email)

### Шаг 2: Найдите свой User ID
1. Зайдите в [Supabase Dashboard](https://app.supabase.com)
2. Откройте ваш проект
3. Перейдите в **Authentication** → **Users**
4. Найдите своего пользователя в списке
5. Скопируйте **UID** (это ваш user ID)

### Шаг 3: Сделайте себя администратором
1. В Supabase Dashboard перейдите в **SQL Editor**
2. Вставьте следующий запрос (замените `your-user-id-here` на ваш UID):

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'your-user-id-here';
```

3. Нажмите **Run** (или F5)
4. Должно появиться сообщение: `Success. No rows returned`

### Шаг 4: Проверка
1. Обновите страницу сайта (F5)
2. Попробуйте зайти на `/admin`
3. Вы должны увидеть админ-панель!

---

## Метод 2: Через SQL (для продвинутых)

Если вы знаете свой email, можно использовать один SQL запрос:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'your-email@example.com'
  LIMIT 1
);
```

---

## Метод 3: Создание тестового админа

Для тестирования можно создать админа напрямую в БД:

```sql
-- ВНИМАНИЕ: Это создаст пользователя БЕЗ пароля!
-- Используйте только для тестов в dev окружении

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@test.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) RETURNING id;

-- Используйте полученный id в следующем запросе:
UPDATE profiles SET role = 'admin' WHERE id = 'id-from-previous-query';
```

---

## Устранение проблем

### "Admin access denied" после установки роли

**Причина:** Кэш браузера

**Решение:**
1. Выйдите из аккаунта (Sign Out)
2. Очистите cookies браузера для localhost
3. Войдите снова

### "Не могу найти себя в списке Users"

**Причина:** Пользователь не создан в auth.users

**Решение:**
1. Проверьте, что вы действительно зарегистрировались
2. Проверьте email - возможно, нужно подтвердить его
3. В SQL Editor выполните:

```sql
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 10;
```

### "Success. No rows returned" но роль не изменилась

**Причина:** Trigger `on_auth_user_created` еще не создал профиль

**Решение:** Создайте профиль вручную:

```sql
INSERT INTO profiles (id, role) 
VALUES ('your-user-id', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

---

## Проверка корректности установки

Выполните этот запрос, чтобы убедиться, что все работает:

```sql
SELECT 
  u.id,
  u.email,
  p.role,
  p.full_name
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'your-email@example.com';
```

Должно вернуть:
- ваш id
- ваш email  
- role: 'admin'
- full_name (если заполнили в профиле)

---

## Добавление других администраторов

После того, как вы стали админом, можете добавлять других через UI:

1. Зайдите в админ-панель → **Пользователи**
2. Найдите нужного пользователя
3. Нажмите **"Сделать администратором"**

---

**Важно:** Первый администратор должен быть создан через SQL. Все последующие можно добавлять через админ-панель.
