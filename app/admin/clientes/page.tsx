'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Client } from '@/lib/types'
import Link from 'next/link'

const DEMO_CLIENTS: Client[] = [
  { id:'c1', barbershop_id:'demo', name:'Carlos Pérez', phone:'+56 9 8123 4567', email:'carlos@mail.com', notes:'Prefiere corte bajo', created_at:'2026-01-15' },
  { id:'c2', barbershop_id:'demo', name:'Andrés Soto', phone:'+56 9 7654 3210', created_at:'2026-02-01' },
  { id:'c3', barbershop_id:'demo', name:'Luis Morales', phone:'+56 9 9234 5678', email:'luis@mail.com', created_at:'2026-02-10' },
  { id:'c4', barbershop_id:'demo', name:'Diego Fuentes', phone:'+56 9 6543 2109', created_at:'2026-03-05' },
  { id:'c5', barbershop_id:'demo', name:'Matías Herrera', phone:'+56 9 5432 1098', notes:'Alérgico a ciertos productos', created_at:'2026-03-20' },
  { id:'c6', barbershop_id:'demo', name:'Pablo Vargas', phone:'+56 9 4321 0987', email:'pablo@mail.com', created_at:'2026-04-01' },
]

const AVATARS = ['bg-brand-100 text-brand-700','bg-amber-100 text-amber-700','bg-purple-100 text-purple-700','bg-red-100 text-red-700','bg-sky-100 text-sky-700']
function avClass(name: string) { let h=0; for(const c of name) h=(h*31+c.charCodeAt(0))&0xff; return AVATARS[h%AVATARS.length] }

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>(DEMO_CLIENTS)
  const [filter, setFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [shopId, setShopId] = useState<string|null>(null)
  const [newClient, setNewClient] = useState({ name:'', phone:'', email:'', notes:'' })
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data:u } = await supabase.auth.getUser()
      if (!u.user) return
      const { data:shop } = await supabase.from('barbershops').select('id').eq('owner_id', u.user.id).single()
      if (!shop) return
      setShopId(shop.id)
      const { data } = await supabase.from('clients').select('*').eq('barbershop_id', shop.id).order('name')
      if (data?.length) setClients(data)
    }
    load()
  }, [])

  async function saveClient(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    if (shopId) {
      const { data } = await supabase.from('clients')
        .insert({ ...newClient, barbershop_id: shopId }).select().single()
      if (data) setClients(prev => [data, ...prev])
    } else {
      setClients(prev => [{ id: Date.now().toString(), barbershop_id:'demo', created_at: new Date().toISOString(), ...newClient }, ...prev])
    }
    setNewClient({ name:'', phone:'', email:'', notes:'' })
    setShowForm(false)
    setSaving(false)
  }

  const filtered = clients.filter(c => {
    const q = filter.toLowerCase()
    return !q || c.name.toLowerCase().includes(q) || c.phone?.includes(q) || c.email?.toLowerCase().includes(q)
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{fontFamily:'var(--font-display)'}}>Clientes</h1>
          <p className="text-gray-400 text-sm mt-0.5">{clients.length} registrados</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancelar' : '+ Nuevo cliente'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={saveClient} className="card p-6 mb-6">
          <h3 className="font-bold mb-4" style={{fontFamily:'var(--font-display)'}}>Nuevo cliente</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="label">Nombre *</label><input required className="input" placeholder="Carlos Pérez" value={newClient.name} onChange={e=>setNewClient(f=>({...f,name:e.target.value}))} /></div>
            <div><label className="label">Teléfono</label><input className="input" placeholder="+56 9 1234 5678" value={newClient.phone} onChange={e=>setNewClient(f=>({...f,phone:e.target.value}))} /></div>
            <div><label className="label">Email</label><input type="email" className="input" placeholder="correo@mail.com" value={newClient.email} onChange={e=>setNewClient(f=>({...f,email:e.target.value}))} /></div>
            <div><label className="label">Notas</label><input className="input" placeholder="Preferencias, alergias..." value={newClient.notes} onChange={e=>setNewClient(f=>({...f,notes:e.target.value}))} /></div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">{saving?'Guardando...':'Guardar cliente'}</button>
            <button type="button" onClick={()=>setShowForm(false)} className="btn-ghost">Cancelar</button>
          </div>
        </form>
      )}

      <div className="mb-5">
        <input className="input max-w-sm" placeholder="Buscar por nombre, teléfono o email..."
          value={filter} onChange={e=>setFilter(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wide">
              <th className="px-5 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-left">Teléfono</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Notas</th>
              <th className="px-4 py-3 text-left">Desde</th>
              <th className="px-4 py-3 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">No se encontraron clientes</td></tr>
            )}
            {filtered.map(c => (
              <tr key={c.id} className="border-t border-gray-50 text-sm hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full text-sm font-bold flex items-center justify-center flex-shrink-0 ${avClass(c.name)}`}>
                      {c.name.split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase()}
                    </div>
                    <span className="font-medium">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{c.phone || <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{c.email || <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3 text-gray-400 text-xs max-w-[180px] truncate">{c.notes || <span className="text-gray-200">—</span>}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(c.created_at).toLocaleDateString('es-CL', {day:'numeric',month:'short',year:'numeric'})}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/reservas/nueva?client=${c.id}`} className="text-xs text-brand-600 hover:underline whitespace-nowrap">
                    + Reserva
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
