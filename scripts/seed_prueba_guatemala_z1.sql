-- Seed de prueba: Ruta + Marchas para:
-- Hermandad: "Virgen de Fatima"
-- Procesión: "Prueba"
--
-- Qué hace:
-- - Busca la hermandad y la procesión
-- - Borra puntos de ruta y marchas existentes de esa procesión
-- - Inserta un recorrido (tipo 'ida') en Guatemala Z1
-- - Calcula total_turnos como (cantidad_de_puntos - 1)
-- - Inserta marchas en orden aleatorio

-- Para que encuentre nombres con tildes/variantes, activamos unaccent
CREATE EXTENSION IF NOT EXISTS unaccent;

DO $$
DECLARE
  v_hermandad_id uuid;
  v_procesion_id uuid;
  v_puntos_count int;
  v_hermandad_nombre text;
  v_procesion_nombre text;
BEGIN
  SELECT id
  INTO v_hermandad_id
  FROM public.hermandades
  WHERE unaccent(lower(trim(nombre))) LIKE '%fatima%'
  LIMIT 1;

  IF v_hermandad_id IS NULL THEN
    RAISE EXCEPTION 'No encontré hermandad con nombre que contenga "fatima" en public.hermandades';
  END IF;

  SELECT nombre INTO v_hermandad_nombre FROM public.hermandades WHERE id = v_hermandad_id;

  SELECT id
  INTO v_procesion_id
  FROM public.procesiones
  WHERE hermandad_id = v_hermandad_id
    AND unaccent(lower(trim(nombre))) LIKE '%prueba%'
  LIMIT 1;

  IF v_procesion_id IS NULL THEN
    RAISE EXCEPTION 'No encontré procesión con nombre que contenga "prueba" para la hermandad "%"', v_hermandad_nombre;
  END IF;

  SELECT nombre INTO v_procesion_nombre FROM public.procesiones WHERE id = v_procesion_id;

  -- Limpiar datos previos de la procesión
  DELETE FROM public.marchas WHERE procesion_id = v_procesion_id;
  DELETE FROM public.puntos_ruta WHERE procesion_id = v_procesion_id;

  -- Insertar recorrido (ida). Lat/Lng aproximados o null si prefieres.
  -- Nota: si quieres máxima precisión, puedes editar lat/lng luego desde la app.
  INSERT INTO public.puntos_ruta (procesion_id, direccion, lat, lng, orden, tipo)
  VALUES
    (v_procesion_id, 'Catedral Metropolitana (Guatemala, Z1) - Salida', 14.6407, -90.5133, 0, 'ida'),
    (v_procesion_id, 'Iglesia Santa Teresa (Guatemala, Z1)',            14.6404, -90.5113, 1, 'ida'),
    (v_procesion_id, 'Iglesia La Merced (Guatemala, Z1)',               14.6432, -90.5108, 2, 'ida'),
    (v_procesion_id, 'Iglesia San José (Guatemala, Z1)',                14.6423, -90.5125, 3, 'ida'),
    (v_procesion_id, 'Iglesia Santo Domingo (Guatemala, Z1)',           14.6437, -90.5135, 4, 'ida'),
    (v_procesion_id, 'Arco/Palacio de Correos (Guatemala, Z1)',         14.6429, -90.5146, 5, 'ida'),
    (v_procesion_id, 'Sexta Avenida - San Francisco (Guatemala, Z1)',   14.6369, -90.5124, 6, 'ida'),
    (v_procesion_id, 'Sexta Avenida - Santa Catalina (Guatemala, Z1)',  14.6390, -90.5130, 7, 'ida'),
    (v_procesion_id, 'Catedral Metropolitana (Guatemala, Z1) - Entrada',14.6407, -90.5133, 8, 'ida');

  SELECT count(*) INTO v_puntos_count
  FROM public.puntos_ruta
  WHERE procesion_id = v_procesion_id;

  UPDATE public.procesiones
  SET total_turnos = GREATEST(v_puntos_count - 1, 1),
      turno_actual = 1,
      estado = 'programada',
      transmitiendo = false
  WHERE id = v_procesion_id;

  -- Marchas (se insertan en orden aleatorio)
  WITH seed_marchas(nombre, autor) AS (
    VALUES
      ('La Madrugá', 'Abel Moreno'),
      ('Amarguras', 'Manuel Font de Anta'),
      ('Pasan los Campanilleros', 'Manuel López Farfán'),
      ('Virgen del Valle', 'Vicente Gómez-Zarzuela'),
      ('Esperanza de Triana', 'José de la Vega'),
      ('Jesús de las Penas', 'Antonio Pantión'),
      ('Caridad del Guadalquivir', 'Paco Lola'),
      ('Encarnación Coronada', 'Abel Moreno'),
      ('Coronación de la Macarena', 'P. Braña'),
      ('Soleá, dame la mano', 'Manuel Font de Anta'),
      ('Cristo del Amor', 'Francisco Javier Alonso Delgado'),
      ('Santa María de la Esperanza', 'Francisco Javier Alonso Delgado')
  ),
  randomized AS (
    SELECT nombre, autor, row_number() OVER (ORDER BY random()) - 1 AS orden
    FROM seed_marchas
  )
  INSERT INTO public.marchas (procesion_id, nombre, autor, orden, turno)
  SELECT v_procesion_id, nombre, autor, orden, orden + 1
  FROM randomized;

  RAISE NOTICE 'Seed OK. Hermandad="%", Procesión="%", Puntos=% , Turnos=%',
    v_hermandad_nombre,
    v_procesion_nombre,
    v_puntos_count,
    GREATEST(v_puntos_count - 1, 1);
END $$;

