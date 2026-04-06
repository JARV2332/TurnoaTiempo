-- Crear perfil en public.profiles cuando un usuario se registra en auth.users
-- Necesario para que el registro público (/auth/registro) funcione y el usuario tenga rol

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

-- Trigger: al insertar en auth.users, crear fila en profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
