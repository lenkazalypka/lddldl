import * as React from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost'

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[rgba(30,64,175,0.35)]'

const variantClass: Record<Variant, string> = {
  primary:
    'bg-[var(--primary)] text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0',
  secondary:
    'bg-white text-[rgba(15,23,42,0.9)] border border-[rgba(15,23,42,0.12)] hover:border-[rgba(15,23,42,0.18)] hover:-translate-y-0.5',
  ghost:
    'bg-transparent text-[rgba(15,23,42,0.88)] hover:bg-[rgba(15,23,42,0.05)]',
}

export default function Button({
  children,
  variant = 'primary',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button className={clsx(base, variantClass[variant], className)} {...props}>
      {children}
    </button>
  )
}
