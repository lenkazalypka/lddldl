import Link from 'next/link'
import { Calendar, Sparkles } from 'lucide-react'

interface NewsCardProps {
  id: string
  title: string
  content: string
  imageUrl: string | null
  publishedAt: string
}

function fmt(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

export default function NewsCard({ id, title, content, imageUrl, publishedAt }: NewsCardProps) {
  return (
    <Link href={`/news/${id}`} className="block h-full">
      <article className="card card-hover h-full overflow-hidden">
        <div className="h-1.5 w-full bg-[linear-gradient(90deg,var(--accent),var(--primary2))]" />

        {imageUrl ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-44 object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.00),rgba(0,0,0,0.28))]" />
          </div>
        ) : (
          <div className="h-44 bg-[linear-gradient(135deg,rgba(245,158,11,0.10),rgba(59,130,246,0.06))] flex items-center justify-center">
            <div className="flex items-center gap-2 text-[rgba(245,158,11,0.95)]">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-semibold">Обновления и новости</span>
            </div>
          </div>
        )}

        <div className="p-5 flex flex-col gap-3">
          <h3 className="font-[var(--font-display)] text-lg md:text-xl leading-snug line-clamp-2">
            {title}
          </h3>

          <p className="text-sm text-[rgba(15,23,42,0.72)] line-clamp-3">
            {content}
          </p>

          <div className="mt-auto flex items-center justify-between gap-3 text-sm text-[rgba(15,23,42,0.72)]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{fmt(publishedAt)}</span>
            </div>
            <div className="text-sm font-semibold text-[var(--primary)]">Читать →</div>
          </div>
        </div>
      </article>
    </Link>
  )
}
