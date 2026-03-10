'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, X } from 'lucide-react'

export default function NewNewsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_file: null as File | null,
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Файл должен быть меньше 5MB')
        return
      }
      setFormData({ ...formData, image_file: file })
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setFormData({ ...formData, image_file: null })
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrl = null

      // Загружаем изображение если есть
      if (formData.image_file) {
        const fileExt = formData.image_file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `news/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('contest-photos')
          .upload(filePath, formData.image_file)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('contest-photos')
          .getPublicUrl(filePath)

        imageUrl = urlData.publicUrl
      }

      // Создаём новость
      const { error } = await supabase
        .from('news')
        .insert({
          title: formData.title,
          content: formData.content,
          image_url: imageUrl,
          published_at: new Date().toISOString(),
        })

      if (error) throw error

      router.push('/admin/news')
      router.refresh()
    } catch (error: any) {
      console.error('Error creating news:', error)
      alert(error.message || 'Ошибка при создании новости')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Добавление новости</h1>

      <div className="card">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Заголовок новости *
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
              Содержание *
            </label>
            <textarea
              required
              rows={10}
              className="input-field"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Введите текст новости..."
            />
          </div>

          {/* Загрузка изображения */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Изображение для новости
            </label>
            {imagePreview ? (
              <div className="relative w-64 h-48 rounded-lg overflow-hidden mb-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
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
                    Загрузите изображение
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF до 5MB</p>
              </div>
            )}
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
              {loading ? 'Публикация...' : 'Опубликовать новость'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}