'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const HOURS: string[] = []
for (let h = 9; h <= 18; h++) {
  HOURS.push(`${String(h).padStart(2,'0')}:00`)
  if (h < 18) HOURS.push(`${String(h).padStart(2,'0')}:30`)
}

const DEMO_BARBERS = [
  { id:'b1', name:'Mirna', color:'#1a8c65' },
  { id:'b2', name:'Carolina', color:'#5fcba3' },
  { id:'b3', name:'Valentina', color:'#7F77DD' },
]
const DEMO_SERVICES = ['Corte mujer','Corte hombre','Tinte completo','Mechas','Keratina','Brushing','Corte niño/a']
const DEMO_BOOKINGS: Record<string, Record<string, any>> = {
  b1: { '09:00':{client:'Carlos Pérez',service:'Corte mujer',status:'confirmed'}, '09:30':{client:'Carlos Pérez',service:'Corte mujer',status:'confirmed'}, '10:30':{client:'Andrés Soto',service:'Brushing',status:'pending'}, '11:00':{client:'Luis Morales',service:'Tinte completo',status:'confirmed'}, '11:30':{client:'Luis Morales',service:'Tinte completo',status:'confirmed'}, '14:00':{client:'Diego Fuentes',service:'Keratina',status:'pending'} },
  b2: { '10:00':{client:'Valentina R.',service:'Mechas',status:'confirmed'}, '10:30':{client:'Valentina R.',service:'Mechas',status:'confirmed'}, '15:00':{client:'Sofía M.',service:'Corte mujer',status:'pending'} },
  b3: { '09:00':{client:'Camila T.',service:'Brushing',status:'confirmed'}, '12:00':{client:'Daniela P.',service:'Tinte completo',status:'confirmed'}, '12:30':{client:'Daniela P.',service:'Tinte completo',status:'confirmed'} },
}

