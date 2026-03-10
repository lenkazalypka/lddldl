'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  X,
  Trash2,
  Filter,
  Plus,
  Trophy,
  CheckSquare,
  Square,
  RotateCcw,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toaster'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import WinnerEditDialog from '@/components/admin/WinnerEditDialog'

interface ContestLite {
  id: string
  title: string
}

interface Work {
  id: string
  contest_id: string
  image_url: string
  category: 'winner' | 'participant'
  name: string
  surname_initial: string
  age: number
  city: string
  work_title: string | null
  place: number | null
  nomination: string | null
  approved: boolean
  uploaded_at: string
  certificate_number?: string | null
  contests: { title: string } | null
}

type ConfirmPayload =
  | { kind: 'bulkApprove'; count: number }
  | { kind: 'bulkDelete'; count: number }
  | { kind: 'deleteOne'; id: string; title: string }
  | null

export default function AdminWorksPage() {
  const supabase = useMemo(() => createClient(), [])
  const { toast } = useToast()

  const [works, setWorks] = useState<Work[]>([])
  const [contests, setContests] = useState<ContestLite[]>([])
  const [loading, setLoading] = useState(true)

  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [resettingId, setResettingId] = useState<string | null>(null)

  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('pending')
  const [contestFilter, setContestFilter] = useState<string>('all')
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({})

  const [winnerOpen, setWinnerOpen] = useState(false)
  const [winnerTarget, setWinnerTarget] = useState<Work | null>(null)
  const [winnerSaving, setWinnerSaving] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmPayload, setConfirmPayload] = useState<ConfirmPayload>(null)

  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    contest_id: '',
    file: null as File | null,
    name: '',
    surname_initial: '',
    age: '',
    city: '',
    work_title: '',
  })

  useEffect(() => {
    loadContests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadWorks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, contestFilter])

  const loadContests = async () => {
    const { data, error } = await (supabase as any)
      .from('contests')
      .select('id,title')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      toast({ title: 'Не удалось загрузить конкурсы', variant: 'error' })
      return
    }

    const list = ((data as ContestLite[]) || [])
    setContests(list)

    if (list.length && !form.contest_id) {
      setForm((p) => ({ ...p, contest_id: list[0].id }))
    }
  }

  const loadWorks = async () => {
    setLoading(true)

    let query = (supabase as any)
      .from('contest_photos')
      .select('*, contests(title)')
      .order('uploaded_at', { ascending: false })

    if (filter === 'approved') query = query.eq('approved', true)
    if (filter === 'pending') query = query.eq('approved', false)
    if (contestFilter !== 'all') query = query.eq('contest_id', contestFilter)

    const { data, error } = await query

    if (error) {
      console.error(error)
      toast({ title: 'Не удалось загрузить работы', variant: 'error' })
      setLoading(false)
      return
    }

    const rows = ((data as Work[]) || []).map((row) => ({ ...row }))

    const paths = rows
      .map((w) => w.image_url)
      .filter((u) => u && !String(u).startsWith('http'))

    if (paths.length) {
      try {
        const res = await fetch('/api/admin/storage-signed-urls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bucket: 'contest-photos',
            paths,
            expiresIn: 60 * 30,
          }),
        })

        const json = await res.json()
        const map = (json?.urls ?? {}) as Record<string, string>

        rows.forEach((w) => {
          if (w.image_url && !String(w.image_url).startsWith('http') && map[w.image_url]) {
            w.image_url = map[w.image_url]
          }
        })
      } catch (e) {
        console.warn('Failed to sign urls', e)
      }
    }

    setWorks(rows)
    setSelectedIds({})
    setLoading(false)
  }

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const selectedList = Object.entries(selectedIds)
    .filter(([, value]) => value)
    .map(([id]) => id)

  const selectedCount = selectedList.length
  const allVisibleSelected = works.length > 0 && works.every((w) => selectedIds[w.id])

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      const next = { ...selectedIds }
      works.forEach((w) => {
        delete next[w.id]
      })
      setSelectedIds(next)
    } else {
      const next = { ...selectedIds }
      works.forEach((w) => {
        next[w.id] = true
      })
      setSelectedIds(next)
    }
  }

  const bulkApprove = async () => {
    if (!selectedList.length) return
    setConfirmPayload({ kind: 'bulkApprove', count: selectedList.length })
    setConfirmOpen(true)
  }

  const bulkDelete = async () => {
    if (!selectedList.length) return
    setConfirmPayload({ kind: 'bulkDelete', count: selectedList.length })
    setConfirmOpen(true)
  }

  const uploadToStorage = async (file: File) => {
    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const filePath = `contest-works/${fileName}`

    const { error } = await (supabase as any).storage
      .from('contest-photos')
      .upload(filePath, file)

    if (error) throw error
    return filePath
  }

  const handleApprove = async (id: string, approved: boolean) => {
    setApprovingId(id)
    try {
      const { error } = await (supabase as any)
        .from('contest_photos')
        .update({ approved })
        .eq('id', id)

      if (error) throw error

      setWorks((prev) => prev.map((w) => (w.id === id ? { ...w, approved } : w)))
      toast({
        title: approved ? 'Работа опубликована' : 'Публикация снята',
        variant: 'success',
      })
    } catch (e) {
      console.error(e)
      toast({ title: 'Ошибка при обновлении работы', variant: 'error' })
    } finally {
      setApprovingId(null)
    }
  }

  const handleResetDocument = async (id: string) => {
    try {
      setResettingId(id)

      const res = await fetch(`/api/admin/works/${id}/reset-document`, {
        method: 'POST',
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error || 'Не удалось сбросить документ')
      }

      toast({
        title: 'Документ сброшен — при следующем скачивании сгенерируется заново',
        variant: 'success',
      })
      await loadWorks()
    } catch (e: any) {
      console.error(e)
      toast({ title: e?.message || 'Ошибка', variant: 'error' })
    } finally {
      setResettingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    const work = works.find((x) => x.id === id)

    setConfirmPayload({
      kind: 'deleteOne',
      id,
      title: work
        ? `${work.name} ${work.surname_initial}. — ${work.work_title || 'работа'}`
        : 'работу',
    })
    setConfirmOpen(true)
  }

  const handleMetaUpdate = async (id: string, patch: Partial<Work>) => {
    try {
      const { error } = await (supabase as any)
        .from('contest_photos')
        .update(patch)
        .eq('id', id)

      if (error) throw error

      setWorks((prev) => prev.map((w) => (w.id === id ? ({ ...w, ...patch } as Work) : w)))
    } catch (e) {
      console.error(e)
      toast({ title: 'Ошибка при обновлении', variant: 'error' })
      throw e
    }
  }

  const deleteWorkNow = async (id: string) => {
    setDeletingId(id)
    try {
      const { error } = await (supabase as any)
        .from('contest_photos')
        .delete()
        .eq('id', id)

      if (error) throw error

      setWorks((prev) => prev.filter((w) => w.id !== id))
      toast({ title: 'Работа удалена', variant: 'success' })
    } catch (e) {
      console.error(e)
      toast({ title: 'Ошибка при удалении', variant: 'error' })
    } finally {
      setDeletingId(null)
    }
  }

  const resetForm = () => {
    setForm((prev) => ({
      ...prev,
      file: null,
      name: '',
      surname_initial: '',
      age: '',
      city: '',
      work_title: '',
    }))
  }

  const addWork = async () => {
    if (
      !form.contest_id ||
      !form.file ||
      !form.name ||
      !form.surname_initial ||
      !form.age ||
      !form.city
    ) {
      toast({ title: 'Заполни все поля и выбери файл', variant: 'info' })
      return
    }

    setSaving(true)

    try {
      const image_url = await uploadToStorage(form.file)

      const payload = {
        contest_id: form.contest_id,
        image_url,
        category: 'participant',
        name: form.name.trim(),
        surname_initial: form.surname_initial.trim().slice(0, 1).toUpperCase(),
        age: Number(form.age),
        city: form.city.trim(),
        work_title: form.work_title?.trim() || null,
        approved: false,
      }

      const { error } = await (supabase as any)
        .from('contest_photos')
        .insert(payload)

      if (error) throw error

      setOpen(false)
      resetForm()
      await loadWorks()
      toast({ title: 'Работа добавлена', variant: 'success' })
    } catch (e) {
      console.error(e)
      toast({ title: 'Ошибка при добавлении работы', variant: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const openWinnerDialog = (work: Work) => {
    setWinnerTarget(work)
    setWinnerOpen(true)
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[rgba(15,23,42,0.94)]">Работы участников</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone={filter === 'pending' ? 'warning' : 'neutral'}>На модерации</Badge>
            <Badge tone={filter === 'approved' ? 'success' : 'neutral'}>Опубликованные</Badge>
            <Badge tone={filter === 'all' ? 'primary' : 'neutral'}>Все</Badge>
            {selectedCount > 0 ? <Badge tone="dark">Выбрано: {selectedCount}</Badge> : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-[rgba(15,23,42,0.12)] bg-white px-3 py-2">
              <Filter className="h-4 w-4 text-[rgba(15,23,42,0.55)]" />
              <select
                className="border-0 bg-transparent p-0 text-sm font-semibold text-[rgba(15,23,42,0.82)] focus:ring-0"
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'approved' | 'pending')}
              >
                <option value="pending">На модерации</option>
                <option value="approved">Опубликованные</option>
                <option value="all">Все</option>
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-[rgba(15,23,42,0.12)] bg-white px-3 py-2">
              <span className="text-sm font-semibold text-[rgba(15,23,42,0.55)]">Конкурс</span>
              <select
                className="border-0 bg-transparent p-0 text-sm font-semibold text-[rgba(15,23,42,0.82)] focus:ring-0"
                value={contestFilter}
                onChange={(e) => setContestFilter(e.target.value)}
              >
                <option value="all">Все</option>
                {contests.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={toggleSelectAllVisible}>
              {allVisibleSelected ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              Выбрать всё
            </Button>

            <Button
              variant="secondary"
              onClick={bulkApprove}
              className={selectedCount ? '' : 'pointer-events-none opacity-50'}
            >
              <Check className="h-4 w-4" />
              Опубликовать
            </Button>

            <Button
              variant="ghost"
              onClick={bulkDelete}
              className={
                selectedCount
                  ? 'text-[rgba(220,38,38,0.92)]'
                  : 'pointer-events-none opacity-50'
              }
            >
              <Trash2 className="h-4 w-4" />
              Удалить
            </Button>

            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              Добавить из почты
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--primary)]" />
        </div>
      ) : works.length === 0 ? (
        <div className="card p-10 text-center text-gray-600">Работ пока нет.</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[rgba(15,23,42,0.08)]">
              <thead className="bg-[rgba(15,23,42,0.03)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[rgba(15,23,42,0.55)]">
                    <button
                      type="button"
                      onClick={toggleSelectAllVisible}
                      className="inline-flex items-center gap-2"
                    >
                      {allVisibleSelected ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[rgba(15,23,42,0.55)]">
                    Работа
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[rgba(15,23,42,0.55)]">
                    Участник
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[rgba(15,23,42,0.55)]">
                    Конкурс
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[rgba(15,23,42,0.55)]">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[rgba(15,23,42,0.55)]">
                    Результат
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-[rgba(15,23,42,0.55)]">
                    Действия
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[rgba(15,23,42,0.08)] bg-white">
                {works.map((work) => (
                  <tr key={work.id} className="hover:bg-[rgba(15,23,42,0.03)]">
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => toggleSelected(work.id)}
                        className="inline-flex items-center"
                      >
                        {selectedIds[work.id] ? (
                          <CheckSquare className="h-5 w-5 text-[var(--primary)]" />
                        ) : (
                          <Square className="h-5 w-5 text-[rgba(15,23,42,0.35)]" />
                        )}
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <a
                        href={work.image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2"
                      >
                        <img
                          src={work.image_url}
                          alt=""
                          className="h-14 w-14 rounded-xl border object-cover"
                        />
                        <div className="min-w-0">
                          <div className="max-w-[220px] truncate font-semibold text-[rgba(15,23,42,0.94)]">
                            {work.work_title || 'Без названия'}
                          </div>
                          <div className="text-xs text-[rgba(15,23,42,0.55)]">
                            ID: {work.id.slice(0, 8)}…
                          </div>
                        </div>
                      </a>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-[rgba(15,23,42,0.94)]">
                        {work.name} {work.surname_initial}.
                      </div>
                      <div className="text-sm text-gray-600">
                        {work.age} лет • {work.city}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {work.contests?.title || work.contest_id}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          work.approved
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {work.approved ? 'Опубликовано' : 'Модерация'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {work.category === 'winner' ? (
                          <>
                            <Badge tone="warning">Победитель</Badge>
                            {work.place ? (
                              <span className="text-sm text-[rgba(15,23,42,0.75)]">
                                Место: <span className="font-semibold">{work.place}</span>
                              </span>
                            ) : null}
                            {work.nomination ? (
                              <span className="text-sm text-[rgba(15,23,42,0.55)]">
                                {work.nomination}
                              </span>
                            ) : null}
                          </>
                        ) : (
                          <Badge tone="neutral">Участник</Badge>
                        )}

                        <Button variant="secondary" onClick={() => openWinnerDialog(work)}>
                          <Trophy className="h-4 w-4" /> Результат
                        </Button>
                      </div>
                    </td>

                    <td className="space-x-2 px-6 py-4 text-right">
                      {!work.approved ? (
                        <Button
                          onClick={() => handleApprove(work.id, true)}
                          disabled={approvingId === work.id}
                          className="!px-3 !py-2"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          onClick={() => handleApprove(work.id, false)}
                          disabled={approvingId === work.id}
                          className="!px-3 !py-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        variant="secondary"
                        onClick={() => handleResetDocument(work.id)}
                        disabled={resettingId === work.id}
                        className="!px-3 !py-2"
                        title="Сбросить PDF (будет сгенерирован заново при скачивании)"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() => handleDelete(work.id)}
                        disabled={deletingId === work.id}
                        className="!px-3 !py-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div className="font-bold text-[rgba(15,23,42,0.94)]">
                Добавить работу (из письма)
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Конкурс</label>
                <select
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  value={form.contest_id}
                  onChange={(e) => setForm((p) => ({ ...p, contest_id: e.target.value }))}
                >
                  {contests.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Имя</label>
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Буква фамилии</label>
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  value={form.surname_initial}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, surname_initial: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Возраст</label>
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  value={form.age}
                  onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Город</label>
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  value={form.city}
                  onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">
                  Название работы (опционально)
                </label>
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  value={form.work_title}
                  onChange={(e) => setForm((p) => ({ ...p, work_title: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Файл работы</label>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-1 w-full"
                  onChange={(e) =>
                    setForm((p) => ({ ...p, file: e.target.files?.[0] ?? null }))
                  }
                />
                <p className="mt-1 text-xs text-[rgba(15,23,42,0.55)]">
                  После добавления работа попадёт в “На модерации”.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button
                onClick={() => {
                  setOpen(false)
                  resetForm()
                }}
                className="rounded-xl bg-gray-100 px-4 py-2 font-semibold text-gray-800 hover:bg-gray-200"
              >
                Отмена
              </button>

              <button
                onClick={addWork}
                disabled={saving}
                className="rounded-xl bg-vector-electric-blue px-4 py-2 font-semibold text-white hover:opacity-90"
              >
                {saving ? 'Сохраняю…' : 'Добавить'}
              </button>
            </div>
          </div>
        </div>
      )}

      <WinnerEditDialog
        open={winnerOpen}
        title={
          winnerTarget
            ? `${winnerTarget.name} ${winnerTarget.surname_initial}. — ${
                winnerTarget.work_title || 'Без названия'
              }`
            : ''
        }
        initial={{
          category: winnerTarget?.category ?? 'participant',
          place: winnerTarget?.place ?? null,
          nomination: winnerTarget?.nomination ?? null,
        }}
        saving={winnerSaving}
        onClose={() => {
          setWinnerOpen(false)
          setWinnerTarget(null)
        }}
        onSave={async (next) => {
          if (!winnerTarget) return

          setWinnerSaving(true)
          try {
            const patch: Partial<Work> = {
              category: next.category,
              place: next.category === 'winner' ? next.place : null,
              nomination: next.category === 'winner' ? next.nomination : null,
            }

            await handleMetaUpdate(winnerTarget.id, patch)
            setWinnerTarget((prev) => (prev ? ({ ...prev, ...patch } as Work) : prev))
            toast({ title: 'Результат сохранён', variant: 'success' })
            setWinnerOpen(false)
            setWinnerTarget(null)
          } catch (e) {
            console.error(e)
            toast({ title: 'Не удалось сохранить результат', variant: 'error' })
          } finally {
            setWinnerSaving(false)
          }
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={
          confirmPayload?.kind === 'bulkApprove'
            ? 'Опубликовать выбранные работы?'
            : confirmPayload?.kind === 'bulkDelete'
              ? 'Удалить выбранные работы?'
              : 'Удалить работу?'
        }
        description={
          confirmPayload?.kind === 'bulkApprove'
            ? `Будут опубликованы ${confirmPayload.count} работ.`
            : confirmPayload?.kind === 'bulkDelete'
              ? `Будут удалены ${confirmPayload.count} работ без возможности восстановления.`
              : confirmPayload?.kind === 'deleteOne'
                ? `«${confirmPayload.title}» будет удалена без возможности восстановления.`
                : ''
        }
        confirmText={confirmPayload?.kind === 'bulkApprove' ? 'Опубликовать' : 'Удалить'}
        variant={confirmPayload?.kind === 'bulkApprove' ? 'default' : 'danger'}
        onCancel={() => {
          setConfirmOpen(false)
          setConfirmPayload(null)
        }}
        onConfirm={async () => {
          const payload = confirmPayload
          setConfirmOpen(false)
          setConfirmPayload(null)

          if (!payload) return

          if (payload.kind === 'bulkApprove') {
            setApprovingId('bulk')
            try {
              const { error } = await (supabase as any)
                .from('contest_photos')
                .update({ approved: true })
                .in('id', selectedList)

              if (error) throw error

              await loadWorks()
              toast({ title: 'Работы опубликованы', variant: 'success' })
            } catch (e) {
              console.error(e)
              toast({ title: 'Ошибка при публикации работ', variant: 'error' })
            } finally {
              setApprovingId(null)
            }
          }

          if (payload.kind === 'bulkDelete') {
            setDeletingId('bulk')
            try {
              const { error } = await (supabase as any)
                .from('contest_photos')
                .delete()
                .in('id', selectedList)

              if (error) throw error

              await loadWorks()
              toast({ title: 'Работы удалены', variant: 'success' })
            } catch (e) {
              console.error(e)
              toast({ title: 'Ошибка при удалении работ', variant: 'error' })
            } finally {
              setDeletingId(null)
            }
          }

          if (payload.kind === 'deleteOne') {
            await deleteWorkNow(payload.id)
          }
        }}
      />
    </div>
  )
}