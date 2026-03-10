'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'

type WorkWinnerFields = {
  category: 'winner' | 'participant'
  place: number | null
  nomination: string | null
}

export default function WinnerEditDialog({
  open,
  title,
  initial,
  onClose,
  onSave,
  saving,
}: {
  open: boolean
  title: string
  initial: WorkWinnerFields
  onClose: () => void
  onSave: (next: WorkWinnerFields) => void
  saving?: boolean
}) {
  const [category, setCategory] = useState<'winner' | 'participant'>(initial.category)
  const [place, setPlace] = useState<string>(initial.place?.toString() ?? '')
  const [nomination, setNomination] = useState<string>(initial.nomination ?? '')

  useEffect(() => {
    if (!open) return
    setCategory(initial.category)
    setPlace(initial.place?.toString() ?? '')
    setNomination(initial.nomination ?? '')
  }, [open, initial.category, initial.place, initial.nomination])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)' }}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[rgba(15,23,42,0.10)]">
          <div className="text-lg font-bold text-[rgba(15,23,42,0.94)]">Результат</div>
          <div className="text-sm text-[rgba(15,23,42,0.55)] mt-1 truncate">{title}</div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <div className="text-xs font-semibold text-[rgba(15,23,42,0.60)] mb-2">Категория</div>
            <div className="flex gap-2">
              <Button variant={category === 'participant' ? 'primary' : 'secondary'} onClick={() => setCategory('participant')}>
                Участник
              </Button>
              <Button variant={category === 'winner' ? 'primary' : 'secondary'} onClick={() => setCategory('winner')}>
                Победитель
              </Button>
            </div>
          </div>

          {category === 'winner' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <div className="text-xs font-semibold text-[rgba(15,23,42,0.60)] mb-2">Место</div>
                <input
                  className="w-full border border-[rgba(15,23,42,0.12)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,64,175,0.25)]"
                  placeholder="1"
                  value={place}
                  onChange={(e) => setPlace(e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs font-semibold text-[rgba(15,23,42,0.60)] mb-2">Номинация</div>
                <input
                  className="w-full border border-[rgba(15,23,42,0.12)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,64,175,0.25)]"
                  placeholder="Например: Лучший сюжет"
                  value={nomination}
                  onChange={(e) => setNomination(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="text-sm text-[rgba(15,23,42,0.55)]">
              Для участника место и номинация не нужны — они будут очищены.
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[rgba(15,23,42,0.10)] flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Отмена
          </Button>
          <Button
            onClick={() =>
              onSave({
                category,
                place: category === 'winner' && place ? Number(place) : null,
                nomination: category === 'winner' && nomination.trim() ? nomination.trim() : null,
              })
            }
            disabled={saving}
          >
            {saving ? 'Сохранение…' : 'Сохранить'}
          </Button>
        </div>
      </div>
    </div>
  )
}
