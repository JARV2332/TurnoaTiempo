-- Enable realtime for procesiones table (live tracking updates)
ALTER PUBLICATION supabase_realtime ADD TABLE procesiones;

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for hermandades updated_at
DROP TRIGGER IF EXISTS hermandades_updated_at ON hermandades;
CREATE TRIGGER hermandades_updated_at
  BEFORE UPDATE ON hermandades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Trigger for procesiones updated_at
DROP TRIGGER IF EXISTS procesiones_updated_at ON procesiones;
CREATE TRIGGER procesiones_updated_at
  BEFORE UPDATE ON procesiones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
