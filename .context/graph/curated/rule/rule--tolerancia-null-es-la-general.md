---
id: rule--tolerancia-null-es-la-general
tipo: RULE
nombre: La tolerancia con tipoEventoId NULL es la regla general por defecto
nivel: L2
resumen: Se busca la tolerancia ACTIVO del tipo de evento; si no existe, se aplica la fila ACTIVO con tipoEventoId NULL. Nunca se codifican minutos fijos en el backend.
severidad: ALTA
dominio: asistencia
archivos: [backend/src/shared/entities/tolerancia-asistencia.entity.ts, backend/src/modules/operaciones/tolerancias.service.ts]
terminos: [tolerancia, null, general, default, evento, minutos, entrada, salida, resolucion]
edges:
  - [affects, entity--tolerancia-asistencia]
  - [affects, table--operaciones-tolerancias-asistencia]
---

## El invariante

`operaciones.tolerancias_asistencia.tipo_evento_id` nullable, donde **NULL significa
"regla general"**, no "sin dato".

Resolucion, en este orden:

1. Fila con `estado = 'ACTIVO'` y `tipo_evento_id` = el tipo del evento → gana.
2. Si no hay, fila con `estado = 'ACTIVO'` y `tipo_evento_id IS NULL` → la general.
3. Si tampoco hay, el default de columna es `0` minutos: tolerancia cero, cualquier
   minuto de atraso cuenta como atraso.

## Lo que nunca se hace

Escribir `const TOLERANCIA = 15` en un servicio. El comentario de la entidad es
explicito: *"nunca codificadas rigidamente en el backend"*. Si aparece un numero de
minutos literal en el codigo de asistencia, es un bug.

## Al consultar, cuidado con el filtro

Un `WHERE tipo_evento_id = @id` **no** devuelve la fila general: en SQL, `NULL` no
iguala nada. Hay que consultar explicitamente ambas y elegir, o usar
`WHERE tipo_evento_id = @id OR tipo_evento_id IS NULL` y ordenar poniendo primero la
especifica.

## El mismo patron, con la polaridad opuesta

`requisitos_rol_guardia` tambien usa `NULL` como "no exijo nada por esta via", pero
alli **la ausencia total de filas es permisiva**: sin requisitos configurados, cualquiera
califica. Aca, la ausencia total es **restrictiva**: sin tolerancia configurada, cero
minutos.

Dos tablas parametrizables, dos defaults opuestos. Ver
[[rule--elegibilidad-de-rol-guardia]] y no asumir que se comportan igual.

## Campo relacionado sin uso definido

La entidad tiene `institucionId` nullable. No hay tabla de instituciones en el esquema:
es un gancho para multi-institucion que hoy no esta implementado.
