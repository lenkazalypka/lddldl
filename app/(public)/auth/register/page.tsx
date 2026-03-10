'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPw, setShowPw] = useState(false)
  const [form, setForm] = useState({
    email: '', password: '', full_name: '', child_name: '', age: '', city: '', phone: '',
    consent_terms: false, consent_privacy: false, consent_personal_data: false,
  })

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.consent_terms || !form.consent_privacy || !form.consent_personal_data) {
      setError('Необходимо согласие со всеми документами'); return
    }
    setLoading(true); setError(null)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email, password: form.password,
        options: { data: { full_name: form.full_name, child_name: form.child_name, phone: form.phone }, emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (authError) {
        if (authError.message.includes('already registered')) throw new Error('Пользователь с таким email уже существует')
        if (authError.message.includes('rate limit')) throw new Error('Слишком много попыток. Подождите 10 минут.')
        throw authError
      }

      if (authData.user) {
        // Profile is created by trigger; we only upsert safe fields (never set `role` on client)
        const { error: pe } = await supabase.from('profiles').upsert({
          id: authData.user.id, email: form.email, full_name: form.full_name,
          child_name: form.child_name || null, age: form.age ? parseInt(form.age) : null,
          city: form.city || null, phone: form.phone || null,
          consent_terms: form.consent_terms, consent_privacy: form.consent_privacy, consent_personal_data: form.consent_personal_data,
          consent_given_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })
        if (pe) { await supabase.auth.signOut(); throw pe }
        router.replace('/profile')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка при регистрации')
      setTimeout(() => setError(null), 5000)
    } finally { setLoading(false) }
  }

  const inputCls = "input-field"

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-5">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center font-display font-extrabold text-white text-xl"
                 style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary2))' }}>→</div>
            <span className="font-display text-2xl font-extrabold" style={{ color: 'var(--ink)' }}>ВЕКТОР БУДУЩЕГО</span>
          </Link>
          <h1 className="font-display text-2xl font-extrabold mb-1" style={{ color: 'var(--ink)' }}>Регистрация</h1>
          <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>Создайте аккаунт для участия в конкурсах</p>
        </div>

        <div className="card p-8 shadow-medium">
          <form onSubmit={handleSubmit} className="space-y-5">

            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl animate-fade-in"
                   style={{ background: '#FEF2F2', border: '1.5px solid #FECACA' }}>
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: '#EF4444' }} />
                <p className="text-sm" style={{ color: '#DC2626' }}>{error}</p>
              </div>
            )}

            {/* Email + Password */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Email *</label>
                <input type="email" required className={inputCls} placeholder="example@mail.ru"
                       value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Пароль *</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} required minLength={6} className={`${inputCls} pr-12`}
                         placeholder="Не менее 6 символов"
                         value={form.password} onChange={e => set('password', e.target.value)} />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2"
                          style={{ color: 'var(--ink-soft)' }} onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="h-px" style={{ background: 'rgba(2,6,23,0.08)' }} />

            {/* Personal info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Ваше ФИО *</label>
                <input type="text" required className={inputCls} placeholder="Иванов Иван Иванович"
                       value={form.full_name} onChange={e => set('full_name', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Имя ребёнка *</label>
                <input type="text" required className={inputCls} placeholder="Иван"
                       value={form.child_name} onChange={e => set('child_name', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Возраст ребёнка *</label>
                <input type="number" required min="1" max="120" className={inputCls} placeholder="10"
                       value={form.age} onChange={e => set('age', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Город *</label>
                <input type="text" required className={inputCls} placeholder="Якутск"
                       value={form.city} onChange={e => set('city', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Телефон *</label>
                <input type="tel" required className={inputCls} placeholder="+7 (999) 123-45-67"
                       value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
            </div>

            <div className="h-px" style={{ background: '#E8EBF5' }} />

            {/* Consents */}
            <div className="space-y-3">
              <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Необходимые согласия:</p>
              {[
                { key: 'consent_terms',         label: 'Пользовательское соглашение',   href: '/legal/terms'   },
                { key: 'consent_privacy',        label: 'Политика конфиденциальности',   href: '/legal/privacy' },
                { key: 'consent_personal_data',  label: 'Согласие на обработку данных',  href: '/legal/consent' },
              ].map(({ key, label, href }) => (
                <label key={key} className="check-item">
                  <input type="checkbox" checked={(form as any)[key]}
                         onChange={e => set(key, e.target.checked)}
                         className="h-5 w-5 rounded flex-shrink-0 mt-0.5" style={{ accentColor: 'var(--primary2)' }} />
                  <span className="text-sm" style={{ color: 'var(--ink-soft)' }}>
                    Я принимаю{' '}
                    <Link href={href} className="font-semibold underline" style={{ color: 'var(--primary2)' }}>{label}</Link> *
                  </span>
                </label>
              ))}
            </div>

            {/* Submit */}
            <button type="submit"
              disabled={loading || !form.consent_terms || !form.consent_privacy || !form.consent_personal_data}
              className="btn-primary w-full justify-center py-3.5 text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading
                ? <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                : <>Зарегистрироваться <ArrowRight className="h-5 w-5" /></>}
            </button>

            <p className="text-center text-sm" style={{ color: 'var(--ink-soft)' }}>
              Уже есть аккаунт?{' '}
              <Link href="/auth/login" className="font-semibold" style={{ color: 'var(--primary2)' }}>Войти</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
