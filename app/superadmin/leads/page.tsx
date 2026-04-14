'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Lead } from '@/lib/types'

const DEMO: Lead[] = [
  { id:'1', name:'Roberto Sánchez', email:'roberto@mail.com', barbershop:'Barbería Norte', city:'Santiago', message:'Tengo 3 barberos y quiero gestionar mejor las citas.', created_at:'2026-04-10T09:30:00' },
  { id:'2', name:'Carmen López', email:'carmen@cortes.cl', barbershop:'Estudio Carmen', city:'Viña del Mar', message:'', created_at:'2026-04-09T14:15:00' },
  { id:'3', name:'Jorge Muñoz', email:'jorge@m.cl', barbershop:'JM Barbershop', city:'Concepción', message:'Dos locales, quiero el plan business.', created_at:'2026-04-08T11:00:00' },
]

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(DEMO)
  const [filter, setFilter] = useState('')
  const supabase = createClient()

  useEffect(() => {
    supabase.from('leads').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data?.length) setLeads(data)
    })
  }, [])

  const filtered = leads.filter(l => {
    const q = filter.toLowerCase()
    return !q || l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.city?.toLowerCase().includes(q) || l.barbershop?.toLowerCase().includes(q)
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Leads</h1>
          <p className="text-white/40 text-sm mt-0.5">{leads.length} contactos del formulario</p>
        </div>
      </div>

      <div className="mb-5">
        <input className="input bg-white/5 border-white/10 text-white placeholder:text-white/30 max-w-xs"
          placeholder="Buscar lead..." value={filter} onChange={e => setFilter(e.target.value)} />
      </div>

      <div className="bg-[#1a1a18] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-xs font-medium text-white/30 uppercase tracking-wide border-b border-white/5">
              <th className="px-6 py-3 text-left">Contacto</th>
              <th className="px-4 py-3 text-left">Peluquería</th>
              <th className="px-4 py-3 text-left">Ciudad</th>
              <th className="px-4 py-3 text-left">Mensaje</th>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-white/30 text-sm">Sin leads aún</td></tr>
            )}
            {filtered.map(l => (
              <tr key={l.id} className="border-t border-white/5 text-sm hover:bg-white/2 transition-colors">
                <td className="px-6 py-3">
                  <p className="font-medium text-white">{l.name}</p>
                  <p className="text-xs text-white/40">{l.email}</p>
                </td>
                <td className="px-4 py-3 text-white/60">{l.barbershop || '—'}</td>
                <td className="px-4 py-3 text-white/50">{l.city || '—'}</td>
                <td className="px-4 py-3 text-white/40 text-xs max-w-[200px] truncate">{l.message || '—'}</td>
                <td className="px-4 py-3 text-white/30 text-xs">
                  {new Date(l.created_at).toLocaleDateString('es-CL', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                </td>
                <td className="px-4 py-3">
                  <a href={`mailto:${l.email}?subject=Bienvenido a Clippr`}
                    className="text-xs px-3 py-1.5 rounded-lg bg-brand-900/40 text-brand-400 hover:bg-brand-900/60 transition-colors">
                    Contactar
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
