import { createClient } from '@/lib/supabase/server'
import NewsCard from '@/components/NewsCard'

export default async function NewsPage() {
  const supabase = await createClient()
  const { data: news } = await supabase.from('news').select('*').order('published_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto px-7 py-14">
      <div className="mb-10">
        <p className="section-tag">📰 Новости</p>
        <h1 className="section-title">Все новости</h1>
      </div>

      {news && news.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map(n => (
            <NewsCard key={n.id} id={n.id} title={n.title} content={n.content}
              imageUrl={n.image_url} publishedAt={n.published_at} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 rounded-3xl" style={{ background: '#fff', border: '1.5px solid #E8EBF5' }}>
          <div className="text-5xl mb-4">📰</div>
          <p className="font-display text-lg font-bold mb-2" style={{ color: '#0D1B40' }}>Новостей пока нет</p>
          <p className="text-sm" style={{ color: '#5A6480' }}>Следите за обновлениями</p>
        </div>
      )}
    </div>
  )
}
