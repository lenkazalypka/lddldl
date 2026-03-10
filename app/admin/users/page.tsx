'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, Search, MapPin, Calendar, Shield } from 'lucide-react'
import { useToast } from '@/components/ui/Toaster'

interface Profile {
  id: string
  role: 'user' | 'admin'
  full_name: string | null
  child_name: string | null
  city: string | null
  created_at: string
}

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => { fetchProfiles() }, [])

  const fetchProfiles = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('profiles').select('id, role, full_name, child_name, city, created_at').order('created_at', { ascending: false })
    if (error) {
      console.error(error)
      toast({ title: 'Не удалось загрузить пользователей', variant: 'error' })
    } else {
      setProfiles(data || [])
    }
    setLoading(false)
  }

  const toggleAdmin = async (userId: string, currentRole: Profile['role']) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    setUpdatingId(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Не удалось изменить роль')
      toast({ title: `Роль изменена: ${newRole === 'admin' ? 'администратор' : 'пользователь'}`, variant: 'success' })
      await fetchProfiles()
    } catch (error) {
      console.error(error)
      toast({ title: error instanceof Error ? error.message : 'Ошибка при изменении роли', variant: 'error' })
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredProfiles = profiles.filter((profile) =>
    [profile.full_name, profile.child_name, profile.city].some((value) => value?.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]" /></div>

  return (
    <div className="p-8">
      <div className="mb-8"><h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3"><Users className="h-8 w-8" /> Управление пользователями</h1><p className="text-gray-600">Всего пользователей: {profiles.length}</p></div>
      <div className="mb-6 relative"><Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" /><input type="text" placeholder="Поиск по имени, городу..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" /></div>
      <div className="bg-white shadow overflow-hidden sm:rounded-md"><ul className="divide-y divide-gray-200">{filteredProfiles.map((profile) => <li key={profile.id} className="px-6 py-4 flex items-center justify-between gap-4"><div><div className="font-semibold text-gray-900">{profile.full_name || profile.child_name || 'Без имени'}</div><div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-500"><span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {profile.city || '—'}</span><span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(profile.created_at).toLocaleDateString('ru-RU')}</span></div></div><div className="flex items-center gap-3"><span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${profile.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>{profile.role === 'admin' ? <><Shield className="h-3 w-3 mr-1" />Админ</> : 'Пользователь'}</span><button onClick={() => toggleAdmin(profile.id, profile.role)} disabled={updatingId === profile.id} className={`${profile.role === 'admin' ? 'text-red-600 hover:text-red-900' : 'text-purple-600 hover:text-purple-900'} disabled:opacity-50`}>{profile.role === 'admin' ? 'Снять админа' : 'Сделать админом'}</button></div></li>)}</ul></div>
    </div>
  )
}
