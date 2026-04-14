'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Barbershop } from '@/lib/types'
import Link from 'next/link'

const DEMO_SHOPS: Barbershop[] = [
  {id:'1',name:'Barbería El Filo',slug:'el-filo',city:'Santiago',plan:'pro',active:true,created_at:'2026-01-10'},
  {id:'2',name:'Classic Cuts',slug:'classic-cuts',city:'Santiago',plan:'free',active:true,created_at:'2026-02-15'},
  {id:'3',name:'Barbershop 305',slug:'bs305',city:'Valparaíso',plan:'business',active:true,created_at:'2026-03-01'},
  {id:'4',name:'Don Felipe',slug:'don-felipe',city:'Concepción',plan:'free',active:false,created_at:'2026-03-20'},
]

const PLAN_BADGE: Record<string,string> = { free:'badge-free', pro:'badge-pro', business:'badge-business' }

export default function SuperAdminDashboard() {
  const [shops, setShops] = useState<Barbershop[]>(DEMO_SHOPS)
  const [leads, setLeads] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [{ data: s }, { count: l }] = await Promise.all([
        supabase.from('barbershops').select('*').order('created_at', { ascending: false }),
        supabase.from('leads').select('*', { count: 'exact', head: true }),
      ])
      if (s?.length) setShops(s)
      if (l) setLeads(l)
    }
    load()
  }, [])

  const stats = {
    total: shops.length,
    active: shops.filter(s => s.active).length,
    pro: shops.filter(s => s.plan === 'pro').length,
    business: shops.filter(s => s.plan === 'business').length,
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Overview</h1>
        <p className="text-white/40 text-sm mt-0.5">Panel global de Clippr</p>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Peluquerías', value: stats.total, sub: 'registradas', color: 'bg-white/5 text-white' },
          { label: 'Activas', value: stats.active, sub: 'en operación', color: 'bg-brand-900/40 text-brand-300' },
          { label: 'Plan Pro', value: stats.pro, sub: 'suscriptores', color: 'bg-white/5 text-white' },
          { label: 'Leads', value: leads, sub: 'del formulario', color: 'bg-amber-900/30 text-amber-300' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-5 ${s.color} border border-white/5`}>
            <p className="text-xs font-medium uppercase tracking-wide opacity-60 mb-1">{s.label}</p>
            <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>{s.value}</p>
            <p className="text-xs opacity-50 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent barbershops */}
      <div className="bg-[#1a1a18] border border-white/5 rounded-2xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-bold text-white text-sm" style={{ fontFamily: 'var(--font-display)' }}>Peluquerías recientes</h2>
          <Link href="/superadmin/peluquerias" className="text-xs text-brand-400 hover:underline">Ver todas →</Link>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-xs font-medium text-white/30 uppercase tracking-wide border-b border-white/5">
              <th className="px-6 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Ciudad</th>
              <th className="px-4 py-3 text-left">Plan</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Registro</th>
            </tr>
          </thead>
          <tbody>
            {shops.slice(0,5).map(s => (
              <tr key={s.id} className="border-t border-white/5 text-sm hover:bg-white/3 transition-colors">
                <td className="px-6 py-3">
                  <p className="font-medium text-white">{s.name}</p>
                  <p className="text-xs text-white/30">{s.slug}</p>
                </td>
                <td className="px-4 py-3 text-white/50">{s.city || '—'}</td>
                <td className="px-4 py-3"><span className={PLAN_BADGE[s.plan]}>{s.plan}</span></td>
                <td className="px-4 py-3">
                  <span className={s.active ? 'badge-confirmed' : 'badge-cancelled'}>{s.active ? 'Activa' : 'Inactiva'}</span>
                </td>
                <td className="px-4 py-3 text-white/40 text-xs">
                  {new Date(s.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3">
        <Link href="/superadmin/peluquerias/nueva" className="btn-primary text-sm">+ Agregar peluquería</Link>
        <Link href="/superadmin/leads" className="btn-ghost text-sm border-white/10 text-white/60 hover:bg-white/5">Ver leads →</Link>
      </div>
    </div>
  )
}
