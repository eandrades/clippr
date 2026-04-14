'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Service } from '@/lib/types'

const DEMO: Service[] = [
  {id:'s1',barbershop_id:'demo',name:'Corte de pelo',duration_min:30,price:5000,active:true},
  {id:'s2',barbershop_id:'demo',name:'Corte + barba',duration_min:45,price:8000,active:true},
  {id:'s3',barbershop_id:'demo',name:'Arreglo de barba',duration_min:20,price:3500,active:true},
  {id:'s4',barbershop_id:'demo',name:'Afeitado clásico',duration_min:30,price:4000,active:true},
  {id:'s5',barbershop_id:'demo',name:'Corte niño',duration_min:20,price:4000,active:true},
]

export default function ServiciosPage() {
  const [services, setServices] = useState<Service[]>(DEMO)
  const [shopId, setShopId] = useState<string|null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({name:'',duration_min:30,price:''})
  const supabase = createClient()

  useEffect(()=>{
    async function load(){
      const{data:u}=await supabase.auth.getUser();if(!u.user)return
      const{data:shop}=await supabase.from('barbershops').select('id').eq('owner_id',u.user.id).single();if(!shop)return
      setShopId(shop.id)
      const{data}=await supabase.from('services').select('*').eq('barbershop_id',shop.id).order('name')
      if(data?.length)setServices(data)
    }
    load()
  },[])

  async function saveService(e:React.FormEvent){
    e.preventDefault();setSaving(true)
    const payload={name:form.name,duration_min:Number(form.duration_min),price:form.price?Number(form.price):null,active:true}
    if(shopId){
      const{data}=await supabase.from('services').insert({...payload,barbershop_id:shopId}).select().single()
      if(data)setServices(p=>[...p,data])
    }else{
      setServices(p=>[...p,{id:Date.now().toString(),barbershop_id:'demo',created_at:'',...payload} as Service])
    }
    setForm({name:'',duration_min:30,price:''});setShowForm(false);setSaving(false)
  }

  async function toggleService(id:string,active:boolean){
    setServices(p=>p.map(s=>s.id===id?{...s,active:!active}:s))
    if(shopId)await supabase.from('services').update({active:!active}).eq('id',id)
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{fontFamily:'var(--font-display)'}}>Servicios</h1>
          <p className="text-gray-400 text-sm mt-0.5">{services.filter(s=>s.active).length} activos</p>
        </div>
        <button onClick={()=>setShowForm(!showForm)} className="btn-primary">{showForm?'Cancelar':'+ Nuevo servicio'}</button>
      </div>

      {showForm&&(
        <form onSubmit={saveService} className="card p-6 mb-6">
          <h3 className="font-bold mb-4" style={{fontFamily:'var(--font-display)'}}>Nuevo servicio</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="col-span-3"><label className="label">Nombre *</label>
              <input required className="input" placeholder="Corte + barba" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} /></div>
            <div><label className="label">Duración (min)</label>
              <input required type="number" min="5" max="180" className="input" value={form.duration_min} onChange={e=>setForm(f=>({...f,duration_min:Number(e.target.value)}))} /></div>
            <div><label className="label">Precio (CLP)</label>
              <input type="number" min="0" className="input" placeholder="5000" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} /></div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">{saving?'Guardando...':'Guardar servicio'}</button>
        </form>
      )}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wide">
              <th className="px-5 py-3 text-left">Servicio</th>
              <th className="px-4 py-3 text-left">Duración</th>
              <th className="px-4 py-3 text-left">Precio</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {services.map(s=>(
              <tr key={s.id} className={`border-t border-gray-50 text-sm hover:bg-gray-50/50 transition-colors ${!s.active?'opacity-50':''}`}>
                <td className="px-5 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3 text-gray-500">{s.duration_min} min</td>
                <td className="px-4 py-3 text-gray-600">{s.price?`$${s.price.toLocaleString('es-CL')}`:<span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3">
                  <span className={s.active?'badge-confirmed':'badge-completed'}>{s.active?'Activo':'Inactivo'}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={()=>toggleService(s.id,s.active)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${s.active?'bg-red-50 text-red-600 hover:bg-red-100':'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
                    {s.active?'Desactivar':'Activar'}
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
