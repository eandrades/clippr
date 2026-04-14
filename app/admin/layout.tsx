'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '▤' },
  { href: '/admin/calendario', label: 'Calendario', icon: '📅' },
  { href: '/admin/reservas', label: 'Reservas', icon: '📋' },
  { href: '/admin/clientes', label: 'Clientes', icon: '👥' },
  { href: '/admin/barberos', label: 'Equipo', icon: '✂️' },
  { href: '/admin/servicios', label: 'Servicios', icon: '💈' },
  { href: '/admin/pagos', label: 'Pagos', icon: '💳' },
  { href: '/admin/finanzas', label: 'Finanzas', icon: '📊' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState('...')
  const [userEmail, setUserEmail] = useState('')
  const [shopName, setShopName] = useState('Mi Estudio')
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const menuRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      const email = data.user.email || ''
      setUserEmail(email)
      setUserName(email.split('@')[0])
      const meta = data.user.user_metadata
      if (meta?.barbershop_name) setShopName(meta.barbershop_name)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function logout() {
    setMenuOpen(false)
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-gray-50"><div className="text-sm text-gray-400">Cargando...</div></div>

  return (
    <div className="flex min-h-screen bg-[#f5f5f3]">
      <aside className="w-52 bg-white border-r border-gray-100 flex flex-col fixed h-full z-20">
        <div className="px-5 py-4 border-b border-gray-100">
          <Link href="/admin" className="block">
            <span className="text-base font-medium tracking-tight text-gray-900" style={{fontFamily:'monospace'}}>clippr<span className="text-gray-300">/</span></span>
          </Link>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{shopName}</p>
        </div>
        <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5 overflow-y-auto">
          {NAV.map(n => (
            <Link key={n.href} href={n.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${pathname === n.href ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
              <span className="text-sm w-4 text-center">{n.icon}</span>
              <span className="font-medium">{n.label}</span>
            </Link>
          ))}
        </nav>
        <div className="px-3 py-3 border-t border-gray-100" ref={menuRef}>
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all text-left">
            <div className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-medium flex items-center justify-center flex-shrink-0 uppercase">{userName[0]||'U'}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{userName}</p>
              <p className="text-xs text-gray-400 truncate">{userEmail}</p>
            </div>
            <span className="text-gray-300 text-xs">{menuOpen ? '▴' : '▾'}</span>
          </button>
          {menuOpen && (
            <div className="mt-1 bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
              <Link href="/superadmin" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                <span>▤</span> Super Admin
              </Link>
              <Link href="/admin/configuracion" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                <span>⚙</span> Configuración
              </Link>
              <div className="border-t border-gray-100" />
              <button onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 transition-colors">
                <span>→</span> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </aside>
      <main className="ml-52 flex-1 min-h-screen"><div className="p-7">{children}</div></main>
    </div>
  )
}
