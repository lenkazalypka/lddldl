'use client'

import { useEffect, useRef } from 'react'
import Button from '@/components/ui/Button'

type Variant = 'default' | 'danger'

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  variant = 'default',
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: Variant
  onConfirm: () => void
  onCancel: () => void
}) {
  const ref = useRef<HTMLDialogElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="rounded-2xl p-0 w-[min(520px,92vw)] bg-white shadow-xl border border-[rgba(15,23,42,0.12)]"
      onCancel={(e) => {
        e.preventDefault()
        onCancel()
      }}
    >
      <div className="p-6">
        <div className="text-lg font-semibold text-[rgba(15,23,42,0.92)]">{title}</div>
        {description ? (
          <p className="mt-2 text-sm text-[rgba(15,23,42,0.66)] leading-relaxed">{description}</p>
        ) : null}

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
