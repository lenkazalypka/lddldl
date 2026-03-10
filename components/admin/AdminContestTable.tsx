'use client'

import { useMemo, useState } from 'react'
import { Edit, Trash2, Eye, Megaphone, Undo2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toaster'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import AdminTable from '@/components/admin/AdminTable'

interface Contest {
  id: string
  title: string
  status: 'active' | 'upcoming' | 'finished'
  phase?: 'draft' | 'active' | 'closed' | 'results'
  start_date: string
  end_date: string
  created_at: string
}

interface AdminContestTableProps {
  contests: Contest[]
}

export default function AdminContestTable({ contests }: AdminContestTableProps) {
  const [rows, setRows] = useState<Contest[]>(contests)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [tab, setTab] = useState<'all' | 'active' | 'upcoming' | 'finished'>('all')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmState, setConfirmState] = useState<{ id: string; title: string } | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  const filtered = useMemo(() => (tab === 'all' ? rows : rows.filter((c) => c.status === tab)), [rows, tab])

  const askDelete = (id: string, title: string) => {
    setConfirmState({ id, title })
    setConfirmOpen(true)
  }

  const handleDeleteConfirmed = async () => {
    if (!confirmState) return
    setDeletingId(confirmState.id)
    try {
      const { error } = await supabase.from('contests').delete().eq('id', confirmState.id)
      if (error) throw error
      setRows((prev) => prev.filter((c) => c.id !== confirmState.id))
      toast({ title: 'Конкурс удалён', variant: 'success' })
    } catch (error) {
      console.error(error)
      toast({ title: 'Не удалось удалить конкурс', variant: 'error' })
    } finally {
      setDeletingId(null)
      setConfirmOpen(false)
      setConfirmState(null)
    }
  }

  const setResultsPublished = async (id: string, publish: boolean) => {
    const nextPhase = publish ? 'results' : 'closed'
    try {
      const { error } = await supabase.from('contests').update({ phase: nextPhase }).eq('id', id)
      if (error) throw error
      setRows((prev) => prev.map((c) => (c.id === id ? { ...c, phase: nextPhase as Contest['phase'] } : c)))
      toast({ title: publish ? 'Итоги опубликованы' : 'Итоги скрыты', variant: 'success' })
    } catch (error) {
      console.error(error)
      toast({ title: 'Не удалось обновить итоги', variant: 'error' })
    }
  }

  const phaseBadge = (contest: Contest) => {
    const phase = contest.phase || 'draft'
    if (phase === 'results') return <Badge tone="success">Итоги опубликованы</Badge>
    if (phase === 'active') return <Badge tone="primary">Идёт приём</Badge>
    if (phase === 'closed') return <Badge tone="warning">Приём закрыт</Badge>
    return <Badge tone="neutral">Черновик</Badge>
  }

  return (
    <>
      <AdminTable
        toolbar={
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button variant={tab === 'all' ? 'primary' : 'secondary'} onClick={() => setTab('all')}>Все</Button>
              <Button variant={tab === 'active' ? 'primary' : 'secondary'} onClick={() => setTab('active')}>Активные</Button>
              <Button variant={tab === 'upcoming' ? 'primary' : 'secondary'} onClick={() => setTab('upcoming')}>Скоро</Button>
              <Button variant={tab === 'finished' ? 'primary' : 'secondary'} onClick={() => setTab('finished')}>Завершённые</Button>
            </div>
            <div className="text-sm text-[rgba(15,23,42,0.55)]">Показано: <span className="font-semibold text-[rgba(15,23,42,0.85)]">{filtered.length}</span></div>
          </div>
        }
        isEmpty={filtered.length === 0}
        empty={<><div className="text-[rgba(15,23,42,0.45)] text-lg">Конкурсы не найдены</div><p className="text-[rgba(15,23,42,0.55)] mt-2">Создайте первый конкурс</p></>}
      >
        <table className="min-w-full divide-y divide-[rgba(15,23,42,0.08)]">
          <thead className="bg-[rgba(15,23,42,0.03)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[rgba(15,23,42,0.55)] uppercase tracking-wider">Название</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[rgba(15,23,42,0.55)] uppercase tracking-wider">Статус</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[rgba(15,23,42,0.55)] uppercase tracking-wider">Итоги</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[rgba(15,23,42,0.55)] uppercase tracking-wider">Даты проведения</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[rgba(15,23,42,0.55)] uppercase tracking-wider">Создан</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[rgba(15,23,42,0.55)] uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[rgba(15,23,42,0.08)]">
            {filtered.map((contest) => (
              <tr key={contest.id} className="hover:bg-[rgba(15,23,42,0.03)]">
                <td className="px-6 py-4"><div className="font-medium text-[rgba(15,23,42,0.92)]">{contest.title}</div></td>
                <td className="px-6 py-4"><Badge tone={contest.status === 'active' ? 'success' : contest.status === 'upcoming' ? 'info' : 'dark'}>{contest.status === 'active' ? 'Активный' : contest.status === 'upcoming' ? 'Скоро' : 'Завершён'}</Badge></td>
                <td className="px-6 py-4">{phaseBadge(contest)}<div className="mt-2 flex flex-wrap gap-2">{contest.phase === 'results' ? <Button variant="secondary" onClick={() => setResultsPublished(contest.id, false)}><Undo2 className="h-4 w-4" /> Скрыть</Button> : <Button onClick={() => setResultsPublished(contest.id, true)}><Megaphone className="h-4 w-4" /> Опубликовать</Button>}</div></td>
                <td className="px-6 py-4"><div className="text-sm text-[rgba(15,23,42,0.92)]">{new Date(contest.start_date).toLocaleDateString('ru-RU')} {' - '} {new Date(contest.end_date).toLocaleDateString('ru-RU')}</div></td>
                <td className="px-6 py-4 text-sm text-[rgba(15,23,42,0.55)]">{new Date(contest.created_at).toLocaleDateString('ru-RU')}</td>
                <td className="px-6 py-4"><div className="flex items-center space-x-2"><Link href={`/contests/${contest.id}`} target="_blank" className="p-1 text-gray-400 hover:text-gray-600" title="Посмотреть на сайте"><Eye size={18} /></Link><Link href={`/admin/contests/${contest.id}/edit`} className="p-1 text-blue-400 hover:text-blue-600" title="Редактировать"><Edit size={18} /></Link><button onClick={() => askDelete(contest.id, contest.title)} disabled={deletingId === contest.id} className="p-1 text-red-400 hover:text-red-600 disabled:opacity-50" title="Удалить"><Trash2 size={18} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTable>

      <ConfirmDialog
        open={confirmOpen}
        title="Удалить конкурс?"
        description={confirmState ? `«${confirmState.title}» будет удалён без возможности восстановления.` : ''}
        confirmText="Удалить"
        variant="danger"
        onCancel={() => { setConfirmOpen(false); setConfirmState(null) }}
        onConfirm={handleDeleteConfirmed}
      />
    </>
  )
}
