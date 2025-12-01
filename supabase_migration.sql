-- 1. Agregar las nuevas columnas
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS area text,
ADD COLUMN IF NOT EXISTS specialty text,
ADD COLUMN IF NOT EXISTS work_type text,
ADD COLUMN IF NOT EXISTS os text,
ADD COLUMN IF NOT EXISTS novedad text;

-- 2. Hacer que la columna 'category' sea opcional (ya que la reemplazamos por specialty y work_type)
ALTER TABLE activities ALTER COLUMN category DROP NOT NULL;

-- 3. Actualizar los valores permitidos para el estado (Status)
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_status_check;
ALTER TABLE activities ADD CONSTRAINT activities_status_check 
CHECK (status IN ('Ejecutado', 'Adicional Turno', 'Reprogramado', 'Cancelado'));

-- 4. (Opcional) Verificar que las columnas se crearon
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'activities';
