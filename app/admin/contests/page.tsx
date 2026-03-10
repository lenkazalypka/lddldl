import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import AdminContestTable from '@/components/admin/AdminContestTable'
import clsx from 'clsx'

export default async function AdminContestsPage() {
  const supabase = await createClient()
  
  const { data: contests } = await supabase
    .from('contests')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Конкурсы</h1>
        <Link
          href="/admin/contests/new"
          className={clsx(
            'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200',
            'bg-[var(--primary)] text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
          )}
        >
          <Plus className="h-5 w-5" />
          Новый конкурс
        </Link>
      </div>

      <AdminContestTable contests={contests || []} />
    </div>
  )
}