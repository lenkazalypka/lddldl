'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, X } from 'lucide-react'
import { AUDIENCE_UI, type AudienceKey } from '@/lib/audience'

export default function NewContestPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'active' as 'active' | 'upcoming' | 'finished',
    cover_file: null as File | null,
    audiences: ['all'] as AudienceKey[],
    submission_email: 'sriovector@mail.ru',
    results_published: false,
    results_date: '',
  })

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Файл должен быть меньше 5MB')
        return
      }
      setFormData({ ...formData, cover_file: file })
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const toggleAudience = (key: AudienceKey) => {
    setFormData((prev) => {
      const has = prev.audiences.includes(key)
      let next = has ? prev.audiences.filter((a) => a !== key) : [...prev.audiences, key]

      // rule: if 'all' selected -> only 'all'
      if (key === 'all' && !has) next = ['all']
      // if selecting something else -> remove 'all'
      if (key !== 'all' && !has) next = next.filter((a) => a !== 'all')

      if (next.length === 0) next = ['all']
      return { ...prev, audiences: next }
    })
  }

  const removeCover = () => {
    setFormData({ ...formData, cover_file: null })
    setCoverPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let coverUrl = null

      // Загружаем обложку если есть
      if (formData.cover_file) {
        const fileExt = formData.cover_file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `contest-covers/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('contest-photos')
          .upload(filePath, formData.cover_file)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('contest-photos')
          .getPublicUrl(filePath)

        coverUrl = urlData.publicUrl
      }

      // Создаём конкурс
      const { error } = await supabase
        .from('contests')
        .insert({
          title: formData.title,
          description: formData.description,
          cover_url: coverUrl,
          start_date: formData.start_date,
          end_date: formData.end_date,
          status: formData.status,
          audiences: formData.audiences,
          submission_email: formData.submission_email || null,
          results_published: formData.results_published,
          results_date: formData.results_date ? new Date(formData.results_date).toISOString() : null,
        })

      if (error) throw error

      router.push('/admin/contests')
      router.refresh()
    } catch (error: any) {
      console.error('Error creating contest:', error)
      alert(error.message || 'Ошибка при создании конкурса')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Создание конкурса</h1>

      <div className="card">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название конкурса *
            </label>
            <input
              type="text"
              required
              className="input-field"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание *
            </label>
            <textarea
              required
              rows={6}
              className="input-field"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Для кого конкурс *
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(AUDIENCE_UI) as AudienceKey[]).map((k) => {
                const active = formData.audiences.includes(k)
                const chip = AUDIENCE_UI[k]
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => toggleAudience(k)}
                    className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${active ? chip.tone : 'bg-white text-[rgba(15,23,42,0.70)] border-[rgba(16,24,40,0.12)]'}`}
                  >
                    {chip.label}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Если выбран «🌍 Все желающие», остальные аудитории отключаются автоматически.
            </p>
          </div>

          {/* Загрузка обложки */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Обложка конкурса
            </label>
            {coverPreview ? (
              <div className="relative w-64 h-48 rounded-lg overflow-hidden">
                <img
                  src={coverPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeCover}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <label className="cursor-pointer">
                  <span className="text-vector-electric-blue hover:underline">
                    Загрузите обложку
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF до 5MB</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата начала *
              </label>
              <input
                type="date"
                required
                className="input-field"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата окончания *
              </label>
              <input
                type="date"
                required
                className="input-field"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Статус *
            </label>
            <select
              className="input-field"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="active">Активный</option>
              <option value="upcoming">Предстоящий</option>
              <option value="finished">Завершённый</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-6 py-3"
            >
              {loading ? 'Создание...' : 'Создать конкурс'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}