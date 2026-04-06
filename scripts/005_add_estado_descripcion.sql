-- Si ya ejecutaste 001_create_tables.sql antes de que se añadieran estado y descripcion,
-- ejecuta este script para actualizar la tabla procesiones.

ALTER TABLE procesiones ADD COLUMN IF NOT EXISTS descripcion TEXT;
ALTER TABLE procesiones ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'programada';
UPDATE procesiones SET estado = 'programada' WHERE estado IS NULL;
ALTER TABLE procesiones ALTER COLUMN estado SET NOT NULL;
ALTER TABLE procesiones DROP CONSTRAINT IF EXISTS procesiones_estado_check;
ALTER TABLE procesiones ADD CONSTRAINT procesiones_estado_check CHECK (estado IN ('programada', 'en_curso', 'finalizada'));
