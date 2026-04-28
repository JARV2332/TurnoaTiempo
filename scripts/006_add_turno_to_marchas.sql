-- Agrega turno asignado a cada registro de marcha/son/alabado.
ALTER TABLE public.marchas
ADD COLUMN IF NOT EXISTS turno INTEGER;

-- Backfill para datos existentes: usa orden + 1 cuando turno no exista.
UPDATE public.marchas
SET turno = orden + 1
WHERE turno IS NULL;
