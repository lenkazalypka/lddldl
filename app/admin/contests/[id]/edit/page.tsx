'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Loader } from 'lucide-react'
import { AUDIENCE_UI, normalizeAudiences, type AudienceKey } from '@/lib/audience'

export default function EditContestPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'active' as 'active' | 'upcoming' | 'finished',
    cover_url: '',
    cover_file: null as File | null,
    audiences: ['all'] as AudienceKey[],
  })

  useEffect(() => {
    loadContest()
  }, [params.id])

  const loadContest = async () => {
    setLoading(true)
    try {
      const { data: contest } = await supabase
        .from('contests')
        .select('*')
        .eq('id', params.id)
        .single()

      if (contest) {
        setFormData({
          title: contest.title,
          description: contest.description,
          start_date: contest.start_date,
          end_date: contest.end_date,
          status: contest.status,
          cover_url: contest.cover_url || '',
          cover_file: null,
          audiences: normalizeAudiences(contest.audiences),
        })
        if (contest.cover_url) {
          setCoverPreview(contest.cover_url)
        }
      }
    } catch (error) {
      console.error('Error loading contest:', error)
      alert('Ошибка при загрузке конкурса')
    } finally {
      setLoading(false)
    }
  }

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

  const removeCover = () => {
    setFormData({ ...formData, cover_file: null, cover_url: '' })
    setCoverPreview(null)
  }

  const toggleAudience = (key: AudienceKey) => {
    setFormData((prev) => {
      const has = prev.audiences.includes(key)
      let next = has ? prev.audiences.filter((a) => a !== key) : [...prev.audiences, key]

      if (key === 'all' && !has) next = ['all']
      if (key !== 'all' && !has) next = next.filter((a) => a !== 'all')
      if (next.length === 0) next = ['all']
      return { ...prev, audiences: next }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      let coverUrl = formData.cover_url

      // Если загружена новая обложка
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

      // Обновляем конкурс
      const { error } = await supabase
        .from('contests')
        .update({
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
        .eq('id', params.id)

      if (error) throw error

      router.push('/admin/contests')
      router.refresh()
    } catch (error: any) {
      console.error('Error updating contest:', error)
      alert(error.message || 'Ошибка при обновлении конкурса')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-vector-electric-blue" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Редактирование конкурса</h1>

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
              <div className="relative w-64 h-48 rounded-lg overflow-hidden mb-4">
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
              disabled={saving}
              className="btn-primary px-6 py-3"
            >
              {saving ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}