'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Client, Barber, Service } from '@/lib/types'
import Link from 'next/link'

const DEMO_CLIENTS: Client[] = [
  { id:'c1', barbershop_id:'demo', name:'Carlos Pérez', phone:'+56 9 8123 4567', created_at:'' },
  { id:'c2', barbershop_id:'demo', name:'Andrés Soto', phone:'+56 9 7654 3210', created_at:'' },
]
const DEMO_BARBERS: Barber[] = [
  { id:'b1', barbershop_id:'demo', name:'Miguel', color:'#1a8c65', active:true, created_at:'' },
  { id:'b2', barbershop_id:'demo', name:'Rodrigo', color:'#5fcba3', active:true, created_at:'' },
  { id:'b3', barbershop_id:'demo', name:'Felipe', color:'#28a87c', active:true, created_at:'' },
]
const DEMO_SERVICES: Service[] = [
  { id:'s1', barbershop_id:'demo', name:'Corte de pelo', duration_min:30, price:5000, active:true },
  { id:'s2', barbershop_id:'demo', name:'Corte + barba', duration_min:45, price:8000, active:true },
  { id:'s3', barbershop_id:'demo', name:'Arreglo de barba', duration_min:20, price:3500, active:true },
  { id:'s4', barbershop_id:'demo', name:'Afeitado clásico', duration_min:30, price:4000, active:true },
  { id:'s5', barbershop_id:'demo', name:'Corte niño', duration_min:20, price:4000, active:true },
]
const TIMES = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00']

export default function NuevaReservaPage() {
  const router = useRouter()
  const supabase = createClient()
  const [clients, setClients] = useState<Client[]>(DEMO_CLIENTS)
  const [barbers, setBarbers] = useState<Barber[]>(DEMO_BARBERS)
  const [services, setServices] = useState<Service[]>(DEMO_SERVICES)
  const [shopId, setShopId] = useState<string | null>(null)

  const [form, setForm] = useState({
    client_id: '', client_name: '', client_phone: '',
    barber_id: '', service_id: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00', notes: '', is_new_client: false,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: u } = await supabase.auth.getUser()
      if (!u.user) return
      const { data: shop } = await supabase.from('barbershops').select('id').eq('owner_id', u.user.id).single()
      if (!shop) return
      setShopId(shop.id)
      const [c, b, s] = await Promise.all([
        supabase.from('clients').select('*').eq('barbershop_id', shop.id).order('name'),
        supabase.from('barbers').select('*').eq('barbershop_id', shop.id).eq('active', true),
        supabase.from('services').select('*').eq('barbershop_id', shop.id).eq('active', true),
      ])
      if (c.data?.length) setClients(c.data)
      if (b.data?.length) setBarbers(b.data)
      if (s.data?.length) setServices(s.data)
    }
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    if (!shopId) { setLoading(false); setSuccess(true); return }

    let clientId = form.client_id
    if (form.is_new_client) {
      const { data: newClient } = await supabase.from('clients').insert({
        barbershop_id: shopId, name: form.client_name, phone: form.client_phone,
      }).select().single()
      clientId = newClient?.id || ''
    }

    await supabase.from('reservations').insert({
      barbershop_id: shopId, client_id: clientId,
      barber_id: form.barber_id, service_id: form.service_id,
      date: form.date, time: form.time, notes: form.notes, status: 'pending',
    })
    setSuccess(true)
    setTimeout(() => router.push('/admin/reservas'), 1200)
  }

  const selectedService = services.find(s => s.id === form.service_id)

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/reservas" className="text-gray-400 hover:text-gray-700 text-sm">← Reservas</Link>
        <span className="text-gray-200">/</span>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Nueva reserva</h1>
      </div>

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 text-emerald-700 font-medium text-sm">
          ✓ Reserva creada correctamente. Redirigiendo...
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-7 flex flex-col gap-5">
        {/* Client */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="label mb-0">Cliente</label>
            <button type="button" onClick={() => setForm(f => ({ ...f, is_new_client: !f.is_new_client, client_id: '' }))}
              className="text-xs text-brand-600 hover:underline">
              {form.is_new_client ? '← Cliente existente' : '+ Nuevo cliente'}
            </button>
          </div>
          {form.is_new_client ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Nombre</label>
                <input required className="input" placeholder="Carlos Pérez"
                  value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} />
              </div>
              <div>
                <label className="label">Teléfono</label>
                <input className="input" placeholder="+56 9 1234 5678"
                  value={form.client_phone} onChange={e => setForm(f => ({ ...f, client_phone: e.target.value }))} />
              </div>
            </div>
          ) : (
            <select required className="input" value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}>
              <option value="">Seleccionar cliente...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name} {c.phone ? `· ${c.phone}` : ''}</option>)}
            </select>
          )}
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Fecha</label>
            <input required type="date" className="input"
              value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div>
            <label className="label">Hora</label>
            <select required className="input" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}>
              {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Service */}
        <div>
          <label className="label">Servicio</label>
          <select required className="input" value={form.service_id} onChange={e => setForm(f => ({ ...f, service_id: e.target.value }))}>
            <option value="">Seleccionar servicio...</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} {s.price ? `· $${s.price.toLocaleString('es-CL')}` : ''} {s.duration_min ? `· ${s.duration_min} min` : ''}
              </option>
            ))}
          </select>
          {selectedService && (
            <p className="text-xs text-gray-400 mt-1.5">
              Duración: {selectedService.duration_min} min
              {selectedService.price ? ` · Precio: $${selectedService.price.toLocaleString('es-CL')}` : ''}
            </p>
          )}
        </div>

        {/* Barber */}
        <div>
          <label className="label">Barbero</label>
          <div className="grid grid-cols-3 gap-2">
            {barbers.map(b => (
              <button key={b.id} type="button"
                onClick={() => setForm(f => ({ ...f, barber_id: b.id }))}
                className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 ${
                  form.barber_id === b.id
                    ? 'border-brand-400 bg-brand-50 text-brand-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: b.color }} />
                {b.name}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="label">Notas (opcional)</label>
          <textarea rows={2} className="input resize-none" placeholder="Instrucciones especiales..."
            value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={loading || success} className="btn-primary flex-1 py-3 disabled:opacity-60">
            {loading ? 'Guardando...' : 'Crear reserva →'}
          </button>
          <Link href="/admin/reservas" className="btn-ghost px-6 py-3">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
