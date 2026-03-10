'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import clsx from 'clsx'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toaster'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import AdminTable from '@/components/admin/AdminTable'

interface NewsItem {
  id: string
  title: string
  content: string
  image_url: string | null
  published_at: string
}

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmState, setConfirmState] = useState<{ id: string; title: string } | null>(null)

  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    loadNews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadNews = async () => {
    setLoading(true)
    const { data } = await supabase.from('news').select('*').order('published_at', { ascending: false })
    setNews((data as any) || [])
    setLoading(false)
  }

  const askDelete = (id: string) => {
    const item = news.find((n) => n.id === id)
    setConfirmState({ id, title: item?.title ?? 'Новость' })
    setConfirmOpen(true)
  }

  const deleteNow = async () => {
    if (!confirmState) return
    const id = confirmState.id
    setDeletingId(id)
    try {
      const { error } = await supabase.from('news').delete().eq('id', id)
      if (error) throw error
      setNews((prev) => prev.filter((n) => n.id !== id))
      toast({ title: 'Новость удалена', variant: 'success' })
    } catch (e) {
      console.error(e)
      toast({ title: 'Ошибка при удалении новости', variant: 'error' })
    } finally {
      setDeletingId(null)
      setConfirmOpen(false)
      setConfirmState(null)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[rgba(15,23,42,0.94)]">Новости</h1>
        <Link
          href="/admin/news/new"
          className={clsx(
            'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200',
            'bg-[var(--primary)] text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
          )}
        >
          <Plus className="h-5 w-5" />
          Добавить новость
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]" />
        </div>
      ) : (
        <>
          <AdminTable
            isEmpty={news.length === 0}
            empty={
              <>
                <div className="text-[rgba(15,23,42,0.45)] text-lg">Новостей нет</div>
                <p className="text-[rgba(15,23,42,0.55)] mt-2">Добавьте первую новость</p>
              </>
            }
          >
            <table className="min-w-full divide-y divide-[rgba(15,23,42,0.08)]">
              <thead className="bg-[rgba(15,23,42,0.03)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgba(15,23,42,0.55)] uppercase tracking-wider">
                    Заголовок
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgba(15,23,42,0.55)] uppercase tracking-wider">
                    Изображение
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgba(15,23,42,0.55)] uppercase tracking-wider">
                    Дата публикации
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgba(15,23,42,0.55)] uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[rgba(15,23,42,0.08)]">
                {news.map((item) => (
                  <tr key={item.id} className="hover:bg-[rgba(15,23,42,0.03)]">
                    <td className="px-6 py-4">
                      <div className="font-medium text-[rgba(15,23,42,0.94)]">{item.title}</div>
                      <div className="text-sm text-[rgba(15,23,42,0.55)] mt-1 line-clamp-2">
                        {item.content.substring(0, 100)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.image_url ? (
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-[rgba(15,23,42,0.03)] border border-[rgba(15,23,42,0.10)]">
                          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <span className="text-[rgba(15,23,42,0.45)] text-sm">Нет изображения</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-[rgba(15,23,42,0.55)]">
                      {new Date(item.published_at).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/news/${item.id}`}
                          target="_blank"
                          className="p-1 text-[rgba(15,23,42,0.35)] hover:text-[rgba(15,23,42,0.65)]"
                          title="Посмотреть на сайте"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          href={`/admin/news/${item.id}/edit`}
                          className="p-1 text-blue-400 hover:text-blue-600"
                          title="Редактировать"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => askDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="p-1 text-red-400 hover:text-red-600 disabled:opacity-50"
                          title="Удалить"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTable>

          <ConfirmDialog
            open={confirmOpen}
            title="Удалить новость?"
            description={confirmState ? `«${confirmState.title}» будет удалена без возможности восстановления.` : ''}
            confirmText="Удалить"
            variant="danger"
            onCancel={() => {
              setConfirmOpen(false)
              setConfirmState(null)
            }}
            onConfirm={deleteNow}
          />
        </>
      )}
    </div>
  )
}
