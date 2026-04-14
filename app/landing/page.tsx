'use client'
import { useState } from 'react'
import Link from 'next/link'

const NAV_LINKS = ['Características', 'Precios', 'Testimonios', 'Contacto']

const FEATURES = [
  {
    icon: '📅',
    title: 'Reservas en segundos',
    desc: 'Tus clientes reservan desde cualquier dispositivo. Notificaciones automáticas, sin llamadas innecesarias.',
  },
  {
    icon: '👥',
    title: 'Gestión de clientes',
    desc: 'Historial completo por cliente. Servicios, preferencias y visitas anteriores en un solo lugar.',
  },
  {
    icon: '✂️',
    title: 'Multi-barbero',
    desc: 'Agenda separada por cada barbero de tu equipo. Vista diaria, semanal o por persona.',
  },
  {
    icon: '📊',
    title: 'Métricas reales',
    desc: 'Ingresos, citas completadas, clientes nuevos. Datos que te ayudan a crecer.',
  },
  {
    icon: '🔔',
    title: 'Recordatorios automáticos',
    desc: 'Reduce los no-shows con recordatorios por WhatsApp o SMS antes de cada cita.',
  },
  {
    icon: '🏪',
    title: 'Multi-sucursal',
    desc: 'Maneja varias peluquerías desde un solo panel. Perfecto si estás creciendo.',
  },
]

const PLANS = [
  {
    name: 'Free',
    price: '0',
    period: 'para siempre',
    desc: 'Para peluquerías que recién empiezan',
    features: ['Hasta 30 reservas/mes', '1 barbero', 'Panel básico', 'Soporte por email'],
    cta: 'Empezar gratis',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '9.990',
    period: 'CLP/mes',
    desc: 'El favorito de los barberos profesionales',
    features: ['Reservas ilimitadas', 'Hasta 5 barberos', 'Recordatorios automáticos', 'Métricas avanzadas', 'Soporte prioritario'],
    cta: 'Empezar Pro',
    highlight: true,
  },
  {
    name: 'Business',
    price: '24.990',
    period: 'CLP/mes',
    desc: 'Para cadenas y múltiples sucursales',
    features: ['Todo lo de Pro', 'Sucursales ilimitadas', 'Panel multi-local', 'API acceso', 'Manager dedicado'],
    cta: 'Contactar ventas',
    highlight: false,
  },
]

const TESTIMONIALS = [
  {
    name: 'Miguel Contreras',
    role: 'Barbería El Filo, Santiago',
    avatar: 'MC',
    text: 'Antes perdía clientes por no contestar el teléfono. Con Clippr mis reservas subieron 40% el primer mes.',
  },
  {
    name: 'Rodrigo Tapia',
    role: 'Classic Barber Shop, Valparaíso',
    avatar: 'RT',
    text: 'Lo mejor es el historial de clientes. Ya sé el nombre de cada uno antes que entre, eso marca la diferencia.',
  },
  {
    name: 'Felipe Mora',
    role: 'Barbería Don Felipe, Concepción',
    avatar: 'FM',
    text: 'Mis tres locales en un solo panel. Me ahorra horas a la semana que antes gastaba en WhatsApp y llamadas.',
  },
]

