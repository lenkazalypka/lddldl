import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function CertificatePage({ params }: { params: { token: string } }) {
  const admin = createAdminClient()

  const { data: doc } = await admin
    .from('contest_documents')
    .select('work_id, access_token, certificate_number')
    .eq('access_token', params.token)
    .maybeSingle()

  if (!doc) notFound()

  const { data: work } = await admin
    .from('contest_photos')
    .select('id, approved, name, surname_initial, age, city, work_title, contests(title), place')
    .eq('id', doc.work_id)
    .single()

  if (!work) notFound()

  const fullName = `${work.name} ${work.surname_initial}.`
  const contestTitle = (work as any).contests?.title ?? 'конкурс'
  const approved = Boolean(work.approved)
  const place = (work as any).place as number | null
  const isPrize = place !== null && [1, 2, 3].includes(place)

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="max-w-3xl mx-auto px-6 py-14">
        <h1 className="text-3xl font-bold mb-2">Статус заявки</h1>
        <p className="text-gray-600 mb-8">
          Здесь отображается статус модерации и, после одобрения, доступна выдача сертификата или диплома 🎓
        </p>

        <div className="rounded-2xl border border-gray-200 p-6 bg-gray-50">
          <div className="text-sm text-gray-500 mb-2">{contestTitle}</div>
          <div className="text-xl font-semibold mb-1">{fullName}</div>
          <div className="text-gray-600">
            {work.age} лет • {work.city}{work.work_title ? ` • «${work.work_title}»` : ''}
          </div>

          <div className="mt-6 flex items-center gap-3 flex-wrap">
            {approved ? (
              <>
                <span className="inline-flex items-center rounded-full bg-green-100 text-green-800 px-3 py-1 text-sm font-medium">
                  Одобрено ✅
                </span>
                <a className="inline-flex items-center justify-center rounded-xl bg-blue-600 text-white px-5 py-3 text-sm font-semibold hover:bg-blue-700 transition" href={`/api/certificates/${params.token}`}>
                  Скачать {isPrize ? 'диплом' : 'сертификат'} (PDF)
                </a>
              </>
            ) : (
              <>
                <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-900 px-3 py-1 text-sm font-medium">
                  На модерации ⏳
                </span>
                <span className="text-sm text-gray-500">
                  Как только работа будет одобрена, здесь появится кнопка скачивания.
                </span>
              </>
            )}
          </div>

          {doc.certificate_number ? (
            <div className="mt-4 text-sm text-gray-500">Номер документа: <span className="font-medium">{doc.certificate_number}</span></div>
          ) : null}
        </div>
      </div>
    </main>
  )
}
