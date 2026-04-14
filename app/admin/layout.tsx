'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '▤' },
  { href: '/admin/reservas', label: 'Reservas', icon: '📅' },
  { href: '/admin/clientes', label: 'Clientes', icon: '👥' },
  { href: '/admin/barberos', label: 'Barberos', icon: '✂️' },
  { href: '/admin/servicios', label: 'Servicios', icon: '💈' },
  { href: '/admin/configuracion', label: 'Configuración', icon: '⚙' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [shopName, setShopName] = useState('Mi Peluquería')
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      setUserName(data.user.email?.split('@')[0] || 'Admin')
      const meta = data.user.user_metadata
      if (meta?.barbershop_name) setShopName(meta.barbershop_name)
    })
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="flex min-h-screen bg-[#fafaf9]">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col fixed h-full z-20">
        <div className="p-5 border-b border-gray-100">
          <Link href="/admin" className="font-bold text-lg" style={{fontFamily:'var(--font-display)'}}>
            clippr<span style={{color:'var(--brand)'}}>.</span>
          </Link>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{shopName}</p>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-0.5">
          {NAV.map(n => (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${
                pathname === n.href
                  ? 'bg-brand-50 text-brand-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-base">{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center uppercase">
              {userName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{userName}</p>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
            <button onClick={logout} className="text-xs text-gray-400 hover:text-red-500 transition-colors">→</button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-56 flex-1 p-8">{children}</main>
    </div>
  )
}
