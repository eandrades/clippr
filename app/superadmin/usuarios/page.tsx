'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const ROLES: Record<string,string> = { superadmin:'Super Admin', admin:'Admin', barbero:'Barbero', caja:'Caja' }
const ROLE_COLORS: Record<string,string> = { superadmin:'bg-purple-50 text-purple-700', admin:'bg-green-50 text-green-700', barbero:'bg-blue-50 text-blue-700', caja:'bg-amber-50 text-amber-700' }

export default function UsuariosPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState('')
  const [form, setForm] = useState({ email:'', password:'', role:'admin', barbershop_name:'Peluquería Mirna' })
  const supabase = createClient()

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    setLoading(true)
    const { data, error } = await supabase.auth.admin?.listUsers?.() || {}
    if (data?.users) {
      setUsers(data.users.map((u:any) => ({
        id: u.id,
        email: u.email,
        role: u.user_metadata?.role || 'admin',
        barbershop: u.user_metadata?.barbershop_name || '—',
        created: u.created_at,
        last_sign_in: u.last_sign_in_at,
      })))
    } else {
      setUsers([
        { id:'1', email:'eder.andrades@gmail.com', role:'superadmin', barbershop:'Clippr Admin', created:'2026-04-14', last_sign_in:'2026-04-14' },
      ])
    }
    setLoading(false)
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setOk('Usuario creado correctamente')
      setForm({ email:'', password:'', role:'admin', barbershop_name:'Peluquería Mirna' })
      setShowForm(false)
      setTimeout(() => setOk(''), 3000)
    } else {
      setOk('Error al crear usuario')
    }
    setSaving(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-white">Usuarios</h1>
          <p className="text-xs text-white/40 mt-0.5">Accesos al sistema</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
          {showForm ? 'Cancelar' : '+ Nuevo usuario'}
        </button>
      </div>

      {ok && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${ok.includes('Error') ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
          {ok}
        </div>
      )}

      {showForm && (
        <form onSubmit={createUser} className="bg-[#1e1e1c] border border-white/10 rounded-xl p-5 mb-5">
          <h3 className="text-sm font-medium text-white mb-4">Nuevo usuario</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Email</label>
              <input required type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30"
                placeholder="usuario@mail.com" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Contraseña</label>
              <input required type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30"
                placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Rol</label>
              <select value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30">
                <option value="admin" className="bg-gray-900">Admin</option>
                <option value="barbero" className="bg-gray-900">Barbero</option>
                <option value="caja" className="bg-gray-900">Caja</option>
                <option value="superadmin" className="bg-gray-900">Super Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Peluquería</label>
              <input value={form.barbershop_name} onChange={e => setForm(f => ({...f, barbershop_name: e.target.value}))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30"
                placeholder="Peluquería Mirna" />
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50">
            {saving ? 'Creando...' : 'Crear usuario'}
          </button>
        </form>
      )}

      <div className="bg-[#141413] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-xs font-medium text-white/30 uppercase tracking-wide border-b border-white/5">
              <th className="px-5 py-3 text-left">Usuario</th>
              <th className="px-4 py-3 text-left">Rol</th>
              <th className="px-4 py-3 text-left">Peluquería</th>
              <th className="px-4 py-3 text-left">Último acceso</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-white/30 text-sm">Cargando...</td></tr>
            )}
            {!loading && users.map(u => (
              <tr key={u.id} className="border-t border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-white/10 text-white/60 text-xs font-medium flex items-center justify-center uppercase">
                      {u.email[0]}
                    </div>
                    <span className="text-sm text-white/80">{u.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-600'}`}>
                    {ROLES[u.role] || u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/40 text-sm">{u.barbershop}</td>
                <td className="px-4 py-3 text-white/30 text-xs">
                  {u.last_sign_in ? new Date(u.last_sign_in).toLocaleDateString('es-CL', {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : 'Nunca'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
