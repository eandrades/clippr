'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Reservation } from '@/lib/types'
import Link from 'next/link'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente', confirmed: 'Confirmado', completed: 'Completado', cancelled: 'Cancelado',
}
const STATUS_BADGE: Record<string, string> = {
  pending: 'badge-pending', confirmed: 'badge-confirmed',
  completed: 'badge-completed', cancelled: 'badge-cancelled',
}

// Demo data used when Supabase returns empty (no barbershop configured yet)
const DEMO: Reservation[] = [
  { id:'1', barbershop_id:'demo', client_id:'c1', barber_id:'b1', service_id:'s1', date: new Date().toISOString().split('T')[0], time:'09:00', status:'confirmed', created_at:'', client:{id:'c1',barbershop_id:'demo',name:'Carlos Pérez',phone:'+56 9 8123 4567',created_at:''}, barber:{id:'b1',barbershop_id:'demo',name:'Miguel',color:'#1a8c65',active:true,created_at:''}, service:{id:'s1',barbershop_id:'demo',name:'Corte + barba',duration_min:45,price:8000,active:true} },
  { id:'2', barbershop_id:'demo', client_id:'c2', barber_id:'b2', service_id:'s2', date: new Date().toISOString().split('T')[0], time:'10:30', status:'pending', created_at:'', client:{id:'c2',barbershop_id:'demo',name:'Andrés Soto',phone:'+56 9 7654 3210',created_at:''}, barber:{id:'b2',barbershop_id:'demo',name:'Rodrigo',color:'#5fcba3',active:true,created_at:''}, service:{id:'s2',barbershop_id:'demo',name:'Corte de pelo',duration_min:30,price:5000,active:true} },
  { id:'3', barbershop_id:'demo', client_id:'c3', barber_id:'b1', service_id:'s3', date: new Date().toISOString().split('T')[0], time:'11:00', status:'confirmed', created_at:'', client:{id:'c3',barbershop_id:'demo',name:'Luis Morales',phone:'+56 9 9234 5678',created_at:''}, barber:{id:'b1',barbershop_id:'demo',name:'Miguel',color:'#1a8c65',active:true,created_at:''}, service:{id:'s3',barbershop_id:'demo',name:'Afeitado clásico',duration_min:30,price:4000,active:true} },
  { id:'4', barbershop_id:'demo', client_id:'c4', barber_id:'b3', service_id:'s1', date: new Date().toISOString().split('T')[0], time:'14:00', status:'pending', created_at:'', client:{id:'c4',barbershop_id:'demo',name:'Diego Fuentes',phone:'+56 9 6543 2109',created_at:''}, barber:{id:'b3',barbershop_id:'demo',name:'Felipe',color:'#28a87c',active:true,created_at:''}, service:{id:'s1',barbershop_id:'demo',name:'Corte + barba',duration_min:45,price:8000,active:true} },
]

export default function ReservasPage() {
  const [reservas, setReservas] = useState<Reservation[]>(DEMO)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])
  const supabase = createClient()

  const fetchReservas = useCallback(async () => {
    setLoading(true)
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) { setLoading(false); return }

    const { data: shop } = await supabase.from('barbershops').select('id').eq('owner_id', user.user.id).single()
    if (!shop) { setLoading(false); return }

    let q = supabase.from('reservations')
      .select('*, client:clients(*), barber:barbers(*), service:services(*)')
      .eq('barbershop_id', shop.id)
      .order('date', { ascending: true })
      .order('time', { ascending: true })

    if (dateFilter) q = q.eq('date', dateFilter)
    if (statusFilter !== 'all') q = q.eq('status', statusFilter)

    const { data } = await q
    if (data && data.length > 0) setReservas(data as Reservation[])
    setLoading(false)
  }, [dateFilter, statusFilter])

  useEffect(() => { fetchReservas() }, [fetchReservas])

  async function updateStatus(id: string, status: string) {
    setReservas(prev => prev.map(r => r.id === id ? { ...r, status: status as Reservation['status'] } : r))
    await supabase.from('reservations').update({ status }).eq('id', id)
  }

  const filtered = reservas.filter(r => {
    const q = filter.toLowerCase()
    return !q ||
      r.client?.name.toLowerCase().includes(q) ||
      r.service?.name.toLowerCase().includes(q) ||
      r.barber?.name.toLowerCase().includes(q)
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Reservas</h1>
          <p className="text-gray-400 text-sm mt-0.5">{filtered.length} citas encontradas</p>
        </div>
        <Link href="/admin/reservas/nueva" className="btn-primary">+ Nueva reserva</Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="date" className="input max-w-[160px]"
          value={dateFilter} onChange={e => setDateFilter(e.target.value)}
        />
        <select className="input max-w-[160px]" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input
          type="text" className="input flex-1 min-w-[200px]"
          placeholder="Buscar por cliente, servicio o barbero..."
          value={filter} onChange={e => setFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wide">
              <th className="px-5 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Hora</th>
              <th className="px-4 py-3 text-left">Servicio</th>
              <th className="px-4 py-3 text-left">Barbero</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">Cargando...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">No hay citas para este filtro</td></tr>
            )}
            {!loading && filtered.map(r => (
              <tr key={r.id} className="border-t border-gray-50 text-sm hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {r.client?.name[0]}
                    </div>
                    <div>
                      <p className="font-medium">{r.client?.name}</p>
                      <p className="text-xs text-gray-400">{r.client?.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {new Date(r.date + 'T00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                </td>
                <td className="px-4 py-3 font-medium">{r.time.slice(0, 5)}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  <span>{r.service?.name}</span>
                  {r.service?.price && <p className="text-gray-400">${r.service.price.toLocaleString('es-CL')}</p>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: r.barber?.color || '#1a8c65' }} />
                    <span className="text-sm">{r.barber?.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={STATUS_BADGE[r.status] || 'badge-pending'}>
                    {STATUS_LABELS[r.status] || r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {r.status === 'pending' && (
                      <button onClick={() => updateStatus(r.id, 'confirmed')}
                        className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                        Confirmar
                      </button>
                    )}
                    {r.status === 'confirmed' && (
                      <button onClick={() => updateStatus(r.id, 'completed')}
                        className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                        Completar
                      </button>
                    )}
                    {(r.status === 'pending' || r.status === 'confirmed') && (
                      <button onClick={() => updateStatus(r.id, 'cancelled')}
                        className="text-xs px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                        Cancelar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
