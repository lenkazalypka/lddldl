'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Trophy, GraduationCap, FileImage, Newspaper, HelpCircle, ClipboardList, LogOut, Home, Menu, X } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        setProfile(profileData)

        if (profileData?.role !== 'admin') {
          router.push('/profile')
        }
      } else {
        router.push('/auth/login')
      }
      setLoading(false)
    }
    
    fetchData()
  }, [router, supabase])

  const navigation = [
    { name: 'Дашборд', href: '/admin', icon: LayoutDashboard },
    { name: 'Конкурсы', href: '/admin/contests', icon: Trophy },
    { name: 'Курсы', href: '/admin/courses', icon: GraduationCap },
    { name: 'Заявки на курсы', href: '/admin/course-applications', icon: ClipboardList },
    { name: 'Работы участников', href: '/admin/works', icon: FileImage },
    { name: 'Новости', href: '/admin/news', icon: Newspaper },
    { name: 'FAQ', href: '/admin/faq', icon: HelpCircle },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 rounded-full animate-spin" style={{ borderColor: 'rgba(30,64,175,0.18)', borderTopColor: 'var(--primary)' }} />
          <p className="font-medium" style={{ color: 'rgba(15,23,42,0.68)' }}>Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-2xl border bg-white/80 backdrop-blur-xl"
          style={{ borderColor: 'rgba(16,24,40,0.10)', boxShadow: 'var(--shadow)' }}
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-white/85 backdrop-blur-xl z-40 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b" style={{ borderColor: 'rgba(16,24,40,0.08)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary2))' }}>
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold" style={{ color: 'var(--ink)' }}>Админ-панель</h1>
                <p className="text-xs" style={{ color: 'rgba(15,23,42,0.62)' }}>ВЕКТОР БУДУЩЕГО</p>
              </div>
            </div>
            
            <div className="rounded-2xl p-4 border" style={{ background: 'rgba(30,64,175,0.05)', borderColor: 'rgba(30,64,175,0.12)' }}>
              <p className="text-xs mb-1" style={{ color: 'rgba(15,23,42,0.60)' }}>Администратор</p>
              <p className="font-semibold text-sm truncate" style={{ color: 'var(--ink)' }}>{profile?.full_name || 'Админ'}</p>
              <p className="text-xs truncate mt-1" style={{ color: 'rgba(15,23,42,0.60)' }}>{user?.email}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all duration-200
                    `}
                    style={isActive ? {
                      background: 'linear-gradient(90deg, var(--primary) 0%, var(--primary2) 100%)',
                      color: '#fff',
                      boxShadow: '0 12px 30px rgba(30,64,175,0.22)',
                    } : {
                      color: 'rgba(15,23,42,0.78)',
                      border: '1px solid rgba(16,24,40,0.08)',
                      background: 'transparent',
                    }}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t space-y-2" style={{ borderColor: 'rgba(16,24,40,0.08)' }}>
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-colors"
              style={{ color: 'rgba(15,23,42,0.78)', border: '1px solid rgba(16,24,40,0.08)' }}
            >
              <Home className="h-5 w-5" />
              <span className="text-sm">На главную</span>
            </Link>
            <button
              onClick={() => {
                supabase.auth.signOut()
                router.push('/')
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-colors"
              style={{ color: '#DC2626', border: '1px solid rgba(220,38,38,0.20)', background: 'rgba(220,38,38,0.04)' }}
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm">Выйти</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-72 min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
