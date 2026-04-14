export type Plan = 'free' | 'pro' | 'business'
export type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface Barbershop {
  id: string
  name: string
  slug: string
  address?: string
  city?: string
  phone?: string
  email?: string
  plan: Plan
  active: boolean
  owner_id?: string
  created_at: string
}

export interface Barber {
  id: string
  barbershop_id: string
  name: string
  color: string
  active: boolean
  created_at: string
}

export interface Service {
  id: string
  barbershop_id: string
  name: string
  duration_min: number
  price?: number
  active: boolean
}

export interface Client {
  id: string
  barbershop_id: string
  name: string
  phone?: string
  email?: string
  notes?: string
  created_at: string
}

export interface Reservation {
  id: string
  barbershop_id: string
  client_id: string
  barber_id: string
  service_id: string
  date: string
  time: string
  status: ReservationStatus
  notes?: string
  created_at: string
  client?: Client
  barber?: Barber
  service?: Service
}

export interface Lead {
  id: string
  name: string
  email: string
  barbershop?: string
  city?: string
  message?: string
  created_at: string
}
