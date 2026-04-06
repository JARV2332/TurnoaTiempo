-- =============================================================================
-- SETUP COMPLETO - Base de datos Supabase para Turno en Tiempo Real
-- Ejecuta este script UNA VEZ en: Supabase → SQL Editor → New query → Pegar → Run
-- =============================================================================

-- ---------- 1. STORAGE BUCKETS Y POLÍTICAS ----------
INSERT INTO storage.buckets (id, name, public) 
VALUES ('escudos', 'escudos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatares', 'avatares', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view escudos" ON storage.objects;
CREATE POLICY "Public can view escudos" ON storage.objects
  FOR SELECT USING (bucket_id = 'escudos');
DROP POLICY IF EXISTS "Authenticated users can upload escudos" ON storage.objects;
CREATE POLICY "Authenticated users can upload escudos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'escudos' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated users can update escudos" ON storage.objects;
CREATE POLICY "Authenticated users can update escudos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'escudos' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated users can delete escudos" ON storage.objects;
CREATE POLICY "Authenticated users can delete escudos" ON storage.objects
  FOR DELETE USING (bucket_id = 'escudos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view avatares" ON storage.objects;
CREATE POLICY "Public can view avatares" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatares');
DROP POLICY IF EXISTS "Authenticated users can upload avatares" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatares" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatares' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated users can update avatares" ON storage.objects;
CREATE POLICY "Authenticated users can update avatares" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatares' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated users can delete avatares" ON storage.objects;
CREATE POLICY "Authenticated users can delete avatares" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatares' AND auth.role() = 'authenticated');

-- ---------- 2. TABLAS ----------
CREATE TABLE IF NOT EXISTS hermandades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  escudo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'encargado')),
  hermandad_id UUID REFERENCES hermandades(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS marchas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procesion_id UUID NOT NULL REFERENCES procesiones(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  autor TEXT,
  orden INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS puntos_ruta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procesion_id UUID NOT NULL REFERENCES procesiones(id) ON DELETE CASCADE,
  direccion TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  orden INTEGER NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('ida', 'regreso'))
);

CREATE INDEX IF NOT EXISTS idx_profiles_hermandad ON profiles(hermandad_id);
CREATE INDEX IF NOT EXISTS idx_procesiones_hermandad ON procesiones(hermandad_id);
CREATE INDEX IF NOT EXISTS idx_procesiones_fecha ON procesiones(fecha);
CREATE INDEX IF NOT EXISTS idx_marchas_procesion ON marchas(procesion_id);
CREATE INDEX IF NOT EXISTS idx_puntos_ruta_procesion ON puntos_ruta(procesion_id);

-- ---------- 3. RLS (ROW LEVEL SECURITY) ----------
ALTER TABLE hermandades ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE procesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE marchas ENABLE ROW LEVEL SECURITY;
ALTER TABLE puntos_ruta ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_hermandad_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT hermandad_id FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hermandades
DROP POLICY IF EXISTS "hermandades_select_public" ON hermandades;
CREATE POLICY "hermandades_select_public" ON hermandades FOR SELECT USING (true);
DROP POLICY IF EXISTS "hermandades_insert_superadmin" ON hermandades;
CREATE POLICY "hermandades_insert_superadmin" ON hermandades FOR INSERT WITH CHECK (is_superadmin());
DROP POLICY IF EXISTS "hermandades_update_superadmin" ON hermandades;
CREATE POLICY "hermandades_update_superadmin" ON hermandades FOR UPDATE USING (is_superadmin());
DROP POLICY IF EXISTS "hermandades_delete_superadmin" ON hermandades;
CREATE POLICY "hermandades_delete_superadmin" ON hermandades FOR DELETE USING (is_superadmin());

-- Profiles
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_select_superadmin" ON profiles;
CREATE POLICY "profiles_select_superadmin" ON profiles FOR SELECT USING (is_superadmin());
DROP POLICY IF EXISTS "profiles_insert_superadmin" ON profiles;
CREATE POLICY "profiles_insert_superadmin" ON profiles FOR INSERT WITH CHECK (is_superadmin());
DROP POLICY IF EXISTS "profiles_update_superadmin" ON profiles;
CREATE POLICY "profiles_update_superadmin" ON profiles FOR UPDATE USING (is_superadmin());
DROP POLICY IF EXISTS "profiles_delete_superadmin" ON profiles;
CREATE POLICY "profiles_delete_superadmin" ON profiles FOR DELETE USING (is_superadmin());

