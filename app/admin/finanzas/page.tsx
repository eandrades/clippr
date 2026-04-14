'use client'
import { useState } from 'react'
const SVCS_DATA = [{name:'Corte + peinado',total:96000,pct:44},{name:'Tinte completo',total:75000,pct:34},{name:'Keratina',total:28000,pct:13},{name:'Brushing',total:19500,pct:9}]
export default function FinanzasPage() {
  const [tab,setTab] = useState<'resumen'|'gastos'>('resumen')
  const [gastos,setGastos] = useState([{id:'g1',date:'2026-04-01',desc:'Arriendo local',cat:'Arriendo',amount:65000},{id:'g2',date:'2026-04-05',desc:'Insumos',cat:'Insumos',amount:19000}])
  const [form,setForm] = useState({desc:'',cat:'Arriendo',amount:'',date:new Date().toISOString().split('T')[0]})
  const [show,setShow] = useState(false)
  const fmt=(n:number)=>'$'+n.toLocaleString('es-CL')
  const ingresos=218500; const totalG=gastos.reduce((a,b)=>a+b.amount,0); const util=ingresos-totalG
  return (
    <div>
      <div className="mb-6"><h1 className="text-xl font-medium text-gray-900">Finanzas</h1><p className="text-xs text-gray-400 mt-0.5">Mes actual</p></div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-xl p-4 border border-green-100"><p className="text-xs font-medium text-green-600 uppercase tracking-wider mb-1">Ingresos</p><p className="text-2xl font-medium text-green-800">{fmt(ingresos)}</p><p className="text-xs text-green-500 mt-1">+12% vs mes anterior</p></div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-100"><p className="text-xs font-medium text-red-500 uppercase tracking-wider mb-1">Gastos</p><p className="text-2xl font-medium text-red-700">{fmt(totalG)}</p><p className="text-xs text-red-400 mt-1">{gastos.length} registros</p></div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200"><p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Utilidad</p><p className="text-2xl font-medium text-gray-900">{fmt(util)}</p><p className="text-xs text-gray-400 mt-1">Margen {Math.round(util/ingresos*100)}%</p></div>
      </div>
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-5">
        {(['resumen','gastos'] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${tab===t?'bg-white text-gray-900 shadow-sm':'text-gray-500'}`}>{t}</button>
        ))}
      </div>
      {tab==='resumen'&&(
        <div className="card p-5 max-w-sm">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Por servicio</h3>
          {SVCS_DATA.map(s=>(
            <div key={s.name} className="mb-3">
              <div className="flex justify-between text-sm mb-1"><span className="text-gray-700">{s.name}</span><span className="font-medium text-green-700">{fmt(s.total)}</span></div>
              <div className="bg-gray-100 rounded-full h-1.5"><div className="bg-gray-900 rounded-full h-1.5" style={{width:`${s.pct}%`}}/></div>
            </div>
          ))}
        </div>
      )}
      {tab==='gastos'&&(
        <div className="max-w-xl">
          <div className="flex justify-end mb-4"><button onClick={()=>setShow(!show)} className="btn-primary text-sm py-2">{show?'Cancelar':'+ Agregar gasto'}</button></div>
          {show&&(
            <div className="card p-5 mb-4">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><label className="label">Descripción</label><input className="input" placeholder="Arriendo" value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))}/></div>
                <div><label className="label">Monto CLP</label><input type="number" className="input" placeholder="50000" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))}/></div>
                <div><label className="label">Categoría</label>
                  <select className="input" value={form.cat} onChange={e=>setForm(f=>({...f,cat:e.target.value}))}>
                    {['Arriendo','Insumos','Servicios básicos','Marketing','Sueldos','Otro'].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="label">Fecha</label><input type="date" className="input" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></div>
              </div>
              <button onClick={()=>{if(!form.desc||!form.amount)return;setGastos(p=>[...p,{id:Date.now().toString(),...form,amount:Number(form.amount)}]);setForm({desc:'',cat:'Arriendo',amount:'',date:new Date().toISOString().split('T')[0]});setShow(false)}} className="btn-primary text-sm py-2">Guardar</button>
            </div>
          )}
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead><tr className="bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wide">
                <th className="px-5 py-3 text-left">Descripción</th><th className="px-4 py-3 text-left">Categoría</th><th className="px-4 py-3 text-right">Monto</th>
              </tr></thead>
              <tbody>{gastos.map(g=>(
                <tr key={g.id} className="border-t border-gray-50 text-sm"><td className="px-5 py-3 text-gray-700">{g.desc}</td>
                <td className="px-4 py-3"><span className="inline-flex text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{g.cat}</span></td>
                <td className="px-4 py-3 text-right font-medium text-red-600">-{fmt(g.amount)}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
