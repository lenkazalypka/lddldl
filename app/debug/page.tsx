import { notFound } from 'next/navigation'

export default function DebugPage() {
  if (process.env.NODE_ENV === 'production') notFound()

  return (
    <div className="container-page py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold">Debug</h1>
        <pre className="mt-4 rounded-xl bg-slate-950 p-4 text-sm text-slate-100 overflow-auto">
{JSON.stringify({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
}, null, 2)}
        </pre>
      </div>
    </div>
  )
}
