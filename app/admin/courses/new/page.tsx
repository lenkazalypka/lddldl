'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NewCoursePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'draft' as 'draft' | 'published',
    formats: { online: true, offline: false },
    price_type: 'free' as 'free' | 'paid',
    price: '' as string,
    location: '',
    starts_at: '',
    ends_at: '',
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        // legacy single format (keep filled for older code paths)
        format: formData.formats.offline && !formData.formats.online ? 'offline' : 'online',
        formats: [formData.formats.online ? 'online' : null, formData.formats.offline ? 'offline' : null].filter(Boolean),
        price_type: formData.price_type,
        location: formData.location.trim() || null,
        starts_at: formData.starts_at || null,
        ends_at: formData.ends_at || null,
        price: formData.price_type === 'paid' && formData.price ? Number(formData.price) : null,
      }

      const { error } = await supabase.from('courses').insert(payload)
      if (error) throw error

      router.push('/admin/courses')
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Ошибка при создании курса')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Новый курс</h1>

      <form onSubmit={submit} className="card p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Название</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input w-full"
            placeholder="Например: Подготовка к олимпиаде по математике"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input w-full min-h-[140px]"
            placeholder="Коротко: что за курс, что получит ученик"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="input w-full"
            >
              <option value="draft">Черновик</option>
              <option value="published">Опубликован</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Формат</label>
            <div className="flex flex-wrap gap-3">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.formats.online}
                  onChange={(e) => {
                    const online = e.target.checked
                    const next = { ...formData.formats, online }
                    // do not allow zero formats
                    if (!next.online && !next.offline) next.online = true
                    setFormData({ ...formData, formats: next })
                  }}
                />
                🖥 Онлайн
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.formats.offline}
                  onChange={(e) => {
                    const offline = e.target.checked
                    const next = { ...formData.formats, offline }
                    if (!next.online && !next.offline) next.offline = true
                    setFormData({ ...formData, formats: next })
                  }}
                />
                🏫 Оффлайн
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">Можно включить оба варианта — тогда участник выберет формат при записи.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Стоимость</label>
            <select
              value={formData.price_type}
              onChange={(e) => setFormData({ ...formData, price_type: e.target.value as any, price: '' })}
              className="input w-full"
            >
              <option value="free">Бесплатно</option>
              <option value="paid">Платно</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Цена (₽)</label>
            <input
              type="number"
              min="0"
              disabled={formData.price_type !== 'paid'}
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="input w-full disabled:opacity-50"
              placeholder={formData.price_type === 'paid' ? 'Например: 1990' : '—'}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Дата начала</label>
            <input
              type="date"
              value={formData.starts_at}
              onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Дата окончания</label>
            <input
              type="date"
              value={formData.ends_at}
              onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
              className="input w-full"
            />
          </div>
        </div>

        {formData.formats.offline && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Локация (для оффлайн)</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="input w-full"
              placeholder="Например: Санкт‑Петербург, ул. ..."
            />
          </div>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Создаём...' : 'Создать'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            Отмена
          </button>
        </div>
      </form>
    </div>
  )
}
