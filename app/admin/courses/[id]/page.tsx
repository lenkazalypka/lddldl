'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function EditCoursePage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase.from('courses').select('*').eq('id', id).single()
      if (error) {
        console.error(error)
        alert('Не удалось загрузить курс')
        router.push('/admin/courses')
        return
      }
      setFormData({
        title: data.title ?? '',
        description: data.description ?? '',
        status: data.status,
        formats: {
          online: Array.isArray((data as any).formats) ? (data as any).formats.includes('online') : data.format === 'online',
          offline: Array.isArray((data as any).formats) ? (data as any).formats.includes('offline') : data.format === 'offline',
        },
        price_type: data.price_type,
        price: data.price ? String(data.price) : '',
        location: data.location ?? '',
        starts_at: data.starts_at ?? '',
        ends_at: data.ends_at ?? '',
      })
      setLoading(false)
    }
    if (id) load()
  }, [id])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        format: formData.formats.offline && !formData.formats.online ? 'offline' : 'online',
        formats: [formData.formats.online ? 'online' : null, formData.formats.offline ? 'offline' : null].filter(Boolean),
        price_type: formData.price_type,
        location: formData.location.trim() || null,
        starts_at: formData.starts_at || null,
        ends_at: formData.ends_at || null,
        price: formData.price_type === 'paid' && formData.price ? Number(formData.price) : null,
      }
      const { error } = await supabase.from('courses').update(payload).eq('id', id)
      if (error) throw error
      router.push('/admin/courses')
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Ошибка при сохранении курса')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-gray-600">Загрузка...</div>

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Редактировать курс</h1>

      <form onSubmit={submit} className="card p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Название</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input w-full min-h-[140px]"
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
            />
          </div>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Сохраняем...' : 'Сохранить'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            Назад
          </button>
        </div>
      </form>
    </div>
  )
}
