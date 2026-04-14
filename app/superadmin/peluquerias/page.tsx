'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Barbershop, Plan } from '@/lib/types'
import Link from 'next/link'

const PLAN_BADGE: Record<string, string> = { free: 'badge-free', pro: 'badge-pro', business: 'badge-business' }
const PLANS: Plan[] = ['free', 'pro', 'business']

const DEMO: Barbershop[] = [
  { id:'1', name:'Barbería El Filo', slug:'el-filo', city:'Santiago', phone:'+56912345678', email:'elfilo@mail.com', plan:'pro', active:true, created_at:'2026-01-10' },
  { id:'2', name:'Classic Cuts', slug:'classic-cuts', city:'Santiago', phone:'+56987654321', plan:'free', active:true, created_at:'2026-02-15' },
  { id:'3', name:'Barbershop 305', slug:'bs305', city:'Valparaíso', plan:'business', active:true, created_at:'2026-03-01' },
  { id:'4', name:'Don Felipe', slug:'don-felipe', city:'Concepción', plan:'free', active:false, created_at:'2026-03-20' },
]

export default function PeluqueriasPage() {
  const [shops, setShops] = useState<Barbershop[]>(DEMO)
  const [filter, setFilter] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name:'', slug:'', city:'', phone:'', email:'', plan:'free' as Plan })
  const supabase = createClient()

  useEffect(() => {
    supabase.from('barbershops').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data?.length) setShops(data)
    })
  }, [])

  function slugify(s: string) { return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }

  async function saveShop(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const { data } = await supabase.from('barbershops').insert({ ...form, active: true }).select().single()
    if (data) setShops(p => [data, ...p])
    else setShops(p => [{ id: Date.now().toString(), ...form, active: true, created_at: new Date().toISOString() }, ...p])
    setForm({ name:'', slug:'', city:'', phone:'', email:'', plan:'free' })
    setShowForm(false); setSaving(false)
  }

  async function changePlan(id: string, plan: Plan) {
    setShops(p => p.map(s => s.id === id ? { ...s, plan } : s))
    await supabase.from('barbershops').update({ plan }).eq('id', id)
  }

  async function toggleActive(id: string, active: boolean) {
    setShops(p => p.map(s => s.id === id ? { ...s, active: !active } : s))
    await supabase.from('barbershops').update({ active: !active }).eq('id', id)
  }

  const filtered = shops.filter(s => {
    const q = filter.toLowerCase()
    const matchQ = !q || s.name.toLowerCase().includes(q) || s.city?.toLowerCase().includes(q) || s.slug.includes(q)
    const matchP = planFilter === 'all' || s.plan === planFilter
    return matchQ && matchP
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Peluquerías</h1>
          <p className="text-white/40 text-sm mt-0.5">{filtered.length} registradas</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">{showForm ? 'Cancelar' : '+ Nueva peluquería'}</button>
      </div>

      {showForm && (
        <form onSubmit={saveShop} className="bg-[#1a1a18] border border-white/5 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>Nueva peluquería</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label text-white/40">Nombre *</label>
              <input required className="input bg-white/5 border-white/10 text-white placeholder:text-white/20"
                placeholder="Barbería El Filo" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} />
            </div>
            <div>
              <label className="label text-white/40">Slug (URL)</label>
              <input required className="input bg-white/5 border-white/10 text-white placeholder:text-white/20"
                placeholder="barberia-el-filo" value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))} />
            </div>
            <div>
              <label className="label text-white/40">Ciudad</label>
              <input className="input bg-white/5 border-white/10 text-white placeholder:text-white/20"
                placeholder="Santiago" value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
            </div>
            <div>
              <label className="label text-white/40">Teléfono</label>
              <input className="input bg-white/5 border-white/10 text-white placeholder:text-white/20"
                placeholder="+56 9 1234 5678" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="label text-white/40">Email</label>
              <input type="email" className="input bg-white/5 border-white/10 text-white placeholder:text-white/20"
                placeholder="hola@peluqueria.cl" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="label text-white/40">Plan</label>
              <select className="input bg-white/5 border-white/10 text-white" value={form.plan}
                onChange={e => setForm(f => ({ ...f, plan: e.target.value as Plan }))}>
                {PLANS.map(p => <option key={p} value={p} className="bg-gray-900">{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
            {saving ? 'Guardando...' : 'Crear peluquería'}
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <input className="input bg-white/5 border-white/10 text-white placeholder:text-white/30 flex-1 max-w-xs"
          placeholder="Buscar..." value={filter} onChange={e => setFilter(e.target.value)} />
        <select className="input bg-white/5 border-white/10 text-white max-w-[140px]"
          value={planFilter} onChange={e => setPlanFilter(e.target.value)}>
          <option value="all" className="bg-gray-900">Todos los planes</option>
          {PLANS.map(p => <option key={p} value={p} className="bg-gray-900">{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
        </select>
      </div>

      <div className="bg-[#1a1a18] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-xs font-medium text-white/30 uppercase tracking-wide border-b border-white/5">
              <th className="px-6 py-3 text-left">Peluquería</th>
              <th className="px-4 py-3 text-left">Ciudad</th>
              <th className="px-4 py-3 text-left">Contacto</th>
              <th className="px-4 py-3 text-left">Plan</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-white/30 text-sm">No hay peluquerías</td></tr>
            )}
            {filtered.map(s => (
              <tr key={s.id} className={`border-t border-white/5 text-sm hover:bg-white/2 transition-colors ${!s.active ? 'opacity-40' : ''}`}>
                <td className="px-6 py-3">
                  <p className="font-medium text-white">{s.name}</p>
                  <p className="text-xs text-white/30">/{s.slug}</p>
                </td>
                <td className="px-4 py-3 text-white/50">{s.city || '—'}</td>
                <td className="px-4 py-3">
                  {s.phone && <p className="text-xs text-white/50">{s.phone}</p>}
                  {s.email && <p className="text-xs text-white/30">{s.email}</p>}
                </td>
                <td className="px-4 py-3">
                  <select value={s.plan}
                    onChange={e => changePlan(s.id, e.target.value as Plan)}
                    className="text-xs bg-transparent border-0 outline-none cursor-pointer">
                    {PLANS.map(p => (
                      <option key={p} value={p} className="bg-gray-900 text-white">
                        {p.charAt(0).toUpperCase()+p.slice(1)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className={s.active ? 'badge-confirmed' : 'badge-cancelled'}>{s.active ? 'Activa' : 'Inactiva'}</span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(s.id, s.active)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${s.active ? 'bg-red-900/40 text-red-400 hover:bg-red-900/60' : 'bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900/60'}`}>
                    {s.active ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
