import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import AdminCourseTable from '@/components/admin/AdminCourseTable'

export default async function AdminCoursesPage() {
  const supabase = await createClient()

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Курсы</h1>
        <Link href="/admin/courses/new" className="btn-primary flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Новый курс
        </Link>
      </div>

      <AdminCourseTable courses={(courses as any) || []} />
    </div>
  )
}
