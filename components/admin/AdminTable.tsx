'use client'

import React from 'react'

type Props = {
  /** Optional toolbar (filters/search/bulk actions). */
  toolbar?: React.ReactNode
  /** Table element. */
  children: React.ReactNode
  /** Empty state shown when `isEmpty` is true. */
  empty?: React.ReactNode
  isEmpty?: boolean
}

/**
 * A small, consistent shell for admin tables.
 * Keeps spacing/borders/empty states uniform across admin pages.
 */
export default function AdminTable({ toolbar, children, empty, isEmpty }: Props) {
  return (
    <div className="rounded-2xl border border-[rgba(15,23,42,0.10)] bg-white shadow-sm overflow-hidden">
      {toolbar ? (
        <div className="sticky top-0 z-10 px-4 py-3 border-b border-[rgba(15,23,42,0.08)] bg-[rgba(15,23,42,0.02)]">
          {toolbar}
        </div>
      ) : null}

      <div className="overflow-x-auto">{children}</div>

      {isEmpty ? (
        <div className="text-center py-12">
          {empty ?? (
            <>
              <div className="text-[rgba(15,23,42,0.45)] text-lg">Ничего не найдено</div>
              <p className="text-[rgba(15,23,42,0.55)] mt-2">Попробуйте изменить фильтры</p>
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}
