# Clippr ✂️
Sistema de reservas SaaS para peluquerías — construido con Next.js 14 + Supabase.

## Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL + Auth + RLS)
- **Deploy**: Vercel

---

## Estructura del proyecto

```
clippr/
├── app/
│   ├── landing/          → Landing page pública (marketing)
│   ├── auth/login/       → Login compartido (admin + superadmin)
│   ├── admin/            → Panel de cada peluquería
│   │   ├── page.tsx      → Dashboard con métricas
│   │   ├── reservas/     → Lista + nueva reserva
│   │   ├── clientes/     → Registro de clientes
│   │   ├── barberos/     → Gestión del equipo
│   │   └── servicios/    → Catálogo de servicios
│   ├── superadmin/       → Panel maestro (todas las peluquerías)
│   │   ├── page.tsx      → Overview global
│   │   ├── peluquerias/  → CRUD de barbershops
│   │   └── leads/        → Contactos del formulario
│   └── api/leads/        → API route para formulario landing
├── lib/
│   ├── supabase/         → Cliente browser + server
│   ├── types.ts          → Tipos TypeScript
│   └── schema.sql        → Schema completo de Supabase
└── ...config files
```

---

## Setup paso a paso

### 1. Clonar e instalar
```bash
git clone <tu-repo>
cd clippr
npm install
```

### 2. Configurar Supabase
1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** y ejecuta todo el contenido de `lib/schema.sql`
3. Copia las credenciales desde **Settings → API**

### 3. Variables de entorno
Crea `.env.local` basado en `.env.local.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 4. Correr en local
```bash
npm run dev
# Abre http://localhost:3000
```

### 5. Crear primer usuario superadmin
En Supabase SQL Editor:
```sql
-- Después de registrar el usuario en Supabase Auth, 
-- actualiza su metadata para marcarlo como superadmin:
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role":"superadmin"}'::jsonb
WHERE email = 'tu@email.com';
```

### 6. Crear usuario admin de peluquería
En Supabase Dashboard → **Authentication → Users → Invite user**:
1. Invita al email del dueño de la peluquería
2. Ejecuta en SQL Editor:
```sql
-- Asigna la peluquería al usuario
UPDATE barbershops SET owner_id = (
  SELECT id FROM auth.users WHERE email = 'dueño@peluqueria.cl'
) WHERE slug = 'slug-de-su-peluqueria';

-- Agrega metadata con nombre de la peluquería
UPDATE auth.users 
SET raw_user_meta_data = '{"barbershop_name":"Barbería El Filo"}'::jsonb
WHERE email = 'dueño@peluqueria.cl';
```

---

## Deploy en Vercel

### Opción A — Vercel CLI
```bash
npm i -g vercel
vercel
# Sigue el wizard, luego agrega las env vars:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel --prod
```

### Opción B — GitHub + Vercel Dashboard
1. Sube el proyecto a GitHub: `git init && git add . && git commit -m "init" && git push`
2. Entra a [vercel.com](https://vercel.com) → New Project → Import tu repo
3. Agrega las 3 variables de entorno en el dashboard
4. Deploy!

---

## Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/landing` | Landing page pública |
| `/auth/login` | Login |
| `/admin` | Dashboard de peluquería |
| `/admin/reservas` | Gestión de citas |
| `/admin/clientes` | Registro de clientes |
| `/admin/barberos` | Equipo |
| `/admin/servicios` | Catálogo |
| `/superadmin` | Panel global |
| `/superadmin/peluquerias` | Todas las peluquerías |
| `/superadmin/leads` | Formulario de contacto |

---

## Agregar una nueva peluquería (flujo completo)

1. El dueño llena el formulario en `/landing#contacto`
2. Aparece en `/superadmin/leads`
3. Desde `/superadmin/peluquerias` → crear la peluquería
4. Invitar usuario desde Supabase Auth
5. Asignar `owner_id` y `barbershop_name` vía SQL
6. El dueño accede con su email desde `/auth/login`

---

Hecho con ✂️ en Chile.
