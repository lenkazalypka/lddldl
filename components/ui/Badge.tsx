import * as React from 'react'
import clsx from 'clsx'

type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'info' | 'violet' | 'dark'

const toneClass: Record<Tone, string> = {
  neutral: 'bg-[rgba(15,23,42,0.04)] text-[rgba(15,23,42,0.74)] border-[rgba(15,23,42,0.10)]',
  primary: 'bg-[rgba(30,64,175,0.10)] text-[rgba(30,64,175,0.92)] border-[rgba(30,64,175,0.22)]',
  success: 'bg-[rgba(16,185,129,0.12)] text-[rgba(6,95,70,0.95)] border-[rgba(16,185,129,0.22)]',
  warning: 'bg-[rgba(245,158,11,0.14)] text-[rgba(146,64,14,0.95)] border-[rgba(245,158,11,0.22)]',
  info: 'bg-[rgba(59,130,246,0.12)] text-[rgba(30,64,175,0.92)] border-[rgba(59,130,246,0.22)]',
  violet: 'bg-[rgba(124,58,237,0.12)] text-[rgba(88,28,135,0.95)] border-[rgba(124,58,237,0.22)]',
  dark: 'bg-[rgba(15,23,42,0.10)] text-[rgba(15,23,42,0.92)] border-[rgba(15,23,42,0.18)]',
}

export default function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode
  tone?: Tone
  className?: string
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold leading-none',
        toneClass[tone],
        className
      )}
    >
      {children}
    </span>
  )
}
