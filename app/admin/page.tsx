'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const MOCK_STATS = { hoy: 8, pendientes: 3, clientes: 142, mes: 23, ingresos: 218000 }
const MOCK_RESERVAS = [
  { id: '1', nombre: 'Carlos Pérez', hora: '09:00', servicio: 'Corte + barba', barbero: 'Miguel', status: 'confirmed' },
  { id: '2', nombre: 'Andrés Soto', hora: '10:30', servicio: 'Corte de pelo', barbero: 'Rodrigo', status: 'pending' },
  { id: '3', nombre: 'Luis Morales', hora: '11:00', servicio: 'Afeitado clásico', barbero: 'Miguel', status: 'confirmed' },
  { id: '4', nombre: 'Diego Fuentes', hora: '14:00', servicio: 'Corte + barba', barbero: 'Felipe', status: 'pending' },
  { id: '5', nombre: 'Matías Herrera', hora: '15:30', servicio: 'Corte de pelo', barbero: 'Rodrigo', status: 'completed' },
]

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'badge-pending', confirmed: 'badge-confirmed',
    completed: 'badge-completed', cancelled: 'badge-cancelled',
  }
  const labels: Record<string, string> = {
    pending: 'Pendiente', confirmed: 'Confirmado',
    completed: 'Completado', cancelled: 'Cancelado',
  }
  return <span className={map[status] || 'badge-pending'}>{labels[status] || status}</span>
}

export default function AdminDashboard() {
  const [today] = useState(new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }))

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5 capitalize">{today}</p>
        </div>
        <Link href="/admin/reservas/nueva" className="btn-primary">
          + Nueva reserva
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Citas hoy', value: MOCK_STATS.hoy, sub: 'programadas', color: 'bg-brand-50 text-brand-700' },
          { label: 'Pendientes', value: MOCK_STATS.pendientes, sub: 'por confirmar', color: 'bg-amber-50 text-amber-700' },
          { label: 'Clientes', value: MOCK_STATS.clientes, sub: 'registrados', color: 'bg-gray-50 text-gray-700' },
          { label: 'Este mes', value: `$${(MOCK_STATS.ingresos / 1000).toFixed(0)}k`, sub: 'ingresos CLP', color: 'bg-gray-50 text-gray-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-5 ${s.color}`}>
            <p className="text-xs font-medium uppercase tracking-wide opacity-70 mb-1">{s.label}</p>
            <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>{s.value}</p>
            <p className="text-xs opacity-60 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Today's appointments */}
        <div className="md:col-span-2 card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold" style={{ fontFamily: 'var(--font-display)' }}>Citas de hoy</h2>
            <Link href="/admin/reservas" className="text-xs text-brand-600 hover:underline">Ver todas →</Link>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs font-medium text-gray-400 uppercase tracking-wide">
                <th className="px-6 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Hora</th>
                <th className="px-4 py-3 text-left">Servicio</th>
                <th className="px-4 py-3 text-left">Barbero</th>
                <th className="px-4 py-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_RESERVAS.map((r, i) => (
                <tr key={r.id} className={`border-t border-gray-50 text-sm hover:bg-gray-50/50 transition-colors`}>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {r.nombre[0]}
                      </div>
                      <span className="font-medium">{r.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{r.hora}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.servicio}</td>
                  <td className="px-4 py-3 text-gray-600">{r.barbero}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick actions + mini agenda */}
        <div className="flex flex-col gap-4">
          <div className="card p-5">
            <h3 className="font-bold text-sm mb-4" style={{ fontFamily: 'var(--font-display)' }}>Acciones rápidas</h3>
            <div className="flex flex-col gap-2">
              {[
                { label: '+ Nueva reserva', href: '/admin/reservas/nueva' },
                { label: '+ Nuevo cliente', href: '/admin/clientes/nuevo' },
                { label: 'Ver agenda semanal', href: '/admin/reservas' },
                { label: 'Gestionar barberos', href: '/admin/barberos' },
              ].map(a => (
                <Link key={a.label} href={a.href} className="text-sm px-4 py-2.5 rounded-xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50/40 text-gray-700 hover:text-brand-700 transition-all">
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-sm mb-3" style={{ fontFamily: 'var(--font-display)' }}>Próximas citas</h3>
            <div className="flex flex-col gap-2">
              {MOCK_RESERVAS.filter(r => r.status !== 'completed').slice(0, 4).map(r => (
                <div key={r.id} className="flex items-center gap-2.5 py-1.5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${r.status === 'confirmed' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{r.nombre}</p>
                    <p className="text-xs text-gray-400">{r.hora} · {r.barbero}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