export default function LandingPage() {
  const [form, setForm] = useState({ name: '', email: '', barbershop: '', city: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) setSent(true)
    } catch {}
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1a1a18]">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fafaf9]/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <a href="#" className="font-display text-xl font-800 tracking-tight" style={{fontFamily:'var(--font-display)', fontWeight:700}}>
            clippr<span style={{color:'var(--brand)'}}>.</span>
          </a>
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{l}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login" className="btn-ghost text-sm">Iniciar sesión</Link>
            <a href="#contacto" className="btn-primary text-sm">Registrar mi peluquería</a>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-600">
            <div className="w-5 h-0.5 bg-current mb-1"></div>
            <div className="w-5 h-0.5 bg-current mb-1"></div>
            <div className="w-5 h-0.5 bg-current"></div>
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-5 py-4 flex flex-col gap-3">
            {NAV_LINKS.map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)} className="text-sm text-gray-700 py-1">{l}</a>
            ))}
            <Link href="/auth/login" className="btn-ghost text-sm text-center mt-2">Iniciar sesión</Link>
            <a href="#contacto" className="btn-primary text-sm text-center">Registrar mi peluquería</a>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 px-5 max-w-6xl mx-auto">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-full px-4 py-1.5 text-xs font-medium text-brand-700 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse"></span>
            Nuevo: Recordatorios por WhatsApp disponibles
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6" style={{fontFamily:'var(--font-display)'}}>
            Tu peluquería,<br />
            <span style={{color:'var(--brand)'}}>sin el caos.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-xl mb-10 leading-relaxed">
            Reservas online, gestión de clientes y agenda de tu equipo — todo desde un panel limpio y rápido. Configurado en 5 minutos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="#contacto" className="btn-primary text-base px-7 py-3 text-center">
              Empieza gratis hoy →
            </a>
            <a href="#características" className="btn-ghost text-base px-7 py-3 text-center">
              Ver cómo funciona
            </a>
          </div>
          <p className="text-xs text-gray-400 mt-4">Sin tarjeta de crédito. Plan gratuito para siempre disponible.</p>
        </div>

        {/* Hero dashboard mockup */}
        <div className="mt-16 rounded-2xl border border-gray-200 overflow-hidden shadow-xl shadow-gray-100 bg-white">
          <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-300"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-300"></div>
            <div className="w-3 h-3 rounded-full bg-green-300"></div>
            <div className="flex-1 mx-4 bg-gray-100 rounded-full h-5 max-w-xs"></div>
          </div>
          <div className="p-6 grid grid-cols-4 gap-4">
            <div className="bg-brand-50 rounded-xl p-4"><div className="text-xs text-brand-600 mb-1">Hoy</div><div className="text-2xl font-bold text-brand-700" style={{fontFamily:'var(--font-display)'}}>8</div><div className="text-xs text-brand-500">citas</div></div>
            <div className="bg-gray-50 rounded-xl p-4"><div className="text-xs text-gray-500 mb-1">Pendientes</div><div className="text-2xl font-bold" style={{fontFamily:'var(--font-display)'}}>3</div><div className="text-xs text-gray-400">por confirmar</div></div>
            <div className="bg-gray-50 rounded-xl p-4"><div className="text-xs text-gray-500 mb-1">Clientes</div><div className="text-2xl font-bold" style={{fontFamily:'var(--font-display)'}}>142</div><div className="text-xs text-gray-400">registrados</div></div>
            <div className="bg-gray-50 rounded-xl p-4"><div className="text-xs text-gray-500 mb-1">Este mes</div><div className="text-2xl font-bold" style={{fontFamily:'var(--font-display)'}}>$218k</div><div className="text-xs text-gray-400">ingresos</div></div>
          </div>
          <div className="px-6 pb-6">
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 grid grid-cols-5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                <span className="col-span-2">Cliente</span><span>Hora</span><span>Servicio</span><span>Estado</span>
              </div>
              {[['Carlos P.','09:00','Corte + barba','confirmed'],['Andrés S.','10:30','Corte de pelo','pending'],['Luis M.','11:00','Afeitado clásico','confirmed']].map(([n,h,s,st])=>(
                <div key={n} className="px-4 py-3 grid grid-cols-5 text-sm border-t border-gray-50 items-center">
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">{n[0]}</div>
                    <span className="font-medium">{n}</span>
                  </div>
                  <span className="text-gray-600">{h}</span>
                  <span className="text-gray-500 text-xs">{s}</span>
                  <span className={st === 'confirmed' ? 'badge-confirmed' : 'badge-pending'}>{st === 'confirmed' ? 'Confirmado' : 'Pendiente'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="características" className="py-20 px-5 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-medium text-brand-600 uppercase tracking-widest mb-3">Características</p>
            <h2 className="text-4xl font-bold" style={{fontFamily:'var(--font-display)'}}>Todo lo que necesitas,<br/>nada de lo que no.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-sm transition-all">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2" style={{fontFamily:'var(--font-display)'}}>{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="precios" className="py-20 px-5 bg-[#fafaf9]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-medium text-brand-600 uppercase tracking-widest mb-3">Precios</p>
            <h2 className="text-4xl font-bold" style={{fontFamily:'var(--font-display)'}}>Transparente desde el día uno.</h2>
            <p className="text-gray-500 mt-3">Sin comisiones ocultas. Cancela cuando quieras.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map(p => (
              <div key={p.name} className={`rounded-2xl p-7 flex flex-col ${p.highlight ? 'bg-[#1a1a18] text-white shadow-2xl shadow-gray-900/20 scale-[1.02]' : 'bg-white border border-gray-100'}`}>
                {p.highlight && (
                  <div className="inline-flex self-start mb-4 text-xs font-medium px-3 py-1 rounded-full bg-brand-500 text-white">Más popular</div>
                )}
                <h3 className="text-2xl font-bold mb-1" style={{fontFamily:'var(--font-display)'}}>{p.name}</h3>
                <p className={`text-sm mb-5 ${p.highlight ? 'text-gray-400' : 'text-gray-500'}`}>{p.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold" style={{fontFamily:'var(--font-display)'}}>
                    {p.price === '0' ? 'Gratis' : `$${p.price}`}
                  </span>
                  {p.price !== '0' && <span className={`text-sm ml-2 ${p.highlight ? 'text-gray-400' : 'text-gray-400'}`}>{p.period}</span>}
                </div>
                <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                  {p.features.map(f => (
                    <li key={f} className={`flex items-start gap-2.5 text-sm ${p.highlight ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="text-brand-400 mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="#contacto" className={`text-center py-3 rounded-xl font-medium text-sm transition-all ${p.highlight ? 'bg-brand-500 hover:bg-brand-400 text-white' : 'btn-ghost'}`}>
                  {p.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonios" className="py-20 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-medium text-brand-600 uppercase tracking-widest mb-3">Testimonios</p>
            <h2 className="text-4xl font-bold" style={{fontFamily:'var(--font-display)'}}>Barberos reales.<br/>Resultados reales.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="p-6 rounded-2xl border border-gray-100 flex flex-col gap-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_,i) => <span key={i} className="text-amber-400 text-sm">★</span>)}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                  <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact / Register ── */}
      <section id="contacto" className="py-20 px-5 bg-[#fafaf9]">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-medium text-brand-600 uppercase tracking-widest mb-3">Registro</p>
            <h2 className="text-4xl font-bold" style={{fontFamily:'var(--font-display)'}}>Registra tu peluquería</h2>
            <p className="text-gray-500 mt-3">Te contactamos en menos de 24 horas para configurar todo.</p>
          </div>

          {sent ? (
            <div className="card p-10 text-center">
              <div className="text-5xl mb-4">✂️</div>
              <h3 className="text-xl font-bold mb-2" style={{fontFamily:'var(--font-display)'}}>¡Recibido!</h3>
              <p className="text-gray-500">Te escribiremos pronto a <strong>{form.email}</strong></p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card p-8 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Tu nombre</label>
                  <input required className="input" placeholder="Miguel Torres" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input required type="email" className="input" placeholder="hola@mibarberia.cl" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Nombre de tu peluquería</label>
                  <input className="input" placeholder="Barbería El Filo" value={form.barbershop} onChange={e => setForm({...form, barbershop: e.target.value})} />
                </div>
                <div>
                  <label className="label">Ciudad</label>
                  <input className="input" placeholder="Santiago" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="label">¿Algo que quieras contarnos?</label>
                <textarea rows={3} className="input resize-none" placeholder="Tengo 2 barberos, abro lunes a sábado..." value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
              </div>
              <button type="submit" disabled={loading} className="btn-primary py-3 text-base disabled:opacity-60">
                {loading ? 'Enviando...' : 'Quiero empezar →'}
              </button>
              <p className="text-xs text-gray-400 text-center">Al enviar aceptas nuestra política de privacidad.</p>
            </form>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-10 px-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-bold text-lg" style={{fontFamily:'var(--font-display)'}}>
            clippr<span style={{color:'var(--brand)'}}>.</span>
          </span>
          <p className="text-xs text-gray-400">© 2026 Clippr. Hecho con ✂️ en Chile.</p>
          <div className="flex gap-5 text-xs text-gray-400">
            <a href="#" className="hover:text-gray-700">Privacidad</a>
            <a href="#" className="hover:text-gray-700">Términos</a>
            <Link href="/auth/login" className="hover:text-gray-700">Acceso panel</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
