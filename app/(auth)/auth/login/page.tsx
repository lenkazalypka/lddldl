'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPw, setShowPw] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  useEffect(() => {
    const saved = localStorage.getItem('rememberedEmail')
    if (saved) { setForm(p => ({ ...p, email: saved })); setRememberMe(true) }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null); setSuccess(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
      if (error) {
        if (error.message.includes('Invalid login credentials')) throw new Error('Неверный email или пароль')
        if (error.message.includes('Email not confirmed')) throw new Error('Подтвердите email для входа')
        throw error
      }
      rememberMe ? localStorage.setItem('rememberedEmail', form.email) : localStorage.removeItem('rememberedEmail')

      if (data.user) {
        // Ensure profile exists (trigger may create it; we upsert safe fields without touching `role`)
        const { data: p0 } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle()

        if (!p0) {
          await supabase.from('profiles').upsert(
            {
              id: data.user.id,
              full_name: (data.user.user_metadata?.full_name as string) || 'Пользователь',
              // Do NOT set `role` here.
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          )
        }

        const { data: p1 } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle()

        router.replace(p1?.role === 'admin' ? '/admin' : '/profile')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка при входе')
      setTimeout(() => setError(null), 5000)
    } finally { setLoading(false) }
  }

  const handleReset = async () => {
    if (!form.email) { setError('Введите email для восстановления'); return }
    try {
      await supabase.auth.resetPasswordForEmail(form.email, { redirectTo: `${window.location.origin}/auth/reset-password` })
      setSuccess('Ссылка для восстановления отправлена')
      setTimeout(() => setSuccess(null), 5000)
    } catch (err: any) { setError(err.message) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-5">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center font-display font-extrabold text-white text-xl"
                 style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary2))' }}>→</div>
            <span className="font-display text-2xl font-extrabold" style={{ color: 'var(--ink)' }}>ВЕКТОР БУДУЩЕГО</span>
          </Link>
          <h1 className="font-display text-2xl font-extrabold mb-1" style={{ color: 'var(--ink)' }}>Вход в аккаунт</h1>
          <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>Войдите для участия в конкурсах</p>
        </div>

        {/* Card */}
        <div className="card p-8 shadow-medium">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Alerts */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl animate-fade-in"
                   style={{ background: '#FEF2F2', border: '1.5px solid #FECACA' }}>
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: '#EF4444' }} />
                <p className="text-sm" style={{ color: '#DC2626' }}>{error}</p>
              </div>
            )}
            {success && (
              <div className="flex items-start gap-3 p-4 rounded-xl animate-fade-in"
                   style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0' }}>
                <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: '#22C55E' }} />
                <p className="text-sm" style={{ color: '#16A34A' }}>{success}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Email</label>
              <input type="email" required className="input-field" placeholder="example@mail.ru"
                     value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold" style={{ color: '#0D1B40' }}>Пароль</label>
                <button type="button" onClick={handleReset}
                  className="text-xs font-semibold" style={{ color: 'var(--primary2)' }}>Забыли пароль?</button>
              </div>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} required className="input-field pr-12" placeholder="Введите пароль"
                       value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                        style={{ color: '#5A6480' }} onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                     className="h-4 w-4 rounded" style={{ accentColor: 'var(--primary2)' }} />
              <span className="text-sm" style={{ color: 'var(--ink-soft)' }}>Запомнить меня</span>
            </label>

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 text-base mt-2">
              {loading ? <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <>Войти <ArrowRight className="h-5 w-5" /></>}
            </button>

            <p className="text-center text-sm pt-2" style={{ color: 'var(--ink-soft)' }}>
              Нет аккаунта?{' '}
              <Link href="/auth/register" className="font-semibold" style={{ color: 'var(--primary2)' }}>Зарегистрироваться</Link>
            </p>
          </form>
        </div>

        <p className="text-xs text-center mt-5" style={{ color: '#94A3B8' }}>
          Продолжая, вы соглашаетесь с{' '}
          <Link href="/legal/privacy" className="underline" style={{ color: '#3D5AFE' }}>Политикой конфиденциальности</Link>
        </p>
      </div>
    </div>
  )
}
