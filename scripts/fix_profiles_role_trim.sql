-- Ejecuta esto en Supabase → SQL Editor (una sola vez)
-- Corrige el error "violates check constraint" cuando role tiene espacios (ej. "superadmin ")

-- 1. Quitar espacios a los roles ya guardados
UPDATE profiles SET role = trim(role) WHERE role <> trim(role);

-- 2. Trigger para que al insertar/editar siempre se guarde role sin espacios
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
