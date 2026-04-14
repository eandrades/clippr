'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const HOURS: string[] = []
for (let h = 9; h <= 18; h++) {
  HOURS.push(`${String(h).padStart(2,'0')}:00`)
  if (h < 18) HOURS.push(`${String(h).padStart(2,'0')}:30`)
}

const DUR_LABEL: Record<number,string> = {1:'30 min',2:'1 hora',3:'1:30 h',4:'2 horas',5:'2:30 h'}
const DUR_CLASS: Record<number,string> = {1:'bg-gray-100 text-gray-600',2:'bg-amber-50 text-amber-700',3:'bg-pink-50 text-pink-700',4:'bg-purple-50 text-purple-700',5:'bg-green-50 text-green-700'}

const DEMO_SVCS = [
  {id:'s1',name:'Corte mujer',dur:30,slots:1,price:8000,icon:'✂'},
  {id:'s2',name:'Corte + peinado',dur:60,slots:2,price:12000,icon:'💇'},
  {id:'s3',name:'Tinte completo',dur:90,slots:3,price:25000,icon:'🎨'},
  {id:'s4',name:'Mechas',dur:120,slots:4,price:35000,icon:'✨'},
  {id:'s5',name:'Keratina',dur:150,slots:5,price:45000,icon:'💆'},
  {id:'s6',name:'Brushing',dur:30,slots:1,price:7000,icon:'💨'},
  {id:'s7',name:'Corte niño/a',dur:30,slots:1,price:4000,icon:'🧒'},
]
const DEMO_BARBERS = [
  {id:'b1',name:'Mirna',color:'#1a8c65'},
  {id:'b2',name:'Carolina',color:'#5fcba3'},
  {id:'b3',name:'Valentina',color:'#7F77DD'},
]

