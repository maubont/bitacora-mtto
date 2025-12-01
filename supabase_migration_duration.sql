-- Agregar columna para la duración de la actividad (en minutos)
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS duration_minutes integer;