export default function CalendarioPage() {
  const [barbers, setBarbers] = useState(DEMO_BARBERS)
  const [services, setServices] = useState(DEMO_SERVICES)
  const [selectedBarber, setSelectedBarber] = useState(DEMO_BARBERS[0])
  const [bookings, setBookings] = useState<Record<string, any>>({...DEMO_BOOKINGS.b1})
  const [dateOffset, setDateOffset] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState<string|null>(null)
  const [form, setForm] = useState({ client:'', service:'Corte mujer' })
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState(false)
  const supabase = createClient()

  const today = new Date()
  const currentDate = new Date(today)
  currentDate.setDate(today.getDate() + dateOffset)
  const dateStr = currentDate.toISOString().split('T')[0]
  const dateLabel = currentDate.toLocaleDateString('es-CL', { weekday:'long', day:'numeric', month:'long' })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: u } = await supabase.auth.getUser()
    if (!u.user) return
    const { data: shop } = await supabase.from('barbershops').select('id').eq('owner_id', u.user.id).single()
    if (!shop) return
    const [{ data: b }, { data: s }] = await Promise.all([
      supabase.from('barbers').select('*').eq('barbershop_id', shop.id).eq('active', true),
      supabase.from('services').select('*').eq('barbershop_id', shop.id).eq('active', true),
    ])
    if (b?.length) setBarbers(b)
    if (s?.length) setServices(s.map((x:any) => x.name))
  }

  async function loadBookings(barberId: string, date: string) {
    const { data: u } = await supabase.auth.getUser()
    if (!u.user) return
    const { data: shop } = await supabase.from('barbershops').select('id').eq('owner_id', u.user.id).single()
    if (!shop) return
    const { data } = await supabase.from('reservations')
      .select('*, client:clients(name), service:services(name)')
      .eq('barbershop_id', shop.id)
      .eq('barber_id', barberId)
      .eq('date', date)
      .neq('status', 'cancelled')
    if (data) {
      const map: Record<string, any> = {}
      data.forEach((r: any) => {
        map[r.time.slice(0,5)] = { client: r.client?.name || '—', service: r.service?.name || '—', status: r.status, id: r.id }
      })
      setBookings(map)
    } else {
      setBookings(DEMO_BOOKINGS[barberId] || {})
    }
  }

  function selectBarber(b: typeof DEMO_BARBERS[0]) {
    setSelectedBarber(b)
    setSelectedSlot(null)
    setOk(false)
    loadBookings(b.id, dateStr)
  }

  function changeDay(d: number) {
    const newOffset = dateOffset + d
    setDateOffset(newOffset)
    setSelectedSlot(null)
    setOk(false)
    const newDate = new Date(today)
    newDate.setDate(today.getDate() + newOffset)
    loadBookings(selectedBarber.id, newDate.toISOString().split('T')[0])
  }

  async function saveBooking() {
    if (!selectedSlot || !form.client.trim()) return
    setSaving(true)
    const { data: u } = await supabase.auth.getUser()
    if (u.user) {
      const { data: shop } = await supabase.from('barbershops').select('id').eq('owner_id', u.user.id).single()
      if (shop) {
        let clientId = ''
        const { data: existing } = await supabase.from('clients').select('id').eq('barbershop_id', shop.id).ilike('name', form.client).single()
        if (existing) { clientId = existing.id }
        else {
          const { data: newClient } = await supabase.from('clients').insert({ barbershop_id: shop.id, name: form.client }).select().single()
          clientId = newClient?.id || ''
        }
        const { data: svc } = await supabase.from('services').select('id').eq('barbershop_id', shop.id).eq('name', form.service).single()
        await supabase.from('reservations').insert({
          barbershop_id: shop.id, client_id: clientId, barber_id: selectedBarber.id,
          service_id: svc?.id, date: dateStr, time: selectedSlot + ':00', status: 'pending',
        })
      }
    }
    setBookings(prev => ({ ...prev, [selectedSlot]: { client: form.client, service: form.service, status: 'pending' } }))
    setOk(true)
    setSaving(false)
    setTimeout(() => { setSelectedSlot(null); setOk(false); setForm({ client:'', service: services[0] || 'Corte mujer' }) }, 1200)
  }

  const bookedCount = Object.keys(bookings).length

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Calendario</h1>
          <p className="text-xs text-gray-400 mt-0.5 capitalize">{dateLabel} · {bookedCount} reservas</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            <button onClick={() => changeDay(-1)}
              className="w-7 h-7 border border-gray-200 rounded-lg bg-white text-gray-500 hover:bg-gray-50 text-sm flex items-center justify-center transition-colors">‹</button>
            <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
              {currentDate.toLocaleDateString('es-CL', { weekday:'short', day:'numeric', month:'short' })}
            </span>
            <button onClick={() => changeDay(1)}
              className="w-7 h-7 border border-gray-200 rounded-lg bg-white text-gray-500 hover:bg-gray-50 text-sm flex items-center justify-center transition-colors">›</button>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {barbers.map(b => (
              <button key={b.id} onClick={() => selectBarber(b)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${selectedBarber.id === b.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                style={selectedBarber.id !== b.id ? { borderLeftColor: b.color, borderLeftWidth: 3 } : {}}>
                {b.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 items-start">
        <div className="card overflow-hidden">
          <div style={{ display:'grid', gridTemplateColumns:'52px 1fr' }}>
            <div className="bg-gray-50 border-r border-gray-100">
              {HOURS.map(h => (
                <div key={h} className="h-11 flex items-center justify-end pr-2.5 border-b border-gray-100 last:border-0">
                  <span className="text-xs text-gray-400">{h}</span>
                </div>
              ))}
            </div>
            <div>
              {HOURS.map(h => {
                const b = bookings[h]
                if (b) {
                  const isConf = b.status === 'confirmed'
                  return (
                    <div key={h} className={`h-11 border-b border-gray-100 last:border-0 flex items-center px-3 gap-2 ${isConf ? 'bg-green-50' : 'bg-amber-50'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isConf ? 'bg-green-600' : 'bg-amber-600'}`} />
                      <div className="min-w-0">
                        <p className={`text-xs font-medium truncate ${isConf ? 'text-green-800' : 'text-amber-800'}`}>{b.client}</p>
                        <p className={`text-xs truncate ${isConf ? 'text-green-600' : 'text-amber-600'}`}>{b.service}</p>
                      </div>
                    </div>
                  )
                }
                return (
                  <button key={h} onClick={() => { setSelectedSlot(h); setOk(false) }}
                    className={`w-full h-11 border-b border-gray-100 last:border-0 flex items-center px-3 gap-2 text-left transition-colors ${selectedSlot === h ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200 flex-shrink-0" />
                    <span className="text-xs text-gray-400">Disponible</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div>
          <div className="flex gap-3 flex-wrap mb-4 text-xs">
            {[['bg-green-100','text-green-700','Confirmado'],['bg-amber-100','text-amber-700','Pendiente'],['bg-gray-100','text-gray-500','Disponible']].map(([bg,tc,label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-sm ${bg}`} />
                <span className={tc}>{label}</span>
              </div>
            ))}
          </div>

          {selectedSlot && !ok && (
            <div className="card p-5">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Nueva reserva — <span style={{ color: selectedBarber.color }}>{selectedBarber.name}</span> · {selectedSlot}
              </h3>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="label">Cliente</label>
                  <input className="input" placeholder="Nombre del cliente" value={form.client}
                    onChange={e => setForm(f => ({...f, client: e.target.value}))}
                    onKeyDown={e => e.key === 'Enter' && saveBooking()} autoFocus />
                </div>
                <div>
                  <label className="label">Servicio</label>
                  <select className="input" value={form.service} onChange={e => setForm(f => ({...f, service: e.target.value}))}>
                    {services.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={saveBooking} disabled={saving || !form.client.trim()}
                    className="btn-primary py-2.5 flex-1 disabled:opacity-50">
                    {saving ? 'Guardando...' : 'Confirmar reserva'}
                  </button>
                  <button onClick={() => setSelectedSlot(null)} className="btn-ghost py-2.5 px-4">✕</button>
                </div>
              </div>
            </div>
          )}

          {ok && (
            <div className="card p-5 border-green-200 bg-green-50">
              <p className="text-sm font-medium text-green-800">✓ Reserva creada</p>
              <p className="text-xs text-green-600 mt-1">{form.client} — {selectedSlot} con {selectedBarber.name}</p>
            </div>
          )}

          {!selectedSlot && !ok && (
            <div className="card p-5 text-center">
              <p className="text-sm text-gray-400">Haz click en un horario disponible para crear una reserva</p>
              <div className="mt-4 text-xs text-gray-300">
                <p>{HOURS.length} slots disponibles</p>
                <p>09:00 — 18:00 · cada 30 min</p>
              </div>
            </div>
          )}

          <div className="card p-4 mt-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Resumen del día</p>
            {Object.entries(bookings).sort(([a],[b]) => a.localeCompare(b)).map(([time, b]) => (
              <div key={time} className="flex items-center gap-2.5 py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-xs font-medium text-gray-400 w-10">{time}</span>
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${b.status==='confirmed'?'bg-green-500':'bg-amber-400'}`} />
                <span className="text-xs text-gray-700 font-medium truncate">{b.client}</span>
                <span className="text-xs text-gray-400 truncate">{b.service}</span>
              </div>
            ))}
            {Object.keys(bookings).length === 0 && <p className="text-xs text-gray-300 text-center py-2">Sin reservas este día</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
