-- Enable RLS on all tables
ALTER TABLE hermandades ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE procesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE marchas ENABLE ROW LEVEL SECURITY;
ALTER TABLE puntos_ruta ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is superadmin
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'superadmin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's hermandad_id
CREATE OR REPLACE FUNCTION get_user_hermandad_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT hermandad_id FROM profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- HERMANDADES POLICIES
-- ============================================

-- Public can view all hermandades
CREATE POLICY "hermandades_select_public" ON hermandades
  FOR SELECT USING (true);

-- SuperAdmins can insert hermandades
CREATE POLICY "hermandades_insert_superadmin" ON hermandades
  FOR INSERT WITH CHECK (is_superadmin());

-- SuperAdmins can update hermandades
CREATE POLICY "hermandades_update_superadmin" ON hermandades
  FOR UPDATE USING (is_superadmin());

-- SuperAdmins can delete hermandades
CREATE POLICY "hermandades_delete_superadmin" ON hermandades
  FOR DELETE USING (is_superadmin());

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- SuperAdmins can view all profiles
CREATE POLICY "profiles_select_superadmin" ON profiles
  FOR SELECT USING (is_superadmin());

-- SuperAdmins can insert profiles
CREATE POLICY "profiles_insert_superadmin" ON profiles
  FOR INSERT WITH CHECK (is_superadmin());

-- SuperAdmins can update profiles
CREATE POLICY "profiles_update_superadmin" ON profiles
  FOR UPDATE USING (is_superadmin());

-- SuperAdmins can delete profiles
CREATE POLICY "profiles_delete_superadmin" ON profiles
  FOR DELETE USING (is_superadmin());

-- ============================================
-- PROCESIONES POLICIES
-- ============================================

-- Public can view all procesiones
CREATE POLICY "procesiones_select_public" ON procesiones
  FOR SELECT USING (true);

-- SuperAdmins can manage all procesiones
CREATE POLICY "procesiones_all_superadmin" ON procesiones
  FOR ALL USING (is_superadmin());

-- Encargados can insert procesiones for their hermandad
CREATE POLICY "procesiones_insert_encargado" ON procesiones
  FOR INSERT WITH CHECK (
    hermandad_id = get_user_hermandad_id()
  );

-- Encargados can update procesiones for their hermandad
CREATE POLICY "procesiones_update_encargado" ON procesiones
  FOR UPDATE USING (
    hermandad_id = get_user_hermandad_id()
  );

-- Encargados can delete procesiones for their hermandad
CREATE POLICY "procesiones_delete_encargado" ON procesiones
  FOR DELETE USING (
    hermandad_id = get_user_hermandad_id()
  );

-- ============================================
-- MARCHAS POLICIES
-- ============================================

-- Public can view all marchas
CREATE POLICY "marchas_select_public" ON marchas
  FOR SELECT USING (true);

-- SuperAdmins can manage all marchas
CREATE POLICY "marchas_all_superadmin" ON marchas
  FOR ALL USING (is_superadmin());

-- Encargados can insert marchas for their hermandad's procesiones
CREATE POLICY "marchas_insert_encargado" ON marchas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM procesiones 
      WHERE procesiones.id = procesion_id 
      AND procesiones.hermandad_id = get_user_hermandad_id()
    )
  );

-- Encargados can update marchas for their hermandad's procesiones
CREATE POLICY "marchas_update_encargado" ON marchas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM procesiones 
      WHERE procesiones.id = procesion_id 
      AND procesiones.hermandad_id = get_user_hermandad_id()
    )
  );

-- Encargados can delete marchas for their hermandad's procesiones
CREATE POLICY "marchas_delete_encargado" ON marchas
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM procesiones 
      WHERE procesiones.id = procesion_id 
      AND procesiones.hermandad_id = get_user_hermandad_id()
    )
  );

-- ============================================
-- PUNTOS_RUTA POLICIES
-- ============================================

-- Public can view all puntos_ruta
CREATE POLICY "puntos_ruta_select_public" ON puntos_ruta
  FOR SELECT USING (true);

-- SuperAdmins can manage all puntos_ruta
CREATE POLICY "puntos_ruta_all_superadmin" ON puntos_ruta
  FOR ALL USING (is_superadmin());

-- Encargados can insert puntos_ruta for their hermandad's procesiones
CREATE POLICY "puntos_ruta_insert_encargado" ON puntos_ruta
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM procesiones 
      WHERE procesiones.id = procesion_id 
      AND procesiones.hermandad_id = get_user_hermandad_id()
    )
  );

-- Encargados can update puntos_ruta for their hermandad's procesiones
CREATE POLICY "puntos_ruta_update_encargado" ON puntos_ruta
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM procesiones 
      WHERE procesiones.id = procesion_id 
      AND procesiones.hermandad_id = get_user_hermandad_id()
    )
  );

-- Encargados can delete puntos_ruta for their hermandad's procesiones
CREATE POLICY "puntos_ruta_delete_encargado" ON puntos_ruta
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM procesiones 
      WHERE procesiones.id = procesion_id 
      AND procesiones.hermandad_id = get_user_hermandad_id()
    )
  );
