-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('escudos', 'escudos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatares', 'avatares', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for escudos bucket
CREATE POLICY "Public can view escudos" ON storage.objects
  FOR SELECT USING (bucket_id = 'escudos');

CREATE POLICY "Authenticated users can upload escudos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'escudos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update escudos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'escudos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete escudos" ON storage.objects
  FOR DELETE USING (bucket_id = 'escudos' AND auth.role() = 'authenticated');

-- Storage policies for avatares bucket
CREATE POLICY "Public can view avatares" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatares');

CREATE POLICY "Authenticated users can upload avatares" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatares' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update avatares" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatares' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete avatares" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatares' AND auth.role() = 'authenticated');

-- Hermandades (Brotherhoods)
CREATE TABLE IF NOT EXISTS hermandades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  escudo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Profiles (extends auth.users with role management)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'encargado')),
  hermandad_id UUID REFERENCES hermandades(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Procesiones (Events/Processions)
CREATE TABLE IF NOT EXISTS procesiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hermandad_id UUID NOT NULL REFERENCES hermandades(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  fecha DATE NOT NULL,
  total_turnos INTEGER NOT NULL DEFAULT 1,
  avatar_url TEXT,
  turno_actual INTEGER DEFAULT 1,
  marcha_actual TEXT,
  ubicacion_lat DOUBLE PRECISION,
  ubicacion_lng DOUBLE PRECISION,
  transmitiendo BOOLEAN DEFAULT false,
  estado TEXT NOT NULL DEFAULT 'programada' CHECK (estado IN ('programada', 'en_curso', 'finalizada')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Marchas (Musical pieces)
CREATE TABLE IF NOT EXISTS marchas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procesion_id UUID NOT NULL REFERENCES procesiones(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  autor TEXT,
  orden INTEGER DEFAULT 0,
  turno INTEGER
);

-- Puntos de Ruta (Route checkpoints)
CREATE TABLE IF NOT EXISTS puntos_ruta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procesion_id UUID NOT NULL REFERENCES procesiones(id) ON DELETE CASCADE,
  direccion TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  orden INTEGER NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('ida', 'regreso'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_hermandad ON profiles(hermandad_id);
CREATE INDEX IF NOT EXISTS idx_procesiones_hermandad ON procesiones(hermandad_id);
CREATE INDEX IF NOT EXISTS idx_procesiones_fecha ON procesiones(fecha);
CREATE INDEX IF NOT EXISTS idx_marchas_procesion ON marchas(procesion_id);
CREATE INDEX IF NOT EXISTS idx_puntos_ruta_procesion ON puntos_ruta(procesion_id);
