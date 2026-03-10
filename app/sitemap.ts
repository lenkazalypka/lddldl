import { createClient } from '@/lib/supabase/server'

export default async function sitemap() {
  const supabase = await createClient()

  const { data: contests } = await supabase.from('contests').select('id')
  const { data: news } = await supabase.from('news').select('id')

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://example.ru'

  const contestUrls = (contests ?? []).map((c: any) => ({
    url: `${baseUrl}/contests/${c.id}`,
  }))

  const newsUrls = (news ?? []).map((n: any) => ({
    url: `${baseUrl}/news/${n.id}`,
  }))

  return [
    { url: baseUrl },
    { url: `${baseUrl}/legal/privacy` },
    { url: `${baseUrl}/legal/terms` },
    { url: `${baseUrl}/legal/consent` },
    { url: `${baseUrl}/contests` },
    { url: `${baseUrl}/gallery` },
    ...contestUrls,
    ...newsUrls,
  ]
}