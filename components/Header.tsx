import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '@/app/(auth)/auth/actions'
import { ArrowRight, User, LogOut } from 'lucide-react'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const nav = [
    { href: '/contests', label: 'Конкурсы' },
    { href: '/courses',  label: 'Курсы' },
    { href: '/gallery',  label: 'Галерея' },
    { href: '/news',     label: 'Новости' },
    { href: '/faq',      label: 'FAQ' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/75 backdrop-blur-xl"
            style={{ borderColor: 'rgba(16,24,40,0.08)' }}>
      <div className="container-page h-[72px] flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, rgba(37,99,235,1), rgba(124,58,237,1))' }}>
            <span className="text-white font-bold text-sm">VB</span>
          </div>
          <div className="leading-tight">
            <div className="font-display font-extrabold tracking-tight" style={{ color: '#0D1B40' }}>
              ВЕКТОР БУДУЩЕГО
            </div>
            <div className="text-xs font-medium" style={{ color: 'rgba(15,23,42,0.55)' }}>
              конкурсы талантов
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold" style={{ color: 'rgba(15,23,42,0.78)' }}>
          {nav.map(i => (
            <Link key={i.href} href={i.href} className="hover:opacity-80 transition">
              {i.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center h-11 px-4 rounded-xl border font-semibold transition hover:bg-slate-50"
                style={{ borderColor: 'rgba(15,23,42,0.12)', color: '#0D1B40' }}
              >
                Войти
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center h-11 px-4 rounded-xl font-semibold text-white transition hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, rgba(37,99,235,1), rgba(124,58,237,1))' }}
              >
                Регистрация <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/profile"
                className="inline-flex items-center justify-center h-11 px-4 rounded-xl border font-semibold transition hover:bg-slate-50"
                style={{ borderColor: 'rgba(15,23,42,0.12)', color: '#0D1B40' }}
              >
                <User className="w-4 h-4 mr-2" />
                Профиль
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center h-11 px-4 rounded-xl border font-semibold transition hover:bg-slate-50"
                  style={{ borderColor: 'rgba(15,23,42,0.12)', color: '#0D1B40' }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Выйти
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
