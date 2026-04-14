'use client'
import { useState } from 'react'
const PAGOS = [
  {id:'p1',client:'Carlos Pérez',service:'Corte + barba',method:'Transferencia',amount:8000,date:'2026-04-14'},
  {id:'p2',client:'Andrés Soto',service:'Corte',method:'Efectivo',amount:5000,date:'2026-04-14'},
  {id:'p3',client:'Luis Morales',service:'Afeitado',method:'Tarjeta',amount:4000,date:'2026-04-13'},
]
const SVCS: Record<string,number> = {'Corte mujer':8000,'Corte hombre':5000,'Corte + peinado':12000,'Tinte completo':25000,'Mechas':35000,'Keratina':45000,'Brushing':7000,'Corte niño/a':4000}
export default function PagosPage() {
  const [pagos,setPagos] = useState(PAGOS)
  const [tab,setTab] = useState<'cobrar'|'historial'>('cobrar')
  const [client,setClient] = useState('Carlos Pérez')
  const [service,setService] = useState('Corte mujer')
  const [method,setMethod] = useState('Efectivo')
  const [ok,setOk] = useState(false)
  const fmt = (n:number) => '$'+n.toLocaleString('es-CL')
  const totalHoy = pagos.filter(p=>p.date==='2026-04-14').reduce((a,b)=>a+b.amount,0)
  function cobrar(){
    setPagos(p=>[{id:Date.now().toString(),client,service,method,amount:SVCS[service]||5000,date:'2026-04-14'},...p])
    setOk(true); setTimeout(()=>setOk(false),2500)
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-xl font-medium text-gray-900">Pagos</h1>
        <p className="text-xs text-gray-400 mt-0.5">Ingresos hoy: <span className="text-green-600 font-medium">{fmt(totalHoy)}</span></p></div>
      </div>
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
        {(['cobrar','historial'] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${tab===t?'bg-white text-gray-900 shadow-sm':'text-gray-500'}`}>{t}</button>
        ))}
      </div>
      {tab==='cobrar'&&(
        <div className="grid grid-cols-2 gap-5 max-w-2xl">
          <div className="card p-5">
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Nueva cobranza</h3>
            <div className="flex flex-col gap-3">
              <div><label className="label">Cliente</label><input className="input" value={client} onChange={e=>setClient(e.target.value)} placeholder="Nombre"/></div>
              <div><label className="label">Servicio</label>
                <select className="input" value={service} onChange={e=>setService(e.target.value)}>
                  {Object.keys(SVCS).map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div><label className="label">Método</label>
                <select className="input" value={method} onChange={e=>setMethod(e.target.value)}>
                  {['Efectivo','Transferencia','Tarjeta','WebPay'].map(m=><option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <span className="text-sm text-gray-500">Total</span>
                <span className="text-xl font-medium">{fmt(SVCS[service]||5000)}</span>
              </div>
              <button onClick={cobrar} className="btn-primary py-2.5">Registrar pago</button>
              {ok&&<p className="text-xs text-green-600 text-center">✓ Pago registrado</p>}
            </div>
          </div>
          <div className="card p-5">
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Datos de transferencia</h3>
            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2.5">
              {[['Banco','Banco Estado'],['Tipo','Cuenta Corriente'],['Número','000-123-456'],['RUT','12.345.678-9'],['Email','pagos@mirna.cl']].map(([k,v])=>(
                <div key={k} className="flex justify-between"><span className="text-gray-400">{k}</span><span className="font-medium text-xs">{v}</span></div>
              ))}
            </div>
          </div>
        </div>
      )}
      {tab==='historial'&&(
        <div className="card overflow-hidden max-w-2xl">
          <table className="w-full">
            <thead><tr className="bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wide">
              <th className="px-5 py-3 text-left">Cliente</th><th className="px-4 py-3 text-left">Servicio</th>
              <th className="px-4 py-3 text-left">Método</th><th className="px-4 py-3 text-right">Monto</th>
            </tr></thead>
            <tbody>{pagos.map(p=>(
              <tr key={p.id} className="border-t border-gray-50 text-sm hover:bg-gray-50/50">
                <td className="px-5 py-3 font-medium">{p.client}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{p.service}</td>
                <td className="px-4 py-3"><span className="inline-flex text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{p.method}</span></td>
                <td className="px-4 py-3 text-right font-medium text-green-700">{fmt(p.amount)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}
