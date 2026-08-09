SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* =============================================================
   SIGBO-CBVC | Migracion 019 - Ajuste de Tipos de Bombero

   1) Agrega el tipo "BI - Bombero Incorporado" (faltaba en el
      catalogo original).
   2) Corrige el nombre de BVAF: "Bombero Voluntario Combatiente
      Fundador" -> "Bombero Voluntario Activo Fundador" (correccion
      de tipeo confirmada por el usuario).
   3) Fija el orden de prioridad institucional: BCF=1, BC=2, BI=3,
      BVAF=4, BVA=5, BH=6, BJ=7.
   4) Backfill de personal.bomberos.tipo_bombero_id: los 164 bomberos
      reales fueron cargados antes de que existiera este catalogo, por
      lo que casi ninguno tiene el FK seteado. El codigo bomberil
      (numero_bombero) ya sigue una convencion de prefijo consistente
      y verificada (BCF-/BC-/BI-/BVAF/BVA/BH/BJ), asi que se usa para
      completar el FK una sola vez. De aqui en adelante, toda
      clasificacion por tipo debe usar tipo_bombero_id, nunca el
      prefijo del codigo.
   ============================================================= */

/* --- 1) Agregar BI si no existe --- */
INSERT INTO personal.tipos_bombero (nombre, prefijo, orden)
SELECT N'Bombero Incorporado', N'BI', 3
WHERE NOT EXISTS (SELECT 1 FROM personal.tipos_bombero WHERE prefijo = N'BI');
GO

/* --- 2) Corregir nombre de BVAF --- */
UPDATE personal.tipos_bombero
SET nombre = N'Bombero Voluntario Activo Fundador'
WHERE prefijo = N'BVAF';
GO

/* --- 3) Orden de prioridad institucional --- */
UPDATE personal.tipos_bombero SET orden = 1 WHERE prefijo = N'BCF';
UPDATE personal.tipos_bombero SET orden = 2 WHERE prefijo = N'BC';
UPDATE personal.tipos_bombero SET orden = 3 WHERE prefijo = N'BI';
UPDATE personal.tipos_bombero SET orden = 4 WHERE prefijo = N'BVAF';
UPDATE personal.tipos_bombero SET orden = 5 WHERE prefijo = N'BVA';
UPDATE personal.tipos_bombero SET orden = 6 WHERE prefijo = N'BH';
UPDATE personal.tipos_bombero SET orden = 7 WHERE prefijo = N'BJ';
GO

/* --- 4) Backfill de tipo_bombero_id segun el prefijo real del codigo ---
   Orden de los UPDATE cuidado: BCF antes que BC (para que 'BC-%' no
   capture nada de BCF, aunque el guion ya los distingue), y BVAF antes
   que BVA (BVAF no lleva guion, por lo que 'BVA%' capturaria BVAF si se
   ejecutara primero). */
UPDATE b SET b.tipo_bombero_id = t.id
FROM personal.bomberos b
JOIN personal.tipos_bombero t ON t.prefijo = N'BCF'
WHERE b.tipo_bombero_id IS NULL AND b.numero_bombero LIKE N'BCF-%';
GO

UPDATE b SET b.tipo_bombero_id = t.id
FROM personal.bomberos b
JOIN personal.tipos_bombero t ON t.prefijo = N'BC'
WHERE b.tipo_bombero_id IS NULL AND b.numero_bombero LIKE N'BC-%';
GO

UPDATE b SET b.tipo_bombero_id = t.id
FROM personal.bomberos b
JOIN personal.tipos_bombero t ON t.prefijo = N'BI'
WHERE b.tipo_bombero_id IS NULL AND b.numero_bombero LIKE N'BI-%';
GO

UPDATE b SET b.tipo_bombero_id = t.id
FROM personal.bomberos b
JOIN personal.tipos_bombero t ON t.prefijo = N'BVAF'
WHERE b.tipo_bombero_id IS NULL AND b.numero_bombero LIKE N'BVAF%';
GO

UPDATE b SET b.tipo_bombero_id = t.id
FROM personal.bomberos b
JOIN personal.tipos_bombero t ON t.prefijo = N'BVA'
WHERE b.tipo_bombero_id IS NULL AND b.numero_bombero LIKE N'BVA%' AND b.numero_bombero NOT LIKE N'BVAF%';
GO

UPDATE b SET b.tipo_bombero_id = t.id
FROM personal.bomberos b
JOIN personal.tipos_bombero t ON t.prefijo = N'BH'
WHERE b.tipo_bombero_id IS NULL AND b.numero_bombero LIKE N'BH%';
GO

UPDATE b SET b.tipo_bombero_id = t.id
FROM personal.bomberos b
JOIN personal.tipos_bombero t ON t.prefijo = N'BJ'
WHERE b.tipo_bombero_id IS NULL AND b.numero_bombero LIKE N'BJ%';
GO
