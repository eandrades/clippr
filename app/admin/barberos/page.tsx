'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Barber } from '@/lib/types'

const COLORS = ['#1a8c65','#5fcba3','#28a87c','#7F77DD','#D85A30','#D4537E','#378ADD','#BA7517']
const DEMO: Barber[] = [
  {id:'b1',barbershop_id:'demo',name:'Miguel',color:'#1a8c65',active:true,created_at:''},
  {id:'b2',barbershop_id:'demo',name:'Rodrigo',color:'#5fcba3',active:true,created_at:''},
  {id:'b3',barbershop_id:'demo',name:'Felipe',color:'#28a87c',active:true,created_at:''},
]

export default function BarberosPage() {
  const [barbers, setBarbers] = useState<Barber[]>(DEMO)
  const [shopId, setShopId] = useState<string|null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({name:'',color:'#1a8c65'})
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const {data:u} = await supabase.auth.getUser(); if(!u.user)return
      const {data:shop} = await supabase.from('barbershops').select('id').eq('owner_id',u.user.id).single(); if(!shop)return
      setShopId(shop.id)
      const {data} = await supabase.from('barbers').select('*').eq('barbershop_id',shop.id).order('name')
      if(data?.length) setBarbers(data)
    }
    load()
  },[])

  async function saveBarber(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    if(shopId) {
      const {data} = await supabase.from('barbers').insert({name:form.name,color:form.color,barbershop_id:shopId,active:true}).select().single()
      if(data) setBarbers(p=>[...p,data])
    } else {
      setBarbers(p=>[...p,{id:Date.now().toString(),barbershop_id:'demo',name:form.name,color:form.color,active:true,created_at:''}])
    }
    setForm({name:'',color:'#1a8c65'}); setShowForm(false); setSaving(false)
  }

  async function toggleActive(id: string, active: boolean) {
    setBarbers(p=>p.map(b=>b.id===id?{...b,active:!active}:b))
    if(shopId) await supabase.from('barbers').update({active:!active}).eq('id',id)
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{fontFamily:'var(--font-display)'}}>Barberos</h1>
          <p className="text-gray-400 text-sm mt-0.5">{barbers.filter(b=>b.active).length} activos</p>
        </div>
        <button onClick={()=>setShowForm(!showForm)} className="btn-primary">{showForm?'Cancelar':'+ Agregar barbero'}</button>
      </div>

      {showForm && (
        <form onSubmit={saveBarber} className="card p-6 mb-6">
          <h3 className="font-bold mb-4" style={{fontFamily:'var(--font-display)'}}>Nuevo barbero</h3>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="label">Nombre *</label>
              <input required className="input" placeholder="Miguel Torres"
                value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
            </div>
            <div>
              <label className="label">Color</label>
              <div className="flex gap-2">
                {COLORS.map(c=>(
                  <button key={c} type="button" onClick={()=>setForm(f=>({...f,color:c}))}
                    className={`w-7 h-7 rounded-full transition-all ${form.color===c?'ring-2 ring-offset-2 ring-gray-400 scale-110':''}`}
                    style={{background:c}} />
                ))}
              </div>
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary mt-4 disabled:opacity-60">
            {saving?'Guardando...':'Guardar barbero'}
          </button>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {barbers.map(b=>(
          <div key={b.id} className={`card px-5 py-4 flex items-center gap-4 ${!b.active?'opacity-50':''}`}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{background:b.color}}>
              {b.name.split(' ').map(p=>p[0]).join('').toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-medium">{b.name}</p>
              <p className="text-xs text-gray-400">{b.active?'Activo':'Inactivo'}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{background:b.color}} />
              <button onClick={()=>toggleActive(b.id,b.active)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${b.active?'bg-red-50 text-red-600 hover:bg-red-100':'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
                {b.active?'Desactivar':'Activar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
