-- Add orden_actual column to mesas table
ALTER TABLE mesas ADD COLUMN orden_actual INTEGER REFERENCES ordenes(id);

-- Create index for orden_actual
CREATE INDEX IF NOT EXISTS idx_mesas_orden_actual ON mesas(orden_actual);