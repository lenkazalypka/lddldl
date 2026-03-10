import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { User, Mail, Phone, MapPin, Calendar, Trophy } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <div className="min-h-screen" style={{ background: '#F5F7FF' }}>
      <div className="container-page py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-3xl font-extrabold mb-2" style={{ color: '#0D1B40' }}>
            Профиль
          </h1>
          <p className="text-sm mb-8" style={{ color: '#5A6480' }}>
            Управляйте данными аккаунта и смотрите участие в конкурсах.
          </p>

          <div className="rounded-3xl border bg-white p-6 md:p-8 shadow-sm"
               style={{ borderColor: 'rgba(16,24,40,0.08)' }}>
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center"
                   style={{ background: 'rgba(37,99,235,0.08)' }}>
                <User className="w-6 h-6" style={{ color: 'rgba(37,99,235,1)' }} />
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold" style={{ color: '#0D1B40' }}>
                  {profile?.full_name || profile?.child_name || 'Пользователь'}
                </div>
                <div className="text-sm" style={{ color: '#5A6480' }}>
                  {user.email}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={user.email || '—'} />
              <InfoRow icon={<Phone className="w-4 h-4" />} label="Телефон" value={profile?.phone || '—'} />
              <InfoRow icon={<MapPin className="w-4 h-4" />} label="Город" value={profile?.city || '—'} />
              <InfoRow icon={<Calendar className="w-4 h-4" />} label="Возраст" value={profile?.age ? String(profile.age) : '—'} />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contests"
                className="inline-flex items-center justify-center h-11 px-4 rounded-xl font-semibold text-white transition hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, rgba(37,99,235,1), rgba(124,58,237,1))' }}
              >
                Перейти к конкурсам
              </Link>
              <Link
                href="/gallery"
                className="inline-flex items-center justify-center h-11 px-4 rounded-xl border font-semibold transition hover:bg-slate-50"
                style={{ borderColor: 'rgba(15,23,42,0.12)', color: '#0D1B40' }}
              >
                Галерея работ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border px-4 py-3"
         style={{ borderColor: 'rgba(16,24,40,0.08)' }}>
      <div className="h-9 w-9 rounded-xl flex items-center justify-center"
           style={{ background: 'rgba(124,58,237,0.08)', color: 'rgba(124,58,237,1)' }}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'rgba(15,23,42,0.55)' }}>
          {label}
        </div>
        <div className="text-sm font-semibold truncate" style={{ color: '#0D1B40' }}>
          {value}
        </div>
      </div>
    </div>
  )
}