-- Procesiones
DROP POLICY IF EXISTS "procesiones_select_public" ON procesiones;
CREATE POLICY "procesiones_select_public" ON procesiones FOR SELECT USING (true);
DROP POLICY IF EXISTS "procesiones_all_superadmin" ON procesiones;
CREATE POLICY "procesiones_all_superadmin" ON procesiones FOR ALL USING (is_superadmin());
DROP POLICY IF EXISTS "procesiones_insert_encargado" ON procesiones;
CREATE POLICY "procesiones_insert_encargado" ON procesiones FOR INSERT WITH CHECK (hermandad_id = get_user_hermandad_id());
DROP POLICY IF EXISTS "procesiones_update_encargado" ON procesiones;
CREATE POLICY "procesiones_update_encargado" ON procesiones FOR UPDATE USING (hermandad_id = get_user_hermandad_id());
DROP POLICY IF EXISTS "procesiones_delete_encargado" ON procesiones;
CREATE POLICY "procesiones_delete_encargado" ON procesiones FOR DELETE USING (hermandad_id = get_user_hermandad_id());

-- Marchas
DROP POLICY IF EXISTS "marchas_select_public" ON marchas;
CREATE POLICY "marchas_select_public" ON marchas FOR SELECT USING (true);
DROP POLICY IF EXISTS "marchas_all_superadmin" ON marchas;
CREATE POLICY "marchas_all_superadmin" ON marchas FOR ALL USING (is_superadmin());
DROP POLICY IF EXISTS "marchas_insert_encargado" ON marchas;
CREATE POLICY "marchas_insert_encargado" ON marchas FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM procesiones WHERE procesiones.id = procesion_id AND procesiones.hermandad_id = get_user_hermandad_id())
);
DROP POLICY IF EXISTS "marchas_update_encargado" ON marchas;
CREATE POLICY "marchas_update_encargado" ON marchas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM procesiones WHERE procesiones.id = procesion_id AND procesiones.hermandad_id = get_user_hermandad_id())
);
DROP POLICY IF EXISTS "marchas_delete_encargado" ON marchas;
CREATE POLICY "marchas_delete_encargado" ON marchas FOR DELETE USING (
  EXISTS (SELECT 1 FROM procesiones WHERE procesiones.id = procesion_id AND procesiones.hermandad_id = get_user_hermandad_id())
);

-- Puntos ruta
DROP POLICY IF EXISTS "puntos_ruta_select_public" ON puntos_ruta;
CREATE POLICY "puntos_ruta_select_public" ON puntos_ruta FOR SELECT USING (true);
DROP POLICY IF EXISTS "puntos_ruta_all_superadmin" ON puntos_ruta;
CREATE POLICY "puntos_ruta_all_superadmin" ON puntos_ruta FOR ALL USING (is_superadmin());
DROP POLICY IF EXISTS "puntos_ruta_insert_encargado" ON puntos_ruta;
CREATE POLICY "puntos_ruta_insert_encargado" ON puntos_ruta FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM procesiones WHERE procesiones.id = procesion_id AND procesiones.hermandad_id = get_user_hermandad_id())
);
DROP POLICY IF EXISTS "puntos_ruta_update_encargado" ON puntos_ruta;
CREATE POLICY "puntos_ruta_update_encargado" ON puntos_ruta FOR UPDATE USING (
  EXISTS (SELECT 1 FROM procesiones WHERE procesiones.id = procesion_id AND procesiones.hermandad_id = get_user_hermandad_id())
);
DROP POLICY IF EXISTS "puntos_ruta_delete_encargado" ON puntos_ruta;
CREATE POLICY "puntos_ruta_delete_encargado" ON puntos_ruta FOR DELETE USING (
  EXISTS (SELECT 1 FROM procesiones WHERE procesiones.id = procesion_id AND procesiones.hermandad_id = get_user_hermandad_id())
);

-- ---------- 4. REALTIME Y TRIGGERS ----------
ALTER PUBLICATION supabase_realtime ADD TABLE procesiones;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS hermandades_updated_at ON hermandades;
CREATE TRIGGER hermandades_updated_at BEFORE UPDATE ON hermandades FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS procesiones_updated_at ON procesiones;
CREATE TRIGGER procesiones_updated_at BEFORE UPDATE ON procesiones FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---------- 4b. TRIM ROLE EN PROFILES (evita error si se escribe "superadmin " con espacio) ----------
CREATE OR REPLACE FUNCTION trim_profiles_role()
RETURNS TRIGGER AS $$
BEGIN
  NEW.role := trim(NEW.role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS profiles_trim_role ON profiles;
CREATE TRIGGER profiles_trim_role
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trim_profiles_role();

-- ---------- 5. TRIGGER: CREAR PERFIL AL REGISTRARSE ----------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, hermandad_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', NEW.raw_user_meta_data->>'rol', 'encargado'),
    (NEW.raw_user_meta_data->>'hermandad_id')::uuid
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- LISTO. Ya puedes usar la app. Crea tu primer usuario en /auth/registro y
-- en Table Editor → profiles pon role = 'superadmin' para acceder a /admin.
-- =============================================================================
