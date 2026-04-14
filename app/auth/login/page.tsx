'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Correo o contraseña incorrectos')
      setLoading(false)
      return
    }

    // Check if superadmin via user metadata
    const meta = data.user?.user_metadata
    if (meta?.role === 'superadmin') {
      router.push('/superadmin')
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/landing" className="inline-block text-2xl font-bold mb-6" style={{fontFamily:'var(--font-display)'}}>
            clippr<span style={{color:'var(--brand)'}}>.</span>
          </Link>
          <h1 className="text-2xl font-bold" style={{fontFamily:'var(--font-display)'}}>Bienvenido de vuelta</h1>
          <p className="text-gray-500 text-sm mt-1">Ingresa a tu panel de Clippr</p>
        </div>

        <form onSubmit={handleLogin} className="card p-7 flex flex-col gap-4">
          <div>
            <label className="label">Correo electrónico</label>
            <input
              required type="email" className="input"
              placeholder="hola@mibarberia.cl"
              value={email} onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input
              required type="password" className="input"
              placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-sm text-red-600">{error}</div>
          )}
          <button type="submit" disabled={loading} className="btn-primary py-3 mt-1 disabled:opacity-60">
            {loading ? 'Ingresando...' : 'Ingresar →'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-5">
          ¿No tienes cuenta?{' '}
          <Link href="/landing#contacto" className="text-brand-600 hover:underline">Registra tu peluquería</Link>
        </p>
      </div>
    </div>
  )
}
