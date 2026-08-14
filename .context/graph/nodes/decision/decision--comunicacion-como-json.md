---
id: decision--comunicacion-como-json
tipo: DECISION
nombre: La comunicacion de servicio se guarda como documento JSON validado
nivel: L2
dominio: servicios
estado: VIGENTE
resumen: En vez de decenas de columnas por tipo de formulario, comunicaciones_servicio guarda un unico campo datos NVARCHAR(MAX) con CHECK ISJSON.
archivos:
  - database/migrations/017_comunicaciones_servicio.sql
  - backend/src/shared/entities/comunicacion-servicio.entity.ts
edges:
  - [constrains, table--servicios-comunicaciones-servicio]
  - [affects, entity--comunicacion-servicio]
  - [belongs_to, domain--servicios]
terminos: [comunicacion, servicio, json, isjson, formulario, croquis, incendio, ocurrencias, documento, guarda, validado, vez, decenas, columnas, tipo, comunicaciones, unico, campo, datos, nvarchar, max, check]
---

# La comunicacion de servicio se guarda como documento JSON validado

En vez de decenas de columnas por tipo de formulario, comunicaciones_servicio guarda un unico campo datos NVARCHAR(MAX) con CHECK ISJSON.

## Decision

Un formulario de comunicacion es un documento, no un conjunto de columnas:

```sql
datos NVARCHAR(MAX) NOT NULL CONSTRAINT CK_comser_datos CHECK (ISJSON(datos) = 1)
tipo  NVARCHAR(30)  NOT NULL CHECK (tipo IN ('OTRAS_OCURRENCIAS', 'INCENDIO'))
```

## Motivo

Los dos tipos de comunicacion tienen campos muy distintos, y el formulario en
papel cambia con el tiempo. Modelarlo con columnas obligaria a una migracion por
cada campo nuevo y a decenas de columnas nulas por fila.

## Costo aceptado

- **No se puede consultar por dentro del formulario** con SQL indexado: SQL Server
  Express con `NVARCHAR(MAX)` no ofrece lo que `JSONB` daria. Responder "cuantos
  incendios tuvieron victimas" exige leer las filas y parsearlas en la aplicacion.
<<<<<<< Updated upstream
- La forma del JSON **no esta validada** por la BD mas alla de ser JSON valido. La
  columna `version` (INT, default 1) existe para poder migrar documentos con forma
  vieja.
=======
- La forma del JSON **no esta validada** por la BD mas alla de ser JSON sintacticamente
  valido. La columna `version` (INT, default 1) existe justamente para poder migrar
  documentos con forma vieja.
>>>>>>> Stashed changes
- El contrato real de la forma del documento vive en los DTOs de
  `backend/src/modules/servicios/dto/` y en la pantalla que lo edita. Son la unica
  fuente de verdad de que campos tiene un formulario.

## Por que el body parser acepta 8 MB

El croquis de la escena viaja como PNG en base64 **dentro** del JSON. El limite por
defecto de Express (100 KB) no alcanza para una escena real — ver
[[decision--body-parser-8mb]] y [[error--413-croquis-grande]].


## Archivos

- `database/migrations/017_comunicaciones_servicio.sql`
- `backend/src/shared/entities/comunicacion-servicio.entity.ts`

## Relaciones

- `constrains` → [[table--servicios-comunicaciones-servicio|servicios.comunicaciones_servicio]]
- `affects` → [[entity--comunicacion-servicio|ComunicacionServicio]]
- `belongs_to` → [[domain--servicios|Servicios]]

## Referenciado por

- [[workflow--comunicacion-de-servicio|Ciclo de vida de la comunicacion de servicio]] `contains` →

---
<sub>Nodo **curado** (editable a mano).</sub>
