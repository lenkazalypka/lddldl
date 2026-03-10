import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Calendar } from 'lucide-react'

export default async function NewsDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  
  const { data: news } = await supabase
    .from('news')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!news) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {news.image_url && (
        <div className="rounded-2xl overflow-hidden mb-8">
          <img
            src={news.image_url}
            alt={news.title}
            className="w-full h-64 md:h-96 object-cover"
          />
        </div>
      )}

      <article>
        <h1 className="text-4xl font-bold text-vector-deep-blue mb-4">{news.title}</h1>
        
        <div className="flex items-center text-gray-500 mb-8">
          <Calendar className="h-5 w-5 mr-2" />
          <span className="font-accent">
            {new Date(news.published_at).toLocaleDateString('ru-RU')}
          </span>
        </div>

        <div className="prose prose-lg max-w-none">
          {news.content.split('\n').map((paragraph: string, idx: number) => (
            <p key={idx} className="mb-4 text-gray-700">{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  )
}