import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export const createClient = () => {
  return createBrowserClient<Database>(
    // Typed Supabase client (reduces `any` leaks across the app)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}