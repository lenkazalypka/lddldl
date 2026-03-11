import Link from 'next/link'
import { Sparkles, ShieldCheck, FileText, ClipboardCheck } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-10 border-t bg-white/60 backdrop-blur-sm" style={{ borderColor: 'rgba(16,24,40,0.08)' }}>
      <div className="container-page pt-14 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div
                className="h-11 w-11 rounded-2xl flex items-center justify-center text-white shadow-md"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary2))' }}
                aria-hidden
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="font-[var(--font-display)] font-extrabold text-lg tracking-tight">Вектор</div>
                <div className="text-xs mt-0.5 text-[rgba(15,23,42,0.68)]">EdTech платформа развития талантов</div>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed max-w-md text-[rgba(15,23,42,0.72)]">
              Красиво как у Skysmart, строго как у Foxford: конкурсы, олимпиады и проекты —
              чтобы ребёнку было интересно, а родителю спокойно.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[rgba(15,23,42,0.70)]">
              <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
              Данные защищены • профили не публичные
            </div>
          </div>

          {/* Links */}
          <div>
            <div className="font-extrabold mb-4">Платформа</div>
            <ul className="space-y-2 text-sm text-[rgba(15,23,42,0.72)]">
              <li><Link className="hover:text-[var(--primary)] transition-colors" href="/contests">Программы</Link></li>
              <li><Link className="hover:text-[var(--primary)] transition-colors" href="/news">Новости</Link></li>
              <li><Link className="hover:text-[var(--primary)] transition-colors" href="/faq">О проекте</Link></li>
              <li><Link className="hover:text-[var(--primary)] transition-colors" href="/faq">Контакты</Link></li>
            </ul>
          </div>

          {/* Docs */}
          <div>
            <div className="font-extrabold mb-4">Документы</div>
            <ul className="space-y-2 text-sm text-[rgba(15,23,42,0.72)]">
              <li>
                <Link className="inline-flex items-center gap-2 hover:text-[var(--primary)] transition-colors" href="/legal/privacy">
                  <ShieldCheck className="w-4 h-4" /> Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link className="inline-flex items-center gap-2 hover:text-[var(--primary)] transition-colors" href="/legal/terms">
                  <FileText className="w-4 h-4" /> Пользовательское соглашение
                </Link>
              </li>
              <li>
                <Link className="inline-flex items-center gap-2 hover:text-[var(--primary)] transition-colors" href="/legal/consent">
                  <ClipboardCheck className="w-4 h-4" /> Согласия
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t pt-6"
             style={{ borderColor: 'rgba(16,24,40,0.08)' }}>
          <div className="text-sm text-[rgba(15,23,42,0.68)]">© {year} Вектор. Все права защищены.</div>
          <div className="text-sm text-[rgba(15,23,42,0.68)]">
            Сделано с любовью 💙
          </div>
        </div>
      </div>
    </footer>
  )
}
