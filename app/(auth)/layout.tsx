// app/(auth)/layout.tsx
import '@/app/globals.css'

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen">{children}</div>
}
