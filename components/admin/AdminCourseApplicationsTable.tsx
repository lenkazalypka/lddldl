'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toaster'

type AppRow = {
  id: string
  created_at: string
  course_id: string
  full_name: string
  email: string
  phone: string | null
  city: string | null
  selected_format: 'online' | 'offline'
  comment: string | null
  status: 'new' | 'in_progress' | 'done'
  course?: { title: string } | null
}

const statusLabel: Record<AppRow['status'], string> = {
  new: 'Новая',
  in_progress: 'В работе',
  done: 'Закрыта',
}

export default function AdminCourseApplicationsTable({ rows }: { rows: AppRow[] }) {
  const supabase = createClient()
  const [busy, setBusy] = useState<string | null>(null)
  const { toast } = useToast()

  const setStatus = async (id: string, status: AppRow['status']) => {
    setBusy(id)
    try {
      const { error } = await supabase.from('course_applications').update({ status } as any).eq('id', id)
      if (error) throw error
      window.location.reload()
    } catch (e) {
      console.error(e)
      toast({
        title: 'Не удалось обновить статус',
        description: 'Попробуй ещё раз.',
        variant: 'error',
      })
    } finally {
      setBusy(null)
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Заявка</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Курс</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Теги</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{r.full_name}</div>
                  <div className="mt-1 text-sm text-gray-600">{r.email}{r.phone ? ` • ${r.phone}` : ''}</div>
                  <div className="mt-1 text-xs text-gray-500">{new Date(r.created_at).toLocaleString()}</div>
                  {r.comment && <div className="mt-2 text-sm text-gray-700">💬 {r.comment}</div>}
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{r.course?.title || '—'}</div>
                  <div className="mt-1 text-sm text-gray-600">{r.city || '—'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {pill(statusLabel[r.status], r.status === 'done' ? 'green' : r.status === 'in_progress' ? 'amber' : 'gray')}
                    {pill(r.selected_format === 'online' ? '🖥 Онлайн' : '🏫 Оффлайн', 'blue')}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      disabled={busy === r.id}
                      onClick={() => setStatus(r.id, 'new')}
                      className="btn-secondary px-3 py-2"
                    >
                      Новая
                    </button>
                    <button
                      disabled={busy === r.id}
                      onClick={() => setStatus(r.id, 'in_progress')}
                      className="btn-secondary px-3 py-2"
                    >
                      В работе
                    </button>
                    <button
                      disabled={busy === r.id}
                      onClick={() => setStatus(r.id, 'done')}
                      className="btn-secondary px-3 py-2"
                    >
                      Закрыть
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-6 py-10 text-center text-gray-500" colSpan={4}>
                  Пока нет заявок на курсы
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
