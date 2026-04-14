'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
export default function ConfigPage() {
  const [form,setForm] = useState({name:'Peluquería Mirna',slug:'peluqueria-mirna',address:'Av. Providencia 1234',city:'Santiago',phone:'+56 9 1234 5678',email:'contacto@peluqueriamirna.cl'})
  const [saved,setSaved] = useState(false)
  const supabase = createClient()
  useEffect(()=>{
    supabase.auth.getUser().then(async({data:u})=>{
      if(!u.user)return
      const{data:s}=await supabase.from('barbershops').select('*').eq('owner_id',u.user.id).single()
      if(s)setForm({name:s.name||'',slug:s.slug||'',address:s.address||'',city:s.city||'',phone:s.phone||'',email:s.email||''})
    })
  },[])
  async function save(e:React.FormEvent){
    e.preventDefault()
    const{data:u}=await supabase.auth.getUser(); if(!u.user)return
    await supabase.from('barbershops').update(form).eq('owner_id',u.user.id)
    setSaved(true); setTimeout(()=>setSaved(false),2000)
  }
  return (
    <div className="max-w-xl">
      <div className="mb-6"><h1 className="text-xl font-medium text-gray-900">Configuración</h1><p className="text-xs text-gray-400 mt-0.5">Datos de tu estudio</p></div>
      <form onSubmit={save} className="card p-6 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Nombre</label><input className="input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Peluquería Mirna"/></div>
          <div><label className="label">Slug</label><input className="input" value={form.slug} onChange={e=>setForm(f=>({...f,slug:e.target.value}))} placeholder="peluqueria-mirna"/></div>
          <div><label className="label">Ciudad</label><input className="input" value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} placeholder="Santiago"/></div>
          <div><label className="label">Teléfono</label><input className="input" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+56 9 1234 5678"/></div>
          <div className="col-span-2"><label className="label">Dirección</label><input className="input" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} placeholder="Av. Providencia 1234"/></div>
          <div className="col-span-2"><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="contacto@estudio.cl"/></div>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <button type="submit" className="btn-primary py-2.5">Guardar cambios</button>
          {saved&&<span className="text-xs text-green-600">✓ Guardado</span>}
        </div>
      </form>
    </div>
  )
}
