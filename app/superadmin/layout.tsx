'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/superadmin', label: 'Overview', icon: '▤' },
  { href: '/superadmin/peluquerias', label: 'Peluquerías', icon: '🏪' },
  { href: '/superadmin/leads', label: 'Leads', icon: '📬' },
  { href: '/superadmin/usuarios', label: 'Usuarios', icon: '👤' },
]

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      if (data.user.user_metadata?.role !== 'superadmin') router.push('/admin')
    })
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="flex min-h-screen bg-[#0f0f0e] text-white">
      <aside className="w-56 bg-[#1a1a18] border-r border-white/5 flex flex-col fixed h-full z-20">
        <div className="p-5 border-b border-white/5">
          <div className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>
            clippr<span style={{ color: 'var(--brand)' }}>.</span>
          </div>
          <div className="mt-1 inline-flex items-center gap-1.5 text-xs bg-brand-900/60 text-brand-300 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span>
            Super Admin
          </div>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-0.5">
          {NAV.map(n => (
            <Link key={n.href} href={n.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${
                pathname === n.href
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80'
              }`}>
              <span>{n.icon}</span>{n.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs text-white/40">superadmin</span>
            <button onClick={logout} className="text-xs text-white/30 hover:text-red-400 transition-colors">→</button>
          </div>
        </div>
      </aside>
      <main className="ml-56 flex-1 p-8">{children}</main>
    </div>
  )
}
