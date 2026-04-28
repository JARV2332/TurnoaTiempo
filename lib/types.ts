export interface Hermandad {
  id: string
  nombre: string
  escudo_url: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  role: 'superadmin' | 'encargado'
  hermandad_id: string | null
  created_at: string
  hermandad?: Hermandad
}

export type ProcesionEstado = 'programada' | 'en_curso' | 'finalizada'

export interface Procesion {
  id: string
  hermandad_id: string
  nombre: string
  descripcion?: string | null
  fecha: string
  total_turnos: number
  avatar_url: string | null
  turno_actual: number
  marcha_actual: string | null
  ubicacion_lat: number | null
  ubicacion_lng: number | null
  transmitiendo: boolean
  estado: ProcesionEstado
  created_at: string
  updated_at: string
  hermandad?: Hermandad
  marchas?: Marcha[]
  puntos_ruta?: PuntoRuta[]
}

export interface Marcha {
  id: string
  procesion_id: string
  nombre: string
  autor: string | null
  orden: number
  turno: number | null
}

export interface PuntoRuta {
  id: string
  procesion_id: string
  direccion: string
  lat: number | null
  lng: number | null
  orden: number
  tipo: 'ida' | 'regreso'
}

export type UserRole = 'superadmin' | 'encargado'
