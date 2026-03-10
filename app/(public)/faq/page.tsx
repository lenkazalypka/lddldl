'use client'

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface FAQItem { id: string; question: string; answer: string }

const DEFAULT_FAQ: FAQItem[] = [
  { id:'1', question:'Как принять участие в конкурсе?', answer:'Отправьте работу на почту sriovector@mail.ru. В письме укажите: ФИО участника и возраст, название конкурса, контактные данные родителя. Администратор проверит и опубликует работу.' },
  { id:'2', question:'Почему моя работа не опубликована?', answer:'Все работы проходят ручную модерацию. Обычно это занимает 1-3 рабочих дня. Если прошло больше — напишите нам повторно на sriovector@mail.ru.' },
  { id:'3', question:'Сколько времени занимает публикация?', answer:'Обычно 1-3 рабочих дня. В период высокой нагрузки — до 5 рабочих дней.' },
  { id:'4', question:'Можно ли изменить или удалить работу?', answer:'Да. Напишите на sriovector@mail.ru с указанием конкурса и данных участника. Изменения вносятся в течение 2 рабочих дней.' },
  { id:'5', question:'Как выбираются победители?', answer:'Победители выбираются жюри по критериям, опубликованным в описании каждого конкурса. Результаты публикуются после завершения приёма работ.' },
  { id:'6', question:'Платное ли участие?', answer:'Участие в текущих конкурсах бесплатное. Информация о платных конкурсах (если появятся) будет указана в описании.' },
]

export default function FAQPage() {
  const [faq, setFaq] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('faq').select('*').order('order', { ascending: true })
      setFaq(data && data.length > 0 ? data : DEFAULT_FAQ)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-7 py-14">
      <div className="mb-10">
        <p className="section-tag">💬 FAQ</p>
        <h1 className="section-title">Часто задаваемые вопросы</h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: '#E8EBF5' }} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {faq.map(item => (
            <div key={item.id} className="card overflow-hidden transition-all"
                 style={{ borderColor: openId === item.id ? '#3D5AFE' : '#E8EBF5' }}>
              <button className="w-full flex items-center justify-between gap-4 p-5 text-left transition-colors"
                      style={{ background: openId === item.id ? '#F5F7FF' : '#fff' }}
                      onClick={() => setOpenId(openId === item.id ? null : item.id)}>
                <span className="font-semibold text-base" style={{ color: '#0D1B40' }}>{item.question}</span>
                <ChevronDown className="h-5 w-5 flex-shrink-0 transition-transform duration-200"
                             style={{ color: '#3D5AFE', transform: openId === item.id ? 'rotate(180deg)' : 'rotate(0)' }} />
              </button>

              {openId === item.id && (
                <div className="px-5 pb-5 animate-fade-in">
                  <div className="pt-1" style={{ borderTop: '1px solid #E8EBF5' }} />
                  <p className="mt-4 text-sm leading-relaxed whitespace-pre-line" style={{ color: '#5A6480' }}>{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Contact CTA */}
      <div className="mt-12 p-7 rounded-3xl text-center" style={{ background: 'linear-gradient(135deg, #E8ECFF, #EDE9FE)' }}>
        <div className="text-3xl mb-3">✉️</div>
        <h3 className="font-display text-lg font-bold mb-2" style={{ color: '#0D1B40' }}>Не нашли ответ?</h3>
        <p className="text-sm mb-4" style={{ color: '#5A6480' }}>Напишите нам — мы ответим в течение дня</p>
        <a href="mailto:sriovector@mail.ru"
           className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all"
           style={{ background: '#3D5AFE', color: '#fff', boxShadow: '0 4px 16px rgba(61,90,254,.3)' }}>
          sriovector@mail.ru
        </a>
      </div>
    </div>
  )
}
