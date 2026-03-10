import { createClient } from '@/lib/supabase/server'
import AdminCourseApplicationsTable from '@/components/admin/AdminCourseApplicationsTable'

export default async function AdminCourseApplicationsPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('course_applications')
    .select('*, course:courses(title)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Заявки на курсы</h1>
        <p className="mt-2 text-gray-600">Здесь появляются заявки с кнопки «Записаться» на публичной странице курса.</p>
      </div>

      <AdminCourseApplicationsTable rows={(data as any) || []} />
    </div>
  )
}
