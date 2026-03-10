'use client'

import { useState } from 'react'
import { Edit, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toaster'

interface Course {
  id: string
  title: string
  status: 'draft' | 'published'
  format: 'online' | 'offline'
  formats?: string[] | null
  price_type: 'free' | 'paid'
  price: number | null
  starts_at: string | null
  ends_at: string | null
  created_at: string
}

export default function AdminCourseTable({ courses }: { courses: Course[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить курс?')) return
    setDeletingId(id)
    try {
      const { error } = await supabase.from('courses').delete().eq('id', id)
      if (error) throw error
      window.location.reload()
    } catch (e) {
      console.error(e)
      toast({
        title: 'Не удалось удалить курс',
        description: 'Проверь права доступа и попробуй ещё раз.',
        variant: 'error',
      })
    } finally {
      setDeletingId(null)
    }
  }

  const pill = (text: string, tone: 'gray' | 'blue' | 'green' | 'amber' = 'gray') => {
    const cls =
      tone === 'blue'
        ? 'bg-blue-50 text-blue-700 border-blue-200'
        : tone === 'green'
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : tone === 'amber'
            ? 'bg-amber-50 text-amber-800 border-amber-200'
            : 'bg-slate-50 text-slate-700 border-slate-200'
    return <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${cls}`}>{text}</span>
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Курс</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Теги</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {courses.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{c.title}</div>
                  <div className="mt-1 text-sm text-gray-500">
                    {c.starts_at ? `Старт: ${c.starts_at}` : 'Старт: —'} • {c.ends_at ? `Финиш: ${c.ends_at}` : 'Финиш: —'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {pill(c.status === 'published' ? 'Опубликован' : 'Черновик', c.status === 'published' ? 'green' : 'gray')}
                    {pill(
                      (c.formats && c.formats.length ? c.formats : [c.format]).includes('online') &&
                        (c.formats && c.formats.length ? c.formats : [c.format]).includes('offline')
                        ? 'Онлайн / Оффлайн'
                        : c.format === 'online'
                          ? 'Онлайн'
                          : 'Оффлайн',
                      'blue'
                    )}
                    {pill(c.price_type === 'free' ? 'Бесплатно' : `Платно${c.price ? ` • ${c.price} ₽` : ''}`, c.price_type === 'free' ? 'green' : 'amber')}
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <div className="inline-flex items-center gap-2">
                    <Link href={`/courses/${c.id}`} className="btn-secondary px-3 py-2">
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link href={`/admin/courses/${c.id}`} className="btn-secondary px-3 py-2">
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={deletingId === c.id}
                      className="btn-secondary px-3 py-2 text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr>
                <td className="px-6 py-10 text-center text-gray-500" colSpan={3}>
                  Пока нет курсов
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
