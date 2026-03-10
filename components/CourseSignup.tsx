'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Course = {
  id: string
  title: string
  formats?: string[] | null
  format?: 'online' | 'offline'
}

const formatLabel: Record<'online' | 'offline', string> = {
  online: '🖥 Онлайн',
  offline: '🏫 Оффлайн',
}

export default function CourseSignup({ course }: { course: Course }) {
  const supabase = createClient()
  const available = useMemo(() => {
    const fromArray = (course.formats && course.formats.length ? course.formats : null) as string[] | null
    if (fromArray) {
      const cleaned = fromArray.filter((x) => x === 'online' || x === 'offline') as ('online' | 'offline')[]
      return cleaned.length ? cleaned : [course.format ?? 'online']
    }
    return [course.format ?? 'online']
  }, [course.formats, course.format])

  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    city: '',
    selected_format: (available[0] ?? 'online') as 'online' | 'offline',
    comment: '',
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErr(null)
    setOk(null)

    try {
      const payload = {
        course_id: course.id,
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        city: form.city.trim() || null,
        selected_format: form.selected_format,
        comment: form.comment.trim() || null,
      }

      const { error } = await supabase.from('course_applications').insert(payload as any)
      if (error) throw error

      setOk('Заявка отправлена ✅ Мы свяжемся с вами по почте/телефону.')
      setForm((p) => ({ ...p, phone: '', city: '', comment: '' }))
    } catch (e: any) {
      console.error(e)
      setErr('Не получилось отправить заявку. Попробуйте ещё раз чуть позже 🙏')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-6" id="signup">
      <h2 className="font-[var(--font-display)] text-2xl">Записаться на курс</h2>
      <p className="mt-2 text-slate-600">
        Оставьте контакты — мы подтвердим запись и расскажем детали.
      </p>

      <form onSubmit={submit} className="mt-6 grid gap-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">ФИО</label>
            <input
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="input w-full"
              placeholder="Иванов Иван"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input w-full"
              placeholder="name@email.com"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Телефон (необязательно)</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input w-full"
              placeholder="+7 ..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Город (необязательно)</label>
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="input w-full"
              placeholder="Санкт‑Петербург"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Формат</label>
          <div className="flex flex-wrap gap-2">
            {(available as ('online' | 'offline')[]).map((f) => (
              <button
                type="button"
                key={f}
                onClick={() => setForm({ ...form, selected_format: f })}
                className={
                  form.selected_format === f
                    ? 'px-4 py-2 rounded-full border font-semibold bg-[rgba(30,64,175,0.10)] border-[rgba(30,64,175,0.22)] text-[var(--primary)]'
                    : 'px-4 py-2 rounded-full border font-semibold bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }
              >
                {formatLabel[f]}
              </button>
            ))}
          </div>
          {available.length === 1 && (
            <p className="mt-2 text-xs text-slate-500">У этого курса доступен один формат.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Комментарий (необязательно)</label>
          <textarea
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            className="input w-full min-h-[110px]"
            placeholder="Например: удобное время, вопросы по программе"
          />
        </div>

        {ok && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 font-semibold">{ok}</div>}
        {err && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 font-semibold">{err}</div>}

        <button disabled={loading} className="btn-primary w-full md:w-auto">
          {loading ? 'Отправляем…' : 'Отправить заявку'}
        </button>
      </form>
    </div>
  )
}