export default function ReservaPublica() {
  const [step, setStep] = useState(1)
  const [services, setServices] = useState(DEMO_SVCS)
  const [barbers, setBarbers] = useState(DEMO_BARBERS)
  const [takenSlots, setTakenSlots] = useState<Record<string,string[]>>({})
  const [shopId, setShopId] = useState('')
  const [sel, setSel] = useState<any>({ svc: null, time: null, barber: null, name: '', phone: '', pay: null })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: shops } = await supabase.from('barbershops').select('*').eq('slug', 'peluqueria-mirna').single()
    if (!shops) return
    setShopId(shops.id)
    const [{ data: b }, { data: s }] = await Promise.all([
      supabase.from('barbers').select('*').eq('barbershop_id', shops.id).eq('active', true),
      supabase.from('services').select('*').eq('barbershop_id', shops.id).eq('active', true),
    ])
    if (b?.length) setBarbers(b.map((x:any) => ({ id: x.id, name: x.name, color: x.color })))
    if (s?.length) setServices(s.map((x:any) => ({ id: x.id, name: x.name, dur: x.duration_min, slots: Math.ceil(x.duration_min / 30), price: x.price || 0, icon: '✂' })))
  }

  async function loadTaken(barberId: string) {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase.from('reservations')
      .select('time, service:services(duration_min)')
      .eq('barber_id', barberId)
      .eq('date', today)
      .neq('status', 'cancelled')
    if (!data) return
    const taken: string[] = []
    data.forEach((r: any) => {
      const idx = HOURS.indexOf(r.time?.slice(0,5))
      const slots = Math.ceil((r.service?.duration_min || 30) / 30)
      for (let i = 0; i < slots; i++) { if (HOURS[idx + i]) taken.push(HOURS[idx + i]) }
    })
    setTakenSlots(prev => ({ ...prev, [barberId]: taken }))
  }

  function getSlotStatus(hour: string, barberId: string, slotsNeeded: number) {
    const taken = takenSlots[barberId] || []
    const idx = HOURS.indexOf(hour)
    if (idx === -1 || idx + slotsNeeded > HOURS.length) return 'unavailable'
    for (let i = 0; i < slotsNeeded; i++) {
      if (taken.includes(HOURS[idx + i])) return i === 0 ? 'taken' : 'partial'
    }
    return 'free'
  }

  function selectBarber(b: any) {
    setSel((prev: any) => ({ ...prev, barber: b, time: null }))
    if (!takenSlots[b.id]) loadTaken(b.id)
  }

  async function confirm() {
    setSaving(true)
    if (shopId && sel.svc && sel.time && sel.barber) {
      let clientId = ''
      const { data: existing } = await supabase.from('clients').select('id').eq('barbershop_id', shopId).ilike('name', sel.name).single()
      if (existing) { clientId = existing.id }
      else {
        const { data: nc } = await supabase.from('clients').insert({ barbershop_id: shopId, name: sel.name, phone: sel.phone }).select().single()
        clientId = nc?.id || ''
      }
      const { data: svc } = await supabase.from('services').select('id').eq('barbershop_id', shopId).eq('name', sel.svc.name).single()
      await supabase.from('reservations').insert({
        barbershop_id: shopId, client_id: clientId, barber_id: sel.barber.id,
        service_id: svc?.id, date: new Date().toISOString().split('T')[0],
        time: sel.time + ':00', status: 'pending',
      })
    }
    setSaving(false)
    setStep(5)
  }

  const fmt = (n: number) => '$' + n.toLocaleString('es-CL')
  const endTime = sel.time ? HOURS[HOURS.indexOf(sel.time) + (sel.svc?.slots || 1)] || '18:00' : ''

  return (
    <div className="min-h-screen bg-[#f5f5f3] flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Reserva online</div>
          <h1 className="text-2xl font-medium text-gray-900">Peluquería Mirna</h1>
          <p className="text-sm text-gray-400 mt-1">Av. Providencia 1234, Santiago</p>
        </div>

        {/* Step indicator */}
        {step < 5 && (
          <div className="flex items-center gap-2 mb-6">
            {['Servicio','Horario','Datos','Pago'].map((l, i) => (
              <>
                {i > 0 && <div key={`l${i}`} className={`flex-1 h-px ${i < step ? 'bg-gray-900' : 'bg-gray-200'}`} />}
                <div key={l} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${i + 1 < step ? 'bg-gray-900 text-white' : i + 1 === step ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {i + 1 < step ? '✓' : i + 1}
                </div>
              </>
            ))}
          </div>
        )}

        {/* Step 1 — Servicio */}
        {step === 1 && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Elige tu servicio</p>
            {services.map(sv => (
              <div key={sv.id} onClick={() => setSel((p:any) => ({ ...p, svc: sv, time: null }))}
                className={`bg-white border rounded-xl p-3 mb-2 cursor-pointer flex items-center gap-3 transition-all ${sel.svc?.id === sv.id ? 'border-gray-900' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-lg flex-shrink-0">{sv.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-900">{sv.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DUR_CLASS[sv.slots]}`}>{DUR_LABEL[sv.slots]}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{sv.dur} min</div>
                </div>
                <div className="text-sm font-medium text-gray-900 flex-shrink-0">{fmt(sv.price)}</div>
                {sel.svc?.id === sv.id && <div className="w-4 h-4 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center flex-shrink-0">✓</div>}
              </div>
            ))}
            <button onClick={() => setStep(2)} disabled={!sel.svc}
              className="w-full mt-3 py-3.5 bg-gray-900 text-white rounded-xl text-sm font-medium disabled:opacity-30 transition-opacity">
              Continuar →
            </button>
          </div>
        )}

        {/* Step 2 — Horario */}
        {step === 2 && (
          <div>
            <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 text-xs text-green-700 font-medium mb-4">
              {sel.svc.name} · {DUR_LABEL[sel.svc.slots]} — se reservan {sel.svc.slots} slot{sel.svc.slots > 1 ? 's' : ''} consecutivos
            </div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Elige estilista</p>
            <div className="flex gap-2 flex-wrap mb-5">
              {barbers.map(b => (
                <button key={b.id} onClick={() => selectBarber(b)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${sel.barber?.id === b.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200'}`}
                  style={sel.barber?.id !== b.id ? { borderLeftColor: b.color, borderLeftWidth: 3 } : {}}>
                  {b.name}
                </button>
              ))}
            </div>
            {sel.barber && (
              <>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Horarios disponibles — hoy</p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {HOURS.map(h => {
                    const status = getSlotStatus(h, sel.barber.id, sel.svc.slots)
                    if (status === 'unavailable') return null
                    return (
                      <button key={h} disabled={status !== 'free'} onClick={() => setSel((p:any) => ({ ...p, time: h }))}
                        className={`py-2.5 rounded-lg text-xs font-medium transition-all border font-mono ${
                          status === 'taken' ? 'bg-gray-50 text-gray-300 border-gray-100 line-through cursor-not-allowed' :
                          status === 'partial' ? 'bg-amber-50 text-amber-400 border-amber-100 cursor-not-allowed' :
                          sel.time === h ? 'bg-gray-900 text-white border-gray-900' :
                          'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                        }`}>
                        {h}
                      </button>
                    )
                  })}
                </div>
                <div className="flex gap-3 text-xs mb-4 flex-wrap">
                  <span className="text-gray-300">▬ Ocupado</span>
                  <span className="text-amber-400">▬ Sin espacio</span>
                  <span className="text-gray-600">▬ Disponible</span>
                </div>
              </>
            )}
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="py-3.5 px-5 border border-gray-200 bg-white text-gray-600 rounded-xl text-sm font-medium">←</button>
              <button onClick={() => setStep(3)} disabled={!sel.time || !sel.barber}
                className="flex-1 py-3.5 bg-gray-900 text-white rounded-xl text-sm font-medium disabled:opacity-30">
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Datos */}
        {step === 3 && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Tu información</p>
            <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white text-gray-900 mb-3 focus:outline-none focus:border-gray-400"
              placeholder="Tu nombre completo" value={sel.name} onChange={e => setSel((p:any) => ({...p, name: e.target.value}))} />
            <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white text-gray-900 mb-4 focus:outline-none focus:border-gray-400"
              placeholder="WhatsApp (+56 9...)" value={sel.phone} onChange={e => setSel((p:any) => ({...p, phone: e.target.value}))} />
            <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Resumen</p>
              {[['Servicio', sel.svc?.name], ['Duración', DUR_LABEL[sel.svc?.slots||1]], ['Horario', `${sel.time} — ${endTime}`], ['Con', sel.barber?.name]].map(([k,v]) => (
                <div key={k} className="flex justify-between text-sm py-1"><span className="text-gray-400">{k}</span><span className="font-medium text-gray-900">{v}</span></div>
              ))}
              <div className="flex justify-between pt-2 mt-1 border-t border-gray-100">
                <span className="text-base font-medium text-gray-900">Total</span>
                <span className="text-lg font-medium text-gray-900">{fmt(sel.svc?.price||0)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(2)} className="py-3.5 px-5 border border-gray-200 bg-white text-gray-600 rounded-xl text-sm font-medium">←</button>
              <button onClick={() => setStep(4)} disabled={!sel.name.trim() || !sel.phone.trim()}
                className="flex-1 py-3.5 bg-gray-900 text-white rounded-xl text-sm font-medium disabled:opacity-30">
                Ir a pagar →
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Pago */}
        {step === 4 && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Forma de pago</p>
            {[
              {id:'transfer',name:'Transferencia / QR',sub:'Banco Estado · RUT 12.345.678-9',icon:'🏦'},
              {id:'cash',name:'Efectivo',sub:'Paga al llegar al local',icon:'💵'},
            ].map(p => (
              <div key={p.id} onClick={() => setSel((prev:any) => ({...prev, pay: p.id}))}
                className={`bg-white border rounded-xl p-3 mb-2 cursor-pointer flex items-center gap-3 transition-all ${sel.pay === p.id ? 'border-gray-900' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-lg flex-shrink-0">{p.icon}</div>
                <div className="flex-1"><div className="text-sm font-medium text-gray-900">{p.name}</div><div className="text-xs text-gray-400 mt-0.5">{p.sub}</div></div>
                <div className={`w-4 h-4 rounded-full border flex-shrink-0 ${sel.pay === p.id ? 'border-gray-900 bg-gray-900 shadow-[inset_0_0_0_2px_white]' : 'border-gray-300'}`} />
              </div>
            ))}
            {sel.pay === 'transfer' && (
              <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center mt-3 mb-3">
                <div className="text-xs text-gray-400 mb-2">Escanea con tu app bancaria</div>
                <div className="grid gap-0.5 mx-auto mb-2" style={{gridTemplateColumns:'repeat(17,11px)',width:'fit-content'}}>
                  {[[1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1],[1,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0,1],[1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1],[1,0,1,1,1,0,1,0,0,1,0,1,1,1,1,0,1],[1,0,0,0,0,0,1,0,1,0,1,0,0,0,0,0,1],[1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1],[0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0],[1,0,1,1,0,1,0,1,0,1,0,0,1,0,1,0,1],[0,1,0,0,1,0,1,0,1,0,1,1,0,1,0,1,0],[0,0,0,0,0,0,0,0,1,1,0,0,1,0,0,1,1],[1,1,1,1,1,1,1,0,0,1,0,1,0,0,1,0,0],[1,0,0,0,0,0,1,0,1,0,1,0,0,1,0,1,0],[1,0,1,1,1,0,1,0,0,1,0,0,1,0,1,0,1],[1,0,1,1,1,0,1,0,1,0,1,1,0,0,0,0,0],[1,0,0,0,0,0,1,0,0,1,0,0,1,1,0,1,0],[1,1,1,1,1,1,1,0,1,0,0,0,0,0,1,0,1],[0,0,0,0,0,0,0,0,0,1,1,0,0,1,0,0,1]].flat().map((v,i) => (
                    <div key={i} style={{width:11,height:11,borderRadius:1,background:v?'#111':'transparent'}} />
                  ))}
                </div>
                <div className="text-base font-medium text-gray-900">{fmt(sel.svc?.price||0)}</div>
                <div className="text-xs text-gray-400 mt-1">Banco Estado · Cta Cte 000-123-456</div>
              </div>
            )}
            {sel.pay === 'cash' && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 mt-2 mb-2">
                💵 Tu reserva queda confirmada. Paga al llegar al local.
              </div>
            )}
            <div className="flex gap-2 mt-2">
              <button onClick={() => setStep(3)} className="py-3.5 px-5 border border-gray-200 bg-white text-gray-600 rounded-xl text-sm font-medium">←</button>
              <button onClick={confirm} disabled={!sel.pay || saving}
                className="flex-1 py-3.5 bg-gray-900 text-white rounded-xl text-sm font-medium disabled:opacity-30">
                {saving ? 'Confirmando...' : 'Confirmar reserva →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 5 — Confirmación */}
        {step === 5 && (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">¡Listo, {sel.name.split(' ')[0]}!</h2>
            <p className="text-sm text-gray-400 mb-5 leading-relaxed">Confirmación enviada por WhatsApp<br />al {sel.phone}</p>
            <div className="bg-white border border-gray-100 rounded-xl p-4 mb-5 text-left">
              {[['Servicio',sel.svc?.name],['Duración',DUR_LABEL[sel.svc?.slots||1]],['Horario',`${sel.time} — ${endTime}`],['Con',sel.barber?.name],['Total',fmt(sel.svc?.price||0)],['Pago',sel.pay==='transfer'?'Transferencia':'Efectivo']].map(([k,v]) => (
                <div key={k} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-gray-400">{k}</span><span className="font-medium text-gray-900">{v}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mb-5">📍 Av. Providencia 1234, Santiago</p>
            <button onClick={() => { setStep(1); setSel({ svc:null, time:null, barber:null, name:'', phone:'', pay:null }) }}
              className="w-full py-3.5 bg-gray-900 text-white rounded-xl text-sm font-medium">
              Hacer otra reserva
            </button>
          </div>
        )}

        <p className="text-center text-xs text-gray-300 mt-6">Powered by <span className="font-medium text-gray-400">clippr.</span></p>
      </div>
    </div>
  )
}
