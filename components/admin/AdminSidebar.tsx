'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Trophy, 
  Image as ImageIcon, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/admin/contests', label: 'Конкурсы', icon: Trophy },
  { href: '/admin/works', label: 'Работы', icon: ImageIcon },
  { href: '/admin/news', label: 'Новости', icon: FileText },
  { href: '/admin/faq', label: 'FAQ', icon: FileText },
  { href: '/admin/settings', label: 'Настройки', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-vector-deep-blue text-white transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-vector-electric-blue to-vector-teal flex items-center justify-center">
                <span className="font-accent font-bold text-sm">→</span>
              </div>
              <span className="font-accent text-lg font-bold">ВЕКТОР БУДУЩЕГО · АДМИН</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-vector-electric-blue text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Icon size={20} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
        <Link
          href="/"
          className="flex items-center space-x-3 text-gray-300 hover:text-white px-4 py-3 rounded-lg transition-colors"
        >
          <Home size={20} />
          {!collapsed && <span>На сайт</span>}
        </Link>
      </div>
    </aside>
  )
}