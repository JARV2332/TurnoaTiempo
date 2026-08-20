-- Nombre visible en perfiles de usuario
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS nombre TEXT;

-- Guardar nombre desde metadata al crear usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre, role, hermandad_id)
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(trim(COALESCE(
      NEW.raw_user_meta_data->>'nombre',
      NEW.raw_user_meta_data->>'nombre_completo',
      ''
    )), ''),
    COALESCE(NEW.raw_user_meta_data->>'role', NEW.raw_user_meta_data->>'rol', 'encargado'),
    (NEW.raw_user_meta_data->>'hermandad_id')::uuid
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    nombre = COALESCE(EXCLUDED.nombre, profiles.nombre);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rellenar nombres existentes desde auth.users metadata cuando falte
UPDATE public.profiles p
SET nombre = NULLIF(trim(COALESCE(
  u.raw_user_meta_data->>'nombre',
  u.raw_user_meta_data->>'nombre_completo',
  ''
)), '')
FROM auth.users u
WHERE u.id = p.id
  AND (p.nombre IS NULL OR trim(p.nombre) = '')
  AND NULLIF(trim(COALESCE(
    u.raw_user_meta_data->>'nombre',
    u.raw_user_meta_data->>'nombre_completo',
    ''
  )), '') IS NOT NULL;
